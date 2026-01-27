/**
 * SHARED REQUIREMENTS - Cross-Capability Requirements
 * 
 * Requirements que son necesarios para MÚLTIPLES capabilities.
 * Estos se registran UNA sola vez pero se validan para todas las capabilities que lo requieran.
 * 
 * ARQUITECTURA:
 * - Single source of truth para requirements compartidos
 * - Metadata indica qué capabilities lo requieren
 * - Deduplicación automática por ID
 * - Validación única (si se completa una vez, aplica para todas las capabilities)
 * 
 * EJEMPLOS DE SHARED REQUIREMENTS:
 * - Agregar primer cliente → ecommerce, delivery, corporate_sales
 * - Configurar método de pago → takeaway, delivery, ecommerce
 * - Agregar primer producto → takeaway, delivery, ecommerce, onsite
 * 
 * @version 1.0.0
 */

import type { Achievement } from '../../types';

// ============================================
// CUSTOMER MANAGEMENT (Cross-capability)
// ============================================

/**
 * Agregar primer cliente al sistema.
 * Requerido por: delivery, ecommerce, corporate_sales
 */
export const CUSTOMER_FIRST_ADDED: Achievement = {
  id: 'shared_customer_first_added', // ← Prefijo "shared_" para identificar
  tier: 'mandatory',
  capability: 'shared', // ← Capability especial "shared"
  name: 'Registrar primer cliente',
  description: 'Agrega tu primer cliente al sistema',
  icon: '👤',
  category: 'setup',
  
  // Metadata: qué capabilities lo requieren
  metadata: {
    sharedBy: ['delivery_shipping', 'async_operations', 'corporate_sales'],
    estimatedMinutes: 3,
  },
  
  validator: (ctx) => (ctx.customers?.length || 0) > 0,
  redirectUrl: '/admin/customers',
  estimatedMinutes: 3,
};

/**
 * Tener al menos 5 clientes registrados.
 * Requerido por: ecommerce, corporate_sales (para testing/demo)
 */
export const CUSTOMER_MIN_COUNT: Achievement = {
  id: 'shared_customer_min_count',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Registrar al menos 5 clientes',
  description: 'Construye tu base de clientes',
  icon: '👥',
  category: 'setup',
  
  metadata: {
    sharedBy: ['async_operations', 'corporate_sales'],
    estimatedMinutes: 10,
  },
  
  validator: (ctx) => (ctx.customers?.length || 0) >= 5,
  redirectUrl: '/admin/customers',
  estimatedMinutes: 10,
};

// ============================================
// PRODUCT MANAGEMENT (Cross-capability)
// ============================================

/**
 * Publicar primer producto.
 * Requerido por: takeaway, delivery, ecommerce, onsite
 */
export const PRODUCT_FIRST_PUBLISHED: Achievement = {
  id: 'shared_product_first_published',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Publicar primer producto',
  description: 'Publica tu primer producto al catálogo',
  icon: '📦',
  category: 'setup',
  
  metadata: {
    sharedBy: ['pickup_orders', 'delivery_shipping', 'async_operations', 'onsite_service'],
    estimatedMinutes: 5,
  },
  
  validator: (ctx) => {
    const published = ctx.products?.filter((p) => p.is_published) || [];
    return published.length > 0;
  },
  redirectUrl: '/admin/supply-chain/products',
  estimatedMinutes: 5,
};

/**
 * Tener catálogo mínimo de productos.
 * Requerido por: takeaway, delivery, ecommerce
 */
export const PRODUCT_MIN_CATALOG: Achievement = {
  id: 'shared_product_min_catalog',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Publicar al menos 5 productos',
  description: 'Tu catálogo debe tener productos disponibles',
  icon: '📦',
  category: 'setup',
  
  metadata: {
    sharedBy: ['pickup_orders', 'delivery_shipping', 'async_operations'],
    estimatedMinutes: 15,
    threshold: 5, // Umbral configurable
  },
  
  validator: (ctx) => {
    const published = ctx.products?.filter((p) => p.is_published) || [];
    return published.length >= 5;
  },
  redirectUrl: '/admin/supply-chain/products',
  estimatedMinutes: 15,
};

// ============================================
// PAYMENT METHODS (Cross-capability)
// ============================================

/**
 * Configurar al menos un método de pago.
 * Requerido por: takeaway, delivery, ecommerce
 */
