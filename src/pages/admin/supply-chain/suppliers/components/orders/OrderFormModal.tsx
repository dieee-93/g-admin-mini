/**
 * OrderFormModal - Create/Edit Supplier Orders
 */

import React from 'react';
import {
  Dialog,
  Stack,
  Button,
  Text
} from '@/shared/ui';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderFormModal = React.memo(function OrderFormModal({
  isOpen,
  onClose
}: OrderFormModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Nueva Orden de Compra</Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger />

          <Dialog.Body>
            <Stack gap="4">
              <Text>
                Formulario de orden de compra (en desarrollo)
              </Text>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Stack direction="row" gap="3" justify="end">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button colorPalette="blue">
                Crear Orden
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
});

export default OrderFormModal;