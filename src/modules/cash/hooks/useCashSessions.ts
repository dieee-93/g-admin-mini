/**
 * useCashSessions - React Query Hooks
 * 
 * ✅ TanStack Query hooks para Cash Sessions (server state)
 * Reemplaza el patrón anterior de Zustand store con server data
 * 
 * Features:
 * - Queries: Active session, session history
 * - Mutations: Open session, close session
 * - Auto invalidation on mutations
 * - Optimistic updates
 * 
 * @see CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import {
  getActiveCashSession,
  fetchCashSessionHistory,
  openCashSession as openSessionService,
  closeCashSession as closeSessionService,
} from '../services/cashSessionService';
import type {
  CashSessionRow,
  OpenCashSessionInput,
  CloseCashSessionInput,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS (Centralized for invalidation)
// ─────────────────────────────────────────────────────────────────────────────

export const cashSessionsKeys = {
  all: ['cash', 'sessions'] as const,
  active: (locationId?: string) => [...cashSessionsKeys.all, 'active', locationId] as const,
  history: (locationId?: string) => [...cashSessionsKeys.all, 'history', locationId] as const,
  detail: (sessionId: string) => [...cashSessionsKeys.all, 'detail', sessionId] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener sesión activa de una ubicación
 * 
 * @param moneyLocationId - ID de la ubicación (opcional)
 * @example
 * ```tsx
 * const { data: activeSession } = useActiveCashSession('loc-123');
 * ```
 */
export function useActiveCashSession(moneyLocationId?: string) {
  return useQuery({
    queryKey: cashSessionsKeys.active(moneyLocationId),
    queryFn: async () => {
      if (!moneyLocationId) return null;
      
      logger.info('CashModule', 'Fetching active cash session', { moneyLocationId });
      return await getActiveCashSession(moneyLocationId);
    },
    enabled: !!moneyLocationId,
    staleTime: 2 * 60 * 1000,  // 2 min - sessions change frequently
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 min in background
  });
}

/**
 * Hook para obtener historial de sesiones
 * 
 * @param moneyLocationId - ID de la ubicación (opcional)
 * @param options - Opciones de filtrado
 * @example
 * ```tsx
 * const { data: history } = useCashSessionHistory('loc-123');
 * ```
 */
export function useCashSessionHistory(
  moneyLocationId?: string,
  options?: {
    limit?: number;
    offset?: number;
  }
) {
  return useQuery({
    queryKey: cashSessionsKeys.history(moneyLocationId),
    queryFn: async () => {
      logger.info('CashModule', 'Fetching cash session history', { 
        moneyLocationId,
        ...options 
      });
      
      return await fetchCashSessionHistory({ 
        moneyLocationId,
        ...options 
      });
    },
    staleTime: 5 * 60 * 1000,  // 5 min - history less critical
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook para abrir nueva sesión de caja
 * 
 * @example
 * ```tsx
 * const openMutation = useOpenCashSession();
 * 
 * await openMutation.mutateAsync({
 *   money_location_id: 'loc-123',
 *   starting_cash: 1000,
 *   opening_notes: 'Apertura turno mañana',
 * });
 * ```
 */
export function useOpenCashSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: OpenCashSessionInput) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      logger.info('CashModule', 'Opening cash session', { input });
      return await openSessionService(input, user.id);
    },
    
    onSuccess: (session) => {
      // Invalidate active session query
      queryClient.invalidateQueries({ 
        queryKey: cashSessionsKeys.active(session.money_location_id) 
      });
      
      // Invalidate history
      queryClient.invalidateQueries({ 
        queryKey: cashSessionsKeys.history(session.money_location_id) 
      });

      notify.success({
        title: 'Caja abierta',
        description: `Sesión iniciada con $${session.starting_cash}`
      });

      logger.info('CashModule', 'Cash session opened successfully', {
        sessionId: session.id,
        locationId: session.money_location_id
      });
    },
    
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Error al abrir sesión de caja';
      
      notify.error({
        title: 'Error al abrir caja',
        description: message
      });
      
      logger.error('CashModule', 'Failed to open cash session', { error });
    },
  });
}

/**
 * Hook para cerrar sesión de caja
 * 
 * @example
 * ```tsx
 * const closeMutation = useCloseCashSession();
 * 
 * await closeMutation.mutateAsync({
 *   sessionId: 'session-123',
 *   input: {
 *     actual_cash: 1500,
 *     closing_notes: 'Cierre turno mañana',
 *   }
 * });
 * ```
 */
export function useCloseCashSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      input 
    }: { 
      sessionId: string; 
      input: CloseCashSessionInput 
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      logger.info('CashModule', 'Closing cash session', { sessionId, input });
      return await closeSessionService(sessionId, input, user.id);
    },
    
    onMutate: async ({ sessionId }) => {
      // Cancel outgoing refetches to prevent optimistic update overwrites
      await queryClient.cancelQueries({ queryKey: cashSessionsKeys.all });

      // Snapshot previous value for rollback
      const previousSessions = queryClient.getQueryData(cashSessionsKeys.active());
      
      return { previousSessions };
    },
    
    onSuccess: (session) => {
      // Invalidate all session queries
      queryClient.invalidateQueries({ 
        queryKey: cashSessionsKeys.active(session.money_location_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: cashSessionsKeys.history(session.money_location_id) 
      });

      // Show appropriate notification based on status
      if (session.status === 'DISCREPANCY') {
        notify.warning({
          title: 'Caja cerrada con diferencia',
          description: `Diferencia: $${Math.abs(session.variance || 0)}`
        });
      } else {
        notify.success({
          title: 'Caja cerrada correctamente'
        });
      }

      logger.info('CashModule', 'Cash session closed successfully', {
        sessionId: session.id,
        status: session.status,
        variance: session.variance
      });
    },
    
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(
          cashSessionsKeys.active(), 
          context.previousSessions
        );
      }

      const message = error instanceof Error ? error.message : 'Error al cerrar sesión de caja';
      
      notify.error({
        title: 'Error al cerrar caja',
        description: message
      });
      
      logger.error('CashModule', 'Failed to close cash session', { error });
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: cashSessionsKeys.all });
    },
  });
}
