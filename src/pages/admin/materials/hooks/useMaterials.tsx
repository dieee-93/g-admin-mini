// src/features/materials/logic/useMaterials.tsx
// Materials management hook with Supabase realtime integration

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { notify, handleApiError } from '@/lib/notifications';
import type { 
  InventoryItem, 
  StockAlert, 
  StockEntry, 
  AlertSummary, 
  AlertThreshold,
  InventoryStats 
} from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseMaterialsOptions {
  alertThreshold?: number;
  enableRealtime?: boolean;
}

export function useMaterials(options: UseMaterialsOptions = {}) {
  const { alertThreshold = 10, enableRealtime = true } = options;

  // States
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Realtime subscriptions ref
  const subscriptionsRef = useRef<RealtimeChannel[]>([]);

  // Derived state
  const alertSummary = useMemo<AlertSummary>(() => {
    const critical = alerts.filter(a => a.urgency === 'critical').length;
    const warning = alerts.filter(a => a.urgency === 'warning').length;
    const info = alerts.filter(a => a.urgency === 'info').length;

    return {
      total: alerts.length,
      critical,
      warning,
      info,
      hasAlerts: alerts.length > 0,
      hasCriticalAlerts: critical > 0
    };
  }, [alerts]);

  const inventoryStats = useMemo<InventoryStats>(() => {
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.current_stock <= alertThreshold).length;
    const outOfStockItems = items.filter(item => item.current_stock === 0).length;
    const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0);

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      averageValue: totalItems > 0 ? totalValue / totalItems : 0
    };
  }, [items, alertThreshold]);

  // API Functions
  const fetchItems = useCallback(async (): Promise<InventoryItem[]> => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setItems(data || []);
      return data || [];
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      throw error;
    }
  }, []);

  const fetchAlerts = useCallback(async (): Promise<StockAlert[]> => {
    try {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setAlerts(data || []);
      return data || [];
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      throw error;
    }
  }, []);

  const fetchStockEntries = useCallback(async (itemId?: string): Promise<StockEntry[]> => {
    try {
      let query = supabase
        .from('stock_entries')
        .select('*, items(name)')
        .order('created_at', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setStockEntries(data || []);
      return data || [];
    } catch (error) {
      const message = handleApiError(error);
      setError(message);
      throw error;
    }
  }, []);

  const addStockEntry = useCallback(async (entry: Omit<StockEntry, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('stock_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      await fetchItems();
      await fetchStockEntries();
      notify.success('Stock entry added successfully');
      
      return data;
    } catch (error) {
      const message = handleApiError(error);
      notify.error(`Failed to add stock entry: ${message}`);
      throw error;
    }
  }, [fetchItems, fetchStockEntries]);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      
      notify.success('Item updated successfully');
      return data;
    } catch (error) {
      const message = handleApiError(error);
      notify.error(`Failed to update item: ${message}`);
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setItems(prev => prev.filter(item => item.id !== id));
      notify.success('Item deleted successfully');
    } catch (error) {
      const message = handleApiError(error);
      notify.error(`Failed to delete item: ${message}`);
      throw error;
    }
  }, []);

  const createItem = useCallback(async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setItems(prev => [...prev, data]);
      notify.success('Item created successfully');
      
      return data;
    } catch (error) {
      const message = handleApiError(error);
      notify.error(`Failed to create item: ${message}`);
      throw error;
    }
  }, []);

  // Alert management
  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) throw error;
      
      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      notify.success('Alert dismissed');
    } catch (error) {
      const message = handleApiError(error);
      notify.error(`Failed to dismiss alert: ${message}`);
      throw error;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await Promise.all([
          fetchItems(),
          fetchAlerts(),
          fetchStockEntries()
        ]);
      } catch (error) {
        
        setError(error instanceof Error ? error.message : 'Error loading inventory data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchItems, fetchAlerts, fetchStockEntries]);

  // Realtime subscriptions
  useEffect(() => {
  if (!enableRealtime) return;

  // Add error handling and logging
  const handleSubscriptionError = (error: unknown) => {
    
  };

  let itemsSubscription: any;
  let stockSubscription: any;

  try {
    itemsSubscription = supabase
      .channel('inventory-items')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          
          fetchItems();
        }
      )
      .subscribe((status, err) => {
        if (err) handleSubscriptionError(err);
        
      });

    stockSubscription = supabase
      .channel('inventory-stock')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stock_entries' },
        (payload) => {
          
          fetchItems();
          fetchStockEntries();
          fetchAlerts();
        }
      )
      .subscribe((status, err) => {
        if (err) handleSubscriptionError(err);
        
      });

    // Store subscriptions for cleanup
    subscriptionsRef.current = [itemsSubscription, stockSubscription];
  } catch (error) {
    
  }

  return () => {
    if (subscriptionsRef.current) {
      subscriptionsRef.current.forEach(subscription => {
        try {
          supabase.removeChannel(subscription);
        } catch (error) {
          
        }
      });
      subscriptionsRef.current = [];
    }
  };
}, [enableRealtime, fetchItems, fetchStockEntries, fetchAlerts]);

  return {
    // State
    items,
    alerts,
    stockEntries,
    thresholds,
    loading,
    error,
    
    // Computed state
    alertSummary,
    inventoryStats,
    
    // Actions
    fetchItems,
    fetchAlerts,
    fetchStockEntries,
    addStockEntry,
    updateItem,
    deleteItem,
    createItem,
    dismissAlert,
    
    // Utilities
    refresh: useCallback(async () => {
      await Promise.all([
        fetchItems(),
        fetchAlerts(),
        fetchStockEntries()
      ]);
    }, [fetchItems, fetchAlerts, fetchStockEntries])
  };
}