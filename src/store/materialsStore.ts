import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';

// Import types from materials module
import {
  type MaterialItem,
  type MeasurableItem,
  type CountableItem,
  type ElaboratedItem,
  type ItemType,
  type ItemFormData,
  type InventoryStats,
  isMeasurable,
  isCountable,
  isElaborated
} from '@/pages/admin/supply-chain/materials/types';

// Import centralized utilities
import { StockCalculation } from '@/business-logic/inventory/stockCalculation'; 
export interface MaterialsFilters {
  type: 'all' | ItemType;
  category: 'all' | string; // Business category filter (e.g., "Lácteos", "Carnes")
  stockStatus: 'all' | 'ok' | 'low' | 'critical' | 'out';
  search: string;
  priceRange: [number, number];
  location: string;
  sortBy: 'name' | 'stock' | 'type' | 'unit_cost' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  hasRecipe?: boolean; // Para items elaborados
}

export interface MaterialsState {
  // Data
  items: MaterialItem[];
  categories: string[];
  itemTypes: ItemType[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: MaterialsFilters;
  selectedItems: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentItem: MaterialItem | null;
  
  // Stats & Alerts
  stats: InventoryStats;
  
  // Actions
  setItems: (items: MaterialItem[]) => void;
  addItem: (itemData: ItemFormData) => void;
  updateItem: (id: string, updates: Partial<MaterialItem>) => void;
  deleteItem: (id: string) => void;
  bulkUpdateStock: (updates: Array<{ id: string; stock: number }>) => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<MaterialsFilters>) => void;
  resetFilters: () => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  openModal: (mode: 'add' | 'edit' | 'view', item?: MaterialItem) => void;
  closeModal: () => void;
  
  // Computed
  refreshStats: () => void;
  getFilteredItems: () => MaterialItem[];
  getLowStockItems: () => MaterialItem[];
  getCriticalStockItems: () => MaterialItem[];
  getItemsByType: () => Record<ItemType, MaterialItem[]>;
  getMeasurableItems: () => MeasurableItem[];
  getCountableItems: () => CountableItem[];
  getElaboratedItems: () => ElaboratedItem[];
}

const initialFilters: MaterialsFilters = {
  type: 'all',
  category: 'all',
  stockStatus: 'all',
  search: '',
  priceRange: [0, 1000000],
  location: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  hasRecipe: undefined
};

const initialStats: InventoryStats = {
  totalItems: 0,
  totalValue: 0,
  lowStockItems: 0,
  outOfStockItems: 0,
  recentMovements: 0,
  measurableItems: 0,
  countableItems: 0,
  elaboratedItems: 0,
  valueByCategory: {
    measurable: 0,
    countable: 0,
    elaborated: 0
  }
};


