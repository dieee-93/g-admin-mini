import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';

// Import types from suppliers module
import type { Supplier } from '@/pages/admin/supply-chain/suppliers/types/supplierTypes';

// Re-export Supplier for store/index.ts
export type { Supplier } from '@/pages/admin/supply-chain/suppliers/types/supplierTypes';

import { logger } from '@/lib/logging';

export interface SuppliersFilters {
  status: 'all' | 'active' | 'inactive';
  search: string;
  sortBy: 'name' | 'rating' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

export interface SuppliersState {
  // Data
  suppliers: Supplier[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: SuppliersFilters;
  selectedSuppliers: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentSupplier: Supplier | null;
  
  // Actions
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<SuppliersFilters>) => void;
  resetFilters: () => void;
  selectSupplier: (id: string) => void;
  deselectSupplier: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  openModal: (mode: 'add' | 'edit' | 'view', supplier?: Supplier) => void;
  closeModal: () => void;
  
  // Computed
  getFilteredSuppliers: () => Supplier[];
  getActiveSuppliers: () => Supplier[];
}

const initialFilters: SuppliersFilters = {
  status: 'all',
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useSuppliersStore = create<SuppliersState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        suppliers: [],
        loading: false,
        error: null,
        filters: initialFilters,
        selectedSuppliers: [],
        isModalOpen: false,
        modalMode: 'add',
        currentSupplier: null,

        // Actions
        setSuppliers: (suppliers) => {
          set(
            produce((state: SuppliersState) => {
              state.suppliers = suppliers.map((supplier) => ({
                ...supplier,
                updated_at: supplier.updated_at || new Date().toISOString(),
              }));
            })
          );
        },

        addSupplier: async (supplierData) => {
          try {
            set({ loading: true, error: null });

            // Import API dynamically
            const { suppliersApi } = await import(
              '@/pages/admin/supply-chain/suppliers/services/suppliersApi'
            );

            // Create supplier via API
            const createdSupplier = await suppliersApi.createSupplier(supplierData);

            // Add to local state
            set(
              produce((state: SuppliersState) => {
                state.suppliers.push(createdSupplier);
                state.loading = false;
              })
            );
          } catch (error) {
            logger.error('App', 'Error adding supplier:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Error al crear proveedor',
            });
            throw error;
          }
        },

        updateSupplier: async (id, updates) => {
          const { suppliers } = get();
          const originalSupplier = suppliers.find((s) => s.id === id);

          if (!originalSupplier) {
            const error = new Error('Proveedor no encontrado para actualizar.');
            logger.error('App', error.message);
            set({ error: error.message });
            throw error;
          }

          set({ loading: true, error: null });

          try {
            // Import API dynamically
            const { suppliersApi } = await import(
              '@/pages/admin/supply-chain/suppliers/services/suppliersApi'
            );

            // Update via API
            const updatedSupplier = await suppliersApi.updateSupplier(id, updates);

            // Update local state
            set(
              produce((state: SuppliersState) => {
                const index = state.suppliers.findIndex((s) => s.id === id);
                if (index !== -1) {
                  state.suppliers[index] = updatedSupplier;
                }
                state.loading = false;
              })
            );
          } catch (error) {
            logger.error('App', 'Error updating supplier:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Error al actualizar proveedor',
            });
            throw error;
          }
        },

        deleteSupplier: async (id) => {
          try {
            set({ loading: true, error: null });

            // Import API dynamically
            const { suppliersApi } = await import(
              '@/pages/admin/supply-chain/suppliers/services/suppliersApi'
            );

            // Check for associated materials first
            const hasAssociatedMaterials = await suppliersApi.hasAssociatedMaterials(id);

            if (hasAssociatedMaterials) {
              throw new Error(
                'No se puede eliminar el proveedor porque tiene materiales asociados. Desactívalo en su lugar.'
              );
            }

            // Delete via API
            await suppliersApi.deleteSupplier(id);

            // Remove from local state
            set(
              produce((state: SuppliersState) => {
                state.suppliers = state.suppliers.filter((s) => s.id !== id);
                state.selectedSuppliers = state.selectedSuppliers.filter((sid) => sid !== id);
                state.loading = false;
              })
            );
          } catch (error) {
            logger.error('App', 'Error deleting supplier:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Error al eliminar proveedor',
            });
            throw error;
          }
        },

        // UI Actions
        setLoading: (loading) => set({ loading }),

        setError: (error) => set({ error }),

        setFilters: (filters) =>
          set(
            produce((state: SuppliersState) => {
              state.filters = { ...state.filters, ...filters };
            })
          ),

        resetFilters: () =>
          set(
            produce((state: SuppliersState) => {
              state.filters = initialFilters;
            })
          ),

        selectSupplier: (id) =>
          set(
            produce((state: SuppliersState) => {
              if (!state.selectedSuppliers.includes(id)) {
                state.selectedSuppliers.push(id);
              }
            })
          ),

        deselectSupplier: (id) =>
          set(
            produce((state: SuppliersState) => {
              state.selectedSuppliers = state.selectedSuppliers.filter((sid) => sid !== id);
            })
          ),

        selectAll: () => {
          const { suppliers } = get();
          set({ selectedSuppliers: suppliers.map((s) => s.id) });
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

        // Computed
        getFilteredSuppliers: () => {
          const { suppliers, filters } = get();

          let filtered = [...suppliers];

          // Filter by status
          if (filters.status !== 'all') {
            const isActive = filters.status === 'active';
            filtered = filtered.filter((s) => s.is_active === isActive);
          }

          // Filter by search
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(
              (s) =>
                s.name.toLowerCase().includes(search) ||
                s.contact_person?.toLowerCase().includes(search) ||
                s.email?.toLowerCase().includes(search)
            );
          }

          // Sort
          filtered.sort((a, b) => {
            const aVal = a[filters.sortBy];
            const bVal = b[filters.sortBy];

            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return filters.sortOrder === 'asc' ? comparison : -comparison;
          });

          return filtered;
        },

        getActiveSuppliers: () => {
          const { suppliers } = get();
          return suppliers.filter((s) => s.is_active);
        },
      }),
      {
        name: 'suppliers-store',
        // Only persist data, not UI state
        partialize: (state) => ({
          suppliers: state.suppliers,
          filters: state.filters,
        }),
      }
    ),
    { name: 'SuppliersStore' }
  )
);
