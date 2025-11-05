/**
 * UNIFIED DATE/TIME UTILITIES - G-ADMIN MINI v3.0
 *
 * BREAKING CHANGE: Complete rewrite of date/time utilities
 * NO legacy support - modern TypeScript-first approach
 *
 * @version 3.0.0
 * @breaking-change Replaces all legacy date utility functions
 */

import type {
  ISODateString,
  ISOTimeString,
  ISODateTimeString,
  DurationMinutes,
  TimezoneString,
  TimeSlot,
  Timestamp,
  ValidationResult,
  ConflictResult,
  AvailabilityResult
} from '../types/DateTimeTypes';
import {
  isISODateString,
  isISOTimeString,
  isISODateTimeString,
  isTimezoneString
} from '../types/DateTimeTypes';

// ===============================
// CORE CREATION FUNCTIONS
// ===============================

/**
 * Creates ISODateString from Date object
 * REPLACES: All legacy date formatting
 */
export function createISODate(date: Date = new Date()): ISODateString {
  const isoString = date.toISOString().split('T')[0];
  if (!isISODateString(isoString)) {
    throw new Error(`Invalid date format: ${isoString}`);
  }
  return isoString;
}

/**
 * Creates ISOTimeString from Date object
 * REPLACES: All legacy time formatting
 */
export function createISOTime(date: Date = new Date()): ISOTimeString {
  const timeString = date.toTimeString().slice(0, 5);
  if (!isISOTimeString(timeString)) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  return timeString;
}

/**
 * Creates ISODateTimeString in UTC
 * NEW: Standard for all timestamps
 */
export function createISODateTime(date: Date = new Date()): ISODateTimeString {
  const isoString = date.toISOString();
  if (!isISODateTimeString(isoString)) {
    throw new Error(`Invalid datetime format: ${isoString}`);
  }
  return isoString;
}

/**
 * Creates current timestamp
 * NEW: Standard for audit trails
 */
export function nowTimestamp(timezone: TimezoneString = 'UTC' as TimezoneString): Timestamp {
  const now = new Date();
  return {
    dateTime: createISODateTime(now),
    timezone,
    utcOffset: now.getTimezoneOffset()
  };
}

/**
 * Creates TimezoneString with validation
 * NEW: Safe timezone creation
 */
