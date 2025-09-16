/**
 * Definiciones de Logros de Maestría
 * 
 * Este archivo contiene las definiciones iniciales de logros que se pueden desbloquear
 * a través del uso continuo y la exploración de la plataforma.
 */

import type { MasteryAchievementDefinition } from '../pages/admin/gamification/achievements/types';

// =====================================================
// Logros de Dominio: VENTAS
// =====================================================

export const SALES_MASTERY_ACHIEVEMENTS: MasteryAchievementDefinition[] = [
  {
    id: 'sales_first_sale',
    name: 'Primera Venta',
    description: 'Registra tu primera venta en el sistema',
    icon: 'party',
    domain: 'sales',
    trigger_event: 'sales:sale_completed',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sales_bronze_seller',
    name: 'Vendedor de Bronce',
    description: 'Completa 10 ventas exitosas',
    icon: 'trophy',
    domain: 'sales',
    trigger_event: 'sales:sale_completed',
    conditions: {
      type: 'cumulative',
      field: 'sale_count',
      threshold: 10,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sales_silver_seller',
    name: 'Vendedor de Plata',
    description: 'Completa 50 ventas exitosas',
    icon: 'star',
    domain: 'sales',
    trigger_event: 'sales:sale_completed',
    conditions: {
      type: 'cumulative',
      field: 'sale_count',
      threshold: 50,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'silver',
    points: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sales_gold_seller',
    name: 'Vendedor de Oro',
    description: 'Completa 100 ventas exitosas',
    icon: 'crown',
    domain: 'sales',
    trigger_event: 'sales:sale_completed',
    conditions: {
      type: 'cumulative',
      field: 'sale_count',
      threshold: 100,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'gold',
    points: 200,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sales_revenue_1k',
    name: 'Primeros $1,000',
    description: 'Genera $1,000 pesos en ventas',
    icon: 'money',
    domain: 'sales',
    trigger_event: 'sales:sale_completed',
    conditions: {
      type: 'cumulative',
      field: 'sale_amount',
      threshold: 1000,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 75,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// =====================================================
// Logros de Dominio: INVENTARIO
// =====================================================

export const INVENTORY_MASTERY_ACHIEVEMENTS: MasteryAchievementDefinition[] = [
  {
    id: 'inventory_first_product',
    name: 'Primer Producto',
    description: 'Crea tu primer producto en el catálogo',
    icon: 'package',
    domain: 'inventory',
    trigger_event: 'products:product_created',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inventory_curator',
    name: 'Curador de Catálogo',
    description: 'Crea 25 productos únicos',
    icon: 'grid',
    domain: 'inventory',
    trigger_event: 'products:product_created',
    conditions: {
      type: 'cumulative',
      field: 'product_count',
      threshold: 25,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'silver',
    points: 80,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inventory_organizer',
    name: 'Organizador Maestro',
    description: 'Crea 5 categorías de productos',
    icon: 'folder',
    domain: 'inventory',
    trigger_event: 'products:category_created',
    conditions: {
      type: 'cumulative',
      field: 'category_count',
      threshold: 5,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 30,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inventory_stock_master',
    name: 'Maestro de Stock',
    description: 'Realiza 50 movimientos de inventario',
    icon: 'trending-up',
    domain: 'inventory',
    trigger_event: 'inventory:movement_recorded',
    conditions: {
      type: 'cumulative',
      field: 'movement_count',
      threshold: 50,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'gold',
    points: 120,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// =====================================================
// Logros de Dominio: PERSONAL (STAFF)
// =====================================================

export const STAFF_MASTERY_ACHIEVEMENTS: MasteryAchievementDefinition[] = [
  {
    id: 'staff_first_member',
    name: 'Primer Miembro del Equipo',
    description: 'Registra tu primer empleado',
    icon: 'user-plus',
    domain: 'staff',
    trigger_event: 'staff:member_created',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff_team_builder',
    name: 'Constructor de Equipos',
    description: 'Gestiona un equipo de 5 personas',
    icon: 'users',
    domain: 'staff',
    trigger_event: 'staff:member_created',
    conditions: {
      type: 'cumulative',
      field: 'staff_count',
      threshold: 5,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'silver',
    points: 70,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff_scheduler',
    name: 'Maestro de Horarios',
    description: 'Programa 20 turnos de trabajo',
    icon: 'calendar',
    domain: 'staff',
    trigger_event: 'staff:schedule_created',
    conditions: {
      type: 'cumulative',
      field: 'schedule_count',
      threshold: 20,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 40,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// =====================================================
// Logros de Dominio: FINANZAS
// =====================================================

export const FINANCE_MASTERY_ACHIEVEMENTS: MasteryAchievementDefinition[] = [
  {
    id: 'finance_first_report',
    name: 'Primer Reporte',
    description: 'Genera tu primer reporte financiero',
    icon: 'bar-chart',
    domain: 'finance',
    trigger_event: 'finance:report_generated',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 20,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'finance_analyst',
    name: 'Analista Financiero',
    description: 'Genera 10 reportes financieros',
    icon: 'trending-up',
    domain: 'finance',
    trigger_event: 'finance:report_generated',
    conditions: {
      type: 'cumulative',
      field: 'report_count',
      threshold: 10,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'silver',
    points: 60,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'finance_tax_master',
    name: 'Maestro Fiscal',
    description: 'Configura integración fiscal con AFIP',
    icon: 'shield',
    domain: 'finance',
    trigger_event: 'finance:afip_configured',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'gold',
    points: 150,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// =====================================================
// Logros de Dominio: OPERACIONES
// =====================================================

export const OPERATIONS_MASTERY_ACHIEVEMENTS: MasteryAchievementDefinition[] = [
  {
    id: 'operations_first_delivery',
    name: 'Primera Entrega',
    description: 'Completa tu primera entrega a domicilio',
    icon: 'truck',
    domain: 'operations',
    trigger_event: 'operations:delivery_completed',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 15,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'operations_delivery_expert',
    name: 'Experto en Entregas',
    description: 'Completa 50 entregas exitosas',
    icon: 'check-circle',
    domain: 'operations',
    trigger_event: 'operations:delivery_completed',
    conditions: {
      type: 'cumulative',
      field: 'delivery_count',
      threshold: 50,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'gold',
    points: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'operations_event_host',
    name: 'Anfitrión de Eventos',
    description: 'Organiza tu primer evento',
    icon: 'calendar-check',
    domain: 'operations',
    trigger_event: 'operations:event_created',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'silver',
    points: 80,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// =====================================================
// Logros de Dominio: CRECIMIENTO
// =====================================================

export const GROWTH_MASTERY_ACHIEVEMENTS: MasteryAchievementDefinition[] = [
  {
    id: 'growth_first_customer',
    name: 'Primer Cliente',
    description: 'Registra tu primer cliente en el CRM',
    icon: 'heart',
    domain: 'growth',
    trigger_event: 'crm:customer_created',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'bronze',
    points: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'growth_customer_builder',
    name: 'Constructor de Relaciones',
    description: 'Registra 100 clientes en tu base de datos',
    icon: 'users',
    domain: 'growth',
    trigger_event: 'crm:customer_created',
    conditions: {
      type: 'cumulative',
      field: 'customer_count',
      threshold: 100,
      comparison: 'gte'
    },
    type: 'mastery',
    tier: 'gold',
    points: 150,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'growth_online_presence',
    name: 'Presencia Online',
    description: 'Configura tu tienda online',
    icon: 'globe',
    domain: 'growth',
    trigger_event: 'online:store_configured',
    conditions: {
      type: 'single_event'
    },
    type: 'mastery',
    tier: 'silver',
    points: 90,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// =====================================================
// Exportación consolidada
// =====================================================

export const ALL_MASTERY_ACHIEVEMENTS: MasteryAchievementDefinition[] = [
  ...SALES_MASTERY_ACHIEVEMENTS,
  ...INVENTORY_MASTERY_ACHIEVEMENTS,
  ...STAFF_MASTERY_ACHIEVEMENTS,
  ...FINANCE_MASTERY_ACHIEVEMENTS,
  ...OPERATIONS_MASTERY_ACHIEVEMENTS,
  ...GROWTH_MASTERY_ACHIEVEMENTS
];

// Agrupados por dominio para UI
export const MASTERY_ACHIEVEMENTS_BY_DOMAIN = {
  sales: SALES_MASTERY_ACHIEVEMENTS,
  inventory: INVENTORY_MASTERY_ACHIEVEMENTS,
  staff: STAFF_MASTERY_ACHIEVEMENTS,
  finance: FINANCE_MASTERY_ACHIEVEMENTS,
  operations: OPERATIONS_MASTERY_ACHIEVEMENTS,
  growth: GROWTH_MASTERY_ACHIEVEMENTS
};

// Metadatos de dominios para UI
export const DOMAIN_METADATA = {
  sales: {
    name: 'Ventas',
    description: 'Logros relacionados con ventas y facturación',
    icon: 'dollar-sign',
    color: 'green'
  },
  inventory: {
    name: 'Inventario',
    description: 'Logros de gestión de productos y stock',
    icon: 'package',
    color: 'blue'
  },
  staff: {
    name: 'Personal',
    description: 'Logros de gestión de equipo y recursos humanos',
    icon: 'users',
    color: 'purple'
  },
  finance: {
    name: 'Finanzas',
    description: 'Logros de análisis financiero y fiscal',
    icon: 'trending-up',
    color: 'yellow'
  },
  operations: {
    name: 'Operaciones',
    description: 'Logros de entregas, eventos y operaciones',
    icon: 'truck',
    color: 'orange'
  },
  growth: {
    name: 'Crecimiento',
    description: 'Logros de CRM y expansión del negocio',
    icon: 'target',
    color: 'pink'
  }
};

export default ALL_MASTERY_ACHIEVEMENTS;