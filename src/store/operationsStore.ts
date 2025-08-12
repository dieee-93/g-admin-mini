import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';

// Kitchen Operations Types
export interface KitchenOrder {
  id: string;
  table_number?: string;
  items: KitchenOrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served';
  priority: 'normal' | 'high' | 'urgent';
  estimated_time: number;
  created_at: string;
  updated_at: string;
  special_instructions?: string;
}

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready';
  prep_time: number;
  notes?: string;
}

// Table Management Types
export interface TableInfo {
  id: string;
  number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  reserved_at?: string;
  reserved_by?: string;
  location: 'indoor' | 'outdoor' | 'bar' | 'private';
}

// Monitoring Types
export interface OperationMetrics {
  averageOrderTime: number;
  pendingOrders: number;
  completedOrders: number;
  tableOccupancy: number;
  kitchenEfficiency: number;
  peakHours: Array<{ hour: number; orders: number }>;
}

export interface OperationsFilters {
  status: 'all' | 'pending' | 'preparing' | 'ready' | 'served';
  priority: 'all' | 'normal' | 'high' | 'urgent';
  timeRange: 'today' | 'week' | 'month';
  tableStatus: 'all' | 'available' | 'occupied' | 'reserved' | 'cleaning';
}

export interface OperationsState {
  // Kitchen Data
  orders: KitchenOrder[];
  activeOrders: KitchenOrder[];
  completedOrders: KitchenOrder[];
  
  // Table Data
  tables: TableInfo[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: OperationsFilters;
  selectedOrders: string[];
  selectedTables: string[];
  
  // Monitoring
  metrics: OperationMetrics;
  alerts: Array<{
    id: string;
    type: 'delay' | 'table' | 'kitchen' | 'stock';
    message: string;
    severity: 'low' | 'medium' | 'high';
    created_at: string;
  }>;
  
  // Kitchen Actions
  setOrders: (orders: KitchenOrder[]) => void;
  addOrder: (order: Omit<KitchenOrder, 'id' | 'created_at' | 'updated_at'>) => void;
  updateOrder: (id: string, updates: Partial<KitchenOrder>) => void;
  updateOrderStatus: (id: string, status: KitchenOrder['status']) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: KitchenOrderItem['status']) => void;
  deleteOrder: (id: string) => void;
  
  // Table Actions
  setTables: (tables: TableInfo[]) => void;
  updateTableStatus: (id: string, status: TableInfo['status']) => void;
  assignOrderToTable: (tableId: string, orderId: string) => void;
  clearTable: (id: string) => void;
  reserveTable: (id: string, reservedBy: string, reservedAt: string) => void;
  
  // Monitoring Actions
  refreshMetrics: () => void;
  addAlert: (alert: Omit<OperationsState['alerts'][0], 'id' | 'created_at'>) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<OperationsFilters>) => void;
  resetFilters: () => void;
  
  // Selection Actions
  selectOrder: (id: string) => void;
  deselectOrder: (id: string) => void;
  selectTable: (id: string) => void;
  deselectTable: (id: string) => void;
  clearSelections: () => void;
  
  // Computed Selectors
  getFilteredOrders: () => KitchenOrder[];
  getOrdersByStatus: (status: KitchenOrder['status']) => KitchenOrder[];
  getOrdersByPriority: (priority: KitchenOrder['priority']) => KitchenOrder[];
  getAvailableTables: () => TableInfo[];
  getOccupiedTables: () => TableInfo[];
  getTableById: (id: string) => TableInfo | undefined;
  getOrderById: (id: string) => KitchenOrder | undefined;
}

const initialFilters: OperationsFilters = {
  status: 'all',
  priority: 'all',
  timeRange: 'today',
  tableStatus: 'all'
};

