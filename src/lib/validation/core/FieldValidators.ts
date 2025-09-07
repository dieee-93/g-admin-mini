/**
 * Centralized Field Validators System
 * Eliminates validation duplication across the application
 */

export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  type?: 'email' | 'phone' | 'url' | 'number' | 'currency';
  custom?: (value: T) => string | null;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export type FieldValidator<T = any> = (value: T) => ValidationResult;

/**
 * Common regex patterns used across the application
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_AR: /^(\+54\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{6,8}$/, // Argentina phone format
  NAME: /^[a-zA-Z\s\-\'áéíóúÁÉÍÓÚñÑüÜ]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  POSITIVE_NUMBER: /^[1-9]\d*$/,
  DECIMAL_NUMBER: /^\d+(\.\d+)?$/
} as const;

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  EMAIL_INVALID: 'Ingresa un email válido',
  PHONE_INVALID: 'Ingresa un teléfono válido',
  NAME_INVALID: 'Solo se permiten letras, espacios, guiones y acentos',
  MIN_LENGTH: (min: number) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max: number) => `No puede exceder ${max} caracteres`,
  MIN_VALUE: (min: number) => `El valor mínimo es ${min}`,
  MAX_VALUE: (max: number) => `El valor máximo es ${max}`,
  CURRENCY_INVALID: 'Ingresa un monto válido (ej: 123.45)',
  POSITIVE_NUMBER_REQUIRED: 'Debe ser un número positivo',
  ALPHANUMERIC_ONLY: 'Solo se permiten letras y números'
} as const;

/**
 * Creates a reusable field validator based on rules
 */
export function createFieldValidator<T = any>(rules: ValidationRule<T>): FieldValidator<T> {
  return (value: T): ValidationResult => {
    const stringValue = String(value || '').trim();
    const numericValue = Number(value);

    // Required validation
    if (rules.required && (!value || stringValue === '')) {
      return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED };
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && stringValue === '') {
      return { isValid: true };
    }

    // Type-specific validations
    if (rules.type) {
      switch (rules.type) {
        case 'email':
          if (!VALIDATION_PATTERNS.EMAIL.test(stringValue)) {
            return { isValid: false, error: VALIDATION_MESSAGES.EMAIL_INVALID };
          }
          break;
        case 'phone':
          if (!VALIDATION_PATTERNS.PHONE_AR.test(stringValue)) {
            return { isValid: false, error: VALIDATION_MESSAGES.PHONE_INVALID };
          }
          break;
        case 'currency':
          if (!VALIDATION_PATTERNS.CURRENCY.test(stringValue)) {
            return { isValid: false, error: VALIDATION_MESSAGES.CURRENCY_INVALID };
          }
          break;
        case 'number':
          if (isNaN(numericValue)) {
            return { isValid: false, error: 'Debe ser un número válido' };
          }
          break;
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      if (rules.pattern === VALIDATION_PATTERNS.NAME) {
        return { isValid: false, error: VALIDATION_MESSAGES.NAME_INVALID };
      }
      if (rules.pattern === VALIDATION_PATTERNS.ALPHANUMERIC) {
        return { isValid: false, error: VALIDATION_MESSAGES.ALPHANUMERIC_ONLY };
      }
      return { isValid: false, error: 'Formato inválido' };
    }

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
      return { isValid: false, error: VALIDATION_MESSAGES.MIN_LENGTH(rules.minLength) };
    }
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return { isValid: false, error: VALIDATION_MESSAGES.MAX_LENGTH(rules.maxLength) };
    }

    // Numeric range validations
    if (rules.min !== undefined && numericValue < rules.min) {
      return { isValid: false, error: VALIDATION_MESSAGES.MIN_VALUE(rules.min) };
    }
    if (rules.max !== undefined && numericValue > rules.max) {
      return { isValid: false, error: VALIDATION_MESSAGES.MAX_VALUE(rules.max) };
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return { isValid: false, error: customError };
      }
    }

    return { isValid: true };
  };
}

/**
 * Pre-defined common field validators ready to use
 */
