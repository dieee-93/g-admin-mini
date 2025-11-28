/**
 * PRODUCTS FORM - UNIFIED TYPE SYSTEM v3.0
 *
 * Following PRODUCTS_FORM_ARCHITECTURE.md
 * Integrates with Capability Store (not hard-coded)
 *
 * @design PRODUCTS_FORM_DESIGN_REVIEW.md (correcciones aplicadas)
 */

import type { BusinessCapabilityId } from '@/config/BusinessModelRegistry';
import type { FeatureId } from '@/config/FeatureRegistry';

// ============================================
// PRODUCT TYPES - 5 Fundamental Types
// ============================================

/**
 * 5 Tipos fundamentales de productos
 * Decision: Separar physical vs service por comportamiento diferente
 */
export type ProductType =
  | 'physical_product'  // Comida preparada, retail
  | 'service'           // Consultas, tratamientos
  | 'rental'            // Alquiler de assets
  | 'digital'           // Cursos, ebooks
  | 'membership';       // Acceso recurrente

// ============================================
// BASIC INFO FIELDS
// ============================================

export interface BasicInfoFields {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  active: boolean;  // Default: true
}

// ============================================
// MATERIALS FIELDS
// ============================================

export interface MaterialsFields {
  has_materials: boolean;
  components?: ProductComponent[];
}

export interface ProductComponent {
  material_id: string;
  quantity: number;
  unit?: string;

  // Enhanced (para UI)
  material_name?: string;
  unit_cost?: number;
  total_cost?: number;
}

// ============================================
// STAFF FIELDS
// ============================================

export interface StaffFields {
  has_staff_requirements: boolean;
  staff_allocation?: StaffAllocation[];
}

export interface StaffAllocation {
  role_id: string;
  role_name?: string;  // Para UI
  count: number;
  duration_minutes: number;  // ✅ Estandarizado a minutos
  hourly_rate?: number;

  // Calculated
  total_hours?: number;
  total_cost?: number;
}

// ============================================
// BOOKING FIELDS
// ============================================

export interface BookingFields {
  requires_booking: boolean;

  // Configuración de reservas
  booking_window_days?: number;  // Min días de anticipación
  max_advance_days?: number;     // Max días de anticipación

  // Duración (puede ser auto-filled desde Staff)
  duration_minutes?: number;     // ✅ Estandarizado a minutos
  buffer_time_minutes?: number;  // ✅ Tiempo entre reservas

  // Capacidad
  concurrent_capacity?: number;  // Max reservas simultáneas

  // Restricciones
  blackout_dates?: Date[];
  available_days?: number[];     // 0=Sunday, 6=Saturday
  time_slots?: TimeSlot[];
}

export interface TimeSlot {
  start_time: string;  // HH:mm format
  end_time: string;
}

// ============================================
// PRODUCTION FIELDS (physical_product only)
// ============================================

export interface ProductionFields {
  requires_production: boolean;

  // ✅ CORRECCIÓN #2: Usar production_time_minutes (no prep_time)
  production_time_minutes?: number;  // Tiempo de preparación

  // Capacidad
  batch_size?: number;
  daily_capacity?: number;

  // ✅ CORRECCIÓN #1: Overhead config unificado
  overhead_config?: OverheadConfig;

  // Kitchen/Production integration
  production_mode?: 'kitchen' | 'assembly' | 'preparation';
  kds_config?: {
    kds_category?: string;
    station?: string;
    priority?: number;
  };
}

// ✅ CORRECCIÓN #1: Schema unificado de overhead
export interface OverheadConfig {
  method: 'none' | 'fixed' | 'per_unit' | 'time_based';

  // Si method = 'fixed': Costo fijo por lote
  fixed_overhead?: number;

  // Si method = 'per_unit': Costo por unidad
  per_unit_overhead?: number;

  // Si method = 'time_based': Costo por minuto (coherente con duraciones)
  overhead_per_minute?: number;
}

// ============================================
// PRICING FIELDS (Variante A: Intelligent Pricing)
// ============================================

export interface PricingFields {
  price: number;

  // Costos (calculados)
  calculated_cost?: ProductCostBreakdown;

  // Margen
  profit_margin_percentage?: number;
  suggested_price?: number;

  // Opciones avanzadas
  compare_at_price?: number;  // Precio tachado
  tax_included?: boolean;
}

export interface ProductCostBreakdown {
  materials: number;
  labor: number;
  overhead: number;
  total: number;
}

// ============================================
// ASSET CONFIG FIELDS (rental only)
// ============================================

export interface AssetConfigFields {
  asset_id: string;

