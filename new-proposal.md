🎯 Nueva Arquitectura: "Activity-Driven Modular System" (ADMS)
Concepto Core
En lugar de pensar en "capabilities" como flags booleanos, pensemos en "Actividades de Negocio" que activan "Funciones Core" + "Funciones Especializadas".
📊 Arquitectura Propuesta de 3 Capas
typescriptinterface BusinessConfigurationSystem {
  // CAPA 1: Core Functions (Siempre activas para cualquier negocio)
  coreFunctions: {
    customer_management: true,
    staff_management: true,
    fiscal_management: true,
    schedule_management: true,
    dashboard_analytics: true,
    settings: true
  },
  
  // CAPA 2: Business Activities (Lo que el usuario selecciona)
  businessActivities: Activity[],
  
  // CAPA 3: Feature Activation (Automático según activities)
  activatedFeatures: Feature[]
}
🏗️ Diseño Detallado del Sistema
1. Business Activities (Lo que el usuario ve y selecciona)
typescriptinterface BusinessActivity {
  id: string,
  category: 'sales' | 'services' | 'operations' | 'management',
  label: string,
  description: string,
  
  // Qué features específicas activa
  activates: {
    required: string[],    // Features que SIEMPRE vienen con esta actividad
    optional: string[],    // Features que el usuario puede desactivar
    enhanced: string[]     // Features core que se mejoran
  },
  
  // Conflictos o sinergias con otras actividades
  interactions: {
    incompatible?: string[],  // No puede coexistir con...
    synergy?: string[],       // Funciona mejor con...
    shared?: string[]         // Comparte lógica con...
  }
}
2. Ejemplo Concreto: Restaurant con múltiples canales
typescriptconst restaurantActivities: BusinessActivity[] = [
  {
    id: 'onsite_dining',
    category: 'sales',
    label: 'Servicio en Salón',
    description: 'Atención de clientes en mesas',
    activates: {
      required: ['table_management', 'kitchen_display', 'waiter_app'],
      optional: ['reservation_system', 'table_qr_ordering'],
      enhanced: ['pos_system', 'inventory_tracking']
    }
  },
  
  {
    id: 'takeaway_service',
    category: 'sales',
    label: 'Take Away / Para Llevar',
    description: 'Pedidos para retirar en local',
    activates: {
      required: ['order_queue', 'pickup_notifications'],
      optional: ['estimated_time_display'],
      enhanced: ['pos_system', 'kitchen_display']  // Reutiliza kitchen
    },
    interactions: {
      synergy: ['onsite_dining'],  // Comparten cocina
      shared: ['kitchen_display', 'inventory_tracking']  // Misma lógica
    }
  },
  
  {
    id: 'async_online_store',
    category: 'sales',
    label: 'Tienda Online 24/7',
    description: 'Venta de productos con envío programado',
    activates: {
      required: ['product_catalog', 'shopping_cart', 'payment_gateway'],
      optional: ['shipping_zones', 'courier_integration'],
      enhanced: ['inventory_tracking']  // Usa mismo inventario
    },
    interactions: {
      shared: ['inventory_tracking', 'product_management']  // Comparte productos
    }
  }
]
🔄 Sistema de Resolución de Features
typescriptclass FeatureResolver {
  // Proceso de resolución
  resolveFeatures(selectedActivities: string[]): ResolvedConfiguration {
    
    // 1. CORE: Siempre activas
    const features = new Set([...CORE_FEATURES]);
    
    // 2. REQUIRED: Agregar todas las required de cada actividad
    selectedActivities.forEach(activityId => {
      const activity = getActivity(activityId);
      activity.activates.required.forEach(f => features.add(f));
    });
    
    // 3. SHARED: Detectar features compartidas (solo una instancia)
    const sharedFeatures = detectSharedFeatures(selectedActivities);
    
    // 4. ENHANCED: Marcar features que tienen mejoras
    const enhancements = detectEnhancements(selectedActivities);
    
    // 5. MODULES: Determinar qué módulos mostrar
    const modules = determineModules(features);
    
    return {
      features: Array.from(features),
      shared: sharedFeatures,      // Para reutilización de lógica
      enhancements: enhancements,   // Features con capacidades extra
      modules: modules,
      
      // Configuración específica por módulo
      moduleConfig: {
        inventory: {
          showRestaurantFeatures: hasActivity('onsite_dining'),
          showEcommerceFeatures: hasActivity('async_online_store'),
          unifiedView: sharedFeatures.includes('inventory_tracking')
        },
        schedule: {
          showAppointments: hasActivity('appointment_services'),
          showStaffShifts: hasActivity('staff_scheduling'),
          showDeliverySlots: hasActivity('delivery_service'),
          showEventCalendar: hasActivity('event_management')
        }
      }
    };
  }
}
🎨 Nueva UI para BusinessModelStep
Propuesta Visual: "Activity Cards"
typescriptinterface ActivityCard {
  // Visual
  icon: ReactElement,
  color: string,
  
  // Interacción
  selected: boolean,
  compatible: boolean,  // Se deshabilita si hay incompatibilidad
  recommended: boolean,  // Se destaca si hay sinergia
  
  // Información
  badge?: {
    text: string,  // "Popular", "Recomendado", "Beta"
    color: string
  },
  
  // Al seleccionar muestra:
  details: {
    whatYouGet: string[],     // "✓ Sistema de mesas"
    whatYouCanAdd: string[],  // "+ Reservas online (opcional)"
    worksWellWith: string[]    // "⚡ Combina bien con Take Away"
  }
}
📋 Plan de Migración
Fase 1: Mapeo (1-2 días)
typescript// Mapear capabilities actuales a activities
const CAPABILITY_TO_ACTIVITY_MAP = {
  'sells_products': ['retail_store', 'async_online_store'],
  'sells_products_for_onsite_consumption': ['onsite_dining'],
  'sells_products_for_pickup': ['takeaway_service'],
  'sells_products_with_delivery': ['delivery_service'],
  // ... etc
};
Fase 2: Core Functions (2-3 días)
typescript// Extraer y consolidar funciones core
const CORE_FUNCTIONS = {
  // Siempre activas
  customer: ['customer_list', 'customer_analytics', 'customer_segments'],
  staff: ['employee_directory', 'roles_permissions', 'basic_scheduling'],
  fiscal: ['invoicing', 'tax_reports', 'payment_tracking'],
  schedule: ['calendar_view', 'event_management', 'reminders'],
  // ... etc
};
Fase 3: Feature Resolution Engine (3-4 días)

