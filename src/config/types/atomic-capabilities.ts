/**
 * Atomic Capabilities - Core Types
 *
 * Tipos centrales para el sistema de capacidades atómicas.
 * Reemplaza el sistema antiguo de BusinessModelRegistry con redundancias.
 *
 * @version 2.0.0
 * @see docs/ATOMIC_CAPABILITIES_DESIGN.md
 * @see docs/ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md
 */

// ============================================
// CAPABILITY & INFRASTRUCTURE IDS
// ============================================

/**
 * Business Capability IDs - Atomic capabilities seleccionables en el wizard
 *
 * Estas son las 9 capabilities atómicas que el usuario puede combinar.
 * Cada capability activa un conjunto específico de features.
 */
export type BusinessCapabilityId =
  // CORE BUSINESS MODELS (Sección 1 - Lo que ofreces)
  | 'physical_products'      // Productos físicos (comida, retail, manufactura)
  | 'professional_services'  // Servicios profesionales (consultoría, salud, belleza)
  | 'asset_rental'           // Alquiler de activos (equipos, espacios, vehículos)
  | 'membership_subscriptions' // Membresías y suscripciones recurrentes
  | 'digital_products'       // Productos digitales descargables

  // FULFILLMENT METHODS (Sección 2 - Cómo entregas)
  | 'onsite_service'         // Servicio/consumo en el local (mesas, cabinas)
  | 'pickup_orders'          // Cliente retira pedidos en local
  | 'delivery_shipping'      // Envío a domicilio del cliente

  // ❌ ELIMINADO: production_workflow (se auto-activa con physical_products en FeatureActivationEngine)
  // ❌ ELIMINADO: appointment_based (se auto-activa con professional_services en FeatureActivationEngine)

  // SPECIAL OPERATIONS (Sección 4 - Potenciadores)
  | 'async_operations'           // Operaciones asíncronas fuera de horario (was: online_store)
  | 'corporate_sales'        // Ventas corporativas B2B
  | 'mobile_operations';     // Operaciones móviles (food truck, servicios a domicilio)

/**
 * Infrastructure IDs - Configuración de infraestructura física/digital
 *
 * Define CÓMO opera físicamente el negocio.
 * Es mutuamente excluyente entre: single_location, multi_location, mobile_business.
 */
export type InfrastructureId =
  | 'single_location'   // Local único fijo
  | 'multi_location'    // Múltiples locales (cadena/franquicia)
  | 'mobile_business';  // Negocio móvil (food truck, servicios móviles)
// ❌ ELIMINADO: online_only (redundante - se logra con delivery + ecommerce sin local)

/**
 * User Choice ID - Union type de todas las opciones seleccionables
 */
export type UserChoiceId = BusinessCapabilityId | InfrastructureId;

// ============================================
// FEATURE IDS (88 features)
// ============================================

/**
 * Feature Tag IDs - 88 features granulares del sistema
 *
 * Organizadas por DOMAIN para código, pero activadas por CAPABILITIES.
 * Nomenclatura: {domain}_{entity}_{operation_type}
 */
