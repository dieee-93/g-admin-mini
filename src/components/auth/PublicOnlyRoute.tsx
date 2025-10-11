import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartRedirect } from '@/hooks/useSmartRedirect';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que solo permite acceso a usuarios NO autenticados.
 * Si el usuario ya está logueado, lo redirige a su ruta correspondiente según su rol.
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const { getDefaultRouteForRole } = useSmartRedirect();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  // Si está autenticado, redirigir a su ruta apropiada
  if (isAuthenticated && user) {
    const defaultRoute = getDefaultRouteForRole(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  // Si no está autenticado, mostrar contenido público
  return <>{children}</>;
}