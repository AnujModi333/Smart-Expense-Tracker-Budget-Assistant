import React, { useState, useEffect, useMemo } from 'react';
import { Currency, ExchangeRates } from '../types';

interface CurrencyConverterProps {
    currencies: Currency[];
    exchangeRates: ExchangeRates | null;
    isRatesLoading: boolean;
    updateRates: () => Promise<void>;
}

const SkeletonLoader: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto mb-6"></div>
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700/50 rounded-lg"></div>
            <div className="text-center pt-4">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-28 mx-auto"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto mt-2"></div>
            </div>
        </div>
    </div>
);

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ currencies, exchangeRates, isRatesLoading, updateRates }) => {
    const [amount, setAmount] = useState('1');
    const [fromCurrency, setFromCurrency] = useState(currencies[0].code);
    const [toCurrency, setToCurrency] = useState(currencies.length > 1 ? currencies[1].code : currencies[0].code);
    const [result, setResult] = useState<number | null>(null);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    useEffect(() => {
        if (!exchangeRates || !exchangeRates.rates) {
            setResult(null);
            return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || !fromCurrency || !toCurrency) {
            setResult(null);
            return;
        }

        const rateFrom = exchangeRates.rates[fromCurrency];
        const rateTo = exchangeRates.rates[toCurrency];

        if (rateFrom && rateTo) {
            const conversion = (numericAmount / rateFrom) * rateTo;
            setResult(conversion);
        } else {
            setResult(null);
        }
    }, [amount, fromCurrency, toCurrency, exchangeRates]);
    
    const lastUpdatedDate = useMemo(() => {
        if (!exchangeRates?.lastUpdated) return null;
        return new Date(exchangeRates.lastUpdated).toLocaleString();
    }, [exchangeRates]);
    
    if (isRatesLoading && !exchangeRates) {
        return <SkeletonLoader />;
    }

    if (!exchangeRates) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto text-center">
                <h2 className="text-xl font-bold text-red-500 mb-4">Failed to Load Exchange Rates</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">We couldn't fetch the latest currency data. Please check your API key, connection, and try again.</p>
                <button 
                    onClick={updateRates} 
                    disabled={isRatesLoading} 
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {isRatesLoading ? 'Retrying...' : 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Currency Converter</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                            placeholder="1.00"
                        />
                    </div>
                    <div>
                        <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                        <select
                            id="fromCurrency"
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                            {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                        <select
                            id="toCurrency"
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                            {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-center">
                    <button onClick={handleSwap} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600 dark:text-gray-300"><path d="M8 3L4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
                    </button>
                </div>
                {result !== null && (
                    <div className="text-center bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg">
                        <p className="text-lg text-gray-600 dark:text-gray-300">{amount} {fromCurrency} =</p>
                        <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurrency}</p>
                    </div>
                )}
                 <div className="text-center pt-4">
                    <button onClick={updateRates} disabled={isRatesLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                        {isRatesLoading ? 'Updating...' : 'Update Rates'}
                    </button>
                    {lastUpdatedDate && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Rates last updated: {lastUpdatedDate}</p>}
                </div>
            </div>
        </div>
    );
};