/**
 * Supplier Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useCustomerValidation.ts / useProductValidation.ts
 *
 * FEATURES:
 * - Supplier name uniqueness validation
 * - Email validation (unique per supplier)
 * - Phone number validation (Argentina format)
 * - Tax ID (CUIT) validation
 * - Rating validation (1-5 stars)
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type SupplierFormData } from '@/lib/validation/zod/CommonSchemas';
import { logger } from '@/lib/logging';

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

interface UseSupplierValidationResult {
  form: UseFormReturn<SupplierFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof SupplierFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Business logic validation functions
  validateNameUnique: (name: string) => boolean;
  validateEmailUnique: (email: string) => boolean;
  validateTaxId: (taxId: string) => boolean;
  validateRating: (rating: number) => boolean;
  checkDuplicateName: (name: string) => boolean;
}

interface Supplier {
  id?: string;
  name: string;
  email?: string | null;
  tax_id?: string | null;
  rating?: number | null;
  [key: string]: any;
}

export function useSupplierValidation(
  initialData: Partial<SupplierFormData> = {},
  existingSuppliers: Supplier[] = [],
  currentSupplierId?: string,
  options: ValidationOptions = {}
): UseSupplierValidationResult {

  const { enableRealTime = true } = options;

  // React Hook Form with Zod validation
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(EntitySchemas.supplier),
    defaultValues: {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      tax_id: '',
      payment_terms: '',
      rating: null,
      notes: '',
      is_active: true,
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ========================================================================
  // BUSINESS LOGIC VALIDATORS
  // ========================================================================

  /**
   * Validate supplier name is unique (not used by another supplier)
   */
  const validateNameUnique = useCallback((name: string): boolean => {
    if (!name || name.trim() === '') return true;

    const nameLower = name.toLowerCase().trim();

    const duplicate = existingSuppliers.find(
      supplier =>
        supplier.id !== currentSupplierId &&
        supplier.name.toLowerCase().trim() === nameLower
    );

    return !duplicate;
  }, [existingSuppliers, currentSupplierId]);

  /**
   * Check if name is duplicate (returns true if duplicate found)
   */
  const checkDuplicateName = useCallback((name: string): boolean => {
    return !validateNameUnique(name);
  }, [validateNameUnique]);

  /**
   * Validate email is unique (not used by another supplier)
   */
  const validateEmailUnique = useCallback((email: string): boolean => {
    if (!email || email.trim() === '') return true; // Empty is valid (optional field)

    const emailLower = email.toLowerCase().trim();

    const duplicate = existingSuppliers.find(
      supplier =>
        supplier.id !== currentSupplierId &&
        supplier.email?.toLowerCase().trim() === emailLower
    );

    return !duplicate;
  }, [existingSuppliers, currentSupplierId]);

  /**
   * Validate Tax ID (CUIT format for Argentina)
   */
  const validateTaxId = useCallback((taxId: string): boolean => {
    if (!taxId || taxId.trim() === '') return true; // Empty is valid (optional field)

    // CUIT format: 11 digits (stored without hyphens after cleanCuit())
    // UI formats as 20-12345678-9 for display, but stores as 20123456789
    const cuitRegex = /^\d{11}$/;
    const result = cuitRegex.test(taxId.trim());
    
    console.log('🔍 [DEBUG validateTaxId]', {
      taxId,
      trimmed: taxId.trim(),
      length: taxId.trim().length,
      regex: '/^\\d{11}$/',
      result
    });
    
    return result;
  }, []);

  /**
   * Validate rating is in valid range (1-5)
   */
  const validateRating = useCallback((rating: number): boolean => {
    if (rating === null || rating === undefined) return true; // Null is valid (optional field)
    return rating >= 1 && rating <= 5;
  }, []);

  // ========================================================================
  // FIELD ERRORS & WARNINGS
  // ========================================================================

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof SupplierFormData];
      if (error) {
        errors[key] = error.message as string;
      }
    });

    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Warning: Nombre duplicado
    if (formData.name && formData.name.trim() !== '') {
      if (checkDuplicateName(formData.name)) {
        warnings.name = 'Ya existe un proveedor con este nombre';
      }
    }

    // Warning: Email duplicado
    if (formData.email && formData.email.trim() !== '') {
      if (!validateEmailUnique(formData.email)) {
        warnings.email = 'Este email ya está registrado en otro proveedor';
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

    // Warning: Sin persona de contacto
    if (!formData.contact_person || formData.contact_person.trim() === '') {
      warnings.contact_person = 'Se recomienda especificar una persona de contacto';
    }

    // Warning: Tax ID incompleto
    if (formData.tax_id && formData.tax_id.trim() !== '') {
      if (!validateTaxId(formData.tax_id)) {
        warnings.tax_id = 'Formato de CUIT inválido (formato 20-12345678-9)';
      }
    }

    // Warning: Rating muy bajo
    if (formData.rating !== null && formData.rating !== undefined && formData.rating < 3) {
      warnings.rating = 'Calificación baja - considera revisar este proveedor';
    }

    // Warning: Proveedor inactivo
    if (formData.is_active === false) {
      warnings.is_active = 'Este proveedor está marcado como inactivo';
    }

    // Warning: Sin términos de pago
    if (!formData.payment_terms || formData.payment_terms.trim() === '') {
      warnings.payment_terms = 'Se recomienda especificar términos de pago';
    }

    return warnings;
  }, [checkDuplicateName, validateEmailUnique, validateTaxId]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  const validateField = useCallback((field: keyof SupplierFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    logger.debug('SuppliersStore', '🔎 [VALIDATION HOOK] Starting validateForm');

    console.log('🔍 [DEBUG FORM DATA BEFORE VALIDATION]', {
      formData: form.getValues(),
      tax_id: form.getValues().tax_id,
      tax_id_length: form.getValues().tax_id?.length,
      name: form.getValues().name
    });

    // First run Zod validation
    logger.debug('SuppliersStore', '📝 [VALIDATION HOOK] Calling form.trigger() for Zod validation');
    const isZodValid = await form.trigger();
    logger.debug('SuppliersStore', `✅ [VALIDATION HOOK] Zod validation result: ${isZodValid}`);

    if (!isZodValid) {
      logger.warn('SuppliersStore', '❌ [VALIDATION HOOK] Zod validation failed');
      const errors = form.formState.errors;
      logger.debug('SuppliersStore', '📋 [VALIDATION HOOK] Form errors:', errors);
      
      console.log('❌ [DEBUG ZOD VALIDATION FAILED]', {
        errors: errors,
        errorFields: Object.keys(errors),
        errorMessages: Object.entries(errors).map(([field, error]) => ({
          field,
          message: error?.message
        }))
      });
      
      return false;
    }

    const formData = form.getValues();
    logger.debug('SuppliersStore', '📋 [VALIDATION HOOK] Form values:', formData);

    // Business logic: Check name unique
    if (formData.name && formData.name.trim() !== '') {
      logger.debug('SuppliersStore', `🔍 [VALIDATION HOOK] Checking name uniqueness: "${formData.name}"`);
      if (!validateNameUnique(formData.name)) {
        logger.warn('SuppliersStore', '❌ [VALIDATION HOOK] Name is not unique');
        form.setError('name', {
          type: 'custom',
          message: 'Ya existe un proveedor con este nombre'
        });
        return false;
      }
      logger.debug('SuppliersStore', '✅ [VALIDATION HOOK] Name is unique');
    }

    // Business logic: Check email unique
    if (formData.email && formData.email.trim() !== '') {
      logger.debug('SuppliersStore', `🔍 [VALIDATION HOOK] Checking email uniqueness: "${formData.email}"`);
      if (!validateEmailUnique(formData.email)) {
        logger.warn('SuppliersStore', '❌ [VALIDATION HOOK] Email is not unique');
        form.setError('email', {
          type: 'custom',
          message: 'Este email ya está registrado en otro proveedor'
        });
        return false;
      }
      logger.debug('SuppliersStore', '✅ [VALIDATION HOOK] Email is unique');
    }

    // Business logic: Validate Tax ID format
    if (formData.tax_id && formData.tax_id.trim() !== '') {
      logger.debug('SuppliersStore', `🔍 [VALIDATION HOOK] Validating Tax ID format: "${formData.tax_id}"`);
      if (!validateTaxId(formData.tax_id)) {
        logger.warn('SuppliersStore', '❌ [VALIDATION HOOK] Tax ID format is invalid');
        form.setError('tax_id', {
          type: 'custom',
          message: 'Formato de CUIT inválido (formato 20-12345678-9)'
        });
        return false;
      }
      logger.debug('SuppliersStore', '✅ [VALIDATION HOOK] Tax ID format is valid');
    }

    // Business logic: Validate rating range
    if (formData.rating !== null && formData.rating !== undefined) {
      logger.debug('SuppliersStore', `🔍 [VALIDATION HOOK] Validating rating: ${formData.rating}`);
      if (!validateRating(formData.rating)) {
        logger.warn('SuppliersStore', '❌ [VALIDATION HOOK] Rating is out of range');
        form.setError('rating', {
          type: 'custom',
          message: 'La calificación debe estar entre 1 y 5'
        });
        return false;
      }
      logger.debug('SuppliersStore', '✅ [VALIDATION HOOK] Rating is valid');
    }

    logger.info('SuppliersStore', '🎉 [VALIDATION HOOK] All validations passed!');
    return true;
  }, [form, validateNameUnique, validateEmailUnique, validateTaxId, validateRating]);

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
    validateNameUnique,
    validateEmailUnique,
    validateTaxId,
    validateRating,
    checkDuplicateName
  };
}

