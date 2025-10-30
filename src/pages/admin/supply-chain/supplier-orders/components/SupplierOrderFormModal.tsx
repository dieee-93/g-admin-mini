// ============================================
// SUPPLIER ORDER FORM MODAL - Create/Edit purchase orders
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@chakra-ui/react';
import {
  Button,
  IconButton,
  Stack,
  HStack,
  FormSection,
  Text,
  InputField,
  NumberField,
  SelectField,
  TextareaField,
  createListCollection,
  Badge,
  Alert
} from '@/shared/ui';
import {
  SupplierOrderSchema,
  type SupplierOrderFormData,
  type SupplierOrderWithDetails
} from '../types';
import type { Supplier } from '../../suppliers/types/supplierTypes';
import type { MaterialItem } from '../../materials/types';
import { suppliersApi } from '../../materials/services/suppliersApi';
import { inventoryApi } from '../../materials/services/inventoryApi';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface SupplierOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierOrderFormData) => Promise<void>;
  order?: SupplierOrderWithDetails | null;
}

export function SupplierOrderFormModal({
  isOpen,
  onClose,
  onSubmit,
  order
}: SupplierOrderFormModalProps) {
  const isEditing = !!order;

  // ============================================
  // STATE - Data sources
  // ============================================

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);

  // ============================================
  // FORM SETUP
  // ============================================

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SupplierOrderFormData>({
    resolver: zodResolver(SupplierOrderSchema),
    defaultValues: {
      supplier_id: '',
      expected_delivery_date: '',
      notes: '',
      internal_notes: '',
      items: [{ material_id: '', quantity: 1, unit_cost: 0, notes: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Watch all items for total calculation
  const watchItems = watch('items');

  // ============================================
  // COMPUTED - Total calculation
  // ============================================

  const orderTotal = useMemo(() => {
    return watchItems.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unit_cost || 0);
      return sum + itemTotal;
    }, 0);
  }, [watchItems]);

  // ============================================
  // EFFECTS - Load data sources
  // ============================================

  useEffect(() => {
    if (isOpen) {
      loadDataSources();
    }
  }, [isOpen]);

  useEffect(() => {
    if (order) {
      reset({
        supplier_id: order.supplier_id,
        expected_delivery_date: order.expected_delivery_date || '',
        notes: order.notes || '',
        internal_notes: order.internal_notes || '',
        items: order.items?.length > 0
          ? order.items.map(item => ({
              material_id: item.material_id,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              notes: item.notes || ''
            }))
          : [{ material_id: '', quantity: 1, unit_cost: 0, notes: '' }]
      });
    } else {
      reset({
        supplier_id: '',
        expected_delivery_date: '',
        notes: '',
        internal_notes: '',
        items: [{ material_id: '', quantity: 1, unit_cost: 0, notes: '' }]
      });
    }
  }, [order, reset]);

  // ============================================
  // DATA LOADING
  // ============================================

  const loadDataSources = async () => {
    try {
      setLoadingSources(true);
      const [suppliersData, materialsData] = await Promise.all([
        suppliersApi.getActiveSuppliers(),
        inventoryApi.getItems()
      ]);
      setSuppliers(suppliersData);
      setMaterials(materialsData.filter(m => m.is_active !== false));
      logger.info('SupplierOrderFormModal', 'Data sources loaded successfully');
    } catch (error) {
      logger.error('SupplierOrderFormModal', 'Error loading data sources', error);
      toaster.create({
        title: 'Error',
        description: 'Error al cargar proveedores y materiales',
        type: 'error',
        duration: 5000
      });
    } finally {
      setLoadingSources(false);
    }
  };

  // ============================================
  // COLLECTIONS FOR SELECTS
  // ============================================

  const suppliersCollection = useMemo(
    () =>
      createListCollection({
        items: suppliers.map(s => ({ label: s.name, value: s.id }))
      }),
    [suppliers]
  );

  const materialsCollection = useMemo(
    () =>
      createListCollection({
        items: materials.map(m => ({
          label: `${m.name} - ${m.unit || 'unidad'}`,
          value: m.id
        }))
      }),
    [materials]
  );

  // ============================================
  // HANDLERS
  // ============================================

  const handleFormSubmit = async (data: SupplierOrderFormData) => {
    try {
      await onSubmit(data);

      toaster.create({
        title: isEditing ? 'Orden actualizada' : 'Orden creada',
        description: `Orden ${isEditing ? 'actualizada' : 'creada'} exitosamente`,
        type: 'success',
        duration: 3000
      });

      onClose();
    } catch (error) {
      logger.error('SupplierOrderFormModal', 'Error submitting form', error);

      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar orden',
        type: 'error',
        duration: 5000
      });
    }
  };

  const handleAddItem = () => {
    append({ material_id: '', quantity: 1, unit_cost: 0, notes: '' });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Get material info helper
  const getMaterialInfo = (materialId: string) => {
    return materials.find(m => m.id === materialId);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="xl"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxHeight="90vh" overflow="auto">
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>
              {isEditing ? 'Editar Orden' : 'Nueva Orden de Compra'}
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <form id="supplier-order-form" onSubmit={handleSubmit(handleFormSubmit)}>
              <Stack direction="column" gap={4}>
                {/* Loading State */}
                {loadingSources && (
                  <Alert status="info">
                    Cargando proveedores y materiales...
                  </Alert>
                )}

                {/* Order Info */}
                <FormSection title="Información de la Orden">
                  <SelectField
                    label="Proveedor *"
                    placeholder="Seleccionar proveedor"
                    error={errors.supplier_id?.message}
                    collection={suppliersCollection}
                    {...register('supplier_id')}
                    disabled={loadingSources}
                  />

                  <InputField
                    label="Fecha de Entrega Esperada"
                    type="date"
                    error={errors.expected_delivery_date?.message}
                    {...register('expected_delivery_date')}
                  />

                  <TextareaField
                    label="Notas (visible para proveedor)"
                    error={errors.notes?.message}
                    {...register('notes')}
                    placeholder="Instrucciones especiales, horarios de entrega, etc."
                    rows={2}
                  />

                  <TextareaField
                    label="Notas Internas"
                    error={errors.internal_notes?.message}
                    {...register('internal_notes')}
                    placeholder="Notas privadas para uso interno"
                    rows={2}
                  />
                </FormSection>

                {/* Items Section */}
                <FormSection
                  title="Materiales"
                  description="Agrega los materiales que deseas ordenar"
                >
                  <Stack direction="column" gap={3}>
                    {fields.map((field, index) => {
                      const materialId = watchItems[index]?.material_id;
                      const material = materialId ? getMaterialInfo(materialId) : null;
                      const itemTotal =
                        (watchItems[index]?.quantity || 0) *
                        (watchItems[index]?.unit_cost || 0);

                      return (
                        <Stack
                          key={field.id}
                          direction="column"
                          gap={2}
                          p={3}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor="border.default"
                        >
                          {/* Item header with remove button */}
                          <HStack justify="space-between">
                            <Text fontWeight="semibold" fontSize="sm">
                              Item {index + 1}
                            </Text>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => handleRemoveItem(index)}
                              disabled={fields.length === 1}
                              aria-label="Eliminar item"
                            >
                              <TrashIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                          </HStack>

                          {/* Material selector */}
                          <SelectField
                            label="Material *"
                            placeholder="Seleccionar material"
                            error={errors.items?.[index]?.material_id?.message}
                            collection={materialsCollection}
                            {...register(`items.${index}.material_id`)}
                            disabled={loadingSources}
                          />

                          {/* Show material stock info */}
                          {material && (
                            <HStack gap={2} fontSize="xs" color="fg.muted">
                              <Text>Stock actual: {material.stock || 0}</Text>
                              {material.minimum_stock && (
                                <Text>| Mínimo: {material.minimum_stock}</Text>
                              )}
                              {material.maximum_stock && (
                                <Text>| Máximo: {material.maximum_stock}</Text>
                              )}
                            </HStack>
                          )}

                          {/* Quantity and cost */}
                          <HStack gap={2}>
                            <NumberField
                              label="Cantidad *"
                              error={errors.items?.[index]?.quantity?.message}
                              {...register(`items.${index}.quantity`, {
                                valueAsNumber: true
                              })}
                              min={0.01}
                              step={0.01}
                              placeholder="0"
                            />

                            <NumberField
                              label="Costo Unitario *"
                              error={errors.items?.[index]?.unit_cost?.message}
                              {...register(`items.${index}.unit_cost`, {
                                valueAsNumber: true
                              })}
                              min={0}
                              step={0.01}
                              placeholder="0.00"
                            />

                            <Stack direction="column" gap={1} flex={1}>
                              <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                                Subtotal
                              </Text>
                              <Badge colorPalette="blue" size="lg" py={2}>
                                ${itemTotal.toFixed(2)}
                              </Badge>
                            </Stack>
                          </HStack>

                          {/* Item notes */}
                          <TextareaField
                            label="Notas del item"
                            error={errors.items?.[index]?.notes?.message}
                            {...register(`items.${index}.notes`)}
                            placeholder="Especificaciones, observaciones..."
                            rows={2}
                          />
                        </Stack>
                      );
                    })}

                    {/* Add item button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                      disabled={loadingSources || fields.length >= 100}
                    >
                      <PlusIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                      Agregar Material
                    </Button>

                    {/* Validation error for items array */}
                    {errors.items?.root && (
                      <Text color="fg.error" fontSize="sm">
                        {errors.items.root.message}
                      </Text>
                    )}
                  </Stack>
                </FormSection>

                {/* Total Section */}
                <HStack
                  justify="space-between"
                  p={4}
                  bg="bg.subtle"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="border.default"
                >
                  <Text fontSize="lg" fontWeight="bold">
                    Total de la Orden
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" colorPalette="blue">
                    ${orderTotal.toFixed(2)}
                  </Text>
                </HStack>
              </Stack>
            </form>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="supplier-order-form"
              colorPalette="blue"
              loading={isSubmitting}
              disabled={loadingSources}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Orden
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
