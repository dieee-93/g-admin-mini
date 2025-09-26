/**
 * useBusinessCapabilities Hook - G-Admin v2.1
 * BUSINESS CAPABILITY SYSTEM: Combines original dependency logic with flexible feature activation
 *
 * ENHANCED FEATURES:
 * - Original business model accuracy with comprehensive definitions
 * - Flexible feature activation with optional/required flags
 * - Universal shared dependencies with smart resolution
 * - Addresses optional features concern (restaurant without online menu)
 */

import { useMemo, useCallback } from 'react';
import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore';
import type { BusinessCapability } from '../types/BusinessCapabilities';
import type { BusinessModel } from '../types/BusinessModels';
import { businessModelCapabilities } from '../types/BusinessCapabilities';
import type { BusinessCapabilities } from '@/pages/setup/steps/business-setup/business-model/config/businessCapabilities';
import {
  calculateOperationalTier,
  getEnabledFeatures,
  getRelevantTutorials
} from '@/pages/setup/steps/business-setup/business-model/config/businessCapabilities';
import {
  resolveBusinessCapabilities,
  shouldShowBusinessModule,
  getBusinessModuleFeatures,
  BUSINESS_MODULE_CONFIGURATIONS
} from '../businessCapabilitySystem';

export interface UseCapabilitiesReturn {
  // Current state
  businessModel: BusinessModel | null;
  activeCapabilities: BusinessCapability[];
  resolvedCapabilities: BusinessCapability[];
  enabledModules: string[];

  // Computed business logic
  enabledFeatures: string[];
  operationalTier: string;
  relevantTutorials: string[];

  // BUSINESS: Enhanced module features
  getModuleFeatures: (moduleId: string) => {
    required: string[];
    optional: string[];
    unavailable: string[];
  };

  // Capability checking functions
  hasCapability: (capability: BusinessCapability) => boolean;
  hasAllCapabilities: (capabilities: BusinessCapability[]) => boolean;
  hasAnyCapability: (capabilities: BusinessCapability[]) => boolean;
  isCapabilityLoaded: (capability: BusinessCapability) => boolean;

  // Lazy loading functions (for CapabilityGate compatibility)
  preloadCapability: (capability: BusinessCapability) => Promise<void>;
  cacheStats?: { hitRate: number };

  // Module checking functions
  hasModule: (moduleId: string) => boolean;

  // Business model functions
  supportsBusinessModel: (model: BusinessModel) => boolean;
  getBusinessModelCapabilities: (model: BusinessModel) => BusinessCapability[];

  // Store actions
  setCapability: (capability: keyof BusinessCapabilities, value: boolean) => void;

  // Computed properties
  isSetupComplete: boolean;

  // Auto-resolution debug info
  autoResolvedFeatures: BusinessCapability[];
}

/**
 * BUSINESS CAPABILITY hook - combines best of both systems
 */
