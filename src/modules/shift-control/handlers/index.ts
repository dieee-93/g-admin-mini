/**
 * Event Handlers Index
 *
 * Exports all event handlers for shift-control module
 *
 * @module shift-control/handlers
 * @version 2.1
 */

// Export utility functions
export { createShiftAwareHandler } from './utils';

// Export event handlers by category
export * from './cashHandlers';
export * from './staffHandlers';
export * from './materialsHandlers';
export * from './operationsHandlers';

// Re-export for convenience in manifest
import {
  handleCashSessionOpened,
  handleCashSessionClosed,
} from './cashHandlers';

import {
  handleStaffCheckedIn,
  handleStaffCheckedOut,
} from './staffHandlers';

import {
  handleStockLow,
  handleStockRestocked,
} from './materialsHandlers';

import {
  handleTableOpened,
  handleTableClosed,
  handleDeliveryStarted,
  handleDeliveryCompleted,
  handleDeliveryCancelled,
  handleOrderCreated,
  handleOrderCompleted,
  handleOrderCancelled,
} from './operationsHandlers';

/**
 * Map of event patterns to handlers
 * Used for easy subscription in manifest
 */
export const shiftEventHandlers = {
  // Cash events
  'cash.session.opened': handleCashSessionOpened,
  'cash.session.closed': handleCashSessionClosed,

  // Staff events
  'staff.employee.checked_in': handleStaffCheckedIn,
  'staff.employee.checked_out': handleStaffCheckedOut,

  // Table events
  'tables.table.opened': handleTableOpened,
  'tables.table.closed': handleTableClosed,

  // Delivery events
  'delivery.started': handleDeliveryStarted,
  'delivery.completed': handleDeliveryCompleted,
  'delivery.cancelled': handleDeliveryCancelled,

  // Order events
  'order.created': handleOrderCreated,
  'order.completed': handleOrderCompleted,
  'order.cancelled': handleOrderCancelled,

  // Inventory events
  'inventory.stock.low': handleStockLow,
  'inventory.stock.restocked': handleStockRestocked,
} as const;
