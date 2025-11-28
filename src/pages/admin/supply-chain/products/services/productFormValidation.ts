/**
 * PRODUCT FORM VALIDATION SERVICE
 *
 * Servicio centralizado para validar formularios de productos.
 * Validaciones dinámicas según tipo de producto y capabilities.
 *
 * ✅ Type-safe validations
 * ✅ Conditional validations según tipo
 * ✅ Mensajes de error claros
 * ✅ Severity levels (error/warning)
 *
 * @design PRODUCTS_FORM_SECTIONS_SPEC.md
 */

import type {
  ProductFormData,
  ProductType,
  ValidationError,
  ValidationResult
} from '../types/productForm';

// ============================================
// MAIN VALIDATION FUNCTION
// ============================================

/**
 * Valida todo el formulario de producto
 *
 * @example
 * ```ts
 * const result = validateProduct(formData, 'service')
 * if (!result.isValid) {
 *   console.error(result.errors)
 * }
 * ```
 */
export function validateProduct(
  formData: ProductFormData,
  productType: ProductType
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validaciones universales
  errors.push(...validateBasicInfo(formData));
  errors.push(...validatePricing(formData));

  // Validaciones condicionales según tipo
  if (formData.materials?.has_materials) {
    errors.push(...validateMaterials(formData));
  }

  if (formData.staff?.has_staff_requirements) {
    errors.push(...validateStaff(formData));
  }

  if (formData.booking?.requires_booking) {
    errors.push(...validateBooking(formData));
  }

  if (productType === 'physical_product' && formData.production?.requires_production) {
    errors.push(...validateProduction(formData));
  }

  if (productType === 'rental' && formData.asset_config) {
    errors.push(...validateAssetConfig(formData));
  }

  if (productType === 'rental' && formData.rental_terms) {
    errors.push(...validateRentalTerms(formData));
  }

  if (productType === 'digital' && formData.digital_delivery) {
    errors.push(...validateDigitalDelivery(formData));
  }

  if (productType === 'membership' && formData.recurring_config) {
    errors.push(...validateRecurringConfig(formData));
  }

  // Warnings (no bloquean guardado)
  warnings.push(...generateWarnings(formData, productType));

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================
// BASIC INFO VALIDATIONS
// ============================================

function validateBasicInfo(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!formData.basic_info.name || formData.basic_info.name.trim() === '') {
    errors.push({
      field: 'basic_info.name',
      message: 'El nombre del producto es requerido',
      severity: 'error',
      section: 'basic_info'
    });
  }

  if (formData.basic_info.name && formData.basic_info.name.length > 200) {
    errors.push({
      field: 'basic_info.name',
      message: 'El nombre no puede exceder 200 caracteres',
      severity: 'error',
      section: 'basic_info'
    });
  }

  return errors;
}

// ============================================
// MATERIALS VALIDATIONS
// ============================================

function validateMaterials(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const components = formData.materials?.components || [];

  if (components.length === 0) {
    errors.push({
      field: 'materials.components',
      message: 'Debes agregar al menos un material o ingrediente',
      severity: 'error',
      section: 'materials'
    });
  }

  components.forEach((component, index) => {
    if (!component.material_id) {
      errors.push({
        field: `materials.components.${index}.material_id`,
        message: `Material #${index + 1}: Selecciona un material`,
        severity: 'error',
        section: 'materials'
      });
    }

    if (!component.quantity || component.quantity <= 0) {
      errors.push({
        field: `materials.components.${index}.quantity`,
        message: `Material #${index + 1}: La cantidad debe ser mayor a 0`,
        severity: 'error',
        section: 'materials'
      });
    }
  });

  return errors;
}

// ============================================
// STAFF VALIDATIONS
// ============================================

