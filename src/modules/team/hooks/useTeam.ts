/**
 * Team TanStack Query Hooks
 * 
 * Migration from Zustand store to TanStack Query
 * Following Cash Module pattern
 * 
 * @see src/modules/cash/hooks/useCashTransactions.ts - Reference implementation
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getShiftSchedules as getSchedules,
  getTimeEntries,
  type TeamMember
} from '@/modules/team/services';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';
import type { TeamMember, ShiftSchedule, TimeEntry } from '@/modules/team/store';

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const teamKeys = {
  all: ['team'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters?: TeamFilters) => [...teamKeys.lists(), filters] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
  schedules: () => [...teamKeys.all, 'schedules'] as const,
  schedule: (startDate?: string, endDate?: string) => [...teamKeys.schedules(), { startDate, endDate }] as const,
  timeEntries: () => [...teamKeys.all, 'timeEntries'] as const,
  timeEntry: (startDate?: string, endDate?: string) => [...teamKeys.timeEntries(), { startDate, endDate }] as const,
};

export interface TeamFilters {
  search?: string;
  department?: 'all' | 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management';
  status?: 'all' | 'active' | 'inactive' | 'on_leave' | 'terminated';
  position?: string;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all team members
 */
export function useTeam(filters?: TeamFilters) {
  return useQuery({
    queryKey: teamKeys.list(filters),
    queryFn: async () => {
      logger.info('useTeam', 'Fetching team', { filters });
      const rawData = await getTeamMembers();

      // Transform raw data to TeamMember[]
      const teamMembers: TeamMember[] = rawData.map((emp: TeamMember) => ({
        id: emp.id,
        name: emp.full_name,
        email: emp.email,
        phone: emp.phone || undefined,
        position: emp.position,
        department: emp.department as TeamMember['department'],
        hire_date: emp.hire_date,
        salary: emp.salary || 0,
        status: (emp.status as TeamMember['status']) || 'active',
        avatar: emp.avatar_url || undefined,
        notes: emp.notes || undefined,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        performance_score: 0, // TODO: Calculate from data
        attendance_rate: 0, // TODO: Calculate from time entries
        completed_tasks: 0,
        training_completed: [],
        certifications: [],
        weekly_hours: emp.weekly_hours || 40,
        shift_preference: (emp.shift_preference as TeamMember['shift_preference']) || 'flexible',
        available_days: emp.available_days || [],
      }));

      logger.info('useTeam', 'Team fetched successfully', { count: teamMembers.length });
      return teamMembers;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Fetch single team member by ID
 */
export function useTeamById(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: async () => {
      const teamMember = await getTeamMemberById(id);
      // Transform to TeamMember
      return {
        id: teamMember.id,
        name: teamMember.full_name,
        email: teamMember.email,
        phone: teamMember.phone || undefined,
        position: teamMember.position,
        department: teamMember.department as TeamMember['department'],
        hire_date: teamMember.hire_date,
        salary: teamMember.salary || 0,
        status: (teamMember.status as TeamMember['status']) || 'active',
        avatar: teamMember.avatar_url || undefined,
        notes: teamMember.notes || undefined,
        created_at: teamMember.created_at,
        updated_at: teamMember.updated_at,
        performance_score: 0,
        attendance_rate: 0,
        completed_tasks: 0,
        training_completed: [],
        certifications: [],
        weekly_hours: teamMember.weekly_hours || 40,
        shift_preference: (teamMember.shift_preference as TeamMember['shift_preference']) || 'flexible',
        available_days: teamMember.available_days || [],
      } as TeamMember;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch schedules
 */
export function useSchedules(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: teamKeys.schedule(startDate, endDate),
    queryFn: async () => {
      const schedules = await getSchedules(startDate, endDate);
      return schedules;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for schedules)
  });
}

/**
 * Fetch time entries
 */
export function useTimeEntries(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: teamKeys.timeEntry(startDate, endDate),
    queryFn: async () => {
      const entries = await getTimeEntries(startDate, endDate);
      return entries;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (very frequent for time tracking)
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new team member
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at' | 'performance_score' | 'attendance_rate' | 'completed_tasks' | 'training_completed' | 'certifications'>) => {
      logger.info('useCreateTeam', 'Creating team member', { name: data.name });
      
      // Transform to TeamMember format for API
      const employeeData = {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        department: data.department,
        hire_date: data.hire_date,
        salary: data.salary,
        status: data.status,
        notes: data.notes,
        weekly_hours: data.weekly_hours,
        shift_preference: data.shift_preference,
        available_days: data.available_days,
      };

      const newTeamMember = await createTeamMember(employeeData);
      return newTeamMember;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      notify.success(`Team member ${data.full_name} created successfully`);
      logger.info('useCreateTeam', 'Team created', { id: data.id });
    },
    onError: (error: Error) => {
      notify.error('Failed to create team member');
      logger.error('useCreateTeam', 'Creation failed', error);
    },
  });
}

/**
 * Update team member
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TeamMember> }) => {
      logger.info('useUpdateTeam', 'Updating team member', { id });
      
      // Transform to TeamMember format
      const employeeData: any = {};
      if (data.name) employeeData.full_name = data.name;
      if (data.email) employeeData.email = data.email;
      if (data.phone) employeeData.phone = data.phone;
      if (data.position) employeeData.position = data.position;
      if (data.department) employeeData.department = data.department;
      if (data.hire_date) employeeData.hire_date = data.hire_date;
      if (data.salary !== undefined) employeeData.salary = data.salary;
      if (data.status) employeeData.status = data.status;
      if (data.notes) employeeData.notes = data.notes;
      if (data.weekly_hours) employeeData.weekly_hours = data.weekly_hours;
      if (data.shift_preference) employeeData.shift_preference = data.shift_preference;
      if (data.available_days) employeeData.available_days = data.available_days;

      const updated = await updateTeamMember(id, employeeData);
      return updated;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: teamKeys.detail(id) });
      const previousTeam = queryClient.getQueryData<TeamMember>(teamKeys.detail(id));

      if (previousTeam) {
        queryClient.setQueryData<TeamMember>(teamKeys.detail(id), {
          ...previousTeam,
          ...data,
        });
      }

      return { previousTeam };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousTeam) {
        queryClient.setQueryData(teamKeys.detail(id), context.previousTeam);
      }
      notify.error('Failed to update team member');
      logger.error('useUpdateTeam', 'Update failed', error);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
    onSuccess: (data) => {
      notify.success('Team member updated successfully');
      logger.info('useUpdateTeam', 'Team updated', { id: data.id });
    },
  });
}

/**
 * Delete team member
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info('useDeleteTeam', 'Deleting team member', { id });
      await deleteTeamMember(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.removeQueries({ queryKey: teamKeys.detail(id) });
      notify.success('Team member deleted successfully');
      logger.info('useDeleteTeam', 'Team deleted', { id });
    },
    onError: (error: Error) => {
      notify.error('Failed to delete team member');
      logger.error('useDeleteTeam', 'Deletion failed', error);
    },
  });
}

/**
 * Create schedule
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ShiftSchedule, 'id'>) => {
      logger.info('useCreateSchedule', 'Creating schedule', { teamId: data.team_id });
      const newSchedule = await createSchedule(data);
      return newSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.schedules() });
      notify.success('Schedule created successfully');
    },
    onError: (error: Error) => {
      notify.error('Failed to create schedule');
      logger.error('useCreateSchedule', 'Creation failed', error);
    },
  });
}

/**
 * Update schedule
 */
export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShiftSchedule> }) => {
      logger.info('useUpdateSchedule', 'Updating schedule', { id });
      const updated = await updateSchedule(id, data);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.schedules() });
      notify.success('Schedule updated successfully');
    },
    onError: (error: Error) => {
      notify.error('Failed to update schedule');
      logger.error('useUpdateSchedule', 'Update failed', error);
    },
  });
}