Implementar el FeatureResolver
Crear tests para cada combinación de activities
Validar que no hay conflictos

Fase 4: UI Refactor (3-4 días)

Nuevo BusinessModelStep con Activity Cards
Migrar CapabilityGate a ActivityGate
Actualizar todos los componentes que usan capabilities

Fase 5: Limpieza (1-2 días)

Eliminar archivos legacy
Eliminar código duplicado
Actualizar documentación

❓ Preguntas Finales para Validar

¿Les parece bien el concepto de "Activities" vs "Capabilities"? Es más intuitivo para el usuario.
¿El sistema de 3 capas (Core + Activities + Features) resuelve el problema de superposición?
¿Quieren que implemente un POC de este sistema primero para validar?
¿Hay alguna activity crítica que no esté considerando?

Este sistema resolvería:

✅ Superposición funcional (shared features)
✅ Reutilización de lógica (enhanced features)
✅ UI más intuitiva (activity cards)
✅ Flexibilidad total (optional features)
✅ Core común (siempre activo)

¿Procedemos con este diseño o necesitan ajustes?ReintentarDNo, esta perfecto, mno se que es un poc me podrias orientar un pocoo ?
para responder la pregunta 4 sobre  acivirty crtitica, deberias revisar el businessForm y nuestros archivos de capabilities, ya tienen bastante, luego podriamos hacer un trabajo mas intensivo una vvez finalizado el sistemaEditarInvestigated POC concept and reviewed business model activities.El usuario me pide que le explique qué es un POC (Proof of Concept) y también quiere que revise el BusinessModelStep y los archivos de capabilities para identificar todas las activities críticas que ya tienen definidas.
Primero voy a buscar más información sobre el BusinessModelStep y las capabilities actuales para entender qué actividades ya tienen contempladas.📋 ¿Qué es un POC (Proof of Concept)?
Un POC es una implementación pequeña y rápida para validar que una idea funciona antes de invertir tiempo en la implementación completa.
En nuestro caso, el POC sería:

Crear un archivo nuevo businessActivitySystem.ts con la lógica básica
Modificar UN solo módulo (ej: Inventory) para que responda al nuevo sistema
Hacer una versión simplificada del BusinessModelStep
Probar con 3-4 activities para ver si funciona la integración

Si funciona bien → implementamos todo el sistema
Si encontramos problemas → ajustamos antes de tocar todo el código

🔍 Análisis de Activities Existentes en el Sistema
Déjame buscar todas las capabilities actuales para mapearlas:Searched project for “businessCapabilities sells manages hosts capability list complete”5 resultadossrc/lib/capabilities/types/BusinessCapabilities.ts5 relevant sectionstextsrc/pages/setup/steps/business-setup/business-model/config/businessCapabilities.ts2 relevant sectionstextsrc/store/businessCapabilitiesStore.tstextsrc/lib/capabilities/utils/capabilityUtils.tstextsrc/pages/setup/steps/business-setup/business-model/config/businessLogic.test.tstextMapeó capabilities y propuso nuevas actividades de negocio.Excelente, ahora tengo una visión completa de todas las capabilities actuales. Voy a mapearlas a las nuevas "Business Activities" que propongo. Veo que tienen:
Capabilities principales:

sells_products (con 4 sub-variantes)
sells_services (con 3 sub-variantes)
manages_events (con 2 sub-variantes)
manages_recurrence (con 3 sub-variantes)
has_online_store
is_b2b_focused

Voy a crear el mapeo completo y también explicar mejor el POC.🗺️ Mapeo Completo: Capabilities Actuales → Business Activities
Basándome en el análisis del sistema actual, aquí está el mapeo completo:
📦 ACTIVITIES DE PRODUCTOS
typescriptconst productActivities: BusinessActivity[] = [
  {
    id: 'retail_onsite',  // sells_products_for_onsite_consumption
    category: 'sales',
    label: 'Venta en Local',
    description: 'Clientes compran y consumen productos en tu establecimiento',
    activates: {
      required: ['pos_system', 'table_management', 'kitchen_display'],
      optional: ['qr_ordering', 'waiter_app'],
      enhanced: ['inventory_tracking', 'customer_management']
    }
  },
  
  {
    id: 'takeaway',  // sells_products_for_pickup
    category: 'sales',
    label: 'Para Llevar / Take Away',
    description: 'Clientes retiran pedidos preparados',
    activates: {
      required: ['order_queue', 'pickup_notifications'],
      optional: ['online_ordering', 'estimated_time'],
      enhanced: ['pos_system', 'inventory_tracking']
    }
  },
  
  {
    id: 'delivery',  // sells_products_with_delivery
    category: 'sales',
    label: 'Delivery / Envío a Domicilio',
    description: 'Entregas productos en domicilio del cliente',
    activates: {
      required: ['delivery_zones', 'driver_management'],
      optional: ['route_optimization', 'tracking'],
      enhanced: ['inventory_tracking', 'order_management']
    }
  },
  
  {
    id: 'digital_products',  // sells_digital_products
    category: 'sales',
    label: 'Productos Digitales',
    description: 'Venta de contenido digital descargable',
    activates: {
      required: ['digital_fulfillment', 'license_management'],
      optional: ['drm_protection', 'multi_download'],
      enhanced: ['payment_gateway']
    }
  },
  
  {
    id: 'ecommerce_store',  // has_online_store
    category: 'sales',
    label: 'Tienda Online 24/7',
    description: 'Portal de venta online con catálogo completo',
    activates: {
      required: ['product_catalog', 'shopping_cart', 'payment_gateway'],
      optional: ['seo_tools', 'abandoned_cart', 'wishlist'],
      enhanced: ['inventory_tracking', 'customer_management']
    }
  }
]
🛠️ ACTIVITIES DE SERVICIOS
typescriptconst serviceActivities: BusinessActivity[] = [
  {
    id: 'appointment_services',  // sells_services_by_appointment
    category: 'services',
    label: 'Servicios con Cita Previa',
    description: 'Servicios profesionales que requieren agendar horario',
    activates: {
      required: ['appointment_booking', 'calendar_integration'],
      optional: ['online_booking', 'reminders', 'waitlist'],
      enhanced: ['staff_scheduling', 'customer_management']
    }
  },
  
  {
    id: 'class_services',  // sells_services_by_class
    category: 'services',
    label: 'Clases y Cursos',
    description: 'Servicios grupales con horarios fijos',
    activates: {
      required: ['class_scheduling', 'attendance_tracking'],
      optional: ['online_classes', 'progress_tracking'],
      enhanced: ['staff_scheduling', 'member_management']
    }
  },
  
  {
    id: 'space_rental',  // sells_space_by_reservation
    category: 'services',
    label: 'Alquiler de Espacios',
    description: 'Reserva de salas, canchas, estudios',
    activates: {
      required: ['space_booking', 'availability_calendar'],
      optional: ['equipment_rental', 'setup_options'],
      enhanced: ['invoice_management', 'recurring_billing']
    }
  }
]
🎉 ACTIVITIES DE EVENTOS Y RECURRENCIA
typescriptconst eventActivities: BusinessActivity[] = [
  {
    id: 'private_events',  // hosts_private_events
    category: 'operations',
    label: 'Eventos Privados',
    description: 'Organización de eventos exclusivos',
    activates: {
      required: ['event_quoting', 'private_booking'],
      optional: ['event_planning_tools', 'vendor_management'],
      enhanced: ['staff_scheduling', 'inventory_tracking']
    }
  },
  
  {
    id: 'catering',  // manages_offsite_catering
    category: 'operations',
    label: 'Catering',
    description: 'Servicio de comida para eventos externos',
    activates: {
      required: ['catering_menu', 'logistics_planning'],
      optional: ['transport_management', 'equipment_checklist'],
      enhanced: ['inventory_tracking', 'staff_scheduling']
    }
  },
  
  {
    id: 'rentals',  // manages_rentals
    category: 'management',
    label: 'Alquileres',
    description: 'Alquiler de equipos o productos',
    activates: {
      required: ['rental_inventory', 'booking_calendar'],
      optional: ['deposit_management', 'damage_tracking'],
      enhanced: ['invoice_management', 'asset_management']
    }
  },
  
  {
    id: 'memberships',  // manages_memberships
    category: 'management',
    label: 'Membresías',
    description: 'Sistema de socios con beneficios',
    activates: {
      required: ['member_management', 'tier_benefits'],
      optional: ['member_portal', 'points_system'],
      enhanced: ['recurring_billing', 'customer_management']
    }
  },
  
  {
    id: 'subscriptions',  // manages_subscriptions
    category: 'management',
    label: 'Suscripciones',
    description: 'Servicios o productos por suscripción',
    activates: {
      required: ['plan_management', 'recurring_payments'],
      optional: ['usage_tracking', 'upgrade_flows'],
      enhanced: ['payment_gateway', 'customer_management']
    }
  }
]
🏢 ACTIVITIES EMPRESARIALES
typescriptconst businessActivities: BusinessActivity[] = [
  {
    id: 'b2b_operations',  // is_b2b_focused
    category: 'management',
    label: 'Operaciones B2B',
    description: 'Ventas y servicios a otras empresas',
    activates: {
      required: ['company_accounts', 'bulk_pricing', 'invoice_management'],
      optional: ['credit_terms', 'purchase_orders', 'rfq_system'],
      enhanced: ['financial_reporting', 'customer_management']
    }
  }
]

