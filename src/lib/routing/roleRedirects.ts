/**
 * Role-based default routes
 * Determines where users land after login based on their role
 */

import type { UserRole } from '@/contexts/AuthContext';

/**
 * Maps user roles to their default landing routes
 */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  CLIENTE: '/app/portal',
  OPERADOR: '/admin/operations/sales', // Operators go directly to POS
  SUPERVISOR: '/admin/dashboard',
  ADMINISTRADOR: '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard'
};

/**
 * Get the default route for a user role
 * @param userRole - User's role
 * @returns Default route path for that role
 */
export function getDefaultRoute(userRole?: UserRole): string {
  if (!userRole) return '/admin/dashboard';
  return ROLE_DEFAULT_ROUTES[userRole];
}
