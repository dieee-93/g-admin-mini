import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  DocumentTextIcon,
  ClockIcon,
  ShoppingBagIcon,
  UserIcon,
  ListBulletIcon,
  // ✅ NEW ICONS FOR PHASE 4 & 5 MODULES
  TrophyIcon,
  PresentationChartLineIcon,
  CreditCardIcon,
  LinkIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ArchiveBoxIcon,
  DocumentChartBarIcon,
  // ✅ DEBUG TOOLS ICON
  BugAntIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import type { ModuleName } from '@/contexts/AuthContext';
import { useCapabilities } from '@/lib/capabilities/hooks/useCapabilities';
import { shouldShowBusinessModule } from '@/lib/capabilities/businessCapabilitySystem';

// ✅ Types definidos según arquitectura v2.0
export interface NavigationSubModule {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface NavigationModule {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  path: string;
  description?: string;
  badge?: number;
  isActive?: boolean;
  isExpandable?: boolean;
  isExpanded?: boolean;
  subModules?: NavigationSubModule[];
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
  navigate: (moduleId: string, subPath?: string, query?: string) => void;
  navigateToModule: (moduleId: string) => void; // ✅ Nueva función para navegación directa a páginas principales
  navigateBack: () => void;
  toggleModuleExpansion: (moduleId: string) => void;
  
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
    path: '/admin/dashboard',
    description: 'Business Intelligence + Analytics',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'executive',
        title: 'Executive Dashboard',
        path: '/admin/dashboard/executive',
        icon: ChartBarIcon,
        description: 'Strategic KPIs and insights'
      },
      {
        id: 'cross-analytics',
        title: 'Cross-Module Analytics',
        path: '/admin/dashboard/cross-analytics',
        icon: ChartBarIcon,
        description: 'Holistic business correlations'
      },
      {
        id: 'predictive-analytics',
        title: 'Predictive Analytics',
        path: '/admin/dashboard/predictive-analytics',
        icon: ChartBarIcon,
        description: 'AI-powered forecasting'
      },
      {
        id: 'competitive-intelligence',
        title: 'Competitive Intelligence',
        path: '/admin/dashboard/competitive-intelligence',
        icon: ChartBarIcon,
        description: 'Market analysis and trends'
      },
      {
        id: 'custom-reporting',
        title: 'Custom Reporting',
        path: '/admin/dashboard/custom-reporting',
        icon: DocumentTextIcon,
        description: 'Generate custom reports'
      }
    ]
  },
  {
    id: 'sales',
    title: 'Ventas',
    icon: CurrencyDollarIcon,
    color: 'teal',
    path: '/admin/sales',
    description: 'POS + QR Ordering + Payments'
  },
  {
    id: 'operations',
    title: 'Operaciones',
    icon: ChartBarIcon,
    color: 'cyan',
    path: '/admin/operations',
    description: 'Cocina + Mesas + Monitoreo'
  },
  {
    id: 'customers',
    title: 'Clientes',
    icon: UsersIcon,
    color: 'pink',
    path: '/admin/customers',
    description: 'RFM Analytics + Segmentación'
  },
  
  // 🏭 SUPPLY CHAIN DOMAIN  
  {
    id: 'materials',
    title: 'Materials',
    icon: CubeIcon,
    color: 'green',
    path: '/admin/materials',
    description: 'Inventario + Supply Chain Intelligence',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'inventory-management',
        title: 'Inventory Management',
        path: '/admin/materials/',
        icon: CubeIcon,
        description: 'Stock control and management'
      },
      {
        id: 'abc-analysis',
        title: 'ABC Analysis',
        path: '/admin/materials/abc-analysis',
        icon: ChartBarIcon,
        description: 'Product classification analysis'
      },
      {
        id: 'supply-chain',
        title: 'Supply Chain Intelligence',
        path: '/admin/materials/supply-chain',
        icon: ChartBarIcon,
        description: 'Supply chain optimization'
      },
      {
        id: 'procurement',
        title: 'Procurement Intelligence',
        path: '/admin/materials/procurement',
        icon: ChartBarIcon,
        description: 'Smart procurement decisions'
      }
    ]
  },
  {
    id: 'products',
    title: 'Products',
    icon: CogIcon,
    color: 'purple',
    path: '/admin/products',
    description: 'Menu Engineering + Cost Analysis',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'menu-engineering',
        title: 'Menu Engineering',
        path: '/admin/products/menu-engineering',
        icon: CogIcon,
        description: 'Menu optimization and analysis'
      },
      {
        id: 'cost-analysis',
        title: 'Cost Analysis',
        path: '/admin/products/cost-analysis',
        icon: ChartBarIcon,
        description: 'Product cost management'
      },
      {
        id: 'production-planning',
        title: 'Production Planning',
        path: '/admin/products/production-planning',
        icon: CalendarDaysIcon,
        description: 'Production scheduling and planning'
      }
    ]
  },
  
  // 💰 FINANCIAL DOMAIN
  {
    id: 'fiscal',
    title: 'Fiscal',
    icon: DocumentTextIcon,
    color: 'red',
    path: '/admin/fiscal',
    description: 'Facturación AFIP + Impuestos'
  },
  
  // 👨‍💼 HUMAN RESOURCES
  {
    id: 'staff',
    title: 'Staff',
    icon: UserGroupIcon,
    color: 'indigo',
    path: '/admin/staff',
    description: 'Gestión de personal',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'staff-management',
        title: 'Staff Management',
        path: '/admin/staff/management',
        icon: UserGroupIcon,
        description: 'Employee management'
      },
      {
        id: 'time-tracking',
        title: 'Time Tracking',
        path: '/admin/staff/time-tracking',
        icon: ClockIcon,
        description: 'Work time management'
      },
      {
        id: 'training',
        title: 'Training & Development',
        path: '/admin/staff/training',
        icon: WrenchScrewdriverIcon,
        description: 'Employee training programs'
      }
    ]
  },
  {
    id: 'scheduling',
    title: 'Scheduling',
    icon: CalendarDaysIcon,
    color: 'violet',
    path: '/admin/scheduling',
    description: 'Horarios + Coverage Planning'
  },

  // ✅ NEW PHASE 4 & 5 MODULES - Enterprise & Advanced Features

  // 🎮 GAMIFICATION & ACHIEVEMENTS
  {
    id: 'gamification',
    title: 'Gamificación',
    icon: TrophyIcon,
    color: 'yellow',
    path: '/admin/gamification',
    description: 'Sistema de logros y hitos del negocio'
  },

  // 📈 EXECUTIVE BUSINESS INTELLIGENCE
  {
    id: 'executive',
    title: 'Executive BI',
    icon: PresentationChartLineIcon,
    color: 'purple',
    path: '/admin/executive',
    description: 'Business Intelligence ejecutivo con IA',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'executive-dashboard',
        title: 'C-Suite Dashboard',
        path: '/admin/executive/dashboards',
        icon: PresentationChartLineIcon,
        description: 'Dashboard ejecutivo con KPIs estratégicos'
      },
      {
        id: 'natural-language-bi',
        title: 'Natural Language BI',
        path: '/admin/executive/dashboards',
        icon: ChartBarIcon,
        description: 'Consultas de negocio en lenguaje natural'
      },
      {
        id: 'external-data',
        title: 'External Data',
        path: '/admin/executive/dashboards',
        icon: LinkIcon,
        description: 'Integración de fuentes de datos externas'
      }
    ]
  },

  // 💰 FINANCE ADVANCED MODULES
  {
    id: 'finance-advanced',
    title: 'Finanzas Avanzadas',
    icon: CreditCardIcon,
    color: 'emerald',
    path: '/admin/finance',
    description: 'Facturación recurrente e integraciones de pago',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'billing',
        title: 'Facturación Recurrente',
        path: '/admin/finance/billing',
        icon: DocumentTextIcon,
        description: 'Gestión de suscripciones y facturación automática'
      },
      {
        id: 'integrations',
        title: 'Integraciones de Pago',
        path: '/admin/finance/integrations',
        icon: LinkIcon,
        description: 'MercadoPago, MODO y ecosistema argentino'
      }
    ]
  },

  // 🏢 OPERATIONS ADVANCED MODULES
  {
    id: 'operations-advanced',
    title: 'Operaciones Avanzadas',
    icon: BuildingOfficeIcon,
    color: 'sky',
    path: '/admin/operations',
    description: 'Módulos empresariales de operaciones',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'memberships',
        title: 'Membresías',
        path: '/admin/operations/memberships',
        icon: UserGroupIcon,
        description: 'Gestión de membresías y suscripciones'
      },
      {
        id: 'rentals',
        title: 'Alquileres',
        path: '/admin/operations/rentals',
        icon: TruckIcon,
        description: 'Gestión de alquiler de equipos y espacios'
      },
      {
        id: 'assets',
        title: 'Gestión de Activos',
        path: '/admin/operations/assets',
        icon: ArchiveBoxIcon,
        description: 'Gestión integral de activos empresariales'
      }
    ]
  },

  // 📊 ADVANCED TOOLS & REPORTING
  {
    id: 'advanced-tools',
    title: 'Herramientas Avanzadas',
    icon: DocumentChartBarIcon,
    color: 'slate',
    path: '/admin/tools',
    description: 'Reportes avanzados y herramientas empresariales',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'advanced-reporting',
        title: 'Reportes Avanzados',
        path: '/admin/tools/reporting',
        icon: DocumentChartBarIcon,
        description: 'Sistema integral de reportes con IA'
      }
    ]
  },

  // Tools module removed - functionality distributed to respective modules
  {
    id: 'settings',
    title: 'Configuración',
    icon: Cog6ToothIcon,
    color: 'gray',
    path: '/admin/settings',
    description: 'Business Profile + Integraciones',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'business-profile',
        title: 'Business Profile',
        path: '/admin/settings/profile',
        icon: Cog6ToothIcon,
        description: 'Company information and settings'
      },
      {
        id: 'integrations',
        title: 'Integrations',
        path: '/admin/settings/integrations',
        icon: WrenchScrewdriverIcon,
        description: 'External service integrations'
      },
      {
        id: 'diagnostics',
        title: 'System Diagnostics',
        path: '/admin/settings/diagnostics',
        icon: ChartBarIcon,
        description: 'System health and diagnostics'
      },
      {
        id: 'reporting',
        title: 'Custom Reporting',
        path: '/admin/settings/reporting',
        icon: DocumentTextIcon,
        description: 'Report configuration'
      }
    ]
  },

  // 🔧 DEBUG TOOLS (SUPER_ADMIN ONLY)
  {
    id: 'debug',
    title: 'Debug Tools',
    icon: BugAntIcon,
    color: 'red',
    path: '/debug',
    description: 'Development debugging and diagnostics',
    isExpandable: true,
    isExpanded: false,
    subModules: [
      {
        id: 'debug-dashboard',
        title: 'Debug Dashboard',
        path: '/debug',
        icon: BugAntIcon,
        description: 'Main debug overview and system status'
      },
      {
        id: 'capabilities-debug',
        title: 'Capabilities Debug',
        path: '/debug/capabilities',
        icon: BugAntIcon,
        description: 'Business capabilities system debugging'
      },
      {
        id: 'theme-debug',
        title: 'Theme Debug',
        path: '/debug/theme',
        icon: BugAntIcon,
        description: 'Theme and styling debugging'
      },
      {
        id: 'stores-debug',
        title: 'Store Inspector',
        path: '/debug/stores',
        icon: BugAntIcon,
        description: 'Zustand stores and state debugging'
      },
      {
        id: 'api-debug',
        title: 'API Inspector',
        path: '/debug/api',
        icon: BugAntIcon,
        description: 'HTTP requests and API monitoring'
      },
      {
        id: 'performance-debug',
        title: 'Performance Monitor',
        path: '/debug/performance',
        icon: BugAntIcon,
        description: 'Performance metrics and optimization'
      },
      {
        id: 'navigation-debug',
        title: 'Navigation Debug',
        path: '/debug/navigation',
        icon: BugAntIcon,
        description: 'Navigation and routing debugging'
      }
    ]
  }
];

