
import { GoogleGenAI, Type } from "@google/genai";
import { Category, OCRExtraction, ChatMessage } from "../types";
import { CATEGORIES } from "../constants";

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

// --- Safety Filter Logic ---

const safetyFilterSchema = {
    type: Type.OBJECT,
    properties: {
        isSafe: {
            type: Type.BOOLEAN,
            description: "True if the response is safe, false otherwise."
        },
        reason: {
            type: Type.STRING,
            description: "A brief reason if the response is not safe."
        }
    },
    required: ["isSafe", "reason"],
};

const validateResponse = async (userQuestion: string, botResponse: string): Promise<{ isSafe: boolean; reason: string }> => {
    if (!ai) return { isSafe: false, reason: "AI service not configured." };

    const validationPrompt = `
        You are a safety filter for a chatbot. The chatbot's only purpose is to answer questions about the "Gemini Expense Tracker" app.
        Analyze the user's question and the chatbot's proposed response.

        User Question: "${userQuestion}"
        Proposed Bot Response: "${botResponse}"

        You must determine if the response adheres to two strict rules:
        1. The response MUST be about the features or usage of the "Gemini Expense Tracker" app. It cannot be a general question answered by an AI.
        2. The response MUST NOT contain, request, or seem to be processing any personally identifiable information (PII) like names, emails, bank details, etc.

        If the response violates either rule, it is not safe.

        Respond with a JSON object matching the provided schema. If the response is safe, set isSafe to true. If it is not safe, set isSafe to false and provide a brief reason.
    `;

    try {
        // FIX: The `contents` parameter can be a simple string for text-only prompts.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for reasoning
            contents: validationPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: safetyFilterSchema,
            },
        });
        
        const rawText = response.text.trim();
        const jsonStringMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonStringMatch) {
            console.error("Malformed JSON response from safety filter:", rawText);
            return { isSafe: false, reason: "Validation response was not valid JSON." };
        }
        const validationResult = JSON.parse(jsonStringMatch[0]);
        return validationResult;
        
    } catch (error) {
        console.error("Error during response validation:", error);
        // Fail safe: if validation fails for any reason, block the response.
        return { isSafe: false, reason: "Validation process failed." };
    }
};

// --- Receipt OCR Logic ---

const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    amount: {
      type: Type.NUMBER,
      description: "The total amount of the transaction.",
    },
    date: {
      type: Type.STRING,
      description: "The date of the transaction in YYYY-MM-DD format.",
    },
    category: {
      type: Type.STRING,
      description: `A suggested category from this list: ${CATEGORIES.join(", ")}.`,
    },
  },
  required: ["amount", "date", "category"],
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(",")[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractExpenseDataFromReceipt = async (
  imageFile: File
): Promise<OCRExtraction | null> => {
  if (!ai) {
    throw new Error("API key for Gemini is not configured.");
  }

  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze the attached receipt image. Extract the total amount, the date of the transaction (in YYYY-MM-DD format), and suggest a category from the following list: ${CATEGORIES.join(", ")}. Respond ONLY with a valid JSON object matching the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // <-- UPGRADED MODEL
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: receiptSchema,
      },
    });

    const rawText = response.text.trim();
    // Extract the JSON part of the response, ignoring potential markdown fences
    const jsonStringMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonStringMatch) {
        console.error("Malformed JSON response from API:", rawText);
        throw new Error("No valid JSON object found in the API response.");
    }
    const jsonString = jsonStringMatch[0];
    const data = JSON.parse(jsonString);

    // Validate the extracted category
    if (!CATEGORIES.includes(data.category)) {
        data.category = 'Other';
    }

    return data as OCRExtraction;
  } catch (error) {
    console.error("Error extracting data from receipt:", error);
    return null;
  }
};

// --- Chatbot Logic ---

const APP_CONTEXT_SYSTEM_INSTRUCTION = `You are an expert AI assistant for the "Gemini Expense Tracker" web application. Your goal is to help users understand and use the app's features. Your tone should be encouraging and helpful. Use emojis where appropriate to make the conversation more engaging (e.g., 💰, 📊, 🤖), but maintain a professional and clear communication style.

Here is a detailed breakdown of the application:

1.  **Core Functionality**: It's an expense tracker that helps users manage their finances. It's a web application, and all data is stored locally in the user's browser (localStorage), not in the cloud. There is no user login or multi-device sync.

2.  **Dashboard**: This is the main screen. It shows:
    *   **Overall Progress**: A summary of total money spent, the user's monthly budget, and a progress bar.
    *   **Spending by Category**: An interactive pie chart showing how much was spent in each category (Food, Travel, Bills, Shopping, Other).
    *   **Budget Allocation**: A pie chart showing how the user has allocated their budget across different categories.
    *   **Spending Trend**: A bar chart visualizing daily spending over the last 7 or 30 days.
    *   **Recent Expenses**: A list of the most recent expense entries.
    *   A global currency selector is available on this screen.

3.  **Adding/Editing Expenses ('Add' page)**:
    *   Users can manually enter an expense's amount, date, category, and notes.
    *   **OCR Receipt Scanning**: Users can upload a photo of a receipt. The app uses the Gemini API to automatically extract the total amount, date, and a suggested category, pre-filling the form.

4.  **Budgeting ('Budget' page)**:
    *   Users can set an **Overall Monthly Budget**.
    *   They can also set **Category-Specific Budgets** (e.g., $300 for Food).
    *   The app shows progress bars for each category budget.
    *   The app triggers browser alerts when spending approaches (90%) or exceeds (100%) a budget, both overall and for specific categories.

5.  **Calculator ('Calculator' page)**: This is a multi-function tool with three modes:
    *   **Standard Calculator**: A mobile-style calculator for arithmetic, which also saves a history of calculations. It supports keyboard and numpad input.
    *   **Currency Converter**: Converts an amount from one currency to another using real-time exchange rates fetched from the Gemini API.
    *   **Currency Compare**: An AI-powered tool. The user selects two currencies, asks a question (e.g., "Which is stronger?"), and Gemini provides a detailed financial analysis.

6.  **AI Assistant ('AI Assistant' page)**: That's you! A chat interface where users can ask questions about the app. The chat history is saved until the user clears it.

7.  **Settings ('Settings' page)**: This page allows the user to select their preferred global currency for the entire app and reset all application data.

When a user asks a question, provide a clear, concise, and helpful answer based on this information. When a user asks about a complex feature, try to break it down into simple, numbered steps. Act as a knowledgeable and friendly guide for the application. Do not invent features that don't exist.`;


export const getChatbotResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  if (!ai) {
    throw new Error("API key for Gemini is not configured.");
  }
  
  const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
  }));
  
  const chat = ai.chats.create({
      model: 'gemini-2.5-pro', // <-- UPGRADED MODEL
      history: formattedHistory,
      config: {
          systemInstruction: APP_CONTEXT_SYSTEM_INSTRUCTION
      }
  });

  try {
      // FIX: The `sendMessage` method expects an object with a message property.
      const response = await chat.sendMessage({ message: newMessage });
      const initialResponseText = response.text.trim();
      
      // NEW: Validate the response with the safety filter
      const validation = await validateResponse(newMessage, initialResponseText);

      if (validation.isSafe) {
          return initialResponseText;
      } else {
          console.warn(`Chatbot response blocked. Reason: ${validation.reason}`);
          return "I'm sorry, I can only answer questions related to the Gemini Expense Tracker application. How can I help you with its features?";
      }

  } catch (error) {
      console.error("Error getting chatbot response:", error);
      return "I'm sorry, I encountered an error. Please try again.";
  }
};
