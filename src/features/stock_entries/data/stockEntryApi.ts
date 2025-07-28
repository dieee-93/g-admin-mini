import { supabase } from '@/lib/supabase';
import { type StockEntry } from '../types';

export async function fetchStockEntries(): Promise<StockEntry[]> {
  const { data, error } = await supabase
    .from('stock_entries')
    .select(`
      *,
      item:items(id, name, unit, type)
    `)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createStockEntry(entry: Omit<StockEntry, 'id'>) {
  const { data: stockEntry, error: stockError } = await supabase
    .from('stock_entries')
    .insert([entry])
    .select()
    .single();

  if (stockError) throw stockError;

  // Actualizar el stock del item
  const { error: updateError } = await supabase.rpc('update_item_stock', {
    item_id: entry.item_id,
    quantity_to_add: entry.quantity
  });

  if (updateError) {
    // Si falla la actualización del stock, usamos una consulta manual
    const { data: currentItem } = await supabase
      .from('items')
      .select('stock')
      .eq('id', entry.item_id)
      .single();

    if (currentItem) {
      await supabase
        .from('items')
        .update({ stock: currentItem.stock + entry.quantity })
        .eq('id', entry.item_id);
    }
  }

  return stockEntry;
}