export const useOperationsStore = create<OperationsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        orders: [],
        activeOrders: [],
        completedOrders: [],
        tables: [],
        
        loading: false,
        error: null,
        filters: initialFilters,
        selectedOrders: [],
        selectedTables: [],
        
        metrics: {
          averageOrderTime: 0,
          pendingOrders: 0,
          completedOrders: 0,
          tableOccupancy: 0,
          kitchenEfficiency: 0,
          peakHours: []
        },
        alerts: [],

        // Kitchen Actions
        setOrders: (orders) => {
          set(produce((state: OperationsState) => {
            state.orders = orders.map(order => ({
              ...order,
              updated_at: order.updated_at || new Date().toISOString()
            }));
            state.activeOrders = orders.filter(o => o.status !== 'served');
            state.completedOrders = orders.filter(o => o.status === 'served');
          }));
          get().refreshMetrics();
        },

        addOrder: (orderData) => {
          set(produce((state: OperationsState) => {
            const newOrder: KitchenOrder = {
              ...orderData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            state.orders.push(newOrder);
            if (newOrder.status !== 'served') {
              state.activeOrders.push(newOrder);
            }
          }));
          get().refreshMetrics();
        },

        updateOrder: (id, updates) => {
          set(produce((state: OperationsState) => {
            const orderIndex = state.orders.findIndex(order => order.id === id);
            if (orderIndex >= 0) {
              state.orders[orderIndex] = {
                ...state.orders[orderIndex],
                ...updates,
                updated_at: new Date().toISOString()
              };
              
              // Update active/completed lists
              const updatedOrder = state.orders[orderIndex];
              state.activeOrders = state.orders.filter(o => o.status !== 'served');
              state.completedOrders = state.orders.filter(o => o.status === 'served');
            }
          }));
          get().refreshMetrics();
        },

        updateOrderStatus: (id, status) => {
          get().updateOrder(id, { status });
        },

        updateOrderItemStatus: (orderId, itemId, status) => {
          set(produce((state: OperationsState) => {
            const order = state.orders.find(o => o.id === orderId);
            if (order) {
              const item = order.items.find(i => i.id === itemId);
              if (item) {
                item.status = status;
                
                // Auto-update order status based on items
                const allReady = order.items.every(i => i.status === 'ready');
                const anyPreparing = order.items.some(i => i.status === 'preparing');
                
                if (allReady && order.status === 'preparing') {
                  order.status = 'ready';
                } else if (anyPreparing && order.status === 'pending') {
                  order.status = 'preparing';
                }
                
                order.updated_at = new Date().toISOString();
              }
            }
          }));
        },

        deleteOrder: (id) => {
          set(produce((state: OperationsState) => {
            state.orders = state.orders.filter(order => order.id !== id);
            state.activeOrders = state.activeOrders.filter(order => order.id !== id);
            state.completedOrders = state.completedOrders.filter(order => order.id !== id);
            state.selectedOrders = state.selectedOrders.filter(orderId => orderId !== id);
          }));
          get().refreshMetrics();
        },

        // Table Actions
        setTables: (tables) => {
          set(produce((state: OperationsState) => {
            state.tables = tables;
          }));
        },

        updateTableStatus: (id, status) => {
          set(produce((state: OperationsState) => {
            const table = state.tables.find(t => t.id === id);
            if (table) {
              table.status = status;
              
              // Clear order assignment if table becomes available
              if (status === 'available') {
                table.current_order_id = undefined;
                table.reserved_at = undefined;
                table.reserved_by = undefined;
              }
            }
          }));
        },

        assignOrderToTable: (tableId, orderId) => {
          set(produce((state: OperationsState) => {
            const table = state.tables.find(t => t.id === tableId);
            if (table) {
              table.current_order_id = orderId;
              table.status = 'occupied';
            }
          }));
        },

        clearTable: (id) => {
          set(produce((state: OperationsState) => {
            const table = state.tables.find(t => t.id === id);
            if (table) {
              table.current_order_id = undefined;
              table.reserved_at = undefined;
              table.reserved_by = undefined;
              table.status = 'cleaning';
            }
          }));
        },

        reserveTable: (id, reservedBy, reservedAt) => {
          set(produce((state: OperationsState) => {
            const table = state.tables.find(t => t.id === id);
            if (table) {
              table.status = 'reserved';
              table.reserved_by = reservedBy;
              table.reserved_at = reservedAt;
            }
          }));
        },

        // Monitoring Actions
        refreshMetrics: () => {
          set(produce((state: OperationsState) => {
            const orders = state.orders;
            const today = new Date().toDateString();
            const todayOrders = orders.filter(o => 
              new Date(o.created_at).toDateString() === today
            );

            state.metrics = {
              averageOrderTime: calculateAverageOrderTime(orders),
              pendingOrders: orders.filter(o => o.status === 'pending').length,
              completedOrders: orders.filter(o => o.status === 'served').length,
              tableOccupancy: calculateTableOccupancy(state.tables),
              kitchenEfficiency: calculateKitchenEfficiency(orders),
              peakHours: calculatePeakHours(todayOrders)
            };
          }));
        },

        addAlert: (alertData) => {
          set(produce((state: OperationsState) => {
            const newAlert = {
              ...alertData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString()
            };
            state.alerts.unshift(newAlert);
            
            // Keep only latest 50 alerts
            if (state.alerts.length > 50) {
              state.alerts = state.alerts.slice(0, 50);
            }
          }));
        },

        dismissAlert: (id) => {
          set(produce((state: OperationsState) => {
            state.alerts = state.alerts.filter(alert => alert.id !== id);
          }));
        },

        clearAlerts: () => {
          set(produce((state: OperationsState) => {
            state.alerts = [];
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
          set(produce((state: OperationsState) => {
            state.filters = { ...state.filters, ...filters };
          }));
        },

        resetFilters: () => {
          set({ filters: initialFilters });
        },

        // Selection Actions
        selectOrder: (id) => {
          set(produce((state: OperationsState) => {
            if (!state.selectedOrders.includes(id)) {
              state.selectedOrders.push(id);
            }
          }));
        },

        deselectOrder: (id) => {
          set(produce((state: OperationsState) => {
            state.selectedOrders = state.selectedOrders.filter(orderId => orderId !== id);
          }));
        },

        selectTable: (id) => {
          set(produce((state: OperationsState) => {
            if (!state.selectedTables.includes(id)) {
              state.selectedTables.push(id);
            }
          }));
        },

        deselectTable: (id) => {
          set(produce((state: OperationsState) => {
            state.selectedTables = state.selectedTables.filter(tableId => tableId !== id);
          }));
        },

        clearSelections: () => {
          set({ selectedOrders: [], selectedTables: [] });
        },

        // Computed Selectors
        getFilteredOrders: () => {
          const { orders, filters } = get();
          let filtered = [...orders];

          // Filter by status
          if (filters.status !== 'all') {
            filtered = filtered.filter(order => order.status === filters.status);
          }

          // Filter by priority
          if (filters.priority !== 'all') {
            filtered = filtered.filter(order => order.priority === filters.priority);
          }

          // Filter by time range
          const now = new Date();
          switch (filters.timeRange) {
            case 'today':
              filtered = filtered.filter(order => 
                new Date(order.created_at).toDateString() === now.toDateString()
              );
              break;
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              filtered = filtered.filter(order => 
                new Date(order.created_at) >= weekAgo
              );
              break;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              filtered = filtered.filter(order => 
                new Date(order.created_at) >= monthAgo
              );
              break;
          }

          return filtered.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        },

        getOrdersByStatus: (status) => {
          return get().orders.filter(order => order.status === status);
        },

        getOrdersByPriority: (priority) => {
          return get().orders.filter(order => order.priority === priority);
        },

        getAvailableTables: () => {
          return get().tables.filter(table => table.status === 'available');
        },

        getOccupiedTables: () => {
          return get().tables.filter(table => table.status === 'occupied');
        },

        getTableById: (id) => {
          return get().tables.find(table => table.id === id);
        },

        getOrderById: (id) => {
          return get().orders.find(order => order.id === id);
        }
      })),
      {
        name: 'g-mini-operations-storage',
        partialize: (state) => ({
          orders: state.orders,
          tables: state.tables,
          filters: state.filters
        })
      }
    ),
    {
      name: 'OperationsStore'
    }
  )
);

