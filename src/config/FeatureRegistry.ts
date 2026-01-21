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
import { ModuleRegistry } from '@/lib/modules/ModuleRegistry';

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
    name: 'Catálogo para Menú',
    description: 'Catálogo estilo menú para ventas en local',
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

  'sales_package_management': {
    id: 'sales_package_management',
    name: 'Gestión de Paquetes',
    description: 'Bundles y paquetes de productos/servicios',
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
    description: 'Bill of Materials management for production',
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
  // PRODUCTS DOMAIN (8 features)
  // ============================================

  'products_recipe_management': {
    id: 'products_recipe_management',
    name: 'Recipe Management',
    description: 'Product recipe/BOM definition, costing, and pricing',
    domain: 'PRODUCTS',
    category: 'conditional'
  },

  'products_catalog_menu': {
    id: 'products_catalog_menu',
    name: 'Menu Catalog',
    description: 'Menu-style product catalog for onsite sales',
    domain: 'PRODUCTS',
    category: 'conditional'
  },

  'products_catalog_ecommerce': {
    id: 'products_catalog_ecommerce',
    name: 'E-commerce Catalog',
    description: 'Advanced product catalog for online store',
    domain: 'PRODUCTS',
    category: 'conditional'
  },

  'products_package_management': {
    id: 'products_package_management',
    name: 'Package Management',
    description: 'Product bundles and packages',
    domain: 'PRODUCTS',
    category: 'conditional'
  },

  'products_availability_calculation': {
    id: 'products_availability_calculation',
    name: 'Availability Calculation',
    description: 'Real-time product availability based on materials',
    domain: 'PRODUCTS',
    category: 'conditional'
  },

  'products_cost_intelligence': {
    id: 'products_cost_intelligence',
    name: 'Cost Intelligence',
    description: 'Automated recipe costing and margin analysis',
    domain: 'PRODUCTS',
    category: 'conditional'
  },

  'products_dynamic_materials': {
    id: 'products_dynamic_materials',
    name: 'Dynamic Materials',
    description: 'Add materials during service delivery',
    domain: 'PRODUCTS',
    category: 'conditional'
  },

  // 'products_digital_delivery': {
  //   id: 'products_digital_delivery',
  //   name: 'Digital Delivery',
  //   description: 'Digital product delivery and access management',
  //   domain: 'PRODUCTS',
  //   category: 'conditional'
  // },

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
  },

  // ============================================
  // RENTAL DOMAIN (5 features)
  // ============================================

  'rental_item_management': {
    id: 'rental_item_management',
    name: 'Gestión de Items en Alquiler',
    description: 'Catálogo de activos disponibles para rentar',
    domain: 'RENTAL',
    category: 'conditional'
  },

  'rental_booking_calendar': {
    id: 'rental_booking_calendar',
    name: 'Calendario de Reservas',
    description: 'Gestión de disponibilidad y reservas',
    domain: 'RENTAL',
    category: 'conditional'
  },

  'rental_availability_tracking': {
    id: 'rental_availability_tracking',
    name: 'Seguimiento de Disponibilidad',
    description: 'Control de disponibilidad en tiempo real',
    domain: 'RENTAL',
    category: 'conditional'
  },

  'rental_pricing_by_duration': {
    id: 'rental_pricing_by_duration',
    name: 'Precios por Duración',
    description: 'Pricing variable según tiempo de alquiler',
    domain: 'RENTAL',
    category: 'conditional'
  },

  'rental_late_fees': {
    id: 'rental_late_fees',
    name: 'Cargos por Mora',
    description: 'Penalidades por devolución tardía',
    domain: 'RENTAL',
    category: 'conditional'
  },

  // ============================================
  // MEMBERSHIP DOMAIN (5 features)
  // ============================================

  'membership_subscription_plans': {
    id: 'membership_subscription_plans',
    name: 'Planes de Suscripción',
    description: 'Gestión de planes y niveles de membresía',
    domain: 'MEMBERSHIP',
    category: 'conditional'
  },

  'membership_recurring_billing': {
    id: 'membership_recurring_billing',
    name: 'Facturación Recurrente',
    description: 'Cobros automáticos periódicos',
    domain: 'MEMBERSHIP',
    category: 'conditional'
  },

  'membership_access_control': {
    id: 'membership_access_control',
    name: 'Control de Acceso',
    description: 'Gestión de permisos por nivel de membresía',
    domain: 'MEMBERSHIP',
    category: 'conditional'
  },

  'membership_usage_tracking': {
    id: 'membership_usage_tracking',
    name: 'Seguimiento de Uso',
    description: 'Tracking de visitas/uso de servicios',
    domain: 'MEMBERSHIP',
    category: 'conditional'
  },

  'membership_benefits_management': {
    id: 'membership_benefits_management',
    name: 'Gestión de Beneficios',
    description: 'Beneficios y promociones por membresía',
    domain: 'MEMBERSHIP',
    category: 'conditional'
  },

  // ============================================
  // DIGITAL PRODUCTS DOMAIN (4 features)
  // ============================================

  'digital_file_delivery': {
    id: 'digital_file_delivery',
    name: 'Entrega de Archivos',
    description: 'Sistema de descarga de productos digitales',
    domain: 'DIGITAL',
    category: 'conditional'
  },

  'digital_license_management': {
    id: 'digital_license_management',
    name: 'Gestión de Licencias',
    description: 'Generación y validación de licencias',
    domain: 'DIGITAL',
    category: 'conditional'
  },

  'digital_download_tracking': {
    id: 'digital_download_tracking',
    name: 'Tracking de Descargas',
    description: 'Seguimiento y límites de descarga',
    domain: 'DIGITAL',
    category: 'conditional'
  },

  'digital_version_control': {
    id: 'digital_version_control',
    name: 'Control de Versiones',
    description: 'Gestión de versiones de productos digitales',
    domain: 'DIGITAL',
    category: 'conditional'
  },

  // ============================================
  // CORE DOMAIN (7 features)
  // ============================================

  // ============================================
  // REMOVED: 'always_active' features
  // ============================================
  // Previously: customers, dashboard, settings, gamification, debug
  // These are now CORE modules (not features) loaded via CORE_MODULES array
  // See: src/lib/modules/constants.ts for CORE_MODULES definition
  // ============================================

  'executive': {
    id: 'executive',
    name: 'Dashboard Ejecutivo',
    description: 'Reportes y métricas ejecutivas',
    domain: 'ANALYTICS',
    category: 'conditional'
  },

  'can_view_menu_engineering': {
    id: 'can_view_menu_engineering',
    name: 'Ver Ingeniería de Menú',
    description: 'Acceso a análisis de ingeniería de menú',
    domain: 'ANALYTICS',
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
// CORE FEATURES (Industry Standard Pattern)
// ============================================

/**
 * CORE_FEATURES - Features that are ALWAYS active regardless of capabilities
 * 
 * DESIGN DECISION (validated with industry research):
 * - WordPress has "core plugins" (always installed)
 * - Odoo has "base" module (always installed)
 * - Martin Fowler categorizes these as "Permissioning Toggles" (long-lived, years)
 * 
 * REMOVED: CORE_FEATURES array
 *
 * Previously: Features that were always active regardless of business model
 * Now: CORE modules loaded directly via CORE_MODULES array in bootstrap.ts
 *
 * @see src/lib/modules/constants.ts for CORE_MODULES definition
 * @see docs/plans/2026-01-19-capabilities-architecture-simplification.md
 */
// export const CORE_FEATURES: REMOVED - See comment above

// ============================================
// MODULE FEATURE MAP
// ============================================

/**
 * @deprecated MODULE_FEATURE_MAP - LEGACY STATIC MAPPING
 *
 * ⚠️ DEPRECATION NOTICE (2026-01-19):
 * This map is NO LONGER USED in production code.
 * Module loading is now handled by:
 * - CORE_MODULES array (src/lib/modules/constants.ts)
 * - OPTIONAL_MODULES mapping (src/lib/modules/constants.ts)
 * - Bootstrap logic (src/lib/modules/bootstrap.ts)
 *
 * This map is ONLY used in legacy tests and should be removed in a future refactor.
 *
 * LEGACY PROPERTIES (no longer relevant):
 * - alwaysActive → REPLACED by CORE_MODULES array
 * - activatedBy → NOW in manifest.activatedBy (for OPTIONAL modules)
 * - enhancedBy → REMOVED (over-engineering, not used)
 *
 * @see src/lib/modules/constants.ts for current module loading logic
 * @see docs/plans/2026-01-19-capabilities-architecture-simplification.md
 */
export const MODULE_FEATURE_MAP: Record<string, {
  alwaysActive?: boolean;
  activatedBy?: FeatureId;
  enhancedBy?: FeatureId[];
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

  // ============================================
  // BUSINESS MODULES - Staff & Resources
  // ============================================

  'shift-control': {
    alwaysActive: true,
    description: 'Sistema de control de turnos - coordinación centralizada'
  },

  'staff': {
    activatedBy: 'staff_employee_management',
    enhancedBy: ['staff_labor_cost_tracking'],
    description: 'Módulo de personal - gestión de empleados y turnos'
  },

  'scheduling': {
    activatedBy: 'staff_shift_management',
    enhancedBy: ['staff_time_tracking', 'staff_labor_cost_tracking'],
    description: 'Módulo de programación - turnos y calendarios'
  },

  // ============================================
  // SUPPLY CHAIN MODULES
  // ============================================

  'materials': {
    activatedBy: 'inventory_stock_tracking',
    description: 'Módulo de inventario - gestión de materiales y stock'
  },

  'suppliers': {
    activatedBy: 'inventory_supplier_management',
    enhancedBy: ['inventory_demand_forecasting'],
    description: 'Módulo de gestión de proveedores'
  },

  'products': {
    alwaysActive: true,
    description: 'Módulo de productos - catálogos y gestión (core: all businesses have products)'
  },

  'recipe': {
    activatedBy: 'products_recipe_management',
    description: 'Gestión de recetas y BOM'
  },

  'products-analytics': {
    activatedBy: 'products_cost_intelligence',
    enhancedBy: ['can_view_menu_engineering'],
    description: 'Analytics de productos - análisis de costos y rentabilidad'
  },

  // ============================================
  // OPERATIONS MODULES
  // ============================================

  'sales': {
    alwaysActive: true,
    enhancedBy: ['sales_payment_processing', 'sales_pos_onsite', 'sales_dine_in_orders'],
    description: 'Módulo de ventas - gestión de órdenes y pagos (core: sales_order_management)'
  },

  'customers': {
    alwaysActive: true,
    description: 'Módulo CRM - gestión de clientes (core: all businesses have customers)'
  },

  'fulfillment': {
    alwaysActive: true,
    enhancedBy: ['sales_payment_processing'],
    description: 'Módulo unificado de fulfillment - gestiona órdenes onsite, pickup y delivery'
  },

  'fulfillment-onsite': {
    activatedBy: 'operations_table_management',
    enhancedBy: ['operations_table_assignment', 'operations_floor_plan_config'],
    description: 'Fulfillment onsite - gestión de mesas y servicio en local'
  },

  'fulfillment-pickup': {
    activatedBy: 'sales_pickup_orders',
    enhancedBy: ['operations_pickup_scheduling'],
    description: 'Fulfillment pickup - gestión de órdenes para retirar'
  },

  // ============================================
  // FINANCE MODULES
  // ============================================

  'finance-billing': {
    activatedBy: 'finance_invoice_scheduling',
    enhancedBy: ['customer_loyalty_program'],
    description: 'Billing recurrente y suscripciones - facturas programadas'
  },

  'finance-fiscal': {
    activatedBy: 'finance_invoice_scheduling',
    description: 'Módulo fiscal - cumplimiento tributario e impuestos'
  },

  'finance-corporate': {
    activatedBy: 'finance_corporate_accounts',
    enhancedBy: ['finance_credit_management', 'finance_payment_terms'],
    description: 'Finance B2B - gestión de cuentas corporativas y crédito'
  },

  'finance-integrations': {
    alwaysActive: true,
    enhancedBy: ['operations_shipping_integration'],
    description: 'Integraciones de pago - MercadoPago, MODO, pasarelas'
  },

  'cash-management': {
    alwaysActive: true,
    description: 'Gestión de caja - sesiones, movimientos, conciliación (core financial operation)'
  },

  // ============================================
  // ADVANCED MODULES
  // ============================================

  'memberships': {
    activatedBy: 'membership_subscription_plans',
    enhancedBy: ['membership_recurring_billing', 'finance_payment_terms'],
    description: 'Gestión de membresías y suscripciones - planes y cobros recurrentes'
  },

  'rentals': {
    activatedBy: 'rental_item_management',
    enhancedBy: ['rental_booking_calendar', 'rental_availability_tracking', 'scheduling_calendar_management'],
    description: 'Gestión de alquileres - equipos, espacios, recursos'
  },

  'assets': {
    alwaysActive: true,
    description: 'Gestión de activos - equipos, vehículos, mantenimiento'
  },

  // ============================================
  // ANALYTICS MODULES
  // ============================================

  'reporting': {
    alwaysActive: true,
    description: 'Sistema de reportes y analytics'
  },

  'intelligence': {
    alwaysActive: true,
    description: 'Inteligencia de mercado y competencia - análisis de tendencias'
  },

  'executive': {
    alwaysActive: true,
    enhancedBy: ['executive'],
    description: 'Business Intelligence ejecutivo - analytics avanzados'
  }
};

// ============================================
// ARCHITECTURE DECISION: STATIC MAP + TEST VALIDATION
// ============================================

/**
 * DECISION: We use a static MODULE_FEATURE_MAP instead of dynamic generation
 * 
 * WHY:
 * - Industry standard (ESLint, Babel, Webpack all do this)
 * - Simple: No build scripts, no AST parsing, no import resolution issues
 * - Fast: No runtime overhead
 * - Validated: Test ensures map stays in sync with manifests
 * 
 * TRADE-OFF:
 * - Intentional duplication between MODULE_FEATURE_MAP and module manifests
 * - Validated by: src/__tests__/module-feature-map-validation.test.ts
 * 
 * MAINTAINING:
 * 1. When you add/modify a module manifest, update MODULE_FEATURE_MAP
 * 2. Run: pnpm test src/__tests__/module-feature-map-validation.test.ts
 * 3. CI will fail if they drift out of sync
 * 
 * @see src/__tests__/module-feature-map-validation.test.ts
 */

// ============================================
// FEATURE → UI MAPPING FUNCTIONS
// ============================================

/**
 * Obtiene módulos activos para un conjunto de features
 *
 * NUEVA ARQUITECTURA (clean, validated with industry research):
 * - alwaysActive → module always in navigation
 * - activatedBy → module appears if user has this ONE feature
 * - enhancedBy → extra features that add functionality (but don't activate module)
 *
 * @param features - Array de FeatureIds activas
 * @returns Array de module IDs (routes) que deberían aparecer en navegación
 *
 * @example
 * const modules = getModulesForActiveFeatures(['sales_order_management']);
 * // Returns: ['dashboard', 'settings', 'sales', 'customers', 'fulfillment', ...]
 */
export function getModulesForActiveFeatures(features: FeatureId[]): string[] {
  const activeModules = new Set<string>();

  Object.entries(MODULE_FEATURE_MAP).forEach(([moduleId, config]) => {
    // Case 1: Always-active modules (dashboard, settings, customers, etc.)
    if (config.alwaysActive) {
      activeModules.add(moduleId);
      return;
    }

    // Case 2: Modules activated by a single feature
    // (Odoo pattern: single 'depends' feature)
    if (config.activatedBy && features.includes(config.activatedBy)) {
      activeModules.add(moduleId);
      // Note: enhancedBy features don't affect activation, only add functionality
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
