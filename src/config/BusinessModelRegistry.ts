/**
 * Business Model Registry - ATOMIC VERSION 2.0
 *
 * Define lo que el usuario ELIGE en el setup wizard.
 * Versión atómica sin redundancias estructurales.
 *
 * @version 2.0.0 - Atomic Capabilities
 * @see docs/ATOMIC_CAPABILITIES_DESIGN.md
 * @see docs/ATOMIC_CAPABILITIES_TECHNICAL_SPEC.md
 */

import type {
  BusinessCapabilityId,
  InfrastructureId,
  FeatureId,
  BusinessCapability,
  Infrastructure
} from './types';

// ============================================
// BUSINESS CAPABILITIES DEFINITIONS
// ============================================

const CAPABILITIES: Record<BusinessCapabilityId, BusinessCapability> = {
  'onsite_service': {
    id: 'onsite_service',
    name: 'Servicio en Local',
    description: 'Servicio/consumo en el local (mesas, cabinas)',
    icon: '🏪',
    type: 'fulfillment',

    activatesFeatures: [
      // SALES
      'sales_order_management',
      'sales_payment_processing',
      'sales_catalog_menu',
      'sales_pos_onsite',
      'sales_dine_in_orders',
      'sales_split_payment',
      'sales_tip_management',
      'sales_coupon_management',

      // OPERATIONS
      'operations_table_management',
      'operations_table_assignment',
      'operations_floor_plan_config',
      'operations_waitlist_management',

      // INVENTORY
      'inventory_stock_tracking',
      'inventory_supplier_management',
      'inventory_alert_system',
      'inventory_low_stock_auto_reorder',

      // STAFF - Meseros, cajeros, personal de atención
      'staff_employee_management',
      'staff_shift_management',
      'staff_time_tracking',
      'staff_performance_tracking'
    ],

    blockingRequirements: [
      'business_address_required',
      'operating_hours_required'
    ]
  },

  'pickup_orders': {
    id: 'pickup_orders',
    name: 'Retiro en Local',
    description: 'Cliente retira pedidos en local',
    icon: '🏪',
    type: 'fulfillment',

    activatesFeatures: [
      'sales_order_management',
      'sales_payment_processing',
      'sales_catalog_menu',
      'sales_pickup_orders',
      'sales_split_payment',
      'sales_coupon_management',
      'operations_pickup_scheduling',
      'operations_notification_system',
      'inventory_stock_tracking',
      'inventory_supplier_management',
      'inventory_alert_system',
      'inventory_low_stock_auto_reorder',

      // STAFF - Personal que prepara y entrega pedidos
      'staff_employee_management',
      'staff_shift_management',
      'staff_time_tracking'
    ],

    blockingRequirements: [
      'business_address_required',
      'pickup_hours_required'
    ]
  },

  'delivery_shipping': {
    id: 'delivery_shipping',
    name: 'Envío a Domicilio',
    description: 'Delivery/shipping de productos',
    icon: '🚚',
    type: 'fulfillment',

    activatesFeatures: [
      'sales_order_management',
      'sales_payment_processing',
      'sales_catalog_menu',
      'sales_delivery_orders',
      'sales_split_payment',
      'sales_coupon_management',
      'operations_delivery_zones',
      'operations_delivery_tracking',
      'operations_notification_system',
      'inventory_stock_tracking',
      'inventory_supplier_management',
      'inventory_alert_system',
      'inventory_low_stock_auto_reorder',

      // STAFF - Repartidores, preparadores, despachadores
      'staff_employee_management',
      'staff_shift_management',
      'staff_time_tracking',
      'staff_performance_tracking'
    ],

    blockingRequirements: [
      'delivery_zones_required',
      'delivery_fees_required'
    ]
  },

  'production_workflow': {
    id: 'production_workflow',
    name: 'Production Workflow',
    description: 'Businesses that require production/assembly/preparation workflows',
    icon: '👨‍🍳',
    type: 'production',

    activatesFeatures: [
      'production_bom_management',      // RENAMED from production_recipe_management
      'production_display_system',      // RENAMED from production_kitchen_display
      'production_order_queue',
      'production_capacity_planning',
      'inventory_purchase_orders',
      'inventory_supplier_management',
      'inventory_demand_forecasting',
      'inventory_batch_lot_tracking',
      'inventory_expiration_tracking',
      'operations_vendor_performance',

      // STAFF - Production staff, supervisors, operators
      'staff_employee_management',
      'staff_shift_management',
      'staff_time_tracking',
      'staff_performance_tracking',
      'staff_training_management'
    ],

    blockingRequirements: []
  },

  'appointment_based': {
    id: 'appointment_based',
    name: 'Servicios con Cita',
    description: 'Servicios que requieren cita previa',
    icon: '📅',
    type: 'service_mode',

    activatesFeatures: [
      'scheduling_appointment_booking',
      'scheduling_calendar_management',
      'scheduling_reminder_system',
      'scheduling_availability_rules',
      'customer_service_history',
      'customer_preference_tracking',
      'customer_online_reservation',
      'sales_package_management',

      // STAFF - Profesionales, técnicos, prestadores de servicio
      'staff_employee_management',
      'staff_shift_management',
      'staff_time_tracking',
      'staff_performance_tracking'
    ],

    blockingRequirements: [
      'service_types_required',
      'available_hours_required'
    ]
  },

  'online_store': { // ✅ RENAMED: async_operations → online_store
    id: 'online_store',
    name: 'Tienda Online',
    description: 'E-commerce 24/7 con fulfillment diferido',
    icon: '🌐',
    type: 'special_operation',

    activatesFeatures: [
      'sales_catalog_ecommerce',
      'sales_online_order_processing', // ✅ RENAMED: async → online
      'sales_online_payment_gateway',
      'sales_cart_management',
      'sales_checkout_process',
      'sales_coupon_management',
      'analytics_ecommerce_metrics',
      'analytics_conversion_tracking',
      'operations_deferred_fulfillment',
      'inventory_available_to_promise',
      'customer_online_accounts' // ✅ RENAMED: online_reservation → online_accounts
    ],

    blockingRequirements: [
      'website_url_required',
      'payment_methods_required'
    ]
  },

  'corporate_sales': {
    id: 'corporate_sales',
    name: 'Ventas Corporativas',
    description: 'Ventas B2B',
    icon: '🏢',
    type: 'special_operation',

    activatesFeatures: [
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
      'inventory_available_to_promise',
      'inventory_demand_forecasting',
      'operations_vendor_performance',

      // STAFF - Ejecutivos de cuenta, vendedores B2B
      'staff_employee_management',
      'staff_performance_tracking'
    ],

    blockingRequirements: [
      'business_license_required'
    ]
  },

  'mobile_operations': {
    id: 'mobile_operations',
    name: 'Operaciones Móviles',
    description: 'Food truck, servicios móviles',
    icon: '🚐',
    type: 'special_operation',

    activatesFeatures: [
      'mobile_location_tracking',
      'mobile_route_planning',
      'mobile_inventory_constraints',

      // STAFF - Conductor, asistente, personal móvil
      'staff_employee_management',
      'staff_shift_management',
      'staff_time_tracking',
      'staff_performance_tracking'
    ],

    blockingRequirements: [
      'mobile_equipment_required'
    ]
  }
};

