/**
 * AlertsAchievementsSection - Vista unificada de alertas y logros
 *
 * Tabs de alertas operacionales y progreso de configuración.
 * Integrado con el sistema de achievements para mostrar progreso en tiempo real.
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Badge,
  Button,
  Icon,
  Accordion,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
  AccordionItemIndicator,
  Progress
} from '@/shared/ui';
import {
  BellIcon,
  TrophyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAlerts } from '@/shared/alerts/hooks/useAlerts';
import { useBusinessProfile } from '@/lib/capabilities';
import { useValidationContext } from '@/hooks';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { BUSINESS_CAPABILITIES_REGISTRY } from '@/config/BusinessModelRegistry';
import { logger } from '@/lib/logging';
import { computeAllProgress } from '@/modules/achievements/services/progressCalculator';
import { getRequirementsForCapabilities } from '@/modules/achievements/requirements';
import type { CapabilityProgress } from '@/modules/achievements/types';

type ViewMode = 'alerts' | 'setup';

export const AlertsAchievementsSection: React.FC = () => {
  console.log('[AlertsAchievementsSection] RENDER');
  const [activeView, setActiveView] = useState<ViewMode>('alerts');
  const { alerts } = useAlerts();
  const { navigate } = useNavigationActions();
  
  // ✅ MIGRATED: Get profile from useBusinessProfile (TanStack Query)
  const { profile } = useBusinessProfile();
  const selectedCapabilities = profile?.selectedCapabilities;
  
  const validationContext = useValidationContext();
  console.log('[AlertsAchievementsSection] validationContext changed', validationContext);
  console.log('[AlertsAchievementsSection] selectedCapabilities', selectedCapabilities);

  const operationalAlerts = useMemo(() => {
    console.log('[AlertsAchievementsSection] operationalAlerts recalculated');
    return alerts.filter(alert =>
      alert.context === 'dashboard' ||
      alert.context === 'global' ||
      alert.severity === 'critical' ||
      alert.severity === 'high'
    ).slice(0, 5);
  }, [alerts]);

  const allProgress = useMemo<CapabilityProgress[]>(() => {
    console.log('[AlertsAchievementsSection] allProgress recalculated');
    if (!selectedCapabilities || selectedCapabilities.length === 0) {
      return [];
    }

    return computeAllProgress(selectedCapabilities, validationContext);
  }, [selectedCapabilities, validationContext]);

  // Enrich progress with capability metadata
  const enrichedProgress = useMemo(() => {
    console.log('[AlertsAchievementsSection] enrichedProgress recalculated');
    return allProgress.map(progress => {
      const capability = BUSINESS_CAPABILITIES_REGISTRY[progress.capability];

      const milestones = (progress.missing || []).map(req => ({
        id: req.id,
        name: req.name,
        completed: false,
        redirectUrl: req.redirectUrl,
      }));

      return {
        ...progress,
        name: capability?.name || progress.capability,
        icon: capability?.icon || '📦',
        milestones,
      };
    });
  }, [allProgress]);

  // Calculate deduplicated overall progress
  // Uses getRequirementsForCapabilities to avoid counting shared requirements multiple times
  const deduplicatedProgress = useMemo(() => {
    console.log('[AlertsAchievementsSection] deduplicatedProgress recalculated');
    if (!selectedCapabilities || selectedCapabilities.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    const allRequirements = getRequirementsForCapabilities(selectedCapabilities);
    const mandatoryReqs = allRequirements.filter((r) => r.tier === 'mandatory');
    const completed = mandatoryReqs.filter((req) => req.validator(validationContext)).length;
    const total = mandatoryReqs.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [selectedCapabilities, validationContext]);

  const handleMilestoneClick = (redirectUrl?: string) => {
    if (redirectUrl) {
      logger.debug('App', 'Navigating to:', { url: redirectUrl });
      navigate(redirectUrl);
    }
  };

  return (
    <Box
      bg="gray.100"
      borderRadius="2xl"
      overflow="hidden"
      mb={8}
      boxShadow="md"
      transition="all 0.3s"
      _hover={{
        boxShadow: 'lg'
      }}
    >
      {/* ============================================
          HEADER CON TABS INTEGRADOS
          ============================================ */}
      <Stack
        direction="row"
        bg="bg.panel"
        borderBottom="1px solid"
        borderColor="border.default"
        gap="0"
      >
        {/* Tab: Alertas */}
        <Box
          flex={1}
          py={4}
          px={6}
          cursor="pointer"
          bg={activeView === 'alerts' ? 'bg.muted' : 'transparent'}
          borderBottom={activeView === 'alerts' ? '3px solid' : '3px solid transparent'}
          borderColor="orange.500"
          onClick={() => setActiveView('alerts')}
          transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          position="relative"
          _hover={{
            bg: activeView === 'alerts' ? 'bg.muted' : 'bg.subtle'
          }}
        >
          <Stack direction="row" align="center" justify="center">
            <Icon
              as={BellIcon}
              color={activeView === 'alerts' ? 'orange.500' : 'fg.muted'}
              boxSize={5}
              transition="all 0.3s"
            />
            <Typography
              variant="body"
              size="md"
              weight="semibold"
              color={activeView === 'alerts' ? 'fg.default' : 'fg.muted'}
              transition="all 0.2s"
            >
              Alertas Operacionales
            </Typography>
            {operationalAlerts.length > 0 && (
              <Badge
                colorPalette="green"
                variant="solid"
                size="sm"
                borderRadius="full"
              >
                {operationalAlerts.length}
              </Badge>
            )}
          </Stack>
        </Box>

        {/* Tab: Setup/Achievements */}
        <Box
          flex={1}
          py={4}
          px={6}
          cursor="pointer"
          bg={activeView === 'setup' ? 'bg.muted' : 'transparent'}
          borderBottom={activeView === 'setup' ? '3px solid' : '3px solid transparent'}
          borderColor="blue.500"
          onClick={() => setActiveView('setup')}
          transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          position="relative"
          _hover={{
            bg: activeView === 'setup' ? 'bg.muted' : 'bg.subtle'
          }}
        >
          <Stack direction="row" align="center" justify="center">
            <Icon
              as={TrophyIcon}
              color={activeView === 'setup' ? 'blue.500' : 'fg.muted'}
              boxSize={5}
              transition="all 0.3s"
            />
            <Typography
              variant="body"
              size="md"
              weight="semibold"
              color={activeView === 'setup' ? 'fg.default' : 'fg.muted'}
              transition="all 0.2s"
            >
              Progreso & Logros
            </Typography>
            <Badge
              colorPalette={deduplicatedProgress.percentage === 100 ? 'green' : 'blue'}
              variant="solid"
              size="sm"
            >
              {deduplicatedProgress.completed}/{deduplicatedProgress.total}
            </Badge>
          </Stack>
        </Box>
      </Stack>

      {/* ============================================
          CONTENIDO CONDICIONAL
          ============================================ */}
      <Box p={8}>
        {activeView === 'alerts' ? (
          // ============================================
          // VISTA: ALERTAS OPERACIONALES
          // ============================================
          <Stack gap={6}>
            <Box>
              <Typography
                variant="body"
                size="sm"
                color="fg.muted"
                mb={5}
              >
                Información urgente y notificaciones del sistema
              </Typography>

              {operationalAlerts.length === 0 ? (
                <Box
                  bg="gray.50"
                  p={8}
                  borderRadius="2xl"
                  textAlign="center"
                  border="1px solid"
                  borderColor="border.default"
                >
                  <Stack direction="row" align="center" justify="center" mb={3}>
                    <Icon
                      as={CheckCircleIcon}
                      color="green.500"
                      boxSize={7}
                    />
                    <Typography variant="heading" size="xl" weight="semibold">
                      Todo en orden
                    </Typography>
                  </Stack>
                  <Typography variant="body" size="sm" color="fg.muted">
                    No hay alertas críticas en este momento
                  </Typography>
                </Box>
              ) : (
                <Stack gap={4}>
                  {operationalAlerts.map((alert) => (
                    <Box
                      key={alert.id}
                      bg="gray.50"
                      p={5}
                      borderRadius="2xl"
                      borderLeft="4px solid"
                      borderColor={
                        alert.severity === 'critical' || alert.severity === 'high'
                          ? 'orange.500'
                          : 'green.500'
                      }
                      transition="all 0.3s"
                      cursor="pointer"
                      _hover={{
                        bg: 'bg.subtle',
                        transform: 'translateX(8px)'
                      }}
                      onClick={() => navigate(alert.redirectUrl || 'dashboard')}
                    >
                      <Stack direction="row" justify="space-between" align="start">
                        <Stack direction="row" align="start" flex={1}>
                          <Icon
                            as={
                              alert.severity === 'critical' || alert.severity === 'high'
                                ? ExclamationTriangleIcon
                                : CheckCircleIcon
                            }
                            color={
                              alert.severity === 'critical' || alert.severity === 'high'
                                ? 'orange.500'
                                : 'green.500'
                            }
                            mt={0.5}
                            mr={4}
                            boxSize={5}
                          />
                          <Box flex={1}>
                            <Typography
                              variant="body"
                              weight="semibold"
                              mb={2}
                              size="md"
                            >
                              {alert.title}
                            </Typography>
                            <Typography
                              variant="body"
                              size="sm"
                              color="fg.muted"
                            >
                              {alert.message}
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography
                          variant="body"
                          size="xs"
                          color="fg.subtle"
                          whiteSpace="nowrap"
                          ml={6}
                        >
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Acciones rápidas */}
            <Box pt={6} borderTop="1px solid" borderColor="border.default">
              <Typography
                variant="body"
                size="xs"
                weight="bold"
                color="fg.subtle"
                mb={4}
                letterSpacing="wider"
              >
                ACCIONES RÁPIDAS
              </Typography>
              <Stack direction="row" gap={3} wrap="wrap">
                <Button
                  size="sm"
                  colorPalette="orange"
                  variant="outline"
                  onClick={() => navigate('materials')}
                >
                  Inventario
                </Button>
                <Button
                  size="sm"
                  colorPalette="blue"
                  variant="outline"
                  onClick={() => navigate('sales')}
                >
                  Ventas
                </Button>
                <Button
                  size="sm"
                  colorPalette="purple"
                  variant="outline"
                  onClick={() => navigate('staff')}
                >
                  Staff
                </Button>
                <Button
                  size="sm"
                  colorPalette="green"
                  variant="outline"
                  onClick={() => navigate('dashboard')}
                >
                  Ver Todas
                </Button>
              </Stack>
            </Box>
          </Stack>
        ) : (
          // ============================================
          // VISTA: SETUP & ACHIEVEMENTS
          // ============================================
          <Stack gap={8}>
            {/* Progress Overview */}
            <Box>
              <Stack direction="row" justify="space-between" align="flex-start" mb={4}>
                <Box flex={1} mr={6}>
                  <Typography variant="heading" size="xl" weight="bold" mb={2}>
                    Progreso de Configuración
                  </Typography>
                  <Typography variant="body" size="sm" color="fg.muted">
                    Completa estos logros fundacionales para activar todas las
                    funcionalidades del sistema
                  </Typography>
                </Box>
                <Box textAlign="right" minW="100px">
                  <Typography
                    variant="heading"
                    size="4xl"
                    weight="bold"
                    color="blue.500"
                  >
                    {deduplicatedProgress.percentage}%
                  </Typography>
                  <Typography
                    variant="body"
                    size="xs"
                    color="fg.subtle"
                    mt={1}
                  >
                    COMPLETADO
                  </Typography>
                </Box>
              </Stack>

              <Progress.Root
                value={deduplicatedProgress.percentage}
                colorPalette="blue"
                size="md"
                borderRadius="full"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>

            {/* Capabilities Grouped by Accordion */}
            {enrichedProgress.length === 0 ? (
              <Box
                bg="gray.50"
                p={8}
                borderRadius="2xl"
                textAlign="center"
                border="1px solid"
                borderColor="border.default"
              >
                <Typography variant="body" size="md" color="fg.muted">
                  No hay capabilities activas. Completa el setup inicial para comenzar.
                </Typography>
              </Box>
            ) : (
              <Accordion.Root
                multiple
                defaultValue={[enrichedProgress[0]?.capability]}
                variant="enclosed"
              >
                {enrichedProgress.map((capProgress) => (
                  <AccordionItem
                    key={capProgress.capability}
                    value={capProgress.capability}
                  >
                    <AccordionItemTrigger>
                      <Stack direction="row" align="center" flex={1} gap={4}>
                        <Typography variant="body" size="2xl">
                          {capProgress.icon}
                        </Typography>
                        <Box flex={1}>
                          <Typography variant="body" weight="semibold" size="md">
                            {capProgress.name}
                          </Typography>
                          <Progress.Root
                            value={capProgress.percentage}
                            colorPalette={capProgress.percentage === 100 ? 'green' : 'blue'}
                            size="sm"
                            mt={2}
                          >
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                        </Box>
                        <Badge
                          colorPalette={capProgress.percentage === 100 ? 'green' : 'blue'}
                          variant="solid"
                        >
                          {capProgress.completed}/{capProgress.total}
                        </Badge>
                      </Stack>
                      <AccordionItemIndicator />
                    </AccordionItemTrigger>

                    <AccordionItemContent>
                      <Stack gap={3} mt={4}>
                        {capProgress.milestones.map((milestone) => (
                          <Box
                            key={milestone.id}
                            bg="gray.50"
                            p={4}
                            borderRadius="xl"
                            borderLeft="4px solid"
                            borderColor={
                              milestone.completed ? 'green.500' : 'gray.300'
                            }
                            opacity={milestone.completed ? 1 : 0.85}
                            transition="all 0.3s"
                            cursor="pointer"
                            _hover={{
                              bg: 'bg.subtle',
                              transform: 'translateX(8px)'
                            }}
                            onClick={() => handleMilestoneClick(milestone.redirectUrl)}
                          >
                            <Stack direction="row" justify="space-between" align="center">
                              <Stack direction="row" align="center" flex={1}>
                                <Icon
                                  as={milestone.completed ? CheckCircleIcon : ChevronRightIcon}
                                  color={milestone.completed ? 'green.500' : 'gray.400'}
                                  boxSize={5}
                                  mr={3}
                                />
                                <Typography
                                  variant="body"
                                  size="sm"
                                  weight={milestone.completed ? 'normal' : 'semibold'}
                                  color={milestone.completed ? 'fg.muted' : 'fg.default'}
                                  textDecoration={milestone.completed ? 'line-through' : 'none'}
                                >
                                  {milestone.name}
                                </Typography>
                              </Stack>
                              {!milestone.completed && (
                                <Icon
                                  as={ChevronRightIcon}
                                  color="fg.subtle"
                                  boxSize={4}
                                />
                              )}
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </AccordionItemContent>
                  </AccordionItem>
                ))}
              </Accordion.Root>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
