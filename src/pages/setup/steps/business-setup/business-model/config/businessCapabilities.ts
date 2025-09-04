/**
 * Sistema de Capacidades Operativas para G-Admin
 * Define las capacidades que un negocio puede tener y personaliza toda la experiencia
 */

export interface BusinessCapabilities {
  // Main Offers
  sells_products: boolean;
  sells_services: boolean;
  manages_events: boolean;
  manages_recurrence: boolean;

  // Product Sub-options
  sells_products_for_onsite_consumption: boolean;
  sells_products_for_pickup: boolean;
  sells_products_with_delivery: boolean;
  sells_digital_products: boolean;

  // Service Sub-options
  sells_services_by_appointment: boolean;
  sells_services_by_class: boolean;
  sells_space_by_reservation: boolean;

  // Event Sub-options
  hosts_private_events: boolean;
  manages_offsite_catering: boolean;

  // Recurrence Sub-options
  manages_rentals: boolean;
  manages_memberships: boolean;
  manages_subscriptions: boolean;

  // Standalone Capabilities
  has_online_store: boolean;
  is_b2b_focused: boolean;
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
  businessStructure: BusinessStructure;
  
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
  // Standalone Capabilities
  {
    id: 'has_online_store',
    title: 'Tienda Online',
    subtitle: 'Vendés a través de internet',
    icon: '🛒',
    description: 'Tu negocio utiliza la plataforma para crear un storefront digital donde los clientes pueden comprar online.',
    keywords: ['ecommerce', 'online', 'web', 'digital', 'catalogo'],
    enabledFeatures: ['product_catalog', 'shopping_cart', 'payment_gateway', 'order_management', 'seo_tools']
  },
  {
    id: 'is_b2b_focused',
    title: 'Enfoque B2B',
    subtitle: 'Ventas a otras empresas',
    icon: '🏢',
    description: 'Tu negocio se centra en vender productos o servicios a otras empresas.',
    keywords: ['b2b', 'corporativo', 'empresas', 'mayorista'],
    enabledFeatures: ['company_accounts', 'bulk_pricing', 'invoice_management']
  },

  // Main Offers & Sub-options
  {
    id: 'sells_products',
    title: 'Vende Productos',
    subtitle: 'Ofrece bienes físicos o digitales',
    icon: '📦',
    description: 'El negocio se dedica a la venta de productos.',
    keywords: ['productos', 'bienes', 'mercadería'],
    enabledFeatures: ['product_management', 'inventory_tracking']
  },
  {
    id: 'sells_products_for_onsite_consumption',
    title: 'Consumo en el Local',
    subtitle: 'Restaurantes, bares, cafeterías',
    icon: '🍽️',
    description: 'Los clientes consumen los productos en el local.',
    keywords: ['restaurante', 'bar', 'cafeteria', 'consumo'],
    enabledFeatures: ['table_management', 'pos_system']
  },
  {
    id: 'sells_products_for_pickup',
    title: 'Para Llevar (Pickup)',
    subtitle: 'Los clientes retiran sus pedidos',
    icon: '🛍️',
    description: 'Los clientes realizan pedidos para retirar en el local.',
    keywords: ['pickup', 'takeaway', 'retiro'],
    enabledFeatures: ['online_ordering', 'pickup_scheduling']
  },
  {
    id: 'sells_products_with_delivery',
    title: 'Con Delivery',
    subtitle: 'Entregas a domicilio',
    icon: '🚚',
    description: 'El negocio ofrece entrega de productos a domicilio.',
    keywords: ['delivery', 'envio', 'domicilio'],
    enabledFeatures: ['delivery_zones', 'driver_management', 'route_optimization']
  },
  {
    id: 'sells_digital_products',
    title: 'Productos Digitales',
    subtitle: 'Software, cursos, ebooks',
    icon: '💻',
    description: 'Venta de productos no físicos.',
    keywords: ['digital', 'software', 'ebook', 'curso'],
    enabledFeatures: ['digital_delivery', 'license_management']
  },
  {
    id: 'sells_services',
    title: 'Vende Servicios',
    subtitle: 'Ofrece trabajo o asistencia',
    icon: '👥',
    description: 'El negocio se dedica a la prestación de servicios.',
    keywords: ['servicios', 'consultoria', 'clases'],
    enabledFeatures: ['service_management', 'staff_profiles']
  },
  {
    id: 'sells_services_by_appointment',
    title: 'Servicios por Cita',
    subtitle: 'Consultorios, estudios, etc.',
    icon: '📅',
    description: 'Los servicios se prestan con cita previa.',
    keywords: ['cita', 'turno', 'reserva'],
    enabledFeatures: ['appointment_booking', 'calendar_integration']
  },
  {
    id: 'sells_services_by_class',
    title: 'Servicios por Clase',
    subtitle: 'Fitness, yoga, talleres',
    icon: '🧘',
    description: 'Servicios grupales en formato de clase.',
    keywords: ['clase', 'taller', 'grupo'],
    enabledFeatures: ['class_scheduling', 'attendance_tracking']
  },
  {
    id: 'sells_space_by_reservation',
    title: 'Alquiler de Espacios',
    subtitle: 'Salones, coworking, canchas',
    icon: '🏢',
    description: 'Renta de espacios físicos por tiempo.',
    keywords: ['alquiler', 'espacio', 'coworking'],
    enabledFeatures: ['space_booking', 'availability_calendar']
  },
  {
    id: 'manages_events',
    title: 'Gestiona Eventos',
    subtitle: 'Organiza eventos y catering',
    icon: '🎉',
    description: 'El negocio organiza o participa en eventos.',
    keywords: ['eventos', 'catering', 'fiestas'],
    enabledFeatures: ['event_management', 'ticketing']
  },
  {
    id: 'hosts_private_events',
    title: 'Eventos Privados',
    subtitle: 'Fiestas, reuniones, celebraciones',
    icon: '🥳',
    description: 'Organización de eventos privados en el local.',
    keywords: ['privado', 'celebracion', 'reunion'],
    enabledFeatures: ['event_quoting', 'private_booking']
  },
  {
    id: 'manages_offsite_catering',
    title: 'Catering Externo',
    subtitle: 'Eventos fuera del local',
    icon: '🚐',
    description: 'Servicio de comida para eventos en ubicaciones externas.',
    keywords: ['catering', 'externo', 'domicilio'],
    enabledFeatures: ['catering_menu', 'logistics_planning']
  },
  {
    id: 'manages_recurrence',
    title: 'Gestiona Recurrencia',
    subtitle: 'Ingresos por suscripción o alquiler',
    icon: '🔄',
    description: 'Modelo de negocio basado en ingresos recurrentes.',
    keywords: ['recurrencia', 'suscripcion', 'alquiler'],
    enabledFeatures: ['recurring_billing', 'subscription_management']
  },
  {
    id: 'manages_rentals',
    title: 'Alquileres',
    subtitle: 'Equipos, vehículos, propiedades',
    icon: '🔑',
    description: 'Renta de bienes por un período de tiempo.',
    keywords: ['alquiler', 'renta', 'equipos'],
    enabledFeatures: ['rental_inventory', 'booking_calendar']
  },
  {
    id: 'manages_memberships',
    title: 'Membresías',
    subtitle: 'Gimnasios, clubes, asociaciones',
    icon: '💳',
    description: 'Acceso a beneficios a través de una membresía paga.',
    keywords: ['membresia', 'socio', 'club'],
    enabledFeatures: ['member_management', 'tier_benefits']
  },
  {
    id: 'manages_subscriptions',
    title: 'Suscripciones',
    subtitle: 'Servicios mensuales, software SaaS',
    icon: '📰',
    description: 'Pago recurrente por acceso a un producto o servicio.',
    keywords: ['suscripcion', 'saas', 'mensual'],
    enabledFeatures: ['plan_management', 'recurring_payments']
  }
];