// ============================================
// INFRASTRUCTURE DEFINITIONS
// ============================================

const INFRASTRUCTURE: Record<InfrastructureId, Infrastructure> = {
  'single_location': {
    id: 'single_location',
    name: 'Local Único',
    description: 'Opera desde una sola ubicación fija',
    icon: '🏪',
    type: 'infrastructure',

    conflicts: ['multi_location'], // ✅ FIXED: Solo conflicto con multi_location

    activatesFeatures: [],

    blockingRequirements: [
      'business_address_required'
    ]
  },

  'multi_location': {
    id: 'multi_location',
    name: 'Múltiples Locales',
    description: 'Cadena/franquicia con varias ubicaciones',
    icon: '🏢',
    type: 'infrastructure',

    conflicts: ['single_location'], // ✅ FIXED: Solo conflicto con single_location

    activatesFeatures: [
      'multisite_location_management',
      'multisite_centralized_inventory',
      'multisite_transfer_orders',
      'multisite_comparative_analytics',
      'multisite_configuration_per_site'
    ],

    blockingRequirements: [
      'primary_location_required',
      'additional_locations_required'
    ]
  },

  'mobile_business': {
    id: 'mobile_business',
    name: 'Negocio Móvil',
    description: 'Food truck, servicios móviles',
    icon: '🚐',
    type: 'infrastructure',

    conflicts: [], // ✅ FIXED: Sin conflictos - puede combinarse con todo

    activatesFeatures: [
      // Ya cubierto por 'mobile_operations' capability
    ],

    blockingRequirements: [
      'mobile_equipment_required'
    ]
  },

  'online_only': {
    id: 'online_only',
    name: 'Solo Online',
    description: 'Sin presencia física',
    icon: '🌐',
    type: 'infrastructure',

    conflicts: [],

    activatesFeatures: [],

    blockingRequirements: []
  }
};

