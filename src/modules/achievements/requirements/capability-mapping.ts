/**
 * CENTRALIZED CAPABILITY → REQUIREMENTS MAPPING
 * 
 * Single Source of Truth para el mapeo de Business Capabilities a Requirements.
 * 
 * ARCHITECTURE PATTERN (validado con industria):
 * - Centralized Configuration: Este archivo define TODOS los mapeos
 * - Decentralized Consumption: Components consumen usando helpers
 * - Reference-based Deduplication: Shared requirements se importan por referencia
 * 
 * BASADO EN:
 * - Martin Fowler's "Decouple decision points from decision logic"
 * - Unleash, PostHog, GrowthBook pattern (Configuration as Code)
 * - NN/G Progressive Disclosure (task analysis determines what to show)
 * 
 * @version 3.0.0 - Centralized Mapping Architecture
 * @see REQUIREMENTS_MAPPING_VALIDATION.md
 */

import type { BusinessCapabilityId } from '@/config/types';
import type { Achievement } from '../types';

// ============================================
// IMPORT SHARED REQUIREMENTS (by reference)
// ============================================

import {
  BUSINESS_NAME_CONFIGURED,
  BUSINESS_ADDRESS_CONFIGURED,
  CUSTOMER_FIRST_ADDED,
  CUSTOMER_MIN_COUNT,
  PRODUCT_FIRST_PUBLISHED,
  PRODUCT_MIN_CATALOG,
  PAYMENT_METHOD_CONFIGURED,
} from '@/shared/requirements';

// ============================================
// CAPABILITY-SPECIFIC REQUIREMENTS
// ============================================

// Pickup Orders (TakeAway)
const PICKUP_HOURS_CONFIGURED: Achievement = {
  id: 'pickup_hours_configured',
  tier: 'mandatory',
  capability: 'pickup_orders',
  name: 'Configurar horarios de retiro',
  description: 'Define los horarios en que los clientes pueden retirar pedidos',
  icon: '🕐',
  category: 'setup',
  validator: (ctx) => ctx.profile?.pickupHours !== undefined,
  redirectUrl: '/admin/settings/hours',
  estimatedMinutes: 5,
};

// Delivery Shipping
const DELIVERY_ZONE_CONFIGURED: Achievement = {
  id: 'delivery_zone_configured',
  tier: 'mandatory',
  capability: 'delivery_shipping',
  name: 'Configurar zonas de delivery',
  description: 'Define las zonas donde realizas entregas',
  icon: '🗺️',
  category: 'setup',
  validator: (ctx) => (ctx.deliveryZones?.length || 0) > 0,
  redirectUrl: '/admin/operations/delivery',
  estimatedMinutes: 10,
};

const DELIVERY_HOURS_CONFIGURED: Achievement = {
  id: 'delivery_hours_configured',
  tier: 'mandatory',
  capability: 'delivery_shipping',
  name: 'Configurar horarios de delivery',
  description: 'Define los horarios de entrega',
  icon: '🕐',
  category: 'setup',
  validator: (ctx) => ctx.profile?.deliveryHours !== undefined,
  redirectUrl: '/admin/settings/hours',
  estimatedMinutes: 5,
};

// Onsite Service (Dine-in / Floor service)
const TABLE_CONFIGURATION: Achievement = {
  id: 'table_configuration',
  tier: 'mandatory',
  capability: 'onsite_service',
  name: 'Configurar mesas',
  description: 'Define las mesas de tu local',
  icon: '🪑',
  category: 'setup',
  validator: (ctx) => (ctx.tables?.length || 0) > 0,
  redirectUrl: '/admin/operations/floor',
  estimatedMinutes: 10,
};

const ONSITE_HOURS_CONFIGURED: Achievement = {
  id: 'onsite_hours_configured',
  tier: 'mandatory',
  capability: 'onsite_service',
  name: 'Configurar horarios de atención',
  description: 'Define los horarios de servicio en local',
  icon: '🕐',
  category: 'setup',
  validator: (ctx) => ctx.profile?.operatingHours !== undefined,
  redirectUrl: '/admin/settings/hours',
  estimatedMinutes: 5,
};

