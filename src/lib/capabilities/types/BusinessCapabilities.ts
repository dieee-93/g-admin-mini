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
  | 'schedule_management'
  | 'approve_timeoff'
  | 'view_labor_costs'
  | 'asset_management'
  | 'fiscal_compliance'
  | 'invoice_management'
  | 'payroll_basic'
  | 'payroll_advanced'
  | 'financial_reporting'
  
  // Gamification capabilities
  | 'achievement_system'
  | 'milestone_tracking';

// Capability categorization
export type CapabilityCategory =
  | 'core'
  | 'products'
  | 'services'
  | 'operations'
  | 'finance'
  | 'infrastructure'
  | 'gamification';

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
    'schedule_management',
    'approve_timeoff',
    'view_labor_costs',
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
    'schedule_management',
    'approve_timeoff',
    'view_labor_costs',
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
    'schedule_management',
    'approve_timeoff',
    'view_labor_costs',
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
    'staff_scheduling',
    'schedule_management',
    'approve_timeoff',
    'view_labor_costs',
    'recurring_billing',
    'fiscal_compliance'
  ],
  education: [
    'customer_management',
    'sells_services',
    'sells_services_by_class',
    'class_scheduling',
    'staff_management',
    'staff_scheduling',
    'schedule_management',
    'approve_timeoff',
    'view_labor_costs',
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
    'staff_scheduling',
    'schedule_management',
    'approve_timeoff',
    'view_labor_costs',
    'invoice_management',
    'fiscal_compliance'
  ],
  custom: [] // User-defined capabilities
};

// LEGACY CODE REMOVED - Now using BUSINESS_MODULE_CONFIGURATIONS in businessCapabilitySystem.ts
// This old moduleCapabilities mapping has been superseded by the business capability system

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

/**
 * Metadata for each business capability - defines category and properties
 * This replaces hardcoded string matching in groupCapabilitiesByCategory
 */
export const capabilityMetadata: Record<BusinessCapability, {
  category: CapabilityCategory;
  description: string;
  dependencies?: BusinessCapability[];
  autoResolved?: boolean;
}> = {
  // ===== CORE =====
  'customer_management': { category: 'core', description: 'Customer data and relationship management', autoResolved: true },
  'dashboard_analytics': { category: 'core', description: 'Business dashboard and basic analytics', autoResolved: true },
  'system_settings': { category: 'core', description: 'System configuration and settings', autoResolved: true },

  // ===== PRODUCTS =====
  'sells_products': { category: 'products', description: 'Can sell physical products' },
  'sells_products_for_onsite_consumption': { category: 'products', description: 'Products consumed on-site (restaurant)' },
  'sells_products_for_pickup': { category: 'products', description: 'Products for customer pickup' },
  'sells_products_with_delivery': { category: 'products', description: 'Products with delivery service' },
  'sells_digital_products': { category: 'products', description: 'Digital products and downloads' },
  'inventory_tracking': { category: 'products', description: 'Track inventory levels', autoResolved: true },
  'product_management': { category: 'products', description: 'Manage product catalog', autoResolved: true },

  // ===== SERVICES =====
  'sells_services': { category: 'services', description: 'Can sell services' },
  'sells_services_by_appointment': { category: 'services', description: 'Appointment-based services' },
  'sells_services_by_class': { category: 'services', description: 'Class-based services (fitness, education)' },
  'sells_space_by_reservation': { category: 'services', description: 'Space rental and reservations' },
  'appointment_booking': { category: 'services', description: 'Online appointment booking system', autoResolved: true },
  'calendar_integration': { category: 'services', description: 'Calendar system integration', autoResolved: true },
  'class_scheduling': { category: 'services', description: 'Class and group event scheduling', autoResolved: true },
  'space_booking': { category: 'services', description: 'Space reservation management', autoResolved: true },

  // ===== OPERATIONS =====
  'manages_events': { category: 'operations', description: 'Event planning and management' },
  'hosts_private_events': { category: 'operations', description: 'Private event hosting' },
  'manages_offsite_catering': { category: 'operations', description: 'Off-site catering services' },
  'manages_recurrence': { category: 'operations', description: 'Recurring appointments and subscriptions' },
  'manages_rentals': { category: 'operations', description: 'Equipment or asset rentals' },
  'manages_memberships': { category: 'operations', description: 'Membership programs' },
  'manages_subscriptions': { category: 'operations', description: 'Subscription services' },
  'table_management': { category: 'operations', description: 'Restaurant table management', autoResolved: true },
  'pos_system': { category: 'operations', description: 'Point of sale system', autoResolved: true },
  'qr_ordering': { category: 'operations', description: 'QR code ordering system', autoResolved: true },
  'event_management': { category: 'operations', description: 'Event coordination and management', autoResolved: true },
  'delivery_zones': { category: 'operations', description: 'Delivery area management', autoResolved: true },
  'driver_management': { category: 'operations', description: 'Delivery driver coordination', autoResolved: true },
  'route_optimization': { category: 'operations', description: 'Delivery route planning', autoResolved: true },
  'supplier_management': { category: 'operations', description: 'Vendor and supplier relationships', autoResolved: true },
  'purchase_orders': { category: 'operations', description: 'Purchase order management', autoResolved: true },
  'staff_management': { category: 'operations', description: 'Employee management and profiles', autoResolved: true },
  'staff_scheduling': { category: 'operations', description: 'Employee schedule management', autoResolved: true },
  'schedule_management': { category: 'operations', description: 'General scheduling system', autoResolved: true },
  'approve_timeoff': { category: 'operations', description: 'Time off approval workflow', autoResolved: true },
  'view_labor_costs': { category: 'operations', description: 'Labor cost tracking and reporting', autoResolved: true },
  'asset_management': { category: 'operations', description: 'Asset and equipment tracking', autoResolved: true },

  // ===== FINANCE =====
  'payment_gateway': { category: 'finance', description: 'Payment processing integration', autoResolved: true },
  'recurring_billing': { category: 'finance', description: 'Automated recurring billing', autoResolved: true },
  'fiscal_compliance': { category: 'finance', description: 'Tax and regulatory compliance', autoResolved: true },
  'invoice_management': { category: 'finance', description: 'Invoice creation and management', autoResolved: true },
  'payroll_basic': { category: 'finance', description: 'Basic payroll processing', autoResolved: true },
  'payroll_advanced': { category: 'finance', description: 'Advanced payroll with benefits', autoResolved: true },
  'financial_reporting': { category: 'finance', description: 'Financial reports and analytics', autoResolved: true },

  // ===== INFRASTRUCTURE =====
  'has_online_store': { category: 'infrastructure', description: 'E-commerce website capability' },
  'is_b2b_focused': { category: 'infrastructure', description: 'Business-to-business operations' },
  'notifications_system': { category: 'infrastructure', description: 'Push notifications and alerts', autoResolved: true },
  'advanced_analytics': { category: 'infrastructure', description: 'Advanced business intelligence', autoResolved: true },

  // ===== GAMIFICATION =====
  'achievement_system': { category: 'gamification', description: 'Achievement and rewards system', autoResolved: true },
  'milestone_tracking': { category: 'gamification', description: 'Progress milestone tracking', autoResolved: true }
};