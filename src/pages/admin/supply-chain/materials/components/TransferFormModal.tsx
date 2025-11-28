// ================================================================
// TRANSFER FORM MODAL COMPONENT
// ================================================================
// Purpose: Form to create new inventory transfers between locations
// Pattern: Modal with validation + location/item selectors
// ================================================================

import { useState, useEffect } from 'react';
import {
  Dialog,
  Stack,
  Text,
  Button,
  Input,
  Textarea,
  SelectField,
  Alert
} from '@/shared/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation } from '@/contexts/LocationContext';
import { inventoryTransfersApi } from '../services/inventoryTransfersApi';
import { notify } from '@/lib/notifications';
import type { CreateTransferData, MaterialItem } from '@/pages/admin/supply-chain/materials/types';

interface TransferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materials: MaterialItem[];
}

export function TransferFormModal({
  isOpen,
  onClose,
  onSuccess,
  materials
}: TransferFormModalProps) {
  const { locations, selectedLocation } = useLocation();

  // Form state
  const [formData, setFormData] = useState<CreateTransferData>({
    from_location_id: selectedLocation?.id || '',
    to_location_id: '',
    item_id: '',
    quantity: 0,
    reason: '',
    notes: '',
    requested_by: ''
  });

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        from_location_id: selectedLocation?.id || '',
        to_location_id: '',
        item_id: '',
        quantity: 0,
        reason: '',
        notes: '',
        requested_by: ''
      });
      setValidationError(null);
      setAvailableStock(null);
    }
  }, [isOpen, selectedLocation]);

  // Get available stock when item and location are selected
  useEffect(() => {
    if (formData.item_id && formData.from_location_id) {
      const item = materials.find(m => m.id === formData.item_id && m.location_id === formData.from_location_id);
      setAvailableStock(item?.stock || 0);
    } else {
      setAvailableStock(null);
    }
  }, [formData.item_id, formData.from_location_id, materials]);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.from_location_id || !formData.to_location_id || !formData.item_id) {
      setValidationError('Todos los campos obligatorios deben estar completos');
      return;
    }

    if (formData.quantity <= 0) {
      setValidationError('La cantidad debe ser mayor a cero');
      return;
    }

    if (formData.from_location_id === formData.to_location_id) {
      setValidationError('Las ubicaciones de origen y destino deben ser diferentes');
      return;
    }

    if (availableStock !== null && formData.quantity > availableStock) {
      setValidationError(`Stock insuficiente. Disponible: ${availableStock}`);
      return;
    }

    setLoading(true);
    setValidationError(null);

    try {
      const result = await inventoryTransfersApi.createTransfer(formData);

      if (result.success) {
        notify.success(result.message);
        onSuccess();
        onClose();
      } else {
        setValidationError(result.error || 'Error al crear la transferencia');
        notify.error(result.message);
      }
    } catch {
      setValidationError('Error al crear la transferencia');
      notify.error('Error al crear la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = materials.find(m => m.id === formData.item_id);
  const filteredMaterials = formData.from_location_id
    ? materials.filter(m => m.location_id === formData.from_location_id)
    : [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Nueva Transferencia de Inventario</Dialog.Title>
            <Dialog.CloseTrigger onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="4">
              {/* Validation Error */}
              {validationError && (
                <Alert status="error" title="Error de validación">
                  {validationError}
                </Alert>
              )}

              {/* From Location */}
              <Stack gap="2">
                <Text fontWeight="600">Ubicación de Origen *</Text>
                <SelectField
                  placeholder="Seleccionar ubicación de origen"
                  options={[
                    { value: '', label: 'Seleccionar ubicación' },
                    ...locations.map(loc => ({
                      value: loc.id,
                      label: `${loc.name} (${loc.code})`
                    }))
                  ]}
                  value={[formData.from_location_id]}
                  onValueChange={(details) => setFormData({ 
                    ...formData, 
                    from_location_id: details.value[0] || '', 
                    item_id: '' 
                  })}
                  noPortal
                />
              </Stack>

              {/* To Location */}
              <Stack gap="2">
                <Text fontWeight="600">Ubicación de Destino *</Text>
                <SelectField
                  placeholder="Seleccionar ubicación de destino"
                  options={[
                    { value: '', label: 'Seleccionar ubicación' },
                    ...locations
                      .filter(loc => loc.id !== formData.from_location_id)
                      .map(loc => ({
                        value: loc.id,
                        label: `${loc.name} (${loc.code})`
                      }))
                  ]}
                  value={[formData.to_location_id]}
                  onValueChange={(details) => setFormData({ 
                    ...formData, 
                    to_location_id: details.value[0] || '' 
                  })}
                  noPortal
                />
              </Stack>

              {/* Item */}
              <Stack gap="2">
                <Text fontWeight="600">Material *</Text>
                <SelectField
                  placeholder={!formData.from_location_id 
                    ? 'Primero seleccione ubicación de origen' 
                    : 'Seleccionar material'}
                  options={[
                    { 
                      value: '', 
                      label: !formData.from_location_id
                        ? 'Primero seleccione ubicación de origen'
                        : 'Seleccionar material'
                    },
                    ...filteredMaterials.map(item => ({
                      value: item.id,
                      label: `${item.name} - Stock: ${item.stock} ${item.unit}`
                    }))
                  ]}
                  value={[formData.item_id]}
                  onValueChange={(details) => setFormData({ 
                    ...formData, 
                    item_id: details.value[0] || '' 
                  })}
                  disabled={!formData.from_location_id}
                  noPortal
                />
              </Stack>

              {/* Quantity */}
              <Stack gap="2">
                <Text fontWeight="600">Cantidad *</Text>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  placeholder="Cantidad a transferir"
                  min={0}
                />
                {availableStock !== null && (
                  <Text fontSize="sm" color="gray.600">
                    Stock disponible: {availableStock} {selectedItem?.unit}
                  </Text>
                )}
              </Stack>

              {/* Reason */}
              <Stack gap="2">
                <Text fontWeight="600">Motivo</Text>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Motivo de la transferencia"
                />
              </Stack>

              {/* Notes */}
              <Stack gap="2">
                <Text fontWeight="600">Notas</Text>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales"
                  rows={3}
                />
              </Stack>

              {/* Requested By */}
              <Stack gap="2">
                <Text fontWeight="600">Solicitado por</Text>
                <Input
                  value={formData.requested_by}
                  onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                  placeholder="Nombre del solicitante"
                />
              </Stack>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Stack direction="row" gap="3" justify="end">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleSubmit}
                loading={loading}
                disabled={
                  loading ||
                  !formData.from_location_id ||
                  !formData.to_location_id ||
                  !formData.item_id ||
                  formData.quantity <= 0
                }
              >
                Crear Transferencia
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
