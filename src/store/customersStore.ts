import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Customer analytics
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  average_order_value: number;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'active' | 'inactive' | 'vip';
}

export interface CustomerFilters {
  search: string;
  status: 'all' | Customer['status'];
  loyalty_tier: 'all' | Customer['loyalty_tier'];
  sortBy: 'name' | 'total_spent' | 'last_order' | 'created';
  sortOrder: 'asc' | 'desc';
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  vipCustomers: number;
  averageLifetimeValue: number;
  retentionRate: number;
  loyaltyDistribution: Record<Customer['loyalty_tier'], number>;
}

export interface CustomersState {
  // Data
  customers: Customer[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: CustomerFilters;
  selectedCustomers: string[];
  
  // Modal states
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view';
  currentCustomer: Customer | null;
  
  // Analytics
  stats: CustomerStats;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_orders' | 'total_spent' | 'average_order_value' | 'loyalty_tier' | 'status'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Customer analytics
  updateCustomerStats: (customerId: string, orderValue: number) => void;
  calculateLoyaltyTier: (customer: Customer) => Customer['loyalty_tier'];
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<CustomerFilters>) => void;
  resetFilters: () => void;
  
  selectCustomer: (id: string) => void;
  deselectCustomer: (id: string) => void;
  selectAllCustomers: () => void;
  deselectAllCustomers: () => void;
  
  // Modal actions
  openModal: (mode: 'add' | 'edit' | 'view', customer?: Customer) => void;
  closeModal: () => void;
  
  // Stats
  refreshStats: () => void;
  
  // Computed selectors
  getFilteredCustomers: () => Customer[];
  getTopCustomers: (limit?: number) => Customer[];
  getCustomersByTier: () => Record<Customer['loyalty_tier'], Customer[]>;
  getInactiveCustomers: () => Customer[];
}

