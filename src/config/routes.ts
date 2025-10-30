/**
 * Sistema de Rutas Centralizado - G-Admin Mini
 * Configuración única para rutas, navegación y permisos
 */

import type { UserRole } from '@/contexts/AuthContext';

// Tipo para definición de rutas
export interface RouteConfig {
  path: string;
  component: string;
  title: string;
  icon?: string;
  requiredRoles?: UserRole[];
  requiredModule?: string;
  children?: RouteConfig[];
  showInNav?: boolean;
}

// 🔧 RUTAS DE CONFIGURACIÓN INICIAL
export const setupRoutes: RouteConfig[] = [
  {
    path: '/setup',
    component: 'SetupWizard',
    title: 'Configuración Inicial',
    icon: 'CogIcon',
    showInNav: false
  },
  {
    path: '/setup/company',
    component: 'CompanyConfigurationStep',
    title: 'Configuración de Empresa',
    showInNav: false
  },
  {
    path: '/setup/admin',
    component: 'AdminUserCreationStep',
    title: 'Crear Usuario Administrador',
    showInNav: false
  },
  {
    path: '/setup/data',
    component: 'BasicDataImportStep',
    title: 'Importar Datos Básicos',
    showInNav: false
  },
  {
    path: '/setup/tutorial',
    component: 'OnboardingTutorialStep',
    title: 'Tutorial de Introducción',
    showInNav: false
  }
];

// 🔧 RUTAS ADMINISTRATIVAS
export const adminRoutes: RouteConfig[] = [
  {
    path: '/admin/dashboard',
    component: 'Dashboard',
    title: 'Dashboard',
    icon: 'HomeIcon',
    requiredRoles: ['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN'],
    showInNav: true
  },
  {
    path: '/admin/sales',
    component: 'LazySalesPage',
    title: 'Ventas',
    icon: 'CurrencyDollarIcon',
    requiredModule: 'sales',
    showInNav: true
  },
  {
    path: '/admin/operations/floor',
    component: 'LazyFloorPage',
    title: 'Floor Management',
    icon: 'BuildingStorefrontIcon',
    requiredModule: 'operations',
  },
  {
    path: '/admin/operations/kitchen',
    component: 'LazyKitchenPage',
    title: 'Kitchen Display',
    icon: 'FireIcon',
    requiredModule: 'operations',
    showInNav: true
  },
  {
    path: '/admin/customers',
    component: 'LazyCustomersPage',
    title: 'Clientes',
    icon: 'UsersIcon',
    requiredModule: 'sales',
    showInNav: true
  },
  {
    path: '/admin/materials',
    component: 'LazyStockLab',
    title: 'StockLab',
    icon: 'CubeIcon',
    requiredModule: 'materials',
    showInNav: true,
    children: [
      {
        path: '/admin/materials/abc-analysis',
        component: 'ABCAnalysisView',
        title: 'Análisis ABC',
        requiredModule: 'materials'
      },
      {
        path: '/admin/materials/supply-chain',
        component: 'LazySupplyChainPage',
        title: 'Cadena de Suministro',
        requiredModule: 'materials'
      },
      {
        path: '/admin/materials/procurement',
        component: 'LazyProcurementPage',
        title: 'Compras',
        requiredModule: 'materials'
      }
    ]
  },
  {
    path: '/admin/products',
    component: 'LazyProductsPage',
    title: 'Productos',
    icon: 'ShoppingBagIcon',
    requiredModule: 'products',
    showInNav: true
  },
  {
    path: '/admin/fiscal',
    component: 'LazyFiscalPage',
    title: 'Fiscal',
    icon: 'DocumentTextIcon',
    requiredModule: 'fiscal',
    showInNav: true
  },
  {
    path: '/admin/staff',
    component: 'LazyStaffPage',
    title: 'Personal',
    icon: 'UserGroupIcon',
    requiredModule: 'staff',
    showInNav: true
  },
  {
    path: '/admin/scheduling',
    component: 'LazySchedulingPage',
    title: 'Horarios',
    icon: 'CalendarIcon',
    requiredModule: 'scheduling',
    showInNav: true
  },
  {
    path: '/admin/settings',
    component: 'LazySettingsPage',
    title: 'Configuración',
    icon: 'Cog6ToothIcon',
    requiredModule: 'settings',
    showInNav: true,
    children: [
      {
        path: '/admin/settings/integrations',
        component: 'IntegrationsView',
        title: 'Integraciones',
        requiredRoles: ['ADMINISTRADOR', 'SUPER_ADMIN']
      },
      {
        path: '/admin/settings/diagnostics',
        component: 'DiagnosticsView',
        title: 'Diagnósticos',
        requiredRoles: ['ADMINISTRADOR', 'SUPER_ADMIN']
      },
      {
        path: '/admin/settings/reporting',
        component: 'ReportingView',
        title: 'Reportes',
        requiredRoles: ['ADMINISTRADOR', 'SUPER_ADMIN']
      },
      {
        path: '/admin/settings/enterprise',
        component: 'EnterpriseView',
        title: 'Enterprise',
        requiredRoles: ['SUPER_ADMIN']
      }
    ]
  },
  {
    path: '/admin/debug/theme-test',
    component: 'ThemeTestPage',
    title: 'Theme Test',
    icon: 'SwatchIcon',
    requiredRoles: ['SUPER_ADMIN'],
    showInNav: false // Hidden from navigation, accessible via direct URL
  }
];

