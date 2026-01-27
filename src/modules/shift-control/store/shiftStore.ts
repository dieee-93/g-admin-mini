/**
 * ShiftControl Store - Zustand State Management
 *
 * Event-driven state management for operational shifts
 * Follows project patterns from cashStore.ts
 *
 * ✅ OPTIMIZED: No produce/immer - uses spread operators and map/filter
 * ✅ OPTIMIZED: Atomic selectors to prevent unnecessary re-renders
 * ✅ OPTIMIZED: Persist strategy for recovery
 *
 * @module shift-control/store
 * @version 2.2 - Fixed TypeScript any types
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '@/lib/logging';
import { DecimalUtils } from '@/lib/decimal';
import type { CashSessionRow } from '@/modules/cash/types';
import type {
  OperationalShift,
  ShiftUIState,
  ShiftAlert,
  StockAlert,
} from '../types';

// ============================================
// STORE STATE INTERFACE
// ============================================

export interface ShiftStoreState {
  // Multiple shifts (array, not single)
  shifts: OperationalShift[];
  activeShiftId: string | null;

  // UI state (NOT persisted)
  uiState: ShiftUIState;

  // Indicators (updated by event handlers)
  cashSession: CashSessionRow | null;
  activeStaffCount: number;
  openTablesCount: number;
  activeDeliveriesCount: number;
  pendingOrdersCount: number;
  stockAlerts: StockAlert[];

  // Alerts
  alerts: ShiftAlert[];

  // Actions - Data
  setShifts: (shifts: OperationalShift[]) => void;
  addShift: (shift: OperationalShift) => void;
  updateShift: (id: string, updates: Partial<OperationalShift>) => void;
  setActiveShiftId: (id: string | null) => void;

  // Actions - UI State
  setUIState: (state: ShiftUIState) => void;

  // Actions - Indicators
  setCashSession: (session: CashSessionRow | null) => void;
  setActiveStaffCount: (count: number) => void;
  incrementActiveStaffCount: () => void;
  decrementActiveStaffCount: () => void;
  setOpenTablesCount: (count: number) => void;
  setActiveDeliveriesCount: (count: number) => void;
  setPendingOrdersCount: (count: number) => void;
  setStockAlerts: (alerts: StockAlert[]) => void;

  // Actions - Alerts
  addAlert: (alert: Omit<ShiftAlert, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;

  // Computed
  getCurrentShift: () => OperationalShift | null;
  isOperational: () => boolean;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useShiftStore = create<ShiftStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        shifts: [],
        activeShiftId: null,
        uiState: 'NO_SHIFT',

        // Indicators
        cashSession: null,
        activeStaffCount: 0,
        openTablesCount: 0,
        activeDeliveriesCount: 0,
        pendingOrdersCount: 0,
        stockAlerts: [],

        // Alerts
        alerts: [],

        // ========================================
        // ACTIONS - DATA
        // ========================================

        // ✅ Fixed: Uses direct object replacement (no mutation)
        setShifts: (shifts) => {
          set({ shifts });
        },

        // ✅ Fixed: Uses spread operator for array immutability
        addShift: (shift) => {
          set((state) => ({
            shifts: [...state.shifts, shift],
            activeShiftId: shift.id,
            uiState: 'SHIFT_ACTIVE',
          }));
          logger.info('ShiftStore', 'Shift added', { shiftId: shift.id });
        },

        // ✅ Fixed: Uses map for immutable array update
        updateShift: (id, updates) => {
          set((state) => ({
            shifts: state.shifts.map(s =>
              s.id === id ? { ...s, ...updates } : s
            )
          }));
        },

        setActiveShiftId: (id) => {
          set({ activeShiftId: id });
        },

        // ========================================
        // ACTIONS - UI STATE
        // ========================================

        setUIState: (uiState) => {
          set({ uiState });
        },

        // ========================================
        // ACTIONS - INDICATORS
        // ========================================

        setCashSession: (cashSession) => {
          set({ cashSession });
          logger.debug('ShiftStore', 'Cash session updated', {
            hasSession: !!cashSession
          });
        },

        setActiveStaffCount: (activeStaffCount) => {
          set({ activeStaffCount });
        },

        incrementActiveStaffCount: () => {
          set((state) => ({
            activeStaffCount: state.activeStaffCount + 1
          }));
        },

        decrementActiveStaffCount: () => {
          set((state) => ({
            activeStaffCount: Math.max(0, state.activeStaffCount - 1)
          }));
        },

        setOpenTablesCount: (openTablesCount) => {
          set({ openTablesCount });
        },

        setActiveDeliveriesCount: (activeDeliveriesCount) => {
          set({ activeDeliveriesCount });
        },

        setPendingOrdersCount: (pendingOrdersCount) => {
          set({ pendingOrdersCount });
        },

        setStockAlerts: (stockAlerts) => {
          set({ stockAlerts });
        },

        // ========================================
        // ACTIONS - ALERTS
        // ========================================

        addAlert: (alertData) => {
          const alert: ShiftAlert = {
            ...alertData,
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            alerts: [...state.alerts, alert]
          }));
        },

        dismissAlert: (id) => {
          set((state) => ({
            alerts: state.alerts.filter(a => a.id !== id)
          }));
        },

        clearAlerts: () => {
          set({ alerts: [] });
        },

        // ========================================
        // COMPUTED
        // ========================================

        getCurrentShift: () => {
          const { shifts, activeShiftId } = get();
          return shifts.find(s => s.id === activeShiftId) || null;
        },

        isOperational: () => {
          const shift = get().getCurrentShift();
          return shift !== null && shift.status === 'active';
        },
      }),
      {
        name: 'g-mini-shift-storage',
        partialize: (state) => ({
          // Only persist shifts and activeShiftId for recovery
          shifts: state.shifts,
          activeShiftId: state.activeShiftId,
          // Don't persist indicators, alerts, or UI state
        }),
      }
    )
  )
);