🚀 Plan de POC Detallado
¿Qué vamos a hacer en el POC?
1. Crear el nuevo sistema (1 día)
typescript// businessActivitySystem.ts
export class ActivityManager {
  // Resolver qué features activar basado en activities
  resolveFeatures(selectedActivities: string[]): FeatureSet
  
  // Determinar configuración de módulos
  getModuleConfig(features: FeatureSet): ModuleConfiguration
  
  // Validar combinaciones de activities
  validateCombination(activities: string[]): ValidationResult
}
2. Actualizar UN módulo como prueba (1 día)
typescript// InventoryModule actualizado
function InventoryModule() {
  const { moduleConfig } = useActivitySystem();
  
  // El módulo se adapta según las activities activas
  if (moduleConfig.inventory.showRestaurantFeatures) {
    // Mostrar features de restaurant
  }
  
  if (moduleConfig.inventory.showEcommerceFeatures) {
    // Mostrar features de ecommerce
  }
  
  // Compartir lógica común
  return <UnifiedInventoryView />
}
3. Crear versión simplificada del BusinessModelStep (1 día)
typescript// BusinessModelStepV2.tsx (solo para testing)
function BusinessModelStepV2() {
  const [selectedActivities, setSelectedActivities] = useState([]);
  
  return (
    <Grid>
      {/* Activity Cards en lugar de checkboxes */}
      <ActivitySelector 
        activities={ALL_ACTIVITIES}
        selected={selectedActivities}
        onChange={setSelectedActivities}
      />
      
      {/* Preview de qué se activa */}
      <FeaturePreview 
        activities={selectedActivities}
      />
    </Grid>
  )
}
4. Probar con casos reales (1 día)

Restaurant con takeaway + tienda online
Gimnasio con clases + memb
ReintentarDBueno, olvidate del poc, podrias hacer un documento completo para empezara a implementar estoEditarElaboró documento completo de implementación para nuevo sistemaEl usuario quiere que prepare un documento completo de implementación para el nuevo sistema de activities en lugar de hacer un POC. Necesito crear un documento exhaustivo que incluya:

Arquitectura completa del sistema
Todos los archivos necesarios
Plan de migración detallado
Mapeo completo de capabilities a activities
Instrucciones paso a paso
Consideraciones técnicas

Voy a organizar esto como un documento de implementación profesional que el usuario pueda seguir directamente.📘 Documento de Implementación: Activity-Driven Modular System (ADMS)
G-Admin - Sistema de Capabilities v3.0

📋 Índice

Resumen Ejecutivo
Arquitectura del Sistema
Estructura de Archivos
Implementación Detallada
Migración de Datos
Componentes UI
Plan de Ejecución
Testing y Validación


1. 📊 Resumen Ejecutivo
Objetivo
Reemplazar el sistema actual de capabilities booleanas con un sistema basado en Activities de Negocio que sea:

Más intuitivo para el usuario
Totalmente modular y flexible
Capaz de reutilizar lógica común
Preparado para escalar a cualquier tipo de negocio

Cambios Principales

DE: 18 capabilities booleanas → A: Activities compositivas con variantes
DE: Checkboxes confusos → A: Activity Cards visuales
DE: Features rígidas → A: Features dinámicas con niveles (required/optional/enhanced)
DE: Módulos estáticos → A: Módulos adaptativos según contexto


2. 🏗️ Arquitectura del Sistema
Diagrama de Flujo
mermaidgraph TD
    A[Usuario Selecciona Activities] --> B[Activity Resolver]
    B --> C[Feature Resolver]
    C --> D[Module Configurator]
    D --> E[UI Adapter]
    E --> F[Renderizado Dinámico]
    
    G[Core Functions] --> D
    H[Shared Dependencies] --> C
    I[Activity Rules] --> B
