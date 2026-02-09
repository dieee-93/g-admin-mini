/**
 * Material Form Validation Schema
 *
 * Extended Zod schemas for material form validation with support for:
 * - MEASURABLE materials (kg, liters, etc.)
 * - COUNTABLE materials (units with packaging)
 * - ELABORATED materials (with recipe and production config)
 *
 * Architecture:
 * - Extends BaseSchemas and EntitySchemas from CommonSchemas
 * - Type-specific conditional validation
 * - Production config validation for elaborated materials
 * - Stock and supplier validation for non-elaborated materials
 *
 * @see src/lib/validation/zod/CommonSchemas.ts
 */

import { z } from 'zod';
import { BaseSchemas, ValidationMessages } from '@/lib/validation/zod/CommonSchemas';

// ============================================================================
// PRODUCTION CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Staff Assignment schema (labor costing)
 * Integrates with team module for accurate labor calculation
 */
export const StaffAssignmentSchema = z.object({
  id: z.string().uuid(),
  role_id: z.string().uuid('Rol inválido'),
  role_name: z.string().optional(),
  employee_id: z.string().uuid().optional().nullable(),
  employee_name: z.string().optional(),
  duration_minutes: z.number()
    .int('Duración debe ser un número entero')
    .min(1, 'Duración debe ser al menos 1 minuto')
    .max(1440, 'Duración no puede exceder 24 horas'),
  count: z.number()
    .int('Cantidad debe ser un número entero')
    .min(1, 'Debe haber al menos 1 persona')
    .max(100, 'Cantidad no puede exceder 100 personas'),
  hourly_rate: z.number().nonnegative('Tarifa horaria no puede ser negativa').optional(),
  loaded_factor: z.number().min(1, 'Factor cargado debe ser al menos 1').optional(),
  loaded_hourly_cost: z.number().nonnegative('Costo horario cargado no puede ser negativo').optional(),
  total_cost: z.number().nonnegative('Costo total no puede ser negativo').optional(),
});

/**
 * Equipment Usage schema
 */
export const EquipmentUsageSchema = z.object({
  id: z.string().uuid(),
  equipment_id: z.string().uuid('Equipamiento inválido'),
  equipment_name: z.string().min(1, 'Nombre de equipamiento requerido'),
  equipment_type: z.string(),
  hours_used: z.number()
    .min(0.01, 'Horas usadas debe ser mayor a 0')
    .max(24, 'Horas usadas no puede exceder 24 horas'),
  hourly_cost_rate: z.number().nonnegative('Tarifa horaria no puede ser negativa'),
  total_cost: z.number().nonnegative('Costo total no puede ser negativo'),
  notes: z.string().max(500, ValidationMessages.maxLength(500)).optional(),
  recorded_at: z.string().optional(),
});

/**
 * Production Configuration schema
 * Complete costing structure for elaborated materials
 */
export const ProductionConfigSchema = z.object({
  // Equipment
  equipment_usage: z.array(EquipmentUsageSchema).optional(),
  equipment_cost: z.number().nonnegative('Costo de equipamiento no puede ser negativo').optional(),

  // Staff/Labor (unified with team module)
  staff_assignments: z.array(StaffAssignmentSchema).optional(),
  labor_total_cost: z.number().nonnegative('Costo total de mano de obra no puede ser negativo').optional(),

  // Overhead
  overhead_percentage: z.number()
    .min(0, ValidationMessages.minValue(0))
    .max(100, ValidationMessages.maxValue(100))
    .optional(),
  overhead_fixed: z.number().nonnegative('Overhead fijo no puede ser negativo').optional(),
  overhead_total_cost: z.number().nonnegative('Costo total de overhead no puede ser negativo').optional(),

  // Packaging
  packaging_cost: z.number().nonnegative('Costo de empaque no puede ser negativo').optional(),

  // Calculated totals
  materials_cost: z.number().nonnegative('Costo de materiales no puede ser negativo').optional(),
  total_direct_cost: z.number().nonnegative('Costo directo total no puede ser negativo').optional(),
  total_indirect_cost: z.number().nonnegative('Costo indirecto total no puede ser negativo').optional(),
  total_cost: z.number().nonnegative('Costo total no puede ser negativo').optional(),
  cost_per_unit: z.number().nonnegative('Costo por unidad no puede ser negativo').optional(),

  // Metadata
  last_calculation_date: z.string().optional(),
  notes: z.string().max(1000, ValidationMessages.maxLength(1000)).optional(),
});

// ============================================================================
// PACKAGING SCHEMAS
// ============================================================================

/**
 * Packaging schema for COUNTABLE materials
 */
