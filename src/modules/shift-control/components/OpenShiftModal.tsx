/**
 * OpenShiftModal - Modal para abrir turno operacional
 * @version 2.2 - Proper Dialog implementation with form
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  Button,
  Stack,
  TextareaField,
  Alert,
  Text
} from '@/shared/ui';
import { useShiftControl } from '../hooks/useShiftControl';
import { logger } from '@/lib/logging/Logger';

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_ID = 'OpenShiftModal';

export function OpenShiftModal({ isOpen, onClose }: OpenShiftModalProps) {
  const { openShift, loading } = useShiftControl();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await openShift({ notes: notes || 'Turno iniciado' });

      logger.info(MODULE_ID, 'Shift opened successfully via modal');

      // Reset form and close
      setNotes('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al abrir el turno';
      setError(errorMessage);
      logger.error(MODULE_ID, 'Failed to open shift', { error: err });
    }
  }, [openShift, notes, onClose]);

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
      size="md"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <form onSubmit={handleSubmit}>
            <Dialog.Header>
              <Dialog.Title>Abrir Turno Operacional</Dialog.Title>
              <Dialog.Description>
                Inicia un nuevo turno operacional para tu negocio
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

                <TextareaField
                  label="Notas (Opcional)"
                  helperText="Agrega notas sobre el inicio del turno"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Turno de mañana, inventario completo"
                  rows={3}
                  disabled={loading}
                />

                <Text fontSize="sm" color="gray.600">
                  Al abrir el turno, se habilitarán todas las operaciones del negocio.
                </Text>
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
                colorPalette="green"
                loading={loading}
              >
                Abrir Turno
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
