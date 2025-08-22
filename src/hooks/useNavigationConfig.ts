/**
 * Hook que genera la configuración de navegación
 * basado en el sistema de rutas centralizado
 */

import { useMemo } from 'react';
import { 
  HomeIcon, 
  CubeIcon, 
  CogIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { getNavRoutes } from '@/config/routes';
import type { NavigationModule, NavigationSubModule } from '@/contexts/NavigationContext';

// Mapeo de iconos por nombre
const iconMap = {
  HomeIcon,
  CubeIcon,
  CogIcon,
  CurrencyDollarIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ShoppingCartIcon: ShoppingBagIcon // Fallback
} as const;

// Mapeo de colores por módulo
const colorMap: Record<string, string> = {
  '/admin/dashboard': 'blue',
  '/admin/sales': 'green',
  '/admin/operations': 'orange',
  '/admin/customers': 'purple',
  '/admin/materials': 'teal',
  '/admin/products': 'pink',
  '/admin/fiscal': 'yellow',
  '/admin/staff': 'indigo',
  '/admin/scheduling': 'cyan',
  '/admin/settings': 'gray',
  '/app/portal': 'blue',
  '/app/menu': 'green',
  '/app/orders': 'orange',
  '/app/settings': 'gray'
};

export function useNavigationConfig() {
  const { user } = useAuth();

  const modules: NavigationModule[] = useMemo(() => {
    const routes = getNavRoutes(user?.role);
    
    return routes.map(route => {
      const iconName = route.icon as keyof typeof iconMap;
      const Icon = iconMap[iconName] || HomeIcon;
      
      const subModules: NavigationSubModule[] = route.children?.map(child => ({
        id: child.path,
        title: child.title,
        path: child.path,
        icon: Icon, // Por ahora usamos el mismo icono
        description: child.title
      })) || [];

      return {
        id: route.path,
        title: route.title,
        icon: Icon,
        color: colorMap[route.path] || 'gray',
        path: route.path,
        description: route.title,
        badge: 0,
        isActive: false,
        isExpandable: subModules.length > 0,
        isExpanded: false,
        subModules: subModules.length > 0 ? subModules : undefined
      };
    });
  }, [user?.role]);

  return { modules };
}