// Team Adapters - Type conversion between database and store formats
// Extracted from services/team/teamApi.ts

import type { TeamMember, ShiftScheduleDB, TimeEntryDB } from './teamApi';
import type { TeamMember, ShiftSchedule, TimeEntry } from '../store/teamStore';

// =====================================================
// TYPE ADAPTERS
// =====================================================

/**
 * Convert TeamMember (database) to TeamMember (store) format for compatibility
 */
export function teamMemberToTeamMember(teamMember: TeamMember): TeamMember {
  return {
    id: teamMember.id,
    name: `${teamMember.first_name} ${teamMember.last_name}`,
    email: teamMember.email,
    phone: teamMember.phone,
    position: teamMember.position,
    department: teamMember.department,
    hire_date: teamMember.hire_date,
    salary: teamMember.salary || 0,
    status: teamMember.employment_status,
    avatar: teamMember.avatar_url,
    notes: teamMember.notes,
    created_at: teamMember.created_at,
    updated_at: teamMember.updated_at,
    performance_score: teamMember.performance_score || 0,
    attendance_rate: teamMember.attendance_rate || 100,
    completed_tasks: teamMember.completed_tasks || 0,
    training_completed: [], // Will be loaded separately via getTeamMemberTraining()
    certifications: teamMember.certifications || [],
    weekly_hours: teamMember.weekly_hours || 40,
    shift_preference: teamMember.shift_preference || 'flexible',
    available_days: teamMember.available_days || []
  };
}

/**
 * Convert database schedule to store format
 */
export function scheduleToStoreFormat(schedule: ShiftScheduleDB, teamMemberName?: string): ShiftSchedule {
  return {
    id: schedule.id,
    team_id: schedule.teamMember_id,
    team_name: teamMemberName || 'Unknown',
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
export function timeEntryToStoreFormat(timeEntry: TimeEntryDB, teamMemberName?: string): TimeEntry {
  return {
    id: timeEntry.id,
    team_id: timeEntry.teamMember_id,
    team_name: teamMemberName || 'Unknown',
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
 * Batch convert teamMembers to team members
 */
export function teamMembersToTeamMembers(teamMembers: TeamMember[]): TeamMember[] {
  return teamMembers.map(teamMemberToTeamMember);
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