function validateStaff(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const staff = formData.staff?.staff_allocation || [];

  if (staff.length === 0) {
    errors.push({
      field: 'staff.staff_allocation',
      message: 'Debes agregar al menos un rol de personal',
      severity: 'error',
      section: 'staff'
    });
  }

  staff.forEach((allocation, index) => {
    if (!allocation.role_id) {
      errors.push({
        field: `staff.staff_allocation.${index}.role_id`,
        message: `Personal #${index + 1}: Selecciona un rol`,
        severity: 'error',
        section: 'staff'
      });
    }

    if (!allocation.count || allocation.count <= 0) {
      errors.push({
        field: `staff.staff_allocation.${index}.count`,
        message: `Personal #${index + 1}: La cantidad debe ser mayor a 0`,
        severity: 'error',
        section: 'staff'
      });
    }

    if (!allocation.duration_minutes || allocation.duration_minutes <= 0) {
      errors.push({
        field: `staff.staff_allocation.${index}.duration_minutes`,
        message: `Personal #${index + 1}: La duración debe ser mayor a 0`,
        severity: 'error',
        section: 'staff'
      });
    }

    // Si tiene booking, validar que duration esté presente
    if (formData.booking?.requires_booking && !allocation.duration_minutes) {
      errors.push({
        field: `staff.staff_allocation.${index}.duration_minutes`,
        message: `Personal #${index + 1}: La duración es requerida cuando se usan reservas`,
        severity: 'error',
        section: 'staff'
      });
    }
  });

  return errors;
}

// ============================================
// BOOKING VALIDATIONS
// ============================================

function validateBooking(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const booking = formData.booking;

  if (!booking) return errors;

  if (!booking.booking_window_days || booking.booking_window_days < 0) {
    errors.push({
      field: 'booking.booking_window_days',
      message: 'La ventana de reserva debe ser mayor o igual a 0',
      severity: 'error',
      section: 'booking'
    });
  }

  if (booking.max_advance_days && booking.max_advance_days < (booking.booking_window_days || 0)) {
    errors.push({
      field: 'booking.max_advance_days',
      message: 'Los días máximos de anticipación deben ser mayores a la ventana mínima',
      severity: 'error',
      section: 'booking'
    });
  }

  if (!booking.duration_minutes || booking.duration_minutes <= 0) {
    errors.push({
      field: 'booking.duration_minutes',
      message: 'La duración de la reserva es requerida',
      severity: 'error',
      section: 'booking'
    });
  }

  return errors;
}

// ============================================
// PRODUCTION VALIDATIONS
// ============================================

function validateProduction(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const production = formData.production;

  if (!production) return errors;

  if (!production.production_time_minutes || production.production_time_minutes <= 0) {
    errors.push({
      field: 'production.production_time_minutes',
      message: 'El tiempo de producción es requerido',
      severity: 'error',
      section: 'production'
    });
  }

  // Validar overhead config
  if (production.overhead_config) {
    const { method } = production.overhead_config;

    if (method === 'fixed' && !production.overhead_config.fixed_overhead) {
      errors.push({
        field: 'production.overhead_config.fixed_overhead',
        message: 'El overhead fijo es requerido cuando se usa el método "fixed"',
        severity: 'error',
        section: 'production'
      });
    }

    if (method === 'per_unit' && !production.overhead_config.per_unit_overhead) {
      errors.push({
        field: 'production.overhead_config.per_unit_overhead',
        message: 'El overhead por unidad es requerido cuando se usa el método "per_unit"',
        severity: 'error',
        section: 'production'
      });
    }

    if (method === 'time_based' && !production.overhead_config.overhead_per_minute) {
      errors.push({
        field: 'production.overhead_config.overhead_per_minute',
        message: 'El overhead por minuto es requerido cuando se usa el método "time_based"',
        severity: 'error',
        section: 'production'
      });
    }
  }

  return errors;
}

// ============================================
// PRICING VALIDATIONS
// ============================================

function validatePricing(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!formData.pricing.price || formData.pricing.price <= 0) {
    errors.push({
      field: 'pricing.price',
      message: 'El precio debe ser mayor a 0',
      severity: 'error',
      section: 'pricing'
    });
  }

  if (formData.pricing.compare_at_price && formData.pricing.compare_at_price <= formData.pricing.price) {
    errors.push({
      field: 'pricing.compare_at_price',
      message: 'El precio comparativo debe ser mayor al precio de venta',
      severity: 'error',
      section: 'pricing'
    });
  }

  return errors;
}

// ============================================
// ASSET CONFIG VALIDATIONS (rental)
// ============================================

function validateAssetConfig(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const asset = formData.asset_config;

  if (!asset) return errors;

  if (!asset.asset_id) {
    errors.push({
      field: 'asset_config.asset_id',
      message: 'Debes seleccionar un activo',
      severity: 'error',
      section: 'asset_config'
    });
  }

  // Validar availability config (reemplaza booking para rental)
  if (!asset.availability_config) {
    errors.push({
      field: 'asset_config.availability_config',
      message: 'La configuración de disponibilidad es requerida para alquileres',
      severity: 'error',
      section: 'asset_config'
    });
  } else {
    if (!asset.availability_config.min_rental_duration_minutes || asset.availability_config.min_rental_duration_minutes <= 0) {
      errors.push({
        field: 'asset_config.availability_config.min_rental_duration_minutes',
        message: 'La duración mínima de alquiler es requerida',
        severity: 'error',
        section: 'asset_config'
      });
    }
  }

  return errors;
}

