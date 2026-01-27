import { Stack, Table, Typography, Badge, Button, Box } from '@/shared/ui';
import { Icon } from '@/shared/ui/Icon';
import { EyeIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { Appointment } from '@/types/appointment';

interface AppointmentsTableProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onView?: (appointment: Appointment) => void;
  onCancel?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
}

export function AppointmentsTable({
  appointments,
  isLoading = false,
  onView,
  onCancel,
  onComplete,
}: AppointmentsTableProps) {
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

  if (isLoading) {
    return (
      <Stack gap="2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            p="4"
            bg="bg.muted"
            borderRadius="xl"
            height="60px"
          />
        ))}
      </Stack>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Box p="12" textAlign="center" borderRadius="xl" borderWidth="2px" borderStyle="dashed" borderColor="border.default" bg="bg.muted">
        <Typography variant="body" size="4xl" mb="3">📅</Typography>
        <Typography variant="body" size="md" color="text.muted">No appointments found</Typography>
      </Box>
    );
  }

  return (
    <Table.Root size="sm" variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Date & Time</Table.ColumnHeader>
          <Table.ColumnHeader>Customer</Table.ColumnHeader>
          <Table.ColumnHeader>Service</Table.ColumnHeader>
          <Table.ColumnHeader>Professional</Table.ColumnHeader>
          <Table.ColumnHeader>Status</Table.ColumnHeader>
          <Table.ColumnHeader>Total</Table.ColumnHeader>
          <Table.ColumnHeader>Actions</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {appointments.map((appointment) => {
          const customer = appointment.customer;
          const service = appointment.service;
          const staff = appointment.staff;

          return (
            <Table.Row key={appointment.id}>
              {/* Date & Time */}
              <Table.Cell>
                <Stack gap="0">
                  <Typography variant="body" size="sm" fontWeight="medium">
                    {format(new Date(appointment.scheduled_time), 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="body" size="xs" color="text.muted">
                    {format(new Date(appointment.scheduled_time), 'h:mm a')}
                  </Typography>
                </Stack>
              </Table.Cell>

              {/* Customer */}
              <Table.Cell>
                <Stack gap="0">
                  <Typography variant="body" size="sm" fontWeight="medium">
                    {customer?.name || 'Walk-in'}
                  </Typography>
                  {customer?.email && (
                    <Typography variant="body" size="xs" color="text.muted">
                      {customer.email}
                    </Typography>
                  )}
                </Stack>
              </Table.Cell>

              {/* Service */}
              <Table.Cell>
                <Stack gap="0">
                  <Typography variant="body" size="sm">{service?.name || 'Service'}</Typography>
                  {service?.duration_minutes && (
                    <Typography variant="body" size="xs" color="text.muted">
                      {service.duration_minutes} min
                    </Typography>
                  )}
                </Stack>
              </Table.Cell>

              {/* Professional */}
              <Table.Cell>
                <Typography variant="body" size="sm">
                  {staff
                    ? staff.name || `${staff.first_name} ${staff.last_name}`
                    : 'Any available'}
                </Typography>
              </Table.Cell>

              {/* Status */}
              <Table.Cell>
                <Badge colorPalette={getStatusColor(appointment.order_status)} size="sm">
                  {appointment.order_status}
                </Badge>
              </Table.Cell>

              {/* Total */}
              <Table.Cell>
                <Typography variant="body" size="sm" fontWeight="semibold" color="green.600">
                  ${appointment.total.toFixed(2)}
                </Typography>
              </Table.Cell>

              {/* Actions */}
              <Table.Cell>
                <Stack direction="row" gap="1" justify="end">
                  {onView && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(appointment)}
                      title="View details"
                    >
                      <Icon icon={EyeIcon} size="sm" />
                    </Button>
                  )}

                  {['confirmed', 'CONFIRMED'].includes(appointment.order_status) && onComplete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorPalette="green"
                      onClick={() => onComplete(appointment.id)}
                      title="Mark as completed"
                    >
                      <Icon icon={CheckIcon} size="sm" />
                    </Button>
                  )}

                  {!['cancelled', 'CANCELLED', 'completed', 'COMPLETED'].includes(appointment.order_status) &&
                    onCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => onCancel(appointment.id)}
                        title="Cancel appointment"
                      >
                        <Icon icon={XMarkIcon} size="sm" />
                      </Button>
                    )}
                </Stack>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
