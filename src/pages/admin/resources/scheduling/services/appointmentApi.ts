/**
 * APPOINTMENT API SERVICE
 *
 * Handles all Supabase operations for appointments.
 *
 * @version 1.0.0 - Phase 4
 */

import { supabase } from '@/lib/supabase/client';
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilters
} from '../types/appointments';
import { logger } from '@/lib/logging';

/**
 * Get appointments for a date range
 */
export async function getAppointments(
  dateFrom: string,
  dateTo: string,
  filters?: AppointmentFilters
): Promise<Appointment[]> {
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', dateFrom)
      .lte('appointment_date', dateTo)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.provider_id) {
        query = query.eq('provider_id', filters.provider_id);
      }
      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }
      if (filters.booking_source && filters.booking_source.length > 0) {
        query = query.in('booking_source', filters.booking_source);
      }
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching appointments', { error, filters });
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch appointments', { error });
    throw error;
  }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointment(id: string): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching appointment', { error, id });
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Failed to fetch appointment', { error, id });
    throw error;
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  input: CreateAppointmentInput
): Promise<Appointment> {
  try {
    // Get current user ID for created_by
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const appointmentData = {
      ...input,
      created_by: user?.id,
      status: 'scheduled', // Default status
      timezone: 'America/Argentina/Buenos_Aires' // Default timezone
    };

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating appointment', { error, input });
      throw error;
    }

    logger.info('Appointment created', { appointmentId: data.id });
    return data;
  } catch (error) {
    logger.error('Failed to create appointment', { error });
    throw error;
  }
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  id: string,
  updates: UpdateAppointmentInput
): Promise<Appointment> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating appointment', { error, id, updates });
      throw error;
    }

    logger.info('Appointment updated', { appointmentId: id });
    return data;
  } catch (error) {
    logger.error('Failed to update appointment', { error, id });
    throw error;
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  id: string,
  cancellation_reason?: string
): Promise<void> {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason,
        cancelled_at: new Date().toISOString(),
        cancelled_by: user?.id
      })
      .eq('id', id);

    if (error) {
      logger.error('Error cancelling appointment', { error, id });
      throw error;
    }

    logger.info('Appointment cancelled', { appointmentId: id });
  } catch (error) {
    logger.error('Failed to cancel appointment', { error, id });
    throw error;
  }
}

/**
 * Delete an appointment (hard delete)
 */
export async function deleteAppointment(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting appointment', { error, id });
      throw error;
    }

    logger.info('Appointment deleted', { appointmentId: id });
  } catch (error) {
    logger.error('Failed to delete appointment', { error, id });
    throw error;
  }
}

/**
 * Check if a time slot is available
 */
export async function checkTimeSlotAvailability(
  providerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_time_slot_available', {
      p_provider_id: providerId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_exclude_appointment_id: excludeAppointmentId || null
    });

    if (error) {
      logger.error('Error checking time slot availability', { error });
      throw error;
    }

    return data as boolean;
  } catch (error) {
    logger.error('Failed to check time slot availability', { error });
    return false;
  }
}

/**
 * Get appointments for a specific customer
 */
export async function getCustomerAppointments(
  customerId: string
): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('customer_id', customerId)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (error) {
      logger.error('Error fetching customer appointments', { error, customerId });
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch customer appointments', { error });
    throw error;
  }
}

/**
 * Get today's appointments
 */
export async function getTodayAppointments(): Promise<Appointment[]> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', today)
      .order('start_time', { ascending: true });

    if (error) {
      logger.error('Error fetching today appointments', { error });
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error('Failed to fetch today appointments', { error });
    throw error;
  }
}

/**
 * Get upcoming appointments (next 7 days)
 */
export async function getUpcomingAppointments(): Promise<Appointment[]> {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = nextWeek.toISOString().split('T')[0];

    return getAppointments(dateFrom, dateTo, {
      status: ['scheduled', 'confirmed']
    });
  } catch (error) {
    logger.error('Failed to fetch upcoming appointments', { error });
    throw error;
  }
}

/**
 * Mark appointment as no-show
 */
export async function markAsNoShow(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'no_show' })
      .eq('id', id);

    if (error) {
      logger.error('Error marking appointment as no-show', { error, id });
      throw error;
    }

    logger.info('Appointment marked as no-show', { appointmentId: id });
  } catch (error) {
    logger.error('Failed to mark appointment as no-show', { error, id });
    throw error;
  }
}

/**
 * Mark appointment as completed
 */
export async function completeAppointment(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) {
      logger.error('Error completing appointment', { error, id });
      throw error;
    }

    logger.info('Appointment completed', { appointmentId: id });
  } catch (error) {
    logger.error('Failed to complete appointment', { error, id });
    throw error;
  }
}

/**
 * Export all appointment API functions
 */
export const appointmentApi = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  checkTimeSlotAvailability,
  getCustomerAppointments,
  getTodayAppointments,
  getUpcomingAppointments,
  markAsNoShow,
  completeAppointment
};
