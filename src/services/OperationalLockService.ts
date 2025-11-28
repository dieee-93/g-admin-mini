/**
 * Operational Lock Service
 *
 * This service contains the core logic for checking the operational readiness of each
 * business capability based on the completion of its required configurations.
 * It acts as the "brain" of the operational lock system.
 *
 * @version 1.0.0
 */

import { useCapabilityStore } from '@/store/capabilityStore';
import { useAchievementsStore } from '@/store/achievementsStore';
import { CAPABILITY_REQUIREMENTS, ConfigurationId } from '@/config/ConfigurationRegistry';
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
 * It gets the required configurations for each capability, checks if they are complete,
 * and then updates the achievementsStore with the operational status.
 */
export function checkOperationalReadiness(settingsData: any) {
  logger.info('OperationalLockService', '🧠 Checking operational readiness...');

  const { profile } = useCapabilityStore.getState();
  const { updateCapabilityProgress } = useAchievementsStore.getState();

  if (!profile) {
    logger.warn('OperationalLockService', 'No profile found, cannot check readiness.');
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

    logger.debug('OperationalLockService', `Capability '${capabilityId}' readiness:`, {
      isOperational,
      progress: `${progressPercentage.toFixed(0)}%`,
      missing: missingRequirements,
    });

    // Update the central store with the calculated progress and status.
    updateCapabilityProgress(capabilityId, {
      isOperational,
      percentage: progressPercentage,
      missing: missingRequirements,
    });
  });

  logger.info('OperationalLockService', '✅ Readiness check complete.');
}
