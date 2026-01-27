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
 * StaffRole / JobRole: Job role for labor costing (TEMPLATE/CATEGORY)
 *
 * Examples: "Cocinero", "Mesero", "Barbero", "Consultor"
 *
 * IMPORTANT: This represents a JOB ROLE TEMPLATE, not an individual team member.
 * Individual team member details (employment type, experience level, etc.) are
 * stored in the TeamMember entity.
 *
 * NOMENCLATURE:
 * - Code: StaffRole (DB compatibility) / JobRole (preferred alias)
 * - UI (Spanish): "Puesto de Trabajo"
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

  // Labor Category Information (Argentina specific - PHASE 1 - Added 2026-01-14)
  labor_category?: string | null;            // Categoría laboral según CCT (ej: "Cocinero 3ra categoría")
  applicable_convention?: string | null;     // CCT aplicable (ej: "CCT 130/75", "CCT 389/04")

  // Costing Defaults (used as baseline for employees assigned to this role)
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

  // Labor Category Information (Phase 1 - Argentina)
  labor_category?: string;
  applicable_convention?: string;

  default_hourly_rate?: number;
  loaded_factor?: number;
  is_active?: boolean;
  sort_order?: number;
}

// =============================================================================
// CONSTANTS AND HELPERS
// =============================================================================

/**
 * Common Argentine Collective Bargaining Agreements (CCT)
 * For autocomplete suggestions
 */
export const COMMON_ARGENTINE_CONVENTIONS = [
  'CCT 130/75 - Comercio',
  'CCT 389/04 - Gastronómicos',
  'CCT 125/90 - Panaderías',
  'CCT 260/94 - Hotelería',
  'CCT 547/08 - Servicios Privados',
  'CCT 406/05 - Sanidad',
] as const;

/**
 * Suggested loaded factor for Argentina (2026)
 *
 * This is a baseline suggestion. Actual factor depends on:
 * - Tipo de contratación del empleado (dependencia, monotributo, etc.)
 * - Contribuciones patronales: 18-20.4%
 * - ART (work risk insurance): 2-4%
 * - Seguro de vida: ~0.5%
 * - Otros costos laborales
 *
 * The loaded_factor stored in the role is just a DEFAULT.
 * Each employee can have their own factor based on their employment type.
 *
 * Sources:
 * - https://www.afip.gob.ar/relaciones-laborales/empleadores/aportes-y-contribuciones.asp
 * - https://navenegocios.ar/blog/cargas-sociales
 */
export const DEFAULT_LOADED_FACTOR_ARGENTINA = 1.40; // 40% adicional (baseline para empleado en blanco MiPyME)

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface StaffRoleFilters {
  department?: string;
  is_active?: boolean;
  search?: string;
  labor_category?: string;
  applicable_convention?: string;
}

// =============================================================================
// NOMENCLATURE ALIASES (New naming convention)
// =============================================================================

/**
 * JobRole: Preferred alias for StaffRole
 *
 * Use this in new code. StaffRole maintained for DB/API compatibility.
 */
export type JobRole = StaffRole;
export type JobRoleRow = StaffRoleRow;
export type JobRoleInsert = StaffRoleInsert;
export type JobRoleUpdate = StaffRoleUpdate;
export type JobRoleOption = StaffRoleOption;
export type JobRoleFormData = StaffRoleFormData;
export type JobRoleFilters = StaffRoleFilters;

// =============================================================================
// EMPLOYMENT TYPES (for TeamMembers - moved from StaffRole)
// =============================================================================

/**
 * Employment Type - Tipo de contratación para Argentina
 *
 * These apply to individual TEAM MEMBERS, not to job roles.
 */
export type EmploymentType =
  | 'full_time_employee'      // Relación dependencia - jornada completa
  | 'part_time_employee'      // Relación dependencia - jornada parcial
  | 'contractor_monotributo'  // Monotributista
  | 'contractor_responsable'  // Responsable Inscripto
  | 'intern'                  // Pasante
  | 'temporary'               // Temporario/eventual
  | 'informal';               // Trabajador informal (sin registrar)

/**
 * Experience Level - Nivel de experiencia
 *
 * These apply to individual TEAM MEMBERS, affects productivity estimations.
 */
export type ExperienceLevel =
  | 'trainee'      // 0-6 meses de experiencia
  | 'junior'       // 6-24 meses de experiencia
  | 'semi_senior'  // 2-5 años de experiencia
  | 'senior'       // 5-10 años de experiencia
  | 'expert';      // 10+ años de experiencia

/**
 * Labels for employment types (Spanish - Argentina)
 */
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time_employee: 'Empleado en Relación de Dependencia - Jornada Completa',
  part_time_employee: 'Empleado en Relación de Dependencia - Jornada Parcial',
  contractor_monotributo: 'Monotributista',
  contractor_responsable: 'Contratado - Responsable Inscripto',
  intern: 'Pasante / Aprendiz',
  temporary: 'Temporario / Eventual',
  informal: 'Trabajador Informal',
};

/**
 * Short labels for employment types
 */
export const EMPLOYMENT_TYPE_SHORT_LABELS: Record<EmploymentType, string> = {
  full_time_employee: 'Dep. Completa',
  part_time_employee: 'Dep. Parcial',
  contractor_monotributo: 'Monotributo',
  contractor_responsable: 'Responsable',
  intern: 'Pasante',
  temporary: 'Temporario',
  informal: 'Informal',
};

/**
 * Loaded factors by employment type for Argentina (2026)
 *
 * Based on:
 * - Contribuciones patronales: 18-20.4%
 * - ART (work risk insurance): 2-4%
 * - Seguro de vida: ~0.5%
 * - Otros costos laborales
 *
 * Sources:
 * - https://www.afip.gob.ar/relaciones-laborales/empleadores/aportes-y-contribuciones.asp
 * - https://navenegocios.ar/blog/cargas-sociales
 */
export const EMPLOYMENT_TYPE_LOADED_FACTORS: Record<EmploymentType, number> = {
  full_time_employee: 1.50,      // 50% adicional (20.4% contrib + ART + otros)
  part_time_employee: 1.40,      // 40% adicional (18% contrib MiPyME + ART + otros)
  contractor_monotributo: 1.10,  // 10% adicional (sin cargas, solo admin)
  contractor_responsable: 1.20,  // 20% adicional (sin cargas, pero más costos admin)
  intern: 1.05,                  // 5% adicional (cargas mínimas)
  temporary: 1.35,               // 35% adicional (cargas estándar)
  informal: 1.00,                // Sin cargas (cash)
};

/**
 * Labels for experience levels (Spanish)
 */
export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  trainee: 'Trainee / En Formación (0-6 meses)',
  junior: 'Junior (6 meses - 2 años)',
  semi_senior: 'Semi-Senior (2-5 años)',
  senior: 'Senior (5-10 años)',
  expert: 'Expert / Especialista (10+ años)',
};

/**
 * Productivity multipliers by experience level
 * Used for time estimations: actual_time = base_time / productivity_factor
 */
export const EXPERIENCE_PRODUCTIVITY_FACTORS: Record<ExperienceLevel, number> = {
  trainee: 0.5,      // 50% productivity (learning)
  junior: 0.7,       // 70% productivity
  semi_senior: 1.0,  // 100% baseline
  senior: 1.3,       // 130% productivity (experience)
  expert: 1.5,       // 150% productivity (mastery)
};
