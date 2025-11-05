// ============================================
// SUPPLIER ORDERS API - Supabase operations
// ============================================

import { supabase } from '@/lib/supabase/client';
import type {
  SupplierOrder,
  SupplierOrderWithDetails,
  SupplierOrderFormData,
  SupplierOrderStatus,
  ReceiveOrderData
} from '../types';

/**
 * Supplier Orders API
 * Handles all database operations for supplier orders
 */
export const supplierOrdersApi = {
  // ============================================
  // READ OPERATIONS
  // ============================================

  /**
   * Get all supplier orders with details
   */
  async getAllOrders(): Promise<SupplierOrderWithDetails[]> {
    const { data, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:supplier_order_items(
          *,
          material:items(*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SupplierOrderWithDetails[];
  },

  /**
   * Get supplier order by ID with details
   */
  async getOrderById(id: string): Promise<SupplierOrderWithDetails> {
    const { data, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:supplier_order_items(
          *,
          material:items(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SupplierOrderWithDetails;
  },

  /**
   * Get orders by supplier
   */
  async getOrdersBySupplier(supplierId: string): Promise<SupplierOrderWithDetails[]> {
    const { data, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:supplier_order_items(
          *,
          material:items(*)
        )
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SupplierOrderWithDetails[];
  },

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: SupplierOrderStatus): Promise<SupplierOrderWithDetails[]> {
    const { data, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:supplier_order_items(
          *,
          material:items(*)
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SupplierOrderWithDetails[];
  },

  /**
   * Get overdue orders (approved but past expected delivery date)
   */
  async getOverdueOrders(): Promise<SupplierOrderWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('supplier_orders')
      .select(`
        *,
        supplier:suppliers(*),
        items:supplier_order_items(
          *,
          material:items(*)
        )
      `)
      .eq('status', 'approved')
      .lt('expected_delivery_date', today)
      .order('expected_delivery_date', { ascending: true });

    if (error) throw error;
    return (data || []) as SupplierOrderWithDetails[];
  },

  /**
   * Generate next PO number
   */
  async generatePONumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_po_number');

    if (error) throw error;
    return data as string;
  },

  // ============================================
  // CREATE OPERATIONS
  // ============================================

  /**
   * Create new supplier order with items
   */
  async createOrder(orderData: SupplierOrderFormData): Promise<SupplierOrderWithDetails> {
    // Generate PO number
    const po_number = await this.generatePONumber();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('supplier_orders')
      .insert({
        po_number,
        supplier_id: orderData.supplier_id,
        expected_delivery_date: orderData.expected_delivery_date || null,
        notes: orderData.notes || null,
        internal_notes: orderData.internal_notes || null,
        status: 'draft'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create items
    if (orderData.items.length > 0) {
      const items = orderData.items.map(item => ({
        supplier_order_id: order.id,
        material_id: item.material_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        notes: item.notes || null
      }));

      const { error: itemsError } = await supabase
        .from('supplier_order_items')
        .insert(items);

      if (itemsError) throw itemsError;
    }

    // Fetch complete order with details
    return await this.getOrderById(order.id);
  },

  // ============================================
  // UPDATE OPERATIONS
  // ============================================

  /**
   * Update supplier order (only draft orders can be fully edited)
   */
  async updateOrder(
    id: string,
    updates: Partial<SupplierOrderFormData>
  ): Promise<SupplierOrderWithDetails> {
    // Update order
    const orderUpdates: Partial<SupplierOrder> = {};
    if (updates.supplier_id) orderUpdates.supplier_id = updates.supplier_id;
    if (updates.expected_delivery_date !== undefined) {
      orderUpdates.expected_delivery_date = updates.expected_delivery_date || null;
    }
    if (updates.notes !== undefined) orderUpdates.notes = updates.notes || null;
    if (updates.internal_notes !== undefined) {
      orderUpdates.internal_notes = updates.internal_notes || null;
    }

    const { error: orderError } = await supabase
      .from('supplier_orders')
      .update(orderUpdates)
      .eq('id', id);

    if (orderError) throw orderError;

    // Update items if provided
    if (updates.items) {
      // Delete existing items
      await supabase
        .from('supplier_order_items')
        .delete()
        .eq('supplier_order_id', id);

      // Insert new items
      if (updates.items.length > 0) {
        const items = updates.items.map(item => ({
          supplier_order_id: id,
          material_id: item.material_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          notes: item.notes || null
        }));

        const { error: itemsError } = await supabase
          .from('supplier_order_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }
    }

    return await this.getOrderById(id);
  },

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    status: SupplierOrderStatus
  ): Promise<SupplierOrder> {
    const updates: Partial<SupplierOrder> = { status };

    // Set timestamps based on status
    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('supplier_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SupplierOrder;
  },

  /**
   * Receive order and update stock
   */
  async receiveOrder(id: string, receiveData: ReceiveOrderData): Promise<SupplierOrderWithDetails> {
    // Update order status
    const updates: Partial<SupplierOrder> = {
      status: 'received' as SupplierOrderStatus,
      received_at: new Date().toISOString(),
      actual_delivery_date: receiveData.actual_delivery_date || null
    };

    if (receiveData.notes) {
      updates.notes = receiveData.notes;
    }

    const { error: orderError } = await supabase
      .from('supplier_orders')
      .update(updates)
      .eq('id', id);

    if (orderError) throw orderError;

    // Update received quantities for each item
    for (const item of receiveData.items) {
      const { error: itemError } = await supabase
        .from('supplier_order_items')
        .update({ received_quantity: item.received_quantity })
        .eq('id', item.id);

      if (itemError) throw itemError;

      // Update material stock
      // Get current item to know material_id and quantity
      const { data: itemData, error: getItemError } = await supabase
        .from('supplier_order_items')
        .select('material_id, quantity')
        .eq('id', item.id)
        .single();

      if (getItemError) throw getItemError;

      // Increment material stock
      const { error: stockError } = await supabase.rpc('increment_material_stock', {
        material_id: itemData.material_id,
        quantity_to_add: item.received_quantity
      });

      // If RPC doesn't exist, use manual update
      if (stockError && stockError.code === '42883') {
        // Get current stock
        const { data: materialData } = await supabase
          .from('items')
          .select('stock')
          .eq('id', itemData.material_id)
          .single();

        if (materialData) {
          const newStock = (materialData.stock || 0) + item.received_quantity;
          await supabase
            .from('items')
            .update({ stock: newStock })
            .eq('id', itemData.material_id);
        }
      } else if (stockError) {
        throw stockError;
      }
    }

    return await this.getOrderById(id);
  },

  // ============================================
  // DELETE OPERATIONS
  // ============================================

  /**
   * Delete supplier order (only draft orders can be deleted)
   */
  async deleteOrder(id: string): Promise<void> {
    // Check if order is in draft status
    const { data: order } = await supabase
      .from('supplier_orders')
      .select('status')
      .eq('id', id)
      .single();

    if (order && order.status !== 'draft') {
      throw new Error('Solo se pueden eliminar órdenes en estado borrador');
    }

    // Delete order (items will be cascade deleted)
    const { error } = await supabase
      .from('supplier_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Approve multiple orders
   */
  async approveOrders(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('supplier_orders')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('status', 'pending');

    if (error) throw error;
  },

  /**
   * Cancel multiple orders
   */
  async cancelOrders(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('supplier_orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .in('id', ids)
      .in('status', ['draft', 'pending', 'approved']);

    if (error) throw error;
  }
};
