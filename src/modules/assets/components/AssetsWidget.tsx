/**
 * ASSETS WIDGET - Dashboard Component
 *
 * Muestra métricas clave del módulo Assets:
 * - Total de activos
 * - Activos en uso
 * - Mantenimiento pendiente
 *
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Icon, Button } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

interface AssetsStats {
  totalAssets: number;
  inUse: number;
  maintenanceDue: number;
}

export default function AssetsWidget() {
  const navigate = useNavigate();

  // ✅ MOCK DATA - Replace with actual store when available
  const stats: AssetsStats = useMemo(() => ({
    totalAssets: 0,
    inUse: 0,
    maintenanceDue: 0
  }), []);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="gray"
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
            <Icon icon={CubeTransparentIcon} size="md" color="gray.500" />
            <Typography variant="body" size="md" weight="medium">
              Asset Management
            </Typography>
          </Stack>

          <Stack gap="2">
            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Total Activos
                </Typography>
                <Typography variant="body" size="lg" weight="bold">
                  {stats.totalAssets}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  En Uso
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="green.600">
                  {stats.inUse}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Mantenimiento Pendiente
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="orange.600">
                  {stats.maintenanceDue}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Button
            size="sm"
            colorPalette="gray"
            variant="outline"
            onClick={() => navigate('/admin/operations/assets')}
          >
            Ver Activos
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
