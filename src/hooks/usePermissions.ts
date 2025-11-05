/**
 * USE PERMISSIONS HOOK
 *
 * React hook for component-level permission checks
 * Provides granular access control based on user role
 *
 * Usage Pattern:
 * ```typescript
 * const { canCreate, canVoid, canConfigure } = usePermissions('sales');
 *
 * return (
 *   <>
 *     {canCreate && <Button>New Sale</Button>}
 *     {canVoid && <Button>Void Order</Button>}
 *     {canConfigure && <Button>Settings</Button>}
 *   </>
 * );
 * ```
 *
 * Integration:
 * - Uses AuthContext for user role
 * - Uses PermissionsRegistry for permission matrix
 * - Check features FIRST, then permissions (features → permissions flow)
 *
 * Example with Feature Flags:
 * ```typescript
 * const { hasFeature } = useCapabilities();
 * const { canVoid } = usePermissions('sales');
 *
 * // ✅ CORRECT: Check feature first, then permission
 * if (!hasFeature('sales_void_orders')) return null; // Feature OFF → skip
 * if (!canVoid) return null; // Feature ON → check permission
 *
 * // ❌ WRONG: Wastes permission check if feature is off
 * if (!canVoid) return null;
 * if (!hasFeature('sales_void_orders')) return null;
 * ```
 */

import { useContext, useMemo } from 'react';
import AuthContext from '@/contexts/AuthContext';
import type { ModuleName } from '@/contexts/AuthContext';
import {
  type PermissionAction,
  hasPermission,
  getResourcePermissions,
  canAccessModule as checkModuleAccess,
} from '@/config/PermissionsRegistry';

// ============================================================================
// PERMISSION ACTIONS INTERFACE
// ============================================================================

/**
 * Granular permission checks for a specific resource
 * All methods return boolean indicating if current user has permission
 */
export interface PermissionActions {
  /** Can create new records */
  canCreate: boolean;

  /** Can view existing records */
  canRead: boolean;

  /** Can modify existing records */
  canUpdate: boolean;

  /** Can permanently delete records */
  canDelete: boolean;

  /** Can cancel/void transactions (soft delete) */
  canVoid: boolean;

  /** Can approve workflows/requests */
  canApprove: boolean;

  /** Can modify module settings */
  canConfigure: boolean;

  /** Can export data */
  canExport: boolean;

  /** Can access the module at all (has any permission) */
  canAccessModule: boolean;

  /** All available permission actions for this resource */
  permissions: PermissionAction[];

  /** Check if user has a specific custom permission */
  can: (action: PermissionAction) => boolean;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook to check permissions for a specific resource (module)
 *
 * @param resource Module name to check permissions for
 * @returns PermissionActions object with boolean flags and helpers
 *
 * @example Basic Usage
 * ```typescript
 * const { canCreate, canDelete } = usePermissions('sales');
 *
 * return (
 *   <>
 *     {canCreate && <CreateSaleButton />}
 *     {canDelete && <DeleteButton />}
 *   </>
 * );
 * ```
 *
 * @example Custom Action Check
 * ```typescript
 * const { can } = usePermissions('sales');
 *
 * if (can('void')) {
 *   // Show void button
 * }
 * ```
 *
 * @example Feature + Permission Check
 * ```typescript
 * const { hasFeature } = useCapabilities();
 * const { canVoid } = usePermissions('sales');
 *
 * const showVoidButton = hasFeature('sales_void_orders') && canVoid;
 * ```
 */
export function usePermissions(resource: ModuleName): PermissionActions {
  const { user } = useContext(AuthContext);

  // Memoize permission checks to avoid recalculation on every render
  const permissions = useMemo(() => {
    // If no user or no role, deny all permissions
    if (!user || !user.role) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canVoid: false,
        canApprove: false,
        canConfigure: false,
        canExport: false,
        canAccessModule: false,
        permissions: [] as PermissionAction[],
        can: () => false,
      };
    }

    const userRole = user.role;
    const resourcePermissions = getResourcePermissions(userRole, resource);

    // Helper to check if user has specific action
    const hasAction = (action: PermissionAction): boolean => {
      return hasPermission(userRole, resource, action);
    };

    return {
      canCreate: hasAction('create'),
      canRead: hasAction('read'),
      canUpdate: hasAction('update'),
      canDelete: hasAction('delete'),
      canVoid: hasAction('void'),
      canApprove: hasAction('approve'),
      canConfigure: hasAction('configure'),
      canExport: hasAction('export'),
      canAccessModule: checkModuleAccess(userRole, resource),
      permissions: resourcePermissions,
      can: (action: PermissionAction) => hasAction(action),
    };
  }, [user, resource]);

  return permissions;
}

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook to check if user has ANY of the specified permissions for a resource
 * Useful for showing UI elements when user has at least one of multiple permissions
 *
 * @param resource Module name
 * @param actions Array of permission actions to check
 * @returns true if user has ANY of the specified permissions
 *
 * @example
 * ```typescript
 * const canModifySales = useHasAnyPermission('sales', ['create', 'update', 'delete']);
 *
 * // Show edit panel if user can do ANY of: create, update, or delete
 * {canModifySales && <EditPanel />}
 * ```
 */
