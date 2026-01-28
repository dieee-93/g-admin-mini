import { Stack, Badge, CardWrapper, Text, Button, Box } from '@/shared/ui';
import { UserIcon, TruckIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { DriverPerformance } from '../../types';

interface DriverCardProps {
  driver: DriverPerformance;
}

export function DriverCard({ driver }: DriverCardProps) {
  const isAvailable = driver.is_available && !driver.current_delivery_id;
  const isBusy = !!driver.current_delivery_id;

  const statusColor = isAvailable ? 'green' : isBusy ? 'red' : 'gray';
  const statusText = isAvailable ? 'Disponible' : isBusy ? 'Ocupado' : 'Offline';
  const statusIcon = isAvailable ? '🟢' : isBusy ? '🔴' : '⚪';

  return (
    <CardWrapper>
      <Stack gap="md">
        {/* Header with Avatar and Status */}
        <Stack direction="row" gap="md" align="center">
          <Box
            width="48px"
            height="48px"
            borderRadius="full"
            bg="blue.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <UserIcon style={{ width: '24px', height: '24px', color: '#3182ce' }} />
          </Box>
          <Stack gap="xs" flex={1}>
            <Text fontWeight="bold" fontSize="md">
              {driver.driver_name}
            </Text>
            <Badge colorPalette={statusColor} width="fit-content">
              {statusIcon} {statusText}
            </Badge>
          </Stack>
        </Stack>

        {/* Stats */}
        <Stack gap="sm" fontSize="sm">
          {/* Rating */}
          <Stack direction="row" align="center" gap="xs">
            <StarIcon style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
            <Text fontWeight="medium">
              {driver.average_rating?.toFixed(1) || 'N/A'} ⭐
            </Text>
            <Text color="gray.600">({driver.total_ratings || 0} reviews)</Text>
          </Stack>

          {/* Total Deliveries */}
          <Stack direction="row" align="center" gap="xs">
            <CheckCircleIcon style={{ width: '16px', height: '16px', color: '#10b981' }} />
            <Text>
              <strong>{driver.total_deliveries || 0}</strong> deliveries completados
            </Text>
          </Stack>

          {/* Completed Today */}
          <Stack direction="row" align="center" gap="xs">
            <TruckIcon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            <Text>
              <strong>{driver.completed_today || 0}</strong> entregas hoy
            </Text>
          </Stack>

          {/* Vehicle Type */}
          {driver.vehicle_type && (
            <Stack direction="row" align="center" gap="xs">
              <Text color="gray.600">Vehículo:</Text>
              <Text fontWeight="medium">{driver.vehicle_type}</Text>
            </Stack>
          )}

          {/* Average Delivery Time */}
          {driver.average_delivery_time_minutes && (
            <Stack direction="row" align="center" gap="xs">
              <ClockIcon style={{ width: '16px', height: '16px' }} />
              <Text>
                Promedio: <strong>{driver.average_delivery_time_minutes} min</strong>
              </Text>
            </Stack>
          )}

          {/* Current Delivery Link */}
          {isBusy && driver.current_delivery_id && (
            <Badge colorPalette="orange" width="fit-content">
              📦 En delivery activo
            </Badge>
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" gap="sm">
          <Button variant="outline" size="sm" flex={1}>
            Ver Perfil
          </Button>
          <Button
            variant="solid"
            size="sm"
            flex={1}
            disabled={!isAvailable}
            colorPalette={isAvailable ? 'blue' : 'gray'}
          >
            Asignar Delivery
          </Button>
        </Stack>
      </Stack>
    </CardWrapper>
  );
}
