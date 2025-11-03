/**
 * Admin Appointments Hooks
 * Hooks for managing appointments from the admin/sales perspective
 * Following project patterns (NO React Query)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';
import type { Appointment } from '@/types/appointment';

interface AppointmentsFilters {
  date?: string;
  staff_id?: string;
  location_id?: string;
  status?: string;
}

/**
 * Get all appointments with filters
 */
export function useAdminAppointments(filters?: AppointmentsFilters) {
  const [data, setData] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          service:products!service_id(*),
          staff:employees!assigned_staff_id(*)
        `)
        .eq('order_type', 'APPOINTMENT')
        .order('scheduled_time', { ascending: true });

      if (filters?.date) {
        const startOfDay = `${filters.date}T00:00:00`;
        const endOfDay = `${filters.date}T23:59:59`;
        query = query.gte('scheduled_time', startOfDay).lte('scheduled_time', endOfDay);
      }

      if (filters?.staff_id) {
        query = query.eq('assigned_staff_id', filters.staff_id);
      }

      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id);
      }

      if (filters?.status) {
        query = query.eq('order_status', filters.status);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;
      setData((result || []) as Appointment[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refetch();

    // Auto-refresh every minute
    const interval = setInterval(refetch, 60 * 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Get appointments for a date range
 */
export function useAppointmentsByDateRange(startDate: string, endDate: string) {
  const [data, setData] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: result, error: queryError } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          service:products!service_id(*),
          staff:employees!assigned_staff_id(*)
        `)
        .eq('order_type', 'APPOINTMENT')
        .gte('scheduled_time', `${startDate}T00:00:00`)
        .lte('scheduled_time', `${endDate}T23:59:59`)
        .order('scheduled_time', { ascending: true });

      if (queryError) throw queryError;
      setData((result || []) as Appointment[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Update appointment (reschedule, change status)
 */
export function useUpdateAppointment() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({
    appointmentId,
    updates,
  }: {
    appointmentId: string;
    updates: Partial<Appointment>;
  }) => {
    setIsPending(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      notify.success({
        title: 'Appointment updated',
        description: 'The appointment has been updated successfully',
      });

      return data as Appointment;
    } catch (error) {
      notify.error({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Cancel appointment (admin)
 */
export function useAdminCancelAppointment() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async ({
    appointmentId,
    reason,
  }: {
    appointmentId: string;
    reason: string;
  }) => {
    setIsPending(true);
    try {
      // Update sale
      await supabase
        .from('sales')
        .update({
          order_status: 'CANCELLED',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      // Release slot
      await supabase
        .from('appointment_slots')
        .update({
          status: 'available',
          appointment_id: null,
        })
        .eq('appointment_id', appointmentId);

      notify.success({
        title: 'Appointment cancelled',
        description: 'The appointment has been cancelled',
      });
    } catch (error) {
      notify.error({
        title: 'Cancellation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Mark appointment as completed
 */
export function useCompleteAppointment() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (appointmentId: string) => {
    setIsPending(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .update({
          order_status: 'COMPLETED',
          payment_status: 'PAID',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      notify.success({
        title: 'Appointment completed',
        description: 'The appointment has been marked as completed',
      });

      return data;
    } catch (error) {
      notify.error({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Get appointment statistics
 */
export function useAppointmentStats(filters?: AppointmentsFilters) {
  const [data, setData] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('sales')
        .select('id, order_status, total, scheduled_time')
        .eq('order_type', 'APPOINTMENT');

      if (filters?.date) {
        const startOfDay = `${filters.date}T00:00:00`;
        const endOfDay = `${filters.date}T23:59:59`;
        query = query.gte('scheduled_time', startOfDay).lte('scheduled_time', endOfDay);
      }

      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      const appointments = result || [];
      const now = new Date();

      const stats = {
        total: appointments.length,
        upcoming: appointments.filter(
          (apt) => new Date(apt.scheduled_time) > now && apt.order_status !== 'CANCELLED'
        ).length,
        completed: appointments.filter((apt) => apt.order_status === 'COMPLETED').length,
        cancelled: appointments.filter((apt) => apt.order_status === 'CANCELLED').length,
        revenue: appointments
          .filter((apt) => apt.order_status === 'COMPLETED')
          .reduce((sum, apt) => sum + Number(apt.total), 0),
      };

      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
