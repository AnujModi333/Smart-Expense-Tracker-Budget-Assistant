
import React, { useState } from 'react';
import { Expense, Currency } from '../types';
import { ExpenseItem } from './ExpenseItem';
import { Modal } from './Modal';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  currency: Currency;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete, currency }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const openConfirmationModal = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setExpenseToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      onDelete(expenseToDelete.id);
      closeConfirmationModal();
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-gray-500 dark:text-gray-400">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {expenses.map(expense => (
            <ExpenseItem key={expense.id} expense={expense} onEdit={onEdit} onDelete={() => openConfirmationModal(expense)} currency={currency} />
          ))}
        </ul>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        description={`Are you sure you want to delete this expense of ${currency.symbol}${expenseToDelete?.amount.toFixed(2)}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
      />
    </>
  );
};
