/**
 * Staff Module - Hooks Index
 * 
 * Centralized export for all staff-related hooks.
 * Following screaming architecture - hooks live within the module.
 * 
 * @module staff/hooks
 */

// ============================================================================
// DATA HOOKS
// ============================================================================

/**
 * Main staff data hook - Auto-loads staff data from Supabase
 */
export { useStaffData, useStaffDataRange, useStaffWithLoader, usePerformanceAnalytics } from './useStaffData';

/**
 * Core staff management hook
 */
export { useStaff } from './useStaff';

/**
 * Employee management hook
 */
export { useEmployees } from './useEmployees';

// ============================================================================
// VALIDATION HOOKS
// ============================================================================

/**
 * Staff validation rules
 */
export { useStaffValidation } from './useStaffValidation';

/**
 * Employee validation rules
 */
export { useEmployeeValidation } from './useEmployeeValidation';

/**
 * Shift validation rules
 */
export { useShiftValidation } from './useShiftValidation';

// ============================================================================
// BUSINESS LOGIC HOOKS
// ============================================================================

/**
 * Staff policies and business rules
 */
export {
  useStaffPolicies,
  useStaffPolicy,
  useSystemStaffPolicies,
  useUpdateStaffPolicies,
  useToggleOvertime,
  useToggleCertificationTracking,
  useToggleShiftSwapApproval
} from './useStaffPolicies';

/**
 * Real-time labor cost calculations
 */
export { useRealTimeLaborCosts } from './useRealTimeLaborCosts';
