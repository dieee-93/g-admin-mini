/**
 * Customer Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useProductValidation.ts / useSupplierValidation.ts
 *
 * FEATURES:
 * - Customer email uniqueness validation
 * - Phone validation
 * - Name validation
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type CustomerFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

interface UseCustomerValidationResult {
  form: UseFormReturn<CustomerFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof CustomerFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Business logic validation functions
  validateEmailUnique: (email: string) => boolean;
  checkDuplicateEmail: (email: string) => boolean;
}

interface Customer {
  id?: string;
  email?: string;
  name: string;
  [key: string]: any;
}

export function useCustomerValidation(
  initialData: Partial<CustomerFormData> = {},
  existingCustomers: Customer[] = [],
  currentCustomerId?: string,
  options: ValidationOptions = {}
): UseCustomerValidationResult {

  const { enableRealTime = true } = options;

  // React Hook Form with Zod validation
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(EntitySchemas.customer),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ========================================================================
  // BUSINESS LOGIC VALIDATORS
  // ========================================================================

  /**
   * Validate customer email is unique (not used by another customer)
   */
  const validateEmailUnique = useCallback((email: string): boolean => {
    if (!email || email.trim() === '') return true;

    const emailLower = email.toLowerCase().trim();

    const duplicate = existingCustomers.find(
      customer =>
        customer.id !== currentCustomerId &&
        customer.email?.toLowerCase().trim() === emailLower
    );

    return !duplicate;
  }, [existingCustomers, currentCustomerId]);

  /**
   * Check if email is duplicate (returns true if duplicate found)
   */
  const checkDuplicateEmail = useCallback((email: string): boolean => {
    return !validateEmailUnique(email);
  }, [validateEmailUnique]);

  // ========================================================================
  // FIELD ERRORS & WARNINGS
  // ========================================================================

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof CustomerFormData];
      if (error) {
        errors[key] = error.message as string;
      }
    });

    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Warning: Email duplicado
    if (formData.email && formData.email.trim() !== '') {
      if (checkDuplicateEmail(formData.email)) {
        warnings.email = 'Ya existe un cliente con este email';
      }
    }

    // Warning: Sin teléfono
    if (!formData.phone || formData.phone.trim() === '') {
      warnings.phone = 'Se recomienda agregar un número de teléfono';
    }

    return warnings;
  }, [form.watch(), checkDuplicateEmail]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  const validateField = useCallback((field: keyof CustomerFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    // First run Zod validation
    const isZodValid = await form.trigger();

    if (!isZodValid) {
      return false;
    }

    const formData = form.getValues();

    // Business logic: Check email unique
    if (formData.email && formData.email.trim() !== '') {
      if (!validateEmailUnique(formData.email)) {
        form.setError('email', {
          type: 'custom',
          message: 'Ya existe un cliente con este email'
        });
        return false;
      }
    }

    return true;
  }, [form, validateEmailUnique]);

  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,

    // Business logic validators
    validateEmailUnique,
    checkDuplicateEmail
  };
}
