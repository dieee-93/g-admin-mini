/**
 * Pending Deliveries Tab
 *
 * Shows deliveries awaiting driver assignment
 * Allows manual assignment via AssignDriverModal
 *
 * Phase 1 - Part 3: Delivery Sub-Module (Task 13)
 */

import { Stack, Text, Alert } from '@/shared/ui';
import { logger } from '@/lib/logging';
import { DeliveryQueue } from '@/modules/fulfillment/delivery/components';
import type { DeliveryOrder } from '@/modules/fulfillment/delivery/types';

interface PendingDeliveriesTabProps {
  deliveries: DeliveryOrder[];
  loading: boolean;
  onRefresh: () => void;
}

export default function PendingDeliveriesTab({
  deliveries,
  loading,
  onRefresh
}: PendingDeliveriesTabProps) {
  logger.debug('PendingDeliveriesTab', 'Rendering', { deliveriesCount: deliveries.length });

  if (loading) {
    return (
      <Stack gap="md" p="md">
        <Text>Cargando deliveries pendientes...</Text>
      </Stack>
    );
  }

  if (deliveries.length === 0) {
    return (
      <Stack gap="md" p="md">
        <Alert status="success" title="¡Todo asignado!">
          No hay deliveries pendientes de asignación en este momento.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Pendientes de Asignación ({deliveries.length})
        </Text>
      </Stack>

      {/* Alert for pending deliveries */}
      {deliveries.length > 5 && (
        <Alert status="warning" title="Alto volumen de pendientes">
          Hay {deliveries.length} deliveries esperando asignación de repartidor.
          Considera activar la asignación automática en la configuración.
        </Alert>
      )}

      {/* Delivery Queue with assignment actions */}
      <DeliveryQueue
        status={['pending']}
        title="Pendientes de Asignación"
        onUpdate={onRefresh}
      />
    </Stack>
  );
}