export type FeatureId =
  // ============================================
  // SALES DOMAIN (26 features)
  // ============================================

  // Core sales
  | 'sales_order_management'
  | 'sales_payment_processing'
  | 'sales_catalog_menu'

  // On-site sales
  | 'sales_pos_onsite'
  | 'sales_dine_in_orders'
  | 'sales_order_at_table'

  // E-commerce
  | 'sales_catalog_ecommerce'
  | 'sales_online_order_processing'
  | 'sales_online_payment_gateway'
  | 'sales_cart_management'
  | 'sales_checkout_process'
  | 'sales_multicatalog_management'

  // Retail
  | 'sales_bulk_pricing'
  | 'sales_quote_generation'
  | 'sales_product_retail'

  // Services
  | 'sales_package_management'

  // B2B
  | 'sales_contract_management'
  | 'sales_tiered_pricing'
  | 'sales_approval_workflows'
  | 'sales_quote_to_order'

  // Payment & pricing (nuevas 2024)
  | 'sales_split_payment'
  | 'sales_tip_management'
  | 'sales_coupon_management'

  // Fulfillment modes (nuevas 2025)
  | 'sales_pickup_orders'
  | 'sales_delivery_orders'

  // ============================================
  // INVENTORY DOMAIN (13 features)
  // ============================================

  // Core inventory
  | 'inventory_stock_tracking'
  | 'inventory_alert_system'
  | 'inventory_purchase_orders'
  | 'inventory_supplier_management'

  // Advanced inventory
  | 'inventory_sku_management'
  | 'inventory_barcode_scanning'
  | 'inventory_multi_unit_tracking'

  // Automation (nuevas 2024)
  | 'inventory_low_stock_auto_reorder'
  | 'inventory_demand_forecasting'
  | 'inventory_available_to_promise'
  | 'inventory_batch_lot_tracking'
  | 'inventory_expiration_tracking'

  // ============================================
  // PRODUCTION DOMAIN (4 features)
  // ============================================

  | 'production_bom_management'
  | 'production_display_system'
  | 'production_order_queue'
  | 'production_capacity_planning'  // Nueva 2024

  // ============================================
  // PRODUCTS DOMAIN (7 features)
  // ============================================

  | 'products_recipe_management'
  | 'products_catalog_menu'
  | 'products_catalog_ecommerce'
  | 'products_package_management'
  | 'products_availability_calculation'
  | 'products_cost_intelligence'
  | 'products_dynamic_materials'

  // ============================================
  // OPERATIONS DOMAIN (15 features)
  // ============================================

  // Pickup operations
  | 'operations_pickup_scheduling'
  | 'operations_notification_system'

  // Delivery operations
  | 'operations_delivery_zones'
  | 'operations_delivery_tracking'
  | 'operations_shipping_integration'
  | 'operations_deferred_fulfillment'

  // On-site operations
  | 'operations_table_management'
  | 'operations_table_assignment'
  | 'operations_floor_plan_config'
  | 'operations_bill_splitting'

  // Advanced operations (nuevas 2024)
  | 'operations_waitlist_management'
  | 'operations_vendor_performance'

  // ============================================
  // SCHEDULING DOMAIN (4 features)
  // ============================================

  | 'scheduling_appointment_booking'
  | 'scheduling_calendar_management'
  | 'scheduling_reminder_system'
  | 'scheduling_availability_rules'

  // ============================================
  // CUSTOMER DOMAIN (5 features)
  // ============================================

  | 'customer_service_history'
  | 'customer_preference_tracking'
  | 'customer_loyalty_program'
  | 'customer_online_accounts'      // Nueva 2024

  // ============================================
  // FINANCE DOMAIN (4 features)
  // ============================================

  | 'finance_corporate_accounts'
  | 'finance_credit_management'
  | 'finance_invoice_scheduling'
  | 'finance_payment_terms'

  // ============================================
  // MOBILE DOMAIN (5 features)
  // ============================================

  | 'mobile_location_tracking'
  | 'mobile_route_planning'
  | 'mobile_inventory_constraints'

  // ============================================
  // MULTISITE DOMAIN (5 features)
  // ============================================

  | 'multisite_location_management'
  | 'multisite_centralized_inventory'
  | 'multisite_transfer_orders'
  | 'multisite_comparative_analytics'
  | 'multisite_configuration_per_site'

  // ============================================
  // ANALYTICS DOMAIN (2 features)
  // ============================================

  | 'analytics_ecommerce_metrics'
  | 'analytics_conversion_tracking'

  // ============================================
  // STAFF DOMAIN (6 features) - Navigation Integration Fix
  // ============================================

  | 'staff_employee_management'
  | 'staff_shift_management'
  | 'staff_time_tracking'
  | 'staff_performance_tracking'
  | 'staff_training_management'
  | 'staff_labor_cost_tracking'

  // ============================================
  // RENTAL DOMAIN (5 features)
  // ============================================

  | 'rental_item_management'
  | 'rental_booking_calendar'
  | 'rental_availability_tracking'
  | 'rental_pricing_by_duration'
  | 'rental_late_fees'

  // ============================================
  // MEMBERSHIP DOMAIN (5 features)
  // ============================================

  | 'membership_subscription_plans'
  | 'membership_recurring_billing'
  | 'membership_access_control'
  | 'membership_usage_tracking'
  | 'membership_benefits_management'

  // ============================================
  // DIGITAL PRODUCTS DOMAIN (4 features)
  // ============================================

  | 'digital_file_delivery'
  | 'digital_license_management'
  | 'digital_download_tracking'
  | 'digital_version_control'

  // ============================================
  // CORE DOMAIN (1 feature)
  // ============================================

  | 'executive'
  | 'can_view_menu_engineering';

