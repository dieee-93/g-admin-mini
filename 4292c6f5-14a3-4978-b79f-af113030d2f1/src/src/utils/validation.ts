/**
 * Validation Utilities
 *
 * Funciones de validación comunes reutilizables.
 */

import { ValidationRule } from '../shared/hooks/useFormValidation';

/**
 * Validación: Campo requerido
 */
export const required = (
message = 'Este campo es requerido')
: ValidationRule => ({
  validate: (value) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    return undefined;
  }
});

/**
 * Validación: Email válido
 */
export const email = (message = 'Email inválido'): ValidationRule => ({
  validate: (value) => {
    if (!value) return undefined; // Skip if empty (use required separately)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return undefined;
  }
});

/**
 * Validación: Longitud mínima
 */
export const minLength = (min: number, message?: string): ValidationRule => ({
  validate: (value) => {
    if (!value) return undefined;
    if (value.length < min) {
      return message || `Mínimo ${min} caracteres`;
    }
    return undefined;
  }
});

/**
 * Validación: Longitud máxima
 */
export const maxLength = (max: number, message?: string): ValidationRule => ({
  validate: (value) => {
    if (!value) return undefined;
    if (value.length > max) {
      return message || `Máximo ${max} caracteres`;
    }
    return undefined;
  }
});

/**
 * Validación: Valor mínimo (números)
 */
export const min = (minValue: number, message?: string): ValidationRule => ({
  validate: (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    if (isNaN(num) || num < minValue) {
      return message || `Valor mínimo: ${minValue}`;
    }
    return undefined;
  }
});

/**
 * Validación: Valor máximo (números)
 */
export const max = (maxValue: number, message?: string): ValidationRule => ({
  validate: (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    if (isNaN(num) || num > maxValue) {
      return message || `Valor máximo: ${maxValue}`;
    }
    return undefined;
  }
});

/**
 * Validación: Patrón regex
 */
export const pattern = (
regex: RegExp,
message = 'Formato inválido')
: ValidationRule => ({
  validate: (value) => {
    if (!value) return undefined;
    if (!regex.test(value)) {
      return message;
    }
    return undefined;
  }
});

/**
 * Validación: Teléfono (formato simple)
 */
export const phone = (message = 'Teléfono inválido'): ValidationRule => ({
  validate: (value) => {
    if (!value) return undefined;
    const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value)) {
      return message;
    }
    return undefined;
  }
});

/**
 * Validación: URL válida
 */
export const url = (message = 'URL inválida'): ValidationRule => ({
  validate: (value) => {
    if (!value) return undefined;
    try {
      new URL(value);
      return undefined;
    } catch {
      return message;
    }
  }
});

/**
 * Validación: Coincidencia de campos (ej: confirmar password)
 */
export const matches = (
fieldName: string,
message?: string)
: ValidationRule => ({
  validate: (value, formData) => {
    if (!value) return undefined;
    if (value !== formData?.[fieldName]) {
      return message || `Debe coincidir con ${fieldName}`;
    }
    return undefined;
  }
});

/**
 * Validación: Número entero
 */
export const integer = (
message = 'Debe ser un número entero')
: ValidationRule => ({
  validate: (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) {
      return message;
    }
    return undefined;
  }
});

/**
 * Validación: Número positivo
 */
export const positive = (
message = 'Debe ser un número positivo')
: ValidationRule => ({
  validate: (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return message;
    }
    return undefined;
  }
});

/**
 * Validación personalizada
 */
export const custom = (
validateFn: (value: any, formData?: any) => boolean,
message = 'Valor inválido')
: ValidationRule => ({
  validate: (value, formData) => {
    if (!validateFn(value, formData)) {
      return message;
    }
    return undefined;
  }
});