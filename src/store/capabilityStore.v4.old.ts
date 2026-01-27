/**
 * UNIFIED CAPABILITY STORE - G-Admin Mini v4.0
 *
 * NUEVA ARQUITECTURA DE 3 CAPAS:
 * - Layer 1: USER CHOICES (lo que el usuario elige en setup)
 * - Layer 2: SYSTEM FEATURES (lo que la app activa automáticamente)
 * - Layer 3: REQUIREMENTS & PROGRESSION (lo que el usuario debe hacer)
 *
 * Basado en:
 * - Feature Flags patterns (LaunchDarkly, ConfigCat)
 * - Progressive Disclosure (NN/G)
 * - Gamification patterns (Yu-kai Chou)
 */

import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import eventBus from '@/lib/events/EventBus';

// NEW SYSTEM - Layer 1: User Choices
import type {
  BusinessCapabilityId,
  InfrastructureId
} from '@/config/BusinessModelRegistry';

// NEW SYSTEM - Layer 2: Features
import type { FeatureId } from '@/config/FeatureRegistry';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';

// NEW SYSTEM - Feature Engine
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';

// Database services
import {
  loadProfileFromDB,
  saveProfileToDB,
  updateCompletedMilestonesInDB,
  dismissWelcomeInDB
} from '@/lib/business-profile/businessProfileService';

import { logger } from '@/lib/logging';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Compares two arrays by content (not reference)
 * Returns the old array if content is equal to prevent unnecessary re-renders
 */
function getUpdatedArrayIfChanged<T>(oldArray: T[], newArray: T[]): T[] {
  // Quick length check
  if (oldArray.length !== newArray.length) {
    return newArray;
  }

  // Deep equality check (works for primitive arrays)
  const isEqual = oldArray.every((val, idx) => val === newArray[idx]);

  if (isEqual) {
    logger.debug('CapabilityStore', '⚡ Array unchanged, preserving reference to prevent re-renders');
    return oldArray; // PRESERVE OLD REFERENCE
  }

  logger.debug('CapabilityStore', '🔄 Array content changed, returning new reference');
  return newArray;
}

// ============================================
// STATE TYPES
// ============================================

export interface UserProfile {
  // Business identification (from DB row id)
  businessId?: string;

  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  country: string;
  currency: string;

  // NEW: Separate user choices
  selectedCapabilities: BusinessCapabilityId[];
  selectedInfrastructure: InfrastructureId[];

  // Setup status
  setupCompleted: boolean;
  isFirstTimeInDashboard: boolean;
  onboardingStep: number;

  // Optional: Milestones tracking (v4.0)
  completedMilestones?: string[];
}

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

  /** ✅ REFACTOR: activeModules removed - use getActiveModules() getter instead */
  /** Cached computed values (memoized) */
  activeSlots: Array<{ id: string; component: string; priority: number }>;
}

export interface CapabilityStoreState {
  profile: UserProfile | null;
  features: FeatureState;
  isLoading: boolean;

  // Actions
  initializeProfile: (data: Partial<UserProfile>) => void;
  toggleCapability: (capabilityId: BusinessCapabilityId) => void;
  setCapabilities: (capabilities: BusinessCapabilityId[]) => void;
  setInfrastructure: (infraId: InfrastructureId) => void;
  toggleInfrastructure: (infraId: InfrastructureId) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeSetup: () => void;
  dismissWelcome: () => void;
  resetProfile: () => void;

