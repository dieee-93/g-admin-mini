// ============================================
// USE SUPPLIER ORDERS PAGE HOOK - Page orchestration
// ============================================

import { useState, useMemo, useCallback } from 'react';
import { useSupplierOrders } from './useSupplierOrders';
import { supplierOrdersService } from '../services/supplierOrdersService';
import type {
  SupplierOrderTab,
  SupplierOrderFilters,
  SupplierOrderSort,
  SupplierOrderMetrics,
  SupplierOrderStatus
} from '../types';
import { logger } from '@/lib/logging';

const DEFAULT_FILTERS: SupplierOrderFilters = {
  searchText: '',
  status: 'all',
  supplier_id: null,
  dateRange: {
    from: null,
    to: null
  },
  showOverdue: false
};

const DEFAULT_SORT: SupplierOrderSort = {
  field: 'created_at',
  direction: 'desc'
};

/**
 * Hook for supplier orders page orchestration
 */
export function useSupplierOrdersPage() {
  // ============================================
  // DATA LAYER
  // ============================================

  const {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    receiveOrder,
    refreshData
  } = useSupplierOrders();

  // ============================================
  // UI STATE
  // ============================================

  const [activeTab, setActiveTab] = useState<SupplierOrderTab>('list');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupplierOrderFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SupplierOrderSort>(DEFAULT_SORT);

  // ============================================
  // DATA TRANSFORMATION
  // ============================================

  const processedOrders = useMemo(() => {
    let result = orders;
    result = supplierOrdersService.filterOrders(result, filters);
    result = supplierOrdersService.sortOrders(result, sort);
    return result;
  }, [orders, filters, sort]);

  const metrics: SupplierOrderMetrics = useMemo(() => {
    return supplierOrdersService.calculateMetrics(orders);
  }, [orders]);

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // ============================================
  // MODAL ACTIONS
  // ============================================

  const handleOpenCreate = useCallback(() => {
    logger.debug('useSupplierOrdersPage', 'Opening create modal');
    setSelectedOrderId(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((orderId: string) => {
    logger.debug('useSupplierOrdersPage', `Opening edit modal for order: ${orderId}`);
    setSelectedOrderId(orderId);
    setIsEditModalOpen(true);
  }, []);

  const handleOpenReceive = useCallback((orderId: string) => {
    logger.debug('useSupplierOrdersPage', `Opening receive modal for order: ${orderId}`);
    setSelectedOrderId(orderId);
    setIsReceiveModalOpen(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    logger.debug('useSupplierOrdersPage', 'Closing modals');
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsReceiveModalOpen(false);
    setSelectedOrderId(null);
  }, []);

  // ============================================
  // FILTER ACTIONS
  // ============================================

  const handleFilterChange = useCallback((newFilters: Partial<SupplierOrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ============================================
  // SORT ACTIONS
  // ============================================

  const handleSortChange = useCallback((field: SupplierOrderSort['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // ============================================
  // TAB ACTIONS
  // ============================================

  const handleTabChange = useCallback((tab: string) => {
    logger.debug('useSupplierOrdersPage', `Changing tab to: ${tab}`);
    setActiveTab(tab as SupplierOrderTab);
  }, []);

  // ============================================
  // ORDER ACTIONS
  // ============================================

  const handleDeleteOrder = useCallback(async (id: string) => {
    try {
      await deleteOrder(id);
      logger.info('useSupplierOrdersPage', 'Order deleted successfully');
    } catch (error) {
      logger.error('useSupplierOrdersPage', 'Error deleting order', error);
      throw error;
    }
  }, [deleteOrder]);

  const handleUpdateStatus = useCallback(async (id: string, status: SupplierOrderStatus) => {
    try {
      await updateStatus(id, status);
      logger.info('useSupplierOrdersPage', `Order status updated to ${status}`);
    } catch (error) {
      logger.error('useSupplierOrdersPage', 'Error updating order status', error);
      throw error;
    }
  }, [updateStatus]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data
    orders: processedOrders,
    allOrders: orders,
    selectedOrder,
    metrics,
    loading,
    error,

    // UI State
    activeTab,
    isCreateModalOpen,
    isEditModalOpen,
    isReceiveModalOpen,
    filters,
    sort,

    // Actions
    setActiveTab: handleTabChange,
    openCreateModal: handleOpenCreate,
    openEditModal: handleOpenEdit,
    openReceiveModal: handleOpenReceive,
    closeModals: handleCloseModals,
    setFilters: handleFilterChange,
    resetFilters: handleResetFilters,
    setSort: handleSortChange,
    deleteOrder: handleDeleteOrder,
    updateStatus: handleUpdateStatus,

    // Mutations
    createOrder,
    updateOrder,
    receiveOrder,
    refreshData
  };
}
