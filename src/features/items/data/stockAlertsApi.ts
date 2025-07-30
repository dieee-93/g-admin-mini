// 📁 src/features/items/data/stockAlertsApi.ts - CREAR ESTE ARCHIVO
import { supabase } from '@/lib/supabase';
import { type StockAlert, type StockAlertsSummary } from '../types';

export async function fetchStockAlerts(threshold: number = 10): Promise<StockAlert[]> {
  try {
    // ✅ LLAMADA CORRECTA: Usar p_threshold (el nombre del parámetro en la función SQL)
    const { data, error } = await supabase.rpc('get_low_stock_alert', {
      p_threshold: threshold  // ✅ Nombre correcto del parámetro
    });

    if (error) {
      console.error('Error calling get_low_stock_alert:', error);
      throw error;
    }

    // Los datos ya vienen completos desde la función SQL
    return data || [];
    
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    throw error;
  }
}

export async function getStockAlertsSummary(threshold: number = 10): Promise<StockAlertsSummary> {
  const alerts = await fetchStockAlerts(threshold);
  
  const summary = alerts.reduce((acc, alert) => {
    acc.total_alerts++;
    
    switch (alert.urgency_level) {
      case 'CRITICO':
        acc.critical_alerts++;
        break;
      case 'ALTO':
        acc.high_alerts++;
        break;
      case 'MEDIO':
        acc.medium_alerts++;
        break;
    }
    
    if (alert.estimated_cost) {
      acc.total_estimated_cost += alert.estimated_cost;
    }
    
    return acc;
  }, {
    total_alerts: 0,
    critical_alerts: 0,
    high_alerts: 0,
    medium_alerts: 0,
    total_estimated_cost: 0
  });

  return summary;
}