// Custom hooks for accessing Zustand stores with better TypeScript support

import { useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import { useMaterialsStore } from '@/store/materialsStore';
import { useSalesStore } from '@/store/salesStore';
import { useCustomersStore } from '@/store/customersStore';
import { useStaffStore } from '@/store/staffStore';
import { useThemeStore } from '@/store/themeStore';

// App Store Hook
export const useApp = () => {
  const user = useAppStore(state => state.user);
  const ui = useAppStore(state => state.ui);
  const network = useAppStore(state => state.network);
  const settings = useAppStore(state => state.settings);
  
  // Individual action selectors to avoid object recreation
  const setUser = useAppStore(state => state.setUser);
  const logout = useAppStore(state => state.logout);
  const toggleSidebar = useAppStore(state => state.toggleSidebar);
  const setTheme = useAppStore(state => state.setTheme);
  const setLoading = useAppStore(state => state.setLoading);
  const addNotification = useAppStore(state => state.addNotification);
  const removeNotification = useAppStore(state => state.removeNotification);
  const setNetworkStatus = useAppStore(state => state.setNetworkStatus);
  const updateLastSync = useAppStore(state => state.updateLastSync);
  const setPendingSyncs = useAppStore(state => state.setPendingSyncs);
  const updateSettings = useAppStore(state => state.updateSettings);
  const handleError = useAppStore(state => state.handleError);

  return {
    user,
    ui,
    network,
    settings,
    setUser,
    logout,
    toggleSidebar,
    setTheme,
    setLoading,
    addNotification,
    removeNotification,
    setNetworkStatus,
    updateLastSync,
    setPendingSyncs,
    updateSettings,
    handleError
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
  
  // Individual action selectors to avoid object recreation
  const setItems = useMaterialsStore(state => state.setItems);
  const addItem = useMaterialsStore(state => state.addItem);
  const updateItem = useMaterialsStore(state => state.updateItem);
  const deleteItem = useMaterialsStore(state => state.deleteItem);
  const bulkUpdateStock = useMaterialsStore(state => state.bulkUpdateStock);
  const setLoading = useMaterialsStore(state => state.setLoading);
  const setError = useMaterialsStore(state => state.setError);
  const setFilters = useMaterialsStore(state => state.setFilters);
  const resetFilters = useMaterialsStore(state => state.resetFilters);
  const selectItem = useMaterialsStore(state => state.selectItem);
  const deselectItem = useMaterialsStore(state => state.deselectItem);
  const selectAll = useMaterialsStore(state => state.selectAll);
  const deselectAll = useMaterialsStore(state => state.deselectAll);
  const openModal = useMaterialsStore(state => state.openModal);
  const closeModal = useMaterialsStore(state => state.closeModal);
  const refreshStats = useMaterialsStore(state => state.refreshStats);

  // Individual selector functions
  const getFilteredItems = useMaterialsStore(state => state.getFilteredItems);
  const getLowStockItems = useMaterialsStore(state => state.getLowStockItems);
  const getCriticalStockItems = useMaterialsStore(state => state.getCriticalStockItems);

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
    // Actions
    setItems,
    addItem,
    updateItem,
    deleteItem,
    bulkUpdateStock,
    setLoading,
    setError,
    setFilters,
    resetFilters,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    openModal,
    closeModal,
    refreshStats,
    // Selectors
    getFilteredItems,
    getLowStockItems,
    getCriticalStockItems
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
  
  // Individual modal state selectors
  const isCheckoutModalOpen = useSalesStore(state => state.isCheckoutModalOpen);
  const isReceiptModalOpen = useSalesStore(state => state.isReceiptModalOpen);
  const isRefundModalOpen = useSalesStore(state => state.isRefundModalOpen);
  const currentReceipt = useSalesStore(state => state.currentReceipt);

  // Individual action selectors
  const setSales = useSalesStore(state => state.setSales);
  const addSale = useSalesStore(state => state.addSale);
  const updateSale = useSalesStore(state => state.updateSale);
  const deleteSale = useSalesStore(state => state.deleteSale);
  const addToCart = useSalesStore(state => state.addToCart);
  const updateCartItem = useSalesStore(state => state.updateCartItem);
  const removeFromCart = useSalesStore(state => state.removeFromCart);
  const clearCart = useSalesStore(state => state.clearCart);
  const startCheckout = useSalesStore(state => state.startCheckout);
  const completeSale = useSalesStore(state => state.completeSale);
  const updateKitchenStatus = useSalesStore(state => state.updateKitchenStatus);
  const setActiveKitchenOrder = useSalesStore(state => state.setActiveKitchenOrder);
  const setSalesLoading = useSalesStore(state => state.setLoading);
  const setSalesError = useSalesStore(state => state.setError);
  const setSalesFilters = useSalesStore(state => state.setFilters);
  const resetSalesFilters = useSalesStore(state => state.resetFilters);
  const openCheckoutModal = useSalesStore(state => state.openCheckoutModal);
  const closeCheckoutModal = useSalesStore(state => state.closeCheckoutModal);
  const openReceiptModal = useSalesStore(state => state.openReceiptModal);
  const closeReceiptModal = useSalesStore(state => state.closeReceiptModal);
  const openRefundModal = useSalesStore(state => state.openRefundModal);
  const closeRefundModal = useSalesStore(state => state.closeRefundModal);
  const refreshSalesStats = useSalesStore(state => state.refreshStats);

  // Individual selector functions
  const getFilteredSales = useSalesStore(state => state.getFilteredSales);
  const getCartTotal = useSalesStore(state => state.getCartTotal);
  const getCartItemCount = useSalesStore(state => state.getCartItemCount);
  const getTodaySales = useSalesStore(state => state.getTodaySales);
  const getPendingKitchenOrders = useSalesStore(state => state.getPendingKitchenOrders);

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
    isCheckoutModalOpen,
    isReceiptModalOpen,
    isRefundModalOpen,
    currentReceipt,
    setSales,
    addSale,
    updateSale,
    deleteSale,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    startCheckout,
    completeSale,
    updateKitchenStatus,
    setActiveKitchenOrder,
    setLoading: setSalesLoading,
    setError: setSalesError,
    setFilters: setSalesFilters,
    resetFilters: resetSalesFilters,
    openCheckoutModal,
    closeCheckoutModal,
    openReceiptModal,
    closeReceiptModal,
    openRefundModal,
    closeRefundModal,
    refreshStats: refreshSalesStats,
    getFilteredSales,
    getCartTotal,
    getCartItemCount,
    getTodaySales,
    getPendingKitchenOrders
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
  
  // Individual modal state selectors
  const isModalOpen = useCustomersStore(state => state.isModalOpen);
  const modalMode = useCustomersStore(state => state.modalMode);
  const currentCustomer = useCustomersStore(state => state.currentCustomer);

  // Individual action selectors
  const setCustomers = useCustomersStore(state => state.setCustomers);
  const addCustomer = useCustomersStore(state => state.addCustomer);
  const updateCustomer = useCustomersStore(state => state.updateCustomer);
  const deleteCustomer = useCustomersStore(state => state.deleteCustomer);
  const updateCustomerStats = useCustomersStore(state => state.updateCustomerStats);
  const calculateLoyaltyTier = useCustomersStore(state => state.calculateLoyaltyTier);
  const setCustomersLoading = useCustomersStore(state => state.setLoading);
  const setCustomersError = useCustomersStore(state => state.setError);
  const setCustomersFilters = useCustomersStore(state => state.setFilters);
  const resetCustomersFilters = useCustomersStore(state => state.resetFilters);
  const selectCustomer = useCustomersStore(state => state.selectCustomer);
  const deselectCustomer = useCustomersStore(state => state.deselectCustomer);
  const selectAllCustomers = useCustomersStore(state => state.selectAllCustomers);
  const deselectAllCustomers = useCustomersStore(state => state.deselectAllCustomers);
  const openCustomerModal = useCustomersStore(state => state.openModal);
  const closeCustomerModal = useCustomersStore(state => state.closeModal);
  const refreshCustomersStats = useCustomersStore(state => state.refreshStats);

  // Individual selector functions
  const getFilteredCustomers = useCustomersStore(state => state.getFilteredCustomers);
  const getTopCustomers = useCustomersStore(state => state.getTopCustomers);
  const getCustomersByTier = useCustomersStore(state => state.getCustomersByTier);
  const getInactiveCustomers = useCustomersStore(state => state.getInactiveCustomers);

  return {
    customers,
    loading,
    error,
    filters,
    stats,
    selectedCustomers,
    isModalOpen,
    modalMode,
    currentCustomer,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStats,
    calculateLoyaltyTier,
    setLoading: setCustomersLoading,
    setError: setCustomersError,
    setFilters: setCustomersFilters,
    resetFilters: resetCustomersFilters,
    selectCustomer,
    deselectCustomer,
    selectAllCustomers,
    deselectAllCustomers,
    openModal: openCustomerModal,
    closeModal: closeCustomerModal,
    refreshStats: refreshCustomersStats,
    getFilteredCustomers,
    getTopCustomers,
    getCustomersByTier,
    getInactiveCustomers
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
  
  // Individual modal state selectors
  const isStaffModalOpen = useStaffStore(state => state.isStaffModalOpen);
  const isScheduleModalOpen = useStaffStore(state => state.isScheduleModalOpen);
  const isTimeTrackingModalOpen = useStaffStore(state => state.isTimeTrackingModalOpen);
  const modalMode = useStaffStore(state => state.modalMode);
  const currentStaff = useStaffStore(state => state.currentStaff);
  const currentSchedule = useStaffStore(state => state.currentSchedule);

  // Individual calendar state selectors
  const calendarDate = useStaffStore(state => state.calendarDate);
  const calendarView = useStaffStore(state => state.calendarView);

  // Individual action selectors
  const setStaff = useStaffStore(state => state.setStaff);
  const addStaffMember = useStaffStore(state => state.addStaffMember);
  const updateStaffMember = useStaffStore(state => state.updateStaffMember);
  const deleteStaffMember = useStaffStore(state => state.deleteStaffMember);
  const setSchedules = useStaffStore(state => state.setSchedules);
  const addSchedule = useStaffStore(state => state.addSchedule);
  const updateSchedule = useStaffStore(state => state.updateSchedule);
  const deleteSchedule = useStaffStore(state => state.deleteSchedule);
  const setTimeEntries = useStaffStore(state => state.setTimeEntries);
  const clockIn = useStaffStore(state => state.clockIn);
  const clockOut = useStaffStore(state => state.clockOut);
  const startBreak = useStaffStore(state => state.startBreak);
  const endBreak = useStaffStore(state => state.endBreak);
  const setStaffLoading = useStaffStore(state => state.setLoading);
  const setStaffError = useStaffStore(state => state.setError);
  const setStaffFilters = useStaffStore(state => state.setFilters);
  const resetStaffFilters = useStaffStore(state => state.resetFilters);
  const selectStaff = useStaffStore(state => state.selectStaff);
  const deselectStaff = useStaffStore(state => state.deselectStaff);
  const selectAllStaff = useStaffStore(state => state.selectAllStaff);
  const deselectAllStaff = useStaffStore(state => state.deselectAllStaff);
  const openStaffModal = useStaffStore(state => state.openStaffModal);
  const closeStaffModal = useStaffStore(state => state.closeStaffModal);
  const openScheduleModal = useStaffStore(state => state.openScheduleModal);
  const closeScheduleModal = useStaffStore(state => state.closeScheduleModal);
  const openTimeTrackingModal = useStaffStore(state => state.openTimeTrackingModal);
  const closeTimeTrackingModal = useStaffStore(state => state.closeTimeTrackingModal);
  const setCalendarDate = useStaffStore(state => state.setCalendarDate);
  const setCalendarView = useStaffStore(state => state.setCalendarView);
  const refreshStaffStats = useStaffStore(state => state.refreshStats);
  const updatePerformance = useStaffStore(state => state.updatePerformance);
  const addTraining = useStaffStore(state => state.addTraining);
  const addCertification = useStaffStore(state => state.addCertification);

  // Individual selector functions
  const getFilteredStaff = useStaffStore(state => state.getFilteredStaff);
  const getActiveStaff = useStaffStore(state => state.getActiveStaff);
  const getScheduleForDate = useStaffStore(state => state.getScheduleForDate);
  const getScheduleForStaff = useStaffStore(state => state.getScheduleForStaff);
  const getCurrentShifts = useStaffStore(state => state.getCurrentShifts);
  const getActiveTimeEntries = useStaffStore(state => state.getActiveTimeEntries);
  const getStaffOnBreak = useStaffStore(state => state.getStaffOnBreak);

  return {
    staff,
    schedules,
    timeEntries,
    loading,
    error,
    filters,
    stats,
    selectedStaff,
    isStaffModalOpen,
    isScheduleModalOpen,
    isTimeTrackingModalOpen,
    modalMode,
    currentStaff,
    currentSchedule,
    calendarDate,
    calendarView,
    setStaff,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    setSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    setTimeEntries,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    setLoading: setStaffLoading,
    setError: setStaffError,
    setFilters: setStaffFilters,
    resetFilters: resetStaffFilters,
    selectStaff,
    deselectStaff,
    selectAllStaff,
    deselectAllStaff,
    openStaffModal,
    closeStaffModal,
    openScheduleModal,
    closeScheduleModal,
    openTimeTrackingModal,
    closeTimeTrackingModal,
    setCalendarDate,
    setCalendarView,
    refreshStats: refreshStaffStats,
    updatePerformance,
    addTraining,
    addCertification,
    getFilteredStaff,
    getActiveStaff,
    getScheduleForDate,
    getScheduleForStaff,
    getCurrentShifts,
    getActiveTimeEntries,
    getStaffOnBreak
  };
};

// Theme Store Hook
export const useTheme = () => {
  const theme = useThemeStore(state => state.theme);
  const resolvedTheme = useThemeStore(state => state.resolvedTheme);
  const setTheme = useThemeStore(state => state.setTheme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system'
  };
};