import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { toaster } from '@/components/ui/toaster'; 

export interface StockAlert {
  id: string;
  item_name: string;
  current_stock: number;
  threshold: number;
  unit: string;
  type: 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';
  urgency: 'critical' | 'warning' | 'info';
  days_remaining?: number;
  suggested_reorder?: number;
}

export interface AlertThreshold {
  item_id: string;
  critical_threshold: number;
  warning_threshold: number;
  info_threshold: number;
  auto_reorder_enabled: boolean;
  suggested_reorder_quantity: number;
}

export function useStockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts using existing Supabase function
  const fetchAlerts = useCallback(async (threshold: number = 25) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_low_stock_alert', {
        threshold
      });

      if (error) throw error;

      // Transform data and calculate urgency levels
      const transformedAlerts: StockAlert[] = data.map((item: any) => {
        const urgency = calculateUrgency(item.current_stock, item.threshold);
        const daysRemaining = estimateDaysRemaining(item.current_stock, item.daily_usage || 1);
        const suggestedReorder = calculateSuggestedReorder(item.current_stock, item.threshold);

        return {
          id: item.id,
          item_name: item.name,
          current_stock: item.current_stock,
          threshold: item.threshold || threshold,
          unit: item.unit,
          type: item.type,
          urgency,
          days_remaining: daysRemaining,
          suggested_reorder: suggestedReorder
        };
      });

      setAlerts(transformedAlerts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alertas');
      console.error('Error fetching stock alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate urgency based on current stock
  const calculateUrgency = (currentStock: number, threshold: number): 'critical' | 'warning' | 'info' => {
    if (currentStock <= 5) return 'critical';
    if (currentStock <= 15) return 'warning';
    return 'info';
  };

  // Estimate days remaining based on average consumption
  const estimateDaysRemaining = (currentStock: number, dailyUsage: number): number => {
    if (dailyUsage === 0) return Infinity;
    return Math.floor(currentStock / dailyUsage);
  };

  // Calculate suggested reorder quantity
  const calculateSuggestedReorder = (currentStock: number, threshold: number): number => {
    const targetStock = threshold * 3; // Target 3x the threshold
    return Math.max(targetStock - currentStock, threshold);
  };

  // Save alert threshold configuration
  const saveThreshold = async (itemId: string, thresholdConfig: Omit<AlertThreshold, 'item_id'>) => {
    try {
      const { error } = await supabase
        .from('alert_thresholds')
        .upsert({
          item_id: itemId,
          ...thresholdConfig,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setThresholds(prev => {
        const existing = prev.findIndex(t => t.item_id === itemId);
        const newThreshold = { item_id: itemId, ...thresholdConfig };
        
        if (existing >= 0) {
          return prev.map((t, i) => i === existing ? newThreshold : t);
        } else {
          return [...prev, newThreshold];
        }
      });

      toaster.create({
        title: 'Configuración guardada',
        description: 'Los umbrales de alerta han sido actualizados',
        status: 'success',
        duration: 3000
      });

      // Refresh alerts with new thresholds
      await fetchAlerts();
    } catch (err) {
      toaster.create({
        title: 'Error al guardar configuración',
        description: err instanceof Error ? err.message : 'Error desconocido',
        status: 'error',
        duration: 5000
      });
    }
  };

  // Mark alert as acknowledged/resolved
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alert_acknowledgments')
        .insert({
          alert_id: alertId,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: 'current_user' // TODO: Replace with actual user ID
        });

      if (error) throw error;

      // Remove from local alerts
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));

      toaster.create({
        title: 'Alerta marcada como revisada',
        status: 'info',
        duration: 2000
      });
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  // Get alerts by urgency level
  const getAlertsByUrgency = () => {
    return {
      critical: alerts.filter(a => a.urgency === 'critical'),
      warning: alerts.filter(a => a.urgency === 'warning'),
      info: alerts.filter(a => a.urgency === 'info')
    };
  };

  // Get total alert count for badge
  const getTotalAlertCount = () => alerts.length;

  // Get critical alert count for priority notifications
  const getCriticalAlertCount = () => alerts.filter(a => a.urgency === 'critical').length;

  // Auto-refresh alerts every 5 minutes
  useEffect(() => {
    fetchAlerts();
    
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Show toast for new critical alerts
  useEffect(() => {
    const criticalCount = getCriticalAlertCount();
    if (criticalCount > 0) {
      toaster.create({
        title: `${criticalCount} alertas críticas`,
        description: 'Items con stock muy bajo requieren atención inmediata',
        status: 'error',
        duration: 8000
      });
    }
  }, [alerts]);

  return {
    alerts,
    thresholds,
    loading,
    error,
    fetchAlerts,
    saveThreshold,
    acknowledgeAlert,
    getAlertsByUrgency,
    getTotalAlertCount,
    getCriticalAlertCount,
    refresh: fetchAlerts
  };
}