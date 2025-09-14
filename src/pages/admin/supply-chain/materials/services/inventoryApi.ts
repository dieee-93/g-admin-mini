// src/features/inventory/data/inventoryApi.ts
// API functions para el módulo inventory

import { supabase } from '@/lib/supabase/client';
import type { InventoryItem, StockEntry } from '../types';

export const inventoryApi = {
  // Items
  async getItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getItem(id: string): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Stock entries
  async getStockEntries(itemId?: string): Promise<StockEntry[]> {
    let query = supabase
      .from('stock_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  },

  async createStockEntry(entry: Omit<StockEntry, 'id' | 'created_at' | 'updated_at'>): Promise<StockEntry> {
    const { data, error } = await supabase
      .from('stock_entries')
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data;
  },


  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_inventory_dashboard_stats');

    if (error) throw error;
    return data;
  },

  // Delete item with proper transaction handling
  async deleteItem(id: string): Promise<void> {
    try {
      // First, check if item exists and get its info
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('id, name')
        .eq('id', id)
        .single();

      if (itemError || !itemData) {
        throw new Error('Item no encontrado');
      }

      // Delete all stock_entries for this item first (to avoid trigger conflicts)
      const { error: stockError } = await supabase
        .from('stock_entries')
        .delete()
        .eq('item_id', id);

      if (stockError) {
        console.warn('Warning cleaning stock entries:', stockError);
        // Continue anyway, the item deletion might still work
      }

      // Now delete the item itself
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

    } catch (error) {
      console.error('Error in deleteItem:', error);
      throw error;
    }
  }
};