/**
 * Hook principal para personalizar toda la experiencia de la aplicación
 * basado en las capacidades operativas del negocio
 */

import { useMemo } from 'react';
import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore';
import type { BusinessCapabilities } from '@/types/businessCapabilities';
import { MILESTONES, type Milestone } from '@/config/milestones';

// Configuración de módulos por capacidad
const MODULE_CONFIG = {
  // Módulos base (siempre visibles)
  base: [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/admin' },
    { id: 'materials', name: 'Materiales', icon: '📦', path: '/admin/materials' },
    { id: 'products', name: 'Productos', icon: '🍕', path: '/admin/products' },
    { id: 'settings', name: 'Configuración', icon: '⚙️', path: '/admin/settings' }
  ],
  
  // Módulos por capacidad
  physical_presence: [
    { id: 'sales', name: 'Ventas', icon: '💰', path: '/admin/sales' },
    { id: 'tables', name: 'Mesas', icon: '🪑', path: '/admin/operations/tables' },
    { id: 'pos', name: 'Punto de Venta', icon: '🏪', path: '/admin/sales/pos' }
  ],
  
  delivery_logistics: [
    { id: 'delivery', name: 'Entregas', icon: '🚚', path: '/admin/delivery' },
    { id: 'logistics', name: 'Logística', icon: '📍', path: '/admin/operations/logistics' }
  ],
  
  online_store: [
    { id: 'ecommerce', name: 'Tienda Online', icon: '🛒', path: '/admin/ecommerce' },
    { id: 'catalog', name: 'Catálogo Web', icon: '📋', path: '/admin/catalog' },
    { id: 'orders', name: 'Pedidos Online', icon: '📱', path: '/admin/orders' }
  ],
  
  scheduling_system: [
    { id: 'scheduling', name: 'Turnos', icon: '📅', path: '/admin/scheduling' },
    { id: 'appointments', name: 'Citas', icon: '🗓️', path: '/admin/appointments' },
    { id: 'staff', name: 'Personal', icon: '👥', path: '/admin/staff' }
  ]
};

// Configuración de dashboard widgets por capacidad
const DASHBOARD_WIDGETS = {
  base: [
    'revenue_overview',
    'recent_activity', 
    'inventory_alerts',
    'quick_actions'
  ],
  
  physical_presence: [
    'daily_sales',
    'table_status',
    'pos_summary',
    'local_performance'
  ],
  
  delivery_logistics: [
    'delivery_status',
    'pending_deliveries',
    'delivery_zones_performance',
    'driver_activity'
  ],
  
  online_store: [
    'online_orders',
    'catalog_performance',
    'conversion_rate',
    'abandoned_carts'
  ],
  
  scheduling_system: [
    'today_appointments',
    'staff_schedule',
    'booking_calendar',
    'service_performance'
  ]
};

// Configuración de tutoriales por capacidad
const TUTORIAL_CONFIG = {
  base: [
    { id: 'getting_started', title: 'Primeros Pasos', priority: 1 },
    { id: 'inventory_basics', title: 'Gestión de Inventario', priority: 2 },
    { id: 'product_setup', title: 'Configurar Productos', priority: 3 }
  ],
  
  physical_presence: [
    { id: 'pos_setup', title: 'Configurar Punto de Venta', priority: 4 },
    { id: 'table_management', title: 'Gestión de Mesas', priority: 5 },
    { id: 'local_sales_flow', title: 'Flujo de Ventas Locales', priority: 6 }
  ],
  
  delivery_logistics: [
    { id: 'delivery_zones', title: 'Configurar Zonas de Entrega', priority: 7 },
    { id: 'shipping_rates', title: 'Tarifas de Envío', priority: 8 }
  ],
  
  online_store: [
    { id: 'online_catalog', title: 'Catálogo Online', priority: 9 },
    { id: 'payment_gateway', title: 'Métodos de Pago', priority: 10 }
  ],
  
  scheduling_system: [
    { id: 'calendar_setup', title: 'Configurar Calendario', priority: 11 },
    { id: 'appointment_flow', title: 'Flujo de Turnos', priority: 12 }
  ]
};

