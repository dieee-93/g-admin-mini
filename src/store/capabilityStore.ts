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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import eventBus from '@/lib/events/EventBus';

// NEW SYSTEM - Layer 1: User Choices
import type {
  BusinessActivityId,
  InfrastructureId
} from '@/config/BusinessModelRegistry';

// NEW SYSTEM - Layer 2: Features
import type { FeatureId } from '@/config/FeatureRegistry';
import { getSlotsForActiveFeatures, getModulesForActiveFeatures } from '@/config/FeatureRegistry';

// NEW SYSTEM - Feature Engine
import { FeatureActivationEngine } from '@/lib/features/FeatureEngine';

// Database services
import {
  loadProfileFromDB,
  saveProfileToDB,
  updateCompletedMilestonesInDB,
  dismissWelcomeInDB
} from '@/services/businessProfileService';

import { logger } from '@/lib/logging';

// ============================================
// STATE TYPES
// ============================================

export interface UserProfile {
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  country: string;
  currency: string;

  // NEW: Separate user choices
  selectedActivities: BusinessActivityId[];
  selectedInfrastructure: InfrastructureId[];

  // Setup status
  setupCompleted: boolean;
  isFirstTimeInDashboard: boolean;
  onboardingStep: number;
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

  /** Cached computed values (memoized) */
  activeModules: string[];
  activeSlots: Array<{ id: string; component: string; priority: number }>;
}

export interface CapabilityStoreState {
  profile: UserProfile | null;
  features: FeatureState;
  isLoading: boolean;

  // Actions
  initializeProfile: (data: Partial<UserProfile>) => void;
  toggleActivity: (activityId: BusinessActivityId) => void;
  setCapabilities: (capabilities: BusinessActivityId[]) => void;
  setInfrastructure: (infraId: InfrastructureId) => void;
  completeSetup: () => void;
  completeMilestone: (milestoneId: string) => void;
  satisfyValidation: (validationId: string) => void;
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
  selectedActivities: [],
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
  activeModules: [],
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
            const activationResult = FeatureActivationEngine.activateFeatures(
              newProfile.selectedActivities,
              newProfile.selectedInfrastructure,
              newProfile,
              {} // systemConfig - TODO: load from DB if needed
            );

            logger.info('CapabilityStore', '🚀 Profile initialized:', {
              activities: newProfile.selectedActivities.length,
              infrastructure: newProfile.selectedInfrastructure.length,
              activeFeatures: activationResult.activeFeatures.length,
              blockedFeatures: activationResult.blockedFeatures.length
            });

