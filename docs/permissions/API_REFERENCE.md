# API Reference - Roles and Permissions

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Status**: Complete

Complete API documentation for the G-Admin Mini permissions system.

---

## Table of Contents

- [PermissionsRegistry API](#permissionsregistry-api)
- [AuthContext API](#authcontext-api)
- [usePermissions Hook API](#usepermissions-hook-api)
- [RoleGuard Component API](#roleguard-component-api)
- [servicePermissions API](#servicepermissions-api)

---

## PermissionsRegistry API

**Module**: `src/config/PermissionsRegistry.ts`

### Types

```typescript
/**
 * User role enumeration
 */
type UserRole =
  | 'CLIENTE'
  | 'OPERADOR'
  | 'SUPERVISOR'
  | 'ADMINISTRADOR'
  | 'SUPER_ADMIN';

/**
 * Module name enumeration (26 modules)
 */
type ModuleName =
  | 'sales' | 'materials' | 'suppliers' | 'products' | 'operations'
  | 'staff' | 'scheduling'
  | 'fiscal' | 'billing' | 'integrations'
  | 'customers' | 'memberships' | 'rentals' | 'assets'
  | 'reporting' | 'intelligence' | 'executive' | 'dashboard'
  | 'settings' | 'gamification' | 'debug'
  | 'customer_portal' | 'customer_menu' | 'my_orders';

/**
 * Permission action types (8 actions)
 */
type PermissionAction =
  | 'create'    // Can create new records
  | 'read'      // Can view existing records
  | 'update'    // Can modify existing records
  | 'delete'    // Can permanently delete records
  | 'void'      // Can cancel/void transactions (soft delete)
  | 'approve'   // Can approve workflows/requests
  | 'configure' // Can modify module settings
  | 'export';   // Can export data

/**
 * Permission object structure
 */
interface Permission {
  resource: ModuleName;
  action: PermissionAction;
}

/**
 * Permission set for a specific resource (module)
 */
type ResourcePermissions = Partial<Record<ModuleName, PermissionAction[]>>;
```

### Constants

#### ROLE_PERMISSIONS

Complete permission matrix for all roles.

```typescript
const ROLE_PERMISSIONS: Record<UserRole, ResourcePermissions>;
```

**Structure**:
```typescript
ROLE_PERMISSIONS = {
  'ADMINISTRADOR': {
    sales: ['create', 'read', 'update', 'delete', 'void', 'configure', 'export'],
    materials: ['create', 'read', 'update', 'delete', 'configure', 'export'],
    // ... all 26 modules
  },
  // ... all 5 roles
}
```

#### ROLE_HIERARCHY

Role hierarchy levels for comparison.

```typescript
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'CLIENTE': 0,
  'OPERADOR': 1,
  'SUPERVISOR': 2,
  'ADMINISTRADOR': 3,
  'SUPER_ADMIN': 4,
};
```

### Functions

#### hasPermission()

Check if a role has a specific permission for a resource.

```typescript
function hasPermission(
  role: UserRole,
  resource: ModuleName,
  action: PermissionAction
): boolean
```

**Parameters**:
- `role` - User role to check
- `resource` - Module name
- `action` - Permission action

**Returns**: `true` if role has permission, `false` otherwise

**Example**:
```typescript
hasPermission('ADMINISTRADOR', 'sales', 'void')  // true
hasPermission('OPERADOR', 'sales', 'delete')    // false
```

---

#### getResourcePermissions()

Get all permissions for a specific role and resource.

```typescript
function getResourcePermissions(
  role: UserRole,
  resource: ModuleName
): PermissionAction[]
```

**Parameters**:
- `role` - User role
- `resource` - Module name

**Returns**: Array of permission actions

**Example**:
```typescript
getResourcePermissions('SUPERVISOR', 'sales')
// Returns: ['create', 'read', 'update', 'void']
```

---

#### canAccessModule()

Check if a role can access a module at all (has any permission).

```typescript
function canAccessModule(
  role: UserRole,
  resource: ModuleName
): boolean
```

**Parameters**:
- `role` - User role
- `resource` - Module name

**Returns**: `true` if role has any permission for module

**Example**:
```typescript
canAccessModule('OPERADOR', 'sales')  // true (has read/create/update)
canAccessModule('OPERADOR', 'fiscal') // false (no permissions)
```

---

#### getAccessibleModules()

Get all modules a role can access.

```typescript
function getAccessibleModules(role: UserRole): ModuleName[]
```

**Parameters**:
- `role` - User role

**Returns**: Array of module names

**Example**:
```typescript
getAccessibleModules('SUPERVISOR')
// Returns: ['sales', 'materials', 'products', 'operations', 'staff', ...]
```

---

#### isRoleHigherOrEqual()

Check if roleA has higher or equal level than roleB.

```typescript
function isRoleHigherOrEqual(
  roleA: UserRole,
  roleB: UserRole
): boolean
```

**Parameters**:
- `roleA` - First role
- `roleB` - Second role

**Returns**: `true` if roleA >= roleB in hierarchy

**Example**:
```typescript
isRoleHigherOrEqual('ADMINISTRADOR', 'SUPERVISOR') // true
isRoleHigherOrEqual('OPERADOR', 'SUPERVISOR')     // false
```

---

#### getMinimumRoleForModule()

Get minimum role required to access a module.

```typescript
function getMinimumRoleForModule(
  resource: ModuleName
): UserRole | null
```

**Parameters**:
- `resource` - Module name

**Returns**: Minimum required role or `null`

**Example**:
```typescript
getMinimumRoleForModule('fiscal')    // 'SUPERVISOR' (read-only)
getMinimumRoleForModule('debug')     // 'SUPER_ADMIN'
getMinimumRoleForModule('suppliers') // 'ADMINISTRADOR'
```

---

## AuthContext API

**Module**: `src/contexts/AuthContext.tsx`

### Interface

```typescript
interface AuthContextType {
  // ==========================================
  // State
  // ==========================================

  /** Current authenticated user with role information */
  user: AuthUser | null;

  /** Current Supabase session */
  session: Session | null;

  /** Loading state during authentication */
  loading: boolean;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  // ==========================================
  // Authentication Methods
  // ==========================================

  /**
   * Sign in with email and password
   * @param email User email
   * @param password User password
   * @returns Promise with optional error message
   */
  signIn: (email: string, password: string) => Promise<{ error?: string }>;

  /**
   * Sign up new user
   * @param email User email
   * @param password User password
   * @param fullName Optional full name
   * @returns Promise with optional error message
   */
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error?: string }>;

  /**
   * Sign out current user
   */
  signOut: () => Promise<void>;

  /**
   * Force refresh user role from JWT/database
   */
  refreshRole: () => Promise<void>;

  // ==========================================
  // Role Checks
  // ==========================================

  /**
   * Check if user has specific role(s)
   * @param role Single role or array of roles
   * @returns true if user has any of the specified roles
   */
  isRole: (role: UserRole | UserRole[]) => boolean;

  /**
   * Check if user has any of the specified roles
   * @param roles Array of roles
   * @returns true if user has any role
   */
  hasRole: (roles: UserRole[]) => boolean;

  // ==========================================
  // Permission Checks
  // ==========================================

  /**
   * Check if user can access a module (has any permission)
   * @param module Module name
   * @returns true if user can access module
   */
  canAccessModule: (module: ModuleName) => boolean;

  /**
   * Check if user can perform a specific action on a module
   * @param module Module name
   * @param action Permission action
   * @returns true if user has permission
   */
  canPerformAction: (
    module: ModuleName,
    action: PermissionAction
  ) => boolean;

  // CRUD Permission Checks (shortcuts for canPerformAction)

  /** Check if user can create records in module */
  canCreate: (module: ModuleName) => boolean;

  /** Check if user can read records in module */
  canRead: (module: ModuleName) => boolean;

  /** Check if user can update records in module */
  canUpdate: (module: ModuleName) => boolean;

  /** Check if user can delete records in module */
  canDelete: (module: ModuleName) => boolean;

  // Special Action Permission Checks

  /** Check if user can void transactions in module */
  canVoid: (module: ModuleName) => boolean;

  /** Check if user can approve workflows in module */
  canApprove: (module: ModuleName) => boolean;

  /** Check if user can configure module settings */
  canConfigure: (module: ModuleName) => boolean;

  /** Check if user can export data from module */
  canExport: (module: ModuleName) => boolean;
}
```

### Extended Types

```typescript
/**
 * JWT Custom Claims interface
 */
interface CustomClaims {
  user_role?: UserRole;
  is_active?: boolean;
  role_updated_at?: number;
  app_metadata?: {
    provider?: string;
    role_source?: string;
  };
  error?: string;
}

/**
 * Extended user type with role information
 */
interface AuthUser extends User {
  role?: UserRole;
  isActive?: boolean;
  roleSource?: 'jwt' | 'database' | 'fallback';
}
```

### Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const {
    user,
    isAuthenticated,
    isRole,
    canAccessModule,
    canPerformAction,
    canCreate,
    canVoid
  } = useAuth();

  // Check authentication
  if (!isAuthenticated) return <LoginPrompt />;

  // Check role
  if (!isRole(['ADMINISTRADOR', 'SUPER_ADMIN'])) {
    return <AccessDenied />;
  }

  // Check module access
  if (!canAccessModule('sales')) {
    return <NoSalesAccess />;
  }

  // Check specific permission
  const canVoidSales = canPerformAction('sales', 'void');

  // Use shortcut methods
  const canCreateSales = canCreate('sales');
  const canVoidSales2 = canVoid('sales');

  return <SalesModule />;
};
```

---

## usePermissions Hook API

**Module**: `src/hooks/usePermissions.ts`

### Interface

```typescript
/**
 * Granular permission checks for a specific resource
 */
interface PermissionActions {
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
```

### Main Hook

#### usePermissions()

Hook to check permissions for a specific resource (module).

```typescript
function usePermissions(resource: ModuleName): PermissionActions
```

**Parameters**:
- `resource` - Module name to check permissions for

**Returns**: `PermissionActions` object with boolean flags and helpers

**Example**:
```typescript
const {
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  canVoid,
  canApprove,
  canConfigure,
  canExport,
  canAccessModule,
  permissions,
  can
} = usePermissions('sales');

// Use boolean flags
if (canCreate) { /* ... */ }

// Use can() for custom checks
if (can('void')) { /* ... */ }

// Check permissions array
if (permissions.includes('export')) { /* ... */ }
```

---

### Additional Hooks

#### useHasAnyPermission()

Check if user has ANY of the specified permissions for a resource (OR logic).

```typescript
function useHasAnyPermission(
  resource: ModuleName,
  actions: PermissionAction[]
): boolean
```

**Example**:
```typescript
const canModifySales = useHasAnyPermission(
  'sales',
  ['create', 'update', 'delete']
);
// true if user has at least one permission
```

---

#### useHasAllPermissions()

Check if user has ALL of the specified permissions for a resource (AND logic).

```typescript
function useHasAllPermissions(
  resource: ModuleName,
  actions: PermissionAction[]
): boolean
```

**Example**:
```typescript
const canProcessRefund = useHasAllPermissions(
  'sales',
  ['read', 'void', 'update']
);
// true only if user has all three permissions
```

---

#### useMultiplePermissions()

Get permission flags for multiple resources at once.

```typescript
function useMultiplePermissions(
  resources: ModuleName[]
): Record<string, PermissionActions>
```

**Example**:
```typescript
const perms = useMultiplePermissions(['sales', 'materials', 'products']);

if (perms.sales.canCreate) { /* ... */ }
if (perms.materials.canUpdate) { /* ... */ }
if (perms.products.canDelete) { /* ... */ }
```

---

## RoleGuard Component API

**Module**: `src/components/auth/RoleGuard.tsx`

### Component Props

```typescript
interface RoleGuardProps {
  /** Content to protect */
  children: React.ReactNode;

  /** Required roles (user must have at least one) */
  requiredRoles?: UserRole[];

  /** Required module (user must have access to module) */
  requiredModule?: ModuleName;

  /** Required action (user must have this specific permission) */
  requiredAction?: PermissionAction;

  /** Fallback content if access denied */
  fallback?: React.ReactNode;
}
```

### Component

```typescript
function RoleGuard(props: RoleGuardProps): React.ReactElement | null
```

**Example**:
```typescript
<RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
  <AdminPanel />
</RoleGuard>

<RoleGuard requiredModule="fiscal">
  <FiscalReports />
</RoleGuard>

<RoleGuard
  requiredModule="sales"
  requiredAction="void"
  fallback={<UpgradeRequired />}
>
  <VoidSaleButton />
</RoleGuard>
```

---

### Hook

#### useRoleGuard()

Hook to check if content should be shown based on roles/permissions.

```typescript
function useRoleGuard(
  requiredRoles?: UserRole[],
  requiredModule?: ModuleName,
  requiredAction?: PermissionAction
): boolean
```

**Example**:
```typescript
const canAccessAdmin = useRoleGuard(['ADMINISTRADOR', 'SUPER_ADMIN']);
const canVoidSales = useRoleGuard(undefined, 'sales', 'void');
const canManageStaff = useRoleGuard(['ADMINISTRADOR'], 'staff', 'delete');

return (
  <>
    {canAccessAdmin && <AdminLink />}
    {canVoidSales && <VoidButton />}
    {canManageStaff && <TerminateButton />}
  </>
);
```

---

## servicePermissions API

**Module**: `src/lib/permissions/servicePermissions.ts`

### Error Classes

#### PermissionDeniedError

Custom error for permission violations.

```typescript
class PermissionDeniedError extends Error {
  constructor(
    public resource: ModuleName,
    public action: PermissionAction,
    public userId?: string,
    public reason?: string
  )
}
```

**Example**:
```typescript
throw new PermissionDeniedError(
  'sales',
  'delete',
  'user-123',
  'Insufficient role level'
);
```

---

#### LocationAccessError

Custom error for location-based access violations.

```typescript
class LocationAccessError extends Error {
  constructor(
    public userId: string,
    public attemptedLocationId: string,
    public allowedLocationIds: string[]
  )
}
```

---

### Functions

#### requirePermission()

Validate that user has a specific permission. Throws `PermissionDeniedError` if check fails.

```typescript
function requirePermission(
  user: AuthUser | null | undefined,
  resource: ModuleName,
  action: PermissionAction
): void
```

**Throws**: `PermissionDeniedError`

**Example**:
```typescript
export const deleteMaterial = async (id: string, user: AuthUser) => {
  requirePermission(user, 'materials', 'delete');
  // Proceed only if permission granted
  return supabase.from('items').delete().eq('id', id);
};
```

---

#### requireAnyPermission()

Validate that user has ANY of the specified permissions (OR logic). Throws `PermissionDeniedError` if user lacks all permissions.

```typescript
function requireAnyPermission(
  user: AuthUser | null | undefined,
  resource: ModuleName,
  actions: PermissionAction[]
): void
```

**Example**:
```typescript
export const saveMaterial = async (data: Material, user: AuthUser) => {
  // Allow if user can create OR update
  requireAnyPermission(user, 'materials', ['create', 'update']);
  // ...
};
```

---

#### requireAllPermissions()

Validate that user has ALL of the specified permissions (AND logic). Throws `PermissionDeniedError` if user lacks any permission.

```typescript
function requireAllPermissions(
  user: AuthUser | null | undefined,
  resource: ModuleName,
  actions: PermissionAction[]
): void
```

**Example**:
```typescript
export const voidAndRefundOrder = async (id: string, user: AuthUser) => {
  // Require both void AND update
  requireAllPermissions(user, 'sales', ['void', 'update']);
  // ...
};
```

---

#### requireModuleAccess()

Validate that user can access a module at all. Throws `PermissionDeniedError` if user has no permissions for module.

```typescript
function requireModuleAccess(
  user: AuthUser | null | undefined,
  resource: ModuleName
): void
```

**Example**:
```typescript
export const getMaterials = async (user: AuthUser) => {
  requireModuleAccess(user, 'materials');
  return supabase.from('items').select('*');
};
```

---

#### requireLocationAccess()

Validate that user can access a specific location. Throws `LocationAccessError` if user cannot access location.

```typescript
function requireLocationAccess(
  user: UserWithLocation | null | undefined,
  targetLocationId: string
): void
```

**Example**:
```typescript
export const createSale = async (data: Sale, user: UserWithLocation) => {
  requirePermission(user, 'sales', 'create');
  requireLocationAccess(user, data.location_id);
  return supabase.from('sales').insert(data);
};
```

---

#### getAccessibleLocationIds()

Get list of location IDs that user can access. Returns empty array for ADMIN (no filter needed).

```typescript
function getAccessibleLocationIds(
  user: UserWithLocation | null | undefined
): string[]
```

**Returns**: Array of location IDs (empty = all locations)

**Example**:
```typescript
export const getSales = async (user: UserWithLocation) => {
  requireModuleAccess(user, 'sales');

  const locationIds = getAccessibleLocationIds(user);

  if (locationIds.length === 0) {
    // Admin - access all locations
    return supabase.from('sales').select('*');
  }

  // Filter by accessible locations
  return supabase
    .from('sales')
    .select('*')
    .in('location_id', locationIds);
};
```

---

### Type Guards

#### isPermissionDeniedError()

Type guard to check if error is a PermissionDeniedError.

```typescript
function isPermissionDeniedError(error: unknown): error is PermissionDeniedError
```

**Example**:
```typescript
try {
  await deleteMaterial(id, user);
} catch (error) {
  if (isPermissionDeniedError(error)) {
    console.log('Permission denied:', error.resource, error.action);
  }
}
```

---

#### isLocationAccessError()

Type guard to check if error is a LocationAccessError.

```typescript
function isLocationAccessError(error: unknown): error is LocationAccessError
```

---

### Extended Types

```typescript
/**
 * Extended user type with location information
 * (For multi-location support - Phase 2E)
 */
interface UserWithLocation extends AuthUser {
  location_id?: string;
  accessible_locations?: string[];
}
```

---

## Related Documentation

- [ROLES.md](./ROLES.md) - Complete role reference
- [MODULES.md](./MODULES.md) - Complete module reference
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Practical patterns
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SECURITY.md](./SECURITY.md) - Security best practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Maintainer**: Development Team
