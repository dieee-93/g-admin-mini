/**
 * Rental Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type RentalFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
}

interface UseRentalValidationResult {
  form: UseFormReturn<RentalFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof RentalFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  calculateTotalCost: (startDate: string, endDate: string, dailyRate: number) => number;
}

export function useRentalValidation(
  initialData: Partial<RentalFormData> = {},
  options: ValidationOptions = {}
): UseRentalValidationResult {

  const { enableRealTime = true } = options;

  const form = useForm<RentalFormData>({
    resolver: zodResolver(EntitySchemas.rental),
    defaultValues: {
      customer_id: '',
      item_name: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      daily_rate: 0,
      deposit_amount: undefined,
      status: 'reserved', // Default to 'reserved' instead of 'active'
      notes: '', // Changed from 'description' to match schema
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  const calculateTotalCost = useCallback((
    startDate: string,
    endDate: string,
    dailyRate: number
  ): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * dailyRate : 0;
  }, []);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;
    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof RentalFormData];
      if (error) errors[key] = error.message as string;
    });
    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    if (formData.start_date && formData.end_date) {
      const days = calculateTotalCost(formData.start_date, formData.end_date, 1);
      if (days > 30) {
        warnings.end_date = 'Periodo de renta muy largo (más de 30 días)';
      }
    }

    if (formData.daily_rate > 10000) {
      warnings.daily_rate = 'Tarifa diaria muy alta, verifica el monto';
    }

    return warnings;
  }, [form.watch, calculateTotalCost]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  const validateField = useCallback((field: keyof RentalFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    return await form.trigger();
  }, [form]);

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
    calculateTotalCost
  };
}