export const CommonValidators = {
  // Basic field validators
  required: createFieldValidator({ required: true }),
  
  // Name validators
  personName: createFieldValidator({
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.NAME
  }),
  
  optionalPersonName: createFieldValidator({
    required: false,
    minLength: 2,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.NAME
  }),
  
  // Contact validators
  email: createFieldValidator({
    required: true,
    type: 'email'
  }),
  
  optionalEmail: createFieldValidator({
    required: false,
    type: 'email'
  }),
  
  phone: createFieldValidator({
    required: true,
    type: 'phone'
  }),
  
  optionalPhone: createFieldValidator({
    required: false,
    type: 'phone'
  }),
  
  // Business field validators
  productName: createFieldValidator({
    required: true,
    minLength: 2,
    maxLength: 200,
    pattern: VALIDATION_PATTERNS.ALPHANUMERIC
  }),
  
  currency: createFieldValidator({
    required: true,
    type: 'currency',
    min: 0
  }),
  
  optionalCurrency: createFieldValidator({
    required: false,
    type: 'currency',
    min: 0
  }),
  
  positiveInteger: createFieldValidator({
    required: true,
    type: 'number',
    min: 1,
    custom: (value) => {
      if (!Number.isInteger(Number(value))) {
        return 'Debe ser un número entero';
      }
      return null;
    }
  }),
  
  percentage: createFieldValidator({
    required: true,
    type: 'number',
    min: 0,
    max: 100
  }),
  
  // Material/Inventory validators
  materialName: createFieldValidator({
    required: true,
    minLength: 2,
    maxLength: 150,
    pattern: VALIDATION_PATTERNS.ALPHANUMERIC
  }),
  
  quantity: createFieldValidator({
    required: true,
    type: 'number',
    min: 0.01
  }),
  
  stock: createFieldValidator({
    required: true,
    type: 'number',
    min: 0
  }),
  
  // Description validators
  shortDescription: createFieldValidator({
    required: false,
    maxLength: 255
  }),
  
  longDescription: createFieldValidator({
    required: false,
    maxLength: 1000
  }),
  
  // Address validators
  address: createFieldValidator({
    required: true,
    minLength: 10,
    maxLength: 200
  }),
  
  // ID validators
  uuid: createFieldValidator({
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    custom: (value) => {
      if (!value || typeof value !== 'string') {
        return 'ID inválido';
      }
      return null;
    }
  })
} as const;

/**
 * Validates multiple fields at once
 */
export function validateFields<T extends Record<string, any>>(
  data: T,
  validators: { [K in keyof T]?: FieldValidator<T[K]> }
): {
  isValid: boolean;
  errors: { [K in keyof T]?: string };
} {
  const errors: { [K in keyof T]?: string } = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(validators) as [keyof T, FieldValidator<any>][]) {
    if (validator) {
      const result = validator(data[field]);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}

/**
 * Validates a single field and returns just the error message
 */
export function getFieldError<T>(value: T, validator: FieldValidator<T>): string | undefined {
  const result = validator(value);
  return result.isValid ? undefined : result.error;
}

/**
 * Creates a validator that checks if at least one field in a group is filled
 */
export function createAtLeastOneValidator<T extends Record<string, any>>(
  fields: (keyof T)[],
  message = 'Al menos uno de estos campos debe estar completado'
): (data: T) => ValidationResult {
  return (data: T): ValidationResult => {
    const hasAtLeastOne = fields.some(field => {
      const value = data[field];
      return value && String(value).trim() !== '';
    });
    
    return {
      isValid: hasAtLeastOne,
      error: hasAtLeastOne ? undefined : message
    };
  };
}

/**
 * Creates a validator that ensures two fields match
 */
export function createMatchValidator<T>(
  confirmField: keyof T,
  message = 'Los campos deben coincidir'
): (originalValue: any, data: T) => ValidationResult {
  return (originalValue: any, data: T): ValidationResult => {
    const isMatch = originalValue === data[confirmField];
    return {
      isValid: isMatch,
      error: isMatch ? undefined : message
    };
  };
}