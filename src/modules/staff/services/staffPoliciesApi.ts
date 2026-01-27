/**
 * STAFF POLICIES API SERVICE
 * 
 * Supabase API layer for staff_policies table
 * Handles CRUD operations for HR policies configuration
 * 
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface Department {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Position {
  id: string;
  name: string;
  department: string;
  level: 'junior' | 'mid' | 'senior' | 'lead';
  description?: string;
}

export type OvertimeCalculationPeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface StaffPolicies {
  id: string;
  
  // Organization
  departments: Department[];
  positions: Position[];
  default_hourly_rates: Record<string, number>;
  
  // Overtime
  overtime_enabled: boolean;
  overtime_threshold_hours: number;
  overtime_multiplier: number;
  overtime_calculation_period: OvertimeCalculationPeriod;
  
  // Breaks
  break_duration_minutes: number;
  break_frequency_hours: number;
  unpaid_break_threshold: number;
  
  // Shift Management
  shift_swap_advance_notice_hours: number;
  shift_swap_approval_required: boolean;
  shift_swap_limit_per_month: number;
  
  // Attendance
  attendance_grace_period_minutes: number;
  late_threshold_minutes: number;
  max_late_arrivals_per_month: number;
  max_unexcused_absences_per_month: number;
  time_clock_rounding_minutes: number;
  
  // Performance & Training
  performance_review_frequency_days: number;
  training_requirements: string[];
  certification_tracking_enabled: boolean;
  mandatory_certifications: string[];
  
  // Onboarding & Termination
  onboarding_checklist_required: boolean;
  onboarding_duration_days: number;
  termination_notice_period_days: number;
  exit_interview_required: boolean;
  
  // Metadata
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateStaffPoliciesInput {
  departments?: Department[];
  positions?: Position[];
  default_hourly_rates?: Record<string, number>;
  overtime_enabled?: boolean;
  overtime_threshold_hours?: number;
  overtime_multiplier?: number;
  overtime_calculation_period?: OvertimeCalculationPeriod;
  break_duration_minutes?: number;
  break_frequency_hours?: number;
  unpaid_break_threshold?: number;
  shift_swap_advance_notice_hours?: number;
  shift_swap_approval_required?: boolean;
  shift_swap_limit_per_month?: number;
  attendance_grace_period_minutes?: number;
  late_threshold_minutes?: number;
  max_late_arrivals_per_month?: number;
  max_unexcused_absences_per_month?: number;
  time_clock_rounding_minutes?: number;
  performance_review_frequency_days?: number;
  training_requirements?: string[];
  certification_tracking_enabled?: boolean;
  mandatory_certifications?: string[];
  onboarding_checklist_required?: boolean;
  onboarding_duration_days?: number;
  termination_notice_period_days?: number;
  exit_interview_required?: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all staff policies
 */
export async function fetchStaffPolicies(): Promise<StaffPolicies[]> {
  const { data, error } = await supabase
    .from('staff_policies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('StaffPoliciesApi', 'Failed to fetch staff policies', error);
    throw error;
  }

  return data;
}

/**
 * Fetch staff policies by ID
 */
export async function fetchStaffPoliciesById(id: string): Promise<StaffPolicies> {
  const { data, error } = await supabase
    .from('staff_policies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('StaffPoliciesApi', 'Failed to fetch staff policies by ID', { id, error });
    throw error;
  }

  return data;
}

/**
 * Fetch system staff policies (default configuration)
 */
export async function fetchSystemStaffPolicies(): Promise<StaffPolicies> {
  const { data, error } = await supabase
    .from('staff_policies')
    .select('*')
    .eq('is_system', true)
    .single();

  if (error) {
    logger.error('StaffPoliciesApi', 'Failed to fetch system staff policies', error);
    throw error;
  }

  return data;
}

/**
 * Update staff policies
 */
export async function updateStaffPolicies(
  id: string,
  updates: UpdateStaffPoliciesInput
): Promise<StaffPolicies> {
  const { data, error } = await supabase
    .from('staff_policies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('StaffPoliciesApi', 'Failed to update staff policies', { id, error });
    throw error;
  }

  logger.info('StaffPoliciesApi', 'Staff policies updated successfully', { id });
  return data;
}

/**
 * Toggle overtime enabled/disabled
 */
export async function toggleOvertime(id: string, enabled: boolean): Promise<StaffPolicies> {
  const { data, error } = await supabase
    .from('staff_policies')
    .update({ overtime_enabled: enabled })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('StaffPoliciesApi', 'Failed to toggle overtime', { id, enabled, error });
    throw error;
  }

  logger.info('StaffPoliciesApi', 'Overtime toggled successfully', { id, enabled });
  return data;
}

/**
 * Toggle certification tracking enabled/disabled
 */
export async function toggleCertificationTracking(
  id: string,
  enabled: boolean
): Promise<StaffPolicies> {
  const { data, error } = await supabase
    .from('staff_policies')
    .update({ certification_tracking_enabled: enabled })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('StaffPoliciesApi', 'Failed to toggle certification tracking', { id, enabled, error });
    throw error;
  }

  logger.info('StaffPoliciesApi', 'Certification tracking toggled successfully', { id, enabled });
  return data;
}

/**
 * Toggle shift swap approval requirement
 */
export async function toggleShiftSwapApproval(
  id: string,
  required: boolean
): Promise<StaffPolicies> {
  const { data, error } = await supabase
    .from('staff_policies')
    .update({ shift_swap_approval_required: required })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('StaffPoliciesApi', 'Failed to toggle shift swap approval', { id, required, error });
    throw error;
  }

  logger.info('StaffPoliciesApi', 'Shift swap approval toggled successfully', { id, required });
  return data;
}
