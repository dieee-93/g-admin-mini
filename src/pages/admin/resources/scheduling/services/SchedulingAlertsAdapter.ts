/**
 * Scheduling Alerts Adapter (Global System Integration)
 *
 * Adapter layer between Scheduling business logic and the global Alerts system.
 * Converts Scheduling-specific events and errors into CreateAlertInput format.
 *
 * NOTE: This adapter works alongside SchedulingAlertsAdapter.ts (intelligence layer)
 * - SchedulingAlertsAdapter: Business intelligence and complex scheduling analysis
 * - schedulingAlertsAdapter: Simple error/event notifications for global alerts system
 *
 * @module scheduling/services/schedulingAlertsAdapter
 */

import type { CreateAlertInput } from '@/shared/alerts/types';

/**
 * Alert factory for shift scheduling failures
 *
 * @param error - The error that occurred
 * @param shiftData - Shift data that failed to schedule
 */
export const shiftSchedulingFailed = (
  error: Error,
  shiftData?: { employeeId?: string; startTime?: Date; endTime?: Date }
): CreateAlertInput => ({
  type: 'operational',
  context: 'scheduling',
  severity: 'high',
  title: 'Shift Scheduling Failed',
  description: `Failed to schedule shift${shiftData?.employeeId ? ` for employee ${shiftData.employeeId}` : ''}: ${error.message}`,
  metadata: {
    errorCode: error.name,
    employeeId: shiftData?.employeeId,
    shiftTime: shiftData?.startTime?.toISOString(),
  },
  autoExpire: 30, // Auto-expire after 30 minutes
  persistent: true,
  actions: [
    {
      label: 'Retry',
      variant: 'primary',
      action: 'retry-shift-scheduling',
    },
    {
      label: 'Edit Shift',
      variant: 'secondary',
      action: 'edit-shift-data',
    },
  ],
});

/**
 * Alert factory for coverage gap warnings
 *
 * @param date - Date with coverage gap
 * @param gapPercentage - Percentage of coverage gap
 * @param requiredStaff - Number of staff required
 * @param currentStaff - Number of staff currently scheduled
 */
export const coverageGapWarning = (
  date: Date,
  gapPercentage: number,
  requiredStaff: number,
  currentStaff: number
): CreateAlertInput => ({
  type: 'operational',
  context: 'scheduling',
  severity: gapPercentage > 30 ? 'critical' : 'medium',
  title: 'Coverage Gap Detected',
  description: `${gapPercentage}% coverage gap on ${date.toLocaleDateString()}. Required: ${requiredStaff}, Current: ${currentStaff}`,
  metadata: {
    date: date.toISOString(),
    gapPercentage,
    requiredStaff,
    currentStaff,
    estimatedImpact: `${requiredStaff - currentStaff} employees needed`,
  },
  persistent: true,
  actions: [
    {
      label: 'Find Coverage',
      variant: 'primary',
      action: 'find-coverage',
    },
    {
      label: 'Adjust Schedule',
      variant: 'secondary',
      action: 'adjust-schedule',
    },
    {
      label: 'Emergency Call',
      variant: 'outline',
      action: 'emergency-call',
    },
  ],
});

/**
 * Alert factory for overtime threshold exceeded
 *
 * @param employeeId - Employee ID who exceeded overtime
 * @param employeeName - Employee name
 * @param overtimeHours - Overtime hours accumulated
 * @param threshold - Overtime threshold configured
 */
export const overtimeExceeded = (
  employeeId: string,
  employeeName: string,
  overtimeHours: number,
  threshold: number
): CreateAlertInput => ({
  type: 'business',
  context: 'scheduling',
  severity: overtimeHours > threshold * 1.5 ? 'high' : 'medium',
  title: 'Overtime Threshold Exceeded',
  description: `${employeeName} has ${overtimeHours} overtime hours (threshold: ${threshold}h)`,
  metadata: {
    itemId: employeeId,
    itemName: employeeName,
    overtimeHours,
    threshold,
    excessHours: overtimeHours - threshold,
    relatedUrl: `/admin/scheduling?employee=${employeeId}`,
  },
  persistent: true,
  actions: [
    {
      label: 'Review Overtime',
      variant: 'primary',
      action: 'review-overtime',
    },
    {
      label: 'Adjust Schedule',
      variant: 'secondary',
      action: 'adjust-employee-schedule',
    },
    {
      label: 'Approve Overtime',
      variant: 'outline',
      action: 'approve-overtime',
    },
  ],
});

/**
 * Alert factory for labor cost budget exceeded
 *
 * @param weekNumber - Week number
 * @param actualCost - Actual labor cost
 * @param budgetedCost - Budgeted labor cost
 */
