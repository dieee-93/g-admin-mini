/**
 * Requirements Registry - LAYER 3: REQUIREMENTS & PROGRESSION
 *
 * Define lo que el usuario DEBE hacer para usar features.
 * Basado en patrones de Gamification y Progressive Onboarding (2024).
 *
 * Estructura:
 * - Blocking Validations: Restricciones duras (NO puedes usar X sin Y)
 * - Foundational Milestones: Setup inicial (completa para activar feature)
 * - Mastery Achievements: Gamificación progresiva (recompensas por uso)
 */

import type { FeatureId } from './FeatureRegistry';

// ============================================
// BLOCKING VALIDATIONS
// ============================================

export interface BlockingValidation {
  /** ID único de la validación */
  id: string;
  /** Campo que debe estar completo */
  field: string;
  /** Mensaje de error al usuario */
  message: string;
  /** Ruta para configurar el campo */
  redirectTo: string;
  /** Features que se bloquean hasta completar esto */
  blocksFeatures: FeatureId[];
  /** Función validadora */
  validator: (data: any) => boolean;
}

const BLOCKING_VALIDATIONS: Record<string, BlockingValidation> = {
  'business_name_required': {
    id: 'business_name_required',
    field: 'businessName',
    message: 'El nombre del negocio es obligatorio',
    redirectTo: '/admin/settings/business',
    blocksFeatures: ['system_settings'],
    validator: (profile) => {
      return profile?.businessName && profile.businessName.trim().length > 0;
    }
  },

  'currency_required': {
    id: 'currency_required',
    field: 'currency',
    message: 'Debes seleccionar una moneda',
    redirectTo: '/admin/settings/business',
    blocksFeatures: ['system_settings'],
    validator: (profile) => {
      return profile?.currency && profile.currency.trim().length > 0;
    }
  },

  'tax_id_required': {
    id: 'tax_id_required',
    field: 'taxId',
    message: 'CUIT/RUT es obligatorio para emitir facturas',
    redirectTo: '/admin/settings/fiscal',
    blocksFeatures: ['fiscal_compliance'],
    validator: (profile) => {
      return profile?.taxId && profile.taxId.trim().length > 0;
    }
  },

  'business_address_required': {
    id: 'business_address_required',
    field: 'businessAddress',
    message: 'No puedes abrir la tienda sin una dirección física',
    redirectTo: '/admin/settings/business',
    blocksFeatures: ['table_management', 'location_management', 'pickup_management'],
    validator: (profile) => {
      return profile?.businessAddress && profile.businessAddress.length > 0;
    }
  },

  'operating_hours_required': {
    id: 'operating_hours_required',
    field: 'operatingHours',
    message: 'Debes configurar tus horarios de atención',
    redirectTo: '/admin/settings/hours',
    blocksFeatures: ['table_management', 'pos_onsite'],
    validator: (_config) => {
      return config?.operatingHours && Object.keys(config.operatingHours).length > 0;
    }
  },

  'pickup_hours_required': {
    id: 'pickup_hours_required',
    field: 'pickupHours',
    message: 'Configura los horarios de retiro',
    redirectTo: '/admin/settings/pickup',
    blocksFeatures: ['pickup_management'],
    validator: (_config) => {
      return config?.pickupHours && Object.keys(config.pickupHours).length > 0;
    }
  },

  'delivery_zones_required': {
    id: 'delivery_zones_required',
    field: 'deliveryZones',
    message: 'Debes configurar al menos una zona de delivery',
    redirectTo: '/admin/settings/delivery',
    blocksFeatures: ['delivery_management'],
    validator: (_config) => {
      return config?.deliveryZones && config.deliveryZones.length > 0;
    }
  },

  'delivery_fees_required': {
    id: 'delivery_fees_required',
    field: 'deliveryFees',
    message: 'Establece los costos de delivery',
    redirectTo: '/admin/settings/delivery',
    blocksFeatures: ['delivery_management'],
    validator: (_config) => {
      return config?.deliveryFees && Object.keys(config.deliveryFees).length > 0;
    }
  },

  'service_types_required': {
    id: 'service_types_required',
    field: 'serviceTypes',
    message: 'Define los tipos de servicio que ofreces',
    redirectTo: '/admin/settings/services',
    blocksFeatures: ['appointment_booking'],
    validator: (_config) => {
      return config?.serviceTypes && config.serviceTypes.length > 0;
    }
  },

  'available_hours_required': {
    id: 'available_hours_required',
    field: 'availableHours',
    message: 'Configura tus horarios disponibles',
    redirectTo: '/admin/settings/services',
    blocksFeatures: ['appointment_booking'],
    validator: (_config) => {
      return config?.availableHours && Object.keys(config.availableHours).length > 0;
    }
  },

  'business_license_required': {
    id: 'business_license_required',
    field: 'businessLicense',
    message: 'Licencia comercial obligatoria para B2B',
    redirectTo: '/admin/settings/business',
    blocksFeatures: ['corporate_accounts'],
    validator: (profile) => {
      return profile?.businessLicense && profile.businessLicense.trim().length > 0;
    }
  },

  'primary_location_required': {
    id: 'primary_location_required',
    field: 'primaryLocation',
    message: 'Define la ubicación principal',
    redirectTo: '/admin/settings/locations',
    blocksFeatures: ['multi_location_analytics'],
    validator: (_config) => {
      return config?.primaryLocation && config.primaryLocation.id;
    }
  },

  'additional_locations_required': {
    id: 'additional_locations_required',
    field: 'additionalLocations',
    message: 'Agrega al menos una ubicación adicional',
    redirectTo: '/admin/settings/locations',
    blocksFeatures: ['multi_location_analytics'],
    validator: (_config) => {
      return config?.additionalLocations && config.additionalLocations.length > 0;
    }
  },

  'mobile_equipment_required': {
    id: 'mobile_equipment_required',
    field: 'mobileEquipment',
    message: 'Especifica tu equipamiento móvil',
    redirectTo: '/admin/settings/mobile',
    blocksFeatures: ['mobile_pos'],
    validator: (_config) => {
      return config?.mobileEquipment && config.mobileEquipment.length > 0;
    }
  },

  'website_url_required': {
    id: 'website_url_required',
    field: 'websiteUrl',
    message: 'URL del sitio web es obligatoria',
    redirectTo: '/admin/settings/ecommerce',
    blocksFeatures: ['ecommerce_catalog'],
    validator: (profile) => {
      return profile?.websiteUrl && profile.websiteUrl.trim().length > 0;
    }
  },

  'payment_methods_required': {
    id: 'payment_methods_required',
    field: 'onlinePaymentMethods',
    message: 'Configura métodos de pago online',
    redirectTo: '/admin/settings/ecommerce',
    blocksFeatures: ['online_payments'],
    validator: (_config) => {
      return config?.onlinePaymentMethods && config.onlinePaymentMethods.length > 0;
    }
  }
};

