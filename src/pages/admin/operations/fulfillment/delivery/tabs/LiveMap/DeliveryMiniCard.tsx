import { Stack, Badge, CardWrapper, Text } from '@/shared/ui';
import { TruckIcon, UserIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { DeliveryOrder } from '@/modules/delivery/types';

interface DeliveryMiniCardProps {
  delivery: DeliveryOrder;
  isSelected: boolean;
  onClick: () => void;
}

const statusColorMap: Record<string, string> = {
  pending: 'gray',
  assigned: 'blue',
  picked_up: 'purple',
  in_transit: 'orange',
  arrived: 'yellow',
  delivered: 'green',
  cancelled: 'red',
  failed: 'red'
};

export function DeliveryMiniCard({ delivery, isSelected, onClick }: DeliveryMiniCardProps) {
  return (
    <CardWrapper
      onClick={onClick}
      cursor="pointer"
      borderWidth="2px"
      borderColor={isSelected ? 'blue.500' : 'transparent'}
      bg={isSelected ? 'blue.50' : 'white'}
      _hover={{ borderColor: 'blue.300', shadow: 'md' }}
      transition="all 0.2s"
    >
      <Stack gap="sm">
        {/* Header */}
        <Stack direction="row" justify="space-between" align="center">
          <Text fontWeight="bold" fontSize="md">
            #{delivery.order_number}
          </Text>
          <Badge colorPalette={statusColorMap[delivery.status]}>
            {delivery.status}
          </Badge>
        </Stack>

        {/* Customer */}
        <Stack direction="row" align="center" gap="xs">
          <UserIcon style={{ width: '16px', height: '16px' }} />
          <Text fontSize="sm" fontWeight="medium">
            {delivery.customer_name}
          </Text>
        </Stack>

        {/* Driver (if assigned) */}
        {delivery.driver_name && (
          <Stack direction="row" align="center" gap="xs">
            <TruckIcon style={{ width: '16px', height: '16px' }} />
            <Text fontSize="sm" color="gray.600">
              {delivery.driver_name}
            </Text>
          </Stack>
        )}

        {/* ETA */}
        {delivery.estimated_delivery_time && (
          <Stack direction="row" align="center" gap="xs">
            <ClockIcon style={{ width: '16px', height: '16px' }} />
            <Text fontSize="sm" color="gray.600">
              ETA: {new Date(delivery.estimated_delivery_time).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Stack>
        )}

        {/* Address */}
        <Stack direction="row" align="flex-start" gap="xs">
          <MapPinIcon style={{ width: '16px', height: '16px', marginTop: '2px' }} />
          <Text fontSize="sm" color="gray.600" noOfLines={2}>
            {delivery.delivery_address}
          </Text>
        </Stack>
      </Stack>
    </CardWrapper>
  );
}
