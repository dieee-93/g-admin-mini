/**
 * UNIFIED SCHEDULING HOOK - G-ADMIN MINI v3.0
 *
 * BREAKING CHANGE: Complete rewrite using UnifiedCalendarEngine
 * NO legacy support - uses new unified types and calendar system
 *
 * @version 3.0.0
 * @breaking-change Replaces all legacy scheduling hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ISODateString,
  ISOTimeString,
  DurationMinutes,
  TimezoneString,
  TimeSlot,
  DateRange,
  createISODate,
  createISOTime,
  calculateDuration,
  formatTimeSlotForUser,
  getUserTimezone
} from '@/shared/calendar/utils/dateTimeUtils';
import { UnifiedCalendarEngine } from '@/shared/calendar/engine/UnifiedCalendarEngine';
import type {
  StaffShift,
  ShiftStatus,
  WorkSchedule,
  TimeOffRequest,
  ShiftTemplate,
  ShiftFormData,
  EmployeeResource,
  LaborCost,
  CoverageMetrics,
  ScheduleDashboard
} from '../types/schedulingTypes';
import { shiftsApi, timeOffApi, schedulesApi } from '../services/schedulingApi';

/**
 * Unified scheduling state using new types
 */
interface UnifiedSchedulingState {
  
  shifts: StaffShift[];
  schedules: WorkSchedule[];
  timeOffRequests: TimeOffRequest[];
  shiftTemplates: ShiftTemplate[];
  employeeResources: EmployeeResource[];
  dashboard: ScheduleDashboard | null;
  laborCosts: LaborCost[];
  coverageMetrics: CoverageMetrics[];
  loading: boolean;
  error: string | null;
  selectedDateRange: DateRange;
  timezone: TimezoneString;
  filters: {
    position?: string;
    employeeId?: string;
    status?: ShiftStatus;
  };
}

/**
 * Unified scheduling actions using calendar engine
 */
interface UnifiedSchedulingActions {
  // Shift management (unified)
  createShift: (shiftData: ShiftFormData) => Promise<StaffShift>;
  updateShift: (shiftId: string, updates: Partial<StaffShift>) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  bulkCreateShifts: (shiftsData: ShiftFormData[]) => Promise<StaffShift[]>;
  checkShiftConflicts: (employeeId: string, timeSlot: TimeSlot) => Promise<StaffShift[]>;

