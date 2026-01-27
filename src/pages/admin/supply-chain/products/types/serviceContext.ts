/**
 * Service Context Types for Product Costing
 * 
 * Version: 1.0.0
 * Purpose: Types for delivery/service contexts that affect product costing
 * 
 * IMPORTANT DISTINCTION:
 * - ServiceContext (this file): For COSTING - service staff, additional costs per context
 * - FulfillmentPolicies (operations/fulfillment): For OPERATIONS - zones, fees, timing
 * 
 * See: docs/product/COSTING_ARCHITECTURE.md Section 9
 */

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * ServiceContext represents a delivery/fulfillment mode with its costing implications.
 * Each context can have different service staff requirements and additional costs.
 */
export interface ServiceContext {
  id: string;
  organization_id: string;
  
  // Identity
  key: ServiceContextKey;              // Unique key within org ('dine_in', 'takeaway', etc.)
  name: string;                        // Display name: "Salón", "Para llevar"
  description?: string;
  
  // Feature dependency
  requires_feature?: FeatureKey;       // Feature that must be active for this context
  
  // Service staff requirements (variable costs that depend on context)
  staff_requirements: ContextStaffRequirement[];
  
  // Additional costs per context
  additional_costs: ContextAdditionalCost[];
  
  // Configuration
  is_active: boolean;
  is_default: boolean;                 // Default context for new orders
  sort_order: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Predefined context keys (can be extended by organization)
 */
export type ServiceContextKey = 
  | 'dine_in'           // En salón / On-site
  | 'takeaway'          // Para llevar / Pickup
  | 'delivery_own'      // Delivery propio
  | 'delivery_platform' // Delivery por plataforma (Rappi, PedidosYa)
  | 'catering'          // Catering / eventos
  | 'drive_thru'        // Drive-thru
  | string;             // Custom contexts

/**
 * Feature keys that contexts can depend on
 */
export type FeatureKey = 
  | 'fulfillment_onsite'
  | 'fulfillment_pickup'
  | 'fulfillment_delivery'
  | 'fulfillment_catering'
  | string;

// =============================================================================
// STAFF REQUIREMENTS
// =============================================================================

/**
 * Staff requirement for a specific context.
 * Defines service staff (NOT production staff) needed for this delivery mode.
 */
export interface ContextStaffRequirement {
  id?: string;                         // UUID if stored in DB
  role_id: string;                     // FK to staff_roles
  role_name?: string;                  // Denormalized for display
  
  // Time calculation
  minutes_per_unit: number;            // Minutes required per unit
  per: StaffRequirementPer;            // What the "unit" is
  
  // Count (for team service scenarios)
  count: number;                       // Number of staff at this role (default 1)
  
  // Optional rate override
  hourly_rate_override?: number | null;
  loaded_factor_override?: number | null;
}

/**
 * What unit the staff time is calculated against
 */
export type StaffRequirementPer = 
  | 'order'            // Per order (e.g., waiter serves entire order)
  | 'item'             // Per item (e.g., barista makes each drink)
  | 'guest'            // Per guest/cover (e.g., fine dining)
  | 'table';           // Per table (e.g., cleaning)

// =============================================================================
// ADDITIONAL COSTS
// =============================================================================

/**
 * Additional cost that applies to a specific context.
 * These are non-labor costs like packaging, platform commissions, etc.
 */
export interface ContextAdditionalCost {
  id?: string;                         // UUID if stored in DB
  name: string;                        // "Packaging", "Platform Commission"
  type: AdditionalCostType;
  
  // Amount (one of these depending on type)
  amount?: number;                     // For 'fixed' type: fixed amount per order
  percentage?: number;                 // For 'percentage' type: % of order total
  amount_per_item?: number;            // For 'per_item' type: amount per item
  
  // Conditionals
  min_order_value?: number;            // Only apply if order >= this value
  max_amount?: number;                 // Cap the cost at this maximum
  
