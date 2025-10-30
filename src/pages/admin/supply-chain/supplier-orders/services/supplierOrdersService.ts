// ============================================
// SUPPLIER ORDERS SERVICE - Business logic layer
// ============================================

import { supplierOrdersApi } from './supplierOrdersApi';
import type {
  SupplierOrder,
  SupplierOrderWithDetails,
  SupplierOrderFormData,
  SupplierOrderMetrics,
  SupplierOrderStatus,
  ReceiveOrderData,
  SupplierOrderFilters,
  SupplierOrderSort
} from '../types';
import { logger } from '@/lib/logging';
import EventBus from '@/lib/events';

/**
 * Supplier Orders Service
 * Wrapper around supplierOrdersApi with business logic and EventBus integration
 */
export const supplierOrdersService = {
  // ============================================
  // CRUD OPERATIONS
  // ============================================

  async getAllOrders(): Promise<SupplierOrderWithDetails[]> {
    try {
      logger.debug('SupplierOrders', 'Fetching all orders');
      const orders = await supplierOrdersApi.getAllOrders();
      logger.info('SupplierOrders', `Loaded ${orders.length} orders`);
      return orders;
    } catch (error) {
      logger.error('SupplierOrders', 'Error fetching orders', error);
      throw error;
    }
  },

  async getOrderById(id: string): Promise<SupplierOrderWithDetails> {
    try {
      logger.debug('SupplierOrders', `Fetching order: ${id}`);
      return await supplierOrdersApi.getOrderById(id);
    } catch (error) {
      logger.error('SupplierOrders', `Error fetching order ${id}`, error);
      throw error;
    }
  },

  async createOrder(data: SupplierOrderFormData): Promise<SupplierOrderWithDetails> {
    try {
      logger.info('SupplierOrders', 'Creating new order');
      const order = await supplierOrdersApi.createOrder(data);

      // Emit event
      EventBus.emit('supplier_orders.order_created', {
        orderId: order.id,
        poNumber: order.po_number,
        supplierId: order.supplier_id,
        totalAmount: order.total_amount,
        itemsCount: order.items.length,
        timestamp: new Date().toISOString()
      });

      logger.info('SupplierOrders', `Order created: ${order.po_number}`);
      return order;
    } catch (error) {
      logger.error('SupplierOrders', 'Error creating order', error);
      throw error;
    }
  },

  async updateOrder(id: string, data: Partial<SupplierOrderFormData>): Promise<SupplierOrderWithDetails> {
    try {
      logger.info('SupplierOrders', `Updating order: ${id}`);
      const order = await supplierOrdersApi.updateOrder(id, data);

      EventBus.emit('supplier_orders.order_updated', {
        orderId: order.id,
        poNumber: order.po_number,
        changes: Object.keys(data),
        timestamp: new Date().toISOString()
      });

      logger.info('SupplierOrders', `Order updated: ${order.po_number}`);
      return order;
    } catch (error) {
      logger.error('SupplierOrders', `Error updating order ${id}`, error);
      throw error;
    }
  },

  async deleteOrder(id: string): Promise<void> {
    try {
      logger.info('SupplierOrders', `Deleting order: ${id}`);
      const order = await supplierOrdersApi.getOrderById(id);
      await supplierOrdersApi.deleteOrder(id);

      EventBus.emit('supplier_orders.order_deleted', {
        orderId: id,
        poNumber: order.po_number,
        timestamp: new Date().toISOString()
      });

      logger.info('SupplierOrders', 'Order deleted successfully');
    } catch (error) {
      logger.error('SupplierOrders', `Error deleting order ${id}`, error);
      throw error;
    }
  },

  // ============================================
  // STATUS OPERATIONS
  // ============================================

  async updateStatus(id: string, status: SupplierOrderStatus): Promise<SupplierOrder> {
    try {
      logger.info('SupplierOrders', `Updating order status: ${id} -> ${status}`);
      const order = await supplierOrdersApi.updateOrderStatus(id, status);

      EventBus.emit('supplier_orders.status_changed', {
        orderId: id,
        poNumber: order.po_number,
        oldStatus: order.status,
        newStatus: status,
        timestamp: new Date().toISOString()
      });

      logger.info('SupplierOrders', `Order status updated to: ${status}`);
      return order;
    } catch (error) {
      logger.error('SupplierOrders', `Error updating order status ${id}`, error);
      throw error;
    }
  },

  async receiveOrder(id: string, receiveData: ReceiveOrderData): Promise<SupplierOrderWithDetails> {
    try {
      logger.info('SupplierOrders', `Receiving order: ${id}`);
      const order = await supplierOrdersApi.receiveOrder(id, receiveData);

      EventBus.emit('supplier_orders.order_received', {
        orderId: order.id,
        poNumber: order.po_number,
        supplierId: order.supplier_id,
        totalAmount: order.total_amount,
        receivedItems: receiveData.items,
        timestamp: new Date().toISOString()
      });

      // Emit stock update events for materials module
      for (const item of receiveData.items) {
        EventBus.emit('materials.stock_updated', {
          materialId: item.id,
          change: item.received_quantity,
          source: 'supplier_order_received',
          orderId: order.id,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('SupplierOrders', `Order received: ${order.po_number}`);
      return order;
    } catch (error) {
      logger.error('SupplierOrders', `Error receiving order ${id}`, error);
      throw error;
    }
  },

  // ============================================
  // METRICS
  // ============================================

  calculateMetrics(orders: SupplierOrderWithDetails[]): SupplierOrderMetrics {
    const totalOrders = orders.length;
    const draftOrders = orders.filter(o => o.status === 'draft').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const approvedOrders = orders.filter(o => o.status === 'approved').length;
    const receivedOrders = orders.filter(o => o.status === 'received').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    const totalPendingValue = orders
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const today = new Date().toISOString().split('T')[0];
    const overdueOrders = orders.filter(
      o => o.status === 'approved' &&
           o.expected_delivery_date &&
           o.expected_delivery_date < today
    ).length;

    const receivedWithDates = orders.filter(
      o => o.status === 'received' && o.approved_at && o.received_at
    );

    let averageDeliveryTime = 0;
    if (receivedWithDates.length > 0) {
      const totalDays = receivedWithDates.reduce((sum, o) => {
        const approved = new Date(o.approved_at!).getTime();
        const received = new Date(o.received_at!).getTime();
        const days = (received - approved) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      averageDeliveryTime = totalDays / receivedWithDates.length;
    }

    return {
      totalOrders,
      draftOrders,
      pendingOrders,
      approvedOrders,
      receivedOrders,
      cancelledOrders,
      totalPendingValue,
      overdueOrders,
      averageDeliveryTime
    };
  },

  // ============================================
  // FILTERING & SORTING
  // ============================================

  filterOrders(orders: SupplierOrderWithDetails[], filters: SupplierOrderFilters): SupplierOrderWithDetails[] {
    let filtered = [...orders];

    // Search text
    if (filters.searchText && filters.searchText.trim() !== '') {
      const searchLower = filters.searchText.toLowerCase().trim();
      filtered = filtered.filter(order =>
        order.po_number.toLowerCase().includes(searchLower) ||
        order.supplier?.name?.toLowerCase().includes(searchLower) ||
        order.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Supplier filter
    if (filters.supplier_id) {
      filtered = filtered.filter(order => order.supplier_id === filters.supplier_id);
    }

    // Date range
    if (filters.dateRange.from) {
      filtered = filtered.filter(order => order.created_at >= filters.dateRange.from!);
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(order => order.created_at <= filters.dateRange.to!);
    }

    // Show overdue
    if (filters.showOverdue) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(
        order => order.status === 'approved' &&
                 order.expected_delivery_date &&
                 order.expected_delivery_date < today
      );
    }

    return filtered;
  },

  sortOrders(orders: SupplierOrderWithDetails[], sort: SupplierOrderSort): SupplierOrderWithDetails[] {
    const sorted = [...orders];

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'po_number':
          aValue = a.po_number;
          bValue = b.po_number;
          break;
        case 'supplier_name':
          aValue = a.supplier?.name || '';
          bValue = b.supplier?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'total_amount':
          aValue = Number(a.total_amount);
          bValue = Number(b.total_amount);
          break;
        case 'expected_delivery_date':
          aValue = a.expected_delivery_date || '9999-12-31';
          bValue = b.expected_delivery_date || '9999-12-31';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
};
