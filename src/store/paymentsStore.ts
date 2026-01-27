/**
 * Payments Store - UI State Only
 * 
 * ⚠️ DEPRECATED FOR SERVER DATA
 * Server state has been migrated to TanStack Query hooks:
 * - Payment methods → usePaymentMethods() in finance-integrations/hooks
 * - Payment gateways → usePaymentGateways() in finance-integrations/hooks
 * 
 * This store is kept ONLY for UI state (filters, selections, view modes, etc.)
 * 
 * @deprecated Use TanStack Query hooks for server data
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================
// UI STATE ONLY
// ============================================

export interface PaymentsFilters {
  search: string;
  activeOnly: boolean;
  type: 'all' | 'methods' | 'gateways';
}

export interface PaymentsState {
  // UI State - Filters
  filters: PaymentsFilters;
  
  // UI State - Selections
  selectedMethodId: string | null;
  selectedGatewayId: string | null;
  
  // UI State - View modes
  viewMode: 'grid' | 'list';
  showInactive: boolean;

  // Actions
  setFilters: (filters: Partial<PaymentsFilters>) => void;
  resetFilters: () => void;
  setSelectedMethodId: (id: string | null) => void;
  setSelectedGatewayId: (id: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleShowInactive: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialFilters: PaymentsFilters = {
  search: '',
  activeOnly: false,
  type: 'all',
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const usePaymentsStore = create<PaymentsState>()(
  devtools(
    (set) => ({
      // Initial UI state
      filters: initialFilters,
      selectedMethodId: null,
      selectedGatewayId: null,
      viewMode: 'grid',
      showInactive: false,

      // Actions
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      resetFilters: () => set({ filters: initialFilters }),

      setSelectedMethodId: (id) => set({ selectedMethodId: id }),

      setSelectedGatewayId: (id) => set({ selectedGatewayId: id }),

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleShowInactive: () => set((state) => ({ showInactive: !state.showInactive })),
    }),
    { name: 'PaymentsStore' }
  )
);
