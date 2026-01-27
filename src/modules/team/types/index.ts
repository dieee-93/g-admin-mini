/**
 * TEAM MODULE - TYPES INDEX
 *
 * Central export point for all team-related types
 */

// =============================================================================
// JOB ROLE TYPES
// =============================================================================

export type {
  // Database types
  JobRoleRow,
  JobRoleInsert,
  JobRoleUpdate,

  // Domain types
  JobRole,
  JobRoleOption,
  LaborCostingConfig,
  TeamAllocation,
  LaborCostResult,
  LaborCostBreakdownItem,

  // Form types
  JobRoleFormData,

  // Filter types
  JobRoleFilters,

  // Employment & Experience (used by TeamMembers)
  EmploymentType,
  ExperienceLevel,
} from './jobRole';

export {
  DEFAULT_LABOR_COSTING_CONFIG,
  COMMON_ARGENTINE_CONVENTIONS,
  DEFAULT_LOADED_FACTOR_ARGENTINA,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPE_SHORT_LABELS,
  EMPLOYMENT_TYPE_LOADED_FACTORS,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_PRODUCTIVITY_FACTORS,
} from './jobRole';

// =============================================================================
// TEAM MEMBER TYPES
// =============================================================================

export type {
  // Database types
  TeamMemberRow,
  TeamMemberInsert,
  TeamMemberUpdate,

  // Domain types
  TeamMember,
  TeamMemberAvailability,
  TimeSlot,
  TeamMemberWithCosts,

  // Performance & Training
  PerformanceMetrics,
  TrainingRecord,

  // Form types
  TeamMemberFormData,

  // Filter types
  TeamMemberFilters,
} from './teamMember';