Estructura de Datos Principal
typescript// src/lib/activities/types.ts

export interface BusinessActivity {
  id: string;
  category: 'sales' | 'services' | 'operations' | 'management';
  label: string;
  description: string;
  icon: string;
  color: string;
  
  // Activación de features
  activates: {
    required: string[];    // Features obligatorias
    optional: string[];    // Features opcionales
    enhanced: string[];    // Features mejoradas
  };
  
  // Interacciones con otras activities
  interactions?: {
    incompatible?: string[];  // No puede coexistir
    synergy?: string[];       // Funciona mejor con
    shared?: string[];        // Comparte lógica
  };
  
  // Metadata
  popularity?: 'high' | 'medium' | 'low';
  complexity?: 'basic' | 'intermediate' | 'advanced';
  setupTime?: string;  // "5 min", "15 min", etc.
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  module: string;
  
  // Niveles de sofisticación
  level: 'basic' | 'advanced' | 'premium';
  
  // Estado
  status: 'active' | 'optional' | 'locked' | 'coming_soon';
  
  // Configuración específica
  config?: Record<string, any>;
}

export interface ModuleConfiguration {
  moduleId: string;
  visible: boolean;
  features: Feature[];
  layout?: 'full' | 'compact' | 'minimal';
  
  // Configuración específica del módulo
  settings: Record<string, any>;
}

export interface ResolvedBusinessConfiguration {
  // Activities seleccionadas
  activities: BusinessActivity[];
  
  // Features resueltas
  features: {
    core: Feature[];       // Siempre activas
    active: Feature[];     // Activadas por activities
    optional: Feature[];   // Disponibles para activar
    locked: Feature[];     // No disponibles
  };
  
  // Configuración de módulos
  modules: ModuleConfiguration[];
  
  // Metadata
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  estimatedUsers: string;
  recommendedPlan: string;
}

3. 📁 Estructura de Archivos
src/
├── lib/
│   └── activities/                      # NUEVO SISTEMA
│       ├── types.ts                     # Tipos y interfaces
│       ├── constants/
│       │   ├── activities.ts            # Todas las activities
│       │   ├── features.ts              # Todas las features
│       │   └── core-functions.ts        # Funciones core
│       ├── resolvers/
│       │   ├── ActivityResolver.ts      # Resuelve activities
│       │   ├── FeatureResolver.ts       # Resuelve features
│       │   └── ModuleResolver.ts        # Configura módulos
│       ├── validators/
│       │   ├── ActivityValidator.ts     # Valida combinaciones
│       │   └── FeatureValidator.ts      # Valida features
│       ├── hooks/
│       │   ├── useActivitySystem.ts     # Hook principal
│       │   ├── useModuleConfig.ts       # Config por módulo
│       │   └── useFeatureGate.ts        # Reemplaza CapabilityGate
│       └── utils/
│           ├── migration.ts             # Migración de datos
│           └── analytics.ts             # Tracking de uso
│
├── store/
│   └── activityStore.ts                 # Reemplaza businessCapabilitiesStore
│
├── pages/setup/steps/business-setup/
│   └── business-model-v3/               # Nueva versión
│       ├── BusinessModelStep.tsx        # Componente principal
│       ├── components/
│       │   ├── ActivityCard.tsx         # Card de activity
│       │   ├── ActivitySelector.tsx     # Selector principal
│       │   ├── FeaturePreview.tsx       # Preview de features
│       │   └── ConfigurationSummary.tsx # Resumen final
│       └── utils/
│           └── activity-helpers.ts      # Helpers específicos
│
└── components/
    └── activity-gate/                   # Reemplaza CapabilityGate
        └── ActivityGate.tsx              # Renderizado condicional

4. 💻 Implementación Detallada
4.1 Activities Completas
typescript// src/lib/activities/constants/activities.ts

