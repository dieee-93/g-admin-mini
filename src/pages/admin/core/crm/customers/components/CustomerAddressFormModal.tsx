import { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Button,
  InputField,
  TextareaField,
  Checkbox,
} from '@/shared/ui';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';
import {
  createCustomerAddress,
  updateCustomerAddress,
} from '../services/customerAddressesApi';
import type { CustomerAddress, CreateCustomerAddressData } from '../types/customerAddress';

interface CustomerAddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  address?: CustomerAddress; // If provided, edit mode
  onSaved?: (address: CustomerAddress) => void;
}

export function CustomerAddressFormModal({
  isOpen,
  onClose,
  customerId,
  address,
  onSaved,
}: CustomerAddressFormModalProps) {
  const isEditMode = !!address;

  // Form state
  const [label, setLabel] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load address data when editing
  useEffect(() => {
    if (address) {
      setLabel(address.label || '');
      setAddressLine1(address.address_line_1 || '');
      setAddressLine2(address.address_line_2 || '');
      setCity(address.city || '');
      setDeliveryInstructions(address.delivery_instructions || '');
      setIsDefault(address.is_default || false);
    } else {
      // Reset form when creating new
      setLabel('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setDeliveryInstructions('');
      setIsDefault(false);
    }
  }, [address, isOpen]);

  const handleSave = async () => {
    // Validation
    if (!label.trim()) {
      notify.error({
        title: 'Error de validación',
        description: 'La etiqueta es requerida (ej: Casa, Trabajo)',
      });
      return;
    }

    if (!addressLine1.trim()) {
      notify.error({
        title: 'Error de validación',
        description: 'La dirección es requerida',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && address) {
        // Update existing address
        const updated = await updateCustomerAddress({
          id: address.id,
          label: label.trim(),
          address_line_1: addressLine1.trim(),
          address_line_2: addressLine2.trim() || undefined,
          city: city.trim() || undefined,
          delivery_instructions: deliveryInstructions.trim() || undefined,
          is_default: isDefault,
        });

        notify.success({
          title: 'Dirección actualizada',
          description: `${label} actualizada correctamente`,
        });

        onSaved?.(updated);
      } else {
        // Create new address
        const newAddressData: CreateCustomerAddressData = {
          customer_id: customerId,
          label: label.trim(),
          address_line_1: addressLine1.trim(),
          address_line_2: addressLine2.trim() || undefined,
          city: city.trim() || undefined,
          delivery_instructions: deliveryInstructions.trim() || undefined,
          is_default: isDefault,
        };

        const created = await createCustomerAddress(newAddressData);

        notify.success({
          title: 'Dirección creada',
          description: `${label} agregada correctamente`,
        });

        onSaved?.(created);
      }

      onClose();
    } catch (error) {
      logger.error('CustomerAddressFormModal', 'Error saving address', error);
      notify.error({
        title: 'Error al guardar',
        description: 'No se pudo guardar la dirección. Intente nuevamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={onClose} size="lg">
      <Modal.Backdrop />
      <Modal.Positioner>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              {isEditMode ? 'Editar Dirección' : 'Nueva Dirección'}
            </Modal.Title>
            <Modal.CloseTrigger />
          </Modal.Header>

          <Modal.Body>
            <Stack gap="4">
              {/* Label */}
              <InputField
                label="Etiqueta"
                placeholder="ej: Casa, Trabajo, Oficina"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={isSaving}
                required
              />

              {/* Address Line 1 */}
              <InputField
                label="Dirección"
                placeholder="Calle, número, piso, depto"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                disabled={isSaving}
                required
              />

              {/* Address Line 2 */}
              <InputField
                label="Complemento (opcional)"
                placeholder="Entre calles, referencias"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                disabled={isSaving}
              />

              {/* City */}
              <InputField
                label="Ciudad (opcional)"
                placeholder="Ciudad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isSaving}
              />

              {/* Delivery Instructions */}
              <TextareaField
                label="Instrucciones de entrega (opcional)"
                placeholder="ej: Timbre roto, llamar al celular. Portón verde."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                disabled={isSaving}
                rows={3}
              />

              {/* Is Default Checkbox */}
              <Checkbox
                checked={isDefault}
                onCheckedChange={(e) => setIsDefault(!!e.checked)}
                disabled={isSaving}
              >
                Establecer como dirección predeterminada
              </Checkbox>
            </Stack>
          </Modal.Body>

          <Modal.Footer>
            <Stack direction="row" gap="3" width="full" justify="flex-end">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                {isEditMode ? 'Guardar cambios' : 'Crear dirección'}
              </Button>
            </Stack>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Positioner>
    </Modal.Root>
  );
}
