import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================
// STATE
// ============================================

export interface FiscalState {
  // Fiscal config (domain-specific)
  taxId?: string;              // Tax identification number (generic)
  afipCuit?: string;           // CUIT for Argentina (AFIP)
  invoicingEnabled: boolean;   // Whether invoicing is enabled

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  setTaxId: (taxId: string) => void;
  setAfipCuit: (cuit: string) => void;
  setInvoicingEnabled: (enabled: boolean) => void;
  updateFiscalConfig: (config: Partial<Pick<FiscalState, 'taxId' | 'afipCuit' | 'invoicingEnabled'>>) => void;
}

// ============================================
// STORE
// ============================================

export const useFiscalStore = create<FiscalState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        taxId: undefined,
        afipCuit: undefined,
        invoicingEnabled: false,
        isLoading: false,
        error: null,

        // Actions
        setTaxId: (taxId) => {
          set({ taxId }, false, 'setTaxId');
        },

        setAfipCuit: (cuit) => {
          set({ afipCuit: cuit }, false, 'setAfipCuit');
        },

        setInvoicingEnabled: (enabled) => {
          set({ invoicingEnabled: enabled }, false, 'setInvoicingEnabled');
        },

        updateFiscalConfig: (config) => {
          set((state) => ({
            ...state,
            ...config
          }), false, 'updateFiscalConfig');
        }
      }),
      {
        name: 'g-mini-fiscal-storage',
        partialize: (state) => ({
          taxId: state.taxId,
          afipCuit: state.afipCuit,
          invoicingEnabled: state.invoicingEnabled
        })
      }
    ),
    {
      name: 'FiscalStore'
    }
  )
);