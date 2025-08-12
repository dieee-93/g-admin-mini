import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  CogIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// ✅ Types definidos según arquitectura v2.0
export interface NavigationModule {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  path: string;
  description?: string;
  badge?: number;
  isActive?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  color?: string;
  shortcut?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

export interface NavigationContextType {
  // Current state
  currentModule: NavigationModule | null;
  breadcrumbs: BreadcrumbItem[];
  quickActions: QuickAction[];
  
  // Navigation methods
  navigate: (moduleId: string, subPath?: string) => void;
  navigateBack: () => void;
  
  // Navigation state
  canNavigateBack: boolean;
  navigationHistory: string[];
  
  // Layout state
  isMobile: boolean;
  showBottomNav: boolean;
  showSidebar: boolean;
  sidebarCollapsed: boolean;
  
  // Navigation config
  modules: NavigationModule[];
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  updateModuleBadge: (moduleId: string, count: number) => void;
  setQuickActions: (actions: QuickAction[]) => void;
}

// ✅ Módulos principales - Organizados por dominios arquitectónicos según ARCHITECTURE_ROADMAP.md
const NAVIGATION_MODULES: NavigationModule[] = [
  // 🏢 BUSINESS OPERATIONS DOMAIN
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: HomeIcon,
    color: 'blue',
    path: '/',
    description: 'Centro de comando'
  },
  {
    id: 'sales',
    title: 'Ventas',
    icon: CurrencyDollarIcon,
    color: 'teal',
    path: '/sales',
    description: 'POS + QR Ordering + Payments'
  },
  {
    id: 'operations',
    title: 'Operaciones',
    icon: ChartBarIcon,
    color: 'cyan',
    path: '/operations',
    description: 'Cocina + Mesas + Monitoreo'
  },
  {
    id: 'customers',
    title: 'Clientes',
    icon: UsersIcon,
    color: 'pink',
    path: '/customers',
    description: 'RFM Analytics + Segmentación'
  },
  
  // 🏭 SUPPLY CHAIN DOMAIN  
  {
    id: 'materials',
    title: 'Materials',
    icon: CubeIcon,
    color: 'green',
    path: '/materials',
    description: 'Inventario + Supply Chain Intelligence'
  },
  {
    id: 'products',
    title: 'Products',
    icon: CogIcon,
    color: 'purple',
    path: '/products',
    description: 'Menu Engineering + Cost Analysis'
  },
  
  // 💰 FINANCIAL DOMAIN
  {
    id: 'fiscal',
    title: 'Fiscal',
    icon: DocumentTextIcon,
    color: 'red',
    path: '/fiscal',
    description: 'Facturación AFIP + Impuestos'
  },
  
  // 👨‍💼 WORKFORCE DOMAIN
  {
    id: 'staff',
    title: 'Staff',
    icon: UserGroupIcon,
    color: 'indigo',
    path: '/staff',
    description: 'Gestión de personal'
  },
  {
    id: 'scheduling',
    title: 'Scheduling',
    icon: CalendarDaysIcon,
    color: 'violet',
    path: '/scheduling',
    description: 'Horarios + Coverage Planning'
  },
  
  // 🔧 INTELLIGENCE & TOOLS
  {
    id: 'tools',
    title: 'Tools',
    icon: WrenchScrewdriverIcon,
    color: 'amber',
    path: '/tools',
    description: 'Intelligence + Diagnostics + Admin'
  },
  {
    id: 'settings',
    title: 'Configuración',
    icon: Cog6ToothIcon,
    color: 'gray',
    path: '/settings',
    description: 'Business Profile + Integraciones'
  }
];

