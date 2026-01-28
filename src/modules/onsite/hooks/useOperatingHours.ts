/**
 * Operating Hours - TanStack Query Hooks
 * Server state management for operating hours data
 * 
 * Pattern: Following Cash Module architecture
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 * 
 * @module fulfillment-onsite
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import {
  fetchOperatingHours,
  fetchAllHoursForLocation,
  upsertOperatingHours,
  deleteOperatingHours,
} from '../services/hoursApi';
import type { Hours, OperatingHoursRow } from '../services/hoursApi';

// ============================================
// QUERY KEYS
// ============================================

export const operatingHoursKeys = {
  all: ['operating-hours'] as const,
  byLocation: (locationId: string) => [...operatingHoursKeys.all, 'location', locationId] as const,
  byType: (locationId: string, type: 'operating' | 'pickup' | 'delivery') => 
    [...operatingHoursKeys.byLocation(locationId), type] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook to fetch operating hours for a specific location and type
 * 
 * @param locationId - Location ID (defaults to user's home_location_id)
 * @param type - Hours type ('operating', 'pickup', or 'delivery')
 */
export function useOperatingHours(
  locationId?: string,
  type: 'operating' | 'pickup' | 'delivery' = 'operating'
) {
  const { user } = useAuth();
  const effectiveLocationId = locationId || user?.home_location_id || '';

  return useQuery({
    queryKey: operatingHoursKeys.byType(effectiveLocationId, type),
    queryFn: async () => {
      if (!effectiveLocationId) {
        throw new Error('Location ID is required');
      }
      return await fetchOperatingHours(effectiveLocationId, type);
    },
    enabled: !!effectiveLocationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Hook to fetch all hours types for a location
 * Returns array with operating, pickup, and delivery hours
 * 
 * @param locationId - Location ID (defaults to user's home_location_id)
 */
export function useAllOperatingHours(locationId?: string) {
  const { user } = useAuth();
  const effectiveLocationId = locationId || user?.home_location_id || '';

  return useQuery({
    queryKey: operatingHoursKeys.byLocation(effectiveLocationId),
    queryFn: async () => {
      if (!effectiveLocationId) {
        throw new Error('Location ID is required');
      }
      return await fetchAllHoursForLocation(effectiveLocationId);
    },
    enabled: !!effectiveLocationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================
// MUTATIONS
// ============================================

interface UpdateHoursParams {
  locationId: string;
  type: 'operating' | 'pickup' | 'delivery';
  hours: Hours;
}

/**
 * Hook to update/create operating hours
 */
export function useUpdateOperatingHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ locationId, type, hours }: UpdateHoursParams) => {
      return await upsertOperatingHours(locationId, type, hours);
    },
    onMutate: async ({ locationId, type, hours }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: operatingHoursKeys.byType(locationId, type)
      });

      // Snapshot previous value
      const previousHours = queryClient.getQueryData(
        operatingHoursKeys.byType(locationId, type)
      );

      // Optimistically update
      queryClient.setQueryData(
        operatingHoursKeys.byType(locationId, type),
        hours
      );

      return { previousHours };
    },
    onError: (error, { locationId, type }, context) => {
      // Rollback on error
      if (context?.previousHours) {
        queryClient.setQueryData(
          operatingHoursKeys.byType(locationId, type),
          context.previousHours
        );
      }
      logger.error('useUpdateOperatingHours', 'Failed to update hours', error);
      notify.error({
        title: 'Error al actualizar horarios',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
    onSuccess: (data, { locationId, type }) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: operatingHoursKeys.byLocation(locationId)
      });
      
      notify.success({
        title: 'Horarios actualizados',
        description: `Horarios de ${type} actualizados correctamente`
      });
    },
  });
}

/**
 * Hook to delete operating hours
 */
export function useDeleteOperatingHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ locationId, type }: Omit<UpdateHoursParams, 'hours'>) => {
      return await deleteOperatingHours(locationId, type);
    },
    onSuccess: (_, { locationId, type }) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: operatingHoursKeys.byLocation(locationId)
      });

      notify.success({
        title: 'Horarios eliminados',
        description: `Horarios de ${type} eliminados correctamente`
      });
    },
    onError: (error) => {
      logger.error('useDeleteOperatingHours', 'Failed to delete hours', error);
      notify.error({
        title: 'Error al eliminar horarios',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}
