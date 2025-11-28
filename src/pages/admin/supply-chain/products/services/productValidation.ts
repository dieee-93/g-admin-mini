/**
 * Product Validation Service
 * Validates product data based on ProductConfig
 *
 * Rules:
 * - If requires_staff === true → staff_allocation required
 * - If has_duration === true → duration_minutes required
 * - If requires_booking === true → booking_window_days required
 * - If is_digital === true → digital_delivery required
 * - If has_components === true and components_required === true → components list required
 */

import type {
  ProductWithConfig,
  ProductConfig,
  StaffAllocation,
  DigitalDeliveryConfig
} from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export class ProductValidation {
  /**
   * Validate product basic information
   */
  static validateBasicInfo(
    name: string,
    category: string | undefined,
    price: number | undefined
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!name || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'El nombre es requerido' });
    }

    if (name && name.length > 200) {
      errors.push({ field: 'name', message: 'El nombre no puede exceder 200 caracteres' });
    }

    if (!category) {
      errors.push({ field: 'category', message: 'La categoría es requerida' });
    }

    if (price !== undefined && price < 0) {
      errors.push({ field: 'price', message: 'El precio no puede ser negativo' });
    }

    return errors;
  }

  /**
   * Validate staff allocation
   */
  static validateStaffAllocation(
    config: ProductConfig,
    staffAllocation: StaffAllocation[] | undefined
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.requires_staff) {
      if (!staffAllocation || staffAllocation.length === 0) {
        errors.push({
          field: 'staff_allocation',
          message: 'Se requiere al menos un rol de personal cuando requires_staff está activo'
        });
      }

      if (staffAllocation) {
        staffAllocation.forEach((allocation, index) => {
          if (!allocation.role || allocation.role.trim().length === 0) {
            errors.push({
              field: `staff_allocation[${index}].role`,
              message: `El rol es requerido para la asignación #${index + 1}`
            });
          }

          if (allocation.count <= 0) {
            errors.push({
              field: `staff_allocation[${index}].count`,
              message: `La cantidad debe ser mayor a 0 para la asignación #${index + 1}`
            });
          }

          if (allocation.duration_minutes <= 0) {
            errors.push({
              field: `staff_allocation[${index}].duration_minutes`,
              message: `La duración debe ser mayor a 0 para la asignación #${index + 1}`
            });
          }
        });
      }
    }

    return errors;
  }

  /**
   * Validate duration
   */
  static validateDuration(
    config: ProductConfig,
    durationMinutes: number | undefined
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.has_duration) {
      if (!durationMinutes || durationMinutes <= 0) {
        errors.push({
          field: 'duration_minutes',
          message: 'La duración es requerida cuando has_duration está activo'
        });
      }

      if (durationMinutes && durationMinutes > 1440) {
        errors.push({
          field: 'duration_minutes',
          message: 'La duración no puede exceder 24 horas (1440 minutos)'
        });
      }
    }

    return errors;
  }

  /**
   * Validate booking configuration
   */
  static validateBooking(
    config: ProductConfig,
    bookingWindowDays: number | undefined,
    concurrentCapacity: number | undefined
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.requires_booking) {
      if (!bookingWindowDays || bookingWindowDays <= 0) {
        errors.push({
          field: 'booking_window_days',
          message: 'El período de reserva es requerido cuando requires_booking está activo'
        });
      }

      if (concurrentCapacity !== undefined && concurrentCapacity <= 0) {
        errors.push({
          field: 'concurrent_capacity',
          message: 'La capacidad concurrente debe ser mayor a 0'
        });
      }
    }

    return errors;
  }

  /**
   * Validate digital delivery configuration
   */
  static validateDigitalDelivery(
    config: ProductConfig,
    digitalDelivery: DigitalDeliveryConfig | undefined
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.is_digital) {
      if (!digitalDelivery) {
        errors.push({
          field: 'digital_delivery',
          message: 'La configuración de entrega digital es requerida cuando is_digital está activo'
        });
      } else {
        if (!digitalDelivery.delivery_type) {
          errors.push({
            field: 'digital_delivery.delivery_type',
            message: 'El tipo de entrega digital es requerido'
          });
        }

        // Validate based on delivery type
        if (digitalDelivery.delivery_type === 'download' && !digitalDelivery.file_url) {
          errors.push({
            field: 'digital_delivery.file_url',
            message: 'La URL del archivo es requerida para entrega por descarga'
          });
        }

        if (digitalDelivery.delivery_type === 'streaming' && !digitalDelivery.access_url) {
          errors.push({
            field: 'digital_delivery.access_url',
            message: 'La URL de acceso es requerida para streaming'
          });
        }

        if (
          ['event', 'course'].includes(digitalDelivery.delivery_type) &&
          (!digitalDelivery.duration_minutes || digitalDelivery.duration_minutes <= 0)
        ) {
          errors.push({
            field: 'digital_delivery.duration_minutes',
            message: 'La duración es requerida para eventos y cursos'
          });
        }

        if (
          digitalDelivery.max_participants !== undefined &&
          digitalDelivery.max_participants <= 0
        ) {
          errors.push({
            field: 'digital_delivery.max_participants',
            message: 'El máximo de participantes debe ser mayor a 0'
          });
        }
      }
    }

    return errors;
  }

  /**
   * Validate components (recipe)
   */
  static validateComponents(
    config: ProductConfig,
    components: Array<{ item_id: string; quantity: number }> | undefined
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (config.has_components && config.components_required) {
      if (!components || components.length === 0) {
        errors.push({
          field: 'components',
          message: 'Se requiere al menos un componente cuando components_required está activo'
        });
      }

      if (components) {
        components.forEach((component, index) => {
          if (!component.item_id) {
            errors.push({
              field: `components[${index}].item_id`,
              message: `El material es requerido para el componente #${index + 1}`
            });
          }

          if (component.quantity <= 0) {
            errors.push({
              field: `components[${index}].quantity`,
              message: `La cantidad debe ser mayor a 0 para el componente #${index + 1}`
            });
          }
        });
      }
    }

    return errors;
  }

  /**
   * Validate entire product
   */
  static validateProduct(product: Partial<ProductWithConfig>): ValidationResult {
    const allErrors: ValidationError[] = [];

    // Basic info validation
    allErrors.push(...this.validateBasicInfo(
      product.name || '',
      product.category,
      product.pricing?.price
    ));

    // Config-based validations
    if (product.config) {
      // Staff allocation
      allErrors.push(...this.validateStaffAllocation(
        product.config,
        product.config.staff_allocation
      ));

      // Duration
      allErrors.push(...this.validateDuration(
        product.config,
        product.config.duration_minutes
      ));

      // Booking
      allErrors.push(...this.validateBooking(
        product.config,
        product.config.booking_window_days,
        product.config.concurrent_capacity
      ));

      // Digital delivery
      allErrors.push(...this.validateDigitalDelivery(
        product.config,
        product.config.digital_delivery
      ));

      // Components (cast to expected type for validation)
      const components = product.optional_components?.map(c => ({
        item_id: c.item_id,
        quantity: c.quantity
      }));
      allErrors.push(...this.validateComponents(
        product.config,
        components
      ));
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Get validation errors as a map (field -> error message)
   */
  static getErrorsMap(errors: ValidationError[]): Record<string, string> {
    const errorsMap: Record<string, string> = {};
    errors.forEach(error => {
      errorsMap[error.field] = error.message;
    });
    return errorsMap;
  }
}
