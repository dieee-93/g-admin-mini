/**
 * Business Models System for G-Admin v3.0
 * Defines business model types and their characteristics
 */

import type { BusinessCapability, BusinessStructure } from './BusinessCapabilities';

// Business model identifiers
export type BusinessModel =
  | 'restaurant'
  | 'retail'
  | 'services'
  | 'ecommerce'
  | 'b2b'
  | 'subscription'
  | 'marketplace'
  | 'rental'
  | 'events'
  | 'fitness'
  | 'education'
  | 'healthcare'
  | 'custom';

// Business model definition
export interface BusinessModelDefinition {
  id: BusinessModel;
  name: string;
  description: string;
  icon: string;
  category: 'products' | 'services' | 'hybrid' | 'platform';
  defaultCapabilities: BusinessCapability[];
  recommendedModules: string[];
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  examples: string[];
}

// Complete business model definitions
export const businessModelDefinitions: Record<BusinessModel, BusinessModelDefinition> = {
  restaurant: {
    id: 'restaurant',
    name: 'Restaurante/Bar',
    description: 'Establecimientos de comida y bebida con consumo en local',
    icon: '🍽️',
    category: 'products',
    defaultCapabilities: [
      'customer_management',
      'sells_products',
      'sells_products_for_onsite_consumption',
      'table_management',
      'pos_system',
      'payment_gateway',
      'inventory_tracking',
      'staff_management',
      'fiscal_compliance'
    ],
    recommendedModules: ['sales', 'operations', 'materials', 'staff', 'fiscal'],
    complexity: 'intermediate',
    examples: ['Restaurante', 'Bar', 'Cafetería', 'Parrilla', 'Pizzería']
  },

  retail: {
    id: 'retail',
    name: 'Retail/Comercio',
    description: 'Venta de productos al por menor',
    icon: '🏪',
    category: 'products',
    defaultCapabilities: [
      'customer_management',
      'sells_products',
      'pos_system',
      'payment_gateway',
      'inventory_tracking',
      'product_management',
      'fiscal_compliance'
    ],
    recommendedModules: ['sales', 'materials', 'products', 'customers', 'fiscal'],
    complexity: 'basic',
    examples: ['Tienda de ropa', 'Ferretería', 'Farmacia', 'Librería', 'Supermercado']
  },

  services: {
    id: 'services',
    name: 'Servicios Profesionales',
    description: 'Prestación de servicios profesionales con citas',
    icon: '👥',
    category: 'services',
    defaultCapabilities: [
      'customer_management',
      'sells_services',
      'sells_services_by_appointment',
      'appointment_booking',
      'staff_management',
      'invoice_management',
      'fiscal_compliance'
    ],
    recommendedModules: ['appointments', 'customers', 'staff', 'accounting', 'fiscal'],
    complexity: 'intermediate',
    examples: ['Consultorio médico', 'Estudio jurídico', 'Peluquería', 'Consultora', 'Taller mecánico']
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Tienda online con delivery y gestión digital',
    icon: '🛒',
    category: 'products',
    defaultCapabilities: [
      'customer_management',
      'sells_products',
      'has_online_store',
      'product_management',
      'inventory_tracking',
      'payment_gateway',
      'sells_products_with_delivery',
      'fiscal_compliance'
    ],
    recommendedModules: ['online-store', 'products', 'materials', 'delivery', 'customers', 'fiscal'],
    complexity: 'advanced',
    examples: ['Tienda online', 'Marketplace', 'Dropshipping', 'Productos digitales']
  },

  b2b: {
    id: 'b2b',
    name: 'B2B/Mayorista',
    description: 'Ventas a empresas con gestión de proveedores',
    icon: '🏢',
    category: 'products',
    defaultCapabilities: [
      'customer_management',
      'is_b2b_focused',
      'sells_products',
      'supplier_management',
      'purchase_orders',
      'invoice_management',
      'inventory_tracking',
      'fiscal_compliance'
    ],
    recommendedModules: ['suppliers', 'customers', 'materials', 'accounting', 'fiscal'],
    complexity: 'advanced',
    examples: ['Distribuidor', 'Mayorista', 'Proveedor industrial', 'Importador']
  },

  subscription: {
    id: 'subscription',
    name: 'Suscripción/SaaS',
    description: 'Modelo de negocio basado en suscripciones recurrentes',
    icon: '🔄',
    category: 'services',
    defaultCapabilities: [
      'customer_management',
      'manages_recurrence',
      'manages_subscriptions',
      'recurring_billing',
      'payment_gateway',
      'fiscal_compliance'
    ],
    recommendedModules: ['recurring-billing', 'customers', 'accounting', 'fiscal'],
    complexity: 'advanced',
    examples: ['Software SaaS', 'Streaming', 'Newsletter premium', 'App móvil']
  },

  marketplace: {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Plataforma que conecta compradores y vendedores',
    icon: '🏬',
    category: 'platform',
    defaultCapabilities: [
      'customer_management',
      'sells_products',
      'has_online_store',
      'is_b2b_focused',
      'supplier_management',
      'payment_gateway',
      'fiscal_compliance'
    ],
    recommendedModules: ['online-store', 'suppliers', 'customers', 'products', 'fiscal'],
    complexity: 'enterprise',
    examples: ['Marketplace local', 'Plataforma B2B', 'Agregador de servicios']
  },

  rental: {
    id: 'rental',
    name: 'Alquiler/Renta',
    description: 'Alquiler de equipos, vehículos o espacios',
    icon: '🔑',
    category: 'services',
    defaultCapabilities: [
      'customer_management',
      'manages_recurrence',
      'manages_rentals',
      'asset_management',
      'appointment_booking',
      'recurring_billing',
      'fiscal_compliance'
    ],
    recommendedModules: ['assets', 'scheduling', 'recurring-billing', 'customers', 'fiscal'],
    complexity: 'intermediate',
    examples: ['Alquiler de autos', 'Renta de equipos', 'Coworking', 'Alquiler de canchas']
  },

  events: {
    id: 'events',
    name: 'Eventos/Catering',
    description: 'Organización de eventos y servicios de catering',
    icon: '🎉',
    category: 'services',
    defaultCapabilities: [
      'customer_management',
      'manages_events',
      'hosts_private_events',
      'event_management',
      'staff_scheduling',
      'inventory_tracking',
      'fiscal_compliance'
    ],
    recommendedModules: ['events', 'staff', 'materials', 'customers', 'fiscal'],
    complexity: 'intermediate',
    examples: ['Organizador de eventos', 'Catering', 'Salón de fiestas', 'Wedding planner']
  },

  fitness: {
    id: 'fitness',
    name: 'Fitness/Gimnasio',
    description: 'Gimnasios, estudios de yoga y centros de fitness',
    icon: '💪',
    category: 'services',
    defaultCapabilities: [
      'customer_management',
      'sells_services',
      'sells_services_by_class',
      'manages_memberships',
      'class_scheduling',
      'staff_management',
      'recurring_billing',
      'fiscal_compliance'
    ],
    recommendedModules: ['classes', 'staff', 'recurring-billing', 'customers', 'fiscal'],
    complexity: 'intermediate',
    examples: ['Gimnasio', 'Estudio de yoga', 'CrossFit box', 'Pilates studio']
  },

  education: {
    id: 'education',
    name: 'Educación/Academia',
    description: 'Instituciones educativas y academias',
    icon: '📚',
    category: 'services',
    defaultCapabilities: [
      'customer_management',
      'sells_services',
      'sells_services_by_class',
      'class_scheduling',
      'staff_management',
      'invoice_management',
      'fiscal_compliance'
    ],
    recommendedModules: ['classes', 'staff', 'customers', 'accounting', 'fiscal'],
    complexity: 'intermediate',
    examples: ['Academia de idiomas', 'Instituto de música', 'Centro de capacitación', 'Escuela de oficios']
  },

  healthcare: {
    id: 'healthcare',
    name: 'Salud/Clínica',
    description: 'Servicios de salud y atención médica',
    icon: '🏥',
    category: 'services',
    defaultCapabilities: [
      'customer_management',
      'sells_services',
      'sells_services_by_appointment',
      'appointment_booking',
      'staff_management',
      'invoice_management',
      'fiscal_compliance'
    ],
    recommendedModules: ['appointments', 'staff', 'customers', 'accounting', 'fiscal'],
    complexity: 'advanced',
    examples: ['Consultorio médico', 'Clínica dental', 'Centro de rehabilitación', 'Laboratorio']
  },

  custom: {
    id: 'custom',
    name: 'Personalizado',
    description: 'Modelo de negocio personalizable',
    icon: '⚙️',
    category: 'hybrid',
    defaultCapabilities: ['customer_management', 'fiscal_compliance'],
    recommendedModules: ['customers', 'fiscal'],
    complexity: 'enterprise',
    examples: ['Negocio único', 'Modelo híbrido', 'Múltiples verticales']
  }
};

