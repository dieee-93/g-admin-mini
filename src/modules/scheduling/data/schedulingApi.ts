// schedulingApi - Supabase API integration for scheduling module
import { supabase } from '@/lib/supabase';
import type { 
  Shift, 
  Schedule, 
  TimeOffRequest, 
  ShiftTemplate, 
  ShiftFormData,
  ShiftStatus 
} from '../types';

// =====================
// SHIFTS API
// =====================

export const shiftsApi = {
  // Get shifts for a date range
  async getShifts(startDate: string, endDate: string, filters?: {
    position?: string;
    employee_id?: string;
    status?: ShiftStatus;
  }): Promise<Shift[]> {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          employees:employee_id (
            name,
            position
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (filters?.position) {
        query = query.eq('position', filters.position);
      }
      
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(shift => ({
        ...shift,
        employee_name: shift.employees?.name || 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw new Error('Failed to fetch shifts');
    }
  },

  // Create a new shift
  async createShift(shiftData: ShiftFormData): Promise<Shift> {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          employee_id: shiftData.employee_id,
          date: shiftData.date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          position: shiftData.position,
          notes: shiftData.notes,
          status: 'scheduled'
        }])
        .select(`
          *,
          employees:employee_id (
            name,
            position
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        employee_name: data.employees?.name || 'Unknown'
      };
    } catch (error) {
      console.error('Error creating shift:', error);
      throw new Error('Failed to create shift');
    }
  },

  // Update an existing shift
  async updateShift(shiftId: string, updates: Partial<Shift>): Promise<void> {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', shiftId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw new Error('Failed to update shift');
    }
  },

  // Delete a shift
  async deleteShift(shiftId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw new Error('Failed to delete shift');
    }
  },

  // Bulk create shifts
  async bulkCreateShifts(shiftsData: ShiftFormData[]): Promise<Shift[]> {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert(
          shiftsData.map(shiftData => ({
            employee_id: shiftData.employee_id,
            date: shiftData.date,
            start_time: shiftData.start_time,
            end_time: shiftData.end_time,
            position: shiftData.position,
            notes: shiftData.notes,
            status: 'scheduled'
          }))
        )
        .select(`
          *,
          employees:employee_id (
            name,
            position
          )
        `);

      if (error) throw error;

      return (data || []).map(shift => ({
        ...shift,
        employee_name: shift.employees?.name || 'Unknown'
      }));
    } catch (error) {
      console.error('Error bulk creating shifts:', error);
      throw new Error('Failed to create shifts');
    }
  },

  // Get shift conflicts for an employee
  async getShiftConflicts(employeeId: string, date: string, startTime: string, endTime: string): Promise<Shift[]> {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', date)
        .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error checking shift conflicts:', error);
      throw new Error('Failed to check shift conflicts');
    }
  }
};

// =====================
// TIME-OFF REQUESTS API
// =====================

export const timeOffApi = {
  // Get time-off requests
  async getTimeOffRequests(filters?: {
    status?: TimeOffRequest['status'];
    type?: TimeOffRequest['type'];
    employee_id?: string;
  }): Promise<TimeOffRequest[]> {
    try {
      let query = supabase
        .from('time_off_requests')
        .select(`
          *,
          employees:employee_id (
            name,
            position
          )
        `)
        .order('requested_at', { ascending: false });

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
      console.error('Error fetching time-off requests:', error);
      throw new Error('Failed to fetch time-off requests');
    }
  },

  // Create a time-off request
  async createTimeOffRequest(request: Omit<TimeOffRequest, 'id' | 'requested_at'>): Promise<TimeOffRequest> {
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
      console.error('Error creating time-off request:', error);
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
      console.error('Error updating time-off request:', error);
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
      console.error('Error fetching time-off conflicts:', error);
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
          shifts (
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
        shifts: (schedule.shifts || []).map(shift => ({
          ...shift,
          employee_name: shift.employees?.name || 'Unknown'
        }))
      }));
    } catch (error) {
      console.error('Error fetching schedules:', error);
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
      console.error('Error creating schedule:', error);
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
      console.error('Error updating schedule status:', error);
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
          .from('shifts')
          .insert(shiftsToCreate);

        if (shiftsError) throw shiftsError;
      }

      return newSchedule;
    } catch (error) {
      console.error('Error copying schedule:', error);
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
      console.error('Error fetching shift templates:', error);
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
      console.error('Error creating shift template:', error);
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
      console.error('Error applying shift template:', error);
      throw new Error('Failed to apply shift template');
    }
  }
};

// =====================
// ANALYTICS API
// =====================

export const schedulingAnalyticsApi = {
  // Get labor cost analytics
  async getLaborCostAnalytics(startDate: string, endDate: string) {
    try {
      // This would typically be a more complex query or stored procedure
      // For now, we'll do basic calculations
      const { data: shifts, error } = await supabase
        .from('shifts')
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
      console.error('Error fetching labor cost analytics:', error);
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
        .from('shifts')
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
      console.error('Error fetching coverage analytics:', error);
      throw new Error('Failed to fetch coverage analytics');
    }
  }
};

// Export all APIs
export const schedulingApi = {
  shifts: shiftsApi,
  timeOff: timeOffApi,
  schedules: schedulesApi,
  shiftTemplates: shiftTemplatesApi,
  analytics: schedulingAnalyticsApi
};

export default schedulingApi;