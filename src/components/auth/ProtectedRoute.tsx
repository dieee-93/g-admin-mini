import React from 'react';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import { useAuth } from '@/lib/auth/useAuth';
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
  children, 
  requiredPermissions = [],
  fallbackMessage = "No tienes permisos para acceder a esta sección"
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return (
        <Center minH="100vh">
          <Box textAlign="center">
            <Text fontSize="lg" color="red.500" mb={4}>
              Acceso Denegado
            </Text>
            <Text color="gray.600">
              {fallbackMessage}
            </Text>
          </Box>
        </Center>
      );
    }
  }

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
        <Spinner size="xl" color="blue.500" mb={4} />
        <Text color="gray.600">
          Cargando...
        </Text>
      </Box>
    </Center>
  );
}