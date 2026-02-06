/**
 * MIGRATED: Material Validation Hook
 * Now uses centralized validation system with Zod + React Hook Form
 * Eliminates ~220 lines of duplicated validation logic
 *
 * FIX v2.0: Implemented REAL validation using Zod schema instead of dummy return.
 * UPDATE v3.0: Uses extended MaterialFormSchema with production_config and staff_assignments support
 */

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { MaterialFormSchema, type MaterialFormData } from '@/pages/admin/supply-chain/materials/validation/materialFormSchema';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types/materialTypes';

// Re-export type for convenience
export type { MaterialFormData };

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
  excludeId?: string; // ID to exclude from duplicate checks (current item being edited)
}

interface UseMaterialValidationResult {
  // form: UseFormReturn<MaterialFormData>; // Removed legacy form exposure to avoid confusion
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
  
  const { enableRealTime = true, debounceMs = 300, excludeId } = options;
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const isFirstRender = useRef(true);

  // Business logic validators
  const checkForDuplicates = useCallback((name: string): string | null => {
    if (!name?.trim()) return null;
    
    const isDuplicate = existingItems.some(item => {
      // Skip if it's the item we are editing
      if (excludeId && item.id === excludeId) return false;
      
      return item.name.toLowerCase().trim() === name.toLowerCase().trim();
    });
    
    return isDuplicate ? 'Ya existe un material con este nombre' : null;
  }, [existingItems, excludeId]);

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

  // Validation function
  const validateForm = useCallback(async (): Promise<boolean> => {
    // 1. Zod Validation using extended MaterialFormSchema
    const result = MaterialFormSchema.safeParse(initialData);
    
    const newErrors: Record<string, string | undefined> = {};

    if (!result.success) {
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
    }

    // 2. Business Logic: Duplicates
    if (initialData.name && !newErrors.name) {
      const duplicateError = checkForDuplicates(initialData.name);
      if (duplicateError) {
        newErrors.name = duplicateError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [initialData, checkForDuplicates]);

  // Real-time validation effect
  useEffect(() => {
    if (enableRealTime) {
      // Prevent validation on first render if form is essentially empty (Add mode)
      if (isFirstRender.current) {
        isFirstRender.current = false;
        const isEmpty = !initialData.name && !initialData.type;
        if (isEmpty) return;
      }

      const timeoutId = setTimeout(() => {
        validateForm();
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    }
  }, [initialData, enableRealTime, debounceMs, validateForm]);

  // Field validation (single field)
  const validateField = useCallback((field: keyof MaterialFormData, value: any) => {
    // We validate the whole form contextually but only update the specific field error
    // This is simpler than schema picking for superRefine logic
    // For now, we'll just clear the error for the field being edited to be optimistic
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const clearValidation = useCallback(() => {
    setErrors({});
  }, []);

  // Field warnings
  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    
    // Name similarity warning
    if (initialData.name && !errors.name) {
      const similarWarning = checkForSimilarItems(initialData.name);
      if (similarWarning) {
        warnings.name = similarWarning;
      }
    }
    
    // High stock warning
    if (initialData.initial_stock && initialData.initial_stock > 100000) {
      warnings.initial_stock = 'Stock inicial muy alto, verifica el valor';
    }
    
    // High cost warning
    if (initialData.unit_cost && initialData.unit_cost > 50000) {
      warnings.unit_cost = 'Costo unitario muy alto, verifica el valor';
    }
    
    return warnings;
  }, [initialData, errors, checkForSimilarItems]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(errors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(errors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [errors, fieldWarnings]);

  return {
    fieldErrors: errors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,
    checkForDuplicates,
    checkForSimilarItems
  };
}

export default useMaterialValidation;
