// delivery/hooks/useDeliveryZones.ts
import { useState, useEffect } from 'react';
import { deliveryApi } from '../services/deliveryApi';
import type { DeliveryZone } from '../types/deliveryTypes';
import { logger } from '@/lib/logging';

/**
 * Hook for fetching delivery zones configuration
 */
export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchZones();
  }, []);

  async function fetchZones() {
    try {
      setLoading(true);
      const data = await deliveryApi.getZones();
      setZones(data);
      setError(null);
      logger.info('useDeliveryZones', `Fetched ${data.length} zones`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch zones';
      setError(message);
      logger.error('useDeliveryZones', 'Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  return {
    zones,
    loading,
    error,
    refresh: fetchZones
  };
}
