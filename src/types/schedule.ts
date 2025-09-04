/**
 * @fileoverview This file contains the centralized type definitions for the new scheduling system.
 * Based on the architecture and data modeling session.
 */

/**
 * Represents a single, continuous block of time.
 * e.g., from 09:00 to 17:00.
 */
export interface TimeBlock {
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
}

/**
 * Represents the scheduling rules for a specific day of the week.
 * It can contain multiple time blocks to support split shifts.
 */
export interface DailyRule {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  /** An array of time blocks to support split schedules (e.g., 9-13h and 15-18h). */
  timeBlocks: TimeBlock[];
}

/**
 * The main interface for a Schedule.
 * A schedule represents a named set of recurring weekly rules that apply to a specific entity
 * (like a branch, a delivery zone, or a staff member) for a specific purpose (its type).
 */
export interface Schedule {
  /** A unique identifier for the schedule instance. */
  id: string;

  /** A human-readable name for the schedule, e.g., "Horario de Verano", "Turno Mañana Cocina". */
  name: string;

  /** The type of schedule, crucial for modular logic. */
  type: 'BUSINESS_HOURS' | 'DELIVERY' | 'PICKUP' | 'STAFF_SHIFT';

  /** The ID of the entity this schedule belongs to, e.g., branch_id, delivery_zone_id, staff_id. */
  associatedEntityId: string;

  /** The array of weekly recurring rules that define the schedule. */
  weeklyRules: DailyRule[];

  /** (Optional) The date from which this schedule is effective (inclusive). Format: "YYYY-MM-DD" */
  validFrom?: string;

  /** (Optional) The date until which this schedule is effective (inclusive). Format: "YYYY-MM-DD" */
  validUntil?: string;

  /** (Optional) A list of specific dates that are exceptions to the recurring rules. */
  exceptions?: Array<{
    date: string; // "YYYY-MM-DD"
    description: string; // e.g., "Feriado Nacional", "Cerrado por refacción"
    // Optionally, specific time blocks for the exception day could be defined here.
  }>;
}
