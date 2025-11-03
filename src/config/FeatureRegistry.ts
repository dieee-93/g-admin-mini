/**
 * Feature Registry - Atomic Capabilities System v2.0
 *
 * Registry centralizado de las 86 features granulares del sistema.
 * Las features son activadas automáticamente por BusinessModelRegistry
 * según las capabilities e infrastructure que el usuario selecciona.
 *
 * Organizadas por DOMAIN para mantenibilidad del código.
 * El usuario NUNCA ve estas features - solo ve capabilities.
 *
 * @version 2.0.0 - Atomic System
 * @see docs/ATOMIC_CAPABILITIES_DESIGN.md
 */

import type { FeatureId, Feature } from './types';

// ============================================
// FEATURE DEFINITIONS (88 features)
// ============================================

const FEATURE_REGISTRY: Record<FeatureId, Feature> = {
  // ============================================
  // SALES DOMAIN (26 features)
  // ============================================

  'sales_order_management': {
    id: 'sales_order_management',
    name: 'Gestión de Órdenes',
    description: 'Sistema base de gestión de pedidos',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_payment_processing': {
    id: 'sales_payment_processing',
    name: 'Procesamiento de Pagos',
    description: 'Sistema de cobros y procesamiento de pagos',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_catalog_menu': {
    id: 'sales_catalog_menu',
    name: 'Catálogo de Menú',
    description: 'Catálogo base de productos/servicios',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_pos_onsite': {
    id: 'sales_pos_onsite',
    name: 'POS en Local',
    description: 'Punto de venta para consumo en local',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_dine_in_orders': {
    id: 'sales_dine_in_orders',
    name: 'Órdenes para Consumo en Local',
    description: 'Gestión de órdenes para mesas/cabinas',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_order_at_table': {
    id: 'sales_order_at_table',
    name: 'Pedidos en Mesa',
    description: 'Tomar pedidos directamente en la mesa',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_catalog_ecommerce': {
    id: 'sales_catalog_ecommerce',
    name: 'Catálogo E-commerce',
    description: 'Catálogo avanzado para tienda online',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_online_order_processing': {
    id: 'sales_online_order_processing',
    name: 'Procesamiento Asincrónico',
    description: 'Procesar pedidos fuera de horario comercial',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_online_payment_gateway': {
    id: 'sales_online_payment_gateway',
    name: 'Gateway de Pagos Online',
    description: 'Integración con pasarelas de pago digitales',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_cart_management': {
    id: 'sales_cart_management',
    name: 'Gestión de Carrito',
    description: 'Carrito de compras para e-commerce',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_checkout_process': {
    id: 'sales_checkout_process',
    name: 'Proceso de Checkout',
    description: 'Flujo de compra online completo',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_multicatalog_management': {
    id: 'sales_multicatalog_management',
    name: 'Gestión Multi-Catálogo',
    description: 'Gestionar múltiples catálogos (online + onsite)',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_bulk_pricing': {
    id: 'sales_bulk_pricing',
    name: 'Precios por Volumen',
    description: 'Pricing escalonado por cantidad',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_quote_generation': {
    id: 'sales_quote_generation',
    name: 'Generación de Cotizaciones',
    description: 'Sistema de cotizaciones B2B',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_product_retail': {
    id: 'sales_product_retail',
    name: 'Venta de Productos Retail',
    description: 'Venta de productos minoristas',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_package_management': {
    id: 'sales_package_management',
    name: 'Gestión de Paquetes',
    description: 'Paquetes de servicios/productos',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_contract_management': {
    id: 'sales_contract_management',
    name: 'Gestión de Contratos',
    description: 'Contratos corporativos B2B',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_tiered_pricing': {
    id: 'sales_tiered_pricing',
    name: 'Precios Diferenciados',
    description: 'Pricing por niveles/segmentos de cliente',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_approval_workflows': {
    id: 'sales_approval_workflows',
    name: 'Flujos de Aprobación',
    description: 'Aprobaciones multinivel para ventas B2B',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_quote_to_order': {
    id: 'sales_quote_to_order',
    name: 'Cotización a Orden',
    description: 'Convertir cotizaciones en órdenes',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_split_payment': {
    id: 'sales_split_payment',
    name: 'Pago Dividido',
    description: 'Dividir pago en múltiples métodos (efectivo + tarjeta)',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_tip_management': {
    id: 'sales_tip_management',
    name: 'Gestión de Propinas',
    description: 'Sistema de propinas para restaurantes/servicios',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_coupon_management': {
    id: 'sales_coupon_management',
    name: 'Gestión de Cupones',
    description: 'Sistema de descuentos y cupones promocionales',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_pickup_orders': {
    id: 'sales_pickup_orders',
    name: 'Pedidos para Retirar',
    description: 'Sistema de pedidos TakeAway/Pick-up para retirar en local',
    domain: 'SALES',
    category: 'conditional'
  },

  'sales_delivery_orders': {
    id: 'sales_delivery_orders',
    name: 'Pedidos a Domicilio',
    description: 'Sistema de pedidos con entrega a domicilio',
    domain: 'SALES',
    category: 'conditional'
  },

  // ============================================
  // INVENTORY DOMAIN (13 features)
  // ============================================

  'inventory_stock_tracking': {
    id: 'inventory_stock_tracking',
    name: 'Seguimiento de Stock',
    description: 'Control básico de inventario',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_alert_system': {
    id: 'inventory_alert_system',
    name: 'Sistema de Alertas',
    description: 'Alertas de stock bajo/crítico',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_purchase_orders': {
    id: 'inventory_purchase_orders',
    name: 'Órdenes de Compra',
    description: 'Gestión de órdenes de compra a proveedores',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_supplier_management': {
    id: 'inventory_supplier_management',
    name: 'Gestión de Proveedores',
    description: 'Catálogo y gestión de proveedores',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_sku_management': {
    id: 'inventory_sku_management',
    name: 'Gestión de SKUs',
    description: 'Catálogo de SKUs y variantes',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_barcode_scanning': {
    id: 'inventory_barcode_scanning',
    name: 'Escaneo de Códigos',
    description: 'Lectura de códigos de barras/QR',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_multi_unit_tracking': {
    id: 'inventory_multi_unit_tracking',
    name: 'Seguimiento Multi-Unidad',
    description: 'Conversión entre unidades (kg, litros, etc.)',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_low_stock_auto_reorder': {
    id: 'inventory_low_stock_auto_reorder',
    name: 'Reorden Automático',
    description: 'Generación automática de órdenes de compra',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_demand_forecasting': {
    id: 'inventory_demand_forecasting',
    name: 'Pronóstico de Demanda',
    description: 'Predicción de necesidades de inventario',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_available_to_promise': {
    id: 'inventory_available_to_promise',
    name: 'Disponible para Prometer (ATP)',
    description: 'Cálculo de stock disponible para venta',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_batch_lot_tracking': {
    id: 'inventory_batch_lot_tracking',
    name: 'Seguimiento de Lotes',
    description: 'Trazabilidad por lote/batch',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  'inventory_expiration_tracking': {
    id: 'inventory_expiration_tracking',
    name: 'Seguimiento de Vencimientos',
    description: 'Gestión de fechas de vencimiento (FIFO/FEFO)',
    domain: 'INVENTORY',
    category: 'conditional'
  },

  // ============================================
  // PRODUCTION DOMAIN (4 features)
  // ============================================

  'production_bom_management': {
    id: 'production_bom_management',
    name: 'BOM Management',
    description: 'Manage production workflows (recipes, assemblies, service protocols)',
    domain: 'PRODUCTION',
    category: 'conditional'
  },

  'production_display_system': {
    id: 'production_display_system',
    name: 'Production Display System',
    description: 'Display system for production queue (KDS, job board, etc.)',
    domain: 'PRODUCTION',
    category: 'conditional'
  },

  'production_order_queue': {
    id: 'production_order_queue',
    name: 'Cola de Órdenes',
    description: 'Gestión de cola de producción',
    domain: 'PRODUCTION',
    category: 'conditional'
  },

  'production_capacity_planning': {
    id: 'production_capacity_planning',
    name: 'Planificación de Capacidad',
    description: 'MRP básico - Material Requirements Planning',
    domain: 'PRODUCTION',
    category: 'conditional'
  },

  // ============================================
  // OPERATIONS DOMAIN (15 features)
  // ============================================

  'operations_pickup_scheduling': {
    id: 'operations_pickup_scheduling',
    name: 'Programación de Retiros',
    description: 'Agendamiento de horarios de pickup',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_notification_system': {
    id: 'operations_notification_system',
    name: 'Sistema de Notificaciones',
    description: 'Notificaciones push/SMS/email',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_delivery_zones': {
    id: 'operations_delivery_zones',
    name: 'Zonas de Entrega',
    description: 'Gestión de zonas geográficas de delivery',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_delivery_tracking': {
    id: 'operations_delivery_tracking',
    name: 'Seguimiento de Entregas',
    description: 'Rastreo en tiempo real de deliveries',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_shipping_integration': {
    id: 'operations_shipping_integration',
    name: 'Integración con Couriers',
    description: 'Integración con correos/transportistas',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_deferred_fulfillment': {
    id: 'operations_deferred_fulfillment',
    name: 'Cumplimiento Diferido',
    description: 'Procesar pedidos para entrega futura',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_table_management': {
    id: 'operations_table_management',
    name: 'Gestión de Mesas',
    description: 'Control de mesas del restaurante',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_table_assignment': {
    id: 'operations_table_assignment',
    name: 'Asignación de Mesas',
    description: 'Asignar mesas a clientes/meseros',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_floor_plan_config': {
    id: 'operations_floor_plan_config',
    name: 'Configuración de Plano',
    description: 'Diseño del plano del restaurante',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_bill_splitting': {
    id: 'operations_bill_splitting',
    name: 'División de Cuentas',
    description: 'Dividir cuenta entre comensales',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_waitlist_management': {
    id: 'operations_waitlist_management',
    name: 'Lista de Espera',
    description: 'Gestión de fila de espera para mesas',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  'operations_vendor_performance': {
    id: 'operations_vendor_performance',
    name: 'Performance de Proveedores',
    description: 'KPIs y evaluación de proveedores',
    domain: 'OPERATIONS',
    category: 'conditional'
  },

  // ============================================
  // SCHEDULING DOMAIN (4 features)
  // ============================================

  'scheduling_appointment_booking': {
    id: 'scheduling_appointment_booking',
    name: 'Reserva de Citas',
    description: 'Sistema de agendamiento de citas',
    domain: 'SCHEDULING',
    category: 'conditional'
  },

  'scheduling_calendar_management': {
    id: 'scheduling_calendar_management',
    name: 'Gestión de Calendario',
    description: 'Calendario de disponibilidad',
    domain: 'SCHEDULING',
    category: 'conditional'
  },

  'scheduling_reminder_system': {
    id: 'scheduling_reminder_system',
    name: 'Sistema de Recordatorios',
    description: 'Recordatorios automáticos de citas',
    domain: 'SCHEDULING',
    category: 'conditional'
  },

  'scheduling_availability_rules': {
    id: 'scheduling_availability_rules',
    name: 'Reglas de Disponibilidad',
    description: 'Configuración de horarios disponibles',
    domain: 'SCHEDULING',
    category: 'conditional'
  },

  // ============================================
  // CUSTOMER DOMAIN (5 features)
  // ============================================

  'customer_service_history': {
    id: 'customer_service_history',
    name: 'Historial de Servicios',
    description: 'Registro de servicios previos del cliente',
    domain: 'CUSTOMER',
    category: 'conditional'
  },

  'customer_preference_tracking': {
    id: 'customer_preference_tracking',
    name: 'Seguimiento de Preferencias',
    description: 'Registro de preferencias del cliente',
    domain: 'CUSTOMER',
    category: 'conditional'
  },

  'customer_loyalty_program': {
    id: 'customer_loyalty_program',
    name: 'Programa de Lealtad',
    description: 'Sistema de puntos/recompensas',
    domain: 'CUSTOMER',
    category: 'conditional'
  },

  'customer_online_accounts': {
    id: 'customer_online_accounts',
    name: 'Reservas Online',
    description: 'Portal web para reservas de clientes',
    domain: 'CUSTOMER',
    category: 'conditional'
  },


  // ============================================
  // FINANCE DOMAIN (4 features)
  // ============================================

  'finance_corporate_accounts': {
    id: 'finance_corporate_accounts',
    name: 'Cuentas Corporativas',
    description: 'Gestión de cuentas empresariales',
    domain: 'FINANCE',
    category: 'conditional'
  },

  'finance_credit_management': {
    id: 'finance_credit_management',
    name: 'Gestión de Crédito',
    description: 'Líneas de crédito para clientes B2B',
    domain: 'FINANCE',
    category: 'conditional'
  },

  'finance_invoice_scheduling': {
    id: 'finance_invoice_scheduling',
    name: 'Programación de Facturas',
    description: 'Facturación programada/recurrente',
    domain: 'FINANCE',
    category: 'conditional'
  },

  'finance_payment_terms': {
    id: 'finance_payment_terms',
    name: 'Términos de Pago',
    description: 'Configuración de términos de pago B2B',
    domain: 'FINANCE',
    category: 'conditional'
  },

  // ============================================
  // MOBILE DOMAIN (5 features)
  // ============================================


  'mobile_location_tracking': {
    id: 'mobile_location_tracking',
    name: 'Seguimiento de Ubicación',
    description: 'GPS tracking del negocio móvil',
    domain: 'MOBILE',
    category: 'conditional'
  },

  'mobile_route_planning': {
    id: 'mobile_route_planning',
    name: 'Planificación de Rutas',
    description: 'Optimización de rutas móviles',
    domain: 'MOBILE',
    category: 'conditional'
  },

  'mobile_inventory_constraints': {
    id: 'mobile_inventory_constraints',
    name: 'Restricciones de Inventario',
    description: 'Límites de stock para negocio móvil',
    domain: 'MOBILE',
    category: 'conditional'
  },


  // ============================================
  // MULTISITE DOMAIN (5 features)
  // ============================================

  'multisite_location_management': {
    id: 'multisite_location_management',
    name: 'Gestión de Ubicaciones',
    description: 'Administrar múltiples locales',
    domain: 'MULTISITE',
    category: 'conditional'
  },

  'multisite_centralized_inventory': {
    id: 'multisite_centralized_inventory',
    name: 'Inventario Centralizado',
    description: 'Inventario consolidado multi-local',
    domain: 'MULTISITE',
    category: 'conditional'
  },

  'multisite_transfer_orders': {
    id: 'multisite_transfer_orders',
    name: 'Órdenes de Transferencia',
    description: 'Transferencias entre locales',
    domain: 'MULTISITE',
    category: 'conditional'
  },

  'multisite_comparative_analytics': {
    id: 'multisite_comparative_analytics',
    name: 'Analytics Comparativo',
    description: 'Comparación de performance entre locales',
    domain: 'MULTISITE',
    category: 'conditional'
  },

  'multisite_configuration_per_site': {
    id: 'multisite_configuration_per_site',
    name: 'Configuración por Local',
    description: 'Config específica para cada ubicación',
    domain: 'MULTISITE',
    category: 'conditional'
  },

  // ============================================
  // ANALYTICS DOMAIN (2 features)
  // ============================================

  'analytics_ecommerce_metrics': {
    id: 'analytics_ecommerce_metrics',
    name: 'Métricas E-commerce',
    description: 'KPIs de tienda online',
    domain: 'ANALYTICS',
    category: 'conditional'
  },

  'analytics_conversion_tracking': {
    id: 'analytics_conversion_tracking',
    name: 'Seguimiento de Conversión',
    description: 'Tracking de embudos de conversión',
    domain: 'ANALYTICS',
    category: 'conditional'
  },

  // ============================================
  // STAFF DOMAIN (6 features) - Added for HR module
  // ============================================

  'staff_employee_management': {
    id: 'staff_employee_management',
    name: 'Gestión de Empleados',
    description: 'Administración básica de personal',
    domain: 'STAFF',
    category: 'conditional'
  },

  'staff_shift_management': {
    id: 'staff_shift_management',
    name: 'Gestión de Turnos',
    description: 'Programación y gestión de turnos de trabajo',
    domain: 'STAFF',
    category: 'conditional'
  },

  'staff_time_tracking': {
    id: 'staff_time_tracking',
    name: 'Registro de Tiempo',
    description: 'Control de asistencia y horas trabajadas',
    domain: 'STAFF',
    category: 'conditional'
  },

  'staff_performance_tracking': {
    id: 'staff_performance_tracking',
    name: 'Seguimiento de Desempeño',
    description: 'Evaluaciones y métricas de rendimiento',
    domain: 'STAFF',
    category: 'conditional'
  },

  'staff_training_management': {
    id: 'staff_training_management',
    name: 'Gestión de Capacitación',
    description: 'Programas de entrenamiento y desarrollo',
    domain: 'STAFF',
    category: 'conditional'
  },

  'staff_labor_cost_tracking': {
    id: 'staff_labor_cost_tracking',
    name: 'Seguimiento de Costos Laborales',
    description: 'Análisis y tracking de costos de personal',
    domain: 'STAFF',
    category: 'conditional'
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Obtiene una feature por ID
 */
export function getFeature(id: FeatureId): Feature | undefined {
  return FEATURE_REGISTRY[id];
}

/**
 * Obtiene todas las features
 */
export function getAllFeatures(): Feature[] {
  return Object.values(FEATURE_REGISTRY);
}

/**
 * Obtiene features por domain
 */
export function getFeaturesByDomain(domain: Feature['domain']): Feature[] {
  return getAllFeatures().filter(f => f.domain === domain);
}

/**
 * Obtiene features por category
 */
export function getFeaturesByCategory(category: Feature['category']): Feature[] {
  return getAllFeatures().filter(f => f.category === category);
}

// ============================================
// NOTA: Blocking Requirements y Foundational Milestones
// ============================================
//
// En el sistema atómico v2.0:
// - Blocking requirements están en BusinessModelRegistry (capability/infrastructure level)
// - Foundational milestones NO están implementados (planificados para sistema de gamificación futuro)
//
// Si necesitas blocking requirements, usa:
//   import { getBlockingRequirements } from '@/config/BusinessModelRegistry'
//

/**
 * Verifica si una feature existe
 */
export function hasFeature(id: string): id is FeatureId {
  return id in FEATURE_REGISTRY;
}

/**
 * Obtiene features agrupadas por domain
 */
export function getFeaturesByDomainGrouped(): Record<Feature['domain'], Feature[]> {
  const grouped: Partial<Record<Feature['domain'], Feature[]>> = {};

  getAllFeatures().forEach(feature => {
    if (!grouped[feature.domain]) {
      grouped[feature.domain] = [];
    }
    grouped[feature.domain]!.push(feature);
  });

  return grouped as Record<Feature['domain'], Feature[]>;
}

/**
 * Cuenta features por domain
 */
export function countFeaturesByDomain(): Record<Feature['domain'], number> {
  const counts: Partial<Record<Feature['domain'], number>> = {};

  getAllFeatures().forEach(feature => {
    counts[feature.domain] = (counts[feature.domain] || 0) + 1;
  });

  return counts as Record<Feature['domain'], number>;
}

// ============================================
// MODULE ↔ FEATURE BIDIRECTIONAL MAPPING
// ============================================

/**
 * Mapeo bidireccional entre módulos de navegación y features del sistema.
 *
 * Este mapeo resuelve el problema de módulos que nunca aparecían en la navegación
 * porque no tenían features asociadas o tenían nombres diferentes.
 *
 * - `alwaysActive`: Módulos que SIEMPRE deben mostrarse (dashboard, settings)
 * - `requiredFeatures`: Features que DEBEN estar activas (AND logic - todas requeridas)
 * - `optionalFeatures`: Features que PUEDEN activar el módulo (OR logic - al menos una)
 *
 * @version 1.0.0 - Navigation Integration Fix
 */
export const MODULE_FEATURE_MAP: Record<string, {
  alwaysActive?: boolean;
  requiredFeatures?: FeatureId[];
  optionalFeatures?: FeatureId[];
  description?: string;
}> = {
  // ============================================
  // CORE MODULES (Always Active)
  // ============================================

  'dashboard': {
    alwaysActive: true,
    description: 'Dashboard principal - siempre visible'
  },

  'settings': {
    alwaysActive: true,
    description: 'Configuración del sistema - siempre visible'
  },

  'gamification': {
    alwaysActive: true,
    description: 'Sistema de logros - siempre visible para motivar progreso'
  },

  'debug': {
    alwaysActive: true,
    description: 'Herramientas de debug - visible solo para SUPER_ADMIN (filtrado por role)'
  },
  'achievements': {
    alwaysActive: true,
    description: 'Sistema de logros y requisitos - siempre visible para mostrar progreso'
  },

  // ============================================
  // BUSINESS MODULES (Feature-dependent)
  // ============================================

  'sales': {
    optionalFeatures: [
      'sales_order_management',
      'sales_payment_processing',
      'sales_catalog_menu',
      'sales_pos_onsite'
    ],
    description: 'Módulo de ventas - activo con cualquier feature de SALES'
  },

  'materials': {
    optionalFeatures: [
      'inventory_stock_tracking',
      'inventory_alert_system',
      'inventory_purchase_orders'
    ],
    description: 'Módulo de inventario - activo con cualquier feature de INVENTORY'
  },

  'products': {
    optionalFeatures: [
      'production_bom_management',
      'production_display_system',
      'production_order_queue'
    ],
    description: 'Módulo de productos - activo con cualquier feature de PRODUCTION'
  },

  'operations': {
    optionalFeatures: [
      'operations_table_management',
      'operations_delivery_tracking',
      'operations_pickup_scheduling'
    ],
    description: 'Módulo de operaciones - activo con cualquier feature de OPERATIONS'
  },

  'scheduling': {
    optionalFeatures: [
      'scheduling_appointment_booking',
      'scheduling_calendar_management',
      'staff_shift_management' // Staff scheduling también activa este módulo
    ],
    description: 'Módulo de programación - activo con features de SCHEDULING o STAFF shifts'
  },

  'staff': {
    optionalFeatures: [
      'staff_employee_management',
      'staff_shift_management',
      'staff_time_tracking',
      'staff_performance_tracking'
    ],
    description: 'Módulo de personal - activo con cualquier feature de STAFF'
  },

  'customers': {
    optionalFeatures: [
      'customer_loyalty_program',
      'customer_service_history',
      'customer_preference_tracking',
      'sales_order_management' // Si vende, necesita gestionar clientes
    ],
    description: 'Módulo de clientes - activo con features de CUSTOMER o SALES'
  },

  'fiscal': {
    optionalFeatures: [
      'finance_invoice_scheduling',
      'finance_corporate_accounts',
      'finance_credit_management',
      'finance_payment_terms'
    ],
    description: 'Módulo fiscal/finanzas - activo con cualquier feature de FINANCE'
  },

  'finance': {
    requiredFeatures: ['finance_corporate_accounts'],
    optionalFeatures: [
      'finance_credit_management',
      'finance_invoice_scheduling',
      'finance_payment_terms'
    ],
    description: 'Módulo Finance B2B - gestión de cuentas corporativas y crédito'
  },

  'delivery': {
    requiredFeatures: [
      'operations_delivery_zones',
      'operations_delivery_tracking'
    ],
    description: 'Módulo de delivery - requiere TODAS las features de delivery (delivery_shipping capability)'
  },

  'production': { // RENAMED: kitchen → production
    requiredFeatures: [
      'production_display_system',
      'production_order_queue'
    ],
    description: 'Módulo de cocina - requiere TODAS las features de kitchen (production_workflow capability)'
  },

  'floor': {
    requiredFeatures: [
      'operations_table_management',
      'operations_floor_plan_config'
    ],
    description: 'Módulo de piso/mesas - requiere TODAS las features de floor (onsite_service capability)'
  },

  // ============================================
  // ADVANCED MODULES (Feature-dependent)
  // ============================================

  'executive': {
    optionalFeatures: [
      'analytics_ecommerce_metrics',
      'analytics_conversion_tracking',
      'multisite_comparative_analytics'
    ],
    description: 'Business Intelligence ejecutivo - requiere analytics avanzados'
  },

  'reporting': {
    optionalFeatures: [
      'analytics_ecommerce_metrics',
      'analytics_conversion_tracking',
      'multisite_comparative_analytics',
      'sales_order_management' // Reportes de ventas
    ],
    description: 'Sistema de reportes y analytics - activo con cualquier feature de analytics'
  },

  'intelligence': {
    optionalFeatures: [
      'analytics_ecommerce_metrics',
      'analytics_conversion_tracking',
      'sales_catalog_ecommerce',
      'sales_product_retail'
    ],
    description: 'Inteligencia de mercado y competencia - análisis de tendencias y competidores'
  },

  'products-analytics': {
    optionalFeatures: [
      'production_bom_management',
      'production_order_queue',
      'sales_product_retail',
      'inventory_demand_forecasting',
      'analytics_ecommerce_metrics'
    ],
    description: 'Analytics de productos - análisis de producción y rentabilidad'
  },

  'billing': {
    optionalFeatures: [
      'finance_invoice_scheduling',
      'finance_payment_terms',
      'customer_loyalty_program',
      'finance_credit_management'
    ],
    description: 'Billing recurrente y suscripciones - facturas programadas'
  },

  'finance-integrations': {
    optionalFeatures: [
      'sales_online_payment_gateway',
      'sales_payment_processing',
      'finance_payment_terms'
    ],
    description: 'Integraciones de pago - MercadoPago, MODO, pasarelas'
  },

  'memberships': {
    optionalFeatures: [
      'customer_loyalty_program',
      'scheduling_appointment_booking',
      'finance_invoice_scheduling'
    ],
    description: 'Gestión de membresías y suscripciones - planes y cobros recurrentes'
  },

  'rentals': {
    optionalFeatures: [
      'inventory_stock_tracking',
      'scheduling_appointment_booking',
      'operations_vendor_performance',
      'inventory_available_to_promise'
    ],
    description: 'Gestión de alquileres - equipos, espacios, recursos'
  },

  'assets': {
    optionalFeatures: [
      'inventory_stock_tracking',
      'operations_vendor_performance',
      'staff_employee_management',
      'scheduling_calendar_management'
    ],
    description: 'Gestión de activos - equipos, vehículos, mantenimiento'
  },

  'finance-advanced': {
    optionalFeatures: [
      'finance_invoice_scheduling',
      'finance_payment_terms'
    ],
    description: 'Finanzas avanzadas - billing recurrente e integraciones'
  },

  'operations-advanced': {
    optionalFeatures: [
      'operations_vendor_performance',
      'multisite_location_management'
    ],
    description: 'Operaciones avanzadas - membresías, alquileres, activos'
  },

  'advanced-tools': {
    optionalFeatures: [
      'analytics_ecommerce_metrics',
      'analytics_conversion_tracking'
    ],
    description: 'Herramientas avanzadas - reportes con IA'
  },

  // ============================================
  // INFRASTRUCTURE MODULES (Feature-dependent)
  // ============================================

  'mobile': {
    optionalFeatures: [
      'mobile_location_tracking',       // GPS tracking
      'mobile_route_planning',          // Route planning
      'mobile_inventory_constraints'    // Capacity limits
    ],
    description: 'Módulo móvil - activo con features de MOBILE'
  },

  'multisite': {
    optionalFeatures: [
      'multisite_location_management',
      'multisite_centralized_inventory',
      'multisite_transfer_orders'
    ],
    description: 'Multi-ubicación - activo con features de MULTISITE'
  },

  // ============================================
  // SUPPLY CHAIN MODULES (Added - Navigation Fix)
  // ============================================

  'suppliers': {
    optionalFeatures: [
      'inventory_supplier_management',
      'inventory_purchase_orders',
      'operations_vendor_performance'
    ],
    description: 'Módulo de gestión de proveedores'
  },

  'supplier-orders': {
    requiredFeatures: ['inventory_supplier_management'],
    optionalFeatures: [
      'inventory_purchase_orders',
      'inventory_demand_forecasting'
    ],
    description: 'Órdenes de compra a proveedores'
  }
};

// ============================================
// FEATURE → UI MAPPING FUNCTIONS
// ============================================

/**
 * Obtiene módulos activos para un conjunto de features (v2.0 - Navigation Integration Fix)
 *
 * Módulos son las rutas/secciones principales de la aplicación que se muestran
 * en la navegación según las features activas.
 *
 * Esta función usa MODULE_FEATURE_MAP para determinar qué módulos activar,
 * solucionando el problema de módulos que nunca aparecían.
 *
 * @param features - Array de FeatureIds activas
 * @returns Array de module IDs (routes) incluyendo always-active modules
 *
 * @example
 * const modules = getModulesForActiveFeatures(['sales_order_management']);
 * // Returns: ['dashboard', 'settings', 'gamification', 'sales', ...]
 */
export function getModulesForActiveFeatures(features: FeatureId[]): string[] {
  const activeModules = new Set<string>();

  // Iterate over all module definitions
  Object.entries(MODULE_FEATURE_MAP).forEach(([moduleId, config]) => {
    // Case 1: Always-active modules (dashboard, settings, gamification, debug)
    if (config.alwaysActive) {
      activeModules.add(moduleId);
      return;
    }

    // Case 2: Modules with required features (AND logic - all must be present)
    if (config.requiredFeatures && config.requiredFeatures.length > 0) {
      const hasAllRequired = config.requiredFeatures.every(f => features.includes(f));
      if (hasAllRequired) {
        activeModules.add(moduleId);
        return; // Continue to next module
      }
    }

    // Case 3: Modules with optional features (OR logic - at least one must be present)
    if (config.optionalFeatures && config.optionalFeatures.length > 0) {
      const hasAnyOptional = config.optionalFeatures.some(f => features.includes(f));
      if (hasAnyOptional) {
        activeModules.add(moduleId);
      }
    }
  });

  return Array.from(activeModules);
}

// ============================================
// EXPORTS
// ============================================

export type { FeatureId } from './types';
export { FEATURE_REGISTRY };
export default FEATURE_REGISTRY;