// Async Operations (E-commerce / Online orders)
const ONLINE_CATALOG_CONFIGURED: Achievement = {
  id: 'online_catalog_configured',
  tier: 'mandatory',
  capability: 'async_operations',
  name: 'Configurar catálogo online',
  description: 'Habilita productos para venta online',
  icon: '🛒',
  category: 'setup',
  validator: (ctx) => {
    // Al menos 5 productos publicados (mismo que PRODUCT_MIN_CATALOG)
    const published = ctx.products?.filter((p) => p.is_published) || [];
    return published.length >= 5;
  },
  redirectUrl: '/admin/supply-chain/products',
  estimatedMinutes: 15,
};

// Corporate Sales (B2B)
const CORPORATE_ACCOUNT_CONFIGURED: Achievement = {
  id: 'corporate_account_configured',
  tier: 'mandatory',
  capability: 'corporate_sales',
  name: 'Configurar cuenta corporativa',
  description: 'Crea tu primera cuenta corporativa B2B',
  icon: '🏢',
  category: 'setup',
  validator: (ctx) => {
    // TODO: Check if corporate accounts exist when implemented
    // Expected: ctx.corporateAccounts?.length > 0
    return false;
  },
  redirectUrl: '/admin/customers',
  estimatedMinutes: 10,
};

// Professional Services (Appointments)
const STAFF_CONFIGURED: Achievement = {
  id: 'staff_configured',
  tier: 'mandatory',
  capability: 'professional_services',
  name: 'Agregar personal',
  description: 'Agrega profesionales que prestan servicios',
  icon: '👥',
  category: 'setup',
  validator: (ctx) => (ctx.staff?.length || 0) > 0,
  redirectUrl: '/admin/operations/staff',
  estimatedMinutes: 5,
};

const SERVICE_CATALOG_CONFIGURED: Achievement = {
  id: 'service_catalog_configured',
  tier: 'mandatory',
  capability: 'professional_services',
  name: 'Definir servicios',
  description: 'Crea tu catálogo de servicios',
  icon: '💼',
  category: 'setup',
  validator: (ctx) => {
    // Services are products with type SERVICE
    const services = ctx.products?.filter((p) => p.type === 'SERVICE') || [];
    return services.length > 0;
  },
  redirectUrl: '/admin/supply-chain/products',
  estimatedMinutes: 10,
};

// Asset Rental
const ASSET_CONFIGURED: Achievement = {
  id: 'asset_configured',
  tier: 'mandatory',
  capability: 'asset_rental',
  name: 'Agregar activos',
  description: 'Agrega los activos disponibles para alquiler',
  icon: '🏗️',
  category: 'setup',
  validator: (ctx) => (ctx.assets?.length || 0) > 0,
  redirectUrl: '/admin/assets',
  estimatedMinutes: 10,
};

// Physical Products (Manufacturing/Production)
const PRODUCTION_WORKFLOW_CONFIGURED: Achievement = {
  id: 'production_workflow_configured',
  tier: 'mandatory',
  capability: 'physical_products',
  name: 'Configurar producción',
  description: 'Define tu flujo de producción',
  icon: '🏭',
  category: 'setup',
  validator: (ctx) => {
    // TODO: Implement when production module is ready
    // Expected: Check if at least one product has a recipe (BOM)
    // Example: ctx.products?.some(p => p.recipe !== undefined && p.recipe.length > 0)
    return false;
  },
  redirectUrl: '/admin/supply-chain/products',
  estimatedMinutes: 15,
};

// Mobile Operations
const MOBILE_SETUP_CONFIGURED: Achievement = {
  id: 'mobile_setup_configured',
  tier: 'mandatory',
  capability: 'mobile_operations',
  name: 'Configurar operación móvil',
  description: 'Define tu configuración para operaciones móviles',
  icon: '🚚',
  category: 'setup',
  validator: (ctx) => {
    // TODO: Check mobile configuration when implemented
    // Expected: ctx.profile?.mobileConfig !== undefined
    return false;
  },
  redirectUrl: '/admin/settings',
  estimatedMinutes: 10,
};

