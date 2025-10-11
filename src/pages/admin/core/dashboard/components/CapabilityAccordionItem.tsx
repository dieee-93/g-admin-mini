/**
 * CapabilityAccordionItem - Acordeón item para progreso de capability
 *
 * Muestra el progreso de una capability específica con sus milestones.
 * Diseñado para el BusinessSetupProgressWidget.
 *
 * Features:
 * - Header con progress bar y % completado
 * - Lista de milestones priorizados (🔴 críticos, 🟡 importantes, ✅ completados)
 * - Expand/collapse suave
 * - Badges de XP y tiempo estimado
 * - Click en milestone → navega a configuración
 *
 * @example
 * <CapabilityAccordionItem
 *   capability={{
 *     id: 'table_management',
 *     name: 'Consumo en Local',
 *     icon: '🍽️',
 *     progressPercent: 60,
 *     milestones: [...]
 *   }}
 *   isExpanded={true}
 *   onToggle={() => {}}
 *   onMilestoneClick={(id, url) => navigate(url)}
 * />
 */

import React from 'react';
import { Collapsible } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  Box,
  Stack,
  Badge,
  Button,
  Icon,
  Typography,
  Progress
} from '@/shared/ui';

// ===============================
// INTERFACES
// ===============================

export interface MilestoneProgress {
  /** ID del milestone */
  id: string;
  /** Nombre del milestone */
  name: string;
  /** Descripción breve */
  description: string;
  /** Prioridad */
  priority: 'critical' | 'important' | 'completed';
  /** Estado de completitud */
  completed: boolean;
  /** URL de redirección para configurar */
  redirectUrl: string;
  /** Tiempo estimado en minutos */
  estimatedMinutes?: number;
  /** Recompensa de XP */
  xpReward?: number;
  /** Icono del milestone */
  icon?: string;
}

export interface CapabilityProgress {
  /** ID de la capability */
  id: string;
  /** Nombre de la capability */
  name: string;
  /** Icono de la capability */
  icon: string;
  /** Porcentaje de progreso (0-100) */
  progressPercent: number;
  /** Lista de milestones */
  milestones: MilestoneProgress[];
}

export interface CapabilityAccordionItemProps {
  /** Datos de progreso de la capability */
  capability: CapabilityProgress;
  /** Si el acordeón está expandido */
  isExpanded: boolean;
  /** Callback al toggle expand/collapse */
  onToggle: () => void;
  /** Callback al click en un milestone */
  onMilestoneClick: (milestoneId: string, redirectUrl: string) => void;
}

// ===============================
// HELPERS
// ===============================

const PRIORITY_CONFIG = {
  critical: {
    icon: '🔴',
    colorPalette: 'red',
    label: 'CRÍTICO',
    order: 1
  },
  important: {
    icon: '🟡',
    colorPalette: 'yellow',
    label: 'IMPORTANTE',
    order: 2
  },
  completed: {
    icon: '✅',
    colorPalette: 'green',
    label: 'COMPLETADO',
    order: 3
  }
} as const;

const getProgressColor = (percent: number): string => {
  if (percent === 100) return 'green';
  if (percent >= 75) return 'blue';
  if (percent >= 50) return 'yellow';
  if (percent >= 25) return 'orange';
  return 'red';
};

// ===============================
// COMPONENT
// ===============================