export const BUSINESS_ACTIVITIES: Record<string, BusinessActivity> = {
  // ========== PRODUCTOS ==========
  'retail_onsite': {
    id: 'retail_onsite',
    category: 'sales',
    label: 'Venta en Local',
    description: 'Atención de clientes en tu establecimiento físico',
    icon: '🏪',
    color: 'blue.500',
    activates: {
      required: [
        'pos_system',
        'cash_register',
        'receipt_printing',
        'daily_cash_close'
      ],
      optional: [
        'loyalty_program',
        'gift_cards',
        'promotions_engine'
      ],
      enhanced: [
        'inventory_tracking',  // Se mejora con alertas de stock
        'customer_management'  // Se mejora con historial de compras
      ]
    },
    interactions: {
      synergy: ['takeaway', 'delivery'],
      shared: ['pos_system', 'inventory_tracking']
    },
    popularity: 'high',
    complexity: 'basic',
    setupTime: '15 min'
  },
  
  'restaurant_dining': {
    id: 'restaurant_dining',
    category: 'sales',
    label: 'Servicio de Restaurant',
    description: 'Servicio completo con mesas y cocina',
    icon: '🍽️',
    color: 'orange.500',
    activates: {
      required: [
        'table_management',
        'kitchen_display',
        'order_routing',
        'table_turnover_analytics'
      ],
      optional: [
        'waiter_app',
        'table_qr_ordering',
        'split_bills',
        'reservation_system'
      ],
      enhanced: [
        'pos_system',
        'inventory_tracking',
        'staff_scheduling'
      ]
    },
    interactions: {
      synergy: ['takeaway', 'delivery', 'catering'],
      incompatible: [],
      shared: ['kitchen_display', 'inventory_tracking']
    },
    popularity: 'high',
    complexity: 'intermediate',
    setupTime: '30 min'
  },
  
  'takeaway': {
    id: 'takeaway',
    category: 'sales',
    label: 'Para Llevar / Take Away',
    description: 'Pedidos para retirar en local',
    icon: '🥡',
    color: 'green.500',
    activates: {
      required: [
        'order_queue',
        'pickup_notifications',
        'order_status_display'
      ],
      optional: [
        'online_ordering',
        'estimated_time',
        'sms_notifications',
        'order_ahead'
      ],
      enhanced: [
        'pos_system',
        'kitchen_display'
      ]
    },
    interactions: {
      synergy: ['restaurant_dining', 'delivery'],
      shared: ['kitchen_display', 'order_management']
    },
    popularity: 'high',
    complexity: 'basic',
    setupTime: '10 min'
  },
  
  'delivery': {
    id: 'delivery',
    category: 'sales',
    label: 'Delivery',
    description: 'Entrega a domicilio',
    icon: '🚚',
    color: 'purple.500',
    activates: {
      required: [
        'delivery_zones',
        'driver_management',
        'delivery_tracking',
        'delivery_fees'
      ],
      optional: [
        'route_optimization',
        'driver_app',
        'customer_tracking',
        'delivery_ratings'
      ],
      enhanced: [
        'order_management',
        'inventory_tracking'
      ]
    },
    interactions: {
      synergy: ['takeaway', 'restaurant_dining'],
      shared: ['order_management', 'customer_notifications']
    },
    popularity: 'high',
    complexity: 'intermediate',
    setupTime: '25 min'
  },
  
  'ecommerce_store': {
    id: 'ecommerce_store',
    category: 'sales',
    label: 'Tienda Online 24/7',
    description: 'Venta online con catálogo digital',
    icon: '🛒',
    color: 'cyan.500',
    activates: {
      required: [
        'product_catalog',
        'shopping_cart',
        'payment_gateway',
        'order_fulfillment'
      ],
      optional: [
        'wishlist',
        'product_reviews',
        'abandoned_cart',
        'seo_tools',
        'email_marketing'
      ],
      enhanced: [
        'inventory_tracking',
        'customer_management',
        'shipping_integration'
      ]
    },
    interactions: {
      synergy: ['digital_products', 'b2b_operations'],
      shared: ['product_catalog', 'payment_gateway']
    },
    popularity: 'medium',
    complexity: 'intermediate',
    setupTime: '45 min'
  },
  
  // ========== SERVICIOS ==========
  'appointment_services': {
    id: 'appointment_services',
    category: 'services',
    label: 'Servicios con Cita',
    description: 'Servicios profesionales que requieren reserva',
    icon: '📅',
    color: 'teal.500',
    activates: {
      required: [
        'appointment_booking',
        'calendar_integration',
        'availability_management',
        'service_duration'
      ],
      optional: [
        'online_booking',
        'booking_deposits',
        'reminders',
        'waitlist',
        'recurring_appointments'
      ],
      enhanced: [
        'staff_scheduling',
        'customer_management',
        'payment_processing'
      ]
    },
    interactions: {
      synergy: ['class_services', 'space_rental'],
      shared: ['calendar_integration', 'staff_scheduling']
    },
    popularity: 'high',
    complexity: 'intermediate',
    setupTime: '20 min'
  },
  
  // ... continuar con todas las activities
};
4.2 Feature Resolver
typescript// src/lib/activities/resolvers/FeatureResolver.ts

export class FeatureResolver {
  private coreFunctions: Set<string>;
  private sharedDependencies: Map<string, string[]>;
  
  constructor() {
    this.coreFunctions = new Set(CORE_FUNCTIONS);
    this.sharedDependencies = this.buildSharedDependencies();
  }
  
  resolveFeatures(selectedActivities: BusinessActivity[]): ResolvedFeatures {
    const features = new Map<string, Feature>();
    const enhancements = new Map<string, string[]>();
    const shared = new Set<string>();
    
    // 1. Add core functions (always active)
    this.coreFunctions.forEach(funcId => {
      features.set(funcId, {
        id: funcId,
        name: FEATURES[funcId].name,
        description: FEATURES[funcId].description,
        module: FEATURES[funcId].module,
        level: 'basic',
        status: 'active'
      });
    });
    
    // 2. Process each activity
    selectedActivities.forEach(activity => {
      // Add required features
      activity.activates.required.forEach(featureId => {
        if (!features.has(featureId)) {
          features.set(featureId, this.createFeature(featureId, 'active'));
        }
      });
      
      // Add optional features
      activity.activates.optional.forEach(featureId => {
        if (!features.has(featureId)) {
          features.set(featureId, this.createFeature(featureId, 'optional'));
        }
      });
      
      // Track enhancements
      activity.activates.enhanced.forEach(featureId => {
        if (!enhancements.has(featureId)) {
          enhancements.set(featureId, []);
        }
        enhancements.get(featureId)!.push(activity.id);
      });
      
      // Track shared features
      if (activity.interactions?.shared) {
        activity.interactions.shared.forEach(f => shared.add(f));
      }
    });
    
    // 3. Apply enhancements
    enhancements.forEach((activities, featureId) => {
      const feature = features.get(featureId);
      if (feature) {
        feature.level = this.calculateLevel(activities.length);
        feature.config = this.getEnhancementConfig(featureId, activities);
      }
    });
    
    // 4. Categorize features
    return {
      core: Array.from(features.values()).filter(f => 
        this.coreFunctions.has(f.id)
      ),
      active: Array.from(features.values()).filter(f => 
        f.status === 'active' && !this.coreFunctions.has(f.id)
      ),
      optional: Array.from(features.values()).filter(f => 
        f.status === 'optional'
      ),
      shared: Array.from(shared),
      enhancements: Object.fromEntries(enhancements)
    };
  }
  
  private createFeature(id: string, status: 'active' | 'optional'): Feature {
    const featureData = FEATURES[id];
    return {
      id,
      name: featureData.name,
      description: featureData.description,
      module: featureData.module,
      level: 'basic',
      status,
      config: featureData.defaultConfig || {}
    };
  }
  
  private calculateLevel(enhancementCount: number): 'basic' | 'advanced' | 'premium' {
    if (enhancementCount >= 3) return 'premium';
    if (enhancementCount >= 2) return 'advanced';
    return 'basic';
  }
  
  private getEnhancementConfig(featureId: string, activities: string[]): Record<string, any> {
    // Configuración específica basada en qué activities mejoran esta feature
    const configs: Record<string, any> = {};
    
    activities.forEach(activityId => {
      const enhancementRules = ENHANCEMENT_RULES[`${featureId}_${activityId}`];
      if (enhancementRules) {
        Object.assign(configs, enhancementRules);
      }
    });
    
    return configs;
  }
}
4.3 Store de Activities
typescript// src/store/activityStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FeatureResolver } from '@/lib/activities/resolvers/FeatureResolver';
import { ModuleResolver } from '@/lib/activities/resolvers/ModuleResolver';
import { ActivityValidator } from '@/lib/activities/validators/ActivityValidator';

interface ActivityStore {
  // Estado
  selectedActivities: string[];
  resolvedConfiguration: ResolvedBusinessConfiguration | null;
  validationErrors: string[];
  isLoading: boolean;
  