  // Depreciation
  depreciation_config?: DepreciationConfig;

  // Security deposit
  security_deposit_config?: SecurityDepositConfig;

  // Digital inspections
  inspection_config?: InspectionConfig;

  // Insurance
  insurance_config?: InsuranceConfig;

  // Maintenance tracking
  maintenance_config?: MaintenanceConfig;

  // IMPORTANTE: Availability Config (reemplaza Booking para rental)
  availability_config?: AvailabilityConfig;

  // GPS Tracking
  gps_config?: GPSConfig;

  // Usage restrictions
  usage_restrictions?: UsageRestrictions;

  // Accessories
  accessories?: Accessory[];

  // Checklist templates
  checklist_templates?: ChecklistTemplate[];
}

export interface DepreciationConfig {
  method: 'straight_line' | 'declining_balance' | 'units_of_production';
  acquisition_cost: number;
  salvage_value: number;
  useful_life_months?: number;  // Para straight_line
  depreciation_rate?: number;   // Para declining_balance
  total_units?: number;         // Para units_of_production
}

export interface SecurityDepositConfig {
  calculation_method: 'fixed' | 'percentage_of_price' | 'tiered_by_duration';
  fixed_amount?: number;
  percentage?: number;
  tiered_rates?: Array<{
    min_days: number;
    max_days?: number;
    amount: number;
  }>;
  refund_policy: 'full' | 'partial' | 'conditional';
}

export interface InspectionConfig {
  types: Array<'pre_rental' | 'post_rental' | 'periodic' | 'damage_assessment'>;
  photo_comparison_enabled: boolean;
  required_photos?: string[];  // Ej: ['front', 'back', 'interior']
  inspection_checklist?: string[];
}

export interface InsuranceConfig {
  required: boolean;
  provider?: string;
  policy_number?: string;
  coverage_amount?: number;
  deductible?: number;
}

export interface MaintenanceConfig {
  interval_type: 'time_based' | 'usage_based' | 'hybrid';
  interval_days?: number;
  interval_units?: number;  // Ej: cada 100 usos
  last_maintenance_date?: Date;
  next_maintenance_date?: Date;
}

// ✅ Availability Config - reemplaza Booking para rental
export interface AvailabilityConfig {
  // Duración mínima de alquiler (en minutos)
  min_rental_duration_minutes: number;  // ✅ Coherente con minutos
  max_rental_duration_minutes?: number;

  // Buffer times
  buffer_time_minutes?: number;

  // Blackout dates
  blackout_dates?: Date[];

  // Available days
  available_days?: number[];  // 0=Sunday, 6=Saturday
}

export interface GPSConfig {
  tracking_enabled: boolean;
  geofencing_enabled: boolean;
  geofences?: Geofence[];
  tracking_interval_minutes?: number;
}

export interface Geofence {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius_meters: number;
  alert_on_exit: boolean;
}

export interface UsageRestrictions {
  max_distance_km?: number;
  max_hours_per_day?: number;
  operator_requirements?: string[];
  prohibited_activities?: string[];
}

export interface Accessory {
  id: string;
  name: string;
  price: number;
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: string[];
}

// ============================================
// RENTAL TERMS FIELDS (rental only)
// ============================================

export interface RentalTermsFields {
  // Security deposit (puede duplicar AssetConfig si se usa aquí también)
  security_deposit?: SecurityDepositConfig;

  // Late return policy
  late_return_policy?: LateReturnPolicy;

  // Damage policy
  damage_policy?: DamagePolicy;

  // Insurance options
  insurance_options?: InsuranceOption[];

  // Usage restrictions (puede duplicar AssetConfig)
  usage_restrictions?: UsageRestrictions;

  // Cancellation policy
  cancellation_policy?: CancellationPolicy;

  // Maintenance & cleaning
  maintenance_cleaning?: {
    cleaning_fee?: number;
    cleaning_required: boolean;
    fuel_policy?: 'full_to_full' | 'prepaid' | 'pay_per_use';
  };

  // Additional terms
  additional_terms?: string;
}

export interface LateReturnPolicy {
  grace_period_minutes: number;  // ✅ En minutos
  fee_structure: 'flat' | 'hourly' | 'daily' | 'progressive';

  // Si flat
  flat_fee?: number;

  // Si hourly/daily
  hourly_fee?: number;
  daily_fee?: number;

  // Si progressive
  progressive_tiers?: Array<{
    hours_late: number;
    fee: number;
  }>;
}

export interface DamagePolicy {
  photo_comparison_required: boolean;
  damage_assessment_process: string;
  liability_waiver_available: boolean;

