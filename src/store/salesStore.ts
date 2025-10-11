import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  notes?: string;
}

export interface Sale {
  id: string;
  customer_id?: string;
  customer_name?: string;
  items: SaleItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled' | 'refunded';
  created_at: string;
  updated_at: string;
  notes?: string;
  
  // Kitchen/Operations
  kitchen_status?: 'pending' | 'preparing' | 'ready' | 'delivered';
  kitchen_notes?: string;
  estimated_time?: number;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  available_stock?: number;
  notes?: string;
}

export interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  status: 'all' | Sale['status'];
  payment_method: 'all' | Sale['payment_method'];
  customer_id?: string;
  search: string;
  sortBy: 'date' | 'total' | 'customer';
  sortOrder: 'asc' | 'desc';
}

export interface SalesStats {
  todayTotal: number;
  todayCount: number;
  weekTotal: number;
  monthTotal: number;
  averageOrderValue: number;
  topProducts: Array<{ product_id: string; name: string; quantity: number; revenue: number }>;
}

export interface SalesState {
  // Data
  sales: Sale[];
  currentSale: Sale | null;
  cart: CartItem[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: SalesFilters;
  selectedSales: string[];
  
  // Modal states
  isCheckoutModalOpen: boolean;
  isReceiptModalOpen: boolean;
  isRefundModalOpen: boolean;
  currentReceipt: Sale | null;
  
  // Kitchen Display
  kitchenOrders: Sale[];
  activeKitchenOrder: Sale | null;
  
  // Stats
  stats: SalesStats;

  // Table Management
  selectedTableId: string | null;

  // Actions
  setSales: (sales: Sale[]) => void;
  setSelectedTableId: (tableId: string | null) => void;
  addSale: (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  
  // Cart management
  addToCart: (item: CartItem) => void;
  updateCartItem: (productId: string, updates: Partial<CartItem>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Checkout process
  startCheckout: () => void;
  completeSale: (paymentData: { payment_method: Sale['payment_method']; customer_id?: string }) => Promise<Sale>;
  
  // Kitchen operations
  updateKitchenStatus: (saleId: string, status: Sale['kitchen_status'], notes?: string) => void;
  setActiveKitchenOrder: (sale: Sale | null) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<SalesFilters>) => void;
  resetFilters: () => void;
  
  selectSale: (id: string) => void;
  deselectSale: (id: string) => void;
  selectAllSales: () => void;
  deselectAllSales: () => void;
  
  // Modal actions
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  openReceiptModal: (sale: Sale) => void;
  closeReceiptModal: () => void;
  openRefundModal: (sale: Sale) => void;
  closeRefundModal: () => void;
  
  // Stats
  refreshStats: () => void;
  
  // Computed selectors
  getFilteredSales: () => Sale[];
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getTodaySales: () => Sale[];
  getPendingKitchenOrders: () => Sale[];
}

const initialFilters: SalesFilters = {
  status: 'all',
  payment_method: 'all',
  search: '',
  sortBy: 'date',
  sortOrder: 'desc'
};

export const useSalesStore = create<SalesState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        sales: [],
        currentSale: null,
        cart: [],
        
        loading: false,
        error: null,
        filters: initialFilters,
        selectedSales: [],
        
        isCheckoutModalOpen: false,
        isReceiptModalOpen: false,
        isRefundModalOpen: false,
        currentReceipt: null,
        
        kitchenOrders: [],
        activeKitchenOrder: null,
        
        stats: {
          todayTotal: 0,
          todayCount: 0,
          weekTotal: 0,
          monthTotal: 0,
          averageOrderValue: 0,
          topProducts: []
        },

        selectedTableId: null,

        // Actions
        setSales: (sales) => {
          set((state) => {
            state.sales = sales;
            state.kitchenOrders = sales.filter(sale => 
              sale.status === 'confirmed' || sale.status === 'paid'
            );
          });
          get().refreshStats();
        },

        setSelectedTableId: (tableId) => {
          set((state) => {
            state.selectedTableId = tableId;
          });
        },

        addSale: (saleData) => {
          set((state) => {
            const newSale: Sale = {
              ...saleData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            state.sales.unshift(newSale);
            
            if (newSale.status === 'confirmed' || newSale.status === 'paid') {
              state.kitchenOrders.push(newSale);
            }
          });
          get().refreshStats();
        },

        updateSale: (id, updates) => {
          set((state) => {
            const saleIndex = state.sales.findIndex(sale => sale.id === id);
            if (saleIndex >= 0) {
              const updatedSale = {
                ...state.sales[saleIndex],
                ...updates,
                updated_at: new Date().toISOString()
              };
              state.sales[saleIndex] = updatedSale;
              
              // Update kitchen orders
              const kitchenIndex = state.kitchenOrders.findIndex(order => order.id === id);
              if (kitchenIndex >= 0) {
                if (updatedSale.status === 'confirmed' || updatedSale.status === 'paid') {
                  state.kitchenOrders[kitchenIndex] = updatedSale;
                } else {
                  state.kitchenOrders.splice(kitchenIndex, 1);
                }
              } else if (updatedSale.status === 'confirmed' || updatedSale.status === 'paid') {
                state.kitchenOrders.push(updatedSale);
              }
            }
          });
          get().refreshStats();
        },

        deleteSale: (id) => {
          set((state) => {
            state.sales = state.sales.filter(sale => sale.id !== id);
            state.kitchenOrders = state.kitchenOrders.filter(order => order.id !== id);
            state.selectedSales = state.selectedSales.filter(selectedId => selectedId !== id);
          });
          get().refreshStats();
        },

        // Cart management
        addToCart: (item) => {
          set((state) => {
            const existingIndex = state.cart.findIndex(cartItem => cartItem.product_id === item.product_id);
            if (existingIndex >= 0) {
              state.cart[existingIndex].quantity += item.quantity;
            } else {
              state.cart.push(item);
            }
          });
        },

        updateCartItem: (productId, updates) => {
          set((state) => {
            const itemIndex = state.cart.findIndex(item => item.product_id === productId);
            if (itemIndex >= 0) {
              state.cart[itemIndex] = { ...state.cart[itemIndex], ...updates };
            }
          });
        },

        removeFromCart: (productId) => {
          set((state) => {
            state.cart = state.cart.filter(item => item.product_id !== productId);
          });
        },

        clearCart: () => {
          set((state) => {
            state.cart = [];
          });
        },

        // Checkout
        startCheckout: () => {
          set((state) => {
            state.isCheckoutModalOpen = true;
          });
        },

        completeSale: async (paymentData) => {
          const { cart } = get();
          
          if (cart.length === 0) {
            throw new Error('El carrito está vacío');
          }

          const saleItems: SaleItem[] = cart.map(cartItem => ({
            id: crypto.randomUUID(),
            product_id: cartItem.product_id,
            product_name: cartItem.product_name,
            quantity: cartItem.quantity,
            unit_price: cartItem.unit_price,
            total: cartItem.quantity * cartItem.unit_price,
            notes: cartItem.notes
          }));

          const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
          const tax_amount = subtotal * 0.21; // 21% IVA
          const total = subtotal + tax_amount;

          const newSale: Sale = {
            id: crypto.randomUUID(),
            customer_id: paymentData.customer_id,
            items: saleItems,
            subtotal,
            tax_amount,
            discount_amount: 0,
            total,
            payment_method: paymentData.payment_method,
            status: 'confirmed',
            kitchen_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Add to store
          get().addSale(newSale);
          
          // Clear cart and close modal
          get().clearCart();
          get().closeCheckoutModal();
          
          return newSale;
        },

        // Kitchen operations
        updateKitchenStatus: (saleId, status, notes) => {
          get().updateSale(saleId, { 
            kitchen_status: status, 
            kitchen_notes: notes 
          });
        },

        setActiveKitchenOrder: (sale) => {
          set((state) => {
            state.activeKitchenOrder = sale;
          });
        },

        // UI actions
        setLoading: (loading) => {
          set((state) => {
            state.loading = loading;
          });
        },

        setError: (_error) => {
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

        selectSale: (id) => {
          set((state) => {
            if (!state.selectedSales.includes(id)) {
              state.selectedSales.push(id);
            }
          });
        },

        deselectSale: (id) => {
          set((state) => {
            state.selectedSales = state.selectedSales.filter(selectedId => selectedId !== id);
          });
        },

        selectAllSales: () => {
          const filteredSales = get().getFilteredSales();
          set((state) => {
            state.selectedSales = filteredSales.map(sale => sale.id);
          });
        },

        deselectAllSales: () => {
          set((state) => {
            state.selectedSales = [];
          });
        },

        // Modal actions
        openCheckoutModal: () => {
          set((state) => {
            state.isCheckoutModalOpen = true;
          });
        },

        closeCheckoutModal: () => {
          set((state) => {
            state.isCheckoutModalOpen = false;
          });
        },

        openReceiptModal: (sale) => {
          set((state) => {
            state.isReceiptModalOpen = true;
            state.currentReceipt = sale;
          });
        },

        closeReceiptModal: () => {
          set((state) => {
            state.isReceiptModalOpen = false;
            state.currentReceipt = null;
          });
        },

        openRefundModal: (sale) => {
          set((state) => {
            state.isRefundModalOpen = true;
            state.currentSale = sale;
          });
        },

        closeRefundModal: () => {
          set((state) => {
            state.isRefundModalOpen = false;
            state.currentSale = null;
          });
        },

        // Stats
        refreshStats: () => {
          const { sales } = get();
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

          const todaySales = sales.filter(sale => 
            new Date(sale.created_at) >= todayStart && 
            (sale.status === 'paid' || sale.status === 'confirmed')
          );
          
          const weekSales = sales.filter(sale => 
            new Date(sale.created_at) >= weekStart && 
            (sale.status === 'paid' || sale.status === 'confirmed')
          );
          
          const monthSales = sales.filter(sale => 
            new Date(sale.created_at) >= monthStart && 
            (sale.status === 'paid' || sale.status === 'confirmed')
          );

          const paidSales = sales.filter(sale => sale.status === 'paid' || sale.status === 'confirmed');

          const stats: SalesStats = {
            todayTotal: todaySales.reduce((sum, sale) => sum + sale.total, 0),
            todayCount: todaySales.length,
            weekTotal: weekSales.reduce((sum, sale) => sum + sale.total, 0),
            monthTotal: monthSales.reduce((sum, sale) => sum + sale.total, 0),
            averageOrderValue: paidSales.length > 0 
              ? paidSales.reduce((sum, sale) => sum + sale.total, 0) / paidSales.length 
              : 0,
            topProducts: calculateTopProducts(paidSales)
          };

          set((state) => {
            state.stats = stats;
          });
        },

        // Computed selectors
        getFilteredSales: () => {
          const { sales, filters } = get();
          let filtered = [...sales];

          // Date filters
          if (filters.dateFrom) {
            filtered = filtered.filter(sale => sale.created_at >= filters.dateFrom!);
          }
          if (filters.dateTo) {
            filtered = filtered.filter(sale => sale.created_at <= filters.dateTo!);
          }

          // Status filter
          if (filters.status !== 'all') {
            filtered = filtered.filter(sale => sale.status === filters.status);
          }

          // Payment method filter
          if (filters.payment_method !== 'all') {
            filtered = filtered.filter(sale => sale.payment_method === filters.payment_method);
          }

          // Customer filter
          if (filters.customer_id) {
            filtered = filtered.filter(sale => sale.customer_id === filters.customer_id);
          }

          // Search filter
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(sale =>
              sale.customer_name?.toLowerCase().includes(search) ||
              sale.id.toLowerCase().includes(search) ||
              sale.items.some(item => item.product_name.toLowerCase().includes(search))
            );
          }

          // Sort
          filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (filters.sortBy) {
              case 'total':
                aValue = a.total;
                bValue = b.total;
                break;
              case 'customer':
                aValue = a.customer_name || '';
                bValue = b.customer_name || '';
                break;
              default:
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
            }

            if (filters.sortOrder === 'desc') {
              return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
          });

          return filtered;
        },

        getCartTotal: () => {
          const { cart } = get();
          return cart.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
        },

        getCartItemCount: () => {
          const { cart } = get();
          return cart.reduce((count, item) => count + item.quantity, 0);
        },

        getTodaySales: () => {
          const { sales } = get();
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          return sales.filter(sale => new Date(sale.created_at) >= todayStart);
        },

        getPendingKitchenOrders: () => {
          const { kitchenOrders } = get();
          return kitchenOrders.filter(order => 
            order.kitchen_status === 'pending' || order.kitchen_status === 'preparing'
          );
        }
      })),
      {
        name: 'g-mini-sales-storage',
        partialize: (state) => ({
          sales: state.sales,
          cart: state.cart,
          filters: state.filters
        })
      }
    ),
    {
      name: 'SalesStore'
    }
  )
);

// Helper function to calculate top products
function calculateTopProducts(sales: Sale[]): SalesStats['topProducts'] {
  const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};

  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productStats[item.product_id]) {
        productStats[item.product_id] = {
          name: item.product_name,
          quantity: 0,
          revenue: 0
        };
      }
      productStats[item.product_id].quantity += item.quantity;
      productStats[item.product_id].revenue += item.total;
    });
  });

  return Object.entries(productStats)
    .map(([product_id, stats]) => ({ product_id, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

// Alias for easier imports
export const useSales = useSalesStore;

// Modal state helper
export const useModalState = () => {
  const isModalOpen = useSalesStore(state => state.isCheckoutModalOpen);
  const closeModal = useSalesStore(state => state.closeCheckoutModal);

  return { isModalOpen, closeModal };
};