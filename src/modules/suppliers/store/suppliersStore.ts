/**
 * SUPPLIERS STORE
 * 
 * ✅ MIGRATED TO TANSTACK QUERY PATTERN
 * 
 * This store now only handles UI state following TanStack Query best practices:
 * - Server state (suppliers[]) → TanStack Query (@/hooks/useSuppliers)
 * - UI state (modals, filters, selections) → Zustand (this file)
 * 
 * MIGRATION CONTEXT:
 * - Date: December 2025
 * - Reason: Fix infinite loops + architecture compliance
 * - Reference: Cash Module pattern
 * 
 * @see src/hooks/useSuppliers.ts - TanStack Query hooks for server state
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 * @see ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md - Architecture guide
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Import types from suppliers module
import type { Supplier } from '@/pages/admin/supply-chain/suppliers/types/supplierTypes';

// Re-export Supplier for store/index.ts
export type { Supplier } from '@/pages/admin/supply-chain/suppliers/types/supplierTypes';

export interface SuppliersFilters {
  status: 'all' | 'active' | 'inactive';
  search: string;
  sortBy: 'name' | 'rating' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

// ============================================
// UI STATE (Zustand only)
// ============================================

export interface SuppliersState {
  // ❌ REMOVED: suppliers[] → use TanStack Query hooks
  
  // ✅ UI State only
  filters: SuppliersFilters;
  selectedSuppliers: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentSupplier: Supplier | null;
  
  // UI Actions
  setFilters: (filters: Partial<SuppliersFilters>) => void;
  resetFilters: () => void;
  selectSupplier: (id: string) => void;
  deselectSupplier: (id: string) => void;
  selectAll: (allIds: string[]) => void;
  deselectAll: () => void;
  openModal: (mode: 'add' | 'edit' | 'view', supplier?: Supplier) => void;
  closeModal: () => void;
}

const initialFilters: SuppliersFilters = {
  status: 'all',
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

// ============================================
// STORE
// ============================================

export const useSuppliersStore = create<SuppliersState>()(
  devtools(
    persist(
      (set) => ({
        // Initial UI state
        filters: initialFilters,
        selectedSuppliers: [],
        isModalOpen: false,
        modalMode: 'add',
        currentSupplier: null,

        // UI Actions
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        resetFilters: () =>
          set({
            filters: initialFilters,
          }),

        selectSupplier: (id) =>
          set((state) => ({
            selectedSuppliers: state.selectedSuppliers.includes(id)
              ? state.selectedSuppliers
              : [...state.selectedSuppliers, id],
          })),

        deselectSupplier: (id) =>
          set((state) => ({
            selectedSuppliers: state.selectedSuppliers.filter((sid) => sid !== id),
          })),

        selectAll: (allIds) => {
          set({ selectedSuppliers: allIds });
        },

        deselectAll: () => set({ selectedSuppliers: [] }),

        openModal: (mode, supplier) =>
          set({
            isModalOpen: true,
            modalMode: mode,
            currentSupplier: supplier || null,
          }),

        closeModal: () =>
          set({
            isModalOpen: false,
            modalMode: 'add',
            currentSupplier: null,
          }),
      }),
      {
        name: 'suppliers-storage',
        // Only persist UI preferences
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    { name: 'SuppliersStore' }
  )
);
