import { useState, useEffect, useCallback } from 'react';
import { fetchStockAlerts, getStockAlertsSummary } from '../data/stockAlertsApi';
import { type StockAlert, type StockAlertsSummary } from '../types';
import { toaster } from '@/components/ui/toaster';

export function useStockAlerts(threshold: number = 10) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [summary, setSummary] = useState<StockAlertsSummary>({
    total_alerts: 0,
    critical_alerts: 0,
    high_alerts: 0,
    medium_alerts: 0,
    total_estimated_cost: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [alertsData, summaryData] = await Promise.all([
        fetchStockAlerts(threshold),
        getStockAlertsSummary(threshold)
      ]);
      
      setAlerts(alertsData);
      setSummary(summaryData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar alertas de stock';
      setError(errorMessage);
      
      toaster.create({
        title: "Error al cargar alertas",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const refreshAlerts = useCallback(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Filtros útiles
  const criticalAlerts = alerts.filter(alert => alert.urgency_level === 'CRITICO');
  const highAlerts = alerts.filter(alert => alert.urgency_level === 'ALTO');
  const urgentAlerts = alerts.filter(alert => 
    alert.urgency_level === 'CRITICO' || alert.urgency_level === 'ALTO'
  );

  return {
    alerts,
    summary,
    loading,
    error,
    refreshAlerts,
    
    // Filtros convenientes
    criticalAlerts,
    highAlerts,
    urgentAlerts,
    
    // Estados derivados
    hasCriticalAlerts: criticalAlerts.length > 0,
    hasAlerts: alerts.length > 0,
    alertCount: alerts.length,
    totalEstimatedCost: summary.total_estimated_cost
  };
}
