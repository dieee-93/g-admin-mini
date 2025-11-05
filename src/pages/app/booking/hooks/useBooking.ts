/**
 * Booking Hooks
 * Custom hooks for appointment booking functionality
 * Following project patterns (NO React Query)
 */

import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../services/bookingApi';
import { notify } from '@/lib/notifications';
import type {
  AppointmentBookingData,
  AvailabilityQuery,
  CancelAppointmentPayload,
  RescheduleAppointmentPayload,
} from '@/types/appointment';

// ============================================================================
// Services Hooks
// ============================================================================

/**
 * Get available services for booking
 */
export function useServices() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingApi.getAvailableServices();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Get service details by ID
 */
export function useService(serviceId: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingApi.getServiceById(serviceId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      refetch();
    }
  }, [serviceId, refetch]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// Professionals Hooks
// ============================================================================

/**
 * Get professionals who can perform a specific service
 */
export function useProfessionalsForService(serviceId: string | undefined) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingApi.getProfessionalsForService(serviceId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceId) {
      refetch();
    }
  }, [serviceId, refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Get all professionals who accept appointments
 */
export function useProfessionals() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingApi.getAllProfessionals();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// Availability Hooks
// ============================================================================

/**
 * Get available slots for a service
 */
export function useAvailability(query: AvailabilityQuery | undefined) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!query || !query.service_id || !query.date) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingApi.getAvailableSlots(query);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query && query.service_id && query.date) {
      refetch();

      // Auto-refresh every 2 minutes
      const interval = setInterval(refetch, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [query, refetch]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// Booking Mutations
// ============================================================================

/**
 * Create a new appointment
 */
export function useCreateAppointment() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (bookingData: AppointmentBookingData) => {
    setIsPending(true);
    try {
      const result = await bookingApi.createAppointment(bookingData);

      notify.success({
        title: 'Appointment booked!',
        description: 'Your appointment has been confirmed',
      });

      return result;
    } catch (error: any) {
      notify.error({
        title: 'Booking failed',
        description: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Cancel an appointment
 */
export function useCancelAppointment() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (payload: CancelAppointmentPayload) => {
    setIsPending(true);
    try {
      await bookingApi.cancelAppointment(payload);

      notify.success({
        title: 'Appointment cancelled',
        description: 'Your appointment has been cancelled successfully',
      });
    } catch (error: any) {
      notify.error({
        title: 'Cancellation failed',
        description: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

/**
 * Reschedule an appointment
 */
export function useRescheduleAppointment() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (payload: RescheduleAppointmentPayload) => {
    setIsPending(true);
    try {
      await bookingApi.rescheduleAppointment(payload);

      notify.success({
        title: 'Appointment rescheduled',
        description: 'Your appointment has been rescheduled successfully',
      });
    } catch (error: any) {
      notify.error({
        title: 'Rescheduling failed',
        description: error.message,
      });
      throw error;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

// ============================================================================
// Customer Appointments Hooks
// ============================================================================

/**
 * Get customer's appointments
 */
export function useCustomerAppointments(customerId: string | undefined) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingApi.getCustomerAppointments(customerId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      refetch();
    }
  }, [customerId, refetch]);

  return { data, isLoading, error, refetch };
}

/**
 * Get appointment details
 */
export function useAppointment(appointmentId: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!appointmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await bookingApi.getAppointmentById(appointmentId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (appointmentId) {
      refetch();
    }
  }, [appointmentId, refetch]);

  return { data, isLoading, error, refetch };
}
