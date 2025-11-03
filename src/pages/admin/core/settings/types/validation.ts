/**
 * SETTINGS MODULE - ZOD VALIDATION SCHEMAS
 *
 * Centralized validation using G-Admin Mini's validation system.
 * All schemas use BaseSchemas from CommonSchemas.ts
 */

import { z } from 'zod';
import { BaseSchemas, ValidationMessages } from '@/lib/validation/zod/CommonSchemas';

// ============================================================================
// BUSINESS PROFILE VALIDATION
// ============================================================================

export const BusinessProfileSchema = z.object({
  business_name: z.string()
    .min(2, ValidationMessages.minLength(2))
    .max(200, ValidationMessages.maxLength(200)),

  business_type: z.enum([
    'restaurant',
    'cafe',
    'bakery',
    'food_truck',
    'catering',
    'other'
  ], {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de negocio válido' })
  }),

  // Address
  street: BaseSchemas.address,
  city: z.string().min(2, ValidationMessages.minLength(2)),
  state: z.string().min(2, ValidationMessages.minLength(2)),
  postal_code: z.string()
    .min(4, ValidationMessages.minLength(4))
    .max(8, ValidationMessages.maxLength(8)),
  country: z.string().default('Argentina'),

  // Contact
  phone: BaseSchemas.phoneAR,
  email: BaseSchemas.email,
  website: BaseSchemas.optionalUrl,

  // Social Media (optional)
  facebook: BaseSchemas.optionalUrl,
  instagram: BaseSchemas.optionalUrl,
  twitter: BaseSchemas.optionalUrl,
});

export type BusinessProfileFormData = z.infer<typeof BusinessProfileSchema>;

// ============================================================================
// TAX CONFIGURATION VALIDATION (Argentina)
// ============================================================================

export const TaxConfigurationSchema = z.object({
  // CUIT/CUIL (Argentina tax ID)
  tax_number: BaseSchemas.cuit,

  // Tax type
  tax_type: z.enum([
    'monotributo',
    'responsable_inscripto',
    'responsable_no_inscripto',
    'exento'
  ], {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de régimen fiscal válido' })
  }),

  // Monotributo category (if applicable)
  monotributo_category: z.enum([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'
  ], {
    errorMap: () => ({ message: 'Debes seleccionar una categoría de monotributo válida' })
  }).optional(),

  // IVA condition
  iva_condition: z.enum([
    'responsable_inscripto',
    'responsable_no_inscripto',
    'monotributo',
    'exento',
    'consumidor_final'
  ], {
    errorMap: () => ({ message: 'Debes seleccionar una condición de IVA válida' })
  }),

  // Default IVA rate
  default_iva_rate: z.number()
    .min(0, ValidationMessages.minValue(0))
    .max(100, ValidationMessages.maxValue(100))
    .default(21), // Default 21% for Argentina

  // Alternative IVA rates
  alternative_iva_rates: z.array(z.number().min(0).max(100)).optional(),

  // AFIP configuration
  afip_enabled: z.boolean().default(false),
  afip_certificate: z.string().optional(),
  afip_point_of_sale: z.number()
    .int('Debe ser un número entero')
    .min(1, 'Punto de venta inválido')
    .max(9999, 'Punto de venta inválido')
    .optional(),

  // Invoice settings
  include_tax_in_prices: z.boolean().default(true),
  invoice_prefix: z.string()
    .max(10, ValidationMessages.maxLength(10))
    .optional(),

  // Fiscal period
  fiscal_year_start_month: z.number()
    .int('Debe ser un número entero')
    .min(1, 'Mes inválido')
    .max(12, 'Mes inválido')
    .default(1), // January
})
.superRefine((data, ctx) => {
  // Validate monotributo_category is required if tax_type is monotributo
  if (data.tax_type === 'monotributo' && !data.monotributo_category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['monotributo_category'],
      message: 'Debes seleccionar una categoría para el régimen de Monotributo'
    });
  }

  // Validate AFIP point of sale is required if AFIP is enabled
  if (data.afip_enabled && !data.afip_point_of_sale) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['afip_point_of_sale'],
      message: 'Debes especificar el punto de venta de AFIP'
    });
  }
});

export type TaxConfigurationFormData = z.infer<typeof TaxConfigurationSchema>;

// ============================================================================
// SYSTEM PREFERENCES VALIDATION
// ============================================================================

