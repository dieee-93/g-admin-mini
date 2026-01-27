/**
 * ShiftControl Handler Utilities
 * Higher-Order Functions and utilities for event handlers
 *
 * @module shift-control/handlers/utils
 * @version 2.1
 */

import { logger } from '@/lib/logging/Logger';
import { useShiftStore } from '../store/shiftStore';
import type { EventPayload } from '@/lib/events/EventBus';

const MODULE_ID = 'ShiftControl';

// ============================================
// HIGHER-ORDER FUNCTION: createShiftAwareHandler
// ============================================

/**
 * HOF that wraps event handlers to only execute if there's an active operational shift
 * This prevents handlers from processing events when no shift is open
 *
 * @param eventName - Name of the event for logging
 * @param handler - The actual event handler function
 * @returns Wrapped handler that checks shift status first
 */
export function createShiftAwareHandler<T extends EventPayload>(
  eventName: string,
  handler: (event: T) => Promise<void> | void
) {
  return async (event: T) => {
    const isOperational = useShiftStore.getState().isOperational();

    if (!isOperational) {
      logger.debug(MODULE_ID, `Event ignored - no active shift`, {
        event: eventName,
        pattern: event.pattern,
      });
      return;
    }

    try {
      await handler(event);
    } catch (error) {
      logger.error(MODULE_ID, `Error handling ${eventName}`, {
        error,
        eventPattern: event.pattern,
      });
    }
  };
}
