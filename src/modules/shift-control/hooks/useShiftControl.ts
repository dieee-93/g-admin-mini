/**
 * useShiftControl Hook
 *
 * Main hook for shift control operations
 * Provides shift state, actions, and computed values
 *
 * @module shift-control/hooks
 * @version 2.2 - Fixed TypeScript any types and useEffect dependencies
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useShiftStore } from '../store/shiftStore';
import { useBusinessProfile } from '@/lib/capabilities';
import * as shiftService from '../services/shiftService';
import { getAllActiveSessions } from '@/modules/accounting/services/cashSessionService';
import eventBus from '@/lib/events/EventBus';
import { logger } from '@/lib/logging/Logger';
import type { CashSessionRow } from '@/modules/accounting/types';
import type {
  OperationalShift,
  OpenShiftData,
  CloseShiftData,
  ShiftUIState,
  StockAlert,
  ShiftAlert,
} from '../types';

const MODULE_ID = 'ShiftControl';

export interface UseShiftControlReturn {
  // State
  currentShift: OperationalShift | null;
  shifts: OperationalShift[];
  activeShiftId: string | null;
  uiState: ShiftUIState;
  isOperational: boolean;

  // Indicators
  cashSession: CashSessionRow | null;
  activeStaffCount: number;
  openTablesCount: number;
  activeDeliveriesCount: number;
  pendingOrdersCount: number;
  stockAlerts: StockAlert[];
  alerts: ShiftAlert[];

  // Location info
  locationName: string | null;

  // Computed
  shiftDuration: number | null; // minutes
  totalShiftAmount: string; // formatted currency string
  paymentMethods: Array<{ method: string; amount: string; percentage: number }>;

  // Actions
  openShift: (data: Omit<OpenShiftData, 'opened_by'>) => Promise<void>;
  closeShift: (data: Omit<CloseShiftData, 'closed_by'>) => Promise<void>;
  forceCloseShift: (data: Omit<CloseShiftData, 'closed_by'>) => Promise<void>;
  refreshShift: () => Promise<void>;
  setUIState: (state: ShiftUIState) => void;
  dismissAlert: (alertId: string) => void;
  clearAlerts: () => void;

  // Loading/Error
  loading: boolean;
  error: string | null;
}

/**
 * Main hook for shift control operations
 */
