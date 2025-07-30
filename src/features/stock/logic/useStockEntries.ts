// ===================================

// 📁 src/features/stock_entries/logic/useStockEntries.ts
import { useEffect, useState } from 'react';
import { type StockEntry } from '../types';
import { fetchStockEntries, createStockEntry } from '../data/stockEntryApi';

export function useStockEntries() {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStockEntries = async () => {
    setLoading(true);
    try {
      const data = await fetchStockEntries();
      setStockEntries(data);
    } catch (e) {
      console.error('Error loading stock entries:', e);
    }
    setLoading(false);
  };

  const addStockEntry = async (entry: Omit<StockEntry, 'id'>) => {
    await createStockEntry(entry);
    await loadStockEntries();
  };

  useEffect(() => {
    loadStockEntries();
  }, []);

  return { stockEntries, loading, addStockEntry, reloadStockEntries: loadStockEntries };
}