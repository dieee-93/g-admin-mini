/**
 * Product Form Modal - Flexible Product Creation/Editing
 * Following SESSION_5 requirements
 *
 * Features:
 * - Dynamic sections based on ProductConfig
 * - Support for 11 product categories
 * - Validation based on configuration
 * - EventBus integration
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  InputField,
  SelectField,
  Switch,
  TextareaField,
  NumberField,
  Stack,
  HStack,
  Badge,
  IconButton,
  Box
} from '@/shared/ui';
import {
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  type ProductWithConfig,
  type ProductCategory,
  type ProductConfig,
  type StaffAllocation,
  type DigitalDeliveryConfig,
  PRODUCT_CATEGORIES
} from '../../types';
import { ProductValidation } from '../../services/productValidation';
import { DecimalUtils } from '@/lib/decimal';
import { logger } from '@/lib/logging';

export interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  product?: ProductWithConfig | null;
  onClose: () => void;
  onSave?: (product: Partial<ProductWithConfig>) => Promise<void>;
}

// Default ProductConfig based on category
const getDefaultConfig = (category: ProductCategory): ProductConfig => {
  const configs: Record<ProductCategory, Partial<ProductConfig>> = {
    FOOD: {
      has_components: true,
      components_required: true,
      requires_production: true,
      production_type: 'kitchen',
      requires_staff: true,
    },
    BEVERAGE: {
      has_components: true,
      components_required: false,
      requires_production: true,
      production_type: 'preparation',
    },
    RETAIL_GOODS: {
      has_components: false,
      is_retail: true,
    },
    BEAUTY_SERVICE: {
      has_components: false,
      requires_staff: true,
      requires_booking: true,
      has_duration: true,
    },
    REPAIR_SERVICE: {
      has_components: true,
      components_required: false,
      allow_dynamic_materials: true,
      requires_staff: true,
      requires_booking: true,
    },
    PROFESSIONAL_SERVICE: {
      has_components: false,
      requires_staff: true,
      requires_booking: true,
      has_duration: true,
    },
    EVENT: {
      has_components: false,
      is_digital: true,
      requires_staff: true,
      has_duration: true,
    },
    COURSE: {
      has_components: false,
      is_digital: true,
      has_duration: true,
    },
    DIGITAL_PRODUCT: {
      has_components: false,
      is_digital: true,
    },
    RENTAL: {
      has_components: false,
      requires_booking: true,
      has_duration: true,
    },
    CUSTOM: {},
  };

  return {
    has_components: false,
    components_required: false,
    allow_dynamic_materials: false,
    requires_production: false,
    requires_staff: false,
    has_duration: false,
    requires_booking: false,
    is_digital: false,
    is_retail: false,
    ...configs[category],
  };
};

export function ProductFormModalNew({
  isOpen,
  mode,
  product,
  onClose,
  onSave,
}: ProductFormModalProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<ProductWithConfig>>({
    name: '',
    description: '',
    category: 'FOOD',
    config: getDefaultConfig('FOOD'),
    pricing: {
      base_cost: 0,
      price: 0,
      profit_margin: 0,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with product data in edit mode
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData(product);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        category: 'FOOD',
        config: getDefaultConfig('FOOD'),
        pricing: {
          base_cost: 0,
          price: 0,
          profit_margin: 0,
        },
      });
    }
  }, [mode, product]);

  // Handle category change -> update config defaults
  const handleCategoryChange = (category: ProductCategory) => {
    setFormData(prev => ({
      ...prev,
      category,
      config: getDefaultConfig(category),
    }));
  };

  // Handle basic field change
  const handleFieldChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle config change
  const handleConfigChange = (field: keyof ProductConfig, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        [field]: value,
      },
    }));
  };

  // Handle pricing change
  const handlePricingChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing!,
        [field]: value,
      },
    }));
  };

  // Handle staff allocation changes
  const handleAddStaffAllocation = () => {
    const newAllocation: StaffAllocation = {
      role: '',
      count: 1,
      duration_minutes: 30,
    };

    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        staff_allocation: [
          ...(prev.config?.staff_allocation || []),
          newAllocation,
        ],
      },
    }));
  };

  const handleRemoveStaffAllocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        staff_allocation: prev.config?.staff_allocation?.filter((_, i) => i !== index),
      },
    }));
  };

  const handleStaffAllocationChange = (
    index: number,
    field: keyof StaffAllocation,
    value: unknown
  ) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        staff_allocation: prev.config?.staff_allocation?.map((allocation, i) =>
          i === index ? { ...allocation, [field]: value } : allocation
        ),
      },
    }));
  };

  // Handle digital delivery changes
  const handleDigitalDeliveryChange = (field: keyof DigitalDeliveryConfig, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config!,
        digital_delivery: {
          ...prev.config?.digital_delivery!,
          [field]: value,
        } as DigitalDeliveryConfig,
      },
    }));
  };

  // Validate and save
  const handleSave = async () => {
    // Validate
    const validationResult = ProductValidation.validateProduct(formData);

    if (!validationResult.valid) {
      setErrors(ProductValidation.getErrorsMap(validationResult.errors));
      logger.warn('ProductFormModal', 'Validation failed', { errors: validationResult.errors });
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      if (onSave) {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      logger.error('ProductFormModal', 'Error saving product', error);
    } finally {
      setIsSaving(false);
    }
  };

  const config = formData.config || getDefaultConfig(formData.category as ProductCategory);

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
            </Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body maxH="70vh" overflowY="auto">
            <Stack gap="6">
              {/* ========== BASIC INFO SECTION (Always visible) ========== */}
              <Stack gap="4">
                <Badge colorPalette="purple" alignSelf="flex-start">
                  Información Básica
                </Badge>

                <InputField
                  label="Nombre"
                  required
                  error={errors.name}
                  value={formData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Ej: Hamburguesa Clásica"
                />

                <SelectField
                  label="Categoría"
                  required
                  invalid={!!errors.category}
                  options={PRODUCT_CATEGORIES.map(cat => ({
                    value: cat.value,
                    label: cat.label,
                  }))}
                  value={formData.category ? [formData.category] : []}
                  onValueChange={(details) => handleCategoryChange(details.value[0] as ProductCategory)}
                  helperText="Tipo de producto"
                />

                <TextareaField
                  label="Descripción"
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Descripción del producto..."
                  rows={3}
                />

                <HStack gap="4">
                  <NumberField
                    label="Precio"
                    error={errors.price}
                    value={formData.pricing?.price || 0}
                    onChange={(value) => handlePricingChange('price', value)}
                    placeholder="0.00"
                  />
                </HStack>
              </Stack>

              {/* ========== RECIPE SECTION (if has_components) ========== */}
              {config.has_components && (
                <Stack gap="4">
                  <Badge colorPalette="blue" alignSelf="flex-start">
                    Receta / Componentes
                  </Badge>

                  <Stack gap="3">
                    <Switch
                      checked={config.components_required}
                      onChange={(checked) => handleConfigChange('components_required', checked)}
                    >
                      Componentes requeridos
                    </Switch>

                    {formData.category === 'REPAIR_SERVICE' && (
                      <Switch
                        checked={config.allow_dynamic_materials}
                        onChange={(checked) => handleConfigChange('allow_dynamic_materials', checked)}
                      >
                        Permitir materiales dinámicos (agregados durante servicio)
                      </Switch>
                    )}
                  </Stack>

                  {/* TODO: Add MaterialSelector component list */}
                  <InputField
                    label="Componentes"
                    placeholder="Agregar componentes..."
                    disabled
                    helperText="Los componentes se gestionarán desde la vista de detalles"
                  />
                </Stack>
              )}

              {/* ========== BOOKING SECTION (if requires_booking) ========== */}
              {config.requires_booking && (
                <Stack gap="4">
                  <Badge colorPalette="green" alignSelf="flex-start">
                    Configuración de Reservas
                  </Badge>

                  <HStack gap="4">
                    <Box flex="1">
                      <NumberField
                        label="Ventana de reserva (días)"
                        required
                        error={errors.booking_window_days}
                        value={config.booking_window_days || 1}
                        onChange={(value) => handleConfigChange('booking_window_days', value)}
                        placeholder="1"
                      />
                    </Box>

                    <Box flex="1">
                      <NumberField
                        label="Capacidad concurrente"
                        value={config.concurrent_capacity || 1}
                        onChange={(value) => handleConfigChange('concurrent_capacity', value)}
                        placeholder="1"
                      />
                    </Box>
                  </HStack>
                </Stack>
              )}

              {/* ========== STAFF SECTION (if requires_staff) ========== */}
              {config.requires_staff && (
                <Stack gap="4">
                  <HStack justify="space-between">
                    <Badge colorPalette="orange" alignSelf="flex-start">
                      Requerimientos de Personal
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddStaffAllocation}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Agregar Rol
                    </Button>
                  </HStack>

                  {config.staff_allocation && config.staff_allocation.length > 0 ? (
                    <Stack gap="3">
                      {config.staff_allocation.map((allocation, index) => (
                        <HStack key={index} gap="2" p="3" borderWidth="1px" borderRadius="md">
                          <Field.Root flex="2" required>
                            <Field.Label>Rol</Field.Label>
                            <Input
                              value={allocation.role}
                              onChange={(e) =>
                                handleStaffAllocationChange(index, 'role', e.target.value)
                              }
                              placeholder="Ej: Chef, Masajista"
                            />
                          </Field.Root>

                          <Field.Root flex="1">
                            <Field.Label>Cantidad</Field.Label>
                            <Input
                              type="number"
                              value={allocation.count}
                              onChange={(e) =>
                                handleStaffAllocationChange(index, 'count', Number(e.target.value))
                              }
                            />
                          </Field.Root>

                          <Field.Root flex="1">
                            <Field.Label>Duración (min)</Field.Label>
                            <Input
                              type="number"
                              value={allocation.duration_minutes}
                              onChange={(e) =>
                                handleStaffAllocationChange(index, 'duration_minutes', Number(e.target.value))
                              }
                            />
                          </Field.Root>

                          <IconButton
                            aria-label="Eliminar"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleRemoveStaffAllocation(index)}
                            mt="6"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </IconButton>
                        </HStack>
                      ))}
                    </Stack>
                  ) : (
                    <Box p="3" bg="gray.50" borderRadius="md" fontSize="sm" color="gray.600">
                      No hay roles de personal configurados. Haz clic en "Agregar Rol" para comenzar.
                    </Box>
                  )}
                </Stack>
              )}

              {/* ========== DIGITAL SECTION (if is_digital) ========== */}
              {config.is_digital && (
                <Stack gap="4">
                  <Badge colorPalette="cyan" alignSelf="flex-start">
                    Entrega Digital
                  </Badge>

                  <SelectField
                    label="Tipo de entrega"
                    required
                    options={[
                      { value: 'download', label: 'Descarga' },
                      { value: 'streaming', label: 'Streaming' },
                      { value: 'event', label: 'Evento' },
                      { value: 'course', label: 'Curso' },
                      { value: 'access', label: 'Acceso' },
                    ]}
                    value={config.digital_delivery?.delivery_type ? [config.digital_delivery.delivery_type] : []}
                    onValueChange={(details) =>
                      handleDigitalDeliveryChange('delivery_type', details.value[0])
                    }
                  />

                  <HStack gap="4">
                    <Field.Root flex="1">
                      <Field.Label>URL de acceso</Field.Label>
                      <Input
                        value={config.digital_delivery?.access_url || ''}
                        onChange={(e) => handleDigitalDeliveryChange('access_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </Field.Root>

                    <Field.Root flex="1">
                      <Field.Label>Máx. participantes</Field.Label>
                      <Input
                        type="number"
                        value={config.digital_delivery?.max_participants || ''}
                        onChange={(e) =>
                          handleDigitalDeliveryChange('max_participants', Number(e.target.value))
                        }
                        placeholder="100"
                      />
                    </Field.Root>
                  </HStack>

                  <Field.Root>
                    <Field.Label>Plataforma</Field.Label>
                    <Input
                      value={config.digital_delivery?.platform || ''}
                      onChange={(e) => handleDigitalDeliveryChange('platform', e.target.value)}
                      placeholder="Ej: Zoom, Google Meet"
                    />
                  </Field.Root>
                </Stack>
              )}

              {/* ========== DURATION SECTION (if has_duration) ========== */}
              {config.has_duration && (
                <Stack gap="4">
                  <Field.Root required invalid={!!errors.duration_minutes}>
                    <Field.Label>Duración (minutos)</Field.Label>
                    <Input
                      type="number"
                      value={config.duration_minutes || ''}
                      onChange={(e) => handleConfigChange('duration_minutes', Number(e.target.value))}
                      placeholder="60"
                    />
                    {errors.duration_minutes && (
                      <Field.ErrorText>{errors.duration_minutes}</Field.ErrorText>
                    )}
                  </Field.Root>
                </Stack>
              )}
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </Dialog.ActionTrigger>
            <Button
              colorPalette="purple"
              onClick={handleSave}
              loading={isSaving}
            >
              {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
