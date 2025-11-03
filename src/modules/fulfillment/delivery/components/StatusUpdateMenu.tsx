import { Menu } from '@/shared/ui';
import { Button } from '@/shared/ui';
import {
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { DeliveryOrder } from '../types/deliveryTypes';
import { logger } from '@/lib/logging';

interface StatusUpdateMenuProps {
  delivery: DeliveryOrder;
  onStatusChange: (deliveryId: string, newStatus: string) => Promise<void>;
}

export function StatusUpdateMenu({ delivery, onStatusChange }: StatusUpdateMenuProps) {
  const getAvailableActions = () => {
    switch (delivery.status) {
      case 'pending':
        return [{ status: 'assigned', label: 'Asignar Driver', icon: TruckIcon, color: 'blue' }];
      case 'assigned':
        return [
          { status: 'picked_up', label: 'Marcar como Recogido', icon: CheckCircleIcon, color: 'purple' }
        ];
      case 'picked_up':
        return [
          { status: 'in_transit', label: 'Marcar como En Camino', icon: MapPinIcon, color: 'orange' }
        ];
      case 'in_transit':
        return [
          { status: 'delivered', label: 'Marcar como Entregado', icon: CheckCircleIcon, color: 'green' },
          { status: 'failed', label: 'Marcar como Fallido', icon: XCircleIcon, color: 'red' }
        ];
      case 'arrived':
        return [
          { status: 'delivered', label: 'Marcar como Entregado', icon: CheckCircleIcon, color: 'green' }
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions();

  if (actions.length === 0) {
    return (
      <Button size="sm" disabled>
        Sin acciones disponibles
      </Button>
    );
  }

  const handleAction = async (newStatus: string) => {
    try {
      await onStatusChange(delivery.id, newStatus);
    } catch (error) {
      logger.error('StatusUpdateMenu', 'Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button size="sm" variant="outline">
          <ClockIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Actualizar Estado
        </Button>
      </Menu.Trigger>
      <Menu.Content>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Menu.Item key={action.status} value={action.status} onClick={() => handleAction(action.status)}>
              <Icon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              {action.label}
            </Menu.Item>
          );
        })}
      </Menu.Content>
    </Menu.Root>
  );
}