const initialFilters: CustomerFilters = {
  search: '',
  status: 'all',
  loyalty_tier: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

export const useCustomersStore = create<CustomersState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        customers: [],
        
        loading: false,
        error: null,
        filters: initialFilters,
        selectedCustomers: [],
        
        isModalOpen: false,
        modalMode: 'add',
        currentCustomer: null,
        
        stats: {
          totalCustomers: 0,
          activeCustomers: 0,
          newThisMonth: 0,
          vipCustomers: 0,
          averageLifetimeValue: 0,
          retentionRate: 0,
          loyaltyDistribution: {
            bronze: 0,
            silver: 0,
            gold: 0,
            platinum: 0
          }
        },

        // Actions
        setCustomers: (customers) => {
          set((state) => {
            state.customers = customers.map(customer => ({
              ...customer,
              loyalty_tier: get().calculateLoyaltyTier(customer),
              status: determineCustomerStatus(customer)
            }));
          });
          get().refreshStats();
        },

        addCustomer: (customerData) => {
          set((state) => {
            const newCustomer: Customer = {
              ...customerData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              total_orders: 0,
              total_spent: 0,
              average_order_value: 0,
              loyalty_tier: 'bronze',
              status: 'active'
            };
            state.customers.push(newCustomer);
          });
          get().refreshStats();
        },

        updateCustomer: (id, updates) => {
          set((state) => {
            const customerIndex = state.customers.findIndex(customer => customer.id === id);
            if (customerIndex >= 0) {
              const updatedCustomer = {
                ...state.customers[customerIndex],
                ...updates,
                updated_at: new Date().toISOString()
              };
              updatedCustomer.loyalty_tier = get().calculateLoyaltyTier(updatedCustomer);
              updatedCustomer.status = determineCustomerStatus(updatedCustomer);
              state.customers[customerIndex] = updatedCustomer;
            }
          });
          get().refreshStats();
        },

        deleteCustomer: (id) => {
          set((state) => {
            state.customers = state.customers.filter(customer => customer.id !== id);
            state.selectedCustomers = state.selectedCustomers.filter(selectedId => selectedId !== id);
          });
          get().refreshStats();
        },

        // Customer analytics
        updateCustomerStats: (customerId, orderValue) => {
          set((state) => {
            const customerIndex = state.customers.findIndex(customer => customer.id === customerId);
            if (customerIndex >= 0) {
              const customer = state.customers[customerIndex];
              customer.total_orders += 1;
              customer.total_spent += orderValue;
              customer.average_order_value = customer.total_spent / customer.total_orders;
              customer.last_order_date = new Date().toISOString();
              customer.loyalty_tier = get().calculateLoyaltyTier(customer);
              customer.status = determineCustomerStatus(customer);
              customer.updated_at = new Date().toISOString();
            }
          });
          get().refreshStats();
        },

        calculateLoyaltyTier: (customer) => {
          if (customer.total_spent >= 100000) return 'platinum';
          if (customer.total_spent >= 50000) return 'gold';
          if (customer.total_spent >= 20000) return 'silver';
          return 'bronze';
        },

        // UI actions
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

        selectCustomer: (id) => {
          set((state) => {
            if (!state.selectedCustomers.includes(id)) {
              state.selectedCustomers.push(id);
            }
          });
        },

        deselectCustomer: (id) => {
          set((state) => {
            state.selectedCustomers = state.selectedCustomers.filter(selectedId => selectedId !== id);
          });
        },

        selectAllCustomers: () => {
          const filteredCustomers = get().getFilteredCustomers();
          set((state) => {
            state.selectedCustomers = filteredCustomers.map(customer => customer.id);
          });
        },

        deselectAllCustomers: () => {
          set((state) => {
            state.selectedCustomers = [];
          });
        },

        // Modal actions
        openModal: (mode, customer = null) => {
          set((state) => {
            state.isModalOpen = true;
            state.modalMode = mode;
            state.currentCustomer = customer;
          });
        },

        closeModal: () => {
          set((state) => {
            state.isModalOpen = false;
            state.currentCustomer = null;
          });
        },

        // Stats
        refreshStats: () => {
          const { customers } = get();
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

          const activeCustomers = customers.filter(customer => customer.status === 'active');
          const newThisMonth = customers.filter(customer => 
            new Date(customer.created_at) >= monthStart
          );
          const vipCustomers = customers.filter(customer => customer.status === 'vip');
          
          const recentCustomers = customers.filter(customer =>
            customer.last_order_date && new Date(customer.last_order_date) >= threeMonthsAgo
          );

          const loyaltyDistribution = customers.reduce((acc, customer) => {
            acc[customer.loyalty_tier] += 1;
            return acc;
          }, { bronze: 0, silver: 0, gold: 0, platinum: 0 });

          const stats: CustomerStats = {
            totalCustomers: customers.length,
            activeCustomers: activeCustomers.length,
            newThisMonth: newThisMonth.length,
            vipCustomers: vipCustomers.length,
            averageLifetimeValue: customers.length > 0
              ? customers.reduce((sum, customer) => sum + customer.total_spent, 0) / customers.length
              : 0,
            retentionRate: customers.length > 0 
              ? (recentCustomers.length / customers.length) * 100
              : 0,
            loyaltyDistribution
          };

          set((state) => {
            state.stats = stats;
          });
        },

        // Computed selectors
        getFilteredCustomers: () => {
          const { customers, filters } = get();
          let filtered = [...customers];

          // Search filter
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(customer =>
              customer.name.toLowerCase().includes(search) ||
              customer.email?.toLowerCase().includes(search) ||
              customer.phone?.includes(search)
            );
          }

          // Status filter
          if (filters.status !== 'all') {
            filtered = filtered.filter(customer => customer.status === filters.status);
          }

          // Loyalty tier filter
          if (filters.loyalty_tier !== 'all') {
            filtered = filtered.filter(customer => customer.loyalty_tier === filters.loyalty_tier);
          }

          // Sort
          filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (filters.sortBy) {
              case 'total_spent':
                aValue = a.total_spent;
                bValue = b.total_spent;
                break;
              case 'last_order':
                aValue = a.last_order_date ? new Date(a.last_order_date).getTime() : 0;
                bValue = b.last_order_date ? new Date(b.last_order_date).getTime() : 0;
                break;
              case 'created':
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
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

        getTopCustomers: (limit = 10) => {
          const { customers } = get();
          return [...customers]
            .sort((a, b) => b.total_spent - a.total_spent)
            .slice(0, limit);
        },

        getCustomersByTier: () => {
          const { customers } = get();
          return customers.reduce((acc, customer) => {
            if (!acc[customer.loyalty_tier]) {
              acc[customer.loyalty_tier] = [];
            }
            acc[customer.loyalty_tier].push(customer);
            return acc;
          }, {} as Record<Customer['loyalty_tier'], Customer[]>);
        },

        getInactiveCustomers: () => {
          const { customers } = get();
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          
          return customers.filter(customer => 
            !customer.last_order_date || 
            new Date(customer.last_order_date) < threeMonthsAgo
          );
        }
      })),
      {
        name: 'g-mini-customers-storage',
        partialize: (state) => ({
          customers: state.customers,
          filters: state.filters
        })
      }
    ),
    {
      name: 'CustomersStore'
    }
  )
);

// Helper function to determine customer status
function determineCustomerStatus(customer: Customer): Customer['status'] {
  if (customer.total_spent >= 100000 || customer.total_orders >= 50) {
    return 'vip';
  }
  
  if (customer.last_order_date) {
    const daysSinceLastOrder = Math.floor(
      (Date.now() - new Date(customer.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastOrder > 90) {
      return 'inactive';
    }
  }
  
  return 'active';
}