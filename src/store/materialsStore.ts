import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  category: string;
  cost_per_unit: number;
  supplier_id?: string;
  created_at: string;
  updated_at: string;
  location?: string;
  notes?: string;
  
  // Computed fields
  stock_status: 'ok' | 'low' | 'critical' | 'out';
  total_value: number;
}

// Keep legacy interface for backwards compatibility during migration
export interface InventoryItem extends MaterialItem {}

export interface MaterialsFilters {
  search: string;
  category: string;
  status: 'all' | 'ok' | 'low' | 'critical' | 'out';
  sortBy: 'name' | 'stock' | 'value' | 'updated';
  sortOrder: 'asc' | 'desc';
}

// Keep legacy interface for backwards compatibility during migration
export interface InventoryFilters extends MaterialsFilters {}

export interface MaterialsState {
  // Data
  items: MaterialItem[];
  categories: string[];
  suppliers: Array<{ id: string; name: string }>;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: MaterialsFilters;
  selectedItems: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentItem: MaterialItem | null;
  
  // Stats
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    criticalStockCount: number;
    outOfStockCount: number;
  };

  // Actions
  setItems: (items: MaterialItem[]) => void;
  addItem: (item: Omit<MaterialItem, 'id' | 'created_at' | 'updated_at'>) => void;
  updateItem: (id: string, updates: Partial<MaterialItem>) => void;
  deleteItem: (id: string) => void;
  bulkUpdateStock: (updates: Array<{ id: string; stock: number }>) => void;
  
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
  
  refreshStats: () => void;
  
  // Computed selectors
  getFilteredItems: () => MaterialItem[];
  getLowStockItems: () => MaterialItem[];
  getCriticalStockItems: () => MaterialItem[];
  getItemsByCategory: () => Record<string, MaterialItem[]>;
}

