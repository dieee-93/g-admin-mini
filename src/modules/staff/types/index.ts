/**
 * STAFF MODULE - TYPES INDEX
 * 
 * Central export point for all staff-related types
 */

export type {
  // Database types
  StaffRoleRow,
  StaffRoleInsert,
  StaffRoleUpdate,
  
  // Domain types
  StaffRole,
  StaffRoleOption,
  LaborCostingConfig,
  StaffAllocation,
  LaborCostResult,
  LaborCostBreakdownItem,
  
  // Form types
  StaffRoleFormData,
  
  // Filter types
  StaffRoleFilters,
} from './staffRole';

export { DEFAULT_LABOR_COSTING_CONFIG } from './staffRole';
