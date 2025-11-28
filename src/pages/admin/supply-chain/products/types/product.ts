// ==========================================
// G-ADMIN PRODUCTS MODULE - PRODUCT INTELLIGENCE SYSTEM v1.0  
// Following Screaming Architecture Pattern
// Product Assembly Engine + Component Tracking + Cost Intelligence
// ==========================================

// ===== CORE PRODUCT TYPES =====

export interface Product {
  // Basic Information (database schema)
  id: string;
  name: string;
  unit?: string;
  type: ProductType;
  description?: string;
  is_published?: boolean; // TakeAway requirement: track published products
  created_at: string;
  updated_at: string;
}

export interface ProductWithIntelligence extends Product {
  // Intelligence Features (from database functions)
  cost: number;
  availability: number;
  components_count: number;
  
  // Calculated Fields
  can_produce: boolean;
  production_ready: boolean;
  cost_per_unit: number;
  
  // Components List
  components?: ProductComponent[];
}

export interface ProductComponent {
  id: string;
  product_id: string;
  item_id: string;
  quantity: number;
  
  // Enhanced with item information
  item_name?: string;
  item_unit?: string;
  item_cost?: number;
  item_stock?: number;
  availability_for_component?: number;
}

// ===== PRODUCT TYPES =====

export type ProductType = "ELABORATED" | "SERVICE" | "DIGITAL";

// ===== CRUD OPERATION TYPES =====

export interface CreateProductData {
  name: string;
  unit?: string;
  type: ProductType;
  description?: string;
}

export interface UpdateProductData {
  id: string;
  name?: string;
  unit?: string;
  type?: ProductType;
  description?: string;
  is_published?: boolean; // TakeAway requirement: toggle publish status
}

export interface AddComponentData {
  product_id: string;
  item_id: string;
  quantity: number;
}

// ===== API RESPONSE TYPES =====

export interface ProductsWithAvailabilityResponse {
  id: string;
  name: string;
  unit: string;
  type: string;
  description: string;
  cost: number;
  availability: number;
  components_count: number;
  created_at: string;
  updated_at: string;
}

// ===== UI STATE TYPES =====

export interface ProductFilter {
  type?: ProductType;
  availability?: "available" | "low_stock" | "out_of_stock";
}

export interface ProductSort {
  field: "name" | "cost" | "availability" | "created_at";
  direction: "asc" | "desc";
}

// ===== CONSTANTS =====

export const PRODUCT_TYPES: { label: string; value: ProductType }[] = [
  { label: "Producto Elaborado", value: "ELABORATED" },
  { label: "Servicio", value: "SERVICE" },
  { label: "Producto Digital", value: "DIGITAL" }
];

// ==========================================
// FLEXIBLE PRODUCT CONFIGURATION SYSTEM v2.0
// Following SESSION_PLAN_PRODUCTS_COMPLETE.md
// ==========================================

/**
 * Product Category - Flexible classification system
 * Supports 8+ business models
 */
export type ProductCategory =
  | "FOOD"                      // Food items (burgers, pizza)
  | "BEVERAGE"                  // Drinks
  | "RETAIL_GOODS"              // Resale products
  | "BEAUTY_SERVICE"            // Beauty services (haircut, massage)
  | "REPAIR_SERVICE"            // Repair services (car, electronics)
  | "PROFESSIONAL_SERVICE"      // Professional services (consulting)
  | "EVENT"                     // Events (webinars, conferences)
  | "COURSE"                    // Courses and training
  | "DIGITAL_PRODUCT"           // Digital products (ebooks, downloads)
  | "RENTAL"                    // Rental items
  | "CUSTOM";                   // Custom product type

/**
 * Product Configuration - Flexible product behavior
 * Controls which modules and features are needed
 */
export interface ProductConfig {
  // ===== MATERIALS (BOM) =====
  has_components: boolean;              // Does this product use materials?
  components_required: boolean;         // Are components mandatory?
  allow_dynamic_materials: boolean;     // Can add materials during service?

  // ===== PRODUCTION =====
  requires_production: boolean;         // Needs Production module?
  production_type?: 'kitchen' | 'assembly' | 'preparation' | 'none';

