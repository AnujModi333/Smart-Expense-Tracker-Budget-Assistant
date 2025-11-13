
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Expense, Category, Currency, CategoryBudgets } from '../types';
import { ExpenseList } from './ExpenseList';

interface DashboardProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  budget: number;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  currencies: Currency[];
  categories: Category[];
  categoryBudgets: CategoryBudgets;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
const COLORS_BUDGET = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];


const formatDate = (date: Date) => date.toLocaleString('en-US', { month: 'short', day: 'numeric' });

export const Dashboard: React.FC<DashboardProps> = ({ expenses, onEdit, onDelete, budget, currency, setCurrency, currencies, categories, categoryBudgets }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');

  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  
  const budgetProgress = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = currencies.find(c => c.code === e.target.value);
    if (selectedCurrency) {
        setCurrency(selectedCurrency);
    }
  };

  const dataByCategory = useMemo(() => {
    const categoryMap: { [key in Category]: number } = {
      Food: 0, Travel: 0, Bills: 0, Shopping: 0, Other: 0,
    };
    expenses.forEach(expense => {
      if (categoryMap[expense.category] !== undefined) {
        categoryMap[expense.category] += expense.amount;
      }
    });
    return categories
      .map(cat => ({ name: cat, value: categoryMap[cat] }))
      .filter(item => item.value > 0);
  }, [expenses, categories]);

  const budgetAllocationData = useMemo(() => {
      return categories
          .map(cat => ({ name: cat, value: categoryBudgets[cat] || 0}))
          .filter(item => item.value > 0);
  }, [categoryBudgets, categories]);
  
  const spendingTrendData = useMemo(() => {
    const days = timeframe === '7d' ? 7 : 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    const dailyExpenses: { [key: string]: number } = {};
    const dateArray = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        dailyExpenses[formattedDate] = 0;
        dateArray.push(date);
    }
    
    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= startDate && expenseDate <= endDate) {
            const formattedDate = expense.date;
            if (dailyExpenses[formattedDate] !== undefined) {
                dailyExpenses[formattedDate] += expense.amount;
            }
        }
    });

    return dateArray.map(date => {
        const formattedDate = date.toISOString().split('T')[0];
        return {
            date: formatDate(date),
            amount: dailyExpenses[formattedDate]
        }
    });
    
  }, [expenses, timeframe]);

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative">
          <div className="absolute top-4 right-4">
             <select
                id="currency-selector"
                name="currency-selector"
                className="block w-full pl-3 pr-8 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={currency.code}
                onChange={handleCurrencyChange}
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Overall Progress</h2>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">{currency.symbol}{totalExpenses.toFixed(2)} <span className="text-xl font-normal text-gray-500 dark:text-gray-400">spent</span></p>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Budget: {currency.symbol}{budget.toFixed(2)}</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
              <div
                className={`${budgetProgress > 100 ? 'bg-red-500' : 'bg-indigo-600'} h-2.5 rounded-full`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">{budgetProgress.toFixed(0)}% used</p>
          </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
           <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Spending by Category</h2>
           {dataByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dataByCategory} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" isAnimationActive={true}>
                  {dataByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value: number) => `${currency.symbol}${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
           ) : ( <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">No expenses to display</div> )}
        </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
           <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget Allocation</h2>
           {budgetAllocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={budgetAllocationData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" isAnimationActive={true}>
                  {budgetAllocationData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS_BUDGET[index % COLORS_BUDGET.length]} />))}
                </Pie>
                <Tooltip formatter={(value: number) => `${currency.symbol}${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
           ) : ( <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">No category budgets set</div> )}
        </div>
      </div>
       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Spending Trend</h2>
          <div className="flex space-x-2">
            <button onClick={() => setTimeframe('7d')} className={`px-3 py-1 text-sm rounded-md ${timeframe === '7d' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Last 7 Days</button>
            <button onClick={() => setTimeframe('30d')} className={`px-3 py-1 text-sm rounded-md ${timeframe === '30d' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Last 30 Days</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={spendingTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(value) => `${currency.symbol}${value}`} />
            <Tooltip
              formatter={(value: number) => [`${currency.symbol}${value.toFixed(2)}`, 'Amount']}
              labelStyle={{ color: '#333' }}
              itemStyle={{ fontWeight: 'bold' }}
              cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
            />
            <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Recent Expenses</h2>
        <ExpenseList expenses={expenses} onEdit={onEdit} onDelete={onDelete} currency={currency} />
      </div>
    </div>
  );
};
