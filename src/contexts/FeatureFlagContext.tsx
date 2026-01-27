/**
 * FEATURE FLAG CONTEXT - React Context Provider
 *
 * Layer 2 of capabilityStore migration:
 * - Feature flag computation and queries
 * - Based on NavigationContext pattern (split contexts, memoization)
 * - Consumes Layer 1 (useBusinessProfile)
 *
 * Migration from: capabilityStore.ts (feature activation logic)
 * Pattern: Global configuration → React Context (project convention)
 *
 * Created: 2025-01-14
 */

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';
import type { FeatureId } from '@/config/FeatureRegistry';
import { useBusinessProfile } from '@/lib/business-profile/hooks/useBusinessProfile';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

interface FeatureFlagContextValue {
  // Computed state
  activeFeatures: FeatureId[];
  activeModules: string[];

  // Query functions
  hasFeature: (featureId: FeatureId) => boolean;
  hasAllFeatures: (featureIds: FeatureId[]) => boolean;
  isModuleActive: (moduleId: string) => boolean;

  // Loading state (from profile query)
  isLoading: boolean;
}

// ============================================
// CONTEXT
// ============================================

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);
FeatureFlagContext.displayName = 'FeatureFlagContext';

// ============================================
// PROVIDER
// ============================================

interface FeatureFlagProviderProps {
  children: React.ReactNode;
}

/**
 * Feature Flag Provider
 * 
 * Follows NavigationContext pattern:
 * - Split contexts for performance
 * - Memoization of all values
 * - Computed from profile (no local state)
 * 
 * @example
 * <FeatureFlagProvider>
 *   <App />
 * </FeatureFlagProvider>
 */
export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const { profile, isLoading } = useBusinessProfile();

  // ============================================
  // COMPUTED: Active Features
  // ============================================

  const activeFeatures = useMemo(() => {
    console.log('🔍 [LAYER 3: FeatureFlagContext] Computing activeFeatures...', {
      hasProfile: !!profile,
      capabilities: profile?.selectedCapabilities,
      infrastructure: profile?.selectedInfrastructure
    });

    if (!profile) {
      console.log('⚠️ [LAYER 3: FeatureFlagContext] No profile - returning empty features');
      logger.debug('FeatureFlagContext', '⏳ No profile yet, no features active');
      return [];
    }

    try {
      const { activeFeatures: features } = FeatureActivationEngine.activateFeatures(
        profile.selectedCapabilities || [],
        profile.selectedInfrastructure || []
      );

      console.log('✅ [LAYER 3: FeatureFlagContext] Features computed:', {
        capabilities: profile.selectedCapabilities?.length || 0,
        infrastructure: profile.selectedInfrastructure?.length || 0,
        featuresCount: features.length,
        features: features
      });

      logger.debug('FeatureFlagContext', '✅ Features computed', {
        capabilities: profile.selectedCapabilities?.length || 0,
        infrastructure: profile.selectedInfrastructure?.length || 0,
        activeFeatures: features.length,
      });

      return features;
    } catch (error) {
      console.error('❌ [LAYER 3: FeatureFlagContext] Error computing features:', error);
      logger.error('FeatureFlagContext', '❌ Error computing features', error);
      return [];
    }
  }, [
    // ✅ Only recompute when capabilities/infrastructure change
    profile?.selectedCapabilities,
    profile?.selectedInfrastructure,
  ]);

  // ============================================
  // COMPUTED: Active Modules
  // ============================================

  const activeModules = useMemo(() => {
    const modules = getModulesForActiveFeatures(activeFeatures);

    console.log('✅ [LAYER 3: FeatureFlagContext] Active modules computed:', {
      featureCount: activeFeatures.length,
      moduleCount: modules.length,
      modules: modules
    });

    logger.debug('FeatureFlagContext', '📦 Active modules computed', {
      featureCount: activeFeatures.length,
      moduleCount: modules.length,
    });

    return modules;
  }, [activeFeatures]);

  // ============================================
  // QUERY FUNCTIONS (Memoized)
  // ============================================

  const hasFeature = useCallback(
    (featureId: FeatureId): boolean => {
      return activeFeatures.includes(featureId);
    },
    [activeFeatures]
  );

  const hasAllFeatures = useCallback(
    (featureIds: FeatureId[]): boolean => {
      return featureIds.every(id => activeFeatures.includes(id));
    },
    [activeFeatures]
  );

  const isModuleActive = useCallback(
    (moduleId: string): boolean => {
      return activeModules.includes(moduleId);
    },
    [activeModules]
  );

  // ============================================
  // CONTEXT VALUE (Memoized)
  // ============================================

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      activeFeatures,
      activeModules,
      hasFeature,
      hasAllFeatures,
      isModuleActive,
      isLoading,
    }),
    [activeFeatures, activeModules, hasFeature, hasAllFeatures, isModuleActive, isLoading]
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook principal para feature flags
 * 
 * @throws Error if used outside FeatureFlagProvider
 * 
 * @example
 * const { hasFeature, activeFeatures } = useFeatureFlags();
 * 
 * if (hasFeature('sales_payment_processing')) {
 *   // Show payment UI
 * }
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }

  return context;
}

/**
 * Hook optimizado para verificar una feature específica
 * 
 * Performance: Solo re-renderiza si el resultado cambia (true/false)
 * 
 * @example
 * const canProcessPayments = useHasFeature('sales_payment_processing');
 */
export function useHasFeature(featureId: FeatureId): boolean {
  const { hasFeature } = useFeatureFlags();
  return hasFeature(featureId);
}

/**
 * Hook optimizado para verificar múltiples features
 * 
 * @example
 * const canManageProducts = useHasAllFeatures([
 *   'products_catalog_management',
 *   'products_pricing_tiers',
 * ]);
 */
export function useHasAllFeatures(featureIds: FeatureId[]): boolean {
  const { hasAllFeatures } = useFeatureFlags();
  return hasAllFeatures(featureIds);
}

/**
 * Hook para verificar si un módulo está activo
 * 
 * @example
 * const isSalesActive = useIsModuleActive('sales');
 */
export function useIsModuleActive(moduleId: string): boolean {
  const { isModuleActive } = useFeatureFlags();
  return isModuleActive(moduleId);
}

/**
 * Hook para obtener lista de features activas
 * 
 * @example
 * const features = useActiveFeatures();
 * console.log('Active features:', features.length);
 */
export function useActiveFeatures(): FeatureId[] {
  const { activeFeatures } = useFeatureFlags();
  return activeFeatures;
}

/**
 * Hook para obtener lista de módulos activos
 * 
 * @example
 * const modules = useActiveModules();
 * console.log('Active modules:', modules);
 */
export function useActiveModules(): string[] {
  const { activeModules } = useFeatureFlags();
  return activeModules;
}
