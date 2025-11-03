/**
 * CAPABILITY PROGRESS CARD
 *
 * Card component que muestra el progreso de una capability específica:
 * - Nombre de la capability
 * - Progreso visual (barra de progreso)
 * - Lista de requirements completados/pendientes
 * - Enlaces directos a configuración
 *
 * Usado en:
 * - SetupRequiredModal
 * - Página de Achievements
 *
 * @version 1.0.0
 */

import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Icon
} from '@/shared/ui';
import type { CapabilityProgress } from '../types';
import type { Achievement } from '../types';
import type { BusinessCapabilityId } from '@/config/types';

/**
 * Mapeo de capabilities a nombres e iconos
 */
const CAPABILITY_CONFIG: Record<BusinessCapabilityId, { name: string; icon: string }> = {
  onsite_service: { name: 'Servicio en el Local (Dine-In)', icon: '🍽️' },
  pickup_orders: { name: 'Retiro en el Local (TakeAway)', icon: '🥡' },
  online_store: { name: 'Comercio Electrónico', icon: '🛒' },
  delivery_shipping: { name: 'Envío a Domicilio', icon: '🚚' },
  corporate_sales: { name: 'Ventas Corporativas (B2B)', icon: '🏢' },
  production_workflow: { name: 'Producción', icon: '🏭' },
  appointment_based: { name: 'Servicios con Cita Previa', icon: '📅' },
  mobile_operations: { name: 'Operaciones Móviles', icon: '🚚' }
};

interface CapabilityProgressCardProps extends CapabilityProgress {
  /**
   * Lista de requirements para mostrar detalle
   */
  requirements?: Achievement[];

  /**
   * Variant del card
   */
  variant?: 'default' | 'compact' | 'detailed';

  /**
   * Callback cuando se completa un requirement
   */
  onRequirementClick?: (requirement: Achievement) => void;
}

/**
 * Card Component
 */
export default function CapabilityProgressCard({
  capability,
  total,
  completed,
  percentage,
  isOperational,
  requirements = [],
  variant = 'default',
  onRequirementClick
}: CapabilityProgressCardProps) {
  const navigate = useNavigate();
  const config = CAPABILITY_CONFIG[capability];

  if (!config) {
    return null; // Capability no reconocida
  }

  // Variant compact: Solo barra de progreso
  if (variant === 'compact') {
    return (
      <Box
        p="3"
        bg="white"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        _dark={{
          bg: 'gray.800',
          borderColor: 'gray.700'
        }}
      >
        <HStack justify="space-between">
          <HStack gap="2">
            <Text fontSize="lg">{config.icon}</Text>
            <VStack align="start" gap="0">
              <Text fontSize="sm" fontWeight="medium">
                {config.name}
              </Text>
              <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                {completed} de {total}
              </Text>
            </VStack>
          </HStack>

          <Badge
            colorPalette={isOperational ? 'green' : 'orange'}
            size="sm"
          >
            {isOperational ? '✓ Completo' : `${percentage}%`}
          </Badge>
        </HStack>

        {/* Progress Bar */}
        <Box
          mt="2"
          h="6px"
          w="full"
          bg="gray.200"
          borderRadius="full"
          overflow="hidden"
          _dark={{ bg: 'gray.700' }}
        >
          <Box
            h="full"
            w={`${percentage}%`}
            bg={isOperational ? 'green.500' : 'orange.500'}
            transition="width 0.3s"
          />
        </Box>
      </Box>
    );
  }

  // Variant default & detailed: Full card con requirements
  return (
    <Box
      p="5"
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor={isOperational ? 'green.200' : 'orange.200'}
      _dark={{
        bg: 'gray.800',
        borderColor: isOperational ? 'green.700' : 'orange.700'
      }}
    >
      <VStack align="start" gap="4" w="full">
        {/* Header */}
        <HStack justify="space-between" w="full">
          <HStack gap="3">
            <Text fontSize="3xl">{config.icon}</Text>
            <VStack align="start" gap="0">
              <Heading size="md" color="gray.800" _dark={{ color: 'gray.200' }}>
                {config.name}
              </Heading>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                {completed} de {total} configuraciones completadas
              </Text>
            </VStack>
          </HStack>

          <Badge
            colorPalette={isOperational ? 'green' : 'orange'}
            size="lg"
          >
            {isOperational ? '✓ Operacional' : 'Pendiente'}
          </Badge>
        </HStack>

        {/* Progress Bar */}
        <Box w="full">
          <HStack justify="space-between" mb="2">
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              Progreso
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={isOperational ? 'green.600' : 'orange.600'}>
              {percentage}%
            </Text>
          </HStack>
          <Box
            h="8px"
            w="full"
            bg="gray.200"
            borderRadius="full"
            overflow="hidden"
            _dark={{ bg: 'gray.700' }}
          >
            <Box
              h="full"
              w={`${percentage}%`}
              bg={isOperational ? 'green.500' : 'orange.500'}
              transition="width 0.3s"
            />
          </Box>
        </Box>

        {/* Requirements List (only in detailed variant) */}
        {variant === 'detailed' && requirements.length > 0 && (
          <VStack w="full" gap="2" mt="2">
            <Text fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }}>
              Pasos de Configuración:
            </Text>
            {requirements.map((req, index) => (
              <RequirementRow
                key={req.id}
                requirement={req}
                index={index}
                onClick={onRequirementClick}
              />
            ))}
          </VStack>
        )}

        {/* Action Buttons */}
        {!isOperational && (
          <Button
            size="sm"
            colorPalette="orange"
            variant="outline"
            w="full"
            onClick={() => navigate('/admin/gamification/achievements')}
          >
            Completar Configuración ({total - completed} pendientes)
          </Button>
        )}
      </VStack>
    </Box>
  );
}

/**
 * Requirement Row - Individual requirement in the list
 */
function RequirementRow({
  requirement,
  index,
  onClick
}: {
  requirement: Achievement;
  index: number;
  onClick?: (req: Achievement) => void;
}) {
  const navigate = useNavigate();

  // Determinar si está completo (esto debería venir del validation context)
  // Por ahora, asumimos que si tiene validator, está pendiente
  const isCompleted = false; // TODO: Integrate with validation context

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
      _hover={onClick ? { bg: 'gray.100', _dark: { bg: 'gray.600' } } : {}}
    >
      {/* Checkbox Icon */}
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

      {/* Requirement Info */}
      <VStack align="start" gap="0" flex="1">
        <HStack gap="2">
          <Text fontSize="sm">{requirement.icon}</Text>
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={isCompleted ? 'green.700' : 'gray.800'}
            _dark={{ color: isCompleted ? 'green.300' : 'gray.200' }}
          >
            {requirement.name}
          </Text>
        </HStack>
        {requirement.description && (
          <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
            {requirement.description}
          </Text>
        )}
      </VStack>

      {/* Time Estimate */}
      {requirement.estimatedMinutes && (
        <Badge colorPalette="gray" size="sm">
          {requirement.estimatedMinutes} min
        </Badge>
      )}

      {/* Go to Config Button */}
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
  );
}

/**
 * Export individual components for reuse
 */
export { RequirementRow };
