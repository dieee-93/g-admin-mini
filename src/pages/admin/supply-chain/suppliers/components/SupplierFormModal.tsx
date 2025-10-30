// ============================================
// SUPPLIER FORM MODAL - Create/Edit supplier
// ============================================

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Stack,
  FormSection,
  Text,
  InputField,
  TextareaField,
  Dialog
} from '@/shared/ui';
import { SupplierSchema, type SupplierFormData, type Supplier } from '../types/supplierTypes';
import { logger } from '@/lib/logging';
import { toaster } from '@/shared/ui/toaster';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  supplier?: Supplier | null;
}

export function SupplierFormModal({ isOpen, onClose, onSubmit, supplier }: SupplierFormModalProps) {
  const isEditing = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: supplier || {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      tax_id: '',
      payment_terms: '30 días',
      rating: undefined,
      notes: '',
      is_active: true
    }
  });

  // Reset form when supplier changes
  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        tax_id: supplier.tax_id || '',
        payment_terms: supplier.payment_terms || '30 días',
        rating: supplier.rating || undefined,
        notes: supplier.notes || '',
        is_active: supplier.is_active
      });
    } else {
      reset({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        payment_terms: '30 días',
        rating: undefined,
        notes: '',
        is_active: true
      });
    }
  }, [supplier, reset]);

  const handleFormSubmit = async (data: SupplierFormData) => {
    try {
      await onSubmit(data);

      toaster.create({
        title: isEditing ? 'Proveedor actualizado' : 'Proveedor creado',
        description: `${data.name} ${isEditing ? 'actualizado' : 'creado'} exitosamente`,
        type: 'success',
        duration: 3000
      });

      onClose();
    } catch (error) {
      logger.error('SupplierFormModal', 'Error submitting form', error);

      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar proveedor',
        type: 'error',
        duration: 5000
      });
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="lg"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>
              {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
          <form id="supplier-form" onSubmit={handleSubmit(handleFormSubmit)}>
            <Stack direction="column" gap={4}>
              {/* Basic Info */}
              <FormSection title="Información Básica">
                <InputField
                  label="Nombre *"
                  error={errors.name?.message}
                  {...register('name')}
                  placeholder="Ej: Distribuidora Central"
                />

                <InputField
                  label="Persona de Contacto"
                  error={errors.contact_person?.message}
                  {...register('contact_person')}
                  placeholder="Ej: Juan Pérez"
                />
              </FormSection>

              {/* Contact Info */}
              <FormSection title="Información de Contacto">
                <InputField
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                  placeholder="proveedor@empresa.com"
                />

                <InputField
                  label="Teléfono"
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                  placeholder="+54 11 1234-5678"
                />

                <TextareaField
                  label="Dirección"
                  error={errors.address?.message}
                  {...register('address')}
                  placeholder="Dirección completa"
                  rows={2}
                />
              </FormSection>

              {/* Business Info */}
              <FormSection title="Información Comercial">
                <InputField
                  label="CUIT/CUIL"
                  error={errors.tax_id?.message}
                  {...register('tax_id')}
                  placeholder="20-12345678-9"
                />

                <InputField
                  label="Términos de Pago"
                  error={errors.payment_terms?.message}
                  {...register('payment_terms')}
                  placeholder="30 días"
                />

                <InputField
                  label="Rating (1-5)"
                  type="number"
                  error={errors.rating?.message}
                  {...register('rating', { valueAsNumber: true })}
                  min={1}
                  max={5}
                  step={0.1}
                  placeholder="4.5"
                />
              </FormSection>

              {/* Notes */}
              <FormSection title="Notas">
                <TextareaField
                  label="Observaciones"
                  error={errors.notes?.message}
                  {...register('notes')}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </FormSection>
            </Stack>
          </form>
        </Dialog.Body>

        <Dialog.Footer>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="supplier-form"
            colorPalette="blue"
            loading={isSubmitting}
          >
            {isEditing ? 'Actualizar' : 'Crear'} Proveedor
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
