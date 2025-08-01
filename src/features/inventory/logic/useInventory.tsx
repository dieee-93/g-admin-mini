// src/features/inventory/logic/useInventory.tsx
// 🎉 Hook unificado COMPLETAMENTE MIGRADO al sistema centralizado v3.23
// ✅ ANTES: Mixed API (status + type inconsistente)
// ✅ AHORA: Sistema notify centralizado, API correcta 100%

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { notify, handleApiError } from '@/lib/notifications'; // ✅ NUEVO sistema centralizado
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
      
      // ✅ MIGRADO: Usar sistema centralizado
      notify.itemCreated(data.name);

      return data;
    } catch (err) {
      console.error('Error adding item:', err);
      // ✅ MIGRADO: Usar handleApiError centralizado
      handleApiError(err, 'No se pudo agregar el item');
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
      
      // ✅ MIGRADO: Usar sistema centralizado
      notify.itemUpdated(data.name);

      return data;
    } catch (err) {
      console.error('Error updating item:', err);
      // ✅ MIGRADO: Usar handleApiError centralizado
      handleApiError(err, 'No se pudo actualizar el item');
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
      
      // ✅ MIGRADO: Usar helper específico
      const item = items.find(i => i.id === itemId);
      notify.stockAdded(quantity, item?.unit || 'unidades');

      return data;
    } catch (err) {
      console.error('Error adding stock:', err);
      // ✅ MIGRADO: Usar handleApiError centralizado
      handleApiError(err, 'No se pudo agregar stock');
      throw err;
    }
  }, [fetchItems, fetchAlerts, items]);

  // Alert operations
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      // Mark alert as acknowledged (implementation depends on your needs)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      // ✅ MIGRADO: Usar helper específico
      notify.alertAcknowledged();
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
      
      // ✅ MIGRADO: Usar helper específico
      const item = items.find(i => i.id === threshold.item_id);
      notify.alertConfigSaved(item?.name || 'Item');
      
      return threshold;
    } catch (err) {
      console.error('Error saving threshold:', err);
      // ✅ MIGRADO: Usar handleApiError centralizado
      handleApiError(err, 'No se pudo guardar la configuración');
      throw err;
    }
  }, [items]);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchItems(),
          fetchAlerts(),
          fetchStockEntries()
        ]);
      } catch (err) {
        console.error('Error loading inventory data:', err);
        // ✅ MIGRADO: Usar handleApiError centralizado
        handleApiError(err, 'Error al cargar datos del inventario');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchItems, fetchAlerts, fetchStockEntries]);

  // Realtime subscriptions
  useEffect(() => {
    if (!enableRealtime) return;

    const itemsSubscription = supabase
      .channel('inventory-items')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        () => fetchItems()
      )
      .subscribe();

    const stockSubscription = supabase
      .channel('inventory-stock')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stock_entries' },
        () => {
          fetchItems();
          fetchStockEntries();
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
      supabase.removeChannel(stockSubscription);
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
    
    // Derived state
    alertSummary,
    inventoryStats,
    
    // Actions
    addItem,
    updateItem,
    addStock,
    acknowledgeAlert,
    saveThreshold,
    
    // Refetch functions
    refetch: () => Promise.all([fetchItems(), fetchAlerts(), fetchStockEntries()]),
    fetchItems,
    fetchAlerts,
    fetchStockEntries
  };
}

/**
 * 🎯 MIGRACIÓN COMPLETADA:
 * 
 * ❌ ANTES: toaster.create({ status: "success", isClosable: true })
 * ✅ AHORA: notify.success({ title: "Success", description: "..." })
 * 
 * ❌ ANTES: toaster.create({ type: "error" }) (inconsistente)
 * ✅ AHORA: handleApiError(error, "mensaje fallback")
 * 
 * 🚀 BENEFICIOS:
 * - API unificada v3.23.0 correcta
 * - Helpers específicos para operaciones comunes
 * - Error handling centralizado
 * - Código más limpio y mantenible
 */