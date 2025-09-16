/**
 * Capability Utilities for G-Admin v3.0
 * Helper functions for capability checking and management
 */

import type { BusinessCapability } from '../types/BusinessCapabilities';
import type { BusinessModel } from '../types/BusinessModels';
import { businessModelCapabilities, moduleCapabilities } from '../types/BusinessCapabilities';
import { businessModelDefinitions } from '../types/BusinessModels';

/**
 * Check if a set of capabilities meets the requirements for another set
 */
export const meetsRequirements = (
  available: BusinessCapability[],
  required: BusinessCapability[],
  mode: 'any' | 'all' = 'all'
): boolean => {
  if (mode === 'all') {
    return required.every(cap => available.includes(cap));
  } else {
    return required.some(cap => available.includes(cap));
  }
};

/**
 * Get missing capabilities from a required set
 */
export const getMissingCapabilities = (
  available: BusinessCapability[],
  required: BusinessCapability[]
): BusinessCapability[] => {
  return required.filter(cap => !available.includes(cap));
};

/**
 * Calculate capability coverage percentage
 */
export const getCapabilityCoverage = (
  available: BusinessCapability[],
  target: BusinessCapability[]
): number => {
  if (target.length === 0) return 100;

  const covered = target.filter(cap => available.includes(cap)).length;
  return Math.round((covered / target.length) * 100);
};

/**
 * Get all capabilities required by a business model
 */
export const getBusinessModelRequirements = (model: BusinessModel): BusinessCapability[] => {
  return businessModelCapabilities[model] || [];
};

/**
 * Determine the best business model match for a set of capabilities
 */
export const getBestBusinessModelMatch = (
  capabilities: BusinessCapability[]
): { model: BusinessModel; coverage: number } | null => {
  let bestMatch: { model: BusinessModel; coverage: number } | null = null;

  Object.entries(businessModelCapabilities).forEach(([model, required]) => {
    const coverage = getCapabilityCoverage(capabilities, required);

    if (!bestMatch || coverage > bestMatch.coverage) {
      bestMatch = { model: model as BusinessModel, coverage };
    }
  });

  return bestMatch;
};

/**
 * Get capability dependencies (capabilities that enable other capabilities)
 */
export const getCapabilityDependencies = (capability: BusinessCapability): BusinessCapability[] => {
  const dependencies: BusinessCapability[] = [];

  // Check module dependencies
  Object.values(moduleCapabilities).forEach(config => {
    if (config.provides.includes(capability)) {
      dependencies.push(...config.requires);
    }
  });

  return [...new Set(dependencies)];
};

/**
 * Get all modules that would be enabled by a set of capabilities
 */
export const getEnabledModules = (capabilities: BusinessCapability[]): string[] => {
  const enabledModules: string[] = [];

  Object.entries(moduleCapabilities).forEach(([moduleId, config]) => {
    if (meetsRequirements(capabilities, config.requires)) {
      enabledModules.push(moduleId);
    }
  });

  return enabledModules;
};

/**
 * Get capability impact analysis (what would change if capability is added/removed)
 */
export const getCapabilityImpact = (
  currentCapabilities: BusinessCapability[],
  targetCapability: BusinessCapability,
  action: 'add' | 'remove'
): {
  newCapabilities: BusinessCapability[];
  enabledModules: string[];
  disabledModules: string[];
  affectedBusinessModels: BusinessModel[];
} => {
  const newCapabilities = action === 'add'
    ? [...currentCapabilities, targetCapability]
    : currentCapabilities.filter(cap => cap !== targetCapability);

  const currentModules = getEnabledModules(currentCapabilities);
  const newModules = getEnabledModules(newCapabilities);

  const enabledModules = newModules.filter(mod => !currentModules.includes(mod));
  const disabledModules = currentModules.filter(mod => !newModules.includes(mod));

  // Find business models affected by this change
  const affectedBusinessModels: BusinessModel[] = [];
  Object.entries(businessModelCapabilities).forEach(([model, required]) => {
    if (required.includes(targetCapability)) {
      affectedBusinessModels.push(model as BusinessModel);
    }
  });

  return {
    newCapabilities,
    enabledModules,
    disabledModules,
    affectedBusinessModels
  };
};

