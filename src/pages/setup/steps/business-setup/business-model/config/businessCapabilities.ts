// Business capabilities interface and types
export interface BusinessCapabilities {
  // Main capability flags
  sells_products: boolean;
  sells_services: boolean;
  manages_events: boolean;
  manages_recurrence: boolean;
  // Products
  sells_products_for_onsite_consumption: boolean;
  sells_products_for_pickup: boolean;
  sells_products_with_delivery: boolean;
  sells_digital_products: boolean;
  // Services
  sells_services_by_appointment: boolean;
  sells_services_by_class: boolean;
  sells_space_by_reservation: boolean;
  // Events
  manages_offsite_catering: boolean;
  hosts_private_events: boolean;
  // Recurrence/Assets
  manages_rentals: boolean;
  manages_memberships: boolean;
  manages_subscriptions: boolean;
  // Channels and Structure
  has_online_store: boolean;
  is_b2b_focused: boolean;
}

export type BusinessStructure = 'single_location' | 'multi_location' | 'mobile';

export interface BusinessModelData extends BusinessCapabilities {
  business_structure: BusinessStructure;
  operationalTier: string;
}

// Default capabilities state
export const defaultCapabilities: BusinessCapabilities = {
  sells_products: false,
  sells_services: false,
  manages_events: false,
  manages_recurrence: false,
  sells_products_for_onsite_consumption: false,
  sells_products_for_pickup: false,
  sells_products_with_delivery: false,
  sells_digital_products: false,
  sells_services_by_appointment: false,
  sells_services_by_class: false,
  sells_space_by_reservation: false,
  manages_offsite_catering: false,
  hosts_private_events: false,
  manages_rentals: false,
  manages_memberships: false,
  manages_subscriptions: false,
  has_online_store: false,
  is_b2b_focused: false,
};

// Capability groups configuration
export interface CapabilityGroup {
  id: keyof BusinessCapabilities;
  title: string;
  description: string;
  icon: string;
  subCapabilities: Array<{
    id: keyof BusinessCapabilities;
    title: string;
    description: string;
  }>;
}

export const capabilityGroups: CapabilityGroup[] = [
  {
    id: 'sells_products',
    title: 'Productos',
    description: 'Vendé productos físicos o digitales',
    icon: 'ShoppingCartIcon',
    subCapabilities: [
      {
        id: 'sells_products_for_onsite_consumption',
        title: 'Consumo en el lugar',
        description: 'Restaurantes, bares, cafeterías'
      },
      {
        id: 'sells_products_for_pickup',
        title: 'Para llevar',
        description: 'Pickup, takeaway, retiro en sucursal'
      },
      {
        id: 'sells_products_with_delivery',
        title: 'Con delivery',
        description: 'Entregas a domicilio, envíos'
      },
      {
        id: 'sells_digital_products',
        title: 'Productos digitales',
        description: 'Software, cursos online, ebooks'
      }
    ]
  },
  {
    id: 'sells_services',
    title: 'Servicios',
    description: 'Prestá servicios personalizados',
    icon: 'UsersIcon',
    subCapabilities: [
      {
        id: 'sells_services_by_appointment',
        title: 'Por cita',
        description: 'Médicos, abogados, consultores'
      },
      {
        id: 'sells_services_by_class',
        title: 'Por clase/sesión',
        description: 'Fitness, yoga, cursos, talleres'
      },
      {
        id: 'sells_space_by_reservation',
        title: 'Alquiler de espacios',
        description: 'Salones, coworking, canchas'
      }
    ]
  },
  {
    id: 'manages_events',
    title: 'Eventos',
    description: 'Organizá y gestioná eventos',
    icon: 'CalendarIcon',
    subCapabilities: [
      {
        id: 'manages_offsite_catering',
        title: 'Catering externo',
        description: 'Eventos fuera del local'
      },
      {
        id: 'hosts_private_events',
        title: 'Eventos privados',
        description: 'Fiestas, reuniones, celebraciones'
      }
    ]
  },
  {
    id: 'manages_recurrence',
    title: 'Recurrencia',
    description: 'Modelos de ingresos recurrentes',
    icon: 'ArrowPathIcon',
    subCapabilities: [
      {
        id: 'manages_rentals',
        title: 'Alquileres',
        description: 'Equipos, vehículos, propiedades'
      },
      {
        id: 'manages_memberships',
        title: 'Membresías',
        description: 'Gimnasios, clubes, asociaciones'
      },
      {
        id: 'manages_subscriptions',
        title: 'Suscripciones',
        description: 'Servicios mensuales, software SaaS'
      }
    ]
  }
];

// Business structure options
export const businessStructureOptions = [
  {
    id: 'single_location' as const,
    title: 'Un solo local',
    description: 'Negocio con una ubicación física',
    icon: 'BuildingStorefrontIcon'
  },
  {
    id: 'multi_location' as const,
    title: 'Múltiples locales',
    description: 'Cadena o franquicia con varias sucursales',
    icon: 'BuildingOfficeIcon'
  },
  {
    id: 'mobile' as const,
    title: 'Móvil/Online',
    description: 'Sin ubicación física fija',
    icon: 'TruckIcon'
  }
];

// Validation rules
export const validationRules = {
  requiresAtLeastOneMainCapability: (capabilities: BusinessCapabilities): boolean => {
    return capabilities.sells_products ||
           capabilities.sells_services ||
           capabilities.manages_events ||
           capabilities.manages_recurrence;
  }
};