export const SystemPreferencesSchema = z.object({
  // Theme
  theme: z.enum(['light', 'dark', 'auto'], {
    errorMap: () => ({ message: 'Debes seleccionar un tema válido' })
  }).default('auto'),

  // Language
  language: z.enum(['es', 'en', 'pt'], {
    errorMap: () => ({ message: 'Debes seleccionar un idioma válido' })
  }).default('es'),

  // Timezone
  timezone: z.string().default('America/Argentina/Buenos_Aires'),

  // Date and time formats
  date_format: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  time_format: z.enum(['12h', '24h']).default('24h'),

  // Currency
  currency_code: z.string().length(3, 'Código de moneda inválido (3 letras)').default('ARS'),
  currency_symbol: z.string().max(5, ValidationMessages.maxLength(5)).default('$'),
  currency_position: z.enum(['before', 'after']).default('before'),
  decimal_places: z.number()
    .int('Debe ser un número entero')
    .min(0, ValidationMessages.minValue(0))
    .max(4, ValidationMessages.maxValue(4))
    .default(2),

  // Notifications
  notifications_enabled: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  low_stock_alerts: z.boolean().default(true),
  order_alerts: z.boolean().default(true),

  // Security
  session_timeout_minutes: z.number()
    .int('Debe ser un número entero')
    .min(5, ValidationMessages.minValue(5))
    .max(1440, ValidationMessages.maxValue(1440)) // Max 24 hours
    .default(60),
  require_strong_passwords: z.boolean().default(true),
  enable_2fa: z.boolean().default(false),
});

export type SystemPreferencesFormData = z.infer<typeof SystemPreferencesSchema>;

// ============================================================================
// USER PERMISSIONS VALIDATION
// ============================================================================

export const UserPermissionSchema = z.object({
  user_id: BaseSchemas.uuid,
  role: z.enum([
    'ADMINISTRADOR',
    'GERENTE',
    'EMPLEADO',
    'CAJERO',
    'CLIENTE'
  ], {
    errorMap: () => ({ message: 'Debes seleccionar un rol válido' })
  }),

  // Location access (multi-location support)
  location_ids: z.array(BaseSchemas.uuid).optional(),
  can_access_all_locations: z.boolean().default(false),

  // Custom permissions (override role defaults)
  custom_permissions: z.array(z.string()).optional(),

  // Status
  is_active: z.boolean().default(true),
});

export type UserPermissionFormData = z.infer<typeof UserPermissionSchema>;

// ============================================================================
// INTEGRATION CONFIGURATION VALIDATION
// ============================================================================

export const IntegrationConfigSchema = z.object({
  integration_type: z.enum([
    'payment',
    'messaging',
    'analytics',
    'delivery',
    'pos',
    'fiscal'
  ], {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de integración válido' })
  }),

  provider: z.string().min(1, ValidationMessages.required),

  // Credentials
  api_key: z.string()
    .min(10, 'La API key debe tener al menos 10 caracteres')
    .optional(),
  api_secret: z.string()
    .min(10, 'El API secret debe tener al menos 10 caracteres')
    .optional(),

  // Configuration
  webhook_url: BaseSchemas.optionalUrl,
  is_production: z.boolean().default(false),
  enabled: z.boolean().default(true),

  // Additional config (JSONB)
  configuration: z.record(z.string(), z.any()).optional(),
})
.superRefine((data, ctx) => {
  // Validate payment integrations require credentials
  if (data.integration_type === 'payment' && !data.api_key) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['api_key'],
      message: 'Las integraciones de pago requieren una API key'
    });
  }
});

export type IntegrationConfigFormData = z.infer<typeof IntegrationConfigSchema>;

// ============================================================================
// COMPLETE SETTINGS FORM VALIDATION
// ============================================================================

export const CompleteSettingsSchema = z.object({
  businessProfile: BusinessProfileSchema.partial(),
  taxConfiguration: TaxConfigurationSchema.partial(),
  systemPreferences: SystemPreferencesSchema.partial(),
});

export type CompleteSettingsFormData = z.infer<typeof CompleteSettingsSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates CUIT format and check digit (Argentina)
 * Format: XX-XXXXXXXX-X
 */
export function validateCUITCheckDigit(cuit: string): boolean {
  // Remove hyphens
  const cleanCuit = cuit.replace(/-/g, '');

  if (cleanCuit.length !== 11) return false;

  // Calculate check digit
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * multipliers[i];
  }

  const checkDigit = (11 - (sum % 11)) % 11;
  const providedCheckDigit = parseInt(cleanCuit[10]);

  return checkDigit === providedCheckDigit;
}

/**
 * Format CUIT for display (XX-XXXXXXXX-X)
 */
export function formatCUIT(cuit: string): string {
  const cleanCuit = cuit.replace(/\D/g, '');

  if (cleanCuit.length !== 11) return cuit;

  return `${cleanCuit.slice(0, 2)}-${cleanCuit.slice(2, 10)}-${cleanCuit.slice(10)}`;
}

/**
 * Validate email with additional checks
 */
export function validateBusinessEmail(email: string): boolean {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Check for common disposable email domains
  const disposableDomains = ['tempmail', 'throwaway', '10minutemail', 'guerrillamail'];
  const domain = email.split('@')[1]?.toLowerCase();

  return !disposableDomains.some(d => domain?.includes(d));
}
