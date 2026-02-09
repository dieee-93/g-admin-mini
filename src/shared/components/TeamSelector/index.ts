/**
 * TEAM SELECTOR - Barrel Export
 * 
 * Reusable component for assigning team members to tasks across modules.
 */

export { TeamSelector } from './TeamSelector';
export type {
  TeamSelectorProps,
  TeamAssignment,
  TeamRoleOption,
  EmployeeOption
} from './types';

// Deprecated aliases for backward compatibility
export { TeamSelector as StaffSelector } from './TeamSelector';
export type {
  TeamSelectorProps as StaffSelectorProps,
  TeamAssignment as StaffAssignment,
  TeamRoleOption as StaffRoleOption
} from './types';