export const PackagingSchema = z.object({
  package_size: z.number()
    .int('Tamaño de paquete debe ser un número entero')
    .min(1, 'Tamaño de paquete debe ser al menos 1'),
  package_unit: z.string().min(1, 'Unidad de paquete es requerida'),
  package_cost: z.number().nonnegative('Costo de paquete no puede ser negativo').optional(),
  display_mode: z.enum(['individual', 'packaged', 'both'], {
    errorMap: () => ({ message: 'Modo de visualización inválido' })
  }).optional(),
});

// ============================================================================
// SUPPLIER SCHEMAS
// ============================================================================

/**
 * Supplier data for stock entry
 */
export const SupplierDataSchema = z.object({
  supplier_id: BaseSchemas.uuid.optional(),
  new_supplier: z.object({
    name: z.string().min(1, ValidationMessages.required),
    contact: z.string().optional(),
    email: BaseSchemas.optionalEmail,
    phone: z.string().optional(),
  }).optional(),
  purchase_date: z.string().optional(),
  invoice_number: z.string().max(50, ValidationMessages.maxLength(50)).optional(),
  delivery_date: z.string().optional(),
  quality_rating: z.number()
    .min(1, 'Calificación debe ser entre 1 y 5')
    .max(5, 'Calificación debe ser entre 1 y 5')
    .optional(),
});

// ============================================================================
// MAIN MATERIAL FORM SCHEMA
// ============================================================================

/**
 * Complete material form schema with conditional validation
 * Based on material type (MEASURABLE, COUNTABLE, ELABORATED)
 */
export const MaterialFormSchema = z.object({
  // ========================================================================
  // BASIC INFO (Required for all types)
  // ========================================================================
  id: BaseSchemas.uuid.optional(),
  name: BaseSchemas.materialName,
  type: z.enum(['MEASURABLE', 'COUNTABLE', 'ELABORATED'], {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de material válido' })
  }),
  category: z.string().optional(),
  description: BaseSchemas.description,
  brand_id: BaseSchemas.uuid.optional(),

  // ========================================================================
  // TYPE-SPECIFIC FIELDS
  // ========================================================================

  // Unit (required for MEASURABLE and ELABORATED)
  unit: z.string().optional(),

  // Packaging (only for COUNTABLE)
  packaging: PackagingSchema.optional(),

  // Recipe (only for ELABORATED)
  recipe_id: BaseSchemas.uuid.optional(),

  // Production Config (only for ELABORATED)
  production_config: ProductionConfigSchema.optional(),

  // ========================================================================
  // STOCK FIELDS (Not for ELABORATED - stock comes from production)
  // ========================================================================
  initial_stock: z.number()
    .nonnegative('Stock inicial no puede ser negativo')
    .max(1000000, 'Stock inicial demasiado alto')
    .optional(),

  unit_cost: z.number()
    .nonnegative('Costo unitario no puede ser negativo')
    .max(100000, 'Costo unitario demasiado alto')
    .optional(),

  min_stock: z.number()
    .nonnegative('Stock mínimo no puede ser negativo')
    .optional(),

  target_stock: z.number()
    .nonnegative('Stock objetivo no puede ser negativo')
    .optional(),

  // ========================================================================
  // SUPPLIER FIELDS (Not for ELABORATED - no purchase, produced in-house)
  // ========================================================================
  supplier: SupplierDataSchema.optional(),
  supplier_id: BaseSchemas.uuid.optional(),

  // ========================================================================
  // METADATA
  // ========================================================================
  location_id: BaseSchemas.uuid.optional(),
  addToStockNow: z.boolean().optional(), // UI-only field for flow control
})
  // ========================================================================
  // CONDITIONAL VALIDATION RULES
  // ========================================================================
  .superRefine((data, ctx) => {
    // Rule 1: Unit is required for MEASURABLE and ELABORATED
    if ((data.type === 'MEASURABLE' || data.type === 'ELABORATED') && !data.unit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unit'],
        message: 'La unidad es requerida para materiales conmensurables y elaborados'
      });
    }

    // Rule 2: COUNTABLE must have packaging
    if (data.type === 'COUNTABLE' && !data.packaging) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['packaging'],
        message: 'Los materiales contables requieren configuración de empaque'
      });
    }

    // Rule 3: ELABORATED must have recipe_id
    if (data.type === 'ELABORATED' && !data.recipe_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['recipe_id'],
        message: 'Los materiales elaborados requieren una receta'
      });
    }

    // Rule 4: If addToStockNow is true and type is not ELABORATED, require unit_cost
    if (data.addToStockNow && data.type !== 'ELABORATED') {
      if (!data.unit_cost || data.unit_cost <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['unit_cost'],
          message: 'El costo unitario es requerido cuando agregas stock inicial'
        });
      }

      if (!data.initial_stock || data.initial_stock <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['initial_stock'],
          message: 'La cantidad de stock inicial debe ser mayor a 0'
        });
      }
    }

    // Rule 5: Validate min_stock <= target_stock
    if (data.min_stock && data.target_stock && data.min_stock > data.target_stock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['target_stock'],
        message: 'El stock objetivo debe ser mayor o igual al stock mínimo'
      });
    }

    // Rule 6: Production config validation for ELABORATED materials
    if (data.type === 'ELABORATED' && data.production_config) {
      const config = data.production_config;

      // Validate staff assignments have loaded_factor
      if (config.staff_assignments && config.staff_assignments.length > 0) {
        config.staff_assignments.forEach((assignment, index) => {
          if (!assignment.loaded_factor || assignment.loaded_factor < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['production_config', 'staff_assignments', index, 'loaded_factor'],
              message: 'El factor cargado debe ser al menos 1.0 (usar 1.325 por defecto)'
            });
          }

          if (!assignment.total_cost || assignment.total_cost <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['production_config', 'staff_assignments', index, 'total_cost'],
              message: 'Costo total debe ser calculado para cada asignación'
            });
          }
        });
      }

      // Validate equipment usage
      if (config.equipment_usage && config.equipment_usage.length > 0) {
        config.equipment_usage.forEach((equipment, index) => {
          if (equipment.hours_used <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['production_config', 'equipment_usage', index, 'hours_used'],
              message: 'Las horas usadas deben ser mayor a 0'
            });
          }

          if (equipment.hourly_cost_rate < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['production_config', 'equipment_usage', index, 'hourly_cost_rate'],
              message: 'La tarifa horaria no puede ser negativa'
            });
          }
        });
      }

      // Validate overhead percentage range
      if (config.overhead_percentage !== undefined) {
        if (config.overhead_percentage < 0 || config.overhead_percentage > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['production_config', 'overhead_percentage'],
            message: 'El porcentaje de overhead debe estar entre 0 y 100'
          });
        }
      }
    }
  });

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MaterialFormData = z.infer<typeof MaterialFormSchema>;
export type ProductionConfigData = z.infer<typeof ProductionConfigSchema>;
export type StaffAssignmentData = z.infer<typeof StaffAssignmentSchema>;
export type EquipmentUsageData = z.infer<typeof EquipmentUsageSchema>;
export type PackagingData = z.infer<typeof PackagingSchema>;
export type SupplierData = z.infer<typeof SupplierDataSchema>;

