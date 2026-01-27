// Custom hooks for accessing Zustand stores with better TypeScript support

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/store/appStore';
import { useMaterialsStore } from '@/modules/materials/store';
import { useSalesStore } from '@/store/salesStore';
import { useCustomersStore } from '@/modules/customers/store';
import { useTeamStore } from '@/modules/team/store';
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
/**
 * @deprecated Consider using atomic selectors directly from `useMaterialsStore()` for better performance.
 * 
 * @warning This hook subscribes to ALL store properties, which can cause unnecessary re-renders.
 * When you destructure from this hook (e.g., `const { items } = useMaterials()`), your component
 * will re-render whenever ANY part of the store changes, including modal state, filters, etc.
 * 
 * @example
 * // ❌ BAD: Re-renders when modal opens/closes, filters change, etc.
 * const { items, loading } = useMaterials();
 * 
 * @example
 * // ✅ GOOD: Only re-renders when items or loading change
 * const items = useMaterialsStore(useShallow(state => state.items));
 * const loading = useMaterialsStore(state => state.loading);
 * 
 * @see {@link https://docs.pmnd.rs/zustand/guides/prevent-rerenders-with-use-shallow useShallow docs}
 */
export const useMaterials = () => {
  // 🔧 FIX: Usar useShallow para arrays que pueden cambiar de referencia
  const items = useMaterialsStore(useShallow(state => state.items));
  const categories = useMaterialsStore(useShallow(state => state.categories));
  const loading = useMaterialsStore(state => state.loading);
  const error = useMaterialsStore(state => state.error);
  const filters = useMaterialsStore(state => state.filters);
  const stats = useMaterialsStore(state => state.stats);
  const selectedItems = useMaterialsStore(useShallow(state => state.selectedItems));
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
/**
 * @deprecated Use atomic selectors directly from `useSalesStore()` for better performance.
 * For cart calculations, use `usePOSCart` from '@/modules/sales/hooks'.
 * 
 * @warning This hook subscribes to ALL store properties.
 * 
 * @example
 * // ❌ BAD: Re-renders when any store property changes
 * const { cart, loading } = useSales();
 * 
 * @example
 * // ✅ GOOD: Only re-renders when cart changes
 * const cart = useSalesStore(state => state.cart);
 * 
 * @example
 * // ✅ GOOD: Use usePOSCart for cart calculations
 * import { usePOSCart } from '@/modules/sales/hooks';
 * const { summary } = usePOSCart();
 * // summary.totalAmount, summary.itemCount
 */
export const useSales = () => {
  const sales = useSalesStore(state => state.sales);
  const cart = useSalesStore(state => state.cart);
  const currentSale = useSalesStore(state => state.currentSale);
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
  const getTodaySales = useSalesStore(state => state.getTodaySales);
  const getPendingKitchenOrders = useSalesStore(state => state.getPendingKitchenOrders);

  return {
    sales,
    cart,
    currentSale,
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
    getTodaySales,
    getPendingKitchenOrders
  };
};

// Customers Store Hook
/**
 * @deprecated Consider using atomic selectors directly from `useCustomersStore()` for better performance.
 * 
 * @warning This hook subscribes to ALL store properties.
 * 
 * @example
 * // ✅ GOOD: Only re-renders when modal state changes
 * const isModalOpen = useCustomersStore(state => state.isModalOpen);
 */
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
export const useTeam = () => {
  const team = useTeamStore(state => state.team);
  const schedules = useTeamStore(state => state.schedules);
  const timeEntries = useTeamStore(state => state.timeEntries);
  const loading = useTeamStore(state => state.loading);
  const error = useTeamStore(state => state.error);
  const filters = useTeamStore(state => state.filters);
  const stats = useTeamStore(state => state.stats);
  const selectedStaff = useTeamStore(state => state.selectedStaff);

  // Individual modal state selectors
  const isStaffModalOpen = useTeamStore(state => state.isStaffModalOpen);
  const isScheduleModalOpen = useTeamStore(state => state.isScheduleModalOpen);
  const isTimeTrackingModalOpen = useTeamStore(state => state.isTimeTrackingModalOpen);
  const modalMode = useTeamStore(state => state.modalMode);
  const currentStaff = useTeamStore(state => state.currentStaff);
  const currentSchedule = useTeamStore(state => state.currentSchedule);

  // Individual calendar state selectors
  const calendarDate = useTeamStore(state => state.calendarDate);
  const calendarView = useTeamStore(state => state.calendarView);

  // Individual action selectors
  const setStaff = useTeamStore(state => state.setStaff);
  const addTeamMember = useTeamStore(state => state.addTeamMember);
  const updateTeamMember = useTeamStore(state => state.updateTeamMember);
  const deleteTeamMember = useTeamStore(state => state.deleteTeamMember);
  const setSchedules = useTeamStore(state => state.setSchedules);
  const addSchedule = useTeamStore(state => state.addSchedule);
  const updateSchedule = useTeamStore(state => state.updateSchedule);
  const deleteSchedule = useTeamStore(state => state.deleteSchedule);
  const setTimeEntries = useTeamStore(state => state.setTimeEntries);
  const clockIn = useTeamStore(state => state.clockIn);
  const clockOut = useTeamStore(state => state.clockOut);
  const startBreak = useTeamStore(state => state.startBreak);
  const endBreak = useTeamStore(state => state.endBreak);
  const setStaffLoading = useTeamStore(state => state.setLoading);
  const setStaffError = useTeamStore(state => state.setError);
  const setStaffFilters = useTeamStore(state => state.setFilters);
  const resetStaffFilters = useTeamStore(state => state.resetFilters);
  const selectStaff = useTeamStore(state => state.selectStaff);
  const deselectStaff = useTeamStore(state => state.deselectStaff);
  const selectAllStaff = useTeamStore(state => state.selectAllStaff);
  const deselectAllStaff = useTeamStore(state => state.deselectAllStaff);
  const openStaffModal = useTeamStore(state => state.openStaffModal);
  const closeStaffModal = useTeamStore(state => state.closeStaffModal);
  const openScheduleModal = useTeamStore(state => state.openScheduleModal);
  const closeScheduleModal = useTeamStore(state => state.closeScheduleModal);
  const openTimeTrackingModal = useTeamStore(state => state.openTimeTrackingModal);
  const closeTimeTrackingModal = useTeamStore(state => state.closeTimeTrackingModal);
  const setCalendarDate = useTeamStore(state => state.setCalendarDate);
  const setCalendarView = useTeamStore(state => state.setCalendarView);
  const refreshStaffStats = useTeamStore(state => state.refreshStats);
  const updatePerformance = useTeamStore(state => state.updatePerformance);
  const addTraining = useTeamStore(state => state.addTraining);
  const addCertification = useTeamStore(state => state.addCertification);

  // Individual selector functions
  const getFilteredStaff = useTeamStore(state => state.getFilteredStaff);
  const getActiveStaff = useTeamStore(state => state.getActiveStaff);
  const getScheduleForDate = useTeamStore(state => state.getScheduleForDate);
  const getScheduleForStaff = useTeamStore(state => state.getScheduleForStaff);
  const getCurrentShifts = useTeamStore(state => state.getCurrentShifts);
  const getActiveTimeEntries = useTeamStore(state => state.getActiveTimeEntries);
  const getStaffOnBreak = useTeamStore(state => state.getStaffOnBreak);

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
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
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
  const resolvedTheme = useThemeStore(state => (state as any).resolvedTheme);
  const setTheme = useThemeStore(state => state.setTheme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const getThemeColors = useThemeStore(state => (state as any).getThemeColors);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    getThemeColors,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system'
  };
};