// delivery/utils/deliveryTransformer.ts
import type { Sale } from '@/pages/admin/operations/sales/types';
import type { DeliveryOrder, DeliveryItem } from '../types/deliveryTypes';
import { DeliveryStatus, DeliveryType } from '../types/deliveryTypes';
import { getCustomerDefaultAddress } from '@/pages/admin/core/crm/customers/services/customerAddressesApi';
import { logger } from '@/lib/logging';

/**
 * Transform Sale to DeliveryOrder
 * Now integrated with customer_addresses table for geocoded locations
 */
export async function transformSaleToDeliveryOrder(sale: Sale): Promise<DeliveryOrder | null> {
  // Only process sales with delivery fulfillment
  if (sale.fulfillment_type !== 'delivery' && sale.fulfillment_type !== 'DELIVERY') {
    return null;
  }

  // Determine delivery type based on timing
  const deliveryType = determineDeliveryType(sale.estimated_ready_time);

  // Get customer's default address with coordinates
  let customerAddress = null;
  if (sale.customer_id) {
    try {
      customerAddress = await getCustomerDefaultAddress(sale.customer_id);
    } catch (error) {
      logger.warn('deliveryTransformer', 'Could not fetch customer address', { error });
    }
  }

  return {
    id: `delivery-${sale.id}`,
    sale_id: sale.id,
    order_id: sale.order_id || sale.id,

    // Customer & Location (from customer_addresses table)
    customer_id: sale.customer_id || 'unknown',
    customer_name: sale.customer?.name || 'Cliente',
    delivery_address: customerAddress?.formatted_address ||
                      customerAddress?.address_line_1 ||
                      sale.customer?.address ||
                      'Dirección no especificada',
    delivery_coordinates: customerAddress?.latitude && customerAddress?.longitude
      ? { lat: customerAddress.latitude, lng: customerAddress.longitude }
      : parseAddress(sale.customer?.address), // Fallback to default coords
    delivery_instructions: customerAddress?.delivery_instructions ||
                           sale.special_instructions?.join(', '),
    customer_address_id: customerAddress?.id,

    // Driver & Status
    driver_id: undefined,
    driver_name: undefined,
    status: DeliveryStatus.PENDING,

    // Timing
    created_at: sale.created_at,
    scheduled_delivery_time: sale.estimated_ready_time,
    estimated_arrival_time: calculateETA(sale.created_at, sale.estimated_ready_time),

    // Route
    route: undefined,
    current_location: undefined,
    distance_km: undefined,

    // Order Data
    items: transformSaleItems(sale.sale_items || []),
    total: sale.total,
    notes: sale.note,

    // Priority
    priority: sale.priority_level || 'normal',
    delivery_type: deliveryType
  };
}

/**
 * Batch transform sales to delivery orders
 */
export async function transformSalesToDeliveryOrders(sales: Sale[]): Promise<DeliveryOrder[]> {
  const promises = sales.map(transformSaleToDeliveryOrder);
  const results = await Promise.all(promises);
  return results.filter((order): order is DeliveryOrder => order !== null);
}

/**
 * Transform sale items to delivery items
 */
function transformSaleItems(saleItems: any[]): DeliveryItem[] {
  return saleItems.map(item => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.product?.name || 'Producto',
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.special_instructions
  }));
}

/**
 * Determine delivery type based on estimated ready time
 */
function determineDeliveryType(estimatedReadyTime?: string): DeliveryType {
  if (!estimatedReadyTime) {
    return DeliveryType.INSTANT;
  }

  const now = new Date();
  const readyTime = new Date(estimatedReadyTime);
  const hoursUntilReady = (readyTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilReady <= 1) {
    return DeliveryType.INSTANT;
  } else if (hoursUntilReady <= 24) {
    return DeliveryType.SAME_DAY;
  } else {
    return DeliveryType.SCHEDULED;
  }
}

/**
 * Calculate ETA based on creation time and scheduled time
 */
function calculateETA(createdAt: string, estimatedReadyTime?: string): string | undefined {
  if (!estimatedReadyTime) {
    // Default: 45 min from now for instant delivery
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + 45);
    return eta.toISOString();
  }

  // Add 30 min buffer for delivery after ready time
  const eta = new Date(estimatedReadyTime);
  eta.setMinutes(eta.getMinutes() + 30);
  return eta.toISOString();
}

/**
 * Parse address string to coordinates
 * Fallback when customer has no saved addresses
 */
function parseAddress(address?: string): { lat: number; lng: number } {
  // Default coordinates (Buenos Aires center)
  // In Phase 4, this will use Google Geocoding API
  return {
    lat: -34.6037,
    lng: -58.3816
  };
}
