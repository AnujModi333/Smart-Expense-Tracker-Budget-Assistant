
import React from 'react';
import { Currency } from '../types';

interface BudgetManagerProps {
  budget: number;
  setBudget: (budget: number) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: Currency[];
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({ budget, setBudget, currency, setCurrency, currencies }) => {
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBudget(isNaN(value) ? 0 : value);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = currencies.find(c => c.code === e.target.value);
    if (selectedCurrency) {
        setCurrency(selectedCurrency);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Set Monthly Budget
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{currency.symbol}</span>
            </div>
            <input
              type="number"
              name="budget"
              id="budget"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              value={budget}
              onChange={handleBudgetChange}
              step="10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{currency.code}</span>
            </div>
          </div>
        </div>
        <div>
           <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preferred Currency
          </label>
          <select
            id="currency"
            name="currency"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={currency.code}
            onChange={handleCurrencyChange}
          >
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
