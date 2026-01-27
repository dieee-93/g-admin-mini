/**
 * Operations Store - UI State Only
 * 
 * ⚠️ DEPRECATED FOR SERVER DATA
 * Server state has been migrated to TanStack Query hooks:
 * - Operating hours → useOperatingHours() in fulfillment/onsite/hooks
 * - Tables → useTables() in fulfillment/onsite/hooks
 * - Delivery zones → useDeliveryZones() in fulfillment/delivery/hooks
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

export interface OperationsState {
  // UI State - Filters
  selectedView: 'hours' | 'tables' | 'zones';
  filterStatus: 'all' | 'active' | 'inactive';
  searchQuery: string;

  // UI State - Selections
  selectedTableId: string | null;
  selectedZoneId: string | null;

  // UI State - View modes
  tableViewMode: 'grid' | 'list';
  zoneViewMode: 'map' | 'list';

  // Actions
  setSelectedView: (view: 'hours' | 'tables' | 'zones') => void;
  setFilterStatus: (status: 'all' | 'active' | 'inactive') => void;
  setSearchQuery: (query: string) => void;
  setSelectedTableId: (id: string | null) => void;
  setSelectedZoneId: (id: string | null) => void;
  setTableViewMode: (mode: 'grid' | 'list') => void;
  setZoneViewMode: (mode: 'map' | 'list') => void;
  resetFilters: () => void;
}

// ============================================
// STORE
// ============================================

export const useOperationsStore = create<OperationsState>()(
  devtools(
    (set) => ({
      // Initial UI state
      selectedView: 'hours',
      filterStatus: 'all',
      searchQuery: '',
      selectedTableId: null,
      selectedZoneId: null,
      tableViewMode: 'grid',
      zoneViewMode: 'map',

      // Actions
      setSelectedView: (view) => set({ selectedView: view }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTableId: (id) => set({ selectedTableId: id }),
      setSelectedZoneId: (id) => set({ selectedZoneId: id }),
      setTableViewMode: (mode) => set({ tableViewMode: mode }),
      setZoneViewMode: (mode) => set({ zoneViewMode: mode }),
      resetFilters: () => set({
        filterStatus: 'all',
        searchQuery: '',
        selectedTableId: null,
        selectedZoneId: null,
      }),
    }),
    { name: 'OperationsStore' }
  )
);