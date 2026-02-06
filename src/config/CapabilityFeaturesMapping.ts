/**
 * CAPABILITY → FEATURES MAPPING
 *
 * Mapeo declarativo simple: User capability → Active features
 * Reemplaza lógica compleja de FeatureActivationEngine.
 *
 * ARCHITECTURE (validated with industry research):
 * - Salesforce: Edition (product) → Features
 * - HubSpot: Hub (product) → Features
 * - VS Code: Extension (capability) → Contribution Points (features)
 * - Odoo: App (capability) → Modules + Features
 *
 * @see docs/plans/2026-01-19-capabilities-architecture-simplification.md
 * @see docs/plans/2026-01-19-architecture-validation-report.md
 * @version 2.0.0 - Simplified (no complex logic, just flat mapping)
 * @date 2026-01-19
 */

import type { BusinessCapabilityId, FeatureId } from './types';

/**
 * CAPABILITY_FEATURES
 *
 * Mapeo declarativo: Capability → Features activadas
 * Simple flat map - sin lógica condicional compleja.
 *
 * USAGE:
 * ```typescript
 * const userCapabilities = ['physical_products', 'onsite_service'];
 * const activeFeatures = userCapabilities.flatMap(
 *   cap => CAPABILITY_FEATURES[cap] || []
 * );
 * // Result: Array of all features (deduplicated by Set later)
 * ```
 *
 * @version 2.0.0
 */