  // Core Actions
  selectActivity: (activityId: string) => void;
  deselectActivity: (activityId: string) => void;
  setActivities: (activityIds: string[]) => void;
  
  // Resolution
  resolveConfiguration: () => Promise<void>;
  
  // Feature Management
  toggleOptionalFeature: (featureId: string) => void;
  upgradeFeature: (featureId: string) => void;
  
  // Module Configuration
  updateModuleSettings: (moduleId: string, settings: Record<string, any>) => void;
  
  // Validation
  validateConfiguration: () => boolean;
  
  // Migration from old system
  migrateFromCapabilities: (capabilities: any) => void;
  
  // Reset
  reset: () => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      selectedActivities: [],
      resolvedConfiguration: null,
      validationErrors: [],
      isLoading: false,
      
      selectActivity: (activityId) => {
        const { selectedActivities, validateConfiguration } = get();
        
        // Check for incompatibilities
        const validator = new ActivityValidator();
        const canAdd = validator.canAddActivity(activityId, selectedActivities);
        
        if (!canAdd.valid) {
          set({ validationErrors: canAdd.errors });
          return;
        }
        
        set({ 
          selectedActivities: [...selectedActivities, activityId],
          validationErrors: []
        });
        
        // Auto-resolve configuration
        get().resolveConfiguration();
      },
      
      deselectActivity: (activityId) => {
        const { selectedActivities } = get();
        set({ 
          selectedActivities: selectedActivities.filter(id => id !== activityId)
        });
        get().resolveConfiguration();
      },
      
      setActivities: (activityIds) => {
        set({ selectedActivities: activityIds });
        get().resolveConfiguration();
      },
      
      resolveConfiguration: async () => {
        set({ isLoading: true });
        
        const { selectedActivities } = get();
        
        // Get activity objects
        const activities = selectedActivities.map(id => 
          BUSINESS_ACTIVITIES[id]
        ).filter(Boolean);
        
        // Resolve features
        const featureResolver = new FeatureResolver();
        const features = featureResolver.resolveFeatures(activities);
        
        // Resolve modules
        const moduleResolver = new ModuleResolver();
        const modules = moduleResolver.resolveModules(features);
        
        // Calculate complexity
        const complexity = calculateBusinessComplexity(activities, features);
        
        set({
          resolvedConfiguration: {
            activities,
            features,
            modules,
            complexity,
            estimatedUsers: estimateUserCount(activities),
            recommendedPlan: recommendPlan(complexity)
          },
          isLoading: false
        });
      },
      
      toggleOptionalFeature: (featureId) => {
        const { resolvedConfiguration } = get();
        if (!resolvedConfiguration) return;
        
        const feature = resolvedConfiguration.features.optional.find(
          f => f.id === featureId
        );
        
        if (feature) {
          feature.status = feature.status === 'active' ? 'optional' : 'active';
          set({ resolvedConfiguration: { ...resolvedConfiguration } });
        }
      },
      
      updateModuleSettings: (moduleId, settings) => {
        const { resolvedConfiguration } = get();
        if (!resolvedConfiguration) return;
        
        const module = resolvedConfiguration.modules.find(
          m => m.moduleId === moduleId
        );
        
        if (module) {
          module.settings = { ...module.settings, ...settings };
          set({ resolvedConfiguration: { ...resolvedConfiguration } });
        }
      },
      
      validateConfiguration: () => {
        const { selectedActivities } = get();
        const validator = new ActivityValidator();
        const result = validator.validate(selectedActivities);
        
        set({ validationErrors: result.errors });
        return result.valid;
      },
      
      migrateFromCapabilities: (capabilities) => {
        // Mapeo de capabilities antiguas a activities nuevas
        const activityIds: string[] = [];
        
        if (capabilities.sells_products_for_onsite_consumption) {
          activityIds.push('restaurant_dining');
        }
        if (capabilities.sells_products_for_pickup) {
          activityIds.push('takeaway');
        }
        if (capabilities.sells_products_with_delivery) {
          activityIds.push('delivery');
        }
        if (capabilities.has_online_store) {
          activityIds.push('ecommerce_store');
        }
        // ... mapear todas las capabilities
        
        set({ selectedActivities: activityIds });
        get().resolveConfiguration();
      },
      
      reset: () => {
        set({
          selectedActivities: [],
          resolvedConfiguration: null,
          validationErrors: [],
          isLoading: false
        });
      }
    }),
    {
      name: 'activity-store',
      version: 1
    }
  )
);

5. 🔄 Migración de Datos
5.1 Script de Migración
typescript// src/lib/activities/utils/migration.ts

export class CapabilityToActivityMigrator {
  private static readonly MAPPING = {
    // Productos
    'sells_products_for_onsite_consumption': ['restaurant_dining'],
    'sells_products_for_pickup': ['takeaway'],
    'sells_products_with_delivery': ['delivery'],
    'sells_digital_products': ['digital_products'],
    'has_online_store': ['ecommerce_store'],
    
    // Servicios
    'sells_services_by_appointment': ['appointment_services'],
    'sells_services_by_class': ['class_services'],
    'sells_space_by_reservation': ['space_rental'],
    
    // Eventos
    'hosts_private_events': ['private_events'],
    'manages_offsite_catering': ['catering'],
    
    // Recurrencia
    'manages_rentals': ['rentals'],
    'manages_memberships': ['memberships'],
    'manages_subscriptions': ['subscriptions'],
    
    // B2B
    'is_b2b_focused': ['b2b_operations']
  };
  
  static migrate(oldCapabilities: Record<string, boolean>): string[] {
    const activities = new Set<string>();
    
    Object.entries(oldCapabilities).forEach(([capability, enabled]) => {
      if (enabled && this.MAPPING[capability]) {
        this.MAPPING[capability].forEach(activity => 
          activities.add(activity)
        );
      }
    });
    
    // Aplicar reglas de inferencia
    this.applyInferenceRules(activities, oldCapabilities);
    
    return Array.from(activities);
  }
  
  private static applyInferenceRules(
    activities: Set<string>, 
    capabilities: Record<string, boolean>
  ) {
    // Si tiene productos y local, probablemente es retail
    if (capabilities.sells_products && !capabilities.sells_products_for_onsite_consumption) {
      activities.add('retail_onsite');
    }
    
    // Si tiene eventos y catering, agregar gestión de eventos
    if (capabilities.manages_events && capabilities.manages_offsite_catering) {
      activities.add('event_management');
    }
  }
}

