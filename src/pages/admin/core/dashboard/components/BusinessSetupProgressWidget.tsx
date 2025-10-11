/**
 * BusinessSetupProgressWidget - Tracker de progreso del setup inicial
 *
 * Widget temporal hasta completar setup crítico.
 * Reemplaza a WelcomeWidget con propósito más claro.
 *
 * Features:
 * - Acordeón priorizado por capability (expande la más incompleta)
 * - Progreso global y por capability
 * - Filtros por prioridad (🔴 críticos, 🟡 importantes, ✅ completados)
 * - Suscripción a eventos del AchievementsEngine
 * - Toasts al desbloquear logros
 * - Navegación a configuraciones específicas
 *
 * Evoluciona a AchievementsWidget cuando setup al 100%.
 *
 * Based on:
 * - Progressive Onboarding (NN/G)
 * - Gamification patterns (Yu-kai Chou)
 * - Dashboard Evolutivo design doc
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Section,
  Stack,
  Typography,
  Badge,
  Button,
  Box,
  Progress
} from '@/shared/ui';
import { useCapabilityStore } from '@/store/capabilityStore';
import { getFoundationalMilestone } from '@/config/RequirementsRegistry';
import { CapabilityAccordionItem } from './CapabilityAccordionItem';
import type { CapabilityProgress, MilestoneProgress } from './CapabilityAccordionItem';
import eventBus from '@/lib/events/EventBus';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';

// ===============================
// INTERFACES
// ===============================

export interface BusinessSetupProgressWidgetProps {
  /** Callback al completar 100% */
  onSetupCompleted?: () => void;
}

// ===============================
// COMPONENT
// ===============================

