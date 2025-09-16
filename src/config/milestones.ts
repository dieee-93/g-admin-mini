/**
 * Configuración de Hitos Fundacionales
 * Define los pasos obligatorios para activar cada capacidad del ADN de Negocio
 */

import type { MilestoneDefinition, CapabilityMilestoneConfig } from '../pages/admin/gamification/achievements/types';

// =====================================================
// Definiciones Maestras de Hitos
// =====================================================
export const MILESTONE_DEFINITIONS: Record<string, MilestoneDefinition> = {
  // Hitos Generales de Configuración
  'setup_business_info': {
    id: 'setup_business_info',
    name: 'Configurar Información del Negocio',
    description: 'Completa nombre, dirección y datos básicos del negocio',
    category: 'business_setup',
    action_type: 'business_info_updated',
    event_pattern: 'business:info_updated',
    redirect_url: '/admin/settings/business',
    icon: '🏢',
    estimated_minutes: 3,
  },
  'define_business_hours': {
    id: 'define_business_hours',
    name: 'Definir Horarios de Atención',
    description: 'Establece los horarios en que tu negocio estará operativo',
    category: 'business_setup',
    action_type: 'business_hours_defined',
    event_pattern: 'business:hours_defined',
    redirect_url: '/admin/settings/hours',
    icon: '🕐',
    estimated_minutes: 5,
  },

  // Hitos para Venta de Productos
  'create_first_product': {
    id: 'create_first_product',
    name: 'Crear Primer Producto',
    description: 'Añade al menos un producto a tu catálogo',
    category: 'products',
    action_type: 'product_created',
    event_pattern: 'products:product_created',
    redirect_url: '/admin/supply-chain/products',
    icon: '📦',
    estimated_minutes: 7,
  },
  'setup_product_categories': {
    id: 'setup_product_categories',
    name: 'Organizar Categorías',
    description: 'Crea categorías para organizar tus productos',
    category: 'products',
    action_type: 'category_created',
    event_pattern: 'products:category_created',
    redirect_url: '/admin/supply-chain/products/categories',
    icon: '📋',
    estimated_minutes: 4,
  },
  'configure_pricing': {
    id: 'configure_pricing',
    name: 'Configurar Precios',
    description: 'Establece precios para tus productos',
    category: 'products',
    action_type: 'pricing_configured',
    event_pattern: 'products:pricing_updated',
    redirect_url: '/admin/supply-chain/products',
    icon: '💰',
    estimated_minutes: 6,
  },

  // Hitos para Delivery
  'configure_delivery_zones': {
    id: 'configure_delivery_zones',
    name: 'Configurar Zonas de Envío',
    description: 'Define las áreas donde realizarás entregas',
    category: 'delivery',
    action_type: 'delivery_zones_configured',
    event_pattern: 'delivery:zones_configured',
    redirect_url: '/admin/settings/delivery',
    icon: '🗺️',
    estimated_minutes: 12,
  },
  'set_delivery_fees': {
    id: 'set_delivery_fees',
    name: 'Establecer Tarifas de Envío',
    description: 'Define los costos de envío por zona',
    category: 'delivery',
    action_type: 'delivery_fees_set',
    event_pattern: 'delivery:fees_configured',
    redirect_url: '/admin/settings/delivery',
    icon: '💸',
    estimated_minutes: 6,
  },
  'configure_delivery_times': {
    id: 'configure_delivery_times',
    name: 'Configurar Tiempos de Entrega',
    description: 'Establece estimaciones de tiempo de entrega',
    category: 'delivery',
    action_type: 'delivery_times_set',
    event_pattern: 'delivery:times_configured',
    redirect_url: '/admin/settings/delivery',
    icon: '⏰',
    estimated_minutes: 4,
  },
};

// =====================================================
// Configuración de Hitos por Capacidad
// =====================================================
export const CAPABILITY_MILESTONE_CONFIG: CapabilityMilestoneConfig = {
  // Venta de Productos - Base
  'sells_products': {
    name: 'Venta de Productos',
    description: 'Activa la capacidad de vender productos físicos o digitales',
    icon: '📦',
    milestones: ['setup_business_info', 'create_first_product', 'configure_pricing'],
  },

  // Para Llevar
  'sells_products_for_pickup': {
    name: 'Para Llevar',
    description: 'Habilita la opción de retiro en tienda',
    icon: '📋',
    milestones: ['setup_business_info', 'define_business_hours', 'setup_product_categories'],
  },

  // Delivery
  'sells_products_with_delivery': {
    name: 'Delivery',
    description: 'Activa el servicio de entrega a domicilio',
    icon: '🚚',
    milestones: ['configure_delivery_zones', 'set_delivery_fees', 'configure_delivery_times'],
  },
};

// =====================================================
// Utilidades para el Sistema de Hitos
// =====================================================

/**
 * Obtiene la configuración de hitos para una capacidad específica
 */
export function getMilestonesForCapability(capabilityId: string): string[] {
  return CAPABILITY_MILESTONE_CONFIG[capabilityId]?.milestones || [];
}

/**
 * Obtiene la definición completa de un hito
 */
export function getMilestoneDefinition(milestoneId: string): MilestoneDefinition | undefined {
  return MILESTONE_DEFINITIONS[milestoneId];
}

/**
 * Obtiene todas las capacidades que requieren un hito específico
 */
export function getCapabilitiesForMilestone(milestoneId: string): string[] {
  return Object.keys(CAPABILITY_MILESTONE_CONFIG).filter(capabilityId =>
    CAPABILITY_MILESTONE_CONFIG[capabilityId].milestones.includes(milestoneId)
  );
}

/**
 * Calcula el tiempo estimado total para activar una capacidad
 */
export function getEstimatedTimeForCapability(capabilityId: string): number {
  const milestones = getMilestonesForCapability(capabilityId);
  return milestones.reduce((total, milestoneId) => {
    const definition = getMilestoneDefinition(milestoneId);
    return total + (definition?.estimated_minutes || 0);
  }, 0);
}

/**
 * Obtiene la configuración de una capacidad
 */
export function getCapabilityConfig(capabilityId: string) {
  return CAPABILITY_MILESTONE_CONFIG[capabilityId];
}