# Developer Guide - Roles and Permissions

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Status**: Complete

Practical guide for developers working with the G-Admin Mini permissions system.

---

## Table of Contents

- [Using Permissions in Components](#using-permissions-in-components)
- [Service Layer Validation](#service-layer-validation)
- [Adding New Roles](#adding-new-roles)
- [Adding New Modules](#adding-new-modules)
- [Testing Patterns](#testing-patterns)

---

## Using Permissions in Components

### Pattern 1: usePermissions Hook (Recommended)

**Best For**: Component-level permission checks with granular control.

```typescript
import { usePermissions } from '@/hooks/usePermissions';

const SalesManagement = () => {
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canVoid,
    canConfigure,
    canExport,
    permissions,  // Array of all permissions
    can           // Custom action checker
  } = usePermissions('sales');

  // Basic usage
  if (!canRead) return <AccessDenied />;

  return (
    <>
      {canCreate && <CreateSaleButton />}
      {canVoid && <VoidSaleButton />}
      {canDelete && <DeleteSaleButton />}
      {canConfigure && <SalesSettingsButton />}
      {canExport && <ExportDataButton />}

      {/* Custom action check */}
      {can('approve') && <ApproveButton />}

      {/* Check permissions array */}
      {permissions.includes('void') && <VoidConfirmation />}
    </>
  );
};
```

**Performance Tip**: All flags are memoized - no performance penalty for destructuring all properties.

### Pattern 2: AuthContext Direct Access

**Best For**: Complex logic requiring multiple checks or user info.

```typescript
import { useAuth } from '@/contexts/AuthContext';

const ComplexPermissionLogic = () => {
  const {
    user,
    canAccessModule,
    canPerformAction,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canVoid,
    canApprove,
    canConfigure,
    canExport,
    isRole
  } = useAuth();

  // Module access check
  const hasSalesAccess = canAccessModule('sales');
  const hasFinanceAccess = canAccessModule('fiscal');

  // Specific action check
  const canVoidSales = canPerformAction('sales', 'void');

  // Role-based logic
  const isManager = isRole(['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']);

  // Combined checks
  const canManageFinances =
    isRole(['ADMINISTRADOR', 'SUPER_ADMIN']) &&
    canAccessModule('fiscal') &&
    canConfigure('fiscal');

  return (
    <>
      {hasSalesAccess && <SalesModule />}
      {hasFinanceAccess && <FinanceModule />}
      {canVoidSales && <VoidButton />}
      {isManager && <ManagerTools />}
      {canManageFinances && <FinanceSettings />}
    </>
  );
};
```

**When to Use AuthContext vs usePermissions**:
- **usePermissions**: Single module, need all action flags
- **AuthContext**: Multiple modules, complex logic, need user info

### Pattern 3: RoleGuard Component

**Best For**: Protecting entire sections or components.

```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';

const ProtectedFeatures = () => {
  return (
    <>
      {/* Role-based protection */}
      <RoleGuard requiredRoles={['ADMINISTRADOR', 'SUPER_ADMIN']}>
        <AdminPanel />
      </RoleGuard>

      {/* Module access protection */}
      <RoleGuard requiredModule="fiscal">
        <FiscalReports />
      </RoleGuard>

      {/* Specific action protection */}
      <RoleGuard
        requiredModule="sales"
        requiredAction="void"
      >
        <VoidSaleDialog />
      </RoleGuard>

      {/* Custom fallback */}
      <RoleGuard
        requiredRoles={['SUPER_ADMIN']}
        fallback={<FeatureNotAvailable />}
      >
        <DebugTools />
      </RoleGuard>

      {/* Combined requirements */}
      <RoleGuard
        requiredRoles={['SUPERVISOR', 'ADMINISTRADOR']}
        requiredModule="scheduling"
        requiredAction="approve"
      >
        <ApproveScheduleButton />
      </RoleGuard>
    </>
  );
};
```

**Nested Guards** (use sparingly):
```typescript
<RoleGuard requiredModule="sales">
  <SalesLayout>
    <RoleGuard requiredAction="void">
      <VoidSalesSection />
    </RoleGuard>
  </SalesLayout>
</RoleGuard>
```

### Pattern 4: useRoleGuard Hook

**Best For**: Conditional rendering without wrapper components.

```typescript
import { useRoleGuard } from '@/components/auth/RoleGuard';

const ConditionalUI = () => {
  // Simple role check
  const isAdmin = useRoleGuard(['ADMINISTRADOR', 'SUPER_ADMIN']);

  // Module access check
  const canAccessDebug = useRoleGuard(undefined, 'debug');

  // Action-specific check
  const canVoidSales = useRoleGuard(
    undefined,
    'sales',
    'void'
  );

  // Combined check
  const canManageStaff = useRoleGuard(
    ['ADMINISTRADOR', 'SUPER_ADMIN'],
    'staff',
    'delete'
  );

  return (
    <>
      {isAdmin && <AdminBadge />}
      {canAccessDebug && <DebugIcon />}
      {canVoidSales && <VoidButton />}
      {canManageStaff && <TerminateEmployeeButton />}
    </>
  );
};
```

### Pattern 5: Combining Features + Permissions (Defense in Depth)

**IMPORTANT**: Always check features FIRST, then permissions.

```typescript
import { useCapabilities } from '@/contexts/CapabilitiesContext';
import { usePermissions } from '@/hooks/usePermissions';

const SecureFeature = () => {
  // ✅ CORRECT: Check feature first (fast fail if feature is OFF)
  const { hasFeature } = useCapabilities();
  const { canVoid } = usePermissions('sales');

  // Feature OFF → Skip entirely
  if (!hasFeature('sales_void_orders')) {
    return null;
  }

  // Feature ON → Check permission
  if (!canVoid) {
    return <UpgradeRequired />;
  }

  return <VoidOrderButton />;
};

// ❌ WRONG: Permission check before feature check wastes computation
const WrongPattern = () => {
  const { canVoid } = usePermissions('sales');
  const { hasFeature } = useCapabilities();

  // Bad: Permission checked even if feature is OFF
  if (!canVoid) return null;
  if (!hasFeature('sales_void_orders')) return null;

  return <VoidOrderButton />;
};

// ✅ CORRECT: Combined in single expression
const OptimalPattern = () => {
  const { hasFeature } = useCapabilities();
  const { canVoid } = usePermissions('sales');

  const showVoidButton =
    hasFeature('sales_void_orders') && // Feature first
    canVoid;                           // Permission second

  return showVoidButton ? <VoidOrderButton /> : null;
};
```

**Anti-Patterns to Avoid**:
```typescript
// ❌ Don't create new objects in render
const { canCreate } = usePermissions('sales');
const config = { canCreate }; // Creates new object every render!

// ✅ Use flags directly
const { canCreate } = usePermissions('sales');
if (canCreate) { /* ... */ }

// ❌ Don't check permissions in loops
items.map(item => {
  const { canDelete } = usePermissions('materials'); // Called N times!
  return <Item canDelete={canDelete} />;
});

// ✅ Check once outside loop
const { canDelete } = usePermissions('materials');
items.map(item => (
  <Item canDelete={canDelete} />
));
```

---

## Service Layer Validation

### Pattern 1: Single Permission Check

**Best For**: Operations requiring one specific permission.

```typescript
import { requirePermission } from '@/lib/permissions/servicePermissions';
import type { AuthUser } from '@/contexts/AuthContext';

export const deleteMaterial = async (id: string, user: AuthUser) => {
  // Validate permission (throws PermissionDeniedError if fails)
  requirePermission(user, 'materials', 'delete');

  // Proceed with operation
  const { data, error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
};

// Error handling
try {
  await deleteMaterial(materialId, currentUser);
} catch (error) {
  if (isPermissionDeniedError(error)) {
    showToast('No tienes permisos para eliminar materiales', 'error');
  } else {
    showToast('Error al eliminar material', 'error');
  }
}
```

### Pattern 2: Multiple Permission Checks (OR Logic)

**Best For**: Operations that can be performed with ANY of several permissions.

```typescript
import { requireAnyPermission } from '@/lib/permissions/servicePermissions';

export const saveMaterial = async (data: Material, user: AuthUser) => {
  // Allow if user has EITHER create OR update permission
  requireAnyPermission(user, 'materials', ['create', 'update']);

  // Determine operation based on ID presence
  if (data.id) {
    // Update operation
    return supabase.from('items').update(data).eq('id', data.id);
  } else {
    // Create operation
    return supabase.from('items').insert(data);
  }
};
```

### Pattern 3: Multiple Permission Checks (AND Logic)

**Best For**: Operations requiring ALL of several permissions.

```typescript
import { requireAllPermissions } from '@/lib/permissions/servicePermissions';

export const voidAndRefundSale = async (saleId: string, user: AuthUser) => {
  // Require BOTH void AND update permissions
  requireAllPermissions(user, 'sales', ['void', 'update']);

  // Complex operation requiring multiple permissions
  await supabase
    .from('sales')
    .update({ status: 'VOIDED' })
    .eq('id', saleId);

  await supabase
    .from('payments')
    .update({ status: 'REFUNDED' })
    .eq('sale_id', saleId);
};
```

### Pattern 4: Module Access Check

**Best For**: Read operations or checking if user should see module at all.

```typescript
import { requireModuleAccess } from '@/lib/permissions/servicePermissions';

export const getMaterials = async (user: AuthUser) => {
  // Check if user can access materials module at all
  requireModuleAccess(user, 'materials');

  // User has at least read access to materials
  const { data } = await supabase
    .from('items')
    .select('*');

  return data;
};
```

### Pattern 5: Location-Based Access (Multi-Location Support)

**Best For**: Multi-tenant systems with location-based data isolation.

```typescript
import {
  requireLocationAccess,
  getAccessibleLocationIds
} from '@/lib/permissions/servicePermissions';
import type { UserWithLocation } from '@/lib/permissions/servicePermissions';

// Creating resource - validate location access
export const createSale = async (
  saleData: Sale,
  user: UserWithLocation
) => {
  requirePermission(user, 'sales', 'create');

  // Validate user can access target location
  requireLocationAccess(user, saleData.location_id);

  return supabase.from('sales').insert(saleData);
};

// Fetching resources - filter by accessible locations
export const getSales = async (user: UserWithLocation) => {
  requireModuleAccess(user, 'sales');

  const locationIds = getAccessibleLocationIds(user);

  // Admin (empty array) → No filter (access all)
  if (locationIds.length === 0) {
    return supabase.from('sales').select('*');
  }

  // Other roles → Filter by accessible locations
  return supabase
    .from('sales')
    .select('*')
    .in('location_id', locationIds);
};
```

### Error Handling

```typescript
import {
  PermissionDeniedError,
  LocationAccessError,
  isPermissionDeniedError,
  isLocationAccessError
} from '@/lib/permissions/servicePermissions';

// Granular error handling
const handleServiceError = (error: unknown) => {
  if (isPermissionDeniedError(error)) {
    const permError = error as PermissionDeniedError;
    logSecurityEvent('permission_denied', {
      userId: permError.userId,
      resource: permError.resource,
      action: permError.action
    });
    return 'No tienes permisos para esta acción';
  }

  if (isLocationAccessError(error)) {
    const locError = error as LocationAccessError;
    logSecurityEvent('location_denied', {
      userId: locError.userId,
      attemptedLocationId: locError.attemptedLocationId
    });
    return 'No tienes acceso a esta ubicación';
  }

  return 'Error desconocido';
};
```

---

## Adding New Roles

### Step-by-Step Guide

**Step 1**: Update `UserRole` type in `AuthContext.tsx`:
```typescript
// src/contexts/AuthContext.tsx
export type UserRole =
  | 'CLIENTE'
  | 'OPERADOR'
  | 'SUPERVISOR'
  | 'ADMINISTRADOR'
  | 'SUPER_ADMIN'
  | 'NEW_ROLE';  // ← Add here
```

**Step 2**: Add permissions in `PermissionsRegistry.ts`:
```typescript
// src/config/PermissionsRegistry.ts
export const ROLE_PERMISSIONS: Record<UserRole, ResourcePermissions> = {
  // ... existing roles ...

  'NEW_ROLE': {
    // Define permissions for all 26 modules
    sales: ['create', 'read', 'update'],
    materials: ['read'],
    products: ['read'],
    // ... etc for all modules
  }
};
```

**Step 3**: Add to role hierarchy:
```typescript
// src/config/PermissionsRegistry.ts
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'CLIENTE': 0,
  'OPERADOR': 1,
  'SUPERVISOR': 2,
  'NEW_ROLE': 2.5,  // Between SUPERVISOR and ADMIN
  'ADMINISTRADOR': 3,
  'SUPER_ADMIN': 4,
};
```

**Step 4**: Add default route in `roleRedirects.ts`:
```typescript
// src/lib/routing/roleRedirects.ts
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  // ... existing routes ...
  NEW_ROLE: '/admin/custom-dashboard',
};
```

**Step 5**: Update database schema:
```sql
-- Create migration: 20250122_add_new_role.sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'NEW_ROLE';

-- Update JWT claims function to recognize new role
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
-- Add NEW_ROLE to validation logic
$$;
```

**Step 6**: Write tests:
```typescript
// __tests__/permissions/new-role.test.ts
describe('NEW_ROLE permissions', () => {
  it('should have correct sales permissions', () => {
    const permissions = getResourcePermissions('NEW_ROLE', 'sales');
    expect(permissions).toContain('create');
    expect(permissions).toContain('read');
    expect(permissions).not.toContain('delete');
  });

  it('should have correct hierarchy level', () => {
    expect(isRoleHigherOrEqual('NEW_ROLE', 'SUPERVISOR')).toBe(true);
    expect(isRoleHigherOrEqual('NEW_ROLE', 'ADMINISTRADOR')).toBe(false);
  });
});
```

---

## Adding New Modules

### Step-by-Step Guide

**Step 1**: Add to `ModuleName` type in `AuthContext.tsx`:
```typescript
// src/contexts/AuthContext.tsx
export type ModuleName =
  | 'dashboard'
  | 'sales'
  // ... existing modules ...
  | 'new_module';  // ← Add here
```

**Step 2**: Add permissions for all roles in `PermissionsRegistry.ts`:
```typescript
// src/config/PermissionsRegistry.ts
export const ROLE_PERMISSIONS: Record<UserRole, ResourcePermissions> = {
  'ADMINISTRADOR': {
    // ... existing modules ...
    new_module: ['create', 'read', 'update', 'delete', 'configure'],
  },

  'SUPERVISOR': {
    // ... existing modules ...
    new_module: ['read', 'update'],
  },

  'OPERADOR': {
    // ... existing modules ...
    new_module: ['read'],
  },

  'CLIENTE': {
    // ... existing modules ...
    new_module: [],  // No access
  },

  'SUPER_ADMIN': {
    // ... existing modules ...
    new_module: ['create', 'read', 'update', 'delete', 'configure'],
  },
};
```

**Step 3**: Add to `MODULE_FEATURE_MAP` in `FeatureRegistry.ts`:
```typescript
// src/config/FeatureRegistry.ts
export const MODULE_FEATURE_MAP: Record<string, { ... }> = {
  // ... existing modules ...

  'new_module': {
    optionalFeatures: [
      'new_module_feature_1',
      'new_module_feature_2'
    ],
    description: 'New module description'
  }
};
```

**Step 4**: Create navigation entry (if needed):
```typescript
// src/lib/navigation/navigationConfig.ts or similar
{
  id: 'new_module',
  label: 'New Module',
  path: '/admin/new-module',
  icon: NewModuleIcon,
  requiredModule: 'new_module',  // Permission check
}
```

**Step 5**: Write tests:
```typescript
// __tests__/permissions/new-module.test.ts
describe('new_module permissions', () => {
  it('should allow ADMINISTRADOR full access', () => {
    expect(canAccessModule('ADMINISTRADOR', 'new_module')).toBe(true);
    expect(hasPermission('ADMINISTRADOR', 'new_module', 'create')).toBe(true);
  });

  it('should deny OPERADOR write access', () => {
    expect(hasPermission('OPERADOR', 'new_module', 'create')).toBe(false);
  });
});
```

---

## Testing Patterns

### Testing Permissions with Mock AuthContext

```typescript
// __tests__/setup/mockAuth.ts
import { AuthContextType } from '@/contexts/AuthContext';

export const createMockUser = (role: UserRole): AuthUser => ({
  id: 'test-user-id',
  email: 'test@example.com',
  role,
  isActive: true,
  roleSource: 'jwt'
});

export const createMockAuthContext = (
  role: UserRole
): AuthContextType => {
  const mockUser = createMockUser(role);

  return {
    user: mockUser,
    session: {} as Session,
    loading: false,
    isAuthenticated: true,
    isRole: (r) => Array.isArray(r) ? r.includes(role) : r === role,
    hasRole: (roles) => roles.includes(role),
    canAccessModule: (module) => canAccessModule(role, module),
    canPerformAction: (module, action) => hasPermission(role, module, action),
    canCreate: (module) => hasPermission(role, module, 'create'),
    canRead: (module) => hasPermission(role, module, 'read'),
    canUpdate: (module) => hasPermission(role, module, 'update'),
    canDelete: (module) => hasPermission(role, module, 'delete'),
    canVoid: (module) => hasPermission(role, module, 'void'),
    canApprove: (module) => hasPermission(role, module, 'approve'),
    canConfigure: (module) => hasPermission(role, module, 'configure'),
    canExport: (module) => hasPermission(role, module, 'export'),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshRole: jest.fn(),
  };
};
```

### Testing Components with RoleGuard

```typescript
// __tests__/components/SalesPage.test.tsx
import { render, screen } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import { createMockAuthContext } from '../setup/mockAuth';
import SalesPage from '@/pages/admin/operations/sales';

describe('SalesPage permissions', () => {
  it('should show void button for SUPERVISOR', () => {
    const mockAuth = createMockAuthContext('SUPERVISOR');

    render(
      <AuthContext.Provider value={mockAuth}>
        <SalesPage />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Void Sale')).toBeInTheDocument();
  });

  it('should hide void button for OPERADOR', () => {
    const mockAuth = createMockAuthContext('OPERADOR');

    render(
      <AuthContext.Provider value={mockAuth}>
        <SalesPage />
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Void Sale')).not.toBeInTheDocument();
  });
});
```

### Testing Service Layer Validations

```typescript
// __tests__/services/materialsApi.test.ts
import { createMockUser } from '../setup/mockAuth';
import { deleteMaterial } from '@/services/materialsApi';
import { PermissionDeniedError } from '@/lib/permissions/servicePermissions';

describe('materialsApi.deleteMaterial', () => {
  it('should allow ADMINISTRADOR to delete', async () => {
    const admin = createMockUser('ADMINISTRADOR');

    await expect(
      deleteMaterial('material-id', admin)
    ).resolves.not.toThrow();
  });

  it('should deny OPERADOR delete permission', async () => {
    const operator = createMockUser('OPERADOR');

    await expect(
      deleteMaterial('material-id', operator)
    ).rejects.toThrow(PermissionDeniedError);
  });

  it('should throw specific error message', async () => {
    const operator = createMockUser('OPERADOR');

    try {
      await deleteMaterial('material-id', operator);
    } catch (error) {
      expect(error).toBeInstanceOf(PermissionDeniedError);
      expect((error as PermissionDeniedError).resource).toBe('materials');
      expect((error as PermissionDeniedError).action).toBe('delete');
    }
  });
});
```

### Integration Testing (Permissions + Features)

```typescript
// __tests__/integration/sales-permissions.test.ts
describe('Sales Module Integration', () => {
  it('should respect feature flags + permissions', () => {
    // Setup: Feature ON + Permission GRANTED
    const mockCapabilities = {
      hasFeature: () => true,  // Feature enabled
    };
    const mockAuth = createMockAuthContext('SUPERVISOR');

    render(
      <CapabilitiesContext.Provider value={mockCapabilities}>
        <AuthContext.Provider value={mockAuth}>
          <SalesPage />
        </AuthContext.Provider>
      </CapabilitiesContext.Provider>
    );

    // Should show void button (feature ON + permission OK)
    expect(screen.getByText('Void Sale')).toBeInTheDocument();
  });

  it('should hide feature when feature flag is OFF', () => {
    // Setup: Feature OFF + Permission GRANTED
    const mockCapabilities = {
      hasFeature: () => false,  // Feature disabled
    };
    const mockAuth = createMockAuthContext('SUPERVISOR');

    render(
      <CapabilitiesContext.Provider value={mockCapabilities}>
        <AuthContext.Provider value={mockAuth}>
          <SalesPage />
        </AuthContext.Provider>
      </CapabilitiesContext.Provider>
    );

    // Should NOT show void button (feature OFF, permission irrelevant)
    expect(screen.queryByText('Void Sale')).not.toBeInTheDocument();
  });
});
```

---

## Related Documentation

- [ROLES.md](./ROLES.md) - Complete role reference
- [MODULES.md](./MODULES.md) - Complete module reference
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SECURITY.md](./SECURITY.md) - Security best practices
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Version**: 1.0.0
**Last Updated**: December 21, 2025
**Maintainer**: Development Team
