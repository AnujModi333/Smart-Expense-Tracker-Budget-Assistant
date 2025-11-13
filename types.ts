export type Category = 'Food' | 'Travel' | 'Bills' | 'Shopping' | 'Other';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: Category;
  notes: string;
  receiptImage?: string; // base64 encoded image
}

export type View = 'dashboard' | 'add' | 'settings' | 'calculator' | 'budget' | 'chat';

export type CategoryBudgets = {
  [key in Category]?: number;
};

export interface OCRExtraction {
  amount: number;
  date: string;
  category: Category;
}

export interface ExchangeRates {
    base: string;
    rates: { [key: string]: number };
    lastUpdated: string;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export type Theme = 'light' | 'dark';