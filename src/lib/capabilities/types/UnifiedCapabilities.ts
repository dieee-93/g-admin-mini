/**
 * UNIFIED CAPABILITY SYSTEM - G-Admin Mini v3.0
 * Sistema unificado que reemplaza TODA la lógica anterior
 *
 * ELIMINA:
 * - BusinessCapabilities.ts (interface duplicada)
 * - businessCapabilitySystem.ts (sistema complejo)
 * - useBusinessCapabilities hook (lógica confusa)
 * - Toda lógica de setup wizard separada
 */

// ============================================
// CORE CAPABILITY TYPES
// ============================================

export type CapabilityCategory = 'universal' | 'activity' | 'infrastructure';

export type CapabilityId =
  // UNIVERSAL - Aparecen siempre que hay ≥1 business capability
  | 'customer_management'
  | 'dashboard_analytics'
  | 'system_settings'
  | 'fiscal_compliance'
  | 'staff_management'

  // ACTIVITY - Qué hace el negocio
  | 'sells_products'
  | 'sells_products_for_onsite_consumption'
  | 'sells_products_for_pickup'
  | 'sells_products_with_delivery'
  | 'sells_digital_products'
  | 'sells_services'
  | 'sells_services_by_appointment'
  | 'sells_services_by_class'
  | 'sells_space_by_reservation'
  | 'manages_events'
  | 'hosts_private_events'
  | 'manages_offsite_catering'
  | 'manages_recurrence'
  | 'manages_rentals'
  | 'manages_memberships'
  | 'manages_subscriptions'

  // INFRASTRUCTURE - Cómo opera el negocio
  | 'has_online_store'
  | 'is_b2b_focused'
  | 'single_location'
  | 'multi_location'
  | 'mobile_business'
  | 'premium_tier';

// ============================================
// EFFECT SYSTEM
// ============================================

export interface ModuleEffect {
  moduleId: string;
  visible: boolean;
  features: Record<string, FeatureState>;
}

export type FeatureState = 'enabled' | 'disabled' | 'required';

export interface ValidationRule {
  field: string;
  required: boolean;
  message?: string;
}

export interface CapabilityEffects {
  modules: ModuleEffect[];
  validations: ValidationRule[];
  tutorials: string[];
  achievements: string[];
  // Agregamos UI effects para granularidad
  ui: UIEffect[];
}

export interface UIEffect {
  target: string; // 'sales.pickup_config', 'dashboard.executive'
  action: 'show' | 'hide' | 'enable' | 'disable';
  config?: Record<string, any>;
}

// ============================================
// BUSINESS CAPABILITY DEFINITION
// ============================================

export interface BusinessCapability {
  id: CapabilityId;
  name: string;
  description: string;
  category: CapabilityCategory;
  icon: string;

  // Qué efectos dispara esta capability
  effects: CapabilityEffects;

  // Capabilities que debe tener para activarse (dependencies)
  requires?: CapabilityId[];

  // Capabilities que no puede coexistir (conflicts)
  conflicts?: CapabilityId[];
}

// ============================================
// SYSTEM CONFIGURATION
// ============================================

export interface SystemConfiguration {
  // Capabilities activas del usuario
  activeCapabilities: CapabilityId[];

  // Configuración resultante
  visibleModules: string[];
  moduleFeatures: Record<string, Record<string, FeatureState>>;
  requiredValidations: ValidationRule[];
  availableTutorials: string[];
  activeAchievements: string[];
  uiEffects: UIEffect[];

  // Metadata para debugging
  autoResolvedCapabilities: CapabilityId[];
  conflicts: string[];
}

// ============================================
// STORE STATE
// ============================================

export interface CapabilityProfile {
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  country: string;
  currency: string;

  // SIMPLIFIED: Solo capabilities activas (no interface compleja)
  activeCapabilities: CapabilityId[];

  // Infrastructure config
  businessStructure: 'single_location' | 'multi_location' | 'mobile';

  // Setup status
  setupCompleted: boolean;
  onboardingStep: number;
}

export interface UnifiedCapabilityState {
  profile: CapabilityProfile | null;
  configuration: SystemConfiguration | null;
  isLoading: boolean;

  // Actions
  initializeProfile: (data: Partial<CapabilityProfile>) => void;
  toggleCapability: (capabilityId: CapabilityId) => void;
  setBusinessStructure: (structure: CapabilityProfile['businessStructure']) => void;
  completeSetup: () => void;
  resetProfile: () => void;

  // Computed getters
  hasCapability: (capabilityId: CapabilityId) => boolean;
  isModuleVisible: (moduleId: string) => boolean;
  getModuleFeatures: (moduleId: string) => Record<string, FeatureState>;
}