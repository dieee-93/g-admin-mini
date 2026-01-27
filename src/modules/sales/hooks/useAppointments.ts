/**
 * useAppointments Hook
 * TanStack Query hook for managing appointments
 * 
 * FEATURES:
 * - Automatic caching and background refetching
 * - Filter support (date, staff, location, status)
 * - Auto-refresh every minute
 * - CRUD mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { useAlerts } from '@/shared/alerts';
import type { Appointment } from '@/types/appointment';

export interface AppointmentsFilters {
  date?: string;
  staff_id?: string;
  location_id?: string;
  status?: string;
}

export const APPOINTMENTS_QUERY_KEY = (filters?: AppointmentsFilters) => 
  ['appointments', filters];

/**
 * Fetch appointments with filters
 */
async function fetchAppointments(filters?: AppointmentsFilters): Promise<Appointment[]> {
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

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Appointment[];
}

/**
 * Fetch appointments by date range
 */
async function fetchAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
  const { data, error } = await supabase
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

  if (error) throw error;
  return (data || []) as Appointment[];
}

/**
 * Hook: Get appointments with filters
 */
export function useAppointments(filters?: AppointmentsFilters) {
  const queryClient = useQueryClient();
  const { actions: alertActions } = useAlerts({
    context: 'sales',
    autoFilter: true,
  });

  const queryKey = APPOINTMENTS_QUERY_KEY(filters);

  // Fetch appointments with auto-refresh
  const { 
    data = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => fetchAppointments(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });

  // Handle errors in useEffect
  if (error) {
    logger.error('App', '❌ Error loading appointments:', error);
  }

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
      const { data, error } = await (supabase
        .from('sales') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      logger.info('App', '✅ Appointment updated');
    },
    onError: (err: any) => {
      logger.error('App', '❌ Error updating appointment:', err);
      alertActions.create({
        type: 'operational',
        context: 'sales',
        severity: 'medium',
        title: 'Failed to Update Appointment',
        description: err.message,
        autoExpire: 10,
        intelligence_level: 'simple',
      });
    }
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await (supabase
        .from('sales') as any)
        .update({ 
          order_status: 'CANCELLED',
          payment_status: 'REFUNDED'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      logger.info('App', '✅ Appointment cancelled');
    },
    onError: (err: any) => {
      logger.error('App', '❌ Error cancelling appointment:', err);
    }
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
    updateAppointment: (id: string, updates: Partial<Appointment>) => 
      updateMutation.mutateAsync({ id, updates }),
    cancelAppointment: cancelMutation.mutateAsync,
  };
}

/**
 * Hook: Get appointments by date range
 */
export function useAppointmentsByDateRange(startDate: string, endDate: string) {
  const queryKey = ['appointments', 'range', startDate, endDate];

  const { 
    data = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => fetchAppointmentsByDateRange(startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!(startDate && endDate),
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
