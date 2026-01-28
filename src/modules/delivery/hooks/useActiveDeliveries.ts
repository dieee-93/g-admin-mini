// delivery/hooks/useActiveDeliveries.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { deliveryApi } from '../services/deliveryApi';
import type { DeliveryOrder } from '../types';
import { logger } from '@/lib/logging';

/**
 * Hook for fetching and real-time tracking of active delivery orders
 *
 * Features:
 * - Initial fetch of active deliveries
 * - Real-time subscriptions for updates
 * - Automatic re-fetch on status changes
 */
export function useActiveDeliveries() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveDeliveries();
    setupRealtimeSubscription();

    return () => {
      cleanupSubscription();
    };
  }, []);

  async function fetchActiveDeliveries() {
    try {
      setLoading(true);
      const data = await deliveryApi.getActiveDeliveries();
      setDeliveries(data);
      setError(null);
      logger.info('useActiveDeliveries', `Fetched ${data.length} active deliveries`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active deliveries';
      setError(message);
      logger.error('useActiveDeliveries', 'Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    logger.info('useActiveDeliveries', 'Setting up real-time subscription');

    const channel = supabase
      .channel('delivery_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_orders',
          filter: 'status=in.(pending,assigned,picked_up,in_transit)'
        },
        (payload) => {
          logger.info('useActiveDeliveries', 'Real-time update received:', payload);

          if (payload.eventType === 'INSERT') {
            // Add new delivery
            const newDelivery = deliveryApi.transformDeliveryRecord(payload.new);
            setDeliveries(prev => [newDelivery, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing delivery
            const updatedDelivery = deliveryApi.transformDeliveryRecord(payload.new);
            setDeliveries(prev =>
              prev.map(d => d.id === updatedDelivery.id ? updatedDelivery : d)
            );

            // Remove from active if status changed to inactive
            if (!['pending', 'assigned', 'picked_up', 'in_transit'].includes(updatedDelivery.status)) {
              setDeliveries(prev => prev.filter(d => d.id !== updatedDelivery.id));
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove delivery
            setDeliveries(prev => prev.filter(d => d.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        logger.info('useActiveDeliveries', 'Subscription status:', status);
      });

    return () => {
      logger.info('useActiveDeliveries', 'Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }

  function cleanupSubscription() {
    // Cleanup is handled by the return function in setupRealtimeSubscription
  }

  return {
    deliveries,
    loading,
    error,
    refresh: fetchActiveDeliveries
  };
}
