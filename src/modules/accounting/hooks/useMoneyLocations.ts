/**
 * useMoneyLocations - React Query Hook
 * 
 * ✅ TanStack Query hook para Money Locations (server state)
 * Reemplaza el patrón anterior de Zustand store con server data
 * 
 * Features:
 * - Auto caching (10min stale time)
 * - Background refetch
 * - Deduplicación automática
 * - Error handling
 * 
 * @see CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import {
  fetchMoneyLocations,
  fetchMoneyLocationsWithAccount,
  fetchCashDrawers,
  fetchMoneyLocationsByType,
  getMoneyLocationById,
  getMoneyLocationByCode,
  createMoneyLocation,
  updateMoneyLocation,
  deactivateMoneyLocation,
  updateMoneyLocationBalance,
} from '../services/moneyLocationsService';
import type {
  MoneyLocationRow,
  MoneyLocationWithAccount,
  CreateMoneyLocationInput,
  UpdateMoneyLocationInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS (Centralized for invalidation)
// ─────────────────────────────────────────────────────────────────────────────

export const moneyLocationsKeys = {
  all: ['cash', 'money-locations'] as const,
  lists: () => [...moneyLocationsKeys.all, 'list'] as const,
  list: (filters?: string) => [...moneyLocationsKeys.lists(), filters] as const,
  details: () => [...moneyLocationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...moneyLocationsKeys.details(), id] as const,
  byCode: (code: string) => [...moneyLocationsKeys.all, 'code', code] as const,
  withAccount: () => [...moneyLocationsKeys.all, 'with-account'] as const,
  cashDrawers: () => [...moneyLocationsKeys.all, 'cash-drawers'] as const,
  byType: (type: string) => [...moneyLocationsKeys.all, 'type', type] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener todas las ubicaciones de dinero activas
 * 
 * @example
 * ```tsx
 * const { data: locations, isLoading } = useMoneyLocations();
 * ```
 */
export function useMoneyLocations() {
  return useQuery({
    queryKey: moneyLocationsKeys.lists(),
    queryFn: async () => {
      logger.info('CashModule', 'Fetching money locations');
      return await fetchMoneyLocations();
    },
    staleTime: 10 * 60 * 1000,  // 10 min - locations don't change often
  });
}

/**
 * Hook para obtener ubicaciones con información de cuenta
 * 
 * @example
 * ```tsx
 * const { data: locationsWithAccount } = useMoneyLocationsWithAccount();
 * ```
 */
