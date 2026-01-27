/**
 * Delivery Zones - TanStack Query Hooks
 * Server state management for delivery zones data
 * 
 * Pattern: Following Cash Module architecture
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 * 
 * @module fulfillment-delivery
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryService } from '../services/deliveryService';
import { getPublicDeliveryZones } from '../services/publicZonesApi';
import type { DeliveryZone } from '../types';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';

// ============================================
// QUERY KEYS
// ============================================

export const deliveryZonesKeys = {
  all: ['delivery-zones'] as const,
  lists: () => [...deliveryZonesKeys.all, 'list'] as const,
  list: (locationId?: string) => [...deliveryZonesKeys.lists(), { locationId }] as const,
  public: (locationId?: string) => [...deliveryZonesKeys.all, 'public', { locationId }] as const,
  details: () => [...deliveryZonesKeys.all, 'detail'] as const,
  detail: (id: string) => [...deliveryZonesKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook for fetching delivery zones configuration
 * @param locationId - Filter by location (optional for multi-location support)
 */
export function useDeliveryZones(locationId?: string) {
  return useQuery({
    queryKey: deliveryZonesKeys.list(locationId),
    queryFn: async () => {
      const data = await deliveryService.getZones(true, locationId);
      logger.info('useDeliveryZones', `Fetched ${data.length} zones for location: ${locationId || 'all'}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  });
}

/**
 * Hook for fetching public delivery zones (customer-facing)
 * Uses public API without authentication
 * @param locationId - Filter by location (optional)
 */
export function usePublicDeliveryZones(locationId?: string) {
  return useQuery({
    queryKey: deliveryZonesKeys.public(locationId),
    queryFn: async () => {
      return await getPublicDeliveryZones(locationId);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (public data changes less frequently)
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook to create or update a delivery zone
 */
export function useUpsertDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: DeliveryZone) => {
      // Assuming deliveryService has upsert method
      return await deliveryService.upsertZone(zone);
    },
    onSuccess: (_, zone) => {
      queryClient.invalidateQueries({ queryKey: deliveryZonesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deliveryZonesKeys.all });
      notify.success({
        title: 'Zona actualizada',
        description: `Zona "${zone.name}" guardada correctamente`
      });
    },
    onError: (error) => {
      logger.error('useUpsertDeliveryZone', 'Failed to upsert zone', error);
      notify.error({
        title: 'Error al guardar zona',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}

/**
 * Hook to delete a delivery zone
 */
export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zoneId: string) => {
      // Assuming deliveryService has delete method
      return await deliveryService.deleteZone(zoneId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryZonesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deliveryZonesKeys.all });
      notify.success({
        title: 'Zona eliminada',
        description: 'Zona de entrega eliminada correctamente'
      });
    },
    onError: (error) => {
      logger.error('useDeleteDeliveryZone', 'Failed to delete zone', error);
      notify.error({
        title: 'Error al eliminar zona',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}
