/**
 * AchievementsWidget - Vista de logros de maestría
 *
 * Se muestra cuando el setup está al 100%.
 * Evolución del BusinessSetupProgressWidget.
 *
 * Features:
 * - Últimos 3-5 logros desbloqueados
 * - Próximo logro por desbloquear
 * - Progress bars por dominio (Ventas, Inventario, Staff, etc.)
 * - Link a página completa de achievements
 *
 * Based on:
 * - Gamification patterns (Yu-kai Chou)
 * - Achievement systems (Xbox, PlayStation, Steam)
 * - Dashboard Evolutivo design doc
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Section,
  Stack,
  Typography,
  Badge,
  Button,
  Box,
  Progress,
  CardGrid
} from '@/shared/ui';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import eventBus from '@/lib/events/EventBus';
import { notify } from '@/lib/notifications';

// ===============================
// INTERFACES
// ===============================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  unlockedAt: Date;
  tier: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DomainProgress {
  domain: string;
  icon: string;
  completed: number;
  total: number;
  percentComplete: number;
}

export interface AchievementsWidgetProps {
  userId?: string;
}

// ===============================
// TIER CONFIGURATION
// ===============================

const TIER_CONFIG = {
  common: {
    colorPalette: 'gray',
    label: 'Común',
    icon: '🥉'
  },
  rare: {
    colorPalette: 'blue',
    label: 'Raro',
    icon: '🥈'
  },
  epic: {
    colorPalette: 'purple',
    label: 'Épico',
    icon: '🥇'
  },
  legendary: {
    colorPalette: 'orange',
    label: 'Legendario',
    icon: '💎'
  }
} as const;

// ===============================
// COMPONENT
// ===============================

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({ userId }) => {
  const navigate = useNavigate();

  // Estado local
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [domainProgress, setDomainProgress] = useState<DomainProgress[]>([]);
  const [nextAchievement, setNextAchievement] = useState<{
    name: string;
    progress: number;
    total: number;
    xp: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ===============================
  // DATA FETCHING
  // ===============================

  useEffect(() => {
    const loadAchievementsData = async () => {
      try {
        setIsLoading(true);

        // 1. Cargar últimos logros desbloqueados
        const { data: achievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select(`
            id,
            unlocked_at,
            achievement_definitions (
              name,
              description,
              icon,
              points,
              tier
            )
          `)
          .eq('user_id', userId || (await supabase.auth.getUser()).data.user?.id)
          .order('unlocked_at', { ascending: false })
          .limit(5);

        if (achievementsError) {
          logger.error('Dashboard', 'Error loading achievements', achievementsError);
        } else if (achievements) {
          setRecentAchievements(
            achievements.map((a: any) => ({
              id: a.id,
              name: a.achievement_definitions.name,
              description: a.achievement_definitions.description,
              icon: a.achievement_definitions.icon,
              xp: a.achievement_definitions.points,
              unlockedAt: new Date(a.unlocked_at),
              tier: a.achievement_definitions.tier
            }))
          );
        }

        // 2. Calcular progreso por dominio
        // TODO: Implementar lógica real cuando tengamos más achievements
        const mockDomainProgress: DomainProgress[] = [
          {
            domain: 'Ventas',
            icon: '💰',
            completed: 12,
            total: 15,
            percentComplete: 80
          },
          {
            domain: 'Inventario',
            icon: '📦',
            completed: 9,
            total: 15,
            percentComplete: 60
          },
          {
            domain: 'Staff',
            icon: '👥',
            completed: 6,
            total: 15,
            percentComplete: 40
          },
          {
            domain: 'Operaciones',
            icon: '🎯',
            completed: 8,
            total: 8,
            percentComplete: 100
          }
        ];

        setDomainProgress(mockDomainProgress);

        // 3. Próximo logro por desbloquear (simulado)
        setNextAchievement({
          name: '100 Ventas',
          progress: 87,
          total: 100,
          xp: 100
        });

      } catch (error) {
        logger.error('Dashboard', 'Error in loadAchievementsData', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievementsData();
  }, [userId]);

  // Listener para nuevos logros
  useEffect(() => {
    const unsubscribe = eventBus.on('achievement:unlocked', (event: any) => {
      logger.info('Dashboard', 'New achievement unlocked', event);

      notify.success(
        `🎉 ¡Logro desbloqueado! ${event.achievementName}`,
        {
          description: `+${event.xp || 0} XP`,
          duration: 5000
        }
      );

      // Recargar achievements
      // TODO: Optimizar para solo agregar el nuevo en lugar de refetch completo
    });

    return () => unsubscribe();
  }, []);

  // ===============================
  // HELPERS
  // ===============================

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  };

  // ===============================
  // RENDER
  // ===============================

  if (isLoading) {
    return (
      <Section variant="elevated" title="🏆 Sistema de Logros">
        <Typography variant="body" color="gray.600" textAlign="center">
          Cargando logros...
        </Typography>
      </Section>
    );
  }

  return (
    <Section variant="elevated" title="🏆 Sistema de Logros">
      <Stack gap={6}>
        {/* Celebration Header */}
        <Box textAlign="center" py={4}>
          <Typography variant="heading" fontSize="2xl" mb={2}>
            🎉 ¡Configuración completa!
          </Typography>
          <Typography variant="body" color="gray.600">
            Todas las capabilities están activas. Continúa desbloqueando logros de maestría.
          </Typography>
        </Box>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Box>
            <Typography variant="heading" fontSize="md" mb={3}>
              🏆 Logros Recientes
            </Typography>
            <Stack gap={3}>
              {recentAchievements.slice(0, 3).map((achievement) => {
                const tierConfig = TIER_CONFIG[achievement.tier];
                return (
                  <Box
                    key={achievement.id}
                    p={4}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: 'blue.400',
                      shadow: 'sm'
                    }}
                  >
                    <Stack direction="row" justify="space-between" align="flex-start">
                      <Stack direction="row" gap={3} flex="1">
                        <Box fontSize="2xl">{achievement.icon}</Box>
                        <Stack gap={1}>
                          <Stack direction="row" align="center" gap={2}>
                            <Typography variant="body" fontWeight="semibold">
                              {achievement.name}
                            </Typography>
                            <Badge colorPalette={tierConfig.colorPalette} variant="subtle" size="xs">
                              {tierConfig.icon} {tierConfig.label}
                            </Badge>
                          </Stack>
                          <Typography variant="body" fontSize="xs" color="gray.600">
                            {achievement.description}
                          </Typography>
                          <Typography variant="body" fontSize="xs" color="gray.500">
                            {formatTimeAgo(achievement.unlockedAt)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Badge colorPalette="purple" variant="solid" size="sm">
                        +{achievement.xp} XP
                      </Badge>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Next Achievement */}
        {nextAchievement && (
          <Box
            p={4}
            bg="blue.50"
            borderWidth="1px"
            borderColor="blue.200"
            borderRadius="md"
          >
            <Stack gap={2}>
              <Stack direction="row" justify="space-between" align="center">
                <Typography variant="body" fontWeight="semibold" fontSize="sm">
                  🔒 Próximo Logro
                </Typography>
                <Badge colorPalette="blue" variant="solid" size="sm">
                  +{nextAchievement.xp} XP
                </Badge>
              </Stack>
              <Typography variant="body" fontSize="md" fontWeight="medium">
                {nextAchievement.name}
              </Typography>
              <Box>
                <Stack direction="row" justify="space-between" mb={1}>
                  <Typography variant="body" fontSize="xs" color="gray.600">
                    Progreso: {nextAchievement.progress}/{nextAchievement.total}
                  </Typography>
                  <Typography variant="body" fontSize="xs" fontWeight="medium" color="blue.600">
                    {Math.round((nextAchievement.progress / nextAchievement.total) * 100)}%
                  </Typography>
                </Stack>
                <Progress
                  value={nextAchievement.progress}
                  max={nextAchievement.total}
                  size="sm"
                  colorPalette="blue"
                  borderRadius="full"
                />
              </Box>
            </Stack>
          </Box>
        )}

        {/* Domain Progress */}
        {domainProgress.length > 0 && (
          <Box>
            <Typography variant="heading" fontSize="md" mb={3}>
              📊 Progreso por Dominio
            </Typography>
            <Stack gap={3}>
              {domainProgress.map((domain) => (
                <Box key={domain.domain}>
                  <Stack direction="row" justify="space-between" align="center" mb={2}>
                    <Stack direction="row" align="center" gap={2}>
                      <Box fontSize="lg">{domain.icon}</Box>
                      <Typography variant="body" fontWeight="medium" fontSize="sm">
                        {domain.domain}
                      </Typography>
                    </Stack>
                    <Typography variant="body" fontSize="sm" color="gray.600">
                      {domain.completed}/{domain.total}
                    </Typography>
                  </Stack>
                  <Progress
                    value={domain.completed}
                    max={domain.total}
                    size="sm"
                    colorPalette={domain.percentComplete === 100 ? 'green' : 'blue'}
                    borderRadius="full"
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          colorPalette="blue"
          size="md"
          onClick={() => navigate('/admin/achievements')}
          width="full"
        >
          Ver Todos los Logros →
        </Button>
      </Stack>
    </Section>
  );
};
