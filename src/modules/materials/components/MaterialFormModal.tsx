import { useEffect } from 'react';
import {
  Dialog,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  NumberInput,
  Select,
  createListCollection
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMaterials } from '@/hooks/useZustandStores';
import { MaterialItem } from '@/store/materialsStore';
import { useApp } from '@/hooks/useZustandStores';
import { createValidationSchema, validateData } from '@/lib/validation';
import { secureApiCall } from '@/lib/validation/security';

interface MaterialFormData {
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  category: string;
  cost_per_unit: number;
  location?: string;
  notes?: string;
}

const unitOptions = createListCollection({
  items: [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'g', label: 'Gramos (g)' },
    { value: 'l', label: 'Litros (l)' },
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'unidades', label: 'Unidades' },
    { value: 'cajas', label: 'Cajas' },
    { value: 'paquetes', label: 'Paquetes' }
  ]
});

const categoryOptions = createListCollection({
  items: [
    { value: 'carnes', label: 'Carnes' },
    { value: 'vegetales', label: 'Vegetales' },
    { value: 'lacteos', label: 'Lácteos' },
    { value: 'granos', label: 'Granos y Cereales' },
    { value: 'condimentos', label: 'Condimentos y Especias' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'limpieza', label: 'Productos de Limpieza' },
    { value: 'otros', label: 'Otros' }
  ]
});

