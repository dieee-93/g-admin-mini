/**
 * Centralized Zod Schemas
 * Eliminates validation duplication by leveraging Zod with React Hook Form
 */

import { z } from 'zod';

/**
 * Common validation messages in Spanish
 */
export const ValidationMessages = {
  required: 'Este campo es requerido',
  email: 'Ingresa un email válido',
  phone: 'Ingresa un teléfono válido',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  minValue: (min: number) => `El valor mínimo es ${min}`,
  maxValue: (max: number) => `El valor máximo es ${max}`,
  positive: 'Debe ser un número positivo',
  currency: 'Ingresa un monto válido',
  name: 'Solo se permiten letras, espacios y acentos',
  alphanumeric: 'Solo se permiten letras y números'
} as const;

/**
 * Base field schemas that can be reused across the application
 */
export const BaseSchemas = {
  // String fields
  requiredString: z.string().min(1, ValidationMessages.required),
  optionalString: z.string().optional(),
  
  // Name fields
  personName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(100, ValidationMessages.maxLength(100))
    .regex(/^[a-zA-Z\s\-\'áéíóúÁÉÍÓÚñÑüÜ]+$/, ValidationMessages.name),
  
  optionalPersonName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(100, ValidationMessages.maxLength(100))
    .regex(/^[a-zA-Z\s\-\'áéíóúÁÉÍÓÚñÑüÜ]+$/, ValidationMessages.name)
    .optional()
    .or(z.literal('')),
  
  // Contact fields
  email: z.string()
    .min(1, ValidationMessages.required)
    .email(ValidationMessages.email),
  
  optionalEmail: z.string()
    .email(ValidationMessages.email)
    .optional()
    .or(z.literal('')),
  
  phoneAR: z.string()
    .min(1, ValidationMessages.required)
    .regex(/^(\+54\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{6,8}$/, ValidationMessages.phone),
  
  optionalPhoneAR: z.string()
    .regex(/^(\+54\s?)?(\(?\d{2,4}\)?[\s.-]?)?\d{6,8}$/, ValidationMessages.phone)
    .optional()
    .or(z.literal('')),
  
  // Numeric fields
  positiveNumber: z.number()
    .positive(ValidationMessages.positive),
  
  positiveInt: z.number()
    .int('Debe ser un número entero')
    .positive(ValidationMessages.positive),
  
  currency: z.number()
    .nonnegative('No puede ser negativo')
    .max(999999.99, ValidationMessages.maxValue(999999.99)),
  
  percentage: z.number()
    .min(0, ValidationMessages.minValue(0))
    .max(100, ValidationMessages.maxValue(100)),
  
  // Business fields
  productName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(200, ValidationMessages.maxLength(200))
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, ValidationMessages.alphanumeric),
  
  materialName: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(150, ValidationMessages.maxLength(150)),
  
  description: z.string()
    .max(1000, ValidationMessages.maxLength(1000))
    .optional()
    .or(z.literal('')),
  
  shortDescription: z.string()
    .max(255, ValidationMessages.maxLength(255))
    .optional()
    .or(z.literal('')),
  
  // ID fields
  uuid: z.string().uuid('ID inválido'),
  
  // Dates
  dateString: z.string().min(1, ValidationMessages.required),
  optionalDateString: z.string().optional(),
  
  // Boolean fields
  requiredBoolean: z.boolean(),
  optionalBoolean: z.boolean().optional(),
} as const;

/**
 * Commonly used entity schemas
 */
export const EntitySchemas = {
  // Customer schema
  customer: z.object({
    name: BaseSchemas.personName,
    email: BaseSchemas.optionalEmail,
    phone: BaseSchemas.optionalPhoneAR,
    address: z.string()
      .max(200, ValidationMessages.maxLength(200))
      .optional()
      .or(z.literal('')),
    notes: BaseSchemas.shortDescription
  }),
  
  // Material/Item schema (enhanced for G-Admin Mini)
  material: z.object({
    name: BaseSchemas.materialName
      .refine((name) => name.length >= 2, {
        message: 'El nombre debe tener al menos 2 caracteres'
      })
      .refine((name) => name.length <= 100, {
        message: 'El nombre no puede exceder 100 caracteres'
      }),
    type: z.string().min(1, 'Debes seleccionar un tipo de item'),
    category: z.string().optional(),
    unit: z.string().min(1, 'Debes especificar la unidad'),
    initial_stock: z.number()
      .nonnegative('El stock inicial no puede ser negativo')
      .max(1000000, 'Stock inicial demasiado alto'),
    unit_cost: z.number()
      .nonnegative('El costo unitario no puede ser negativo')
      .max(100000, 'Costo unitario demasiado alto'),
    supplier: z.string().optional().or(z.literal('')),
    description: BaseSchemas.description
  })
  .superRefine((data, ctx) => {
    // Conditional validation based on type
    if ((data.type === 'MEASURABLE' || data.type === 'ELABORATED') && !data.unit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unit'],
        message: 'Debes especificar la unidad para este tipo de material'
      });
    }
    
    if (data.type === 'MEASURABLE' && !data.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Debes seleccionar una categoría de medición'
      });
    }
  }),
  
  // Product schema
  product: z.object({
    name: BaseSchemas.productName,
    description: BaseSchemas.description,
    price: BaseSchemas.currency,
    category: z.string().min(1, ValidationMessages.required),
    is_active: BaseSchemas.requiredBoolean
  }),
  
  // Employee schema
  employee: z.object({
    name: BaseSchemas.personName,
    email: BaseSchemas.email,
    phone: BaseSchemas.optionalPhoneAR,
    position: z.string().min(1, ValidationMessages.required),
    hourly_rate: BaseSchemas.currency.optional(),
    department: z.string().min(1, ValidationMessages.required),
    hire_date: BaseSchemas.dateString
  }),
  
  // Recipe ingredient schema
  recipeIngredient: z.object({
    item_id: BaseSchemas.uuid,
    quantity: BaseSchemas.positiveNumber,
    unit: z.string().min(1, ValidationMessages.required),
    notes: BaseSchemas.shortDescription
  }),
  
  // Financial transaction schema
  transaction: z.object({
    amount: BaseSchemas.currency,
    description: z.string().min(1, ValidationMessages.required).max(255, ValidationMessages.maxLength(255)),
    category: z.string().min(1, ValidationMessages.required),
    date: BaseSchemas.dateString,
    payment_method: z.enum(['cash', 'card', 'transfer', 'other']),
    reference_number: z.string().optional().or(z.literal(''))
  })
} as const;

