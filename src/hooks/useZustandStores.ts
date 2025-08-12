// Custom hooks for accessing Zustand stores with better TypeScript support

import { useAppStore } from '@/store/appStore';
import { useMaterialsStore, useInventoryStore } from '@/store/materialsStore';
import { useSalesStore } from '@/store/salesStore';
import { useCustomersStore } from '@/store/customersStore';
import { useStaffStore } from '@/store/staffStore';

// App Store Hook
export const useApp = () => {
  const user = useAppStore(state => state.user);
  const ui = useAppStore(state => state.ui);
  const network = useAppStore(state => state.network);
  const settings = useAppStore(state => state.settings);
  const actions = useAppStore(state => ({
    setUser: state.setUser,
    logout: state.logout,
    toggleSidebar: state.toggleSidebar,
    setTheme: state.setTheme,
    setLoading: state.setLoading,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    setNetworkStatus: state.setNetworkStatus,
    updateLastSync: state.updateLastSync,
    setPendingSyncs: state.setPendingSyncs,
    updateSettings: state.updateSettings,
    handleError: state.handleError
  }));

  return {
    user,
    ui,
    network,
    settings,
    ...actions
  };
};

// Materials Store Hook (new preferred name)
export const useMaterials = () => {
  const items = useMaterialsStore(state => state.items);
  const categories = useMaterialsStore(state => state.categories);
  const loading = useMaterialsStore(state => state.loading);
  const error = useMaterialsStore(state => state.error);
  const filters = useMaterialsStore(state => state.filters);
  const stats = useMaterialsStore(state => state.stats);
  const selectedItems = useMaterialsStore(state => state.selectedItems);
  const isModalOpen = useMaterialsStore(state => state.isModalOpen);
  const modalMode = useMaterialsStore(state => state.modalMode);
  const currentItem = useMaterialsStore(state => state.currentItem);
  
  const actions = useMaterialsStore(state => ({
    setItems: state.setItems,
    addItem: state.addItem,
    updateItem: state.updateItem,
    deleteItem: state.deleteItem,
    bulkUpdateStock: state.bulkUpdateStock,
    setLoading: state.setLoading,
    setError: state.setError,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    selectItem: state.selectItem,
    deselectItem: state.deselectItem,
    selectAll: state.selectAll,
    deselectAll: state.deselectAll,
    openModal: state.openModal,
    closeModal: state.closeModal,
    refreshStats: state.refreshStats
  }));

  const selectors = useMaterialsStore(state => ({
    getFilteredItems: state.getFilteredItems,
    getLowStockItems: state.getLowStockItems,
    getCriticalStockItems: state.getCriticalStockItems,
    getItemsByCategory: state.getItemsByCategory
  }));

  return {
    items,
    categories,
    loading,
    error,
    filters,
    stats,
    selectedItems,
    isModalOpen,
    modalMode,
    currentItem,
    ...actions,
    ...selectors
  };
};

// Legacy Inventory Store Hook (backwards compatibility)
export const useInventory = () => {
  const items = useInventoryStore(state => state.items);
  const categories = useInventoryStore(state => state.categories);
  const loading = useInventoryStore(state => state.loading);
  const error = useInventoryStore(state => state.error);
  const filters = useInventoryStore(state => state.filters);
  const stats = useInventoryStore(state => state.stats);
  const selectedItems = useInventoryStore(state => state.selectedItems);
  const isModalOpen = useInventoryStore(state => state.isModalOpen);
  const modalMode = useInventoryStore(state => state.modalMode);
  const currentItem = useInventoryStore(state => state.currentItem);
  
  const actions = useInventoryStore(state => ({
    setItems: state.setItems,
    addItem: state.addItem,
    updateItem: state.updateItem,
    deleteItem: state.deleteItem,
    bulkUpdateStock: state.bulkUpdateStock,
    setLoading: state.setLoading,
    setError: state.setError,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    selectItem: state.selectItem,
    deselectItem: state.deselectItem,
    selectAll: state.selectAll,
    deselectAll: state.deselectAll,
    openModal: state.openModal,
    closeModal: state.closeModal,
    refreshStats: state.refreshStats
  }));

  const selectors = useInventoryStore(state => ({
    getFilteredItems: state.getFilteredItems,
    getLowStockItems: state.getLowStockItems,
    getCriticalStockItems: state.getCriticalStockItems,
    getItemsByCategory: state.getItemsByCategory
  }));

  return {
    items,
    categories,
    loading,
    error,
    filters,
    stats,
    selectedItems,
    isModalOpen,
    modalMode,
    currentItem,
    ...actions,
    ...selectors
  };
};