export function createTimezone(timezone: string = 'UTC'): TimezoneString {
  if (!isTimezoneString(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
  return timezone;
}

// ===============================
// PARSING AND CONVERSION
// ===============================

/**
 * Parses ISODateString to Date object
 * REPLACES: All legacy date parsing
 */
export function parseISODate(dateString: ISODateString): Date {
  const date = new Date(`${dateString}T00:00:00Z`);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return date;
}

/**
 * Parses ISOTimeString to minutes since midnight
 * NEW: Efficient time calculations
 */
export function parseISOTime(timeString: ISOTimeString): DurationMinutes {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time string: ${timeString}`);
  }
  return (hours * 60 + minutes) as DurationMinutes;
}

/**
 * Combines date and time into DateTime
 * REPLACES: All legacy datetime combinations
 */
export function combineDateTime(
  date: ISODateString,
  time: ISOTimeString,
  timezone: TimezoneString = 'UTC' as TimezoneString
): ISODateTimeString {
  // Create in specified timezone then convert to UTC
  const localDateTime = new Date(`${date}T${time}:00`);

  if (timezone === 'UTC') {
    return createISODateTime(localDateTime);
  }

  // For non-UTC timezones, we need to adjust
  // This is a simplified approach - for production, consider using Intl.DateTimeFormat
  const utcDateTime = new Date(localDateTime.toLocaleString('en-US', { timeZone: 'UTC' }));
  return createISODateTime(utcDateTime);
}

/**
 * Extracts date from DateTime
 * NEW: Safe date extraction
 */
export function extractDate(dateTime: ISODateTimeString): ISODateString {
  return createISODate(new Date(dateTime));
}

/**
 * Extracts time from DateTime
 * NEW: Safe time extraction
 */
export function extractTime(dateTime: ISODateTimeString): ISOTimeString {
  return createISOTime(new Date(dateTime));
}

// ===============================
// DURATION CALCULATIONS
// ===============================

/**
 * Calculates duration between two times
 * REPLACES: All legacy duration calculations
 */
export function calculateDuration(
  startTime: ISOTimeString,
  endTime: ISOTimeString
): DurationMinutes {
  const startMinutes = parseISOTime(startTime);
  const endMinutes = parseISOTime(endTime);

  let duration = endMinutes - startMinutes;

  // Handle overnight shifts (end time next day)
  if (duration < 0) {
    duration += 24 * 60; // Add 24 hours
  }

  return duration as DurationMinutes;
}

/**
 * Adds duration to time
 * NEW: Safe time arithmetic
 */
export function addDuration(
  time: ISOTimeString,
  duration: DurationMinutes
): ISOTimeString {
  const totalMinutes = parseISOTime(time) + duration;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` as ISOTimeString;
}

/**
 * Subtracts duration from time
 * NEW: Safe time arithmetic
 */
export function subtractDuration(
  time: ISOTimeString,
  duration: DurationMinutes
): ISOTimeString {
  return addDuration(time, (-duration) as DurationMinutes);
}

/**
 * Converts minutes to hours:minutes format
 * NEW: Human-readable durations
 */
export function formatDuration(duration: DurationMinutes): string {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

// ===============================
// VALIDATION FUNCTIONS
// ===============================

/**
 * Validates TimeSlot for consistency
 * REPLACES: All legacy time slot validation
 */
export function validateTimeSlot(slot: TimeSlot): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate individual components
  if (!isISODateString(slot.date)) {
    errors.push(`Invalid date format: ${slot.date}`);
  }

  if (!isISOTimeString(slot.startTime)) {
    errors.push(`Invalid start time format: ${slot.startTime}`);
  }

  if (!isISOTimeString(slot.endTime)) {
    errors.push(`Invalid end time format: ${slot.endTime}`);
  }

  if (!isTimezoneString(slot.timezone)) {
    errors.push(`Invalid timezone: ${slot.timezone}`);
  }

  // Return early if basic validation fails
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Validate duration consistency
  const calculatedDuration = calculateDuration(slot.startTime, slot.endTime);
  if (calculatedDuration !== slot.duration) {
    errors.push(`Duration mismatch: calculated ${calculatedDuration}, provided ${slot.duration}`);
  }

  // Validate duration constraints
  if (slot.duration <= 0) {
    errors.push('Duration must be positive');
  }

  if (slot.duration > 24 * 60) {
    warnings.push('Duration exceeds 24 hours - verify overnight shift');
  }

  // Validate time order
  if (slot.startTime >= slot.endTime && slot.duration < 23 * 60) {
    warnings.push('Start time after end time - assuming overnight shift');
  }

  // Validate date is not in the past (with 1-minute tolerance)
  const slotDateTime = combineDateTime(slot.date, slot.startTime, slot.timezone);
  const now = createISODateTime();
  if (slotDateTime < now) {
    const diffMinutes = (new Date(now).getTime() - new Date(slotDateTime).getTime()) / (1000 * 60);
    if (diffMinutes > 1) {
      warnings.push('Time slot is in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates business hours
 * NEW: Business hours validation
 */
export function validateBusinessHours(hours: {
  start: ISOTimeString;
  end: ISOTimeString;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isISOTimeString(hours.start)) {
    errors.push(`Invalid start time: ${hours.start}`);
  }

  if (!isISOTimeString(hours.end)) {
    errors.push(`Invalid end time: ${hours.end}`);
  }

  if (errors.length === 0) {
    const duration = calculateDuration(hours.start, hours.end);

    if (duration <= 0) {
      errors.push('End time must be after start time');
    }

    if (duration > 16 * 60) {
      warnings.push('Business hours exceed 16 hours - verify this is correct');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ===============================
// CONFLICT DETECTION
// ===============================

/**
 * Checks if two time slots overlap
 * REPLACES: All legacy overlap detection
 */
export function checkTimeSlotOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Different dates = no overlap
  if (slot1.date !== slot2.date) {
    return false;
  }

  const start1 = parseISOTime(slot1.startTime);
  const end1 = parseISOTime(slot1.endTime);
  const start2 = parseISOTime(slot2.startTime);
  const end2 = parseISOTime(slot2.endTime);

  // Handle overnight shifts
  const adjustedEnd1 = end1 < start1 ? end1 + 24 * 60 : end1;
  const adjustedEnd2 = end2 < start2 ? end2 + 24 * 60 : end2;

  // Check overlap
  return start1 < adjustedEnd2 && start2 < adjustedEnd1;
}

/**
 * Finds conflicts between time slots
 * NEW: Comprehensive conflict detection
 */
export function findTimeSlotConflicts(
  newSlot: TimeSlot,
  existingSlots: TimeSlot[]
): ConflictResult {
  const conflicts: ConflictResult['conflicts'] = [];

  for (const existing of existingSlots) {
    if (checkTimeSlotOverlap(newSlot, existing)) {
      conflicts.push({
        type: 'time',
        message: `Time conflict with existing slot ${existing.id}`,
        conflictingBooking: undefined // Will be populated at booking level
      });
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

// ===============================
// FORMATTING AND DISPLAY
// ===============================

/**
 * Formats date for user display
 * REPLACES: All legacy date formatting
 */
export function formatDateForUser(
  date: ISODateString,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  return new Intl.DateTimeFormat(locale, options).format(parseISODate(date));
}

/**
 * Formats time for user display
 * REPLACES: All legacy time formatting
 */
export function formatTimeForUser(
  time: ISOTimeString,
  locale: string = 'en-US',
  use24Hour: boolean = false
): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour
  }).format(date);
}

/**
 * Formats DateTime for user display with timezone
 * NEW: Timezone-aware formatting
 */
export function formatDateTimeForUser(
  dateTime: ISODateTimeString,
  timezone: TimezoneString,
  locale: string = 'en-US'
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateTime));
}

/**
 * Formats TimeSlot for user display
 * NEW: Comprehensive time slot formatting
 */
export function formatTimeSlotForUser(
  slot: TimeSlot,
  locale: string = 'en-US'
): string {
  const date = formatDateForUser(slot.date, locale);
  const startTime = formatTimeForUser(slot.startTime, locale);
  const endTime = formatTimeForUser(slot.endTime, locale);
  const duration = formatDuration(slot.duration);

  return `${date}, ${startTime} - ${endTime} (${duration})`;
}

// ===============================
// UTILITY HELPERS
// ===============================

/**
 * Gets current user's timezone
 * NEW: Automatic timezone detection
 */
export function getUserTimezone(): TimezoneString {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return createTimezone(timezone);
}

/**
 * Converts between timezones
 * NEW: Safe timezone conversion
 */
export function convertTimezone(
  dateTime: ISODateTimeString,
  fromTimezone: TimezoneString,
  toTimezone: TimezoneString
): ISODateTimeString {
  const date = new Date(dateTime);

  // Convert to target timezone
  const converted = new Date(date.toLocaleString('en-US', { timeZone: toTimezone }));

  return createISODateTime(converted);
}

/**
 * Checks if date is today
 * NEW: Today check utility
 */
export function isToday(date: ISODateString, timezone: TimezoneString = getUserTimezone()): boolean {
  const today = createISODate(new Date());
  return date === today;
}

/**
 * Gets relative date description
 * NEW: Human-friendly date descriptions
 */
export function getRelativeDateDescription(date: ISODateString): string {
  const today = createISODate();
  const targetDate = parseISODate(date);
  const todayDate = parseISODate(today);

  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDateForUser(date);
}

// ===============================
// EXPORTS FOR EXTERNAL USE
// ===============================

export const DateTimeUtils = {
  // Creation
  createISODate,
  createISOTime,
  createISODateTime,
  nowTimestamp,
  createTimezone,

  // Parsing
  parseISODate,
  parseISOTime,
  combineDateTime,
  extractDate,
  extractTime,

  // Duration
  calculateDuration,
  addDuration,
  subtractDuration,
  formatDuration,

  // Validation
  validateTimeSlot,
  validateBusinessHours,

  // Conflicts
  checkTimeSlotOverlap,
  findTimeSlotConflicts,

  // Formatting
  formatDateForUser,
  formatTimeForUser,
  formatDateTimeForUser,
  formatTimeSlotForUser,

  // Utilities
  getUserTimezone,
  convertTimezone,
  isToday,
  getRelativeDateDescription
} as const;