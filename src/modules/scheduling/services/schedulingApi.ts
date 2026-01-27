/**
 * UNIFIED SCHEDULING API - G-ADMIN MINI v3.0
 *
 * BREAKING CHANGE: Complete rewrite using UnifiedCalendarEngine
 * NO legacy support - uses new unified types and calendar system
 *
 * @version 3.0.0
 * @breaking-change Replaces all legacy scheduling API patterns
 */

import { supabase } from '@/lib/supabase/client';
import { UnifiedCalendarEngine } from '@/shared/calendar/engine/UnifiedCalendarEngine';
import type { CalendarEngineConfig, QueryOptions } from '@/shared/calendar/engine/UnifiedCalendarEngine';
import { BaseCalendarAdapter } from '@/shared/calendar/adapters/BaseCalendarAdapter';
import type {
  ISODateString,
  ISOTimeString,
  DurationMinutes,
  TimezoneString,
  TimeSlot,
  Booking,
  Resource,
  DateRange,
  CalendarConfig,
} from '@/shared/calendar/types/DateTimeTypes';
import { createISODate, createISODateTime, calculateDuration, nowTimestamp, registerGlobalAdapter } from '@/shared/calendar';
import { logger } from '@/lib/logging';
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
  ScheduleDashboard,
  ShiftTracking
} from '../types/schedulingTypes';

// ===============================
// SCHEDULING CALENDAR ADAPTER
// ===============================

/**
 * Scheduling-specific calendar adapter
 * Implements business rules for staff scheduling
 */
export class SchedulingCalendarAdapter extends BaseCalendarAdapter {
  async validateBookingRules(bookingData: any) {
    // Implement scheduling-specific validation
    return { isValid: true, errors: [], warnings: [] };
  }

  async validateBookingUpdate(existingBooking: any, updates: any) {
    return { isValid: true, errors: [], warnings: [] };
  }

  async validateCancellation(booking: any) {
    return { isValid: true, errors: [], warnings: [] };
  }

  async processBookingCreation(booking: any) {
    return { success: true, data: booking, errors: [], warnings: [] };
  }

  async processBookingUpdate(oldBooking: any, newBooking: any) {
    return { success: true, data: newBooking, errors: [], warnings: [] };
  }

  async processCancellation(booking: any) {
    return { success: true, data: booking, errors: [], warnings: [] };
  }

  async getBusinessHours(date: ISODateString) {
    // Return default business hours for now
    return null;
  }

  async checkResourceAvailability(resource: Resource, timeSlot: TimeSlot) {
    return true;
  }

  async checkBusinessConflicts(timeSlot: TimeSlot, resourceIds: string[]) {
    return { hasConflicts: false, conflicts: [] };
  }
}

// ===============================
// UNIFIED SCHEDULING ENGINE
// ===============================

/**
 * Singleton instance of the scheduling calendar engine
 */
let schedulingEngine: UnifiedCalendarEngine | null = null;

/**
 * Gets or creates the scheduling calendar engine
 */
function getSchedulingEngine(): UnifiedCalendarEngine {
  if (!schedulingEngine) {
    const config: CalendarEngineConfig = {
      businessModel: 'staff_scheduling',
      timezone: 'UTC' as TimezoneString,
      enabledFeatures: new Set(['shift_management', 'time_off', 'coverage_tracking']),
      adapter: new SchedulingCalendarAdapter('staff_scheduling', {} as CalendarConfig),
      eventBusEnabled: true
    };
    schedulingEngine = new UnifiedCalendarEngine(config);
  }
  return schedulingEngine;
}

// ===============================
// UNIFIED SHIFTS API
// ===============================