// Membership & Subscriptions
const MEMBERSHIP_PLAN_CONFIGURED: Achievement = {
  id: 'membership_plan_configured',
  tier: 'mandatory',
  capability: 'membership_subscriptions',
  name: 'Crear plan de membresía',
  description: 'Define tu primer plan de membresía',
  icon: '🎫',
  category: 'setup',
  validator: (ctx) => {
    // TODO: Check if membership plans exist when implemented
    // Expected: ctx.membershipPlans?.length > 0
    return false;
  },
  redirectUrl: '/admin/settings',
  estimatedMinutes: 10,
};

// Digital Products
const DIGITAL_DELIVERY_CONFIGURED: Achievement = {
  id: 'digital_delivery_configured',
  tier: 'mandatory',
  capability: 'digital_products',
  name: 'Configurar entrega digital',
  description: 'Configura cómo entregarás productos digitales',
  icon: '📥',
  category: 'setup',
  validator: (ctx) => {
    // TODO: Check digital delivery configuration when implemented
    // Expected: ctx.profile?.digitalDeliveryConfig !== undefined
    return false;
  },
  redirectUrl: '/admin/settings',
  estimatedMinutes: 10,
};

// ============================================
// CENTRALIZED MAPPING: Capability → Requirements
// ============================================

/**
 * Single Source of Truth: Mapeo de Business Capabilities a Requirements.
 * 
 * USAGE PATTERN:
 * ```typescript
 * const requirements = getRequirementsForCapabilities(['pickup_orders', 'delivery_shipping']);
 * // Automáticamente deduplicado (shared requirements aparecen 1 vez)
 * ```
 * 
 * MAINTENANCE:
 * - Para agregar un requirement a una capability: Agrégalo al array
 * - Para compartir un requirement: Impórtalo de @/shared/requirements
 * - Deduplicación automática vía JavaScript reference equality
 */
