/**
 * UNIFIED DATE/TIME TYPES - G-ADMIN MINI v3.0
 *
 * BREAKING CHANGE: Complete rewrite of date/time handling
 * NO backward compatibility - replaces all legacy date patterns
 *
 * @version 3.0.0
 * @breaking-change Replaces all legacy date/time types
 */

// ===============================
// BRANDED TYPES FOR TYPE SAFETY
// ===============================

/**
 * ISO Date string in YYYY-MM-DD format
 * Replaces all legacy "date: string" patterns
 */
export type ISODateString = string & { readonly __brand: 'ISODate' };

/**
 * ISO Time string in HH:MM format (24-hour)
 * Replaces all legacy "time: string" patterns
 */
export type ISOTimeString = string & { readonly __brand: 'ISOTime' };

/**
 * Full ISO DateTime string with timezone
 * New standard for all precise timestamps
 */
export type ISODateTimeString = string & { readonly __brand: 'ISODateTime' };

/**
 * Duration in minutes
 * New standard for all time calculations
 */
export type DurationMinutes = number & { readonly __brand: 'DurationMinutes' };

/**
 * IANA Timezone identifier
 * New standard for timezone handling
 */
export type TimezoneString = string & { readonly __brand: 'Timezone' };

// ===============================
// CORE CALENDAR TYPES
// ===============================

/**
 * Universal time slot - replaces ALL legacy time slot types
 */
export interface TimeSlot {
  readonly id: string;
  readonly date: ISODateString;
  readonly startTime: ISOTimeString;
  readonly endTime: ISOTimeString;
  readonly duration: DurationMinutes;
  readonly timezone: TimezoneString;
}

/**
 * Precise timestamp for audit/events
 */
export interface Timestamp {
  readonly dateTime: ISODateTimeString;
  readonly timezone: TimezoneString;
  readonly utcOffset: number;
}

/**
 * Availability window (recurring patterns)
 */
export interface AvailabilityWindow {
  readonly dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  readonly startTime: ISOTimeString;
  readonly endTime: ISOTimeString;
  readonly timezone: TimezoneString;
}

/**
 * Date range for queries/filters
 */
export interface DateRange {
  readonly startDate: ISODateString;
  readonly endDate: ISODateString;
  readonly timezone?: TimezoneString;
}

// ===============================
// BOOKING SYSTEM TYPES
// ===============================

/**
 * Booking types for different business models
 */
export type BookingType =
  | 'appointment'    // Medical, Legal, Beauty
  | 'class'          // Fitness, Education
  | 'space'          // Co-working, Events
  | 'rental'         // Equipment, Vehicles
  | 'shift'          // Staff scheduling
  | 'event'          // Private events
  | 'maintenance'    // System maintenance
  | 'blocked';       // Unavailable time

/**
 * Booking status lifecycle
 */
export type BookingStatus =
  | 'pending'        // Awaiting confirmation
  | 'confirmed'      // Confirmed by both parties
  | 'in_progress'    // Currently happening
  | 'completed'      // Successfully finished
  | 'cancelled'      // Cancelled by user/system
  | 'no_show'        // User didn't show up
  | 'rescheduled'    // Moved to different time
  | 'expired';       // Past cancellation deadline

/**
 * Core booking entity - replaces ALL legacy booking types
 */
export interface Booking {
  readonly id: string;
  readonly type: BookingType;
  readonly status: BookingStatus;

  // Time specification
  readonly timeSlot: TimeSlot;

  // Resource assignment
  readonly resourceIds: string[];

  // Customer information
  readonly customerId?: string;
  readonly customerName?: string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;

  // Business metadata
  readonly businessModel: string;
  readonly serviceType?: string;
  readonly notes?: string;
  readonly cost?: number;

  // Audit trail
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly createdBy: string;
}

// ===============================
// RESOURCE MANAGEMENT TYPES
// ===============================

/**
 * Resource types in the system
 */
export type ResourceType =
  | 'staff'          // Human resources
  | 'room'           // Physical spaces
  | 'equipment'      // Tools, machines
  | 'vehicle'        // Transportation
  | 'table'          // Restaurant tables
  | 'asset';         // Generic assets

/**
 * Resource availability status
 */
export type ResourceStatus =
  | 'available'      // Ready for booking
  | 'busy'           // Currently booked
  | 'maintenance'    // Under maintenance
  | 'offline'        // Temporarily unavailable
  | 'retired';       // No longer in service