export const CAPABILITY_FEATURES: Readonly<Record<BusinessCapabilityId, readonly FeatureId[]>> = {
  // ============================================
  // CORE BUSINESS MODELS
  // ============================================

  'physical_products': [
    // Production
    'production_bom_management',
    'production_display_system',
    'production_order_queue',
    'production_capacity_planning',

    // Inventory
    'inventory_stock_tracking',
    'inventory_alert_system',
    'inventory_purchase_orders',
    'inventory_supplier_management',
    'inventory_low_stock_auto_reorder',
    'inventory_sku_management',
    'inventory_barcode_scanning',
    'inventory_multi_unit_tracking',

    // Products
    'products_recipe_management',
    'products_catalog_menu',
    'products_cost_intelligence',
    'products_availability_calculation',

    // Sales
    'sales_order_management',
    'sales_payment_processing'
  ],

  'professional_services': [
    // Scheduling
    'scheduling_appointment_booking',
    'scheduling_calendar_management',
    'scheduling_reminder_system',
    'scheduling_availability_rules',

    // Production (service "recipes")
    'production_bom_management',
    'production_order_queue',

    // Customer
    'customer_service_history',
    'customer_preference_tracking',

    // Sales
    'sales_order_management',
    'sales_payment_processing',
    'sales_package_management',

    // Products
    'products_package_management',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking',
    'staff_labor_cost_tracking'
  ],

  // ============================================
  // FULFILLMENT METHODS
  // ============================================

  'onsite_service': [
    // Sales
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_pos_onsite',
    'sales_dine_in_orders',
    'sales_split_payment',
    'sales_tip_management',
    'sales_coupon_management',

    // Products
    'products_catalog_menu',
    'products_recipe_management',

    // Operations
    'operations_table_management',
    'operations_table_assignment',
    'operations_floor_plan_config',
    'operations_waitlist_management',
    'operations_bill_splitting',

    // Inventory
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  'pickup_orders': [
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_pickup_orders',
    'sales_split_payment',
    'sales_coupon_management',

    // Products
    'products_catalog_menu',
    'products_recipe_management',

    'operations_pickup_scheduling',
    'operations_notification_system',
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking'
  ],

  'delivery_shipping': [
    'sales_order_management',
    'sales_payment_processing',
    'sales_catalog_menu',
    'sales_delivery_orders',
    'sales_split_payment',
    'sales_coupon_management',

    // Products
    'products_catalog_menu',
    'products_recipe_management',

    'operations_delivery_zones',
    'operations_delivery_tracking',
    'operations_notification_system',
    'inventory_stock_tracking',
    'inventory_supplier_management',
    'inventory_alert_system',
    'inventory_low_stock_auto_reorder',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  // ============================================
  // SPECIAL OPERATIONS
  // ============================================

  'async_operations': [
    'sales_catalog_ecommerce',
    'sales_online_order_processing',
    'sales_online_payment_gateway',
    'sales_cart_management',
    'sales_checkout_process',
    'sales_coupon_management',

    // Products
    'products_catalog_ecommerce',
    'products_availability_calculation',

    'analytics_ecommerce_metrics',
    'analytics_conversion_tracking',
    'operations_deferred_fulfillment',
    'inventory_available_to_promise',
    'customer_online_accounts'
  ],

  'corporate_sales': [
    'finance_corporate_accounts',
    'finance_credit_management',
    'finance_invoice_scheduling',
    'finance_payment_terms',
    'sales_contract_management',
    'sales_tiered_pricing',
    'sales_approval_workflows',
    'sales_quote_to_order',
    'sales_bulk_pricing',
    'sales_quote_generation',

    // Products
    'products_catalog_ecommerce',
    'products_cost_intelligence',

    'inventory_available_to_promise',
    'inventory_demand_forecasting',
    'operations_vendor_performance',

    // Staff
    'staff_employee_management',
    'staff_performance_tracking'
  ],

  'mobile_operations': [
    'mobile_location_tracking',
    'mobile_route_planning',
    'mobile_inventory_constraints',

    // Products
    'products_catalog_menu',

    // Staff
    'staff_employee_management',
    'staff_shift_management',
    'staff_time_tracking',
    'staff_performance_tracking'
  ],

  'asset_rental': [
    'rental_item_management',
    'rental_booking_calendar',
    'rental_availability_tracking',
    'rental_pricing_by_duration',
    'rental_late_fees',

    // Customer
    'customer_service_history',
    'customer_preference_tracking'
  ],

  'membership_subscriptions': [
    'membership_subscription_plans',
    'membership_recurring_billing',
    'membership_access_control',
    'membership_usage_tracking',
    'membership_benefits_management',

    // Customer
    'customer_service_history',
    'customer_preference_tracking',
    'customer_loyalty_program',
    'customer_online_accounts',

    // Finance
    'finance_credit_management',
    'finance_invoice_scheduling',
    'finance_payment_terms'
  ],

  'digital_products': [
    'digital_file_delivery',
    'digital_license_management',
    'digital_download_tracking',
    'digital_version_control',

    // Online Store
    'sales_catalog_ecommerce',
    'sales_online_order_processing',
    'sales_online_payment_gateway',
    'sales_cart_management',

    // Analytics
    'analytics_ecommerce_metrics',
    'analytics_conversion_tracking'
  ]
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get features for a list of capabilities
 * Deduplicates automatically using Set
 *
 * @example
 * const features = getFeaturesFromCapabilities(['physical_products', 'onsite_service']);
 * // Returns: ['production_bom_management', 'inventory_stock_tracking', ...]
 */
export function getFeaturesFromCapabilities(
  capabilities: BusinessCapabilityId[]
): FeatureId[] {
  const features = capabilities.flatMap(
    capability => CAPABILITY_FEATURES[capability] || []
  );

  // Deduplicate (many capabilities share features like 'inventory_stock_tracking')
  return Array.from(new Set(features));
}

/**
 * Get all unique features across all capabilities
 */
export function getAllFeatures(): FeatureId[] {
  const allFeatures = Object.values(CAPABILITY_FEATURES).flat();
  return Array.from(new Set(allFeatures));
}

/**
 * Get capabilities that activate a specific feature
 */
export function getCapabilitiesForFeature(
  featureId: FeatureId
): BusinessCapabilityId[] {
  return (Object.keys(CAPABILITY_FEATURES) as BusinessCapabilityId[]).filter(
    capability => CAPABILITY_FEATURES[capability].includes(featureId)
  );
}

// ============================================
// STATISTICS
// ============================================

export const MAPPING_STATS = {
  /** Total capabilities */
  TOTAL_CAPABILITIES: Object.keys(CAPABILITY_FEATURES).length,

  /** Total unique features */
  TOTAL_FEATURES: getAllFeatures().length,

  /** Average features per capability */
  AVG_FEATURES_PER_CAPABILITY: Math.round(
    getAllFeatures().length / Object.keys(CAPABILITY_FEATURES).length
  ),
} as const;

// ============================================
// EXPORTS
// ============================================

export default {
  CAPABILITY_FEATURES,
  getFeaturesFromCapabilities,
  getAllFeatures,
  getCapabilitiesForFeature,
  MAPPING_STATS,
};
