/**
 * MIGRATED: Material Validation Hook
 * Now uses centralized validation system with Zod + React Hook Form
 * Eliminates ~220 lines of duplicated validation logic
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type SchemaType } from '@/lib/validation/zod/CommonSchemas';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types/materialTypes';

// Infer the type from our Zod schema
export type MaterialFormData = SchemaType<typeof EntitySchemas.material>;

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

interface UseMaterialValidationResult {
  form: UseFormReturn<MaterialFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof MaterialFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;
  // Business logic validation
  checkForDuplicates: (name: string) => string | null;
  checkForSimilarItems: (name: string) => string | null;
}

export function useMaterialValidation(
  initialData: Partial<MaterialFormData> = {},
  existingItems: MaterialItem[] = [],
  options: ValidationOptions = {}
): UseMaterialValidationResult {
  
  const { enableRealTime = true, debounceMs = 300 } = options;

  // React Hook Form with Zod validation
  const form = useForm<MaterialFormData>({
    resolver: zodResolver(EntitySchemas.material),
    defaultValues: {
      name: '',
      type: '',
      category: '',
      unit: '',
      initial_stock: 0,
      unit_cost: 0,
      supplier: '',
      description: '',
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // Business logic validators (not handled by Zod)
  const checkForDuplicates = useCallback((name: string): string | null => {
    if (!name?.trim()) return null;
    
    const isDuplicate = existingItems.some(item => 
      item.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    return isDuplicate ? 'Ya existe un material con este nombre' : null;
  }, [existingItems]);

  const checkForSimilarItems = useCallback((name: string): string | null => {
    if (!name?.trim() || name.length < 3) return null;
    
    const similarItems = existingItems.filter(item =>
      item.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(item.name.toLowerCase())
    ).slice(0, 2);
    
    if (similarItems.length > 0) {
      return `Existen materiales similares: ${similarItems.map(i => i.name).join(', ')}`;
    }
    
    return null;
  }, [existingItems]);

  // Custom field validation with business rules
  const validateField = useCallback((field: keyof MaterialFormData, value: any) => {
    // Clear previous custom errors
    form.clearErrors(field);
    
    // Run Zod validation first
    form.trigger(field);
    
    // Apply business logic validation
    if (field === 'name' && typeof value === 'string') {
      const duplicateError = checkForDuplicates(value);
      if (duplicateError) {
        form.setError('name', { type: 'custom', message: duplicateError });
      }
    }
  }, [form, checkForDuplicates]);

  // Enhanced form validation
  const validateForm = useCallback(async (): Promise<boolean> => {
    // Run Zod validation
    const isZodValid = await form.trigger();
    
    // Run business logic validation
    const formData = form.getValues();
    const duplicateError = checkForDuplicates(formData.name);
    
    if (duplicateError) {
      form.setError('name', { type: 'custom', message: duplicateError });
      return false;
    }
    
    return isZodValid;
  }, [form, checkForDuplicates]);

  // Clear validation state
  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  // Field errors from React Hook Form
  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    Object.entries(form.formState.errors).forEach(([field, error]) => {
      if (error?.message) {
        errors[field] = error.message;
      }
    });
    return errors;
  }, [form.formState.errors]);

  // Field warnings (business logic hints)
  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();
    
    // Name similarity warning
    if (formData.name && !fieldErrors.name) {
      const similarWarning = checkForSimilarItems(formData.name);
      if (similarWarning) {
        warnings.name = similarWarning;
      }
    }
    
    // High stock warning
    if (formData.initial_stock > 100000) {
      warnings.initial_stock = 'Stock inicial muy alto, verifica el valor';
    }
    
    // High cost warning
    if (formData.unit_cost > 50000) {
      warnings.unit_cost = 'Costo unitario muy alto, verifica el valor';
    }
    
    return warnings;
  }, [form.watch(), fieldErrors, checkForSimilarItems]);

  // Validation state summary
  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,
    checkForDuplicates,
    checkForSimilarItems
  };
}

/**
 * Legacy interface support for gradual migration
 * @deprecated Use the new form-based interface instead
 */
export function useMaterialValidationLegacy(
  formData: any,
  existingItems: MaterialItem[] = [],
  options: ValidationOptions = {}
) {
  const validation = useMaterialValidation(formData, existingItems, options);
  
  // Adapt new interface to legacy interface
  return {
    fieldErrors: validation.fieldErrors,
    fieldWarnings: validation.fieldWarnings,
    validationState: validation.validationState,
    validateField: (field: string, value: any) => {
      validation.validateField(field as keyof MaterialFormData, value);
    },
    validateForm: async () => {
      return await validation.validateForm();
    },
    clearValidation: validation.clearValidation
  };
}

export default useMaterialValidation;