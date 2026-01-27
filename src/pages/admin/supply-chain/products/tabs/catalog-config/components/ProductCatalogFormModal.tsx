/**
 * PRODUCT CATALOG FORM MODAL
 * 
 * Modal component for editing product catalog settings
 */

import { useState, useEffect } from 'react';
import { Dialog, FormSection, InputField, Button, Stack, SelectField } from '@/shared/ui';
import { useUpdateProductCatalogSettings } from '@/modules/products';
import type { ProductCatalogSettings } from '@/pages/admin/supply-chain/products/services/productCatalogApi';

interface ProductCatalogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProductCatalogSettings | null;
}

interface FormData {
  pricing_strategy: string;
  default_markup_percentage: string;
  recipe_costing_method: string;
  minimum_notice_minutes: string;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

export function ProductCatalogFormModal({
  isOpen,
  onClose,
  settings,
}: ProductCatalogFormModalProps) {
  const updateSettings = useUpdateProductCatalogSettings();

  const [formData, setFormData] = useState<FormData>({
    pricing_strategy: 'markup',
    default_markup_percentage: '',
    recipe_costing_method: 'average',
    minimum_notice_minutes: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        pricing_strategy: settings.pricing_strategy,
        default_markup_percentage: settings.default_markup_percentage.toString(),
        recipe_costing_method: settings.recipe_costing_method,
        minimum_notice_minutes: settings.minimum_notice_minutes.toString(),
      });
      setFieldErrors({});
    }
  }, [isOpen, settings]);

  const handleFieldChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    const markup = parseFloat(formData.default_markup_percentage);
    if (isNaN(markup) || markup < 0 || markup > 1000) {
      errors.default_markup_percentage = 'Debe estar entre 0 y 1000';
    }

    const notice = parseInt(formData.minimum_notice_minutes, 10);
    if (isNaN(notice) || notice < 0) {
      errors.minimum_notice_minutes = 'Debe ser 0 o mayor';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!settings || !validateForm()) return;

    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        updates: {
          pricing_strategy: formData.pricing_strategy as 'markup' | 'competitive' | 'value_based',
          default_markup_percentage: parseFloat(formData.default_markup_percentage),
          recipe_costing_method: formData.recipe_costing_method as 'average' | 'fifo' | 'lifo' | 'standard',
          minimum_notice_minutes: parseInt(formData.minimum_notice_minutes, 10),
        },
      });
      onClose();
    } catch {
      // Error handling is done in the mutation hook
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Dialog.Header>
            <Dialog.Title>Editar Configuración de Catálogo</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="6">
              <FormSection title="Estrategia de Precios">
                <Stack gap="4">
                  <SelectField
                    label="Estrategia de Precios *"
                    value={[formData.pricing_strategy]}
                    onValueChange={(details) => handleFieldChange('pricing_strategy')(details.value[0])}
                    options={[
                      { value: 'markup', label: 'Markup (Costo + %)' },
                      { value: 'competitive', label: 'Competitiva (Mercado)' },
                      { value: 'value_based', label: 'Basada en Valor' }
                    ]}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)', marginTop: '4px', display: 'block' }}>
                    {formData.pricing_strategy === 'markup' && 'Precio de venta = Costo + Markup%'}
                    {formData.pricing_strategy === 'competitive' && 'Precios basados en competidores del mercado'}
                    {formData.pricing_strategy === 'value_based' && 'Precios según el valor percibido por el cliente'}
                  </span>

                  <InputField
                    label="Markup por Defecto (%) *"
                    type="number"
                    step="0.01"
                    value={formData.default_markup_percentage}
                    onChange={(e) => handleFieldChange('default_markup_percentage')(e.target.value)}
                    placeholder="200.00"
                    style={{ borderColor: fieldErrors.default_markup_percentage ? 'var(--colors-error)' : undefined }}
                  />
                  {fieldErrors.default_markup_percentage && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                      {fieldErrors.default_markup_percentage}
                    </span>
                  )}
                  <div style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)', padding: '8px', backgroundColor: 'var(--colors-blue-50)', borderRadius: '6px' }}>
                    💡 Ejemplo: Con {formData.default_markup_percentage || '200'}% de markup, un producto con costo de $100 se vende a ${(100 * (1 + parseFloat(formData.default_markup_percentage || '200') / 100)).toFixed(2)}
                  </div>
                </Stack>
              </FormSection>

              <FormSection title="Método de Costeo">
                <SelectField
                  label="Método de Valuación de Inventario *"
                  value={[formData.recipe_costing_method]}
                  onValueChange={(details) => handleFieldChange('recipe_costing_method')(details.value[0])}
                  options={[
                    { value: 'average', label: 'Promedio Ponderado' },
                    { value: 'fifo', label: 'FIFO (First In, First Out)' },
                    { value: 'lifo', label: 'LIFO (Last In, First Out)' },
                    { value: 'standard', label: 'Costo Estándar' }
                  ]}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)', marginTop: '4px', display: 'block' }}>
                  {formData.recipe_costing_method === 'average' && 'Método más común: Promedio de todos los costos'}
                  {formData.recipe_costing_method === 'fifo' && 'Primera entrada, primera salida - refleja flujo natural'}
                  {formData.recipe_costing_method === 'lifo' && 'Última entrada, primera salida - usado en inflación'}
                  {formData.recipe_costing_method === 'standard' && 'Costo fijo predefinido - simplifica cálculos'}
                </span>
              </FormSection>

              <FormSection title="Reglas de Disponibilidad">
                <InputField
                  label="Tiempo Mínimo de Anticipación (minutos) *"
                  type="number"
                  value={formData.minimum_notice_minutes}
                  onChange={(e) => handleFieldChange('minimum_notice_minutes')(e.target.value)}
                  placeholder="0"
                  style={{ borderColor: fieldErrors.minimum_notice_minutes ? 'var(--colors-error)' : undefined }}
                />
                {fieldErrors.minimum_notice_minutes && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--colors-error)' }}>
                    {fieldErrors.minimum_notice_minutes}
                  </span>
                )}
                <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                  0 = Pedidos inmediatos, 60 = Requiere 1 hora de anticipación
                </span>
              </FormSection>

              <div style={{ fontSize: '0.875rem', color: 'var(--colors-orange-600)', padding: '12px', backgroundColor: 'var(--colors-orange-50)', borderRadius: '8px', border: '1px solid var(--colors-orange-200)' }}>
                ⚠️ <strong>Nota:</strong> Para editar categorías, modificadores y tamaños de porción, utiliza los módulos específicos de gestión de catálogo.
              </div>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </Dialog.CloseTrigger>
            <Button
              onClick={handleSubmit}
              disabled={updateSettings.isPending}
              colorPalette="purple"
            >
              {updateSettings.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
