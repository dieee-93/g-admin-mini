/**
 * Customer Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useFiscalDocumentValidation.ts / useEmployeeValidation.ts
 *
 * FEATURES:
 * - Email duplicate validation
 * - Phone number validation (Argentina format)
 * - Name validation
 * - Address validation
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
  validatePhoneFormat: (phone: string) => boolean;
  checkDuplicateEmail: (email: string) => boolean;
}

interface Customer {
  id?: string;
  email?: string;
  phone?: string;
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
      address: '',
      notes: '',
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ========================================================================
  // BUSINESS LOGIC VALIDATORS
  // ========================================================================

  /**
   * Validate email is unique (not used by another customer)
   */
  const validateEmailUnique = useCallback((email: string): boolean => {
    if (!email || email.trim() === '') return true; // Empty is valid (optional field)

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

  /**
   * Validate phone format (Argentina: +54 9 11 1234-5678 or variations)
   */
  const validatePhoneFormat = useCallback((phone: string): boolean => {
    if (!phone || phone.trim() === '') return true; // Empty is valid (optional field)

    // Argentina phone patterns:
    // +54 9 11 1234-5678
    // 011 1234-5678
    // 11 1234 5678
    // 1512345678 (mobile)
    const phoneRegex = /^(\+54\s?)?(\d{2,4}[\s-]?)?\d{4}[\s-]?\d{4}$/;

    return phoneRegex.test(phone.trim());
  }, []);

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
        warnings.email = 'Este email ya está registrado en otro cliente';
      }
    }

    // Warning: Teléfono sin código de área
    if (formData.phone && formData.phone.trim() !== '') {
      if (!formData.phone.includes('+54') && !formData.phone.startsWith('011')) {
        warnings.phone = 'Recuerda incluir código de área (ej: 011, +54)';
      }
    }

    // Warning: Sin email ni teléfono
    if (
      (!formData.email || formData.email.trim() === '') &&
      (!formData.phone || formData.phone.trim() === '')
    ) {
      warnings.email = 'Se recomienda ingresar al menos email o teléfono';
      warnings.phone = 'Se recomienda ingresar al menos email o teléfono';
    }

    // Warning: Nombre muy corto
    if (formData.name && formData.name.length < 3) {
      warnings.name = 'El nombre parece muy corto';
    }

    // Warning: Dirección muy larga
    if (formData.address && formData.address.length > 150) {
      warnings.address = 'La dirección es muy larga, considera resumirla';
    }

    return warnings;
  }, [form.watch, checkDuplicateEmail]);

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
          message: 'Este email ya está registrado en otro cliente'
        });
        return false;
      }
    }

    // Business logic: Validate phone format
    if (formData.phone && formData.phone.trim() !== '') {
      if (!validatePhoneFormat(formData.phone)) {
        form.setError('phone', {
          type: 'custom',
          message: 'Formato de teléfono inválido. Usa: +54 9 11 1234-5678 o 011 1234-5678'
        });
        return false;
      }
    }

    // Business logic: At least email or phone
    if (
      (!formData.email || formData.email.trim() === '') &&
      (!formData.phone || formData.phone.trim() === '')
    ) {
      form.setError('email', {
        type: 'custom',
        message: 'Debes ingresar al menos email o teléfono'
      });
      form.setError('phone', {
        type: 'custom',
        message: 'Debes ingresar al menos email o teléfono'
      });
      return false;
    }

    return true;
  }, [form, validateEmailUnique, validatePhoneFormat]);

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
    validatePhoneFormat,
    checkDuplicateEmail
  };
}

/**
 * HOOK FEATURES SUMMARY:
 *
 * ✅ Zod Schema Validation: Uses EntitySchemas.customer
 * ✅ React Hook Form: Full integration with RHF
 * ✅ Email Unique: Checks against existingCustomers array
 * ✅ Phone Format: Validates Argentina phone format
 * ✅ Field Warnings: Duplicate email, missing contact info, short name
 * ✅ Business Logic: At least email or phone required
 * ✅ Simple API: No complex arrays or calculations
 *
 * USAGE EXAMPLE:
 *
 * const existingCustomers = [
 *   { id: '1', name: 'Juan', email: 'juan@example.com' },
 *   { id: '2', name: 'María', phone: '011 4444-5555' }
 * ];
 *
 * const {
 *   form,
 *   fieldErrors,
 *   fieldWarnings,
 *   validateForm
 * } = useCustomerValidation({}, existingCustomers);
 *
 * // Submit handler
 * const handleSubmit = async () => {
 *   const isValid = await validateForm();
 *   if (isValid) {
 *     const data = form.getValues();
 *     await createCustomer(data);
 *   }
 * };
 */
