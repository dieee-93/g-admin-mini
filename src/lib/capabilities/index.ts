/**
 * G-Admin v2.1 Capability System - BUSINESS IMPLEMENTATION
 * Main entry point for the business capability-based system
 *
 * CLEANED: All legacy code removed, only business capability system exports
 */

// Core Hooks - BUSINESS CAPABILITY SYSTEM
export {
  useCapabilities,
  useCapability,
  useCapabilityMap,
  useBusinessModel,
  useModuleAccess
} from './hooks/useCapabilities';

// Context Provider
export { CapabilityProvider, useCapabilityContext } from './CapabilityProvider';

// Capability Gate Component
export { CapabilityGate, withCapabilityGate } from './CapabilityGate';

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

// BUSINESS CAPABILITY SYSTEM - Core Functions
export {
  resolveBusinessCapabilities,
  shouldShowBusinessModule,
  getBusinessModuleFeatures,
  BUSINESS_MODULE_CONFIGURATIONS,
  BUSINESS_SHARED_DEPENDENCIES
} from './businessCapabilitySystem';
export type {
  BusinessFeatureConfig,
  BusinessModuleConfig
} from './businessCapabilitySystem';

// Utilities - ONLY non-deprecated functions
export {
  meetsRequirements,
  getMissingCapabilities,
  getCapabilityCoverage,
  getBusinessModelRequirements,
  getBestBusinessModelMatch,
  formatCapabilityName,
  groupCapabilitiesByCategory
} from './utils/capabilityUtils';

// Business Model Constants - FROM ORIGINAL SYSTEM
export {
  businessModelCapabilities,
  defaultCapabilities
} from './types/BusinessCapabilities';
export {
  businessModelDefinitions,
  businessModelCategories,
  complexityLevels,
  migrationPaths
} from './types/BusinessModels';

// Version info
export const CAPABILITY_SYSTEM_VERSION = '2.1.0-business';

/**
 * BUSINESS CAPABILITY SYSTEM: Quick setup function
 */
export const setupBusinessCapabilitySystem = (options?: {
  debugMode?: boolean;
}) => {
  return {
    version: CAPABILITY_SYSTEM_VERSION,
    debugMode: options?.debugMode ?? false,
    systemType: 'business'
  };
};