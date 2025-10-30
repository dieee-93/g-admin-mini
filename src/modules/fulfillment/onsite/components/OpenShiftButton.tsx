/**
 * OPEN SHIFT BUTTON COMPONENT
 *
 * Componente inyectado via Hook System en Floor Module.
 * Maneja la apertura de turno operativo con validación de requirements Dine-In.
 *
 * VALIDACIÓN:
 * - Antes de abrir turno, valida que se cumplan TODOS los requirements obligatorios Dine-In
 * - Si falta configuración, muestra SetupRequiredModal con pasos pendientes
 * - Solo permite abrir turno si validación pasa
 *
 * INTEGRACIÓN:
 * - Inyectado vía hook 'floor.toolbar.actions'
 * - Usa ValidationContext para validar
 * - Usa ModuleRegistry para ejecutar achievements.validate_commercial_operation
 * - Usa achievementsStore para estado del modal
 *
 * @version 1.0.0
 */

import { useState } from 'react';
import { Button, Badge, Box, HStack, Text } from '@/shared/ui';
import { PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { useValidationContext } from '@/hooks/useValidationContext';
import { useCapabilities } from '@/lib/capabilities';
import { ModuleRegistry } from '@/lib/modules';
import { useAchievementsStore } from '@/store/achievementsStore';
import { SetupRequiredModal } from '@/modules/achievements/components';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { ValidationResult } from '@/modules/achievements/types';

/**
 * Open Shift Button Component
 */
export default function OpenShiftButton() {
  const { hasFeature } = useCapabilities();
  const context = useValidationContext();
  const registry = ModuleRegistry.getInstance();

  // Local state
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Modal state from achievements store
  const showSetupModal = useAchievementsStore(state => state.showSetupModal);
  const setShowSetupModal = useAchievementsStore(state => state.setShowSetupModal);

  // Solo mostrar si la feature está activa
  if (!hasFeature('sales_dine_in_orders')) {
    return null;
  }

  /**
   * Handle Open Shift
   */
  const handleOpenShift = () => {
    // Validar requirements
    logger.debug('Floor', 'Validando requirements Dine-In...');

    const results = registry.doAction('achievements.validate_commercial_operation', {
      capability: 'onsite_service',
      action: 'dinein:open_shift',
      context
    });

    const result: ValidationResult = results[0] || {
      allowed: false,
      reason: 'No se pudo validar la configuración'
    };

    logger.debug('Floor', 'Resultado de validación Dine-In:', result);

    if (result.allowed) {
      // ✅ VALIDACIÓN EXITOSA - Abrir turno
      setIsShiftOpen(true);
      setValidationResult(null);

      logger.info('Floor', '✅ Turno abierto exitosamente');

      toaster.create({
        title: '✅ Turno Abierto',
        description: 'El turno operativo ha sido iniciado correctamente',
        type: 'success',
        duration: 5000
      });
    } else {
      // ❌ VALIDACIÓN FALLIDA - Mostrar modal con requirements faltantes
      setValidationResult(result);
      setShowSetupModal(true);

      logger.warn('Floor', '❌ No se puede abrir turno - Faltan configuraciones', {
        missing: result.missingRequirements?.length || 0,
        percentage: result.progressPercentage || 0
      });

      toaster.create({
        title: 'Configuración Incompleta',
        description: result.reason || 'Completa la configuración antes de abrir turno',
        type: 'warning',
        duration: 4000
      });
    }
  };

  /**
   * Handle Close Shift
   */
  const handleCloseShift = () => {
    setIsShiftOpen(false);
    logger.info('Floor', 'Turno cerrado');

    toaster.create({
      title: 'Turno Cerrado',
      description: 'El turno operativo ha sido finalizado',
      type: 'info',
      duration: 3000
    });
  };

  return (
    <>
      <Box
        p="3"
        bg={isShiftOpen ? 'green.50' : 'white'}
        borderRadius="md"
        border="2px solid"
        borderColor={isShiftOpen ? 'green.500' : 'gray.200'}
        _dark={{
          bg: isShiftOpen ? 'green.900/20' : 'gray.800',
          borderColor: isShiftOpen ? 'green.500' : 'gray.700'
        }}
      >
        <HStack gap="3" justify="space-between">
          <HStack gap="2">
            <Text fontSize="lg">🏢</Text>
            <Box>
              <HStack gap="2">
                <Text fontSize="sm" fontWeight="medium" color="gray.800" _dark={{ color: 'gray.200' }}>
                  Turno Operativo
                </Text>
                <Badge
                  colorPalette={isShiftOpen ? 'green' : 'gray'}
                  size="sm"
                >
                  {isShiftOpen ? 'Abierto' : 'Cerrado'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                {isShiftOpen ? 'Sistema activo para servicio Dine-In' : 'Abrir turno para comenzar operaciones'}
              </Text>
            </Box>
          </HStack>

          {!isShiftOpen ? (
            <Button
              onClick={handleOpenShift}
              colorPalette="green"
              size="sm"
              variant="solid"
            >
              <Icon icon={PlayIcon} size="sm" />
              Abrir Turno
            </Button>
          ) : (
            <Button
              onClick={handleCloseShift}
              colorPalette="red"
              size="sm"
              variant="outline"
            >
              <Icon icon={StopIcon} size="sm" />
              Cerrar Turno
            </Button>
          )}
        </HStack>
      </Box>

      {/* Modal de Setup Requerido */}
      <SetupRequiredModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        validationResult={validationResult || undefined}
        title="Configuración Dine-In Requerida"
        message="Necesitas completar la configuración básica antes de abrir el turno operativo."
      />
    </>
  );
}

/**
 * Export for hook injection
 */
export { OpenShiftButton };
