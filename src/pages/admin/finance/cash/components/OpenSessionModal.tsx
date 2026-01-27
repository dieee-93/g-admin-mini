/**
 * Open Session Modal
 * Modal para abrir una nueva sesión de caja
 */

import { useState } from 'react';
import { Dialog } from '@/shared/ui';
import { Button, Stack, Input, Textarea, Text } from '@chakra-ui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { MoneyLocationWithAccount, OpenCashSessionInput } from '@/modules/cash/types';
import { formatCurrency } from '@/lib/decimal';

interface OpenSessionModalProps {
  isOpen: boolean;
  location: MoneyLocationWithAccount | null;
  onClose: () => void;
  onConfirm: (input: OpenCashSessionInput) => Promise<void>;
  isLoading?: boolean;
}

export function OpenSessionModal({
  isOpen,
  location,
  onClose,
  onConfirm,
  isLoading = false,
}: OpenSessionModalProps) {
  const [startingCash, setStartingCash] = useState(
    location?.default_float?.toString() || '5000'
  );
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    if (!location) return;

    const amount = parseFloat(startingCash);
    if (isNaN(amount) || amount < 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    await onConfirm({
      money_location_id: location.id,
      location_id: location.location_id,
      starting_cash: amount,
      opening_notes: notes || undefined,
    });

    // Reset form
    setStartingCash(location.default_float?.toString() || '5000');
    setNotes('');
  };

  const handleClose = () => {
    setStartingCash(location?.default_float?.toString() || '5000');
    setNotes('');
    onClose();
  };

  if (!location) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Abrir Sesión de Caja</Dialog.Title>
          <Dialog.CloseTrigger onClick={handleClose}>
              <XMarkIcon className="w-5 h-5" />
            </Dialog.CloseTrigger>
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap={4}>
            <Stack gap="2">
              <Text fontWeight="600">Ubicación</Text>
              <Stack gap={1}>
                <Text fontWeight="bold">{location.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {location.account_code} - {location.account_name}
                </Text>
              </Stack>
            </Stack>

            <Stack gap="2">
              <Text fontWeight="600">Fondo Inicial (ARS) *</Text>
              <Input
                type="number"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                min="0"
                step="0.01"
                placeholder="5000.00"
              />
              {location.default_float && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Fondo sugerido: {formatCurrency(location.default_float)}
                </Text>
              )}
            </Stack>

            <Stack gap="2">
              <Text fontWeight="600">Notas de Apertura</Text>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones iniciales (opcional)..."
                rows={3}
              />
            </Stack>
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
            <Stack direction="row" gap="3" justify="end">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            colorPalette="green"
            onClick={handleConfirm}
            loading={isLoading}
          >
            Abrir Caja
          </Button>
        </Stack>
          </Dialog.Footer>
      </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
