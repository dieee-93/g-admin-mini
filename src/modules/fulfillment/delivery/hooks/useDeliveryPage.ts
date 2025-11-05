// delivery/hooks/useDeliveryPage.ts
import { useState, useEffect } from 'react';
import type { DeliveryMetrics } from '../types';
import { deliveryApi } from '../services/deliveryApi';
import { useActiveDeliveries } from './useActiveDeliveries';
import { useDrivers } from './useDrivers';
import { useDeliveryZones } from './useDeliveryZones';
import { logger } from '@/lib/logging';

/**
 * Main orchestration hook for Delivery Page
 * Manages tab state and data fetching for all delivery components
 */
export function useDeliveryPage() {
  const [activeTab, setActiveTab] = useState<string>('live-map');
  const [metrics, setMetrics] = useState<DeliveryMetrics>({
    active_deliveries: 0,
    pending_assignments: 0,
    avg_delivery_time_minutes: 0,
    on_time_rate_percentage: 0,
    eta_accuracy_percentage: 0,
    total_deliveries_today: 0,
    failed_deliveries_today: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Use specialized hooks
  const {
    deliveries: activeDeliveries,
    loading: deliveriesLoading,
    error: deliveriesError
  } = useActiveDeliveries();

  const {
    drivers,
    loading: driversLoading,
    error: driversError
  } = useDrivers();

  const {
    zones,
    loading: zonesLoading,
    error: zonesError
  } = useDeliveryZones();

  // Fetch metrics on mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      setMetricsLoading(true);
      const data = await deliveryApi.getMetrics();
      setMetrics(data);
      logger.info('useDeliveryPage', 'Metrics loaded successfully');
    } catch (err) {
      logger.error('useDeliveryPage', 'Failed to fetch metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  }

  // Aggregate loading state
  const loading = deliveriesLoading || driversLoading || zonesLoading || metricsLoading;

  // Aggregate error state (prioritize deliveries error)
  const error = deliveriesError || driversError || zonesError;

  return {
    activeTab,
    setActiveTab,
    activeDeliveries,
    drivers,
    zones,
    metrics,
    loading,
    error
  };
}