  // Database sync
  loadFromDB: () => Promise<boolean>;
  saveToDB: () => Promise<boolean>;

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

const DEFAULT_PROFILE: UserProfile = {
  businessName: '',
  businessType: '',
  email: '',
  phone: '',
  country: 'Argentina',
  currency: 'ARS',
  selectedCapabilities: [],
  selectedInfrastructure: ['single_location'],
  setupCompleted: false,
  isFirstTimeInDashboard: false,
  onboardingStep: 0
};

const DEFAULT_FEATURES: FeatureState = {
  activeFeatures: [],
  blockedFeatures: [],
  pendingMilestones: [],
  completedMilestones: [],
  validationErrors: [],
  // ✅ REFACTOR: activeModules removed - use getActiveModules() getter
  activeSlots: []
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useCapabilityStore = create<CapabilityStoreState>()(
  persist(
    (set, get) => ({
      // STATE
      profile: null,
      features: DEFAULT_FEATURES,
      isLoading: false,

      // ============================================
      // ACTIONS
      // ============================================

      initializeProfile: (data) => {
        set((state) => {
          const newProfile: UserProfile = {
            ...DEFAULT_PROFILE,
            ...data
          };

          // Activar features según user choices
          try {
            const { activeFeatures } = FeatureActivationEngine.activateFeatures(
              newProfile.selectedCapabilities,
              newProfile.selectedInfrastructure
            );

            logger.info('CapabilityStore', '🚀 Profile initialized:', {
              capabilities: newProfile.selectedCapabilities.length,
              infrastructure: newProfile.selectedInfrastructure.length,
              activeFeatures: activeFeatures.length,
            });

            // ✅ REFACTOR: activeModules calculation removed - use getActiveModules() getter

            return {
              ...state,
              profile: newProfile,
              features: {
                activeFeatures: activeFeatures,
                blockedFeatures: [],
                pendingMilestones: [],
                completedMilestones: [],
                validationErrors: [],
                // activeModules removed - use getActiveModules() getter
                activeSlots: [] // Legacy system removed - use Hook System instead
              }
            };
          } catch (error) {
            logger.error('CapabilityStore', '❌ Error initializing profile:', error);
            return state;
          }
        });
      },

      toggleCapability: (capabilityId) => {
        logger.info('CapabilityStore', '🔄 toggleCapability START', {
          capabilityId,
          currentCapabilities: get().profile?.selectedCapabilities || []
        });

        set((state) => {
          if (!state.profile) {
            logger.warn('CapabilityStore', '⚠️ No profile found, cannot toggle capability');
            return state;
          }

          const currentCapabilities = state.profile.selectedCapabilities;
          const isAdding = !currentCapabilities.includes(capabilityId);
          const rawNewCapabilities = currentCapabilities.includes(capabilityId)
            ? currentCapabilities.filter(id => id !== capabilityId)
            : [...currentCapabilities, capabilityId];

          // 🔧 FIX: Preserve array reference if content unchanged
          const newCapabilities = getUpdatedArrayIfChanged(currentCapabilities, rawNewCapabilities);

          logger.info('CapabilityStore', `${isAdding ? '➕' : '➖'} ${isAdding ? 'Adding' : 'Removing'} capability`, {
            capabilityId,
            oldCount: currentCapabilities.length,
            newCount: newCapabilities.length,
            newCapabilities
          });

          const updatedProfile = {
            ...state.profile,
            selectedCapabilities: newCapabilities
          };

          // Persist to database (async, don't wait)
          // Note: BusinessProfileService already logs success/error
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting capability toggle to DB:', err);
          });

          // Re-activar features
          try {
            const { activeFeatures } = FeatureActivationEngine.activateFeatures(
              newCapabilities,
              updatedProfile.selectedInfrastructure
            );

            logger.info('CapabilityStore', '⚙️ Features reactivated', {
              activeFeatures: activeFeatures.length,
            });

            // Emit event si se agregó una nueva capability
            if (!currentCapabilities.includes(capabilityId)) {
              eventBus.emit('user_choice.capability_selected', {
                capabilityId,
                timestamp: Date.now()
              });
            }

            // ✅ REFACTOR: activeModules calculation removed - use getActiveModules() getter

            logger.info('CapabilityStore', '🔍 DEBUG toggleCapability - features:', {
              capabilityId,
              activeFeatures: activeFeatures.length,
            });

            return {
              ...state,
              profile: updatedProfile,
              features: {
                activeFeatures: activeFeatures,
                blockedFeatures: [],
                pendingMilestones: [],
                completedMilestones: state.features.completedMilestones,
                validationErrors: [],
                // activeModules removed - use getActiveModules() getter
                activeSlots: [] // Legacy system removed - use Hook System instead
              }
            };
          } catch (error) {
            logger.error('CapabilityStore', '❌ Error toggling capability:', error);
            return state;
          }
        });
      },

      setCapabilities: (capabilities) => {
        set((state) => {
          if (!state.profile) return state;

          // 🔧 FIX: Preserve array reference if content unchanged
          const selectedCapabilities = getUpdatedArrayIfChanged(
            state.profile.selectedCapabilities,
            capabilities
          );

          const updatedProfile = {
            ...state.profile,
            selectedCapabilities
          };

          // Persist to database (async, don't wait)
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting capabilities to DB:', err);
          });

          // Re-activar features
          try {
            const { activeFeatures } = FeatureActivationEngine.activateFeatures(
              capabilities,
              updatedProfile.selectedInfrastructure
            );

            logger.info('CapabilityStore', '🎯 Capabilities set:', {
              count: capabilities.length,
              activeFeatures: activeFeatures.length
            });

            // ✅ REFACTOR: activeModules calculation removed - use getActiveModules() getter

            return {
              ...state,
              profile: updatedProfile,
              features: {
                activeFeatures: activeFeatures,
                blockedFeatures: [],
                pendingMilestones: [],
                completedMilestones: state.features.completedMilestones,
                validationErrors: [],
                // activeModules removed - use getActiveModules() getter
                activeSlots: [] // Legacy system removed - use Hook System instead
              }
            };
          } catch (error) {
            logger.error('CapabilityStore', '❌ Error setting capabilities:', error);
            return state;
          }
        });
      },

      setInfrastructure: (infraId) => {
        set((state) => {
          if (!state.profile) return state;

          // 🔧 FIX: Preserve array reference if content unchanged (prevent re-renders)
          const newInfrastructure = [infraId];
          const selectedInfrastructure = getUpdatedArrayIfChanged(
            state.profile.selectedInfrastructure,
            newInfrastructure
          );

          const updatedProfile = {
            ...state.profile,
            selectedInfrastructure
          };

          return {
            ...state,
            profile: updatedProfile
          };
        });
      },

      /**
       * Toggle infrastructure (multi-select)
       * Permite combinar infrastructures (ej: local fijo + móvil)
       */
      toggleInfrastructure: (infraId) => {
        set((state) => {
          if (!state.profile) return state;

          const current = state.profile.selectedInfrastructure;
          const isSelected = current.includes(infraId);

          let newInfrastructure: InfrastructureId[];

          if (isSelected) {
            // Remove
            newInfrastructure = current.filter(id => id !== infraId);
          } else {
            // Add
            newInfrastructure = [...current, infraId];
          }

          // 🔧 FIX: Preserve array reference if content unchanged
          const selectedInfrastructure = getUpdatedArrayIfChanged(
            state.profile.selectedInfrastructure,
            newInfrastructure
          );

          const updatedProfile = {
            ...state.profile,
            selectedInfrastructure
          };

          // Persist to database (async, don't wait)
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting infrastructure toggle to DB:', err);
          });

          // Recompute features with ALL selected infrastructure
          try {
            const { activeFeatures } = FeatureActivationEngine.activateFeatures(
              updatedProfile.selectedCapabilities,
              updatedProfile.selectedInfrastructure
            );

            eventBus.emit('user_choice.infrastructure_toggled', {
              infraId,
              isSelected: !isSelected,
              timestamp: Date.now()
            });

            // ✅ REFACTOR: activeModules calculation removed - use getActiveModules() getter

            return {
              ...state,
              profile: updatedProfile,
              features: {
                activeFeatures: activeFeatures,
                blockedFeatures: [],
                pendingMilestones: [],
                completedMilestones: state.features.completedMilestones,
                validationErrors: [],
                // activeModules removed - use getActiveModules() getter
                activeSlots: []
              }
            };
          } catch (error) {
            logger.error('CapabilityStore', '❌ Error setting infrastructure:', error);
            return state;
          }
        });
      },

      updateProfile: (updates) => {
        set((state) => {
          if (!state.profile) {
            logger.warn('CapabilityStore', '⚠️ No profile found, cannot update');
            return state;
          }

          const updatedProfile = {
            ...state.profile,
            ...updates
          };

          // Persist to database (async, don't wait)
          saveProfileToDB(updatedProfile as any).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting profile update to DB:', err);
          });

          logger.info('CapabilityStore', '✏️ Profile updated:', {
            updates: Object.keys(updates),
            businessName: updatedProfile.businessName,
            email: updatedProfile.email,
            phone: updatedProfile.phone
          });

          return {
            ...state,
            profile: updatedProfile
          };
        });
      },

      completeSetup: () => {
        set((state) => {
          if (!state.profile) return state;

          const updatedProfile = {
            ...state.profile,
            setupCompleted: true,
            isFirstTimeInDashboard: true,
            onboardingStep: 1
          };

          // Persist to database (async, don't wait)
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting setup completion to DB:', err);
          });

          // Emit completion event
          eventBus.emit('setup.completed', {
            profile: updatedProfile,
            activeFeatures: state.features.activeFeatures,
            pendingMilestones: state.features.pendingMilestones,
            timestamp: Date.now()
          });

          logger.info('CapabilityStore', '✅ Setup completed:', {
            capabilities: updatedProfile.selectedCapabilities.length,
            infrastructure: updatedProfile.selectedInfrastructure.length,
            activeFeatures: state.features.activeFeatures.length,
            pendingMilestones: state.features.pendingMilestones.length
          });

          return {
            ...state,
            profile: updatedProfile
          };
        });
      },

      dismissWelcome: () => {
        set((state) => {
          if (!state.profile) return state;

          logger.info('CapabilityStore', '👋 Dismissing welcome screen');

          // Persist to database (async, don't wait)
          dismissWelcomeInDB().catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting welcome dismiss to DB:', err);
          });

          return {
            ...state,
            profile: {
              ...state.profile,
              isFirstTimeInDashboard: false
            }
          };
        });
      },

      resetProfile: () => {
        logger.warn('CapabilityStore', '🗑️ Resetting profile');
        set({
          profile: null,
          features: DEFAULT_FEATURES,
          isLoading: false
        });
      },

      // ============================================
      // DATABASE SYNC
      // ============================================

      loadFromDB: async () => {
        set({ isLoading: true });

        try {
          logger.info('CapabilityStore', '📥 Loading profile from DB...');

          const profileFromDB = await loadProfileFromDB();

          if (profileFromDB) {
            const currentProfile = get().profile;

            // ⚠️ ANTI-OVERWRITE PROTECTION:
            // Si la DB tiene arrays vacíos PERO localStorage tiene datos,
            // significa que el usuario ya activó capabilities en esta sesión
            // → NO sobrescribir con datos vacíos de la DB
            const dbIsEmpty = (
              (!profileFromDB.selectedCapabilities || profileFromDB.selectedCapabilities.length === 0) &&
              (!profileFromDB.selectedInfrastructure || profileFromDB.selectedInfrastructure.length === 0)
            );

            const localStorageHasData = currentProfile && (
              (currentProfile.selectedCapabilities && currentProfile.selectedCapabilities.length > 0) ||
              (currentProfile.selectedInfrastructure && currentProfile.selectedInfrastructure.length > 0)
            );

            if (dbIsEmpty && localStorageHasData) {
              logger.warn('CapabilityStore', '⚠️ DB is empty but localStorage has data - NOT overwriting!', {
                dbProfile: profileFromDB,
                currentProfile: currentProfile
              });

              // Guardar el perfil actual (de localStorage) a la DB
              get().saveToDB();

              set({ isLoading: false });
              return false; // No cargamos desde DB
            }

            // Si la DB tiene datos, cargar normalmente
            get().initializeProfile(profileFromDB as any);

            logger.info('CapabilityStore', '✅ Profile loaded from DB');
            set({ isLoading: false });
            return true;
          } else {
            logger.info('CapabilityStore', '📭 No profile in DB');
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          logger.error('CapabilityStore', '❌ Error loading from DB:', error);
          set({ isLoading: false });
          return false;
        }
      },

      saveToDB: async () => {
        const { profile } = get();

        if (!profile) {
          logger.warn('CapabilityStore', 'No profile to save');
          return false;
        }

        try {
          logger.info('CapabilityStore', '💾 Saving profile to DB...');
          await saveProfileToDB(profile as any);
          logger.info('CapabilityStore', '✅ Profile saved to DB');
          return true;
        } catch (error) {
          logger.error('CapabilityStore', '❌ Error saving to DB:', error);
          return false;
        }
      },

      // ============================================
      // COMPUTED GETTERS
      // ============================================

      hasFeature: (featureId) => {
        const { features } = get();
        return features.activeFeatures.includes(featureId);
      },

      hasAllFeatures: (featureIds) => {
        const { features } = get();
        return featureIds.every(id => features.activeFeatures.includes(id));
      },

      isFeatureBlocked: (featureId) => {
        const { features } = get();
        return features.blockedFeatures.includes(featureId);
      },

      getActiveSlots: () => {
        const { features } = get();
        return []; // Legacy system removed - use Hook System instead
      },

      getActiveModules: () => {
        const { features } = get();
        return getModulesForActiveFeatures(features.activeFeatures);
      }
    }),
    {
      name: 'capability-store-v4',
      version: 4,
      // ✅ ZUSTAND V5 BEST PRACTICE: Use partialize to specify what to persist
      // This prevents unnecessary data from being saved and ensures clean localStorage
      partialize: (state) => ({
        profile: state.profile,
        features: {
          activeFeatures: state.features.activeFeatures,
          // activeModules removed - computed via getActiveModules()
          blockedFeatures: state.features.blockedFeatures,
          pendingMilestones: state.features.pendingMilestones,
          completedMilestones: state.features.completedMilestones,
          validationErrors: state.features.validationErrors,
          activeSlots: state.features.activeSlots,
        }
        // isLoading is NOT persisted (transient state only)
      }),
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          logger.info('CapabilityStore', '🔄 Migrating to v4 - resetting data');
          return {
            profile: null,
            features: DEFAULT_FEATURES,
            isLoading: false
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => {
        logger.info('CapabilityStore', '💧 Rehydration starting...');

        // ✅ ZUSTAND V5 BEST PRACTICE: Return function for post-hydration logic
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
            hasProfile: !!state.profile,
            capabilities: state.profile?.selectedCapabilities?.length || 0,
            features: state.features?.activeFeatures?.length || 0
          });
        };
      }
    }
  )
);