/**
 * HOOK FEATURES SUMMARY:
 *
 * ✅ Zod Schema Validation: Uses EntitySchemas.supplier
 * ✅ React Hook Form: Full integration with RHF
 * ✅ Name Unique: Checks against existingSuppliers array
 * ✅ Email Unique: Checks against existingSuppliers array
 * ✅ Tax ID (CUIT): Validates Argentina CUIT format
 * ✅ Rating Validation: Must be 1-5
 * ✅ Field Warnings: Duplicate name/email, missing contact info, low rating
 * ✅ Simple API: No complex arrays or calculations
 *
 * USAGE EXAMPLE:
 *
 * const existingSuppliers = [
 *   { id: '1', name: 'Proveedor SA', email: 'ventas@proveedor.com', rating: 4 },
 *   { id: '2', name: 'Distribuidora XYZ', phone: '011 4444-5555', rating: 5 }
 * ];
 *
 * const {
 *   form,
 *   fieldErrors,
 *   fieldWarnings,
 *   validateForm
 * } = useSupplierValidation({}, existingSuppliers);
 *
 * // Submit handler
 * const handleSubmit = async () => {
 *   const isValid = await validateForm();
 *   if (isValid) {
 *     const data = form.getValues();
 *     await createSupplier(data);
 *   }
 * };
 */
