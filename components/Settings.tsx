
import React, { useState } from 'react';
import { Currency } from '../types';
import { Modal } from './Modal';
import { FileTextIcon } from './icons/Icons';

interface SettingsProps {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: Currency[];
  onResetAllData: () => void;
  onExportData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ currency, setCurrency, currencies, onResetAllData, onExportData }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = currencies.find(c => c.code === e.target.value);
    if (selectedCurrency) {
        setCurrency(selectedCurrency);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
          <div className="space-y-6">
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
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Management</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Export your expense data as a CSV file for your records or for use in other applications.
          </p>
          <div className="mt-4">
            <button
              onClick={onExportData}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 flex items-center gap-2"
            >
              <FileTextIcon /> Export Data to CSV
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Danger Zone</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            This action is irreversible. All your expense data, budgets, and settings will be permanently deleted.
          </p>
          <div className="mt-4">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
            >
              Reset Application
            </button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={onResetAllData}
        title="Confirm Application Reset"
        description="Are you sure you want to reset all application data? All your expenses, budgets, and settings will be permanently deleted. This action cannot be undone."
        confirmText="Confirm Reset"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      />
    </>
  );
};
