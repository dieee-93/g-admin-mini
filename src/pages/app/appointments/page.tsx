import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Stack, Text, Box, Grid, Button, CardWrapper, Badge, Icon } from '@/shared/ui';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useCustomerAppointments, useCancelAppointment } from '../booking/hooks/useBooking';
import { format } from 'date-fns';
import type { Appointment } from '@/types/appointment';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  // TODO: Get real customer ID from auth context
  const customerId = 'temp-customer-id';

  const { data: appointments, isLoading } = useCustomerAppointments(customerId);
  const cancelAppointment = useCancelAppointment();

  const handleCancel = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment.mutateAsync({
        appointment_id: appointmentId,
        reason: 'Customer requested cancellation',
      });
    }
  };

  const upcomingAppointments = appointments?.filter(
    (apt) => new Date(apt.scheduled_time) > new Date() && apt.order_status !== 'CANCELLED'
  );

  const pastAppointments = appointments?.filter(
    (apt) => new Date(apt.scheduled_time) <= new Date() || apt.order_status === 'CANCELLED'
  );

  if (isLoading) {
    return (
      <Container maxW="4xl" py="8">
        <Stack gap="4">
          {[1, 2, 3].map((i) => (
            <Box key={i} height="120px" bg="gray.100" borderRadius="md" />
          ))}
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py="8">
      <Stack gap="6">
        {/* Header */}
        <Stack direction="row" justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              My Appointments
            </Text>
            <Text color="text.muted">
              Manage your upcoming and past appointments
            </Text>
          </Box>
          <Button
            colorPalette="blue"
            leftIcon={<Icon icon={PlusIcon} size="sm" />}
            onClick={() => navigate('/app/booking')}
          >
            Book New
          </Button>
        </Stack>

        {/* Upcoming Appointments */}
        <Stack gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Upcoming Appointments
          </Text>

          {!upcomingAppointments || upcomingAppointments.length === 0 ? (
            <CardWrapper variant="outline">
              <CardWrapper.Body>
                <Stack gap="4" align="center" py="8">
                  <Text color="text.muted" textAlign="center">
                    No upcoming appointments
                  </Text>
                  <Button
                    colorPalette="blue"
                    onClick={() => navigate('/app/booking')}
                  >
                    Book Your First Appointment
                  </Button>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          ) : (
            <Stack gap="3">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancel}
                  isUpcoming
                />
              ))}
            </Stack>
          )}
        </Stack>

        {/* Past Appointments */}
        {pastAppointments && pastAppointments.length > 0 && (
          <Stack gap="4" pt="4">
            <Text fontSize="lg" fontWeight="semibold">
              Past Appointments
            </Text>

            <Stack gap="3">
              {pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={handleCancel}
                  isUpcoming={false}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

// Appointment Card Component
interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: string) => void;
  isUpcoming: boolean;
}

function AppointmentCard({ appointment, onCancel, isUpcoming }: AppointmentCardProps) {
  const service = appointment.service;
  const staff = appointment.staff;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'CANCELLED':
        return 'red';
      case 'COMPLETED':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <CardWrapper variant="elevated">
      <CardWrapper.Body>
        <Stack gap="4">
          {/* Header */}
          <Stack direction="row" justify="space-between" align="start">
            <Stack gap="1">
              <Text fontSize="lg" fontWeight="semibold">
                {service?.name || 'Service'}
              </Text>
              <Badge colorPalette={getStatusColor(appointment.order_status)}>
                {appointment.order_status}
              </Badge>
            </Stack>
            <Text fontSize="lg" fontWeight="bold" color="green.600">
              ${appointment.total.toFixed(2)}
            </Text>
          </Stack>

          {/* Info Grid */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
            {/* Date */}
            <Stack direction="row" gap="2" align="center">
              <Icon icon={CalendarIcon} size="sm" color="text.muted" />
              <Stack gap="0">
                <Text fontSize="sm" fontWeight="medium">
                  {format(new Date(appointment.scheduled_time), 'MMM d, yyyy')}
                </Text>
                <Text fontSize="xs" color="text.muted">
                  Date
                </Text>
              </Stack>
            </Stack>

            {/* Time */}
            <Stack direction="row" gap="2" align="center">
              <Icon icon={ClockIcon} size="sm" color="text.muted" />
              <Stack gap="0">
                <Text fontSize="sm" fontWeight="medium">
                  {format(new Date(appointment.scheduled_time), 'h:mm a')}
                </Text>
                <Text fontSize="xs" color="text.muted">
                  Time
                </Text>
              </Stack>
            </Stack>

            {/* Professional */}
            {staff && (
              <Stack direction="row" gap="2" align="center">
                <Icon icon={UserIcon} size="sm" color="text.muted" />
                <Stack gap="0">
                  <Text fontSize="sm" fontWeight="medium">
                    {staff.name || `${staff.first_name} ${staff.last_name}`}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    Professional
                  </Text>
                </Stack>
              </Stack>
            )}
          </Grid>

          {/* Actions */}
          {isUpcoming && appointment.order_status === 'CONFIRMED' && (
            <Stack direction="row" gap="2" justify="flex-end" pt="2">
              <Button
                variant="ghost"
                size="sm"
                colorPalette="red"
                onClick={() => onCancel(appointment.id)}
              >
                Cancel
              </Button>
              <Button variant="outline" size="sm" colorPalette="blue">
                Reschedule
              </Button>
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
