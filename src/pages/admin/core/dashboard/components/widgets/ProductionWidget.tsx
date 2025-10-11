/**
 * Production Status Widget - Dynamic Dashboard Component
 *
 * REFACTORED v2.0:
 * - Usa datos reales de useSalesStore.kitchenOrders (no mock)
 * - Muestra órdenes de cocina con kitchen_status en tiempo real
 * - Visible solo si production features están activas (gestionado por SlotRegistry)
 * - Elimina verificación hasFeature (ya lo hace SlotRegistry)
 *
 * @version 2.0.0 - Real Data Integration
 */

import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Box, Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { CubeIcon } from '@heroicons/react/24/outline';
import { useSalesStore } from '@/store/salesStore';

// Helper para calcular tiempo relativo
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins === 1) return 'hace 1 min';
  if (diffMins < 60) return `hace ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return 'hace 1 hora';
  return `hace ${diffHours} horas`;
}

// Helper para mapear kitchen_status a UI
function getStatusDisplay(status?: string): { label: string; color: string } {
  switch (status) {
    case 'pending':
      return { label: 'En cola', color: 'orange' };
    case 'preparing':
      return { label: 'En progreso', color: 'blue' };
    case 'ready':
      return { label: 'Listo', color: 'green' };
    case 'delivered':
      return { label: 'Entregado', color: 'gray' };
    default:
      return { label: 'Pendiente', color: 'orange' };
  }
}

export function ProductionWidget() {
  // ✅ CRITICAL FIX: Usar useShallow de Zustand v5 para evitar loop infinito
  const { kitchenOrders, loading } = useSalesStore(useShallow(state => ({
    kitchenOrders: state.kitchenOrders,
    loading: state.loading
  })));

  // Filtrar solo órdenes activas (pending, preparing, ready) - máximo 5
  const activeOrders = useMemo(() => {
    return kitchenOrders
      .filter(order =>
        order.kitchen_status === 'pending' ||
        order.kitchen_status === 'preparing' ||
        order.kitchen_status === 'ready'
      )
      .slice(0, 5);
  }, [kitchenOrders]);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="purple"
      h="fit-content"
      minH="120px"
      borderRadius="8px"
      shadow="sm"
      bg="white"
      border="1px"
      borderColor="gray.200"
    >
      <CardWrapper.Body p="4">
        <Stack gap="4">
          <Stack direction="row" align="center" gap="2">
            <Icon icon={CubeIcon} size="md" color="purple.500" />
            <Typography variant="body" size="md" weight="medium">
              Estado de Producción
            </Typography>
            {!loading && (
              <Badge variant="solid" colorPalette="purple" size="sm">
                {activeOrders.length}
              </Badge>
            )}
          </Stack>

          {loading ? (
            <Typography variant="body" size="sm" color="text.secondary">
              Cargando órdenes...
            </Typography>
          ) : activeOrders.length === 0 ? (
            <Box p="3" bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <Typography variant="body" size="sm" color="green.700">
                ✓ No hay órdenes en producción
              </Typography>
            </Box>
          ) : (
            <Stack gap="2">
              {activeOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.kitchen_status);
                const itemsPreview = order.items.slice(0, 2).map(item => item.product_name).join(', ');
                const moreItems = order.items.length > 2 ? ` +${order.items.length - 2}` : '';

                return (
                  <Box
                    key={order.id}
                    p="3"
                    bg="bg.subtle"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="border.default"
                  >
                    <Stack gap="1">
                      <Stack direction="row" justify="space-between" align="center">
                        <Typography variant="body" size="sm" weight="medium">
                          {itemsPreview}{moreItems}
                        </Typography>
                        <Badge
                          variant="subtle"
                          colorPalette={statusDisplay.color}
                          size="xs"
                        >
                          {statusDisplay.label}
                        </Badge>
                      </Stack>
                      <Typography variant="body" size="xs" color="text.secondary">
                        {getRelativeTime(order.created_at)} • {order.items.length} items
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default ProductionWidget;