// ============================================
// UNIFIED REGISTRY
// ============================================

export const BUSINESS_MODEL_REGISTRY = {
  capabilities: CAPABILITIES,
  infrastructure: INFRASTRUCTURE
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Obtiene una capability por ID
 */
export function getCapability(id: BusinessCapabilityId): BusinessCapability | undefined {
  return CAPABILITIES[id];
}

/**
 * Obtiene una infrastructure por ID
 */
export function getInfrastructure(id: InfrastructureId): Infrastructure | undefined {
  return INFRASTRUCTURE[id];
}

/**
 * Obtiene todas las capabilities
 */
export function getAllCapabilities(): BusinessCapability[] {
  return Object.values(CAPABILITIES);
}

/**
 * Obtiene todas las infrastructures
 */
export function getAllInfrastructures(): Infrastructure[] {
  return Object.values(INFRASTRUCTURE);
}

/**
 * Verifica conflicts de infrastructure
 *
 * @returns { valid: true } si no hay conflicts, { valid: false, conflicts: [...] } si hay
 */
export function checkInfrastructureConflicts(
  infrastructureId: InfrastructureId,
  activeInfrastructure: InfrastructureId[]
): { valid: boolean; conflicts: InfrastructureId[] } {
  const infrastructure = INFRASTRUCTURE[infrastructureId];

  if (!infrastructure.conflicts || infrastructure.conflicts.length === 0) {
    return { valid: true, conflicts: [] };
  }

  const conflicts = infrastructure.conflicts.filter(c => activeInfrastructure.includes(c));

  return {
    valid: conflicts.length === 0,
    conflicts
  };
}

/**
 * Obtiene todas las features activadas por user choices
 *
 * @param capabilities - Capabilities seleccionadas
 * @param infrastructure - Infrastructure seleccionada
 * @returns Array único de features (set union, sin duplicados)
 */
export function getActivatedFeatures(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
): FeatureId[] {
  const features = new Set<FeatureId>();

  // Features de capabilities
  capabilities.forEach(capId => {
    const capability = CAPABILITIES[capId];
    capability.activatesFeatures.forEach(f => features.add(f));
  });

  // Features de infrastructure
  infrastructure.forEach(infraId => {
    const infra = INFRASTRUCTURE[infraId];
    infra.activatesFeatures.forEach(f => features.add(f));
  });

  return Array.from(features);
}

/**
 * Obtiene todos los blocking requirements de las user choices
 */
export function getBlockingRequirements(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
): string[] {
  const requirements = new Set<string>();

  capabilities.forEach(capId => {
    const capability = CAPABILITIES[capId];
    if (capability.blockingRequirements) {
      capability.blockingRequirements.forEach(r => requirements.add(r));
    }
  });

  infrastructure.forEach(infraId => {
    const infra = INFRASTRUCTURE[infraId];
    if (infra.blockingRequirements) {
      infra.blockingRequirements.forEach(r => requirements.add(r));
    }
  });

  return Array.from(requirements);
}

// ============================================
// COMPATIBILITY EXPORTS (para migración gradual)
// ============================================

// Re-export types from ./types for convenience
export type { InfrastructureId, FeatureId, BusinessCapabilityId } from './types';

/**
 * @deprecated Usar BusinessCapabilityId en su lugar
 */
export type BusinessActivityId = BusinessCapabilityId;

/**
 * @deprecated Usar getCapability() en su lugar
 */
export function getActivity(id: BusinessCapabilityId) {
  return getCapability(id);
}

/**
 * @deprecated Usar getAllCapabilities() en su lugar
 */
export function getAllActivities() {
  return getAllCapabilities();
}
