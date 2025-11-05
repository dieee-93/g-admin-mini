/**
 * Completed Deliveries Tab
 *
 * Shows deliveries completed today (read-only view)
 * Useful for analytics and performance review
 *
 * Phase 1 - Part 3: Delivery Sub-Module (Task 13)
 */

import { Stack, Text, Alert, StatRoot, StatLabel, StatValueText } from '@/shared/ui';
import { logger } from '@/lib/logging';
import { DeliveryQueue } from '@/modules/fulfillment/delivery/components';
import type { DeliveryOrder } from '@/modules/fulfillment/delivery/types';

interface CompletedDeliveriesTabProps {
  deliveries: DeliveryOrder[];
  loading: boolean;
  onRefresh: () => void;
}

export default function CompletedDeliveriesTab({
  deliveries,
  loading,
  onRefresh
}: CompletedDeliveriesTabProps) {
  logger.debug('CompletedDeliveriesTab', 'Rendering', { deliveriesCount: deliveries.length });

  if (loading) {
    return (
      <Stack gap="md" p="md">
        <Text>Cargando deliveries completados...</Text>
      </Stack>
    );
  }

  // Calculate stats
  const totalDeliveries = deliveries.length;
  const avgDeliveryTime = deliveries.length > 0
    ? Math.round(
        deliveries.reduce((sum, d) => {
          if (d.created_at && d.updated_at) {
            const duration = (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / 1000 / 60;
            return sum + duration;
          }
          return sum;
        }, 0) / deliveries.length
      )
    : 0;

  if (totalDeliveries === 0) {
    return (
      <Stack gap="md" p="md">
        <Alert status="info" title="Sin deliveries completados hoy">
          No se han completado deliveries el día de hoy.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold">
          Completados Hoy ({totalDeliveries})
        </Text>
      </Stack>

      {/* Summary Stats */}
      <Stack direction="row" gap="md" flexWrap="wrap">
        <StatRoot>
          <StatLabel>Total Completados</StatLabel>
          <StatValueText>{totalDeliveries}</StatValueText>
        </StatRoot>
        <StatRoot>
          <StatLabel>Tiempo Promedio</StatLabel>
          <StatValueText>{avgDeliveryTime} min</StatValueText>
        </StatRoot>
      </Stack>

      {/* Delivery Queue (read-only) */}
      <DeliveryQueue
        status={['completed']}
        title="Completados Hoy"
        onUpdate={onRefresh}
      />
    </Stack>
  );
}
