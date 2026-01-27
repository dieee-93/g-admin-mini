/**
 * Address Form Modal
 * Modal para agregar/editar direcciones de clientes con geocoding automático
 */

import { useState } from 'react';
import {
  Dialog,
  Stack,
  Button,
  Alert,
  Input,
  Switch,
  Text
} from '@/shared/ui';
import { type AddressSuggestion } from '@/lib/geocoding';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';
import type { CustomerAddress } from '../../types/customer';
import { AddressAutocomplete } from './AddressAutocomplete';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  address?: CustomerAddress | null;
  onSuccess: () => void;
}

const ARGENTINA_STATES = [
  'CABA',
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

export function AddressFormModal({ isOpen, onClose, customerId, address, onSuccess }: AddressFormModalProps) {
  const isEditMode = !!address;

  // Dirección seleccionada con autocomplete
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);

  // Form state - campos adicionales
  const [formData, setFormData] = useState({
    label: address?.label || 'Casa',
    address_line_2: address?.address_line_2 || '',
    delivery_instructions: address?.delivery_instructions || '',
    is_default: address?.is_default || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'La etiqueta es requerida';
    }

    // En modo creación, requerir dirección seleccionada
    // En modo edición, permitir guardar sin cambiar dirección
    if (!isEditMode && !selectedAddress) {
      newErrors.address = 'Debes seleccionar una dirección del autocomplete';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      notify.error({
        title: 'Validación fallida',
        description: 'Por favor corrige los errores'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && address) {
        // Update existing address - solo actualizar campos adicionales
        const updateData: any = {
          label: formData.label,
          address_line_2: formData.address_line_2 || null,
          delivery_instructions: formData.delivery_instructions || null,
          is_default: formData.is_default,
          updated_at: new Date().toISOString()
        };

        // Si seleccionó nueva dirección, actualizar también coordenadas
        if (selectedAddress) {
          updateData.address_line_1 = `${selectedAddress.calle} ${selectedAddress.altura || 's/n'}`;
          updateData.city = selectedAddress.ciudad;
          updateData.state = selectedAddress.provincia;
          updateData.latitude = selectedAddress.latitude;
          updateData.longitude = selectedAddress.longitude;
          updateData.formatted_address = selectedAddress.nomenclatura;
          updateData.is_verified = true;
        }

        const { error } = await supabase
          .from('customer_addresses')
          .update(updateData)
          .eq('id', address.id);

        if (error) throw error;

        notify.success({
          title: 'Dirección actualizada',
          description: selectedAddress ? 'Con nueva geocodificación' : 'Campos actualizados'
        });
      } else {
        // Create new address - requiere selectedAddress (validado antes)
        if (!selectedAddress) {
          throw new Error('Dirección no seleccionada');
        }

        const { error } = await supabase
          .from('customer_addresses')
          .insert([{
            customer_id: customerId,
            label: formData.label,
            address_line_1: `${selectedAddress.calle} ${selectedAddress.altura || 's/n'}`,
            address_line_2: formData.address_line_2 || null,
            city: selectedAddress.ciudad,
            state: selectedAddress.provincia,
            country: 'Argentina',
            latitude: selectedAddress.latitude,
            longitude: selectedAddress.longitude,
            formatted_address: selectedAddress.nomenclatura,
            delivery_instructions: formData.delivery_instructions || null,
            is_default: formData.is_default,
            is_verified: true
          }]);

        if (error) throw error;

        notify.success({
          title: 'Dirección agregada',
          description: 'Geocodificada con Georef AR ✨'
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      notify.error({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open && !isSubmitting) {
          onClose();
        }
      }}
      size="lg"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {isEditMode ? 'Editar Dirección' : 'Nueva Dirección'}
            </Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                {/* Label */}
                <Stack gap="xs">
                  <Text fontSize="sm" fontWeight="medium">
                    Etiqueta <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Ej: Casa, Trabajo, Oficina"
                  />
                  {errors.label && (
                    <Text fontSize="sm" color="red.500">{errors.label}</Text>
                  )}
                </Stack>

                {/* AddressAutocomplete */}
                <Stack gap="xs">
                  <Text fontSize="sm" fontWeight="medium">
                    Dirección {!isEditMode && <Text as="span" color="red.500">*</Text>}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {isEditMode
                      ? 'Opcional: Busca para actualizar la dirección y coordenadas'
                      : 'Busca tu dirección y selecciónala del menú'
                    }
                  </Text>

                  <AddressAutocomplete
                    onSelect={(address) => setSelectedAddress(address)}
                    placeholder="Ej: Alfredo Palacios 2817"
                    defaultValue={address?.address_line_1 || ''}
                    showMap={true}
                  />

                  {selectedAddress && (
                    <Alert status="success" title="✅ Dirección seleccionada">
                      <Stack gap="xs">
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedAddress.nomenclatura}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          📍 {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}
                        </Text>
                      </Stack>
                    </Alert>
                  )}

                  {errors.address && (
                    <Text fontSize="sm" color="red.500">{errors.address}</Text>
                  )}
                </Stack>

                {/* Address Line 2 - Piso/Depto */}
                <Stack gap="xs">
                  <Text fontSize="sm" fontWeight="medium">Piso / Depto</Text>
                  <Input
                    value={formData.address_line_2}
                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                    placeholder="Ej: Piso 5, Depto B"
                  />
                </Stack>

                {/* Delivery Instructions */}
                <Stack gap="xs">
                  <Text fontSize="sm" fontWeight="medium">Instrucciones de entrega</Text>
                  <Input
                    value={formData.delivery_instructions}
                    onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                    placeholder="Timbre 5B, portero eléctrico"
                  />
                </Stack>

                {/* Is Default */}
                <Stack direction="row" align="center" justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">
                    Dirección por defecto
                  </Text>
                  <Switch
                    checked={formData.is_default}
                    onCheckedChange={(details) => setFormData({ ...formData, is_default: details.checked })}
                  />
                </Stack>

                {/* Actions */}
                <Stack direction="row" gap="sm" justify="flex-end" pt="md">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    colorPalette="blue"
                    loading={isSubmitting}
                  >
                    {isEditMode ? 'Actualizar' : 'Agregar'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
