import React from 'react';
import { View, Theme } from '../types';
import { HomeIcon, PlusIcon, SettingsIcon, CalculatorIcon, BudgetIcon, RobotIcon, SunIcon, MoonIcon } from './icons/Icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const NavButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  label: string;
}> = ({ onClick, isActive, children, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
    }`}
  >
    {children}
    <span className="mt-1 sm:mt-0">{label}</span>
  </button>
);

const ThemeToggle: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void }> = ({ theme, setTheme }) => (
    <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ currentView, setView, theme, setTheme }) => {
  return (
    <header className="px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <nav className="flex space-x-1 sm:space-x-2">
            <NavButton onClick={() => setView('dashboard')} isActive={currentView === 'dashboard'} label="Dashboard">
              <HomeIcon />
            </NavButton>
            <NavButton onClick={() => setView('add')} isActive={currentView === 'add'} label="Add">
              <PlusIcon />
            </NavButton>
            <NavButton onClick={() => setView('budget')} isActive={currentView === 'budget'} label="Budget">
              <BudgetIcon />
            </NavButton>
            <NavButton onClick={() => setView('calculator')} isActive={currentView === 'calculator'} label="Calculator">
              <CalculatorIcon />
            </NavButton>
            <NavButton onClick={() => setView('chat')} isActive={currentView === 'chat'} label="AI Assistant">
              <RobotIcon />
            </NavButton>
            <NavButton onClick={() => setView('settings')} isActive={currentView === 'settings'} label="Settings">
              <SettingsIcon />
            </NavButton>
          </nav>
          <div className="hidden sm:block border-l border-gray-200 dark:border-gray-700 h-8 mx-2"></div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
};