export function useHasAnyPermission(
  resource: ModuleName,
  actions: PermissionAction[]
): boolean {
  const { permissions } = usePermissions(resource);

  return useMemo(() => {
    return actions.some((action) => permissions.includes(action));
  }, [actions, permissions]);
}

/**
 * Hook to check if user has ALL of the specified permissions for a resource
 * Useful for complex operations requiring multiple permissions
 *
 * @param resource Module name
 * @param actions Array of permission actions to check
 * @returns true if user has ALL of the specified permissions
 *
 * @example
 * ```typescript
 * const canProcessRefund = useHasAllPermissions('sales', ['read', 'void', 'update']);
 *
 * // Show refund button only if user can read, void, AND update sales
 * {canProcessRefund && <RefundButton />}
 * ```
 */
export function useHasAllPermissions(
  resource: ModuleName,
  actions: PermissionAction[]
): boolean {
  const { permissions } = usePermissions(resource);

  return useMemo(() => {
    return actions.every((action) => permissions.includes(action));
  }, [actions, permissions]);
}

/**
 * Hook to get permission flags for multiple resources at once
 * Useful when component needs to check permissions for several modules
 *
 * @param resources Array of module names
 * @returns Map of resource names to PermissionActions
 *
 * @example
 * ```typescript
 * const perms = useMultiplePermissions(['sales', 'materials', 'products']);
 *
 * return (
 *   <>
 *     {perms.sales.canCreate && <CreateSaleButton />}
 *     {perms.materials.canUpdate && <UpdateStockButton />}
 *     {perms.products.canDelete && <DeleteProductButton />}
 *   </>
 * );
 * ```
 */
export function useMultiplePermissions(
  resources: ModuleName[]
): Record<string, PermissionActions> {
  const { user } = useContext(AuthContext);

  return useMemo(() => {
    if (!user || !user.role) {
      return {};
    }

    const result: Record<string, PermissionActions> = {};

    resources.forEach((resource) => {
      const userRole = user.role!;
      const resourcePermissions = getResourcePermissions(userRole, resource);

      const hasAction = (action: PermissionAction): boolean => {
        return hasPermission(userRole, resource, action);
      };

      result[resource] = {
        canCreate: hasAction('create'),
        canRead: hasAction('read'),
        canUpdate: hasAction('update'),
        canDelete: hasAction('delete'),
        canVoid: hasAction('void'),
        canApprove: hasAction('approve'),
        canConfigure: hasAction('configure'),
        canExport: hasAction('export'),
        canAccessModule: checkModuleAccess(userRole, resource),
        permissions: resourcePermissions,
        can: (action: PermissionAction) => hasAction(action),
      };
    });

    return result;
  }, [user, resources]);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { PermissionAction };