// ============================================
// ============================================================================
// 4. HYDRATION TRACKING
// ============================================================================
// ✅ ZUSTAND V5 OFFICIAL PATTERN from docs:
// 1. Register onFinishHydration FIRST (at module level, before hydration starts)
// 2. Use hasHydrated() as fallback for synchronous checks
// 3. Both patterns work together (see useHydration hook in docs)
// Docs: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md
// ============================================================================

logger.debug('CapabilityStore', 'capabilityStore.ts module is loading');
logger.debug('CapabilityStore', 'Environment check', {
  isWindow: typeof window !== 'undefined',
  hasStore: !!useCapabilityStore,
  hasPersist: !!useCapabilityStore?.persist
});

// ✅ STEP 1: Register onFinishHydration listener IMMEDIATELY (module level)
// This MUST be at module scope to catch the hydration event
// If registered inside window check, hydration may complete before registration
const hydrationUnsubscribe = useCapabilityStore.persist.onFinishHydration((state) => {
  logger.info('CapabilityStore', '🏁 onFinishHydration callback FIRED!', {
    hasState: !!state,
    hasProfile: !!state?.profile,
    selectedCapabilities: state?.profile?.selectedCapabilities?.length || 0,
    activeFeatures: state?.features?.activeFeatures?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Recalculate features if profile exists but features are empty
  if (state.profile && (!state.features?.activeFeatures || state.features.activeFeatures.length === 0)) {
    logger.warn('CapabilityStore', '⚠️ [onFinishHydration] Profile exists but features empty - recalculating...');

    try {
      const { activeFeatures } = FeatureActivationEngine.activateFeatures(
        state.profile.selectedCapabilities || [],
        state.profile.selectedInfrastructure || []
      );
      // ✅ REFACTOR: activeModules calculation removed - use getActiveModules() getter

      logger.info('CapabilityStore', '🔄 [onFinishHydration] Recalculated features:', {
        activeFeatures: activeFeatures.length,
      });

      useCapabilityStore.setState({
        features: {
          ...state.features,
          activeFeatures,
          // activeModules removed - use getActiveModules() getter
        }
      });

      logger.info('CapabilityStore', '✅ [onFinishHydration] Features recalculated successfully');
    } catch (error) {
      logger.error('CapabilityStore', '❌ [onFinishHydration] Error recalculating features:', error);
    }
  }
});

logger.debug('CapabilityStore', 'onFinishHydration listener registered');

if (typeof window !== 'undefined') {
  logger.debug('CapabilityStore', 'Entering window check block');

  // Store unsubscribe function for cleanup
  (window as any).__CAPABILITY_STORE_HYDRATION_UNSUB__ = hydrationUnsubscribe;

  // ✅ STEP 2: Synchronous check if already hydrated (fallback pattern from docs)
  const checkIfAlreadyHydrated = () => {
    const hasHydrated = useCapabilityStore.persist.hasHydrated();
    logger.info('CapabilityStore', '🔍 Module load - Checking hydration status', {
      hasHydrated,
      timestamp: new Date().toISOString()
    });

    if (hasHydrated) {
      logger.info('CapabilityStore', '⚡ Store already hydrated on module load - running immediate check');
      const state = useCapabilityStore.getState();

      logger.info('CapabilityStore', '📊 Current state on module load:', {
        hasProfile: !!state.profile,
        selectedCapabilities: state.profile?.selectedCapabilities?.length || 0,
        activeFeatures: state.features?.activeFeatures?.length || 0
      }); if (state.profile && (!state.features?.activeFeatures || state.features.activeFeatures.length === 0)) {
        logger.warn('CapabilityStore', '⚠️ [IMMEDIATE] Profile exists but features empty - recalculating...', {
          selectedCapabilities: state.profile.selectedCapabilities,
          selectedInfrastructure: state.profile.selectedInfrastructure
        });

        try {
          const { activeFeatures } = FeatureActivationEngine.activateFeatures(
            state.profile.selectedCapabilities || [],
            state.profile.selectedInfrastructure || []
          );
          // ✅ REFACTOR: activeModules calculation removed - use getActiveModules() getter

          logger.info('CapabilityStore', '🔄 [IMMEDIATE] Recalculated features:', {
            activeFeatures: activeFeatures.length,
          });

          useCapabilityStore.setState({
            features: {
              ...state.features,
              activeFeatures,
              // activeModules removed - use getActiveModules() getter
            }
          });

          logger.info('CapabilityStore', '✅ [IMMEDIATE] Features recalculated');
        } catch (error) {
          logger.error('CapabilityStore', '❌ [IMMEDIATE] Error recalculating features:', error);
        }
      }
    } else {
      logger.info('CapabilityStore', '⏳ Store not yet hydrated - will wait for onFinishHydration callback');
    }
  };

  // STEP 3: Execute immediate check (fallback for edge cases where hydration already completed)
  checkIfAlreadyHydrated();

  logger.info('CapabilityStore', '🎯 Hydration tracking initialized', {
    hasUnsubscribe: typeof hydrationUnsubscribe === 'function'
  });

  logger.debug('CapabilityStore', 'Hydration tracking code executed successfully');
} else {
  logger.debug('CapabilityStore', 'Skipped hydration tracking (window undefined)');
}

logger.debug('CapabilityStore', 'capabilityStore.ts module loading complete');

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook principal para usar capabilities
 * ✅ FIX: Wrapped with useMemo to prevent infinite re-renders in consuming components
 */
export const useCapabilities = () => {
  const store = useCapabilityStore();

  // ✅ FIX: Use React.useMemo to prevent creating new object on every render
  return React.useMemo(() => ({
    // State
    profile: store.profile,
    activeFeatures: store.features.activeFeatures,
    blockedFeatures: store.features.blockedFeatures,
    pendingMilestones: store.features.pendingMilestones,
    completedMilestones: store.features.completedMilestones,
    validationErrors: store.features.validationErrors,
    isLoading: store.isLoading,

    // Computed (use getters, not stored values)
    // ✅ REFACTOR: Use getActiveModules() instead of state.features.activeModules
    visibleModules: store.getActiveModules(),
    activeSlots: store.features.activeSlots,
    isSetupComplete: store.profile?.setupCompleted ?? false,
    isFirstTime: store.profile?.isFirstTimeInDashboard ?? false,

    // Actions
    initializeProfile: store.initializeProfile,
    toggleCapability: store.toggleCapability,
    setCapabilities: store.setCapabilities,
    setInfrastructure: store.setInfrastructure,
    toggleInfrastructure: store.toggleInfrastructure,
    completeSetup: store.completeSetup,
    dismissWelcome: store.dismissWelcome,
    resetProfile: store.resetProfile,

    // Database
    loadFromDB: store.loadFromDB,
    saveToDB: store.saveToDB,

    // Getters
    hasFeature: store.hasFeature,
    hasAllFeatures: store.hasAllFeatures,
    isFeatureBlocked: store.isFeatureBlocked,

    // Backward compatibility aliases
    hasCapability: store.hasFeature,
    hasAllCapabilities: store.hasAllFeatures,
    activeCapabilities: store.features.activeFeatures // v4.0 migration alias
  }), [
    // Dependencies: only recreate when these actually change
    store.profile,
    store.features.activeFeatures,
    store.features.blockedFeatures,
    store.features.pendingMilestones,
    store.features.completedMilestones,
    store.features.validationErrors,
    store.isLoading,
    // ✅ REFACTOR: activeModules removed - computed via getActiveModules()
    // visibleModules depends on activeFeatures (already tracked above)
    store.features.activeSlots,
    // Functions are stable from Zustand, no need to include them
  ]);
};

// Performance-optimized selectors
export const useActiveFeatures = () =>
  useCapabilityStore(state => state.features.activeFeatures);

export const usePendingMilestones = () =>
  useCapabilityStore(state => state.features.pendingMilestones);

export const useBlockedFeatures = () =>
  useCapabilityStore(state => state.features.blockedFeatures);

export const useValidationErrors = () =>
  useCapabilityStore(state => state.features.validationErrors);

export const useIsSetupComplete = () =>
  useCapabilityStore(state => state.profile?.setupCompleted ?? false);

export const useIsFirstTimeInDashboard = () =>
  useCapabilityStore(state => state.profile?.isFirstTimeInDashboard ?? false);

/**
 * Hook para verificar una feature específica
 */
export const useFeature = (featureId: FeatureId) => {
  const hasFeature = useCapabilityStore(state => state.hasFeature);
  return hasFeature(featureId);
};

/**
 * Hook para verificar acceso a un módulo
 * Note: No useShallow needed - we immediately call .includes() on the result
 */
export const useModuleAccess = (moduleId: string) => {
  const activeModules = useCapabilityStore(state => state.getActiveModules());
  return activeModules.includes(moduleId);
};
