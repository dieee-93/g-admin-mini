/**
 * Asset Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useSupplierValidation.ts / useProductValidation.ts
 *
 * FEATURES:
 * - Asset name validation
 * - Purchase price/current value validation
 * - Depreciation calculation
 * - Serial number uniqueness
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type AssetFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
}

interface UseAssetValidationResult {
  form: UseFormReturn<AssetFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof AssetFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Business logic validation
  validateSerialNumberUnique: (serialNumber: string) => boolean;
  validatePriceDecline: (purchasePrice: number, currentValue: number) => boolean;
}

interface Asset {
  id?: string;
  name: string;
  serial_number?: string;
  purchase_price: number;
  current_value?: number;
  [key: string]: any;
}

export function useAssetValidation(
  initialData: Partial<AssetFormData> = {},
  existingAssets: Asset[] = [],
  currentAssetId?: string,
  options: ValidationOptions = {}
): UseAssetValidationResult {

  const { enableRealTime = true } = options;

  const form = useForm<AssetFormData>({
    resolver: zodResolver(EntitySchemas.asset),
    defaultValues: {
      name: '',
      asset_type: 'equipment',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 0,
      current_value: undefined,
      depreciation_rate: undefined,
      location_id: undefined,
      status: 'active', // Default value handled here, not in schema
      serial_number: '',
      description: '',
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ========================================================================
  // BUSINESS LOGIC VALIDATORS
  // ========================================================================

  const validateSerialNumberUnique = useCallback((serialNumber: string): boolean => {
    if (!serialNumber || serialNumber.trim() === '') return true;

    const duplicate = existingAssets.find(
      asset =>
        asset.id !== currentAssetId &&
        asset.serial_number?.toLowerCase().trim() === serialNumber.toLowerCase().trim()
    );

    return !duplicate;
  }, [existingAssets, currentAssetId]);

  const validatePriceDecline = useCallback((
    purchasePrice: number,
    currentValue: number
  ): boolean => {
    if (!currentValue) return true; // Optional field
    return currentValue <= purchasePrice; // Current value shouldn't exceed purchase price
  }, []);

  // ========================================================================
  // FIELD ERRORS & WARNINGS
  // ========================================================================

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof AssetFormData];
      if (error) {
        errors[key] = error.message as string;
      }
    });

    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Warning: Serial number duplicado
    if (formData.serial_number && formData.serial_number.trim() !== '') {
      if (!validateSerialNumberUnique(formData.serial_number)) {
        warnings.serial_number = 'Este número de serie ya está registrado';
      }
    }

    // Warning: Valor actual mayor que precio de compra
    if (formData.current_value && formData.purchase_price) {
      if (formData.current_value > formData.purchase_price) {
        warnings.current_value = 'El valor actual es mayor al precio de compra';
      }
    }

    // Warning: Asset inactivo
    if (formData.status === 'retired' || formData.status === 'disposed') {
      warnings.status = 'Este activo está marcado como retirado o descartado';
    }

    // Warning: Sin valor actual
    if (!formData.current_value || formData.current_value === 0) {
      warnings.current_value = 'Se recomienda ingresar el valor actual del activo';
    }

    // Warning: Precio muy alto
    if (formData.purchase_price > 100000) {
      warnings.purchase_price = 'Precio de compra muy alto, verifica el monto';
    }

    return warnings;
  }, [validateSerialNumberUnique]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  const validateField = useCallback((field: keyof AssetFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    const isZodValid = await form.trigger();

    if (!isZodValid) {
      return false;
    }

    const formData = form.getValues();

    // Business logic: Check serial number unique
    if (formData.serial_number && formData.serial_number.trim() !== '') {
      if (!validateSerialNumberUnique(formData.serial_number)) {
        form.setError('serial_number', {
          type: 'custom',
          message: 'Este número de serie ya está registrado'
        });
        return false;
      }
    }

    // Business logic: Validate price decline
    if (formData.current_value && formData.purchase_price) {
      if (!validatePriceDecline(formData.purchase_price, formData.current_value)) {
        form.setError('current_value', {
          type: 'custom',
          message: 'El valor actual no debe exceder el precio de compra'
        });
        return false;
      }
    }

    return true;
  }, [form, validateSerialNumberUnique, validatePriceDecline]);

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

    validateSerialNumberUnique,
    validatePriceDecline
  };
}
