import React, { useState } from 'react';
import { Currency } from '../types';
import { compareCurrencies } from '../services/currencyService';
import { SpinnerIcon } from './icons/Icons';

interface CurrencyCompareProps {
    currencies: Currency[];
}

export const CurrencyCompare: React.FC<CurrencyCompareProps> = ({ currencies }) => {
    const [currency1, setCurrency1] = useState(currencies[0].code);
    const [currency2, setCurrency2] = useState(currencies.length > 1 ? currencies[1].code : currencies[0].code);
    const [question, setQuestion] = useState('Which is stronger and why?');
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currency1 === currency2) {
            setError('Please select two different currencies to compare.');
            return;
        }
        setError('');
        setIsLoading(true);
        setResult(null);

        try {
            const response = await compareCurrencies(currency1, currency2, question);
            setResult(response);
        } catch (err) {
            console.error("Comparison failed:", err);
            setError("Sorry, an error occurred while getting the comparison.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Currency Comparison</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="currency1" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency 1</label>
                        <select
                            id="currency1"
                            value={currency1}
                            onChange={(e) => setCurrency1(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                            {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="currency2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency 2</label>
                        <select
                            id="currency2"
                            value={currency2}
                            onChange={(e) => setCurrency2(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                            {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                     <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Question</label>
                     <textarea
                        id="question"
                        rows={2}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                     />
                </div>
                 {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="text-center">
                     <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]">
                        {isLoading ? (
                            <>
                                <SpinnerIcon />
                                <span className="ml-2">Analyzing...</span>
                            </>
                        ) : (
                            'Get Comparison'
                        )}
                    </button>
                </div>
            </form>

            {result && !isLoading && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Analysis Result:</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{result}</p>
                </div>
            )}
        </div>
    );
};