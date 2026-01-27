/**
 * CloseShiftModal - Modal para cerrar turno operacional
 * @version 2.2 - Proper Dialog with shift summary
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  Button,
  Stack,
  TextareaField,
  Alert,
  Text,
  Box,
  HStack,
  Stat,
} from '@/shared/ui';
import { useShiftControl } from '../hooks/useShiftControl';
import { logger } from '@/lib/logging/Logger';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_ID = 'CloseShiftModal';

export function CloseShiftModal({ isOpen, onClose }: CloseShiftModalProps) {
  const {
    currentShift,
    closeShift,
    loading,
    shiftDuration,
    activeStaffCount,
    openTablesCount,
    activeDeliveriesCount,
    pendingOrdersCount
  } = useShiftControl();

  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Compute shift summary
  const shiftSummary = useMemo(() => {
    if (!currentShift) return null;

    const openedAt = new Date(currentShift.opened_at);
    const duration = shiftDuration ? `${shiftDuration} min` : 'N/A';
    const timeAgo = formatDistanceToNow(openedAt, { addSuffix: true, locale: es });

    return {
      openedAt: openedAt.toLocaleString('es-ES'),
      timeAgo,
      duration,
      hasActivity: activeStaffCount > 0 || openTablesCount > 0 || activeDeliveriesCount > 0 || pendingOrdersCount > 0
    };
  }, [currentShift, shiftDuration, activeStaffCount, openTablesCount, activeDeliveriesCount, pendingOrdersCount]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await closeShift({ notes: notes || 'Turno cerrado' });

      logger.info(MODULE_ID, 'Shift closed successfully via modal');

      // Reset form and close
      setNotes('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar el turno';
      setError(errorMessage);
      logger.error(MODULE_ID, 'Failed to close shift', { error: err });
    }
  }, [closeShift, notes, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setNotes('');
      setError(null);
      onClose();
    }
  }, [loading, onClose]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && handleClose()}
      size="lg"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>Cerrar Turno Operacional</Dialog.Title>
              <Dialog.Description>
                Revisa el resumen del turno antes de cerrarlo
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="4">
                {error && (
                  <Alert.Root status="error">
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Root>
                )}

                {/* Shift Summary */}
                {shiftSummary && (
                  <Box
                    p="4"
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.200"
                    bg="gray.50"
                  >
                    <Stack gap="3">
                      <Text fontWeight="semibold" fontSize="sm" color="gray.700">
                        Resumen del Turno
                      </Text>

                      <HStack gap="4" flexWrap="wrap">
                        <Stat.Root size="sm">
                          <Stat.Label>Iniciado</Stat.Label>
                          <Stat.ValueText fontSize="xs">{shiftSummary.openedAt}</Stat.ValueText>
                          <Stat.HelpText>{shiftSummary.timeAgo}</Stat.HelpText>
                        </Stat.Root>

                        <Stat.Root size="sm">
                          <Stat.Label>Duración</Stat.Label>
                          <Stat.ValueText>{shiftSummary.duration}</Stat.ValueText>
                        </Stat.Root>

                        {activeStaffCount > 0 && (
                          <Stat.Root size="sm">
                            <Stat.Label>Personal Activo</Stat.Label>
                            <Stat.ValueText>{activeStaffCount}</Stat.ValueText>
                          </Stat.Root>
                        )}
                      </HStack>

                      {/* Activity warnings */}
                      {(openTablesCount > 0 || activeDeliveriesCount > 0 || pendingOrdersCount > 0) && (
                        <Alert.Root status="warning" size="sm">
                          <Alert.Description>
                            <Stack gap="1">
                              {openTablesCount > 0 && <Text fontSize="xs">• {openTablesCount} mesas abiertas</Text>}
                              {activeDeliveriesCount > 0 && <Text fontSize="xs">• {activeDeliveriesCount} entregas activas</Text>}
                              {pendingOrdersCount > 0 && <Text fontSize="xs">• {pendingOrdersCount} órdenes pendientes</Text>}
                            </Stack>
                          </Alert.Description>
                        </Alert.Root>
                      )}
                    </Stack>
                  </Box>
                )}

                <TextareaField
                  label="Notas de Cierre (Opcional)"
                  helperText="Agrega observaciones sobre el cierre del turno"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Cierre sin pendientes, inventario verificado"
                  rows={3}
                  disabled={loading}
                />

                <Alert.Root status="info" size="sm">
                  <Alert.Description>
                    Al cerrar el turno, se deshabilitarán las operaciones hasta que se abra uno nuevo.
                  </Alert.Description>
                </Alert.Root>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>

              <Button
                type="submit"
                colorPalette="red"
                loading={loading}
              >
                Cerrar Turno
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
