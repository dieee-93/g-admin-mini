/**
 * RENTALS WIDGET - Dashboard Component
 *
 * Muestra métricas clave del módulo Rentals:
 * - Alquileres activos
 * - Reservas para hoy
 * - Tasa de utilización
 *
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { Box, Stack, Typography, Icon, Button } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { KeyIcon } from '@heroicons/react/24/outline';
import { useNavigationActions } from '@/contexts/NavigationContext';

interface RentalsStats {
  activeRentals: number;
  todayReservations: number;
  utilizationRate: number;
}

export default function RentalsWidget() {
  const { navigate } = useNavigationActions();

  // ✅ MOCK DATA - Replace with actual store when available
  const stats: RentalsStats = useMemo(() => ({
    activeRentals: 0,
    todayReservations: 0,
    utilizationRate: 0
  }), []);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="cyan"
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
            <Icon icon={KeyIcon} size="md" color="cyan.500" />
            <Typography variant="body" size="md" weight="medium">
              Rentals
            </Typography>
          </Stack>

          <Stack gap="2">
            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Alquileres Activos
                </Typography>
                <Typography variant="body" size="lg" weight="bold">
                  {stats.activeRentals}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Reservas Hoy
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="blue.600">
                  {stats.todayReservations}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Tasa de Utilización
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="green.600">
                  {stats.utilizationRate}%
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Button
            size="sm"
            colorPalette="cyan"
            variant="outline"
            onClick={() => navigate('rentals')}
          >
            Ver Alquileres
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
