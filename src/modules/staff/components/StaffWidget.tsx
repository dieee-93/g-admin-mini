/**
 * STAFF WIDGET - Dashboard Component
 *
 * Muestra métricas clave del módulo Staff:
 * - Staff activo
 * - Performance promedio
 * - Staff en turno actual
 *
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { Box, Stack, Typography, Icon, Button } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { UsersIcon } from '@heroicons/react/24/outline';
import { useShallow } from 'zustand/react/shallow';
import { useStaffStore } from '@/store/staffStore';
import { useNavigationActions } from '@/contexts/NavigationContext';

interface StaffStats {
  activeStaff: number;
  avgPerformance: number;
  onShift: number;
}

export default function StaffWidget() {
  const { navigate } = useNavigationActions();

  // ✅ Usar useShallow de Zustand v5 para evitar loop infinito
  const { staff } = useStaffStore(useShallow(state => ({
    staff: state.staff
  })));

  // ✅ Usar useMemo para cálculos
  const stats: StaffStats = useMemo(() => {
    const activeStaff = staff.filter(s => s.status === 'active');
    const totalPerformance = activeStaff.reduce((sum, s) => sum + (s.performance_score || 0), 0);
    const avgPerformance = activeStaff.length > 0
      ? Math.round(totalPerformance / activeStaff.length)
      : 0;

    // Mock data for onShift - would need actual shift data
    const onShift = Math.floor(activeStaff.length * 0.4); // ~40% on shift

    return {
      activeStaff: activeStaff.length,
      avgPerformance,
      onShift
    };
  }, [staff]);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="blue"
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
            <Icon icon={UsersIcon} size="md" color="blue.500" />
            <Typography variant="body" size="md" weight="medium">
              Staff Performance
            </Typography>
          </Stack>

          <Stack gap="2">
            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Staff Activo
                </Typography>
                <Typography variant="body" size="lg" weight="bold">
                  {stats.activeStaff}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Performance Promedio
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="blue.600">
                  {stats.avgPerformance}%
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  En Turno
                </Typography>
                <Typography variant="body" size="lg" weight="bold">
                  {stats.onShift}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Button
            size="sm"
            colorPalette="blue"
            variant="outline"
            onClick={() => navigate('staff')}
          >
            Ver Staff
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
