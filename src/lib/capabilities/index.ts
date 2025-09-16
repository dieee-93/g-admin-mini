/**
 * G-Admin v3.0 Capability System
 * Main entry point for the capability-based rendering system
 */

import type React from 'react';

// Core components
export { CapabilityGate, withCapabilityGate, useCapabilityCheck, CapabilityDebugger } from './CapabilityGate';
export {
  CapabilityProvider,
  useCapabilityContext,
  useOptionalCapabilityContext,
  withCapabilityProvider,
  CapabilityDebugPanel,
  CapabilityRequirements
} from './CapabilityProvider';

// Hooks
export {
  useCapabilities,
  useCapability,
  useCapabilityMap,
  useBusinessModel as useBusinessModelFromCapabilities,
  useModuleAccess as useModuleAccessFromCapabilities
} from './hooks/useCapabilities';
export { useBusinessModel } from './hooks/useBusinessModel';
export { useModuleAccess } from './hooks/useModuleAccess';

// Types
export type {
  BusinessCapability,
  BusinessCapabilities,
  BusinessModel,
  BusinessStructure,
  CapabilityDefinition,
  CapabilityContext
} from './types/BusinessCapabilities';
export type { BusinessModelDefinition } from './types/BusinessModels';

// Utilities
export {
  meetsRequirements,
  getMissingCapabilities,
  getCapabilityCoverage,
  getBusinessModelRequirements,
  getBestBusinessModelMatch,
  getCapabilityDependencies,
  getEnabledModules,
  getCapabilityImpact,
  validateCapabilityConfiguration,
  getCapabilityUpgradePath,
  formatCapabilityName,
  groupCapabilitiesByCategory
} from './utils/capabilityUtils';

export {
  mapLegacyCapabilities,
  detectBusinessModel,
  getBusinessModelEvolution,
  calculateBusinessModelReadiness,
  getBusinessModelCompatibility,
  suggestBusinessModelByIndustry
} from './utils/businessModelMapping';

// Constants and configurations
export {
  businessModelCapabilities,
  moduleCapabilities,
  defaultCapabilities
} from './types/BusinessCapabilities';
export {
  businessModelDefinitions,
  businessModelCategories,
  complexityLevels,
  migrationPaths
} from './types/BusinessModels';

// Version info
export const CAPABILITY_SYSTEM_VERSION = '1.0.0';

/**
 * Quick setup function for the capability system
 * Use this in your App.tsx or main entry point
 */
export const setupCapabilitySystem = (options?: {
  debugMode?: boolean;
  fallback?: React.ReactNode;
}) => {
  // Return configuration object instead of JSX to avoid TypeScript issues in .ts file
  return {
    debugMode: options?.debugMode,
    fallback: options?.fallback
  };
};