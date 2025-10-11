/**
 * Staff Schedule Widget - Dynamic Dashboard Component
 *
 * REFACTORED v2.0:
 * - Usa datos reales de useSchedulingStore.shifts (no mock)
 * - Muestra turnos de HOY con status en tiempo real
 * - Visible solo si scheduling features están activas (gestionado por SlotRegistry)
 * - Elimina verificación hasFeature (ya lo hace SlotRegistry)
 *
 * @version 2.0.0 - Real Data Integration
 */

import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Box, Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useSchedulingStore } from '@/store/schedulingStore';
import { COMPONENT_TOKENS } from '@/theme/tokens';

export function SchedulingWidget() {
  // ✅ CRITICAL FIX: Usar useShallow de Zustand v5 para evitar loop infinito
  const { shifts, stats, loading } = useSchedulingStore(useShallow(state => ({
    shifts: state.shifts,
    stats: state.stats,
    loading: state.loading
  })));

  // Calcular shifts de HOY
  const todayShifts = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const todayShiftsList = shifts.filter(shift => shift.date === todayStr);

    const scheduled = todayShiftsList.length;
    const active = todayShiftsList.filter(s =>
      s.status === 'in_progress' || s.status === 'confirmed'
    ).length;
    const pending = todayShiftsList.filter(s =>
      s.status === 'scheduled'
    ).length;

    return { scheduled, active, pending };
  }, [shifts]);

  // Coverage desde stats (si está disponible) o calcular básico
  const coverage = stats?.coverage_percentage || 0;

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
        <Stack gap={COMPONENT_TOKENS.MetricCard.gap}>
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="2">
              <Typography variant="body" size="sm" color="text.secondary">
                Turnos Hoy
              </Typography>

              {loading ? (
                <Typography variant="body" size="sm" color="text.secondary">
                  Cargando...
                </Typography>
              ) : (
                <Typography variant="heading" level={3} weight="bold">
                  {todayShifts.active}/{todayShifts.scheduled}
                </Typography>
              )}
            </Stack>
            <Box
              p="3"
              bg="teal.100"
              borderRadius="full"
              color="teal.600"
            >
              <Icon icon={CalendarIcon} size="lg" />
            </Box>
          </Stack>

          {!loading && (
            <Stack direction="row" justify="space-between" align="center">
              <Badge
                variant="subtle"
                colorPalette={coverage >= 80 ? 'teal' : coverage >= 50 ? 'orange' : 'red'}
                size="sm"
              >
                {coverage.toFixed(0)}% cobertura
              </Badge>
              <Typography variant="body" size="xs" color="text.secondary">
                {todayShifts.pending} {todayShifts.pending === 1 ? 'pendiente' : 'pendientes'}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default SchedulingWidget;
