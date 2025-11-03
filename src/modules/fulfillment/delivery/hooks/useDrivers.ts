// delivery/hooks/useDrivers.ts
import { useState, useEffect } from 'react';
import { deliveryApi } from '../services/deliveryApi';
import type { DriverPerformance } from '../types/deliveryTypes';
import { logger } from '@/lib/logging';

/**
 * Hook for fetching driver performance data
 * Integrates with Staff module to get available drivers
 */
export function useDrivers() {
  const [drivers, setDrivers] = useState<DriverPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    try {
      setLoading(true);
      const data = await deliveryApi.getDrivers();
      setDrivers(data);
      setError(null);
      logger.info('useDrivers', `Fetched ${data.length} drivers`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch drivers';
      setError(message);
      logger.error('useDrivers', 'Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  return {
    drivers,
    loading,
    error,
    refresh: fetchDrivers
  };
}
