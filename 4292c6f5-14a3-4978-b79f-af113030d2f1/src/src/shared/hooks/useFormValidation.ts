/**
 * useFormValidation - Form Validation Hook
 *
 * Hook reutilizable para manejar validación de formularios.
 * Proporciona estado, validación, y manejo de cambios consistente.
 */

import { useState, useCallback } from 'react';

/**
 * Regla de validación para un campo
 */
export interface ValidationRule<T = any> {
  /**
   * Función de validación
   * Retorna string con error o undefined si es válido
   */
  validate: (value: T, formData?: any) => string | undefined;
  /**
   * Mensaje de error personalizado
   */
  message?: string;
}

/**
 * Reglas de validación para el formulario
 */
export type ValidationRules<T> = { [K in
keyof T]?: ValidationRule<T[K]>[] };


/**
 * Opciones del hook
 */
export interface UseFormValidationOptions<T> {
  /**
   * Datos iniciales del formulario
   */
  initialData: T;
  /**
   * Reglas de validación
   */
  validationRules?: ValidationRules<T>;
  /**
   * Callback cuando el formulario es válido
   */
  onSubmit?: (data: T) => void | Promise<void>;
  /**
   * Validar en tiempo real (onChange)
   */
  validateOnChange?: boolean;
}

/**
 * Hook para validación de formularios
 */
export function useFormValidation<T extends Record<string, any>>({
  initialData,
  validationRules = {},
  onSubmit,
  validateOnChange = false
}: UseFormValidationOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof T, string>>>(
    {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Valida un campo específico
   */
  const validateField = useCallback(
    (field: keyof T, value: any): string | undefined => {
      const rules = validationRules[field];
      if (!rules || rules.length === 0) return undefined;

      for (const rule of rules) {
        const error = rule.validate(value, formData);
        if (error) return error;
      }

      return undefined;
    },
    [validationRules, formData]
  );

  /**
   * Valida todos los campos
   */
  const validateAll = useCallback((): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field as keyof T, formData[field]);
      if (error) {
        errors[field as keyof T] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  }, [formData, validationRules, validateField]);

  /**
   * Maneja cambio de un campo
   */
  const handleFieldChange = useCallback(
    (field: keyof T) => (value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Validar en tiempo real si está habilitado
      if (validateOnChange || fieldErrors[field]) {
        const error = validateField(field, value);
        setFieldErrors((prev) => ({
          ...prev,
          [field]: error
        }));
      }
    },
    [validateField, validateOnChange, fieldErrors]
  );

  /**
   * Maneja múltiples cambios a la vez
   */
  const setFieldValues = useCallback((values: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setIsDirty(true);
  }, []);

  /**
   * Limpia un error específico
   */
  const clearFieldError = useCallback((field: keyof T) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Limpia todos los errores
   */
  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  /**
   * Resetea el formulario
   */
  const reset = useCallback(() => {
    setFormData(initialData);
    setFieldErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialData]);

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const isValid = validateAll();
      if (!isValid) return;

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(formData);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [formData, onSubmit, validateAll]
  );

  return {
    // Estado
    formData,
    fieldErrors,
    isSubmitting,
    isDirty,
    isValid: Object.keys(fieldErrors).length === 0,

    // Métodos
    handleFieldChange,
    setFieldValues,
    validateField,
    validateAll,
    clearFieldError,
    clearAllErrors,
    handleSubmit,
    reset
  };
}