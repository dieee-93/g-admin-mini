/**
 * Business Capabilities System for G-Admin v3.0
 * Modernized and extended from the original setup wizard capabilities
 * Supports dynamic module composition and capability-based rendering
 */

// Core business capability types - modernized from BusinessModelStep
export type BusinessCapability =
  // Core capabilities (always available)
  | 'customer_management'
  | 'dashboard_analytics'
  | 'system_settings'

  // Product sales capabilities
  | 'sells_products'
  | 'sells_products_for_onsite_consumption'
  | 'sells_products_for_pickup'
  | 'sells_products_with_delivery'
  | 'sells_digital_products'

  // Service capabilities
  | 'sells_services'
  | 'sells_services_by_appointment'
  | 'sells_services_by_class'
  | 'sells_space_by_reservation'

  // Event capabilities
  | 'manages_events'
  | 'hosts_private_events'
  | 'manages_offsite_catering'

  // Recurrence capabilities
  | 'manages_recurrence'
  | 'manages_rentals'
  | 'manages_memberships'
  | 'manages_subscriptions'

  // Infrastructure capabilities
  | 'has_online_store'
  | 'is_b2b_focused'

  // Technical capabilities (for module access)
  | 'inventory_tracking'
  | 'product_management'
  | 'table_management'
  | 'pos_system'
  | 'payment_gateway'
  | 'qr_ordering'
  | 'appointment_booking'
  | 'calendar_integration'
  | 'class_scheduling'
  | 'space_booking'
  | 'event_management'
  | 'delivery_zones'
  | 'driver_management'
  | 'route_optimization'
  | 'recurring_billing'
  | 'supplier_management'
  | 'purchase_orders'
  | 'staff_management'
  | 'staff_scheduling'
  | 'asset_management'
  | 'fiscal_compliance'
  | 'invoice_management'
  | 'payroll_basic'
  | 'payroll_advanced'
  | 'financial_reporting';

// Business model types from existing system
export type BusinessModel =
  | 'restaurant'
  | 'retail'
  | 'services'
  | 'ecommerce'
  | 'b2b'
  | 'subscription'
  | 'marketplace'
  | 'rental'
  | 'events'
  | 'fitness'
  | 'education'
  | 'healthcare'
  | 'custom';

// Business structure types
export type BusinessStructure = 'single_location' | 'multi_location' | 'mobile';

// Complete business capabilities interface (extends existing)
export interface BusinessCapabilities {
  // Main business offerings
  sells_products: boolean;
  sells_services: boolean;
  manages_events: boolean;
  manages_recurrence: boolean;

  // Product sub-capabilities
  sells_products_for_onsite_consumption: boolean;
  sells_products_for_pickup: boolean;
  sells_products_with_delivery: boolean;
  sells_digital_products: boolean;

  // Service sub-capabilities
  sells_services_by_appointment: boolean;
  sells_services_by_class: boolean;
  sells_space_by_reservation: boolean;

  // Event sub-capabilities
  hosts_private_events: boolean;
  manages_offsite_catering: boolean;

  // Recurrence sub-capabilities
  manages_rentals: boolean;
  manages_memberships: boolean;
  manages_subscriptions: boolean;

  // Infrastructure capabilities
  has_online_store: boolean;
  is_b2b_focused: boolean;
}

// Capability definition with module mapping
export interface CapabilityDefinition {
  id: BusinessCapability;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  keywords: string[];
  enabledFeatures: string[];
  requiredModules: string[]; // Modules needed for this capability
  optionalModules?: string[]; // Modules that enhance this capability
  dependencies?: BusinessCapability[]; // Other capabilities this depends on
}

// Business model to capability mapping
export const businessModelCapabilities: Record<BusinessModel, BusinessCapability[]> = {
  restaurant: [
    'customer_management',
    'sells_products',
    'sells_products_for_onsite_consumption',
    'table_management',
    'pos_system',
    'payment_gateway',
    'qr_ordering',
    'inventory_tracking',
    'staff_management',
    'staff_scheduling',
    'fiscal_compliance'
  ],
  retail: [
    'customer_management',
    'sells_products',
    'sells_products_for_onsite_consumption',
    'pos_system',
    'payment_gateway',
    'inventory_tracking',
    'product_management',
    'supplier_management',
    'fiscal_compliance'
  ],
  services: [
    'customer_management',
    'sells_services',
    'sells_services_by_appointment',
    'appointment_booking',
    'calendar_integration',
    'staff_management',
    'staff_scheduling',
    'invoice_management',
    'fiscal_compliance'
  ],
  ecommerce: [
    'customer_management',
    'sells_products',
    'has_online_store',
    'product_management',
    'inventory_tracking',
    'payment_gateway',
    'sells_products_with_delivery',
    'delivery_zones',
    'fiscal_compliance'
  ],
  b2b: [
    'customer_management',
    'is_b2b_focused',
    'sells_products',
    'supplier_management',
    'purchase_orders',
    'invoice_management',
    'inventory_tracking',
    'fiscal_compliance',
    'financial_reporting'
  ],
  subscription: [
    'customer_management',
    'manages_recurrence',
    'manages_subscriptions',
    'recurring_billing',
    'payment_gateway',
    'invoice_management',
    'fiscal_compliance'
  ],
  marketplace: [
    'customer_management',
    'sells_products',
    'has_online_store',
    'is_b2b_focused',
    'supplier_management',
    'payment_gateway',
    'inventory_tracking',
    'fiscal_compliance'
  ],
  rental: [
    'customer_management',
    'manages_recurrence',
    'manages_rentals',
    'asset_management',
    'appointment_booking',
    'recurring_billing',
    'fiscal_compliance'
  ],
  events: [
    'customer_management',
    'manages_events',
    'hosts_private_events',
    'event_management',
    'staff_scheduling',
    'inventory_tracking',
    'fiscal_compliance'
  ],
  fitness: [
    'customer_management',
    'sells_services',
    'sells_services_by_class',
    'manages_memberships',
    'class_scheduling',
    'staff_management',
    'recurring_billing',
    'fiscal_compliance'
  ],
  education: [
    'customer_management',
    'sells_services',
    'sells_services_by_class',
    'class_scheduling',
    'staff_management',
    'invoice_management',
    'fiscal_compliance'
  ],
  healthcare: [
    'customer_management',
    'sells_services',
    'sells_services_by_appointment',
    'appointment_booking',
    'calendar_integration',
    'staff_management',
    'invoice_management',
    'fiscal_compliance'
  ],
  custom: [] // User-defined capabilities
};