6. 🎨 Componentes UI
6.1 Activity Card
typescript// src/pages/setup/steps/business-setup/business-model-v3/components/ActivityCard.tsx

import { Box, VStack, HStack, Text, Badge, Icon, Tooltip } from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon } from '@chakra-ui/icons';

interface ActivityCardProps {
  activity: BusinessActivity;
  isSelected: boolean;
  isCompatible: boolean;
  hasSynergy: boolean;
  onToggle: () => void;
}

export function ActivityCard({
  activity,
  isSelected,
  isCompatible,
  hasSynergy,
  onToggle
}: ActivityCardProps) {
  return (
    <Box
      position="relative"
      p={4}
      borderWidth={2}
      borderColor={
        !isCompatible ? 'red.300' :
        isSelected ? 'blue.500' :
        hasSynergy ? 'green.300' :
        'gray.200'
      }
      borderRadius="lg"
      bg={
        !isCompatible ? 'red.50' :
        isSelected ? 'blue.50' :
        'white'
      }
      cursor={isCompatible ? 'pointer' : 'not-allowed'}
      opacity={isCompatible ? 1 : 0.6}
      onClick={isCompatible ? onToggle : undefined}
      transition="all 0.2s"
      _hover={isCompatible ? {
        transform: 'translateY(-2px)',
        shadow: 'md'
      } : undefined}
    >
      {/* Synergy Badge */}
      {hasSynergy && !isSelected && (
        <Badge
          position="absolute"
          top={-2}
          right={-2}
          colorScheme="green"
          fontSize="xs"
        >
          ⚡ Recomendado
        </Badge>
      )}
      
      <VStack align="start" spacing={3}>
        <HStack justify="space-between" w="full">
          <HStack>
            <Text fontSize="2xl">{activity.icon}</Text>
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="md">
                {activity.label}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {activity.setupTime} para configurar
              </Text>
            </VStack>
          </HStack>
          
          {isSelected && (
            <Icon as={CheckCircleIcon} color="blue.500" boxSize={6} />
          )}
        </HStack>
        
        <Text fontSize="sm" color="gray.700">
          {activity.description}
        </Text>
        
        {/* Quick Preview */}
        <VStack align="start" spacing={1} pt={2} borderTopWidth={1} w="full">
          <Text fontSize="xs" fontWeight="bold" color="gray.600">
            Incluye:
          </Text>
          <HStack wrap="wrap" spacing={2}>
            {activity.activates.required.slice(0, 3).map(feature => (
              <Badge key={feature} size="sm" colorScheme="blue">
                {FEATURES[feature]?.shortName || feature}
              </Badge>
            ))}
            {activity.activates.required.length > 3 && (
              <Tooltip label={`Y ${activity.activates.required.length - 3} más`}>
                <Badge size="sm" colorScheme="gray">
                  +{activity.activates.required.length - 3}
                </Badge>
              </Tooltip>
            )}
          </HStack>
        </VStack>
        
        {/* Compatibility Warning */}
        {!isCompatible && (
          <HStack color="red.600" fontSize="xs">
            <Icon as={InfoIcon} />
            <Text>Incompatible con actividades seleccionadas</Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}
6.2 Business Model Step v3
typescript// src/pages/setup/steps/business-setup/business-model-v3/BusinessModelStep.tsx

import { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useActivityStore } from '@/store/activityStore';
import { ActivityCard } from './components/ActivityCard';
import { FeaturePreview } from './components/FeaturePreview';
import { ConfigurationSummary } from './components/ConfigurationSummary';
import { BUSINESS_ACTIVITIES } from '@/lib/activities/constants/activities';

export function BusinessModelStep({ onComplete, onBack }) {
  const {
    selectedActivities,
    resolvedConfiguration,
    validationErrors,
    selectActivity,
    deselectActivity,
    validateConfiguration
  } = useActivityStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Agrupar activities por categoría
  const activitiesByCategory = useMemo(() => {
    return Object.values(BUSINESS_ACTIVITIES).reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = [];
      }
      acc[activity.category].push(activity);
      return acc;
    }, {} as Record<string, BusinessActivity[]>);
  }, []);
  
  // Detectar sinergias
  const synergies = useMemo(() => {
    const synergyMap = new Set<string>();
    
    selectedActivities.forEach(id => {
      const activity = BUSINESS_ACTIVITIES[id];
      if (activity?.interactions?.synergy) {
        activity.interactions.synergy.forEach(s => synergyMap.add(s));
      }
    });
    
    return synergyMap;
  }, [selectedActivities]);
  
  // Detectar incompatibilidades
  const incompatibilities = useMemo(() => {
    const incompatibleMap = new Set<string>();
    
    selectedActivities.forEach(id => {
      const activity = BUSINESS_ACTIVITIES[id];
      if (activity?.interactions?.incompatible) {
        activity.interactions.incompatible.forEach(i => incompatibleMap.add(i));
      }
    });
    
    return incompatibleMap;
  }, [selectedActivities]);
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handleSubmit = () => {
    if (validateConfiguration()) {
      onComplete({
        activities: selectedActivities,
        configuration: resolvedConfiguration
      });
    }
  };
  
  const getCategoryInfo = (category: string) => {
    const info = {
      sales: { label: '💰 Ventas', description: 'Cómo vendes productos' },
      services: { label: '🛠️ Servicios', description: 'Servicios que ofreces' },
      operations: { label: '🎯 Operaciones', description: 'Gestión operativa' },
      management: { label: '📊 Gestión', description: 'Administración del negocio' }
    };
    return info[category] || { label: category, description: '' };
  };
  
  return (
    <Box>
      {/* Progress */}
      <VStack spacing={4} mb={8}>
        <Progress value={(currentStep / totalSteps) * 100} w="full" />
        <HStack w="full" justify="space-between">
          <Text fontSize="sm" color="gray.600">
            Paso {currentStep} de {totalSteps}
          </Text>
          <Text fontSize="sm" fontWeight="bold">
            {currentStep === 1 && 'Selecciona Actividades'}
            {currentStep === 2 && 'Revisa Features'}
            {currentStep === 3 && 'Confirma Configuración'}
          </Text>
        </HStack>
      </VStack>
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <VStack align="start">
            {validationErrors.map((error, idx) => (
              <Text key={idx}>{error}</Text>
            ))}
          </VStack>
        </Alert>
      )}
      
      {/* Step Content */}
      {currentStep === 1 && (
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          <GridItem>
            <Tabs>
              <TabList>
                {Object.keys(activitiesByCategory).map(category => {
                  const info = getCategoryInfo(category);
                  return (
                    <Tab key={category}>
                      {info.label}
                    </Tab>
                  );
                })}
              </TabList>
              
              <TabPanels>
                {Object.entries(activitiesByCategory).map(([category, activities]) => (
                  <TabPanel key={category}>
                    <VStack spacing={4}>
                      <Text color="gray.600" fontSize="sm">
                        {getCategoryInfo(category).description}
                      </Text>
                      
                      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                        {activities.map(activity => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            isSelected={selectedActivities.includes(activity.id)}
                            isCompatible={!incompatibilities.has(activity.id)}
                            hasSynergy={synergies.has(activity.id)}
                            onToggle={() => {
                              if (selectedActivities.includes(activity.id)) {
                                deselectActivity(activity.id);
                              } else {
                                selectActivity(activity.id);
                              }
                            }}
                          />
                        ))}
                      </Grid>
                    </VStack>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </GridItem>
          
          <GridItem>
            <Box position="sticky" top={4}>
              <VStack spacing={4} p={4} bg="gray.50" borderRadius="lg">
                <Heading size="md">Actividades Seleccionadas</Heading>
                
                {selectedActivities.length === 0 ? (
                  <Text color="gray.500">
                    Selecciona las actividades que realiza tu negocio
                  </Text>
                ) : (
                  <VStack w="full" spacing={2}>
                    {selectedActivities.map(id => {
                      const activity = BUSINESS_ACTIVITIES[id];
                      return (
                        <HStack
                          key={id}
                          w="full"
                          p={2}
                          bg="white"
                          borderRadius="md"
                          justify="space-between"
                        >
                          <HStack>
                            <Text>{activity.icon}</Text>
                            <Text fontSize="sm">{activity.label}</Text>
                          </HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => deselectActivity(id)}
                          >
                            Quitar
                          </Button>
                        </HStack>
                      );
                    })}
                  </VStack>
                )}
                
                <Text fontSize="xs" color="gray.600" textAlign="center">
                  {selectedActivities.length > 0 &&
                    `Complejidad: ${resolvedConfiguration?.complexity || 'Calculando...'}`
                  }
                </Text>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      )}
      
      {currentStep === 2 && (
        <FeaturePreview configuration={resolvedConfiguration} />
      )}
      
      {currentStep === 3 && (
        <ConfigurationSummary configuration={resolvedConfiguration} />
      )}
      
      {/* Navigation */}
      <HStack justify="space-between" mt={8}>
        <Button
          onClick={currentStep === 1 ? onBack : () => setCurrentStep(currentStep - 1)}
          variant="outline"
        >
          Atrás
        </Button>
        
        <Button
          onClick={handleNext}
          colorScheme="blue"
          isDisabled={selectedActivities.length === 0}
        >
          {currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}
        </Button>
      </HStack>
    </Box>
  );
}