// ============================================
// FOUNDATIONAL MILESTONES
// ============================================

export type MilestoneCategory =
  | 'business_setup'
  | 'products'
  | 'delivery'
  | 'onsite'
  | 'pickup'
  | 'services'
  | 'b2b'
  | 'multi_location'
  | 'ecommerce';

export interface FoundationalMilestone {
  /** ID único del milestone */
  id: string;
  /** Nombre visible al usuario */
  name: string;
  /** Descripción de qué debe hacer */
  description: string;
  /** Categoría para organización */
  category: MilestoneCategory;
  /** Patrón de evento que completa este milestone */
  eventPattern: string;
  /** Feature que se desbloquea al completar (puede ser null si es parte de un grupo) */
  unlocksFeature?: FeatureId;
  /** Ruta para realizar la acción */
  redirectUrl: string;
  /** Icono */
  icon: string;
  /** Tiempo estimado en minutos */
  estimatedMinutes: number;
}

const FOUNDATIONAL_MILESTONES: Record<string, FoundationalMilestone> = {
  // ========== BUSINESS SETUP ==========
  'setup_business_info': {
    id: 'setup_business_info',
    name: 'Configurar Información del Negocio',
    description: 'Completa nombre, dirección y datos básicos',
    category: 'business_setup',
    eventPattern: 'business:info_updated',
    redirectUrl: '/admin/settings/business',
    icon: '🏢',
    estimatedMinutes: 3
  },

  'define_business_hours': {
    id: 'define_business_hours',
    name: 'Definir Horarios de Atención',
    description: 'Establece cuándo estará operativo tu negocio',
    category: 'business_setup',
    eventPattern: 'business:hours_defined',
    redirectUrl: '/admin/settings/hours',
    icon: '🕐',
    estimatedMinutes: 5
  },

  // ========== PRODUCTS ==========
  'create_first_product': {
    id: 'create_first_product',
    name: 'Crear Primer Producto',
    description: 'Añade al menos un producto a tu catálogo',
    category: 'products',
    eventPattern: 'products:product_created',
    unlocksFeature: 'product_catalog',
    redirectUrl: '/admin/products',
    icon: '📦',
    estimatedMinutes: 7
  },

  'setup_product_categories': {
    id: 'setup_product_categories',
    name: 'Organizar Categorías',
    description: 'Crea categorías para organizar tus productos',
    category: 'products',
    eventPattern: 'products:category_created',
    unlocksFeature: 'product_catalog',
    redirectUrl: '/admin/products/categories',
    icon: '📋',
    estimatedMinutes: 4
  },

  'configure_pricing': {
    id: 'configure_pricing',
    name: 'Configurar Precios',
    description: 'Establece precios para tus productos',
    category: 'products',
    eventPattern: 'products:pricing_updated',
    unlocksFeature: 'product_management',
    redirectUrl: '/admin/products',
    icon: '💰',
    estimatedMinutes: 6
  },

  'configure_inventory_tracking': {
    id: 'configure_inventory_tracking',
    name: 'Configurar Seguimiento de Inventario',
    description: 'Activa el control de stock',
    category: 'products',
    eventPattern: 'inventory:tracking_enabled',
    unlocksFeature: 'inventory_tracking',
    redirectUrl: '/admin/materials/settings',
    icon: '📊',
    estimatedMinutes: 5
  },

  // ========== DELIVERY ==========
  'configure_delivery_zones': {
    id: 'configure_delivery_zones',
    name: 'Configurar Zonas de Envío',
    description: 'Define las áreas donde realizarás entregas',
    category: 'delivery',
    eventPattern: 'delivery:zones_configured',
    unlocksFeature: 'delivery_management',
    redirectUrl: '/admin/settings/delivery',
    icon: '🗺️',
    estimatedMinutes: 12
  },

  'set_delivery_fees': {
    id: 'set_delivery_fees',
    name: 'Establecer Tarifas de Envío',
    description: 'Define los costos de envío por zona',
    category: 'delivery',
    eventPattern: 'delivery:fees_configured',
    unlocksFeature: 'delivery_management',
    redirectUrl: '/admin/settings/delivery',
    icon: '💸',
    estimatedMinutes: 6
  },

  'configure_delivery_times': {
    id: 'configure_delivery_times',
    name: 'Configurar Tiempos de Entrega',
    description: 'Establece estimaciones de tiempo de entrega',
    category: 'delivery',
    eventPattern: 'delivery:times_configured',
    unlocksFeature: 'delivery_management',
    redirectUrl: '/admin/settings/delivery',
    icon: '⏰',
    estimatedMinutes: 4
  },

  // ========== ONSITE CONSUMPTION ==========
  'configure_tables': {
    id: 'configure_tables',
    name: 'Configurar Mesas',
    description: 'Define las mesas disponibles en tu local',
    category: 'onsite',
    eventPattern: 'tables:configured',
    unlocksFeature: 'table_management',
    redirectUrl: '/admin/operations/tables',
    icon: '🪑',
    estimatedMinutes: 10
  },

  'define_dining_areas': {
    id: 'define_dining_areas',
    name: 'Definir Áreas de Comedor',
    description: 'Organiza tu local en áreas (salón, terraza, etc.)',
    category: 'onsite',
    eventPattern: 'dining_areas:defined',
    unlocksFeature: 'table_management',
    redirectUrl: '/admin/operations/areas',
    icon: '🏛️',
    estimatedMinutes: 5
  },

  'configure_kitchen_stations': {
    id: 'configure_kitchen_stations',
    name: 'Configurar Estaciones de Cocina',
    description: 'Define las áreas de preparación en cocina',
    category: 'onsite',
    eventPattern: 'kitchen:stations_configured',
    unlocksFeature: 'kitchen_display',
    redirectUrl: '/admin/operations/kitchen',
    icon: '🍳',
    estimatedMinutes: 8
  },

  // ========== PICKUP ==========
  'configure_pickup_hours': {
    id: 'configure_pickup_hours',
    name: 'Configurar Horarios de Retiro',
    description: 'Define cuándo pueden retirar pedidos',
    category: 'pickup',
    eventPattern: 'pickup:hours_configured',
    unlocksFeature: 'pickup_management',
    redirectUrl: '/admin/settings/pickup',
    icon: '📅',
    estimatedMinutes: 5
  },

  // ========== SERVICES ==========
  'configure_service_types': {
    id: 'configure_service_types',
    name: 'Configurar Tipos de Servicio',
    description: 'Define los servicios que ofreces',
    category: 'services',
    eventPattern: 'services:types_configured',
    unlocksFeature: 'appointment_booking',
    redirectUrl: '/admin/settings/services',
    icon: '📝',
    estimatedMinutes: 8
  },

  'define_available_hours': {
    id: 'define_available_hours',
    name: 'Definir Horarios Disponibles',
    description: 'Establece tu agenda de atención',
    category: 'services',
    eventPattern: 'services:hours_defined',
    unlocksFeature: 'appointment_booking',
    redirectUrl: '/admin/settings/services',
    icon: '🕐',
    estimatedMinutes: 6
  },

  // ========== B2B ==========
  'configure_corporate_features': {
    id: 'configure_corporate_features',
    name: 'Configurar Funciones Corporativas',
    description: 'Activa características B2B',
    category: 'b2b',
    eventPattern: 'b2b:features_configured',
    unlocksFeature: 'corporate_accounts',
    redirectUrl: '/admin/settings/b2b',
    icon: '🏢',
    estimatedMinutes: 10
  },

  // ========== ECOMMERCE ==========
  'configure_online_catalog': {
    id: 'configure_online_catalog',
    name: 'Configurar Catálogo Online',
    description: 'Prepara tu catálogo para web',
    category: 'ecommerce',
    eventPattern: 'ecommerce:catalog_configured',
    unlocksFeature: 'ecommerce_catalog',
    redirectUrl: '/admin/settings/ecommerce',
    icon: '🌐',
    estimatedMinutes: 15
  },

  'configure_payment_methods': {
    id: 'configure_payment_methods',
    name: 'Configurar Métodos de Pago',
    description: 'Conecta pasarelas de pago',
    category: 'ecommerce',
    eventPattern: 'ecommerce:payments_configured',
    unlocksFeature: 'online_payments',
    redirectUrl: '/admin/settings/payments',
    icon: '💳',
    estimatedMinutes: 12
  }
};

