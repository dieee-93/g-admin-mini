/**
 * Recurring Billing Form Modal
 * Pure presentational component - follows Material Form Pattern
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (UI separated from business logic)
 * Business Logic: See useRecurringBillingForm hook
 */

import React from 'react';
import {
  Dialog,
  Stack,
  Button,
  Alert,
  Badge,
  Progress,
  Field,
  Input,
  NativeSelect as Select,
  Checkbox,
  Text,
  Card,
  Grid,
  GridItem
} from '@/shared/ui';
import { useRecurringBillingForm, type RecurringBilling } from '../hooks';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';

interface RecurringBillingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringBilling?: RecurringBilling;
  onSuccess?: () => void;
}

export const RecurringBillingFormModal: React.FC<RecurringBillingFormModalProps> = ({
  isOpen,
  onClose,
  recurringBilling,
  onSuccess
}) => {

  // ===== HOOK =====
  const {
    form,
    formData,
    isEditMode,
    fieldErrors,
    fieldWarnings,
    validationState,
    billingMetrics,
    isValidating,
    isSaving,
    billingCreated,
    metricsCalculated,
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    billingHealthBadge,
    autoCalculateNextBilling,
    handleSubmit
  } = useRecurringBillingForm({
    recurringBilling,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onSubmit: async (data) => {
      // Simulate API call
      logger.info('RecurringBilling', 'Creating/updating recurring billing:', data);

      // In production, this would call:
      // await createRecurringBilling(data) or await updateRecurringBilling(id, data)

      notify.success({
        title: isEditMode ? 'Facturación actualizada' : 'Facturación creada',
        description: `La facturación recurrente fue ${isEditMode ? 'actualizada' : 'creada'} exitosamente`
      });
    }
  });

  const { register, formState } = form;
  const { isSubmitting } = formState;

  // ===== FIELD HELPER =====
  const getFieldStyle = (fieldName: keyof typeof fieldErrors) => ({
    borderColor: fieldErrors[fieldName] ? 'var(--border-error)' :
                 fieldWarnings[fieldName] ? 'var(--border-warning)' :
                 undefined
  });

  // ===== RENDER =====
  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{modalTitle}</Dialog.Title>
            <Dialog.CloseTrigger onClick={onClose} />
          </Dialog.Header>

          <Dialog.Body>
            <form onSubmit={handleSubmit} id="recurring-billing-form">
              <Stack gap="6">

                {/* ===== VALIDATION SUMMARY ===== */}
                {validationState.hasErrors && (
                  <Alert status="error" title={`${validationState.errorCount} error(es) de validación`}>
                    Por favor corrige los errores antes de continuar
                  </Alert>
                )}

                {validationState.hasWarnings && !validationState.hasErrors && (
                  <Alert status="warning" title={`${validationState.warningCount} advertencia(s)`}>
                    Revisa las advertencias antes de guardar
                  </Alert>
                )}

                {/* ===== FORM STATUS + BILLING HEALTH ===== */}
                <Stack direction="row" gap="2" justify="space-between" align="center">
                  <Stack direction="row" gap="2">
                    <Badge colorPalette={formStatusBadge.color} size="sm">
                      {formStatusBadge.text}
                    </Badge>
                    <Badge colorPalette={billingHealthBadge.color} size="sm">
                      Salud: {billingHealthBadge.text}
                    </Badge>
                  </Stack>

                  {operationProgress > 0 && (
                    <Text fontSize="sm" color="fg.muted">
                      Progreso: {operationProgress}%
                    </Text>
                  )}
                </Stack>

                {/* ===== PROGRESS INDICATOR ===== */}
                {(isValidating || isSaving || billingCreated) && (
                  <Stack gap="2">
                    <Progress.Root value={operationProgress} size="sm">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text fontSize="sm" color="fg.muted">
                      {isValidating && '⏳ Validando datos...'}
                      {isSaving && '💾 Guardando facturación...'}
                      {billingCreated && '✓ Completado'}
                    </Text>
                  </Stack>
                )}

                {/* ===== BILLING METRICS ===== */}
                {metricsCalculated && (
                  <Card.Root>
                    <Card.Header>
                      <Card.Title>Métricas de Facturación</Card.Title>
                      <Card.Description>Proyecciones financieras en tiempo real</Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="4">
                        <GridItem>
                          <Stack gap="1">
                            <Text fontSize="sm" color="fg.muted">Monto Mensual</Text>
                            <Text fontSize="2xl" fontWeight="bold" color={
                              billingMetrics.revenueHealth === 'high' ? 'green.500' :
                              billingMetrics.revenueHealth === 'medium' ? 'blue.500' :
                              'orange.500'
                            }>
                              ${billingMetrics.monthlyAmount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                            </Text>
                          </Stack>
                        </GridItem>

                        <GridItem>
                          <Stack gap="1">
                            <Text fontSize="sm" color="fg.muted">Ingresos Anuales</Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              ${billingMetrics.annualRevenue.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                            </Text>
                          </Stack>
                        </GridItem>

                        <GridItem>
                          <Stack gap="1">
                            <Text fontSize="sm" color="fg.muted">Valor de Vida (LTV)</Text>
                            <Text fontSize="2xl" fontWeight="bold">
                              ${billingMetrics.lifetimeValue.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                            </Text>
                          </Stack>
                        </GridItem>

                        <GridItem>
                          <Stack gap="1">
                            <Text fontSize="sm" color="fg.muted">Próxima Facturación</Text>
                            <Text fontSize="lg" fontWeight="medium">
                              {billingMetrics.nextBillingDate?.toLocaleDateString('es-AR') || 'N/A'}
                            </Text>
                            {billingMetrics.daysUntilNext !== null && (
                              <Text fontSize="xs" color="fg.muted">
                                ({billingMetrics.daysUntilNext} días)
                              </Text>
                            )}
                          </Stack>
                        </GridItem>
                      </Grid>

                      {billingMetrics.totalCycles !== null && (
                        <Stack mt="4" p="3" bg="bg.muted" borderRadius="md">
                          <Text fontSize="sm">
                            <strong>Ciclos totales:</strong> {billingMetrics.totalCycles} facturaciones
                          </Text>
                        </Stack>
                      )}
                    </Card.Body>
                  </Card.Root>
                )}

                {/* ===== BASIC INFO ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Información Básica</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.customer_id}>
                          <Field.Label>ID del Cliente *</Field.Label>
                          <Input
                            {...register('customer_id')}
                            placeholder="UUID del cliente"
                            style={getFieldStyle('customer_id')}
                          />
                          {fieldErrors.customer_id && (
                            <Field.ErrorText>❌ {fieldErrors.customer_id}</Field.ErrorText>
                          )}
                          {!fieldErrors.customer_id && fieldWarnings.customer_id && (
                            <Field.HelperText color="orange.500">⚠️ {fieldWarnings.customer_id}</Field.HelperText>
                          )}
                        </Field.Root>
                      </GridItem>

                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.service_description}>
                          <Field.Label>Descripción del Servicio *</Field.Label>
                          <Input
                            {...register('service_description')}
                            placeholder="ej. Suscripción Premium Mensual"
                            style={getFieldStyle('service_description')}
                          />
                          {fieldErrors.service_description && (
                            <Field.ErrorText>❌ {fieldErrors.service_description}</Field.ErrorText>
                          )}
                          {!fieldErrors.service_description && fieldWarnings.service_description && (
                            <Field.HelperText color="orange.500">⚠️ {fieldWarnings.service_description}</Field.HelperText>
                          )}
                        </Field.Root>
                      </GridItem>
                    </Grid>
                  </Card.Body>
                </Card.Root>

                {/* ===== BILLING CONFIGURATION ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Configuración de Facturación</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.amount}>
                          <Field.Label>Monto *</Field.Label>
                          <Input
                            {...register('amount', { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            style={getFieldStyle('amount')}
                          />
                          {fieldErrors.amount && (
                            <Field.ErrorText>❌ {fieldErrors.amount}</Field.ErrorText>
                          )}
                          {!fieldErrors.amount && fieldWarnings.amount && (
                            <Field.HelperText color="orange.500">⚠️ {fieldWarnings.amount}</Field.HelperText>
                          )}
                        </Field.Root>
                      </GridItem>

                      <GridItem>
                        <Field.Root>
                          <Field.Label>Frecuencia</Field.Label>
                          <Select.Root collection={{ items: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] }}>
                            <Select.Trigger {...register('frequency')}>
                              <Select.ValueText placeholder="Seleccionar frecuencia" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item item="daily">Diaria</Select.Item>
                              <Select.Item item="weekly">Semanal</Select.Item>
                              <Select.Item item="monthly">Mensual</Select.Item>
                              <Select.Item item="quarterly">Trimestral</Select.Item>
                              <Select.Item item="yearly">Anual</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Field.Root>
                      </GridItem>

                      <GridItem>
                        <Field.Root>
                          <Field.Label>Método de Pago</Field.Label>
                          <Select.Root collection={{ items: ['cash', 'card', 'transfer', 'debit'] }}>
                            <Select.Trigger {...register('payment_method')}>
                              <Select.ValueText placeholder="Seleccionar método" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item item="cash">Efectivo</Select.Item>
                              <Select.Item item="card">Tarjeta</Select.Item>
                              <Select.Item item="transfer">Transferencia</Select.Item>
                              <Select.Item item="debit">Débito</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </Field.Root>
                      </GridItem>
                    </Grid>
                  </Card.Body>
                </Card.Root>

                {/* ===== SCHEDULE ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Programación</Card.Title>
                    <Card.Description>Fechas de inicio, fin y próxima facturación</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.start_date}>
                          <Field.Label>Fecha de Inicio *</Field.Label>
                          <Input
                            {...register('start_date')}
                            type="date"
                            style={getFieldStyle('start_date')}
                          />
                          {fieldErrors.start_date && (
                            <Field.ErrorText>❌ {fieldErrors.start_date}</Field.ErrorText>
                          )}
                        </Field.Root>
                      </GridItem>

                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.end_date}>
                          <Field.Label>Fecha de Fin (opcional)</Field.Label>
                          <Input
                            {...register('end_date')}
                            type="date"
                            style={getFieldStyle('end_date')}
                          />
                          {fieldErrors.end_date && (
                            <Field.ErrorText>❌ {fieldErrors.end_date}</Field.ErrorText>
                          )}
                          {!fieldErrors.end_date && fieldWarnings.end_date && (
                            <Field.HelperText color="orange.500">⚠️ {fieldWarnings.end_date}</Field.HelperText>
                          )}
                        </Field.Root>
                      </GridItem>

                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.next_billing_date}>
                          <Field.Label>Próxima Facturación *</Field.Label>
                          <Stack gap="2">
                            <Input
                              {...register('next_billing_date')}
                              type="date"
                              style={getFieldStyle('next_billing_date')}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={autoCalculateNextBilling}
                              disabled={!formData.start_date || !formData.frequency}
                            >
                              Auto-calcular
                            </Button>
                          </Stack>
                          {fieldErrors.next_billing_date && (
                            <Field.ErrorText>❌ {fieldErrors.next_billing_date}</Field.ErrorText>
                          )}
                        </Field.Root>
                      </GridItem>
                    </Grid>
                  </Card.Body>
                </Card.Root>

                {/* ===== OPTIONS ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Opciones</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                      <GridItem>
                        <Checkbox {...register('auto_charge')}>
                          Cargo automático
                        </Checkbox>
                        {!fieldErrors.auto_charge && fieldWarnings.auto_charge && (
                          <Text fontSize="sm" color="orange.500" mt="1">
                            ⚠️ {fieldWarnings.auto_charge}
                          </Text>
                        )}
                      </GridItem>

                      <GridItem>
                        <Field.Root>
                          <Field.Label>Estado</Field.Label>
                          <Select.Root collection={{ items: ['active', 'paused', 'cancelled'] }}>
                            <Select.Trigger {...register('status')}>
                              <Select.ValueText placeholder="Seleccionar estado" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item item="active">Activo</Select.Item>
                              <Select.Item item="paused">Pausado</Select.Item>
                              <Select.Item item="cancelled">Cancelado</Select.Item>
                            </Select.Content>
                          </Select.Root>
                          {!fieldErrors.status && fieldWarnings.status && (
                            <Field.HelperText color="orange.500">⚠️ {fieldWarnings.status}</Field.HelperText>
                          )}
                        </Field.Root>
                      </GridItem>
                    </Grid>
                  </Card.Body>
                </Card.Root>

              </Stack>
            </form>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </Dialog.ActionTrigger>
            <Button
              type="submit"
              form="recurring-billing-form"
              colorPalette="blue"
              loading={isSubmitting || isValidating || isSaving}
              disabled={validationState.hasErrors}
            >
              {submitButtonContent}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default RecurringBillingFormModal;
