/**
 * Sistema de Capacidades Operativas para G-Admin
 * Define las capacidades que un negocio puede tener y personaliza toda la experiencia
 */

export interface BusinessCapabilities {
  has_physical_presence: boolean;    // Venta en Local Físico
  has_delivery_logistics: boolean;   // Entregas y Envíos
  has_online_store: boolean;         // Tienda Online
  has_scheduling_system: boolean;    // Reservas y Turnos
}

export interface CapabilityDefinition {
  id: keyof BusinessCapabilities;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  keywords: string[];
  enabledFeatures: string[]; // Lista de features que esta capacidad activa
}

export type OperationalTier = 
  | 'Sin Configurar'
  | 'Base Operativa' 
  | 'Estructura Funcional'
  | 'Negocio Integrado' 
  | 'Sistema Consolidado';

export interface BusinessProfile {
  // Datos básicos
  businessName: string;
  businessType: string; // Rubro informativo
  email: string;
  phone: string;
  country: string;
  currency: string;
  
  // Sistema de capacidades
  capabilities: BusinessCapabilities;
  operationalTier: OperationalTier;
  
  // Metadatos para personalización
  setupCompleted: boolean;
  onboardingStep: number;
  customizations: {
    dashboardLayout?: string;
    enabledModules: string[];
    tutorialsCompleted: string[];
    milestonesCompleted: string[];
  };
}

// Configuración de capacidades disponibles
export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  {
    id: 'has_physical_presence',
    title: 'Venta en Local Físico',
    subtitle: 'Los clientes vienen a tu local',
    icon: '🏪',
    description: 'Tu negocio tiene un espacio físico donde los clientes pueden comprar, consumir o retirar productos.',
    keywords: ['local', 'tienda', 'restaurante', 'mostrador', 'presencial'],
    enabledFeatures: [
      'table_management',
      'pos_system', 
      'local_inventory',
      'store_hours',
      'floor_plan'
    ]
  },
  {
    id: 'has_delivery_logistics',
    title: 'Entregas y Envíos',
    subtitle: 'Llevás productos a domicilio',
    icon: '🚚',
    description: 'Tu negocio gestiona entregas a domicilio, ya sea con personal propio o tercerizado.',
    keywords: ['delivery', 'envio', 'domicilio', 'reparto', 'logistica'],
    enabledFeatures: [
      'delivery_zones',
      'shipping_rates',
      'driver_management',
      'route_optimization',
      'delivery_tracking'
    ]
  },
  {
    id: 'has_online_store',
    title: 'Tienda Online',
    subtitle: 'Vendés a través de internet',
    icon: '🛒',
    description: 'Tu negocio utiliza la plataforma para crear un storefront digital donde los clientes pueden comprar online.',
    keywords: ['ecommerce', 'online', 'web', 'digital', 'catalogo'],
    enabledFeatures: [
      'product_catalog',
      'shopping_cart',
      'payment_gateway',
      'order_management',
      'seo_tools'
    ]
  },
  {
    id: 'has_scheduling_system',
    title: 'Reservas y Turnos',
    subtitle: 'Gestionás citas y horarios',
    icon: '📅',
    description: 'Tu negocio opera con un sistema de agenda para citas, turnos, reservas o servicios programados.',
    keywords: ['turnos', 'citas', 'reservas', 'agenda', 'horarios'],
    enabledFeatures: [
      'appointment_booking',
      'staff_scheduling',
      'calendar_integration',
      'reminder_system',
      'availability_management'
    ]
  }
];

// Función para calcular tier operativo
export function calculateOperationalTier(capabilities: BusinessCapabilities): OperationalTier {
  const activeCount = Object.values(capabilities).filter(Boolean).length;
  
  switch (activeCount) {
    case 0: return 'Sin Configurar';
    case 1: return 'Base Operativa';
    case 2: return 'Estructura Funcional';
    case 3: return 'Negocio Integrado';
    case 4: return 'Sistema Consolidado';
    default: return 'Sin Configurar';
  }
}

// Función para obtener features habilitadas
export function getEnabledFeatures(capabilities: BusinessCapabilities): string[] {
  const enabledFeatures: string[] = [];
  
  Object.entries(capabilities).forEach(([capabilityId, isEnabled]) => {
    if (isEnabled) {
      const capability = CAPABILITY_DEFINITIONS.find(def => def.id === capabilityId);
      if (capability) {
        enabledFeatures.push(...capability.enabledFeatures);
      }
    }
  });
  
  return [...new Set(enabledFeatures)]; // Remove duplicates
}

// Función para personalizar dashboard basado en capacidades
export function getDashboardModules(capabilities: BusinessCapabilities): string[] {
  const modules = ['dashboard', 'materials', 'products']; // Módulos base siempre presentes
  
  if (capabilities.has_physical_presence) {
    modules.push('sales', 'tables', 'pos');
  }
  
  if (capabilities.has_delivery_logistics) {
    modules.push('delivery', 'logistics');
  }
  
  if (capabilities.has_online_store) {
    modules.push('ecommerce', 'catalog', 'orders');
  }
  
  if (capabilities.has_scheduling_system) {
    modules.push('scheduling', 'appointments', 'staff');
  }
  
  return modules;
}

// Función para obtener tutoriales relevantes
export function getRelevantTutorials(capabilities: BusinessCapabilities): string[] {
  const tutorials = ['basics']; // Tutorial básico siempre presente
  
  if (capabilities.has_physical_presence) {
    tutorials.push('pos_setup', 'table_management', 'local_sales');
  }
  
  if (capabilities.has_delivery_logistics) {
    tutorials.push('delivery_setup', 'zones_configuration');
  }
  
  if (capabilities.has_online_store) {
    tutorials.push('online_catalog', 'payment_setup');
  }
  
  if (capabilities.has_scheduling_system) {
    tutorials.push('calendar_setup', 'appointment_flow');
  }
  
  return tutorials;
}