export const laborCostExceeded = (
  weekNumber: number,
  actualCost: number,
  budgetedCost: number
): CreateAlertInput => ({
  type: 'business',
  context: 'scheduling',
  severity: 'high',
  title: 'Labor Cost Budget Exceeded',
  description: `Week ${weekNumber} labor costs ($${actualCost.toFixed(2)}) exceed budget ($${budgetedCost.toFixed(2)})`,
  metadata: {
    weekNumber,
    actualCost,
    budgetedCost,
    overrun: actualCost - budgetedCost,
    overrunPercentage: ((actualCost - budgetedCost) / budgetedCost * 100).toFixed(1),
    affectedRevenue: actualCost - budgetedCost,
  },
  persistent: true,
  actions: [
    {
      label: 'Review Costs',
      variant: 'primary',
      action: 'review-labor-costs',
    },
    {
      label: 'Optimize Schedule',
      variant: 'secondary',
      action: 'optimize-schedule',
    },
  ],
});

/**
 * Alert factory for shift data loading failures
 *
 * @param error - The error that occurred
 * @param dateRange - Date range that failed to load
 */
export const scheduleDataLoadFailed = (
  error: Error,
  dateRange?: { start: Date; end: Date }
): CreateAlertInput => ({
  type: 'operational',
  context: 'scheduling',
  severity: 'medium',
  title: 'Schedule Data Load Failed',
  description: `Failed to load schedule data${dateRange ? ` for ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` : ''}: ${error.message}`,
  metadata: {
    errorCode: error.name,
    dateRange: dateRange ? {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    } : undefined,
  },
  autoExpire: 20,
  persistent: false,
  actions: [
    {
      label: 'Retry',
      variant: 'primary',
      action: 'retry-schedule-load',
    },
  ],
});

/**
 * Alert factory for employee availability conflicts
 *
 * @param employeeId - Employee ID with conflict
 * @param employeeName - Employee name
 * @param conflictDate - Date of conflict
 * @param conflictType - Type of conflict (shift_overlap, time_off, etc.)
 */
export const availabilityConflict = (
  employeeId: string,
  employeeName: string,
  conflictDate: Date,
  conflictType: 'shift_overlap' | 'time_off' | 'max_hours' | 'availability'
): CreateAlertInput => ({
  type: 'validation',
  context: 'scheduling',
  severity: 'medium',
  title: 'Employee Availability Conflict',
  description: `${employeeName} has a ${conflictType.replace('_', ' ')} conflict on ${conflictDate.toLocaleDateString()}`,
  metadata: {
    itemId: employeeId,
    itemName: employeeName,
    conflictDate: conflictDate.toISOString(),
    conflictType,
    validationRule: `employee_availability_${conflictType}`,
    relatedUrl: `/admin/scheduling?employee=${employeeId}&date=${conflictDate.toISOString()}`,
  },
  autoExpire: 15,
  actions: [
    {
      label: 'Resolve Conflict',
      variant: 'primary',
      action: 'resolve-availability-conflict',
    },
    {
      label: 'View Employee',
      variant: 'secondary',
      action: 'view-employee-schedule',
    },
  ],
});

/**
 * Alert factory for scheduling analytics errors
 *
 * @param error - The error that occurred
 */
export const analyticsCalculationFailed = (error: Error): CreateAlertInput => ({
  type: 'operational',
  context: 'scheduling',
  severity: 'low',
  title: 'Scheduling Analytics Unavailable',
  description: `Failed to calculate scheduling analytics: ${error.message}`,
  metadata: {
    errorCode: error.name,
  },
  autoExpire: 20,
  persistent: false,
  actions: [
    {
      label: 'Retry',
      variant: 'primary',
      action: 'retry-analytics',
    },
  ],
});

/**
 * Alert factory for understaffing critical situations
 *
 * @param date - Date with understaffing
 * @param shift - Shift with understaffing
 * @param requiredStaff - Required staff count
 * @param currentStaff - Current staff count
 */
export const criticalUnderstaffing = (
  date: Date,
  shift: string,
  requiredStaff: number,
  currentStaff: number
): CreateAlertInput => ({
  type: 'operational',
  context: 'scheduling',
  severity: 'critical',
  title: 'Critical Understaffing Alert',
  description: `${shift} shift on ${date.toLocaleDateString()} is critically understaffed: ${currentStaff}/${requiredStaff} staff`,
  metadata: {
    date: date.toISOString(),
    shift,
    requiredStaff,
    currentStaff,
    shortfall: requiredStaff - currentStaff,
    estimatedImpact: `High risk of service disruption`,
  },
  persistent: true,
  actions: [
    {
      label: 'Emergency Staffing',
      variant: 'primary',
      action: 'emergency-staffing',
    },
    {
      label: 'Redistribute Tasks',
      variant: 'secondary',
      action: 'redistribute-tasks',
    },
  ],
});

/**
 * Adapter exports
 */
export const schedulingAlertsAdapter = {
  shiftSchedulingFailed,
  coverageGapWarning,
  overtimeExceeded,
  laborCostExceeded,
  scheduleDataLoadFailed,
  availabilityConflict,
  analyticsCalculationFailed,
  criticalUnderstaffing,
};

export default schedulingAlertsAdapter;