export const useMaterialsStore = create<MaterialsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        categories: ['Sin categoría', 'Lácteos', 'Carnes', 'Verduras', 'Frutas', 'Condimentos', 'Bebidas', 'Panadería'],
        itemTypes: ['MEASURABLE', 'COUNTABLE', 'ELABORATED'],
        
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
          set(produce((state: MaterialsState) => {
            state.items = items.map(item => ({
              ...item,
              updated_at: item.updated_at || new Date().toISOString()
            }));
          }));
          get().refreshStats();
          
        },

        addItem: async (itemData) => {
          try {
            set({ loading: true, error: null });

            // Import normalizer for type mapping
            const { MaterialsNormalizer } = await import('@/pages/admin/supply-chain/materials/services/materialsNormalizer');

            // Map TypeScript type to API type
            const apiType = MaterialsNormalizer.mapItemTypeToApiType(itemData.type, itemData.category);

            // Map business category to technical category for DB constraint
            const technicalCategory = MaterialsNormalizer.mapBusinessCategoryToTechnicalCategory(
              itemData.type, 
              itemData.unit
            );

            // Prepare item for API with proper type mapping
            const apiItem = {
              name: itemData.name,
              type: apiType, // ✅ Now using properly mapped type
              unit: itemData.unit,
              stock: 0, // 🎯 FIX: Always start with 0, let stock entry trigger handle initial stock
              unit_cost: itemData.unit_cost || 0,
              // Use technical category for DB constraint, store business category separately
              ...(technicalCategory && { category: technicalCategory }),
              // TODO: Store business category in a separate field when we add it to schema
              // business_category: itemData.category,
              // Add type-specific fields
              ...(itemData.packaging && {
                package_size: itemData.packaging.package_size,
                package_unit: itemData.packaging.package_unit,
                package_cost: itemData.packaging.package_cost,
                display_mode: itemData.packaging.display_mode
              }),
              ...(itemData.recipe_id && { recipe_id: itemData.recipe_id }),
              ...(itemData.requires_production !== undefined && { requires_production: itemData.requires_production }),
              ...(itemData.auto_calculate_cost !== undefined && { auto_calculate_cost: itemData.auto_calculate_cost }),
              // Add missing required fields with defaults
              min_stock: 0,
              precision_digits: 2
            };

            // Add to database using inventoryApi
            const { inventoryApi } = await import('@/pages/admin/supply-chain/materials/services/inventoryApi');
            const createdItem = await inventoryApi.createItem(apiItem);

            // Handle supplier and stock entry creation if supplier data provided
            if (itemData.supplier && (itemData.initial_stock || 0) > 0) {
              const { suppliersApi } = await import('@/pages/admin/supply-chain/materials/services/suppliersApi');
              
              let supplierId: string | undefined = itemData.supplier.supplier_id;
              
              // Create new supplier if needed
              if (!supplierId && itemData.supplier.new_supplier) {
                const newSupplier = await suppliersApi.createSupplierFromForm(itemData.supplier.new_supplier);
                supplierId = newSupplier.id;
              }
              
              // Create stock entry with purchase information
              if (supplierId) {
                const stockEntry = {
                  item_id: createdItem.id,
                  quantity: itemData.initial_stock || 0,
                  unit_cost: itemData.unit_cost || 0,
                  entry_type: 'purchase' as const,
                  supplier: supplierId,
                  purchase_date: itemData.supplier.purchase_date,
                  invoice_number: itemData.supplier.invoice_number,
                  delivery_date: itemData.supplier.delivery_date,
                  quality_rating: itemData.supplier.quality_rating,
                  note: `Compra inicial - ${itemData.name}`
                };
                
                await inventoryApi.createStockEntry(stockEntry);
              }
            }

            // Transform to MaterialItem format using normalizer
            const normalizedItem = MaterialsNormalizer.normalizeApiItem(createdItem);

            // Add to local state
            set(produce((state: MaterialsState) => {
              state.items.push(normalizedItem);
              state.loading = false;
            }));

            // Refresh stats and alerts
            get().refreshStats();
            

          } catch (error) {
            console.error('Error adding item:', error);
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Error al crear material'
            });
            throw error;
          }
        },

        updateItem: async (id, updates) => {
          const { items } = get();
          const originalItem = items.find(item => item.id === id);

          if (!originalItem) {
            const error = new Error('Item no encontrado para actualizar.');
            console.error(error);
            set({ error: error.message });
            throw error;
          }

          set({ loading: true, error: null });

          try {
            const { stock: newStock, initial_stock: formStock, ...otherUpdates } = updates as any;
            const actualNewStock = newStock ?? formStock;
            const oldStock = originalItem.stock;
            const stockDifference = (actualNewStock !== undefined && actualNewStock !== null) ? actualNewStock - oldStock : 0;

            const { supabase } = await import('@/lib/supabase/client');
            const { inventoryApi } = await import('@/pages/admin/supply-chain/materials/services/inventoryApi');

            if (Object.keys(otherUpdates).length > 0) {
              await inventoryApi.updateItem(id, otherUpdates);
            }

            if (stockDifference !== 0) {
              const { error: rpcError } = await supabase.rpc('update_item_stock', {
                p_item_id: id,
                p_quantity_to_add: stockDifference,
              });

              if (rpcError) {
                throw new Error(`Error en RPC al actualizar stock: ${rpcError.message}`);
              }
            }

            // Re-fetch the item to ensure state consistency
            const updatedItem = await inventoryApi.getItem(id);
            const normalizedItem = MaterialsNormalizer.normalizeApiItem(updatedItem);

            set(produce((state: MaterialsState) => {
              const index = state.items.findIndex(item => item.id === id);
              if (index !== -1) {
                state.items[index] = normalizedItem;
              }
              state.loading = false;
            }));

            get().refreshStats();
             // This will now fetch alerts from the backend

          } catch (error) {
            console.error('Error updating item:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el material.';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        deleteItem: (id) => {
          set(produce((state: MaterialsState) => {
            state.items = state.items.filter(item => item.id !== id);
            state.selectedItems = state.selectedItems.filter(selectedId => selectedId !== id);
          }));
          get().refreshStats();
          
        },

        bulkUpdateStock: (updates) => {
          set(produce((state: MaterialsState) => {
            updates.forEach(({ id, stock }) => {
              const item = state.items.find(item => item.id === id);
              if (item) {
                item.stock = stock;
                item.updated_at = new Date().toISOString();
              }
            });
          }));
          get().refreshStats();
          
        },

        // UI Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        setFilters: (newFilters) => set(produce((state: MaterialsState) => {
          state.filters = { ...state.filters, ...newFilters };
        })),
        resetFilters: () => set({ filters: initialFilters }),

        selectItem: (id) => set(produce((state: MaterialsState) => {
          if (!state.selectedItems.includes(id)) {
            state.selectedItems.push(id);
          }
        })),
        deselectItem: (id) => set(produce((state: MaterialsState) => {
          state.selectedItems = state.selectedItems.filter(selectedId => selectedId !== id);
        })),
        selectAll: () => set(produce((state: MaterialsState) => {
          state.selectedItems = state.items.map(item => item.id);
        })),
        deselectAll: () => set({ selectedItems: [] }),

        openModal: (mode, item = null) => {
          set({
            isModalOpen: true,
            modalMode: mode,
            currentItem: item
          });
        },
        closeModal: () => set({
          isModalOpen: false,
          modalMode: 'add',
          currentItem: null
        }),

        // Computed functions
        refreshStats: () => {
          const { items } = get();
          
          const stats: InventoryStats = {
            totalItems: items.length,
            totalValue: items.reduce((sum, item) => sum + StockCalculation.getTotalValue(item), 0),
            lowStockItems: items.filter(item => getStockStatus(item) === 'low').length,
            outOfStockItems: StockCalculation.getOutOfStockItems(items).length,
            recentMovements: 0, // TODO: Implement when we have movement tracking
            measurableItems: items.filter(isMeasurable).length,
            countableItems: items.filter(isCountable).length,
            elaboratedItems: items.filter(isElaborated).length,
            valueByCategory: {
              measurable: items.filter(isMeasurable).reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0),
              countable: items.filter(isCountable).reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0),
              elaborated: items.filter(isElaborated).reduce((sum, item) => sum + (item.stock * (item.unit_cost || 0)), 0)
            }
          };
          
          set({ stats });
        },


        getFilteredItems: () => {
          const { items, filters } = get();
          return items.filter(item => {
            // Type filter
            if (filters.type !== 'all' && item.type !== filters.type) {
              return false;
            }
            
            // Category filter - now business categories
            if (filters.category !== 'all') {
              if (item.category !== filters.category) {
                return false;
              }
            }
            
            // Stock status filter
            if (filters.stockStatus !== 'all' && getStockStatus(item) !== filters.stockStatus) {
              return false;
            }
            
            // Search filter
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              if (!item.name.toLowerCase().includes(searchLower)) {
                return false;
              }
            }
            
            // Price range filter
            if ((item.unit_cost || 0) < filters.priceRange[0] || (item.unit_cost || 0) > filters.priceRange[1]) {
              return false;
            }
            
            // Recipe filter for elaborated items
            if (filters.hasRecipe !== undefined && isElaborated(item)) {
              if (filters.hasRecipe && !item.recipe_id) return false;
              if (!filters.hasRecipe && item.recipe_id) return false;
            }
            
            return true;
          }).sort((a, b) => {
            const { sortBy, sortOrder } = filters;
            let aValue: unknown = a[sortBy as keyof MaterialItem];
            let bValue: unknown = b[sortBy as keyof MaterialItem];
            
            // Handle different data types
            if (sortBy === 'updated_at' || sortBy === 'created_at') {
              aValue = new Date(aValue as string).getTime();
              bValue = new Date(bValue as string).getTime();
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
        },

        getLowStockItems: () => {
          return get().items.filter(item => getStockStatus(item) === 'low');
        },

        getCriticalStockItems: () => {
          return get().items.filter(item => getStockStatus(item) === 'critical' || getStockStatus(item) === 'out');
        },

        getItemsByType: () => {
          const items = get().items;
          return {
            MEASURABLE: items.filter(isMeasurable),
            COUNTABLE: items.filter(isCountable),
            ELABORATED: items.filter(isElaborated)
          };
        },

        getMeasurableItems: () => get().items.filter(isMeasurable),
        getCountableItems: () => get().items.filter(isCountable),
        getElaboratedItems: () => get().items.filter(isElaborated)
      }),
      {
        name: 'g-mini-materials-storage',
        partialize: (state) => ({
          items: state.items,
          filters: state.filters
        })
      }
    )
  )
);

