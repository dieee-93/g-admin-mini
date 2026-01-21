import React from 'react';
import { Box, Stack } from '@/shared/ui';
import { Typography, CardWrapper } from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/lib/capabilities';
import type { UserRole, ModuleName, PermissionAction } from '@/contexts/AuthContext';
import { ModuleNotAvailable } from './ModuleNotAvailable';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredModule?: ModuleName;
  requiredAction?: PermissionAction;
  requireModuleActive?: boolean; // NEW: Default true
  fallback?: React.ReactNode;
}

/**
 * Component to guard content based on user roles and permissions
 */
export function RoleGuard({
  children,
  requiredRoles,
  requiredModule,
  requiredAction,
  requireModuleActive = true,
  fallback
}: RoleGuardProps) {
  const { hasRole, canAccessModule, canPerformAction, isAuthenticated } = useAuth();
  const { isModuleActive } = useFeatureFlags();

  // If user is not authenticated, show nothing (handled by ProtectedRoute)
  if (!isAuthenticated) {
    return null;
  }

  // Check role requirements
  if (requiredRoles && !hasRole(requiredRoles)) {
    return fallback || <AccessDenied reason="Rol insuficiente" />;
  }

  // Check module access (permission-based)
  if (requiredModule && !canAccessModule(requiredModule)) {
    return fallback || <AccessDenied reason="Sin acceso al módulo" />;
  }

  // Check module activation (NEW - capability-based)
  if (requiredModule && requireModuleActive && !isModuleActive(requiredModule)) {
    return (
      <ModuleNotAvailable
        moduleName={requiredModule}
        message="This module is not included in your current business profile."
        action="Contact your administrator or upgrade your plan to access this feature."
      />
    );
  }

  // Check specific action permissions
  if (requiredModule && requiredAction && !canPerformAction(requiredModule, requiredAction)) {
    return fallback || <AccessDenied reason="Sin permisos para esta acción" />;
  }

  // All checks passed children
  return <>{children}</>;
}

/**
 * Default access denied component
 */
function AccessDenied({ reason }: { reason: string }) {
  return (
    <Box p="8">
      <CardWrapper>
        <Stack direction="column" gap="4" p="8">
          <Typography variant="heading" size="4xl">🔒</Typography>
          <Typography variant="heading" size="xl" weight="bold" color="red.500">
            Acceso Denegado
          </Typography>
          <Typography variant="body" color="gray.600" textAlign="center">
            {reason}. Contacta a tu administrador si necesitas acceso.
          </Typography>
        </Stack>
      </CardWrapper>
    </Box>
  );
}

/**
 * Hook to check if content should be shown based on roles
 */
export function useRoleGuard(
  requiredRoles?: UserRole[],
  requiredModule?: ModuleName,
  requiredAction?: PermissionAction
) {
  const { hasRole, canAccessModule, canPerformAction, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  if (requiredRoles && !hasRole(requiredRoles)) return false;
  
  if (requiredModule && !canAccessModule(requiredModule)) return false;
  
  if (requiredModule && requiredAction && !canPerformAction(requiredModule, requiredAction)) {
    return false;
  }

  return true;
}