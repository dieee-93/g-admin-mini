/**
 * Team Module - Hooks Index
 * 
 * Centralized export for all team-related hooks.
 * Following screaming architecture - hooks live within the module.
 * 
 * @module team/hooks
 */

// ============================================================================
// DATA HOOKS
// ============================================================================

/**
 * Main team data hook - Auto-loads team data from Supabase
 */
export { useTeamData, useTeamDataRange, useTeamWithLoader, usePerformanceAnalytics } from './useTeamData';

/**
 * Core team management hook
 */
export { useTeam } from './useTeam';

/**
 * TeamMember management hook
 */
export { useTeamMembers } from './useTeamMembers';

// ============================================================================
// VALIDATION HOOKS
// ============================================================================

/**
 * Team validation rules
 */
export { useTeamValidation } from './useTeamValidation';

/**
 * TeamMember validation rules
 */
export { useTeamMemberValidation } from './useTeamMemberValidation';

/**
 * Shift validation rules
 */
export { useShiftValidation } from './useShiftValidation';

// ============================================================================
// BUSINESS LOGIC HOOKS
// ============================================================================

/**
 * Team policies and business rules
 */
export {
  useTeamPolicies,
  useTeamPolicy,
  useSystemTeamPolicies,
  useUpdateTeamPolicies,
  useToggleOvertime,
  useToggleCertificationTracking,
  useToggleShiftSwapApproval
} from './useTeamPolicies';

/**
 * Real-time labor cost calculations
 */
export { useRealTimeLaborCosts } from './useRealTimeLaborCosts';