/**
 * Form-specific schemas with different validation rules
 */
export const FormSchemas = {
  // Login form
  login: z.object({
    email: BaseSchemas.email,
    password: z.string().min(1, ValidationMessages.required)
  }),
  
  // Quick customer creation (fewer required fields)
  quickCustomer: z.object({
    name: BaseSchemas.personName,
    phone: BaseSchemas.phoneAR
  }),
  
  // Material quick entry
  quickMaterial: z.object({
    name: BaseSchemas.materialName,
    unit: z.string().min(1, ValidationMessages.required),
    cost: BaseSchemas.currency
  }),
  
  // Recipe basic info
  recipeBasic: z.object({
    name: BaseSchemas.productName,
    servings: BaseSchemas.positiveInt,
    prep_time: BaseSchemas.positiveInt.optional(),
    description: BaseSchemas.description
  }),
  
  // Search/filter forms
  searchFilter: z.object({
    query: z.string().optional().or(z.literal('')),
    category: z.string().optional().or(z.literal('')),
    date_from: BaseSchemas.optionalDateString,
    date_to: BaseSchemas.optionalDateString,
    min_amount: z.number().nonnegative('No puede ser negativo').optional(),
    max_amount: z.number().nonnegative('No puede ser negativo').optional()
  })
} as const;

/**
 * Utility function to create conditional schemas
 */
export function createConditionalSchema<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  condition: (data: z.infer<z.ZodObject<T>>) => boolean,
  additionalRules: z.ZodObject<any>
) {
  return baseSchema.superRefine((data, ctx) => {
    if (condition(data)) {
      const result = additionalRules.safeParse(data);
      if (!result.success) {
        result.error.errors.forEach(error => {
          ctx.addIssue(error);
        });
      }
    }
  });
}

/**
 * Utility to transform form data before validation
 */
export const DataTransformers = {
  trimStrings: <T extends Record<string, any>>(data: T): T => {
    const result = { ...data };
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'string') {
        result[key] = result[key].trim();
      }
    });
    return result;
  },
  
  numberify: <T extends Record<string, any>>(data: T, fields: (keyof T)[]): T => {
    const result = { ...data };
    fields.forEach(field => {
      if (result[field] && typeof result[field] === 'string') {
        const num = Number(result[field]);
        if (!isNaN(num)) {
          result[field] = num as T[keyof T];
        }
      }
    });
    return result;
  },
  
  emptyStringToUndefined: <T extends Record<string, any>>(data: T): T => {
    const result = { ...data };
    Object.keys(result).forEach(key => {
      if (result[key] === '') {
        result[key] = undefined;
      }
    });
    return result;
  }
} as const;

/**
 * Type helpers for React Hook Form integration
 */
export type SchemaType<T extends z.ZodType> = z.infer<T>;
export type CustomerFormData = SchemaType<typeof EntitySchemas.customer>;
export type MaterialFormData = SchemaType<typeof EntitySchemas.material>;
export type ProductFormData = SchemaType<typeof EntitySchemas.product>;
export type EmployeeFormData = SchemaType<typeof EntitySchemas.employee>;
export type LoginFormData = SchemaType<typeof FormSchemas.login>;

/**
 * Common Zod resolver configurations for React Hook Form
 */
export const getZodResolver = (schema: z.ZodType) => {
  return {
    resolver: async (data: any) => {
      try {
        const result = schema.parse(data);
        return { values: result, errors: {} };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, { type: string; message: string }> = {};
          error.errors.forEach(err => {
            const path = err.path.join('.');
            errors[path] = {
              type: err.code,
              message: err.message
            };
          });
          return { values: {}, errors };
        }
        throw error;
      }
    }
  };
};