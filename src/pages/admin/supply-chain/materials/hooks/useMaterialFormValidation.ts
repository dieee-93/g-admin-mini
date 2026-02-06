/**
 * Material Form Validation Hook
 *
 * Clean validation architecture using Zod schemas
 *
 * Features:
 * - Real-time field validation
 * - Cross-field validation (recipe required for ELABORATED, etc.)
 * - Validation summary for UI feedback
 * - Type-safe with TypeScript
 * - Follows G-Admin Mini validation patterns
 *
 * @see src/pages/admin/supply-chain/materials/validation/materialFormSchema.ts
 * @see src/lib/validation/zod/CommonSchemas.ts
 */

import { useMemo, useCallback } from 'react';
import { MaterialFormSchema, getValidationErrors, isFormValid } from '../validation/materialFormSchema';
import type { MaterialFormData } from '../validation/materialFormSchema';
import type { ItemFormData } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  /** Is the entire form valid? */
  isValid: boolean;

  /** Map of field paths to error messages */
  errors: Record<string, string>;

  /** List of validation error messages for display */
  errorMessages: string[];

  /** List of validation warnings (non-blocking) */
  warnings: string[];

  /** Has any critical errors? */
  hasCriticalErrors: boolean;

  /** Has any warnings? */
  hasWarnings: boolean;

  /** Can the form be submitted? */
  canSubmit: boolean;
}

export interface FieldValidationResult {
  /** Is this field valid? */
  isValid: boolean;

  /** Error message for this field */
  error: string | null;

