/**
 * PERMISSIONS REGISTRY
 *
 * Centralized permission definitions for G-Admin Mini
 * Implements RBAC (Role-Based Access Control) with resource-action pattern
 *
 * Architecture:
 * - Roles: admin, manager, supervisor, employee, viewer, super_admin
 * - Resources: Module names (sales, materials, staff, etc.)
 * - Actions: CRUD + special actions (void, approve, configure)
 *
 * Integration:
 * - Used by AuthContext for permission checks
 * - Used by usePermissions hook for component-level access control
 * - Checked AFTER feature flags (features first, then permissions)
 */

import type { UserRole, ModuleName } from '@/contexts/AuthContext';

// ============================================================================
// PERMISSION ACTIONS
// ============================================================================

/**
 * Standard CRUD operations + special business actions
 */
export type PermissionAction =
  | 'create'    // Can create new records
  | 'read'      // Can view existing records
  | 'update'    // Can modify existing records
  | 'delete'    // Can permanently delete records
  | 'void'      // Can cancel/void transactions (soft delete)
  | 'approve'   // Can approve workflows/requests
  | 'configure' // Can modify module settings
  | 'export';   // Can export data

// ============================================================================
// PERMISSION STRUCTURE
// ============================================================================

/**
 * Permission object structure
 * Example: { resource: 'sales', action: 'create' }
 */
export interface Permission {
  resource: ModuleName;
  action: PermissionAction;
}

/**
 * Permission set for a specific resource (module)
 * Example: { sales: ['create', 'read', 'update', 'void'] }
 */
export type ResourcePermissions = Partial<Record<ModuleName, PermissionAction[]>>;

// ============================================================================
// ROLE-BASED PERMISSIONS MATRIX
// ============================================================================

/**
 * Complete permissions matrix for all roles
 *
 * Decision rationale:
 * - admin: Full access to everything (business owner)
 * - manager: Operational + approvals, no system config (department manager)
 * - supervisor: Operational only, single location (shift lead)
 * - employee: Limited to assigned tasks, own data (staff)
 * - viewer: Read-only access (external users: accountants, auditors)
 * - super_admin: System-level access (infrastructure, not for production)
 *
 * Note: Permissions are module-level. Record-level filtering (e.g., own data only)
 * is handled in service layer based on user.location_id and user.accessible_locations
 */
