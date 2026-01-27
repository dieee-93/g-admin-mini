import { useState } from 'react';
import { Stack, Typography, Box, Button, Flex } from '@/shared/ui';
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
import { useAppointments } from '@/modules/sales/hooks';
import { format, addDays, startOfDay } from 'date-fns';
import type { Appointment } from '@/types/appointment';

type ViewMode = 'calendar' | 'list';

export function AppointmentsTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Use module hook with TanStack Query - replaces direct Supabase access
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { 
    data: appointments = [], 
    isLoading, 
    updateAppointment,
    cancelAppointment 
  } = useAppointments({ date: dateStr });

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
        await cancelAppointment(appointmentId);
      } catch (error) {
        // Error already handled by hook with alerts
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const handleComplete = async (appointmentId: string) => {
    if (confirm('Mark this appointment as completed?')) {
      try {
        await updateAppointment(appointmentId, { order_status: 'COMPLETED' } as any);
      } catch (error) {
        // Error already handled by hook with alerts
        console.error('Error completing appointment:', error);
      }
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // TODO: Open appointment details modal
    console.log('Appointment clicked:', appointment);
  };

  return (
    <Stack gap="6">
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
        <Box>
          <Typography variant="heading" size="xl" fontWeight="bold" mb="1">
            Appointments
          </Typography>
          <Typography variant="body" size="md" color="text.muted">
            Manage customer appointments and bookings
          </Typography>
        </Box>
        <Button colorPalette="blue" size="lg">
          <Icon icon={PlusIcon} size="sm" />
          New Appointment
        </Button>
      </Flex>

      {/* Controls */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
        {/* Date Navigation */}
        <Flex gap="2" align="center">
          <Button size="sm" variant="ghost" onClick={handlePrevDay}>
            <Icon icon={ChevronLeftIcon} size="sm" />
            Prev
          </Button>

          <Button size="sm" variant="outline" onClick={handleToday}>
            Today
          </Button>

          <Typography variant="body" size="lg" fontWeight="semibold" minW="200px" textAlign="center">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Typography>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleNextDay}
          >
            Next
            <Icon icon={ChevronRightIcon} size="sm" />
          </Button>
        </Flex>

        {/* View Mode Toggle */}
        <Flex gap="1">
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
        </Flex>
      </Flex>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <AppointmentsCalendarView
          appointments={appointments}
          selectedDate={selectedDate}
          onAppointmentClick={handleAppointmentClick}
        />
      ) : (
        <AppointmentsTable
          appointments={appointments}
          isLoading={isLoading}
          onView={handleAppointmentClick}
          onCancel={handleCancel}
          onComplete={handleComplete}
        />
      )}
    </Stack>
  );
}
