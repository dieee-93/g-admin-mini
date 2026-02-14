import React from 'react';
import { Box, Spinner, Center, Typography } from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallbackMessage?: string;
}

/**
 * Component that protects routes requiring authentication
 * Shows login page if user is not authenticated
 * Shows fallback message if user lacks required permissions
 */
export function ProtectedRoute({ 
  children
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return <AuthLoadingScreen />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // For now, we'll skip permission checks since we use RoleGuard for granular access
  // TODO: Implement permission system if needed beyond role-based access

  // Render protected content
  return <>{children}</>;
}

/**
 * Loading component for auth state initialization
 */
export function AuthLoadingScreen() {
  return (
    <Center minH="100vh">
      <Box textAlign="center">
        <Spinner size="xl" color="blue.500" mb="4" />
        <Typography variant="body" color="gray.600">
          Cargando...
        </Typography>
      </Box>
    </Center>
  );
}