export const useCapabilities = (): UseCapabilitiesReturn => {
  const store = useBusinessCapabilities();

  // ✅ Get base capabilities from store (same as before)
  const activeCapabilities: BusinessCapability[] = useMemo(() => {
    if (!store.profile?.capabilities) return ['system_settings'];

    const capabilities: BusinessCapability[] = ['system_settings'];

    Object.entries(store.profile.capabilities).forEach(([key, isEnabled]) => {
      if (isEnabled) {
        capabilities.push(key as BusinessCapability);
      }
    });

    return [...new Set(capabilities)];
  }, [store.profile?.capabilities]);

  // ✅ BUSINESS: Resolve capabilities using enhanced system
  const resolvedCapabilities: BusinessCapability[] = useMemo(() => {
    return resolveBusinessCapabilities(activeCapabilities);
  }, [activeCapabilities]);

  // ✅ Auto-resolved features for debugging
  const autoResolvedFeatures: BusinessCapability[] = useMemo(() => {
    return resolvedCapabilities.filter(cap => !activeCapabilities.includes(cap));
  }, [resolvedCapabilities, activeCapabilities]);

  // ✅ Business logic computed (maintained from original)
  const enabledFeatures = useMemo(() => {
    if (!store.profile?.capabilities) return [];
    return getEnabledFeatures(store.profile.capabilities);
  }, [store.profile?.capabilities]);

  const operationalTier = useMemo(() => {
    if (!store.profile?.capabilities) return 'Sin Configurar';
    return calculateOperationalTier(store.profile.capabilities);
  }, [store.profile?.capabilities]);

  const relevantTutorials = useMemo(() => {
    if (!store.profile?.capabilities) return ['basics'];
    return getRelevantTutorials(store.profile.capabilities);
  }, [store.profile?.capabilities]);

  // Business model detection (maintained from original)
  const businessModel: BusinessModel | null = useMemo(() => {
    if (!store.profile?.capabilities) return null;

    const profile = store.profile.capabilities;

    // Check for specific business models
    if (profile.sells_products_for_onsite_consumption && profile.table_management) return 'restaurant';
    if (profile.has_online_store && profile.sells_products) return 'ecommerce';
    if (profile.is_b2b_focused) return 'b2b';
    if (profile.manages_subscriptions) return 'subscription';
    if (profile.manages_rentals) return 'rental';
    if (profile.manages_events) return 'events';
    if (profile.sells_services_by_class && profile.manages_memberships) return 'fitness';
    if (profile.sells_services_by_class) return 'education';
    if (profile.sells_services_by_appointment) return 'services';
    if (profile.sells_products) return 'retail';

    return 'custom';
  }, [store.profile?.capabilities]);

  // ✅ BUSINESS: Get enabled modules using business capability logic
  const enabledModules = useMemo(() => {
    const allModules = Object.keys(BUSINESS_MODULE_CONFIGURATIONS);

    return allModules.filter(moduleId => {
      return shouldShowBusinessModule(moduleId, activeCapabilities);
    });
  }, [activeCapabilities]);

  // ✅ BUSINESS: Enhanced module features function
  const getModuleFeatures = useCallback((moduleId: string) => {
    return getBusinessModuleFeatures(moduleId, activeCapabilities);
  }, [activeCapabilities]);

  // ✅ Capability checking functions (now use resolved capabilities)
  const hasCapability = useCallback((capability: BusinessCapability): boolean => {
    return resolvedCapabilities.includes(capability);
  }, [resolvedCapabilities]);

  const hasAllCapabilities = useCallback((capabilities: BusinessCapability[]): boolean => {
    return capabilities.every(cap => hasCapability(cap));
  }, [hasCapability]);

  const hasAnyCapability = useCallback((capabilities: BusinessCapability[]): boolean => {
    return capabilities.some(cap => hasCapability(cap));
  }, [hasCapability]);

  // Check if capability is loaded/available
  const isCapabilityLoaded = useCallback((capability: BusinessCapability): boolean => {
    return hasCapability(capability);
  }, [hasCapability]);

  // Module checking functions
  const hasModule = (moduleId: string): boolean => {
    return enabledModules.includes(moduleId);
  };

  // Business model functions
  const supportsBusinessModel = (model: BusinessModel): boolean => {
    const requiredCapabilities = businessModelCapabilities[model] || [];
    return hasAllCapabilities(requiredCapabilities);
  };

  const getBusinessModelCapabilities = (model: BusinessModel): BusinessCapability[] => {
    return businessModelCapabilities[model] || [];
  };

  // Lazy loading functions (simplified for compatibility)
  const preloadCapability = useCallback(async (capability: BusinessCapability): Promise<void> => {
    return Promise.resolve();
  }, []);

  // Simple cache stats (for compatibility)
  const cacheStats = useMemo(() => ({ hitRate: 1.0 }), []);

  return {
    // Current state
    businessModel,
    activeCapabilities,
    resolvedCapabilities,
    enabledModules,

    // Computed business logic
    enabledFeatures,
    operationalTier,
    relevantTutorials,

    // BUSINESS: Enhanced module features
    getModuleFeatures,

    // Capability checking
    hasCapability,
    hasAllCapabilities,
    hasAnyCapability,
    isCapabilityLoaded,

    // Lazy loading (for compatibility)
    preloadCapability,
    cacheStats,

    // Module checking
    hasModule,

    // Business model functions
    supportsBusinessModel,
    getBusinessModelCapabilities,

    // Store actions
    setCapability: store.setCapability,

    // Computed properties
    isSetupComplete: store.profile?.setupCompleted ?? false,

    // Auto-resolution debug info
    autoResolvedFeatures,
  };
};

/**
 * Hook simplificado para verificar una sola capability
 */
export function useCapability(capability: BusinessCapability): boolean {
  const { hasCapability } = useCapabilities();
  return hasCapability(capability);
}

/**
 * Hook para obtener mapa de capabilities con sus estados
 */
export function useCapabilityMap(capabilities: BusinessCapability[]): Record<BusinessCapability, boolean> {
  const { hasCapability } = useCapabilities();

  return useMemo(() => {
    const map: Record<string, boolean> = {};
    capabilities.forEach(cap => {
      map[cap] = hasCapability(cap);
    });
    return map as Record<BusinessCapability, boolean>;
  }, [capabilities, hasCapability]);
}

/**
 * Hook para obtener el modelo de negocio actual
 */
export function useBusinessModel() {
  const { businessModel, supportsBusinessModel, getBusinessModelCapabilities } = useCapabilities();
  return {
    currentModel: businessModel,
    supportsModel: supportsBusinessModel,
    getModelCapabilities: getBusinessModelCapabilities
  };
}

/**
 * Hook para verificar acceso a módulos
 */
export function useModuleAccess(moduleId: string) {
  const { hasModule, getModuleFeatures } = useCapabilities();
  return {
    hasAccess: hasModule(moduleId),
    features: getModuleFeatures(moduleId)
  };
}