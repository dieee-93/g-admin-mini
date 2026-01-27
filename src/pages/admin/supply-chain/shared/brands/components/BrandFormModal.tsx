import { useState, useEffect } from 'react';
import { Dialog, Button, Stack, InputField, toaster } from '@/shared/ui';
import { useCreateBrand, useUpdateBrand } from '../hooks/useBrands';
import type { Brand, BrandFormData } from '../types/brandTypes';
import { brandSchema } from '../types/brandTypes';
import { logger } from '@/lib/logging';
import { z } from 'zod';

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
  mode: 'create' | 'edit';
}

export function BrandFormModal({ isOpen, onClose, brand, mode }: BrandFormModalProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    logo_url: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();

  // Reset form when modal opens/closes or brand changes
  useEffect(() => {
    if (isOpen) {
      if (brand && mode === 'edit') {
        setFormData({
          name: brand.name,
          logo_url: brand.logo_url || '',
          is_active: brand.is_active,
        });
      } else {
        setFormData({
          name: '',
          logo_url: '',
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, brand, mode]);

  const handleSubmit = async () => {
    try {
      setErrors({});
      
      // Validate with Zod
      const validatedData = brandSchema.parse(formData);

      if (mode === 'edit' && brand) {
        await updateMutation.mutateAsync({ id: brand.id, data: validatedData as BrandFormData });
        toaster.create({
          title: 'Marca actualizada',
          description: `"${validatedData.name}" se actualizó correctamente`,
          type: 'success',
          duration: 3000,
        });
      } else {
        await createMutation.mutateAsync(validatedData as BrandFormData);
        toaster.create({
          title: 'Marca creada',
          description: `"${validatedData.name}" se agregó al catálogo`,
          type: 'success',
          duration: 3000,
        });
      }

      onClose();
    } catch (error) {
      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as z.ZodError;
        const errorMap: Record<string, string> = {};
        zodError.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errorMap[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(errorMap);
        
        toaster.create({
          title: 'Error de validación',
          description: 'Por favor corrige los errores en el formulario',
          type: 'error',
          duration: 4000,
        });
      } else {
        // Handle API/network errors
        const errorMessage = error instanceof Error 
          ? error.message 
          : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as any).message)
          : 'Error desconocido';
        
        toaster.create({
          title: 'Error al guardar',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="md">
          <Dialog.Header>
            <Dialog.Title>
              {mode === 'edit' ? 'Editar Marca' : 'Crear Nueva Marca'}
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="4">
              <InputField
                label="Nombre de la Marca *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: LA SERENÍSIMA"
                error={errors.name}
              />

              <InputField
                label="URL del Logo (opcional)"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                error={errors.logo_url}
              />
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </Dialog.CloseTrigger>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {mode === 'edit' ? 'Guardar Cambios' : 'Crear Marca'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
