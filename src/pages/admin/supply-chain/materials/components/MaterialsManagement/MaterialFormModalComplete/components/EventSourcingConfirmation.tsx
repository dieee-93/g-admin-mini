/**
 * EventSourcingConfirmation Modal
 * Shows Event Sourcing metadata preview before saving material with stock
 * Implements wizard pattern for UX transparency
 */

import React, { useCallback } from 'react';
import {
  Dialog,
  Stack,
  Button,
  Text,
  Alert,
  Box,
  Badge
} from '@/shared/ui';
import { DecimalUtils } from '@/lib/decimal';
import type { MaterialFormData } from '../../../types/materialTypes';

interface EventSourcingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  formData: MaterialFormData;
  isSubmitting: boolean;
}

export const EventSourcingConfirmation = React.memo(function EventSourcingConfirmation({
  isOpen,
  onClose,
  onConfirm,
  formData,
  isSubmitting
}: EventSourcingConfirmationProps) {
  
  const handleConfirm = async () => {
    await onConfirm();
  };

  // ⚡ PERFORMANCE: Memoize Dialog callback
  const handleOpenChange = useCallback((e: { open: boolean }) => {
    if (!e.open && !isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Calculate costs
  const quantity = formData.initial_stock || 0;
  const unitCost = formData.unit_cost || 0;
  const totalCost = DecimalUtils.multiply(
    DecimalUtils.fromValue(quantity, 'quantity'),
    DecimalUtils.fromValue(unitCost, 'currency'),
    'currency'
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="2xl">
          <Dialog.Header>
            <Dialog.Title>Confirmar Creación con Event Sourcing</Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger disabled={isSubmitting} />

          <Dialog.Body>
            <Stack gap="5">
              {/* Event Sourcing Badge */}
              <Alert status="info" variant="subtle">
                <Stack gap="2">
                  <Stack direction="row" align="center" gap="2">
                    <Badge colorPalette="purple" variant="solid">
                      Event Sourcing Activado
                    </Badge>
                    <Text fontSize="sm" fontWeight="semibold">
                      Sistema de Auditoría Completa
                    </Text>
                  </Stack>
                  <Text fontSize="sm" color="fg.muted">
                    Esta operación quedará registrada con metadatos completos para trazabilidad y auditoría.
                  </Text>
                </Stack>
              </Alert>

              {/* Preview Section */}
              <Stack gap="4">
                <Text fontSize="lg" fontWeight="semibold">
                  Vista Previa de la Operación
                </Text>

                {/* Material Info */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p="4"
                  bg="bg.subtle"
                >
                  <Stack gap="3">
                    <Text fontSize="md" fontWeight="semibold" color="blue.600">
                      📦 Material
                    </Text>
                    <Stack gap="2">
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Nombre:</Text>
                        <Text fontSize="sm" fontWeight="medium">{formData.name}</Text>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Tipo:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formData.type === 'MEASURABLE' ? 'Medible' :
                           formData.type === 'COUNTABLE' ? 'Contable' :
                           'Elaborado'}
                        </Text>
                      </Stack>
                      {formData.category && (
                        <Stack direction="row" justify="space-between">
                          <Text fontSize="sm" color="fg.muted">Categoría:</Text>
                          <Text fontSize="sm" fontWeight="medium">{formData.category}</Text>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Box>

                {/* Stock Entry Info */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p="4"
                  bg="bg.subtle"
                >
                  <Stack gap="3">
                    <Text fontSize="md" fontWeight="semibold" color="green.600">
                      📈 Entrada de Stock
                    </Text>
                    <Stack gap="2">
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Cantidad:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {quantity} {formData.unit || 'unidades'}
                        </Text>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Costo Unitario:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          ${DecimalUtils.formatCurrency(DecimalUtils.fromValue(unitCost, 'currency'))}
                        </Text>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Costo Total:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                          ${DecimalUtils.formatCurrency(totalCost)}
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>

                {/* Supplier Info */}
                {formData.supplier?.name && (
                  <Box
                    borderWidth="1px"
                    borderRadius="md"
                    p="4"
                    bg="bg.subtle"
                  >
                    <Stack gap="3">
                      <Text fontSize="md" fontWeight="semibold" color="purple.600">
                        🏢 Proveedor
                      </Text>
                      <Stack gap="2">
                        <Stack direction="row" justify="space-between">
                          <Text fontSize="sm" color="fg.muted">Nombre:</Text>
                          <Text fontSize="sm" fontWeight="medium">{formData.supplier.name}</Text>
                        </Stack>
                        {formData.supplier.contact && (
                          <Stack direction="row" justify="space-between">
                            <Text fontSize="sm" color="fg.muted">Contacto:</Text>
                            <Text fontSize="sm" fontWeight="medium">{formData.supplier.contact}</Text>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                )}

                {/* Event Sourcing Metadata */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p="4"
                  bg="purple.50"
                  borderColor="purple.200"
                >
                  <Stack gap="3">
                    <Text fontSize="md" fontWeight="semibold" color="purple.700">
                      🔍 Metadatos de Auditoría
                    </Text>
                    <Stack gap="2">
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Tipo de Evento:</Text>
                        <Badge colorPalette="purple" variant="subtle">
                          material_created_with_stock
                        </Badge>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Usuario:</Text>
                        <Text fontSize="sm" fontWeight="medium">Usuario Actual</Text>
                      </Stack>
                      <Stack direction="row" justify="space-between">
                        <Text fontSize="sm" color="fg.muted">Timestamp:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {new Date().toLocaleString()}
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              {/* Warning */}
              <Alert status="warning" variant="subtle">
                <Text fontSize="sm">
                  <strong>Nota:</strong> Esta operación creará registros permanentes en el sistema de Event Sourcing.
                  Los datos quedarán disponibles para auditorías futuras.
                </Text>
              </Alert>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Stack direction="row" gap="3" justify="space-between" w="full">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ← Volver Atrás
              </Button>
              <Button
                colorPalette="purple"
                variant="solid"
                onClick={handleConfirm}
                loading={isSubmitting}
                loadingText="Guardando..."
                fontWeight="600"
              >
                Confirmar y Guardar →
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
});

export default EventSourcingConfirmation;
