/**
 * Fiscal Store - UI State Only
 * 
 * ⚠️ DEPRECATED FOR SERVER DATA
 * Server state has been migrated to TanStack Query hooks:
 * - Tax config → useTaxConfig() in finance-fiscal/hooks
 * - AFIP config → useAFIPConfig() in finance-fiscal/hooks
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

export interface FiscalState {
  // UI State - Current view
  selectedView: 'general' | 'afip' | 'invoices';
  
  // UI State - Invoice filters
  invoiceFilters: {
    status: 'all' | 'pending' | 'approved' | 'rejected';
    dateFrom: string | null;
    dateTo: string | null;
    searchQuery: string;
  };

  // UI State - Selections
  selectedInvoiceId: string | null;

  // Actions
  setSelectedView: (view: 'general' | 'afip' | 'invoices') => void;
  setInvoiceFilters: (filters: Partial<FiscalState['invoiceFilters']>) => void;
  resetInvoiceFilters: () => void;
  setSelectedInvoiceId: (id: string | null) => void;
}

// ============================================
// STORE
// ============================================

export const useFiscalStore = create<FiscalState>()(
  devtools(
    (set) => ({
      // Initial UI state
      selectedView: 'general',
      invoiceFilters: {
        status: 'all',
        dateFrom: null,
        dateTo: null,
        searchQuery: '',
      },
      selectedInvoiceId: null,

      // Actions
      setSelectedView: (view) => set({ selectedView: view }),
      
      setInvoiceFilters: (filters) => {
        set((state) => ({
          invoiceFilters: { ...state.invoiceFilters, ...filters }
        }));
      },

      resetInvoiceFilters: () => {
        set({
          invoiceFilters: {
            status: 'all',
            dateFrom: null,
            dateTo: null,
            searchQuery: '',
          }
        });
      },

      setSelectedInvoiceId: (id) => set({ selectedInvoiceId: id }),
    }),
    { name: 'FiscalStore' }
  )
);