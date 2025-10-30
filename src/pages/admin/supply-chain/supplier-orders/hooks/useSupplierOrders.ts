// ============================================
// USE SUPPLIER ORDERS HOOK - Data fetching & mutations
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supplierOrdersService } from '../services/supplierOrdersService';
import type {
  SupplierOrderWithDetails,
  SupplierOrderFormData,
  SupplierOrderStatus,
  ReceiveOrderData
} from '../types';
import { logger } from '@/lib/logging';
import { useErrorHandler } from '@/lib/error-handling';

/**
 * Hook for supplier orders data management
 */
export function useSupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  // ============================================
  // FETCH DATA
  // ============================================

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await supplierOrdersService.getAllOrders();
      setOrders(data);

      logger.debug('useSupplierOrders', `Fetched ${data.length} orders`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar órdenes';
      setError(errorMessage);
      handleError(err as Error);
      logger.error('useSupplierOrders', 'Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ============================================
  // MUTATIONS
  // ============================================

  const createOrder = useCallback(async (data: SupplierOrderFormData): Promise<SupplierOrderWithDetails> => {
    try {
      const newOrder = await supplierOrdersService.createOrder(data);
      setOrders(prev => [newOrder, ...prev]);
      logger.info('useSupplierOrders', 'Order created successfully');
      return newOrder;
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  const updateOrder = useCallback(async (
    id: string,
    data: Partial<SupplierOrderFormData>
  ): Promise<SupplierOrderWithDetails> => {
    try {
      const updatedOrder = await supplierOrdersService.updateOrder(id, data);
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      logger.info('useSupplierOrders', 'Order updated successfully');
      return updatedOrder;
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  const deleteOrder = useCallback(async (id: string): Promise<void> => {
    try {
      await supplierOrdersService.deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      logger.info('useSupplierOrders', 'Order deleted successfully');
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  const updateStatus = useCallback(async (
    id: string,
    status: SupplierOrderStatus
  ): Promise<void> => {
    try {
      await supplierOrdersService.updateStatus(id, status);
      // Refresh to get updated data
      await fetchOrders();
      logger.info('useSupplierOrders', `Order status updated to ${status}`);
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError, fetchOrders]);

  const receiveOrder = useCallback(async (
    id: string,
    receiveData: ReceiveOrderData
  ): Promise<void> => {
    try {
      const receivedOrder = await supplierOrdersService.receiveOrder(id, receiveData);
      setOrders(prev => prev.map(o => o.id === id ? receivedOrder : o));
      logger.info('useSupplierOrders', 'Order received successfully');
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  }, [handleError]);

  const refreshData = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // ============================================
  // RETURN
  // ============================================

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    updateStatus,
    receiveOrder,
    refreshData
  };
}
