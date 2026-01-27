/**
 * CUSTOMERS STORE
 * 
 * ✅ MIGRATED TO TANSTACK QUERY PATTERN
 * 
 * This store now only handles UI state following TanStack Query best practices:
 * - Server state (customers[], stats) → TanStack Query (@/hooks/useCustomers)
 * - UI state (modals, filters, selections) → Zustand (this file)
 * 
 * MIGRATION CONTEXT:
 * - Date: December 2025
 * - Reason: Fix infinite loops + architecture compliance
 * - Reference: Cash Module pattern
 * 
 * @see src/hooks/useCustomers.ts - TanStack Query hooks for server state
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 * @see ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md - Architecture guide
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { type Customer } from '@/pages/admin/core/crm/customers/types/customer';

export interface CustomerFilters {
  search: string;
  status: 'all' | Customer['status'];
  loyalty_tier: 'all' | Customer['loyalty_tier'];
  sortBy: 'name' | 'total_spent' | 'last_order' | 'created';
  sortOrder: 'asc' | 'desc';
}

// ============================================
// UI STATE (Zustand only)
// ============================================

export interface CustomersState {
  // ❌ REMOVED: customers[], stats → use TanStack Query hooks
  
  // ✅ UI State only
  filters: CustomerFilters;
  selectedCustomers: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentCustomer: Customer | null;

  // UI Actions
  setFilters: (filters: Partial<CustomerFilters>) => void;
  resetFilters: () => void;
  selectCustomer: (id: string) => void;
  deselectCustomer: (id: string) => void;
  selectAllCustomers: (allIds: string[]) => void;
  deselectAllCustomers: () => void;
  openModal: (mode: 'add' | 'edit' | 'view', customer?: Customer) => void;
  closeModal: () => void;
}

const initialFilters: CustomerFilters = {
  search: '',
  status: 'all',
  loyalty_tier: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

// ============================================
// STORE
// ============================================

export const useCustomersStore = create<CustomersState>()(
  devtools(
    persist(
      (set) => ({
        // Initial UI state
        filters: initialFilters,
        selectedCustomers: [],
        isModalOpen: false,
        modalMode: 'add',
        currentCustomer: null,

        // UI Actions
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          }));
        },

        resetFilters: () => {
          set({ filters: initialFilters });
        },

        selectCustomer: (id) => {
          set((state) => ({
            selectedCustomers: state.selectedCustomers.includes(id)
              ? state.selectedCustomers
              : [...state.selectedCustomers, id],
          }));
        },

        deselectCustomer: (id) => {
          set((state) => ({
            selectedCustomers: state.selectedCustomers.filter(selectedId => selectedId !== id),
          }));
        },

        selectAllCustomers: (allIds) => {
          set({ selectedCustomers: allIds });
        },

        deselectAllCustomers: () => {
          set({ selectedCustomers: [] });
        },

        openModal: (mode, customer) => {
          set({
            isModalOpen: true,
            modalMode: mode,
            currentCustomer: customer ?? null,
          });
        },

        closeModal: () => {
          set({
            isModalOpen: false,
            currentCustomer: null,
          });
        },
      }),
      {
        name: 'customers-storage',
        // Only persist UI preferences
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    { name: 'CustomersStore' }
  )
);
