/**
 * PERMISSIONS MODULE
 *
 * Centralized exports for permission system
 * Provides both client-side (usePermissions) and server-side (servicePermissions) validation
 */

// Service Layer Permissions
export {
  // Validation Functions
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireModuleAccess,
  requireLocationAccess,
  getAccessibleLocationIds,

  // Error Classes
  PermissionDeniedError,
  LocationAccessError,

  // Type Guards
  isPermissionDeniedError,
  isLocationAccessError,

  // Types
  type UserWithLocation,
  type PermissionAction,
} from './servicePermissions';

// Re-export from PermissionsRegistry for convenience
export {
  type Permission,
  type ResourcePermissions,
  ROLE_PERMISSIONS,
  hasPermission,
  getResourcePermissions,
  canAccessModule,
  getAccessibleModules,
  isRoleHigherOrEqual,
  getMinimumRoleForModule,
} from '@/config/PermissionsRegistry';