  // Configuration
  is_active: boolean;
  include_in_cost: boolean;            // Include in product cost calculation
  include_in_price: boolean;           // Include in price shown to customer
  
  // Category for reporting
  cost_category?: AdditionalCostCategory;
}

/**
 * Type of additional cost calculation
 */
export type AdditionalCostType = 
  | 'fixed'            // Fixed amount per order
  | 'percentage'       // Percentage of order total
  | 'per_item';        // Amount per item in order

/**
 * Category for additional costs (for reporting/analysis)
 */
export type AdditionalCostCategory =
  | 'packaging'        // Packaging materials
  | 'platform_fee'     // Platform/marketplace fees
  | 'commission'       // Sales commission
  | 'delivery_fee'     // Delivery-related fees
  | 'handling'         // Handling/preparation
  | 'other';

// =============================================================================
// CALCULATED TYPES
// =============================================================================

/**
 * Result of calculating context costs for an order
 */
export interface ContextCostResult {
  context_id: string;
  context_name: string;
  
  // Staff costs breakdown
  staff_costs: {
    role_id: string;
    role_name: string;
    minutes: number;
    hourly_rate: number;
    loaded_factor: number;
    cost: number;
  }[];
  total_staff_cost: number;
  
  // Additional costs breakdown
  additional_costs: {
    name: string;
    type: AdditionalCostType;
    cost: number;
  }[];
  total_additional_cost: number;
  
  // Grand total for context
  total_context_cost: number;
}

/**
 * Multi-context cost comparison for a product
 */
export interface ProductContextCostComparison {
  product_id: string;
  base_cost: number;                   // Materials + production labor
  