// ============================================
// RENTAL TERMS VALIDATIONS (rental)
// ============================================

function validateRentalTerms(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const terms = formData.rental_terms;

  if (!terms) return errors;

  // Validar late return policy si existe
  if (terms.late_return_policy) {
    if (terms.late_return_policy.grace_period_minutes < 0) {
      errors.push({
        field: 'rental_terms.late_return_policy.grace_period_minutes',
        message: 'El período de gracia no puede ser negativo',
        severity: 'error',
        section: 'rental_terms'
      });
    }
  }

  return errors;
}

// ============================================
// DIGITAL DELIVERY VALIDATIONS (digital)
// ============================================

function validateDigitalDelivery(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const digital = formData.digital_delivery;

  if (!digital) return errors;

  // Validaciones específicas por tipo de entrega
  switch (digital.delivery_type) {
    case 'download':
      if (!digital.download_config?.file_url) {
        errors.push({
          field: 'digital_delivery.download_config.file_url',
          message: 'La URL del archivo es requerida para descargas',
          severity: 'error',
          section: 'digital_delivery'
        });
      }
      break;

    case 'streaming':
      if (!digital.streaming_config?.video_url) {
        errors.push({
          field: 'digital_delivery.streaming_config.video_url',
          message: 'La URL del video es requerida para streaming',
          severity: 'error',
          section: 'digital_delivery'
        });
      }
      break;

    case 'access':
      if (!digital.access_config?.access_url) {
        errors.push({
          field: 'digital_delivery.access_config.access_url',
          message: 'La URL de acceso es requerida',
          severity: 'error',
          section: 'digital_delivery'
        });
      }
      break;

    case 'redirect':
      if (!digital.redirect_config?.redirect_url) {
        errors.push({
          field: 'digital_delivery.redirect_config.redirect_url',
          message: 'La URL de redirección es requerida',
          severity: 'error',
          section: 'digital_delivery'
        });
      }
      break;
  }

  return errors;
}

// ============================================
// RECURRING CONFIG VALIDATIONS (membership)
// ============================================

function validateRecurringConfig(formData: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const recurring = formData.recurring_config;

  if (!recurring) return errors;

  if (recurring.trial_enabled && !recurring.trial_duration_days) {
    errors.push({
      field: 'recurring_config.trial_duration_days',
      message: 'La duración del trial es requerida cuando el trial está activo',
      severity: 'error',
      section: 'recurring_config'
    });
  }

  if (recurring.cancellation_policy === 'notice_required' && !recurring.cancellation_notice_days) {
    errors.push({
      field: 'recurring_config.cancellation_notice_days',
      message: 'Los días de aviso son requeridos cuando se requiere notificación',
      severity: 'error',
      section: 'recurring_config'
    });
  }

  return errors;
}

// ============================================
// WARNINGS GENERATION
// ============================================

function generateWarnings(
  formData: ProductFormData,
  productType: ProductType
): ValidationError[] {
  const warnings: ValidationError[] = [];

  // Warning: Precio menor al costo
  if (formData.pricing.calculated_cost) {
    const { total } = formData.pricing.calculated_cost;
    if (formData.pricing.price < total) {
      warnings.push({
        field: 'pricing.price',
        message: `Advertencia: El precio ($${formData.pricing.price}) es menor al costo ($${total}). Estás vendiendo con pérdida.`,
        severity: 'warning',
        section: 'pricing'
      });
    }
  }

  // Warning: Margen muy bajo
  if (formData.pricing.profit_margin_percentage && formData.pricing.profit_margin_percentage < 20) {
    warnings.push({
      field: 'pricing.profit_margin_percentage',
      message: `Advertencia: El margen de ganancia (${formData.pricing.profit_margin_percentage.toFixed(1)}%) es muy bajo. Se recomienda al menos 30%.`,
      severity: 'warning',
      section: 'pricing'
    });
  }

  return warnings;
}

// ============================================
// HELPER: Crear error de validación
// ============================================

export function createValidationError(
  field: string,
  message: string,
  severity: 'error' | 'warning' = 'error',
  section?: string
): ValidationError {
  return { field, message, severity, section };
}
