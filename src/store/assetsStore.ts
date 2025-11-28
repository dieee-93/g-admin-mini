/**
 * ASSETS ZUSTAND STORE
 * State management for asset management module
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import type {
  Asset,
  AssetFilters,
  AssetMetrics,
  AssetCategory,
} from '@/pages/admin/supply-chain/assets/types';
import { logger } from '@/lib/logging';

export interface AssetsState {
  // Data
  items: Asset[];
  categories: AssetCategory[];

  // UI State
  loading: boolean;
  error: string | null;
  filters: AssetFilters;
  selectedItems: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentItem: Asset | null;

  // Stats
  stats: AssetMetrics;

  // Actions
  setItems: (items: Asset[]) => void;
  addItem: (item: Asset) => void;
  updateItem: (id: string, updates: Partial<Asset>) => void;
  deleteItem: (id: string) => void;

  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<AssetFilters>) => void;
  resetFilters: () => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  openModal: (mode: 'add' | 'edit' | 'view', item?: Asset) => void;
  closeModal: () => void;

  // Computed
  refreshStats: () => void;
  getFilteredItems: () => Asset[];
  getAvailableAssets: () => Asset[];
  getRentableAssets: () => Asset[];
  getMaintenanceDue: (days: number) => Asset[];
}

const initialFilters: AssetFilters = {
  search: '',
};

const initialStats: AssetMetrics = {
  total_assets: 0,
  available_count: 0,
  in_use_count: 0,
  maintenance_count: 0,
  rented_count: 0,
  total_value: 0,
  rentable_count: 0,
  maintenance_due_soon: 0,
};

export const useAssetsStore = create<AssetsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        items: [],
        categories: ['equipment', 'vehicle', 'tool', 'furniture', 'electronics'],
        loading: false,
        error: null,
        filters: initialFilters,
        selectedItems: [],
        isModalOpen: false,
        modalMode: 'add',
        currentItem: null,
        stats: initialStats,

        // Actions
        setItems: (items) => {
          set({ items });
          get().refreshStats();
        },

        addItem: (item) => {
          set(
            produce((state) => {
              state.items.push(item);
            })
          );
          get().refreshStats();
          logger.info('AssetsStore', 'Asset added', { assetId: item.id });
        },

        updateItem: (id, updates) => {
          set(
            produce((state) => {
              const index = state.items.findIndex((item) => item.id === id);
              if (index !== -1) {
                state.items[index] = { ...state.items[index], ...updates };
              }
            })
          );
          get().refreshStats();
          logger.info('AssetsStore', 'Asset updated', { assetId: id });
        },

        deleteItem: (id) => {
          set(
            produce((state) => {
              state.items = state.items.filter((item) => item.id !== id);
            })
          );
          get().refreshStats();
          logger.info('AssetsStore', 'Asset deleted', { assetId: id });
        },

        // UI Actions
        setLoading: (loading) => set({ loading }),

        setError: (error) => set({ error }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),

        resetFilters: () => set({ filters: initialFilters }),

        selectItem: (id) =>
          set(
            produce((state) => {
              if (!state.selectedItems.includes(id)) {
                state.selectedItems.push(id);
              }
            })
          ),

        deselectItem: (id) =>
          set(
            produce((state) => {
              state.selectedItems = state.selectedItems.filter((itemId) => itemId !== id);
            })
          ),

        selectAll: () => set({ selectedItems: get().items.map((item) => item.id) }),

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

        // Computed
        refreshStats: () => {
          const items = get().items;

          const available_count = items.filter((a) => a.status === 'available').length;
          const in_use_count = items.filter((a) => a.status === 'in_use').length;
          const maintenance_count = items.filter((a) => a.status === 'maintenance').length;
          const rented_count = items.filter((a) => a.currently_rented).length;
          const rentable_count = items.filter((a) => a.is_rentable).length;

          const total_value = items.reduce(
            (sum, a) => sum + (a.current_value || a.purchase_price || 0),
            0
          );

          // Count assets with maintenance due in next 7 days
          const today = new Date();
          const week_from_now = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          const maintenance_due_soon = items.filter((a) => {
            if (!a.next_maintenance_date) return false;
            const due_date = new Date(a.next_maintenance_date);
            return due_date >= today && due_date <= week_from_now;
          }).length;

          set({
            stats: {
              total_assets: items.length,
              available_count,
              in_use_count,
              maintenance_count,
              rented_count,
              total_value,
              rentable_count,
              maintenance_due_soon,
            },
          });
        },

        getFilteredItems: () => {
          const { items, filters } = get();
          let filtered = [...items];

          // Apply filters
          if (filters.status?.length) {
            filtered = filtered.filter((item) => filters.status!.includes(item.status));
          }

          if (filters.category?.length) {
            filtered = filtered.filter((item) => filters.category!.includes(item.category));
          }

          if (filters.condition?.length) {
            filtered = filtered.filter((item) => filters.condition!.includes(item.condition));
          }

          if (filters.is_rentable !== undefined) {
            filtered = filtered.filter((item) => item.is_rentable === filters.is_rentable);
          }

          if (filters.currently_rented !== undefined) {
            filtered = filtered.filter(
              (item) => item.currently_rented === filters.currently_rented
            );
          }

          if (filters.assigned_to) {
            filtered = filtered.filter((item) => item.assigned_to === filters.assigned_to);
          }

          if (filters.search) {
            const query = filters.search.toLowerCase();
            filtered = filtered.filter(
              (item) =>
                item.name.toLowerCase().includes(query) ||
                item.asset_code.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query)
            );
          }

          return filtered;
        },

        getAvailableAssets: () => {
          return get().items.filter((item) => item.status === 'available');
        },

        getRentableAssets: () => {
          return get().items.filter(
            (item) =>
              item.is_rentable &&
              !item.currently_rented &&
              ['available', 'in_use'].includes(item.status)
          );
        },

        getMaintenanceDue: (days = 30) => {
          const items = get().items;
          const cutoff_date = new Date();
          cutoff_date.setDate(cutoff_date.getDate() + days);

          return items.filter((asset) => {
            if (!asset.next_maintenance_date) return false;
            const due_date = new Date(asset.next_maintenance_date);
            return due_date <= cutoff_date;
          });
        },
      }),
      {
        name: 'assets-storage',
        partialize: (state) => ({
          filters: state.filters,
        }),
      }
    )
  )
);
