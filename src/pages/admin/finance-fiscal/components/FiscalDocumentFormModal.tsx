/**
 * Fiscal Document Form Modal - UI Presentational Component
 * Uses Material Form Pattern with useFiscalDocumentForm hook
 *
 * Responsibility: ONLY rendering, NO business logic
 * All logic is handled by useFiscalDocumentForm hook
 *
 * Pattern: Same as SupplierFormModal, ShiftForm
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
  HStack
} from '@/shared/ui';
import { useFiscalDocumentForm } from '../hooks/useFiscalDocumentForm';
import type { FiscalDocumentFormData } from '@/lib/validation/zod/CommonSchemas';

interface FiscalDocument {
  id?: string;
  document_type: 'factura_a' | 'factura_b' | 'factura_c' | 'nota_credito' | 'nota_debito';
  point_of_sale: number;
  document_number: number;
  issue_date: string;
  customer_name: string;
  customer_cuit: string;
  customer_address: string;
  subtotal: number;
  iva_amount: number;
  total: number;
  cae: string;
  cae_expiration: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    iva_rate: number;
    subtotal: number;
  }>;
}

interface FiscalDocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: FiscalDocument | null;
  existingDocuments: FiscalDocument[];
  onSubmit: (data: FiscalDocumentFormData) => Promise<void>;
  onSuccess?: () => void;
}

export function FiscalDocumentFormModal({
  isOpen,
  onClose,
  document,
  existingDocuments,
  onSubmit,
  onSuccess
}: FiscalDocumentFormModalProps) {

  // All business logic in the hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    isSubmitting,
    fiscalMetrics,
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    complianceBadge,
    handleSubmit,
    handleCalculateTax,
    validateCUITFormat
  } = useFiscalDocumentForm({
    document,
    existingDocuments,
    onSubmit,
    onSuccess
  });

  const { register, handleSubmit: rhfHandleSubmit } = form;

  const onFormSubmit = rhfHandleSubmit(handleSubmit);

  // Helper to get field border color
  const getFieldBorderColor = (fieldName: keyof FiscalDocumentFormData) => {
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
            <Badge ml={2} colorPalette={complianceBadge.color}>
              {complianceBadge.text}
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
              {/* Document Type & Number */}
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <Field
                  label="Tipo de Comprobante"
                  required
                  invalid={!!fieldErrors.document_type}
                  errorText={fieldErrors.document_type}
                >
                  <select
                    {...register('document_type')}
                    style={{ border: getFieldBorderColor('document_type'), padding: '8px', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="factura_a">Factura A</option>
                    <option value="factura_b">Factura B</option>
                    <option value="factura_c">Factura C</option>
                    <option value="nota_credito">Nota de Crédito</option>
                    <option value="nota_debito">Nota de Débito</option>
                  </select>
                  {!fieldErrors.document_type && fieldWarnings.document_type && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.document_type}</Text>
                  )}
                </Field>

                <Field
                  label="Punto de Venta"
                  required
                  invalid={!!fieldErrors.point_of_sale}
                  errorText={fieldErrors.point_of_sale}
                >
                  <Input
                    {...register('point_of_sale', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={9999}
                    placeholder="1"
                    style={{ border: getFieldBorderColor('point_of_sale') }}
                  />
                  {!fieldErrors.point_of_sale && fieldWarnings.point_of_sale && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.point_of_sale}</Text>
                  )}
                </Field>

                <Field
                  label="Número"
                  required
                  invalid={!!fieldErrors.document_number}
                  errorText={fieldErrors.document_number}
                >
                  <Input
                    {...register('document_number', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    placeholder="1"
                    style={{ border: getFieldBorderColor('document_number') }}
                  />
                  {!fieldErrors.document_number && fieldWarnings.document_number && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.document_number}</Text>
                  )}
                </Field>
              </Grid>

              {/* Dates */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field
                  label="Fecha de Emisión"
                  required
                  invalid={!!fieldErrors.issue_date}
                  errorText={fieldErrors.issue_date}
                >
                  <Input
                    {...register('issue_date')}
                    type="date"
                    style={{ border: getFieldBorderColor('issue_date') }}
                  />
                </Field>

                <Field
                  label="Vencimiento CAE"
                  required
                  invalid={!!fieldErrors.cae_expiration}
                  errorText={fieldErrors.cae_expiration}
                >
                  <Input
                    {...register('cae_expiration')}
                    type="date"
                    style={{ border: getFieldBorderColor('cae_expiration') }}
                  />
                  {!fieldErrors.cae_expiration && fieldWarnings.cae_expiration && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.cae_expiration}</Text>
                  )}
                </Field>
              </Grid>

              <Separator />

              {/* Customer Information */}
              <Text fontWeight="bold">Datos del Cliente</Text>

              <Field
                label="Nombre / Razón Social"
                required
                invalid={!!fieldErrors.customer_name}
                errorText={fieldErrors.customer_name}
              >
                <Input
                  {...register('customer_name')}
                  placeholder="Juan Pérez / Empresa SA"
                  style={{ border: getFieldBorderColor('customer_name') }}
                />
              </Field>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field
                  label="CUIT/CUIL"
                  required
                  invalid={!!fieldErrors.customer_cuit}
                  errorText={fieldErrors.customer_cuit}
                  helperText="Formato: 20-12345678-9"
                >
                  <Input
                    {...register('customer_cuit')}
                    placeholder="20-12345678-9"
                    style={{ border: getFieldBorderColor('customer_cuit') }}
                  />
                  {!fieldErrors.customer_cuit && fieldWarnings.customer_cuit && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.customer_cuit}</Text>
                  )}
                </Field>

                <Field
                  label="Dirección"
                  required
                  invalid={!!fieldErrors.customer_address}
                  errorText={fieldErrors.customer_address}
                >
                  <Input
                    {...register('customer_address')}
                    placeholder="Calle 123, Ciudad"
                    style={{ border: getFieldBorderColor('customer_address') }}
                  />
                </Field>
              </Grid>

              <Separator />

              {/* Amounts */}
              <Text fontWeight="bold">Montos</Text>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <Field
                  label="Subtotal"
                  required
                  invalid={!!fieldErrors.subtotal}
                  errorText={fieldErrors.subtotal}
                >
                  <Input
                    {...register('subtotal', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    style={{ border: getFieldBorderColor('subtotal') }}
                  />
                </Field>

                <Field
                  label="IVA"
                  required
                  invalid={!!fieldErrors.iva_amount}
                  errorText={fieldErrors.iva_amount}
                >
                  <Input
                    {...register('iva_amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    style={{ border: getFieldBorderColor('iva_amount') }}
                  />
                  {!fieldErrors.iva_amount && fieldWarnings.iva_amount && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.iva_amount}</Text>
                  )}
                </Field>

                <Field
                  label="Total"
                  required
                  invalid={!!fieldErrors.total}
                  errorText={fieldErrors.total}
                >
                  <Input
                    {...register('total', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    style={{ border: getFieldBorderColor('total') }}
                  />
                  {!fieldErrors.total && fieldWarnings.total && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.total}</Text>
                  )}
                </Field>
              </Grid>

              <Button
                type="button"
                onClick={handleCalculateTax}
                size="sm"
                variant="outline"
                colorPalette="blue"
              >
                🧮 Calcular Totales Automáticamente
              </Button>

              {/* Fiscal Metrics */}
              {fiscalMetrics.itemCount > 0 && (
                <Alert
                  status={fiscalMetrics.totalsMatch ? 'success' : 'warning'}
                  title="Métricas Fiscales"
                >
                  <Stack gap={1} fontSize="sm">
                    <Text>Items: {fiscalMetrics.itemCount}</Text>
                    <Text>Subtotal calculado: ${fiscalMetrics.itemsSubtotal.toFixed(2)}</Text>
                    <Text>IVA calculado: ${fiscalMetrics.calculatedIVA.toFixed(2)}</Text>
                    <Text>Total calculado: ${fiscalMetrics.calculatedTotal.toFixed(2)}</Text>
                    <Text>
                      {fiscalMetrics.totalsMatch
                        ? '✅ Los totales coinciden'
                        : '⚠️ Los totales no coinciden con los items'}
                    </Text>
                  </Stack>
                </Alert>
              )}

              <Separator />

              {/* CAE */}
              <Text fontWeight="bold">CAE (AFIP)</Text>

              <Field
                label="CAE"
                required
                invalid={!!fieldErrors.cae}
                errorText={fieldErrors.cae}
                helperText="14 dígitos numéricos"
              >
                <Input
                  {...register('cae')}
                  placeholder="12345678901234"
                  maxLength={14}
                  style={{ border: getFieldBorderColor('cae') }}
                />
                {!fieldErrors.cae && fieldWarnings.cae && (
                  <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.cae}</Text>
                )}
              </Field>

              {/* Items Warning */}
              {fieldWarnings.items && (
                <Alert status="warning" title="Items">
                  ⚠️ {fieldWarnings.items}
                </Alert>
              )}
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

export default FiscalDocumentFormModal;