export const PAYMENT_METHOD_CONFIGURED: Achievement = {
  id: 'shared_payment_method_configured',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Configurar método de pago',
  description: 'Define cómo recibirás los pagos',
  icon: '💳',
  category: 'setup',
  
  metadata: {
    sharedBy: ['pickup_orders', 'delivery_shipping', 'async_operations'],
    estimatedMinutes: 10,
  },
  
  validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
  redirectUrl: '/admin/settings/payment-methods',
  estimatedMinutes: 10,
};

// ============================================
// BUSINESS CONFIGURATION (Cross-capability)
// ============================================

/**
 * Configurar nombre del negocio.
 * Requerido por: TODAS las capabilities (base requirement)
 */
export const BUSINESS_NAME_CONFIGURED: Achievement = {
  id: 'shared_business_name',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Configurar nombre del negocio',
  description: 'Define el nombre comercial de tu negocio',
  icon: '🏪',
  category: 'setup',
  
  metadata: {
    sharedBy: [
      'pickup_orders',
      'delivery_shipping',
      'async_operations',
      'onsite_service',
      'corporate_sales',
      'physical_products',
      'professional_services',
      'asset_rental',
      'membership_subscriptions',
      'digital_products',
      'mobile_operations',
    ],
    estimatedMinutes: 2,
    isBase: true, // Flag: requirement base para TODAS las capabilities
  },
  
  validator: (ctx) => !!ctx.profile?.businessName?.trim(),
  redirectUrl: '/admin/settings/business',
  estimatedMinutes: 2,
};

/**
 * Configurar dirección del negocio.
 * Requerido por: takeaway, delivery, onsite (físicos)
 */
export const BUSINESS_ADDRESS_CONFIGURED: Achievement = {
  id: 'shared_business_address',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Configurar dirección del negocio',
  description: 'Define la ubicación física de tu negocio',
  icon: '📍',
  category: 'setup',
  
  metadata: {
    sharedBy: ['pickup_orders', 'delivery_shipping', 'onsite_service'],
    estimatedMinutes: 3,
  },
  
  validator: (ctx) => !!ctx.profile?.address,
  redirectUrl: '/admin/settings/business',
  estimatedMinutes: 3,
};

// ============================================
// EXPORTS
// ============================================

/**
 * Todos los shared requirements en un array.
 * Útil para deduplicación y debugging.
 */
export const ALL_SHARED_REQUIREMENTS: Achievement[] = [
  // Customer Management
  CUSTOMER_FIRST_ADDED,
  CUSTOMER_MIN_COUNT,
  
  // Product Management
  PRODUCT_FIRST_PUBLISHED,
  PRODUCT_MIN_CATALOG,
  
  // Payment Methods
  PAYMENT_METHOD_CONFIGURED,
  
  // Business Configuration
  BUSINESS_NAME_CONFIGURED,
  BUSINESS_ADDRESS_CONFIGURED,
];

/**
 * Helper: Obtener shared requirements para una capability específica.
 * 
 * @param capability - ID de la capability
 * @returns Array de shared requirements que aplican a esa capability
 * 
 * @example
 * ```typescript
 * const deliverySharedReqs = getSharedRequirementsForCapability('delivery_shipping');
 * // Returns: [CUSTOMER_FIRST_ADDED, PRODUCT_MIN_CATALOG, PAYMENT_METHOD_CONFIGURED, ...]
 * ```
 */
export function getSharedRequirementsForCapability(
  capability: string
): Achievement[] {
  return ALL_SHARED_REQUIREMENTS.filter((req) => {
    const sharedBy = req.metadata?.sharedBy as string[] | undefined;
    return sharedBy?.includes(capability) || req.metadata?.isBase;
  });
}

/**
 * Helper: Verificar si un requirement es compartido.
 * 
 * @param requirementId - ID del requirement
 * @returns true si el requirement es compartido
 */
export function isSharedRequirement(requirementId: string): boolean {
  return requirementId.startsWith('shared_');
}

/**
 * Helper: Obtener metadata de un shared requirement.
 * 
 * @param requirementId - ID del requirement
 * @returns Metadata del requirement o undefined
 */
export function getSharedRequirementMetadata(requirementId: string) {
  const req = ALL_SHARED_REQUIREMENTS.find((r) => r.id === requirementId);
  return req?.metadata;
}
