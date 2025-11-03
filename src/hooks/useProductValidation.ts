/**
 * Product Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useCustomerValidation.ts / useEmployeeValidation.ts
 *
 * FEATURES:
 * - Product name uniqueness validation
 * - Price validation (must be positive)
 * - Category validation
 * - Description validation
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type ProductFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

interface UseProductValidationResult {
  form: UseFormReturn<ProductFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof ProductFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Business logic validation functions
  validateNameUnique: (name: string) => boolean;
  validatePriceReasonable: (price: number) => boolean;
  checkDuplicateName: (name: string) => boolean;
}

interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  [key: string]: any;
}

export function useProductValidation(
  initialData: Partial<ProductFormData> = {},
  existingProducts: Product[] = [],
  currentProductId?: string,
  options: ValidationOptions = {}
): UseProductValidationResult {

  const { enableRealTime = true } = options;

  // React Hook Form with Zod validation
  const form = useForm<ProductFormData>({
    resolver: zodResolver(EntitySchemas.product),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      is_active: true,
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ========================================================================
  // BUSINESS LOGIC VALIDATORS
  // ========================================================================

  /**
   * Validate product name is unique (not used by another product)
   */
  const validateNameUnique = useCallback((name: string): boolean => {
    if (!name || name.trim() === '') return true;

    const nameLower = name.toLowerCase().trim();

    const duplicate = existingProducts.find(
      product =>
        product.id !== currentProductId &&
        product.name.toLowerCase().trim() === nameLower
    );

    return !duplicate;
  }, [existingProducts, currentProductId]);

  /**
   * Check if name is duplicate (returns true if duplicate found)
   */
  const checkDuplicateName = useCallback((name: string): boolean => {
    return !validateNameUnique(name);
  }, [validateNameUnique]);

  /**
   * Validate price is reasonable (not too high or too low)
   */
  const validatePriceReasonable = useCallback((price: number): boolean => {
    if (price <= 0) return false;
    if (price > 1000000) return false; // Warning for very high prices
    return true;
  }, []);

  // ========================================================================
  // FIELD ERRORS & WARNINGS
  // ========================================================================

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof ProductFormData];
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
        warnings.name = 'Ya existe un producto con este nombre';
      }
    }

    // Warning: Precio muy alto
    if (formData.price > 50000) {
      warnings.price = 'Precio muy alto, verifica que sea correcto';
    }

    // Warning: Precio muy bajo
    if (formData.price > 0 && formData.price < 10) {
      warnings.price = 'Precio muy bajo, verifica que sea correcto';
    }

    // Warning: Sin descripción
    if (!formData.description || formData.description.trim() === '') {
      warnings.description = 'Se recomienda agregar una descripción del producto';
    }

    // Warning: Descripción muy corta
    if (formData.description && formData.description.length < 10) {
      warnings.description = 'La descripción es muy corta, agrega más detalles';
    }

    // Warning: Producto inactivo
    if (formData.is_active === false) {
      warnings.is_active = 'Este producto está marcado como inactivo y no aparecerá en ventas';
    }

    return warnings;
  }, [form.watch, checkDuplicateName]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  const validateField = useCallback((field: keyof ProductFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    // First run Zod validation
    const isZodValid = await form.trigger();

    if (!isZodValid) {
      return false;
    }

    const formData = form.getValues();

    // Business logic: Check name unique
    if (formData.name && formData.name.trim() !== '') {
      if (!validateNameUnique(formData.name)) {
        form.setError('name', {
          type: 'custom',
          message: 'Ya existe un producto con este nombre'
        });
        return false;
      }
    }

    // Business logic: Validate price reasonable
    if (!validatePriceReasonable(formData.price)) {
      form.setError('price', {
        type: 'custom',
        message: 'El precio debe ser mayor a 0 y menor a $1,000,000'
      });
      return false;
    }

    return true;
  }, [form, validateNameUnique, validatePriceReasonable]);

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
    validatePriceReasonable,
    checkDuplicateName
  };
}

/**
 * HOOK FEATURES SUMMARY:
 *
 * ✅ Zod Schema Validation: Uses EntitySchemas.product
 * ✅ React Hook Form: Full integration with RHF
 * ✅ Name Unique: Checks against existingProducts array
 * ✅ Price Validation: Must be positive and reasonable
 * ✅ Category Validation: Required field
 * ✅ Field Warnings: Duplicate name, extreme prices, missing description
 * ✅ Simple API: No complex arrays or calculations
 *
 * USAGE EXAMPLE:
 *
 * const existingProducts = [
 *   { id: '1', name: 'Pizza Napolitana', price: 1500, category: 'Pizzas' },
 *   { id: '2', name: 'Empanadas', price: 800, category: 'Entradas' }
 * ];
 *
 * const {
 *   form,
 *   fieldErrors,
 *   fieldWarnings,
 *   validateForm
 * } = useProductValidation({}, existingProducts);
 *
 * // Submit handler
 * const handleSubmit = async () => {
 *   const isValid = await validateForm();
 *   if (isValid) {
 *     const data = form.getValues();
 *     await createProduct(data);
 *   }
 * };
 */
