import React from 'react';
import { Currency, Category, CategoryBudgets } from '../types';

interface BudgetProps {
  budget: number;
  setBudget: (budget: number) => void;
  categoryBudgets: CategoryBudgets;
  setCategoryBudget: (category: Category, amount: number) => void;
  expensesByCategory: { [key in Category]: number };
  categories: Category[];
  currency: Currency;
}

const CategoryBudgetRow: React.FC<{
    category: Category;
    budget: number;
    spent: number;
    onBudgetChange: (amount: number) => void;
    currency: Currency;
}> = ({ category, budget, spent, onBudgetChange, currency }) => {
    const progress = budget > 0 ? (spent / budget) * 100 : 0;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label htmlFor={`budget-${category}`} className="font-medium text-gray-700 dark:text-gray-300">{category}</label>
                <div className="relative w-32">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">{currency.symbol}</span>
                    <input
                        type="number"
                        id={`budget-${category}`}
                        value={budget || ''}
                        onChange={(e) => onBudgetChange(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-2 py-1 text-right border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="0.00"
                        step="10"
                    />
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                    className={`${progress > 100 ? 'bg-red-500' : 'bg-indigo-600'} h-2.5 rounded-full`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
            </div>
            <p className="text-right text-sm text-gray-500 dark:text-gray-400">
                {currency.symbol}{spent.toFixed(2)} / {currency.symbol}{budget.toFixed(2)}
            </p>
        </div>
    );
};


export const Budget: React.FC<BudgetProps> = ({ budget, setBudget, categoryBudgets, setCategoryBudget, expensesByCategory, categories, currency }) => {
    
    const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setBudget(isNaN(value) ? 0 : value);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overall Monthly Budget</h2>
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{currency.symbol}</span>
                    </div>
                    <input
                        type="number"
                        name="budget"
                        id="budget"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-lg border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="0.00"
                        value={budget}
                        onChange={handleBudgetChange}
                        step="50"
                    />
                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{currency.code}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Budgets by Category</h2>
                <div className="space-y-6">
                    {categories.map(cat => (
                        <CategoryBudgetRow 
                            key={cat}
                            category={cat}
                            budget={categoryBudgets[cat] || 0}
                            spent={expensesByCategory[cat] || 0}
                            onBudgetChange={(amount) => setCategoryBudget(cat, amount)}
                            currency={currency}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
