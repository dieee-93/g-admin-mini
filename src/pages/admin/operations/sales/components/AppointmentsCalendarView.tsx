import { useMemo } from 'react';
import { Stack, Text, Box, Grid } from '@chakra-ui/react';
import { CardWrapper, Badge } from '@/shared/ui';
import { format } from 'date-fns';
import type { Appointment } from '@/types/appointment';

interface AppointmentsCalendarViewProps {
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function AppointmentsCalendarView({
  appointments,
  onAppointmentClick,
}: AppointmentsCalendarViewProps) {
  // TODO: Use selectedDate prop to highlight the selected day in the calendar view
  // Currently not implemented - calendar shows all time slots without date-specific highlighting
  // Generate time slots from 8am to 8pm (15-min intervals)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push({
          hour,
          minute: min,
          time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        });
      }
    }
    return slots;
  }, []);

  // Group appointments by time
  const appointmentsByTime = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};

    appointments.forEach((apt) => {
      const time = format(new Date(apt.scheduled_time), 'HH:mm');
      if (!grouped[time]) {
        grouped[time] = [];
      }
      grouped[time].push(apt);
    });

    return grouped;
  }, [appointments]);

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
      case 'IN_PROGRESS':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <Box height="600px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md">
      <Grid templateColumns="80px 1fr" position="relative">
        {timeSlots.map(({ hour, minute, time }) => {
          const aptsAtTime = appointmentsByTime[time] || [];

          return (
            <Grid key={time} templateColumns="subgrid" gridColumn="1 / -1">
              {/* Time label */}
              <Box
                borderTop="1px solid"
                borderColor="gray.200"
                py="2"
                px="2"
                bg="gray.50"
                position="sticky"
                left="0"
                zIndex="1"
              >
                {minute === 0 && (
                  <Text fontSize="xs" fontWeight="medium" color="text.muted">
                    {hour}:00
                  </Text>
                )}
              </Box>

              {/* Appointments slot */}
              <Box
                borderTop="1px solid"
                borderColor="gray.200"
                minH="40px"
                p="1"
                position="relative"
              >
                {aptsAtTime.map((appointment) => {
                  const customer = appointment.customer;
                  const service = appointment.service;
                  const staff = appointment.staff;

                  return (
                    <CardWrapper
                      key={appointment.id}
                      variant="subtle"
                      size="sm"
                      borderLeft="3px solid"
                      borderColor={`${getStatusColor(appointment.order_status)}.500`}
                      mb="1"
                      cursor="pointer"
                      onClick={() => onAppointmentClick?.(appointment)}
                      _hover={{ shadow: 'sm', bg: 'gray.50' }}
                    >
                      <CardWrapper.Body p="2">
                        <Stack gap="1">
                          {/* Customer + Service */}
                          <Stack direction="row" justify="space-between" align="start" gap="2">
                            <Stack gap="0" flex="1" minW="0">
                              <Text fontSize="xs" fontWeight="semibold" truncate>
                                {customer?.name || 'Walk-in'}
                              </Text>
                              <Text fontSize="xs" color="text.muted" truncate>
                                {service?.name}
                              </Text>
                            </Stack>
                            <Badge
                              colorPalette={getStatusColor(appointment.order_status)}
                              size="xs"
                            >
                              {appointment.order_status[0]}
                            </Badge>
                          </Stack>

                          {/* Professional + Time */}
                          <Stack direction="row" justify="space-between" align="center">
                            {staff && (
                              <Text fontSize="xs" color="text.muted" truncate>
                                {staff.name || `${staff.first_name} ${staff.last_name}`}
                              </Text>
                            )}
                            {service?.duration_minutes && (
                              <Text fontSize="xs" color="text.muted" fontWeight="medium">
                                {service.duration_minutes}m
                              </Text>
                            )}
                          </Stack>
                        </Stack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  );
                })}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
