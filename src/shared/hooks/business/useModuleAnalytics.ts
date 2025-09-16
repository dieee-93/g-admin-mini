/**
 * Generic Module Analytics Hook
 * Consolidates analytics patterns from customers, sales, materials modules
 */
import { useState, useCallback } from 'react';
import { notify } from '@/lib/notifications';

interface AnalyticsConfig {
  module: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface MetricDefinition {
  key: string;
  label: string;
  format?: 'currency' | 'percentage' | 'number' | 'date';
  colorPalette?: string;
}

interface AnalyticsData {
  [key: string]: number | string | Date;
}

export function useModuleAnalytics<T extends AnalyticsData>({
  module,
  timeRange = '30d',
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: AnalyticsConfig) {
  const [metrics, setMetrics] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateMetrics = useCallback(async (
    data: unknown[],
    metricDefinitions: MetricDefinition[]
  ): Promise<T> => {
    // Generic analytics calculation logic
    const calculatedMetrics: AnalyticsData = {};

    metricDefinitions.forEach(metric => {
      switch (metric.key) {
        case 'total_count':
          calculatedMetrics[metric.key] = data.length;
          break;
        case 'active_count':
          // Example: count items with recent activity
          calculatedMetrics[metric.key] = data.filter((item: any) => {
            if (!item.last_activity) return false;
            const lastActivity = new Date(item.last_activity);
            const threshold = new Date();
            threshold.setDate(threshold.getDate() - 30);
            return lastActivity > threshold;
          }).length;
          break;
        case 'average_value':
          // Example: calculate average monetary value
          const values = data
            .map((item: any) => item.total_value || 0)
            .filter(value => value > 0);
          calculatedMetrics[metric.key] = values.length > 0
            ? values.reduce((sum, val) => sum + val, 0) / values.length
            : 0;
          break;
        case 'growth_rate':
          // Example: calculate growth rate
          calculatedMetrics[metric.key] = 0; // Would need historical data
          break;
        default:
          // Custom metric calculation
          calculatedMetrics[metric.key] = 0;
      }
    });

    return calculatedMetrics as T;
  }, []);

  const loadAnalytics = useCallback(async (
    data: unknown[],
    metricDefinitions: MetricDefinition[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const analytics = await generateMetrics(data, metricDefinitions);
      setMetrics(analytics);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = `Error generando analytics para ${module}`;
      setError(errorMessage);
      notify.error({ title: 'ANALYTICS_ERROR', description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [generateMetrics, module]);

  const formatMetric = useCallback((value: unknown, format?: string) => {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS'
        }).format(Number(value));
      case 'percentage':
        return `${Number(value).toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('es-AR').format(Number(value));
      case 'date':
        return new Date(value as string).toLocaleDateString('es-ES');
      default:
        return String(value);
    }
  }, []);

  // Auto-refresh setup
  useState(() => {
    if (autoRefresh && refreshInterval) {
      const interval = setInterval(() => {
        // Trigger analytics refresh - would need current data
        // This would be implemented by the calling component
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  });

  return {
    metrics,
    loading,
    error,
    lastUpdated,
    loadAnalytics,
    formatMetric,
    timeRange
  };
}