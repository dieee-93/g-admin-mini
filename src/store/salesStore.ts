/**
 * SALES STORE
 * 
 * ✅ ARCHITECTURE COMPLIANT
 * 
 * This store handles UI state and session state:
 * - Session state (cart[]) → Zustand (temporary session data, not persisted in DB)
 * - UI state (modals, filters, selections) → Zustand
 * - Server state (sales[], orders[]) → TanStack Query (useSales hook in pages/admin/operations/sales)
 * 
 * MIGRATION CONTEXT:
 * - Date: January 2025
 * - Note: Cart is legitimate Zustand usage (session state, not server state)
 * - Cart calculations (getCartTotal, getCartItemCount) migrated to usePOSCart hook
 * 
 * @see src/modules/sales/hooks/usePOSCart.ts - Cart calculations with DecimalUtils
 * @see src/pages/admin/operations/sales/hooks/useSales.ts - Sales data hook
 * @see ZUSTAND_ARCHITECTURE_BEST_PRACTICES.md - Architecture guide
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Sale } from '@/pages/admin/operations/sales/types';

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
  status: 'all' | Sale['order_status'];
  payment_method: 'all' | string;
  customer_id?: string;
  search: string;
  sortBy: 'date' | 'total' | 'customer';
  sortOrder: 'asc' | 'desc';
}

export interface SalesState {
  // Cart State
  cart: CartItem[];

  // UI State
  filters: SalesFilters;
  selectedSales: string[];

  // Modal states
  isCheckoutModalOpen: boolean;
  isReceiptModalOpen: boolean;
  isRefundModalOpen: boolean;
  currentReceipt: Sale | null;
  currentSale: Sale | null; // For refund modal

  // Table Management UI
  selectedTableId: string | null;

  // Actions - Cart
  addToCart: (item: CartItem) => void;
  updateCartItem: (productId: string, updates: Partial<CartItem>) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Actions - UI
  setFilters: (filters: Partial<SalesFilters>) => void;
  resetFilters: () => void;
  selectSale: (id: string) => void; // For list selection
  deselectSale: (id: string) => void;
  selectAllSales: (ids: string[]) => void; // Changed to accept IDs
  deselectAllSales: () => void;
  setSelectedTableId: (tableId: string | null) => void;

  // Actions - Modals
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  openReceiptModal: (sale: Sale) => void;
  closeReceiptModal: () => void;
  openRefundModal: (sale: Sale) => void;
  closeRefundModal: () => void;
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
        cart: [],
        filters: initialFilters,
        selectedSales: [],
        isCheckoutModalOpen: false,
        isReceiptModalOpen: false,
        isRefundModalOpen: false,
        currentReceipt: null,
        currentSale: null,
        selectedTableId: null,

        // Cart Actions
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

        // UI Actions
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

        selectAllSales: (ids) => {
          set((state) => {
            state.selectedSales = ids;
          });
        },

        deselectAllSales: () => {
          set((state) => {
            state.selectedSales = [];
          });
        },

        setSelectedTableId: (tableId) => {
          set((state) => {
            state.selectedTableId = tableId;
          });
        },

        // Modal Actions
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
        }
      })),
      {
        name: 'g-mini-sales-storage',
        partialize: (state) => ({
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

// Alias for easier imports
export const useSales = useSalesStore;

// Modal state helper
export const useModalState = () => {
  const isModalOpen = useSalesStore(state => state.isCheckoutModalOpen);
  const closeModal = useSalesStore(state => state.closeCheckoutModal);

  return { isModalOpen, closeModal };
};