  /** Warning message for this field */
  warning: string | null;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Material form validation hook
 *
 * @param formData - Current form data
 * @returns Validation state and utilities
 *
 * @example
 * ```tsx
 * const { validation, validateField, getFieldError } = useMaterialFormValidation(formData);
 *
 * // Check if form can be submitted
 * <Button disabled={!validation.canSubmit}>Submit</Button>
 *
 * // Show validation summary
 * {validation.hasCriticalErrors && (
 *   <Alert>{validation.errorMessages.map(msg => <li>{msg}</li>)}</Alert>
 * )}
 *
 * // Show field-level errors
 * <Input error={getFieldError('name')} />
 * ```
 */
export function useMaterialFormValidation(formData: ItemFormData) {
  // ========================================================================
  // VALIDATION STATE
  // ========================================================================

  /**
   * Main validation result (memoized)
   * Runs full Zod validation on every form data change
   */
  const validation = useMemo((): ValidationResult => {
    // Run Zod validation
    const errors = getValidationErrors(formData as Partial<MaterialFormData>);
    const isValid = Object.keys(errors).length === 0;

    // Extract error messages for display
    const errorMessages = Object.entries(errors).map(([field, message]) => {
      // Format field name for display
      const fieldName = formatFieldName(field);
      return `${fieldName}: ${message}`;
    });

    // Generate warnings (non-blocking suggestions)
    const warnings = generateWarnings(formData);

    // Check if form can be submitted
    const canSubmit = isValid && !formData.isSubmitting;

    return {
      isValid,
      errors,
      errorMessages,
      warnings,
      hasCriticalErrors: errorMessages.length > 0,
      hasWarnings: warnings.length > 0,
      canSubmit,
    };
  }, [formData]);

  // ========================================================================
  // UTILITY FUNCTIONS
  // ========================================================================

  /**
   * Validate a specific field
   *
   * @param fieldName - Field name to validate
   * @returns Validation result for this field
   */
  const validateField = useCallback((fieldName: keyof ItemFormData): FieldValidationResult => {
    const error = validation.errors[fieldName] || null;
    const warning = getFieldWarning(fieldName, formData);

    return {
      isValid: error === null,
      error,
      warning,
    };
  }, [validation.errors, formData]);

  /**
   * Get error message for a specific field
   *
   * @param fieldName - Field name
   * @returns Error message or null
   */
  const getFieldError = useCallback((fieldName: string): string | null => {
    return validation.errors[fieldName] || null;
  }, [validation.errors]);

  /**
   * Get warning message for a specific field
   *
   * @param fieldName - Field name
   * @returns Warning message or null
   */
  const getFieldWarning = useCallback((fieldName: string, data: ItemFormData): string | null => {
    // Warning: Low stock threshold
    if (fieldName === 'min_stock' && data.min_stock) {
      if (data.min_stock < 10) {
        return 'Stock mínimo muy bajo. Considera aumentarlo para evitar desabastecimiento.';
      }
    }

    // Warning: High initial stock
    if (fieldName === 'initial_stock' && data.initial_stock) {
      if (data.initial_stock > 1000) {
        return 'Stock inicial alto. Verifica que la cantidad sea correcta.';
      }
    }

    // Warning: No target stock
    if (fieldName === 'target_stock' && data.min_stock && !data.target_stock) {
      return 'Considera establecer un stock objetivo para mejor planificación.';
    }

    // Warning: ELABORATED without production_config
    if (fieldName === 'production_config' && data.type === 'ELABORATED' && !data.production_config) {
      return 'Los materiales elaborados pueden tener configuración de producción para cálculo preciso de costos.';
    }

    return null;
  }, []);

  /**
   * Get all errors for a nested field (e.g., 'production_config.staff_assignments')
   *
   * @param fieldPath - Dot-notation field path
   * @returns Array of error messages
   */
  const getNestedErrors = useCallback((fieldPath: string): string[] => {
    const errors: string[] = [];

    Object.keys(validation.errors).forEach(key => {
      if (key.startsWith(fieldPath)) {
        errors.push(validation.errors[key]);
      }
    });

    return errors;
  }, [validation.errors]);

  /**
   * Get validation summary for UI display
   * Groups errors by section for better UX
   */
  const getValidationSummary = useCallback((): {
    basicInfo: string[];
    typeConfig: string[];
    stock: string[];
    supplier: string[];
    recipe: string[];
    production: string[];
  } => {
    const summary = {
      basicInfo: [] as string[],
      typeConfig: [] as string[],
      stock: [] as string[],
      supplier: [] as string[],
      recipe: [] as string[],
      production: [] as string[],
    };

    Object.entries(validation.errors).forEach(([field, message]) => {
      // Basic info fields
      if (['name', 'type', 'category', 'description', 'brand_id'].includes(field)) {
        summary.basicInfo.push(message);
      }
      // Type-specific config
      else if (['unit', 'packaging'].includes(field) || field.startsWith('packaging.')) {
        summary.typeConfig.push(message);
      }
      // Stock fields
      else if (['initial_stock', 'unit_cost', 'min_stock', 'target_stock'].includes(field)) {
        summary.stock.push(message);
      }
      // Supplier fields
      else if (field.startsWith('supplier')) {
        summary.supplier.push(message);
      }
      // Recipe fields
      else if (field === 'recipe_id' || field.startsWith('recipe_id')) {
        summary.recipe.push(message);
      }
      // Production config fields
      else if (field.startsWith('production_config')) {
        summary.production.push(message);
      }
    });

    return summary;
  }, [validation.errors]);

  // ========================================================================
  // RETURN API
  // ========================================================================

  return {
    /** Main validation result */
    validation,

    /** Validate a specific field */
    validateField,

    /** Get error for a field */
    getFieldError,

    /** Get warning for a field */
    getFieldWarning,

    /** Get all errors for nested field */
    getNestedErrors,

    /** Get validation summary by section */
    getValidationSummary,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format field name for user-friendly display
 *
 * @param fieldName - Technical field name
 * @returns Human-readable field name in Spanish
 */
function formatFieldName(fieldName: string): string {
  const fieldNames: Record<string, string> = {
    name: 'Nombre',
    type: 'Tipo',
    category: 'Categoría',
    unit: 'Unidad',
    initial_stock: 'Stock inicial',
    unit_cost: 'Costo unitario',
    min_stock: 'Stock mínimo',
    target_stock: 'Stock objetivo',
    recipe_id: 'Receta',
    'production_config.staff_assignments': 'Asignaciones de personal',
    'production_config.equipment_usage': 'Uso de equipamiento',
    'production_config.overhead_percentage': 'Porcentaje de overhead',
    'packaging.package_size': 'Tamaño de paquete',
    'packaging.package_unit': 'Unidad de paquete',
    supplier_id: 'Proveedor',
  };

  return fieldNames[fieldName] || fieldName;
}

/**
 * Generate warnings based on form data
 * Warnings are non-blocking suggestions
 *
 * @param data - Form data
 * @returns Array of warning messages
 */
function generateWarnings(data: ItemFormData): string[] {
  const warnings: string[] = [];

  // Warning: ELABORATED without production_config
  if (data.type === 'ELABORATED' && !data.production_config) {
    warnings.push('Considera agregar configuración de producción para cálculo preciso de costos laborales y equipamiento');
  }

  // Warning: No category
  if (!data.category) {
    warnings.push('Establecer una categoría ayuda a organizar mejor el inventario');
  }

  // Warning: No min/target stock for non-ELABORATED
  if (data.type !== 'ELABORATED' && (!data.min_stock || !data.target_stock)) {
    warnings.push('Establecer stock mínimo y objetivo ayuda a evitar desabastecimiento');
  }

  // Warning: COUNTABLE without packaging
  if (data.type === 'COUNTABLE' && !data.packaging) {
    warnings.push('Los materiales contables deben tener configuración de empaque');
  }

  // Warning: High unit cost without supplier
  if (data.unit_cost && data.unit_cost > 1000 && !data.supplier_id) {
    warnings.push('Considera registrar un proveedor para materiales de alto costo');
  }

  return warnings;
}
