/**
 * UNIFIED SCHEDULING TYPES - G-ADMIN MINI v3.0
 *
 * BREAKING CHANGE: Complete rewrite using unified calendar system
 * NO legacy support - uses new branded types and UnifiedCalendarEngine
 *
 * @version 3.0.0
 * @breaking-change Replaces all legacy scheduling types
 */

import {
  ISODateString,
  ISOTimeString,
  DurationMinutes,
  TimezoneString,
  TimeSlot,
  Booking,
  BookingType,
  BookingStatus,
  Resource,
  ResourceType,
  ResourceStatus,
  Timestamp,
  DateRange,
  AvailabilityWindow
} from '../../../../shared/calendar/types/DateTimeTypes';

// ===============================
// SCHEDULING-SPECIFIC TYPES
// ===============================

/**
 * Staff shift booking - extends unified Booking for scheduling context
 * REPLACES: Legacy Shift interface
 */
export interface StaffShift extends Omit<Booking, 'type' | 'resourceIds'> {
  readonly type: 'shift';
  readonly employeeId: string;
  readonly employeeName: string;
  readonly position: string;
  readonly breakDuration?: DurationMinutes;
  readonly resourceIds: [string]; // Single employee resource
}

/**
 * Shift status mapping to unified booking status
 * REPLACES: Legacy ShiftStatus
 */
export type ShiftStatus = BookingStatus;

/**
 * Work schedule containing multiple shifts
 * REPLACES: Legacy Schedule interface
 */
