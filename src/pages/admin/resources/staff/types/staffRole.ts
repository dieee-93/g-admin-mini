// =============================================================================
// STAFF ROLE TYPES - Job Roles for Labor Costing
// =============================================================================
// These types represent JOB ROLES (e.g., "Cocinero", "Mesero") used for costing.
// NOT to be confused with SYSTEM ROLES (ADMIN, SUPERVISOR, etc.) used for access control.
//
// See: docs/product/COSTING_ARCHITECTURE.md (Sections 3 & 5)
// =============================================================================

import type { Database } from '@/lib/supabase/database.types';

// =============================================================================
// DATABASE TYPES (from Supabase)
// =============================================================================

export type StaffRoleRow = Database['public']['Tables']['staff_roles']['Row'];
export type StaffRoleInsert = Database['public']['Tables']['staff_roles']['Insert'];
export type StaffRoleUpdate = Database['public']['Tables']['staff_roles']['Update'];

// =============================================================================
// DOMAIN TYPES
// =============================================================================

/**
 * StaffRole: Job role for labor costing
 * 
 * Examples: "Cocinero", "Mesero", "Barbero", "Consultor"
 * 
 * NOT to be confused with SystemRole (ADMIN, SUPERVISOR, etc.) which controls
 * panel access permissions.
 */
export interface StaffRole {
  id: string;
  organization_id: string;
  
  // Identity
  name: string;                    // "Cocinero", "Mesero", "Barbero"
  department?: string | null;
  description?: string | null;
  
  // Costing
  default_hourly_rate?: number | null;  // Base hourly rate for this role
  loaded_factor: number;                 // Burden rate multiplier (default 1.0)
  
  // Calculated (not stored, computed on read)
  loaded_hourly_cost?: number;     // default_hourly_rate * loaded_factor
  
  // Metadata
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * StaffRole option for selectors (lightweight)
 */
export interface StaffRoleOption {
  id: string;
  name: string;
  department?: string | null;
  default_hourly_rate?: number | null;
  loaded_factor: number;
  loaded_hourly_cost: number;  // Calculated: rate * factor
}

// =============================================================================
// LABOR COSTING CONFIG (stored in staff_policies.labor_costing_config)
// =============================================================================

/**
 * Organization-level labor costing configuration
 */
export interface LaborCostingConfig {
  /** Default loaded factor for all roles (e.g., 1.325 = 32.5% burden) */
  default_loaded_factor: number;
  
  /** Override factors by employment type */
  factors_by_employment_type?: {
    full_time?: number;
    part_time?: number;
    contract?: number;
    intern?: number;
  };
  
  /** Decimal precision for calculations (default 4) */
  calculation_precision?: number;
  
  /** Round final cost to cents (default true) */
  round_to_cents?: boolean;
}

/** Default config values */
export const DEFAULT_LABOR_COSTING_CONFIG: LaborCostingConfig = {
  default_loaded_factor: 1.325,
  factors_by_employment_type: {
    full_time: 1.40,
    part_time: 1.25,
    contract: 1.10,
    intern: 1.05,
  },
  calculation_precision: 4,
  round_to_cents: true,
};

// =============================================================================
// STAFF ALLOCATION (for products)
// =============================================================================

/**
 * Staff allocation for a product
 * Defines how much staff time is needed to produce/deliver a product
 */
export interface StaffAllocation {
  id?: string;
  product_id: string;
  
  // Assignment (role required, employee optional for specific assignment)
  role_id: string;                 // FK to staff_roles
  employee_id?: string | null;     // FK to employees (optional, more specific)
  
  // Time requirements
  duration_minutes: number;
  count: number;                   // Number of people needed
  
  // Costing overrides (optional)
  hourly_rate?: number | null;            // Override the role's rate
  loaded_factor_override?: number | null; // Override the role's factor
  
  // Denormalized for display (populated on read)
  role_name?: string;
  employee_name?: string;
  
  // Calculated fields (computed, not stored)
  effective_hourly_rate?: number;  // Rate used (with overrides applied)
  loaded_hourly_cost?: number;     // effective_hourly_rate * loaded_factor
  total_hours?: number;            // duration_minutes / 60 * count
  total_cost?: number;             // total_hours * loaded_hourly_cost
}

// =============================================================================
// LABOR COST CALCULATION RESULTS
// =============================================================================

/**
 * Result of calculating labor cost for a set of allocations
 */
export interface LaborCostResult {
  /** Total labor cost (sum of all allocations) */
  total_cost: number;
  
  /** Total hours (sum of all allocations) */
  total_hours: number;
  
  /** Breakdown by allocation */
  breakdown: LaborCostBreakdownItem[];
}

/**
 * Individual item in labor cost breakdown
 */
export interface LaborCostBreakdownItem {
  allocation_id?: string;
  role_id: string;
  role_name: string;
  employee_id?: string;
  employee_name?: string;
  
  // Inputs
  count: number;
  duration_minutes: number;
  
  // Rates used
  hourly_rate: number;
  loaded_factor: number;
  loaded_hourly_cost: number;
  
  // Results
  hours: number;
  cost: number;
}

// =============================================================================
// FORM TYPES
// =============================================================================

/**
 * Form data for creating/editing a StaffRole
 */
export interface StaffRoleFormData {
  name: string;
  department?: string;
  description?: string;
  default_hourly_rate?: number;
  loaded_factor?: number;
  is_active?: boolean;
  sort_order?: number;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface StaffRoleFilters {
  department?: string;
  is_active?: boolean;
  search?: string;
}
