import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Spinner, Stack } from '@chakra-ui/react';
import { Typography } from '@/shared/ui';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component using new auth system
 * Protects routes based on authentication and optional role requirements
 */
export function ProtectedRouteNew({ 
  children, 
  requiredRoles, 
  fallback,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasRole } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="bg.canvas"
      >
        <Stack direction="column" gap="4">
          <Spinner size="xl" color="blue.500" thickness="3px" />
          <Typography variant="body" color="text.secondary">
            Verificando autenticación...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirements if specified
  if (requiredRoles && !hasRole(requiredRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Default access denied component
    return (
      <Box p="8" minH="50vh" display="flex" alignItems="center" justifyContent="center">
        <Stack direction="column" gap="4" textAlign="center">
          <Typography variant="body" fontSize="6xl">🔒</Typography>
          <Typography variant="body" fontSize="xl" fontWeight="bold" color="red.500">
            Acceso Denegado
          </Typography>
          <Typography variant="body" color="text.secondary">
            No tienes permisos suficientes para acceder a esta página.
          </Typography>
          <Typography variant="body" fontSize="sm" color="text.muted">
            Tu rol: {user?.role || 'Sin rol asignado'}
          </Typography>
          <Typography variant="body" fontSize="sm" color="text.muted">
            Roles requeridos: {requiredRoles?.join(', ')}
          </Typography>
        </Stack>
      </Box>
    );
  }

  // All checks passed children
  return <>{children}</>;
}

/**
 * Hook to check if user has access to content
 */
export function useRouteAccess(requiredRoles?: UserRole[]) {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) return false;
  if (requiredRoles && !hasRole(requiredRoles)) return false;
  
  return true;
}

/**
 * Component to conditionally render content based on role
 */
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuardNew({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth();
  
  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}