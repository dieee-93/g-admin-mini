/**
 * Delivery Queue - Wraps FulfillmentQueue with delivery-specific actions
 *
 * Phase 1 - Task 11: Driver assignment integration
 */

import { useState } from 'react';
import { Button, Stack, Badge, Text } from '@/shared/ui';
import { TruckIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FulfillmentQueue } from '../../fulfillment/components/FulfillmentQueue';
import { AssignDriverModal } from './AssignDriverModal';
import type { DeliveryOrder, DeliveryMetadata } from '../types';
import type { FulfillmentQueueItem } from '../../fulfillment/services/fulfillmentService';
import { logger } from '@/lib/logging';

interface DeliveryQueueProps {
  /**
   * Filter deliveries by status
   */
  status?: string[];

  /**
   * Custom title for the queue
   */
  title?: string;

  /**
   * Show only deliveries assigned to specific driver
   */
  driverId?: string;

  /**
   * Show only deliveries in specific zone
   * TODO: Implement zone filtering in FulfillmentQueue component
   */
  zoneId?: string;

  /**
   * Callback when queue updates
   */
  onUpdate?: () => void;
}

export function DeliveryQueue({
  status,
  title,
  driverId,
  // zoneId - TODO: Implement zone filtering in FulfillmentQueue component
  onUpdate
}: DeliveryQueueProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  /**
   * Transform FulfillmentQueueItem to DeliveryOrder
   */
  const transformToDeliveryOrder = (item: FulfillmentQueueItem): DeliveryOrder => {
    // Type assertion is safe because delivery items always have DeliveryMetadata
    const metadata = (item.metadata || {}) as DeliveryMetadata;

    return {
      ...item,
      type: 'delivery',
      delivery_address: metadata?.delivery_address || 'Sin dirección',
      delivery_coordinates: metadata?.delivery_coordinates || { lat: 0, lng: 0 },
      delivery_instructions: metadata?.delivery_instructions,
      driver_id: metadata?.driver_id,
      driver_name: metadata?.driver_name,
      zone_id: metadata?.zone_id,
      zone_name: metadata?.zone_name,
      route: metadata?.route,
      distance_km: metadata?.distance_km,
      delivery_type: metadata?.delivery_type || 'instant',
      current_location: metadata?.current_location
    };
  };

  /**
   * Handle assign driver button click
   */
  const handleAssignDriver = (item: FulfillmentQueueItem) => {
    logger.debug('DeliveryQueue', 'Opening assign driver modal', { queueId: item.id });
    const delivery = transformToDeliveryOrder(item);
    setSelectedDelivery(delivery);
    setIsAssignModalOpen(true);
  };

  /**
   * Handle driver assigned
   */
  const handleDriverAssigned = (driverId: string) => {
    logger.info('DeliveryQueue', 'Driver assigned', { driverId });
    setIsAssignModalOpen(false);
    setSelectedDelivery(null);

    // Refresh queue
    if (onUpdate) {
      onUpdate();
    }
  };

  /**
   * Custom actions for each queue item
   */
  const renderActions = (item: FulfillmentQueueItem) => {
    const delivery = transformToDeliveryOrder(item);
    const hasDriver = !!delivery.driver_id;

    return (
      <Stack direction="row" gap="sm" flexWrap="wrap">
        {/* Assign Driver button (if not assigned) */}
        {!hasDriver && item.status === 'pending' && (
          <Button
            size="sm"
            variant="outline"
            colorPalette="blue"
            onClick={() => handleAssignDriver(item)}
          >
            <TruckIcon style={{ width: '16px', height: '16px' }} />
            Asignar Repartidor
          </Button>
        )}

        {/* Driver info (if assigned) */}
        {hasDriver && (
          <Badge colorPalette="green" variant="subtle">
            <Stack direction="row" align="center" gap="xs">
              <TruckIcon style={{ width: '14px', height: '14px' }} />
              <Text fontSize="sm">{delivery.driver_name || 'Repartidor asignado'}</Text>
            </Stack>
          </Badge>
        )}

        {/* Zone info */}
        {delivery.zone_name && (
          <Badge colorPalette="purple" variant="subtle">
            <Stack direction="row" align="center" gap="xs">
              <MapPinIcon style={{ width: '14px', height: '14px' }} />
              <Text fontSize="sm">{delivery.zone_name}</Text>
            </Stack>
          </Badge>
        )}

        {/* Distance info */}
        {delivery.distance_km && (
          <Badge colorPalette="gray" variant="subtle">
            <Text fontSize="sm">{delivery.distance_km.toFixed(1)} km</Text>
          </Badge>
        )}
      </Stack>
    );
  };

  /**
   * Custom metadata display
   */
  const renderMetadata = (item: FulfillmentQueueItem) => {
    const delivery = transformToDeliveryOrder(item);

    return (
      <Stack gap="xs" fontSize="sm" color="gray.600">
        {/* Delivery address */}
        <Stack direction="row" align="center" gap="xs">
          <MapPinIcon style={{ width: '14px', height: '14px' }} />
          <Text>{delivery.delivery_address}</Text>
        </Stack>

        {/* Delivery instructions */}
        {delivery.delivery_instructions && (
          <Text color="gray.500" fontSize="xs">
            📝 {delivery.delivery_instructions}
          </Text>
        )}

        {/* Delivery type */}
        <Badge
          colorPalette={
            delivery.delivery_type === 'instant' ? 'orange' :
            delivery.delivery_type === 'same_day' ? 'blue' : 'gray'
          }
          width="fit-content"
          fontSize="xs"
        >
          {delivery.delivery_type === 'instant' && '⚡ Inmediato (0-60 min)'}
          {delivery.delivery_type === 'same_day' && '📅 Mismo día'}
          {delivery.delivery_type === 'scheduled' && <ClockIcon style={{ width: '12px' }} />}
          {delivery.delivery_type === 'scheduled' && ' Programado'}
        </Badge>
      </Stack>
    );
  };

  return (
    <>
      <FulfillmentQueue
        type="delivery"
        status={status}
        assignedTo={driverId}
        title={title || 'Cola de Deliveries'}
        renderActions={renderActions}
        renderMetadata={renderMetadata}
        onUpdate={onUpdate}
      />

      {/* Assign Driver Modal */}
      {selectedDelivery && (
        <AssignDriverModal
          delivery={selectedDelivery}
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedDelivery(null);
          }}
          onAssigned={handleDriverAssigned}
        />
      )}
    </>
  );
}
