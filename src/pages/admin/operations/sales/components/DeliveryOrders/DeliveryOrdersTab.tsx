// sales/components/DeliveryOrders/DeliveryOrdersTab.tsx
// UPDATED: Using consolidated fulfillment-delivery module
import { useState, useEffect } from 'react';
import { Stack, Button, Alert } from '@/shared/ui';
import { useSalesStore } from '@/store/salesStore';
import { transformSalesToDeliveryOrders } from '@/modules/delivery/utils/deliveryTransformer';
import { DeliveryOrderCard } from './DeliveryOrderCard';
import { logger } from '@/lib/logging';
import { useNavigationActions } from '@/contexts/NavigationContext';
import type { DeliveryOrder } from '@/modules/delivery/types/deliveryTypes';

export function DeliveryOrdersTab() {
  const { navigate } = useNavigationActions();
  const sales = useSalesStore((state) => state.sales);

  // Filter states
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transform sales to delivery orders (async)
  useEffect(() => {
    const loadDeliveryOrders = async () => {
      setIsLoading(true);
      try {
        const deliverySales = sales.filter(sale =>
          sale.fulfillment_type === 'delivery' || sale.fulfillment_type === 'DELIVERY'
        );
        const orders = await transformSalesToDeliveryOrders(deliverySales);
        setDeliveryOrders(orders);
        logger.debug('DeliveryOrders', 'Delivery orders loaded:', orders.length);
      } catch (error) {
        logger.error('DeliveryOrders', 'Failed to load delivery orders:', error);
        setDeliveryOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliveryOrders();
  }, [sales]);

  const filteredOrders = deliveryOrders.filter(order => {
    if (filter === 'active') {
      return ['pending', 'assigned', 'picked_up', 'in_transit'].includes(order.status);
    } else if (filter === 'completed') {
      return ['delivered', 'cancelled', 'failed'].includes(order.status);
    }
    return true;
  });

  if (isLoading) {
    return (
      <Stack gap="md" p="md">
        <Alert status="info" title="Cargando deliveries...">
          Transformando órdenes de venta a deliveries...
        </Alert>
      </Stack>
    );
  }

  if (deliveryOrders.length === 0) {
    return (
      <Stack gap="md" p="md">
        <Alert status="info" title="No hay deliveries">
          No se encontraron órdenes con entrega a domicilio.
        </Alert>
        <Button onClick={() => navigate('sales')}>
          Crear Nueva Venta
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="md" p="md">
      {/* Filters */}
      <Stack direction="row" gap="sm" flexWrap="wrap">
        <Button
          variant={filter === 'all' ? 'solid' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todos ({deliveryOrders.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'solid' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
        >
          Activos ({deliveryOrders.filter(o => ['pending', 'assigned', 'picked_up', 'in_transit'].includes(o.status)).length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'solid' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Completados
        </Button>
      </Stack>

      {/* Delivery Orders List */}
      <Stack gap="md">
        {filteredOrders.map(order => (
          <DeliveryOrderCard
            key={order.id}
            order={order}
            onViewFullTracking={() => navigate(`/admin/operations/fulfillment/delivery?order=${order.id}`)}
            onViewDriver={order.driver_id ? () => navigate(`/admin/resources/team/${order.driver_id}`) : undefined}
            onViewCustomer={() => navigate(`/admin/core/customers/${order.customer_id}`)}
          />
        ))}
      </Stack>

      {/* Link to Full Delivery Module */}
      <Alert status="info">
        <Stack direction="row" justify="space-between" align="center" flexWrap="wrap">
          <span>Para gestión completa de deliveries (mapa en vivo, asignación de repartidores, etc.)</span>
          <Button
            variant="solid"
            colorPalette="blue"
            onClick={() => navigate('delivery')}
          >
            Ir a Delivery Management
          </Button>
        </Stack>
      </Alert>
    </Stack>
  );
}