// Sales Store Hook
export const useSales = () => {
  const sales = useSalesStore(state => state.sales);
  const cart = useSalesStore(state => state.cart);
  const currentSale = useSalesStore(state => state.currentSale);
  const loading = useSalesStore(state => state.loading);
  const error = useSalesStore(state => state.error);
  const filters = useSalesStore(state => state.filters);
  const stats = useSalesStore(state => state.stats);
  const kitchenOrders = useSalesStore(state => state.kitchenOrders);
  const activeKitchenOrder = useSalesStore(state => state.activeKitchenOrder);
  
  const modalStates = useSalesStore(state => ({
    isCheckoutModalOpen: state.isCheckoutModalOpen,
    isReceiptModalOpen: state.isReceiptModalOpen,
    isRefundModalOpen: state.isRefundModalOpen,
    currentReceipt: state.currentReceipt
  }));

  const actions = useSalesStore(state => ({
    setSales: state.setSales,
    addSale: state.addSale,
    updateSale: state.updateSale,
    deleteSale: state.deleteSale,
    addToCart: state.addToCart,
    updateCartItem: state.updateCartItem,
    removeFromCart: state.removeFromCart,
    clearCart: state.clearCart,
    startCheckout: state.startCheckout,
    completeSale: state.completeSale,
    updateKitchenStatus: state.updateKitchenStatus,
    setActiveKitchenOrder: state.setActiveKitchenOrder,
    setLoading: state.setLoading,
    setError: state.setError,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    openCheckoutModal: state.openCheckoutModal,
    closeCheckoutModal: state.closeCheckoutModal,
    openReceiptModal: state.openReceiptModal,
    closeReceiptModal: state.closeReceiptModal,
    openRefundModal: state.openRefundModal,
    closeRefundModal: state.closeRefundModal,
    refreshStats: state.refreshStats
  }));

  const selectors = useSalesStore(state => ({
    getFilteredSales: state.getFilteredSales,
    getCartTotal: state.getCartTotal,
    getCartItemCount: state.getCartItemCount,
    getTodaySales: state.getTodaySales,
    getPendingKitchenOrders: state.getPendingKitchenOrders
  }));

  return {
    sales,
    cart,
    currentSale,
    loading,
    error,
    filters,
    stats,
    kitchenOrders,
    activeKitchenOrder,
    ...modalStates,
    ...actions,
    ...selectors
  };
};

// Customers Store Hook
export const useCustomers = () => {
  const customers = useCustomersStore(state => state.customers);
  const loading = useCustomersStore(state => state.loading);
  const error = useCustomersStore(state => state.error);
  const filters = useCustomersStore(state => state.filters);
  const stats = useCustomersStore(state => state.stats);
  const selectedCustomers = useCustomersStore(state => state.selectedCustomers);
  
  const modalStates = useCustomersStore(state => ({
    isModalOpen: state.isModalOpen,
    modalMode: state.modalMode,
    currentCustomer: state.currentCustomer
  }));

  const actions = useCustomersStore(state => ({
    setCustomers: state.setCustomers,
    addCustomer: state.addCustomer,
    updateCustomer: state.updateCustomer,
    deleteCustomer: state.deleteCustomer,
    updateCustomerStats: state.updateCustomerStats,
    calculateLoyaltyTier: state.calculateLoyaltyTier,
    setLoading: state.setLoading,
    setError: state.setError,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    selectCustomer: state.selectCustomer,
    deselectCustomer: state.deselectCustomer,
    selectAllCustomers: state.selectAllCustomers,
    deselectAllCustomers: state.deselectAllCustomers,
    openModal: state.openModal,
    closeModal: state.closeModal,
    refreshStats: state.refreshStats
  }));

  const selectors = useCustomersStore(state => ({
    getFilteredCustomers: state.getFilteredCustomers,
    getTopCustomers: state.getTopCustomers,
    getCustomersByTier: state.getCustomersByTier,
    getInactiveCustomers: state.getInactiveCustomers
  }));

  return {
    customers,
    loading,
    error,
    filters,
    stats,
    selectedCustomers,
    ...modalStates,
    ...actions,
    ...selectors
  };
};

