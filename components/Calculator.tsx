import React, { useState, useEffect, useCallback } from 'react';
import { useCalculatorHistory } from '../hooks/useCalculatorHistory';
import { TrashIcon } from './icons/Icons';
import { Currency, ExchangeRates } from '../types';
import { CurrencyConverter } from './CurrencyConverter';
import { CurrencyCompare } from './CurrencyCompare';


type Operator = '+' | '-' | '*' | '/';
type CalculatorMode = 'calculator' | 'converter' | 'compare';

interface CalculatorProps {
  currencies: Currency[];
  exchangeRates: ExchangeRates | null;
  isRatesLoading: boolean;
  updateRates: () => Promise<void>;
}

const CalculatorButton: React.FC<{
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, className = '', children }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center h-16 text-2xl font-semibold rounded-lg shadow-md transition-all duration-150 transform hover:scale-105 active:scale-100 ${className}`}
  >
    {children}
  </button>
);

const calculate = (op1: number, op2: number, op: Operator): number => {
    switch (op) {
      case '+': return op1 + op2;
      case '-': return op1 - op2;
      case '*': return op1 * op2;
      case '/': return op1 / op2;
      default: return op2;
    }
};

const formatNumber = (numStr: string) => {
    if (numStr.includes('e')) return numStr;
    const [integerPart, decimalPart] = numStr.split('.');
    if (!integerPart) return '0';
    try {
        const formattedIntegerPart = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 }).format(
            BigInt(integerPart)
        );
        return decimalPart !== undefined ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
    } catch (e) {
        return numStr; // Fallback for very large numbers that might fail BigInt conversion
    }
}

const StandardCalculator: React.FC = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [equation, setEquation] = useState('');
  const [previewResult, setPreviewResult] = useState('');

  const { history, addHistoryEntry, clearHistory } = useCalculatorHistory();
  
  const updatePreview = useCallback((currentDisplay: string) => {
      if (firstOperand !== null && operator) {
          const secondOperand = parseFloat(currentDisplay);
          if (!isNaN(secondOperand)) {
              const result = calculate(firstOperand, secondOperand, operator);
              const resultString = String(parseFloat(result.toPrecision(15)));
              setPreviewResult(`= ${formatNumber(resultString)}`);
          }
      }
  }, [firstOperand, operator]);

  const inputDigit = useCallback((digit: string) => {
    let newDisplayValue;
    if (waitingForSecondOperand) {
      newDisplayValue = digit;
      setWaitingForSecondOperand(false);
    } else {
      newDisplayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    setDisplayValue(newDisplayValue);
    updatePreview(newDisplayValue);
  }, [waitingForSecondOperand, displayValue, updatePreview]);

  const inputDecimal = useCallback(() => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      const newDisplayValue = displayValue + '.';
      setDisplayValue(newDisplayValue);
      updatePreview(newDisplayValue);
    }
  }, [waitingForSecondOperand, displayValue, updatePreview]);

  const performOperation = useCallback((nextOperator: Operator) => {
    const inputValue = parseFloat(displayValue);

    if (operator && firstOperand !== null && !waitingForSecondOperand) {
      const result = calculate(firstOperand, inputValue, operator);
      const resultString = String(parseFloat(result.toPrecision(15)));
      addHistoryEntry(`${formatNumber(String(firstOperand))} ${operator} ${formatNumber(String(inputValue))} = ${formatNumber(resultString)}`);
      setDisplayValue(resultString);
      setFirstOperand(result);
      setEquation(`${formatNumber(resultString)} ${nextOperator}`);
    } else {
      setFirstOperand(inputValue);
      setEquation(`${formatNumber(String(inputValue))} ${nextOperator}`);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    setPreviewResult('');
  }, [displayValue, operator, firstOperand, waitingForSecondOperand, addHistoryEntry]);
  
  const handleEquals = useCallback(() => {
    if (operator && firstOperand !== null) {
      const secondOperand = parseFloat(displayValue);
      const result = calculate(firstOperand, secondOperand, operator);
      const resultString = String(parseFloat(result.toPrecision(15)));

      addHistoryEntry(`${formatNumber(String(firstOperand))} ${operator} ${formatNumber(String(secondOperand))} = ${formatNumber(resultString)}`);
      setDisplayValue(resultString);
      setFirstOperand(null);
      setOperator(null);
      setWaitingForSecondOperand(false);
      setEquation('');
      setPreviewResult('');
    }
  }, [operator, firstOperand, displayValue, addHistoryEntry]);

  const clearAll = useCallback(() => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setEquation('');
    setPreviewResult('');
  }, []);
  
  const toggleSign = useCallback(() => {
    const newValue = String(parseFloat(displayValue) * -1);
    setDisplayValue(newValue);
    updatePreview(newValue);
  }, [displayValue, updatePreview]);
  
  const inputPercent = useCallback(() => {
     const newValue = String(parseFloat(displayValue) / 100);
     setDisplayValue(newValue);
     setWaitingForSecondOperand(true);
     setEquation('');
     setPreviewResult('');
  }, [displayValue]);

  const handleBackspace = useCallback(() => {
    if (waitingForSecondOperand) return;
    const newDisplayValue = displayValue.slice(0, -1) || '0';
    setDisplayValue(newDisplayValue);
    updatePreview(newDisplayValue);
  }, [waitingForSecondOperand, displayValue, updatePreview]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow default behavior for inputs/textareas
      if ((event.target as HTMLElement).tagName.match(/INPUT|TEXTAREA/)) {
        return;
      }
      event.preventDefault();
      const { key } = event;

      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === 'Enter' || key === '=') {
        handleEquals();
      } else if (['+', '-', '*', '/'].includes(key)) {
        performOperation(key as Operator);
      } else if (key === 'Escape') {
        clearAll();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === '%') {
        inputPercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputDigit, inputDecimal, handleEquals, performOperation, clearAll, handleBackspace, inputPercent]);
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
       <div className="w-full md:w-1/2 lg:w-2/5 mx-auto bg-gray-800 p-4 rounded-lg shadow-2xl">
        <div className="bg-gray-900 text-white text-right p-4 rounded-md mb-4 shadow-inner h-40 flex flex-col justify-end">
          <div className="text-2xl text-gray-400 h-8 truncate" title={equation}>{equation}</div>
          <p className="text-6xl font-light break-words" title={displayValue}>{formatNumber(displayValue)}</p>
          <div className="text-3xl text-gray-500 h-10 truncate" title={previewResult}>{previewResult}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <CalculatorButton onClick={clearAll} className="bg-gray-600 hover:bg-gray-700 text-white col-span-1">AC</CalculatorButton>
          <CalculatorButton onClick={toggleSign} className="bg-gray-600 hover:bg-gray-700 text-white">+/-</CalculatorButton>
          <CalculatorButton onClick={inputPercent} className="bg-gray-600 hover:bg-gray-700 text-white">%</CalculatorButton>
          <CalculatorButton onClick={() => performOperation('/')} className={`text-white ${operator === '/' && waitingForSecondOperand ? 'bg-orange-600 ring-2 ring-white' : 'bg-orange-500 hover:bg-orange-600'}`}>÷</CalculatorButton>
          
          <CalculatorButton onClick={() => inputDigit('7')} className="bg-gray-700 hover:bg-gray-600 text-white">7</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit('8')} className="bg-gray-700 hover:bg-gray-600 text-white">8</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit('9')} className="bg-gray-700 hover:bg-gray-600 text-white">9</CalculatorButton>
          <CalculatorButton onClick={() => performOperation('*')} className={`text-white ${operator === '*' && waitingForSecondOperand ? 'bg-orange-600 ring-2 ring-white' : 'bg-orange-500 hover:bg-orange-600'}`}>×</CalculatorButton>

          <CalculatorButton onClick={() => inputDigit('4')} className="bg-gray-700 hover:bg-gray-600 text-white">4</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit('5')} className="bg-gray-700 hover:bg-gray-600 text-white">5</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit('6')} className="bg-gray-700 hover:bg-gray-600 text-white">6</CalculatorButton>
          <CalculatorButton onClick={() => performOperation('-')} className={`text-white ${operator === '-' && waitingForSecondOperand ? 'bg-orange-600 ring-2 ring-white' : 'bg-orange-500 hover:bg-orange-600'}`}>−</CalculatorButton>
          
          <CalculatorButton onClick={() => inputDigit('1')} className="bg-gray-700 hover:bg-gray-600 text-white">1</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit('2')} className="bg-gray-700 hover:bg-gray-600 text-white">2</CalculatorButton>
          <CalculatorButton onClick={() => inputDigit('3')} className="bg-gray-700 hover:bg-gray-600 text-white">3</CalculatorButton>
          <CalculatorButton onClick={() => performOperation('+')} className={`text-white ${operator === '+' && waitingForSecondOperand ? 'bg-orange-600 ring-2 ring-white' : 'bg-orange-500 hover:bg-orange-600'}`}>+</CalculatorButton>

          <CalculatorButton onClick={() => inputDigit('0')} className="bg-gray-700 hover:bg-gray-600 text-white col-span-2">0</CalculatorButton>
          <CalculatorButton onClick={inputDecimal} className="bg-gray-700 hover:bg-gray-600 text-white">.</CalculatorButton>
          <CalculatorButton onClick={handleEquals} className="bg-orange-500 hover:bg-orange-600 text-white">=</CalculatorButton>
        </div>
      </div>
       <div className="w-full md:w-1/2 lg:w-3/5 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">History</h2>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1">
              <TrashIcon /> Clear
            </button>
          )}
        </div>
        {history.length > 0 ? (
          <ul className="space-y-2 h-96 overflow-y-auto pr-2">
            {history.map((item, index) => (
              <li key={index} className="text-right p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
            No calculations yet.
          </div>
        )}
      </div>
    </div>
  );
}

export const Calculator: React.FC<CalculatorProps> = ({ currencies, exchangeRates, isRatesLoading, updateRates }) => {
  const [mode, setMode] = useState<CalculatorMode>('calculator');

  const renderContent = () => {
    switch(mode) {
      case 'converter':
        return <CurrencyConverter currencies={currencies} exchangeRates={exchangeRates} isRatesLoading={isRatesLoading} updateRates={updateRates} />;
      case 'compare':
        return <CurrencyCompare currencies={currencies} />;
      case 'calculator':
      default:
        return <StandardCalculator />;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button onClick={() => setMode('calculator')} className={`px-4 py-2 text-sm font-semibold rounded-md flex-1 ${mode === 'calculator' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Calculator</button>
        <button onClick={() => setMode('converter')} className={`px-4 py-2 text-sm font-semibold rounded-md flex-1 ${mode === 'converter' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Converter</button>
        <button onClick={() => setMode('compare')} className={`px-4 py-2 text-sm font-semibold rounded-md flex-1 ${mode === 'compare' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow' : 'text-gray-600 dark:text-gray-300'}`}>Compare</button>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};