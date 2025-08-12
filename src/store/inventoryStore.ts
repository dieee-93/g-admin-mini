import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';

export interface InventoryItem {
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

export interface InventoryFilters {
  search: string;
  category: string;
  status: 'all' | 'ok' | 'low' | 'critical' | 'out';
  sortBy: 'name' | 'stock' | 'value' | 'updated';
  sortOrder: 'asc' | 'desc';
}

export interface InventoryState {
  // Data
  items: InventoryItem[];
  categories: string[];
  suppliers: Array<{ id: string; name: string }>;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: InventoryFilters;
  selectedItems: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentItem: InventoryItem | null;
  
  // Stats
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    criticalStockCount: number;
    outOfStockCount: number;
  };

  // Actions
  setItems: (items: InventoryItem[]) => void;
  addItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  bulkUpdateStock: (updates: Array<{ id: string; stock: number }>) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setFilters: (filters: Partial<InventoryFilters>) => void;
  resetFilters: () => void;
  
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  openModal: (mode: 'add' | 'edit' | 'view', item?: InventoryItem) => void;
  closeModal: () => void;
  
  refreshStats: () => void;
  
  // Computed selectors
  getFilteredItems: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getCriticalStockItems: () => InventoryItem[];
  getItemsByCategory: () => Record<string, InventoryItem[]>;
}

const initialFilters: InventoryFilters = {
  search: '',
  category: 'all',
  status: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

export const useInventoryStore = create<InventoryState>()(
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
          set(produce((state: InventoryState) => {
            state.items = items.map(item => ({
              ...item,
              stock_status: getStockStatus(item),
              total_value: item.current_stock * item.cost_per_unit
            }));
          }));
          get().refreshStats();
        },

        addItem: (itemData) => {
          set(produce((state: InventoryState) => {
            const newItem: InventoryItem = {
              ...itemData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              stock_status: getStockStatus(itemData as InventoryItem),
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
          }, {} as Record<string, InventoryItem[]>);
        }
      })),
      {
        name: 'g-mini-inventory-storage',
        partialize: (state) => ({
          items: state.items,
          categories: state.categories,
          suppliers: state.suppliers,
          filters: state.filters
        })
      }
    ),
    {
      name: 'InventoryStore'
    }
  )
);

// Helper function to determine stock status
function getStockStatus(item: InventoryItem): 'ok' | 'low' | 'critical' | 'out' {
  if (item.current_stock <= 0) return 'out';
  if (item.current_stock <= item.min_stock * 0.5) return 'critical';
  if (item.current_stock <= item.min_stock) return 'low';
  return 'ok';
}