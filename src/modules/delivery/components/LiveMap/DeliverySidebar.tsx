import { Stack, Text, Spinner, Box } from '@/shared/ui';
import { TruckIcon } from '@heroicons/react/24/outline';
import type { DeliveryOrder } from '../../types';
import { DeliveryMiniCard } from './DeliveryMiniCard';

interface DeliverySidebarProps {
  deliveries: DeliveryOrder[];
  selectedDelivery: DeliveryOrder | null;
  onSelectDelivery: (delivery: DeliveryOrder) => void;
  loading: boolean;
}

export function DeliverySidebar({
  deliveries,
  selectedDelivery,
  onSelectDelivery,
  loading
}: DeliverySidebarProps) {
  if (loading) {
    return (
      <Box width="30%" minWidth="300px">
        <Stack gap="md" align="center" justify="center" height="100%">
          <Spinner size="lg" />
          <Text color="gray.600">Cargando deliveries...</Text>
        </Stack>
      </Box>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Box width="30%" minWidth="300px" textAlign="center" py="lg">
        <Stack gap="md" align="center">
          <TruckIcon style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
          <Text fontWeight="bold" fontSize="lg">
            No hay deliveries activos
          </Text>
          <Text color="gray.600">Los nuevos deliveries aparecerán aquí</Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box width="30%" minWidth="300px" height="100%" overflowY="auto">
      <Stack gap="sm">
        <Text fontWeight="bold" fontSize="lg" mb="sm">
          Deliveries Activos ({deliveries.length})
        </Text>
        {deliveries.map((delivery) => (
          <DeliveryMiniCard
            key={delivery.id}
            delivery={delivery}
            isSelected={selectedDelivery?.id === delivery.id}
            onClick={() => onSelectDelivery(delivery)}
          />
        ))}
      </Stack>
    </Box>
  );
}
