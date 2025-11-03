/**
 * Rental Form Modal - UI Presentational Component
 * Uses Material Form Pattern with useRentalForm hook
 *
 * Responsibility: ONLY rendering, NO business logic
 * All logic is handled by useRentalForm hook
 *
 * Pattern: Same as AssetFormModal, FiscalDocumentFormModal
 * Created: 2025-01-31
 */

import React from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogBackdrop,
  DialogTitle,
  DialogCloseTrigger
} from '@/shared/ui/dialog';
import {
  Stack,
  Button,
  Input,
  Field,
  Text,
  Badge,
  Alert,
  Box,
  Separator,
  Grid,
  Textarea,
  HStack
} from '@/shared/ui';
import { useRentalForm } from '../hooks/useRentalForm';
import type { RentalFormData } from '@/lib/validation/zod/CommonSchemas';

interface Rental {
  id?: string;
  customer_id: string;
  item_name: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  deposit_amount?: number;
  status: 'reserved' | 'active' | 'completed' | 'cancelled';
  notes: string;
}

interface RentalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental?: Rental | null;
  onSubmit: (data: RentalFormData) => Promise<void>;
  onSuccess?: () => void;
}

export function RentalFormModal({
  isOpen,
  onClose,
  rental,
  onSubmit,
  onSuccess
}: RentalFormModalProps) {

  // All business logic in the hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    isSubmitting,
    rentalMetrics,
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    rentalStatusBadge,
    handleSubmit,
    handleCalculateTotalCost
  } = useRentalForm({
    rental,
    onSubmit,
    onSuccess
  });

  const { register, handleSubmit: rhfHandleSubmit } = form;

  const onFormSubmit = rhfHandleSubmit(handleSubmit);

  // Helper to get field border color
  const getFieldBorderColor = (fieldName: keyof RentalFormData) => {
    if (fieldErrors[fieldName]) return '2px solid var(--colors-error)';
    if (fieldWarnings[fieldName]) return '2px solid var(--colors-warning)';
    return '1px solid var(--border-subtle)';
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !isSubmitting && e.open === false && onClose()}>
      <DialogBackdrop />
      <DialogContent size="xl" maxHeight="90vh" overflowY="auto">
        <DialogHeader>
          <DialogTitle>
            {modalTitle}
            <Badge ml={2} colorPalette={formStatusBadge.color}>
              {formStatusBadge.text}
            </Badge>
            <Badge ml={2} colorPalette={rentalStatusBadge.color}>
              {rentalStatusBadge.text}
            </Badge>
          </DialogTitle>
          <DialogCloseTrigger disabled={isSubmitting} />
        </DialogHeader>

        <DialogBody>
          {/* Validation Summary */}
          {validationState.hasErrors && (
            <Alert status="error" title="Errores de validación" mb={4}>
              Por favor corrige {validationState.errorCount} error(es) antes de continuar
            </Alert>
          )}

          {validationState.hasWarnings && !validationState.hasErrors && (
            <Alert status="warning" title="Advertencias" mb={4}>
              Hay {validationState.warningCount} advertencia(s) que deberías revisar
            </Alert>
          )}

          {/* Progress Indicator */}
          {operationProgress > 0 && (
            <Box mb={4}>
              <Text fontSize="sm" mb={1}>Progreso: {operationProgress}%</Text>
              <Box
                height="4px"
                bg="gray.200"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  height="100%"
                  width={`${operationProgress}%`}
                  bg={operationProgress === 100 ? 'green.500' : 'blue.500'}
                  transition="width 0.3s"
                />
              </Box>
            </Box>
          )}

          <form onSubmit={onFormSubmit}>
            <Stack gap={4}>
              {/* Rental Information */}
              <Text fontWeight="bold">Información de la Renta</Text>

              <Field
                label="Cliente ID"
                required
                invalid={!!fieldErrors.customer_id}
                errorText={fieldErrors.customer_id}
                helperText="UUID del cliente"
              >
                <Input
                  {...register('customer_id')}
                  placeholder="ej. 123e4567-e89b-12d3-a456-426614174000"
                  style={{ border: getFieldBorderColor('customer_id') }}
                />
              </Field>

              <Field
                label="Nombre del Item"
                required
                invalid={!!fieldErrors.item_name}
                errorText={fieldErrors.item_name}
              >
                <Input
                  {...register('item_name')}
                  placeholder="ej. Sala de conferencias A1"
                  style={{ border: getFieldBorderColor('item_name') }}
                />
              </Field>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field
                  label="Estado"
                  required
                  invalid={!!fieldErrors.status}
                  errorText={fieldErrors.status}
                >
                  <select
                    {...register('status')}
                    style={{ border: getFieldBorderColor('status'), padding: '8px', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="reserved">Reservada</option>
                    <option value="active">Activa</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </Field>

                <Field
                  label="Tarifa Diaria"
                  required
                  invalid={!!fieldErrors.daily_rate}
                  errorText={fieldErrors.daily_rate}
                >
                  <Input
                    {...register('daily_rate', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    style={{ border: getFieldBorderColor('daily_rate') }}
                  />
                  {!fieldErrors.daily_rate && fieldWarnings.daily_rate && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.daily_rate}</Text>
                  )}
                </Field>
              </Grid>

              <Separator />

              {/* Date Range */}
              <Text fontWeight="bold">Período de Renta</Text>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field
                  label="Fecha de Inicio"
                  required
                  invalid={!!fieldErrors.start_date}
                  errorText={fieldErrors.start_date}
                >
                  <Input
                    {...register('start_date')}
                    type="date"
                    style={{ border: getFieldBorderColor('start_date') }}
                  />
                </Field>

                <Field
                  label="Fecha de Finalización"
                  required
                  invalid={!!fieldErrors.end_date}
                  errorText={fieldErrors.end_date}
                >
                  <Input
                    {...register('end_date')}
                    type="date"
                    style={{ border: getFieldBorderColor('end_date') }}
                  />
                  {!fieldErrors.end_date && fieldWarnings.end_date && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.end_date}</Text>
                  )}
                </Field>
              </Grid>

              <Button
                type="button"
                onClick={handleCalculateTotalCost}
                size="sm"
                variant="outline"
                colorPalette="blue"
              >
                🧮 Calcular Costo Total
              </Button>

              {/* Rental Metrics */}
              {rentalMetrics.totalDays > 0 && (
                <Alert
                  status={rentalMetrics.isLongTerm ? 'info' : 'success'}
                  title="Resumen de Costos"
                >
                  <Stack gap={1} fontSize="sm">
                    <Text>Duración: {rentalMetrics.totalDays} día(s)</Text>
                    <Text>Costo por día: ${rentalMetrics.costPerDay.toFixed(2)}</Text>
                    <Text fontWeight="bold">Costo total: ${rentalMetrics.totalCost.toFixed(2)}</Text>
                    {rentalMetrics.remainingDays > 0 && (
                      <Text color="gray.600">Días restantes: {rentalMetrics.remainingDays}</Text>
                    )}
                    {rentalMetrics.isLongTerm && (
                      <Text color="blue.600">⚠️ Renta de largo plazo (más de 30 días)</Text>
                    )}
                  </Stack>
                </Alert>
              )}

              <Separator />

              {/* Financial Information */}
              <Text fontWeight="bold">Información Financiera</Text>

              <Field
                label="Depósito"
                invalid={!!fieldErrors.deposit_amount}
                errorText={fieldErrors.deposit_amount}
                helperText="Opcional - monto del depósito inicial"
              >
                <Input
                  {...register('deposit_amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  style={{ border: getFieldBorderColor('deposit_amount') }}
                />
              </Field>

              {rentalMetrics.depositPercentage > 0 && (
                <Text fontSize="sm" color={rentalMetrics.depositPercentage >= 20 ? 'green.600' : 'orange.600'}>
                  Depósito: {rentalMetrics.depositPercentage.toFixed(1)}% del costo total
                  {rentalMetrics.depositPercentage < 20 && ' (se recomienda al menos 20%)'}
                </Text>
              )}

              <Separator />

              {/* Notes */}
              <Field
                label="Notas"
                required
                invalid={!!fieldErrors.notes}
                errorText={fieldErrors.notes}
              >
                <Textarea
                  {...register('notes')}
                  placeholder="Detalles adicionales de la renta..."
                  rows={3}
                  style={{ border: getFieldBorderColor('notes') }}
                />
              </Field>
            </Stack>
          </form>
        </DialogBody>

        <DialogFooter>
          <HStack gap={3} width="100%">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              flex={1}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={onFormSubmit}
              loading={isSubmitting}
              disabled={validationState.hasErrors}
              colorPalette="blue"
              flex={2}
            >
              {submitButtonContent}
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export default RentalFormModal;