// ============================================
// MASTERY ACHIEVEMENTS
// ============================================

export interface MasteryAchievement {
  /** ID único del achievement */
  id: string;
  /** Nombre del achievement */
  name: string;
  /** Descripción */
  description: string;
  /** Tipo */
  type: 'mastery';
  /** Evento que dispara el progreso */
  triggerEvent: string;
  /** Cantidad necesaria para desbloquear */
  threshold: number;
  /** Recompensas */
  rewards: {
    xp: number;
    badge?: string;
  };
  /** Icono */
  icon: string;
}

const MASTERY_ACHIEVEMENTS: Record<string, MasteryAchievement> = {
  // ========== CUSTOMERS ==========
  'first_customer': {
    id: 'first_customer',
    name: 'Primer Cliente',
    description: 'Agregaste tu primer cliente',
    type: 'mastery',
    triggerEvent: 'customer:created',
    threshold: 1,
    rewards: { xp: 50, badge: 'customer_starter' },
    icon: '👤'
  },

  '5_customers': {
    id: '5_customers',
    name: 'Constructor de Base',
    description: 'Llegaste a 5 clientes',
    type: 'mastery',
    triggerEvent: 'customer:created',
    threshold: 5,
    rewards: { xp: 200, badge: 'customer_builder' },
    icon: '👥'
  },

  '10_customers': {
    id: '10_customers',
    name: 'Red en Crecimiento',
    description: 'Alcanzaste 10 clientes',
    type: 'mastery',
    triggerEvent: 'customer:created',
    threshold: 10,
    rewards: { xp: 500, badge: 'customer_networker' },
    icon: '👥'
  },

  '50_customers': {
    id: '50_customers',
    name: 'Base Establecida',
    description: '50 clientes en tu base de datos',
    type: 'mastery',
    triggerEvent: 'customer:created',
    threshold: 50,
    rewards: { xp: 1000, badge: 'customer_master' },
    icon: '👥'
  },

  'loyal_customer_base': {
    id: 'loyal_customer_base',
    name: 'Base de Clientes Leales',
    description: 'Primer cliente con 5+ compras',
    type: 'mastery',
    triggerEvent: 'customer:loyalty_milestone',
    threshold: 1,
    rewards: { xp: 300, badge: 'loyalty_builder' },
    icon: '❤️'
  },

  // ========== PRODUCTS ==========
  'first_product_created': {
    id: 'first_product_created',
    name: 'Primer Producto',
    description: 'Creaste tu primer producto',
    type: 'mastery',
    triggerEvent: 'products:product_created',
    threshold: 1,
    rewards: { xp: 100, badge: 'product_starter' },
    icon: '📦'
  },

  '10_products': {
    id: '10_products',
    name: 'Catálogo en Marcha',
    description: 'Llegaste a 10 productos',
    type: 'mastery',
    triggerEvent: 'products:product_created',
    threshold: 10,
    rewards: { xp: 300, badge: 'catalog_builder' },
    icon: '📦'
  },

  'catalog_complete': {
    id: 'catalog_complete',
    name: 'Catálogo Completo',
    description: '50 productos en tu catálogo',
    type: 'mastery',
    triggerEvent: 'products:product_created',
    threshold: 50,
    rewards: { xp: 800, badge: 'catalog_master' },
    icon: '📦'
  },

  // ========== INVENTORY ==========
  'inventory_organized': {
    id: 'inventory_organized',
    name: 'Inventario Organizado',
    description: 'Primer inventario completo',
    type: 'mastery',
    triggerEvent: 'inventory:full_count_completed',
    threshold: 1,
    rewards: { xp: 200, badge: 'inventory_starter' },
    icon: '📊'
  },

  'stock_master': {
    id: 'stock_master',
    name: 'Maestro del Stock',
    description: 'Sin quiebres de stock por 30 días',
    type: 'mastery',
    triggerEvent: 'inventory:zero_stockouts_month',
    threshold: 1,
    rewards: { xp: 500, badge: 'stock_master' },
    icon: '📊'
  },

  // ========== DELIVERY ==========
  'first_delivery': {
    id: 'first_delivery',
    name: 'Primera Entrega',
    description: 'Completaste tu primer delivery',
    type: 'mastery',
    triggerEvent: 'delivery:order_completed',
    threshold: 1,
    rewards: { xp: 100, badge: 'delivery_starter' },
    icon: '🚚'
  },

  '10_deliveries': {
    id: '10_deliveries',
    name: 'Repartidor en Marcha',
    description: '10 deliveries completados',
    type: 'mastery',
    triggerEvent: 'delivery:order_completed',
    threshold: 10,
    rewards: { xp: 300, badge: 'delivery_runner' },
    icon: '🚚'
  },

  '50_deliveries': {
    id: '50_deliveries',
    name: 'Delivery Profesional',
    description: '50 entregas completadas',
    type: 'mastery',
    triggerEvent: 'delivery:order_completed',
    threshold: 50,
    rewards: { xp: 800, badge: 'delivery_pro' },
    icon: '🚚'
  },

  'delivery_expert': {
    id: 'delivery_expert',
    name: 'Experto en Entregas',
    description: '100 deliveries con 95%+ satisfacción',
    type: 'mastery',
    triggerEvent: 'delivery:expert_milestone',
    threshold: 1,
    rewards: { xp: 1200, badge: 'delivery_expert' },
    icon: '🚚'
  },

  // ========== TABLES & ONSITE ==========
  'first_table_order': {
    id: 'first_table_order',
    name: 'Primera Orden en Mesa',
    description: 'Primera venta en mesa',
    type: 'mastery',
    triggerEvent: 'tables:order_created',
    threshold: 1,
    rewards: { xp: 100, badge: 'table_starter' },
    icon: '🪑'
  },

  'full_house': {
    id: 'full_house',
    name: 'Local Lleno',
    description: 'Todas las mesas ocupadas simultáneamente',
    type: 'mastery',
    triggerEvent: 'tables:full_capacity',
    threshold: 1,
    rewards: { xp: 500, badge: 'full_house' },
    icon: '🎉'
  },

  'table_master': {
    id: 'table_master',
    name: 'Maestro de Servicio',
    description: '100 órdenes en mesa con 95%+ satisfacción',
    type: 'mastery',
    triggerEvent: 'tables:master_milestone',
    threshold: 1,
    rewards: { xp: 1000, badge: 'table_master' },
    icon: '🪑'
  },

  'kitchen_expert': {
    id: 'kitchen_expert',
    name: 'Experto en Cocina',
    description: '500 órdenes procesadas en cocina',
    type: 'mastery',
    triggerEvent: 'kitchen:order_completed',
    threshold: 500,
    rewards: { xp: 1500, badge: 'kitchen_expert' },
    icon: '🍳'
  },

  // ========== PICKUP ==========
  'first_pickup_order': {
    id: 'first_pickup_order',
    name: 'Primer Retiro',
    description: 'Primera orden para retiro',
    type: 'mastery',
    triggerEvent: 'pickup:order_completed',
    threshold: 1,
    rewards: { xp: 100, badge: 'pickup_starter' },
    icon: '🏪'
  },

  'pickup_master': {
    id: 'pickup_master',
    name: 'Maestro del Retiro',
    description: '100 órdenes de retiro completadas',
    type: 'mastery',
    triggerEvent: 'pickup:order_completed',
    threshold: 100,
    rewards: { xp: 800, badge: 'pickup_master' },
    icon: '🏪'
  },

  // ========== APPOINTMENTS ==========
  'first_appointment': {
    id: 'first_appointment',
    name: 'Primera Cita',
    description: 'Primera cita agendada',
    type: 'mastery',
    triggerEvent: 'appointment:created',
    threshold: 1,
    rewards: { xp: 100, badge: 'appointment_starter' },
    icon: '📅'
  },

  'scheduling_master': {
    id: 'scheduling_master',
    name: 'Maestro de Agenda',
    description: '100 citas completadas',
    type: 'mastery',
    triggerEvent: 'appointment:completed',
    threshold: 100,
    rewards: { xp: 800, badge: 'scheduling_master' },
    icon: '📅'
  },

  // ========== B2B ==========
  'b2b_ready': {
    id: 'b2b_ready',
    name: 'B2B Listo',
    description: 'Configuración B2B completada',
    type: 'mastery',
    triggerEvent: 'b2b:setup_completed',
    threshold: 1,
    rewards: { xp: 300, badge: 'b2b_ready' },
    icon: '🏢'
  },

  'corporate_client': {
    id: 'corporate_client',
    name: 'Cliente Corporativo',
    description: 'Primera venta a empresa',
    type: 'mastery',
    triggerEvent: 'b2b:corporate_sale',
    threshold: 1,
    rewards: { xp: 500, badge: 'corporate_seller' },
    icon: '🏢'
  },

  // ========== MULTI-LOCATION ==========
  'multi_location_master': {
    id: 'multi_location_master',
    name: 'Maestro Multi-Local',
    description: 'Gestión exitosa de múltiples locales',
    type: 'mastery',
    triggerEvent: 'multi_location:milestone',
    threshold: 1,
    rewards: { xp: 1000, badge: 'multi_location_master' },
    icon: '🏢'
  },

  // ========== MOBILE ==========
  'mobile_ready': {
    id: 'mobile_ready',
    name: 'Negocio Móvil Listo',
    description: 'Configuración móvil completada',
    type: 'mastery',
    triggerEvent: 'mobile:setup_completed',
    threshold: 1,
    rewards: { xp: 300, badge: 'mobile_ready' },
    icon: '🚐'
  },

  'road_warrior': {
    id: 'road_warrior',
    name: 'Guerrero del Camino',
    description: '100 ventas móviles completadas',
    type: 'mastery',
    triggerEvent: 'mobile:sale_completed',
    threshold: 100,
    rewards: { xp: 1000, badge: 'road_warrior' },
    icon: '🚐'
  },

  // ========== ECOMMERCE ==========
  'online_presence': {
    id: 'online_presence',
    name: 'Presencia Online',
    description: 'Catálogo online activado',
    type: 'mastery',
    triggerEvent: 'ecommerce:catalog_published',
    threshold: 1,
    rewards: { xp: 300, badge: 'online_ready' },
    icon: '🌐'
  },

  'first_online_sale': {
    id: 'first_online_sale',
    name: 'Primera Venta Online',
    description: 'Primera venta por e-commerce',
    type: 'mastery',
    triggerEvent: 'ecommerce:sale_completed',
    threshold: 1,
    rewards: { xp: 500, badge: 'ecommerce_starter' },
    icon: '🌐'
  },

  // ========== GENERAL ==========
  'first_sale': {
    id: 'first_sale',
    name: 'Primera Venta',
    description: 'Tu primera venta en el sistema',
    type: 'mastery',
    triggerEvent: 'sales:order_completed',
    threshold: 1,
    rewards: { xp: 100, badge: 'first_sale' },
    icon: '💰'
  },

  '100_sales': {
    id: '100_sales',
    name: 'Vendedor Establecido',
    description: '100 ventas completadas',
    type: 'mastery',
    triggerEvent: 'sales:order_completed',
    threshold: 100,
    rewards: { xp: 1000, badge: 'sales_master' },
    icon: '💰'
  },

  'first_invoice': {
    id: 'first_invoice',
    name: 'Primera Factura',
    description: 'Emitiste tu primera factura',
    type: 'mastery',
    triggerEvent: 'fiscal:invoice_generated',
    threshold: 1,
    rewards: { xp: 100, badge: 'invoice_starter' },
    icon: '📋'
  },

  '10_invoices': {
    id: '10_invoices',
    name: 'Facturación en Marcha',
    description: '10 facturas emitidas',
    type: 'mastery',
    triggerEvent: 'fiscal:invoice_generated',
    threshold: 10,
    rewards: { xp: 300, badge: 'invoice_master' },
    icon: '📋'
  },

  'tax_compliant': {
    id: 'tax_compliant',
    name: 'Cumplimiento Fiscal',
    description: 'Primer mes con todas las facturas en regla',
    type: 'mastery',
    triggerEvent: 'fiscal:compliance_milestone',
    threshold: 1,
    rewards: { xp: 500, badge: 'tax_compliant' },
    icon: '📋'
  },

  'team_assembled': {
    id: 'team_assembled',
    name: 'Equipo Formado',
    description: 'Primer empleado registrado',
    type: 'mastery',
    triggerEvent: 'staff:employee_created',
    threshold: 1,
    rewards: { xp: 100, badge: 'team_starter' },
    icon: '👨‍💼'
  },

  'first_schedule_created': {
    id: 'first_schedule_created',
    name: 'Primer Horario',
    description: 'Creaste tu primer horario de trabajo',
    type: 'mastery',
    triggerEvent: 'scheduling:schedule_created',
    threshold: 1,
    rewards: { xp: 100, badge: 'schedule_starter' },
    icon: '📅'
  },

  'hr_expert': {
    id: 'hr_expert',
    name: 'Experto en RR.HH.',
    description: 'Gestión exitosa de 10+ empleados',
    type: 'mastery',
    triggerEvent: 'staff:expert_milestone',
    threshold: 1,
    rewards: { xp: 800, badge: 'hr_expert' },
    icon: '👨‍💼'
  },

  'dashboard_explorer': {
    id: 'dashboard_explorer',
    name: 'Explorador del Dashboard',
    description: 'Visitaste todas las secciones del dashboard',
    type: 'mastery',
    triggerEvent: 'dashboard:full_exploration',
    threshold: 1,
    rewards: { xp: 200, badge: 'dashboard_explorer' },
    icon: '📊'
  },

  'analytics_expert': {
    id: 'analytics_expert',
    name: 'Experto en Analytics',
    description: 'Usaste analytics por 30 días consecutivos',
    type: 'mastery',
    triggerEvent: 'dashboard:analytics_streak',
    threshold: 30,
    rewards: { xp: 500, badge: 'analytics_expert' },
    icon: '📊'
  },

  'pricing_expert': {
    id: 'pricing_expert',
    name: 'Experto en Precios',
    description: 'Optimizaste precios en 10+ productos',
    type: 'mastery',
    triggerEvent: 'products:pricing_optimized',
    threshold: 10,
    rewards: { xp: 400, badge: 'pricing_expert' },
    icon: '💰'
  }
};