// 📱 RUTAS CUSTOMER APP
export const appRoutes: RouteConfig[] = [
  {
    path: '/app/portal',
    component: 'CustomerPortal',
    title: 'Portal',
    icon: 'HomeIcon',
    requiredRoles: ['CLIENTE'],
    showInNav: true
  },
  {
    path: '/app/menu',
    component: 'CustomerMenu',
    title: 'Menú',
    icon: 'DocumentTextIcon',
    requiredRoles: ['CLIENTE'],
    showInNav: true
  },
  {
    path: '/app/orders',
    component: 'MyOrders',
    title: 'Mis Pedidos',
    icon: 'ShoppingCartIcon',
    requiredRoles: ['CLIENTE'],
    showInNav: true
  },
  {
    path: '/app/settings',
    component: 'CustomerSettings',
    title: 'Configuración',
    icon: 'Cog6ToothIcon',
    requiredRoles: ['CLIENTE'],
    showInNav: true
  }
];

// 🌐 RUTAS PÚBLICAS
export const publicRoutes: RouteConfig[] = [
  {
    path: '/',
    component: 'LandingPage',
    title: 'Inicio'
  },
  {
    path: '/admin',
    component: 'AdminPortalPage',
    title: 'Portal Admin'
  },
  {
    path: '/login',
    component: 'CustomerLoginPage',
    title: 'Login Cliente'
  },
  {
    path: '/admin/login',
    component: 'AdminLoginPage',
    title: 'Login Admin'
  }
];

// 🔗 MAPEO DE RUTAS POR ROL
export const roleRoutes: Record<UserRole, string> = {
  CLIENTE: '/app/portal',
  OPERADOR: '/admin/operations',
  SUPERVISOR: '/admin/dashboard',
  ADMINISTRADOR: '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard'
};

// 🛠️ UTILIDADES
export const getAllRoutes = (): RouteConfig[] => {
  const flattenRoutes = (routes: RouteConfig[]): RouteConfig[] => {
    return routes.reduce((acc, route) => {
      acc.push(route);
      if (route.children) {
        acc.push(...flattenRoutes(route.children));
      }
      return acc;
    }, [] as RouteConfig[]);
  };

  return [
    ...publicRoutes,
    ...setupRoutes,
    ...flattenRoutes(adminRoutes),
    ...flattenRoutes(appRoutes)
  ];
};

export const getNavRoutes = (userRole?: UserRole): RouteConfig[] => {
  if (!userRole) return [];
  
  if (userRole === 'CLIENTE') {
    return appRoutes.filter(route => route.showInNav);
  }
  
  return adminRoutes.filter(route => route.showInNav);
};

export const getDefaultRoute = (userRole?: UserRole): string => {
  if (!userRole) return '/admin/dashboard';
  return roleRoutes[userRole];
};