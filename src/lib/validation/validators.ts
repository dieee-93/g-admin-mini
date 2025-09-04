import { type ValidationSchema, type ValidationResult, type ValidationRule, type ValidationError } from './types';
import { sanitizeObject } from './sanitization';

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone validation (international format)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// Currency validation (supports multiple currencies)
const CURRENCY_REGEX = /^\d+(\.\d{1,2})?$/;

/**
 * Creates a validation schema for specific data types
 */
export function createValidationSchema(type: 'inventory' | 'customer' | 'sale' | 'staff'): ValidationSchema {
  switch (type) {
    case 'inventory':
      return {
        rules: [
          {
            field: 'name',
            rules: {
              required: true,
              minLength: 2,
              maxLength: 100,
              pattern: /^[a-zA-Z0-9\s\-\_\.\,áéíóúÁÉÍÓÚñÑ]+$/,
              type: 'string'
            },
            message: 'El nombre debe tener entre 2 y 100 caracteres y solo contener letras, números y caracteres básicos'
          },
          {
            field: 'current_stock',
            rules: {
              required: true,
              min: 0,
              type: 'number'
            },
            message: 'El stock actual debe ser un número mayor o igual a 0'
          },
          {
            field: 'min_stock',
            rules: {
              required: true,
              min: 0,
              type: 'number'
            },
            message: 'El stock mínimo debe ser un número mayor o igual a 0'
          },
          {
            field: 'max_stock',
            rules: {
              min: 0,
              type: 'number',
              custom: (value, data) => {
                if (value && data?.min_stock && value <= data.min_stock) {
                  return 'El stock máximo debe ser mayor que el stock mínimo';
                }
                return true;
              }
            }
          },
          {
            field: 'cost_per_unit',
            rules: {
              required: true,
              min: 0,
              type: 'currency'
            },
            message: 'El costo por unidad debe ser un valor positivo'
          },
          {
            field: 'category',
            rules: {
              required: true,
              pattern: /^[a-zA-Z0-9\s\-\_áéíóúÁÉÍÓÚñÑ]+$/,
              maxLength: 50
            },
            message: 'La categoría es requerida y debe ser válida'
          },
          {
            field: 'unit',
            rules: {
              required: true,
              pattern: /^[a-zA-Z]+$/,
              maxLength: 20
            },
            message: 'La unidad de medida es requerida'
          }
        ],
        sanitize: true,
        permissions: ['inventory.create', 'inventory.update'],
        businessRules: [
          {
            name: 'stock_consistency',
            description: 'El stock actual debe estar dentro de los límites establecidos',
            validate: (data) => {
              if (data.max_stock && data.current_stock > data.max_stock) {
                return 'El stock actual excede el máximo permitido';
              }
              return true;
            },
            severity: 'warning',
            category: 'inventory'
          }
        ]
      };

    case 'customer':
      return {
        rules: [
          {
            field: 'name',
            rules: {
              required: true,
              minLength: 2,
              maxLength: 100,
              pattern: /^[a-zA-Z\s\-\'áéíóúÁÉÍÓÚñÑ]+$/,
              type: 'string'
            },
            message: 'El nombre debe tener entre 2 y 100 caracteres y solo contener letras'
          },
          {
            field: 'email',
            rules: {
              pattern: EMAIL_REGEX,
              type: 'email'
            },
            message: 'El email debe tener un formato válido'
          },
          {
            field: 'phone',
            rules: {
              pattern: PHONE_REGEX,
              type: 'phone'
            },
            message: 'El teléfono debe tener un formato válido'
          },
          {
            field: 'address',
            rules: {
              maxLength: 255,
              type: 'string'
            },
            message: 'La dirección no puede exceder 255 caracteres'
          }
        ],
        sanitize: true,
        permissions: ['customers.create', 'customers.update']
      };

    case 'sale':
      return {
        rules: [
          {
            field: 'items',
            rules: {
              required: true,
              custom: (items) => {
                if (!Array.isArray(items) || items.length === 0) {
                  return 'La venta debe tener al menos un producto';
                }
                const allValid = items.every(item => 
                  item.product_id && 
                  typeof item.quantity === 'number' &&
                  item.quantity > 0 && 
                  typeof item.unit_price === 'number' &&
                  item.unit_price >= 0
                );
                return allValid || 'Todos los productos deben ser válidos';
              }
            },
            message: 'Los productos de la venta deben ser válidos'
          },
          {
            field: 'total',
            rules: {
              required: true,
              min: 0,
              type: 'currency'
            },
            message: 'El total de la venta debe ser mayor a 0'
          },
          {
            field: 'payment_method',
            rules: {
              required: true,
              custom: (method) => ['cash', 'card', 'transfer', 'mixed'].includes(method)
            },
            message: 'El método de pago debe ser válido'
          }
        ],
        sanitize: true,
        permissions: ['sales.create'],
        businessRules: [
          {
            name: 'stock_validation',
            description: 'Validar que hay suficiente stock para la venta',
            validate: async (data, context) => {
              // This would check against current inventory
              // Implementation depends on your stock checking logic
              return true;
            },
            severity: 'error',
            category: 'sales'
          }
        ]
      };

    case 'staff':
      return {
        rules: [
          {
            field: 'name',
            rules: {
              required: true,
              minLength: 2,
              maxLength: 100,
              pattern: /^[a-zA-Z\s\-\'áéíóúÁÉÍÓÚñÑ]+$/,
              type: 'string'
            },
            message: 'El nombre debe ser válido'
          },
          {
            field: 'email',
            rules: {
              required: true,
              pattern: EMAIL_REGEX,
              type: 'email'
            },
            message: 'El email es requerido y debe ser válido'
          },
          {
            field: 'phone',
            rules: {
              pattern: PHONE_REGEX,
              type: 'phone'
            },
            message: 'El teléfono debe tener formato válido'
          },
          {
            field: 'position',
            rules: {
              required: true,
              maxLength: 50,
              type: 'string'
            },
            message: 'El puesto es requerido'
          },
          {
            field: 'salary',
            rules: {
              required: true,
              min: 0,
              type: 'currency'
            },
            message: 'El salario debe ser un valor positivo'
          },
          {
            field: 'hire_date',
            rules: {
              required: true,
              type: 'date',
              custom: (date) => {
                const hireDate = new Date(date);
                const today = new Date();
                return hireDate <= today || 'La fecha de contratación no puede ser futura';
              }
            },
            message: 'La fecha de contratación es requerida y debe ser válida'
          }
        ],
        sanitize: true,
        permissions: ['staff.create', 'staff.update']
      };

    default:
      return { rules: [] };
  }
}

/**
 * Validates data against a schema
 */
export async function validateData(data: any, schema: ValidationSchema): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let sanitizedData = data;

  // Sanitize data if requested
  if (schema.sanitize) {
    sanitizedData = sanitizeObject(data, {
      trimStrings: true,
      removeHtmlTags: true,
      normalizeWhitespace: true,
      removeEmptyStrings: true
    });
  }

  // Validate each rule
  for (const rule of schema.rules) {
    const fieldValue = getNestedValue(sanitizedData, rule.field);
    const fieldErrors = validateField(fieldValue, rule, sanitizedData);
    
    fieldErrors.forEach(error => {
      if (error.severity === 'error') {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    });
  }

  // Validate business rules
  if (schema.businessRules) {
    for (const businessRule of schema.businessRules) {
      try {
        const result = await businessRule.validate(sanitizedData);
        if (result !== true) {
          const error: ValidationError = {
            field: 'business_rule',
            message: typeof result === 'string' ? result : businessRule.description,
            code: businessRule.name,
            severity: businessRule.severity
          };
          
          if (businessRule.severity === 'error') {
            errors.push(error);
          } else {
            warnings.push(error);
          }
        }
      } catch (error) {
        errors.push({
          field: 'business_rule',
          message: `Error validating business rule: ${businessRule.name}`,
          code: 'business_rule_error',
          severity: 'error'
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedData
  };
}

/**
 * Validates a single field against its rules
 */
function validateField(value: any, rule: ValidationRule, fullData: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const { rules } = rule;

  // Required validation
  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push({
      field: rule.field,
      message: rule.message || `${rule.field} es requerido`,
      code: 'required',
      severity: 'error'
    });
    return errors; // Stop validation if required field is missing
  }

  // Skip other validations if field is empty and not required
  if (!rules.required && (value === null || value === undefined || value === '')) {
    return errors;
  }

  // Type validation
  if (rules.type) {
    const typeError = validateType(value, rules.type);
    if (typeError) {
      errors.push({
        field: rule.field,
        message: rule.message || typeError,
        code: 'type',
        severity: 'error'
      });
      return errors; // Stop if type is wrong
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push({
        field: rule.field,
        message: rule.message || `${rule.field} debe tener al menos ${rules.minLength} caracteres`,
        code: 'minLength',
        severity: 'error'
      });
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({
        field: rule.field,
        message: rule.message || `${rule.field} no puede exceder ${rules.maxLength} caracteres`,
        code: 'maxLength',
        severity: 'error'
      });
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push({
        field: rule.field,
        message: rule.message || `${rule.field} tiene un formato inválido`,
        code: 'pattern',
        severity: 'error'
      });
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push({
        field: rule.field,
        message: rule.message || `${rule.field} debe ser mayor o igual a ${rules.min}`,
        code: 'min',
        severity: 'error'
      });
    }

    if (rules.max !== undefined && value > rules.max) {
      errors.push({
        field: rule.field,
        message: rule.message || `${rule.field} debe ser menor o igual a ${rules.max}`,
        code: 'max',
        severity: 'error'
      });
    }
  }

  // Custom validation
  if (rules.custom) {
    try {
      const result = rules.custom(value, fullData);
      if (result !== true) {
        errors.push({
          field: rule.field,
          message: typeof result === 'string' ? result : rule.message || 'Validación personalizada falló',
          code: 'custom',
          severity: 'error'
        });
      }
    } catch (error) {
      errors.push({
        field: rule.field,
        message: rule.message || 'Error en validación personalizada',
        code: 'custom_error',
        severity: 'error'
      });
    }
  }

  return errors;
}

/**
 * Validates data type
 */
function validateType(value: any, type: string): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') return 'Debe ser un texto';
      break;
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) return 'Debe ser un número válido';
      break;
    case 'email':
      if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
        return 'Debe ser un email válido';
      }
      break;
    case 'phone':
      if (typeof value !== 'string' || !PHONE_REGEX.test(value)) {
        return 'Debe ser un teléfono válido';
      }
      break;
    case 'currency':
      if (typeof value !== 'number' || isNaN(value) || !CURRENCY_REGEX.test(value.toString())) {
        return 'Debe ser un valor monetario válido';
      }
      break;
    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Debe ser una fecha válida';
      break;
  }
  return null;
}

/**
 * Gets nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}