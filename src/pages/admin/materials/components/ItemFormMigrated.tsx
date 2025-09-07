/**
 * MIGRATED: Item Form with Zod Validation
 * Eliminates manual validation logic - uses centralized Zod schemas
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type SchemaType } from '@/lib/validation/zod/CommonSchemas';
import {
  Stack, Typography, Button
} from '@/shared/ui';
import {
  CubeIcon
} from '@heroicons/react/24/outline';
import { useInventory } from '../logic/useInventory';
import { type ItemType } from '../types';

// Type inference from Zod schema
type MaterialFormData = SchemaType<typeof EntitySchemas.material>;

// Static data for form options
const itemTypeOptions = [
  { label: 'Contable (unidades)', value: 'UNIT' },
  { label: 'Por peso (kg, g)', value: 'WEIGHT' },
  { label: 'Por volumen (lt, ml)', value: 'VOLUME' },
  { label: 'Elaborado', value: 'ELABORATED' }
];

const unitsByType: Record<ItemType, Array<{label: string; value: string}>> = {
  UNIT: [
    { label: 'unidad', value: 'unidad' },
    { label: 'docena', value: 'docena' },
    { label: 'caja', value: 'caja' },
    { label: 'paquete', value: 'paquete' },
    { label: 'bolsa', value: 'bolsa' }
  ],
  WEIGHT: [
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 'ton', value: 'ton' }
  ],
  VOLUME: [
    { label: 'lt', value: 'lt' },
    { label: 'ml', value: 'ml' },
    { label: 'gal', value: 'gal' }
  ],
  ELABORATED: [
    { label: 'unidad', value: 'unidad' },
    { label: 'porción', value: 'porción' },
    { label: 'bandeja', value: 'bandeja' },
    { label: 'lata', value: 'lata' }
  ]
};

interface ItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ItemFormMigrated({ onSuccess, onCancel }: ItemFormProps) {
  const { addItem } = useInventory();
  
  // React Hook Form with Zod validation - eliminates manual validation
  const form = useForm<MaterialFormData>({
    resolver: zodResolver(EntitySchemas.material),
    defaultValues: {
      name: '',
      type: '',
      category: '',
      unit: '',
      initial_stock: 0,
      unit_cost: 0,
      supplier: '',
      description: ''
    }
  });

  const { handleSubmit, register, formState: { errors, isSubmitting }, watch, setValue } = form;
  
  // Watch type changes to update available units
  const watchedType = watch('type') as ItemType;
  const availableUnits = React.useMemo(() => {
    return watchedType ? unitsByType[watchedType] || [] : [];
  }, [watchedType]);

  // Reset unit when type changes
  React.useEffect(() => {
    if (watchedType && !availableUnits.some(unit => unit.value === watch('unit'))) {
      setValue('unit', '');
    }
  }, [watchedType, availableUnits, watch, setValue]);

  const onSubmit = async (data: MaterialFormData) => {
    try {
      await addItem({
        name: data.name,
        type: data.type as ItemType,
        unit: data.unit,
        stock: data.initial_stock,
        unit_cost: data.unit_cost,
        category: data.category,
        supplier: data.supplier,
        description: data.description
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" gap="lg" align="stretch">
        {/* Nombre */}
        <Stack direction="column" gap="xs">
          <Typography size="sm" fontWeight="medium">Nombre *</Typography>
          <input
            {...register('name')}
            placeholder="ej: Harina 000"
            style={{
              padding: '8px 12px',
              border: errors.name ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%'
            }}
          />
          {errors.name && (
            <Typography color="error" size="sm">{errors.name.message}</Typography>
          )}
        </Stack>

        {/* Tipo */}
        <Stack direction="column" gap="xs">
          <Typography size="sm" fontWeight="medium">Tipo *</Typography>
          <select
            {...register('type')}
            style={{
              padding: '8px 12px',
              border: errors.type ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%'
            }}
          >
            <option value="">Selecciona el tipo de item</option>
            {itemTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <Typography color="error" size="sm">{errors.type.message}</Typography>
          )}
        </Stack>

        {/* Unidad - only show if type is selected */}
        {watchedType && (
          <Stack direction="column" gap="xs">
            <Typography size="sm" fontWeight="medium">Unidad de medida *</Typography>
            <select
              {...register('unit')}
              style={{
                padding: '8px 12px',
                border: errors.unit ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                width: '100%'
              }}
            >
              <option value="">Selecciona la unidad</option>
              {availableUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            {errors.unit && (
              <Typography color="error" size="sm">{errors.unit.message}</Typography>
            )}
          </Stack>
        )}

        {/* Categoría */}
        <Stack direction="column" gap="xs">
          <Typography size="sm" fontWeight="medium">Categoría</Typography>
          <input
            {...register('category')}
            placeholder="ej: Harinas, Lácteos, etc."
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%'
            }}
          />
        </Stack>

        {/* Stock inicial */}
        <Stack direction="column" gap="xs">
          <Typography size="sm" fontWeight="medium">Stock inicial</Typography>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('initial_stock', { valueAsNumber: true })}
            style={{
              padding: '8px 12px',
              border: errors.initial_stock ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%'
            }}
          />
          {errors.initial_stock && (
            <Typography color="error" size="sm">{errors.initial_stock.message}</Typography>
          )}
        </Stack>

        {/* Costo unitario */}
        <Stack direction="column" gap="xs">
          <Typography size="sm" fontWeight="medium">Costo unitario</Typography>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('unit_cost', { valueAsNumber: true })}
            style={{
              padding: '8px 12px',
              border: errors.unit_cost ? '2px solid var(--colors-error)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%'
            }}
          />
          {errors.unit_cost && (
            <Typography color="error" size="sm">{errors.unit_cost.message}</Typography>
          )}
        </Stack>

        {/* Proveedor */}
        <Stack direction="column" gap="xs">
          <Typography size="sm" fontWeight="medium">Proveedor</Typography>
          <input
            {...register('supplier')}
            placeholder="ej: Proveedor ABC"
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              width: '100%'
            }}
          />
        </Stack>

        {/* Descripción */}
        <Stack direction="column" gap="xs">
          <Typography size="sm" fontWeight="medium">Descripción</Typography>
          <textarea
            {...register('description')}
            placeholder="Información adicional del material..."
            rows={3}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              width: '100%'
            }}
          />
        </Stack>

        {/* Botones */}
        <Stack direction="row" gap="sm" justify="end" pt="lg">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button
            colorPalette="blue"
            type="submit"
            loading={isSubmitting}
          >
            <CubeIcon style={{ width: '16px', height: '16px' }} />
            Crear Material
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

/**
 * COMPARISON: BEFORE vs AFTER
 * 
 * BEFORE (Manual validation):
 * - ~150 lines of manual validation logic
 * - Custom error state management
 * - Repetitive field error handling
 * - Manual form data management
 * 
 * AFTER (Zod + React Hook Form):
 * - Automatic validation from centralized Zod schema
 * - Zero manual error state management
 * - Consistent error messages across all forms
 * - Type-safe form data with inference
 * - Real-time validation feedback
 * - Business logic validation integrated (duplicates, similar items)
 */

export default ItemFormMigrated;