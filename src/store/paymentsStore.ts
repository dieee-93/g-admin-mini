/**
 * PAYMENTS ZUSTAND STORE
 * State management for payment methods and payment gateways
 * 
 * PURPOSE:
 * - Enable payment validation in achievements system
 * - Support 15 requirements that validate payments across all capabilities
 * - Separate payment methods (cash, card, etc.) from gateways (MercadoPago, MODO)
 * 
 * @version 1.0.0
 * @see FUTURE_REQUIREMENTS.md - Section 3
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
  type?: 'cash' | 'card' | 'transfer' | 'other';
}

export interface PaymentGateway {
  id: string;
  type: 'online' | 'pos' | 'mobile';
  is_active: boolean;
  supports_subscriptions?: boolean;
  name?: string;
}

export interface PaymentsFilters {
  search: string;
  activeOnly: boolean;
  type: 'all' | 'methods' | 'gateways';
}

export interface PaymentsStats {
  totalMethods: number;
  activeMethods: number;
  totalGateways: number;
  activeGateways: number;
  onlineGateways: number;
  subscriptionCapable: number;
}

// ============================================
// STATE INTERFACE
// ============================================

export interface PaymentsState {
  // Data
  paymentMethods: PaymentMethod[];
  paymentGateways: PaymentGateway[];

  // UI State
  loading: boolean;
  error: string | null;
  filters: PaymentsFilters;

  // Stats
  stats: PaymentsStats;

  // Actions - Payment Methods
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  togglePaymentMethod: (id: string, isActive: boolean) => void;

  // Actions - Payment Gateways
  setPaymentGateways: (gateways: PaymentGateway[]) => void;
  addPaymentGateway: (gateway: PaymentGateway) => void;
  updatePaymentGateway: (id: string, updates: Partial<PaymentGateway>) => void;
  deletePaymentGateway: (id: string) => void;
  togglePaymentGateway: (id: string, isActive: boolean) => void;

  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<PaymentsFilters>) => void;
  resetFilters: () => void;

  // Computed
  refreshStats: () => void;
  getActiveMethods: () => PaymentMethod[];
  getActiveGateways: () => PaymentGateway[];
  getOnlineGateways: () => PaymentGateway[];
  getSubscriptionGateways: () => PaymentGateway[];
}

// ============================================
// INITIAL STATE
// ============================================

const initialFilters: PaymentsFilters = {
  search: '',
  activeOnly: false,
  type: 'all',
};

const initialStats: PaymentsStats = {
  totalMethods: 0,
  activeMethods: 0,
  totalGateways: 0,
  activeGateways: 0,
  onlineGateways: 0,
  subscriptionCapable: 0,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const usePaymentsStore = create<PaymentsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        paymentMethods: [],
        paymentGateways: [],
        loading: false,
        error: null,
        filters: initialFilters,
        stats: initialStats,

        // Payment Methods Actions
        setPaymentMethods: (methods) => {
          set({ paymentMethods: methods });
          get().refreshStats();
        },

        addPaymentMethod: (method) => {
          set(
            produce((state: PaymentsState) => {
              state.paymentMethods.push(method);
            })
          );
          get().refreshStats();
          logger.info('PaymentsStore', 'Payment method added:', method.name);
        },

        updatePaymentMethod: (id, updates) => {
          set(
            produce((state: PaymentsState) => {
              const index = state.paymentMethods.findIndex((m) => m.id === id);
              if (index !== -1) {
                state.paymentMethods[index] = {
                  ...state.paymentMethods[index],
                  ...updates,
                };
              }
            })
          );
          get().refreshStats();
          logger.info('PaymentsStore', 'Payment method updated:', id);
        },

        deletePaymentMethod: (id) => {
          set(
            produce((state: PaymentsState) => {
              state.paymentMethods = state.paymentMethods.filter((m) => m.id !== id);
            })
          );
          get().refreshStats();
          logger.info('PaymentsStore', 'Payment method deleted:', id);
        },

        togglePaymentMethod: (id, isActive) => {
          get().updatePaymentMethod(id, { is_active: isActive });
        },

        // Payment Gateways Actions
        setPaymentGateways: (gateways) => {
          set({ paymentGateways: gateways });
          get().refreshStats();
        },

        addPaymentGateway: (gateway) => {
          set(
            produce((state: PaymentsState) => {
              state.paymentGateways.push(gateway);
            })
          );
          get().refreshStats();
          logger.info('PaymentsStore', 'Payment gateway added:', gateway.name || gateway.type);
        },

        updatePaymentGateway: (id, updates) => {
          set(
            produce((state: PaymentsState) => {
              const index = state.paymentGateways.findIndex((g) => g.id === id);
              if (index !== -1) {
                state.paymentGateways[index] = {
                  ...state.paymentGateways[index],
                  ...updates,
                };
              }
            })
          );
          get().refreshStats();
          logger.info('PaymentsStore', 'Payment gateway updated:', id);
        },

        deletePaymentGateway: (id) => {
          set(
            produce((state: PaymentsState) => {
              state.paymentGateways = state.paymentGateways.filter((g) => g.id !== id);
            })
          );
          get().refreshStats();
          logger.info('PaymentsStore', 'Payment gateway deleted:', id);
        },

        togglePaymentGateway: (id, isActive) => {
          get().updatePaymentGateway(id, { is_active: isActive });
        },

        // UI Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        setFilters: (newFilters) =>
          set(
            produce((state: PaymentsState) => {
              state.filters = { ...state.filters, ...newFilters };
            })
          ),

        resetFilters: () => set({ filters: initialFilters }),

        // Computed Functions
        refreshStats: () => {
          const { paymentMethods, paymentGateways } = get();

          const activeMethods = paymentMethods.filter((m) => m.is_active);
          const activeGateways = paymentGateways.filter((g) => g.is_active);
          const onlineGateways = paymentGateways.filter(
            (g) => g.is_active && g.type === 'online'
          );
          const subscriptionGateways = paymentGateways.filter(
            (g) => g.is_active && g.supports_subscriptions
          );

          const stats: PaymentsStats = {
            totalMethods: paymentMethods.length,
            activeMethods: activeMethods.length,
            totalGateways: paymentGateways.length,
            activeGateways: activeGateways.length,
            onlineGateways: onlineGateways.length,
            subscriptionCapable: subscriptionGateways.length,
          };

          set({ stats });
        },

        getActiveMethods: () => {
          return get().paymentMethods.filter((m) => m.is_active);
        },

        getActiveGateways: () => {
          return get().paymentGateways.filter((g) => g.is_active);
        },

        getOnlineGateways: () => {
          return get().paymentGateways.filter((g) => g.is_active && g.type === 'online');
        },

        getSubscriptionGateways: () => {
          return get().paymentGateways.filter(
            (g) => g.is_active && g.supports_subscriptions
          );
        },
      }),
      {
        name: 'g-mini-payments-storage',
        partialize: (state) => ({
          paymentMethods: state.paymentMethods,
          paymentGateways: state.paymentGateways,
        }),
      }
    )
  )
);

// ============================================
// OPTIMIZED SELECTORS
// ============================================

/**
 * Hook for components that only need payment methods
 */
export const usePaymentMethods = () =>
  usePaymentsStore((state) => state.paymentMethods);

/**
 * Hook for components that only need active payment methods
 */
export const useActivePaymentMethods = () =>
  usePaymentsStore((state) => state.getActiveMethods());

/**
 * Hook for components that only need payment gateways
 */
export const usePaymentGateways = () =>
  usePaymentsStore((state) => state.paymentGateways);

/**
 * Hook for components that only need active payment gateways
 */
export const useActivePaymentGateways = () =>
  usePaymentsStore((state) => state.getActiveGateways());

/**
 * Hook for components that only need online gateways
 */
export const useOnlinePaymentGateways = () =>
  usePaymentsStore((state) => state.getOnlineGateways());

/**
 * Hook for components that only need stats
 */
export const usePaymentsStats = () => usePaymentsStore((state) => state.stats);

/**
 * Hook for components that only need loading state
 */
export const usePaymentsLoading = () => usePaymentsStore((state) => state.loading);

/**
 * Hook for components that need full access (use sparingly)
 */
export const usePayments = () => usePaymentsStore();
