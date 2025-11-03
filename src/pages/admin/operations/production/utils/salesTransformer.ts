// Kitchen-Sales Transformer
// Transforms Sale/Order data into KitchenOrder format for KDS display

import type { Sale, Order } from '@/pages/admin/operations/sales/types';
import type { KitchenOrder, KitchenOrderItem } from '@/pages/admin/operations/sales/types';
import { KitchenItemStatus, PriorityLevel } from '@/pages/admin/operations/sales/types';

/**
 * Transform Sale to KitchenOrder
 * Used when Sale has embedded order data
 */
export function transformSaleToKitchenOrder(sale: Sale): KitchenOrder | null {
  // Only process sales that need kitchen preparation
  if (!sale.sale_items || sale.sale_items.length === 0) {
    return null;
  }

  // Filter items that need kitchen preparation
  const kitchenItems = sale.sale_items
    .filter(item => item.kitchen_status !== KitchenItemStatus.SERVED)
    .map((item): KitchenOrderItem => ({
      item_id: item.id,
      product_name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      modifications: item.modifications || [],
      special_instructions: item.special_instructions,
      allergy_warnings: [], // TODO: Get from product
      station: item.product?.kitchen_station || 'prep',
      status: item.kitchen_status || KitchenItemStatus.PENDING,
      estimated_prep_time: item.preparation_time || item.product?.preparation_time || 15
    }));

  if (kitchenItems.length === 0) {
    return null;
  }

  const completedItems = kitchenItems.filter(i => i.status === KitchenItemStatus.SERVED).length;
  const totalItems = kitchenItems.length;

  return {
    order_id: sale.order_id || sale.id,
    order_number: sale.order?.order_number || `ORD-${sale.id.substring(0, 8)}`,
    table_number: sale.table?.number,
    items: kitchenItems,
    order_time: sale.created_at,
    estimated_ready_time: sale.estimated_ready_time || calculateEstimatedTime(kitchenItems),
    priority: sale.priority_level || PriorityLevel.NORMAL,
    special_instructions: sale.special_instructions || [],
    allergy_warnings: sale.allergy_warnings || [],
    items_completed: completedItems,
    items_total: totalItems,
    completion_percentage: Math.round((completedItems / totalItems) * 100),
    estimated_time_remaining: calculateRemainingTime(kitchenItems)
  };
}

/**
 * Transform Order to KitchenOrder
 * Used when working with Order entities directly
 */
export function transformOrderToKitchenOrder(order: Order): KitchenOrder | null {
  if (!order.items || order.items.length === 0) {
    return null;
  }

  // Filter items that need kitchen preparation
  const kitchenItems = order.items
    .filter(item => item.status !== KitchenItemStatus.SERVED)
    .map((item): KitchenOrderItem => ({
      item_id: item.id,
      product_name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      modifications: item.modifications,
      special_instructions: item.special_instructions,
      allergy_warnings: item.allergy_warnings || [],
      station: item.station_assigned || item.product?.kitchen_station || 'prep',
      status: item.status,
      estimated_prep_time: item.preparation_time_estimate
    }));

  if (kitchenItems.length === 0) {
    return null;
  }

  const completedItems = kitchenItems.filter(i => i.status === KitchenItemStatus.SERVED).length;
  const totalItems = kitchenItems.length;

  return {
    order_id: order.id,
    order_number: order.order_number,
    table_number: order.table?.number,
    items: kitchenItems,
    order_time: order.created_at,
    estimated_ready_time: order.estimated_ready_time,
    priority: order.priority_level,
    special_instructions: order.special_instructions || [],
    allergy_warnings: order.allergy_warnings || [],
    items_completed: completedItems,
    items_total: totalItems,
    completion_percentage: Math.round((completedItems / totalItems) * 100),
    estimated_time_remaining: calculateRemainingTime(kitchenItems)
  };
}

/**
 * Batch transform sales to kitchen orders
 */
export function transformSalesToKitchenOrders(sales: Sale[]): KitchenOrder[] {
  return sales
    .map(transformSaleToKitchenOrder)
    .filter((order): order is KitchenOrder => order !== null);
}

/**
 * Batch transform orders to kitchen orders
 */
export function transformOrdersToKitchenOrders(orders: Order[]): KitchenOrder[] {
  return orders
    .map(transformOrderToKitchenOrder)
    .filter((order): order is KitchenOrder => order !== null);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate estimated ready time based on items
 */
function calculateEstimatedTime(items: KitchenOrderItem[]): string {
  const maxPrepTime = Math.max(...items.map(i => i.estimated_prep_time));
  const estimatedDate = new Date();
  estimatedDate.setMinutes(estimatedDate.getMinutes() + maxPrepTime);
  return estimatedDate.toISOString();
}

/**
 * Calculate remaining time based on pending items
 */
function calculateRemainingTime(items: KitchenOrderItem[]): number {
  const pendingItems = items.filter(
    i => i.status === KitchenItemStatus.PENDING || i.status === KitchenItemStatus.IN_PROGRESS
  );

  if (pendingItems.length === 0) {
    return 0;
  }

  return Math.max(...pendingItems.map(i => i.estimated_prep_time));
}
