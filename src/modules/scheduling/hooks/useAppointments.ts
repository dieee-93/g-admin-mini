/**
 * USE APPOINTMENTS HOOK
 *
 * Hook for managing appointment operations.
 *
 * @version 1.0.0 - Phase 4
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilters,
  AppointmentStats
} from '../types/appointments';
import { appointmentApi } from '../services/appointmentApi';
import { logger } from '@/lib/logging';
import { useErrorHandler } from '@/lib/error-handling';

interface UseAppointmentsOptions {
  dateFrom?: string;
  dateTo?: string;
  filters?: AppointmentFilters;
  autoLoad?: boolean;
}

interface UseAppointmentsReturn {
  // Data
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  stats: AppointmentStats | null;

  // Actions
  createAppointment: (input: CreateAppointmentInput) => Promise<Appointment>;
  updateAppointment: (id: string, updates: UpdateAppointmentInput) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  completeAppointment: (id: string) => Promise<void>;
  markAsNoShow: (id: string) => Promise<void>;
  checkTimeSlotAvailability: (
    providerId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => Promise<boolean>;

  // Refresh
  refreshAppointments: () => Promise<void>;
  setFilters: (filters: AppointmentFilters) => void;
  setDateRange: (dateFrom: string, dateTo: string) => void;
}

/**
 * Hook para gestionar appointments
 */
export function useAppointments(
  options: UseAppointmentsOptions = {}
): UseAppointmentsReturn {
  const {
    dateFrom: initialDateFrom,
    dateTo: initialDateTo,
    filters: initialFilters,
    autoLoad = true
  } = options;

  const { handleError } = useErrorHandler();

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [filters, setFiltersState] = useState<AppointmentFilters | undefined>(
    initialFilters
  );

  /**
   * Load appointments
   */
  const loadAppointments = useCallback(async () => {
    if (!dateFrom || !dateTo) return;

    try {
      setLoading(true);
      setError(null);

      const data = await appointmentApi.getAppointments(dateFrom, dateTo, filters);
      setAppointments(data);

      logger.info('Appointments loaded', {
        count: data.length,
        dateRange: { dateFrom, dateTo }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
      setError(errorMessage);
      handleError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, filters, handleError]);

  /**
   * Auto-load on mount and when dependencies change
   */
  useEffect(() => {
    if (autoLoad && dateFrom && dateTo) {
      loadAppointments();
    }
  }, [autoLoad, loadAppointments, dateFrom, dateTo]);

  /**
   * Calculate statistics
   */
  const stats: AppointmentStats | null = appointments.length > 0
    ? {
        total_appointments: appointments.length,
        scheduled: appointments.filter(a => a.status === 'scheduled').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        no_show: appointments.filter(a => a.status === 'no_show').length,
        completion_rate: appointments.length > 0
          ? (appointments.filter(a => a.status === 'completed').length / appointments.length) * 100
          : 0,
        no_show_rate: appointments.length > 0
          ? (appointments.filter(a => a.status === 'no_show').length / appointments.length) * 100
          : 0
      }
    : null;

  /**
   * Create appointment
   */
  const createAppointment = useCallback(
    async (input: CreateAppointmentInput): Promise<Appointment> => {
      try {
        const newAppointment = await appointmentApi.createAppointment(input);

        // Add to local state
        setAppointments(prev => [...prev, newAppointment]);

        logger.info('Appointment created', { appointmentId: newAppointment.id });
        return newAppointment;
      } catch (err) {
        handleError(err as Error);
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Update appointment
   */
  const updateAppointment = useCallback(
    async (id: string, updates: UpdateAppointmentInput): Promise<void> => {
      try {
        const updated = await appointmentApi.updateAppointment(id, updates);

        // Update local state
        setAppointments(prev =>
          prev.map(a => (a.id === id ? updated : a))
        );

        logger.info('Appointment updated', { appointmentId: id });
      } catch (err) {
        handleError(err as Error);
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Cancel appointment
   */
  const cancelAppointment = useCallback(
    async (id: string, reason?: string): Promise<void> => {
      try {
        await appointmentApi.cancelAppointment(id, reason);

        // Update local state
        setAppointments(prev =>
          prev.map(a =>
            a.id === id
              ? { ...a, status: 'cancelled', cancellation_reason: reason }
              : a
          )
        );

        logger.info('Appointment cancelled', { appointmentId: id });
      } catch (err) {
        handleError(err as Error);
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Delete appointment
   */
  const deleteAppointment = useCallback(
    async (id: string): Promise<void> => {
      try {
        await appointmentApi.deleteAppointment(id);

        // Remove from local state
        setAppointments(prev => prev.filter(a => a.id !== id));

        logger.info('Appointment deleted', { appointmentId: id });
      } catch (err) {
        handleError(err as Error);
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Complete appointment
   */
  const completeAppointment = useCallback(
    async (id: string): Promise<void> => {
      try {
        await appointmentApi.completeAppointment(id);

        // Update local state
        setAppointments(prev =>
          prev.map(a => (a.id === id ? { ...a, status: 'completed' } : a))
        );

        logger.info('Appointment completed', { appointmentId: id });
      } catch (err) {
        handleError(err as Error);
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Mark as no-show
   */
  const markAsNoShow = useCallback(
    async (id: string): Promise<void> => {
      try {
        await appointmentApi.markAsNoShow(id);

        // Update local state
        setAppointments(prev =>
          prev.map(a => (a.id === id ? { ...a, status: 'no_show' } : a))
        );

        logger.info('Appointment marked as no-show', { appointmentId: id });
      } catch (err) {
        handleError(err as Error);
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Check time slot availability
   */
  const checkTimeSlotAvailability = useCallback(
    async (
      providerId: string,
      date: string,
      startTime: string,
      endTime: string
    ): Promise<boolean> => {
      try {
        return await appointmentApi.checkTimeSlotAvailability(
          providerId,
          date,
          startTime,
          endTime
        );
      } catch (err) {
        handleError(err as Error);
        return false;
      }
    },
    [handleError]
  );

  /**
   * Set filters
   */
  const setFilters = useCallback((newFilters: AppointmentFilters) => {
    setFiltersState(newFilters);
  }, []);

  /**
   * Set date range
   */
  const setDateRange = useCallback((from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  }, []);

  /**
   * Refresh appointments
   */
  const refreshAppointments = useCallback(async () => {
    await loadAppointments();
  }, [loadAppointments]);

  return {
    // Data
    appointments,
    loading,
    error,
    stats,

    // Actions
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    completeAppointment,
    markAsNoShow,
    checkTimeSlotAvailability,

    // Utilities
    refreshAppointments,
    setFilters,
    setDateRange
  };
}