// Module to capability mapping (what capabilities each module provides/requires)
export const moduleCapabilities: Record<string, {
  provides: BusinessCapability[];
  requires: BusinessCapability[];
  enhances?: BusinessCapability[];
}> = {
  // Core modules
  'customers': {
    provides: ['customer_management'],
    requires: []
  },
  'dashboard': {
    provides: ['dashboard_analytics'],
    requires: []
  },
  'settings': {
    provides: ['system_settings'],
    requires: []
  },

  // Operations modules
  'sales': {
    provides: ['pos_system', 'payment_gateway', 'table_management', 'qr_ordering'],
    requires: ['customer_management', 'inventory_tracking'],
    enhances: ['sells_products_for_onsite_consumption']
  },
  'operations': {
    provides: ['table_management'],
    requires: ['pos_system'],
    enhances: ['sells_products_for_onsite_consumption']
  },
  'appointments': {
    provides: ['appointment_booking', 'calendar_integration'],
    requires: ['customer_management', 'staff_scheduling'],
    enhances: ['sells_services_by_appointment']
  },
  'classes': {
    provides: ['class_scheduling'],
    requires: ['staff_management', 'customer_management'],
    enhances: ['sells_services_by_class']
  },
  'online-store': {
    provides: ['has_online_store'],
    requires: ['product_management', 'payment_gateway', 'inventory_tracking'],
    enhances: ['sells_products']
  },
  'delivery': {
    provides: ['delivery_zones', 'driver_management', 'route_optimization'],
    requires: ['pos_system', 'customer_management'],
    enhances: ['sells_products_with_delivery']
  },

  // Supply chain modules
  'materials': {
    provides: ['inventory_tracking'],
    requires: []
  },
  'products': {
    provides: ['product_management'],
    requires: ['inventory_tracking']
  },
  'suppliers': {
    provides: ['supplier_management', 'purchase_orders'],
    requires: ['inventory_tracking'],
    enhances: ['is_b2b_focused']
  },

  // Resources modules
  'staff': {
    provides: ['staff_management'],
    requires: []
  },
  'scheduling': {
    provides: ['staff_scheduling'],
    requires: ['staff_management']
  },
  'assets': {
    provides: ['asset_management'],
    requires: []
  },

  // Finance modules
  'fiscal': {
    provides: ['fiscal_compliance'],
    requires: []
  },
  'accounting': {
    provides: ['invoice_management', 'financial_reporting'],
    requires: ['fiscal_compliance']
  },
  'payroll': {
    provides: ['payroll_basic', 'payroll_advanced'],
    requires: ['staff_management', 'fiscal_compliance']
  },
  'recurring-billing': {
    provides: ['recurring_billing'],
    requires: ['payment_gateway', 'customer_management', 'fiscal_compliance'],
    enhances: ['manages_subscriptions', 'manages_memberships']
  }
};

// Default capabilities (safe defaults)
export const defaultCapabilities: BusinessCapabilities = {
  sells_products: false,
  sells_services: false,
  manages_events: false,
  manages_recurrence: false,
  sells_products_for_onsite_consumption: false,
  sells_products_for_pickup: false,
  sells_products_with_delivery: false,
  sells_digital_products: false,
  sells_services_by_appointment: false,
  sells_services_by_class: false,
  sells_space_by_reservation: false,
  hosts_private_events: false,
  manages_offsite_catering: false,
  manages_rentals: false,
  manages_memberships: false,
  manages_subscriptions: false,
  has_online_store: false,
  is_b2b_focused: false,
};

// Utility types for capability checking
export type CapabilityCheck = BusinessCapability | BusinessCapability[];

export interface CapabilityContext {
  businessModel: BusinessModel;
  businessStructure: BusinessStructure[];
  activeCapabilities: BusinessCapability[];
  enabledModules: string[];
}