import { useState, useEffect, useCallback } from 'react';

const getInitialHistory = (): string[] => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
};

export const useCalculatorHistory = () => {
    const [history, setHistory] = useState<string[]>(getInitialHistory);

    useEffect(() => {
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
    }, [history]);

    const addHistoryEntry = useCallback((entry: string) => {
        setHistory(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return {
        history,
        addHistoryEntry,
        clearHistory,
    };
};