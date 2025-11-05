import { useState } from 'react';
import { Stack, Button } from '@/shared/ui';
import type { DeliveryOrder, DeliveryZone } from '@/modules/fulfillment/delivery/types';
import { DeliverySidebar } from './DeliverySidebar';
import { MapView } from './MapView';

interface LiveMapTabProps {
  deliveries: DeliveryOrder[];
  zones: DeliveryZone[];
  loading: boolean;
}

export default function LiveMapTab({ deliveries, zones, loading }: LiveMapTabProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_transit'>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === 'pending') return d.status === 'pending';
    if (filter === 'in_transit')
      return ['in_transit', 'picked_up', 'assigned'].includes(d.status);
    return true;
  });

  return (
    <Stack gap="md" height="calc(100vh - 300px)" p="md">
      {/* Filters */}
      <Stack direction="row" gap="sm">
        <Button
          variant={filter === 'all' ? 'solid' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todos ({deliveries.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'solid' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pendientes ({deliveries.filter((d) => d.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'in_transit' ? 'solid' : 'outline'}
          onClick={() => setFilter('in_transit')}
          size="sm"
        >
          En Tránsito (
          {
            deliveries.filter((d) =>
              ['in_transit', 'picked_up', 'assigned'].includes(d.status)
            ).length
          }
          )
        </Button>
      </Stack>

      {/* Map + Sidebar */}
      <Stack direction="row" gap="md" flex={1} overflow="hidden">
        <DeliverySidebar
          deliveries={filteredDeliveries}
          selectedDelivery={selectedDelivery}
          onSelectDelivery={setSelectedDelivery}
          loading={loading}
        />
        <MapView
          deliveries={filteredDeliveries}
          zones={zones}
          selectedDelivery={selectedDelivery}
          onSelectDelivery={setSelectedDelivery}
        />
      </Stack>
    </Stack>
  );
}
