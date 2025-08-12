import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';

// Invoice Types
export interface Invoice {
  id: string;
  number: string;
  type: 'A' | 'B' | 'C' | 'E' | 'M'; // AFIP invoice types
  customer_id?: string;
  customer_name: string;
  customer_document: string;
  customer_address?: string;
  
  // Financial details
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: 'ARS' | 'USD';
  exchange_rate?: number;
  
  // AFIP details
  cae?: string; // CAE number from AFIP
  cae_due_date?: string;
  afip_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  
  // Items
  items: InvoiceItem[];
  
  // Metadata
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issued_date: string;
  due_date?: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}

// Tax Configuration
export interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  type: 'IVA' | 'IIBB' | 'municipal' | 'other';
  applies_to: 'products' | 'services' | 'both';
  active: boolean;
}

// AFIP Configuration
export interface AFIPConfig {
  environment: 'production' | 'testing';
  cuit: string;
  certificate_path?: string;
  key_path?: string;
  last_sync?: string;
  point_of_sale: number;
  next_invoice_number: Record<string, number>; // by invoice type
}

// Financial Reports
export interface FinancialReport {
  id: string;
  type: 'sales' | 'taxes' | 'profit_loss' | 'balance_sheet';
  period_start: string;
  period_end: string;
  generated_at: string;
  data: FinancialReportData;
}

export interface FinancialReportData {
  sales_summary: {
    total_invoices: number;
    total_revenue: number;
    total_tax_collected: number;
    average_invoice_value: number;
  };
  tax_breakdown: Array<{
    tax_name: string;
    amount: number;
    rate: number;
  }>;
  period_comparison?: {
    revenue_change: number;
    invoice_count_change: number;
    average_value_change: number;
  };
}

export interface FiscalFilters {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  status: 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoiceType: 'all' | 'A' | 'B' | 'C' | 'E' | 'M';
  afipStatus: 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled';
}

export interface FiscalState {
  // Data
  invoices: Invoice[];
  taxConfigs: TaxConfig[];
  afipConfig: AFIPConfig | null;
  reports: FinancialReport[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: FiscalFilters;
  selectedInvoices: string[];
  isModalOpen: boolean;
  modalMode: 'create' | 'edit' | 'view' | 'print';
  currentInvoice: Invoice | null;
  
  // Stats
  stats: {
    totalRevenue: number;
    totalTaxes: number;
    pendingInvoices: number;
    overdueInvoices: number;
    monthlyRevenue: number;
    monthlyTaxes: number;
  };
  
  // Invoice Actions
  setInvoices: (invoices: Invoice[]) => void;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'created_at' | 'updated_at'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => void;
  sendToAFIP: (id: string) => void;
  markAsPaid: (id: string, paidDate?: string) => void;
  cancelInvoice: (id: string) => void;
  
  // Tax Configuration Actions
  setTaxConfigs: (configs: TaxConfig[]) => void;
  addTaxConfig: (config: Omit<TaxConfig, 'id'>) => void;
  updateTaxConfig: (id: string, updates: Partial<TaxConfig>) => void;
  deleteTaxConfig: (id: string) => void;
  
  // AFIP Actions
  updateAFIPConfig: (config: Partial<AFIPConfig>) => void;
  syncWithAFIP: () => void;
  testAFIPConnection: () => void;
  
  // Reports Actions
  generateReport: (type: FinancialReport['type'], startDate: string, endDate: string) => void;
  setReports: (reports: FinancialReport[]) => void;
  deleteReport: (id: string) => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<FiscalFilters>) => void;
  resetFilters: () => void;
  
  // Selection Actions
  selectInvoice: (id: string) => void;
  deselectInvoice: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  // Modal Actions
  openModal: (mode: FiscalState['modalMode'], invoice?: Invoice) => void;
  closeModal: () => void;
  
  // Stats
  refreshStats: () => void;
  
  // Computed Selectors
  getFilteredInvoices: () => Invoice[];
  getInvoicesByStatus: (status: Invoice['status']) => Invoice[];
  getOverdueInvoices: () => Invoice[];
  getPendingAFIPInvoices: () => Invoice[];
  calculateTotalTax: (invoiceId: string) => number;
  getNextInvoiceNumber: (type: Invoice['type']) => string;
  getTaxSummary: (startDate: string, endDate: string) => Array<{ tax: string; amount: number }>;
}

