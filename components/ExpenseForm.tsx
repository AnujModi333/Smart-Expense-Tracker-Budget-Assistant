
import React, { useState, useEffect, useRef } from 'react';
import { Expense, Category, Currency, OCRExtraction } from '../types';
import { extractExpenseDataFromReceipt } from '../services/geminiService';
import { SpinnerIcon } from './icons/Icons';

interface ExpenseFormProps {
  onSave: (expense: Expense) => Promise<void>;
  onCancel: () => void;
  existingExpense: Expense | null;
  categories: Category[];
  currency: Currency;
  isSaving: boolean;
}

const initialFormState = {
  amount: '',
  date: new Date().toISOString().split('T')[0],
  category: 'Food' as Category,
  notes: '',
  receiptImage: undefined,
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, onCancel, existingExpense, categories, currency, isSaving }) => {
  const [formState, setFormState] = useState(initialFormState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingExpense) {
      setFormState({
        amount: existingExpense.amount.toString(),
        date: existingExpense.date,
        category: existingExpense.category,
        notes: existingExpense.notes,
        receiptImage: existingExpense.receiptImage,
      });
    } else {
      setFormState(initialFormState);
    }
  }, [existingExpense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setError('');
      try {
        const extractedData = await extractExpenseDataFromReceipt(file);
        if (extractedData) {
          setFormState(prev => ({
            ...prev,
            amount: extractedData.amount.toString(),
            date: extractedData.date || prev.date,
            category: extractedData.category || prev.category,
            notes: `Scanned from receipt on ${new Date().toLocaleDateString()}`
          }));
        } else {
          setError('Could not extract data from the receipt. Please enter manually.');
        }
      } catch (err) {
        setError('An error occurred during receipt processing. Please try again.');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.amount || parseFloat(formState.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');

    onSave({
      id: existingExpense?.id || '',
      amount: parseFloat(formState.amount),
      date: formState.date,
      category: formState.category,
      notes: formState.notes,
      receiptImage: formState.receiptImage,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{existingExpense ? 'Edit' : 'Add'} Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scan Receipt (Optional)</label>
          <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} ref={fileInputRef} disabled={isProcessing || isSaving} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {isProcessing && <p className="text-indigo-500 text-sm mt-2 animate-pulse">Analyzing receipt...</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ({currency.symbol})</label>
          <input type="number" name="amount" id="amount" value={formState.amount} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" placeholder="0.00" step="0.01" required disabled={isSaving}/>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input type="date" name="date" id="date" value={formState.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" required disabled={isSaving}/>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select id="category" name="category" value={formState.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" disabled={isSaving}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
          <textarea id="notes" name="notes" rows={3} value={formState.notes} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" disabled={isSaving}/>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 border border-transparent rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500" disabled={isSaving}>
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]" disabled={isSaving}>
            {isSaving ? <SpinnerIcon /> : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};
