import { GoogleGenAI, Type } from "@google/genai";
import { ExchangeRates } from "../types";
import { CURRENCIES } from "../constants";

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API key not found. Currency features will be disabled.");
}

const model = 'gemini-2.5-flash';

const currencyCodes = CURRENCIES.map(c => c.code);

export const getExchangeRates = async (baseCurrency: string): Promise<ExchangeRates | null> => {
    if (!ai) throw new Error("API key for Gemini is not configured.");
    
    try {
        const prompt = `Get the latest real-time exchange rates for the base currency "${baseCurrency}" against all of these currencies: ${currencyCodes.join(", ")}. Respond ONLY with a valid JSON object in the following format: { "base": "${baseCurrency}", "rates": { "USD": 1.0, "EUR": 0.92, "JPY": 157.5, ... } }`;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
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

        return {
            ...data,
            lastUpdated: new Date().toISOString(),
        } as ExchangeRates;

    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        return null;
    }
};

export const compareCurrencies = async (currency1: string, currency2: string, question: string): Promise<string | null> => {
    if (!ai) throw new Error("API key for Gemini is not configured.");

    try {
        const prompt = `As a financial analyst, compare the currencies ${currency1} and ${currency2}. The user has a specific question: "${question}". Provide a concise but insightful answer covering current strength, recent trends, and key influencing factors. Format the response as clear, readable text.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error comparing currencies:", error);
        return "Sorry, I was unable to retrieve a comparison at this time.";
    }
};