  // ===== STAFF =====
  requires_staff: boolean;              // Needs staff allocation?
  staff_allocation?: StaffAllocation[]; // Staff requirements

  // ===== TIME =====
  has_duration: boolean;                // Has fixed duration?
  duration_minutes?: number;            // Duration in minutes

  // ===== BOOKING =====
  requires_booking: boolean;            // Needs Scheduling module?
  booking_window_days?: number;         // Min days in advance
  concurrent_capacity?: number;         // Max simultaneous bookings

  // ===== DIGITAL =====
  is_digital: boolean;                  // Has digital component?
  digital_delivery?: DigitalDeliveryConfig;

  // ===== RETAIL =====
  is_retail: boolean;                   // Is resale product?
  retail_details?: RetailConfig;
}

/**
 * Staff Allocation - Staff requirements for product/service
 */
export interface StaffAllocation {
  role: string;                 // Role ID from Staff module
  count: number;                // Number of staff needed
  duration_minutes: number;     // Time required
  is_concurrent?: boolean;      // Can work concurrently?
}

/**
 * Digital Delivery Configuration
 */
export interface DigitalDeliveryConfig {
  delivery_type: 'download' | 'streaming' | 'event' | 'course' | 'access';
  access_url?: string;          // URL for access
  file_url?: string;            // Download URL
  duration_minutes?: number;    // Event/course duration
  max_participants?: number;    // Max attendees
  platform?: string;            // Platform (Zoom, etc.)
}

/**
 * Retail Configuration
 */
export interface RetailConfig {
  sku: string;                  // Stock Keeping Unit
  barcode?: string;             // Product barcode
  warranty_months?: number;     // Warranty period
  supplier_id?: string;         // Supplier reference
  brand?: string;               // Product brand
  model?: string;               // Product model
}

/**
 * Product Pricing - Structured pricing information
 */
export interface ProductPricing {
  base_cost: number;            // Cost of materials
  labor_cost?: number;          // Cost of staff time
  overhead_cost?: number;       // Indirect costs
  price: number;                // Sale price
  profit_margin: number;        // Calculated margin %
}

/**
 * Product Availability - Stock and availability status
 */
export interface ProductAvailability {
  status: AvailabilityStatus;
  stock_level?: number;         // Current stock
  can_produce_quantity?: number; // Max producible
  next_available_slot?: Date;   // Next booking slot
}

export type AvailabilityStatus =
  | 'available'
  | 'low_stock'
  | 'out_of_stock'
  | 'unavailable'
  | 'by_appointment'
  | 'scheduled';

/**
 * Product with Flexible Configuration
 * Extends base Product with new flexible system
 */
export interface ProductWithConfig extends Product {
  category: ProductCategory;
  config: ProductConfig;
  optional_components?: ProductComponent[];
  pricing: ProductPricing;
  availability: ProductAvailability;
}

// ===== CATEGORY CONSTANTS =====

export const PRODUCT_CATEGORIES: { label: string; value: ProductCategory; description: string }[] = [
  { label: 'Comida', value: 'FOOD', description: 'Productos alimenticios elaborados' },
  { label: 'Bebida', value: 'BEVERAGE', description: 'Bebidas y líquidos' },
  { label: 'Retail', value: 'RETAIL_GOODS', description: 'Productos de reventa' },
  { label: 'Servicio de Belleza', value: 'BEAUTY_SERVICE', description: 'Servicios estéticos' },
  { label: 'Servicio de Reparación', value: 'REPAIR_SERVICE', description: 'Servicios de mantenimiento' },
  { label: 'Servicio Profesional', value: 'PROFESSIONAL_SERVICE', description: 'Consultoría y servicios' },
  { label: 'Evento', value: 'EVENT', description: 'Eventos y conferencias' },
  { label: 'Curso', value: 'COURSE', description: 'Capacitación y formación' },
  { label: 'Producto Digital', value: 'DIGITAL_PRODUCT', description: 'Productos descargables' },
  { label: 'Alquiler', value: 'RENTAL', description: 'Productos en alquiler' },
  { label: 'Personalizado', value: 'CUSTOM', description: 'Tipo personalizado' },
];
