/**
 * ASSET FORM MODAL
 * Create/Edit asset form
 * Uses shared UI Dialog component
 */

import { useForm, Controller } from 'react-hook-form';
import { Dialog, Stack, InputField, Button, SelectField, Checkbox, TextareaField } from '@/shared/ui';
// import { HookPoint } from '@/lib/modules/HookPoint';
import type { Asset, CreateAssetDTO } from '../types';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Asset>) => Promise<void>;
  asset?: Asset | null;
}

export function AssetFormModal({ isOpen, onClose, onSubmit, asset }: AssetFormModalProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssetDTO>({
    defaultValues: asset || {
      category: 'equipment',
      status: 'available',
      condition: 'good',
      is_rentable: false,
      maintenance_interval_days: 90,
    },
  });

  const isRentable = watch('is_rentable');

  const onSubmitForm = async (data: CreateAssetDTO) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size={{ base: 'full', md: 'xl' }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{asset ? 'Editar Asset' : 'Crear Asset'}</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack gap={4}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <InputField
              label="Nombre"
              required
              invalid={!!errors.name}
              {...register('name', { required: 'Nombre requerido' })}
            />

            <InputField
              label="Código"
              required
              invalid={!!errors.asset_code}
              {...register('asset_code', { required: 'Código requerido' })}
            />
          </div>

          <TextareaField
            label="Descripción"
            {...register('description')}
            rows={3}
          />

          {/* Category, Status, Condition */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Categoría"
                  required
                  options={[
                    { value: 'equipment', label: 'Equipamiento' },
                    { value: 'vehicle', label: 'Vehículo' },
                    { value: 'tool', label: 'Herramienta' },
                    { value: 'furniture', label: 'Mobiliario' },
                    { value: 'electronics', label: 'Electrónica' },
                  ]}
                  value={field.value ? [field.value] : []}
                  onValueChange={(details) => field.onChange(details.value[0])}
                  size="sm"
                  noPortal
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Estado"
                  options={[
                    { value: 'available', label: 'Disponible' },
                    { value: 'in_use', label: 'En Uso' },
                    { value: 'maintenance', label: 'Mantenimiento' },
                    { value: 'retired', label: 'Retirado' },
                  ]}
                  value={field.value ? [field.value] : []}
                  onValueChange={(details) => field.onChange(details.value[0])}
                  size="sm"
                  noPortal
                />
              )}
            />

            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Condición"
                  options={[
                    { value: 'excellent', label: 'Excelente' },
                    { value: 'good', label: 'Buena' },
                    { value: 'fair', label: 'Regular' },
                    { value: 'poor', label: 'Pobre' },
                    { value: 'broken', label: 'Roto' },
                  ]}
                  value={field.value ? [field.value] : []}
                  onValueChange={(details) => field.onChange(details.value[0])}
                  size="sm"
                  noPortal
                />
              )}
            />
          </div>

          {/* Financial */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <InputField
              label="Precio de Compra"
              type="number"
              step="0.01"
              {...register('purchase_price')}
            />

            <InputField
              label="Valor Actual"
              type="number"
              step="0.01"
              {...register('current_value')}
            />

            <InputField
              label="Fecha de Compra"
              type="date"
              {...register('purchase_date')}
            />
          </div>

          {/* Location */}
          <InputField
            label="Ubicación"
            placeholder="ej: Almacén A, Bahía 3"
            {...register('location')}
          />

          {/* Rental Settings */}
          <Checkbox.Root {...register('is_rentable')}>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>Disponible para alquiler</Checkbox.Label>
          </Checkbox.Root>

          {isRentable && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <InputField
                label="Precio Diario"
                type="number"
                step="0.01"
                {...register('rental_price_per_day')}
              />

              <InputField
                label="Precio por Hora"
                type="number"
                step="0.01"
                {...register('rental_price_per_hour')}
              />
            </div>
          )}

          {/* Maintenance */}
          <InputField
            label="Intervalo de Mantenimiento (días)"
            type="number"
            {...register('maintenance_interval_days')}
          />

          <TextareaField
            label="Notas"
            {...register('notes')}
            rows={3}
          />

          {/* 🎯 HOOK POINT: Rentals can inject additional fields here */}
          {/* <HookPoint hookName="assets.form.fields" hookParams={{ asset, register }} /> */}
        </Stack>

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end',
            marginTop: '1.5rem',
          }}
        >
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {asset ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
