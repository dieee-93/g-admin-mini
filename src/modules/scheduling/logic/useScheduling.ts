// useScheduling - Main hook for scheduling module business logic
import { useState, useEffect, useCallback } from 'react';
import type { 
  Shift, 
  Schedule, 
  TimeOffRequest, 
  ShiftTemplate, 
  ShiftFormData,
  ShiftStatus 
} from '../types';

interface SchedulingState {
  shifts: Shift[];
  schedules: Schedule[];
  timeOffRequests: TimeOffRequest[];
  shiftTemplates: ShiftTemplate[];
  loading: boolean;
  error: string | null;
  selectedWeek: Date;
  filters: {
    position?: string;
    employee?: string;
    status?: ShiftStatus;
  };
}

interface SchedulingActions {
  // Shift management
  createShift: (shiftData: ShiftFormData) => Promise<Shift>;
  updateShift: (shiftId: string, updates: Partial<Shift>) => Promise<void>;
  deleteShift: (shiftId: string) => Promise<void>;
  bulkCreateShifts: (shiftsData: ShiftFormData[]) => Promise<Shift[]>;
  
  // Schedule management
  publishSchedule: (scheduleId: string) => Promise<void>;
  copySchedule: (sourceWeek: Date, targetWeek: Date) => Promise<void>;
  autoSchedule: (weekDate: Date, constraints?: any) => Promise<void>;
  
  // Time-off management
  createTimeOffRequest: (request: Omit<TimeOffRequest, 'id' | 'requested_at'>) => Promise<void>;
  approveTimeOffRequest: (requestId: string) => Promise<void>;
  denyTimeOffRequest: (requestId: string, reason?: string) => Promise<void>;
  
  // Filters and navigation
  setFilters: (filters: Partial<SchedulingState['filters']>) => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  selectWeek: (date: Date) => void;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

export function useScheduling(): SchedulingState & SchedulingActions {
  const [state, setState] = useState<SchedulingState>({
    shifts: [],
    schedules: [],
    timeOffRequests: [],
    shiftTemplates: [],
    loading: true,
    error: null,
    selectedWeek: new Date(),
    filters: {}
  });

  // Initialize data on mount
  useEffect(() => {
    loadSchedulingData();
  }, [state.selectedWeek]);

  const loadSchedulingData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // TODO: Replace with actual API calls
      const mockShifts: Shift[] = [
        {
          id: '1',
          employee_id: 'emp1',
          employee_name: 'Ana García',
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '17:00',
          position: 'Server',
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          employee_id: 'emp2',
          employee_name: 'Carlos López',
          date: '2024-01-15',
          start_time: '11:00',
          end_time: '20:00',
          position: 'Cook',
          status: 'scheduled',
          break_time: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockTimeOffRequests: TimeOffRequest[] = [
        {
          id: '1',
          employee_id: 'emp1',
          start_date: '2024-02-15',
          end_date: '2024-02-17',
          type: 'vacation',
          status: 'pending',
          reason: 'Family vacation',
          requested_at: '2024-01-10T10:00:00Z'
        }
      ];

      const mockSchedules: Schedule[] = [
        {
          id: '1',
          name: 'Week of January 15, 2024',
          start_date: '2024-01-15',
          end_date: '2024-01-21',
          shifts: mockShifts,
          status: 'published',
          created_by: 'manager1',
          created_at: new Date().toISOString()
        }
      ];

      const mockShiftTemplates: ShiftTemplate[] = [
        {
          id: '1',
          name: 'Morning Server',
          start_time: '08:00',
          end_time: '16:00',
          days_of_week: [1, 2, 3, 4, 5], // Mon-Fri
          position_id: 'server',
          max_employees: 3
        },
        {
          id: '2',
          name: 'Evening Cook',
          start_time: '16:00',
          end_time: '23:00',
          days_of_week: [0, 1, 2, 3, 4, 5, 6], // Every day
          position_id: 'cook',
          max_employees: 2
        }
      ];

      setState(prev => ({
        ...prev,
        shifts: mockShifts,
        timeOffRequests: mockTimeOffRequests,
        schedules: mockSchedules,
        shiftTemplates: mockShiftTemplates,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load scheduling data'
      }));
    }
  }, [state.selectedWeek]);