export const CapabilityAccordionItem: React.FC<CapabilityAccordionItemProps> = ({
  capability,
  isExpanded,
  onToggle,
  onMilestoneClick
}) => {
  // Agrupar milestones por prioridad
  const milestonesByPriority = React.useMemo(() => {
    const critical = capability.milestones.filter(m => m.priority === 'critical' && !m.completed);
    const important = capability.milestones.filter(m => m.priority === 'important' && !m.completed);
    const completed = capability.milestones.filter(m => m.completed);

    return { critical, important, completed };
  }, [capability.milestones]);

  const totalPending = milestonesByPriority.critical.length + milestonesByPriority.important.length;
  const progressColor = getProgressColor(capability.progressPercent);

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
      overflow="hidden"
      transition="all 0.2s ease"
      _hover={{
        borderColor: 'gray.300',
        shadow: 'sm'
      }}
    >
      {/* HEADER - Siempre visible */}
      <Box
        p={4}
        cursor="pointer"
        onClick={onToggle}
        bg={isExpanded ? 'gray.50' : 'white'}
        transition="background 0.2s ease"
        _hover={{
          bg: 'gray.50'
        }}
      >
        <Stack direction="row" justify="space-between" align="center" gap={3}>
          {/* Left: Icon + Name + Progress */}
          <Stack direction="row" align="center" gap={3} flex="1">
            {/* Expand/Collapse Icon */}
            <Icon
              icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
              size="sm"
              color="gray.500"
            />

            {/* Capability Icon */}
            <Box fontSize="xl">{capability.icon}</Box>

            {/* Name + Progress Bar */}
            <Stack gap={1} flex="1">
              <Stack direction="row" align="center" gap={2}>
                <Typography variant="body" fontWeight="semibold" fontSize="md">
                  {capability.name}
                </Typography>
                <Typography variant="body" fontSize="sm" color="gray.600">
                  {capability.progressPercent}%
                </Typography>
              </Stack>

              <Progress
                value={capability.progressPercent}
                max={100}
                size="sm"
                colorPalette={progressColor}
                borderRadius="full"
              />
            </Stack>
          </Stack>

          {/* Right: Status Badge */}
          {totalPending > 0 ? (
            <Badge colorPalette="orange" variant="subtle" size="sm">
              {totalPending} pendiente{totalPending > 1 ? 's' : ''}
            </Badge>
          ) : (
            <Badge colorPalette="green" variant="subtle" size="sm">
              ✅ Completo
            </Badge>
          )}
        </Stack>
      </Box>

      {/* CONTENT - Colapsable */}
      <Collapsible.Root open={isExpanded}>
        <Collapsible.Content>
          <Box p={4} pt={0} bg="gray.50">
            <Stack gap={3}>
              {/* Milestones Críticos */}
              {milestonesByPriority.critical.length > 0 && (
                <Stack gap={2}>
                  <Typography variant="body" fontSize="xs" fontWeight="medium" color="red.700">
                    {PRIORITY_CONFIG.critical.icon} CRÍTICOS
                  </Typography>
                  {milestonesByPriority.critical.map((milestone) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      onClick={() => onMilestoneClick(milestone.id, milestone.redirectUrl)}
                    />
                  ))}
                </Stack>
              )}

              {/* Milestones Importantes */}
              {milestonesByPriority.important.length > 0 && (
                <Stack gap={2}>
                  <Typography variant="body" fontSize="xs" fontWeight="medium" color="yellow.700">
                    {PRIORITY_CONFIG.important.icon} IMPORTANTES
                  </Typography>
                  {milestonesByPriority.important.map((milestone) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      onClick={() => onMilestoneClick(milestone.id, milestone.redirectUrl)}
                    />
                  ))}
                </Stack>
              )}

              {/* Milestones Completados (Colapsados por defecto) */}
              {milestonesByPriority.completed.length > 0 && (
                <Collapsible.Root>
                  <Collapsible.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      colorPalette="gray"
                      justifyContent="flex-start"
                      width="full"
                    >
                      <Stack direction="row" align="center" gap={2}>
                        <Icon icon={ChevronRightIcon} size="xs" />
                        <Typography variant="body" fontSize="xs" fontWeight="medium" color="green.700">
                          ✅ COMPLETADOS ({milestonesByPriority.completed.length})
                        </Typography>
                      </Stack>
                    </Button>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <Stack gap={2} mt={2}>
                      {milestonesByPriority.completed.map((milestone) => (
                        <MilestoneCard
                          key={milestone.id}
                          milestone={milestone}
                          onClick={() => onMilestoneClick(milestone.id, milestone.redirectUrl)}
                        />
                      ))}
                    </Stack>
                  </Collapsible.Content>
                </Collapsible.Root>
              )}
            </Stack>
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

// ===============================
// MILESTONE CARD SUBCOMPONENT
// ===============================

interface MilestoneCardProps {
  milestone: MilestoneProgress;
  onClick: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onClick }) => {
  const priorityConfig = PRIORITY_CONFIG[milestone.priority];

  return (
    <Box
      p={3}
      bg="white"
      borderWidth="1px"
      borderColor={milestone.completed ? 'green.200' : 'gray.200'}
      borderRadius="md"
      cursor="pointer"
      transition="all 0.2s ease"
      opacity={milestone.completed ? 0.7 : 1}
      _hover={{
        borderColor: milestone.completed ? 'green.300' : 'blue.400',
        shadow: 'sm',
        opacity: 1
      }}
      onClick={onClick}
    >
      <Stack gap={2}>
        {/* Header */}
        <Stack direction="row" justify="space-between" align="flex-start">
          <Stack direction="row" align="center" gap={2} flex="1">
            {milestone.icon && <Box fontSize="md">{milestone.icon}</Box>}
            <Typography variant="body" fontWeight="medium" fontSize="sm">
              {milestone.name}
            </Typography>
          </Stack>

          {/* Badges */}
          <Stack direction="row" gap={1}>
            {milestone.estimatedMinutes && !milestone.completed && (
              <Badge colorPalette="gray" variant="outline" size="xs">
                ~{milestone.estimatedMinutes}min
              </Badge>
            )}
            {milestone.xpReward && (
              <Badge colorPalette="purple" variant="subtle" size="xs">
                +{milestone.xpReward} XP
              </Badge>
            )}
          </Stack>
        </Stack>

        {/* Description */}
        <Typography variant="body" fontSize="xs" color="gray.600">
          {milestone.description}
        </Typography>

        {/* Action Button */}
        {!milestone.completed && (
          <Button
            size="xs"
            variant="ghost"
            colorPalette="blue"
            alignSelf="flex-start"
          >
            Configurar →
          </Button>
        )}
      </Stack>
    </Box>
  );
};
