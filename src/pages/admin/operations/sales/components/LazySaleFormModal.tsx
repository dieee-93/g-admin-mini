import { Modal, Button, Stack, Typography, Alert } from '@/shared/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface LazySaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Placeholder para modal de ventas
export function LazySaleFormModal({ isOpen, onClose }: LazySaleFormModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <Modal.Content>
        <Modal.Header>
          <Typography variant="heading" size="lg">
            Procesar Nueva Venta
          </Typography>
          <Modal.CloseTrigger asChild>
            <Button variant="ghost" size="sm">
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </Modal.CloseTrigger>
        </Modal.Header>

        <Modal.Body>
          <Stack gap="md">
            <Alert
              variant="subtle"
              title="Modal en Desarrollo"
              description="Este modal será implementado con el formulario completo de ventas integrado con el sistema POS."
            />

            <Typography variant="body">
              Funcionalidades a implementar:
            </Typography>

            <Stack gap="sm" pl="md">
              <Typography variant="body" size="sm">• Selección de productos</Typography>
              <Typography variant="body" size="sm">• Cálculo automático de totales</Typography>
              <Typography variant="body" size="sm">• Procesamiento de pagos</Typography>
              <Typography variant="body" size="sm">• Integración con cocina</Typography>
              <Typography variant="body" size="sm">• Actualización de inventario</Typography>
            </Stack>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="solid" onClick={onClose} colorPalette="teal">
            Procesar Venta
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}