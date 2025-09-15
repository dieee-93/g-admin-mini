// User permissions and roles types

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
}

export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'manage';

export interface UserPermissions {
  user_id: string;
  role_id: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}