// ✅ Quick actions por contexto según arquitectura - moved to inside NavigationProvider for navigate access
/* const QUICK_ACTIONS_BY_MODULE: Record<string, QuickAction[]> = {
  dashboard: [
    {
      id: 'add-stock',
      label: 'Agregar Stock',
      icon: CubeIcon,
      action: () => console.log('Add stock'),
      color: 'green'
    },
    {
      id: 'new-sale',
      label: 'Nueva Venta',
      icon: CurrencyDollarIcon,
      action: () => console.log('New sale'),
      color: 'teal'
    },
    {
      id: 'create-item',
      label: 'Crear Item',
      icon: CubeIcon,
      action: () => console.log('Create item'),
      color: 'blue'
    }
  ],
  materials: [
    {
      id: 'add-stock',
      label: 'Agregar Stock',
      icon: CubeIcon,
      action: () => console.log('Add stock'),
      color: 'green'
    },
    {
      id: 'adjust-stock',
      label: 'Ajustar Stock',
      icon: Cog6ToothIcon,
      action: () => console.log('Adjust stock'),
      color: 'yellow'
    },
    {
      id: 'new-item',
      label: 'Nuevo Item',
      icon: CubeIcon,
      action: () => console.log('New item'),
      color: 'blue'
    }
  ],
  products: [
    {
      id: 'calculate-cost',
      label: 'Calcular Costo',
      icon: CogIcon,
      action: () => console.log('Calculate cost'),
      color: 'purple'
    },
    {
      id: 'new-recipe',
      label: 'Nueva Receta',
      icon: CogIcon,
      action: () => console.log('New recipe'),
      color: 'purple'
    },
    {
      id: 'use-template',
      label: 'Usar Template',
      icon: CogIcon,
      action: () => console.log('Use template'),
      color: 'gray'
    }
  ],
  sales: [
    {
      id: 'new-sale',
      label: 'Nueva Venta',
      icon: CurrencyDollarIcon,
      action: () => console.log('New sale'),
      color: 'teal'
    },
    {
      id: 'add-customer',
      label: 'Agregar Cliente',
      icon: UsersIcon,
      action: () => console.log('Add customer'),
      color: 'pink'
    },
    {
      id: 'check-stock',
      label: 'Verificar Stock',
      icon: CubeIcon,
      action: () => console.log('Check stock'),
      color: 'green'
    }
  ],
  customers: [
    {
      id: 'new-customer',
      label: 'Nuevo Cliente',
      icon: UsersIcon,
      action: () => console.log('New customer'),
      color: 'pink'
    },
    {
      id: 'view-sales',
      label: 'Ver Ventas',
      icon: CurrencyDollarIcon,
      action: () => console.log('View sales'),
      color: 'teal'
    },
    {
      id: 'contact',
      label: 'Contactar',
      icon: UsersIcon,
      action: () => console.log('Contact'),
      color: 'blue'
    }
  ],
  operations: [
    {
      id: 'planning-view',
      label: 'Planificación',
      icon: ChartBarIcon,
      action: () => console.log('View planning'),
      color: 'cyan'
    },
    {
      id: 'kitchen-view',
      label: 'Vista Cocina',
      icon: CogIcon,
      action: () => console.log('Kitchen view'),
      color: 'purple'
    },
    {
      id: 'tables-view',
      label: 'Gestión Mesas',
      icon: UsersIcon,
      action: () => console.log('Tables view'),
      color: 'blue'
    }
  ],
  staff: [
    {
      id: 'new-employee',
      label: 'Nuevo Empleado',
      icon: UserGroupIcon,
      action: () => console.log('New employee'),
      color: 'indigo'
    },
    {
      id: 'performance-review',
      label: 'Nueva Evaluación',
      icon: ChartBarIcon,
      action: () => console.log('New performance review'),
      color: 'purple'
    },
    {
      id: 'schedule-training',
      label: 'Programar Entrenamiento',
      icon: CalendarDaysIcon,
      action: () => console.log('Schedule training'),
      color: 'orange'
    }
  ],
  fiscal: [
    {
      id: 'generate-invoice',
      label: 'Nueva Factura',
      icon: DocumentTextIcon,
      action: () => console.log('Generate invoice'),
      color: 'red'
    },
    {
      id: 'afip-status',
      label: 'Estado AFIP',
      icon: CogIcon,
      action: () => console.log('Check AFIP status'),
      color: 'green'
    },
    {
      id: 'tax-report',
      label: 'Reporte Impuestos',
      icon: ChartBarIcon,
      action: () => console.log('Generate tax report'),
      color: 'purple'
    },
    {
      id: 'financial-reports',
      label: 'Reportes Financieros',
      icon: CurrencyDollarIcon,
      action: () => console.log('View financial reports'),
      color: 'orange'
    }
  ],
  settings: [
    {
      id: 'business-profile',
      label: 'Perfil del Negocio',
      icon: CogIcon,
      action: () => console.log('Edit business profile'),
      color: 'gray'
    },
    {
      id: 'tax-config',
      label: 'Configurar Impuestos',
      icon: WrenchScrewdriverIcon,
      action: () => console.log('Configure taxes'),
      color: 'yellow'
    },
    {
      id: 'user-permissions',
      label: 'Gestionar Usuarios',
      icon: UserGroupIcon,
      action: () => console.log('Manage users'),
      color: 'purple'
    }
  ],
  tools: [
    {
      id: 'recipe-intelligence',
      label: 'Recipe Intelligence',
      icon: CogIcon,
      action: () => console.log('Recipe intelligence'),
      color: 'orange'
    },
    {
      id: 'business-analytics',
      label: 'Business Analytics',
      icon: ChartBarIcon,
      action: () => console.log('Business analytics'),
      color: 'purple'
    },
    {
      id: 'diagnostics',
      label: 'Diagnósticos',
      icon: WrenchScrewdriverIcon,
      action: () => console.log('System diagnostics'),
      color: 'yellow'
    }
  ]
}; */

