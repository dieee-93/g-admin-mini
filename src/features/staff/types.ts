// src/features/staff/types.ts
// Tipos para gestión de personal/empleados

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: EmployeePosition;
  hire_date: string;
  status: EmployeeStatus;
  hourly_rate?: number;
  permissions: EmployeePermission[];
  created_at: string;
  updated_at: string;
}

export interface EmployeePosition {
  id: string;
  name: string;
  department: Department;
  level: 'junior' | 'senior' | 'supervisor' | 'manager';
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
}

export type EmployeeStatus = 
  | 'active' 
  | 'inactive' 
  | 'on_leave' 
  | 'terminated';

export interface EmployeePermission {
  id: string;
  module: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  granted_by: string;
  granted_at: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  phone?: string;
  position_id: string;
  hire_date: string;
  hourly_rate?: number;
  permissions: string[];
}