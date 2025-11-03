import { useState, useEffect, useCallback } from 'react';
import { Stack, Text, Box, Grid } from '@chakra-ui/react';
import { Button, CardWrapper, /* Badge, Alert */ } from '@/shared/ui';
import { Icon } from '@/shared/ui/Icon';
import {
  CalendarIcon,
  ListBulletIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { AppointmentsCalendarView } from './AppointmentsCalendarView';
import { AppointmentsTable } from './AppointmentsTable';
// REMOVED: React Query hooks (project uses Zustand + services pattern)
// import { useAdminAppointments, useAppointmentStats, useAdminCancelAppointment, useCompleteAppointment } from '../hooks/useAdminAppointments';
import { format, addDays, startOfDay } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';
import type { Appointment } from '@/types/appointment';
import { logger } from '@/lib/logging';

type ViewMode = 'calendar' | 'list';

export function AppointmentsTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startOfDay = `${dateStr}T00:00:00`;
      const endOfDay = `${dateStr}T23:59:59`;

      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          service:products!service_id(*),
          staff:employees!assigned_staff_id(*)
        `)
        .eq('order_type', 'APPOINTMENT')
        .gte('scheduled_time', startOfDay)
        .lte('scheduled_time', endOfDay)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setAppointments((data || []) as Appointment[]);
    } catch (error) {
      logger.error('App', 'Error loading appointments:', error);
      notify.error({ title: 'Error loading appointments' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Load appointments when date changes
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(startOfDay(new Date()));
  };

  const handleCancel = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const { error } = await supabase
          .from('sales')
          .update({ order_status: 'CANCELLED', notes: 'Cancelled by admin' })
          .eq('id', appointmentId);

        if (error) throw error;
        notify.success({ title: 'Appointment cancelled' });
        loadAppointments(); // Reload
      } catch (error) {
        logger.error('App', 'Error cancelling appointment:', error);
        notify.error({ title: 'Error cancelling appointment' });
      }
    }
  };

  const handleComplete = async (appointmentId: string) => {
    if (confirm('Mark this appointment as completed?')) {
      try {
        const { error } = await supabase
          .from('sales')
          .update({ order_status: 'COMPLETED' })
          .eq('id', appointmentId);

        if (error) throw error;
        notify.success({ title: 'Appointment completed' });
        loadAppointments(); // Reload
      } catch (error) {
        logger.error('App', 'Error completing appointment:', error);
        notify.error({ title: 'Error completing appointment' });
      }
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // TODO: Open appointment details modal
    logger.debug('AppointmentsTab', 'Appointment clicked:', appointment);
  };

  return (
    <Stack gap="6">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Appointments
          </Text>
          <Text color="text.muted">
            Manage customer appointments and bookings
          </Text>
        </Box>
        <Button
          colorPalette="blue"
        >
          <Icon icon={PlusIcon} size="sm" />
          New Appointment
        </Button>
      </Stack>

      {/* Stats Cards - TODO: Re-implement with Zustand store pattern */}
      {/* {stats && (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="4">
          <CardWrapper variant="subtle">
            <CardWrapper.Body>
              <Stack gap="1">
                <Text fontSize="xs" color="text.muted" fontWeight="medium">
                  TOTAL TODAY
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.total}
                </Text>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="subtle">
            <CardWrapper.Body>
              <Stack gap="1">
                <Text fontSize="xs" color="text.muted" fontWeight="medium">
                  UPCOMING
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {stats.upcoming}
                </Text>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="subtle">
            <CardWrapper.Body>
              <Stack gap="1">
                <Text fontSize="xs" color="text.muted" fontWeight="medium">
                  COMPLETED
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {stats.completed}
                </Text>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="subtle">
            <CardWrapper.Body>
              <Stack gap="1">
                <Text fontSize="xs" color="text.muted" fontWeight="medium">
                  REVENUE
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${stats.revenue.toFixed(2)}
                </Text>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </Grid>
      )} */}

      {/* Controls */}
      <Stack direction="row" justify="space-between" align="center">
        {/* Date Navigation */}
        <Stack direction="row" gap="2" align="center">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePrevDay}
          >
            <Icon icon={ChevronLeftIcon} size="sm" />
            Prev
          </Button>

          <Button size="sm" variant="outline" onClick={handleToday}>
            Today
          </Button>

          <Text fontSize="lg" fontWeight="semibold" minW="200px" textAlign="center">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Text>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleNextDay}
            rightIcon={<Icon icon={ChevronRightIcon} size="sm" />}
          >
            Next
          </Button>
        </Stack>

        {/* View Mode Toggle */}
        <Stack direction="row" gap="1">
          <Button
            size="sm"
            variant={viewMode === 'calendar' ? 'solid' : 'ghost'}
            onClick={() => setViewMode('calendar')}
          >
            <Icon icon={CalendarIcon} size="sm" />
            Calendar
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'solid' : 'ghost'}
            onClick={() => setViewMode('list')}
          >
            <Icon icon={ListBulletIcon} size="sm" />
            List
          </Button>
        </Stack>
      </Stack>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <AppointmentsCalendarView
          appointments={appointments || []}
          selectedDate={selectedDate}
          onAppointmentClick={handleAppointmentClick}
        />
      ) : (
        <AppointmentsTable
          appointments={appointments || []}
          isLoading={isLoading}
          onView={handleAppointmentClick}
          onCancel={handleCancel}
          onComplete={handleComplete}
        />
      )}
    </Stack>
  );
}
