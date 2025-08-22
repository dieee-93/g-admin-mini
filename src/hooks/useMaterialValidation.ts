import { useState, useCallback, useMemo } from 'react';
import type { ItemFormData, MaterialItem } from '@/modules/materials/types';

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export function useMaterialValidation(
  formData: ItemFormData,
  existingItems: MaterialItem[] = [],
  options: ValidationOptions = {}
) {
  const {
    enableRealTime = true,
    debounceMs = 300
  } = options;

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldWarnings, setFieldWarnings] = useState<Record<string, string>>({});

  // Simple field validators
  const validators = useMemo(() => ({
    name: (value: string): FieldValidationResult => {
      if (!value?.trim()) {
        return { isValid: false, error: 'El nombre es obligatorio' };
      }
      if (value.length < 2) {
        return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
      }
      if (value.length > 100) {
        return { isValid: false, error: 'El nombre no puede exceder 100 caracteres' };
      }

      // Check for duplicates
      const isDuplicate = existingItems.some(item => 
        item.name.toLowerCase().trim() === value.toLowerCase().trim()
      );
      if (isDuplicate) {
        return { isValid: false, error: 'Ya existe un material con este nombre' };
      }

      // Check for similar names (warning)
      const similarItems = existingItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        value.toLowerCase().includes(item.name.toLowerCase())
      );
      if (similarItems.length > 0) {
        return {
          isValid: true,
          warning: `Existen materiales similares: ${similarItems.slice(0, 2).map(i => i.name).join(', ')}`
        };
      }

      return { isValid: true };
    },

    type: (value: string): FieldValidationResult => {
      if (!value) {
        return { isValid: false, error: 'Debes seleccionar un tipo de item' };
      }
      return { isValid: true };
    },

    category: (value: string, type: string): FieldValidationResult => {
      if (type === 'MEASURABLE' && !value) {
        return { isValid: false, error: 'Debes seleccionar una categoría de medición' };
      }
      return { isValid: true };
    },

    unit: (value: string, type: string): FieldValidationResult => {
      if ((type === 'MEASURABLE' || type === 'ELABORATED') && !value) {
        return { isValid: false, error: 'Debes especificar la unidad' };
      }
      return { isValid: true };
    },

    initial_stock: (value: number): FieldValidationResult => {
      if (value < 0) {
        return { isValid: false, error: 'El stock inicial no puede ser negativo' };
      }
      if (value > 1000000) {
        return { isValid: true, warning: 'Stock inicial muy alto, verifica el valor' };
      }
      return { isValid: true };
    },

    unit_cost: (value: number): FieldValidationResult => {
      if (value < 0) {
        return { isValid: false, error: 'El costo unitario no puede ser negativo' };
      }
      if (value > 100000) {
        return { isValid: true, warning: 'Costo unitario muy alto, verifica el valor' };
      }
      return { isValid: true };
    }
  }), [existingItems]);

  // Simple field validation
  const validateField = useCallback((field: string, value: any) => {
    if (!enableRealTime) return;

    let result: FieldValidationResult;

    switch (field) {
      case 'name':
        result = validators.name(value);
        break;
      case 'type':
        result = validators.type(value);
        break;
      case 'category':
        result = validators.category(value, formData.type);
        break;
      case 'unit':
        result = validators.unit(value, formData.type);
        break;
      case 'initial_stock':
        result = validators.initial_stock(value);
        break;
      case 'unit_cost':
        result = validators.unit_cost(value);
        break;
      default:
        result = { isValid: true };
    }

    // Update errors
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (result.error) {
        newErrors[field] = result.error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    // Update warnings
    setFieldWarnings(prev => {
      const newWarnings = { ...prev };
      if (result.warning) {
        newWarnings[field] = result.warning;
      } else {
        delete newWarnings[field];
      }
      return newWarnings;
    });
  }, [validators, formData.type, enableRealTime]);

  // Full form validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      let result: FieldValidationResult;

      switch (field) {
        case 'name':
          result = validators.name(value);
          break;
        case 'type':
          result = validators.type(value);
          break;
        case 'category':
          result = validators.category(value, formData.type);
          break;
        case 'unit':
          result = validators.unit(value, formData.type);
          break;
        case 'initial_stock':
          result = validators.initial_stock(value);
          break;
        case 'unit_cost':
          result = validators.unit_cost(value);
          break;
        default:
          result = { isValid: true };
      }

      if (result.error) {
        errors[field] = result.error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validators]);

  // Clear validation state
  const clearValidation = useCallback(() => {
    setFieldErrors({});
    setFieldWarnings({});
  }, []);

  // Validation state summary
  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  return {
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation
  };
}