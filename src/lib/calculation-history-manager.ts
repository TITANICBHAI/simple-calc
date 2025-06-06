/**
 * Calculation History Manager
 * 
 * Provides a centralized system for storing and retrieving calculation history
 * across all calculator components.
 */

export interface HistoryEntry {
  id: string;
  timestamp: number;
  component: string;
  expression: string;
  result: string | number;
  metadata?: {
    ast?: any;
    steps?: any[];
    visualization?: boolean;
    category?: string;
    [key: string]: any;
  };
}

export class CalculationHistoryManager {
  private static instance: CalculationHistoryManager;
  private history: HistoryEntry[] = [];
  private maxEntries: number = 100;
  private listeners: ((history: HistoryEntry[]) => void)[] = [];
  
  private constructor() {
    this.loadFromStorage();
  }
  
  public static getInstance(): CalculationHistoryManager {
    if (!CalculationHistoryManager.instance) {
      CalculationHistoryManager.instance = new CalculationHistoryManager();
    }
    return CalculationHistoryManager.instance;
  }
  
  public addEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): HistoryEntry {
    const newEntry: HistoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    this.history.unshift(newEntry);
    
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }
    
    this.notifyListeners();
    this.saveToStorage();
    
    return newEntry;
  }
  
  public getHistory(): HistoryEntry[] {
    return [...this.history];
  }
  
  public getHistoryForComponent(component: string): HistoryEntry[] {
    return this.history.filter(entry => entry.component === component);
  }
  
  public getEntryById(id: string): HistoryEntry | undefined {
    return this.history.find(entry => entry.id === id);
  }
  
  public clearHistory(): void {
    this.history = [];
    this.notifyListeners();
    this.saveToStorage();
  }
  
  public setMaxEntries(max: number): void {
    this.maxEntries = max;
    
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
      this.notifyListeners();
      this.saveToStorage();
    }
  }
  
  public subscribe(listener: (history: HistoryEntry[]) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  public searchHistory(query: string): HistoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(entry => 
      entry.expression.toLowerCase().includes(lowerQuery) || 
      String(entry.result).toLowerCase().includes(lowerQuery)
    );
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener([...this.history]);
    }
  }
  
  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
      }
    } catch (error) {
      console.warn('Failed to save history to localStorage:', error);
    }
  }
  
  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('calculatorHistory');
        if (stored) {
          this.history = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.warn('Failed to load history from localStorage:', error);
      this.history = [];
    }
  }
}