// Helper functions
function calculateAverageOrderTime(orders: KitchenOrder[]): number {
  const completedOrders = orders.filter(o => o.status === 'served');
  if (completedOrders.length === 0) return 0;
  
  const totalTime = completedOrders.reduce((sum, order) => {
    const startTime = new Date(order.created_at).getTime();
    const endTime = new Date(order.updated_at).getTime();
    return sum + (endTime - startTime);
  }, 0);
  
  return Math.round(totalTime / completedOrders.length / 1000 / 60); // minutes
}

function calculateTableOccupancy(tables: TableInfo[]): number {
  if (tables.length === 0) return 0;
  const occupiedCount = tables.filter(t => t.status === 'occupied' || t.status === 'reserved').length;
  return Math.round((occupiedCount / tables.length) * 100);
}

function calculateKitchenEfficiency(orders: KitchenOrder[]): number {
  const recentOrders = orders.filter(o => {
    const orderTime = new Date(o.created_at).getTime();
    const hourAgo = new Date().getTime() - (60 * 60 * 1000);
    return orderTime >= hourAgo;
  });
  
  if (recentOrders.length === 0) return 100;
  
  const onTimeOrders = recentOrders.filter(o => {
    if (o.status !== 'served') return false;
    const actualTime = new Date(o.updated_at).getTime() - new Date(o.created_at).getTime();
    const expectedTime = o.estimated_time * 60 * 1000; // convert to ms
    return actualTime <= expectedTime * 1.2; // 20% tolerance
  });
  
  return Math.round((onTimeOrders.length / recentOrders.length) * 100);
}

function calculatePeakHours(orders: KitchenOrder[]): Array<{ hour: number; orders: number }> {
  const hourCounts = Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0 }));
  
  orders.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourCounts[hour].orders++;
  });
  
  return hourCounts.filter(h => h.orders > 0).sort((a, b) => b.orders - a.orders);
}