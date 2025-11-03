/**
 * Active Deliveries Tab
 *
 * Shows deliveries currently assigned or in progress
 * Includes live tracking map and delivery queue
 *
 * Phase 1 - Part 3: Delivery Sub-Module (Task 13)
 */

import { useState } from 'react';
import { Stack, Text, Alert, Box, Button } from '@/shared/ui';
import { MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
import { DeliveryQueue } from '@/modules/fulfillment/delivery/components';
import { LiveDeliveryTracker } from '@/modules/fulfillment/delivery/components';
import type {
  DeliveryOrder,
  DeliveryZone
} from '@/modules/fulfillment/delivery/types';

interface ActiveDeliveriesTabProps {
  deliveries: DeliveryOrder[];
  zones: DeliveryZone[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ActiveDeliveriesTab({
  deliveries,
  zones,
  loading,
  onRefresh
}: ActiveDeliveriesTabProps) {
  logger.debug('ActiveDeliveriesTab', 'Rendering', { deliveriesCount: deliveries.length });

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Filter deliveries with tracking data (assigned driver + has location)
  const trackableDeliveries = deliveries.filter(
    delivery => delivery.driver_id && delivery.current_location
  );

  if (loading) {
    return (
      <Stack gap="md" p="md">
        <Text>Cargando deliveries activos...</Text>
      </Stack>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Stack gap="md" p="md">
        <Alert status="info" title="No hay deliveries activos">
          No hay deliveries en curso en este momento.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      {/* View Mode Toggle */}
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Deliveries en Curso ({deliveries.length})
        </Text>

        <Stack direction="row" gap="sm">
          <Button
            variant={viewMode === 'map' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <MapIcon className="w-4 h-4" />
            Mapa
          </Button>
          <Button
            variant={viewMode === 'list' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListBulletIcon className="w-4 h-4" />
            Lista
          </Button>
        </Stack>
      </Stack>

      {/* Tracking Alert */}
      {trackableDeliveries.length < deliveries.length && (
        <Alert status="warning" title="Tracking limitado">
          {deliveries.length - trackableDeliveries.length} delivery(s) sin tracking activo.
          Algunos repartidores no han compartido su ubicación.
        </Alert>
      )}

      {/* Map View - Live Tracking */}
      {viewMode === 'map' && (
        <Box minH="500px">
          {trackableDeliveries.length > 0 ? (
            <LiveDeliveryTracker
              deliveries={trackableDeliveries}
              zones={zones}
            />
          ) : (
            <Alert status="info" title="Sin tracking disponible">
              No hay deliveries con tracking GPS activo en este momento.
              Asegúrate de que los repartidores hayan activado el tracking.
            </Alert>
          )}
        </Box>
      )}

      {/* List View - Delivery Queue */}
      {viewMode === 'list' && (
        <DeliveryQueue
          status={['assigned', 'in_progress']}
          title="Deliveries en Curso"
          onUpdate={onRefresh}
        />
      )}
    </Stack>
  );
}