export function useShiftControl(): UseShiftControlReturn {
  const { user } = useAuth();
  const { selectedLocation } = useLocation();

  // ✅ MIGRATED: Get businessId from useBusinessProfile (TanStack Query)
  const { profile } = useBusinessProfile();
  const businessId = profile?.businessId;

  // ✅ Multi-location: Get locationId from LocationContext
  const locationId = selectedLocation?.id;

  const userId = user?.id;

  // Local loading state (for async operations)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get state from Zustand store
  const {
    shifts,
    activeShiftId,
    uiState,
    cashSession,
    activeStaffCount,
    openTablesCount,
    activeDeliveriesCount,
    pendingOrdersCount,
    stockAlerts,
    alerts,

    // Store actions
    setShifts,
    addShift,
    setActiveShiftId,
    setUIState,
    setCashSession,
    dismissAlert,
    clearAlerts,
    getCurrentShift,
    isOperational,
  } = useShiftStore();

  const currentShift = getCurrentShift();
  const operational = isOperational();
  
  // ✅ Computed values from service layer (not store)
  const shiftDuration = useMemo(() => 
    shiftService.calculateShiftDuration(currentShift), 
    [currentShift]
  );
  
  const totalShiftAmount = useMemo(() => 
    shiftService.calculateTotalShiftAmount(currentShift), 
    [currentShift]
  );
  
  const paymentMethods = useMemo(() => 
    shiftService.calculatePaymentMethodsBreakdown(currentShift), 
    [currentShift]
  );

  // ============================================
  // LOAD ACTIVE SHIFT ON MOUNT
  // ============================================

  useEffect(() => {
    if (!businessId) return;

    const loadActiveShift = async () => {
      try {
        setLoading(true);
        setError(null);
        // ✅ Multi-location: pass locationId to filter by location
        const activeShift = await shiftService.getActiveShift(businessId, locationId);

        if (activeShift) {
          setShifts([activeShift]);
          setActiveShiftId(activeShift.id);
          setUIState('SHIFT_ACTIVE');

          logger.info(MODULE_ID, 'Active shift loaded', {
            shiftId: activeShift.id,
            openedAt: activeShift.opened_at,
          });
        } else {
          setUIState('NO_SHIFT');
          logger.debug(MODULE_ID, 'No active shift found');
        }
      } catch (error) {
        logger.error(MODULE_ID, 'Failed to load active shift', { error });
        setError('Error al cargar el turno activo');
      } finally {
        setLoading(false);
      }
    };

    loadActiveShift();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, locationId]); // Re-fetch when location changes

  // ============================================
  // LOAD CASH SESSIONS WHEN OPERATIONAL + EVENT SUBSCRIPTIONS
  // ============================================

  useEffect(() => {
    if (!operational) {
      // Clear cash session when no active shift
      setCashSession(null);
      return;
    }

    // Initial load
    const loadCashSessions = async () => {
      try {
        const activeSessions = await getAllActiveSessions();
        if (activeSessions.length > 0) {
          setCashSession(activeSessions[0]);
          logger.debug(MODULE_ID, 'Cash session loaded', {
            sessionId: activeSessions[0].id,
            sessionsCount: activeSessions.length,
          });
        } else {
          setCashSession(null);
          logger.debug(MODULE_ID, 'No active cash sessions found');
        }
      } catch (error) {
        logger.error(MODULE_ID, 'Failed to load cash sessions', { error });
        setCashSession(null);
      }
    };

    loadCashSessions();

    // ✅ Event-driven: Subscribe to cash session events for real-time updates
    const unsubscribeOpened = eventBus.on('cash.session.opened', async () => {
      logger.info(MODULE_ID, 'Cash session opened event received');
      // Reload active sessions to get the new one
      const sessions = await getAllActiveSessions();
      if (sessions.length > 0) {
        setCashSession(sessions[0]);
      }
    });

    const unsubscribeClosed = eventBus.on('cash.session.closed', () => {
      logger.info(MODULE_ID, 'Cash session closed event received');
      // Clear the session if the closed one matches current
      setCashSession(null);
      // Could reload to check if there are others open
    });

    // Cleanup: unsubscribe when unmounted or operational changes
    return () => {
      unsubscribeOpened();
      unsubscribeClosed();
      logger.debug(MODULE_ID, 'Unsubscribed from cash session events');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operational]);

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Open a new shift
   */
  const openShift = useCallback(
    async (data: Omit<OpenShiftData, 'opened_by'>) => {
      if (!businessId || !userId) {
        throw new Error('Business ID or User ID not available');
      }

      try {
        setLoading(true);
        setUIState('OPENING_MODAL');

        const shiftData: OpenShiftData = {
          ...data,
          opened_by: userId,
        };

        // ✅ Multi-location: pass locationId to create shift for current location
        const newShift = await shiftService.openShift(shiftData, businessId, locationId);

        addShift(newShift);
        setUIState('SHIFT_ACTIVE');

        logger.info(MODULE_ID, 'Shift opened successfully', {
          shiftId: newShift.id,
        });
      } catch (error) {
        logger.error(MODULE_ID, 'Failed to open shift', { error });
        setError('Error al abrir el turno');
        setUIState('NO_SHIFT');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [businessId, userId, locationId, addShift, setUIState, setError]
  );

  /**
   * Close the current shift
   */
  const closeShift = useCallback(
    async (data: Omit<CloseShiftData, 'closed_by'>) => {
      if (!activeShiftId || !userId) {
        throw new Error('No active shift or User ID not available');
      }

      try {
        setLoading(true);
        setUIState('CLOSING');

        const closeData: CloseShiftData = {
          ...data,
          closed_by: userId,
        };

        const closedShift = await shiftService.closeShift(activeShiftId, closeData);

        // Update shift in store
        const updatedShifts = shifts.map(s =>
          s.id === closedShift.id ? closedShift : s
        );
        setShifts(updatedShifts);
        setActiveShiftId(null);
        setUIState('SHIFT_CLOSED');

        logger.info(MODULE_ID, 'Shift closed successfully', {
          shiftId: closedShift.id,
        });

        // Auto-transition to NO_SHIFT after 2 seconds
        setTimeout(() => {
          setUIState('NO_SHIFT');
        }, 2000);
      } catch (error) {
        logger.error(MODULE_ID, 'Failed to close shift', { error });
        setError('Error al cerrar el turno');
        setUIState('CLOSING_MODAL');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [activeShiftId, userId, shifts, setShifts, setActiveShiftId, setUIState, setError]
  );

  /**
   * Force close the current shift (admin override)
   */
  const forceCloseShift = useCallback(
    async (data: Omit<CloseShiftData, 'closed_by'>) => {
      if (!activeShiftId || !userId) {
        throw new Error('No active shift or User ID not available');
      }

      try {
        setLoading(true);
        setUIState('CLOSING');

        const closeData: CloseShiftData = {
          ...data,
          closed_by: userId,
          force_close: true,
        };

        const closedShift = await shiftService.forceCloseShift(activeShiftId, closeData);

        // Update shift in store
        const updatedShifts = shifts.map(s =>
          s.id === closedShift.id ? closedShift : s
        );
        setShifts(updatedShifts);
        setActiveShiftId(null);
        setUIState('SHIFT_CLOSED');

        logger.warn(MODULE_ID, 'Shift force closed (admin override)', {
          shiftId: closedShift.id,
        });

        // Auto-transition to NO_SHIFT after 2 seconds
        setTimeout(() => {
          setUIState('NO_SHIFT');
        }, 2000);
      } catch (error) {
        logger.error(MODULE_ID, 'Failed to force close shift', { error });
        setError('Error al forzar el cierre del turno');
        setUIState('CLOSING_MODAL');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [activeShiftId, userId, shifts, setShifts, setActiveShiftId, setUIState, setError]
  );

  /**
   * Refresh current shift data
   */
  const refreshShift = useCallback(async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      const activeShift = await shiftService.getActiveShift(businessId);

      if (activeShift) {
        const updatedShifts = shifts.map(s =>
          s.id === activeShift.id ? activeShift : s
        );
        setShifts(updatedShifts);

        logger.debug(MODULE_ID, 'Shift refreshed', {
          shiftId: activeShift.id,
        });
      }
    } catch (error) {
      logger.error(MODULE_ID, 'Failed to refresh shift', { error });
    } finally {
      setLoading(false);
    }
  }, [businessId, shifts, setShifts]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    currentShift,
    shifts,
    activeShiftId,
    uiState,
    isOperational: operational,

    // Indicators
    cashSession,
    activeStaffCount,
    openTablesCount,
    activeDeliveriesCount,
    pendingOrdersCount,
    stockAlerts,
    alerts,

    // Location info
    locationName: selectedLocation?.name ?? null,

    // Computed
    shiftDuration,
    totalShiftAmount,
    paymentMethods,

    // Actions
    openShift,
    closeShift,
    forceCloseShift,
    refreshShift,
    setUIState,
    dismissAlert,
    clearAlerts,

    // Loading/Error
    loading: loading,
    error: error,
  };
}
