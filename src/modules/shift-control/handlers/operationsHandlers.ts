/**
 * Operations Event Handlers for ShiftControl
 *
 * Handles operations events (tables, deliveries, orders)
 * Uses createShiftAwareHandler HOF to ensure shift is active
 *
 * @module shift-control/handlers
 * @version 2.1
 */

import { logger } from '@/lib/logging/Logger';
import { useShiftStore } from '../store/shiftStore';
import { createShiftAwareHandler } from './utils';
import type { EventPayload } from '@/lib/events/EventBus';

const MODULE_ID = 'ShiftControl';

// ============================================
// TABLE HANDLERS
// ============================================

/**
 * Handle tables.table.opened event
 * Increments open tables count
 */
export const handleTableOpened = createShiftAwareHandler(
  'tables.table.opened',
  async (event: EventPayload) => {
    const currentCount = useShiftStore.getState().openTablesCount;
    useShiftStore.getState().setOpenTablesCount(currentCount + 1);

    logger.debug(MODULE_ID, 'Table opened', {
      tableId: event.data.table_id,
      newCount: currentCount + 1,
    });
  }
);

/**
 * Handle tables.table.closed event
 * Decrements open tables count
 */
export const handleTableClosed = createShiftAwareHandler(
  'tables.table.closed',
  async (event: EventPayload) => {
    const currentCount = useShiftStore.getState().openTablesCount;
    useShiftStore.getState().setOpenTablesCount(Math.max(0, currentCount - 1));

    logger.debug(MODULE_ID, 'Table closed', {
      tableId: event.data.table_id,
      newCount: Math.max(0, currentCount - 1),
    });
  }
);

// ============================================
// DELIVERY HANDLERS
// ============================================

/**
 * Handle delivery.started event
 * Increments active deliveries count
 */
export const handleDeliveryStarted = createShiftAwareHandler(
  'delivery.started',
  async (event: EventPayload) => {
    const currentCount = useShiftStore.getState().activeDeliveriesCount;
    useShiftStore.getState().setActiveDeliveriesCount(currentCount + 1);

    logger.debug(MODULE_ID, 'Delivery started', {
      deliveryId: event.data.delivery_id,
      newCount: currentCount + 1,
    });
  }
);

/**
 * Handle delivery.completed event
 * Decrements active deliveries count
 */
export const handleDeliveryCompleted = createShiftAwareHandler(
  'delivery.completed',
  async (event: EventPayload) => {
    const currentCount = useShiftStore.getState().activeDeliveriesCount;
    useShiftStore.getState().setActiveDeliveriesCount(Math.max(0, currentCount - 1));

    logger.debug(MODULE_ID, 'Delivery completed', {
      deliveryId: event.data.delivery_id,
      newCount: Math.max(0, currentCount - 1),
    });
  }
);

/**
 * Handle delivery.cancelled event
 * Decrements active deliveries count
 */
export const handleDeliveryCancelled = createShiftAwareHandler(
  'delivery.cancelled',
  async (event: EventPayload) => {
    const currentCount = useShiftStore.getState().activeDeliveriesCount;
    useShiftStore.getState().setActiveDeliveriesCount(Math.max(0, currentCount - 1));

    logger.debug(MODULE_ID, 'Delivery cancelled', {
      deliveryId: event.data.delivery_id,
      newCount: Math.max(0, currentCount - 1),
    });
  }
);

// ============================================
// ORDER HANDLERS
// ============================================

/**
 * Handle order.created event
 * Increments pending orders count (if order is pending)
 */
export const handleOrderCreated = createShiftAwareHandler(
  'order.created',
  async (event: EventPayload) => {
    const { order } = event.data;

    // Only count if status is pending
    if (order.status === 'pending' || order.status === 'processing') {
      const currentCount = useShiftStore.getState().pendingOrdersCount;
      useShiftStore.getState().setPendingOrdersCount(currentCount + 1);

      logger.debug(MODULE_ID, 'Order created (pending)', {
        orderId: order.id,
        newCount: currentCount + 1,
      });
    }
  }
);

/**
 * Handle order.completed event
 * Decrements pending orders count
 */
export const handleOrderCompleted = createShiftAwareHandler(
  'order.completed',
  async (event: EventPayload) => {
    const currentCount = useShiftStore.getState().pendingOrdersCount;
    useShiftStore.getState().setPendingOrdersCount(Math.max(0, currentCount - 1));

    logger.debug(MODULE_ID, 'Order completed', {
      orderId: event.data.order_id,
      newCount: Math.max(0, currentCount - 1),
    });
  }
);

/**
 * Handle order.cancelled event
 * Decrements pending orders count
 */
export const handleOrderCancelled = createShiftAwareHandler(
  'order.cancelled',
  async (event: EventPayload) => {
    const currentCount = useShiftStore.getState().pendingOrdersCount;
    useShiftStore.getState().setPendingOrdersCount(Math.max(0, currentCount - 1));

    logger.debug(MODULE_ID, 'Order cancelled', {
      orderId: event.data.order_id,
      newCount: Math.max(0, currentCount - 1),
    });
  }
);
