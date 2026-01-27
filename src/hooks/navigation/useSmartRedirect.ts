import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/contexts/AuthContext';
import { getDefaultRoute } from '@/lib/routing/roleRedirects';

/**
 * Hook inteligente para redirección post-login basada en rol
 * Usa la configuración centralizada de rutas
 */
export function useSmartRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const redirectAfterLogin = (fallbackPath: string = '/admin/dashboard') => {
    // Si está cargando, esperar
    if (loading) {
      return;
    }
    
    if (!user?.role) {
      // Si no hay rol, ir al fallback
      navigate(fallbackPath, { replace: true });
      return;
    }

    // Usar configuración centralizada
    const defaultRoute = getDefaultRoute(user.role);
    navigate(defaultRoute, { replace: true });
  };

  const getDefaultRouteForRole = (role?: UserRole): string => {
    return getDefaultRoute(role);
  };

  const shouldRedirectToCustomerPortal = (): boolean => {
    return user?.role === 'CLIENTE';
  };

  const shouldRedirectToAdminDashboard = (): boolean => {
    return user?.role !== 'CLIENTE' && !!user?.role;
  };

  return {
    redirectAfterLogin,
    getDefaultRouteForRole,
    shouldRedirectToCustomerPortal,
    shouldRedirectToAdminDashboard,
    currentUserRole: user?.role
  };
}