  // Schedule management (unified)
  createSchedule: (schedule: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkSchedule>;
  publishSchedule: (scheduleId: string) => Promise<void>;
  copySchedule: (sourceRange: DateRange, targetRange: DateRange) => Promise<void>;
  optimizeSchedule: (dateRange: DateRange, constraints?: any) => Promise<void>;

  // Time-off management (unified)
  createTimeOffRequest: (request: Omit<TimeOffRequest, 'id' | 'requestedAt'>) => Promise<void>;
  approveTimeOffRequest: (requestId: string, reviewedBy: string) => Promise<void>;
  denyTimeOffRequest: (requestId: string, reviewedBy: string, reason?: string) => Promise<void>;

  // Real-time features
  getAvailableSlots: (date: ISODateString, employeeIds: string[], duration: DurationMinutes) => Promise<TimeSlot[]>;
  getDashboard: (date: ISODateString) => Promise<ScheduleDashboard>;
  calculateLaborCosts: (dateRange: DateRange) => Promise<LaborCost[]>;
  analyzeCoverage: (dateRange: DateRange) => Promise<CoverageMetrics[]>;

  // Filters and navigation (unified)
  setFilters: (filters: Partial<UnifiedSchedulingState['filters']>) => void;
  setDateRange: (dateRange: DateRange) => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  navigateDay: (direction: 'prev' | 'next') => void;

  // Data refresh
  refreshData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

/**
 * Unified scheduling hook using calendar engine
 */
export function useScheduling(): UnifiedSchedulingState & UnifiedSchedulingActions {
  const [state, setState] = useState<UnifiedSchedulingState>(() => {
    const today = createISODate();
    const endOfWeek = createISODate(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));

    return {
      shifts: [],
      schedules: [],
      timeOffRequests: [],
      shiftTemplates: [],
      employeeResources: [],
      dashboard: null,
      laborCosts: [],
      coverageMetrics: [],
      loading: true,
      error: null,
      selectedDateRange: {
        startDate: today,
        endDate: endOfWeek
      },
      timezone: getUserTimezone(),
      filters: {}
    };
  });

  // Initialize data on mount and when date range changes
  useEffect(() => {
    loadSchedulingData();
  }, [state.selectedDateRange]);

  const loadSchedulingData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load data using unified APIs
      const [shifts, timeOffRequests, schedules, dashboard] = await Promise.all([
        shiftsApi.getShifts(
          state.selectedDateRange.startDate,
          state.selectedDateRange.endDate,
          state.filters
        ),
        timeOffApi.getTimeOffRequests(state.filters),
        schedulesApi.getSchedules({
          start_date: state.selectedDateRange.startDate,
          end_date: state.selectedDateRange.endDate
        }),
        getDashboard(state.selectedDateRange.startDate)
      ]);

      setState(prev => ({
        ...prev,
        shifts,
        timeOffRequests,
        schedules,
        dashboard,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load scheduling data'
      }));
    }
  }, [state.selectedDateRange, state.filters]);

  const createShift = useCallback(async (shiftData: ShiftFormData): Promise<StaffShift> => {
    try {
      const newShift = await shiftsApi.createShift(shiftData);

      setState(prev => ({
        ...prev,
        shifts: [...prev.shifts, newShift]
      }));

      return newShift;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create shift');
    }
  }, []);

  const updateShift = useCallback(async (shiftId: string, updates: Partial<StaffShift>): Promise<void> => {
    try {
      await shiftsApi.updateShift(shiftId, updates);

      setState(prev => ({
        ...prev,
        shifts: prev.shifts.map(shift =>
          shift.id === shiftId
            ? { ...shift, ...updates }
            : shift
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update shift');
    }
  }, []);

  const deleteShift = useCallback(async (shiftId: string): Promise<void> => {
    try {
      await shiftsApi.deleteShift(shiftId);

      setState(prev => ({
        ...prev,
        shifts: prev.shifts.filter(shift => shift.id !== shiftId)
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete shift');
    }
  }, []);

  const bulkCreateShifts = useCallback(async (shiftsData: ShiftFormData[]): Promise<StaffShift[]> => {
    try {
      const newShifts = await shiftsApi.bulkCreateShifts(shiftsData);

      setState(prev => ({
        ...prev,
        shifts: [...prev.shifts, ...newShifts]
      }));

      return newShifts;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create shifts');
    }
  }, []);

  const publishSchedule = useCallback(async (scheduleId: string): Promise<void> => {
    try {
      await schedulesApi.updateScheduleStatus(scheduleId, 'published');

      setState(prev => ({
        ...prev,
        schedules: prev.schedules.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, status: 'published' }
            : schedule
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to publish schedule');
    }
  }, []);

  const copySchedule = useCallback(async (sourceRange: DateRange, targetRange: DateRange): Promise<void> => {
    try {
      // Find source schedule
      const sourceSchedules = await schedulesApi.getSchedules({
        start_date: sourceRange.startDate,
        end_date: sourceRange.endDate
      });

      if (sourceSchedules.length === 0) {
        throw new Error('No schedule found for source date range');
      }

      // Copy the first schedule found
      const sourceSchedule = sourceSchedules[0];
      await schedulesApi.copySchedule(sourceSchedule.id, targetRange.startDate, targetRange.endDate);

      // Refresh data to show the copied schedule
      await refreshData();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to copy schedule');
    }
  }, []);

  const optimizeSchedule = useCallback(async (dateRange: DateRange, constraints?: any): Promise<void> => {
    try {
      // TODO: Implement schedule optimization using calendar engine
      console.log('Optimizing schedule for range', dateRange, 'with constraints', constraints);
      // This would integrate with the UnifiedCalendarEngine's optimization features
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to optimize schedule');
    }
  }, []);

  const createTimeOffRequest = useCallback(async (request: Omit<TimeOffRequest, 'id' | 'requestedAt'>): Promise<void> => {
    try {
      const newRequest = await timeOffApi.createTimeOffRequest(request);

      setState(prev => ({
        ...prev,
        timeOffRequests: [...prev.timeOffRequests, newRequest]
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create time-off request');
    }
  }, []);

  const approveTimeOffRequest = useCallback(async (requestId: string, reviewedBy: string): Promise<void> => {
    try {
      await timeOffApi.updateTimeOffRequestStatus(requestId, 'approved', reviewedBy);

      setState(prev => ({
        ...prev,
        timeOffRequests: prev.timeOffRequests.map(request =>
          request.id === requestId
            ? {
                ...request,
                status: 'approved',
                reviewedBy,
                reviewedAt: { dateTime: new Date().toISOString(), timezone: state.timezone, utcOffset: 0 } as any
              }
            : request
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to approve request');
    }
  }, [state.timezone]);

  const denyTimeOffRequest = useCallback(async (requestId: string, reviewedBy: string, reason?: string): Promise<void> => {
    try {
      await timeOffApi.updateTimeOffRequestStatus(requestId, 'denied', reviewedBy, reason);

      setState(prev => ({
        ...prev,
        timeOffRequests: prev.timeOffRequests.map(request =>
          request.id === requestId
            ? {
                ...request,
                status: 'denied',
                reviewedBy,
                reviewedAt: { dateTime: new Date().toISOString(), timezone: state.timezone, utcOffset: 0 } as any,
                notes: reason
              }
            : request
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to deny request');
    }
  }, [state.timezone]);

  const setFilters = useCallback((filters: Partial<UnifiedSchedulingState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setState(prev => {
      const currentStart = new Date(prev.selectedDateRange.startDate);
      const currentEnd = new Date(prev.selectedDateRange.endDate);
      const daysToAdd = direction === 'next' ? 7 : -7;

      currentStart.setDate(currentStart.getDate() + daysToAdd);
      currentEnd.setDate(currentEnd.getDate() + daysToAdd);

      return {
        ...prev,
        selectedDateRange: {
          startDate: createISODate(currentStart),
          endDate: createISODate(currentEnd)
        }
      };
    });
  }, []);

  const setDateRange = useCallback((dateRange: DateRange) => {
    setState(prev => ({ ...prev, selectedDateRange: dateRange }));
  }, []);

  const refreshData = useCallback(async () => {
    await loadSchedulingData();
  }, [loadSchedulingData]);

  // New unified actions
  const checkShiftConflicts = useCallback(async (employeeId: string, timeSlot: TimeSlot): Promise<StaffShift[]> => {
    try {
      return await shiftsApi.getShiftConflicts(employeeId, timeSlot);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check shift conflicts');
    }
  }, []);

  const createSchedule = useCallback(async (schedule: Omit<WorkSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkSchedule> => {
    try {
      const newSchedule = await schedulesApi.createSchedule(schedule);
      setState(prev => ({
        ...prev,
        schedules: [...prev.schedules, newSchedule]
      }));
      return newSchedule;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create schedule');
    }
  }, []);

  const getAvailableSlots = useCallback(async (
    date: ISODateString,
    employeeIds: string[],
    duration: DurationMinutes
  ): Promise<TimeSlot[]> => {
    try {
      // TODO: Implement using UnifiedCalendarEngine
      return [];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get available slots');
    }
  }, []);

  const getDashboard = useCallback(async (date: ISODateString): Promise<ScheduleDashboard> => {
    try {
      // TODO: Implement dashboard data aggregation
      return {
        date,
        totalShifts: state.shifts.length,
        activeShifts: state.shifts.filter(s => s.status === 'in_progress').length,
        staffPresent: 0,
        staffScheduled: state.shifts.filter(s => s.status === 'confirmed').length,
        totalLaborCost: 0,
        coverageStatus: [],
        alerts: []
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get dashboard');
    }
  }, [state.shifts]);

  const calculateLaborCosts = useCallback(async (dateRange: DateRange): Promise<LaborCost[]> => {
    try {
      // TODO: Implement labor cost calculation
      return [];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate labor costs');
    }
  }, []);

  const analyzeCoverage = useCallback(async (dateRange: DateRange): Promise<CoverageMetrics[]> => {
    try {
      // TODO: Implement coverage analysis
      return [];
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze coverage');
    }
  }, []);

  const navigateDay = useCallback((direction: 'prev' | 'next') => {
    setState(prev => {
      const currentStart = new Date(prev.selectedDateRange.startDate);
      const currentEnd = new Date(prev.selectedDateRange.endDate);
      const daysToAdd = direction === 'next' ? 1 : -1;

      currentStart.setDate(currentStart.getDate() + daysToAdd);
      currentEnd.setDate(currentEnd.getDate() + daysToAdd);

      return {
        ...prev,
        selectedDateRange: {
          startDate: createISODate(currentStart),
          endDate: createISODate(currentEnd)
        }
      };
    });
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      const dashboard = await getDashboard(state.selectedDateRange.startDate);
      setState(prev => ({ ...prev, dashboard }));
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  }, [getDashboard, state.selectedDateRange.startDate]);

  return {
    ...state,
    createShift,
    updateShift,
    deleteShift,
    bulkCreateShifts,
    checkShiftConflicts,
    createSchedule,
    publishSchedule,
    copySchedule,
    optimizeSchedule,
    createTimeOffRequest,
    approveTimeOffRequest,
    denyTimeOffRequest,
    getAvailableSlots,
    getDashboard,
    calculateLaborCosts,
    analyzeCoverage,
    setFilters,
    setDateRange,
    navigateWeek,
    navigateDay,
    refreshData,
    refreshDashboard
  };
}