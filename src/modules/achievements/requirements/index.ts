/**
 * ACHIEVEMENTS REQUIREMENTS - CENTRALIZED EXPORTS
 *
 * Este archivo re-exporta:
 * 1. Capability → Requirements mapping (CENTRALIZED)
 * 2. Deduplication utilities
 * 3. Shared requirements
 *
 * ARCHITECTURE v3.0: Centralized Mapping
 * - Configuration centralizada en capability-mapping.ts
 * - Consumption desacoplada via helpers
 * - Deduplicación automática por referencia
 *
 * @version 3.0.0
 */

// ============================================
// CENTRALIZED MAPPING (Primary Export)
// ============================================

export {
  CAPABILITY_REQUIREMENTS,
  getRequirementsForCapabilities,
  getRequirementsForCapability,
  hasRequirements,
  getRequirementsMappingStats,
} from './capability-mapping';

// ============================================
// DEDUPLICATION UTILITIES
// ============================================

export {
  deduplicateRequirements,
  filterByCapabilities,
  validateNoConflicts,
  generateDeduplicationReport,
  type RequirementRegistration,
  type DeduplicatedRegistry,
} from './deduplication';

// ============================================
// SHARED REQUIREMENTS (Re-export)
// ============================================

export {
  BUSINESS_NAME_CONFIGURED,
  BUSINESS_ADDRESS_CONFIGURED,
  CUSTOMER_FIRST_ADDED,
  CUSTOMER_MIN_COUNT,
  PRODUCT_FIRST_PUBLISHED,
  PRODUCT_MIN_CATALOG,
  PAYMENT_METHOD_CONFIGURED,
  ALL_SHARED_REQUIREMENTS,
} from '@/shared/requirements';

// ============================================
// LEGACY EXPORTS (Deprecated - will be removed)
// ============================================

/**
 * @deprecated Use CAPABILITY_REQUIREMENTS instead
 * These exports are kept for backwards compatibility with existing code.
 * Will be removed in v4.0.0
 */
export { TAKEAWAY_MANDATORY } from './takeaway';
export { DINEIN_MANDATORY } from './dinein';
export { DELIVERY_MANDATORY } from './delivery';
export { ECOMMERCE_MANDATORY } from './ecommerce';
export { CUMULATIVE_ACHIEVEMENTS } from './cumulative';
