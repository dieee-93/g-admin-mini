// Staff Adapters - Type conversion between database and store formats
// Extracted from services/staff/staffApi.ts

import type { Employee, ShiftScheduleDB, TimeEntryDB } from './staffApi';
import type { TeamMember, ShiftSchedule, TimeEntry } from '../store/staffStore';

// =====================================================
// TYPE ADAPTERS
// =====================================================

/**
 * Convert Employee (database) to TeamMember (store) format for compatibility
 */
export function employeeToTeamMember(employee: Employee): TeamMember {
  return {
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    email: employee.email,
    phone: employee.phone,
    position: employee.position,
    department: employee.department,
    hire_date: employee.hire_date,
    salary: employee.salary || 0,
    status: employee.employment_status,
    avatar: employee.avatar_url,
    notes: employee.notes,
    created_at: employee.created_at,
    updated_at: employee.updated_at,
    performance_score: employee.performance_score || 0,
    attendance_rate: employee.attendance_rate || 100,
    completed_tasks: employee.completed_tasks || 0,
    training_completed: [], // Will be loaded separately via getEmployeeTraining()
    certifications: employee.certifications || [],
    weekly_hours: employee.weekly_hours || 40,
    shift_preference: employee.shift_preference || 'flexible',
    available_days: employee.available_days || []
  };
}

/**
 * Convert database schedule to store format
 */
export function scheduleToStoreFormat(schedule: ShiftScheduleDB, employeeName?: string): ShiftSchedule {
  return {
    id: schedule.id,
    staff_id: schedule.employee_id,
    staff_name: employeeName || 'Unknown',
    date: schedule.date,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    position: schedule.position,
    status: schedule.status,
    break_duration: schedule.break_duration,
    notes: schedule.notes
  };
}

/**
 * Convert database time entry to store format
 */
export function timeEntryToStoreFormat(timeEntry: TimeEntryDB, employeeName?: string): TimeEntry {
  return {
    id: timeEntry.id,
    staff_id: timeEntry.employee_id,
    staff_name: employeeName || 'Unknown',
    date: timeEntry.timestamp.split('T')[0],
    clock_in: timeEntry.entry_type === 'clock_in' ? timeEntry.timestamp : '',
    clock_out: timeEntry.entry_type === 'clock_out' ? timeEntry.timestamp : undefined,
    break_start: timeEntry.entry_type === 'break_start' ? timeEntry.timestamp : undefined,
    break_end: timeEntry.entry_type === 'break_end' ? timeEntry.timestamp : undefined,
    total_hours: 0, // Will be calculated by aggregating entries
    overtime_hours: 0, // Will be calculated
    status: timeEntry.sync_status === 'synced' ? 'completed' : 'active'
  };
}

/**
 * Batch convert employees to staff members
 */
export function employeesToStaffMembers(employees: Employee[]): TeamMember[] {
  return employees.map(employeeToTeamMember);
}

/**
 * Batch convert schedules to store format
 */
export function schedulesToStoreFormat(schedules: ShiftScheduleDB[]): ShiftSchedule[] {
  return schedules.map(schedule => scheduleToStoreFormat(schedule));
}

/**
 * Batch convert time entries to store format
 */
export function timeEntriesToStoreFormat(entries: TimeEntryDB[]): TimeEntry[] {
  return entries.map(entry => timeEntryToStoreFormat(entry));
}