const initialFilters: MaterialsFilters = {
  search: '',
  category: 'all',
  status: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

// Keep legacy for backwards compatibility
const legacyInitialFilters: InventoryFilters = initialFilters;

export const useMaterialsStore = create<MaterialsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        categories: [],
        suppliers: [],
        
        loading: false,
        error: null,
        filters: initialFilters,
        selectedItems: [],
        isModalOpen: false,
        modalMode: 'add',
        currentItem: null,
        
        stats: {
          totalItems: 0,
          totalValue: 0,
          lowStockCount: 0,
          criticalStockCount: 0,
          outOfStockCount: 0
        },

        // Actions
        setItems: (items) => {
          set(produce((state: MaterialsState) => {
            state.items = items.map(item => ({
              ...item,
              stock_status: getStockStatus(item),
              total_value: item.current_stock * item.cost_per_unit
            }));
          }));
          get().refreshStats();
        },

        addItem: (itemData) => {
          set(produce((state: MaterialsState) => {
            const newItem: MaterialItem = {
              ...itemData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              stock_status: getStockStatus(itemData as MaterialItem),
              total_value: itemData.current_stock * itemData.cost_per_unit
            };
            state.items.push(newItem);
          }));
          get().refreshStats();
        },

        updateItem: (id, updates) => {
          set((state) => {
            const itemIndex = state.items.findIndex(item => item.id === id);
            if (itemIndex >= 0) {
              const item = { ...state.items[itemIndex], ...updates };
              item.updated_at = new Date().toISOString();
              item.stock_status = getStockStatus(item);
              item.total_value = item.current_stock * item.cost_per_unit;
              state.items[itemIndex] = item;
            }
          });
          get().refreshStats();
        },

        deleteItem: (id) => {
          set((state) => {
            state.items = state.items.filter(item => item.id !== id);
            state.selectedItems = state.selectedItems.filter(selectedId => selectedId !== id);
          });
          get().refreshStats();
        },

        bulkUpdateStock: (updates) => {
          set((state) => {
            updates.forEach(({ id, stock }) => {
              const itemIndex = state.items.findIndex(item => item.id === id);
              if (itemIndex >= 0) {
                const item = state.items[itemIndex];
                item.current_stock = stock;
                item.updated_at = new Date().toISOString();
                item.stock_status = getStockStatus(item);
                item.total_value = item.current_stock * item.cost_per_unit;
              }
            });
          });
          get().refreshStats();
        },

        setLoading: (loading) => {
          set((state) => {
            state.loading = loading;
          });
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

        setFilters: (newFilters) => {
          set((state) => {
            state.filters = { ...state.filters, ...newFilters };
          });
        },

        resetFilters: () => {
          set((state) => {
            state.filters = initialFilters;
          });
        },

        selectItem: (id) => {
          set((state) => {
            if (!state.selectedItems.includes(id)) {
              state.selectedItems.push(id);
            }
          });
        },

        deselectItem: (id) => {
          set((state) => {
            state.selectedItems = state.selectedItems.filter(selectedId => selectedId !== id);
          });
        },

        selectAll: () => {
          const filteredItems = get().getFilteredItems();
          set((state) => {
            state.selectedItems = filteredItems.map(item => item.id);
          });
        },

        deselectAll: () => {
          set((state) => {
            state.selectedItems = [];
          });
        },

        openModal: (mode, item = null) => {
          set((state) => {
            state.isModalOpen = true;
            state.modalMode = mode;
            state.currentItem = item;
          });
        },

        closeModal: () => {
          set((state) => {
            state.isModalOpen = false;
            state.currentItem = null;
          });
        },

        refreshStats: () => {
          const { items } = get();
          const stats = {
            totalItems: items.length,
            totalValue: items.reduce((sum, item) => sum + item.total_value, 0),
            lowStockCount: items.filter(item => item.stock_status === 'low').length,
            criticalStockCount: items.filter(item => item.stock_status === 'critical').length,
            outOfStockCount: items.filter(item => item.stock_status === 'out').length
          };

          set((state) => {
            state.stats = stats;
          });
        },

        // Computed selectors
        getFilteredItems: () => {
          const { items, filters } = get();
          let filtered = [...items];

          // Search filter
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(item =>
              item.name.toLowerCase().includes(search) ||
              item.category.toLowerCase().includes(search)
            );
          }

          // Category filter
          if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(item => item.category === filters.category);
          }

          // Status filter
          if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(item => item.stock_status === filters.status);
          }

          // Sort
          filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (filters.sortBy) {
              case 'stock':
                aValue = a.current_stock;
                bValue = b.current_stock;
                break;
              case 'value':
                aValue = a.total_value;
                bValue = b.total_value;
                break;
              case 'updated':
                aValue = new Date(a.updated_at).getTime();
                bValue = new Date(b.updated_at).getTime();
                break;
              default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            }

            if (filters.sortOrder === 'desc') {
              return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
          });

          return filtered;
        },

        getLowStockItems: () => {
          return get().items.filter(item => item.stock_status === 'low');
        },

        getCriticalStockItems: () => {
          return get().items.filter(item => item.stock_status === 'critical');
        },

        getItemsByCategory: () => {
          const items = get().items;
          return items.reduce((acc, item) => {
            if (!acc[item.category]) {
              acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
          }, {} as Record<string, MaterialItem[]>);
        }
      })),
      {
        name: 'g-mini-materials-storage',
        partialize: (state) => ({
          items: state.items,
          categories: state.categories,
          suppliers: state.suppliers,
          filters: state.filters
        })
      }
    ),
    {
      name: 'MaterialsStore'
    }
  )
);

// Legacy export for backwards compatibility during migration
export const useInventoryStore = useMaterialsStore;

// Legacy interface for backwards compatibility
export interface InventoryState extends MaterialsState {}

// Helper function to determine stock status
function getStockStatus(item: MaterialItem): 'ok' | 'low' | 'critical' | 'out' {
  if (item.current_stock <= 0) return 'out';
  if (item.current_stock <= item.min_stock * 0.5) return 'critical';
  if (item.current_stock <= item.min_stock) return 'low';
  return 'ok';
}