export const shiftsApi = {
  // Get shifts for a date range using unified engine
  async getShifts(
    startDate: ISODateString,
    endDate: ISODateString,
    filters?: {
      position?: string;
      employeeId?: string;
      status?: ShiftStatus;
    }
  ): Promise<StaffShift[]> {
    try {
      const engine = getSchedulingEngine();

      const queryOptions: QueryOptions = {
        dateRange: { startDate, endDate },
        bookingTypes: ['shift'],
        statuses: filters?.status ? [filters.status] : undefined
      };

      const result = await engine.queryBookings(queryOptions);

      if (!result.success) {
        throw new Error(result.errors.join(', '));
      }

      // Convert unified bookings to staff shifts
      const shifts = (result.data || []).map(booking => this.convertBookingToShift(booking));

      // Apply additional filters
      let filteredShifts = shifts;

      if (filters?.position) {
        filteredShifts = shifts.filter(shift => shift.position === filters.position);
      }

      if (filters?.employeeId) {
        filteredShifts = shifts.filter(shift => shift.employeeId === filters.employeeId);
      }

      return filteredShifts;
    } catch (error) {
      logger.error('API', 'Error fetching shifts:', error);
      throw new Error('Failed to fetch shifts');
    }
  },

  // Helper to convert unified booking to staff shift
  convertBookingToShift(booking: Booking): StaffShift {
    return {
      ...booking,
      type: 'shift',
      employeeId: booking.resourceIds[0] || '',
      employeeName: booking.customerName || 'Unknown',
      position: booking.serviceType || 'General',
      breakDuration: undefined // Would be in metadata
    } as StaffShift;
  },

  // Create a new shift using unified engine
  async createShift(shiftData: ShiftFormData): Promise<StaffShift> {
    try {
      const engine = getSchedulingEngine();

      const result = await engine.createBooking({
        type: 'shift',
        timeSlot: shiftData.timeSlot,
        resourceIds: [shiftData.employeeId],
        customerName: shiftData.employeeId, // Will be resolved to employee name
        serviceType: shiftData.position,
        notes: shiftData.notes,
        createdBy: 'system' // Should come from auth context
      });

      if (!result.success) {
        throw new Error(result.errors.join(', '));
      }

      return this.convertBookingToShift(result.data!);
    } catch (error) {
      logger.error('API', 'Error creating shift:', error);
      throw new Error('Failed to create shift');
    }
  },

  // Update an existing shift using unified engine
  async updateShift(shiftId: string, updates: Partial<StaffShift>): Promise<void> {
    try {
      const engine = getSchedulingEngine();

      const result = await engine.updateBooking(shiftId, {
        timeSlot: updates.timeSlot,
        status: updates.status,
        notes: updates.notes,
        cost: updates.cost
      });

      if (!result.success) {
        throw new Error(result.errors.join(', '));
      }
    } catch (error) {
      logger.error('API', 'Error updating shift:', error);
      throw new Error('Failed to update shift');
    }
  },

  // Update event time (for drag & drop)
  async updateEventTime(eventId: string, newStart: Date, newEnd: Date): Promise<void> {
    try {
      const engine = getSchedulingEngine();

      // Extract date and time components
      const date = newStart.toISOString().split('T')[0] as ISODateString;
      const startTime = `${String(newStart.getHours()).padStart(2, '0')}:${String(newStart.getMinutes()).padStart(2, '0')}` as ISOTimeString;
      const endTime = `${String(newEnd.getHours()).padStart(2, '0')}:${String(newEnd.getMinutes()).padStart(2, '0')}` as ISOTimeString;

      const result = await engine.updateBooking(eventId, {
        timeSlot: {
          date,
          startTime,
          endTime
        }
      });

      if (!result.success) {
        throw new Error(result.errors.join(', '));
      }

      logger.info('API', `Event ${eventId} time updated to ${startTime}-${endTime} on ${date}`);
    } catch (error) {
      logger.error('API', 'Error updating event time:', error);
      throw new Error('Failed to update event time');
    }
  },

  // Cancel a shift (delete using unified engine)
  async deleteShift(shiftId: string): Promise<void> {
    try {
      const engine = getSchedulingEngine();

      const result = await engine.cancelBooking(shiftId, 'Shift deleted', 'system');

      if (!result.success) {
        throw new Error(result.errors.join(', '));
      }
    } catch (error) {
      logger.error('API', 'Error deleting shift:', error);
      throw new Error('Failed to delete shift');
    }
  },

  // Bulk create shifts using unified engine
  async bulkCreateShifts(shiftsData: ShiftFormData[]): Promise<StaffShift[]> {
    try {
      const createdShifts: StaffShift[] = [];

      // Create shifts one by one using the unified engine
      for (const shiftData of shiftsData) {
        try {
          const shift = await this.createShift(shiftData);
          createdShifts.push(shift);
        } catch (error) {
          logger.error('API', `Failed to create shift for employee ${shiftData.employeeId}:`, error);
          // Continue with other shifts
        }
      }

      if (createdShifts.length === 0) {
        throw new Error('Failed to create any shifts');
      }

      return createdShifts;
    } catch (error) {
      logger.error('API', 'Error bulk creating shifts:', error);
      throw new Error('Failed to create shifts');
    }
  },

  // Get shift conflicts for an employee using unified engine
  async getShiftConflicts(
    employeeId: string,
    timeSlot: TimeSlot
  ): Promise<StaffShift[]> {
    try {
      const engine = getSchedulingEngine();

      // Query existing bookings for the employee on the same date
      const result = await engine.queryBookings({
        dateRange: { startDate: timeSlot.date, endDate: timeSlot.date },
        resourceIds: [employeeId],
        bookingTypes: ['shift']
      });

      if (!result.success) {
        throw new Error(result.errors.join(', '));
      }

      // Filter for actual time conflicts
      const conflictingShifts = (result.data || [])
        .map(booking => this.convertBookingToShift(booking))
        .filter(shift => {
          // Check if time slots overlap
          return (
            shift.timeSlot.startTime < timeSlot.endTime &&
            shift.timeSlot.endTime > timeSlot.startTime
          );
        });

      return conflictingShifts;
    } catch (error) {
      logger.error('API', 'Error checking shift conflicts:', error);
      throw new Error('Failed to check shift conflicts');
    }
  }
};

