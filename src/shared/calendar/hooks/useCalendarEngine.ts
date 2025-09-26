/**
 * CALENDAR ENGINE HOOK - G-ADMIN MINI v3.0
 *
 * Hook for managing the unified calendar engine
 * Provides access to calendar functionality and business model adaptation
 *
 * @version 3.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UnifiedCalendarEngine } from '../engine/UnifiedCalendarEngine';
import {
  CalendarConfig,
  DateRange,
  TimeSlot,
  Booking,
  Resource,
  CalendarEvent,
  CalendarEventType
} from '../types/DateTimeTypes';
import { getUserTimezone } from '../utils/dateTimeUtils';

// ===============================
// HOOK INTERFACES
// ===============================

/**
 * Engine state
 */
interface EngineState {
  engine: UnifiedCalendarEngine | null;
  isReady: boolean;
  loading: boolean;
  error: string | null;
  stats: {
    totalBookings: number;
    totalResources: number;
    activeBookings: number;
  };
}

/**
 * Engine actions
 */
interface EngineActions {
  initializeEngine: (businessModel: string, config?: CalendarConfig) => Promise<void>;
  resetEngine: () => void;
  getEngine: () => UnifiedCalendarEngine | null;
  refreshStats: () => Promise<void>;
}

// ===============================
// MAIN HOOK
// ===============================

/**
 * Hook for managing the unified calendar engine
 */
export function useCalendarEngine(): EngineState & EngineActions {
  const [state, setState] = useState<EngineState>({
    engine: null,
    isReady: false,
    loading: false,
    error: null,
    stats: {
      totalBookings: 0,
      totalResources: 0,
      activeBookings: 0
    }
  });

  // Initialize engine
  const initializeEngine = useCallback(async (businessModel: string, config?: CalendarConfig) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const engine = new UnifiedCalendarEngine();

      // Initialize with default config if not provided
      const defaultConfig: CalendarConfig = config || {
        businessModel,
        timezone: getUserTimezone(),
        businessHours: {
          timezone: getUserTimezone(),
          workingDays: [],
          holidays: [],
          specialHours: []
        },
        bookingRules: {
          minAdvanceBooking: 60,
          maxAdvanceBooking: 43200,
          allowCancellation: true,
          cancellationDeadline: 1440,
          cancellationFee: 0,
          minDuration: 30,
          maxDuration: 480,
          slotIncrement: 30,
          bufferTime: 15,
          requiresApproval: false,
          requiresDeposit: false,
          allowsRecurring: false,
          maxConcurrentBookings: 10,
          requiresStaffAssignment: false,
          requiresCustomerInfo: true,
          requiresPayment: false
        },
        enabledFeatures: ['basic_booking'],
        metadata: {}
      };

      await engine.initialize(defaultConfig);

      setState(prev => ({
        ...prev,
        engine,
        isReady: true,
        loading: false,
        stats: {
          totalBookings: 0,
          totalResources: 0,
          activeBookings: 0
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize engine'
      }));
    }
  }, []);

  // Reset engine
  const resetEngine = useCallback(() => {
    setState({
      engine: null,
      isReady: false,
      loading: false,
      error: null,
      stats: {
        totalBookings: 0,
        totalResources: 0,
        activeBookings: 0
      }
    });
  }, []);

  // Get engine instance
  const getEngine = useCallback(() => {
    return state.engine;
  }, [state.engine]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    if (!state.engine) return;

    try {
      const stats = state.engine.getEngineStatus();
      setState(prev => ({
        ...prev,
        stats: {
          totalBookings: stats?.totalBookings || 0,
          totalResources: stats?.totalResources || 0,
          activeBookings: stats?.activeBookings || 0
        }
      }));
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, [state.engine]);

  return useMemo(() => ({
    ...state,
    initializeEngine,
    resetEngine,
    getEngine,
    refreshStats
  }), [state, initializeEngine, resetEngine, getEngine, refreshStats]);
}

// ===============================
// CONVENIENCE HOOKS
// ===============================

/**
 * Hook that returns only the ready state of the engine
 */
export function useCalendarEngineReady(): boolean {
  const { isReady } = useCalendarEngine();
  return isReady;
}

/**
 * Hook that returns only the stats from the engine
 */
export function useCalendarEngineStats() {
  const { stats, refreshStats } = useCalendarEngine();
  return { stats, refreshStats };
}