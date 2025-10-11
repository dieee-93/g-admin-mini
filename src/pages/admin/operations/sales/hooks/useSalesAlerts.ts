import { useState, useEffect, useCallback } from 'react';
import {
  salesAlertsAdapter,
  type SalesAnalysisData
} from '../services/SalesAlertsAdapter';
import type { SalesAlert } from '../services/SalesIntelligenceEngine';
import type { SalesPageMetrics } from './useSalesPage';

import { logger } from '@/lib/logging';
// ============================================================================
// HOOK: USE SALES ALERTS
// ============================================================================

interface UseSalesAlertsReturn {
  alerts: SalesAlert[];
  alertsSummary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
  recommendations: string[];
  isGenerating: boolean;
  lastUpdate: Date | null;
  error: string | null;

  // Actions
  generateAlerts: (salesData: SalesAnalysisData) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
}

export function useSalesAlerts(): UseSalesAlertsReturn {
  const [alerts, setAlerts] = useState<SalesAlert[]>([]);
  const [alertsSummary, setAlertsSummary] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================

  const generateAlerts = useCallback(async (salesData: SalesAnalysisData) => {
    try {
      setIsGenerating(true);
      setError(null);

      const result = await salesAlertsAdapter.generateAndUpdateAlerts(salesData);

      setAlerts(result.alerts);
      setAlertsSummary(result.summary);
      setRecommendations(result.recommendations);
      setLastUpdate(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generating alerts';
      setError(errorMessage);
      logger.error('SalesStore', 'Sales alerts generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // ============================================================================
  // REFRESH METHOD
  // ============================================================================

  const refreshAlerts = useCallback(async () => {
    // Para refresh, usamos datos mock por ahora
    // En producción esto vendría de un store o API
    const mockData = {
      todayRevenue: 3500,
      targetRevenue: 5000,
      yesterdayRevenue: 4200,
      lastWeekRevenue: 4800,
      todayTransactions: 45,
      averageOrderValue: 77.78,
      tableOccupancy: 75,
      averageServiceTime: 32,
      tablesTurnover: 2.5,
      paymentSuccessRate: 98,
      conversionRate: 82,
      newCustomers: 15,
      returningCustomers: 30,
      customerSatisfaction: 8.5,
      materialsStockCritical: 2,
      staffCapacity: 85,
      kitchenEfficiency: 88
    };

    await generateAlerts(mockData);
  }, [generateAlerts]);

  // ============================================================================
  // ALERT MANAGEMENT ACTIONS
  // ============================================================================

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));

    // Update summary
    setAlertsSummary(prev => ({
      ...prev,
      total: prev.total - 1
    }));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? {
            ...alert,
            isAcknowledged: true,
            acknowledgedAt: new Date().toISOString()
          }
        : alert
    ));
  }, []);

  // ============================================================================
  // AUTO-REFRESH EFFECT
  // ============================================================================

  useEffect(() => {
    // Auto-refresh alerts every 5 minutes during business hours
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();

      // Only auto-refresh during business hours (8 AM - 11 PM)
      if (hour >= 8 && hour <= 23) {
        refreshAlerts();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Initial load
    refreshAlerts();

    return () => clearInterval(interval);
  }, [refreshAlerts]);

  return {
    alerts,
    alertsSummary,
    recommendations,
    isGenerating,
    lastUpdate,
    error,
    generateAlerts,
    refreshAlerts,
    dismissAlert,
    acknowledgeAlert
  };
}

// ============================================================================
// HELPER FUNCTION: CONVERT METRICS TO ANALYSIS DATA
// ============================================================================

/**
 * ✅ NOT A HOOK - Pure transformation function
 * Convierte métricas de Sales a formato requerido por el Intelligence Engine
 */
export function metricsToAnalysisData(metrics: SalesPageMetrics): SalesAnalysisData {
  return {
    todayRevenue: metrics.todayRevenue,
    targetRevenue: 5000, // TODO: Obtener de configuración
    yesterdayRevenue: metrics.todayRevenue * 0.95, // Estimación
    lastWeekRevenue: metrics.todayRevenue * 7 * 1.1, // Estimación

    todayTransactions: metrics.todayTransactions,
    averageOrderValue: metrics.averageOrderValue,
    tableOccupancy: metrics.tableOccupancy,
    averageServiceTime: metrics.averageServiceTime,

    tablesTurnover: metrics.todayTransactions / 10, // Estimación basada en # mesas
    paymentSuccessRate: 98, // TODO: Obtener de datos reales
    conversionRate: metrics.conversionRate,

    newCustomers: Math.round(metrics.todayTransactions * 0.3), // Estimación
    returningCustomers: Math.round(metrics.todayTransactions * 0.7), // Estimación
    customerSatisfaction: 8.5, // TODO: Obtener de surveys

    materialsStockCritical: 0, // TODO: Obtener del EventBus
    staffCapacity: 90, // TODO: Obtener del módulo Staff
    kitchenEfficiency: 88 // TODO: Obtener del módulo Kitchen
  };
}