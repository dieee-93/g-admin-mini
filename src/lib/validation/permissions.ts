import { PermissionCheck } from './types';
import { useAppStore } from '@/store/appStore';

// Permission constants
export const PERMISSIONS = {
  // Inventory permissions
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  INVENTORY_MANAGE_ALL: 'inventory.manage_all',

  // Sales permissions
  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_UPDATE: 'sales.update',
  SALES_DELETE: 'sales.delete',
  SALES_REFUND: 'sales.refund',
  SALES_VIEW_ALL: 'sales.view_all',
  SALES_REPORTS: 'sales.reports',

  // Customer permissions
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',
  CUSTOMERS_EXPORT: 'customers.export',

  // Staff permissions
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  STAFF_VIEW_PAYROLL: 'staff.view_payroll',
  STAFF_MANAGE_SCHEDULES: 'staff.manage_schedules',

  // System permissions
  SYSTEM_ADMIN: 'system.admin',
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_LOGS: 'system.logs',

  // Reports permissions
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_FINANCIAL: 'reports.financial'
} as const;

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  CASHIER: 'cashier',
  KITCHEN: 'kitchen',
  VIEWER: 'viewer'
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // All permissions for admin
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.MANAGER]: [
    // Inventory
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_DELETE,
    
    // Sales
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_UPDATE,
    PERMISSIONS.SALES_REFUND,
    PERMISSIONS.SALES_VIEW_ALL,
    PERMISSIONS.SALES_REPORTS,
    
    // Customers
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.CUSTOMERS_EXPORT,
    
    // Staff
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_MANAGE_SCHEDULES,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_FINANCIAL
  ],
  
  [ROLES.EMPLOYEE]: [
    // Inventory
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    
    // Sales
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    
    // Customers
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE
  ],
  
  [ROLES.CASHIER]: [
    // Sales
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    
    // Customers
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    
    // Inventory (limited)
    PERMISSIONS.INVENTORY_VIEW
  ],
  
  [ROLES.KITCHEN]: [
    // Inventory
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    
    // Sales (view only for orders)
    PERMISSIONS.SALES_VIEW
  ],
  
  [ROLES.VIEWER]: [
    // View-only access
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.REPORTS_VIEW
  ]
} as const;

/**
 * Checks if the current user has a specific permission
 */
export function hasPermission(permission: string): boolean {
  const { user } = useAppStore.getState();
  
  if (!user.id) {
    return false; // Not logged in
  }

  // Admin has all permissions
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  // Check explicit permissions
  if (user.permissions.includes(permission)) {
    return true;
  }

  // Check role-based permissions
  if (user.role && ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS]?.includes(permission as any)) {
    return true;
  }

  return false;
}

/**
 * Checks if the current user has a specific role
 */
export function hasRole(role: string): boolean {
  const { user } = useAppStore.getState();
  return user.role === role;
}

/**
 * Checks multiple permissions (AND logic)
 */
export function hasAllPermissions(permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(permission));
}

/**
 * Checks multiple permissions (OR logic)
 */
export function hasAnyPermission(permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(permission));
}

/**
 * Validates a permission check with context
 */
export function checkPermissions(check: PermissionCheck): boolean {
  const { action, resource, context } = check;
  const permission = `${resource}.${action}`;
  
  // Basic permission check
  if (!hasPermission(permission)) {
    return false;
  }

  // Context-based checks
  if (context) {
    // Owner check - users can modify their own data
    if (context.ownerId && context.ownerId === useAppStore.getState().user.id) {
      return true;
    }

    // Department check - managers can modify their department's data
    if (context.department && hasRole(ROLES.MANAGER)) {
      // Add logic to check if user manages this department
      return true;
    }

    // Time-based checks
    if (context.timeRestriction) {
      const now = new Date();
      const start = new Date(context.timeRestriction.start);
      const end = new Date(context.timeRestriction.end);
      
      if (now < start || now > end) {
        return false;
      }
    }

    // Value-based checks (e.g., transaction limits)
    if (context.maxValue && context.currentValue > context.maxValue) {
      return hasRole(ROLES.ADMIN) || hasRole(ROLES.MANAGER);
    }
  }

  return true;
}

/**
 * Gets all permissions for the current user
 */
export function getUserPermissions(): string[] {
  const { user } = useAppStore.getState();
  
  if (!user.id) {
    return [];
  }

  const rolePermissions = user.role ? ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [] : [];
  const allPermissions = [...new Set([...rolePermissions, ...user.permissions])];
  
  return allPermissions;
}

/**
 * Middleware to check permissions before API calls
 */
export function requirePermissions(permissions: string[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (!hasAllPermissions(permissions)) {
        throw new Error(`Insufficient permissions. Required: ${permissions.join(', ')}`);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Higher-order component to protect routes with permissions
 */
export function withPermissions<T>(
  Component: React.ComponentType<T>,
  requiredPermissions: string[],
  fallback?: React.ComponentNode
) {
  return function ProtectedComponent(props: T) {
    if (!hasAllPermissions(requiredPermissions)) {
      return fallback || (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Hook to use permissions in components
 */
export function usePermissions() {
  return {
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    checkPermissions,
    getUserPermissions,
    permissions: getUserPermissions()
  };
}