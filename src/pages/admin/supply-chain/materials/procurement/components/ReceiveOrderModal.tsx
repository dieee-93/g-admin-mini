// ============================================
// RECEIVE ORDER MODAL - Receive materials and update stock
// ============================================

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog } from '@chakra-ui/react';
import {
  Button,
  Stack,
  HStack,
  VStack,
  FormSection,
  Text,
  InputField,
  NumberField,
  TextareaField,
  Badge,
  Alert
} from '@/shared/ui';
import {
  ReceiveOrderSchema,
  type ReceiveOrderData,
  type SupplierOrderWithDetails
} from '../types';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ReceiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReceiveOrderData) => Promise<void>;
  order: SupplierOrderWithDetails | null;
}

interface ItemFormData {
  id: string;
  material_name: string;
  ordered_quantity: number;
  received_quantity: number;
  unit: string;
}

interface FormData {
  actual_delivery_date: string;
  items: ItemFormData[];
  notes: string;
}

export function ReceiveOrderModal({
  isOpen,
  onClose,
  onSubmit,
  order
}: ReceiveOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // FORM SETUP
  // ============================================

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      actual_delivery_date: new Date().toISOString().split('T')[0],
      items: [],
      notes: ''
    }
  });

  const { fields } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');

  // ============================================
  // EFFECTS - Initialize form
  // ============================================

  useEffect(() => {
    if (order && isOpen) {
      reset({
        actual_delivery_date: new Date().toISOString().split('T')[0],
        items: order.items.map(item => ({
          id: item.id,
          material_name: item.material?.name || 'Material desconocido',
          ordered_quantity: item.quantity,
          received_quantity: item.quantity, // Default to ordered quantity
          unit: item.material?.unit || 'unidad'
        })),
        notes: ''
      });
    }
  }, [order, isOpen, reset]);

  // ============================================
  // COMPUTED - Validation checks
  // ============================================

  const hasDiscrepancies = watchItems.some(
    item => item.received_quantity !== item.ordered_quantity
  );

  const totalOrdered = watchItems.reduce((sum, item) => sum + item.ordered_quantity, 0);
  const totalReceived = watchItems.reduce((sum, item) => sum + item.received_quantity, 0);
  const completionRate =
    totalOrdered > 0 ? ((totalReceived / totalOrdered) * 100).toFixed(1) : '0';

  // ============================================
  // HANDLERS
  // ============================================

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Transform to ReceiveOrderData format
      const receiveData: ReceiveOrderData = {
        actual_delivery_date: data.actual_delivery_date || undefined,
        items: data.items.map(item => ({
          id: item.id,
          received_quantity: item.received_quantity
        })),
        notes: data.notes || undefined
      };

      // Validate with Zod
      ReceiveOrderSchema.parse(receiveData);

      await onSubmit(receiveData);

      toaster.create({
        title: 'Orden recibida',
        description: 'La orden ha sido recibida y el stock actualizado exitosamente',
        type: 'success',
        duration: 3000
      });

      onClose();
    } catch (error) {
      logger.error('ReceiveOrderModal', 'Error submitting form', error);

      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al recibir orden',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!order) return null;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size="lg"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxHeight="90vh" overflow="auto">
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>Recibir Orden de Compra</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <form id="receive-order-form" onSubmit={handleSubmit(handleFormSubmit)}>
              <Stack direction="column" gap="4">
                {/* Order Info Summary */}
                <VStack align="stretch" gap="2" p="3" bg="bg.subtle" borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                      N° Orden
                    </Text>
                    <Badge colorPalette="blue">{order.po_number}</Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                      Proveedor
                    </Text>
                    <Text fontSize="sm">{order.supplier?.name || '-'}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                      Fecha Esperada
                    </Text>
                    <Text fontSize="sm">
                      {order.expected_delivery_date
                        ? new Date(order.expected_delivery_date).toLocaleDateString()
                        : '-'}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
                      Total Orden
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      ${Number(order.total_amount).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>

                {/* Delivery Info */}
                <FormSection title="Información de Entrega">
                  <InputField
                    label="Fecha de Entrega Real *"
                    type="date"
                    error={errors.actual_delivery_date?.message}
                    {...register('actual_delivery_date')}
                  />
                </FormSection>

                {/* Items Section */}
                <FormSection
                  title="Materiales Recibidos"
                  description="Verifica las cantidades recibidas de cada material"
                >
                  <Stack direction="column" gap="3">
                    {fields.map((field, index) => {
                      const item = watchItems[index];
                      const hasDiscrepancy = item && item.received_quantity !== item.ordered_quantity;
                      const isOver = item && item.received_quantity > item.ordered_quantity;

                      return (
                        <Stack
                          key={field.id}
                          direction="column"
                          gap="2"
                          p="3"
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor={
                            hasDiscrepancy
                              ? isOver
                                ? 'orange.500'
                                : 'yellow.500'
                              : 'border.default'
                          }
                          bg={hasDiscrepancy ? 'yellow.50' : 'transparent'}
                        >
                          {/* Material name */}
                          <HStack justify="space-between">
                            <VStack align="start" gap="0">
                              <Text fontWeight="semibold">{item.material_name}</Text>
                              <Text fontSize="xs" color="fg.muted">
                                Unidad: {item.unit}
                              </Text>
                            </VStack>

                            {/* Discrepancy indicator */}
                            {hasDiscrepancy && (
                              <Badge
                                colorPalette={isOver ? 'orange' : 'yellow'}
                                size="sm"
                                variant="subtle"
                              >
                                {isOver ? (
                                  <>
                                    <ExclamationTriangleIcon
                                      style={{ width: 12, height: 12, marginRight: 4 }}
                                    />
                                    Exceso
                                  </>
                                ) : (
                                  <>
                                    <ExclamationTriangleIcon
                                      style={{ width: 12, height: 12, marginRight: 4 }}
                                    />
                                    Parcial
                                  </>
                                )}
                              </Badge>
                            )}
                          </HStack>

                          {/* Quantities */}
                          <HStack gap="3">
                            {/* Ordered quantity (read-only) */}
                            <VStack align="start" gap="1" flex={1}>
                              <Text fontSize="xs" fontWeight="medium" color="fg.muted">
                                Cantidad Ordenada
                              </Text>
                              <Badge colorPalette="gray" size="lg" py="2" width="full">
                                {item.ordered_quantity} {item.unit}
                              </Badge>
                            </VStack>

                            {/* Received quantity (editable) */}
                            <VStack align="start" gap="1" flex={1}>
                              <NumberField
                                label="Cantidad Recibida *"
                                error={errors.items?.[index]?.received_quantity?.message}
                                {...register(`items.${index}.received_quantity`, {
                                  valueAsNumber: true
                                })}
                                min={0}
                                step={0.01}
                                placeholder="0"
                              />
                            </VStack>
                          </HStack>

                          {/* Show discrepancy warning */}
                          {hasDiscrepancy && (
                            <Alert
                              status={isOver ? 'warning' : 'info'}
                              variant="subtle"
                              size="sm"
                            >
                              {isOver
                                ? 'Se recibió más de lo ordenado. Verifica con el proveedor.'
                                : 'Se recibió menos de lo ordenado. Asegúrate de registrar la diferencia.'}
                            </Alert>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                </FormSection>

                {/* Summary Section */}
                <VStack
                  align="stretch"
                  gap="2"
                  p="4"
                  bg="bg.subtle"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="border.default"
                >
                  <Text fontSize="md" fontWeight="bold">
                    Resumen de Recepción
                  </Text>

                  <HStack justify="space-between">
                    <Text fontSize="sm" color="fg.muted">
                      Total Ordenado
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {totalOrdered.toFixed(2)} unidades
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" color="fg.muted">
                      Total Recibido
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {totalReceived.toFixed(2)} unidades
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="sm" color="fg.muted">
                      Tasa de Completitud
                    </Text>
                    <Badge
                      colorPalette={
                        Number(completionRate) === 100
                          ? 'green'
                          : Number(completionRate) >= 90
                          ? 'blue'
                          : 'yellow'
                      }
                      size="sm"
                    >
                      {completionRate}%
                    </Badge>
                  </HStack>

                  {hasDiscrepancies && (
                    <Alert status="warning" variant="subtle" size="sm">
                      <ExclamationTriangleIcon
                        style={{ width: 16, height: 16, marginRight: 8 }}
                      />
                      Hay diferencias entre lo ordenado y lo recibido
                    </Alert>
                  )}
                </VStack>

                {/* Notes Section */}
                <FormSection title="Notas de Recepción">
                  <TextareaField
                    label="Observaciones"
                    error={errors.notes?.message}
                    {...register('notes')}
                    placeholder="Ej: Algunos materiales llegaron con empaque dañado, Material X venció más tarde..."
                    rows={3}
                  />
                </FormSection>

                {/* Final confirmation warning */}
                <Alert status="info" variant="subtle">
                  <CheckCircleIcon style={{ width: 16, height: 16, marginRight: 8 }} />
                  Al confirmar, el stock de los materiales será actualizado automáticamente con
                  las cantidades recibidas.
                </Alert>
              </Stack>
            </form>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="receive-order-form"
              colorPalette="green"
              loading={isSubmitting}
            >
              Confirmar Recepción
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