// ============================================================================
// VALIDATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate material form data and return errors
 *
 * @param data - Form data to validate
 * @returns Validation result with success flag and errors
 */
export function validateMaterialForm(data: unknown): {
  success: boolean;
  data?: MaterialFormData;
  errors?: Record<string, string>;
} {
  try {
    const result = MaterialFormSchema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors,
      };
    }
    throw error;
  }
}

/**
 * Validate specific field
 *
 * @param fieldName - Field name to validate
 * @param value - Field value
 * @param formData - Complete form data for context
 * @returns Error message or null if valid
 */
export function validateField(
  fieldName: keyof MaterialFormData,
  value: any,
  formData: Partial<MaterialFormData>
): string | null {
  try {
    // Create partial data with this field
    const testData = {
      ...formData,
      [fieldName]: value,
    };

    // Validate entire form (to catch cross-field validation)
    MaterialFormSchema.parse(testData);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Find error for this specific field
      const fieldError = error.errors.find(err =>
        err.path[0] === fieldName ||
        err.path.join('.') === fieldName
      );
      return fieldError?.message || null;
    }
    return null;
  }
}

/**
 * Get validation errors for all fields
 *
 * @param data - Form data to validate
 * @returns Map of field paths to error messages
 */
export function getValidationErrors(data: Partial<MaterialFormData> | undefined): Record<string, string> {
  // Early return if data is undefined or null
  if (!data) {
    return {};
  }

  try {
    const result = MaterialFormSchema.safeParse(data);

    if (result.success) {
      return {};
    }

    // Additional safety check
    if (!result.error || !result.error.errors) {
      console.warn('Zod validation failed but no errors array found', result);
      return {};
    }

    const errors: Record<string, string> = {};
    result.error.errors.forEach(err => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });

    return errors;
  } catch (error) {
    console.error('Error in getValidationErrors:', error);
    return {};
  }
}

/**
 * Check if form is valid without getting errors
 * Fast check for enabling/disabling submit button
 *
 * @param data - Form data to validate
 * @returns true if valid, false otherwise
 */
export function isFormValid(data: Partial<MaterialFormData>): boolean {
  const result = MaterialFormSchema.safeParse(data);
  return result.success;
}
