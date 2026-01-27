/**
 * useTables Hook
 * TanStack Query hook for restaurant table management
 * 
 * FEATURES:
 * - Real-time table status tracking
 * - Auto-refresh for active tables
 * - Table assignment and status updates
 * - Party management integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logging';
import { useAlerts } from '@/shared/alerts';
import * as tableApi from '../services/tableApi';
import { TableStatus } from '../types/pos';
import type { Table, ServiceStage } from '../types/pos';

export const TABLES_QUERY_KEY = ['tables'];
export const TABLE_QUERY_KEY = (id: string) => ['tables', id];

/**
 * Hook: Get all tables
 */
export function useTables() {
  const queryClient = useQueryClient();
  const { actions: alertActions } = useAlerts({
    context: 'sales',
    autoFilter: true,
  });

  // Fetch all tables with auto-refresh
  const { 
    data = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: TABLES_QUERY_KEY,
    queryFn: tableApi.fetchTables,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds for real-time updates
  });

  if (error) {
    logger.error('App', '❌ Error loading tables:', error);
  }

  // Update table status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      tableId, 
      status, 
      serviceStage 
    }: { 
      tableId: string; 
      status: TableStatus; 
      serviceStage?: ServiceStage;
    }) => {
      await tableApi.updateTableStatus(tableId, status, serviceStage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY });
      logger.info('App', '✅ Table status updated');
    },
    onError: (err: any) => {
      logger.error('App', '❌ Error updating table status:', err);
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Update Table',
        description: err.message,
        autoExpire: 10,
        intelligence_level: 'simple',
      });
    }
  });

  // Seat party mutation
  const seatPartyMutation = useMutation({
    mutationFn: async ({ 
      tableId, 
      partySize, 
      customerIds,
      customerName,
      specialRequests
    }: { 
      tableId: string; 
      partySize: number; 
      customerIds?: string[];
      customerName?: string;
      specialRequests?: string[];
    }) => {
      return await tableApi.seatParty(tableId, partySize, customerIds, customerName, specialRequests);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY });
      logger.info('App', '✅ Party seated at table');
    },
    onError: (err: any) => {
      logger.error('App', '❌ Error seating party:', err);
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'high',
        title: 'Failed to Seat Party',
        description: err.message,
        autoExpire: 10,
        intelligence_level: 'simple',
      });
    }
  });

  // Clear table mutation
  const clearTableMutation = useMutation({
    mutationFn: async ({ tableId, partyId, totalSpent }: { tableId: string; partyId: string; totalSpent?: number }) => {
      await tableApi.clearTable(tableId, partyId, totalSpent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY });
      logger.info('App', '✅ Table cleared');
    },
    onError: (err: any) => {
      logger.error('App', '❌ Error clearing table:', err);
    }
  });

  return {
    tables: data,
    isLoading,
    error: error as Error | null,
    refetch,
    updateStatus: (tableId: string, status: TableStatus, serviceStage?: ServiceStage) => 
      updateStatusMutation.mutateAsync({ tableId, status, serviceStage }),
    seatParty: (tableId: string, partySize: number, customerIds?: string[], customerName?: string, specialRequests?: string[]) => 
      seatPartyMutation.mutateAsync({ tableId, partySize, customerIds, customerName, specialRequests }),
    clearTable: (tableId: string, partyId: string, totalSpent?: number) => 
      clearTableMutation.mutateAsync({ tableId, partyId, totalSpent }),
  };
}

/**
 * Hook: Get single table by ID
 */
export function useTable(tableId: string) {
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: TABLE_QUERY_KEY(tableId),
    queryFn: () => tableApi.fetchTableById(tableId),
    staleTime: 20 * 1000, // 20 seconds
    refetchInterval: 20 * 1000, // Frequent refresh for active table
    enabled: !!tableId,
  });

  return {
    table: data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook: Get available tables
 */
export function useAvailableTables(minCapacity?: number) {
  const { tables, isLoading, error } = useTables();

  const availableTables = tables.filter(table => {
    const isAvailable = table.status === TableStatus.AVAILABLE;
    const meetsCapacity = minCapacity ? table.capacity >= minCapacity : true;
    return isAvailable && meetsCapacity;
  });

  return {
    tables: availableTables,
    isLoading,
    error,
  };
}