            return {
              ...state,
              profile: newProfile,
              features: {
                activeFeatures: activationResult.activeFeatures,
                blockedFeatures: activationResult.blockedFeatures,
                pendingMilestones: activationResult.pendingMilestones,
                completedMilestones: [],
                validationErrors: activationResult.validationErrors,
                activeModules: getModulesForActiveFeatures(activationResult.activeFeatures),
                activeSlots: getSlotsForActiveFeatures(activationResult.activeFeatures)
              }
            };
          } catch (error) {
            logger.error('CapabilityStore', '❌ Error initializing profile:', error);
            return state;
          }
        });
      },

      toggleActivity: (activityId) => {
        set((state) => {
          if (!state.profile) return state;

          const currentActivities = state.profile.selectedActivities;
          const newActivities = currentActivities.includes(activityId)
            ? currentActivities.filter(id => id !== activityId)
            : [...currentActivities, activityId];

          const updatedProfile = {
            ...state.profile,
            selectedActivities: newActivities
          };

          // Persist to database (async, don't wait)
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting activity toggle to DB:', err);
          });

          // Re-activar features
          try {
            const activationResult = FeatureActivationEngine.activateFeatures(
              newActivities,
              updatedProfile.selectedInfrastructure,
              updatedProfile,
              {}
            );

            // Emit event si se agregó una nueva activity
            if (!currentActivities.includes(activityId)) {
              eventBus.emit('user_choice.activity_selected', {
                activityId,
                timestamp: Date.now()
              });
            }

            return {
              ...state,
              profile: updatedProfile,
              features: {
                activeFeatures: activationResult.activeFeatures,
                blockedFeatures: activationResult.blockedFeatures,
                pendingMilestones: activationResult.pendingMilestones,
                completedMilestones: state.features.completedMilestones,
                validationErrors: activationResult.validationErrors,
                activeModules: getModulesForActiveFeatures(activationResult.activeFeatures),
                activeSlots: getSlotsForActiveFeatures(activationResult.activeFeatures)
              }
            };
          } catch (error) {
            logger.error('CapabilityStore', '❌ Error toggling activity:', error);
            return state;
          }
        });
      },

      setCapabilities: (capabilities) => {
        set((state) => {
          if (!state.profile) return state;

          const updatedProfile = {
            ...state.profile,
            selectedActivities: capabilities
          };

          // Persist to database (async, don't wait)
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting capabilities to DB:', err);
          });

          // Re-activar features
          try {
            const activationResult = FeatureActivationEngine.activateFeatures(
              capabilities,
              updatedProfile.selectedInfrastructure,
              updatedProfile,
              {}
            );

            logger.info('CapabilityStore', '🎯 Capabilities set:', {
              count: capabilities.length,
              activeFeatures: activationResult.activeFeatures.length
            });

            return {
              ...state,
              profile: updatedProfile,
              features: {
                activeFeatures: activationResult.activeFeatures,
                blockedFeatures: activationResult.blockedFeatures,
                pendingMilestones: activationResult.pendingMilestones,
                completedMilestones: state.features.completedMilestones,
                validationErrors: activationResult.validationErrors,
                activeModules: getModulesForActiveFeatures(activationResult.activeFeatures),
                activeSlots: getSlotsForActiveFeatures(activationResult.activeFeatures)
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

          const updatedProfile = {
            ...state.profile,
            selectedInfrastructure: [infraId] // Solo una infrastructure a la vez
          };

          // Persist to database (async, don't wait)
          saveProfileToDB(updatedProfile).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting infrastructure change to DB:', err);
          });

          try {
            const activationResult = FeatureActivationEngine.activateFeatures(
              updatedProfile.selectedActivities,
              [infraId],
              updatedProfile,
              {}
            );

            eventBus.emit('user_choice.infrastructure_selected', {
              infraId,
              timestamp: Date.now()
            });

            return {
              ...state,
              profile: updatedProfile,
              features: {
                activeFeatures: activationResult.activeFeatures,
                blockedFeatures: activationResult.blockedFeatures,
                pendingMilestones: activationResult.pendingMilestones,
                completedMilestones: state.features.completedMilestones,
                validationErrors: activationResult.validationErrors,
                activeModules: getModulesForActiveFeatures(activationResult.activeFeatures),
                activeSlots: getSlotsForActiveFeatures(activationResult.activeFeatures)
              }
            };
          } catch (error) {
            logger.error('CapabilityStore', '❌ Error setting infrastructure:', error);
            return state;
          }
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
            activities: updatedProfile.selectedActivities.length,
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

      completeMilestone: (milestoneId) => {
        set((state) => {
          if (!state.profile) return state;

          const newCompletedMilestones = [
            ...state.features.completedMilestones,
            milestoneId
          ];

          // Verificar si se desbloquea alguna feature
          const unlockResult = FeatureActivationEngine.unlockFeatureByMilestone(
            milestoneId,
            newCompletedMilestones,
            state.features.blockedFeatures
          );

          logger.info('CapabilityStore', '🎯 Milestone completed:', {
            milestoneId,
            unlockedFeature: unlockResult.unlockedFeature,
            featureFullyUnlocked: unlockResult.featureFullyUnlocked
          });

          // Si se desbloqueó una feature, moverla de blocked a active
          let newActiveFeatures = state.features.activeFeatures;
          let newBlockedFeatures = state.features.blockedFeatures;

          if (unlockResult.unlockedFeature) {
            newActiveFeatures = [
              ...state.features.activeFeatures,
              unlockResult.unlockedFeature
            ];
            newBlockedFeatures = state.features.blockedFeatures.filter(
              f => f !== unlockResult.unlockedFeature
            );

            // Emit feature unlocked event
            eventBus.emit('feature.unlocked', {
              featureId: unlockResult.unlockedFeature,
              unlockedBy: 'milestone',
              milestoneId,
              timestamp: Date.now()
            });
          }

          // Persist to database (async, don't wait)
          updateCompletedMilestonesInDB(newCompletedMilestones).catch(err => {
            logger.error('CapabilityStore', '❌ Error persisting milestone to DB:', err);
          });

          return {
            ...state,
            features: {
              ...state.features,
              activeFeatures: newActiveFeatures,
              blockedFeatures: newBlockedFeatures,
              completedMilestones: newCompletedMilestones,
              pendingMilestones: state.features.pendingMilestones.filter(
                m => m !== milestoneId
              ),
              activeModules: getModulesForActiveFeatures(newActiveFeatures),
              activeSlots: getSlotsForActiveFeatures(newActiveFeatures)
            }
          };
        });
      },

      satisfyValidation: (validationId) => {
        set((state) => {
          if (!state.profile) return state;

          // Verificar qué features se desbloquean
          const unlockResult = FeatureActivationEngine.unlockFeatureByValidation(
            validationId,
            state.features.blockedFeatures,
            state.profile,
            {}
          );

          logger.info('CapabilityStore', '🔓 Validation satisfied:', {
            validationId,
            unlockedFeatures: unlockResult.unlockedFeatures.length
          });

          // Mover features desbloqueadas
          const newActiveFeatures = [
            ...state.features.activeFeatures,
            ...unlockResult.unlockedFeatures
          ];

          // Emit events para cada feature desbloqueada
          unlockResult.unlockedFeatures.forEach(featureId => {
            eventBus.emit('feature.unlocked', {
              featureId,
              unlockedBy: 'validation',
              validationId,
              timestamp: Date.now()
            });
          });

          // Remover errores de validación satisfechos
          const newValidationErrors = state.features.validationErrors.filter(
            err => err.field !== validationId
          );

          return {
            ...state,
            features: {
              ...state.features,
              activeFeatures: newActiveFeatures,
              blockedFeatures: unlockResult.stillBlocked,
              validationErrors: newValidationErrors
            }
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
            // TODO: Convert old format to new format if needed
            // For now, initialize with default structure
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
        return getSlotsForActiveFeatures(features.activeFeatures);
      },

      getActiveModules: () => {
        const { features } = get();
        return getModulesForActiveFeatures(features.activeFeatures);
      }
    }),
    {
      name: 'capability-store-v4',
      version: 4,
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
      }
    }
  )
);

