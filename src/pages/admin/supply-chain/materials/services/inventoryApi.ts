// src/features/inventory/data/inventoryApi.ts
// API functions para el módulo inventory

import { supabase } from '@/lib/supabase/client';
import { MaterialsMockService } from './materialsMockService';
import type { InventoryItem, StockEntry } from '../types';
import type { MaterialItem } from '../types/materialTypes';

import { logger } from '@/lib/logging';
// ✅ DEVELOPMENT FLAG - Use mock data in development
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || true; // Force mock for now

export const inventoryApi = {
  // Items
  async getItems(): Promise<MaterialItem[]> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.getItems();
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createMaterial(item: Partial<MaterialItem>): Promise<MaterialItem> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.createMaterial(item);
    }

    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
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

  async getItem(id: string): Promise<MaterialItem | null> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.getItem(id);
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateStock(id: string, newStock: number): Promise<MaterialItem> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.updateStock(id, newStock);
    }

    const { data, error } = await supabase
      .from('items')
      .update({ stock: newStock, lastUpdated: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkAction(action: string, itemIds: string[]): Promise<void> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.bulkAction(action, itemIds);
    }

    // Implement real bulk actions here
    logger.info('MaterialsStore', 'Bulk action:', action, itemIds);
  },

  async generateReport(): Promise<void> {
    if (USE_MOCK_DATA) {
      return MaterialsMockService.generateReport();
    }

    // Implement real report generation here
    logger.info('MaterialsStore', 'Generating report...');
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
        logger.error('MaterialsStore', 'Warning cleaning stock entries:', stockError);
        // Continue anyway, the item deletion might still work
      }

      // Now delete the item itself
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

    } catch (error) {
      logger.error('MaterialsStore', 'Error in deleteItem:', error);
      throw error;
    }
  }
};