/**
 * CAPABILITY SYSTEM - Compatibility Bridge to v4.0
 *
 * This file bridges old capability imports to the new Feature System v4.0
 * All functionality now comes from:
 * - src/config/ (BusinessModelRegistry, FeatureRegistry, RequirementsRegistry)
 * - src/lib/features/ (FeatureActivationEngine)
 * - src/store/capabilityStore.ts (unified store)
 *
 * MIGRATION: Eventually remove this file and update all imports to use new paths
 */

// ============================================
// STORE & HOOKS (Primary Interface)
// ============================================

export {
  useCapabilityStore,
  useCapabilities,
  type UserProfile,
  type FeatureState,
  type CapabilityStoreState
} from '@/store/capabilityStore';

// ============================================
// NEW SYSTEM EXPORTS
// ============================================

// Feature System
export { FeatureActivationEngine } from '@/lib/features/FeatureEngine';
export type { FeatureId, CoreFeature, ConditionalFeature } from '@/config/FeatureRegistry';
export type { BusinessActivityId, InfrastructureId } from '@/config/BusinessModelRegistry';

// Components
export { CapabilityGate, useCapabilityCheck } from './components/CapabilityGate';

// ============================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================

import { useCapabilityStore } from '@/store/capabilityStore';
import type { FeatureId } from '@/config/FeatureRegistry';

/**
 * @deprecated Use FeatureId from FeatureRegistry
 */
export type CapabilityId = FeatureId;

/**
 * @deprecated Use useCapabilities().hasFeature() instead
 */
export const useCapability = (featureId: string) => {
  const hasFeature = useCapabilityStore(state => state.hasFeature);
  return hasFeature(featureId as FeatureId);
};

/**
 * @deprecated Use useCapabilities().visibleModules instead
 */
export const useModuleAccess = (moduleId: string) => {
  const modules = useCapabilityStore(state => state.getActiveModules());
  const hasAccess = modules.includes(moduleId);

  return {
    hasAccess,
    features: []
  };
};

/**
 * @deprecated Use FeatureActivationEngine.activateFeatures() instead
 */
export const CapabilityEngine = {
  resolve: (capabilities: string[]) => {
    console.warn('[CapabilityEngine.resolve] DEPRECATED - Use FeatureActivationEngine instead');
    return {
      activeCapabilities: capabilities,
      visibleModules: [],
      modules: {},
      validationRules: [],
      uiEffects: []
    };
  },
  hasCapability: (config: any, capId: string) => {
    console.warn('[CapabilityEngine.hasCapability] DEPRECATED - Use useCapabilities().hasFeature() instead');
    return false;
  },
  isModuleVisible: (config: any, moduleId: string) => {
    console.warn('[CapabilityEngine.isModuleVisible] DEPRECATED - Use getActiveModules().includes() instead');
    return false;
  },
  getModuleFeatures: (config: any, moduleId: string) => {
    console.warn('[CapabilityEngine.getModuleFeatures] DEPRECATED');
    return [];
  }
};

// ============================================
// VERSION INFO
// ============================================

export const CAPABILITY_SYSTEM_VERSION = '4.0.0-features';
export const SYSTEM_TYPE = 'feature-based';

/**
 * System health check
 */
export const getSystemHealth = () => {
  return {
    version: CAPABILITY_SYSTEM_VERSION,
    type: SYSTEM_TYPE,
    healthy: true,
    message: 'Using Feature System v4.0 - See BusinessModelRegistry, FeatureRegistry, RequirementsRegistry'
  };
};

export const logSystemInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`
🚀 G-Admin Feature System v${CAPABILITY_SYSTEM_VERSION} loaded

✅ New 3-layer architecture active
   Layer 1: User Choices (BusinessModelRegistry)
   Layer 2: System Features (FeatureRegistry)
   Layer 3: Requirements & Progression (RequirementsRegistry)

📦 Core: FeatureActivationEngine + capabilityStore
    `);
  }
};
