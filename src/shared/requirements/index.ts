/**
 * SHARED REQUIREMENTS - Cross-Capability Requirements
 * 
 * Requirements used by MULTIPLE business capabilities.
 * These are defined ONCE here and can be imported by reference from any module.
 * 
 * ARCHITECTURE:
 * - Single source of truth for shared requirements
 * - Import by reference (not by string ID) for automatic deduplication
 * - Type-safe: TypeScript validates imports at compile time
 * - Zero configuration: No metadata needed
 * 
 * USAGE PATTERN:
 * ```typescript
 * // In delivery module
 * import { CUSTOMER_FIRST_ADDED, PRODUCT_MIN_CATALOG } from '@/shared/requirements';
 * 
 * const DELIVERY_REQUIREMENTS = [
 *   CUSTOMER_FIRST_ADDED,  // ← Same object reference
 *   PRODUCT_MIN_CATALOG,
 *   DELIVERY_ZONE_CONFIGURED, // ← Module-specific
 * ];
 * ```
 * 
 * WHY THIS PATTERN:
 * - JavaScript reference equality enables automatic deduplication
 * - Set<Achievement> deduplicates in O(1) using object references
 * - No need for metadata.sharedBy arrays (self-documenting via imports)
 * - Compiler catches typos and missing imports
 * 
 * @version 2.0.0 - Reference-based architecture
 */

import type { Achievement } from '@/modules/achievements/types';

// ============================================
// CUSTOMER MANAGEMENT (Cross-capability)
// ============================================

/**
 * Add first customer to the system.
 * Required by: delivery, ecommerce, corporate_sales
 */
export const CUSTOMER_FIRST_ADDED: Achievement = {
  id: 'customer_first_added', // ✅ No "shared_" prefix needed
  tier: 'mandatory',
  capability: 'shared',
  name: 'Registrar primer cliente',
  description: 'Agrega tu primer cliente al sistema',
  icon: '👤',
  category: 'setup',
  
  validator: (ctx) => (ctx.customers?.length || 0) > 0,
  redirectUrl: '/admin/customers',
  estimatedMinutes: 3,
};

/**
 * Have at least 5 customers registered.
 * Required by: ecommerce, corporate_sales
 */
export const CUSTOMER_MIN_COUNT: Achievement = {
  id: 'customer_min_count',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Registrar al menos 5 clientes',
  description: 'Construye tu base de clientes',
  icon: '👥',
  category: 'setup',
  
  validator: (ctx) => (ctx.customers?.length || 0) >= 5,
  redirectUrl: '/admin/customers',
  estimatedMinutes: 10,
};

// ============================================
// PRODUCT MANAGEMENT (Cross-capability)
// ============================================

/**
 * Publish first product.
 * Required by: pickup_orders, delivery, ecommerce, onsite
 */
export const PRODUCT_FIRST_PUBLISHED: Achievement = {
  id: 'product_first_published',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Publicar primer producto',
  description: 'Publica tu primer producto al catálogo',
  icon: '📦',
  category: 'setup',
  
  validator: (ctx) => {
    const published = ctx.products?.filter((p) => p.is_published) || [];
    return published.length > 0;
  },
  redirectUrl: '/admin/supply-chain/products',
  estimatedMinutes: 5,
};

/**
 * Have minimum product catalog.
 * Required by: pickup_orders, delivery, ecommerce
 */
export const PRODUCT_MIN_CATALOG: Achievement = {
  id: 'product_min_catalog',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Publicar al menos 5 productos',
  description: 'Tu catálogo debe tener productos disponibles',
  icon: '📦',
  category: 'setup',
  
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
 * Configure at least one payment method.
 * Required by: pickup_orders, delivery, ecommerce
 */
export const PAYMENT_METHOD_CONFIGURED: Achievement = {
  id: 'payment_method_configured',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Configurar método de pago',
  description: 'Define cómo recibirás los pagos',
  icon: '💳',
  category: 'setup',
  
  validator: (ctx) => (ctx.paymentMethods?.length || 0) > 0,
  redirectUrl: '/admin/settings/payment-methods',
  estimatedMinutes: 10,
};

// ============================================
// BUSINESS CONFIGURATION (Cross-capability)
// ============================================

/**
 * Configure business name.
 * Required by: ALL capabilities (base requirement)
 */
export const BUSINESS_NAME_CONFIGURED: Achievement = {
  id: 'business_name_configured',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Configurar nombre del negocio',
  description: 'Define el nombre comercial de tu negocio',
  icon: '🏪',
  category: 'setup',
  
  validator: (ctx) => !!ctx.profile?.businessName?.trim(),
  redirectUrl: '/admin/settings/business',
  estimatedMinutes: 2,
};

/**
 * Configure business address.
 * Required by: pickup_orders, delivery, onsite
 */
export const BUSINESS_ADDRESS_CONFIGURED: Achievement = {
  id: 'business_address_configured',
  tier: 'mandatory',
  capability: 'shared',
  name: 'Configurar dirección del negocio',
  description: 'Define la ubicación física de tu negocio',
  icon: '📍',
  category: 'setup',
  
  validator: (ctx) => !!ctx.profile?.address,
  redirectUrl: '/admin/settings/business',
  estimatedMinutes: 3,
};

// ============================================
// EXPORTS
// ============================================

/**
 * All shared requirements in a single array.
 * 
 * NOTE: This is provided for backwards compatibility and debugging.
 * Prefer importing individual requirements by reference instead of using this array.
 * 
 * @example
 * ```typescript
 * // ❌ Avoid this
 * import { ALL_SHARED_REQUIREMENTS } from '@/shared/requirements';
 * const reqs = [...ALL_SHARED_REQUIREMENTS, ...MY_REQS];
 * 
 * // ✅ Do this instead
 * import { CUSTOMER_FIRST_ADDED, PRODUCT_MIN_CATALOG } from '@/shared/requirements';
 * const reqs = [CUSTOMER_FIRST_ADDED, PRODUCT_MIN_CATALOG, MY_REQ];
 * ```
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
