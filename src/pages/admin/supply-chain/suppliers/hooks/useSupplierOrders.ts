/**
 * Supplier Orders TanStack Query Hooks
 * 
 * Migration from useState to TanStack Query
 * Following Cash Module pattern
 * 
 * @version 2.0.0 - Migrated to TanStack Query (2025-01-24)
 * @version 1.0.0 - Initial Implementation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import {
  fetchSupplierOrders,
  fetchSupplierOrderById,
  createSupplierOrder,
  updateOrderStatus,
  receiveSupplierOrder,
  deleteSupplierOrder
} from '../services/supplierOrdersApi';
import type {
  SupplierOrderWithDetails,
  SupplierOrderFormData,
  ReceiveOrderData,
  OrderFilters,
  OrderSort
} from '../types/supplierOrderTypes';

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const supplierOrdersKeys = {
  all: ['supplier-orders'] as const,
  lists: () => [...supplierOrdersKeys.all, 'list'] as const,
  list: (filters?: OrderFilters, sort?: OrderSort) => [...supplierOrdersKeys.lists(), { filters, sort }] as const,
  details: () => [...supplierOrdersKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierOrdersKeys.details(), id] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all supplier orders with optional filters
 */
export function useSupplierOrders(filters?: OrderFilters, sort?: OrderSort) {
  return useQuery({
    queryKey: supplierOrdersKeys.list(filters, sort),
    queryFn: async () => {
      logger.info('useSupplierOrders', 'Fetching orders', { filters, sort });
      const data = await fetchSupplierOrders(filters, sort);
      logger.info('useSupplierOrders', 'Orders fetched successfully', { count: data.length });
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });
}

/**
 * Fetch single supplier order by ID
 */
export function useSupplierOrder(orderId: string) {
  return useQuery({
    queryKey: supplierOrdersKeys.detail(orderId),
    queryFn: async () => {
      logger.info('useSupplierOrders', 'Fetching order', { orderId });
      const data = await fetchSupplierOrderById(orderId);
      return data;
    },
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new supplier order
 */
export function useCreateSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SupplierOrderFormData) => createSupplierOrder(data),
    onMutate: async () => {
      logger.info('useCreateSupplierOrder', 'Creating order');
    },
    onSuccess: (result) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.lists() });
      
      notify.success('Orden creada exitosamente');
      logger.info('useCreateSupplierOrder', 'Order created', { orderId: result.order.id });
    },
    onError: (error: Error) => {
      notify.error('Error al crear orden: ' + error.message);
      logger.error('useCreateSupplierOrder', 'Failed to create order', error);
    },
  });
}

/**
 * Approve a supplier order
 */
export function useApproveSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => updateOrderStatus(orderId, 'approved'),
    onSuccess: (_, orderId) => {
      // Invalidate both lists and detail
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.detail(orderId) });
      
      notify.success('Orden aprobada exitosamente');
      logger.info('useApproveSupplierOrder', 'Order approved', { orderId });
    },
    onError: (error: Error) => {
      notify.error('Error al aprobar orden: ' + error.message);
      logger.error('useApproveSupplierOrder', 'Failed to approve order', error);
    },
  });
}

/**
 * Receive a supplier order (creates stock entries)
 */
export function useReceiveSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReceiveOrderData) => receiveSupplierOrder(data),
    onSuccess: (_, data) => {
      // Invalidate both lists and detail
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.detail(data.order_id) });
      
      notify.success('Orden recibida exitosamente');
      logger.info('useReceiveSupplierOrder', 'Order received', { orderId: data.order_id });
    },
    onError: (error: Error) => {
      notify.error('Error al recibir orden: ' + error.message);
      logger.error('useReceiveSupplierOrder', 'Failed to receive order', error);
    },
  });
}

/**
 * Cancel a supplier order
 */
export function useCancelSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => updateOrderStatus(orderId, 'cancelled'),
    onSuccess: (_, orderId) => {
      // Invalidate both lists and detail
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.detail(orderId) });
      
      notify.success('Orden cancelada exitosamente');
      logger.info('useCancelSupplierOrder', 'Order cancelled', { orderId });
    },
    onError: (error: Error) => {
      notify.error('Error al cancelar orden: ' + error.message);
      logger.error('useCancelSupplierOrder', 'Failed to cancel order', error);
    },
  });
}

/**
 * Delete a supplier order (only drafts)
 */
export function useDeleteSupplierOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => deleteSupplierOrder(orderId),
    onSuccess: (_, orderId) => {
      // Invalidate lists and remove detail
      queryClient.invalidateQueries({ queryKey: supplierOrdersKeys.lists() });
      queryClient.removeQueries({ queryKey: supplierOrdersKeys.detail(orderId) });
      
      notify.success('Orden eliminada exitosamente');
      logger.info('useDeleteSupplierOrder', 'Order deleted', { orderId });
    },
    onError: (error: Error) => {
      notify.error('Error al eliminar orden: ' + error.message);
      logger.error('useDeleteSupplierOrder', 'Failed to delete order', error);
    },
  });
}
