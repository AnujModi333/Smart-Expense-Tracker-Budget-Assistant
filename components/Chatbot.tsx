
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { RobotIcon, RefreshIcon } from './icons/Icons';
import { Modal } from './Modal';

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></span>
    </div>
);

interface ChatbotProps {
    messages: ChatMessage[];
    setMessages: (messages: ChatMessage[]) => void;
    onClearChat: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ messages, setMessages, onClearChat }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        const userMessage: ChatMessage = { sender: 'user', text: trimmedInput };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getChatbotResponse(newMessages, trimmedInput);
            const botMessage: ChatMessage = { sender: 'bot', text: response };
            setMessages([...newMessages, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { sender: 'bot', text: 'Sorry, something went wrong. Please check your API key and try again.' };
            setMessages([...newMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-150px)] max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        AI Assistant
                    </h2>
                    <button 
                        onClick={() => setIsClearModalOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                        title="Clear chat history"
                    >
                        <RefreshIcon />
                        Clear Chat
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'bot' && (
                               <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                   <RobotIcon className="h-5 w-5 text-white" />
                               </div>
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                                msg.sender === 'user' 
                                ? 'bg-indigo-500 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                 <RobotIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your expenses..."
                            className="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
            <Modal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={() => {
                    onClearChat();
                    setIsClearModalOpen(false);
                }}
                title="Confirm Clear Chat"
                description="Are you sure you want to clear the entire chat history? This action cannot be undone."
                confirmText="Clear"
                confirmButtonClass="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
            />
        </>
    );
};
