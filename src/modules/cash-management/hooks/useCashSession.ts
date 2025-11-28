/**
 * useCashSession Hook
 *
 * Hook for cash session management with Zustand store integration.
 * Provides reactive state for active cash sessions and mutation functions
 * for opening/closing sessions.
 *
 * @module cash-management/hooks/useCashSession
 */

import { useState, useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging/Logger';
import { notify } from '@/lib/notifications';
import { useCashStore } from '@/store/cashStore';
import {
  openCashSession as openCashSessionService,
  closeCashSession as closeCashSessionService,
} from '@/modules/cash/services/cashSessionService';
import type {
  CashSessionRow,
  OpenCashSessionInput,
  CloseCashSessionInput,
} from '@/modules/cash/types';

/**
 * Return type for useCashSession hook
 */
export interface UseCashSessionReturn {
  /** Active cash session (first one if multiple exist) */
  activeCashSession: CashSessionRow | null;

  /** All active sessions */
  activeSessions: CashSessionRow[];

  /** Store loading state */
  loading: boolean;

  /** Store error state */
  error: string | null;

  /** Open a new cash session */
  openCashSession: (input: OpenCashSessionInput) => Promise<CashSessionRow>;

  /** Close an active cash session */
  closeCashSession: (sessionId: string, input: CloseCashSessionInput) => Promise<CashSessionRow>;

  /** Loading state for open mutation */
  isOpening: boolean;

  /** Loading state for close mutation */
  isClosing: boolean;
}

/**
 * Hook for cash session management
 *
 * Provides:
 * - Active cash session (from Zustand store)
 * - Open session mutation with loading state
 * - Close session mutation with loading state
 *
 * @example
 * ```tsx
 * import { ModuleRegistry } from '@/lib/modules';
 *
 * async function MyComponent() {
 *   const registry = ModuleRegistry.getInstance();
 *   const cashModule = registry.getExports('cash-management');
 *   const { useCashSession } = await cashModule.hooks.useCashSession();
 *
 *   const { activeCashSession, openCashSession, closeCashSession, isOpening } = useCashSession();
 *
 *   await openCashSession({
 *     money_location_id: 'loc-123',
 *     starting_cash: 5000
 *   });
 * }
 * ```
 */
export function useCashSession(): UseCashSessionReturn {
  const { user } = useAuth();

  // ============================================
  // ZUSTAND STORE SUBSCRIPTIONS (Data Slice)
  // ============================================

  /**
   * Subscribe to store data using useShallow for stable references
   * Only re-renders when activeSessions or loading changes
   */
  const { activeSessions, loading: storeLoading } = useCashStore(
    useShallow((state) => ({
      activeSessions: state.activeSessions,
      loading: state.loading,
    }))
  );

  // ============================================
  // ZUSTAND STORE SUBSCRIPTIONS (Actions Slice)
  // ============================================

  /**
   * Subscribe to store actions using useShallow
   * Actions are stable (won't cause re-renders)
   */
  const storeActions = useCashStore(
    useShallow((state) => ({
      addSession: state.addSession,
      updateSession: state.updateSession,
      setLoading: state.setLoading,
      setError: state.setError,
    }))
  );

  // ============================================
  // COMPUTED STATE
  // ============================================

  /**
   * Get first active session (or null)
   * Memoized to avoid re-creating object on every render
   */
  const activeCashSession = useMemo(() => {
    return activeSessions[0] || null;
  }, [activeSessions]);

  // ============================================
  // LOCAL STATE (Mutation Loading States)
  // ============================================

  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Open a new cash session
   *
   * @param input - Session opening parameters
   * @returns The created cash session
   * @throws Error if user is not authenticated or service fails
   */
  const openCashSession = useCallback(
    async (input: OpenCashSessionInput): Promise<CashSessionRow> => {
      if (!user?.id) {
        notify.error({ title: 'Usuario no autenticado' });
        throw new Error('User not authenticated');
      }

      try {
        setIsOpening(true);
        logger.info('CashModule', 'Opening cash session', { input });

        const session = await openCashSessionService(input, user.id);

        // Update Zustand store
        storeActions.addSession(session);

        notify.success({
          title: 'Caja abierta',
          description: `Sesión iniciada con $${session.starting_cash}`
        });

        logger.info('CashModule', 'Cash session opened successfully', {
          sessionId: session.id
        });

        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al abrir sesión de caja';

        notify.error({
          title: 'Error al abrir caja',
          description: message
        });

        logger.error('CashModule', 'Failed to open cash session', { error });

        throw error;
      } finally {
        setIsOpening(false);
      }
    },
    [user?.id, storeActions]
  );

  /**
   * Close an active cash session
   *
   * @param sessionId - ID of the session to close
   * @param input - Session closing parameters (actual cash, notes)
   * @returns The closed cash session
   * @throws Error if user is not authenticated or service fails
   */
  const closeCashSession = useCallback(
    async (sessionId: string, input: CloseCashSessionInput): Promise<CashSessionRow> => {
      if (!user?.id) {
        notify.error({ title: 'Usuario no autenticado' });
        throw new Error('User not authenticated');
      }

      try {
        setIsClosing(true);
        logger.info('CashModule', 'Closing cash session', { sessionId, input });

        const session = await closeCashSessionService(sessionId, input, user.id);

        // Update Zustand store
        storeActions.updateSession(sessionId, session);

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

        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al cerrar sesión de caja';

        notify.error({
          title: 'Error al cerrar caja',
          description: message
        });

        logger.error('CashModule', 'Failed to close cash session', { error });

        throw error;
      } finally {
        setIsClosing(false);
      }
    },
    [user?.id, storeActions]
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    activeCashSession,
    activeSessions,
    loading: storeLoading,
    error: null, // TODO: Implement error handling from store

    // Actions
    openCashSession,
    closeCashSession,

    // Loading states
    isOpening,
    isClosing,
  };
}