interface PersonalizedModule {
  id: string;
  name: string;
  icon: string;
  path: string;
  isEnabled: boolean;
  category: 'base' | 'capability';
}

interface PersonalizedTutorial {
  id: string;
  title: string;
  priority: number;
  isCompleted: boolean;
  isRelevant: boolean;
}

interface PersonalizedMilestone extends Milestone {
  isCompleted: boolean;
}

export function usePersonalizedExperience() {
  const {
    profile,
    hasCapability,
    shouldShowModule,
    shouldShowTutorial,
    getOperationalTier,
    enabledFeatures,
    dashboardModules
  } = useBusinessCapabilities();

  // Obtener módulos personalizados
  const personalizedModules = useMemo((): PersonalizedModule[] => {
    const modules: PersonalizedModule[] = [];

    // Agregar módulos base
    modules.push(...MODULE_CONFIG.base.map(module => ({
      ...module,
      isEnabled: true,
      category: 'base' as const
    })));

    // Agregar módulos por capacidad
    if (hasCapability('has_physical_presence')) {
      modules.push(...MODULE_CONFIG.physical_presence.map(module => ({
        ...module,
        isEnabled: true,
        category: 'capability' as const
      })));
    }

    if (hasCapability('has_delivery_logistics')) {
      modules.push(...MODULE_CONFIG.delivery_logistics.map(module => ({
        ...module,
        isEnabled: true,
        category: 'capability' as const
      })));
    }

    if (hasCapability('has_online_store')) {
      modules.push(...MODULE_CONFIG.online_store.map(module => ({
        ...module,
        isEnabled: true,
        category: 'capability' as const
      })));
    }

    if (hasCapability('has_scheduling_system')) {
      modules.push(...MODULE_CONFIG.scheduling_system.map(module => ({
        ...module,
        isEnabled: true,
        category: 'capability' as const
      })));
    }

    return modules;
  }, [hasCapability]);

  // Obtener widgets personalizados para dashboard
  const personalizedDashboardWidgets = useMemo((): string[] => {
    let widgets = [...DASHBOARD_WIDGETS.base];

    if (hasCapability('has_physical_presence')) {
      widgets.push(...DASHBOARD_WIDGETS.physical_presence);
    }

    if (hasCapability('has_delivery_logistics')) {
      widgets.push(...DASHBOARD_WIDGETS.delivery_logistics);
    }

    if (hasCapability('has_online_store')) {
      widgets.push(...DASHBOARD_WIDGETS.online_store);
    }

    if (hasCapability('has_scheduling_system')) {
      widgets.push(...DASHBOARD_WIDGETS.scheduling_system);
    }

    return widgets;
  }, [hasCapability]);

  // Obtener tutoriales personalizados
  const personalizedTutorials = useMemo((): PersonalizedTutorial[] => {
    let tutorials = [...TUTORIAL_CONFIG.base];

    if (hasCapability('has_physical_presence')) {
      tutorials.push(...TUTORIAL_CONFIG.physical_presence);
    }

    if (hasCapability('has_delivery_logistics')) {
      tutorials.push(...TUTORIAL_CONFIG.delivery_logistics);
    }

    if (hasCapability('has_online_store')) {
      tutorials.push(...TUTORIAL_CONFIG.online_store);
    }

    if (hasCapability('has_scheduling_system')) {
      tutorials.push(...TUTORIAL_CONFIG.scheduling_system);
    }

    return tutorials
      .sort((a, b) => a.priority - b.priority)
      .map(tutorial => ({
        ...tutorial,
        isCompleted: profile?.customizations.tutorialsCompleted?.includes(tutorial.id) ?? false,
        isRelevant: true
      }));
  }, [hasCapability, profile]);

  // Obtener logros (milestones) personalizados
  const personalizedMilestones = useMemo((): PersonalizedMilestone[] => {
    if (!profile?.capabilities) {
      return [];
    }

    const activeCapabilities = (Object.keys(profile.capabilities) as (keyof BusinessCapabilities)[])
      .filter(key => profile.capabilities[key]);

    if (activeCapabilities.length === 0) {
      return [];
    }

    const relevantMilestones = MILESTONES.filter(m => activeCapabilities.includes(m.capability));

    return relevantMilestones.map(milestone => ({
      ...milestone,
      isCompleted: profile?.customizations.milestonesCompleted?.includes(milestone.id) ?? false,
    }));
  }, [profile]);


  // Helper functions para componentes
  const getNavigationItems = () => {
    return personalizedModules.filter(module => module.isEnabled);
  };

  const getDashboardLayout = () => {
    // Diferentes layouts basados en tier operativo
    const tier = getOperationalTier();

    switch (tier) {
      case 'Base Operativa':
        return 'single-column'; // Layout simple
      case 'Estructura Funcional':
        return 'two-columns'; // Layout balanceado
      case 'Negocio Integrado':
        return 'three-columns'; // Layout completo
      case 'Sistema Consolidado':
        return 'advanced'; // Layout con sidebar y widgets avanzados
      default:
        return 'simple';
    }
  };

  const getOnboardingFlow = () => {
    // Prioritize incomplete milestones over tutorials
    const incompleteMilestones = personalizedMilestones.filter(m => !m.isCompleted);
    if (incompleteMilestones.length > 0) {
      return incompleteMilestones.slice(0, 5).map(m => ({ id: m.id, title: m.title, isCompleted: false, type: 'milestone' }));
    }

    const incompleteTutorials = personalizedTutorials.filter(tutorial => !tutorial.isCompleted);
    return incompleteTutorials.slice(0, 5).map(t => ({ id: t.id, title: t.title, isCompleted: false, type: 'tutorial' }));
  };

  const shouldShowFeature = (featureId: string) => {
    return enabledFeatures.includes(featureId);
  };

  const getContextualHelp = (currentPage: string) => {
    // Retorna ayuda contextual basada en la página actual y capacidades
    const helpItems = [];

    if (currentPage === '/admin/sales' && hasCapability('has_physical_presence')) {
      helpItems.push({
        title: 'Gestión de Mesas',
        description: 'Configura y gestiona las mesas de tu local',
        action: 'Ver Tutorial'
      });
    }

    if (currentPage === '/admin/products' && hasCapability('has_online_store')) {
      helpItems.push({
        title: 'Catálogo Online',
        description: 'Publica tus productos en tu tienda online',
        action: 'Configurar'
      });
    }

    return helpItems;
  };

  const completedMilestones = personalizedMilestones.filter(m => m.isCompleted).length;
  const totalMilestones = personalizedMilestones.length;

  return {
    // Estado principal
    profile,
    tier: getOperationalTier(),

    // Módulos y navegación
    modules: personalizedModules,
    navigationItems: getNavigationItems(),

    // Dashboard personalizado
    dashboardWidgets: personalizedDashboardWidgets,
    dashboardLayout: getDashboardLayout(),

    // Sistema de tutoriales y logros
    tutorials: personalizedTutorials,
    milestones: personalizedMilestones,
    onboardingFlow: getOnboardingFlow(),

    // Helper functions
    hasCapability,
    shouldShowModule,
    shouldShowFeature,
    getContextualHelp,

    // Features habilitadas
    enabledFeatures,

    // Estadísticas de personalización
    stats: {
      totalModules: personalizedModules.length,
      activeCapabilities: Object.values(profile?.capabilities || {}).filter(Boolean).length,
      completedTutorials: personalizedTutorials.filter(t => t.isCompleted).length,
      totalTutorials: personalizedTutorials.length,
      completedMilestones,
      totalMilestones,
    }
  };
}

// Hook específico para personalizar navegación
export function usePersonalizedNavigation() {
  const { navigationItems, tier } = usePersonalizedExperience();
  
  return {
    items: navigationItems,
    tier,
    shouldCollapse: navigationItems.length > 8, // Colapsar si hay muchos módulos
  };
}

// Hook específico para personalizar dashboard
export function usePersonalizedDashboard() {
  const { dashboardWidgets, dashboardLayout, tier, stats } = usePersonalizedExperience();
  
  return {
    widgets: dashboardWidgets,
    layout: dashboardLayout,
    tier,
    stats,
  };
}