/**
 * Validate capability configuration
 */
export const validateCapabilityConfiguration = (
  capabilities: BusinessCapability[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for essential capabilities
  const hasEssentials = ['customer_management', 'fiscal_compliance'].every(cap =>
    capabilities.includes(cap as BusinessCapability)
  );

  if (!hasEssentials) {
    errors.push('Missing essential capabilities: customer_management, fiscal_compliance');
  }

  // Check for business logic consistency
  const hasProducts = capabilities.some(cap => cap.startsWith('sells_products'));
  const hasServices = capabilities.some(cap => cap.startsWith('sells_services'));

  if (!hasProducts && !hasServices) {
    warnings.push('No primary revenue stream defined (products or services)');
  }

  // Check for payment capability when selling
  if ((hasProducts || hasServices) && !capabilities.includes('payment_gateway')) {
    suggestions.push('Consider adding payment_gateway capability for sales processing');
  }

  // Check for inventory when selling products
  if (hasProducts && !capabilities.includes('inventory_tracking')) {
    suggestions.push('Consider adding inventory_tracking capability for product management');
  }

  // Check for staff management when providing services
  if (hasServices && !capabilities.includes('staff_management')) {
    suggestions.push('Consider adding staff_management capability for service delivery');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};

/**
 * Get capability upgrade path (what capabilities to add for business growth)
 */
export const getCapabilityUpgradePath = (
  currentCapabilities: BusinessCapability[],
  targetModel?: BusinessModel
): {
  immediate: BusinessCapability[];
  shortTerm: BusinessCapability[];
  longTerm: BusinessCapability[];
} => {
  const immediate: BusinessCapability[] = [];
  const shortTerm: BusinessCapability[] = [];
  const longTerm: BusinessCapability[] = [];

  // If target model specified, work towards it
  if (targetModel) {
    const required = getBusinessModelRequirements(targetModel);
    const missing = getMissingCapabilities(currentCapabilities, required);

    // Categorize by dependency complexity
    missing.forEach(cap => {
      const dependencies = getCapabilityDependencies(cap);
      const missingDeps = getMissingCapabilities(currentCapabilities, dependencies);

      if (missingDeps.length === 0) {
        immediate.push(cap);
      } else if (missingDeps.length <= 2) {
        shortTerm.push(cap);
      } else {
        longTerm.push(cap);
      }
    });
  } else {
    // General upgrade suggestions based on current state
    const enabledModules = getEnabledModules(currentCapabilities);

    // Suggest common upgrades
    if (currentCapabilities.includes('sells_products') && !currentCapabilities.includes('has_online_store')) {
      shortTerm.push('has_online_store');
    }

    if (currentCapabilities.includes('sells_services') && !currentCapabilities.includes('appointment_booking')) {
      immediate.push('appointment_booking');
    }

    if (enabledModules.includes('sales') && !currentCapabilities.includes('inventory_tracking')) {
      immediate.push('inventory_tracking');
    }
  }

  return { immediate, shortTerm, longTerm };
};

/**
 * Format capability name for display
 */
export const formatCapabilityName = (capability: BusinessCapability): string => {
  return capability
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Group capabilities by category
 */
export const groupCapabilitiesByCategory = (capabilities: BusinessCapability[]): Record<string, BusinessCapability[]> => {
  const groups: Record<string, BusinessCapability[]> = {
    core: [],
    products: [],
    services: [],
    operations: [],
    finance: [],
    infrastructure: []
  };

  capabilities.forEach(cap => {
    if (['customer_management', 'dashboard_analytics', 'system_settings'].includes(cap)) {
      groups.core.push(cap);
    } else if (cap.includes('product') || cap.includes('inventory')) {
      groups.products.push(cap);
    } else if (cap.includes('service') || cap.includes('appointment') || cap.includes('class')) {
      groups.services.push(cap);
    } else if (cap.includes('delivery') || cap.includes('pos') || cap.includes('table')) {
      groups.operations.push(cap);
    } else if (cap.includes('fiscal') || cap.includes('payment') || cap.includes('invoice')) {
      groups.finance.push(cap);
    } else {
      groups.infrastructure.push(cap);
    }
  });

  return groups;
};