/**
 * INVENTORY ALERTS TAB
 * 
 * Configure inventory thresholds, ABC analysis, and auto-reorder logic
 * Migrated from /admin/settings/inventory/alerts to Materials module tab
 */

import { useState, memo } from 'react';
import {
  Stack,
  Button,
  Badge,
  Switch,
  Box,
  Text,
  Flex,
  Card,
} from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';
import {
  useSystemInventoryAlertSettings,
  useToggleAutoReorder,
  useToggleABCAnalysis,
} from '@/modules/materials/hooks';
import { InventoryAlertSettingsFormModal } from './components/InventoryAlertSettingsFormModal';

// ⚡ PERFORMANCE: Memoized to prevent re-renders when parent (Materials page) updates
// Pattern from REACT_RERENDER_PATTERNS.md: "React.memo for Component Isolation"
export const AlertsTab = memo(function AlertsTab() {
  const formModal = useDisclosure();

  const { data: settings, isLoading, error } = useSystemInventoryAlertSettings();

  const toggleAutoReorder = useToggleAutoReorder();
  const toggleABCAnalysis = useToggleABCAnalysis();

  const handleToggleAutoReorder = () => {
    if (!settings) return;
    toggleAutoReorder.mutate({
      id: settings.id,
      enabled: !settings.auto_reorder_enabled,
    });
  };

  const handleToggleABCAnalysis = () => {
    if (!settings) return;
    toggleABCAnalysis.mutate({
      id: settings.id,
      enabled: !settings.abc_analysis_enabled,
    });
  };

  if (isLoading) {
    return (
      <Box p={8}>
        <Text>Cargando configuración...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">Error al cargar la configuración de alertas</Text>
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box p={8}>
        <Text>No se encontró configuración de alertas</Text>
      </Box>
    );
  }

  return (
    <>
      <Stack gap="6" p="6">
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="xl" fontWeight="semibold">
              Configuración de Alertas de Inventario
            </Text>
            <Text color="gray.600" fontSize="sm">
              Configura umbrales de stock, análisis ABC y reglas de auto-reorden
            </Text>
          </Box>
          <Button onClick={formModal.onOpen} colorPalette="blue">
            Editar Configuración
          </Button>
        </Flex>

        <Stack gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Umbrales de Stock
          </Text>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    Stock Bajo
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Alerta cuando el stock está por debajo de este umbral
                  </Text>
                </Box>
                <Badge colorPalette="yellow" size="lg">
                  {settings.low_stock_threshold} unidades
                </Badge>
              </Flex>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    Stock Crítico
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Alerta crítica cuando el stock está por debajo de este umbral
                  </Text>
                </Box>
                <Badge colorPalette="red" size="lg">
                  {settings.critical_stock_threshold} unidades
                </Badge>
              </Flex>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    Sin Stock
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Umbral para considerar producto agotado
                  </Text>
                </Box>
                <Badge colorPalette="gray" size="lg">
                  {settings.out_of_stock_threshold} unidades
                </Badge>
              </Flex>
            </Card.Body>
          </Card.Root>
        </Stack>

        <Stack gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Análisis ABC
          </Text>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box flex="1">
                  <Text fontWeight="semibold" fontSize="lg">
                    Análisis ABC
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Clasificación automática de productos por valor (Pareto 80-15-5)
                  </Text>
                </Box>
                <Switch
                  checked={settings.abc_analysis_enabled}
                  onChange={handleToggleABCAnalysis}
                  disabled={toggleABCAnalysis.isPending}
                />
              </Flex>
            </Card.Body>
          </Card.Root>

          {settings.abc_analysis_enabled && (
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb="3">
                  Umbrales de Clasificación
                </Text>
                <Stack gap="3">
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <Badge colorPalette="red">
                        A
                      </Badge>
                      <Text>Materiales de alto valor</Text>
                    </Flex>
                    <Text fontWeight="semibold">
                      {settings.abc_analysis_thresholds.a_threshold}%
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <Badge colorPalette="yellow">
                        B
                      </Badge>
                      <Text>Materiales de valor medio</Text>
                    </Flex>
                    <Text fontWeight="semibold">
                      {settings.abc_analysis_thresholds.b_threshold}%
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                      <Badge colorPalette="green">
                        C
                      </Badge>
                      <Text>Materiales de bajo valor</Text>
                    </Flex>
                    <Text fontWeight="semibold">
                      {settings.abc_analysis_thresholds.c_threshold}%
                    </Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>
          )}
        </Stack>

        <Stack gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Alertas de Vencimiento
          </Text>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    Advertencia de Vencimiento
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Días antes del vencimiento para enviar advertencia
                  </Text>
                </Box>
                <Badge colorPalette="yellow" size="lg">
                  {settings.expiry_warning_days} días
                </Badge>
              </Flex>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    Alerta Crítica de Vencimiento
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Días antes del vencimiento para alerta crítica
                  </Text>
                </Box>
                <Badge colorPalette="red" size="lg">
                  {settings.expiry_critical_days} días
                </Badge>
              </Flex>
            </Card.Body>
          </Card.Root>
        </Stack>

        <Stack gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Alertas de Desperdicio
          </Text>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="semibold" fontSize="lg">
                    Umbral de Desperdicio
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Porcentaje de desperdicio para activar alerta
                  </Text>
                </Box>
                <Badge colorPalette="orange" size="lg">
                  {settings.waste_threshold_percent}%
                </Badge>
              </Flex>
            </Card.Body>
          </Card.Root>
        </Stack>

        <Stack gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Auto-Reorden
          </Text>

          <Card.Root>
            <Card.Body>
              <Flex justify="space-between" align="center">
                <Box flex="1">
                  <Text fontWeight="semibold" fontSize="lg">
                    Auto-Reorden Automático
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Generar órdenes de compra automáticamente cuando se alcancen los umbrales
                  </Text>
                </Box>
                <Switch
                  checked={settings.auto_reorder_enabled}
                  onChange={handleToggleAutoReorder}
                  disabled={toggleAutoReorder.isPending}
                />
              </Flex>
            </Card.Body>
          </Card.Root>

          {settings.auto_reorder_enabled && (
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb="3">
                  Reglas de Reorden
                </Text>
                <Stack gap="3">
                  <Flex justify="space-between">
                    <Text color="gray.600">Método:</Text>
                    <Text fontWeight="semibold">
                      {settings.reorder_quantity_rules.method === 'economic_order_quantity'
                        ? 'Cantidad Económica de Pedido (EOQ)'
                        : settings.reorder_quantity_rules.method === 'fixed'
                        ? 'Cantidad Fija'
                        : 'Días de Suministro'}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Pedido Mínimo:</Text>
                    <Text fontWeight="semibold">
                      {settings.reorder_quantity_rules.min_order} unidades
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Pedido Máximo:</Text>
                    <Text fontWeight="semibold">
                      {settings.reorder_quantity_rules.max_order} unidades
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Stock de Seguridad:</Text>
                    <Text fontWeight="semibold">
                      {settings.reorder_quantity_rules.safety_stock_days} días
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Tiempo de Entrega:</Text>
                    <Text fontWeight="semibold">
                      {settings.reorder_quantity_rules.lead_time_days} días
                    </Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>
          )}
        </Stack>
      </Stack>

      <InventoryAlertSettingsFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.onClose}
        settings={settings}
      />
    </>
  );
});
