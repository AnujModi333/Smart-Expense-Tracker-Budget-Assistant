import React from 'react';
import { Expense, Currency } from '../types';
import { EditIcon, TrashIcon } from './icons/Icons';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  currency: Currency;
}

const categoryColors: { [key: string]: string } = {
  Food: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Travel: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Bills: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  Shopping: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const ExpenseItem: React.FC<ExpenseItemProps> = React.memo(({ expense, onEdit, onDelete, currency }) => {
  return (
    <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryColors[expense.category]}`}>
          {expense.category}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.notes || 'No notes'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{expense.date}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{currency.symbol}{expense.amount.toFixed(2)}</p>
        <div className="flex items-center space-x-2">
          <button onClick={() => onEdit(expense)} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
            <EditIcon />
          </button>
          <button onClick={() => onDelete(expense.id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  );
});