// ===============================
// TIME-OFF REQUESTS API (UNIFIED)
// ===============================

export const timeOffApi = {
  // Get time-off requests
  // ✅ PERFORMANCE FIX: Added pagination support to prevent slow queries (1032ms → target <300ms)
  // 📊 DB INDEXES NEEDED: 
  //    - time_off_requests(status, created_at DESC)
  //    - time_off_requests(employee_id, created_at DESC)
  async getTimeOffRequests(filters?: {
    status?: TimeOffRequest['status'];
    type?: TimeOffRequest['type'];
    employee_id?: string;
    limit?: number;        // ✅ NEW: Pagination support
    offset?: number;       // ✅ NEW: Pagination support
  }): Promise<TimeOffRequest[]> {
    try {
      // ✅ PERFORMANCE: Default limit to prevent full table scans
      const limit = filters?.limit ?? 50; // Default 50 requests max
      const offset = filters?.offset ?? 0;

      let query = supabase
        .from('time_off_requests')
        .select(`
          *,
          employees:employee_id (
            name,
            position
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1); // ✅ Apply pagination

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      logger.error('API', 'Error fetching time-off requests:', error);
      throw new Error('Failed to fetch time-off requests');
    }
  },

  // Create a time-off request
  async createTimeOffRequest(request: Omit<TimeOffRequest, 'id' | 'created_at'>): Promise<TimeOffRequest> {
    try {
      const { data, error } = await supabase
        .from('time_off_requests')
        .insert([{
          ...request,
          requested_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('API', 'Error creating time-off request:', error);
      throw new Error('Failed to create time-off request');
    }
  },

  // Update time-off request status
  async updateTimeOffRequestStatus(
    requestId: string, 
    status: 'approved' | 'denied', 
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      logger.error('API', 'Error updating time-off request:', error);
      throw new Error('Failed to update time-off request');
    }
  },

  // Get time-off conflicts
  async getTimeOffConflicts(startDate: string, endDate: string): Promise<TimeOffRequest[]> {
    try {
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          employees:employee_id (
            name,
            position
          )
        `)
        .eq('status', 'approved')
        .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('API', 'Error fetching time-off conflicts:', error);
      throw new Error('Failed to fetch time-off conflicts');
    }
  }
};

// =====================
// SCHEDULES API
// =====================

