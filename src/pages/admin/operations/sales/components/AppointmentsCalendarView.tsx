import { useMemo } from 'react';
import { Stack, Typography, Box, Grid, CardWrapper, Badge } from '@/shared/ui';
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
    <Box height="600px" overflowY="auto" borderWidth="1px" borderColor="border.default" borderRadius="xl">
      <Grid templateColumns="80px 1fr" position="relative">
        {timeSlots.map(({ hour, minute, time }) => {
          const aptsAtTime = appointmentsByTime[time] || [];

          return (
            <Grid key={time} templateColumns="subgrid" gridColumn="1 / -1">
              {/* Time label */}
              <Box
                borderTopWidth="1px"
                borderColor="border.default"
                py="2"
                px="2"
                bg="bg.muted"
                position="sticky"
                left="0"
                zIndex="1"
              >
                {minute === 0 && (
                  <Typography variant="body" size="xs" fontWeight="medium" color="text.muted">
                    {hour}:00
                  </Typography>
                )}
              </Box>

              {/* Appointments slot */}
              <Box
                borderTopWidth="1px"
                borderColor="border.default"
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
                      borderLeftWidth="3px"
                      borderColor={`${getStatusColor(appointment.order_status)}.500`}
                      mb="1"
                      cursor="pointer"
                      onClick={() => onAppointmentClick?.(appointment)}
                      _hover={{ shadow: 'sm', bg: 'bg.muted' }}
                    >
                      <CardWrapper.Body p="2">
                        <Stack gap="1">
                          {/* Customer + Service */}
                          <Stack direction="row" justify="space-between" align="start" gap="2">
                            <Stack gap="0" flex="1" minW="0">
                              <Typography variant="body" size="xs" fontWeight="semibold" truncate>
                                {customer?.name || 'Walk-in'}
                              </Typography>
                              <Typography variant="body" size="xs" color="text.muted" truncate>
                                {service?.name}
                              </Typography>
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
                              <Typography variant="body" size="xs" color="text.muted" truncate>
                                {staff.name || `${staff.first_name} ${staff.last_name}`}
                              </Typography>
                            )}
                            {service?.duration_minutes && (
                              <Typography variant="body" size="xs" color="text.muted" fontWeight="medium">
                                {service.duration_minutes}m
                              </Typography>
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
