import React from 'react';
import { Box, Stack } from '@chakra-ui/react';
import { Typography } from '@/shared/ui';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole, ModuleName, PermissionAction } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredModule?: ModuleName;
  requiredAction?: PermissionAction;
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
  fallback
}: RoleGuardProps) {
  const { hasRole, canAccessModule, canPerformAction, isAuthenticated } = useAuth();

  // If user is not authenticated, show nothing (handled by ProtectedRoute)
  if (!isAuthenticated) {
    return null;
  }

  // Check role requirements
  if (requiredRoles && !hasRole(requiredRoles)) {
    return fallback || <AccessDenied reason="Rol insuficiente" />;
  }

  // Check module access
  if (requiredModule && !canAccessModule(requiredModule)) {
    return fallback || <AccessDenied reason="Sin acceso al módulo" />;
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
    <Box p={8}>
      <CardWrapper>
        <Stack direction="column" gap={4} p={8}>
          <Typography variant="heading" size="6xl">🔒</Typography>
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