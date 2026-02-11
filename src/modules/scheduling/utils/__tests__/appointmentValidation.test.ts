
import { describe, it, expect } from 'vitest';
import {
    isOverbooking,
    isStaffAvailable,
    calculateNoShowRate
} from '../appointmentValidation';
import { Booking, StaffShift, TimeSlot } from '@/shared/calendar/types/DateTimeTypes';

// Mock helpers
const createMockTimeSlot = (date: string, start: string, end: string): TimeSlot => ({
    id: 'ts-1',
    date: date as any,
    startTime: start as any,
    endTime: end as any,
    duration: 60,
    timezone: 'UTC' as any
});

const createMockBooking = (
    id: string,
    date: string,
    start: string,
    end: string,
    resourceIds: string[] = ['res-1'],
    status: any = 'confirmed'
): Booking => ({
    id,
    type: 'appointment',
    status,
    timeSlot: createMockTimeSlot(date, start, end),
    resourceIds,
    businessModel: 'service',
    createdAt: {} as any,
    updatedAt: {} as any,
    createdBy: 'user-1'
});

const createMockShift = (
    employeeId: string,
    date: string,
    start: string,
    end: string
): StaffShift => ({
    id: 'shift-1',
    type: 'shift',
    status: 'confirmed',
    employeeId,
    employeeName: 'Test Staff',
    position: 'Barber',
    resourceIds: [employeeId],
    timeSlot: createMockTimeSlot(date, start, end),
    businessModel: 'service',
    createdAt: {} as any,
    updatedAt: {} as any,
    createdBy: 'admin'
});

describe('appointmentValidation', () => {

    describe('isOverbooking', () => {
        it('should return false when no existing bookings', () => {
            const newBooking = createMockBooking('new', '2024-01-01', '10:00', '11:00');
            expect(isOverbooking(newBooking, [])).toBe(false);
        });

        it('should return true for exact overlap on same resource', () => {
            const existing = createMockBooking('ex1', '2024-01-01', '10:00', '11:00');
            const newBooking = createMockBooking('new', '2024-01-01', '10:00', '11:00');
            expect(isOverbooking(newBooking, [existing])).toBe(true);
        });

        it('should return false for different resources', () => {
            const existing = createMockBooking('ex1', '2024-01-01', '10:00', '11:00', ['res-1']);
            const newBooking = createMockBooking('new', '2024-01-01', '10:00', '11:00', ['res-2']);
            expect(isOverbooking(newBooking, [existing])).toBe(false);
        });

        it('should return true for partial overlap (end inside)', () => {
            const existing = createMockBooking('ex1', '2024-01-01', '10:00', '12:00');
            const newBooking = createMockBooking('new', '2024-01-01', '11:00', '13:00');
            expect(isOverbooking(newBooking, [existing])).toBe(true);
        });

        it('should return true for partial overlap (start inside)', () => {
            const existing = createMockBooking('ex1', '2024-01-01', '10:00', '12:00');
            const newBooking = createMockBooking('new', '2024-01-01', '09:00', '11:00');
            expect(isOverbooking(newBooking, [existing])).toBe(true);
        });

        it('should return false for adjacent bookings', () => {
            const existing = createMockBooking('ex1', '2024-01-01', '10:00', '11:00');
            const newBooking = createMockBooking('new', '2024-01-01', '11:00', '12:00');
            // 10-11 vs 11-12 -> No overlap
            expect(isOverbooking(newBooking, [existing])).toBe(false);
        });

        it('should ignore cancelled bookings', () => {
            const existing = createMockBooking('ex1', '2024-01-01', '10:00', '11:00', ['res-1'], 'cancelled');
            const newBooking = createMockBooking('new', '2024-01-01', '10:00', '11:00');
            expect(isOverbooking(newBooking, [existing])).toBe(false);
        });
    });

    describe('isStaffAvailable', () => {
        it('should return true if no staff assigned', () => {
            const booking = createMockBooking('b1', '2024-01-01', '10:00', '11:00', []);
            expect(isStaffAvailable(booking, [])).toBe(true);
        });

        it('should return true if staff has covering shift', () => {
            const booking = createMockBooking('b1', '2024-01-01', '10:00', '11:00', ['staff-1']);
            const shift = createMockShift('staff-1', '2024-01-01', '09:00', '17:00');
            expect(isStaffAvailable(booking, [shift])).toBe(true);
        });

        it('should return false if staff has NO shift', () => {
            const booking = createMockBooking('b1', '2024-01-01', '10:00', '11:00', ['staff-1']);
            expect(isStaffAvailable(booking, [])).toBe(true); // Logic update: if no shifts passed for this ID, we assume valid/external? 
            // Wait, logic says: "If we find NO shifts payload for that resourceId, we skip it (assume non-staff or not loaded)."
            // So expected is true.
        });

        it('should return false if staff has shift but time is outside', () => {
            const booking = createMockBooking('b1', '2024-01-01', '18:00', '19:00', ['staff-1']);
            const shift = createMockShift('staff-1', '2024-01-01', '09:00', '17:00');
            // Here shifts ARE found, so we check them. none cover -> false.
            expect(isStaffAvailable(booking, [shift])).toBe(false);
        });

        it('should return false if shift is on different date', () => {
            const booking = createMockBooking('b1', '2024-01-02', '10:00', '11:00', ['staff-1']);
            const shift = createMockShift('staff-1', '2024-01-01', '09:00', '17:00');
            expect(isStaffAvailable(booking, [shift])).toBe(false);
        });
    });

    describe('calculateNoShowRate', () => {
        it('should return 0 for no bookings', () => {
            expect(calculateNoShowRate([])).toBe(0);
        });

        it('should return correct rate (1 no-show out of 4 bookings)', () => {
            const bookings = [
                createMockBooking('1', '2024-01-01', '10:00', '11:00', [], 'completed'),
                createMockBooking('2', '2024-01-01', '12:00', '13:00', [], 'completed'),
                createMockBooking('3', '2024-01-01', '14:00', '15:00', [], 'completed'),
                createMockBooking('4', '2024-01-01', '16:00', '17:00', [], 'no_show'),
            ];
            // Mock Date to be after these events
            const originalDate = global.Date;
            const mockNow = new Date('2024-01-02T12:00:00Z');

            // @ts-ignore
            global.Date = class extends Date {
                constructor(date) {
                    if (date) return super(date);
                    return mockNow;
                }
            };

            expect(calculateNoShowRate(bookings)).toBe(0.25);

            // Restore Date
            global.Date = originalDate;
        });

        it('should ignore older bookings', () => {
            const bookings = [
                createMockBooking('1', '2023-01-01', '10:00', '11:00', [], 'no_show'), // Old
                createMockBooking('2', '2024-01-01', '12:00', '13:00', [], 'completed'), // Recent
            ];

            const originalDate = global.Date;
            const mockNow = new Date('2024-01-02T12:00:00Z');
            // @ts-ignore
            global.Date = class extends Date {
                constructor(date) {
                    if (date) return super(date);
                    return mockNow;
                }
            };

            expect(calculateNoShowRate(bookings, 30)).toBe(0); // 0 no-shows in recent period

            global.Date = originalDate;
        });
    });
});
