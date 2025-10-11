/**
 * Inventory Alerts Widget - Dynamic Dashboard Component
 *
 * REFACTORED v2.0:
 * - Usa datos reales de useMaterialsStore (no mock)
 * - Muestra alertas críticas/bajas de stock
 * - Visible solo si inventory features están activas (gestionado por SlotRegistry)
 * - Elimina verificación hasFeature (ya lo hace SlotRegistry)
 *
 * @version 2.0.0 - Real Data Integration
 */

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Box, Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useMaterialsStore } from '@/store/materialsStore';

export function InventoryWidget() {
  // ✅ CRITICAL FIX: Usar useShallow de Zustand v5 para evitar loop infinito
  const { alerts, loading } = useMaterialsStore(useShallow(state => ({
    alerts: state.alerts,
    loading: state.loading
  })));

  // Filtrar solo alertas críticas y de advertencia, máximo 5
  const criticalAlerts = (alerts || [])
    .filter(alert => alert.urgency === 'critical' || alert.urgency === 'warning')
    .slice(0, 5);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="orange"
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
            <Icon icon={ExclamationTriangleIcon} size="md" color="orange.500" />
            <Typography variant="body" size="md" weight="medium">
              Alertas de Inventario
            </Typography>
            {!loading && (
              <Badge variant="solid" colorPalette="orange" size="sm">
                {criticalAlerts.length}
              </Badge>
            )}
          </Stack>

          {loading ? (
            <Typography variant="body" size="sm" color="text.secondary">
              Cargando alertas...
            </Typography>
          ) : criticalAlerts.length === 0 ? (
            <Box p="3" bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
              <Typography variant="body" size="sm" color="green.700">
                ✓ No hay alertas críticas de inventario
              </Typography>
            </Box>
          ) : (
            <Stack gap="2">
              {criticalAlerts.map((alert) => (
                <Box
                  key={alert.id}
                  p="3"
                  bg="bg.subtle"
                  borderRadius="md"
                  border="1px solid"
                  borderColor={
                    alert.urgency === 'critical' ? 'red.200' :
                    alert.urgency === 'warning' ? 'orange.200' :
                    'gray.200'
                  }
                >
                  <Stack gap="1">
                    <Stack direction="row" justify="space-between" align="center">
                      <Typography variant="body" size="sm" weight="medium">
                        {alert.item_name}
                      </Typography>
                      <Badge
                        variant="subtle"
                        colorPalette={
                          alert.urgency === 'critical' ? 'red' :
                          alert.urgency === 'warning' ? 'orange' :
                          'gray'
                        }
                        size="xs"
                      >
                        {alert.urgency}
                      </Badge>
                    </Stack>
                    <Typography variant="body" size="xs" color="text.secondary">
                      Stock actual: {alert.current_stock}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default InventoryWidget;
