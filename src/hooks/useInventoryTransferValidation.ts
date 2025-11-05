/**
 * Inventory Transfer Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 *
 * Created: 2025-02-01
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type InventoryTransferFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
}

interface UseInventoryTransferValidationResult {
  form: UseFormReturn<InventoryTransferFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof InventoryTransferFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Helpers
  validateDifferentLocations: (fromLocation: string, toLocation: string) => boolean;
}

export function useInventoryTransferValidation(
  initialData: Partial<InventoryTransferFormData> = {},
  existingTransfers: any[] = [],
  currentTransferId?: string,
  options: ValidationOptions = {}
): UseInventoryTransferValidationResult {

  const { enableRealTime = true } = options;

  const form = useForm<InventoryTransferFormData>({
    resolver: zodResolver(EntitySchemas.inventoryTransfer),
    defaultValues: {
      from_location_id: '',
      to_location_id: '',
      item_id: '',
      quantity: 1,
      reason: '',
      notes: '',
      requested_by: '',
      status: 'pending',
      transfer_date: undefined,
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ===== HELPERS =====
  const validateDifferentLocations = useCallback((fromLocation: string, toLocation: string): boolean => {
    if (!fromLocation || !toLocation) return true;
    return fromLocation !== toLocation;
  }, []);

  // ===== FIELD ERRORS =====
  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof InventoryTransferFormData];
      if (error) {
        errors[key] = error.message as string;
      }
    });

    return errors;
  }, [form.formState.errors]);

  // ===== FIELD WARNINGS =====
  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Same location warning (aunque el schema ya lo valida)
    if (formData.from_location_id && formData.to_location_id) {
      if (formData.from_location_id === formData.to_location_id) {
        warnings.to_location_id = 'Las ubicaciones de origen y destino deben ser diferentes';
      }
    }

    // High quantity warning
    if (formData.quantity > 1000) {
      warnings.quantity = `Transferencia de gran cantidad: ${formData.quantity} unidades`;
    }

    // Status warnings
    if (formData.status === 'cancelled') {
      warnings.status = 'Esta transferencia está cancelada';
    }

    // Missing reason warning
    if (!formData.reason || formData.reason.trim() === '') {
      warnings.reason = 'Se recomienda especificar el motivo de la transferencia';
    }

    // Missing notes warning
    if (!formData.notes || formData.notes.trim() === '') {
      warnings.notes = 'Se recomienda agregar notas adicionales';
    }

    return warnings;
  }, [form.watch]);

  // ===== VALIDATION STATE =====
  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ===== VALIDATE FIELD =====
  const validateField = useCallback((field: keyof InventoryTransferFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  // ===== VALIDATE FORM =====
  const validateForm = useCallback(async (): Promise<boolean> => {
    return await form.trigger();
  }, [form]);

  // ===== CLEAR VALIDATION =====
  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,
    validateDifferentLocations
  };
}