// ============================================
// CONFIGURATION INTERFACES
// ============================================

/**
 * Business Capability Definition
 *
 * Define una capability atómica seleccionable en el wizard.
 * Cada capability activa un conjunto de features automáticamente.
 */
export interface BusinessCapability {
  /** ID único de la capability */
  id: BusinessCapabilityId;

  /** Nombre user-friendly mostrado en el wizard */
  name: string;

  /** Descripción corta para el usuario */
  description: string;

  /** Emoji/icono representativo */
  icon: string;

  /** Tipo para organización interna */
  type: 'fulfillment' | 'production' | 'service_mode' | 'special_operation';

  /**
   * Features que se activan al seleccionar esta capability
   * Estas features se combinan con las de otras capabilities (set union)
   */
  activatesFeatures: FeatureId[];

  /**
   * Requisitos bloqueantes - DEBEN completarse para usar esta capability
   * Se validan contra RequirementsRegistry
   *
   * @example ['business_address_required', 'operating_hours_required']
   */
  blockingRequirements?: string[];
}

/**
 * Infrastructure Definition
 *
 * Define cómo opera físicamente el negocio.
 * Las infrastructures son mutuamente excluyentes entre grupos.
 */
export interface Infrastructure {
  /** ID único de la infrastructure */
  id: InfrastructureId;

  /** Nombre user-friendly */
  name: string;

  /** Descripción */
  description: string;

  /** Icono */
  icon: string;

  /** Tipo para organización */
  type: 'infrastructure';

  /**
   * Infrastructures que NO pueden estar activas simultáneamente
   *
   * @example ['multi_location', 'mobile_business'] para 'single_location'
   */
  conflicts?: InfrastructureId[];

  /**
   * Features adicionales que activa esta infrastructure
   */
  activatesFeatures: FeatureId[];

  /** Requisitos bloqueantes */
  blockingRequirements?: string[];
}

/**
 * Feature Definition
 *
 * Define una feature granular del sistema.
 * Las features son activadas por capabilities/infrastructure.
 */
export interface Feature {
  /** ID único de la feature (tag) */
  id: FeatureId;

  /** Nombre descriptivo */
  name: string;

  /** Descripción funcional */
  description: string;

  /**
   * Domain organizacional (para código, NO para usuario)
   * Usado para organizar archivos y componentes
   */
  domain:
  | 'SALES'
  | 'INVENTORY'
  | 'PRODUCTION'
  | 'PRODUCTS'
  | 'OPERATIONS'
  | 'SCHEDULING'
  | 'CUSTOMER'
  | 'FINANCE'
  | 'MOBILE'
  | 'MULTISITE'
  | 'ANALYTICS'
  | 'STAFF'
  | 'RENTAL'      // Added for rental/asset management
  | 'MEMBERSHIP'  // Added for membership/subscription systems
  | 'DIGITAL';    // Added for digital products