  damage_tiers?: Array<{
    category: string;  // Ej: 'minor', 'moderate', 'major'
    charge_type: 'fixed' | 'repair_cost' | 'replacement_cost';
    fixed_charge?: number;
  }>;
}

export interface InsuranceOption {
  id: string;
  name: string;
  description: string;
  daily_cost: number;
  coverage_amount: number;
  deductible: number;
  required: boolean;
}

export interface CancellationPolicy {
  policy_type: 'tiered' | 'fixed' | 'flexible' | 'strict';

  // Si tiered
  tiers?: Array<{
    hours_before_rental: number;
    refund_percentage: number;
  }>;

  // Si fixed
  fixed_fee?: number;

  // Si flexible/strict
  full_refund_hours?: number;
  no_refund_hours?: number;
}

// ============================================
// DIGITAL DELIVERY FIELDS (digital only)
// ============================================

export interface DigitalDeliveryFields {
  delivery_type: 'download' | 'streaming' | 'access' | 'redirect' | 'hybrid';

  // Download
  download_config?: {
    file_url: string;
    file_size_mb?: number;
    file_format?: string;
    download_limit?: number;  // Max downloads
    expiry_days?: number;
  };

  // Streaming
  streaming_config?: {
    platform: string;  // Ej: 'Vimeo', 'YouTube', 'custom'
    video_url: string;
    duration_minutes?: number;
  };

  // Access (ej: curso, membresía)
  access_config?: {
    platform: string;
    access_url: string;
    access_duration_days?: number;  // UI convierte a días, internamente minutos
    max_devices?: number;
    concurrent_access?: boolean;
  };

  // Redirect (ej: webinar externo)
  redirect_config?: {
    redirect_url: string;
    redirect_delay_seconds?: number;
  };

  // Hybrid (múltiples tipos)
  hybrid_config?: {
    types: Array<'download' | 'streaming' | 'access'>;
    // Los configs específicos se usan según types
  };
}

// ============================================
// RECURRING CONFIG FIELDS (membership only)
// ============================================

export interface RecurringConfigFields {
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';

  // Trial period
  trial_enabled: boolean;
  trial_duration_days?: number;
  trial_price?: number;  // 0 = free trial

  // Billing
  billing_day?: number;  // 1-31 para monthly, 1-7 para weekly
  prorate_first_payment?: boolean;

  // Auto-renewal
  auto_renewal: boolean;
  auto_renewal_notice_days?: number;  // California law: 7 días

  // Cancellation
  cancellation_policy?: 'anytime' | 'end_of_cycle' | 'notice_required';
  cancellation_notice_days?: number;

  // Access
  access_type: 'unlimited' | 'credits_based' | 'tier_based';
  monthly_credits?: number;  // Si credits_based
  tier_benefits?: string[];  // Si tier_based
}

// ============================================
// UNIFIED PRODUCT FORM DATA
// ============================================

/**
 * Interfaz unificada que contiene TODOS los campos posibles
 * Las secciones se renderizan dinámicamente según tipo y capabilities
 */
export interface ProductFormData {
  // Meta
  id?: string;
  product_type: ProductType;

  // Secciones (todas opcionales excepto basic_info)
  basic_info: BasicInfoFields;
  materials?: MaterialsFields;
  staff?: StaffFields;
  booking?: BookingFields;
  production?: ProductionFields;
  pricing: PricingFields;
  asset_config?: AssetConfigFields;
  rental_terms?: RentalTermsFields;
  digital_delivery?: DigitalDeliveryFields;
  recurring_config?: RecurringConfigFields;

  // Metadata
  created_at?: string;
  updated_at?: string;
}

// ============================================
// PRODUCT TYPE TEMPLATE (para selector)
// ============================================

export interface ProductTypeTemplate {
  type: ProductType;
  label: string;
  icon: string;
  description: string;
  examples: string[];
  enabled: boolean;
  requiredCapabilities: BusinessCapabilityId[];
  recommendedCapabilities?: BusinessCapabilityId[];
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  section?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================
// FORM SECTION METADATA (para registry)
// ============================================

export interface FormSection {
  id: string;
  label: string;
  component: React.ComponentType<FormSectionProps>;
  requiredFeatures?: FeatureId[];
  visibilityRule: (type: ProductType, activeFeatures: FeatureId[]) => boolean;
  order?: number;  // Orden de renderizado
}

export interface FormSectionProps {
  data: ProductFormData;
  onChange: (data: Partial<ProductFormData>) => void;
  errors?: ValidationError[];
  readOnly?: boolean;
}
