// =============================================================================
// TEAM MEMBER TYPES - Individual Team Members
// =============================================================================
// These types represent individual people (team members) who are assigned to job roles.
// Each team member has specific employment details, experience level, and rates.
//
// NOMENCLATURE:
// - Code: TeamMember
// - UI (Spanish): "Miembro del Equipo" / "Personal"
// =============================================================================

import type { Database } from '@/lib/supabase/database.types';
import type { EmploymentType, ExperienceLevel } from './jobRole';

// =============================================================================
// DATABASE TYPES (from Supabase)
// =============================================================================

export type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
export type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
export type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

// =============================================================================
// DOMAIN TYPES
// =============================================================================

/**
 * TeamMember: Individual person on the team
 *
 * Represents a specific person (teamMember, contractor, intern, etc.)
 * who is assigned to a job role and performs work.
 */
export interface TeamMember {
  id: string;
  organization_id: string;
  team_member_id: string; // Human-readable ID (TM001, EMP001, etc.)

  // Basic Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;

  // Job Assignment (NEW - Phase 1)
  job_role_id?: string;          // FK to job_roles (job role template)
  job_role_name?: string;        // Denormalized for display

  // Employment Details
  position: string;              // Legacy: use job_role instead
  department: string;
  hire_date: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave';

  // Employment Type (NEW - Argentina specific - Phase 1)
  employment_type: EmploymentType;

  // Experience Level (NEW - Phase 1)
  experience_level?: ExperienceLevel;

  // Security & Access (System Roles - NOT job roles)
  role: 'admin' | 'manager' | 'supervisor' | 'teamMember';
  permissions: string[];
  last_login?: string;

  // Performance Data
  performance_score?: number;
  goals_completed?: number;
  total_goals?: number;

  // Training Data
  certifications?: string[];
  training_completed?: number;
  training_hours?: number;

  // Scheduling Data
  availability?: TeamMemberAvailability;

  // Location Data (Multi-Location Support)
  home_location_id?: string;        // Primary location where team member works
  can_work_multiple_locations: boolean;

  // Compensation (Only visible to HR/Admin)
  salary?: number;
  hourly_rate?: number;
  loaded_factor_override?: number;  // NEW - Phase 1: Override loaded factor
  social_security?: string;         // Masked in UI

  // Argentina Context - Fiscal Data (NEW - Phase 1)
  cuit_cuil?: string;                // CUIT/CUIL (formato: XX-XXXXXXXX-X)
  afip_category?: string;            // Categoría AFIP (monotributo A-K)
  invoice_required?: boolean;        // Requiere factura mensual (contratistas)
  daily_cash_rate?: number;          // For informal workers
  track_payments?: boolean;          // If false, only tracks presence not payments

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * TeamMember availability (for scheduling)
 */
export interface TeamMemberAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

/**
 * Time slot for availability
 */
export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

// =============================================================================
// PERFORMANCE & TRAINING
// =============================================================================

/**
 * Performance metrics for a team member
 */
export interface PerformanceMetrics {
  team_member_id: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  score: number; // 1-100
  productivity: number;
  quality: number;
  attendance: number;
  goals_met: number;
  total_goals: number;
  feedback?: string;
  created_at: string;
}

/**
 * Training record for a team member
 */
export interface TrainingRecord {
  id: string;
  team_member_id: string;
  course_name: string;
  course_type: 'safety' | 'skills' | 'compliance' | 'leadership';
  status: 'in_progress' | 'completed' | 'expired' | 'failed';
  start_date: string;
  completion_date?: string;
  expiry_date?: string;
  score?: number;
  certificate_url?: string;
  hours: number;
  instructor?: string;
  created_at: string;
}

// =============================================================================
// FORM TYPES
// =============================================================================

/**
 * Form data for creating/editing a TeamMember
 */
export interface TeamMemberFormData {
  // Basic info
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;

  // Job assignment
  job_role_id?: string;
  department: string;
  hire_date: string;

  // Employment
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  employment_type: EmploymentType;
  experience_level?: ExperienceLevel;

  // Compensation
  hourly_rate?: number;
  salary?: number;
  loaded_factor_override?: number;

  // Argentina fiscal
  cuit_cuil?: string;
  afip_category?: string;
  invoice_required?: boolean;

  // Location
  home_location_id?: string;
  can_work_multiple_locations?: boolean;

  // Availability
  availability?: TeamMemberAvailability;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface TeamMemberFilters {
  department?: string;
  employment_status?: 'active' | 'inactive' | 'terminated' | 'on_leave';
  employment_type?: EmploymentType;
  experience_level?: ExperienceLevel;
  job_role_id?: string;
  home_location_id?: string;
  search?: string;
}

// =============================================================================
// CALCULATED TYPES (with labor costing)
// =============================================================================

/**
 * TeamMember with calculated labor cost fields
 * (populated from team_members_with_calculations view)
 */
export interface TeamMemberWithCosts extends TeamMember {
  // From view
  effective_loaded_factor: number;     // Calculated based on priority
  loaded_hourly_cost: number;          // hourly_rate * effective_loaded_factor
  productivity_factor: number;         // Based on experience_level
  productivity_adjusted_cost: number;  // Cost adjusted by productivity
}
