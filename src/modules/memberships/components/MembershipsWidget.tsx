/**
 * MEMBERSHIPS WIDGET - Dashboard Component
 *
 * Muestra métricas clave del módulo Memberships:
 * - Miembros activos
 * - Nuevos miembros este mes
 * - Renovaciones pendientes
 *
 * @version 2.0.0 - Connected to real database
 */

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Icon, Button, Spinner } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { getMembershipMetrics } from '@/pages/admin/operations/memberships/services';
import { logger } from '@/lib/logging';
import { useNavigationActions } from '@/contexts/NavigationContext';

interface MembershipsStats {
  activeMembers: number;
  newThisMonth: number;
  renewalsDue: number;
}

export default function MembershipsWidget() {
  const { navigate } = useNavigationActions();
  const [stats, setStats] = useState<MembershipsStats>({
    activeMembers: 0,
    newThisMonth: 0,
    renewalsDue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const metrics = await getMembershipMetrics();

        setStats({
          activeMembers: metrics.active_members || 0,
          newThisMonth: metrics.new_this_month || 0,
          renewalsDue: metrics.expiring_soon || 0
        });
      } catch (error) {
        logger.error('MembershipsWidget', 'Error loading membership stats', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
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
          <Stack gap="4" align="center" justify="center">
            <Spinner size="md" color="purple.500" />
            <Typography variant="body" size="sm" color="text.secondary">
              Cargando membresías...
            </Typography>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

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
        <Stack gap="4">
          <Stack direction="row" align="center" gap="2">
            <Icon icon={UserGroupIcon} size="md" color="purple.500" />
            <Typography variant="body" size="md" weight="medium">
              Memberships
            </Typography>
          </Stack>

          <Stack gap="2">
            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Miembros Activos
                </Typography>
                <Typography variant="body" size="lg" weight="bold">
                  {stats.activeMembers}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Nuevos Este Mes
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="green.600">
                  {stats.newThisMonth}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Renovaciones Pendientes
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="orange.600">
                  {stats.renewalsDue}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Button
            size="sm"
            colorPalette="purple"
            variant="outline"
            onClick={() => navigate('memberships')}
          >
            Ver Membresías
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
