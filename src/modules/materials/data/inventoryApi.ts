// src/features/inventory/data/inventoryApi.ts
// API functions para el módulo inventory

import { supabase } from '@/lib/supabase';
import type { InventoryItem, StockEntry, StockAlert } from '../types';

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

  // Stock alerts - FIX: Usar parámetro correcto
  async getStockAlerts(threshold: number = 10): Promise<StockAlert[]> {
    const { data, error } = await supabase
      .rpc('get_low_stock_alert', { p_threshold: threshold });

    if (error) throw error;
    return data || [];
  },

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats');

    if (error) throw error;
    return data;
  }
};