/**
 * CAPABILITY SYSTEM - 3-Layer Architecture
 *
 * Clean interface to the capability system (no legacy code).
 * 
 * ARCHITECTURE:
 * - Layer 1: Business Profile (TanStack Query) - Server state
 * - Layer 2: Feature Flags (React Context) - Global configuration
 * - Layer 3: Setup UI (Zustand) - Client UI state
 *
 * Created: 2025-01-14
 */

import { logger } from '@/lib/logging';

// ============================================
// LAYER 1: Business Profile (Server State)
// ============================================

export {
  useBusinessProfile,
  useUpdateProfile,
  useInitializeProfile,
  useCompleteSetup,
  useDismissWelcome,
  useResetProfile,
  useToggleCapability,
  useSetInfrastructure,
  businessProfileKeys,
} from '@/lib/business-profile/hooks/useBusinessProfile';

// ============================================
// LAYER 2: Feature Flags (Configuration)
// ============================================

export {
  FeatureFlagProvider,
  useFeatureFlags,
  useHasFeature,
  useHasAllFeatures,
  useIsModuleActive,
  useActiveFeatures,
  useActiveModules,
} from '@/contexts/FeatureFlagContext';

// ============================================
// LAYER 3: Setup UI (Client State)
// ============================================

export {
  useSetupUIStore,
  useIsSetupCompleted,
  useIsFirstTimeInDashboard,
  useOnboardingStep,
  useIsSetupModalOpen,
  useIsWelcomeModalOpen,
} from '@/store/setupUIStore';

// ============================================
// SHARED TYPES & UTILITIES
// ============================================

export { FeatureActivationEngine } from '@/lib/features/FeatureEngine';
export type { FeatureId } from '@/config/FeatureRegistry';
export type { BusinessCapabilityId, InfrastructureId } from '@/config/BusinessModelRegistry';
export type { UserProfile } from '@/lib/business-profile/types';

// ============================================
// SERVICE LAYER (NEW - v5.0)
// ============================================

export {
  // Feature Activation
  activateFeatures,
  // Feature Queries
  hasFeature,
  hasAllFeatures,
  isFeatureBlocked,
  // Module Queries
  getActiveModules,
  hasModule,
  // Capability Operations
  addCapability,
  removeCapability,
  toggleCapability,
  // Infrastructure Operations
  addInfrastructure,
  removeInfrastructure,
  toggleInfrastructure,
  // Helpers
  getUpdatedArrayIfChanged,
  // Validation
  validateProfile,
  // Types
  type FeatureActivationResult,
  type ValidationError
} from './featureActivationService';

// ============================================
// VERSION INFO
// ============================================

export const CAPABILITY_SYSTEM_VERSION = '5.0.0-clean';
export const SYSTEM_TYPE = 'three-layer';

export const getSystemHealth = () => {
  return {
    version: CAPABILITY_SYSTEM_VERSION,
    type: SYSTEM_TYPE,
    healthy: true,
    message: '3-Layer Architecture: Profile (TanStack) + Features (Context) + Setup (Zustand)'
  };
};

export const logSystemInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('CapabilitySystem', `Capability System v${CAPABILITY_SYSTEM_VERSION} loaded`);
    logger.info('CapabilitySystem', '3-Layer Architecture: Profile + Features + Setup');
  }
};