export const schedulesApi = {
  // Get schedules
  async getSchedules(filters?: {
    status?: Schedule['status'];
    start_date?: string;
    end_date?: string;
  }): Promise<Schedule[]> {
    try {
      let query = supabase
        .from('schedules')
        .select(`
          *,
          shift_schedules (
            *,
            employees:employee_id (
              name,
              position
            )
          )
        `)
        .order('start_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.start_date) {
        query = query.gte('start_date', filters.start_date);
      }
      
      if (filters?.end_date) {
        query = query.lte('end_date', filters.end_date);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(schedule => ({
        ...schedule,
        shifts: (schedule.shift_schedules || []).map(shift => ({
          ...shift,
          employee_name: shift.employees?.name || 'Unknown'
        }))
      }));
    } catch (error) {
      logger.error('API', 'Error fetching schedules:', error);
      throw new Error('Failed to fetch schedules');
    }
  },

  // Create a new schedule
  async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at'>): Promise<Schedule> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          ...schedule,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('API', 'Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  },

  // Update schedule status
  async updateScheduleStatus(scheduleId: string, status: Schedule['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', scheduleId);

      if (error) throw error;
    } catch (error) {
      logger.error('API', 'Error updating schedule status:', error);
      throw new Error('Failed to update schedule status');
    }
  },

  // Copy schedule
  async copySchedule(sourceScheduleId: string, targetWeekStart: string, targetWeekEnd: string): Promise<Schedule> {
    try {
      // First get the source schedule
      const { data: sourceSchedule, error: fetchError } = await supabase
        .from('schedules')
        .select(`
          *,
          shifts (*)
        `)
        .eq('id', sourceScheduleId)
        .single();

      if (fetchError) throw fetchError;

      // Create new schedule
      const { data: newSchedule, error: createError } = await supabase
        .from('schedules')
        .insert([{
          name: `Copy of ${sourceSchedule.name}`,
          start_date: targetWeekStart,
          end_date: targetWeekEnd,
          status: 'draft' as const,
          created_by: sourceSchedule.created_by,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Copy shifts with date adjustment
      const daysDiff = Math.floor(
        (new Date(targetWeekStart).getTime() - new Date(sourceSchedule.start_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      const shiftsToCreate = (sourceSchedule.shifts || []).map(shift => {
        const shiftDate = new Date(shift.date);
        shiftDate.setDate(shiftDate.getDate() + daysDiff);
        
        return {
          employee_id: shift.employee_id,
          date: shiftDate.toISOString().split('T')[0],
          start_time: shift.start_time,
          end_time: shift.end_time,
          position: shift.position,
          notes: shift.notes,
          status: 'scheduled' as const,
          schedule_id: newSchedule.id
        };
      });

      if (shiftsToCreate.length > 0) {
        const { error: shiftsError } = await supabase
          .from('shift_schedules')
          .insert(shiftsToCreate);

        if (shiftsError) throw shiftsError;
      }

      return newSchedule;
    } catch (error) {
      logger.error('API', 'Error copying schedule:', error);
      throw new Error('Failed to copy schedule');
    }
  }
};

// =====================
// SHIFT TEMPLATES API
// =====================

export const shiftTemplatesApi = {
  // Get shift templates
  async getShiftTemplates(): Promise<ShiftTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('shift_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('API', 'Error fetching shift templates:', error);
      throw new Error('Failed to fetch shift templates');
    }
  },

  // Create shift template
  async createShiftTemplate(template: Omit<ShiftTemplate, 'id'>): Promise<ShiftTemplate> {
    try {
      const { data, error } = await supabase
        .from('shift_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('API', 'Error creating shift template:', error);
      throw new Error('Failed to create shift template');
    }
  },

  // Apply template to create shifts
  async applyTemplate(templateId: string, weekStart: string, employeeIds: string[]): Promise<Shift[]> {
    try {
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Generate shifts for the week
      const shiftsToCreate: ShiftFormData[] = [];
      const weekStartDate = new Date(weekStart);

      template.days_of_week.forEach(dayOfWeek => {
        const shiftDate = new Date(weekStartDate);
        shiftDate.setDate(weekStartDate.getDate() + dayOfWeek);
        
        employeeIds.slice(0, template.max_employees).forEach(employeeId => {
          shiftsToCreate.push({
            employee_id: employeeId,
            date: shiftDate.toISOString().split('T')[0],
            start_time: template.start_time,
            end_time: template.end_time,
            position: template.position_id,
            notes: `Created from template: ${template.name}`
          });
        });
      });

      // Create the shifts
      return await shiftsApi.bulkCreateShifts(shiftsToCreate);
    } catch (error) {
      logger.error('API', 'Error applying shift template:', error);
      throw new Error('Failed to apply shift template');
    }
  }
};

// =====================
// ANALYTICS API
// =====================

export const schedulingAnalyticsApi = {
  // Get weekly dashboard stats
  async getWeeklyDashboard({ startDate, endDate }: { startDate: string; endDate: string }) {
    try {
      // Get shifts for the week
      const { data: shifts, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (shiftsError) throw shiftsError;

      // Get time-off requests
      const { data: timeOffRequests, error: timeOffError } = await supabase
        .from('time_off_requests')
        .select('*')
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      if (timeOffError) throw timeOffError;

      // Calculate stats
      const totalShifts = shifts?.length || 0;
      const uniqueEmployees = new Set(shifts?.map(s => s.employee_id) || []).size;
      const pendingTimeOff = timeOffRequests?.filter(r => r.status === 'pending').length || 0;
      const approvedRequests = timeOffRequests?.filter(r => r.status === 'approved').length || 0;

      return {
        total_shifts_this_week: totalShifts,
        employees_scheduled: uniqueEmployees,
        coverage_percentage: totalShifts > 0 ? 85 : 0, // TODO: Calculate real coverage
        pending_time_off: pendingTimeOff,
        labor_cost_this_week: 0, // TODO: Calculate from shifts
        overtime_hours: 0, // TODO: Calculate from shifts
        understaffed_shifts: 0, // TODO: Calculate from coverage data
        approved_requests: approvedRequests
      };
    } catch (error) {
      logger.error('API', 'Error fetching weekly dashboard:', error);
      return {
        total_shifts_this_week: 0,
        employees_scheduled: 0,
        coverage_percentage: 0,
        pending_time_off: 0,
        labor_cost_this_week: 0,
        overtime_hours: 0,
        understaffed_shifts: 0,
        approved_requests: 0
      };
    }
  },

  // Get labor cost analytics
  async getLaborCostAnalytics(startDate: string, endDate: string) {
    try {
      // This would typically be a more complex query or stored procedure
      // For now, we'll do basic calculations
      const { data: shifts, error } = await supabase
        .from('shift_schedules')
        .select(`
          *,
          employees:employee_id (
            hourly_rate,
            position
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'completed');

      if (error) throw error;

      // Calculate basic analytics
      const totalCost = (shifts || []).reduce((sum, shift) => {
        const hours = this.calculateShiftHours(shift.start_time, shift.end_time);
        const rate = shift.employees?.hourly_rate || 0;
        return sum + (hours * rate);
      }, 0);

      const totalHours = (shifts || []).reduce((sum, shift) => {
        return sum + this.calculateShiftHours(shift.start_time, shift.end_time);
      }, 0);

      return {
        total_cost: totalCost,
        total_hours: totalHours,
        avg_hourly_rate: totalHours > 0 ? totalCost / totalHours : 0,
        shift_count: shifts?.length || 0
      };
    } catch (error) {
      logger.error('API', 'Error fetching labor cost analytics:', error);
      throw new Error('Failed to fetch labor cost analytics');
    }
  },

  // Calculate shift hours
  calculateShiftHours(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  },

  // Get coverage analytics
  async getCoverageAnalytics(startDate: string, endDate: string) {
    try {
      // This would be a complex query analyzing coverage vs requirements
      // Implementation would depend on business rules for minimum staffing
      
      const { data: shifts, error } = await supabase
        .from('shift_schedules')
        .select(`
          date,
          start_time,
          end_time,
          position,
          status
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Basic coverage calculation (would be more sophisticated in practice)
      const coverageByDay = {};
      (shifts || []).forEach(shift => {
        if (!coverageByDay[shift.date]) {
          coverageByDay[shift.date] = [];
        }
        coverageByDay[shift.date].push(shift);
      });

      return {
        coverage_by_day: coverageByDay,
        total_shifts: shifts?.length || 0,
        avg_daily_coverage: Object.keys(coverageByDay).length > 0 
          ? (shifts?.length || 0) / Object.keys(coverageByDay).length 
          : 0
      };
    } catch (error) {
      logger.error('API', 'Error fetching coverage analytics:', error);
      throw new Error('Failed to fetch coverage analytics');
    }
  }
};

// ===============================
// ADAPTER REGISTRATION
// ===============================

/**
 * Register the scheduling adapter globally
 * This makes it available to UnifiedCalendar when using businessModel="staff_scheduling"
 */
registerGlobalAdapter('staff_scheduling', SchedulingCalendarAdapter);

// Export all APIs
export const schedulingApi = {
  shifts: shiftsApi,
  timeOff: timeOffApi,
  schedules: schedulesApi,
  shiftTemplates: shiftTemplatesApi,
  analytics: schedulingAnalyticsApi
};

export default schedulingApi;