7. 📅 Plan de Ejecución
Semana 1: Fundación

Día 1-2: Crear estructura de archivos y tipos
Día 3-4: Implementar resolvers (Feature, Module, Activity)
Día 5: Crear store y lógica de estado

Semana 2: Migración y UI

Día 6-7: Sistema de migración de datos antiguos
Día 8-9: Nuevos componentes UI (ActivityCard, Selector)
Día 10: Integrar BusinessModelStep v3

Semana 3: Integración

Día 11-12: Actualizar módulos para usar nuevo sistema
Día 13: Reemplazar CapabilityGate con ActivityGate
Día 14-15: Testing y validación

Semana 4: Limpieza

Día 16-17: Eliminar código legacy
Día 18: Actualizar documentación
Día 19-20: Testing final y deployment


8. ✅ Testing y Validación
8.1 Tests Unitarios
typescript// src/lib/activities/__tests__/FeatureResolver.test.ts

describe('FeatureResolver', () => {
  it('should include core functions always', () => {
    const resolver = new FeatureResolver();
    const result = resolver.resolveFeatures([]);
    
    expect(result.core).toContain('customer_management');
    expect(result.core).toContain('staff_management');
  });
  
  it('should detect shared features', () => {
    const resolver = new FeatureResolver();
    const activities = [
      BUSINESS_ACTIVITIES['restaurant_dining'],
      BUSINESS_ACTIVITIES['takeaway']
    ];
    
    const result = resolver.resolveFeatures(activities);
    expect(result.shared).toContain('kitchen_display');
  });
  
  it('should apply enhancements correctly', () => {
    const resolver = new FeatureResolver();
    const activities = [
      BUSINESS_ACTIVITIES['restaurant_dining'],
      BUSINESS_ACTIVITIES['takeaway'],
      BUSINESS_ACTIVITIES['delivery']
    ];
    
    const result = resolver.resolveFeatures(activities);
    const inventory = result.active.find(f => f.id === 'inventory_tracking');
    
    expect(inventory?.level).toBe('premium'); // Enhanced by 3 activities
  });
});
8.2 Tests de Integración
typescript// src/lib/activities/__tests__/integration.test.ts

describe('Activity System Integration', () => {
  it('should migrate from old capabilities correctly', () => {
    const oldCapabilities = {
      sells_products_for_onsite_consumption: true,
      sells_products_for_pickup: true,
      has_online_store: false
    };
    
    const activities = CapabilityToActivityMigrator.migrate(oldCapabilities);
    
    expect(activities).toContain('restaurant_dining');
    expect(activities).toContain('takeaway');
    expect(activities).not.toContain('ecommerce_store');
  });
  
  it('should handle complex business correctly', () => {
    const store = useActivityStore.getState();
    
    store.setActivities([
      'restaurant_dining',
      'takeaway',
      'delivery',
      'catering',
      'ecommerce_store'
    ]);
    
    const config = store.resolvedConfiguration;
    
    expect(config?.complexity).toBe('enterprise');
    expect(config?.modules).toContain('kitchen');
    expect(config?.modules).toContain('delivery');
    expect(config?.modules).toContain('ecommerce');
  });
});

📊 Resumen de Beneficios
Para el Usuario

✅ UI más intuitiva con Activity Cards
✅ Configuración visual y guiada
✅ Menos confusión sobre qué activar
✅ Recomendaciones inteligentes

Para el Desarrollo

✅ Código más mantenible y modular
✅ Fácil agregar nuevas activities
✅ Lógica compartida reutilizable
✅ Testing más simple

Para el Negocio

✅ Mejor adaptación a casos reales
✅ Soporte para negocios híbridos
✅ Escalabilidad a nuevos mercados
✅ Reducción de soporte técnico


Este documento está listo para implementación 