/**
 * REQUIREMENT CHECKLIST
 *
 * Componente reutilizable para mostrar listas de requirements
 * con checkboxes visuales y estados de completitud.
 *
 * Usado en:
 * - Página de Achievements
 * - Modal de Setup Requerido
 * - Capability Progress Cards
 *
 * Características:
 * - Checkboxes visuales
 * - Estados: completed, pending, disabled
 * - Enlaces directos a configuración
 * - Tiempo estimado por requirement
 * - Agrupación por tier/category
 *
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Heading
} from '@/shared/ui';
import { useValidationContext } from '@/hooks/useValidationContext';
import type { Achievement, AchievementTier, ValidationContext } from '../types';

interface RequirementChecklistProps {
  /**
   * Lista de requirements a mostrar
   */
  requirements: Achievement[];

  /**
   * Contexto de validación (opcional, usa el global si no se provee)
   */
  context?: ValidationContext;

  /**
   * Agrupar por tier
   */
  groupByTier?: boolean;

  /**
   * Mostrar solo requirements pendientes
   */
  showPendingOnly?: boolean;

  /**
   * Callback cuando se hace click en un requirement
   */
  onRequirementClick?: (requirement: Achievement) => void;

  /**
   * Variante visual
   */
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Main Checklist Component
 */
export default function RequirementChecklist({
  requirements,
  context: providedContext,
  groupByTier = false,
  showPendingOnly = false,
  onRequirementClick,
  variant = 'default'
}: RequirementChecklistProps) {
  const globalContext = useValidationContext();
  const context = providedContext || globalContext;

  // Evaluar completitud de cada requirement
  const evaluatedRequirements = requirements.map(req => ({
    ...req,
    isCompleted: req.validator(context)
  }));

  // Filtrar por pendientes si se solicita
  const filteredRequirements = showPendingOnly
    ? evaluatedRequirements.filter(req => !req.isCompleted)
    : evaluatedRequirements;

  // Agrupar por tier si se solicita
  if (groupByTier) {
    const grouped = groupRequirementsByTier(filteredRequirements);
    return (
      <VStack align="start" gap="6" w="full">
        {Object.entries(grouped).map(([tier, reqs]) => (
          <TierGroup
            key={tier}
            tier={tier as AchievementTier}
            requirements={reqs}
            variant={variant}
            onRequirementClick={onRequirementClick}
          />
        ))}
      </VStack>
    );
  }

  // Vista simple (sin agrupación)
  return (
    <VStack align="start" gap="2" w="full">
      {filteredRequirements.map((req, index) => (
        <RequirementItem
          key={req.id}
          requirement={req}
          index={index}
          variant={variant}
          onClick={onRequirementClick}
        />
      ))}
    </VStack>
  );
}

/**
 * Tier Group - Agrupación por tier
 */
function TierGroup({
  tier,
  requirements,
  variant,
  onRequirementClick
}: {
  tier: AchievementTier;
  requirements: Array<Achievement & { isCompleted: boolean }>;
  variant: 'default' | 'compact' | 'detailed';
  onRequirementClick?: (requirement: Achievement) => void;
}) {
  const tierConfig = TIER_CONFIG[tier];
  const completedCount = requirements.filter(r => r.isCompleted).length;
  const totalCount = requirements.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <VStack align="start" gap="3" w="full">
      {/* Tier Header */}
      <HStack justify="space-between" w="full">
        <HStack gap="2">
          <Text fontSize="xl">{tierConfig.icon}</Text>
          <VStack align="start" gap="0">
            <Heading size="sm" color="gray.800" _dark={{ color: 'gray.200' }}>
              {tierConfig.name}
            </Heading>
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
              {tierConfig.description}
            </Text>
          </VStack>
        </HStack>

        <Badge
          colorPalette={percentage === 100 ? 'green' : 'orange'}
          size="sm"
        >
          {completedCount}/{totalCount}
        </Badge>
      </HStack>

      {/* Progress Bar */}
      <Box w="full">
        <Box
          h="4px"
          w="full"
          bg="gray.200"
          borderRadius="full"
          overflow="hidden"
          _dark={{ bg: 'gray.700' }}
        >
          <Box
            h="full"
            w={`${percentage}%`}
            bg={percentage === 100 ? 'green.500' : 'orange.500'}
            transition="width 0.3s"
          />
        </Box>
      </Box>

      {/* Requirements List */}
      <VStack align="start" gap="2" w="full" pl="6">
        {requirements.map((req, index) => (
          <RequirementItem
            key={req.id}
            requirement={req}
            index={index}
            variant={variant}
            onClick={onRequirementClick}
          />
        ))}
      </VStack>
    </VStack>
  );
}

/**
 * Requirement Item - Individual requirement row
 */
