/**
 * Staff Schedule Widget - Dynamic Dashboard Component (v3.0)
 *
 * REFACTORED v3.0:
 * - Usa datos reales de useScheduling v3.0 hook (no legacy store)
 * - Muestra turnos de HOY con status en tiempo real
 * - Visible solo si scheduling features están activas (gestionado por SlotRegistry)
 * - Elimina verificación hasFeature (ya lo hace SlotRegistry)
 *
 * MIGRATED: Now uses v3.0 useScheduling hook instead of legacy store
 *
 * @version 3.0.0 - v3.0 Architecture
 */

import { useMemo, useEffect } from 'react';
import { Box, Stack, Typography, Icon, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useScheduling } from '@/pages/admin/resources/scheduling/hooks/useScheduling';
import { COMPONENT_TOKENS } from '@/theme/tokens';

export function SchedulingWidget() {
  // ✅ v3.0: Use unified scheduling hook
  const { shifts, loading, refreshData } = useScheduling();

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Calcular shifts de HOY
  const todayShifts = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const todayShiftsList = shifts.filter(shift => {
      // v3.0 shifts use dateRange
      const shiftDate = shift.dateRange.start.split('T')[0];
      return shiftDate === todayStr;
    });

    const scheduled = todayShiftsList.length;
    const active = todayShiftsList.filter(s =>
      s.status === 'in_progress' || s.status === 'confirmed'
    ).length;
    const pending = todayShiftsList.filter(s =>
      s.status === 'scheduled'
    ).length;

    return { scheduled, active, pending };
  }, [shifts]);

  // Calculate coverage: active/scheduled ratio
  const coverage = todayShifts.scheduled > 0
    ? (todayShifts.active / todayShifts.scheduled) * 100
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
              <Icon size="lg">
                <CalendarIcon />
              </Icon>
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