const initialFilters: FiscalFilters = {
  dateRange: 'month',
  status: 'all',
  invoiceType: 'all',
  afipStatus: 'all'
};

const defaultAFIPConfig: AFIPConfig = {
  environment: 'testing',
  cuit: '',
  point_of_sale: 1,
  next_invoice_number: {
    'A': 1,
    'B': 1,
    'C': 1,
    'E': 1,
    'M': 1
  }
};

export const useFiscalStore = create<FiscalState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        invoices: [],
        taxConfigs: [],
        afipConfig: defaultAFIPConfig,
        reports: [],
        
        loading: false,
        error: null,
        filters: initialFilters,
        selectedInvoices: [],
        isModalOpen: false,
        modalMode: 'create',
        currentInvoice: null,
        
        stats: {
          totalRevenue: 0,
          totalTaxes: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
          monthlyRevenue: 0,
          monthlyTaxes: 0
        },

        // Invoice Actions
        setInvoices: (invoices) => {
          set({ invoices });
          get().refreshStats();
        },

        createInvoice: (invoiceData) => {
          set(produce((state: FiscalState) => {
            const newInvoice: Invoice = {
              ...invoiceData,
              id: crypto.randomUUID(),
              number: get().getNextInvoiceNumber(invoiceData.type),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              afip_status: 'pending'
            };
            
            state.invoices.push(newInvoice);
            
            // Update next invoice number
            if (state.afipConfig) {
              state.afipConfig.next_invoice_number[invoiceData.type]++;
            }
          }));
          get().refreshStats();
        },

        updateInvoice: (id, updates) => {
          set(produce((state: FiscalState) => {
            const invoiceIndex = state.invoices.findIndex(inv => inv.id === id);
            if (invoiceIndex >= 0) {
              state.invoices[invoiceIndex] = {
                ...state.invoices[invoiceIndex],
                ...updates,
                updated_at: new Date().toISOString()
              };
            }
          }));
          get().refreshStats();
        },

        deleteInvoice: (id) => {
          set(produce((state: FiscalState) => {
            state.invoices = state.invoices.filter(inv => inv.id !== id);
            state.selectedInvoices = state.selectedInvoices.filter(invId => invId !== id);
          }));
          get().refreshStats();
        },

        duplicateInvoice: (id) => {
          const original = get().invoices.find(inv => inv.id === id);
          if (original) {
            const duplicate = {
              ...original,
              customer_name: original.customer_name,
              customer_document: original.customer_document,
              customer_address: original.customer_address,
              items: original.items,
              subtotal: original.subtotal,
              tax_amount: original.tax_amount,
              total: original.total,
              currency: original.currency,
              type: original.type,
              status: 'draft' as const,
              issued_date: new Date().toISOString()
            };
            get().createInvoice(duplicate);
          }
        },

        sendToAFIP: (id) => {
          // This would integrate with AFIP API
          get().updateInvoice(id, {
            afip_status: 'approved',
            cae: generateMockCAE(),
            cae_due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days from now
          });
        },

        markAsPaid: (id, paidDate) => {
          get().updateInvoice(id, {
            status: 'paid',
            paid_date: paidDate || new Date().toISOString()
          });
        },

        cancelInvoice: (id) => {
          get().updateInvoice(id, { status: 'cancelled' });
        },

        // Tax Configuration Actions
        setTaxConfigs: (configs) => {
          set({ taxConfigs: configs });
        },

        addTaxConfig: (configData) => {
          set(produce((state: FiscalState) => {
            const newConfig: TaxConfig = {
              ...configData,
              id: crypto.randomUUID()
            };
            state.taxConfigs.push(newConfig);
          }));
        },

        updateTaxConfig: (id, updates) => {
          set(produce((state: FiscalState) => {
            const configIndex = state.taxConfigs.findIndex(config => config.id === id);
            if (configIndex >= 0) {
              state.taxConfigs[configIndex] = { ...state.taxConfigs[configIndex], ...updates };
            }
          }));
        },

        deleteTaxConfig: (id) => {
          set(produce((state: FiscalState) => {
            state.taxConfigs = state.taxConfigs.filter(config => config.id !== id);
          }));
        },

        // AFIP Actions
        updateAFIPConfig: (config) => {
          set(produce((state: FiscalState) => {
            state.afipConfig = { ...state.afipConfig!, ...config };
          }));
        },

        syncWithAFIP: () => {
          set({ loading: true });
          // Mock AFIP sync - in real implementation this would call AFIP API
          setTimeout(() => {
            set(produce((state: FiscalState) => {
              if (state.afipConfig) {
                state.afipConfig.last_sync = new Date().toISOString();
              }
              state.loading = false;
            }));
          }, 2000);
        },

        testAFIPConnection: () => {
          set({ loading: true, error: null });
          // Mock connection test
          setTimeout(() => {
            set({ loading: false });
          }, 1500);
        },

        // Reports Actions
        generateReport: (type, startDate, endDate) => {
          const invoices = get().invoices.filter(inv => {
            const invoiceDate = new Date(inv.issued_date);
            return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
          });

          const reportData: FinancialReportData = {
            sales_summary: {
              total_invoices: invoices.length,
              total_revenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
              total_tax_collected: invoices.reduce((sum, inv) => sum + inv.tax_amount, 0),
              average_invoice_value: invoices.length > 0 
                ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length 
                : 0
            },
            tax_breakdown: calculateTaxBreakdown(invoices, get().taxConfigs)
          };

          const newReport: FinancialReport = {
            id: crypto.randomUUID(),
            type,
            period_start: startDate,
            period_end: endDate,
            generated_at: new Date().toISOString(),
            data: reportData
          };

          set(produce((state: FiscalState) => {
            state.reports.push(newReport);
          }));
        },

        setReports: (reports) => {
          set({ reports });
        },

        deleteReport: (id) => {
          set(produce((state: FiscalState) => {
            state.reports = state.reports.filter(report => report.id !== id);
          }));
        },

        // UI Actions
        setLoading: (loading) => {
          set({ loading });
        },

        setError: (error) => {
          set({ error });
        },

        setFilters: (filters) => {
          set(produce((state: FiscalState) => {
            state.filters = { ...state.filters, ...filters };
          }));
        },

        resetFilters: () => {
          set({ filters: initialFilters });
        },

        // Selection Actions
        selectInvoice: (id) => {
          set(produce((state: FiscalState) => {
            if (!state.selectedInvoices.includes(id)) {
              state.selectedInvoices.push(id);
            }
          }));
        },

        deselectInvoice: (id) => {
          set(produce((state: FiscalState) => {
            state.selectedInvoices = state.selectedInvoices.filter(invId => invId !== id);
          }));
        },

        selectAll: () => {
          const filteredInvoices = get().getFilteredInvoices();
          set({ selectedInvoices: filteredInvoices.map(inv => inv.id) });
        },

        deselectAll: () => {
          set({ selectedInvoices: [] });
        },

        // Modal Actions
        openModal: (mode, invoice) => {
          set({
            isModalOpen: true,
            modalMode: mode,
            currentInvoice: invoice || null
          });
        },

        closeModal: () => {
          set({
            isModalOpen: false,
            modalMode: 'create',
            currentInvoice: null
          });
        },

        // Stats
        refreshStats: () => {
          set(produce((state: FiscalState) => {
            const invoices = state.invoices;
            const now = new Date();
            const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthlyInvoices = invoices.filter(inv => 
              new Date(inv.issued_date) >= currentMonth
            );

            state.stats = {
              totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
              totalTaxes: invoices.reduce((sum, inv) => sum + inv.tax_amount, 0),
              pendingInvoices: invoices.filter(inv => inv.status === 'sent').length,
              overdueInvoices: invoices.filter(inv => 
                inv.status === 'sent' && 
                inv.due_date && 
                new Date(inv.due_date) < now
              ).length,
              monthlyRevenue: monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0),
              monthlyTaxes: monthlyInvoices.reduce((sum, inv) => sum + inv.tax_amount, 0)
            };
          }));
        },

        // Computed Selectors
        getFilteredInvoices: () => {
          const { invoices, filters } = get();
          let filtered = [...invoices];

          // Filter by date range
          const now = new Date();
          let startDate: Date;
          
          switch (filters.dateRange) {
            case 'today':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case 'week':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case 'month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              break;
            case 'quarter':
              const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
              startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
              break;
            case 'year':
              startDate = new Date(now.getFullYear(), 0, 1);
              break;
            case 'custom':
              if (filters.customDateStart) {
                startDate = new Date(filters.customDateStart);
              } else {
                startDate = new Date(0);
              }
              break;
            default:
              startDate = new Date(0);
          }

          filtered = filtered.filter(invoice => {
            const invoiceDate = new Date(invoice.issued_date);
            let inDateRange = invoiceDate >= startDate;
            
            if (filters.dateRange === 'custom' && filters.customDateEnd) {
              inDateRange = inDateRange && invoiceDate <= new Date(filters.customDateEnd);
            }
            
            return inDateRange;
          });

          // Filter by status
          if (filters.status !== 'all') {
            filtered = filtered.filter(invoice => invoice.status === filters.status);
          }

          // Filter by invoice type
          if (filters.invoiceType !== 'all') {
            filtered = filtered.filter(invoice => invoice.type === filters.invoiceType);
          }

          // Filter by AFIP status
          if (filters.afipStatus !== 'all') {
            filtered = filtered.filter(invoice => invoice.afip_status === filters.afipStatus);
          }

          return filtered.sort((a, b) => 
            new Date(b.issued_date).getTime() - new Date(a.issued_date).getTime()
          );
        },

        getInvoicesByStatus: (status) => {
          return get().invoices.filter(invoice => invoice.status === status);
        },

        getOverdueInvoices: () => {
          const now = new Date();
          return get().invoices.filter(invoice =>
            invoice.status === 'sent' &&
            invoice.due_date &&
            new Date(invoice.due_date) < now
          );
        },

        getPendingAFIPInvoices: () => {
          return get().invoices.filter(invoice => invoice.afip_status === 'pending');
        },

        calculateTotalTax: (invoiceId) => {
          const invoice = get().invoices.find(inv => inv.id === invoiceId);
          return invoice ? invoice.tax_amount : 0;
        },

        getNextInvoiceNumber: (type) => {
          const config = get().afipConfig;
          if (!config) return '00001';
          
          const nextNumber = config.next_invoice_number[type] || 1;
          return String(nextNumber).padStart(8, '0');
        },

        getTaxSummary: (startDate, endDate) => {
          const invoices = get().invoices.filter(inv => {
            const invoiceDate = new Date(inv.issued_date);
            return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
          });
          
          const taxConfigs = get().taxConfigs;
          return calculateTaxBreakdown(invoices, taxConfigs);
        }
      })),
      {
        name: 'g-mini-fiscal-storage',
        partialize: (state) => ({
          invoices: state.invoices,
          taxConfigs: state.taxConfigs,
          afipConfig: state.afipConfig,
          reports: state.reports,
          filters: state.filters
        })
      }
    ),
    {
      name: 'FiscalStore'
    }
  )
);

// Helper functions
function generateMockCAE(): string {
  return Math.random().toString().slice(2, 16);
}

function calculateTaxBreakdown(
  invoices: Invoice[], 
  taxConfigs: TaxConfig[]
): Array<{ tax: string; amount: number; rate: number }> {
  const breakdown = new Map<string, { amount: number; rate: number }>();
  
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const taxConfig = taxConfigs.find(config => 
        config.rate === item.tax_rate && config.active
      );
      const taxName = taxConfig?.name || `Tax ${item.tax_rate}%`;
      
      if (breakdown.has(taxName)) {
        breakdown.get(taxName)!.amount += item.tax_amount;
      } else {
        breakdown.set(taxName, {
          amount: item.tax_amount,
          rate: item.tax_rate
        });
      }
    });
  });
  
  return Array.from(breakdown.entries()).map(([tax, data]) => ({
    tax,
    amount: data.amount,
    rate: data.rate
  }));
}