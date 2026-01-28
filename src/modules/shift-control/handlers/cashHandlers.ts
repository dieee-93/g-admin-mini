/**
 * Cash Event Handlers for ShiftControl
 *
 * Handles cash.* events and updates shift state
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

// ============================================================================
// CASH SESSION OPENED
// ============================================================================

/**
 * Handle cash.session.opened event
 * Updates the cashSession indicator in the shift store
 */
export const handleCashSessionOpened = createShiftAwareHandler(
  'cash.session.opened',
  async (event: EventPayload) => {
    const { session } = event.data;
    useShiftStore.getState().setCashSession(session);

    logger.info(MODULE_ID, 'Cash session opened', {
      sessionId: session.id,
      moneyLocationId: session.money_location_id,
    });
  }
);

// ============================================================================
// CASH SESSION CLOSED
// ============================================================================

/**
 * Handle cash.session.closed event
 * Clears the cashSession indicator and adds alert if there's a discrepancy
 */
export const handleCashSessionClosed = createShiftAwareHandler(
  'cash.session.closed',
  async (event: EventPayload) => {
    const { session, discrepancy } = event.data;
    useShiftStore.getState().setCashSession(null);

    // If discrepancy, add alert
    if (discrepancy && Math.abs(discrepancy) > 0.01) {
      useShiftStore.getState().addAlert({
        type: 'cash',
        severity: Math.abs(discrepancy) > 50 ? 'error' : 'warning',
        message: `Diferencia de caja: $${discrepancy.toFixed(2)}`,
        moduleId: 'accounting',
        actionable: true,
        actionLabel: 'Ver Sesión',
      });
    }

    logger.info(MODULE_ID, 'Cash session closed', {
      sessionId: session.id,
      discrepancy,
    });
  }
);
