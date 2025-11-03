/**
 * Recurring Billing Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type RecurringBillingFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
}

interface UseRecurringBillingValidationResult {
  form: UseFormReturn<RecurringBillingFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof RecurringBillingFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  calculateNextBillingDate: (startDate: string, frequency: string) => string;
}

export function useRecurringBillingValidation(
  initialData: Partial<RecurringBillingFormData> = {},
  options: ValidationOptions = {}
): UseRecurringBillingValidationResult {

  const { enableRealTime = true } = options;

  const form = useForm<RecurringBillingFormData>({
    resolver: zodResolver(EntitySchemas.recurringBilling),
    defaultValues: {
      customer_id: '',
      service_description: '',
      amount: 0,
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: undefined,
      payment_method: 'card',
      auto_charge: false,
      status: 'active',
      next_billing_date: new Date().toISOString().split('T')[0],
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  const calculateNextBillingDate = useCallback((
    startDate: string,
    frequency: string
  ): string => {
    const date = new Date(startDate);

    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    return date.toISOString().split('T')[0];
  }, []);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;
    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof RecurringBillingFormData];
      if (error) errors[key] = error.message as string;
    });
    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    if (formData.amount > 100000) {
      warnings.amount = 'Monto muy alto para facturación recurrente';
    }

    if (formData.auto_charge && !formData.payment_method) {
      warnings.auto_charge = 'Auto-cargo requiere método de pago configurado';
    }

    if (formData.status !== 'active') {
      warnings.status = 'Esta facturación recurrente está inactiva';
    }

    if (formData.end_date && formData.start_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

      if (days < 0) {
        warnings.end_date = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    return warnings;
  }, [form.watch]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  const validateField = useCallback((field: keyof RecurringBillingFormData, value: any) => {
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
    calculateNextBillingDate
  };
}
