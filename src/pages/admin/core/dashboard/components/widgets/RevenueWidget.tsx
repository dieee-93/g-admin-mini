/**
 * Revenue Analysis Widget - Dynamic Dashboard Component
 *
 * Muestra análisis de ingresos:
 * - Ingresos de la semana
 * - Comparación con semana anterior
 * - Tendencia de crecimiento
 *
 * Visible solo si sales_order_management o analytics_sales_forecasting están activas.
 *
 * @version 1.0.0 - Initial Implementation
 */

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useSalesStore } from '@/store/salesStore';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export function RevenueWidget() {
  // ✅ Usar useShallow de Zustand v5 para evitar loop infinito
  const { stats, loading } = useSalesStore(useShallow(state => ({
    stats: state.stats,
    loading: state.loading
  })));

  const weekTotal = stats?.weekTotal || 0;
  const monthTotal = stats?.monthTotal || 0;
  const todayTotal = stats?.todayTotal || 0;

  // Calcular % del mes que llevamos (aprox. semana = 25% del mes)
  const weekPercentageOfMonth = monthTotal > 0
    ? ((weekTotal / monthTotal) * 100).toFixed(0)
    : 0;

  // Estimar crecimiento semanal vs mes anterior (simplificado)
  const weeklyGrowth = weekTotal > 0 && monthTotal > 0
    ? (((weekTotal * 4) / monthTotal - 1) * 100).toFixed(1)
    : 0;

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="teal"
      h="fit-content"
      minH="120px"
      borderRadius="8px"
      shadow="sm"
      bg="white"
      border="1px"
      borderColor="gray.200"
    >
      <CardWrapper.Body p="4">
        <Stack gap="3">
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="2" flex={1}>
              <Typography variant="body" size="sm" color="fg.muted" fontWeight="medium">
                Ingresos Semanales
              </Typography>

              {loading ? (
                <Typography variant="body" size="sm" color="fg.muted">
                  Cargando...
                </Typography>
              ) : (
                <>
                  <Typography variant="heading" level={3} weight="bold" color="fg.default">
                    {DecimalUtils.formatCurrency(weekTotal)}
                  </Typography>

                  <Typography variant="body" size="sm" color="fg.default">
                    {weekPercentageOfMonth}% del mes
                  </Typography>
                </>
              )}
            </Stack>

            <Stack
              p="3"
              bg="colorPalette.subtle"
              borderRadius="full"
              color="colorPalette.fg"
            >
              <Icon size="lg">
                <ChartBarIcon />
              </Icon>
            </Stack>
          </Stack>

          {!loading && Number(weeklyGrowth) !== 0 && (
            <Stack direction="row" justify="space-between" align="center">
              <Badge
                variant="subtle"
                colorPalette={Number(weeklyGrowth) >= 0 ? 'green' : 'red'}
                size="sm"
              >
                <Stack direction="row" align="center" gap="1">
                  <Icon
                    icon={ArrowTrendingUpIcon}
                    size="xs"
                    style={{
                      transform: Number(weeklyGrowth) < 0 ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                  {Number(weeklyGrowth) >= 0 ? '+' : ''}{weeklyGrowth}%
                </Stack>
              </Badge>

              <Typography variant="body" size="xs" color="fg.muted">
                proyección mensual
              </Typography>
            </Stack>
          )}

          {!loading && todayTotal > 0 && (
            <Typography variant="body" size="sm" color="fg.default">
              Hoy: {DecimalUtils.formatCurrency(todayTotal)}
            </Typography>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default RevenueWidget;