// ✅ Módulos específicos para CLIENTE - Experiencia tipo web/app customer-friendly
const CLIENT_NAVIGATION_MODULES: NavigationModule[] = [
  {
    id: 'customer-portal',
    title: 'Mi Portal',
    icon: HomeIcon,
    color: 'teal',
    path: '/app/portal',
    description: 'Tu espacio personalizado'
  },
  {
    id: 'customer-menu',
    title: 'Menú',
    icon: ShoppingBagIcon,
    color: 'orange',
    path: '/app/menu',
    description: 'Explora nuestros productos'
  },
  {
    id: 'my-orders',
    title: 'Mis Pedidos',
    icon: ListBulletIcon,
    color: 'blue',
    path: '/app/orders',
    description: 'Historial y seguimiento'
  },
  {
    id: 'customer-settings',
    title: 'Mi Perfil',
    icon: UserIcon,
    color: 'purple',
    path: '/app/settings',
    description: 'Configuración personal'
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
  // tools section removed - functionality distributed
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
  const { canAccessModule, isAuthenticated, isCliente } = useAuth();
  const { activeCapabilities, resolvedCapabilities } = useCapabilities();
  
  // ✅ Responsive state - Mobile-first approach según arquitectura
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // ✅ HYBRID FILTERING: Roles (security) → Capabilities (business logic)
  const accessibleModules = useMemo(() => {
    if (!isAuthenticated) return [];

    // ✅ CLIENTE gets customer-friendly navigation (web/app style)
    if (isCliente()) {
      return CLIENT_NAVIGATION_MODULES.filter(module => {
        // Map client module IDs to ModuleName enum
        const clientModuleNameMap: Record<string, ModuleName> = {
          'customer-portal': 'customer_portal',
          'customer-menu': 'customer_menu',
          'my-orders': 'my_orders',
          'customer-settings': 'settings'
        };

        const moduleName = clientModuleNameMap[module.id];
        if (!moduleName) return false; // SECURITY: deny unmapped modules

        // LAYER 1: Role-based security filter
        return canAccessModule(moduleName);
        // Note: Clientes don't need capability filtering for now - they get full customer experience
      });
    }

    // ✅ Staff/Admin users get HYBRID filtering: Roles → Capabilities
    return NAVIGATION_MODULES.filter(module => {
      // Map admin module IDs to ModuleName enum
      const adminModuleNameMap: Record<string, ModuleName> = {
        'dashboard': 'dashboard',
        'sales': 'sales',
        'operations': 'operations',
        'materials': 'materials',
        'products': 'products',
        'staff': 'staff',
        'scheduling': 'scheduling',
        'fiscal': 'fiscal',
        'settings': 'settings',
        'customers': 'sales', // Customers is part of sales workflow
        // ✅ NEW PHASE 4 & 5 MODULES
        'gamification': 'gamification',
        'executive': 'executive',
        'finance-advanced': 'billing', // Maps to billing permission
        'operations-advanced': 'operations', // Maps to operations permission
        'advanced-tools': 'reporting', // Maps to reporting permission
        // ✅ DEBUG TOOLS (SUPER_ADMIN ONLY)
        'debug': 'debug' // Maps to debug permission for super_admin only
      };

      const moduleName = adminModuleNameMap[module.id];
      if (!moduleName) return false; // SECURITY: deny unmapped modules

      // 🔒 LAYER 1: Role-based security filter (first gate)
      const hasRoleAccess = canAccessModule(moduleName);
      if (!hasRoleAccess) return false;

      // 🛠️ SPECIAL CASE: Debug module bypasses capability filtering (SUPER_ADMIN only)
      if (module.id === 'debug') {
        return true; // Already passed role check above
      }

      // 🎯 LAYER 2: Capability-based business logic filter (second gate)
      // ✅ Now using resolvedCapabilities (includes auto-resolved features)
      const hasCapabilityAccess = shouldShowBusinessModule(module.id, activeCapabilities);

      // Debug info for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Module Filter Debug [${module.id}]:`, {
          roleAccess: hasRoleAccess,
          capabilityAccess: hasCapabilityAccess,
          finalResult: hasRoleAccess && hasCapabilityAccess
        });
      }

      return hasCapabilityAccess;
    });
  }, [canAccessModule, isAuthenticated, isCliente, resolvedCapabilities]);

  // ✅ Navigation state
  const [modules, setModules] = useState<NavigationModule[]>(accessibleModules);
  const [currentModule, setCurrentModule] = useState<NavigationModule | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // ✅ Empezar colapsado por defecto

  // ✅ Derived state
  const showBottomNav = isMobile;

  // ✅ Quick actions with new navigation structure
  const getQuickActionsForModule = (moduleId: string): QuickAction[] => {
    switch (moduleId) {
      case 'dashboard':
        return [
          {
            id: 'executive-dashboard',
            label: 'Executive Dashboard',
            icon: ChartBarIcon,
            action: () => navigate('/admin/dashboard/executive'),
            color: 'purple'
          },
          {
            id: 'cross-analytics',
            label: 'Cross Analytics',
            icon: CogIcon,
            action: () => navigate('/admin/dashboard/cross-analytics'),
            color: 'blue'
          },
          {
            id: 'predictive-analytics',
            label: 'Predictive Analytics',
            icon: WrenchScrewdriverIcon,
            action: () => navigate('/admin/dashboard/predictive-analytics'),
            color: 'orange'
          },
          {
            id: 'custom-reports',
            label: 'Custom Reports',
            icon: DocumentTextIcon,
            action: () => navigate('/admin/dashboard/custom-reports'),
            color: 'green'
          }
        ];
      case 'sales':
        return [
          {
            id: 'new-sale',
            label: 'Nueva Venta',
            icon: CurrencyDollarIcon,
            action: () => navigate('/admin/sales'),
            color: 'teal'
          },
          {
            id: 'add-customer',
            label: 'Agregar Cliente',
            icon: UsersIcon,
            action: () => navigate('/admin/customers'),
            color: 'pink'
          },
          {
            id: 'check-stock',
            label: 'Verificar Stock',
            icon: CubeIcon,
            action: () => navigate('/admin/materials'),
            color: 'green'
          }
        ];
      case 'materials':
        return [
          {
            id: 'add-stock',
            label: 'Agregar Stock',
            icon: CubeIcon,
            action: () => navigate('/admin/materials'),
            color: 'green'
          },
          {
            id: 'adjust-stock',
            label: 'Ajustar Stock',
            icon: Cog6ToothIcon,
            action: () => navigate('/admin/materials'),
            color: 'yellow'
          },
          {
            id: 'abc-analysis',
            label: 'ABC Analysis',
            icon: ChartBarIcon,
            action: () => navigate('/admin/materials/abc-analysis'),
            color: 'blue'
          }
        ];
      case 'products':
        return [
          {
            id: 'new-recipe',
            label: 'Nueva Receta',
            icon: CogIcon,
            action: () => navigate('/admin/products/recipes'),
            color: 'purple'
          },
          {
            id: 'menu-engineering',
            label: 'Menu Engineering',
            icon: ChartBarIcon,
            action: () => navigate('/admin/products'),
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

    // Safety check: if still no module found, exit early
    if (!foundModule) {
      console.warn('No navigation module found for path:', path);
      return;
    }

    // Only update states if module actually changed
    setCurrentModule(prev => {
      if (prev?.id !== foundModule.id) {
        // Update quick actions when module changes
        const moduleActions = getQuickActionsForModule(foundModule.id);
        setQuickActions(moduleActions);
        
        // Update breadcrumbs when module changes
        const crumbs: BreadcrumbItem[] = [];

        // Always add dashboard as root (unless we're on dashboard)
        if (foundModule.id !== 'dashboard') {
          crumbs.push({
            label: 'Dashboard',
            path: '/',
            isActive: false
          });
        }

        // Add current module
        crumbs.push({
          label: foundModule.title,
          path: foundModule.path,
          isActive: true
        });

        // Add sub-path if exists
        if (path !== foundModule.path && path.startsWith(foundModule.path)) {
          const subPath = path.replace(foundModule.path, '').replace(/^\//, '');
          if (subPath) {
            crumbs.push({
              label: subPath.charAt(0).toUpperCase() + subPath.slice(1),
              isActive: true
            });
          }
        }

        setBreadcrumbs(crumbs);
        
        return foundModule;
      }
      
      // Even if module didn't change, update breadcrumbs if sub-path changed
      if (prev && path !== prev.path) {
        const crumbs: BreadcrumbItem[] = [];

        if (prev.id !== 'dashboard') {
          crumbs.push({
            label: 'Dashboard',
            path: '/',
            isActive: false
          });
        }

        crumbs.push({
          label: prev.title,
          path: prev.path,
          isActive: true
        });

        if (path !== prev.path && path.startsWith(prev.path)) {
          const subPath = path.replace(prev.path, '').replace(/^\//, '');
          if (subPath) {
            crumbs.push({
              label: subPath.charAt(0).toUpperCase() + subPath.slice(1),
              isActive: true
            });
          }
        }

        setBreadcrumbs(crumbs);
      }
      
      return prev;
    });

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
  }, [location.pathname]); // Only depend on pathname to prevent infinite loops

  // ✅ Update modules when accessible modules change
  useEffect(() => {
    setModules(accessibleModules);
  }, [accessibleModules]);

  // ✅ Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet) {
      setSidebarCollapsed(true);
    } else if (isDesktop) {
      setSidebarCollapsed(false);
    }
  }, [isTablet, isDesktop]);


  // ✅ Navigation methods
  const handleNavigate = useCallback((moduleId: string, subPath?: string, query?: string) => {
    // Use current modules state to ensure updated paths
    const module = modules.find(m => m.id === moduleId);
    console.log('🔍 Navigation Debug:', { moduleId, module: module?.path, subPath, query });
    if (module) {
      let targetPath = subPath ? `${module.path}${subPath}` : module.path;
      if (query) {
        targetPath += `?${query.replace(/^\?/, '')}`; // Ensure single '?'
      }
      console.log('🔍 Navigating to:', targetPath);
      navigate(targetPath);
    }
  }, [navigate, modules]);

  // ✅ Navigate directly to module main page (for dual-click pattern)
  const handleNavigateToModule = useCallback((moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    console.log('🔍 Direct Module Navigation:', { moduleId, module: module?.path });
    if (module) {
      console.log('🔍 Navigating directly to:', module.path);
      navigate(module.path);
    }
  }, [navigate, modules]);

  const handleNavigateBack = useCallback(() => {
    if (canNavigateBack) {
      navigate(-1);
    }
  }, [canNavigateBack, navigate]);

  // ✅ Toggle module expansion
  const toggleModuleExpansion = useCallback((moduleId: string) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isExpanded: !module.isExpanded }
        : module
    ));
  }, []);

  // ✅ Update module badge - Optimized to prevent infinite loops
  const updateModuleBadge = useCallback((moduleId: string, count: number) => {
    setModules(prev => {
      const moduleIndex = prev.findIndex(module => module.id === moduleId);
      if (moduleIndex === -1) return prev;
      
      const currentModule = prev[moduleIndex];
      const newBadgeValue = count > 0 ? count : undefined;
      
      // Only update if badge value actually changed
      if (currentModule.badge === newBadgeValue) {
        return prev;
      }
      
      const newModules = [...prev];
      newModules[moduleIndex] = { ...currentModule, badge: newBadgeValue };
      return newModules;
    });
  }, []);

  // ✅ Context value
  const contextValue: NavigationContextType = {
    // Current state
    currentModule,
    breadcrumbs,
    quickActions,
    
    // Navigation methods
    navigate: handleNavigate,
    navigateToModule: handleNavigateToModule, // ✅ Nueva función para navegación directa
    navigateBack: handleNavigateBack,
    toggleModuleExpansion,
    
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