/**
 * Inventory Transfer Form Hook
 * Follows Material Form Pattern - Business logic separated from UI
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (established by useMaterialForm)
 */

import { useState, useMemo, useCallback } from 'react';
import { useInventoryTransferValidation } from '@/modules/materials';
import type { InventoryTransferFormData } from '@/lib/validation/zod/CommonSchemas';

export interface InventoryTransfer {
  id: string;
  from_location_id: string;
  to_location_id: string;
  item_id: string;
  quantity: number;
  reason: string;
  notes: string;
  requested_by: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  transfer_date?: string;
}

interface UseInventoryTransferFormOptions {
  transfer?: InventoryTransfer;
  onSuccess?: () => void;
  onSubmit: (data: InventoryTransferFormData) => Promise<void>;
}

interface TransferMetrics {
  isLargeQuantity: boolean;
  transferUrgency: 'urgent' | 'normal' | 'low';
  transferRisk: 'high' | 'medium' | 'low';
  hasNotes: boolean;
  hasReason: boolean;
}

export function useInventoryTransferForm({
  transfer,
  onSuccess,
  onSubmit
}: UseInventoryTransferFormOptions) {

  // ===== MODO =====
  const isEditMode = !!transfer;

  // ===== LOADING STATES =====
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ===== SUCCESS STATES =====
  const [validationPassed, setValidationPassed] = useState(false);
  const [transferCreated, setTransferCreated] = useState(false);

  // ===== VALIDATION HOOK =====
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm,
    validateDifferentLocations
  } = useInventoryTransferValidation(
    {
      from_location_id: transfer?.from_location_id || '',
      to_location_id: transfer?.to_location_id || '',
      item_id: transfer?.item_id || '',
      quantity: transfer?.quantity || 1,
      reason: transfer?.reason || '',
      notes: transfer?.notes || '',
      requested_by: transfer?.requested_by || '',
      status: transfer?.status || 'pending',
      transfer_date: transfer?.transfer_date
    }
  );

  const { watch, handleSubmit } = form;
  const formData = watch();

  // ===== TRANSFER METRICS =====
  const transferMetrics: TransferMetrics = useMemo(() => {
    const { quantity, reason, notes, status } = formData;

    const isLargeQuantity = (quantity || 0) > 100;

    const transferUrgency: 'urgent' | 'normal' | 'low' =
      status === 'pending' ? 'urgent' :
        status === 'in_transit' ? 'normal' :
          'low';

    const transferRisk: 'high' | 'medium' | 'low' =
      isLargeQuantity && !notes ? 'high' :
        isLargeQuantity || !reason ? 'medium' :
          'low';

    return {
      isLargeQuantity,
      transferUrgency,
      transferRisk,
      hasNotes: !!(notes && notes.trim() !== ''),
      hasReason: !!(reason && reason.trim() !== '')
    };
  }, [formData]);

  // ===== COMPUTED VALUES =====
  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Transferencia' : 'Nueva Transferencia de Inventario';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (isValidating) return 'Validando...';
    if (isSaving) return isEditMode ? 'Actualizando...' : 'Creando...';
    if (transferCreated) return '✓ Guardado';
    return isEditMode ? 'Actualizar Transferencia' : 'Crear Transferencia';
  }, [isValidating, isSaving, transferCreated, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) return { text: 'Con errores', color: 'red' as const };
    if (validationState.hasWarnings) return { text: 'Con advertencias', color: 'yellow' as const };
    if (!formData.from_location_id || !formData.to_location_id || !formData.item_id) {
      return { text: 'Incompleto', color: 'gray' as const };
    }
    return { text: 'Listo para guardar', color: 'green' as const };
  }, [validationState, formData.from_location_id, formData.to_location_id, formData.item_id]);

  const operationProgress = useMemo(() => {
    if (transferCreated) return 100;
    if (isSaving) return 66;
    if (validationPassed) return 33;
    return 0;
  }, [validationPassed, isSaving, transferCreated]);

  const riskBadge = useMemo(() => {
    const { transferRisk } = transferMetrics;

    if (transferRisk === 'high') {
      return { text: 'Riesgo Alto', color: 'red' as const };
    }
    if (transferRisk === 'medium') {
      return { text: 'Riesgo Medio', color: 'yellow' as const };
    }
    return { text: 'Riesgo Bajo', color: 'green' as const };
  }, [transferMetrics]);

  const statusBadge = useMemo(() => {
    const status = formData.status;

    if (status === 'completed') {
      return { text: 'Completada', color: 'green' as const };
    }
    if (status === 'in_transit') {
      return { text: 'En Tránsito', color: 'blue' as const };
    }
    if (status === 'cancelled') {
      return { text: 'Cancelada', color: 'red' as const };
    }
    return { text: 'Pendiente', color: 'yellow' as const };
  }, [formData.status]);

  // ===== SUBMIT HANDLER =====
  const handleFormSubmit = useCallback(
    handleSubmit(async (data) => {
      try {
        // Step 1: Validate
        setIsValidating(true);
        const isValid = await validateForm();
        setIsValidating(false);

        if (!isValid) {
          setValidationPassed(false);
          return;
        }

        setValidationPassed(true);

        // Step 2: Save
        setIsSaving(true);
        await onSubmit(data);
        setIsSaving(false);

        // Step 3: Success
        setTransferCreated(true);

        // Reset states after delay
        setTimeout(() => {
          setValidationPassed(false);
          setTransferCreated(false);
          onSuccess?.();
        }, 1500);

      } catch (error) {
        setIsValidating(false);
        setIsSaving(false);
        setValidationPassed(false);
        throw error;
      }
    }),
    [handleSubmit, validateForm, onSubmit, onSuccess]
  );

  // ===== RETURN API =====
  return {
    // Form
    form,
    formData,
    isEditMode,

    // Validation
    fieldErrors,
    fieldWarnings,
    validationState,

    // Transfer metrics
    transferMetrics,

    // Loading states
    isValidating,
    isSaving,

    // Success states
    validationPassed,
    transferCreated,

    // Computed values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    riskBadge,
    statusBadge,

    // Helpers
    validateDifferentLocations,

    // Handlers
    handleSubmit: handleFormSubmit
  };
}
