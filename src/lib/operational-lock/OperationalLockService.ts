/**
 * Operational Lock Service
 *
 * This service contains the core logic for checking the operational readiness of each
 * business capability based on the completion of its required configurations.
 * It acts as the "brain" of the operational lock system.
 *
 * ⚠️ DEPRECATED - Siendo reemplazado por el nuevo sistema de Achievements
 * 
 * MIGRATION STATUS:
 * - Este servicio usa CAPABILITY_REQUIREMENTS (viejo sistema)
 * - Nuevo sistema usa requirements/ en achievements module
 * - TODO: Migrar completamente o deprecar este servicio
 *
 * @version 1.0.0
 * @deprecated Use achievements module validation hooks instead
 */

import { queryClient } from '@/App';
import { businessProfileKeys } from '@/lib/business-profile/hooks/useBusinessProfile';
import type { UserProfile } from '@/lib/business-profile/types';
import { CAPABILITY_REQUIREMENTS } from '@/config/ConfigurationRegistry';
import type { ConfigurationId } from '@/config/ConfigurationRegistry';
import { logger } from '@/lib/logging';

// ============================================
// CHECKER FUNCTIONS (PLACEHOLDERS)
// ============================================

/**
 * Checks if the business profile is complete.
 * @param settingsData The current settings data from the settings hook/store.
 * @returns True if the profile is complete, false otherwise.
 */
function isBusinessProfileComplete(settingsData: any): boolean {
  // Placeholder logic: check if companyName and taxId are filled.
  return !!settingsData?.businessProfile?.companyName && !!settingsData?.businessProfile?.taxId;
}

/**
 * Checks if a physical address has been set.
 * @param settingsData The current settings data from the settings hook/store.
 * @returns True if the address is set, false otherwise.
 */
function isAddressSet(settingsData: any): boolean {
  // Placeholder logic: check if the address field is not empty.
  return !!settingsData?.businessProfile?.address;
}

// This map connects a ConfigurationId to its checker function.
const configurationCheckers: Record<ConfigurationId, (settings: any) => boolean> = {
  BUSINESS_PROFILE_COMPLETED: isBusinessProfileComplete,
  PHYSICAL_ADDRESS_SET: isAddressSet,
  // TODO: Implement checkers for the rest of the configurations
  PAYMENT_METHODS_CONFIGURED: () => false,
  FIRST_PRODUCT_CREATED: () => false,
  FIRST_STAFF_MEMBER_ADDED: () => false,
  DELIVERY_ZONES_DEFINED: () => false,
};

// ============================================
// CORE LOGIC
// ============================================

/**
 * Checks the operational readiness of all selected business capabilities.
 * 
 * ⚠️ DEPRECATED: Este servicio ya no actualiza achievementsStore.
 * En su lugar, el nuevo sistema de achievements usa:
 * - EventBus listeners para detectar cambios
 * - TanStack Query cache invalidation para actualizar UI
 * - achievements.validate_commercial_operation hook para bloquear operaciones
 * 
 * Este servicio se mantiene solo para logging y compatibilidad temporal.
 * 
 * @deprecated Use achievements module validation instead
 */
export function checkOperationalReadiness(settingsData: any) {
  logger.info('App', '🧠 Checking operational readiness (DEPRECATED - use achievements module)');

  const profile = queryClient.getQueryData<UserProfile>(businessProfileKeys.detail());

  if (!profile) {
    logger.warn('App', 'No profile found, cannot check readiness.');
    return;
  }

  const selectedCapabilities = profile.selectedCapabilities;

  selectedCapabilities.forEach(capabilityId => {
    const requirements = CAPABILITY_REQUIREMENTS.get(capabilityId) || [];
    const missingRequirements: ConfigurationId[] = [];

    requirements.forEach(reqId => {
      const checker = configurationCheckers[reqId];
      if (!checker || !checker(settingsData)) {
        missingRequirements.push(reqId);
      }
    });

    const isOperational = missingRequirements.length === 0;
    const progressPercentage = requirements.length > 0
      ? ((requirements.length - missingRequirements.length) / requirements.length) * 100
      : 100;

    logger.debug('App', `Capability '${capabilityId}' readiness:`, {
      isOperational,
      progress: `${progressPercentage.toFixed(0)}%`,
      missing: missingRequirements,
    });

    // ⚠️ NO LONGER UPDATING STORE
    // The new achievements system handles this via:
    // 1. EventBus listeners (products.created, settings.updated, etc.)
    // 2. TanStack Query cache invalidation
    // 3. computeProgress() service function
    // 
    // OLD CODE (removed):
    // updateCapabilityProgress(capabilityId, { ... });
  });

  logger.info('App', '✅ Readiness check complete (DEPRECATED).');
}