/**
 * Universal resource entity
 */
export interface Resource {
  readonly id: string;
  readonly type: ResourceType;
  readonly name: string;
  readonly status: ResourceStatus;

  // Capacity and constraints
  readonly capacity?: number;
  readonly skills?: string[];
  readonly location?: string;
  readonly equipment?: string[];

  // Availability
  readonly availability: AvailabilityWindow[];
  readonly workingHours?: TimeSlot[];

  // Business context
  readonly businessModel: string;
  readonly department?: string;
  readonly costPerHour?: number;

  // Metadata
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

// ===============================
// CALENDAR CONFIGURATION TYPES
// ===============================

/**
 * Business hours configuration
 */
export interface BusinessHours {
  readonly timezone: TimezoneString;
  readonly workingDays: AvailabilityWindow[];
  readonly holidays: ISODateString[];
  readonly specialHours: {
    readonly date: ISODateString;
    readonly hours: AvailabilityWindow[];
  }[];
}

/**
 * Booking rules and constraints
 */
export interface BookingRules {
  // Advance booking constraints
  readonly minAdvanceBooking: DurationMinutes;
  readonly maxAdvanceBooking: DurationMinutes;

  // Cancellation policy
  readonly allowCancellation: boolean;
  readonly cancellationDeadline: DurationMinutes;
  readonly cancellationFee?: number;

  // Booking constraints
  readonly minDuration: DurationMinutes;
  readonly maxDuration: DurationMinutes;
  readonly slotIncrement: DurationMinutes;
  readonly bufferTime: DurationMinutes;

  // Business rules
  readonly requiresApproval: boolean;
  readonly requiresDeposit: boolean;
  readonly allowsRecurring: boolean;
  readonly maxConcurrentBookings?: number;

  // Special requirements
  readonly requiresStaffAssignment: boolean;
  readonly requiresCustomerInfo: boolean;
  readonly requiresPayment: boolean;
}

/**
 * Calendar configuration for business models
 */
export interface CalendarConfig {
  readonly businessModel: string;
  readonly timezone: TimezoneString;
  readonly businessHours: BusinessHours;
  readonly bookingRules: BookingRules;
  readonly enabledFeatures: string[];
  readonly metadata: Record<string, unknown>;
}

// ===============================
// VALIDATION TYPES
// ===============================

/**
 * Validation result
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
}

/**
 * Conflict detection result
 */
export interface ConflictResult {
  readonly hasConflicts: boolean;
  readonly conflicts: {
    readonly type: 'resource' | 'time' | 'business_rule';
    readonly message: string;
    readonly conflictingBooking?: Booking;
    readonly conflictingResource?: Resource;
  }[];
}

/**
 * Availability check result
 */
export interface AvailabilityResult {
  readonly isAvailable: boolean;
  readonly availableSlots: TimeSlot[];
  readonly unavailableReasons: string[];
  readonly suggestedAlternatives: TimeSlot[];
}

// ===============================
// EVENT TYPES FOR INTEGRATION
// ===============================

/**
 * Calendar event types for EventBus
 */
export type CalendarEventType =
  | 'booking_created'
  | 'booking_updated'
  | 'booking_cancelled'
  | 'booking_confirmed'
  | 'booking_completed'
  | 'resource_assigned'
  | 'resource_released'
  | 'conflict_detected'
  | 'availability_changed'
  | 'schedule_optimized';

/**
 * Calendar event payload
 */
export interface CalendarEvent {
  readonly type: CalendarEventType;
  readonly timestamp: Timestamp;
  readonly bookingId?: string;
  readonly resourceId?: string;
  readonly data: Record<string, unknown>;
  readonly businessModel: string;
  readonly userId: string;
}

// ===============================
// TYPE GUARDS AND UTILITIES
// ===============================

/**
 * Type guard for ISODateString
 */
export function isISODateString(value: string): value is ISODateString {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Type guard for ISOTimeString
 */
export function isISOTimeString(value: string): value is ISOTimeString {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

/**
 * Type guard for ISODateTimeString
 */
export function isISODateTimeString(value: string): value is ISODateTimeString {
  try {
    const date = new Date(value);
    return date.toISOString() === value;
  } catch {
    return false;
  }
}

/**
 * Type guard for TimezoneString
 */
export function isTimezoneString(value: string): value is TimezoneString {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}