// ============================================
// CONVENIENCE HOOKS
// ============================================

/**
 * Hook principal para usar capabilities
 */
export const useCapabilities = () => {
  const store = useCapabilityStore();

  return {
    // State
    profile: store.profile,
    activeFeatures: store.features.activeFeatures,
    blockedFeatures: store.features.blockedFeatures,
    pendingMilestones: store.features.pendingMilestones,
    completedMilestones: store.features.completedMilestones,
    validationErrors: store.features.validationErrors,
    isLoading: store.isLoading,

    // Computed (memoized in state, not function calls)
    visibleModules: store.features.activeModules,
    activeSlots: store.features.activeSlots,
    isSetupComplete: store.profile?.setupCompleted ?? false,
    isFirstTime: store.profile?.isFirstTimeInDashboard ?? false,

    // Actions
    initializeProfile: store.initializeProfile,
    toggleActivity: store.toggleActivity,
    setCapabilities: store.setCapabilities,
    setInfrastructure: store.setInfrastructure,
    completeSetup: store.completeSetup,
    completeMilestone: store.completeMilestone,
    satisfyValidation: store.satisfyValidation,
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
  };
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
 */
export const useModuleAccess = (moduleId: string) => {
  const activeModules = useCapabilityStore(state => state.getActiveModules());
  return activeModules.includes(moduleId);
};
