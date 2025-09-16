/**
 * useCapabilities Hook for G-Admin v3.0
 * Provides access to business capabilities and capability checking
 * Integrates with existing businessCapabilitiesStore
 * Enhanced with caching and lazy loading (2024 performance optimizations)
 */

import { useMemo, useCallback, useEffect } from 'react';
import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore';
import type { BusinessCapability } from '../types/BusinessCapabilities';
import type { BusinessModel } from '../types/BusinessModels';
import { businessModelCapabilities, moduleCapabilities } from '../types/BusinessCapabilities';
import { getCapabilityCache } from '../cache/CapabilityCache';
import { getLazyCapabilityLoader, registerCommonLazyCapabilities } from '../lazy/LazyCapabilityLoader';

export interface UseCapabilitiesReturn {
  // Current state
  businessModel: BusinessModel | null;
  activeCapabilities: BusinessCapability[];
  enabledModules: string[];

  // Capability checking functions (cached)
  hasCapability: (capability: BusinessCapability) => boolean;
  hasAllCapabilities: (capabilities: BusinessCapability[]) => boolean;
  hasAnyCapability: (capabilities: BusinessCapability[]) => boolean;

  // Module checking functions
  hasModule: (moduleId: string) => boolean;
  getRequiredModules: (capability: BusinessCapability) => string[];

  // Business model functions
  supportsBusinessModel: (model: BusinessModel) => boolean;
  getBusinessModelCapabilities: (model: BusinessModel) => BusinessCapability[];

  // Store actions (for capability management)
  setCapability: (capability: string, value: boolean) => void;

  // Computed properties
  isSetupComplete: boolean;
  operationalTier: string;

  // Performance & Lazy Loading (NEW)
  cacheStats: any;
  preloadCapability: (capability: BusinessCapability) => Promise<void>;
  isCapabilityLoaded: (capability: BusinessCapability) => boolean;
  isCapabilityLoading: (capability: BusinessCapability) => boolean;
}

/**
 * Main capabilities hook
 * Provides comprehensive access to business capabilities system
 * Enhanced with caching and lazy loading
 */
