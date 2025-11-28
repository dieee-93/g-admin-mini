/**
 * BASIC INFO SECTION
 *
 * Sección universal presente en todos los tipos de productos.
 * Campos básicos: name, description, sku, category, image_url, active
 *
 * @design PRODUCTS_FORM_SECTIONS_SPEC.md - Section 1
 */

import { Stack, InputField, TextareaField, Switch, SelectField } from '@/shared/ui';
import type { FormSectionProps, BasicInfoFields } from '../../types/productForm';

// TODO: Mover a constantes globales o cargar desde BD
const PRODUCT_CATEGORIES = [
  { label: 'Comida', value: 'food' },
  { label: 'Bebida', value: 'beverage' },
  { label: 'Retail', value: 'retail' },
  { label: 'Belleza', value: 'beauty' },
  { label: 'Salud', value: 'health' },
  { label: 'Educación', value: 'education' },
  { label: 'Eventos', value: 'events' },
  { label: 'Otro', value: 'other' }
];

interface BasicInfoSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: BasicInfoFields;
  onChange: (data: BasicInfoFields) => void;
}

export function BasicInfoSection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: BasicInfoSectionProps) {
  // Handle field changes
  const handleChange = <K extends keyof BasicInfoFields>(
    field: K,
    value: BasicInfoFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Get error for specific field
  const getFieldError = (fieldName: string) => {
    return errors.find(e => e.field === `basic_info.${fieldName}` || e.field === fieldName);
  };

  return (
    <Stack gap="4">
      {/* Nombre - REQUIRED */}
      <InputField
        label="Nombre del producto"
        required
        error={getFieldError('name')?.message}
        placeholder="ej: Hamburguesa Clásica"
        value={data.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        disabled={readOnly}
      />

      {/* Descripción - OPTIONAL */}
      <TextareaField
        label="Descripción"
        placeholder="Describe el producto..."
        rows={3}
        value={data.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        disabled={readOnly}
        helperText="Información adicional para tus clientes"
      />

      {/* SKU - OPTIONAL */}
      <InputField
        label="SKU / Código"
        error={getFieldError('sku')?.message}
        placeholder="Auto-generado si se deja vacío"
        value={data.sku || ''}
        onChange={(e) => handleChange('sku', e.target.value)}
        disabled={readOnly}
      />

      {/* Imagen - OPTIONAL */}
      <InputField
        label="Imagen"
        type="url"
        error={getFieldError('image_url')?.message}
        placeholder="https://..."
        value={data.image_url || ''}
        onChange={(e) => handleChange('image_url', e.target.value)}
        disabled={readOnly}
      />

      {/* Categoría - OPTIONAL */}
      <SelectField
        label="Categoría"
        placeholder="Selecciona una categoría"
        options={PRODUCT_CATEGORIES}
        value={data.category ? [data.category] : []}
        onValueChange={(details) => {
          const selected = details.value[0];
          handleChange('category', selected || undefined);
        }}
        disabled={readOnly}
        helperText="Para organizar tus productos"
      />

      {/* Tags - OPTIONAL */}
      {data.tags && (
        <InputField
          label="Etiquetas"
          placeholder="Separadas por comas"
          value={data.tags.join(', ')}
          onChange={(e) => {
            const tags = e.target.value
              .split(',')
              .map(t => t.trim())
              .filter(t => t.length > 0);
            handleChange('tags', tags);
          }}
          disabled={readOnly}
        />
      )}

      {/* Estado activo */}
      <Stack gap="2">
        <Switch
          checked={data.active}
          onCheckedChange={(e) => handleChange('active', e.checked)}
          disabled={readOnly}
        >
          Producto activo
        </Switch>
      </Stack>
    </Stack>
  );
}

/**
 * Helper: Validar URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

