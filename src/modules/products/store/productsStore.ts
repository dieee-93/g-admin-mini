/**
 * Products Store - Client State Only
 * Manages UI-specific state (filters, modals, selections)
 * 
 * ✅ NO server data (products list)
 * ✅ NO loading/error states
 * ✅ Only synchronous UI state
 * 
 * Pattern: Following ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md
 * Reference: Cash Module UI Store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export type ViewMode = 'grid' | 'table' | 'cards';
export type ActiveTab = 'products' | 'analytics' | 'cost-analysis';

export interface ProductFilters {
  hasRecipe?: boolean;
  requiresBooking?: boolean;
  isDigital?: boolean;
  search?: string;
  isPublished?: boolean;
  productType?: 'ELABORATED' | 'SERVICE' | 'DIGITAL';
}

export interface ProductsState {
  // View State
  activeTab: ActiveTab;
  viewMode: ViewMode;
  
  // Filters
  filters: ProductFilters;
  
  // Selection
  selectedProductId: string | null;
  
  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  selectProduct: (id: string | null) => void;
}

// ============================================
// STORE
// ============================================

export const useProductsStore = create<ProductsState>()(
  devtools(
    (set) => ({
      // Initial State
      activeTab: 'products',
      viewMode: 'cards',
      filters: {},
      selectedProductId: null,

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setFilters: (newFilters) => 
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      
      clearFilters: () => set({ filters: {} }),
      
      selectProduct: (id) => set({ selectedProductId: id }),
    }),
    { name: 'ProductsStore' }
  )
);

// ============================================
// ATOMIC SELECTORS
// ============================================

export const useActiveTab = () => useProductsStore((state) => state.activeTab);
export const useViewMode = () => useProductsStore((state) => state.viewMode);
export const useProductFilters = () => useProductsStore((state) => state.filters);
export const useSelectedProductId = () => useProductsStore((state) => state.selectedProductId);
export const useProductsActions = () => useProductsStore((state) => ({
  setActiveTab: state.setActiveTab,
  setViewMode: state.setViewMode,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  selectProduct: state.selectProduct,
}));
