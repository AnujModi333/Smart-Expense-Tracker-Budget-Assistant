
import React, { useState, useMemo } from 'react';
import { useExpenses } from './hooks/useExpenses';
import { useTheme } from './hooks/useTheme';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { Header } from './components/Header';
import { AdBanner } from './components/AdBanner';
import { Settings } from './components/Settings';
import { Calculator } from './components/Calculator';
import { Budget } from './components/Budget';
import { Chatbot } from './components/Chatbot';
import { Expense, View } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  const expenseData = useExpenses();

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setView('add');
  };

  const handleSaveExpense = async (expense: Expense) => {
    setIsSaving(true);
    // Simulate async operation like saving to a server
    await new Promise(res => setTimeout(res, 500));
    
    if (editingExpense) {
      expenseData.editExpense(expense);
    } else {
      expenseData.addExpense(expense);
    }
    
    setIsSaving(false);
    setEditingExpense(null);
    setView('dashboard');
  };

  const handleCancel = () => {
    setEditingExpense(null);
    setView('dashboard');
  };

  const renderContent = () => {
    switch (view) {
      case 'add':
        return <ExpenseForm 
                  onSave={handleSaveExpense} 
                  onCancel={handleCancel} 
                  existingExpense={editingExpense} 
                  categories={expenseData.categories}
                  currency={expenseData.currency}
                  isSaving={isSaving}
                />;
      case 'chat':
        return <Chatbot 
                  messages={expenseData.chatHistory}
                  setMessages={expenseData.setChatHistory}
                  onClearChat={expenseData.clearChatHistory}
                />;
      case 'calculator':
        return <Calculator 
                  currencies={expenseData.currencies}
                  exchangeRates={expenseData.exchangeRates}
                  isRatesLoading={expenseData.isRatesLoading}
                  updateRates={expenseData.updateRates}
                />;
      case 'budget':
        return <Budget 
                  budget={expenseData.budget}
                  setBudget={expenseData.setBudget}
                  categoryBudgets={expenseData.categoryBudgets}
                  setCategoryBudget={expenseData.setCategoryBudget}
                  expensesByCategory={expenseData.expensesByCategory}
                  categories={expenseData.categories}
                  currency={expenseData.currency}
                />;
      case 'settings':
        return <Settings
                  currency={expenseData.currency}
                  setCurrency={expenseData.setCurrency}
                  currencies={expenseData.currencies}
                  onResetAllData={expenseData.resetAllData}
                  onExportData={expenseData.exportDataAsCSV}
                />;
      case 'dashboard':
      default:
        return <Dashboard 
                  expenses={expenseData.expenses} 
                  onEdit={handleEdit} 
                  onDelete={expenseData.deleteExpense} 
                  budget={expenseData.budget}
                  currency={expenseData.currency}
                  setCurrency={expenseData.setCurrency}
                  currencies={expenseData.currencies}
                  categories={expenseData.categories}
                  categoryBudgets={expenseData.categoryBudgets}
                />;
    }
  };
  
  const MemoizedHeader = useMemo(() => <Header currentView={view} setView={setView} theme={theme} setTheme={setTheme} />, [view, theme, setTheme]);

  return (
    <div className="flex flex-col h-screen font-sans">
      <div className="bg-white dark:bg-gray-800 shadow-md">
        {MemoizedHeader}
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
      <AdBanner />
    </div>
  );
};

export default App;