export const BusinessSetupProgressWidget: React.FC<BusinessSetupProgressWidgetProps> = ({
  onSetupCompleted
}) => {
  const navigate = useNavigate();

  // ✅ CRITICAL FIX: Usar selectores directos para evitar objeto nuevo en cada render
  const profile = useCapabilityStore(state => state.profile);
  const pendingMilestones = useCapabilityStore(state => state.features.pendingMilestones);
  const completedMilestoneIds = useCapabilityStore(state => state.features.completedMilestones);
  const activeFeatures = useCapabilityStore(state => state.features.activeFeatures);

  // Estado local
  const [expandedCapability, setExpandedCapability] = useState<string | null>(null);

  // ===============================
  // COMPUTE CAPABILITIES PROGRESS
  // ===============================

  const capabilitiesProgress = useMemo((): CapabilityProgress[] => {
    // Agrupar milestones por capability/feature
    const capabilityMap = new Map<string, MilestoneProgress[]>();

    // Procesar todos los milestones (pendientes + completados)
    const allMilestoneIds = [...pendingMilestones, ...completedMilestoneIds];

    allMilestoneIds.forEach(milestoneId => {
      const milestone = getFoundationalMilestone(milestoneId);
      if (!milestone) return;

      const capabilityId = milestone.category || 'general';

      if (!capabilityMap.has(capabilityId)) {
        capabilityMap.set(capabilityId, []);
      }

      // Determinar prioridad
      let priority: MilestoneProgress['priority'] = 'important';
      if (completedMilestoneIds.includes(milestoneId)) {
        priority = 'completed';
      } else if (milestone.blocking) {
        priority = 'critical';
      }

      capabilityMap.get(capabilityId)!.push({
        id: milestone.id,
        name: milestone.name,
        description: milestone.description,
        priority,
        completed: completedMilestoneIds.includes(milestoneId),
        redirectUrl: milestone.redirectUrl,
        estimatedMinutes: milestone.estimatedMinutes,
        xpReward: milestone.xpReward,
        icon: milestone.icon
      });
    });

    // Convertir a array de CapabilityProgress
    const capabilities: CapabilityProgress[] = [];

    capabilityMap.forEach((milestones, capabilityId) => {
      const completedCount = milestones.filter(m => m.completed).length;
      const totalCount = milestones.length;
      const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Determinar nombre e icono de la capability
      const firstMilestone = milestones[0];
      const capabilityName = capabilityId.charAt(0).toUpperCase() + capabilityId.slice(1).replace(/_/g, ' ');
      const capabilityIcon = firstMilestone?.icon || '📋';

      capabilities.push({
        id: capabilityId,
        name: capabilityName,
        icon: capabilityIcon,
        progressPercent,
        milestones: milestones.sort((a, b) => {
          // Orden: críticos → importantes → completados
          const priorityOrder = { critical: 1, important: 2, completed: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
      });
    });

    // Ordenar capabilities por % completado (menos completadas primero)
    return capabilities.sort((a, b) => a.progressPercent - b.progressPercent);
  }, [pendingMilestones, completedMilestoneIds]);

  // ===============================
  // COMPUTE GLOBAL PROGRESS
  // ===============================

  const globalProgress = useMemo(() => {
    const totalMilestones = pendingMilestones.length + completedMilestoneIds.length;
    if (totalMilestones === 0) return 100;

    const completedCount = completedMilestoneIds.length;
    return Math.round((completedCount / totalMilestones) * 100);
  }, [pendingMilestones, completedMilestoneIds]);

  const criticalCount = useMemo(() => {
    return pendingMilestones.filter(id => {
      const milestone = getFoundationalMilestone(id);
      return milestone?.blocking === true;
    }).length;
  }, [pendingMilestones]);

  const importantCount = useMemo(() => {
    return pendingMilestones.filter(id => {
      const milestone = getFoundationalMilestone(id);
      return milestone?.blocking !== true;
    }).length;
  }, [pendingMilestones]);

  // ===============================
  // EFFECTS
  // ===============================

  // Auto-expandir la capability más incompleta
  useEffect(() => {
    if (capabilitiesProgress.length > 0 && !expandedCapability) {
      const leastComplete = capabilitiesProgress[0];
      setExpandedCapability(leastComplete.id);
    }
  }, [capabilitiesProgress, expandedCapability]);

  // Listener para eventos de logros desbloqueados
  useEffect(() => {
    const unsubscribe = eventBus.on('achievement:unlocked', (event: any) => {
      logger.info('Dashboard', 'Achievement unlocked', event);

      notify.success(
        `🎉 ¡Logro desbloqueado! ${event.achievementName}`,
        {
          description: `+${event.xp || 0} XP`,
          duration: 5000
        }
      );
    });

    return () => unsubscribe();
  }, []);

  // Notificar cuando setup se complete
  useEffect(() => {
    if (globalProgress === 100 && onSetupCompleted) {
      onSetupCompleted();
      notify.success('🎉 ¡Setup completo! Todas las capabilities están activas', {
        duration: 7000
      });
    }
  }, [globalProgress, onSetupCompleted]);

  // ===============================
  // HANDLERS
  // ===============================

  const handleMilestoneClick = (milestoneId: string, redirectUrl: string) => {
    logger.info('Dashboard', 'Navigating to milestone configuration', {
      milestoneId,
      redirectUrl
    });
    navigate(redirectUrl);
  };

  const handleToggleCapability = (capabilityId: string) => {
    setExpandedCapability(prev => (prev === capabilityId ? null : capabilityId));
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <Section variant="elevated" title="🎯 Configuración de Negocio">
      <Stack gap={6}>
        {/* Global Progress Bar */}
        <Box>
          <Stack direction="row" justify="space-between" align="center" mb={2}>
            <Typography variant="body" fontSize="sm" fontWeight="medium">
              Progreso Global
            </Typography>
            <Typography variant="body" fontSize="lg" fontWeight="bold" color="blue.600">
              {globalProgress}%
            </Typography>
          </Stack>

          <Progress
            value={globalProgress}
            max={100}
            size="lg"
            colorPalette={globalProgress === 100 ? 'green' : 'blue'}
            borderRadius="full"
          />

          <Typography variant="body" fontSize="xs" color="gray.600" mt={2}>
            {completedMilestoneIds.length} de {pendingMilestones.length + completedMilestoneIds.length} pasos completados
          </Typography>
        </Box>

        {/* Priority Badges */}
        <Stack direction="row" gap={2} flexWrap="wrap">
          {criticalCount > 0 && (
            <Badge colorPalette="red" variant="subtle" size="md">
              🔴 {criticalCount} CRÍTICO{criticalCount > 1 ? 'S' : ''}
            </Badge>
          )}
          {importantCount > 0 && (
            <Badge colorPalette="yellow" variant="subtle" size="md">
              🟡 {importantCount} IMPORTANTE{importantCount > 1 ? 'S' : ''}
            </Badge>
          )}
          {completedMilestoneIds.length > 0 && (
            <Badge colorPalette="green" variant="subtle" size="md">
              ✅ {completedMilestoneIds.length} COMPLETADO{completedMilestoneIds.length > 1 ? 'S' : ''}
            </Badge>
          )}
        </Stack>

        {/* Capabilities Accordion */}
        {capabilitiesProgress.length > 0 ? (
          <Stack gap={3}>
            {capabilitiesProgress.map((capability) => (
              <CapabilityAccordionItem
                key={capability.id}
                capability={capability}
                isExpanded={expandedCapability === capability.id}
                onToggle={() => handleToggleCapability(capability.id)}
                onMilestoneClick={handleMilestoneClick}
              />
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="heading" fontSize="lg" mb={2}>
              ✨ ¡Todo listo!
            </Typography>
            <Typography variant="body" color="gray.600">
              No hay pasos pendientes. Tu sistema está completamente configurado.
            </Typography>
          </Box>
        )}

        {/* Link a página completa de logros */}
        {globalProgress > 0 && (
          <Button
            variant="ghost"
            colorPalette="blue"
            size="sm"
            onClick={() => navigate('/admin/achievements')}
          >
            Ver Todos los Logros →
          </Button>
        )}
      </Stack>
    </Section>
  );
};
