/**
 * CAPABILITY STORE V5 - UI-Only State
 *
 * MIGRACIÓN COMPLETADA:
 * ❌ REMOVED: DB operations (→ TanStack Query hooks)
 * ❌ REMOVED: isLoading (→ TanStack Query manages this)
 * ❌ REMOVED: Business logic (→ featureActivationService)
 * ✅ KEPT: UI state (activeFeatures, blockedFeatures, etc.)
 * ✅ KEPT: Atomic selectors for performance
 * ✅ KEPT: Zustand persistence
 *
 * ARCHITECTURE:
 * - Layer 1: Business Profile (TanStack Query) - Server state
 * - Layer 2: Feature Flags (This store) - Client computed state
 * - Layer 3: Setup UI (setupUIStore) - UI-only state
 *
 * @version 5.0.0
 * @see docs/cross-module/CROSS_MODULE_DATA_ARCHITECTURE.md
 */

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/lib/logging';
import type { FeatureId } from '@/config/FeatureRegistry';
import {
  activateFeatures,
  hasFeature,
  hasAllFeatures,
  isFeatureBlocked as isFeatureBlockedService,
  getActiveModules
} from '@/lib/capabilities/featureActivationService';
import type { BusinessCapabilityId, InfrastructureId } from '@/config/BusinessModelRegistry';

// ============================================
// TYPES
// ============================================

export interface FeatureState {
  /** Features activas (no bloqueadas) */
  activeFeatures: FeatureId[];

  /** Features bloqueadas por validations */
  blockedFeatures: FeatureId[];

  /** Milestones pendientes */
  pendingMilestones: string[];

  /** Milestones completados */
  completedMilestones: string[];

  /** Errores de validación */
  validationErrors: Array<{
    field: string;
    message: string;
    redirectTo: string;
  }>;

  /** Cached active slots (legacy system removed - use Hook System) */
  activeSlots: Array<{ id: string; component: string; priority: number }>;
}

export interface CapabilityStoreState {
  features: FeatureState;

  // Actions
  setActiveFeatures: (features: FeatureId[]) => void;
  recomputeFeatures: (
    capabilities: BusinessCapabilityId[],
    infrastructure: InfrastructureId[]
  ) => void;

