// src/features/inventory/logic/useInventory.ts
// Hook unificado que reemplaza useStockAlerts duplicado + funcionalidad de items

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toaster } from '@/components/ui/toaster';
import type { 
  InventoryItem, 
  StockAlert, 
  StockEntry, 
  AlertSummary, 
  AlertThreshold,
  InventoryStats 
} from '../types';

interface UseInventoryOptions {
  alertThreshold?: number;
  enableRealtime?: boolean;
}

export function useInventory(options: UseInventoryOptions = {}) {
  const { alertThreshold = 10, enableRealtime = true } = options;

  // States
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      hasCritical: critical > 0,
      hasWarning: warning > 0
    };
  }, [alerts]);

  const inventoryStats = useMemo<InventoryStats>(() => {
    const totalValue = items.reduce((sum, item) => 
      sum + (item.stock * (item.unit_cost || 0)), 0
    );
    
    return {
      totalItems: items.length,
      totalValue,
      lowStockItems: alerts.length,
      outOfStockItems: items.filter(item => item.stock === 0).length,
      recentMovements: stockEntries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length
    };
  }, [items, alerts, stockEntries]);

  // API Functions
  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar items');
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      // ✅ FIX: Corregir parámetro de función Supabase
      const { data, error } = await supabase
        .rpc('get_low_stock_alert', { p_threshold: alertThreshold });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar alertas');
    }
  }, [alertThreshold]);

  const fetchStockEntries = useCallback(async (itemId?: string) => {
    try {
      let query = supabase
        .from('stock_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      
      setStockEntries(data || []);
    } catch (err) {
      console.error('Error fetching stock entries:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos');
    }
  }, []);

  // Items operations
  const addItem = useCallback(async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data]);
      
      toaster.create({
        title: "Item agregado",
        description: `${data.name} fue agregado al inventario`,
        type: "success",
      });

      return data;
    } catch (err) {
      console.error('Error adding item:', err);
      toaster.create({
        title: "Error al agregar item",
        description: err instanceof Error ? err.message : 'Error desconocido',
        type: "error",
      });
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      
      toaster.create({
        title: "Item actualizado",
        description: `${data.name} fue actualizado`,
        type: "success",
      });

      return data;
    } catch (err) {
      console.error('Error updating item:', err);
      toaster.create({
        title: "Error al actualizar item",
        description: err instanceof Error ? err.message : 'Error desconocido',
        type: "error",
      });
      throw err;
    }
  }, []);

  // Stock operations
  const addStock = useCallback(async (itemId: string, quantity: number, unitCost: number, note?: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_entries')
        .insert([{
          item_id: itemId,
          quantity,
          unit_cost: unitCost,
          note
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh items to get updated stock
      await fetchItems();
      await fetchAlerts();
      
      toaster.create({
        title: "Stock agregado",
        description: `Se agregaron ${quantity} unidades`,
        type: "success",
      });

      return data;
    } catch (err) {
      console.error('Error adding stock:', err);
      toaster.create({
        title: "Error al agregar stock",
        description: err instanceof Error ? err.message : 'Error desconocido',
        type: "error",
      });
      throw err;
    }
  }, [fetchItems, fetchAlerts]);

  // Alert operations
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      // Mark alert as acknowledged (implementation depends on your needs)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toaster.create({
        title: "Alerta confirmada",
        description: "La alerta fue marcada como vista",
        type: "info",
      });
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  }, []);

  const saveThreshold = useCallback(async (threshold: AlertThreshold) => {
    try {
      // Implementation for saving custom thresholds
      setThresholds(prev => {
        const existing = prev.findIndex(t => t.item_id === threshold.item_id);
        if (existing >= 0) {
          return prev.map((t, i) => i === existing ? threshold : t);
        }
        return [...prev, threshold];
      });

      toaster.create({
        title: "Configuración guardada",
        description: "Los umbrales de alerta fueron actualizados",
        type: "success",
      });
    } catch (err) {
      console.error('Error saving threshold:', err);
      toaster.create({
        title: "Error al guardar configuración",
        description: err instanceof Error ? err.message : 'Error desconocido',
        type: "error",
      });
    }
  }, []);

  // Utility functions
  const getAlertsByUrgency = useCallback(() => {
    return {
      critical: alerts.filter(a => a.urgency === 'critical'),
      warning: alerts.filter(a => a.urgency === 'warning'),
      info: alerts.filter(a => a.urgency === 'info')
    };
  }, [alerts]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchItems(),
        fetchAlerts(),
        fetchStockEntries()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, fetchAlerts, fetchStockEntries]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Real-time subscriptions
  useEffect(() => {
    if (!enableRealtime) return;

    const itemsSubscription = supabase
      .channel('items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('Items change:', payload);
          fetchItems();
          fetchAlerts();
        }
      )
      .subscribe();

    const stockSubscription = supabase
      .channel('stock_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stock_entries' },
        (payload) => {
          console.log('Stock change:', payload);
          fetchItems();
          fetchAlerts();
          fetchStockEntries();
        }
      )
      .subscribe();

    return () => {
      itemsSubscription.unsubscribe();
      stockSubscription.unsubscribe();
    };
  }, [enableRealtime, fetchItems, fetchAlerts, fetchStockEntries]);

  return {
    // Data
    items,
    alerts,
    stockEntries,
    thresholds,
    alertSummary,
    inventoryStats,
    
    // States
    loading,
    error,
    
    // Actions
    addItem,
    updateItem,
    addStock,
    acknowledgeAlert,
    saveThreshold,
    refresh,
    
    // Utilities
    getAlertsByUrgency,
    
    // Computed values
    hasAlerts: alerts.length > 0,
    hasCriticalAlerts: alertSummary.hasCritical
  };
}