// Helper functions - now delegating to centralized utilities
function getStockStatus(item: MaterialItem): 'ok' | 'low' | 'critical' | 'out' {
  return StockCalculation.getStockStatus(item);
}

function getMinStock(item: MaterialItem): number {
  return StockCalculation.getMinStock(item);
}

function getItemUnit(item: MaterialItem): string {
  return StockCalculation.getDisplayUnit(item);
}

// ============================================================================
// 🎯 OPTIMIZED SELECTORS - Prevent unnecessary re-renders
// ============================================================================

/**
 * Hook for components that only need filtered items
 */
export const useMaterialsItems = () => useMaterialsStore(state => state.getFilteredItems());

/**
 * Hook for components that only need loading state
 */
export const useMaterialsLoading = () => useMaterialsStore(state => state.loading);

/**
 * Hook for components that only need error state
 */
export const useMaterialsError = () => useMaterialsStore(state => state.error);

/**
 * Hook for components that only need stats
 */
export const useMaterialsStats = () => useMaterialsStore(state => state.stats);

/**
 * Hook for components that only need modal state
 */
export const useMaterialsModal = () => useMaterialsStore(state => ({
  isModalOpen: state.isModalOpen,
  modalMode: state.modalMode,
  currentItem: state.currentItem,
  openModal: state.openModal,
  closeModal: state.closeModal
}));

/**
 * Hook for components that only need filters
 */
export const useMaterialsFilters = () => useMaterialsStore(state => ({
  filters: state.filters,
  setFilters: state.setFilters,
  resetFilters: state.resetFilters
}));

/**
 * Hook for components that only need actions
 */
export const useMaterialsActions = () => useMaterialsStore(state => ({
  addItem: state.addItem,
  updateItem: state.updateItem,
  deleteItem: state.deleteItem,
  bulkUpdateStock: state.bulkUpdateStock,
  setItems: state.setItems,
  refreshStats: state.refreshStats
}));

/**
 * Hook for components that need specific item types
 */
export const useMaterialsByType = () => useMaterialsStore(state => ({
  measurable: state.getMeasurableItems(),
  countable: state.getCountableItems(),
  elaborated: state.getElaboratedItems()
}));

/**
 * Hook for grid components that need items and actions
 */
export const useMaterialsGrid = () => useMaterialsStore(state => ({
  items: state.getFilteredItems(),
  loading: state.loading,
  onEdit: state.openModal,
  onView: state.openModal,
  deleteItem: state.deleteItem
}));

/**
 * Main hook for components that need full access (use sparingly)
 */
export const useMaterials = () => useMaterialsStore();
