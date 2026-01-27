/**
 * SALES MODULE REQUIREMENTS
 * 
 * Requirements for pickup_orders (TakeAway) capability.
 * 
 * ARCHITECTURE PATTERN:
 * - Import shared requirements by REFERENCE from @/shared/requirements
 * - Define module-specific requirements inline
 * - Export array for registration via hook
 * 
 * @version 1.0.0
 */

import type { Achievement } from '@/modules/achievements/types';

// ============================================
// IMPORT SHARED REQUIREMENTS
// ============================================

/**
 * Import shared requirements by REFERENCE.
 * These are the SAME object instances used by other modules.
 * Automatic deduplication via JavaScript reference equality.
 */
import {
  BUSINESS_NAME_CONFIGURED,
  BUSINESS_ADDRESS_CONFIGURED,
  PRODUCT_FIRST_PUBLISHED,
  PRODUCT_MIN_CATALOG,
  PAYMENT_METHOD_CONFIGURED,
} from '@/shared/requirements';

// ============================================
// PICKUP ORDERS (TAKEAWAY) REQUIREMENTS
// ============================================

/**
 * Configure pickup hours.
 * Module-specific requirement for pickup_orders capability.
 */
const PICKUP_HOURS_CONFIGURED: Achievement = {
  id: 'pickup_hours_configured',
  tier: 'mandatory',
  capability: 'pickup_orders',
  name: 'Configurar horarios de retiro',
  description: 'Define los horarios en que los clientes pueden retirar pedidos',
  icon: '🕐',
  category: 'setup',
  
  validator: (ctx) => {
    // Check if pickup hours are configured
    const hasPickupHours = ctx.profile?.pickupHours !== undefined;
    return hasPickupHours;
  },
  
  redirectUrl: '/admin/settings/hours',
  estimatedMinutes: 5,
};

/**
 * Configure POS for takeaway orders.
 * Module-specific requirement for pickup_orders capability.
 */
const POS_TAKEAWAY_CONFIGURED: Achievement = {
  id: 'pos_takeaway_configured',
  tier: 'mandatory',
  capability: 'pickup_orders',
  name: 'Configurar POS para retiro',
  description: 'Habilita la interfaz de punto de venta para pedidos de retiro',
  icon: '💻',
  category: 'setup',
  
  validator: (ctx) => {
    // Check if POS is enabled for takeaway
    // For now, return true (placeholder - this would check actual POS configuration)
    return ctx.products.length > 0; // Simple check: has products = POS can be used
  },
  
  redirectUrl: '/admin/settings/sales',
  estimatedMinutes: 3,
};

// ============================================
// EXPORTS
// ============================================

/**
 * All requirements for pickup_orders capability.
 * 
 * DEDUPLICATION PATTERN:
 * - Shared requirements (imported by reference) will be automatically deduplicated
 * - When delivery, ecommerce, and pickup all import PRODUCT_FIRST_PUBLISHED,
 *   only ONE instance will appear in the final UI
 * 
 * @example
 * ```typescript
 * // In sales/manifest.tsx setup()
 * registry.addAction(
 *   'achievements.get_requirements_registry',
 *   () => ({
 *     capability: 'pickup_orders',
 *     requirements: PICKUP_ORDERS_REQUIREMENTS,
 *     moduleId: 'sales'
 *   }),
 *   'sales'
 * );
 * ```
 */
export const PICKUP_ORDERS_REQUIREMENTS: Achievement[] = [
  // Shared requirements (imported by reference)
  BUSINESS_NAME_CONFIGURED,
  BUSINESS_ADDRESS_CONFIGURED,
  PRODUCT_FIRST_PUBLISHED,
  PRODUCT_MIN_CATALOG,
  PAYMENT_METHOD_CONFIGURED,
  
  // Module-specific requirements
  PICKUP_HOURS_CONFIGURED,
  POS_TAKEAWAY_CONFIGURED,
];
