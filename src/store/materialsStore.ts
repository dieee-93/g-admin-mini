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
  stock_status?: 'ok' | 'low' | 'critical' | 'out';
}

export interface MaterialsFilters {
  category: string;
  stockStatus: 'all' | 'ok' | 'low' | 'critical' | 'out';
  search: string;
  priceRange: [number, number];
  supplier: string;
  location: string;
  sortBy: 'name' | 'stock' | 'category' | 'cost' | 'updated_at';
  sortOrder: 'asc' | 'desc';
}

export interface MaterialsState {
  // Data
  items: MaterialItem[];
  categories: string[];
  suppliers: string[];
  
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
  bulkUpdateStock: (updates: Array<{ id: string; current_stock: number }>) => void;
  
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
  getItemsByCategory: () => Record<string, MaterialItem[]>;
}

const initialFilters: MaterialsFilters = {
  category: 'all',
  stockStatus: 'all',
  search: '',
  priceRange: [0, 1000000],
  supplier: 'all',
  location: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

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
              stock_status: getStockStatus(item)
            }));
            state.categories = [...new Set(items.map(item => item.category))];
            state.suppliers = [...new Set(items.map(item => item.supplier_id).filter(Boolean))];
          }));
          get().refreshStats();
        },

        addItem: (itemData) => {
          const newItem: MaterialItem = {
            ...itemData,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            stock_status: getStockStatus(itemData as MaterialItem)
          };
          
          set(produce((state: MaterialsState) => {
            state.items.push(newItem);
            if (!state.categories.includes(newItem.category)) {
              state.categories.push(newItem.category);
            }
            if (newItem.supplier_id && !state.suppliers.includes(newItem.supplier_id)) {
              state.suppliers.push(newItem.supplier_id);
            }
          }));
          get().refreshStats();
        },

        updateItem: (id, updates) => {
          set(produce((state: MaterialsState) => {
            const index = state.items.findIndex(item => item.id === id);
            if (index !== -1) {
              state.items[index] = {
                ...state.items[index],
                ...updates,
                updated_at: new Date().toISOString(),
                stock_status: getStockStatus({ ...state.items[index], ...updates })
              };
            }
          }));
          get().refreshStats();
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
            updates.forEach(({ id, current_stock }) => {
              const item = state.items.find(item => item.id === id);
              if (item) {
                item.current_stock = current_stock;
                item.updated_at = new Date().toISOString();
                item.stock_status = getStockStatus(item);
              }
            });
          }));
          get().refreshStats();
        },

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

        openModal: (mode, item = null) => set({
          isModalOpen: true,
          modalMode: mode,
          currentItem: item
        }),
        closeModal: () => set({
          isModalOpen: false,
          modalMode: 'add',
          currentItem: null
        }),

        refreshStats: () => {
          const { items } = get();
          const stats = {
            totalItems: items.length,
            totalValue: items.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0),
            lowStockCount: items.filter(item => item.stock_status === 'low').length,
            criticalStockCount: items.filter(item => item.stock_status === 'critical').length,
            outOfStockCount: items.filter(item => item.stock_status === 'out').length
          };
          set({ stats });
        },

        getFilteredItems: () => {
          const { items, filters } = get();
          return items.filter(item => {
            // Category filter
            if (filters.category !== 'all' && item.category !== filters.category) {
              return false;
            }
            
            // Stock status filter
            if (filters.stockStatus !== 'all' && item.stock_status !== filters.stockStatus) {
              return false;
            }
            
            // Search filter
            if (filters.search) {
              const searchLower = filters.search.toLowerCase();
              const searchFields = [item.name, item.category, item.notes, item.location].filter(Boolean);
              if (!searchFields.some(field => field!.toLowerCase().includes(searchLower))) {
                return false;
              }
            }
            
            // Price range filter
            if (item.cost_per_unit < filters.priceRange[0] || item.cost_per_unit > filters.priceRange[1]) {
              return false;
            }
            
            // Supplier filter
            if (filters.supplier !== 'all' && item.supplier_id !== filters.supplier) {
              return false;
            }
            
            // Location filter
            if (filters.location !== 'all' && item.location !== filters.location) {
              return false;
            }
            
            return true;
          }).sort((a, b) => {
            const { sortBy, sortOrder } = filters;
            let aValue: any = a[sortBy];
            let bValue: any = b[sortBy];
            
            // Handle different data types
            if (sortBy === 'updated_at' || sortBy === 'created_at') {
              aValue = new Date(aValue).getTime();
              bValue = new Date(bValue).getTime();
            } else if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
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
      }),
      {
        name: 'g-mini-materials-storage',
        partialize: (state) => ({
          items: state.items,
          categories: state.categories,
          suppliers: state.suppliers,
          filters: state.filters
        })
      }
    )
  )
);

// Helper function to determine stock status
function getStockStatus(item: MaterialItem): 'ok' | 'low' | 'critical' | 'out' {
  if (item.current_stock <= 0) return 'out';
  if (item.current_stock <= item.min_stock * 0.5) return 'critical';
  if (item.current_stock <= item.min_stock) return 'low';
  return 'ok';
}