/**
 * Staff Event Handlers for ShiftControl
 *
 * Handles staff.* events and updates shift state
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
// TEAM MEMBER CHECKED IN
// ============================================================================

/**
 * Handle team.member.checked_in event
 * Increments the active staff count
 */
export const handleStaffCheckedIn = createShiftAwareHandler(
  'team.member.checked_in',
  async (event: EventPayload) => {
    const { employee_id, employee_name } = event.data;

    // Increment staff count
    useShiftStore.getState().incrementActiveStaffCount();

    logger.info(MODULE_ID, 'Team member checked in', {
      employeeId: employee_id,
      employeeName: employee_name,
      newCount: useShiftStore.getState().activeStaffCount,
    });
  }
);

// ============================================================================
// TEAM MEMBER CHECKED OUT
// ============================================================================

/**
 * Handle team.member.checked_out event
 * Decrements the active staff count
 */
export const handleStaffCheckedOut = createShiftAwareHandler(
  'team.member.checked_out',
  async (event: EventPayload) => {
    const { employee_id, hours_worked } = event.data;

    // Decrement staff count
    useShiftStore.getState().decrementActiveStaffCount();

    logger.info(MODULE_ID, 'Staff checked out', {
      employeeId: employee_id,
      hoursWorked: hours_worked,
      newCount: useShiftStore.getState().activeStaffCount,
    });
  }
);
