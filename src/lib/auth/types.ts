export const ROLES = {
  CLIENTE: 'CLIENTE',
  OPERADOR: 'OPERADOR',
  SUPERVISOR: 'SUPERVISOR', 
  ADMINISTRADOR: 'ADMINISTRADOR',
  SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in_at?: string;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ModuleName = 
  | 'dashboard'
  | 'operations' 
  | 'sales'
  | 'materials'
  | 'products'
  | 'staff'
  | 'scheduling'
  | 'fiscal'
  | 'settings'
  | 'customer_portal'
  | 'my_orders'
  | 'customer_menu';

export type PermissionAction = 
  | 'read'
  | 'create' 
  | 'update'
  | 'delete'
  | 'manage';

export interface ModulePermissions {
  [key: string]: PermissionAction[];
}

export interface RolePermissions {
  [moduleName: string]: PermissionAction[];
}