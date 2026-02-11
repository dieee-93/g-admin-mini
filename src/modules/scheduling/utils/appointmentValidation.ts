
import {
    Booking,
    StaffShift,
    TimeSlot
} from '@/shared/calendar/types/DateTimeTypes';

/**
 * Checks if a proposed booking overlaps with any existing bookings.
 * 
 * @param newBooking The booking being created or updated
 * @param existingBookings List of existing bookings to check against
 * @returns True if there is an overlap (overbooking), false otherwise
 */
export function isOverbooking(
    newBooking: Pick<Booking, 'timeSlot' | 'resourceIds' | 'id'>,
    existingBookings: Booking[]
): boolean {
    if (!newBooking.timeSlot || !newBooking.resourceIds || newBooking.resourceIds.length === 0) {
        return false;
    }

    const newStart = new Date(`${newBooking.timeSlot.date}T${newBooking.timeSlot.startTime}`);
    const newEnd = new Date(`${newBooking.timeSlot.date}T${newBooking.timeSlot.endTime}`);

    return existingBookings.some(existing => {
        // Skip self
        if (existing.id === newBooking.id) return false;

        // Skip cancelled bookings
        if (existing.status === 'cancelled') return false;

        // Check resource overlap
        // A booking can have multiple resources (e.g. staff + room)
        // If ANY resource overlaps, it's a conflict
        const hasResourceConflict = existing.resourceIds.some(r =>
            newBooking.resourceIds.includes(r)
        );
        if (!hasResourceConflict) return false;

        // Check time overlap
        const existingStart = new Date(`${existing.timeSlot.date}T${existing.timeSlot.startTime}`);
        const existingEnd = new Date(`${existing.timeSlot.date}T${existing.timeSlot.endTime}`);

        // Simple overlap check: (StartA < EndB) and (EndA > StartB)
        return (newStart < existingEnd) && (newEnd > existingStart);
    });
}


/**
 * Helper to validate if a booking fits within a shift
 */
function isBookingWithinShift(bookingSlot: TimeSlot, shift: StaffShift): boolean {
    if (shift.status === 'cancelled') return false;

    // Must be same date
    if (shift.timeSlot.date !== bookingSlot.date) return false;

    const bookingStart = new Date(`${bookingSlot.date}T${bookingSlot.startTime}`);
    const bookingEnd = new Date(`${bookingSlot.date}T${bookingSlot.endTime}`);

    // Shift times
    const shiftStart = new Date(`${shift.timeSlot.date}T${shift.timeSlot.startTime}`);
    const shiftEnd = new Date(`${shift.timeSlot.date}T${shift.timeSlot.endTime}`);

    // Booking must be fully within shift: shiftStart <= bookingStart AND bookingEnd <= shiftEnd
    return (shiftStart <= bookingStart) && (bookingEnd <= shiftEnd);
}

/**
 * Checks if the assigned staff is available (scheduled to work) during the booking time.
 * API assumes resourceIds includes the staff ID.
 * 
 * @param booking The booking to check
 * @param staffShifts List of ALL staff shifts for the relevant date(s)
 * @returns True if ALL assigned staff members have a valid shift covering the booking time.
 */
export function isStaffAvailable(
    booking: Pick<Booking, 'timeSlot' | 'resourceIds'>,
    staffShifts: StaffShift[]
): boolean {
    if (!booking.resourceIds || booking.resourceIds.length === 0) return true;

    // Filter resourceIds to find which ones correspond to staff. 
    // Since we don't have resource type here, we rely on staffShifts.
    // If a resourceId matches a shift.employeeId, we treat it as a staff assignment requiring verification.

    // We only check availability for resources that seem to be staff (have shifts).
    // If a resourceId is a room (no shifts), this logic ignores it (returns true for that resource).

    // Strategy: For every resourceId, if there exist ANY shifts for that ID in the provided list,
    // then one of those shifts MUST cover the booking time.
    // If no shifts exist for a resourceId in the list provided, we assume it's not a staff member managed by this schedule (or no schedule loaded)
    // BUT usually we want strict validation. 

    // Better Strategy: 
    // We iterate over resourceIds. If we find shifts for that resourceId, check overlap.
    // If we find NO shifts payload for that resourceId, we skip it (assume non-staff or not loaded).
    // The caller is responsible for passing relevant shifts.

    for (const resourceId of booking.resourceIds) {
        // Find all shifts for this resource
        const shiftsForResource = staffShifts.filter(s => s.employeeId === resourceId);

        // If this resource has shifts (is a staff member with schedule), verify coverage
        if (shiftsForResource.length > 0) {
            const hasCoveringShift = shiftsForResource.some(shift =>
                isBookingWithinShift(booking.timeSlot, shift)
            );

            if (!hasCoveringShift) {
                // Staff member has shifts today but none cover this specific time
                return false;
            }
        }
    }

    return true;
}

/**
 * Calculates the no-show rate for a customer over a rolling period.
 * 
 * @param bookings All bookings for this customer (history)
 * @param daysLookback Number of days to look back (default 30)
 * @returns Rate between 0.0 and 1.0
 */
export function calculateNoShowRate(
    bookings: Booking[],
    daysLookback: number = 30
): number {
    if (!bookings.length) return 0;

    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysLookback);

    // Filter relevant bookings: 
    // 1. Within lookback window
    // 2. Status is final (completed, no_show, cancelled?) 
    // Usually we only count completed vs no_show for rate. Cancelled might not count.

    const relevantBookings = bookings.filter(b => {
        const bookingDate = new Date(`${b.timeSlot.date}T${b.timeSlot.startTime}`);
        return bookingDate >= cutoffDate && bookingDate <= now &&
            ['completed', 'no_show'].includes(b.status);
    });

    if (relevantBookings.length === 0) return 0;

    const noShows = relevantBookings.filter(b => b.status === 'no_show').length;

    return noShows / relevantBookings.length;
}
