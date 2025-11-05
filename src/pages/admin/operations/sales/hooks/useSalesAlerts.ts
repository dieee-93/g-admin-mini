import React, { useCallback, useState, useMemo } from 'react';
import { useAlerts } from '@/shared/alerts';
import {
  salesAlertsAdapter,
  type SalesAnalysisData
} from '../services/SalesAlertsAdapter';
import { logger } from '@/lib/logging';

// ============================================================================
// HOOK: USE SALES ALERTS (REFACTORED - Unified Alerts System)
// ============================================================================
// PATTERN: Follows Materials SmartAlertsAdapter pattern
// Uses unified alerts system via shared/alerts/hooks/useAlerts
// Adapter generates CreateAlertInput[], not maintains state
// ============================================================================

interface UseSalesAlertsReturn {
  // From unified system
  alerts: ReturnType<typeof useAlerts>['alerts'];
  activeAlerts: ReturnType<typeof useAlerts>['activeAlerts'];
  dismissAlert: ReturnType<typeof useAlerts>['dismissAlert'];
  acknowledgeAlert: ReturnType<typeof useAlerts>['acknowledgeAlert'];

  // Sales-specific
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
}

export function useSalesAlerts(): UseSalesAlertsReturn {
  // ✅ Use unified alerts system (NOT useState)
  const {
    alerts,
    activeAlerts,
    dismissAlert,
    acknowledgeAlert,
    addAlert,
  } = useAlerts({ context: 'sales' });

  // Local state only for meta-information (not the alerts themselves)
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compute summary from unified alerts
  const alertsSummary = useMemo(() => {
    const summary = {
      total: activeAlerts?.length || 0,
      critical: 0,
      warning: 0,
      info: 0
    };

    activeAlerts?.forEach(alert => {
      if (alert.severity === 'critical') summary.critical++;
      else if (alert.severity === 'warning') summary.warning++;
      else if (alert.severity === 'info') summary.info++;
    });

    return summary;
  }, [activeAlerts]);

  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================

  const generateAlerts = useCallback(async (salesData: SalesAnalysisData) => {
    try {
      setIsGenerating(true);
      setError(null);

      // ✅ Adapter generates CreateAlertInput[], not maintains state
      const result = await salesAlertsAdapter.generateAlerts(salesData);

      // ✅ Add to unified system instead of setAlerts()
      result.alerts.forEach(alertInput => {
        addAlert(alertInput);
      });

      setRecommendations(result.recommendations);
      setLastUpdate(new Date());

      logger.info('SalesAlerts', `Generated ${result.alerts.length} alerts`, {
        summary: {
          total: result.alerts.length,
          recommendations: result.recommendations.length
        }
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generating alerts';
      setError(errorMessage);
      logger.error('SalesAlerts', 'Alert generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  }, [addAlert]);

  // ============================================================================
  // REFRESH METHOD
  // ============================================================================

  const refreshAlerts = useCallback(async () => {
    // For refresh, fetch current sales data and regenerate
    // In production this would come from a store or API
    const mockData: SalesAnalysisData = {
      todayRevenue: 3500,
      yesterdayRevenue: 4200,
      weekRevenue: 24500,
      lastWeekRevenue: 26300,
      monthRevenue: 105000,
      lastMonthRevenue: 98000,
      averageOrderValue: 85,
      orderCount: 45,
      revenueTarget: 5000,
      topProducts: [],
      lowStockItems: [],
      peakHours: [],
    };

    await generateAlerts(mockData);
  }, [generateAlerts]);

  return {
    // From unified system
    alerts,
    activeAlerts,
    dismissAlert,
    acknowledgeAlert,

    // Computed
    alertsSummary,

    // Sales-specific state
    recommendations,
    isGenerating,
    lastUpdate,
    error,

    // Actions
    generateAlerts,
    refreshAlerts,
  };
}

export default useSalesAlerts;

// ============================================================================
// HELPER: METRICS TO ANALYSIS DATA CONVERTER
// ============================================================================

/**
 * Converts SalesPageMetrics to SalesAnalysisData format for alert generation
 */
export function metricsToAnalysisData(metrics: any): SalesAnalysisData {
  return {
    todayRevenue: metrics.todayRevenue || 0,
    yesterdayRevenue: 0, // Not available in metrics
    weekRevenue: 0, // Not available in metrics
    lastWeekRevenue: 0, // Not available in metrics
    monthRevenue: 0, // Not available in metrics
    lastMonthRevenue: 0, // Not available in metrics
    averageOrderValue: metrics.averageOrderValue || 0,
    orderCount: metrics.todayTransactions || 0,
    revenueTarget: 5000, // Default target
    topProducts: metrics.topProducts || [],
    lowStockItems: [], // Not available in metrics
    peakHours: [], // Not available in metrics
  };
}
