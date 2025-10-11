/**
 * Sales Overview Widget - Dynamic Dashboard Component
 *
 * REFACTORED v2.0:
 * - Usa datos reales de useSalesStore (no mock)
 * - Elimina dependencia de WidgetComponents (estáticos)
 * - UI propia con CardWrapper
 * - Visible solo si sales features están activas (gestionado por SlotRegistry)
 *
 * @version 2.0.0 - Real Data Integration
 */

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Stack, Typography, Badge, Icon } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { CurrencyDollarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useSalesStore } from '@/store/salesStore';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

export function SalesWidget() {
  // ✅ CRITICAL FIX: Usar useShallow de Zustand v5 para evitar loop infinito
  const { stats, loading } = useSalesStore(useShallow(state => ({
    stats: state.stats,
    loading: state.loading
  })));

  const todayTotal = stats?.todayTotal || 0;
  const monthTotal = stats?.monthTotal || 0;
  const monthCount = stats?.monthCount || 0;

  // Calcular cambio vs mes anterior (simplificado por ahora)
  const change = monthTotal > 0 ? ((todayTotal / (monthTotal / 30) - 1) * 100) : 0;

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="green"
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
              <Typography variant="body" size="sm" color="text.secondary">
                Ventas del Mes
              </Typography>

              {loading ? (
                <Typography variant="body" size="sm" color="text.secondary">
                  Cargando...
                </Typography>
              ) : (
                <>
                  <Typography variant="heading" level={3} weight="bold">
                    {DecimalUtils.formatCurrency(monthTotal)}
                  </Typography>

                  <Typography variant="body" size="xs" color="text.secondary">
                    {monthCount} transacciones
                  </Typography>
                </>
              )}
            </Stack>

            <Stack
              p="3"
              bg="green.100"
              borderRadius="full"
              color="green.600"
            >
              <Icon icon={CurrencyDollarIcon} size="lg" />
            </Stack>
          </Stack>

          {!loading && (
            <Stack direction="row" justify="space-between" align="center">
              <Badge
                variant="subtle"
                colorPalette={change >= 0 ? "green" : "red"}
                size="sm"
              >
                <Stack direction="row" align="center" gap="1">
                  <Icon
                    icon={ArrowTrendingUpIcon}
                    size="xs"
                    style={{ transform: change < 0 ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </Stack>
              </Badge>

              <Typography variant="body" size="xs" color="text.secondary">
                vs mes anterior
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default SalesWidget;