  /**
   * Tipo de feature según su función
   */
  category: 'core' | 'conditional' | 'premium' | 'enterprise';

  /**
   * Milestones fundacionales requeridos para desbloquear
   * @see RequirementsRegistry
   */
  foundationalMilestones?: string[];
}

// ============================================
// RESOLUTION & VALIDATION TYPES
// ============================================

/**
 * Feature Resolution Result
 *
 * Resultado del proceso de resolución de features según user choices.
 * Este es el output principal del FeatureEngine.
 */
export interface FeatureResolutionResult {
  /** Todas las features que deben activarse (core + conditional) */
  featuresToActivate: FeatureId[];

  /** Features core (siempre activas) */
  coreFeatures: FeatureId[];

  /** Features condicionales (según user choices) */
  conditionalFeatures: FeatureId[];

  /** Features bloqueadas por validaciones pendientes */
  blockedFeatures: FeatureId[];

  /** Milestones fundacionales que deben completarse */
  pendingMilestones: string[];

  /** IDs de validaciones bloqueantes */
  blockingValidations: string[];
}

/**
 * Validation Check Result
 *
 * Resultado de verificar blocking validations.
 */
export interface ValidationCheckResult {
  /** Si todas las validaciones pasaron */
  valid: boolean;

  /** Features que están bloqueadas */
  blockedFeatures: FeatureId[];

  /** Validaciones que fallaron */
  failedValidations: string[];

  /** Mensajes de error user-friendly */
  errorMessages: Array<{
    field: string;
    message: string;
    redirectTo: string;
  }>;
}

/**
 * Milestone Completion Result
 *
 * Resultado de completar un milestone fundacional.
 */
export interface MilestoneCompletionResult {
  /** Feature desbloqueada (si alguna) */
  unlockedFeature?: FeatureId;

  /** Si se completó el último milestone de una feature */
  featureFullyUnlocked: boolean;

  /** Milestones restantes para esa feature */
  remainingMilestones: string[];
}

/**
 * User Choice Validation Result
 *
 * Resultado de validar user choices (dependencies + conflicts).
 */
export interface UserChoiceValidationResult {
  /** Si las choices son válidas */
  valid: boolean;

  /** Errores de dependencies o conflicts */
  errors: Array<{
    type: 'dependency' | 'conflict';
    message: string;
    affectedChoice: UserChoiceId;
  }>;
}

// ============================================
// PERSISTENCE TYPES (Supabase)
// ============================================

/**
 * Business Profile Schema
 *
 * Representa la tabla `business_profiles` en Supabase.
 * Almacena las user choices y configuration computed.
 */
export interface BusinessProfileSchema {
  id: string;
  organization_id: string;

  /**
   * Capabilities seleccionadas por el usuario
   * Stored as JSONB array
   */
  selected_activities: BusinessCapabilityId[];

  /**
   * Infrastructure seleccionada
   * Stored as JSONB array (usualmente 1 elemento)
   */
  selected_infrastructure: InfrastructureId[];

  /**
   * Configuration computed (cache)
   * Contiene: activeFeatures, blockedFeatures, pendingMilestones
   * Stored as JSONB object
   */
  computed_configuration: {
    activeFeatures: FeatureId[];
    blockedFeatures: FeatureId[];
    pendingMilestones: string[];
    lastComputedAt: string; // ISO timestamp
  };

  created_at: string;
  updated_at: string;
}

/**
 * Wizard State
 *
 * Estado local del wizard durante el setup.
 */
export interface WizardState {
  currentStep: number;
  totalSteps: number;

  /** Capabilities seleccionadas */
  selectedCapabilities: BusinessCapabilityId[];

  /** Infrastructure seleccionada */
  selectedInfrastructure: InfrastructureId[];

  /** Validación en tiempo real */
  validation: UserChoiceValidationResult;

  /** Si el wizard está completo */
  isComplete: boolean;
}
