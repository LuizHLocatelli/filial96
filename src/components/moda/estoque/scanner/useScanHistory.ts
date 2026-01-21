import { useState, useCallback, useEffect } from 'react';
import { ScanResult, ScanHistory } from './BarcodeScanner.types';
import { SCANNER_CONFIG } from './BarcodeScanner.config';

const STORAGE_KEY = 'moda_estoque_scan_history';

function loadStoredHistory(): ScanResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    }
  } catch {
    console.warn('Failed to load scan history');
  }
  return [];
}

export function useScanHistory(): ScanHistory {
  const [items, setItems] = useState<ScanResult[]>(() => loadStoredHistory());

  const saveToStorage = useCallback((newItems: ScanResult[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.slice(0, SCANNER_CONFIG.HISTORY_MAX_ITEMS)));
    } catch {
      console.warn('Failed to save scan history');
    }
  }, []);

  const add = useCallback((result: ScanResult) => {
    setItems(prev => {
      const newItems = [result, ...prev].slice(0, SCANNER_CONFIG.HISTORY_MAX_ITEMS);
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const remove = useCallback((index: number) => {
    setItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  const duplicate = useCallback((code: string) => {
    return code;
  }, []);

  return {
    get items() { return items; },
    add,
    clear,
    remove,
    duplicate
  };
}
