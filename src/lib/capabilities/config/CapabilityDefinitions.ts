/**
 * CAPABILITY DEFINITIONS - Configuración declarativa
 *
 * CONCEPTO: Cada capability define exactamente qué efectos produce
 * VENTAJA: Business logic separada del código, fácil de mantener
 * ELIMINA: Toda la lógica hardcodeada en businessCapabilitySystem.ts
 */

import type { BusinessCapability, CapabilityId } from '../types/UnifiedCapabilities';

// ============================================
// UNIVERSAL CAPABILITIES
// ============================================

const UNIVERSAL_CAPABILITIES: Record<CapabilityId, BusinessCapability> = {
  'customer_management': {
    id: 'customer_management',
    name: 'Gestión de Clientes',
    description: 'Gestión de base de datos de clientes',
    category: 'universal',
    icon: '👥',
    effects: {
      modules: [
        {
          moduleId: 'customers',
          visible: true,
          features: {
            'customer_profiles': 'enabled',
            'customer_analytics': 'enabled'
          }
        }
      ],
      validations: [],
      tutorials: ['customer_management_basics'],
      achievements: ['first_customer_added'],
      ui: []
    }
  },

  'dashboard_analytics': {
    id: 'dashboard_analytics',
    name: 'Analytics de Negocio',
    description: 'Dashboard y métricas básicas',
    category: 'universal',
    icon: '📊',
    effects: {
      modules: [
        {
          moduleId: 'dashboard',
          visible: true,
          features: {
            'basic_metrics': 'enabled',
            'business_overview': 'enabled'
          }
        }
      ],
      validations: [],
      tutorials: ['dashboard_overview'],
      achievements: ['dashboard_expert'],
      ui: []
    }
  },

  'system_settings': {
    id: 'system_settings',
    name: 'Configuración del Sistema',
    description: 'Configuración básica de la aplicación',
    category: 'universal',
    icon: '⚙️',
    effects: {
      modules: [
        {
          moduleId: 'settings',
          visible: true,
          features: {
            'business_profile': 'required',
            'basic_config': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'businessName', required: true, message: 'Nombre del negocio es obligatorio' },
        { field: 'currency', required: true, message: 'Moneda es obligatoria' }
      ],
      tutorials: ['system_setup'],
      achievements: [],
      ui: []
    }
  },

  'fiscal_compliance': {
    id: 'fiscal_compliance',
    name: 'Cumplimiento Fiscal',
    description: 'Gestión fiscal y facturación',
    category: 'universal',
    icon: '📋',
    effects: {
      modules: [
        {
          moduleId: 'fiscal',
          visible: true,
          features: {
            'invoice_generation': 'required',
            'tax_calculation': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'taxId', required: true, message: 'CUIT/RUT es obligatorio' }
      ],
      tutorials: ['fiscal_setup', 'invoice_generation'],
      achievements: ['first_invoice_generated'],
      ui: []
    }
  },

  'staff_management': {
    id: 'staff_management',
    name: 'Gestión de Personal',
    description: 'Gestión de empleados y horarios',
    category: 'universal',
    icon: '👨‍💼',
    effects: {
      modules: [
        {
          moduleId: 'staff',
          visible: true,
          features: {
            'employee_management': 'enabled',
            'basic_scheduling': 'enabled'
          }
        },
        {
          moduleId: 'scheduling',
          visible: true,
          features: {
            'staff_scheduling': 'enabled',
            'timeoff_management': 'enabled'
          }
        }
      ],
      validations: [],
      tutorials: ['staff_management_basics', 'scheduling_101'],
      achievements: ['team_assembled', 'first_schedule_created'],
      ui: []
    }
  }
};

// ============================================
// ACTIVITY CAPABILITIES - QUÉ HACE EL NEGOCIO
// ============================================

const ACTIVITY_CAPABILITIES: Record<CapabilityId, BusinessCapability> = {
  'sells_products': {
    id: 'sells_products',
    name: 'Venta de Productos',
    description: 'Meta-capability para venta de productos (no dispara efectos directos)',
    category: 'activity',
    icon: '📦',
    effects: {
      modules: [
        {
          moduleId: 'products',
          visible: true,
          features: {
            'product_catalog': 'enabled',
            'inventory_tracking': 'enabled'
          }
        },
        {
          moduleId: 'materials',
          visible: true,
          features: {
            'inventory_management': 'enabled',
            'stock_tracking': 'enabled'
          }
        }
      ],
      validations: [],
      tutorials: ['product_management_basics'],
      achievements: ['first_product_created'],
      ui: []
    }
  },

  'sells_products_for_onsite_consumption': {
    id: 'sells_products_for_onsite_consumption',
    name: 'Consumo en Local',
    description: 'Restaurant/café - consumo en el local',
    category: 'activity',
    icon: '🍽️',
    requires: ['sells_products'],
    effects: {
      modules: [
        {
          moduleId: 'sales',
          visible: true,
          features: {
            'pos_system': 'required',
            'table_management': 'enabled',
            'kitchen_integration': 'enabled'
          }
        },
        {
          moduleId: 'operations',
          visible: true,
          features: {
            'kitchen_management': 'required',
            'table_service': 'enabled',
            'order_tracking': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'businessAddress', required: true, message: 'Dirección física es obligatoria' },
        { field: 'operatingHours', required: true, message: 'Horarios de atención son obligatorios' }
      ],
      tutorials: ['restaurant_setup', 'pos_system_basics', 'kitchen_management'],
      achievements: ['first_table_order', 'kitchen_expert'],
      ui: [
        { target: 'sales.table_selector', action: 'show' },
        { target: 'operations.kitchen_display', action: 'show' }
      ]
    }
  },

  'sells_products_for_pickup': {
    id: 'sells_products_for_pickup',
    name: 'Retiro en Tienda',
    description: 'Productos para retirar en tienda',
    category: 'activity',
    icon: '🏪',
    requires: ['sells_products'],
    effects: {
      modules: [
        {
          moduleId: 'sales',
          visible: true,
          features: {
            'pickup_orders': 'enabled',
            'pickup_scheduling': 'enabled',
            'pickup_notifications': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'businessAddress', required: true, message: 'Dirección de retiro es obligatoria' },
        { field: 'pickupHours', required: true, message: 'Horarios de retiro son obligatorios' }
      ],
      tutorials: ['pickup_setup', 'pickup_management'],
      achievements: ['first_pickup_order', 'pickup_master'],
      ui: [
        { target: 'sales.pickup_config', action: 'show' },
        { target: 'sales.pickup_calendar', action: 'show' }
      ]
    }
  },

  'sells_products_with_delivery': {
    id: 'sells_products_with_delivery',
    name: 'Envío a Domicilio',
    description: 'Delivery de productos',
    category: 'activity',
    icon: '🚚',
    requires: ['sells_products'],
    effects: {
      modules: [
        {
          moduleId: 'sales',
          visible: true,
          features: {
            'delivery_orders': 'enabled',
            'delivery_zones': 'enabled',
            'delivery_tracking': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'deliveryZones', required: true, message: 'Zonas de delivery son obligatorias' },
        { field: 'deliveryFees', required: true, message: 'Costos de delivery son obligatorios' }
      ],
      tutorials: ['delivery_setup', 'delivery_zones', 'delivery_management'],
      achievements: ['first_delivery', 'delivery_expert'],
      ui: [
        { target: 'sales.delivery_config', action: 'show' },
        { target: 'sales.delivery_zones_map', action: 'show' }
      ]
    }
  },

  'sells_services_by_appointment': {
    id: 'sells_services_by_appointment',
    name: 'Servicios por Cita',
    description: 'Servicios que requieren cita previa',
    category: 'activity',
    icon: '📅',
    effects: {
      modules: [
        {
          moduleId: 'sales',
          visible: true,
          features: {
            'appointment_booking': 'required',
            'service_calendar': 'enabled',
            'appointment_reminders': 'enabled'
          }
        },
        {
          moduleId: 'scheduling',
          visible: true,
          features: {
            'appointment_scheduling': 'required',
            'calendar_integration': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'serviceTypes', required: true, message: 'Tipos de servicio son obligatorios' },
        { field: 'availableHours', required: true, message: 'Horarios disponibles son obligatorios' }
      ],
      tutorials: ['appointment_setup', 'service_management', 'calendar_integration'],
      achievements: ['first_appointment', 'scheduling_master'],
      ui: [
        { target: 'sales.appointment_booking', action: 'show' },
        { target: 'scheduling.calendar_view', action: 'show' }
      ]
    }
  }
};

// ============================================
// INFRASTRUCTURE CAPABILITIES - CÓMO OPERA
// ============================================

const INFRASTRUCTURE_CAPABILITIES: Record<CapabilityId, BusinessCapability> = {
  'has_online_store': {
    id: 'has_online_store',
    name: 'Tienda Online',
    description: 'Presencia digital y ventas online',
    category: 'infrastructure',
    icon: '🌐',
    effects: {
      modules: [
        {
          moduleId: 'sales',
          visible: true,
          features: {
            'online_catalog': 'enabled',
            'online_payments': 'enabled',
            'ecommerce_analytics': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'websiteUrl', required: true, message: 'URL del sitio web es obligatoria' },
        { field: 'onlinePaymentMethods', required: true, message: 'Métodos de pago online son obligatorios' }
      ],
      tutorials: ['online_store_setup', 'ecommerce_basics'],
      achievements: ['online_presence', 'first_online_sale'],
      ui: [
        { target: 'sales.online_catalog', action: 'show' },
        { target: 'dashboard.ecommerce_metrics', action: 'show' }
      ]
    }
  },

  'is_b2b_focused': {
    id: 'is_b2b_focused',
    name: 'Enfoque B2B',
    description: 'Negocio orientado a empresas',
    category: 'infrastructure',
    icon: '🏢',
    effects: {
      modules: [
        {
          moduleId: 'customers',
          visible: true,
          features: {
            'corporate_accounts': 'enabled',
            'bulk_operations': 'enabled',
            'credit_management': 'enabled'
          }
        },
        {
          moduleId: 'sales',
          visible: true,
          features: {
            'volume_pricing': 'enabled',
            'corporate_invoicing': 'enabled',
            'contract_management': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'businessLicense', required: true, message: 'Licencia comercial es obligatoria para B2B' }
      ],
      tutorials: ['b2b_setup', 'corporate_sales', 'bulk_operations'],
      achievements: ['b2b_ready', 'corporate_client'],
      ui: [
        { target: 'customers.corporate_section', action: 'show' },
        { target: 'sales.volume_pricing', action: 'show' }
      ]
    }
  },

  'single_location': {
    id: 'single_location',
    name: 'Local Único',
    description: 'Opera desde una sola ubicación',
    category: 'infrastructure',
    icon: '🏪',
    effects: {
      modules: [],
      validations: [
        { field: 'businessAddress', required: true, message: 'Dirección del negocio es obligatoria' }
      ],
      tutorials: ['single_location_setup'],
      achievements: [],
      ui: [
        { target: 'settings.single_location_config', action: 'show' }
      ]
    }
  },

  'multi_location': {
    id: 'multi_location',
    name: 'Múltiples Locales',
    description: 'Opera desde múltiples ubicaciones',
    category: 'infrastructure',
    icon: '🏢',
    conflicts: ['single_location', 'mobile_business'],
    effects: {
      modules: [
        {
          moduleId: 'dashboard',
          visible: true,
          features: {
            'multi_location_analytics': 'enabled',
            'location_comparison': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'primaryLocation', required: true, message: 'Ubicación principal es obligatoria' },
        { field: 'additionalLocations', required: true, message: 'Ubicaciones adicionales son obligatorias' }
      ],
      tutorials: ['multi_location_setup', 'location_management'],
      achievements: ['multi_location_master'],
      ui: [
        { target: 'settings.multi_location_config', action: 'show' },
        { target: 'dashboard.location_selector', action: 'show' }
      ]
    }
  },

  'mobile_business': {
    id: 'mobile_business',
    name: 'Negocio Móvil',
    description: 'Food truck, servicios a domicilio, etc.',
    category: 'infrastructure',
    icon: '🚐',
    conflicts: ['single_location', 'multi_location'],
    effects: {
      modules: [
        {
          moduleId: 'operations',
          visible: true,
          features: {
            'mobile_pos': 'enabled',
            'location_tracking': 'enabled',
            'route_planning': 'enabled'
          }
        }
      ],
      validations: [
        { field: 'mobileEquipment', required: true, message: 'Equipamiento móvil es obligatorio' }
      ],
      tutorials: ['mobile_business_setup', 'mobile_pos'],
      achievements: ['mobile_ready', 'road_warrior'],
      ui: [
        { target: 'operations.mobile_controls', action: 'show' },
        { target: 'sales.mobile_pos', action: 'show' }
      ]
    }
  }
};

// ============================================
// UNIFIED CAPABILITY DEFINITIONS
// ============================================

export const CAPABILITY_DEFINITIONS: Record<CapabilityId, BusinessCapability> = {
  ...UNIVERSAL_CAPABILITIES,
  ...ACTIVITY_CAPABILITIES,
  ...INFRASTRUCTURE_CAPABILITIES
};

// Helper para debugging
export const getCapabilitiesByCategory = (category: BusinessCapability['category']) => {
  return Object.values(CAPABILITY_DEFINITIONS).filter(cap => cap.category === category);
};

export const getUniversalCapabilities = () => getCapabilitiesByCategory('universal');
export const getActivityCapabilities = () => getCapabilitiesByCategory('activity');
export const getInfrastructureCapabilities = () => getCapabilitiesByCategory('infrastructure');