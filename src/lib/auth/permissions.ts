import { ROLES, UserRole, ModuleName, PermissionAction, RolePermissions } from './types';

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [ROLES.CLIENTE]: {
    dashboard: ['read'], // Dashboard con métricas de sus pedidos
    customer_portal: ['read', 'create', 'update'], // Portal del cliente
    my_orders: ['read', 'create'], // Sus propios pedidos
    customer_menu: ['read'], // Ver menú y productos
    operations: [], // Sin acceso a operaciones internas
    sales: [], // Sin acceso directo a ventas (solo a través de customer_portal)
    materials: [], // Sin acceso a inventario
    products: ['read'], // Solo lectura de productos para ordenar
    staff: [], // Sin acceso a personal
    scheduling: [], // Sin acceso a horarios
    fiscal: [], // Sin acceso fiscal
    settings: ['read'] // Solo configuraciones básicas de perfil
  },
  
  [ROLES.OPERADOR]: {
    dashboard: ['read'],
    operations: ['read', 'update'],
    sales: ['read', 'create', 'update'],
    materials: ['read'],
    products: ['read'],
    staff: [], // Sin acceso general, solo su propio perfil
    scheduling: ['read'], // Solo su propio horario
    fiscal: [],
    settings: []
  },
  
  [ROLES.SUPERVISOR]: {
    dashboard: ['read'],
    operations: ['read', 'create', 'update', 'delete'],
    sales: ['read', 'create', 'update', 'delete'],
    materials: ['read', 'create', 'update'],
    products: ['read', 'create', 'update', 'delete'],
    staff: ['read', 'create', 'update'], // Gestión básica del equipo
    scheduling: ['read', 'create', 'update', 'delete'],
    fiscal: ['read'],
    settings: ['read', 'update'] // Configuraciones básicas
  },
  
  [ROLES.ADMINISTRADOR]: {
    dashboard: ['read'],
    operations: ['read', 'create', 'update', 'delete', 'manage'],
    sales: ['read', 'create', 'update', 'delete', 'manage'],
    materials: ['read', 'create', 'update', 'delete', 'manage'],
    products: ['read', 'create', 'update', 'delete', 'manage'],
    staff: ['read', 'create', 'update', 'delete', 'manage'],
    scheduling: ['read', 'create', 'update', 'delete', 'manage'],
    fiscal: ['read', 'create', 'update', 'delete', 'manage'],
    settings: ['read', 'create', 'update', 'delete']
  },
  
  [ROLES.SUPER_ADMIN]: {
    dashboard: ['read', 'manage'],
    operations: ['read', 'create', 'update', 'delete', 'manage'],
    sales: ['read', 'create', 'update', 'delete', 'manage'],
    materials: ['read', 'create', 'update', 'delete', 'manage'],
    products: ['read', 'create', 'update', 'delete', 'manage'],
    staff: ['read', 'create', 'update', 'delete', 'manage'],
    scheduling: ['read', 'create', 'update', 'delete', 'manage'],
    fiscal: ['read', 'create', 'update', 'delete', 'manage'],
    settings: ['read', 'create', 'update', 'delete', 'manage']
  }
};

// Módulos que requieren roles específicos para acceso
export const MODULE_ACCESS_REQUIREMENTS: Record<ModuleName, UserRole[]> = {
  dashboard: [ROLES.CLIENTE, ROLES.OPERADOR, ROLES.SUPERVISOR, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  operations: [ROLES.OPERADOR, ROLES.SUPERVISOR, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  sales: [ROLES.OPERADOR, ROLES.SUPERVISOR, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  materials: [ROLES.SUPERVISOR, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  products: [ROLES.CLIENTE, ROLES.SUPERVISOR, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  staff: [ROLES.SUPERVISOR, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  scheduling: [ROLES.OPERADOR, ROLES.SUPERVISOR, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  fiscal: [ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  settings: [ROLES.CLIENTE, ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
  customer_portal: [ROLES.CLIENTE],
  my_orders: [ROLES.CLIENTE],
  customer_menu: [ROLES.CLIENTE]
};

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(userRole: UserRole | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Verifica si un usuario puede acceder a un módulo
 */
export function canAccessModule(userRole: UserRole | undefined, module: ModuleName): boolean {
  if (!userRole) return false;
  const requiredRoles = MODULE_ACCESS_REQUIREMENTS[module];
  return requiredRoles.includes(userRole);
}

/**
 * Verifica si un usuario puede realizar una acción específica en un módulo
 */
export function canPerformAction(
  userRole: UserRole | undefined, 
  module: ModuleName, 
  action: PermissionAction
): boolean {
  if (!userRole) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const modulePermissions = rolePermissions[module];
  
  if (!modulePermissions) return false;
  
  return modulePermissions.includes(action) || modulePermissions.includes('manage');
}

/**
 * Obtiene todos los módulos accesibles para un rol
 */
export function getAccessibleModules(userRole: UserRole | undefined): ModuleName[] {
  if (!userRole) return [];
  
  return Object.keys(MODULE_ACCESS_REQUIREMENTS).filter(module => 
    canAccessModule(userRole, module as ModuleName)
  ) as ModuleName[];
}

/**
 * Obtiene las acciones permitidas para un módulo específico
 */
export function getModuleActions(userRole: UserRole | undefined, module: ModuleName): PermissionAction[] {
  if (!userRole) return [];
  
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions[module] || [];
}

/**
 * Verifica si un rol es superior a otro (para validar asignaciones)
 */
export function isHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy = {
    [ROLES.CLIENTE]: -1, // Cliente es el nivel más bajo
    [ROLES.OPERADOR]: 0,
    [ROLES.SUPERVISOR]: 1,
    [ROLES.ADMINISTRADOR]: 2,
    [ROLES.SUPER_ADMIN]: 3
  };
  
  return roleHierarchy[userRole] > roleHierarchy[targetRole];
}