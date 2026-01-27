/**
 * GAMIFICATION WIDGET - Dashboard Component
 *
 * Muestra progreso del sistema de achievements:
 * - Nivel actual
 * - Total de logros
 * - Logros desbloqueados
 * - Siguiente milestone
 *
 * @version 1.1.0 - Migrado a TanStack Query
 */

import { useMemo } from 'react';
import { Box, Stack, Typography, Icon, Button, Badge } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { useGamificationData, useGamificationStats } from '../hooks/useGamificationData';

interface GamificationStats {
  level: number;
  totalAchievements: number;
  unlockedAchievements: number;
  nextMilestone: string | null;
}

export default function GamificationWidget() {
  const { navigate } = useNavigationActions();

  // 🔄 TanStack Query hooks
  const { data: userData, isLoading: isLoadingUser } = useGamificationData();
  const { data: statsData } = useGamificationStats();

  // ✅ Usar useMemo para cálculos
  const stats: GamificationStats = useMemo(() => {
    // Safe defaults mientras carga
    if (!userData) {
      return {
        level: 1,
        totalAchievements: 50,
        unlockedAchievements: 0,
        nextMilestone: 'Completa tu primer logro',
      };
    }

    // Calcular nivel basado en puntos (cada 100 puntos = 1 nivel)
    const level = userData.level;

    // Total de achievements (de query o mock)
    const totalAchievements = statsData?.totalAchievements || 50;

    // Achievements desbloqueados
    const unlockedAchievements = userData.completedAchievements?.size || 0;

    // Próximo milestone
    const nextMilestone = userData.totalPoints > 0
      ? `${userData.nextLevelPoints} puntos`
      : 'Completa tu primer logro';

    return {
      level,
      totalAchievements,
      unlockedAchievements,
      nextMilestone
    };
  }, [userData, statsData]);

  return (
    <CardWrapper
      variant="elevated"
      colorPalette="yellow"
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
          <Stack direction="row" align="center" justify="space-between">
            <Stack direction="row" align="center" gap="2">
              <Icon size="md" color="yellow.500">
                <TrophyIcon />
              </Icon>
              <Typography variant="body" size="md" weight="medium">
                Your Progress
              </Typography>
            </Stack>
            <Badge colorPalette="yellow" size="sm">
              Nivel {stats.level}
            </Badge>
          </Stack>

          <Stack gap="2">
            <Box p="3" bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Total Logros
                </Typography>
                <Typography variant="body" size="lg" weight="bold">
                  {stats.totalAchievements}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Desbloqueados
                </Typography>
                <Typography variant="body" size="lg" weight="bold" color="green.600">
                  {stats.unlockedAchievements}
                </Typography>
              </Stack>
            </Box>

            <Box p="3" bg="bg.subtle" borderRadius="md" border="1px solid" borderColor="border.default">
              <Stack gap="1">
                <Typography variant="body" size="xs" color="text.secondary">
                  Siguiente Milestone
                </Typography>
                <Typography variant="body" size="sm" weight="medium" color="orange.600">
                  {stats.nextMilestone}
                </Typography>
              </Stack>
            </Box>

            {userData?.unlockedBadges && userData.unlockedBadges.length > 0 && (
              <Box p="3" bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                <Stack gap="1">
                  <Typography variant="body" size="xs" color="text.secondary">
                    Badges Desbloqueados
                  </Typography>
                  <Typography variant="body" size="sm" weight="bold" color="purple.600">
                    {userData.unlockedBadges.length}
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>

          <Button
            size="sm"
            colorPalette="yellow"
            variant="outline"
            onClick={() => navigate('gamification', '/achievements')}
          >
            Ver Logros
          </Button>
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
