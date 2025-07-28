import { useEffect, useState } from 'react';
import { type Item } from '../types';
import { fetchItems, createItem } from '../data/itemApi';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (e) {
      console.error('Error loading items:', e);
    }
    setLoading(false);
  };

  const addItem = async (item: Omit<Item, 'id' | 'stock'>) => {
    await createItem(item);
    await loadItems();
  };

  useEffect(() => {
    loadItems();
  }, []);

  return { items, loading, addItem };
}