  contexts: {
    context_id: string;
    context_name: string;
    context_cost: number;              // Additional cost for this context
    total_cost: number;                // base_cost + context_cost
    suggested_price?: number;          // Based on margin targets
  }[];
}

// =============================================================================
// API/FORM TYPES
// =============================================================================

/**
 * Form data for creating/updating a service context
 */
export interface ServiceContextFormData {
  key: ServiceContextKey;
  name: string;
  description?: string;
  requires_feature?: FeatureKey;
  staff_requirements: ContextStaffRequirement[];
  additional_costs: ContextAdditionalCost[];
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
}

/**
 * Payload for creating a new service context
 */
export type ServiceContextCreate = Omit<ServiceContext, 'id' | 'organization_id' | 'created_at' | 'updated_at'>;

/**
 * Payload for updating a service context
 */
export type ServiceContextUpdate = Partial<ServiceContextCreate>;

// =============================================================================
// DEFAULT TEMPLATES
// =============================================================================

/**
 * Default service contexts for different business types
 */
export const DEFAULT_RESTAURANT_CONTEXTS: ServiceContextFormData[] = [
  {
    key: 'dine_in',
    name: 'Salón',
    description: 'Servicio en el local',
    requires_feature: 'fulfillment_onsite',
    staff_requirements: [
      {
        role_id: '', // To be filled with actual role_id
        role_name: 'Mesero',
        minutes_per_unit: 5,
        per: 'order',
        count: 1,
      }
    ],
    additional_costs: [],
    is_active: true,
    is_default: true,
    sort_order: 0,
  },
  {
    key: 'takeaway',
    name: 'Para llevar',
    description: 'Cliente retira en local',
    requires_feature: 'fulfillment_pickup',
    staff_requirements: [
      {
        role_id: '',
        role_name: 'Cajero',
        minutes_per_unit: 2,
        per: 'order',
        count: 1,
      }
    ],
    additional_costs: [
      {
        name: 'Packaging',
        type: 'fixed',
        amount: 0.50,
        is_active: true,
        include_in_cost: true,
        include_in_price: false,
        cost_category: 'packaging',
      }
    ],
    is_active: true,
    is_default: false,
    sort_order: 1,
  },
  {
    key: 'delivery_own',
    name: 'Delivery Propio',
    description: 'Entrega con repartidores propios',
    requires_feature: 'fulfillment_delivery',
    staff_requirements: [
      {
        role_id: '',
        role_name: 'Repartidor',
        minutes_per_unit: 20,
        per: 'order',
        count: 1,
      }
    ],
    additional_costs: [
      {
        name: 'Packaging Delivery',
        type: 'fixed',
        amount: 0.75,
        is_active: true,
        include_in_cost: true,
        include_in_price: false,
        cost_category: 'packaging',
      }
    ],
    is_active: true,
    is_default: false,
    sort_order: 2,
  },
  {
    key: 'delivery_platform',
    name: 'Delivery Plataforma',
    description: 'Delivery via PedidosYa, Rappi, etc.',
    requires_feature: 'fulfillment_delivery',
    staff_requirements: [], // No own staff - platform handles delivery
    additional_costs: [
      {
        name: 'Packaging Delivery',
        type: 'fixed',
        amount: 0.75,
        is_active: true,
        include_in_cost: true,
        include_in_price: false,
        cost_category: 'packaging',
      },
      {
        name: 'Comisión Plataforma',
        type: 'percentage',
        percentage: 0.25, // 25%
        is_active: true,
        include_in_cost: true,
        include_in_price: false,
        cost_category: 'platform_fee',
      }
    ],
    is_active: true,
    is_default: false,
    sort_order: 3,
  },
];

/**
 * Default contexts for retail businesses
 */
export const DEFAULT_RETAIL_CONTEXTS: ServiceContextFormData[] = [
  {
    key: 'in_store',
    name: 'En tienda',
    description: 'Compra en local',
    requires_feature: 'fulfillment_onsite',
    staff_requirements: [
      {
        role_id: '',
        role_name: 'Vendedor',
        minutes_per_unit: 3,
        per: 'order',
        count: 1,
      }
    ],
    additional_costs: [],
    is_active: true,
    is_default: true,
    sort_order: 0,
  },
  {
    key: 'ecommerce',
    name: 'E-commerce',
    description: 'Venta online',
    requires_feature: 'fulfillment_delivery',
    staff_requirements: [
      {
        role_id: '',
        role_name: 'Picker',
        minutes_per_unit: 2,
        per: 'item',
        count: 1,
      },
      {
        role_id: '',
        role_name: 'Packer',
        minutes_per_unit: 3,
        per: 'order',
        count: 1,
      }
    ],
    additional_costs: [
      {
        name: 'Packaging',
        type: 'per_item',
        amount_per_item: 0.30,
        is_active: true,
        include_in_cost: true,
        include_in_price: false,
        cost_category: 'packaging',
      }
    ],
    is_active: true,
    is_default: false,
    sort_order: 1,
  },
];

/**
 * Default contexts for service businesses (barbershop, salon, etc.)
 */
export const DEFAULT_SERVICE_CONTEXTS: ServiceContextFormData[] = [
  {
    key: 'on_site',
    name: 'En local',
    description: 'Servicio en el establecimiento',
    requires_feature: 'fulfillment_onsite',
    staff_requirements: [], // Staff is already in product.staff_allocations
    additional_costs: [],
    is_active: true,
    is_default: true,
    sort_order: 0,
  },
  {
    key: 'at_home',
    name: 'A domicilio',
    description: 'Servicio en domicilio del cliente',
    requires_feature: 'fulfillment_delivery',
    staff_requirements: [
      {
        role_id: '',
        role_name: 'Profesional',
        minutes_per_unit: 30, // Travel time
        per: 'order',
        count: 1,
      }
    ],
    additional_costs: [
      {
        name: 'Cargo por desplazamiento',
        type: 'fixed',
        amount: 10.00,
        is_active: true,
        include_in_cost: true,
        include_in_price: true,
        cost_category: 'delivery_fee',
      }
    ],
    is_active: true,
    is_default: false,
    sort_order: 1,
  },
];