export const MaterialFormModal = () => {
  const { 
    isModalOpen, 
    modalMode, 
    currentItem, 
    closeModal,
    addItem,
    updateItem 
  } = useMaterials();
  
  const { handleError } = useApp();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MaterialFormData>();

  const isEditMode = modalMode === 'edit';
  const isViewMode = modalMode === 'view';

  useEffect(() => {
    if (isModalOpen && currentItem) {
      // Pre-fill form with current item data
      setValue('name', currentItem.name);
      setValue('unit', currentItem.unit);
      setValue('current_stock', currentItem.current_stock);
      setValue('min_stock', currentItem.min_stock);
      setValue('max_stock', currentItem.max_stock);
      setValue('category', currentItem.category);
      setValue('cost_per_unit', currentItem.cost_per_unit);
      setValue('location', currentItem.location || '');
      setValue('notes', currentItem.notes || '');
    } else if (isModalOpen) {
      // Reset form for new item
      reset();
    }
  }, [isModalOpen, currentItem, setValue, reset]);

  const onSubmit = async (data: MaterialFormData) => {
    try {
      // 1. Create validation schema for inventory
      const validationSchema = createValidationSchema('inventory');
      
      // 2. Validate data with business rules
      const validationResult = validateData(data, validationSchema);
      
      if (!validationResult.isValid) {
        // Show validation errors
        validationResult.errors.forEach(error => {
          handleError(new Error(error.message), { 
            field: error.field, 
            code: error.code 
          });
        });
        return;
      }
      
      // 3. Show warnings if any
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        const proceedWithWarnings = window.confirm(
          `Advertencias encontradas:\n${validationResult.warnings.map(w => w.message).join('\n')}\n\n¿Desea continuar?`
        );
        if (!proceedWithWarnings) {
          return;
        }
      }
      
      // 4. Use sanitized data and secure API call
      const sanitizedData = validationResult.sanitizedData || data;
      
      await secureApiCall(async () => {
        if (isEditMode && currentItem) {
          updateItem(currentItem.id, {
            ...sanitizedData,
            max_stock: sanitizedData.max_stock || undefined
          });
        } else {
          addItem({
            ...sanitizedData,
            max_stock: sanitizedData.max_stock || undefined
          });
        }
      }, {
        requireAuth: true,
        requiredPermissions: isEditMode ? ['inventory.update'] : ['inventory.create'],
        sanitizeInput: true,
        logAccess: true,
        rateLimit: {
          maxRequests: 10,
          windowMs: 60000 // 10 requests per minute
        }
      });
      
      closeModal();
      reset();
    } catch (error) {
      handleError(error as Error, { 
        operation: isEditMode ? 'updateItem' : 'createItem', 
        data: data 
      });
    }
  };

  const getTitle = () => {
    switch (modalMode) {
      case 'add': return 'Agregar Nuevo Material';
      case 'edit': return 'Editar Material';
      case 'view': return 'Ver Material';
      default: return 'Material';
    }
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={(e) => !e.open && closeModal()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="lg" mx={4}>
          <Dialog.Header>
            <Dialog.Title fontSize="lg" fontWeight="semibold">
              {getTitle()}
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack gap={4} align="stretch">
                {/* Name */}
                <VStack align="flex-start" gap={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Nombre del Material *
                  </Text>
                  <Input
                    {...register('name', { 
                      required: 'El nombre es requerido',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                    })}
                    placeholder="Ej: Tomate, Carne de res, etc."
                    disabled={isViewMode}
                  />
                  {errors.name && (
                    <Text fontSize="xs" color="red.500">{errors.name.message}</Text>
                  )}
                </VStack>

                {/* Category and Unit */}
                <HStack gap={4}>
                  <VStack align="flex-start" gap={2} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Categoría *
                    </Text>
                    <Select.Root
                      collection={categoryOptions}
                      disabled={isViewMode}
                      {...register('category', { required: 'La categoría es requerida' })}
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar..." />
                      </Select.Trigger>
                      <Select.Content>
                        {categoryOptions.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    {errors.category && (
                      <Text fontSize="xs" color="red.500">{errors.category.message}</Text>
                    )}
                  </VStack>

                  <VStack align="flex-start" gap={2} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Unidad de Medida *
                    </Text>
                    <Select.Root
                      collection={unitOptions}
                      disabled={isViewMode}
                      {...register('unit', { required: 'La unidad es requerida' })}
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar..." />
                      </Select.Trigger>
                      <Select.Content>
                        {unitOptions.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                    {errors.unit && (
                      <Text fontSize="xs" color="red.500">{errors.unit.message}</Text>
                    )}
                  </VStack>
                </HStack>

                {/* Stock Levels */}
                <HStack gap={4}>
                  <VStack align="flex-start" gap={2} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Stock Actual *
                    </Text>
                    <NumberInput.Root
                      min={0}
                      disabled={isViewMode}
                    >
                      <NumberInput.Field
                        {...register('current_stock', { 
                          required: 'El stock actual es requerido',
                          min: { value: 0, message: 'No puede ser negativo' }
                        })}
                        placeholder="0"
                      />
                    </NumberInput.Root>
                    {errors.current_stock && (
                      <Text fontSize="xs" color="red.500">{errors.current_stock.message}</Text>
                    )}
                  </VStack>

                  <VStack align="flex-start" gap={2} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Stock Mínimo *
                    </Text>
                    <NumberInput.Root
                      min={0}
                      disabled={isViewMode}
                    >
                      <NumberInput.Field
                        {...register('min_stock', { 
                          required: 'El stock mínimo es requerido',
                          min: { value: 0, message: 'No puede ser negativo' }
                        })}
                        placeholder="0"
                      />
                    </NumberInput.Root>
                    {errors.min_stock && (
                      <Text fontSize="xs" color="red.500">{errors.min_stock.message}</Text>
                    )}
                  </VStack>
                </HStack>

                {/* Max Stock and Cost */}
                <HStack gap={4}>
                  <VStack align="flex-start" gap={2} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Stock Máximo
                    </Text>
                    <NumberInput.Root
                      min={0}
                      disabled={isViewMode}
                    >
                      <NumberInput.Field
                        {...register('max_stock', { 
                          min: { value: 0, message: 'No puede ser negativo' }
                        })}
                        placeholder="Opcional"
                      />
                    </NumberInput.Root>
                    {errors.max_stock && (
                      <Text fontSize="xs" color="red.500">{errors.max_stock.message}</Text>
                    )}
                  </VStack>

                  <VStack align="flex-start" gap={2} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Costo por Unidad *
                    </Text>
                    <NumberInput.Root
                      min={0}
                      formatOptions={{
                        style: 'currency',
                        currency: 'ARS'
                      }}
                      disabled={isViewMode}
                    >
                      <NumberInput.Field
                        {...register('cost_per_unit', { 
                          required: 'El costo por unidad es requerido',
                          min: { value: 0, message: 'No puede ser negativo' }
                        })}
                        placeholder="0.00"
                      />
                    </NumberInput.Root>
                    {errors.cost_per_unit && (
                      <Text fontSize="xs" color="red.500">{errors.cost_per_unit.message}</Text>
                    )}
                  </VStack>
                </HStack>

                {/* Location */}
                <VStack align="flex-start" gap={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Ubicación de Almacén
                  </Text>
                  <Input
                    {...register('location')}
                    placeholder="Ej: Refrigerador A, Estante 3, etc."
                    disabled={isViewMode}
                  />
                </VStack>

                {/* Notes */}
                <VStack align="flex-start" gap={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Notas Adicionales
                  </Text>
                  <Textarea
                    {...register('notes')}
                    placeholder="Información adicional sobre el material..."
                    disabled={isViewMode}
                    rows={3}
                  />
                </VStack>

                {/* Form Actions */}
                {!isViewMode && (
                  <HStack gap={3} pt={4} justify="flex-end">
                    <Button
                      variant="outline"
                      onClick={() => closeModal()}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      type="submit"
                      colorPalette="blue"
                      loading={isSubmitting}
                    >
                      {isEditMode ? 'Actualizar' : 'Crear'} Material
                    </Button>
                  </HStack>
                )}

                {isViewMode && (
                  <HStack gap={3} pt={4} justify="flex-end">
                    <Button
                      variant="outline"
                      onClick={() => closeModal()}
                    >
                      Cerrar
                    </Button>
                  </HStack>
                )}
              </VStack>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};