export type BusinessStructure = 'single_location' | 'multi_location' | 'mobile';

function getMainOffersCount(capabilities: BusinessCapabilities): number {
  const mainOffers = [
    capabilities.sells_products_for_onsite_consumption,
    capabilities.sells_products_for_pickup,
    capabilities.sells_products_with_delivery,
    capabilities.sells_digital_products,
    capabilities.sells_services_by_appointment,
    capabilities.sells_services_by_class,
    capabilities.sells_space_by_reservation,
    capabilities.manages_offsite_catering,
    capabilities.hosts_private_events,
    capabilities.manages_rentals,
    capabilities.manages_memberships,
    capabilities.manages_subscriptions,
  ];
  return mainOffers.filter(Boolean).length;
}

// Función para calcular tier operativo
export function calculateOperationalTier(
  capabilities: BusinessCapabilities,
  businessStructure: BusinessStructure,
): OperationalTier {
  if (
    businessStructure === 'multi_location' ||
    getMainOffersCount(capabilities) >= 4 ||
    (getMainOffersCount(capabilities) >= 3 && capabilities.has_online_store)
  ) {
    return 'Sistema Consolidado';
  }

  if (
    getMainOffersCount(capabilities) === 3
  ) {
    return 'Negocio Integrado';
  }

  if (
    getMainOffersCount(capabilities) === 2 ||
    (getMainOffersCount(capabilities) === 1 && capabilities.has_online_store)
  ) {
    return 'Estructura Funcional';
  }

  if (getMainOffersCount(capabilities) === 1) {
    return 'Base Operativa';
  }

  return 'Sin Configurar';
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
  const modules = ['dashboard', 'materials', 'products', 'settings']; // Módulos base
  
  if (capabilities.sells_products) {
    modules.push('sales');
  }
  if (capabilities.sells_products_for_onsite_consumption) {
    modules.push('operations');
  }
  if (capabilities.sells_services) {
    modules.push('staff');
  }
  if (capabilities.sells_services_by_appointment) {
    modules.push('scheduling');
  }
  if (capabilities.is_b2b_focused) {
    modules.push('customers');
  }
  
  return [...new Set(modules)];
}

// Función para obtener tutoriales relevantes
export function getRelevantTutorials(capabilities: BusinessCapabilities): string[] {
  const tutorials = ['basics']; // Tutorial básico siempre presente
  
  if (capabilities.sells_products_for_onsite_consumption) {
    tutorials.push('pos_setup', 'table_management', 'local_sales');
  }
  
  if (capabilities.sells_products_with_delivery) {
    tutorials.push('delivery_setup', 'zones_configuration');
  }
  
  if (capabilities.has_online_store) {
    tutorials.push('online_catalog', 'payment_setup');
  }
  
  if (capabilities.sells_services_by_appointment) {
    tutorials.push('calendar_setup', 'appointment_flow');
  }
  
  return [...new Set(tutorials)];
}