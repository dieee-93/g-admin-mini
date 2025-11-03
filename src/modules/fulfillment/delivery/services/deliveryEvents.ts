// delivery/services/deliveryEvents.ts
import EventBus from '@/lib/events';
import { logger } from '@/lib/logging';

/**
 * EventBus Integration for Delivery Module
 */

// ============================================
// EVENT LISTENERS (consume events)
// ============================================

/**
 * Listen to sales.order.created to detect new delivery orders
 */
export function setupDeliveryEventListeners() {
  // Listen for new orders with delivery fulfillment
  EventBus.on('sales.order.created', (data: any) => {
    if (data.fulfillment_type === 'delivery' || data.fulfillment_type === 'DELIVERY') {
      logger.info('Delivery', '📦 New delivery order created:', data);
      handleNewDeliveryOrder(data);
    }
  });

  // Listen for order updates
  EventBus.on('sales.order.updated', (data: any) => {
    if (data.fulfillment_type === 'delivery') {
      logger.info('Delivery', '🔄 Delivery order updated:', data);
      // Update delivery data if needed
    }
  });

  logger.info('Delivery', '✅ Delivery EventBus listeners registered');
}

/**
 * Cleanup listeners on unmount
 */
export function cleanupDeliveryEventListeners() {
  EventBus.off('sales.order.created');
  EventBus.off('sales.order.updated');
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
  // Transform and store delivery order
  // This would trigger UI updates in the Delivery module
  logger.info('Delivery', '🆕 Processing new delivery order...');

  // TODO: Call deliveryApi.createDeliveryFromOrder(orderData)
  // TODO: Update Zustand store or trigger re-fetch
}