export interface WorkSchedule {
  readonly id: string;
  readonly name: string;
  readonly dateRange: DateRange;
  readonly shifts: StaffShift[];
  readonly status: 'draft' | 'published' | 'archived';
  readonly timezone: TimezoneString;
  readonly createdBy: string;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Shift template for recurring patterns
 * REPLACES: Legacy ShiftTemplate interface
 */
export interface ShiftTemplate {
  readonly id: string;
  readonly name: string;
  readonly availability: AvailabilityWindow;
  readonly positionId: string;
  readonly maxEmployees: number;
  readonly minStaffLevel: number;
  readonly requiredSkills: string[];
  readonly breakDuration?: DurationMinutes;
  readonly metadata: Record<string, unknown>;
}

/**
 * Time off request using unified types
 * REPLACES: Legacy TimeOffRequest interface
 */
export interface TimeOffRequest {
  readonly id: string;
  readonly employeeId: string;
  readonly dateRange: DateRange;
  readonly type: 'vacation' | 'sick' | 'personal' | 'emergency' | 'training';
  readonly status: 'pending' | 'approved' | 'denied' | 'cancelled';
  readonly reason?: string;
  readonly attachments?: string[];
  readonly requestedAt: Timestamp;
  readonly reviewedBy?: string;
  readonly reviewedAt?: Timestamp;
  readonly notes?: string;
}

/**
 * Employee resource for scheduling
 * EXTENDS: Unified Resource for staff context
 */
export interface EmployeeResource extends Resource {
  readonly type: 'staff';
  readonly employeeId: string;
  readonly position: string;
  readonly hourlyRate?: number;
  readonly maxHoursPerWeek?: number;
  readonly skills: string[];
  readonly certifications?: string[];
  readonly availability: AvailabilityWindow[];
  readonly timeOffRequests?: TimeOffRequest[];
}

/**
 * Shift creation form data
 * REPLACES: Legacy ShiftFormData
 */
export interface ShiftFormData {
  readonly employeeId: string;
  readonly timeSlot: TimeSlot;
  readonly position: string;
  readonly breakDuration?: DurationMinutes;
  readonly notes?: string;
  readonly recurring?: {
    readonly frequency: 'daily' | 'weekly' | 'monthly';
    readonly interval: number;
    readonly endDate?: ISODateString;
    readonly occurrences?: number;
  };
}

// ===============================
// SCHEDULING ANALYTICS TYPES
// ===============================

/**
 * Labor cost calculation
 */
export interface LaborCost {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly position: string;
  readonly hourlyRate: number;
  readonly hoursWorked: DurationMinutes;
  readonly regularHours: DurationMinutes;
  readonly overtimeHours: DurationMinutes;
  readonly totalCost: number;
  readonly date: ISODateString;
}

/**
 * Schedule coverage metrics
 */
export interface CoverageMetrics {
  readonly date: ISODateString;
  readonly position: string;
  readonly requiredStaff: number;
  readonly scheduledStaff: number;
  readonly actualStaff: number;
  readonly coveragePercentage: number;
  readonly gaps: TimeSlot[];
  readonly overstaffed: TimeSlot[];
}

/**
 * Staff utilization metrics
 */
export interface StaffUtilization {
  readonly employeeId: string;
  readonly employeeName: string;
  readonly position: string;
  readonly scheduledHours: DurationMinutes;
  readonly workedHours: DurationMinutes;
  readonly utilizationRate: number;
  readonly efficiency: number;
  readonly dateRange: DateRange;
}

/**
 * Schedule optimization result
 */
export interface ScheduleOptimization {
  readonly originalSchedule: WorkSchedule;
  readonly optimizedSchedule: WorkSchedule;
  readonly improvements: {
    readonly costSavings: number;
    readonly coverageImprovement: number;
    readonly staffSatisfaction: number;
    readonly efficiency: number;
  };
  readonly changes: {
    readonly shiftsAdded: StaffShift[];
    readonly shiftsRemoved: StaffShift[];
    readonly shiftsModified: {
      readonly original: StaffShift;
      readonly modified: StaffShift;
    }[];
  };
}

// ===============================
// SCHEDULING RULES AND CONSTRAINTS
// ===============================

/**
 * Scheduling business rules
 */
export interface SchedulingRules {
  readonly minShiftDuration: DurationMinutes;
  readonly maxShiftDuration: DurationMinutes;
  readonly minRestBetweenShifts: DurationMinutes;
  readonly maxConsecutiveDays: number;
  readonly maxHoursPerWeek: DurationMinutes;
  readonly overtimeThreshold: DurationMinutes;
  readonly requiredBreakDuration: DurationMinutes;
  readonly advanceSchedulingDays: number;
  readonly changeDeadlineHours: number;
}

/**
 * Position requirements
 */
export interface PositionRequirements {
  readonly positionId: string;
  readonly name: string;
  readonly minStaffLevel: number;
  readonly maxStaffLevel: number;
  readonly requiredSkills: string[];
  readonly requiredCertifications: string[];
  readonly hourlyRateRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly workingHours: AvailabilityWindow[];
}

// ===============================
// REAL-TIME TRACKING TYPES
// ===============================

/**
 * Real-time shift tracking
 */
export interface ShiftTracking {
  readonly shiftId: string;
  readonly employeeId: string;
  readonly status: 'not_started' | 'checked_in' | 'on_break' | 'checked_out' | 'overtime';
  readonly checkedInAt?: Timestamp;
  readonly checkedOutAt?: Timestamp;
  readonly breaks: {
    readonly startTime: Timestamp;
    readonly endTime?: Timestamp;
    readonly duration?: DurationMinutes;
  }[];
  readonly location?: {
    readonly latitude: number;
    readonly longitude: number;
    readonly accuracy: number;
  };
  readonly notes?: string[];
}

/**
 * Live schedule dashboard data
 */
export interface ScheduleDashboard {
  readonly date: ISODateString;
  readonly totalShifts: number;
  readonly activeShifts: number;
  readonly staffPresent: number;
  readonly staffScheduled: number;
  readonly totalLaborCost: number;
  readonly coverageStatus: {
    readonly position: string;
    readonly required: number;
    readonly actual: number;
    readonly status: 'understaffed' | 'optimal' | 'overstaffed';
  }[];
  readonly alerts: {
    readonly type: 'no_show' | 'late' | 'early_departure' | 'overtime' | 'understaffed';
    readonly message: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly timestamp: Timestamp;
    readonly employeeId?: string;
    readonly shiftId?: string;
  }[];
}

// ===============================
// EXPORT UNIFIED TYPES
// ===============================

export {
  // Re-export unified calendar types for convenience
  ISODateString,
  ISOTimeString,
  DurationMinutes,
  TimezoneString,
  TimeSlot,
  Booking,
  BookingType,
  BookingStatus,
  Resource,
  ResourceType,
  ResourceStatus,
  Timestamp,
  DateRange,
  AvailabilityWindow
};