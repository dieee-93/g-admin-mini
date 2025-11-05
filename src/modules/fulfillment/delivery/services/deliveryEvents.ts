// delivery/services/deliveryEvents.ts
import EventBus from '@/lib/events';
import { logger } from '@/lib/logging';
import { deliveryApi } from './deliveryApi';

/**
 * EventBus Integration for Delivery Module
 */

// ============================================
// EVENT LISTENERS (consume events)
// ============================================

/**
 * Listen to sales.completed to detect new delivery orders
 * Note: Sales module emits 'sales.completed' for all completed sales
 */
export function setupDeliveryEventListeners() {
  // Listen for completed sales with delivery fulfillment
  EventBus.on('sales.completed', (data: any) => {
    // Check if this is a delivery order
    // Note: fulfillment_type might be in saleData or metadata
    logger.debug('Delivery', '📦 Sale completed event received:', data);

    // For now, we'll handle all sales and check delivery type in handler
    // TODO: Add fulfillment_type check once Sales includes it in event payload
    handleNewDeliveryOrder(data);
  });

  // Listen for order placement (alternative event)
  EventBus.on('sales.order.placed', (data: any) => {
    if (data.orderType === 'delivery' || data.fulfillmentType === 'delivery') {
      logger.info('Delivery', '📦 New delivery order placed:', data);
      handleNewDeliveryOrder(data);
    }
  });

  logger.info('Delivery', '✅ Delivery EventBus listeners registered');
}

/**
 * Cleanup listeners on unmount
 */
export function cleanupDeliveryEventListeners() {
  EventBus.off('sales.completed');
  EventBus.off('sales.order.placed');
  logger.info('Delivery', '🧹 Delivery EventBus listeners cleaned up');
}

// ============================================
// EVENT EMITTERS (emit events)
// ============================================

/**
 * Emit event when driver is assigned
 */
export function emitDriverAssigned(deliveryId: string, driverId: string, driverName: string) {
  EventBus.emit('delivery.driver.assigned', {
    delivery_id: deliveryId,
    driver_id: driverId,
    driver_name: driverName,
    timestamp: new Date().toISOString()
  });

  logger.info('Delivery', '🚚 Driver assigned:', { deliveryId, driverId });
}

/**
 * Emit event when delivery status changes
 */
export function emitDeliveryStatusUpdated(deliveryId: string, status: string, location?: any) {
  EventBus.emit('delivery.status.updated', {
    delivery_id: deliveryId,
    status,
    location,
    timestamp: new Date().toISOString()
  });

  logger.info('Delivery', '📍 Delivery status updated:', { deliveryId, status });
}

/**
 * Emit event when delivery is completed
 */
export function emitDeliveryCompleted(deliveryId: string, orderId: string) {
  EventBus.emit('delivery.completed', {
    delivery_id: deliveryId,
    order_id: orderId,
    completed_at: new Date().toISOString()
  });

  logger.info('Delivery', '✅ Delivery completed:', { deliveryId, orderId });
}

// ============================================
// HANDLERS
// ============================================

async function handleNewDeliveryOrder(orderData: any) {
  try {
    // Extract sale ID from event payload (different events have different structures)
    const saleId = orderData.saleId || orderData.id || orderData.orderId;

    if (!saleId) {
      logger.warn('Delivery', '⚠️ No sale ID found in order data:', orderData);
      return;
    }

    // Transform and store delivery order
    logger.info('Delivery', '🆕 Processing new delivery order...', { saleId });

    // Create delivery order from sale
    const delivery = await deliveryApi.createDeliveryFromSale(saleId);

    logger.info('Delivery', '✅ Delivery order created successfully:', {
      deliveryId: delivery.id,
      saleId
    });

    // Emit event for other modules to react
    EventBus.emit('delivery.order.created', {
      delivery_id: delivery.id,
      sale_id: saleId,
      customer_id: delivery.customer_id,
      status: delivery.status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Delivery', '❌ Failed to create delivery order:', error);
    // Non-critical error - log and continue
  }
}