  // Computed getters
  hasFeature: (featureId: FeatureId) => boolean;
  hasAllFeatures: (featureIds: FeatureId[]) => boolean;
  isFeatureBlocked: (featureId: FeatureId) => boolean;
  getActiveSlots: () => Array<{ id: string; component: string; priority?: number }>;
  getActiveModules: () => string[];
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_FEATURES: FeatureState = {
  activeFeatures: [],
  blockedFeatures: [],
  pendingMilestones: [],
  completedMilestones: [],
  validationErrors: [],
  activeSlots: []
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useCapabilityStore = create<CapabilityStoreState>()(
  persist(
    (set, get) => ({
      // STATE
      features: DEFAULT_FEATURES,

      // ============================================
      // ACTIONS
      // ============================================

      setActiveFeatures: (features: FeatureId[]) => {
        set((state) => ({
          features: {
            ...state.features,
            activeFeatures: features
          }
        }));

        logger.info('CapabilityStore', '✅ Active features updated', {
          count: features.length
        });
      },

      recomputeFeatures: (
        capabilities: BusinessCapabilityId[],
        infrastructure: InfrastructureId[]
      ) => {
        try {
          logger.info('CapabilityStore', '🔄 Recomputing features...', {
            capabilities: capabilities.length,
            infrastructure: infrastructure.length
          });

          const { activeFeatures } = activateFeatures(capabilities, infrastructure);

          set((state) => ({
            features: {
              ...state.features,
              activeFeatures,
              blockedFeatures: [],
              validationErrors: []
            }
          }));

          logger.info('CapabilityStore', '✅ Features recomputed', {
            activeFeatures: activeFeatures.length
          });
        } catch (error) {
          logger.error('CapabilityStore', '❌ Error recomputing features:', error);
        }
      },

      // ============================================
      // COMPUTED GETTERS
      // ============================================

      hasFeature: (featureId) => {
        const { features } = get();
        return hasFeature(features.activeFeatures, featureId);
      },

      hasAllFeatures: (featureIds) => {
        const { features } = get();
        return hasAllFeatures(features.activeFeatures, featureIds);
      },

      isFeatureBlocked: (featureId) => {
        const { features } = get();
        return isFeatureBlockedService(features.blockedFeatures, featureId);
      },

      getActiveSlots: () => {
        return []; // Legacy system removed - use Hook System instead
      },

      getActiveModules: () => {
        const { features } = get();
        return getActiveModules(features.activeFeatures);
      }
    }),
    {
      name: 'capability-store-v5',
      version: 5,
      partialize: (state) => ({
        features: {
          activeFeatures: state.features.activeFeatures,
          blockedFeatures: state.features.blockedFeatures,
          pendingMilestones: state.features.pendingMilestones,
          completedMilestones: state.features.completedMilestones,
          validationErrors: state.features.validationErrors,
          activeSlots: state.features.activeSlots,
        }
      }),
      migrate: (persistedState: any, version: number) => {
        if (version < 5) {
          logger.info('CapabilityStore', '🔄 Migrating to v5 - resetting data');
          return {
            features: DEFAULT_FEATURES
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => {
        logger.info('CapabilityStore', '💧 Rehydration starting...');

        return (state, error) => {
          if (error) {
            logger.error('CapabilityStore', '❌ Hydration error:', error);
            return;
          }

          if (!state) {
            logger.warn('CapabilityStore', '⚠️ No state to rehydrate');
            return;
          }

          logger.info('CapabilityStore', '✅ Hydration complete', {
            features: state.features?.activeFeatures?.length || 0
          });
        };
      }
    }
  )
);

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook principal para usar capabilities (v5)
 *
 * ✅ BEST PRACTICE: Usa atomic selectors en vez de este hook para mejor performance
 *
 * @example
 * // ❌ BAD - Re-render on any change
 * const { activeFeatures } = useCapabilities();
 *
 * // ✅ GOOD - Re-render only when activeFeatures changes
 * const activeFeatures = useActiveFeatures();
 */
export const useCapabilities = () => {
  const store = useCapabilityStore();

  return React.useMemo(() => ({
    // State
    activeFeatures: store.features.activeFeatures,
    blockedFeatures: store.features.blockedFeatures,
    pendingMilestones: store.features.pendingMilestones,
    completedMilestones: store.features.completedMilestones,
    validationErrors: store.features.validationErrors,

    // Computed
    visibleModules: store.getActiveModules(),
    activeSlots: store.features.activeSlots,

    // Actions
    setActiveFeatures: store.setActiveFeatures,
    recomputeFeatures: store.recomputeFeatures,

    // Getters
    hasFeature: store.hasFeature,
    hasAllFeatures: store.hasAllFeatures,
    isFeatureBlocked: store.isFeatureBlocked,

    // Backward compatibility aliases
    hasCapability: store.hasFeature,
    hasAllCapabilities: store.hasAllFeatures,
    activeCapabilities: store.features.activeFeatures
  }), [
    store.features.activeFeatures,
    store.features.blockedFeatures,
    store.features.pendingMilestones,
    store.features.completedMilestones,
    store.features.validationErrors,
    store.features.activeSlots,
  ]);
};

// ============================================
// ATOMIC SELECTORS (RECOMMENDED)
// ============================================

/**
 * Hook para obtener features activas (atomic selector)
 *
 * ✅ RECOMMENDED: Use this instead of useCapabilities()
 */
export const useActiveFeatures = () =>
  useCapabilityStore(state => state.features.activeFeatures);

export const usePendingMilestones = () =>
  useCapabilityStore(state => state.features.pendingMilestones);

export const useBlockedFeatures = () =>
  useCapabilityStore(state => state.features.blockedFeatures);

export const useValidationErrors = () =>
  useCapabilityStore(state => state.features.validationErrors);

/**
 * Hook para verificar una feature específica (atomic selector)
 */
export const useFeature = (featureId: FeatureId) => {
  const hasFeature = useCapabilityStore(state => state.hasFeature);
  return hasFeature(featureId);
};

/**
 * Hook para verificar acceso a un módulo (atomic selector)
 */
export const useModuleAccess = (moduleId: string) => {
  const activeModules = useCapabilityStore(state => state.getActiveModules());
  return activeModules.includes(moduleId);
};

// ============================================
// COMPARISON: V4 vs V5
// ============================================

/**
 * MIGRACIÓN DE V4 A V5:
 *
 * V4 (Old - 968 líneas):
 * ❌ profile: UserProfile (→ useBusinessProfile de TanStack Query)
 * ❌ isLoading: boolean (→ useBusinessProfile().isLoading)
 * ❌ loadFromDB() (→ useBusinessProfile())
 * ❌ saveToDB() (→ useSaveProfile())
 * ❌ initializeProfile() (→ useInitializeProfile())
 * ❌ toggleCapability() (→ useToggleCapability())
 * ❌ completeSetup() (→ useCompleteSetup())
 * ❌ dismissWelcome() (→ useDismissWelcome())
 * ❌ resetProfile() (→ useResetProfile())
 * ❌ Business logic in store (→ featureActivationService)
 *
 * V5 (New - ~250 líneas):
 * ✅ features: FeatureState (UI state only)
 * ✅ setActiveFeatures() (simple setter)
 * ✅ recomputeFeatures() (delegates to service)
 * ✅ hasFeature() (delegates to service)
 * ✅ hasAllFeatures() (delegates to service)
 * ✅ getActiveModules() (delegates to service)
 * ✅ Atomic selectors (performance)
 * ✅ Zustand persistence (only features)
 *
 * BENEFITS:
 * - 71% size reduction (968 → 250 lines)
 * - Clear separation of concerns
 * - Better performance (atomic selectors)
 * - Easier testing (pure functions in service)
 * - Consistent with salesStore and shiftStore patterns
 */

// ============================================
// RE-EXPORTS (Temporary during migration)
// ============================================

export type { UserProfile } from './capabilityStore.v4.old';
