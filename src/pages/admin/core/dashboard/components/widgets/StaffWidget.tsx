/**
 * Staff Performance Widget - Dynamic Dashboard Component
 *
 * Muestra métricas clave del personal:
 * - Total de empleados
 * - Empleados activos
 * - En turno actualmente
 * - Performance promedio
 *
 * Visible solo si staff_employee_records o staff_performance_tracking están activas.
 *
 * @version 1.0.0 - Initial Implementation
 */

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Stack, Typography, Icon, Badge, Box } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { UserIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useStaffStore } from '@/store/staffStore';

export function StaffWidget() {
  // ✅ Usar useShallow de Zustand v5 para evitar loop infinito
  const { stats, loading } = useStaffStore(useShallow(state => ({
    stats: state.stats,
    loading: state.loading
  })));

  const totalStaff = stats?.totalStaff || 0;
  const activeStaff = stats?.activeStaff || 0;
  const onShift = stats?.onShift || 0;
  const avgPerformance = stats?.averagePerformance || 0;

  // Determinar color del performance badge
  const performanceColor = avgPerformance >= 80 ? 'green' : avgPerformance >= 60 ? 'orange' : 'red';

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
        <Stack gap="3">
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="2" flex={1}>
              <Typography variant="body" size="sm" color="text.secondary">
                Personal
              </Typography>

              {loading ? (
                <Typography variant="body" size="sm" color="text.secondary">
                  Cargando...
                </Typography>
              ) : (
                <>
                  <Typography variant="heading" level={3} weight="bold">
                    {activeStaff}/{totalStaff}
                  </Typography>

                  <Typography variant="body" size="xs" color="text.secondary">
                    activos
                  </Typography>
                </>
              )}
            </Stack>

            <Stack
              p="3"
              bg="purple.100"
              borderRadius="full"
              color="purple.600"
            >
              <Icon size="lg">
                <UserIcon />
              </Icon>
            </Stack>
          </Stack>

          {!loading && (
            <Stack direction="row" justify="space-between" align="center">
              {onShift > 0 && (
                <Badge variant="subtle" colorPalette="blue" size="sm">
                  {onShift} en turno
                </Badge>
              )}

              {avgPerformance > 0 && (
                <Badge variant="subtle" colorPalette={performanceColor} size="sm">
                  <Stack direction="row" align="center" gap="1">
                    <Icon size="xs">
                <ChartBarIcon />
              </Icon>
                    {avgPerformance.toFixed(0)}% performance
                  </Stack>
                </Badge>
              )}
            </Stack>
          )}

          {!loading && onShift === 0 && totalStaff > 0 && (
            <Box p="2" bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
              <Typography variant="body" size="xs" color="orange.700">
                ⚠️ No hay personal en turno
              </Typography>
            </Box>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default StaffWidget;