export const useCapabilities = (): UseCapabilitiesReturn => {
  const store = useBusinessCapabilities();
  const cache = getCapabilityCache();
  const lazyLoader = getLazyCapabilityLoader();

  // Initialize lazy loading on first render
  useEffect(() => {
    registerCommonLazyCapabilities();
  }, []);

  // Map store capabilities to new capability types
  const activeCapabilities: BusinessCapability[] = useMemo(() => {
    if (!store.profile?.capabilities) return ['customer_management', 'system_settings'];

    const capabilities: BusinessCapability[] = ['customer_management', 'dashboard_analytics', 'system_settings'];
    const profile = store.profile.capabilities;

    // Map existing capabilities to new system
    if (profile.sells_products) capabilities.push('sells_products', 'product_management', 'inventory_tracking');
    if (profile.sells_products_for_onsite_consumption) capabilities.push('sells_products_for_onsite_consumption', 'pos_system', 'table_management');
    if (profile.sells_products_for_pickup) capabilities.push('sells_products_for_pickup');
    if (profile.sells_products_with_delivery) capabilities.push('sells_products_with_delivery', 'delivery_zones');
    if (profile.sells_digital_products) capabilities.push('sells_digital_products');

    if (profile.sells_services) capabilities.push('sells_services', 'staff_management');
    if (profile.sells_services_by_appointment) capabilities.push('sells_services_by_appointment', 'appointment_booking', 'calendar_integration');
    if (profile.sells_services_by_class) capabilities.push('sells_services_by_class', 'class_scheduling');
    if (profile.sells_space_by_reservation) capabilities.push('sells_space_by_reservation', 'space_booking');

    if (profile.manages_events) capabilities.push('manages_events', 'event_management');
    if (profile.hosts_private_events) capabilities.push('hosts_private_events');
    if (profile.manages_offsite_catering) capabilities.push('manages_offsite_catering');

    if (profile.manages_recurrence) capabilities.push('manages_recurrence', 'recurring_billing');
    if (profile.manages_rentals) capabilities.push('manages_rentals', 'asset_management');
    if (profile.manages_memberships) capabilities.push('manages_memberships');
    if (profile.manages_subscriptions) capabilities.push('manages_subscriptions');

    if (profile.has_online_store) capabilities.push('has_online_store');
    if (profile.is_b2b_focused) capabilities.push('is_b2b_focused', 'supplier_management');

    // Always include fiscal compliance
    capabilities.push('fiscal_compliance');

    // Add payment gateway if any selling capability
    if (profile.sells_products || profile.sells_services) {
      capabilities.push('payment_gateway');
    }

    // Add staff scheduling if needed
    if (profile.sells_services_by_appointment || profile.sells_services_by_class) {
      capabilities.push('staff_scheduling');
    }

    return [...new Set(capabilities)]; // Remove duplicates
  }, [store.profile?.capabilities]);

  // Determine business model based on capabilities
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

  // Get enabled modules from store
  const enabledModules = useMemo(() => {
    return store.dashboardModules || [];
  }, [store.dashboardModules]);

  // Enhanced capability checking functions with caching
  const hasCapability = useCallback((capability: BusinessCapability): boolean => {
    const cacheKey = `single:${capability}`;

    // Check cache first
    const cachedResult = cache.get<boolean>(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Compute result
    const result = activeCapabilities.includes(capability);

    // Cache result with 5 minute TTL
    cache.set(cacheKey, result, 5 * 60 * 1000);

    // Trigger lazy loading if needed
    if (result && !lazyLoader.isCapabilityLoaded(capability)) {
      lazyLoader.preloadCapability(capability);
    }

    return result;
  }, [activeCapabilities, cache, lazyLoader]);

  const hasAllCapabilities = useCallback((capabilities: BusinessCapability[]): boolean => {
    const cacheKey = `combo:${capabilities.sort().join(',')}:all`;

    // Check cache first
    const cachedResult = cache.get<boolean>(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Compute result
    const result = capabilities.every(cap => hasCapability(cap));

    // Cache result
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return result;
  }, [hasCapability, cache]);

  const hasAnyCapability = useCallback((capabilities: BusinessCapability[]): boolean => {
    const cacheKey = `combo:${capabilities.sort().join(',')}:any`;

    // Check cache first
    const cachedResult = cache.get<boolean>(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Compute result
    const result = capabilities.some(cap => hasCapability(cap));

    // Cache result
    cache.set(cacheKey, result, 5 * 60 * 1000);

    return result;
  }, [hasCapability, cache]);

  // Module checking functions
  const hasModule = (moduleId: string): boolean => {
    return enabledModules.includes(moduleId);
  };

  const getRequiredModules = (capability: BusinessCapability): string[] => {
    // Find modules that provide this capability
    const providingModules: string[] = [];

    Object.entries(moduleCapabilities).forEach(([moduleId, config]) => {
      if (config.provides.includes(capability)) {
        providingModules.push(moduleId);
      }
    });

    return providingModules;
  };

  // Business model functions
  const supportsBusinessModel = (model: BusinessModel): boolean => {
    const requiredCapabilities = businessModelCapabilities[model] || [];
    return hasAllCapabilities(requiredCapabilities);
  };

  const getBusinessModelCapabilities = (model: BusinessModel): BusinessCapability[] => {
    return businessModelCapabilities[model] || [];
  };

  // Warm cache with current capabilities
  useEffect(() => {
    if (activeCapabilities.length > 0) {
      // Create capability map for warming
      const capabilityMap: Record<string, boolean> = {};
      activeCapabilities.forEach(cap => {
        capabilityMap[cap] = true;
      });

      cache.warm(activeCapabilities, capabilityMap);
    }
  }, [activeCapabilities, cache]);

  // Lazy loading functions
  const preloadCapability = useCallback(async (capability: BusinessCapability): Promise<void> => {
    return lazyLoader.preloadCapability(capability);
  }, [lazyLoader]);

  const isCapabilityLoaded = useCallback((capability: BusinessCapability): boolean => {
    return lazyLoader.isCapabilityLoaded(capability);
  }, [lazyLoader]);

  const isCapabilityLoading = useCallback((capability: BusinessCapability): boolean => {
    return lazyLoader.isCapabilityLoading(capability);
  }, [lazyLoader]);

  return {
    // Current state
    businessModel,
    activeCapabilities,
    enabledModules,

    // Capability checking (cached)
    hasCapability,
    hasAllCapabilities,
    hasAnyCapability,

    // Module checking
    hasModule,
    getRequiredModules,

    // Business model functions
    supportsBusinessModel,
    getBusinessModelCapabilities,

    // Store actions
    setCapability: store.setCapability,

    // Computed properties
    isSetupComplete: store.profile?.setupCompleted ?? false,
    operationalTier: store.getOperationalTier(),

    // Performance & Lazy Loading (NEW)
    cacheStats: cache.getStats(),
    preloadCapability,
    isCapabilityLoaded,
    isCapabilityLoading
  };
};

/**
 * Hook for checking specific capabilities
 * Useful for simple conditional rendering
 */
export const useCapability = (capability: BusinessCapability): boolean => {
  const { hasCapability } = useCapabilities();
  return hasCapability(capability);
};

/**
 * Hook for checking multiple capabilities
 * Returns an object with the status of each capability
 */
export const useCapabilityMap = (capabilities: BusinessCapability[]): Record<BusinessCapability, boolean> => {
  const { hasCapability } = useCapabilities();

  return useMemo(() => {
    const map: Record<string, boolean> = {};
    capabilities.forEach(cap => {
      map[cap] = hasCapability(cap);
    });
    return map as Record<BusinessCapability, boolean>;
  }, [capabilities, hasCapability]);
};

/**
 * Hook for business model checking
 */
export const useBusinessModel = () => {
  const { businessModel, supportsBusinessModel, getBusinessModelCapabilities } = useCapabilities();

  return {
    currentModel: businessModel,
    supports: supportsBusinessModel,
    getCapabilities: getBusinessModelCapabilities,
    is: (model: BusinessModel) => businessModel === model
  };
};

/**
 * Hook for module access checking
 */
export const useModuleAccess = () => {
  const { hasModule, enabledModules, getRequiredModules } = useCapabilities();

  return {
    hasModule,
    enabledModules,
    getRequiredModules,
    isModuleEnabled: hasModule
  };
};