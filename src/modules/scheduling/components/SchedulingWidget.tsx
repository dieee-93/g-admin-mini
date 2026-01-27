/**
 * SCHEDULING WIDGET - Dashboard Component (v3.0)
 *
 * Muestra métricas clave del módulo Scheduling usando hooks v3.0:
 * - Total de turnos programados
 * - Cobertura de turnos (%)
 * - Costo laboral proyectado
 *
 * MIGRATED: Now uses v3.0 useScheduling hook instead of legacy store
 *
 * @version 2.0.0 (v3.0 architecture)
 */

import { useMemo, useEffect } from 'react';
import { Box, Stack, Typography, Icon, Button } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useScheduling } from '@/modules/scheduling/hooks';
import { SchedulingCalculations } from '@/modules/scheduling/services/schedulingCalculations';
import { useNavigationActions } from '@/contexts/NavigationContext';

interface SchedulingStats {
  totalShifts: number;
  coveragePercentage: number;
  laborCost: number;
}

export default function SchedulingWidget() {
  const { navigate } = useNavigationActions();

  // ✅ v3.0: Use unified scheduling hook
  const { shifts, loading, refreshData } = useScheduling();

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ✅ Calculate stats using business logic
  const stats: SchedulingStats = useMemo(() => {
    const totalShifts = shifts.length;

    // Calculate coverage using business logic
    const filledShifts = shifts.filter(s => s.employeeId && s.status !== 'cancelled').length;
    const coveragePercentage = totalShifts > 0
      ? Math.round((filledShifts / totalShifts) * 100)
      : 0;

    // Calculate labor cost using business logic
    const laborCost = SchedulingCalculations.calculateTotalLaborCost(shifts);

    return {
      totalShifts,
      coveragePercentage,
      laborCost: laborCost.toNumber()
    };
  }, [shifts]);

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
            <Icon icon={ClockIcon} size="md" color="orange.500" />
            <Typography variant="body" size="md" weight="medium">
              Scheduling Stats
            </Typography>
          </Stack>

          {loading ? (
            <Typography variant="body" size="sm" color="text.secondary">
              Cargando turnos...
            </Typography>
          ) : (
            <Stack gap="2">
              <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
                <Stack gap="1">
                  <Typography variant="body" size="xs" color="text.secondary">
                    Total Turnos
                  </Typography>
                  <Typography variant="body" size="lg" weight="bold">
                    {stats.totalShifts}
                  </Typography>
                </Stack>
              </Box>

              <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
                <Stack gap="1">
                  <Typography variant="body" size="xs" color="text.secondary">
                    Cobertura
                  </Typography>
                  <Typography variant="body" size="lg" weight="bold" color="orange.600">
                    {stats.coveragePercentage}%
                  </Typography>
                </Stack>
              </Box>

              <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
                <Stack gap="1">
                  <Typography variant="body" size="xs" color="text.secondary">
                    Costo Laboral
                  </Typography>
                  <Typography variant="body" size="lg" weight="bold">
                    ${stats.laborCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          )}

          <Button
            size="sm"
            colorPalette="orange"
            variant="outline"
            onClick={() => navigate('scheduling')}
          >
            Ver Turnos
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
