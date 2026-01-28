// sales/components/DeliveryOrders/DeliveryOrderCard.tsx
// UPDATED: Using consolidated fulfillment-delivery module
import { useState } from 'react';
import { Stack, Button, Badge, CardWrapper, Text } from '@/shared/ui';
import { HookPoint } from '@/lib/modules';
import type { DeliveryOrder } from '@/modules/delivery/types/deliveryTypes';
import { AssignDriverModal, StatusUpdateMenu } from '@/modules/delivery/components';
import { deliveryApi, emitDriverAssigned, emitDeliveryStatusUpdated } from '@/modules/delivery/services';
import { useDrivers } from '@/modules/delivery/hooks';
import { logger } from '@/lib/logging';

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  onViewFullTracking: () => void;
  onViewDriver?: () => void;
  onViewCustomer?: () => void;
}

export function DeliveryOrderCard({
  order,
  onViewFullTracking,
  onViewDriver,
  onViewCustomer
}: DeliveryOrderCardProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { drivers, loading: loadingDrivers } = useDrivers();

  const handleAssignDriver = async (deliveryId: string, driverId: string) => {
    try {
      await deliveryApi.assignDriver(deliveryId, driverId);
      const driver = drivers.find((d) => d.driver_id === driverId);
      if (driver) {
        emitDriverAssigned(deliveryId, driverId, driver.driver_name);
      }
    } catch (error) {
      logger.error('DeliveryOrderCard', 'Error assigning driver:', error);
      throw error;
    }
  };

  const handleStatusChange = async (deliveryId: string, newStatus: string) => {
    try {
      await deliveryApi.updateStatus(deliveryId, newStatus);
      emitDeliveryStatusUpdated(deliveryId, order.status, newStatus);
    } catch (error) {
      logger.error('DeliveryOrderCard', 'Error updating status:', error);
      throw error;
    }
  };

  return (
    <>
      <CardWrapper p="md" borderWidth="1px" borderColor="gray.200">
        <Stack gap="md">
          {/* Header: Order number + Status */}
          <Stack direction="row" justify="space-between" align="center" flexWrap="wrap">
            <Text fontSize="lg" fontWeight="semibold">
              Order #{order.order_id.substring(0, 8)}
            </Text>
            <DeliveryStatusBadge status={order.status} />
          </Stack>

        {/* Customer & Address */}
        <Stack gap="xs">
          <Text fontSize="sm" fontWeight="medium">{order.customer_name}</Text>
          <Text fontSize="sm" color="gray.600">{order.delivery_address}</Text>
        </Stack>

        {/* Driver Info */}
        {order.driver_id ? (
          <Stack direction="row" gap="sm" align="center">
            <Text fontSize="sm" color="gray.700">
              🚚 Repartidor: <strong>{order.driver_name}</strong>
            </Text>
          </Stack>
        ) : (
          <Stack direction="row" gap="sm" align="center" p="sm" bg="orange.50" borderRadius="md">
            <Text fontSize="sm" color="orange.700">
              ⚠️ Sin repartidor asignado
            </Text>
          </Stack>
        )}

        {/* Order Summary */}
        <Stack gap="xs" p="sm" bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="medium">Items ({order.items.length}):</Text>
          {order.items.slice(0, 3).map((item) => (
            <Text key={item.id} fontSize="xs" color="gray.600">
              • {item.quantity}x {item.product_name}
            </Text>
          ))}
          {order.items.length > 3 && (
            <Text fontSize="xs" color="gray.500">
              ... y {order.items.length - 3} más
            </Text>
          )}
          <Text fontSize="sm" fontWeight="semibold" mt="xs">
            Total: ${order.total.toFixed(2)}
          </Text>
        </Stack>

        {/* ETA Display */}
        {order.estimated_arrival_time && (
          <Stack direction="row" align="center" gap="sm" p="sm" bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.700">
              🕐 Llegada estimada: {formatTime(order.estimated_arrival_time)}
            </Text>
          </Stack>
        )}

        {/* Footer: Actions */}
        <Stack direction="row" gap="sm" flexWrap="wrap">
          <Button
            variant="solid"
            size="sm"
            onClick={onViewFullTracking}
            colorPalette="blue"
          >
            📍 Ver Tracking
          </Button>

          {order.driver_id && onViewDriver && (
            <Button variant="outline" size="sm" onClick={onViewDriver}>
              👤 Ver Repartidor
            </Button>
          )}

          {onViewCustomer && (
            <Button variant="outline" size="sm" onClick={onViewCustomer}>
              👤 Ver Cliente
            </Button>
          )}

          {!order.driver_id && (
            <Button
              variant="outline"
              size="sm"
              colorPalette="orange"
              onClick={() => setShowAssignModal(true)}
              disabled={loadingDrivers}
            >
              Asignar Repartidor
            </Button>
          )}

          {/* Status Update Menu */}
          <StatusUpdateMenu delivery={order} onStatusChange={handleStatusChange} />

          {/* Hook point for cross-module order actions (e.g., Production "Send to Kitchen", Fulfillment actions) */}
          <HookPoint
            name="sales.order.actions"
            data={{
              order,
              onStatusChange: handleStatusChange
            }}
            direction="row"
            gap="sm"
            fallback={null}
          />
        </Stack>
      </Stack>
    </CardWrapper>

    {/* Assign Driver Modal */}
    <AssignDriverModal
      delivery={order}
      drivers={drivers}
      isOpen={showAssignModal}
      onClose={() => setShowAssignModal(false)}
      onAssign={handleAssignDriver}
    />
  </>
  );
}

// Helper component
function DeliveryStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; colorPalette: string }> = {
    pending: { label: 'Pendiente', colorPalette: 'gray' },
    assigned: { label: 'Asignado', colorPalette: 'blue' },
    picked_up: { label: 'Recogido', colorPalette: 'purple' },
    in_transit: { label: 'En Camino', colorPalette: 'orange' },
    arrived: { label: 'Llegó', colorPalette: 'yellow' },
    delivered: { label: 'Entregado', colorPalette: 'green' },
    cancelled: { label: 'Cancelado', colorPalette: 'red' },
    failed: { label: 'Fallido', colorPalette: 'red' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge colorPalette={config.colorPalette} variant="solid">
      {config.label}
    </Badge>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}
