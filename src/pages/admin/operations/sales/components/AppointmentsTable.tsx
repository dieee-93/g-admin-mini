import { Stack, Table, Text } from '@chakra-ui/react';
import { Badge, Button } from '@/shared/ui';
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
          <Stack
            key={i}
            direction="row"
            p="4"
            bg="gray.50"
            borderRadius="md"
            height="60px"
          />
        ))}
      </Stack>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Stack align="center" justify="center" py="12">
        <Text color="text.muted">No appointments found</Text>
      </Stack>
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
          <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
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
                  <Text fontSize="sm" fontWeight="medium">
                    {format(new Date(appointment.scheduled_time), 'MMM d, yyyy')}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {format(new Date(appointment.scheduled_time), 'h:mm a')}
                  </Text>
                </Stack>
              </Table.Cell>

              {/* Customer */}
              <Table.Cell>
                <Stack gap="0">
                  <Text fontSize="sm" fontWeight="medium">
                    {customer?.name || 'Walk-in'}
                  </Text>
                  {customer?.email && (
                    <Text fontSize="xs" color="text.muted">
                      {customer.email}
                    </Text>
                  )}
                </Stack>
              </Table.Cell>

              {/* Service */}
              <Table.Cell>
                <Stack gap="0">
                  <Text fontSize="sm">{service?.name || 'Service'}</Text>
                  {service?.duration_minutes && (
                    <Text fontSize="xs" color="text.muted">
                      {service.duration_minutes} min
                    </Text>
                  )}
                </Stack>
              </Table.Cell>

              {/* Professional */}
              <Table.Cell>
                <Text fontSize="sm">
                  {staff
                    ? staff.name || `${staff.first_name} ${staff.last_name}`
                    : 'Any available'}
                </Text>
              </Table.Cell>

              {/* Status */}
              <Table.Cell>
                <Badge colorPalette={getStatusColor(appointment.order_status)} size="sm">
                  {appointment.order_status}
                </Badge>
              </Table.Cell>

              {/* Total */}
              <Table.Cell>
                <Text fontSize="sm" fontWeight="semibold" color="green.600">
                  ${appointment.total.toFixed(2)}
                </Text>
              </Table.Cell>

              {/* Actions */}
              <Table.Cell textAlign="right">
                <Stack direction="row" gap="1" justify="flex-end">
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

                  {appointment.order_status === 'CONFIRMED' && onComplete && (
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

                  {appointment.order_status !== 'CANCELLED' &&
                    appointment.order_status !== 'COMPLETED' &&
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
