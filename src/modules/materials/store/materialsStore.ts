/**
 * MATERIALS MODULE - UI STATE STORE
 * 
 * Zustand store for materials module UI state ONLY.
 * 
 * ⚠️ CRITICAL RULES:
 * - NO server data (materials list, stock levels, etc.) - Use TanStack Query
 * - ONLY UI state (modals, filters, selections, view modes)
 * - NO localStorage for server data
 * 
 * Server data should be managed by TanStack Query hooks in:
 * - src/modules/materials/hooks/useMaterials.ts (future)
 * 
 * @see docs/solutions/ZUSTAND_STATE_MANAGEMENT_SOLUTIONS.md
 * @module materials/store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '@/lib/logging';

// ============================================================================
// TYPES
// ============================================================================

export type MaterialsViewMode = 'grid' | 'table' | 'cards';
export type MaterialsTab = 'inventory' | 'analytics' | 'procurement' | 'transfers';

export interface MaterialsFilters {
  searchTerm: string;
  category: string | null;
  type: string | null;
  supplier: string | null;
  stockStatus: 'all' | 'ok' | 'low' | 'critical' | 'out';
  lowStockOnly: boolean;
  activeOnly: boolean;
  sortBy: 'name' | 'stock' | 'value' | 'category' | 'supplier';
  sortOrder: 'asc' | 'desc';
}

export interface MaterialsUIState {
  // ============================================================================
  // VIEW STATE (UI only)
  // ============================================================================
  
  activeTab: MaterialsTab;
  viewMode: MaterialsViewMode;
  
  // ============================================================================
  // FILTERS (UI state for filtering)
  // ============================================================================
  
  filters: MaterialsFilters;
  
  // ============================================================================
  // MODALS (UI state)
  // ============================================================================
  
  modals: {
    materialForm: {
      isOpen: boolean;
      mode: 'create' | 'edit' | null;
      materialId: string | null;
    };
    transferForm: {
      isOpen: boolean;
      transferId: string | null;
    };
    abcAnalysis: {
      isOpen: boolean;
    };
    procurement: {
      isOpen: boolean;
    };
    supplyChain: {
      isOpen: boolean;
    };
  };
  
  // ============================================================================
  // SELECTIONS (UI state for bulk operations)
  // ============================================================================
  
  bulkMode: boolean;
  selectedMaterialIds: string[];
  
  // ============================================================================
  // ACTIONS
  // ============================================================================
  
  // Tab & View
  setActiveTab: (tab: MaterialsTab) => void;
  setViewMode: (mode: MaterialsViewMode) => void;
  
  // Filters
  setFilter: <K extends keyof MaterialsFilters>(
    key: K,
    value: MaterialsFilters[K]
  ) => void;
  setFilters: (filters: Partial<MaterialsFilters>) => void;
  resetFilters: () => void;
  
  // Modals
  openMaterialForm: (mode: 'create' | 'edit', materialId?: string) => void;
  closeMaterialForm: () => void;
  openTransferForm: (transferId?: string) => void;
  closeTransferForm: () => void;
  openABCAnalysis: () => void;
  closeABCAnalysis: () => void;
  openProcurement: () => void;
  closeProcurement: () => void;
  openSupplyChain: () => void;
  closeSupplyChain: () => void;
  
  // Bulk Operations
  toggleBulkMode: () => void;
  selectMaterial: (materialId: string) => void;
  deselectMaterial: (materialId: string) => void;
  selectAllMaterials: (materialIds: string[]) => void;
  clearSelection: () => void;
  
  // Utility
  reset: () => void;
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const DEFAULT_FILTERS: MaterialsFilters = {
  searchTerm: '',
  category: null,
  type: null,
  supplier: null,
  stockStatus: 'all',
  lowStockOnly: false,
  activeOnly: true,
  sortBy: 'name',
  sortOrder: 'asc',
};

const INITIAL_STATE = {
  activeTab: 'inventory' as MaterialsTab,
  viewMode: 'table' as MaterialsViewMode,
  filters: DEFAULT_FILTERS,
  modals: {
    materialForm: { isOpen: false, mode: null, materialId: null },
    transferForm: { isOpen: false, transferId: null },
    abcAnalysis: { isOpen: false },
    procurement: { isOpen: false },
    supplyChain: { isOpen: false },
  },
  bulkMode: false,
  selectedMaterialIds: [],
};

// ============================================================================
// STORE
// ============================================================================

export const useMaterialsStore = create<MaterialsUIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        // ========================================================================
        // TAB & VIEW ACTIONS
        // ========================================================================

        setActiveTab: (tab) => {
          logger.debug('MaterialsStore', 'Changing active tab', { tab });
          set({ activeTab: tab });
        },

        setViewMode: (mode) => {
          logger.debug('MaterialsStore', 'Changing view mode', { mode });
          set({ viewMode: mode });
        },

        // ========================================================================
        // FILTER ACTIONS
        // ========================================================================

        setFilter: (key, value) => {
          logger.debug('MaterialsStore', 'Setting filter', { key, value });
          set((state) => ({
            filters: {
              ...state.filters,
              [key]: value,
            },
          }));
        },

        setFilters: (newFilters) => {
          // logger.debug('MaterialsStore', 'Setting multiple filters', newFilters);
          set((state) => ({
            filters: {
              ...state.filters,
              ...newFilters,
            },
          }));
        },

        resetFilters: () => {
          logger.debug('MaterialsStore', 'Resetting filters');
          set({ filters: DEFAULT_FILTERS });
        },

        // ========================================================================
        // MODAL ACTIONS
        // ========================================================================

        openMaterialForm: (mode, materialId) => {
          logger.debug('MaterialsStore', 'Opening material form', { mode, materialId });
          set((state) => ({
            modals: {
              ...state.modals,
              materialForm: {
                isOpen: true,
                mode,
                materialId: materialId || null,
              },
            },
          }));
        },

        closeMaterialForm: () => {
          logger.debug('MaterialsStore', 'Closing material form');
          set((state) => ({
            modals: {
              ...state.modals,
              materialForm: {
                isOpen: false,
                mode: null,
                materialId: null,
              },
            },
          }));
        },

        openTransferForm: (transferId) => {
          logger.debug('MaterialsStore', 'Opening transfer form', { transferId });
          set((state) => ({
            modals: {
              ...state.modals,
              transferForm: {
                isOpen: true,
                transferId: transferId || null,
              },
            },
          }));
        },

        closeTransferForm: () => {
          logger.debug('MaterialsStore', 'Closing transfer form');
          set((state) => ({
            modals: {
              ...state.modals,
              transferForm: {
                isOpen: false,
                transferId: null,
              },
            },
          }));
        },

        openABCAnalysis: () => {
          logger.debug('MaterialsStore', 'Opening ABC analysis');
          set((state) => ({
            modals: {
              ...state.modals,
              abcAnalysis: { isOpen: true },
            },
          }));
        },

        closeABCAnalysis: () => {
          logger.debug('MaterialsStore', 'Closing ABC analysis');
          set((state) => ({
            modals: {
              ...state.modals,
              abcAnalysis: { isOpen: false },
            },
          }));
        },

        openProcurement: () => {
          logger.debug('MaterialsStore', 'Opening procurement');
          set((state) => ({
            modals: {
              ...state.modals,
              procurement: { isOpen: true },
            },
          }));
        },

        closeProcurement: () => {
          logger.debug('MaterialsStore', 'Closing procurement');
          set((state) => ({
            modals: {
              ...state.modals,
              procurement: { isOpen: false },
            },
          }));
        },

        openSupplyChain: () => {
          logger.debug('MaterialsStore', 'Opening supply chain');
          set((state) => ({
            modals: {
              ...state.modals,
              supplyChain: { isOpen: true },
            },
          }));
        },

        closeSupplyChain: () => {
          logger.debug('MaterialsStore', 'Closing supply chain');
          set((state) => ({
            modals: {
              ...state.modals,
              supplyChain: { isOpen: false },
            },
          }));
        },

        // ========================================================================
        // BULK OPERATIONS
        // ========================================================================

        toggleBulkMode: () => {
          const newBulkMode = !get().bulkMode;
          logger.debug('MaterialsStore', 'Toggling bulk mode', { bulkMode: newBulkMode });
          set({
            bulkMode: newBulkMode,
            selectedMaterialIds: newBulkMode ? get().selectedMaterialIds : [],
          });
        },

        selectMaterial: (materialId) => {
          const current = get().selectedMaterialIds;
          if (!current.includes(materialId)) {
            logger.debug('MaterialsStore', 'Selecting material', { materialId });
            set({ selectedMaterialIds: [...current, materialId] });
          }
        },

        deselectMaterial: (materialId) => {
          logger.debug('MaterialsStore', 'Deselecting material', { materialId });
          set({
            selectedMaterialIds: get().selectedMaterialIds.filter((id) => id !== materialId),
          });
        },

        selectAllMaterials: (materialIds) => {
          logger.debug('MaterialsStore', 'Selecting all materials', { count: materialIds.length });
          set({ selectedMaterialIds: materialIds });
        },

        clearSelection: () => {
          logger.debug('MaterialsStore', 'Clearing selection');
          set({ selectedMaterialIds: [] });
        },

        // ========================================================================
        // UTILITY
        // ========================================================================

        reset: () => {
          logger.info('MaterialsStore', 'Resetting store to initial state');
          set(INITIAL_STATE);
        },
      }),
      {
        name: 'materials-store',
        // Only persist UI preferences (not transient state like selections)
        partialize: (state) => ({
          activeTab: state.activeTab,
          viewMode: state.viewMode,
          filters: {
            ...state.filters,
            searchTerm: '', // Don't persist search term
          },
        }),
      }
    ),
    { name: 'MaterialsStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Selector: Get active filters count
 */
export const useActiveFiltersCount = () => {
  return useMaterialsStore((state) => {
    const { searchTerm, category, type, supplier, lowStockOnly, activeOnly } = state.filters;
    let count = 0;
    if (searchTerm) count++;
    if (category) count++;
    if (type) count++;
    if (supplier) count++;
    if (lowStockOnly) count++;
    if (!activeOnly) count++; // activeOnly is default true, so !activeOnly is a filter
    return count;
  });
};

/**
 * Selector: Check if material is selected
 */
export const useIsMaterialSelected = (materialId: string) => {
  return useMaterialsStore((state) => state.selectedMaterialIds.includes(materialId));
};

/**
 * Selector: Get selected materials count
 */
export const useSelectedMaterialsCount = () => {
  return useMaterialsStore((state) => state.selectedMaterialIds.length);
};

logger.debug('MaterialsStore', 'Store module loaded');
