/**
 * Staff TanStack Query Hooks
 * 
 * Migration from Zustand store to TanStack Query
 * Following Cash Module pattern
 * 
 * @see src/modules/cash/hooks/useCashTransactions.ts - Reference implementation
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
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

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters?: StaffFilters) => [...staffKeys.lists(), filters] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  schedules: () => [...staffKeys.all, 'schedules'] as const,
  schedule: (startDate?: string, endDate?: string) => [...staffKeys.schedules(), { startDate, endDate }] as const,
  timeEntries: () => [...staffKeys.all, 'timeEntries'] as const,
  timeEntry: (startDate?: string, endDate?: string) => [...staffKeys.timeEntries(), { startDate, endDate }] as const,
};

export interface StaffFilters {
  search?: string;
  department?: 'all' | 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management';
  status?: 'all' | 'active' | 'inactive' | 'on_leave' | 'terminated';
  position?: string;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all staff members
 */
export function useStaff(filters?: StaffFilters) {
  return useQuery({
    queryKey: staffKeys.list(filters),
    queryFn: async () => {
      logger.info('useStaff', 'Fetching staff', { filters });
      const teamMembers = await getEmployees();
      
      // Transform TeamMember[] to TeamMember[]
      const staffMembers: TeamMember[] = teamMembers.map((emp: TeamMember) => ({
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

      logger.info('useStaff', 'Staff fetched successfully', { count: staffMembers.length });
      return staffMembers;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Fetch single staff member by ID
 */
export function useStaffById(id: string) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: async () => {
      const teamMember = await getEmployeeById(id);
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
    queryKey: staffKeys.schedule(startDate, endDate),
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
    queryKey: staffKeys.timeEntry(startDate, endDate),
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
 * Create new staff member
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at' | 'performance_score' | 'attendance_rate' | 'completed_tasks' | 'training_completed' | 'certifications'>) => {
      logger.info('useCreateStaff', 'Creating staff member', { name: data.name });
      
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

      const newEmployee = await createEmployee(employeeData);
      return newEmployee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      notify.success(`Staff member ${data.full_name} created successfully`);
      logger.info('useCreateStaff', 'Staff created', { id: data.id });
    },
    onError: (error: Error) => {
      notify.error('Failed to create staff member');
      logger.error('useCreateStaff', 'Creation failed', error);
    },
  });
}

/**
 * Update staff member
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TeamMember> }) => {
      logger.info('useUpdateStaff', 'Updating staff member', { id });
      
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

      const updated = await updateEmployee(id, employeeData);
      return updated;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: staffKeys.detail(id) });
      const previousStaff = queryClient.getQueryData<TeamMember>(staffKeys.detail(id));

      if (previousStaff) {
        queryClient.setQueryData<TeamMember>(staffKeys.detail(id), {
          ...previousStaff,
          ...data,
        });
      }

      return { previousStaff };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousStaff) {
        queryClient.setQueryData(staffKeys.detail(id), context.previousStaff);
      }
      notify.error('Failed to update staff member');
      logger.error('useUpdateStaff', 'Update failed', error);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
    onSuccess: (data) => {
      notify.success('Staff member updated successfully');
      logger.info('useUpdateStaff', 'Staff updated', { id: data.id });
    },
  });
}

/**
 * Delete staff member
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info('useDeleteStaff', 'Deleting staff member', { id });
      await deleteEmployee(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
      notify.success('Staff member deleted successfully');
      logger.info('useDeleteStaff', 'Staff deleted', { id });
    },
    onError: (error: Error) => {
      notify.error('Failed to delete staff member');
      logger.error('useDeleteStaff', 'Deletion failed', error);
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
      logger.info('useCreateSchedule', 'Creating schedule', { staffId: data.staff_id });
      const newSchedule = await createSchedule(data);
      return newSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.schedules() });
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
      queryClient.invalidateQueries({ queryKey: staffKeys.schedules() });
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
      queryClient.invalidateQueries({ queryKey: staffKeys.schedules() });
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
    mutationFn: async ({ staffId, location, notes }: { staffId: string; location?: { latitude: number; longitude: number }; notes?: string }) => {
      logger.info('useClockIn', 'Clocking in', { staffId });
      const entry = await clockIn(staffId, location, notes);
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.timeEntries() });
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
    mutationFn: async ({ staffId, location, notes }: { staffId: string; location?: { latitude: number; longitude: number }; notes?: string }) => {
      logger.info('useClockOut', 'Clocking out', { staffId });
      const entry = await clockOut(staffId, location, notes);
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.timeEntries() });
      notify.success('Clocked out successfully');
    },
    onError: (error: Error) => {
      notify.error('Failed to clock out');
      logger.error('useClockOut', 'Clock out failed', error);
    },
  });
}

/**
 * Staff statistics for dashboard widget
 */
export function useStaffStats() {
  return useQuery({
    queryKey: [...staffKeys.all, 'stats'] as const,
    queryFn: async () => {
      logger.info('useStaffStats', 'Fetching staff statistics');
      
      try {
        // Fetch staff and time entries in parallel with fallbacks
        const [teamMembers, timeEntries] = await Promise.all([
          getEmployees().catch((err) => {
            logger.error('useStaffStats', 'Failed to fetch staff', err);
            return []; // Fallback to empty array
          }),
          getTimeEntries().catch((err) => {
            logger.error('useStaffStats', 'Failed to fetch time entries', err);
            return []; // Fallback to empty array
          })
        ]);

        // Calculate stats with safe defaults
        const totalStaff = Array.isArray(teamMembers) ? teamMembers.length : 0;
        
        const activeStaff = Array.isArray(teamMembers) 
          ? teamMembers.filter((emp: TeamMember) => emp.employment_status === 'active').length 
          : 0;
        
        // Count staff currently on shift (have clock_in but no clock_out)
        const onShift = Array.isArray(timeEntries)
          ? timeEntries.filter((entry: any) => entry.clock_in && !entry.clock_out).length
          : 0;

        // Calculate average performance (placeholder - would need actual performance data)
        const avgPerformance = activeStaff > 0 ? 75 : 0; // TODO: Calculate from actual performance data

        const result = {
          totalStaff,
          activeStaff,
          onShift,
          averagePerformance: avgPerformance,
        };

        logger.info('useStaffStats', 'Stats calculated successfully', result);

        return result;
      } catch (error) {
        logger.error('useStaffStats', 'Unexpected error calculating stats', error);
        
        // Return safe default values
        return {
          totalStaff: 0,
          activeStaff: 0,
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

