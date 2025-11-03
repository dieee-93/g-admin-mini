/**
 * Unified Form Validation Hook
 * Replaces all scattered validation logic across the application
 */

import { useCallback, useMemo, useState } from 'react';
import { logger } from '@/lib/logging';
import { validateFields, getFieldError } from '../core/FieldValidators';
import type {
  FieldValidator,
  ValidationResult
} from '../core/FieldValidators';

export type FormValidationConfig<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidator<T[K]>;
};

export type ValidationErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
};

export type FormValidationState<T extends Record<string, any>> = {
  errors: ValidationErrors<T>;
  isValid: boolean;
  isValidating: boolean;
  touchedFields: Set<keyof T>;
};

export type FormValidationActions<T extends Record<string, any>> = {
  validateField: (field: keyof T, value: T[keyof T]) => string | undefined;
  validateForm: (data: T) => Promise<boolean>;
  validateFormSync: (data: T) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
  markFieldAsTouched: (field: keyof T) => void;
  markAllFieldsAsTouched: () => void;
  resetValidation: () => void;
  getFieldError: (field: keyof T) => string | undefined;
  hasFieldError: (field: keyof T) => boolean;
  isFieldTouched: (field: keyof T) => boolean;
};

export type UseFormValidationResult<T extends Record<string, any>> = 
  FormValidationState<T> & FormValidationActions<T>;

/**
 * Main form validation hook that replaces all validation logic in the app
 */
export function useFormValidation<T extends Record<string, any>>(
  validators: FormValidationConfig<T>,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrorsOnlyAfterTouch?: boolean;
    debounceMs?: number;
  } = {}
): UseFormValidationResult<T> {
  
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showErrorsOnlyAfterTouch = true,
    debounceMs = 300
  } = options;

  // State management
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  // Memoized validation state
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Single field validation
  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | undefined => {
    const validator = validators[field];
    if (!validator) return undefined;

    return getFieldError(value, validator);
  }, [validators]);

  // Validate entire form synchronously
  const validateFormSync = useCallback((data: T): boolean => {
    const result = validateFields(data, validators);
    
    setErrors(prevErrors => {
      // Only update errors that have actually changed
      const hasChanges = Object.keys(result.errors).some(key => 
        prevErrors[key as keyof T] !== result.errors[key as keyof T]
      );
      
      if (hasChanges) {
        return result.errors;
      }
      return prevErrors;
    });

    return result.isValid;
  }, [validators]);

  // Validate entire form asynchronously
  const validateForm = useCallback(async (data: T): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      // Add small delay to prevent rapid validation calls
      if (debounceMs > 0) {
        await new Promise(resolve => setTimeout(resolve, debounceMs));
      }
      
      const result = validateFormSync(data);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [validateFormSync, debounceMs]);

  // Error management actions
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Touch state management
  const markFieldAsTouched = useCallback((field: keyof T) => {
    setTouchedFields(prev => new Set([...prev, field]));
  }, []);

  const markAllFieldsAsTouched = useCallback(() => {
    const allFields = Object.keys(validators) as (keyof T)[];
    setTouchedFields(new Set(allFields));
  }, [validators]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouchedFields(new Set());
    setIsValidating(false);
  }, []);

  // Helper functions
  const getFieldErrorValue = useCallback((field: keyof T): string | undefined => {
    const hasError = errors[field];
    const isFieldTouched = touchedFields.has(field);
    
    if (showErrorsOnlyAfterTouch && !isFieldTouched) {
      return undefined;
    }
    
    return hasError;
  }, [errors, touchedFields, showErrorsOnlyAfterTouch]);

  const hasFieldError = useCallback((field: keyof T): boolean => {
    return !!getFieldErrorValue(field);
  }, [getFieldErrorValue]);

  const isFieldTouched = useCallback((field: keyof T): boolean => {
    return touchedFields.has(field);
  }, [touchedFields]);

  return {
    // State
    errors,
    isValid,
    isValidating,
    touchedFields,
    
    // Actions
    validateField,
    validateForm,
    validateFormSync,
    clearErrors,
    clearFieldError,
    setFieldError,
    markFieldAsTouched,
    markAllFieldsAsTouched,
    resetValidation,
    getFieldError: getFieldErrorValue,
    hasFieldError,
    isFieldTouched
  };
}

/**
 * Simplified validation hook for basic forms
 */
export function useSimpleValidation<T extends Record<string, any>>(
  validators: FormValidationConfig<T>
) {
  return useFormValidation(validators, {
    validateOnChange: false,
    validateOnBlur: true,
    showErrorsOnlyAfterTouch: true
  });
}

/**
 * Real-time validation hook for complex forms
 */
export function useRealtimeValidation<T extends Record<string, any>>(
  validators: FormValidationConfig<T>
) {
  return useFormValidation(validators, {
    validateOnChange: true,
    validateOnBlur: true,
    showErrorsOnlyAfterTouch: false,
    debounceMs: 150
  });
}

/**
 * Custom hook for form validation with server-side validation
 */
export function useFormValidationWithServer<T extends Record<string, any>>(
  validators: FormValidationConfig<T>,
  serverValidator?: (data: T) => Promise<ValidationErrors<T>>
) {
  const validation = useFormValidation(validators);
  
  const validateWithServer = useCallback(async (data: T): Promise<boolean> => {
    // First run client-side validation
    const clientValid = await validation.validateForm(data);
    
    if (!clientValid || !serverValidator) {
      return clientValid;
    }
    
    try {
      // Run server-side validation
      validation.setIsValidating?.(true);
      const serverErrors = await serverValidator(data);
      
      // Merge server errors with client errors
      if (Object.keys(serverErrors).length > 0) {
        Object.entries(serverErrors).forEach(([field, error]) => {
          validation.setFieldError(field as keyof T, error!);
        });
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('App', 'Server validation error:', error);
      return false;
    } finally {
      validation.setIsValidating?.(false);
    }
  }, [validation, serverValidator]);
  
  return {
    ...validation,
    validateWithServer
  };
}

/**
 * Hook for step-by-step form validation (wizards)
 */
export function useStepValidation<T extends Record<string, any>>(
  allValidators: FormValidationConfig<T>,
  stepFields: { [step: number]: (keyof T)[] }
) {
  const validation = useFormValidation(allValidators);
  
  const validateStep = useCallback((step: number, data: T): boolean => {
    const fieldsToValidate = stepFields[step] || [];
    const stepValidators: FormValidationConfig<T> = {};
    
    fieldsToValidate.forEach(field => {
      if (allValidators[field]) {
        stepValidators[field] = allValidators[field];
      }
    });
    
    const result = validateFields(data, stepValidators);
    
    // Update only errors for this step
    validation.setErrors((prevErrors: ValidationErrors<T>) => ({
      ...prevErrors,
      ...result.errors
    }));
    
    return result.isValid;
  }, [allValidators, stepFields, validation]);
  
  const clearStepErrors = useCallback((step: number) => {
    const fieldsToValidate = stepFields[step] || [];
    validation.setErrors((prevErrors: ValidationErrors<T>) => {
      const newErrors = { ...prevErrors };
      fieldsToValidate.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, [stepFields, validation]);
  
  return {
    ...validation,
    validateStep,
    clearStepErrors
  };
}