  const createShift = useCallback(async (shiftData: ShiftFormData): Promise<Shift> => {
    try {
      // TODO: Replace with actual API call
      const newShift: Shift = {
        id: `shift_${Date.now()}`,
        employee_id: shiftData.employee_id,
        employee_name: 'Employee Name', // Would be fetched from employee data
        date: shiftData.date,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        position: shiftData.position,
        status: 'scheduled',
        notes: shiftData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        shifts: [...prev.shifts, newShift]
      }));

      return newShift;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create shift');
    }
  }, []);

  const updateShift = useCallback(async (shiftId: string, updates: Partial<Shift>): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      setState(prev => ({
        ...prev,
        shifts: prev.shifts.map(shift =>
          shift.id === shiftId
            ? { ...shift, ...updates, updated_at: new Date().toISOString() }
            : shift
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update shift');
    }
  }, []);

  const deleteShift = useCallback(async (shiftId: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      setState(prev => ({
        ...prev,
        shifts: prev.shifts.filter(shift => shift.id !== shiftId)
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete shift');
    }
  }, []);

  const bulkCreateShifts = useCallback(async (shiftsData: ShiftFormData[]): Promise<Shift[]> => {
    try {
      // TODO: Replace with actual API call
      const newShifts = shiftsData.map((shiftData, index) => ({
        id: `shift_${Date.now()}_${index}`,
        employee_id: shiftData.employee_id,
        employee_name: 'Employee Name',
        date: shiftData.date,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        position: shiftData.position,
        status: 'scheduled' as const,
        notes: shiftData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

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
      // TODO: Replace with actual API call
      setState(prev => ({
        ...prev,
        schedules: prev.schedules.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, status: 'published' as const }
            : schedule
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to publish schedule');
    }
  }, []);

  const copySchedule = useCallback(async (sourceWeek: Date, targetWeek: Date): Promise<void> => {
    try {
      // TODO: Implement schedule copying logic
      console.log('Copying schedule from', sourceWeek, 'to', targetWeek);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to copy schedule');
    }
  }, []);

  const autoSchedule = useCallback(async (weekDate: Date, constraints?: any): Promise<void> => {
    try {
      // TODO: Implement auto-scheduling algorithm
      console.log('Auto-scheduling for week', weekDate, 'with constraints', constraints);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to auto-schedule');
    }
  }, []);

  const createTimeOffRequest = useCallback(async (request: Omit<TimeOffRequest, 'id' | 'requested_at'>): Promise<void> => {
    try {
      const newRequest: TimeOffRequest = {
        ...request,
        id: `request_${Date.now()}`,
        requested_at: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        timeOffRequests: [...prev.timeOffRequests, newRequest]
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create time-off request');
    }
  }, []);

  const approveTimeOffRequest = useCallback(async (requestId: string): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        timeOffRequests: prev.timeOffRequests.map(request =>
          request.id === requestId
            ? { 
                ...request, 
                status: 'approved' as const,
                reviewed_at: new Date().toISOString(),
                reviewed_by: 'current_user' // TODO: Get from auth context
              }
            : request
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to approve request');
    }
  }, []);

  const denyTimeOffRequest = useCallback(async (requestId: string, reason?: string): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        timeOffRequests: prev.timeOffRequests.map(request =>
          request.id === requestId
            ? { 
                ...request, 
                status: 'denied' as const,
                reviewed_at: new Date().toISOString(),
                reviewed_by: 'current_user'
              }
            : request
        )
      }));
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to deny request');
    }
  }, []);

  const setFilters = useCallback((filters: Partial<SchedulingState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setState(prev => {
      const newDate = new Date(prev.selectedWeek);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return { ...prev, selectedWeek: newDate };
    });
  }, []);

  const selectWeek = useCallback((date: Date) => {
    setState(prev => ({ ...prev, selectedWeek: date }));
  }, []);

  const refreshData = useCallback(async () => {
    await loadSchedulingData();
  }, [loadSchedulingData]);

  return {
    ...state,
    createShift,
    updateShift,
    deleteShift,
    bulkCreateShifts,
    publishSchedule,
    copySchedule,
    autoSchedule,
    createTimeOffRequest,
    approveTimeOffRequest,
    denyTimeOffRequest,
    setFilters,
    navigateWeek,
    selectWeek,
    refreshData
  };
}