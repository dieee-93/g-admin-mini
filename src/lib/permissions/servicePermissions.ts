/**
 * SERVICE LAYER PERMISSIONS
 *
 * Permission validation helpers for service/API layer
 * Provides backend-first security by validating permissions before database operations
 *
 * USAGE:
 * ```typescript
 * import { requirePermission, requirePermissions } from '@/lib/permissions/servicePermissions';
 *
 * export const createSale = async (data: Sale, user: AuthUser) => {
 *   // Validate permission before proceeding
 *   requirePermission(user, 'sales', 'create');
 *
 *   // Proceed with operation
 *   return supabase.from('sales').insert(data);
 * };
 * ```
 *
 * INTEGRATION:
 * - Works with PermissionsRegistry for permission checks
 * - Throws typed errors that can be caught by error handlers
 * - Supports location-based filtering for multi-location setups
 */

import type { AuthUser } from '@/contexts/AuthContext';
import type { ModuleName } from '@/contexts/AuthContext';
import {
  type PermissionAction,
  hasPermission,
  canAccessModule as checkModuleAccess,
} from '@/config/PermissionsRegistry';
import { logger } from '@/lib/logging';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Custom error for permission violations
 * Can be caught and handled specifically in error boundaries
 */
export class PermissionDeniedError extends Error {
  constructor(
    public resource: ModuleName,
    public action: PermissionAction,
    public userId?: string,
    public reason?: string
  ) {
    super(
      `Permission denied: User ${userId || 'unknown'} cannot perform '${action}' on '${resource}'${
        reason ? ` (${reason})` : ''
      }`
    );
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Custom error for location-based access violations
 */
export class LocationAccessError extends Error {
  constructor(
    public userId: string,
    public attemptedLocationId: string,
    public allowedLocationIds: string[]
  ) {
    super(
      `Location access denied: User ${userId} cannot access location ${attemptedLocationId}. ` +
        `Allowed locations: ${allowedLocationIds.join(', ')}`
    );
    this.name = 'LocationAccessError';
  }
}

// ============================================================================
// PERMISSION VALIDATION HELPERS
// ============================================================================

/**
 * Validate that user has a specific permission
 * Throws PermissionDeniedError if check fails
 *
 * @param user Current authenticated user
 * @param resource Module/resource name
 * @param action Permission action to check
 * @throws {PermissionDeniedError} If user lacks permission
 *
 * @example
 * ```typescript
 * export const deleteMaterial = async (id: string, user: AuthUser) => {
 *   requirePermission(user, 'materials', 'delete');
 *   return supabase.from('items').delete().eq('id', id);
 * };
 * ```
 */
export function requirePermission(
  user: AuthUser | null | undefined,
  resource: ModuleName,
  action: PermissionAction
): void {
  // Check if user exists
  if (!user) {
    logger.error('ServicePermissions', 'Permission check failed: No user provided');
    throw new PermissionDeniedError(resource, action, undefined, 'Not authenticated');
  }

  // Check if user has role
  if (!user.role) {
    logger.error('ServicePermissions', 'Permission check failed: User has no role', { userId: user.id });
    throw new PermissionDeniedError(resource, action, user.id, 'No role assigned');
  }

  // Check permission
  const hasAccess = hasPermission(user.role, resource, action);

  if (!hasAccess) {
    logger.warn('ServicePermissions', 'Permission denied', {
      userId: user.id,
      role: user.role,
      resource,
      action,
    });

    throw new PermissionDeniedError(resource, action, user.id);
  }

  logger.debug('ServicePermissions', 'Permission granted', {
    userId: user.id,
    role: user.role,
    resource,
    action,
  });
}

/**
 * Validate that user has ANY of the specified permissions
 * Throws PermissionDeniedError if user lacks all permissions
 *
 * @param user Current authenticated user
 * @param resource Module/resource name
 * @param actions Array of permission actions (user needs at least one)
 * @throws {PermissionDeniedError} If user lacks all permissions
 *
 * @example
 * ```typescript
 * // Allow if user can create OR update
 * export const saveMaterial = async (data: Material, user: AuthUser) => {
 *   requireAnyPermission(user, 'materials', ['create', 'update']);
 *   // ...
 * };
 * ```
 */
export function requireAnyPermission(
  user: AuthUser | null | undefined,
  resource: ModuleName,
  actions: PermissionAction[]
): void {
  if (!user || !user.role) {
    throw new PermissionDeniedError(resource, actions[0], user?.id, 'Not authenticated or no role');
  }

  const hasAnyAccess = actions.some((action) => hasPermission(user.role!, resource, action));

  if (!hasAnyAccess) {
    logger.warn('ServicePermissions', 'Permission denied (any)', {
      userId: user.id,
      role: user.role,
      resource,
      actions,
    });

    throw new PermissionDeniedError(resource, actions[0], user.id, `Requires any of: ${actions.join(', ')}`);
  }
}

/**
 * Validate that user has ALL of the specified permissions
 * Throws PermissionDeniedError if user lacks any permission
 *
 * @param user Current authenticated user
 * @param resource Module/resource name
 * @param actions Array of permission actions (user needs all)
 * @throws {PermissionDeniedError} If user lacks any permission
 *
 * @example
 * ```typescript
 * // Require both void AND update permissions
 * export const voidAndRefundOrder = async (id: string, user: AuthUser) => {
 *   requireAllPermissions(user, 'sales', ['void', 'update']);
 *   // ...
 * };
 * ```
 */
export function requireAllPermissions(
  user: AuthUser | null | undefined,
  resource: ModuleName,
  actions: PermissionAction[]
): void {
  if (!user || !user.role) {
    throw new PermissionDeniedError(resource, actions[0], user?.id, 'Not authenticated or no role');
  }

  const missingPermissions = actions.filter((action) => !hasPermission(user.role!, resource, action));

  if (missingPermissions.length > 0) {
    logger.warn('ServicePermissions', 'Permission denied (all)', {
      userId: user.id,
      role: user.role,
      resource,
      required: actions,
      missing: missingPermissions,
    });

    throw new PermissionDeniedError(
      resource,
      actions[0],
      user.id,
      `Missing permissions: ${missingPermissions.join(', ')}`
    );
  }
}

/**
 * Validate that user can access a module at all
 * Throws PermissionDeniedError if user has no permissions for module
 *
 * @param user Current authenticated user
 * @param resource Module/resource name
 * @throws {PermissionDeniedError} If user cannot access module
 *
 * @example
 * ```typescript
 * export const getMaterials = async (user: AuthUser) => {
 *   requireModuleAccess(user, 'materials');
 *   return supabase.from('items').select('*');
 * };
 * ```
 */
export function requireModuleAccess(user: AuthUser | null | undefined, resource: ModuleName): void {
  if (!user || !user.role) {
    throw new PermissionDeniedError(resource, 'read', user?.id, 'Not authenticated or no role');
  }

  const hasAccess = checkModuleAccess(user.role, resource);

  if (!hasAccess) {
    logger.warn('ServicePermissions', 'Module access denied', {
      userId: user.id,
      role: user.role,
      resource,
    });

    throw new PermissionDeniedError(resource, 'read', user.id, 'No access to this module');
  }
}

// ============================================================================
// LOCATION-BASED ACCESS CONTROL
// ============================================================================

/**
 * Extended user type with location information
 * (For future multi-location support - Phase 2E)
 */
export interface UserWithLocation extends AuthUser {
  location_id?: string;
  accessible_locations?: string[];
}

/**
 * Validate that user can access a specific location
 * Throws LocationAccessError if user cannot access location
 *
 * @param user Current authenticated user with location info
 * @param targetLocationId Location ID to access
 * @throws {LocationAccessError} If user cannot access location
 *
 * @example
 * ```typescript
 * export const createSale = async (data: Sale, user: UserWithLocation) => {
 *   requirePermission(user, 'sales', 'create');
 *   requireLocationAccess(user, data.location_id);
 *   return supabase.from('sales').insert(data);
 * };
 * ```
 */
export function requireLocationAccess(user: UserWithLocation | null | undefined, targetLocationId: string): void {
  if (!user) {
    throw new LocationAccessError('unknown', targetLocationId, []);
  }

  // Admin has access to all locations
  if (user.role === 'ADMINISTRADOR' || user.role === 'SUPER_ADMIN') {
    return;
  }

  // Check if user has access to target location
  const hasAccess =
    user.location_id === targetLocationId ||
    (user.accessible_locations && user.accessible_locations.includes(targetLocationId));

  if (!hasAccess) {
    const allowed = user.accessible_locations || (user.location_id ? [user.location_id] : []);

    logger.warn('ServicePermissions', 'Location access denied', {
      userId: user.id,
      role: user.role,
      targetLocationId,
      userLocationId: user.location_id,
      accessibleLocations: user.accessible_locations,
    });

    throw new LocationAccessError(user.id, targetLocationId, allowed);
  }
}

/**
 * Get list of location IDs that user can access
 * Used for filtering queries by location
 *
 * @param user Current authenticated user with location info
 * @returns Array of location IDs user can access
 *
 * @example
 * ```typescript
 * export const getSales = async (user: UserWithLocation) => {
 *   requireModuleAccess(user, 'sales');
 *
 *   const locationIds = getAccessibleLocationIds(user);
 *
 *   if (locationIds.length === 0) {
 *     // Admin - no filter needed (access all)
 *     return supabase.from('sales').select('*');
 *   }
 *
 *   // Filter by accessible locations
 *   return supabase.from('sales').select('*').in('location_id', locationIds);
 * };
 * ```
 */
export function getAccessibleLocationIds(user: UserWithLocation | null | undefined): string[] {
  if (!user) {
    return [];
  }

  // Admin has access to all locations (return empty array to signal "no filter")
  if (user.role === 'ADMINISTRADOR' || user.role === 'SUPER_ADMIN') {
    return [];
  }

  // Return user's accessible locations
  if (user.accessible_locations && user.accessible_locations.length > 0) {
    return user.accessible_locations;
  }

  // Return user's primary location
  if (user.location_id) {
    return [user.location_id];
  }

  // User has no locations assigned
  return [];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if error is a PermissionDeniedError
 */
export function isPermissionDeniedError(error: unknown): error is PermissionDeniedError {
  return error instanceof PermissionDeniedError;
}

/**
 * Type guard to check if error is a LocationAccessError
 */
export function isLocationAccessError(error: unknown): error is LocationAccessError {
  return error instanceof LocationAccessError;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { PermissionAction };
