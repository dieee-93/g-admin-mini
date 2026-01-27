/**
 * Business Trends Widget - Dynamic Dashboard Component
 *
 * Muestra tendencias y predicciones del negocio:
 * - Tendencia de ventas (crecimiento/decrecimiento)
 * - Tendencia de inventario
 * - Predicciones básicas
 *
 * Visible solo si analytics_sales_forecasting o analytics_inventory_optimization están activas.
 *
 * @version 1.0.0 - Initial Implementation
 */

import React from 'react';
import { Box, Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { SparklesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export function TrendsWidget() {
  // TODO: Migrate to TanStack Query - need useSales() and useMaterials() hooks with stats
  // For now, return empty/safe data to prevent crashes
  const loading = false;
  const salesStats = { growth: 0, trend: 'stable' as const };
  const materialsAlerts = [];

  // Calcular tendencia de ventas (comparar semana vs mes)
  const weekTotal = salesStats?.weekTotal || 0;
  const monthTotal = salesStats?.monthTotal || 0;
  const weeklyRate = monthTotal > 0 ? (weekTotal / (monthTotal / 4)) : 1;

  const salesTrend = weeklyRate > 1.1 ? 'up' : weeklyRate < 0.9 ? 'down' : 'stable';
  const salesTrendPercentage = ((weeklyRate - 1) * 100).toFixed(0);

  // Calcular tendencia de inventario (basada en alertas)
  const criticalAlerts = (materialsAlerts || []).filter(a => a.urgency === 'critical').length;
  const warningAlerts = (materialsAlerts || []).filter(a => a.urgency === 'warning').length;

  const inventoryTrend = criticalAlerts > 0 ? 'critical' : warningAlerts > 2 ? 'warning' : 'healthy';

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="indigo"
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
            <Icon size="md" color="indigo.500" >
                <SparklesIcon />
              </Icon>
            <Typography variant="body" size="md" weight="medium">
              Tendencias
            </Typography>
          </Stack>

          {loading ? (
            <Typography variant="body" size="sm" color="text.secondary">
              Analizando datos...
            </Typography>
          ) : (
            <Stack gap="3">
              {/* Sales Trend */}
              <Box
                p="3"
                bg={salesTrend === 'up' ? 'green.50' : salesTrend === 'down' ? 'red.50' : 'gray.50'}
                borderRadius="md"
                border="1px solid"
                borderColor={salesTrend === 'up' ? 'green.200' : salesTrend === 'down' ? 'red.200' : 'gray.200'}
              >
                <Stack gap="1">
                  <Stack direction="row" justify="space-between" align="center">
                    <Typography variant="body" size="sm" weight="medium">
                      Ventas
                    </Typography>
                    <Badge
                      variant="subtle"
                      colorPalette={salesTrend === 'up' ? 'green' : salesTrend === 'down' ? 'red' : 'gray'}
                      size="xs"
                    >
                      <Stack direction="row" align="center" gap="1">
                        <Icon
                          icon={salesTrend === 'down' ? ArrowTrendingDownIcon : ArrowTrendingUpIcon}
                          size="xs"
                        />
                        {salesTrend === 'up' ? '+' : salesTrend === 'down' ? '' : '±'}
                        {salesTrend !== 'stable' ? `${salesTrendPercentage}%` : '0%'}
                      </Stack>
                    </Badge>
                  </Stack>
                  <Typography variant="body" size="xs" color="text.secondary">
                    {salesTrend === 'up'
                      ? 'Crecimiento acelerado esta semana'
                      : salesTrend === 'down'
                      ? 'Desaceleración esta semana'
                      : 'Ventas estables'}
                  </Typography>
                </Stack>
              </Box>

              {/* Inventory Trend */}
              <Box
                p="3"
                bg={inventoryTrend === 'critical' ? 'red.50' : inventoryTrend === 'warning' ? 'orange.50' : 'green.50'}
                borderRadius="md"
                border="1px solid"
                borderColor={inventoryTrend === 'critical' ? 'red.200' : inventoryTrend === 'warning' ? 'orange.200' : 'green.200'}
              >
                <Stack gap="1">
                  <Stack direction="row" justify="space-between" align="center">
                    <Typography variant="body" size="sm" weight="medium">
                      Inventario
                    </Typography>
                    <Badge
                      variant="subtle"
                      colorPalette={inventoryTrend === 'critical' ? 'red' : inventoryTrend === 'warning' ? 'orange' : 'green'}
                      size="xs"
                    >
                      {inventoryTrend === 'critical' ? 'Crítico' : inventoryTrend === 'warning' ? 'Atención' : 'Saludable'}
                    </Badge>
                  </Stack>
                  <Typography variant="body" size="xs" color="text.secondary">
                    {inventoryTrend === 'critical'
                      ? `${criticalAlerts} alertas críticas`
                      : inventoryTrend === 'warning'
                      ? `${warningAlerts} items requieren atención`
                      : 'Stock en niveles óptimos'}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default TrendsWidget;
