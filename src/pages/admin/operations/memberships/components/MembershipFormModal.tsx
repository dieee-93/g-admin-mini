/**
 * Membership Form Modal - UI Presentational Component
 * Uses Material Form Pattern with useMembershipForm hook
 *
 * Responsibility: ONLY rendering, NO business logic
 * All logic is handled by useMembershipForm hook
 *
 * Pattern: Same as RentalFormModal, AssetFormModal
 * Created: 2025-02-01
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
  HStack
} from '@/shared/ui';
import { useMembershipForm } from '../hooks/useMembershipForm';
import type { MembershipFormData } from '@/lib/validation/zod/CommonSchemas';

interface Membership {
  id?: string;
  customer_id: string;
  membership_type: 'basic' | 'premium' | 'vip';
  start_date: string;
  end_date?: string;
  monthly_fee: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'debit';
  auto_renew: boolean;
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  benefits?: string[];
}

interface MembershipFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership?: Membership | null;
  onSubmit: (data: MembershipFormData) => Promise<void>;
  onSuccess?: () => void;
}

export function MembershipFormModal({
  isOpen,
  onClose,
  membership,
  onSubmit,
  onSuccess
}: MembershipFormModalProps) {

  // All business logic in the hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    isSubmitting,
    membershipMetrics,
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    membershipTypeBadge,
    handleSubmit,
    handleCalculateTotalCost
  } = useMembershipForm({
    membership,
    onSubmit,
    onSuccess
  });

  const { register, handleSubmit: rhfHandleSubmit } = form;

  const onFormSubmit = rhfHandleSubmit(handleSubmit);

  // Helper to get field border color
  const getFieldBorderColor = (fieldName: keyof MembershipFormData) => {
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
            <Badge ml={2} colorPalette={membershipTypeBadge.color}>
              {membershipTypeBadge.text}
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
              {/* Membership Information */}
              <Text fontWeight="bold">Información de la Membresía</Text>

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

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <Field
                  label="Tipo de Membresía"
                  required
                  invalid={!!fieldErrors.membership_type}
                  errorText={fieldErrors.membership_type}
                >
                  <select
                    {...register('membership_type')}
                    style={{ border: getFieldBorderColor('membership_type'), padding: '8px', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="basic">Básica</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </Field>

                <Field
                  label="Tarifa Mensual"
                  required
                  invalid={!!fieldErrors.monthly_fee}
                  errorText={fieldErrors.monthly_fee}
                >
                  <Input
                    {...register('monthly_fee', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    style={{ border: getFieldBorderColor('monthly_fee') }}
                  />
                  {!fieldErrors.monthly_fee && fieldWarnings.monthly_fee && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.monthly_fee}</Text>
                  )}
                </Field>

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
                    <option value="active">Activa</option>
                    <option value="suspended">Suspendida</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="expired">Expirada</option>
                  </select>
                  {!fieldErrors.status && fieldWarnings.status && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.status}</Text>
                  )}
                </Field>
              </Grid>

              <Separator />

              {/* Date Range */}
              <Text fontWeight="bold">Vigencia de la Membresía</Text>

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
                  invalid={!!fieldErrors.end_date}
                  errorText={fieldErrors.end_date}
                  helperText="Opcional - dejar vacío para membresía de por vida"
                >
                  <Input
                    {...register('end_date')}
                    type="date"
                    style={{ border: getFieldBorderColor('end_date') }}
                  />
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

              {/* Membership Metrics */}
              {(membershipMetrics.durationMonths > 0 || membershipMetrics.isLifetime) && (
                <Alert
                  status={membershipMetrics.isExpiringSoon ? 'warning' : membershipMetrics.isLifetime ? 'info' : 'success'}
                  title="Resumen de Costos"
                >
                  <Stack gap={1} fontSize="sm">
                    {membershipMetrics.isLifetime ? (
                      <>
                        <Text fontWeight="bold">Membresía de por vida</Text>
                        <Text>Tarifa mensual: ${membershipMetrics.costPerMonth.toFixed(2)}</Text>
                      </>
                    ) : (
                      <>
                        <Text>Duración: {membershipMetrics.durationMonths} mes(es)</Text>
                        <Text>Costo por mes: ${membershipMetrics.costPerMonth.toFixed(2)}</Text>
                        <Text fontWeight="bold">Costo total: ${membershipMetrics.totalCost.toFixed(2)}</Text>
                        {membershipMetrics.remainingMonths > 0 && (
                          <Text color={membershipMetrics.isExpiringSoon ? 'orange.600' : 'gray.600'}>
                            Meses restantes: {membershipMetrics.remainingMonths}
                            {membershipMetrics.isExpiringSoon && ' ⚠️ Por vencer'}
                          </Text>
                        )}
                      </>
                    )}
                  </Stack>
                </Alert>
              )}

              <Separator />

              {/* Payment Information */}
              <Text fontWeight="bold">Información de Pago</Text>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field
                  label="Método de Pago"
                  required
                  invalid={!!fieldErrors.payment_method}
                  errorText={fieldErrors.payment_method}
                >
                  <select
                    {...register('payment_method')}
                    style={{ border: getFieldBorderColor('payment_method'), padding: '8px', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="debit">Débito Automático</option>
                  </select>
                </Field>

                <Field label="Renovación Automática">
                  <Box mt={2}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" {...register('auto_renew')} />
                      <Text>Renovar automáticamente</Text>
                    </label>
                  </Box>
                </Field>
              </Grid>
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

export default MembershipFormModal;
