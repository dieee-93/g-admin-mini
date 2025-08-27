import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardRoleRouterProps {
  children: React.ReactNode;
}

/**
 * Router que redirige usuarios CLIENTE del dashboard administrativo 
 * a su portal personalizado
 */
export function DashboardRoleRouter({ children }: DashboardRoleRouterProps) {
  const { isCliente } = useAuth();

  // Si es usuario CLIENTE, redirigir a customer-portal
  if (isCliente()) {
    return <Navigate to="/customer-portal" replace />;
  }

  // Para otros roles, mostrar dashboard normal
  return <>{children}</>;
}