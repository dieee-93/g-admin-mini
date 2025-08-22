import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserRole,
  ModuleName,
  PermissionAction
} from './types';
import {
  hasRole,
  canAccessModule,
  canPerformAction,
  getAccessibleModules,
  getModuleActions,
  isHigherRole
} from './permissions';

/**
 * Hook para control de acceso basado en roles
 */
export function useRoleAccess() {
  const { user } = useAuth();

  const checkRole = useCallback((requiredRoles: UserRole[]) => {
    return hasRole(user?.role, requiredRoles);
  }, [user?.role]);

  const checkModuleAccess = useCallback((module: ModuleName) => {
    return canAccessModule(user?.role, module);
  }, [user?.role]);

  const checkAction = useCallback((module: ModuleName, action: PermissionAction) => {
    return canPerformAction(user?.role, module, action);
  }, [user?.role]);

  const getAccessibleModuleList = useCallback(() => {
    return getAccessibleModules(user?.role);
  }, [user?.role]);

  const getAvailableActions = useCallback((module: ModuleName) => {
    return getModuleActions(user?.role, module);
  }, [user?.role]);

  const checkHigherRole = useCallback((targetRole: UserRole) => {
    if (!user?.role) return false;
    return isHigherRole(user.role, targetRole);
  }, [user?.role]);

  // Shortcuts para roles específicos
  const isCliente = useCallback(() => {
    return user?.role === 'CLIENTE';
  }, [user?.role]);

  const isOperador = useCallback(() => {
    return user?.role === 'OPERADOR';
  }, [user?.role]);

  const isSupervisor = useCallback(() => {
    return user?.role === 'SUPERVISOR';
  }, [user?.role]);

  const isAdministrador = useCallback(() => {
    return user?.role === 'ADMINISTRADOR';
  }, [user?.role]);

  const isSuperAdmin = useCallback(() => {
    return user?.role === 'SUPER_ADMIN';
  }, [user?.role]);

  // Permisos de gestión
  const canManageUsers = useCallback(() => {
    return checkRole(['SUPER_ADMIN']);
  }, [checkRole]);

  const canManageSettings = useCallback(() => {
    return checkRole(['ADMINISTRADOR', 'SUPER_ADMIN']);
  }, [checkRole]);

  const canViewReports = useCallback(() => {
    return checkRole(['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']);
  }, [checkRole]);

  const canManageInventory = useCallback(() => {
    return checkRole(['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']);
  }, [checkRole]);

  const canManageStaff = useCallback(() => {
    return checkRole(['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN']);
  }, [checkRole]);

  // Permisos específicos para clientes
  const canPlaceOrders = useCallback(() => {
    return checkRole(['CLIENTE']);
  }, [checkRole]);

  const canViewOwnOrders = useCallback(() => {
    return checkRole(['CLIENTE']);
  }, [checkRole]);

  const canAccessCustomerPortal = useCallback(() => {
    return checkRole(['CLIENTE']);
  }, [checkRole]);

  return {
    // Usuario actual
    currentUser: user,
    currentRole: user?.role,
    
    // Verificaciones básicas
    hasRole: checkRole,
    canAccessModule: checkModuleAccess,
    canPerformAction: checkAction,
    
    // Utilidades
    getAccessibleModules: getAccessibleModuleList,
    getModuleActions: getAvailableActions,
    isHigherRole: checkHigherRole,
    
    // Shortcuts de roles
    isCliente,
    isOperador,
    isSupervisor,
    isAdministrador,
    isSuperAdmin,
    
    // Permisos específicos para staff
    canManageUsers,
    canManageSettings,
    canViewReports,
    canManageInventory,
    canManageStaff,
    
    // Permisos específicos para clientes
    canPlaceOrders,
    canViewOwnOrders,
    canAccessCustomerPortal,
    
    // Estados de autorización
    isAuthenticated: !!user,
    hasValidRole: !!user?.role
  };
}