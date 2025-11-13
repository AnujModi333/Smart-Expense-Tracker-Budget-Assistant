
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Expense, Category, Currency, CategoryBudgets, ExchangeRates, ChatMessage } from '../types';
import { CATEGORIES, CURRENCIES } from '../constants';
import { getExchangeRates } from '../services/currencyService';

const getInitialExpenses = (): Expense[] => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
};

const getInitialBudget = (): number => {
    const savedBudget = localStorage.getItem('budget');
    return savedBudget ? parseFloat(savedBudget) : 1000;
};

const getInitialCurrency = (): Currency => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency ? JSON.parse(savedCurrency) : CURRENCIES[0];
};

const getInitialCategoryBudgets = (): CategoryBudgets => {
    const saved = localStorage.getItem('categoryBudgets');
    return saved ? JSON.parse(saved) : {};
};

const getInitialExchangeRates = (): ExchangeRates | null => {
    const saved = localStorage.getItem('exchangeRates');
    return saved ? JSON.parse(saved) : null;
};

const initialBotMessage: ChatMessage = { sender: 'bot', text: 'Hello! I am your personal expense tracking assistant. How can I help you today? 🤖' };

const getInitialChatHistory = (): ChatMessage[] => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [initialBotMessage];
};

const LOCAL_STORAGE_KEYS = [
    'expenses',
    'budget',
    'currency',
    'categoryBudgets',
    'exchangeRates',
    'calculatorHistory',
    'theme',
    'chatHistory',
];


export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>(getInitialExpenses);
    const [budget, setBudget] = useState<number>(getInitialBudget);
    const [currency, setCurrency] = useState<Currency>(getInitialCurrency);
    const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgets>(getInitialCategoryBudgets);
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(getInitialExchangeRates);
    const [isRatesLoading, setIsRatesLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(getInitialChatHistory);

    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('budget', budget.toString());
    }, [budget]);

    useEffect(() => {
        localStorage.setItem('currency', JSON.stringify(currency));
    }, [currency]);
    
    useEffect(() => {
        localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
    }, [categoryBudgets]);

    useEffect(() => {
        if(exchangeRates) {
            localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
        }
    }, [exchangeRates]);
    
    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }, [chatHistory]);

    const updateRates = useCallback(async (baseCurrency: string = 'USD') => {
        setIsRatesLoading(true);
        try {
            const rates = await getExchangeRates(baseCurrency);
            if (rates) {
                setExchangeRates(rates);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not update exchange rates. Please try again later.";
            console.error("Failed to update exchange rates:", error);
            alert(message);
        } finally {
            setIsRatesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!exchangeRates) {
            updateRates();
        }
    }, [exchangeRates, updateRates]);

    const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
    
    const expensesByCategory = useMemo(() => {
        const result: { [key in Category]: number } = {
            Food: 0, Travel: 0, Bills: 0, Shopping: 0, Other: 0,
        };
        expenses.forEach(exp => {
            if (result[exp.category] !== undefined) {
                result[exp.category] += exp.amount;
            }
        });
        return result;
    }, [expenses]);
    
    const checkBudgets = useCallback((updatedExpenses: Expense[], oldExpenses: Expense[]) => {
        const newTotal = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const oldTotal = oldExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Only check for alerts if total expenses have increased
        if (newTotal <= oldTotal) return;

        // Overall budget check
        if (budget > 0) {
            if (newTotal > budget && oldTotal <= budget) {
                alert('Warning: You have exceeded your overall budget!');
            } else if (newTotal >= budget * 0.9 && oldTotal < budget * 0.9) {
                alert('Warning: You have used over 90% of your overall budget.');
            }
        }
        
        // Category budget check
        const oldExpensesByCategory: { [key in Category]?: number } = {};
        oldExpenses.forEach(exp => {
            oldExpensesByCategory[exp.category] = (oldExpensesByCategory[exp.category] || 0) + exp.amount;
        });

        const newExpensesByCategory: { [key in Category]?: number } = {};
        updatedExpenses.forEach(exp => {
            newExpensesByCategory[exp.category] = (newExpensesByCategory[exp.category] || 0) + exp.amount;
        });

        for (const cat of CATEGORIES) {
            const categoryBudget = categoryBudgets[cat];
            const oldCatTotal = oldExpensesByCategory[cat] || 0;
            const newCatTotal = newExpensesByCategory[cat] || 0;

            // Only check category if spending increased for it
            if (categoryBudget && categoryBudget > 0 && newCatTotal > oldCatTotal) {
                 if (newCatTotal > categoryBudget && oldCatTotal <= categoryBudget) {
                     alert(`Warning: You have exceeded your budget for the "${cat}" category!`);
                 } else if (newCatTotal >= categoryBudget * 0.9 && oldCatTotal < categoryBudget * 0.9) {
                     alert(`Warning: You are approaching your budget limit for the "${cat}" category.`);
                 }
            }
        }
    }, [budget, categoryBudgets]);

    const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
        const newExpense = { ...expense, id: new Date().toISOString() };
        setExpenses(prev => {
            const updatedExpenses = [newExpense, ...prev];
            checkBudgets(updatedExpenses, prev);
            return updatedExpenses;
        });
    }, [checkBudgets]);

    const editExpense = useCallback((updatedExpense: Expense) => {
        setExpenses(prev => {
           const updatedExpenses = prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp);
           checkBudgets(updatedExpenses, prev);
           return updatedExpenses;
        });
    }, [checkBudgets]);

    const deleteExpense = useCallback((id: string) => {
        setExpenses(prev => prev.filter(exp => exp.id !== id));
    }, []);

    const setCategoryBudget = (category: Category, amount: number) => {
        setCategoryBudgets(prev => ({
            ...prev,
            [category]: amount,
        }));
    };
    
    const clearChatHistory = useCallback(() => {
        setChatHistory([initialBotMessage]);
    }, []);

    const resetAllData = useCallback(() => {
        LOCAL_STORAGE_KEYS.forEach(key => {
            localStorage.removeItem(key);
        });
        window.location.reload();
    }, []);
    
    const exportDataAsCSV = useCallback(() => {
        if (expenses.length === 0) {
            alert("No expense data to export.");
            return;
        }

        const headers = ['ID', 'Date', 'Amount', 'Currency', 'Category', 'Notes'];
        const rows = expenses.map(exp => [
            exp.id,
            exp.date,
            exp.amount.toFixed(2),
            currency.code,
            exp.category,
            `"${exp.notes.replace(/"/g, '""')}"` // Handle quotes in notes
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.download = `expense-tracker-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [expenses, currency]);

    return {
        expenses,
        addExpense,
        editExpense,
        deleteExpense,
        budget,
        setBudget,
        currency,
        setCurrency,
        totalExpenses,
        categories: CATEGORIES,
        currencies: CURRENCIES,
        categoryBudgets,
        setCategoryBudget,
        expensesByCategory,
        exchangeRates,
        isRatesLoading,
        updateRates,
        resetAllData,
        chatHistory,
        setChatHistory,
        clearChatHistory,
        exportDataAsCSV,
    };
};