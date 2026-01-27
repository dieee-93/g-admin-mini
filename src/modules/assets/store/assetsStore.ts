/**
 * ASSETS STORE
 * 
 * ✅ MIGRATED TO TANSTACK QUERY PATTERN
 * 
 * This store now only handles UI state following TanStack Query best practices:
 * - Server state (items[], stats) → TanStack Query (@/hooks/useAssets)
 * - UI state (modals, filters, selections) → Zustand (this file)
 * 
 * MIGRATION CONTEXT:
 * - Date: December 2025
 * - Reason: Fix infinite loops + architecture compliance
 * - Reference: Cash Module pattern
 * 
 * @see src/hooks/useAssets.ts - TanStack Query hooks for server state
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 * @see ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md - Architecture guide
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Asset,
  AssetFilters,
} from '@/pages/admin/supply-chain/assets/types';

// ============================================
// UI STATE (Zustand only)
// ============================================

export interface AssetsState {
  // ❌ REMOVED: items[], categories[], stats → use TanStack Query hooks
  
  // ✅ UI State only
  filters: AssetFilters;
  selectedItems: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentItem: Asset | null;

  // UI Actions
  setFilters: (filters: Partial<AssetFilters>) => void;
  resetFilters: () => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (allIds: string[]) => void;
  deselectAll: () => void;
  openModal: (mode: 'add' | 'edit' | 'view', item?: Asset) => void;
  closeModal: () => void;
}

const initialFilters: AssetFilters = {
  search: '',
};

// ============================================
// STORE
// ============================================

export const useAssetsStore = create<AssetsState>()(
  devtools(
    persist(
      (set) => ({
        // Initial UI state
        filters: initialFilters,
        selectedItems: [],
        isModalOpen: false,
        modalMode: 'add',
        currentItem: null,

        // UI Actions
        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        resetFilters: () => set({ filters: initialFilters }),

        selectItem: (id) => {
          set((state) => ({
            selectedItems: state.selectedItems.includes(id)
              ? state.selectedItems
              : [...state.selectedItems, id]
          }));
        },

        deselectItem: (id) => {
          set((state) => ({
            selectedItems: state.selectedItems.filter((itemId) => itemId !== id)
          }));
        },

        selectAll: (allIds) => set({ selectedItems: allIds }),

        deselectAll: () => set({ selectedItems: [] }),

        openModal: (mode, item) =>
          set({
            isModalOpen: true,
            modalMode: mode,
            currentItem: item || null,
          }),

        closeModal: () =>
          set({
            isModalOpen: false,
            currentItem: null,
          }),
      }),
      {
        name: 'assets-storage',
        // Only persist UI preferences
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    ),
    { name: 'AssetsStore' }
  )
);