// Staff Store Hook
export const useStaff = () => {
  const staff = useStaffStore(state => state.staff);
  const schedules = useStaffStore(state => state.schedules);
  const timeEntries = useStaffStore(state => state.timeEntries);
  const loading = useStaffStore(state => state.loading);
  const error = useStaffStore(state => state.error);
  const filters = useStaffStore(state => state.filters);
  const stats = useStaffStore(state => state.stats);
  const selectedStaff = useStaffStore(state => state.selectedStaff);
  
  const modalStates = useStaffStore(state => ({
    isStaffModalOpen: state.isStaffModalOpen,
    isScheduleModalOpen: state.isScheduleModalOpen,
    isTimeTrackingModalOpen: state.isTimeTrackingModalOpen,
    modalMode: state.modalMode,
    currentStaff: state.currentStaff,
    currentSchedule: state.currentSchedule
  }));

  const calendarStates = useStaffStore(state => ({
    calendarDate: state.calendarDate,
    calendarView: state.calendarView
  }));

  const actions = useStaffStore(state => ({
    setStaff: state.setStaff,
    addStaffMember: state.addStaffMember,
    updateStaffMember: state.updateStaffMember,
    deleteStaffMember: state.deleteStaffMember,
    setSchedules: state.setSchedules,
    addSchedule: state.addSchedule,
    updateSchedule: state.updateSchedule,
    deleteSchedule: state.deleteSchedule,
    setTimeEntries: state.setTimeEntries,
    clockIn: state.clockIn,
    clockOut: state.clockOut,
    startBreak: state.startBreak,
    endBreak: state.endBreak,
    setLoading: state.setLoading,
    setError: state.setError,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    selectStaff: state.selectStaff,
    deselectStaff: state.deselectStaff,
    selectAllStaff: state.selectAllStaff,
    deselectAllStaff: state.deselectAllStaff,
    openStaffModal: state.openStaffModal,
    closeStaffModal: state.closeStaffModal,
    openScheduleModal: state.openScheduleModal,
    closeScheduleModal: state.closeScheduleModal,
    openTimeTrackingModal: state.openTimeTrackingModal,
    closeTimeTrackingModal: state.closeTimeTrackingModal,
    setCalendarDate: state.setCalendarDate,
    setCalendarView: state.setCalendarView,
    refreshStats: state.refreshStats,
    updatePerformance: state.updatePerformance,
    addTraining: state.addTraining,
    addCertification: state.addCertification
  }));

  const selectors = useStaffStore(state => ({
    getFilteredStaff: state.getFilteredStaff,
    getActiveStaff: state.getActiveStaff,
    getScheduleForDate: state.getScheduleForDate,
    getScheduleForStaff: state.getScheduleForStaff,
    getCurrentShifts: state.getCurrentShifts,
    getActiveTimeEntries: state.getActiveTimeEntries,
    getStaffOnBreak: state.getStaffOnBreak
  }));

  return {
    staff,
    schedules,
    timeEntries,
    loading,
    error,
    filters,
    stats,
    selectedStaff,
    ...modalStates,
    ...calendarStates,
    ...actions,
    ...selectors
  };
};