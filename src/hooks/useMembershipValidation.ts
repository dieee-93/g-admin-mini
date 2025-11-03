/**
 * Membership Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type MembershipFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
}

interface UseMembershipValidationResult {
  form: UseFormReturn<MembershipFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof MembershipFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;
}

export function useMembershipValidation(
  initialData: Partial<MembershipFormData> = {},
  options: ValidationOptions = {}
): UseMembershipValidationResult {

  const { enableRealTime = true } = options;

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(EntitySchemas.membership),
    defaultValues: {
      customer_id: '',
      membership_type: 'basic', // Must be one of the enum values, not empty string
      start_date: new Date().toISOString().split('T')[0],
      end_date: undefined, // Optional field
      monthly_fee: 0,
      payment_method: 'cash', // Required field
      auto_renew: false, // Required field
      benefits: [], // Array of strings, not single string
      status: 'active',
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;
    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof MembershipFormData];
      if (error) errors[key] = error.message as string;
    });
    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    if (formData.monthly_fee > 5000) {
      warnings.monthly_fee = 'Tarifa mensual muy alta, verifica el monto';
    }

    if (!formData.benefits || formData.benefits.length === 0) {
      warnings.benefits = 'Se recomienda especificar los beneficios de la membresía';
    }

    if (formData.status === 'suspended' || formData.status === 'cancelled') {
      warnings.status = 'Esta membresía está inactiva';
    }

    return warnings;
  }, [form.watch]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  const validateField = useCallback((field: keyof MembershipFormData, value: any) => {
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
    clearValidation
  };
}