export const CAPABILITY_REQUIREMENTS: Record<BusinessCapabilityId, Achievement[]> = {
  // ============================================
  // CORE BUSINESS MODELS
  // ============================================
  
  physical_products: [
    BUSINESS_NAME_CONFIGURED,
    PRODUCT_FIRST_PUBLISHED,
    PAYMENT_METHOD_CONFIGURED,
    PRODUCTION_WORKFLOW_CONFIGURED,
  ],
  
  professional_services: [
    BUSINESS_NAME_CONFIGURED,
    BUSINESS_ADDRESS_CONFIGURED,
    PAYMENT_METHOD_CONFIGURED,
    STAFF_CONFIGURED,
    SERVICE_CATALOG_CONFIGURED,
  ],
  
  asset_rental: [
    BUSINESS_NAME_CONFIGURED,
    BUSINESS_ADDRESS_CONFIGURED,
    PAYMENT_METHOD_CONFIGURED,
    ASSET_CONFIGURED,
  ],
  
  membership_subscriptions: [
    BUSINESS_NAME_CONFIGURED,
    PAYMENT_METHOD_CONFIGURED,
    MEMBERSHIP_PLAN_CONFIGURED,
  ],
  
  digital_products: [
    BUSINESS_NAME_CONFIGURED,
    PAYMENT_METHOD_CONFIGURED,
    PRODUCT_FIRST_PUBLISHED,
    DIGITAL_DELIVERY_CONFIGURED,
  ],
  
  // ============================================
  // FULFILLMENT METHODS
  // ============================================
  
  onsite_service: [
    BUSINESS_NAME_CONFIGURED,
    BUSINESS_ADDRESS_CONFIGURED,
    PRODUCT_FIRST_PUBLISHED,
    PRODUCT_MIN_CATALOG,
    PAYMENT_METHOD_CONFIGURED,
    TABLE_CONFIGURATION,
    ONSITE_HOURS_CONFIGURED,
  ],
  
  pickup_orders: [
    BUSINESS_NAME_CONFIGURED,
    BUSINESS_ADDRESS_CONFIGURED,
    PRODUCT_FIRST_PUBLISHED,
    PRODUCT_MIN_CATALOG,
    PAYMENT_METHOD_CONFIGURED,
    PICKUP_HOURS_CONFIGURED,
  ],
  
  delivery_shipping: [
    BUSINESS_NAME_CONFIGURED,
    BUSINESS_ADDRESS_CONFIGURED,
    CUSTOMER_FIRST_ADDED,
    PRODUCT_FIRST_PUBLISHED,
    PRODUCT_MIN_CATALOG,
    PAYMENT_METHOD_CONFIGURED,
    DELIVERY_ZONE_CONFIGURED,
    DELIVERY_HOURS_CONFIGURED,
  ],
  
  // ============================================
  // SPECIAL OPERATIONS
  // ============================================
  
  async_operations: [
    BUSINESS_NAME_CONFIGURED,
    CUSTOMER_MIN_COUNT,
    PRODUCT_MIN_CATALOG,
    PAYMENT_METHOD_CONFIGURED,
    ONLINE_CATALOG_CONFIGURED,
  ],
  
  corporate_sales: [
    BUSINESS_NAME_CONFIGURED,
    CUSTOMER_MIN_COUNT,
    PRODUCT_MIN_CATALOG,
    PAYMENT_METHOD_CONFIGURED,
    CORPORATE_ACCOUNT_CONFIGURED,
  ],
  
  mobile_operations: [
    BUSINESS_NAME_CONFIGURED,
    PRODUCT_FIRST_PUBLISHED,
    PAYMENT_METHOD_CONFIGURED,
    MOBILE_SETUP_CONFIGURED,
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtiene requirements para las capabilities seleccionadas.
 * Automáticamente deduplica shared requirements por referencia.
 * 
 * @param selectedCapabilities - Capabilities activas del usuario
 * @returns Array de requirements únicos (deduplicados)
 * 
 * @example
 * ```typescript
 * const requirements = getRequirementsForCapabilities(['pickup_orders', 'delivery_shipping']);
 * // BUSINESS_NAME_CONFIGURED aparece solo 1 vez (deduplicado automáticamente)
 * ```
 */
export function getRequirementsForCapabilities(
  selectedCapabilities: BusinessCapabilityId[]
): Achievement[] {
  // Flatten requirements de todas las capabilities
  const allRequirements = selectedCapabilities.flatMap(
    (cap) => CAPABILITY_REQUIREMENTS[cap] || []
  );
  
  // Deduplicación automática por referencia (O(n))
  // Shared requirements importados tienen la misma referencia → Set los deduplica
  return Array.from(new Set(allRequirements));
}

/**
 * Obtiene requirements para UNA capability específica.
 * 
 * @param capability - ID de la capability
 * @returns Array de requirements para esa capability
 */
export function getRequirementsForCapability(
  capability: BusinessCapabilityId
): Achievement[] {
  return CAPABILITY_REQUIREMENTS[capability] || [];
}

/**
 * Verifica si una capability tiene requirements configurados.
 * 
 * @param capability - ID de la capability
 * @returns true si tiene requirements
 */
export function hasRequirements(capability: BusinessCapabilityId): boolean {
  const requirements = CAPABILITY_REQUIREMENTS[capability];
  return requirements !== undefined && requirements.length > 0;
}

/**
 * Obtiene estadísticas del mapeo de requirements.
 * Útil para debugging y auditoría.
 * 
 * @returns Estadísticas del mapeo
 */
export function getRequirementsMappingStats() {
  const capabilities = Object.keys(CAPABILITY_REQUIREMENTS) as BusinessCapabilityId[];
  const totalCapabilities = capabilities.length;
  
  let totalRequirementsBeforeDedup = 0;
  const allRequirements = new Set<Achievement>();
  
  capabilities.forEach((cap) => {
    const reqs = CAPABILITY_REQUIREMENTS[cap];
    totalRequirementsBeforeDedup += reqs.length;
    reqs.forEach((req) => allRequirements.add(req));
  });
  
  const totalRequirementsAfterDedup = allRequirements.size;
  const deduplicationSavings = totalRequirementsBeforeDedup - totalRequirementsAfterDedup;
  
  return {
    totalCapabilities,
    totalRequirementsBeforeDedup,
    totalRequirementsAfterDedup,
    deduplicationSavings,
    averageRequirementsPerCapability: (totalRequirementsBeforeDedup / totalCapabilities).toFixed(1),
  };
}