function RequirementItem({
  requirement,
  index,
  variant,
  onClick
}: {
  requirement: Achievement & { isCompleted?: boolean };
  index: number;
  variant: 'default' | 'compact' | 'detailed';
  onClick?: (req: Achievement) => void;
}) {
  const navigate = useNavigate();
  const isCompleted = requirement.isCompleted || false;

  // Compact variant
  if (variant === 'compact') {
    return (
      <HStack
        w="full"
        p="2"
        bg={isCompleted ? 'green.50' : 'transparent'}
        borderRadius="md"
        _dark={{
          bg: isCompleted ? 'green.900/20' : 'transparent'
        }}
      >
        <CheckboxIcon isCompleted={isCompleted} />
        <Text
          fontSize="sm"
          fontWeight={isCompleted ? 'normal' : 'medium'}
          color={isCompleted ? 'gray.600' : 'gray.800'}
          textDecoration={isCompleted ? 'line-through' : 'none'}
          _dark={{ color: isCompleted ? 'gray.500' : 'gray.200' }}
          flex="1"
        >
          {requirement.icon} {requirement.name}
        </Text>
      </HStack>
    );
  }

  // Default & detailed variants
  return (
    <HStack
      w="full"
      p="3"
      bg={isCompleted ? 'green.50' : 'gray.50'}
      borderRadius="md"
      border="1px solid"
      borderColor={isCompleted ? 'green.200' : 'gray.200'}
      _dark={{
        bg: isCompleted ? 'green.900/20' : 'gray.700',
        borderColor: isCompleted ? 'green.700' : 'gray.600'
      }}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={() => onClick?.(requirement)}
      _hover={onClick ? {
        bg: isCompleted ? 'green.100' : 'gray.100',
        _dark: { bg: isCompleted ? 'green.900/30' : 'gray.600' }
      } : {}}
    >
      <CheckboxIcon isCompleted={isCompleted} />

      {/* Content */}
      <VStack align="start" gap="1" flex="1">
        <HStack gap="2">
          <Text fontSize="md">{requirement.icon}</Text>
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={isCompleted ? 'green.700' : 'gray.800'}
            textDecoration={isCompleted ? 'line-through' : 'none'}
            _dark={{ color: isCompleted ? 'green.300' : 'gray.200' }}
          >
            {requirement.name}
          </Text>
        </HStack>

        {variant === 'detailed' && requirement.description && (
          <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }} pl="6">
            {requirement.description}
          </Text>
        )}
      </VStack>

      {/* Badges & Actions */}
      <HStack gap="2">
        {requirement.estimatedMinutes && !isCompleted && (
          <Badge colorPalette="gray" size="sm">
            {requirement.estimatedMinutes} min
          </Badge>
        )}

        {requirement.points && (
          <Badge colorPalette="purple" size="sm">
            {requirement.points} pts
          </Badge>
        )}

        {requirement.redirectUrl && !isCompleted && (
          <Button
            size="xs"
            variant="ghost"
            colorPalette="blue"
            onClick={(e) => {
              e.stopPropagation();
              navigate(requirement.redirectUrl!);
            }}
          >
            Configurar →
          </Button>
        )}
      </HStack>
    </HStack>
  );
}

/**
 * Checkbox Icon Component
 */
function CheckboxIcon({ isCompleted }: { isCompleted: boolean }) {
  return (
    <Box
      w="20px"
      h="20px"
      borderRadius="sm"
      border="2px solid"
      borderColor={isCompleted ? 'green.500' : 'gray.400'}
      bg={isCompleted ? 'green.500' : 'transparent'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      {isCompleted && (
        <Text color="white" fontSize="xs" fontWeight="bold">
          ✓
        </Text>
      )}
    </Box>
  );
}

/**
 * Helper: Group requirements by tier
 */
function groupRequirementsByTier(
  requirements: Array<Achievement & { isCompleted: boolean }>
): Record<AchievementTier, Array<Achievement & { isCompleted: boolean }>> {
  return requirements.reduce((groups, req) => {
    const tier = req.tier;
    if (!groups[tier]) {
      groups[tier] = [];
    }
    groups[tier].push(req);
    return groups;
  }, {} as Record<AchievementTier, Array<Achievement & { isCompleted: boolean }>>);
}

/**
 * Tier Configuration
 */
const TIER_CONFIG: Record<AchievementTier, { name: string; icon: string; description: string }> = {
  mandatory: {
    name: 'Configuraciones Obligatorias',
    icon: '⚠️',
    description: 'Requeridas para operar comercialmente'
  },
  suggested: {
    name: 'Configuraciones Sugeridas',
    icon: '💡',
    description: 'Mejoran el servicio pero no bloquean'
  },
  cumulative: {
    name: 'Logros Acumulativos',
    icon: '🏆',
    description: 'Gamificación y reconocimiento'
  }
};

/**
 * Export for external use
 */
export { RequirementChecklist, RequirementItem, CheckboxIcon };