// Business model categories
export const businessModelCategories = {
  products: {
    name: 'Productos',
    description: 'Negocios centrados en la venta de productos',
    models: ['restaurant', 'retail', 'ecommerce', 'b2b', 'marketplace'] as BusinessModel[]
  },
  services: {
    name: 'Servicios',
    description: 'Negocios centrados en la prestación de servicios',
    models: ['services', 'subscription', 'rental', 'events', 'fitness', 'education', 'healthcare'] as BusinessModel[]
  },
  hybrid: {
    name: 'Híbrido',
    description: 'Combinación de productos y servicios',
    models: ['custom'] as BusinessModel[]
  },
  platform: {
    name: 'Plataforma',
    description: 'Modelos de negocio de plataforma',
    models: ['marketplace'] as BusinessModel[]
  }
};

// Complexity levels
export const complexityLevels = {
  basic: {
    name: 'Básico',
    description: 'Funcionalidades esenciales',
    maxModules: 5,
    color: 'green'
  },
  intermediate: {
    name: 'Intermedio',
    description: 'Funcionalidades avanzadas',
    maxModules: 8,
    color: 'blue'
  },
  advanced: {
    name: 'Avanzado',
    description: 'Funcionalidades empresariales',
    maxModules: 12,
    color: 'orange'
  },
  enterprise: {
    name: 'Empresarial',
    description: 'Funcionalidades completas',
    maxModules: 20,
    color: 'purple'
  }
};

// Business model migration paths (for business evolution)
export const migrationPaths: Record<BusinessModel, BusinessModel[]> = {
  retail: ['ecommerce', 'b2b', 'marketplace'],
  restaurant: ['ecommerce', 'events'],
  services: ['subscription', 'education', 'healthcare'],
  ecommerce: ['marketplace', 'b2b'],
  b2b: ['marketplace'],
  subscription: ['marketplace'],
  rental: ['marketplace'],
  events: ['rental'],
  fitness: ['education', 'subscription'],
  education: ['subscription'],
  healthcare: ['subscription'],
  marketplace: [],
  custom: [] // Can migrate to any
};