export function useMoneyLocationsWithAccount() {
  return useQuery({
    queryKey: moneyLocationsKeys.withAccount(),
    queryFn: async () => {
      logger.info('CashModule', 'Fetching money locations with account');
      return await fetchMoneyLocationsWithAccount();
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener cajas registradoras (cash drawers)
 * 
 * @example
 * ```tsx
 * const { data: cashDrawers } = useCashDrawers();
 * ```
 */
export function useCashDrawers() {
  return useQuery({
    queryKey: moneyLocationsKeys.cashDrawers(),
    queryFn: async () => {
      logger.info('CashModule', 'Fetching cash drawers');
      return await fetchCashDrawers();
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener ubicaciones por tipo
 * 
 * @param locationType - Tipo de ubicación a filtrar
 * @example
 * ```tsx
 * const { data: bankAccounts } = useMoneyLocationsByType('BANK_ACCOUNT');
 * ```
 */
export function useMoneyLocationsByType(locationType: string) {
  return useQuery({
    queryKey: moneyLocationsKeys.byType(locationType),
    queryFn: async () => {
      logger.info('CashModule', 'Fetching money locations by type', { locationType });
      return await fetchMoneyLocationsByType(locationType);
    },
    enabled: !!locationType,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener una ubicación por ID
 * 
 * @param id - ID de la ubicación
 * @example
 * ```tsx
 * const { data: location } = useMoneyLocationById('loc-123');
 * ```
 */
export function useMoneyLocationById(id?: string) {
  return useQuery({
    queryKey: moneyLocationsKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      logger.info('CashModule', 'Fetching money location by ID', { id });
      return await getMoneyLocationById(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obtener una ubicación por código
 * 
 * @param code - Código de la ubicación
 * @example
 * ```tsx
 * const { data: location } = useMoneyLocationByCode('CAJ-01');
 * ```
 */
export function useMoneyLocationByCode(code?: string) {
  return useQuery({
    queryKey: moneyLocationsKeys.byCode(code || ''),
    queryFn: async () => {
      if (!code) return null;
      logger.info('CashModule', 'Fetching money location by code', { code });
      return await getMoneyLocationByCode(code);
    },
    enabled: !!code,
    staleTime: 10 * 60 * 1000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook para crear nueva ubicación de dinero
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateMoneyLocation();
 * 
 * await createMutation.mutateAsync({
 *   code: 'CAJ-02',
 *   name: 'Caja Principal',
 *   location_type: 'CASH_DRAWER',
 *   // ...
 * });
 * ```
 */
export function useCreateMoneyLocation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateMoneyLocationInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      logger.info('CashModule', 'Creating money location', { input });
      return await createMoneyLocation(input, user.id);
    },
    onSuccess: (newLocation) => {
      // Invalidate all money locations queries
      queryClient.invalidateQueries({ 
        queryKey: moneyLocationsKeys.all 
      });

      notify.success({
        title: 'Ubicación creada',
        description: `${newLocation.name} creada exitosamente`
      });

      logger.info('CashModule', 'Money location created', { id: newLocation.id });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al crear ubicación';
      notify.error({ title: 'Error', description: message });
      logger.error('CashModule', 'Failed to create money location', { error });
    },
  });
}

/**
 * Hook para actualizar ubicación de dinero
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateMoneyLocation();
 * 
 * await updateMutation.mutateAsync({
 *   id: 'loc-123',
 *   name: 'Caja Principal Actualizada',
 * });
 * ```
 */
export function useUpdateMoneyLocation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...input 
    }: UpdateMoneyLocationInput & { id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      logger.info('CashModule', 'Updating money location', { id, input });
      return await updateMoneyLocation(id, input, user.id);
    },
    onSuccess: (updatedLocation) => {
      // Invalidate specific location + all lists
      queryClient.invalidateQueries({ 
        queryKey: moneyLocationsKeys.detail(updatedLocation.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: moneyLocationsKeys.lists() 
      });

      notify.success({
        title: 'Ubicación actualizada',
        description: `${updatedLocation.name} actualizada exitosamente`
      });

      logger.info('CashModule', 'Money location updated', { id: updatedLocation.id });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al actualizar ubicación';
      notify.error({ title: 'Error', description: message });
      logger.error('CashModule', 'Failed to update money location', { error });
    },
  });
}

/**
 * Hook para desactivar ubicación (soft delete)
 * 
 * @example
 * ```tsx
 * const deactivateMutation = useDeactivateMoneyLocation();
 * 
 * await deactivateMutation.mutateAsync('loc-123');
 * ```
 */
export function useDeactivateMoneyLocation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      logger.info('CashModule', 'Deactivating money location', { id });
      await deactivateMoneyLocation(id, user.id);
      return id;
    },
    onSuccess: (id) => {
      // Invalidate all queries
      queryClient.invalidateQueries({ 
        queryKey: moneyLocationsKeys.all 
      });

      notify.success({
        title: 'Ubicación desactivada',
        description: 'La ubicación ha sido desactivada exitosamente'
      });

      logger.info('CashModule', 'Money location deactivated', { id });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al desactivar ubicación';
      notify.error({ title: 'Error', description: message });
      logger.error('CashModule', 'Failed to deactivate money location', { error });
    },
  });
}

/**
 * Hook para actualizar balance de ubicación
 * 
 * @example
 * ```tsx
 * const updateBalanceMutation = useUpdateMoneyLocationBalance();
 * 
 * await updateBalanceMutation.mutateAsync({
 *   id: 'loc-123',
 *   newBalance: 5000,
 * });
 * ```
 */
export function useUpdateMoneyLocationBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      newBalance 
    }: { 
      id: string; 
      newBalance: number 
    }) => {
      logger.info('CashModule', 'Updating money location balance', { id, newBalance });
      await updateMoneyLocationBalance(id, newBalance);
      return { id, newBalance };
    },
    onSuccess: ({ id }) => {
      // Invalidate specific location query
      queryClient.invalidateQueries({ 
        queryKey: moneyLocationsKeys.detail(id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: moneyLocationsKeys.lists() 
      });

      logger.info('CashModule', 'Money location balance updated', { id });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al actualizar balance';
      notify.error({ title: 'Error', description: message });
      logger.error('CashModule', 'Failed to update balance', { error });
    },
  });
}