export const ROLE_PERMISSIONS: Record<UserRole, ResourcePermissions> = {
  // ========================================================================
  // ADMIN - Business Owner (Full Access)
  // ========================================================================
  'ADMINISTRADOR': {
    // Core Operations
    sales: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export'],
    materials: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    suppliers: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    products: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    recipe: ['create', 'read', 'update', 'delete', 'configure', 'export'],

    // Operations
    operations: ['create', 'read', 'update', 'delete', 'configure'],

    // Resources
    staff: ['create', 'read', 'update', 'delete', 'approve', 'configure', 'export'],
    scheduling: ['create', 'read', 'update', 'delete', 'approve', 'configure'],

    // Finance
    fiscal: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export'],
    billing: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export'],
    integrations: ['create', 'read', 'update', 'delete', 'configure'],

    // Customers & Business
    customers: ['create', 'read', 'update', 'delete', 'export'],
    memberships: ['create', 'read', 'update', 'delete', 'approve', 'configure'],
    rentals: ['create', 'read', 'update', 'delete', 'configure'],
    assets: ['create', 'read', 'update', 'delete', 'configure'],

    // Analytics & Reporting
    reporting: ['read', 'export', 'configure'],
    intelligence: ['read', 'configure'],
    executive: ['read', 'export', 'configure'],
    dashboard: ['read', 'configure'],

    // System
    settings: ['read', 'update', 'configure'],
    gamification: ['read', 'configure'],
    debug: [], // Admin does NOT have debug access (only super_admin)

    // Customer-facing (for testing/support)
    customer_portal: ['read'],
    customer_menu: ['read'],
    my_orders: ['read'],
  },

  // ========================================================================
  // SUPER_ADMIN - System Owner (Infrastructure Only)
  // ========================================================================
  'SUPER_ADMIN': {
    // Full access to everything INCLUDING debug tools
    // Inherits all ADMIN permissions + debug access
    sales: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export'],
    materials: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    suppliers: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    products: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    recipe: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    operations: ['create', 'read', 'update', 'delete', 'configure'],
    staff: ['create', 'read', 'update', 'delete', 'approve', 'configure', 'export'],
    scheduling: ['create', 'read', 'update', 'delete', 'approve', 'configure'],
    fiscal: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export'],
    billing: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export'],
    integrations: ['create', 'read', 'update', 'delete', 'configure'],
    customers: ['create', 'read', 'update', 'delete', 'export'],
    memberships: ['create', 'read', 'update', 'delete', 'approve', 'configure'],
    rentals: ['create', 'read', 'update', 'delete', 'configure'],
    assets: ['create', 'read', 'update', 'delete', 'configure'],
    reporting: ['read', 'export', 'configure'],
    intelligence: ['read', 'configure'],
    executive: ['read', 'export', 'configure'],
    dashboard: ['read', 'configure'],
    settings: ['read', 'update', 'configure'],
    gamification: ['read', 'configure'],
    debug: ['read', 'create', 'update', 'delete', 'configure'], // ← ONLY super_admin has debug access
    customer_portal: ['read'],
    customer_menu: ['read'],
    my_orders: ['read'],
  },

  // ========================================================================
  // SUPERVISOR - Shift Lead (Operational, Single Location)
  // ========================================================================
  'SUPERVISOR': {
    // Core Operations (full CRUD, no delete, no configure)
    sales: ['create', 'read', 'update', 'void'],
    materials: ['create', 'read', 'update'],
    products: ['create', 'read', 'update'],
    recipe: ['create', 'read', 'update'],
    operations: ['create', 'read', 'update'],

    // Resources (limited)
    staff: ['read', 'update'], // Can't create/delete staff
    scheduling: ['create', 'read', 'update', 'approve'],

    // Finance (read + operational)
    fiscal: ['read'],
    billing: ['read'],
    integrations: [], // No access

    // Customers (operational)
    customers: ['create', 'read', 'update'],
    memberships: ['read', 'update'],
    rentals: ['create', 'read', 'update'],
    assets: ['read', 'update'],

    // Analytics (read-only)
    reporting: ['read'],
    intelligence: [], // No access
    executive: [], // No access
    dashboard: ['read'],

    // System (minimal)
    settings: [], // No settings access
    gamification: ['read'],
    debug: [], // No debug access

    // Customer-facing (for support)
    customer_portal: ['read'],
    customer_menu: ['read'],
    my_orders: ['read'],
  },

  // ========================================================================
  // OPERADOR - Employee (Assigned Tasks, Own Data)
  // ========================================================================
  'OPERADOR': {
    // Core Operations (limited to own tasks)
    sales: ['create', 'read', 'update'], // Can create/view/update sales
    materials: ['read', 'update'], // Can view/update inventory
    products: ['read'], // View-only for products
    recipe: ['read'], // View-only for recipes
    operations: ['read', 'update'],

    // Resources (view-only)
    staff: [], // No staff access
    scheduling: ['read'], // Can view own schedule only (filtered in service layer)

    // Finance (no access)
    fiscal: [],
    billing: [],
    integrations: [],

    // Customers (operational)
    customers: ['create', 'read', 'update'], // Can manage customers during sales
    memberships: ['read'],
    rentals: [],
    assets: [],

    // Analytics (limited)
    reporting: [], // No reports access
    intelligence: [],
    executive: [],
    dashboard: ['read'], // Can view dashboard

    // System (no access)
    settings: [],
    gamification: ['read'], // Can view own gamification progress
    debug: [],

    // Customer-facing
    customer_portal: [],
    customer_menu: [],
    my_orders: [],
  },

  // ========================================================================
  // CLIENTE - Customer (Customer Portal Only)
  // ========================================================================
  'CLIENTE': {
    // No admin module access
    sales: [],
    materials: [],
    products: [],
    recipe: [],
    operations: [],
    staff: [],
    scheduling: [],
    fiscal: [],
    billing: [],
    integrations: [],
    customers: [],
    memberships: [],
    rentals: [],
    assets: [],
    reporting: [],
    intelligence: [],
    executive: [],
    dashboard: [],
    settings: ['read', 'update'], // Can update own profile settings
    gamification: [],
    debug: [],

    // Customer-facing (full access to own data)
    customer_portal: ['read', 'update'],
    customer_menu: ['read'],
    my_orders: ['read', 'create'], // Can view own orders and create new ones
  },

  // ========================================================================
  // VIEWER - Read-Only (External Users: Accountants, Auditors)
  // ========================================================================
  // Note: This role doesn't exist in current AuthContext UserRole enum
  // Will be added in future if needed
  // Leaving placeholder for completeness
};