// ✅ Context creation
const NavigationContext = createContext<NavigationContextType | null>(null);

// ✅ Mobile detection hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// ✅ NavigationProvider component
interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Responsive state - Mobile-first approach según arquitectura
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // ✅ Navigation state
  const [modules, setModules] = useState<NavigationModule[]>(NAVIGATION_MODULES);
  const [currentModule, setCurrentModule] = useState<NavigationModule | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isTablet);

  // ✅ Derived state
  const showBottomNav = isMobile;

  // ✅ Quick actions with real navigation
  const getQuickActionsForModule = (moduleId: string): QuickAction[] => {
    switch (moduleId) {
      case 'tools':
        return [
          {
            id: 'recipe-intelligence',
            label: 'Recipe Intelligence',
            icon: CogIcon,
            action: () => navigate('/tools/intelligence/recipes'),
            color: 'orange'
          },
          {
            id: 'business-analytics',
            label: 'Business Analytics',
            icon: ChartBarIcon,
            action: () => navigate('/tools/intelligence/analytics'),
            color: 'purple'
          },
          {
            id: 'menu-engineering',
            label: 'Menu Engineering',
            icon: WrenchScrewdriverIcon,
            action: () => navigate('/tools/intelligence/menu-engineering'),
            color: 'blue'
          },
          {
            id: 'diagnostics',
            label: 'Diagnósticos',
            icon: WrenchScrewdriverIcon,
            action: () => navigate('/tools/operational/diagnostics'),
            color: 'yellow'
          }
        ];
      case 'sales':
        return [
          {
            id: 'new-sale',
            label: 'Nueva Venta',
            icon: CurrencyDollarIcon,
            action: () => navigate('/sales'),
            color: 'teal'
          },
          {
            id: 'add-customer',
            label: 'Agregar Cliente',
            icon: UsersIcon,
            action: () => navigate('/customers'),
            color: 'pink'
          },
          {
            id: 'check-stock',
            label: 'Verificar Stock',
            icon: CubeIcon,
            action: () => navigate('/materials'),
            color: 'green'
          }
        ];
      case 'materials':
        return [
          {
            id: 'add-stock',
            label: 'Agregar Stock',
            icon: CubeIcon,
            action: () => navigate('/materials'),
            color: 'green'
          },
          {
            id: 'adjust-stock',
            label: 'Ajustar Stock',
            icon: Cog6ToothIcon,
            action: () => navigate('/materials'),
            color: 'yellow'
          },
          {
            id: 'abc-analysis',
            label: 'ABC Analysis',
            icon: ChartBarIcon,
            action: () => navigate('/tools/intelligence/abc-analysis'),
            color: 'blue'
          }
        ];
      case 'products':
        return [
          {
            id: 'new-recipe',
            label: 'Nueva Receta',
            icon: CogIcon,
            action: () => navigate('/tools/intelligence/recipes'),
            color: 'purple'
          },
          {
            id: 'menu-engineering',
            label: 'Menu Engineering',
            icon: ChartBarIcon,
            action: () => navigate('/tools/intelligence/menu-engineering'),
            color: 'blue'
          }
        ];
      default:
        return [];
    }
  };
  const showSidebar = !isMobile;
  const canNavigateBack = navigationHistory.length > 1;

  // ✅ Find current module based on location
  useEffect(() => {
    const path = location.pathname;
    let foundModule = modules.find(module => {
      if (module.path === '/' && path === '/') return true;
      if (module.path !== '/' && path.startsWith(module.path)) return true;
      return false;
    });

    // Default to dashboard if no match
    if (!foundModule) {
      foundModule = modules.find(module => module.id === 'dashboard') || modules[0];
    }

    setCurrentModule(foundModule);

    // ✅ Update quick actions based on current module
    const moduleActions = getQuickActionsForModule(foundModule.id);
    setQuickActions(moduleActions);

    // ✅ Update breadcrumbs
    updateBreadcrumbs(foundModule, path);

    // ✅ Update navigation history
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== path) {
        newHistory.push(path);
        // Keep only last 10 items for performance
        return newHistory.slice(-10);
      }
      return newHistory;
    });
  }, [location.pathname, modules]);

  // ✅ Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet) {
      setSidebarCollapsed(true);
    } else if (isDesktop) {
      setSidebarCollapsed(false);
    }
  }, [isTablet, isDesktop]);

  // ✅ Update breadcrumbs function
  const updateBreadcrumbs = useCallback((module: NavigationModule, path: string) => {
    const crumbs: BreadcrumbItem[] = [];

    // Always add dashboard as root (unless we're on dashboard)
    if (module.id !== 'dashboard') {
      crumbs.push({
        label: 'Dashboard',
        path: '/',
        isActive: false
      });
    }

    // Add current module
    crumbs.push({
      label: module.title,
      path: module.path,
      isActive: true
    });

    // Add sub-path if exists
    if (path !== module.path && path.startsWith(module.path)) {
      const subPath = path.replace(module.path, '').replace(/^\//, '');
      if (subPath) {
        crumbs.push({
          label: subPath.charAt(0).toUpperCase() + subPath.slice(1),
          isActive: true
        });
      }
    }

    setBreadcrumbs(crumbs);
  }, []);

  // ✅ Navigation methods
  const handleNavigate = useCallback((moduleId: string, subPath?: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      const targetPath = subPath ? `${module.path}${subPath}` : module.path;
      navigate(targetPath);
    }
  }, [modules, navigate]);

  const handleNavigateBack = useCallback(() => {
    if (canNavigateBack) {
      navigate(-1);
    }
  }, [canNavigateBack, navigate]);

  // ✅ Update module badge
  const updateModuleBadge = useCallback((moduleId: string, count: number) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, badge: count > 0 ? count : undefined }
        : module
    ));
  }, []);

  // ✅ Context value
  const contextValue: NavigationContextType = {
    // Current state
    currentModule,
    breadcrumbs,
    quickActions,
    
    // Navigation methods
    navigate: handleNavigate,
    navigateBack: handleNavigateBack,
    
    // Navigation state
    canNavigateBack,
    navigationHistory,
    
    // Layout state
    isMobile,
    showBottomNav,
    showSidebar,
    sidebarCollapsed,
    
    // Navigation config
    modules,
    
    // Actions
    setSidebarCollapsed,
    updateModuleBadge,
    setQuickActions
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// ✅ Hook to use navigation context
export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// ✅ Export navigation config for external use
export { NAVIGATION_MODULES };