// ============================================
// UNIFIED REGISTRY
// ============================================

export const REQUIREMENTS_REGISTRY = {
  blocking: BLOCKING_VALIDATIONS,
  foundational: FOUNDATIONAL_MILESTONES,
  mastery: MASTERY_ACHIEVEMENTS
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Obtiene una blocking validation por ID
 */
export function getBlockingValidation(id: string): BlockingValidation | undefined {
  return BLOCKING_VALIDATIONS[id];
}

/**
 * Obtiene un foundational milestone por ID
 */
export function getFoundationalMilestone(id: string): FoundationalMilestone | undefined {
  return FOUNDATIONAL_MILESTONES[id];
}

/**
 * Obtiene un mastery achievement por ID
 */
export function getMasteryAchievement(id: string): MasteryAchievement | undefined {
  return MASTERY_ACHIEVEMENTS[id];
}

/**
 * Obtiene todos los blocking validations
 */
export function getAllBlockingValidations(): BlockingValidation[] {
  return Object.values(BLOCKING_VALIDATIONS);
}

/**
 * Obtiene todos los foundational milestones
 */
export function getAllFoundationalMilestones(): FoundationalMilestone[] {
  return Object.values(FOUNDATIONAL_MILESTONES);
}

/**
 * Obtiene todos los mastery achievements
 */
export function getAllMasteryAchievements(): MasteryAchievement[] {
  return Object.values(MASTERY_ACHIEVEMENTS);
}

/**
 * Filtra milestones por categoría
 */
export function getMilestonesByCategory(category: MilestoneCategory): FoundationalMilestone[] {
  return Object.values(FOUNDATIONAL_MILESTONES).filter(m => m.category === category);
}

/**
 * Filtra blocking validations que bloquean una feature específica
 */
export function getValidationsForFeature(featureId: FeatureId): BlockingValidation[] {
  return Object.values(BLOCKING_VALIDATIONS).filter(v =>
    v.blocksFeatures.includes(featureId)
  );
}

/**
 * Verifica si todos los blocking validations están satisfechos
 */
export function checkAllValidations(
  validationIds: string[],
  profile: any,
  config: any
): { valid: boolean; failed: string[] } {
  const failed: string[] = [];

  validationIds.forEach(id => {
    const validation = BLOCKING_VALIDATIONS[id];
    if (!validation) return;

    const isValid = validation.validator(
      validation.field.includes('profile') ||
      validation.field.includes('business') ||
      validation.field.includes('tax') ||
      validation.field.includes('website')
        ? profile
        : config
    );

    if (!isValid) {
      failed.push(id);
    }
  });

  return {
    valid: failed.length === 0,
    failed
  };
}