/**
 * Delete schedule
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info('useDeleteSchedule', 'Deleting schedule', { id });
      await deleteSchedule(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.schedules() });
      notify.success('Schedule deleted successfully');
    },
    onError: (error: Error) => {
      notify.error('Failed to delete schedule');
      logger.error('useDeleteSchedule', 'Deletion failed', error);
    },
  });
}

/**
 * Clock in
 */
export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, location, notes }: { teamId: string; location?: { latitude: number; longitude: number }; notes?: string }) => {
      logger.info('useClockIn', 'Clocking in', { teamId });
      const entry = await clockIn(teamId, location, notes);
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.timeEntries() });
      notify.success('Clocked in successfully');
    },
    onError: (error: Error) => {
      notify.error('Failed to clock in');
      logger.error('useClockIn', 'Clock in failed', error);
    },
  });
}

/**
 * Clock out
 */
export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, location, notes }: { teamId: string; location?: { latitude: number; longitude: number }; notes?: string }) => {
      logger.info('useClockOut', 'Clocking out', { teamId });
      const entry = await clockOut(teamId, location, notes);
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.timeEntries() });
      notify.success('Clocked out successfully');
    },
    onError: (error: Error) => {
      notify.error('Failed to clock out');
      logger.error('useClockOut', 'Clock out failed', error);
    },
  });
}

/**
 * Team statistics for dashboard widget
 */
export function useTeamStats() {
  return useQuery({
    queryKey: [...teamKeys.all, 'stats'] as const,
    queryFn: async () => {
      logger.info('useTeamStats', 'Fetching team statistics');
      
      try {
        // Fetch team and time entries in parallel with fallbacks
        const [teamMembers, timeEntries] = await Promise.all([
          getTeamMembers().catch((err) => {
            logger.error('useTeamStats', 'Failed to fetch team', err);
            return []; // Fallback to empty array
          }),
          getTimeEntries().catch((err) => {
            logger.error('useTeamStats', 'Failed to fetch time entries', err);
            return []; // Fallback to empty array
          })
        ]);

        // Calculate stats with safe defaults
        const totalTeam = Array.isArray(teamMembers) ? teamMembers.length : 0;
        
        const activeTeam = Array.isArray(teamMembers) 
          ? teamMembers.filter((emp: TeamMember) => emp.employment_status === 'active').length 
          : 0;
        
        // Count team currently on shift (have clock_in but no clock_out)
        const onShift = Array.isArray(timeEntries)
          ? timeEntries.filter((entry: any) => entry.clock_in && !entry.clock_out).length
          : 0;

        // Calculate average performance (placeholder - would need actual performance data)
        const avgPerformance = activeTeam > 0 ? 75 : 0; // TODO: Calculate from actual performance data

        const result = {
          totalTeam,
          activeTeam,
          onShift,
          averagePerformance: avgPerformance,
        };

        logger.info('useTeamStats', 'Stats calculated successfully', result);

        return result;
      } catch (error) {
        logger.error('useTeamStats', 'Unexpected error calculating stats', error);
        
        // Return safe default values
        return {
          totalTeam: 0,
          activeTeam: 0,
          onShift: 0,
          averagePerformance: 0,
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
    // Retry on error but with exponential backoff
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

