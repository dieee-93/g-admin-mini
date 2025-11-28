/**
 * TAKEAWAY TOGGLE COMPONENT
 *
 * Componente inyectado via Hook System en Sales Module.
 * Maneja la activación/desactivación de pedidos TakeAway con validación de requirements.
 *
 * VALIDACIÓN:
 * - Antes de activar TakeAway público, valida que se cumplan TODOS los requirements obligatorios
 * - Si falta configuración, muestra SetupRequiredModal con pasos pendientes
 * - Solo permite toggle ON si validación pasa
 *
 * INTEGRACIÓN:
 * - Inyectado vía hook 'sales.toolbar.actions'
 * - Usa ValidationContext para validar
 * - Usa ModuleRegistry para ejecutar achievements.validate_commercial_operation
 * - Usa achievementsStore para estado del modal
 *
 * @version 1.0.0
 */

import { useState } from 'react';
import { HStack, Text, Switch, Badge, Box } from '@/shared/ui';
import { useValidationContext } from '@/hooks/useValidationContext';
import { useCapabilities } from '@/lib/capabilities';
import { ModuleRegistry } from '@/lib/modules';
import { useAchievementsStore } from '@/store/achievementsStore';
import { SetupRequiredModal } from '@/modules/achievements/components';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';
import type { ValidationResult } from '@/modules/achievements/types';

/**
 * TakeAway Toggle Component
 */
export default function TakeAwayToggle() {
  const { hasFeature } = useCapabilities();
  const context = useValidationContext();
  const registry = ModuleRegistry.getInstance();

  // Local state
  const [isTakeAwayActive, setIsTakeAwayActive] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Modal state from achievements store
  const isSetupModalOpen = useAchievementsStore(state => state.isSetupModalOpen);
  const openSetupModal = useAchievementsStore(state => state.openSetupModal);
  const closeSetupModal = useAchievementsStore(state => state.closeSetupModal);

  // Solo mostrar si la feature está activa
  if (!hasFeature('sales_pickup_orders')) {
    return null;
  }

  /**
   * Handle toggle change
   */
  const handleToggle = (details: { checked: boolean }) => {
    const newValue = details.checked;

    // Si está desactivando, permitir sin validación
    if (!newValue) {
      setIsTakeAwayActive(false);
      logger.info('Sales', 'TakeAway desactivado');

      toaster.create({
        title: 'TakeAway Desactivado',
        description: 'Los pedidos públicos han sido desactivados',
        type: 'info',
        duration: 3000
      });
      return;
    }

    // Si está ACTIVANDO, validar requirements
    logger.debug('Sales', 'Validando requirements TakeAway...');

    const results = registry.doAction('achievements.validate_commercial_operation', {
      capability: 'pickup_orders',
      action: 'takeaway:toggle_public',
      context
    });

    const result: ValidationResult = results[0] || {
      allowed: false,
      reason: 'No se pudo validar la configuración'
    };

    logger.debug('Sales', 'Resultado de validación TakeAway:', result);

    if (result.allowed) {
      // ✅ VALIDACIÓN EXITOSA - Activar TakeAway
      setIsTakeAwayActive(true);
      setValidationResult(null);

      logger.info('Sales', '✅ TakeAway activado exitosamente');

      toaster.create({
        title: '✅ TakeAway Activado',
        description: 'Tu negocio ahora acepta pedidos TakeAway públicos',
        type: 'success',
        duration: 5000
      });
    } else {
      // ❌ VALIDACIÓN FALLIDA - Mostrar modal con requirements faltantes
      setValidationResult(result);
      openSetupModal({ validationResult: result });

      logger.warn('Sales', '❌ No se puede activar TakeAway - Faltan configuraciones', {
        missing: result.missingRequirements?.length || 0,
        percentage: result.progressPercentage || 0
      });

      toaster.create({
        title: 'Configuración Incompleta',
        description: result.reason || 'Completa la configuración antes de activar TakeAway',
        type: 'warning',
        duration: 4000
      });
    }
  };

  return (
    <>
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
        <HStack gap="3" justify="space-between">
          <HStack gap="2">
            <Text fontSize="lg">🥡</Text>
            <Box>
              <HStack gap="2">
                <Text fontSize="sm" fontWeight="medium" color="gray.800" _dark={{ color: 'gray.200' }}>
                  TakeAway Público
                </Text>
                {isTakeAwayActive && (
                  <Badge colorPalette="green" size="sm" data-testid="takeaway-status-badge">
                    Activo
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                Permitir pedidos para retirar en el local
              </Text>
            </Box>
          </HStack>

          <Switch
            data-testid="toggle-takeaway-public"
            checked={isTakeAwayActive}
            onCheckedChange={handleToggle}
            colorPalette="green"
            size="md"
          />
        </HStack>
      </Box>

      {/* Modal de Setup Requerido */}
      <SetupRequiredModal
        open={isSetupModalOpen}
        onClose={closeSetupModal}
        validationResult={validationResult || undefined}
        title="Configuración TakeAway Requerida"
        message="Necesitas completar la configuración básica antes de aceptar pedidos públicos TakeAway."
      />
    </>
  );
}

/**
 * Export for hook injection
 */
export { TakeAwayToggle };
