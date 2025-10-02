/**
 * UNIFIED CAPABILITY SYSTEM - Main Export
 *
 * REEMPLAZA COMPLETAMENTE:
 * - index.ts anterior (exports confusos)
 * - Todos los exports scattered
 * - Lógica duplicada
 *
 * UNIFIED: Un solo punto de entrada, exports claros
 */

// ============================================
// CORE SYSTEM
// ============================================

// Types
import { logger } from '@/lib/logging';

export type {
  CapabilityId,
  CapabilityCategory,
  BusinessCapability,
  CapabilityEffects,
  ModuleEffect,
  ValidationRule,
  UIEffect,
  SystemConfiguration,
  CapabilityProfile,
  UnifiedCapabilityState
} from './types/UnifiedCapabilities';

// Core Engine
export { CapabilityEngine } from './core/CapabilityEngine';

// Capability Definitions
export {
  CAPABILITY_DEFINITIONS,
  getCapabilitiesByCategory,
  getUniversalCapabilities,
  getActivityCapabilities,
  getInfrastructureCapabilities
} from './config/CapabilityDefinitions';

// ============================================
// STORE & HOOKS
// ============================================

// Main Store
export {
  useCapabilityStore,
  useCapabilities,
  useCapability,
  useModuleAccess
} from '@/store/capabilityStore';

// ============================================
// COMPONENTS
// ============================================

// Gate System
export {
  CapabilityGate,
  CapabilityCheck,
  ModuleGate,
  FeatureGate,
  UIGate,
  withCapabilityGate,
  DebugCapabilityGate
} from './components/CapabilityGate';

// ============================================
// UTILITIES
// ============================================

/**
 * Quick capability check utility
 */
export const hasCapability = (capabilities: CapabilityId[], target: CapabilityId): boolean => {
  return capabilities.includes(target);
};

/**
 * Quick module visibility check utility
 */
export const isModuleVisible = (visibleModules: string[], moduleId: string): boolean => {
  return visibleModules.includes(moduleId);
};

/**
 * Get capability definition utility
 */
export const getCapabilityDefinition = (capabilityId: CapabilityId) => {
  return CAPABILITY_DEFINITIONS[capabilityId];
};

// ============================================
// VERSION INFO
// ============================================

export const CAPABILITY_SYSTEM_VERSION = '3.0.0-unified';
export const SYSTEM_TYPE = 'unified';

/**
 * System health check
 */
export const getSystemHealth = () => {
  const totalCapabilities = Object.keys(CAPABILITY_DEFINITIONS).length;
  const universalCount = getUniversalCapabilities().length;
  const activityCount = getActivityCapabilities().length;
  const infrastructureCount = getInfrastructureCapabilities().length;

  return {
    version: CAPABILITY_SYSTEM_VERSION,
    type: SYSTEM_TYPE,
    capabilities: {
      total: totalCapabilities,
      universal: universalCount,
      activity: activityCount,
      infrastructure: infrastructureCount
    },
    healthy: totalCapabilities > 0 && universalCount > 0
  };
};

// ============================================
// LEGACY CLEANUP WARNING
// ============================================

if (process.env.NODE_ENV === 'development') {
  logger.info('App', `
🚀 G-Admin Unified Capability System v${CAPABILITY_SYSTEM_VERSION} loaded

✅ New unified system active
❌ Legacy systems disabled
📊 ${Object.keys(CAPABILITY_DEFINITIONS).length} capabilities defined
🔧 Clean architecture - zero legacy code

If you see any imports from old capability files, they need to be updated!
  `);
}