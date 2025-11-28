/**
 * Configuration Registry
 *
 * This file serves as the single source of truth for defining the configuration
 * requirements for each business capability in the system. It is the foundation
 * of the "Operational Lock" system.
 *
 * @version 1.0.0
 */

import type { BusinessCapabilityId } from './types';

/**
 * Defines all possible configuration IDs that can be required for a capability to be operational.
 */
export type ConfigurationId =
  | 'BUSINESS_PROFILE_COMPLETED' // Business name, tax id, etc.
  | 'PHYSICAL_ADDRESS_SET'
  | 'PAYMENT_METHODS_CONFIGURED'
  | 'FIRST_PRODUCT_CREATED'
  | 'FIRST_STAFF_MEMBER_ADDED'
  | 'DELIVERY_ZONES_DEFINED';

/**
 * A map that links a BusinessCapabilityId to an array of ConfigurationIds required for it to be operational.
 * This is the core of the operational lock logic.
 */
export const CAPABILITY_REQUIREMENTS: Map<BusinessCapabilityId, ConfigurationId[]> = new Map([
  // Capabilities requiring a physical location
  ['delivery', ['PHYSICAL_ADDRESS_SET', 'DELIVERY_ZONES_DEFINED']],
  ['in_store_pickup', ['PHYSICAL_ADDRESS_SET']],
  ['table_service', ['PHYSICAL_ADDRESS_SET', 'FIRST_PRODUCT_CREATED']],

  // Capabilities requiring staff
  ['staff_management', ['FIRST_STAFF_MEMBER_ADDED']],
  ['appointments', ['FIRST_STAFF_MEMBER_ADDED', 'PHYSICAL_ADDRESS_SET']],

  // Other capabilities
  ['async_operations', ['PAYMENT_METHODS_CONFIGURED', 'FIRST_PRODUCT_CREATED']],
]);

/**
 * Helper function to get the requirements for a given capability.
 * @param capabilityId The ID of the business capability.
 * @returns An array of required ConfigurationIds, or an empty array if none.
 */
export function getCapabilityRequirements(capabilityId: BusinessCapabilityId): ConfigurationId[] {
  return CAPABILITY_REQUIREMENTS.get(capabilityId) || [];
}