// ============================================================================
// PERMISSION CHECK HELPERS
// ============================================================================

/**
 * Check if a role has a specific permission for a resource
 *
 * @param role User role
 * @param resource Module name
 * @param action Permission action
 * @returns true if role has permission, false otherwise
 *
 * @example
 * hasPermission('ADMINISTRADOR', 'sales', 'void') // true
 * hasPermission('OPERADOR', 'sales', 'delete') // false
 */
export function hasPermission(
  role: UserRole,
  resource: ModuleName,
  action: PermissionAction
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Get all permissions for a specific role and resource
 *
 * @param role User role
 * @param resource Module name
 * @returns Array of permission actions
 *
 * @example
 * getResourcePermissions('SUPERVISOR', 'sales')
 * // returns: ['create', 'read', 'update', 'void']
 */
export function getResourcePermissions(
  role: UserRole,
  resource: ModuleName
): PermissionAction[] {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return [];

  return rolePermissions[resource] || [];
}

/**
 * Check if a role can access a module at all (has any permission)
 *
 * @param role User role
 * @param resource Module name
 * @returns true if role has any permission for the module
 *
 * @example
 * canAccessModule('OPERADOR', 'sales') // true (has read/create/update)
 * canAccessModule('OPERADOR', 'fiscal') // false (no permissions)
 */
export function canAccessModule(
  role: UserRole,
  resource: ModuleName
): boolean {
  const permissions = getResourcePermissions(role, resource);
  return permissions.length > 0;
}

/**
 * Get all modules a role can access
 *
 * @param role User role
 * @returns Array of module names
 *
 * @example
 * getAccessibleModules('SUPERVISOR')
 * // returns: ['sales', 'materials', 'products', 'operations', 'staff', 'scheduling', ...]
 */
export function getAccessibleModules(role: UserRole): ModuleName[] {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return [];

  return Object.entries(rolePermissions)
    .filter(([_, actions]) => actions && actions.length > 0)
    .map(([module]) => module as ModuleName);
}

// ============================================================================
// ROLE HIERARCHY HELPERS
// ============================================================================

/**
 * Role hierarchy levels (for comparison)
 * Higher number = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'CLIENTE': 0,
  'OPERADOR': 1,
  'SUPERVISOR': 2,
  'ADMINISTRADOR': 3,
  'SUPER_ADMIN': 4,
};

/**
 * Check if roleA has higher or equal level than roleB
 *
 * @param roleA First role
 * @param roleB Second role
 * @returns true if roleA >= roleB in hierarchy
 *
 * @example
 * isRoleHigherOrEqual('ADMINISTRADOR', 'SUPERVISOR') // true
 * isRoleHigherOrEqual('OPERADOR', 'SUPERVISOR') // false
 */
export function isRoleHigherOrEqual(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}

/**
 * Get minimum role required to access a module
 * Returns the lowest role in hierarchy that has any permission for the module
 *
 * @param resource Module name
 * @returns Minimum required role
 *
 * @example
 * getMinimumRoleForModule('fiscal') // 'SUPERVISOR' or 'ADMINISTRADOR'
 * getMinimumRoleForModule('debug') // 'SUPER_ADMIN'
 */
export function getMinimumRoleForModule(resource: ModuleName): UserRole | null {
  const roles: UserRole[] = ['CLIENTE', 'OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN'];

  for (const role of roles) {
    if (canAccessModule(role, resource)) {
      return role;
    }
  }

  return null;
}
