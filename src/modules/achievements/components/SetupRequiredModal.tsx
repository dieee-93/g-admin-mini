/**
 * SETUP REQUIRED MODAL
 *
 * Modal que se muestra cuando el usuario intenta realizar una operación comercial
 * sin haber completado los requisitos obligatorios.
 *
 * Características:
 * - Lista de requirements faltantes
 * - Progreso visual
 * - Enlaces directos a configuración
 * - Cierre con backdrop click
 *
 * Usado cuando:
 * - Toggle TakeAway público → Falta configuración
 * - Abrir Turno Dine-In → Falta configuración
 * - Activar E-commerce → Falta configuración
 *
 * @version 1.0.0
 */

import {
  Dialog,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Box
} from '@/shared/ui';
import { useNavigationActions } from '@/contexts/NavigationContext';
import type { Achievement, ValidationResult } from '../types';
import { RequirementRow } from './CapabilityProgressCard';

interface SetupRequiredModalProps {
  /**
   * Estado de apertura del modal
   */
  open: boolean;

  /**
   * Callback para cerrar el modal
   */
  onClose: () => void;

  /**
   * Resultado de la validación con requirements faltantes
   */
  validationResult?: ValidationResult;

  /**
   * Título personalizado del modal
   */
  title?: string;

  /**
   * Mensaje personalizado
   */
  message?: string;
}

/**
 * Modal Component
 */
export default function SetupRequiredModal({
  open,
  onClose,
  validationResult,
  title = 'Configuración Requerida',
  message
}: SetupRequiredModalProps) {
  const { navigate } = useNavigationActions();

  if (!validationResult?.missingRequirements) {
    return null; // No mostrar modal si no hay requirements faltantes
  }

  const {
    missingRequirements,
    progressPercentage = 0,
    reason
  } = validationResult;

  const totalMissing = missingRequirements.length;

  return (
    <Dialog.Root open={open} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px" data-testid="requirements-modal">
          <Dialog.Header>
            <VStack align="start" gap="2" w="full">
              <HStack gap="3">
                <Text fontSize="3xl">⚠️</Text>
                <Heading size="lg" color="orange.700" _dark={{ color: 'orange.300' }}>
                  {title}
                </Heading>
              </HStack>

              {/* Progress Bar */}
              <Box w="full">
                <HStack justify="space-between" mb="2">
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                    Progreso de Configuración
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color="orange.600">
                    {progressPercentage}%
                  </Text>
                </HStack>
                <Box
                  h="6px"
                  w="full"
                  bg="gray.200"
                  borderRadius="full"
                  overflow="hidden"
                  _dark={{ bg: 'gray.700' }}
                >
                  <Box
                    h="full"
                    w={`${progressPercentage}%`}
                    bg="orange.500"
                    transition="width 0.3s"
                  />
                </Box>
              </Box>
            </VStack>
          </Dialog.Header>

          <Dialog.Body>
            <VStack align="start" gap="4" w="full">
              {/* Message */}
              <Box
                p="4"
                bg="orange.50"
                borderRadius="md"
                border="1px solid"
                borderColor="orange.200"
                _dark={{
                  bg: 'orange.900/20',
                  borderColor: 'orange.700'
                }}
              >
                <Text color="orange.800" _dark={{ color: 'orange.300' }}>
                  {message || reason || `Necesitas completar ${totalMissing} configuraciones antes de continuar.`}
                </Text>
              </Box>

              {/* Missing Requirements List */}
              <VStack w="full" gap="3">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700" _dark={{ color: 'gray.300' }} data-testid="missing-count">
                    Pasos Pendientes ({totalMissing})
                  </Text>
                  <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }} data-testid="total-estimated-time">
                    Tiempo estimado: {calculateTotalTime(missingRequirements)} min
                  </Text>
                </HStack>

                <VStack w="full" gap="2">
                  {missingRequirements.map((req, index) => (
                    <RequirementRow
                      key={req.id}
                      requirement={req}
                      index={index}
                      onClick={(requirement) => {
                        if (requirement.redirectUrl) {
                          navigate(requirement.redirectUrl);
                          onClose();
                        }
                      }}
                    />
                  ))}
                </VStack>
              </VStack>

              {/* Helper Text */}
              <Box
                p="3"
                bg="blue.50"
                borderRadius="md"
                border="1px solid"
                borderColor="blue.200"
                _dark={{
                  bg: 'blue.900/20',
                  borderColor: 'blue.700'
                }}
              >
                <HStack gap="2">
                  <Text fontSize="lg">💡</Text>
                  <Text fontSize="sm" color="blue.800" _dark={{ color: 'blue.300' }}>
                    <strong>Consejo:</strong> Puedes completar estos pasos en cualquier orden.
                    Haz click en "Configurar →" para ir directamente a cada sección.
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack justify="space-between" w="full">
              <Button
                variant="ghost"
                colorPalette="gray"
                onClick={onClose}
              >
                Cerrar
              </Button>

              <Button
                colorPalette="orange"
                onClick={() => {
                  navigate('gamification', '/achievements');
                  onClose();
                }}
              >
                Ver Todos los Pasos
              </Button>
            </HStack>
          </Dialog.Footer>

          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

/**
 * Helper: Calculate total estimated time
 */
function calculateTotalTime(requirements: Achievement[]): number {
  return requirements.reduce((total, req) => {
    return total + (req.estimatedMinutes || 0);
  }, 0);
}

/**
 * Export for external use
 */
export { SetupRequiredModal };
