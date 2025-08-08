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
