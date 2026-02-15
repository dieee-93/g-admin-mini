/**
 * Supplier Orders API
 * CRUD operations for purchase orders with Event Sourcing support
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import eventBus from '@/lib/events/EventBus';
import { getUserContext } from '@/lib/auth/userContext';
import type {
  SupplierOrderFormData,
  SupplierOrderWithDetails,
  ReceiveOrderData,
  CreateOrderResponse,
  ReceiveOrderResponse,
  OrderFilters,
  OrderSort,
  OrderEventMetadata
} from '../types/supplierOrderTypes';

const SERVICE_NAME = 'SupplierOrdersService';

/**
 * Fetch all supplier orders with optional filters
 */
export async function fetchSupplierOrders(
  filters?: OrderFilters,
  sort?: OrderSort
): Promise<SupplierOrderWithDetails[]> {
  try {
    let query = supabase
      .from('supplier_orders')
      .select(`
        *,
        supplier:suppliers(id, name, contact_name),
        items:supplier_order_items(
          *,
          material:materials(id, name, type, unit)
        )
      `);

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters?.search) {
      query = query.or(`po_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortField = sort?.field || 'created_at';
    const sortDirection = sort?.direction || 'desc';
    query = query.order(sortField, { ascending: sortDirection === 'asc' });

    const { data, error } = await query;

    if (error) {
      logger.error(SERVICE_NAME, 'Failed to fetch supplier orders', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error(SERVICE_NAME, 'Error in fetchSupplierOrders', error);
    throw error;
  }
}

/**
 * Fetch a single supplier order by ID
 */
export async function fetchSupplierOrderById(orderId: string): Promise<SupplierOrderWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        supplier:suppliers(id, name, contact_name),
        items:supplier_order_items(
          *,
          material:materials(id, name, type, unit)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      logger.error(SERVICE_NAME, 'Failed to fetch supplier order', { orderId, error });
      throw error;
    }

    return data;
  } catch (error) {
    logger.error(SERVICE_NAME, 'Error in fetchSupplierOrderById', error);
    throw error;
  }
}

/**
 * Create a new supplier order
 */
export async function createSupplierOrder(
  orderData: SupplierOrderFormData
): Promise<CreateOrderResponse> {
  try {
    // 1. Get user context for audit trail
    const userContext = await getUserContext();

    // 2. Create order
    const orderInsert = {
      supplier_id: orderData.supplier_id,
      po_number: orderData.po_number,
      expected_delivery_date: orderData.expected_delivery_date,
      status: 'draft' as const,
      total_amount: orderData.items.reduce((sum, item) => sum + item.total_cost, 0),
      notes: orderData.notes
    };

    const { data: order, error: orderError } = await supabase
      .from('supplier_orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) {
      logger.error(SERVICE_NAME, 'Failed to create order', orderError);
      throw orderError;
    }

    // 3. Create order items
    const itemsInsert = orderData.items.map(item => ({
      supplier_order_id: order.id,
      material_id: item.material_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      total_cost: item.total_cost,
      notes: item.notes
    }));

    const { data: items, error: itemsError } = await supabase
      .from('supplier_order_items')
      .insert(itemsInsert)
      .select();

    if (itemsError) {
      logger.error(SERVICE_NAME, 'Failed to create order items', itemsError);
      throw itemsError;
    }

    // 4. Emit event with real user context
    const metadata: OrderEventMetadata = {
      event_type: 'order_created',
      user_id: userContext.id,
      order_id: order.id,
      supplier_id: order.supplier_id,
      po_number: order.po_number || undefined,
      total_amount: order.total_amount || 0,
      items_count: items.length,
      audit_trail: {
        timestamp: new Date().toISOString()
      }
    };

    await eventBus.emit('suppliers.order.created', metadata, {
      priority: 1, // high priority
      correlationId: order.id
    });

    logger.info(SERVICE_NAME, 'Supplier order created', { orderId: order.id });

    return { order, items };
  } catch (error) {
    logger.error(SERVICE_NAME, 'Error in createSupplierOrder', error);
    throw error;
  }
}

/**
 * Update supplier order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'approved' | 'cancelled'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('supplier_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      logger.error(SERVICE_NAME, 'Failed to update order status', { orderId, status, error });
      throw error;
    }

    // Emit event
    const eventType = status === 'approved' ? 'order_approved' : 'order_cancelled';
    await eventBus.emit(`suppliers.${eventType}`, { order_id: orderId, status }, {
      priority: 1,
      correlationId: orderId
    });

    logger.info(SERVICE_NAME, 'Order status updated', { orderId, status });
  } catch (error) {
    logger.error(SERVICE_NAME, 'Error in updateOrderStatus', error);
    throw error;
  }
}

/**
 * Receive a supplier order (Event Sourcing)
 * Creates stock entries with full metadata for audit trail
 */
export async function receiveSupplierOrder(
  receiveData: ReceiveOrderData
): Promise<ReceiveOrderResponse> {
  try {
    // 1. Get user context for audit trail
    const userContext = await getUserContext();

    // 2. Get order details
    const order = await fetchSupplierOrderById(receiveData.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // 3. Create stock entries with Event Sourcing metadata
    const stockEntries = [];

    for (const item of receiveData.items) {
      const orderItem = order.items?.find(oi => oi.id === item.order_item_id);
      if (!orderItem) {
        throw new Error(`Order item ${item.order_item_id} not found`);
      }

      // Event Sourcing metadata with real user context
      const metadata = {
        event_type: 'supplier_order_received',
        user_id: userContext.id,
        business_context: {
          supplier_id: order.supplier?.id,
          supplier_name: order.supplier?.name,
          order_id: order.id,
          po_number: order.po_number,
          order_item_id: item.order_item_id,
          expected_quantity: orderItem.quantity,
          received_quantity: item.received_quantity,
          unit_cost: item.unit_cost,
          total_cost: item.received_quantity * item.unit_cost
        },
        audit_trail: {
          received_at: receiveData.received_at,
          received_by: userContext.name,
          notes: item.notes || receiveData.notes,
          timestamp: new Date().toISOString()
        }
      };

      // Create stock entry
      const { data: stockEntry, error: stockError } = await supabase
        .from('stock_entries')
        .insert({
          item_id: item.material_id,
          quantity: item.received_quantity,
          entry_type: 'purchase',
          unit_cost: item.unit_cost,
          notes: item.notes || receiveData.notes,
          metadata: metadata
        })
        .select()
        .single();

      if (stockError) {
        logger.error(SERVICE_NAME, 'Failed to create stock entry', { item, error: stockError });
        throw stockError;
      }

      stockEntries.push(stockEntry);

      // Update material stock
      const { error: updateError } = await supabase.rpc('update_material_stock', {
        p_material_id: item.material_id,
        p_quantity_change: item.received_quantity
      });

      if (updateError) {
        logger.error(SERVICE_NAME, 'Failed to update material stock', { item, error: updateError });
        throw updateError;
      }

      // Emit material stock updated event
      await eventBus.emit('materials.stock_updated', {
        material_id: item.material_id,
        quantity_change: item.received_quantity,
        new_stock: 0, // TODO: Get actual new stock
        source: 'supplier_order',
        reference_id: order.id
      }, {
        priority: 1,
        correlationId: order.id
      });
    }

    // 3. Update order status to received
    const { error: orderUpdateError } = await supabase
      .from('supplier_orders')
      .update({
        status: 'received',
        received_at: receiveData.received_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', receiveData.order_id);

    if (orderUpdateError) {
      logger.error(SERVICE_NAME, 'Failed to update order to received', orderUpdateError);
      throw orderUpdateError;
    }

    // 4. Update order items received quantities
    for (const item of receiveData.items) {
      const { error: itemUpdateError } = await supabase
        .from('supplier_order_items')
        .update({
          received_quantity: item.received_quantity
        })
        .eq('id', item.order_item_id);

      if (itemUpdateError) {
        logger.error(SERVICE_NAME, 'Failed to update order item', { item, error: itemUpdateError });
        throw itemUpdateError;
      }
    }

    // 5. Emit order received event with real user context
    const orderMetadata: OrderEventMetadata = {
      event_type: 'order_received',
      user_id: userContext.id,
      order_id: order.id,
      supplier_id: order.supplier?.id || '',
      po_number: order.po_number || undefined,
      total_amount: order.total_amount || 0,
      items_count: receiveData.items.length,
      business_context: {
        received_by: userContext.name,
        received_by_role: userContext.role,
        reason: receiveData.notes
      },
      audit_trail: {
        timestamp: receiveData.received_at
      }
    };

    await eventBus.emit('suppliers.order.received', orderMetadata, {
      priority: 0, // critical priority
      correlationId: order.id
    });

    logger.info(SERVICE_NAME, 'Supplier order received', {
      orderId: order.id,
      itemsCount: receiveData.items.length,
      stockEntriesCreated: stockEntries.length
    });

    return {
      order: {
        ...order,
        status: 'received' as const,
        received_at: receiveData.received_at
      },
      stock_entries: stockEntries
    };
  } catch (error) {
    logger.error(SERVICE_NAME, 'Error in receiveSupplierOrder', error);
    throw error;
  }
}

/**
 * Delete a supplier order (only if draft)
 */
export async function deleteSupplierOrder(orderId: string): Promise<void> {
  try {
    // Check if order is draft
    const { data: order } = await supabase
      .from('supplier_orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (order?.status !== 'draft') {
      throw new Error('Only draft orders can be deleted');
    }

    // Delete order items first (FK constraint)
    const { error: itemsError } = await supabase
      .from('supplier_order_items')
      .delete()
      .eq('supplier_order_id', orderId);

    if (itemsError) {
      logger.error(SERVICE_NAME, 'Failed to delete order items', itemsError);
      throw itemsError;
    }

    // Delete order
    const { error: orderError } = await supabase
      .from('supplier_orders')
      .delete()
      .eq('id', orderId);

    if (orderError) {
      logger.error(SERVICE_NAME, 'Failed to delete order', orderError);
      throw orderError;
    }

    logger.info(SERVICE_NAME, 'Supplier order deleted', { orderId });
  } catch (error) {
    logger.error(SERVICE_NAME, 'Error in deleteSupplierOrder', error);
    throw error;
  }
}
/**
 * Export API object for convenient access
 */
export const supplierOrdersApi = {
  getAllOrders: fetchSupplierOrders,
  getOrderById: fetchSupplierOrderById,
  createOrder: createSupplierOrder,
  updateStatus: updateOrderStatus,
  receiveOrder: receiveSupplierOrder,
  deleteOrder: deleteSupplierOrder
};
