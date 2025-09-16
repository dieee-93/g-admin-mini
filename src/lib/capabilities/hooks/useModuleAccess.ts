/**
 * useModuleAccess Hook for G-Admin v3.0
 * Specialized hook for module access and dependency management
 */

import { useMemo } from 'react';
import { useCapabilities } from './useCapabilities';
import { moduleCapabilities } from '../types/BusinessCapabilities';
import type { BusinessCapability } from '../types/BusinessCapabilities';

export interface ModuleInfo {
  id: string;
  isEnabled: boolean;
  isAvailable: boolean;
  provides: BusinessCapability[];
  requires: BusinessCapability[];
  enhances?: BusinessCapability[];
  missingRequirements: BusinessCapability[];
}

export interface UseModuleAccessReturn {
  // Module checking
  hasModule: (moduleId: string) => boolean;
  isModuleAvailable: (moduleId: string) => boolean;
  getModuleInfo: (moduleId: string) => ModuleInfo | null;

  // Module lists
  enabledModules: string[];
  availableModules: string[];
  unavailableModules: string[];

  // Module dependencies
  getRequiredModules: (capability: BusinessCapability) => string[];
  getProvidingModules: (capability: BusinessCapability) => string[];
  getMissingRequirements: (moduleId: string) => BusinessCapability[];

  // Module recommendations
  getRecommendedModules: () => string[];
  getSuggestedModules: () => string[];
  getNextBestModule: () => string | null;
}

/**
 * Hook for module access and dependency management
 */
export const useModuleAccess = (): UseModuleAccessReturn => {
  const {
    hasModule,
    enabledModules,
    activeCapabilities,
    hasCapability,
    getRequiredModules
  } = useCapabilities();

  // Available modules (have all requirements met)
  const availableModules = useMemo(() => {
    return Object.keys(moduleCapabilities).filter(moduleId => {
      const config = moduleCapabilities[moduleId];
      return config.requires.every(cap => hasCapability(cap));
    });
  }, [activeCapabilities, hasCapability]);

  // Unavailable modules (missing requirements)
  const unavailableModules = useMemo(() => {
    return Object.keys(moduleCapabilities).filter(moduleId => {
      return !availableModules.includes(moduleId) && !enabledModules.includes(moduleId);
    });
  }, [availableModules, enabledModules]);

  // Check if module is available (requirements met)
  const isModuleAvailable = (moduleId: string): boolean => {
    return availableModules.includes(moduleId);
  };

  // Get detailed module information
  const getModuleInfo = (moduleId: string): ModuleInfo | null => {
    const config = moduleCapabilities[moduleId];
    if (!config) return null;

    const missingRequirements = config.requires.filter(cap => !hasCapability(cap));

    return {
      id: moduleId,
      isEnabled: hasModule(moduleId),
      isAvailable: missingRequirements.length === 0,
      provides: config.provides,
      requires: config.requires,
      enhances: config.enhances,
      missingRequirements
    };
  };

  // Get modules that provide a specific capability
  const getProvidingModules = (capability: BusinessCapability): string[] => {
    return Object.entries(moduleCapabilities)
      .filter(([_, config]) => config.provides.includes(capability))
      .map(([moduleId]) => moduleId);
  };

  // Get missing requirements for a module
  const getMissingRequirements = (moduleId: string): BusinessCapability[] => {
    const config = moduleCapabilities[moduleId];
    if (!config) return [];

    return config.requires.filter(cap => !hasCapability(cap));
  };

  // Get recommended modules based on current capabilities
  const getRecommendedModules = (): string[] => {
    return availableModules.filter(moduleId => {
      const config = moduleCapabilities[moduleId];
      const isEnabled = hasModule(moduleId);

      // Don't recommend already enabled modules
      if (isEnabled) return false;

      // Recommend if it enhances existing capabilities
      if (config.enhances) {
        return config.enhances.some(cap => hasCapability(cap));
      }

      return false;
    });
  };

  // Get suggested modules (next logical step)
  const getSuggestedModules = (): string[] => {
    const suggestions: { moduleId: string; score: number }[] = [];

    Object.entries(moduleCapabilities).forEach(([moduleId, config]) => {
      if (hasModule(moduleId)) return; // Skip enabled modules

      const missingReqs = getMissingRequirements(moduleId);
      if (missingReqs.length > 2) return; // Skip modules that need too many requirements

      let score = 0;

      // Score based on how many requirements we already have
      score += (config.requires.length - missingReqs.length) * 2;

      // Bonus for enhancing existing capabilities
      if (config.enhances) {
        score += config.enhances.filter(cap => hasCapability(cap)).length * 3;
      }

      // Penalty for each missing requirement
      score -= missingReqs.length;

      if (score > 0) {
        suggestions.push({ moduleId, score });
      }
    });

    return suggestions
      .sort((a, b) => b.score - a.score)
      .map(s => s.moduleId);
  };

  // Get the next best module to enable
  const getNextBestModule = (): string | null => {
    const suggested = getSuggestedModules();
    return suggested.length > 0 ? suggested[0] : null;
  };

  return {
    // Module checking
    hasModule,
    isModuleAvailable,
    getModuleInfo,

    // Module lists
    enabledModules,
    availableModules,
    unavailableModules,

    // Dependencies
    getRequiredModules,
    getProvidingModules,
    getMissingRequirements,

    // Recommendations
    getRecommendedModules,
    getSuggestedModules,
    getNextBestModule
  };
};