/**
 * Tables - TanStack Query Hooks
 * Server state management for tables data
 * 
 * Pattern: Following Cash Module architecture
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 * 
 * @module fulfillment-onsite
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import { tablesApi } from '../services/tablesApi';
import type { Table, TableStatus, SeatPartyData } from '../types';

// ============================================
// QUERY KEYS
// ============================================

export const tablesKeys = {
  all: ['tables'] as const,
  lists: () => [...tablesKeys.all, 'list'] as const,
  list: (locationId?: string) => [...tablesKeys.lists(), { locationId }] as const,
  details: () => [...tablesKeys.all, 'detail'] as const,
  detail: (id: string) => [...tablesKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook to fetch all tables with their current party status
 * 
 * @param locationId - Optional location filter (for future multi-location support)
 */
export function useTables(locationId?: string) {
  return useQuery({
    queryKey: tablesKeys.list(locationId),
    queryFn: async () => {
      return await tablesApi.getTables();
    },
    staleTime: 30 * 1000,  // 30 seconds (tables status changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds
  });
}

/**
 * Hook to fetch a single table by ID
 * 
 * @param tableId - Table ID
 */
export function useTable(tableId: string) {
  return useQuery({
    queryKey: tablesKeys.detail(tableId),
    queryFn: async () => {
      return await tablesApi.getTable(tableId);
    },
    enabled: !!tableId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook to update table status
 */
export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId, status }: { tableId: string; status: TableStatus | string }) => {
      return await tablesApi.updateStatus(tableId, status);
    },
    onMutate: async ({ tableId, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: tablesKeys.detail(tableId) });
      await queryClient.cancelQueries({ queryKey: tablesKeys.lists() });

      // Snapshot previous values
      const previousTable = queryClient.getQueryData(tablesKeys.detail(tableId));
      const previousTables = queryClient.getQueryData(tablesKeys.list());

      // Optimistically update single table
      queryClient.setQueryData(tablesKeys.detail(tableId), (old: Table | undefined) => {
        if (!old) return old;
        return { ...old, status };
      });

      // Optimistically update tables list
      queryClient.setQueryData(tablesKeys.list(), (old: Table[] | undefined) => {
        if (!old) return old;
        return old.map(table => 
          table.id === tableId ? { ...table, status } : table
        );
      });

      return { previousTable, previousTables };
    },
    onError: (error, { tableId }, context) => {
      // Rollback on error
      if (context?.previousTable) {
        queryClient.setQueryData(tablesKeys.detail(tableId), context.previousTable);
      }
      if (context?.previousTables) {
        queryClient.setQueryData(tablesKeys.list(), context.previousTables);
      }
      logger.error('useUpdateTableStatus', 'Failed to update table status', error);
      notify.error({
        title: 'Error al actualizar mesa',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.detail(tableId) });
      queryClient.invalidateQueries({ queryKey: tablesKeys.lists() });
    },
  });
}

/**
 * Hook to seat a party at a table
 */
export function useSeatParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId, partyData }: { tableId: string; partyData: SeatPartyData }) => {
      return await tablesApi.seatParty(tableId, partyData);
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.detail(tableId) });
      queryClient.invalidateQueries({ queryKey: tablesKeys.lists() });
      notify.success({
        title: 'Mesa asignada',
        description: 'Grupo sentado correctamente'
      });
    },
    onError: (error) => {
      logger.error('useSeatParty', 'Failed to seat party', error);
      notify.error({
        title: 'Error al sentar grupo',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}

/**
 * Hook to release a table (end party)
 */
export function useReleaseTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId, partyId }: { tableId: string; partyId: string }) => {
      return await tablesApi.releaseTable(tableId, partyId);
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.detail(tableId) });
      queryClient.invalidateQueries({ queryKey: tablesKeys.lists() });
      notify.success({
        title: 'Mesa liberada',
        description: 'Mesa disponible nuevamente'
      });
    },
    onError: (error) => {
      logger.error('useReleaseTable', 'Failed to release table', error);
      notify.error({
        title: 'Error al liberar mesa',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}

/**
 * Hook to transfer a party to another table
 */
export function useTransferParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      fromTableId, 
      toTableId, 
      partyId 
    }: { 
      fromTableId: string; 
      toTableId: string; 
      partyId: string 
    }) => {
      return await tablesApi.transferParty(fromTableId, toTableId, partyId);
    },
    onSuccess: (_, { fromTableId, toTableId }) => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.detail(fromTableId) });
      queryClient.invalidateQueries({ queryKey: tablesKeys.detail(toTableId) });
      queryClient.invalidateQueries({ queryKey: tablesKeys.lists() });
      notify.success({
        title: 'Mesa transferida',
        description: 'Grupo movido correctamente'
      });
    },
    onError: (error) => {
      logger.error('useTransferParty', 'Failed to transfer party', error);
      notify.error({
        title: 'Error al transferir mesa',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    },
  });
}
