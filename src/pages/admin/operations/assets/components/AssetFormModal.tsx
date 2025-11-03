/**
 * Asset Form Modal - UI Presentational Component
 * Uses Material Form Pattern with useAssetForm hook
 *
 * Responsibility: ONLY rendering, NO business logic
 * All logic is handled by useAssetForm hook
 *
 * Pattern: Same as FiscalDocumentFormModal, SupplierFormModal
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
import { useAssetForm } from '../hooks/useAssetForm';
import type { AssetFormData } from '@/lib/validation/zod/CommonSchemas';

interface Asset {
  id?: string;
  name: string;
  asset_type: 'equipment' | 'furniture' | 'vehicle' | 'technology' | 'other';
  purchase_date: string;
  purchase_price: number;
  current_value?: number;
  depreciation_rate?: number;
  location_id?: string;
  status: 'active' | 'maintenance' | 'retired' | 'disposed';
  serial_number?: string;
  description: string;
}

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  existingAssets: Asset[];
  onSubmit: (data: AssetFormData) => Promise<void>;
  onSuccess?: () => void;
}

export function AssetFormModal({
  isOpen,
  onClose,
  asset,
  existingAssets,
  onSubmit,
  onSuccess
}: AssetFormModalProps) {

  // All business logic in the hook
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    isSubmitting,
    depreciationMetrics,
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    assetHealthBadge,
    handleSubmit,
    handleCalculateCurrentValue
  } = useAssetForm({
    asset,
    existingAssets,
    onSubmit,
    onSuccess
  });

  const { register, handleSubmit: rhfHandleSubmit } = form;

  const onFormSubmit = rhfHandleSubmit(handleSubmit);

  // Helper to get field border color
  const getFieldBorderColor = (fieldName: keyof AssetFormData) => {
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
            <Badge ml={2} colorPalette={assetHealthBadge.color}>
              {assetHealthBadge.text}
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
              {/* Basic Information */}
              <Text fontWeight="bold">Información Básica</Text>

              <Field
                label="Nombre del Activo"
                required
                invalid={!!fieldErrors.name}
                errorText={fieldErrors.name}
              >
                <Input
                  {...register('name')}
                  placeholder="ej. Laptop Dell Inspiron 15"
                  style={{ border: getFieldBorderColor('name') }}
                />
                {!fieldErrors.name && fieldWarnings.name && (
                  <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.name}</Text>
                )}
              </Field>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field
                  label="Tipo de Activo"
                  required
                  invalid={!!fieldErrors.asset_type}
                  errorText={fieldErrors.asset_type}
                >
                  <select
                    {...register('asset_type')}
                    style={{ border: getFieldBorderColor('asset_type'), padding: '8px', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="equipment">Equipamiento</option>
                    <option value="furniture">Mobiliario</option>
                    <option value="vehicle">Vehículo</option>
                    <option value="technology">Tecnología</option>
                    <option value="other">Otro</option>
                  </select>
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
                    <option value="active">Activo</option>
                    <option value="maintenance">En Mantenimiento</option>
                    <option value="retired">Retirado</option>
                    <option value="disposed">Descartado</option>
                  </select>
                  {!fieldErrors.status && fieldWarnings.status && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.status}</Text>
                  )}
                </Field>
              </Grid>

              <Field
                label="Número de Serie"
                invalid={!!fieldErrors.serial_number}
                errorText={fieldErrors.serial_number}
                helperText="Opcional - para identificación única"
              >
                <Input
                  {...register('serial_number')}
                  placeholder="ej. SN12345ABC"
                  style={{ border: getFieldBorderColor('serial_number') }}
                />
                {!fieldErrors.serial_number && fieldWarnings.serial_number && (
                  <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.serial_number}</Text>
                )}
              </Field>

              <Separator />

              {/* Financial Information */}
              <Text fontWeight="bold">Información Financiera</Text>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <Field
                  label="Precio de Compra"
                  required
                  invalid={!!fieldErrors.purchase_price}
                  errorText={fieldErrors.purchase_price}
                >
                  <Input
                    {...register('purchase_price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    style={{ border: getFieldBorderColor('purchase_price') }}
                  />
                  {!fieldErrors.purchase_price && fieldWarnings.purchase_price && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.purchase_price}</Text>
                  )}
                </Field>

                <Field
                  label="Valor Actual"
                  invalid={!!fieldErrors.current_value}
                  errorText={fieldErrors.current_value}
                >
                  <Input
                    {...register('current_value', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    style={{ border: getFieldBorderColor('current_value') }}
                  />
                  {!fieldErrors.current_value && fieldWarnings.current_value && (
                    <Text color="warning" fontSize="sm">⚠️ {fieldWarnings.current_value}</Text>
                  )}
                </Field>

                <Field
                  label="Tasa de Depreciación (%)"
                  invalid={!!fieldErrors.depreciation_rate}
                  errorText={fieldErrors.depreciation_rate}
                >
                  <Input
                    {...register('depreciation_rate', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    placeholder="10"
                    style={{ border: getFieldBorderColor('depreciation_rate') }}
                  />
                </Field>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Field
                  label="Fecha de Compra"
                  required
                  invalid={!!fieldErrors.purchase_date}
                  errorText={fieldErrors.purchase_date}
                >
                  <Input
                    {...register('purchase_date')}
                    type="date"
                    style={{ border: getFieldBorderColor('purchase_date') }}
                  />
                </Field>

                <Box>
                  <Button
                    type="button"
                    onClick={handleCalculateCurrentValue}
                    size="md"
                    variant="outline"
                    colorPalette="blue"
                    mt={6}
                    width="100%"
                  >
                    🧮 Calcular Valor Actual
                  </Button>
                </Box>
              </Grid>

              {/* Depreciation Metrics */}
              {depreciationMetrics.currentAge > 0 && (
                <Alert
                  status={depreciationMetrics.depreciationPercentage > 80 ? 'warning' : 'info'}
                  title="Métricas de Depreciación"
                >
                  <Stack gap={1} fontSize="sm">
                    <Text>Antigüedad: {depreciationMetrics.currentAge} años</Text>
                    <Text>Depreciación total: ${depreciationMetrics.totalDepreciation.toFixed(2)} ({depreciationMetrics.depreciationPercentage.toFixed(1)}%)</Text>
                    <Text>Valor depreciado: ${depreciationMetrics.depreciatedValue.toFixed(2)}</Text>
                    <Text>Depreciación anual: ${depreciationMetrics.annualDepreciation.toFixed(2)}</Text>
                  </Stack>
                </Alert>
              )}

              <Separator />

              {/* Description */}
              <Field
                label="Descripción"
                required
                invalid={!!fieldErrors.description}
                errorText={fieldErrors.description}
              >
                <Textarea
                  {...register('description')}
                  placeholder="Descripción detallada del activo..."
                  rows={3}
                  style={{ border: getFieldBorderColor('description') }}
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

export default AssetFormModal;
