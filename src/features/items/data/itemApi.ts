import { supabase } from '@/lib/supabase';
import { type Item } from '../types';

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createItem(item: Omit<Item, 'id' | 'stock'>) {
  const { error } = await supabase
    .from('items')
    .insert([{ ...item, stock: 0 }]);
  if (error) throw error;
}