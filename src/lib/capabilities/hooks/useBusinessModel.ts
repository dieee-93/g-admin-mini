/**
 * useBusinessModel Hook for G-Admin v3.0
 * Specialized hook for business model operations
 */

import { useMemo } from 'react';
import { useCapabilities } from './useCapabilities';
import type { BusinessModel } from '../types/BusinessModels';
import { businessModelDefinitions, migrationPaths } from '../types/BusinessModels';

export interface UseBusinessModelReturn {
  // Current business model
  current: BusinessModel | null;
  definition: typeof businessModelDefinitions[BusinessModel] | null;

  // Business model checking
  is: (model: BusinessModel) => boolean;
  isNot: (model: BusinessModel) => boolean;
  isOneOf: (models: BusinessModel[]) => boolean;

  // Business model capabilities
  supports: (model: BusinessModel) => boolean;
  getRequiredCapabilities: (model: BusinessModel) => import('../types/BusinessCapabilities').BusinessCapability[];

  // Business model evolution
  canMigrateTo: (model: BusinessModel) => boolean;
  getMigrationPaths: () => BusinessModel[];
  getSuggestedUpgrades: () => BusinessModel[];

  // Business model characteristics
  getCategory: () => string;
  getComplexity: () => string;
  getExamples: () => string[];
  getRecommendedModules: () => string[];
}

/**
 * Hook for business model operations
 */
export const useBusinessModel = (): UseBusinessModelReturn => {
  const { businessModel, supportsBusinessModel, getBusinessModelCapabilities } = useCapabilities();

  // Get current business model definition
  const definition = useMemo(() => {
    return businessModel ? businessModelDefinitions[businessModel] : null;
  }, [businessModel]);

  // Business model checking functions
  const is = (model: BusinessModel): boolean => {
    return businessModel === model;
  };

  const isNot = (model: BusinessModel): boolean => {
    return businessModel !== model;
  };

  const isOneOf = (models: BusinessModel[]): boolean => {
    return businessModel ? models.includes(businessModel) : false;
  };

  // Migration and evolution functions
  const canMigrateTo = (targetModel: BusinessModel): boolean => {
    if (!businessModel) return true; // Can set any model if none set

    const availablePaths = migrationPaths[businessModel] || [];
    return availablePaths.includes(targetModel);
  };

  const getMigrationPaths = (): BusinessModel[] => {
    return businessModel ? migrationPaths[businessModel] || [] : [];
  };

  const getSuggestedUpgrades = (): BusinessModel[] => {
    if (!businessModel) return [];

    const paths = getMigrationPaths();

    // Filter to more complex business models
    return paths.filter(model => {
      const currentComplexity = definition?.complexity || 'basic';
      const targetComplexity = businessModelDefinitions[model].complexity;

      const complexityOrder = ['basic', 'intermediate', 'advanced', 'enterprise'];
      const currentIndex = complexityOrder.indexOf(currentComplexity);
      const targetIndex = complexityOrder.indexOf(targetComplexity);

      return targetIndex > currentIndex;
    });
  };

  // Business model characteristics
  const getCategory = (): string => {
    return definition?.category || 'unknown';
  };

  const getComplexity = (): string => {
    return definition?.complexity || 'basic';
  };

  const getExamples = (): string[] => {
    return definition?.examples || [];
  };

  const getRecommendedModules = (): string[] => {
    return definition?.recommendedModules || [];
  };

  return {
    // Current state
    current: businessModel,
    definition,

    // Checking functions
    is,
    isNot,
    isOneOf,

    // Capability functions
    supports: supportsBusinessModel,
    getRequiredCapabilities: getBusinessModelCapabilities,

    // Migration functions
    canMigrateTo,
    getMigrationPaths,
    getSuggestedUpgrades,

    // Characteristics
    getCategory,
    getComplexity,
    getExamples,
    getRecommendedModules
  };
};