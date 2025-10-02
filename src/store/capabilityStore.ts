/**
 * UNIFIED CAPABILITY STORE - G-Admin Mini v3.0
 *
 * REEMPLAZA COMPLETAMENTE:
 * - businessCapabilitiesStore.ts (store viejo)
 * - Lógica compleja de useBusinessCapabilities
 * - Interfaces duplicadas y confusas
 *
 * SIMPLIFICA: Un store, una fuente de verdad, lógica clara
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import eventBus from '@/lib/events/EventBus';
import type {
  CapabilityId,
  CapabilityProfile,
  SystemConfiguration,
  UnifiedCapabilityState
} from '@/lib/capabilities/types/UnifiedCapabilities';
import { CapabilityEngine } from '@/lib/capabilities/core/CapabilityEngine';

import { logger } from '@/lib/logging';
// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_PROFILE: CapabilityProfile = {
  businessName: '',
  businessType: '',
  email: '',
  phone: '',
  country: 'Argentina',
  currency: 'ARS',
  activeCapabilities: [],
  businessStructure: 'single_location',
  setupCompleted: false,
  onboardingStep: 0
};

// ============================================
// UNIFIED CAPABILITY STORE
// ============================================

export const useCapabilityStore = create<UnifiedCapabilityState>()(
  persist(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================
      profile: null,
      configuration: null,
      isLoading: false,

      // ============================================
      // ACTIONS
      // ============================================

      initializeProfile: (data) => {
        set((state) => {
          const newProfile: CapabilityProfile = {
            ...DEFAULT_PROFILE,
            ...data
          };

          // Generar configuración inicial
          const newConfiguration = CapabilityEngine.resolve(newProfile.activeCapabilities);

          return {
            ...state,
            profile: newProfile,
            configuration: newConfiguration
          };
        });
      },

      toggleCapability: (capabilityId) => {
        set((state) => {
          if (!state.profile) return state;

          const currentCapabilities = state.profile.activeCapabilities;
          const newCapabilities = currentCapabilities.includes(capabilityId)
            ? currentCapabilities.filter(id => id !== capabilityId)
            : [...currentCapabilities, capabilityId];

          const updatedProfile = {
            ...state.profile,
            activeCapabilities: newCapabilities
          };

          // Re-generar configuración
          const newConfiguration = CapabilityEngine.resolve(newCapabilities);

          // Emit event para achievements system
          if (!currentCapabilities.includes(capabilityId)) {
            eventBus.emit('capability.activated', {
              capabilityId,
              timestamp: Date.now(),
              profile: updatedProfile
            });
          }

          return {
            ...state,
            profile: updatedProfile,
            configuration: newConfiguration
          };
        });
      },

      setBusinessStructure: (structure) => {
        set((state) => {
          if (!state.profile) return state;

          // Remover infrastructure capabilities conflictivas
          const currentCapabilities = state.profile.activeCapabilities;
          const cleanCapabilities = currentCapabilities.filter(
            cap => !['single_location', 'multi_location', 'mobile_business'].includes(cap)
          );

          // Agregar nueva infrastructure capability
          const newCapabilities = [...cleanCapabilities, structure];

          const updatedProfile = {
            ...state.profile,
            businessStructure: structure,
            activeCapabilities: newCapabilities
          };

          // Re-generar configuración
          const newConfiguration = CapabilityEngine.resolve(newCapabilities);

          return {
            ...state,
            profile: updatedProfile,
            configuration: newConfiguration
          };
        });
      },

      completeSetup: () => {
        set((state) => {
          if (!state.profile) return state;

          const updatedProfile = {
            ...state.profile,
            setupCompleted: true,
            onboardingStep: 1
          };

          // Emit completion event
          eventBus.emit('setup.completed', {
            profile: updatedProfile,
            configuration: state.configuration
          });

          return {
            ...state,
            profile: updatedProfile
          };
        });
      },

      resetProfile: () => {
        set({
          profile: null,
          configuration: null,
          isLoading: false
        });
      },

      // ============================================
      // COMPUTED GETTERS
      // ============================================

      hasCapability: (capabilityId) => {
        const { configuration } = get();
        return CapabilityEngine.hasCapability(configuration, capabilityId);
      },

      isModuleVisible: (moduleId) => {
        const { configuration } = get();
        return CapabilityEngine.isModuleVisible(configuration, moduleId);
      },

      getModuleFeatures: (moduleId) => {
        const { configuration } = get();
        return CapabilityEngine.getModuleFeatures(configuration, moduleId);
      }
    }),
    {
      name: 'capability-store',
      version: 3, // Increment version to reset old data
      migrate: (persistedState: any, version: number) => {
        // Migration logic para limpiar stores viejos
        if (version < 3) {
          logger.info('App', '🔄 Migrating capability store to v3 - cleaning legacy data');
          return {
            profile: null,
            configuration: null,
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
 * Hook simplificado para usar capabilities
 * REEMPLAZA: useCapabilities complex hook
 *
 * ⚠️ WARNING: Este hook retorna un nuevo objeto en cada render.
 * Para evitar re-renders innecesarios, usa los hooks específicos abajo
 * o los selectors directos de useCapabilityStore
 */
export const useCapabilities = () => {
  const store = useCapabilityStore();

  return {
    // State
    profile: store.profile,
    configuration: store.configuration,
    isLoading: store.isLoading,

    // Computed (backward compatibility)
    activeCapabilities: store.configuration?.activeCapabilities ?? [],
    resolvedCapabilities: store.configuration?.activeCapabilities ?? [],
    autoResolvedFeatures: store.configuration?.autoResolvedCapabilities ?? [],
    visibleModules: store.configuration?.visibleModules ?? [],

    // Business model detection (simplified)
    businessModel: detectBusinessModel(store.configuration?.activeCapabilities ?? []),

    // Setup status
    isSetupComplete: store.profile?.setupCompleted ?? false,

    // Actions
    toggleCapability: store.toggleCapability,
    setBusinessStructure: store.setBusinessStructure,
    completeSetup: store.completeSetup,
    resetProfile: store.resetProfile,

    // Getters
    hasCapability: store.hasCapability,
    isModuleVisible: store.isModuleVisible,
    getModuleFeatures: store.getModuleFeatures
  };
};

// ============================================
// PERFORMANCE-OPTIMIZED SELECTORS
// ============================================

/**
 * ✅ OPTIMIZED: Get active capabilities without causing re-renders
 * Use esto en lugar de useCapabilities().activeCapabilities
 */
export const useActiveCapabilities = () => {
  return useCapabilityStore(state => state.configuration?.activeCapabilities ?? []);
};

/**
 * ✅ OPTIMIZED: Get resolved capabilities without causing re-renders
 * Use esto en lugar de useCapabilities().resolvedCapabilities
 *
 * ⚠️ Returns the actual array reference from state - will only change when capabilities actually change
 */
export const useResolvedCapabilities = () => {
  return useCapabilityStore(state => state.configuration?.activeCapabilities) ?? [];
};

/**
 * ✅ OPTIMIZED: Get visible modules without causing re-renders
 */
export const useVisibleModules = () => {
  return useCapabilityStore(state => state.configuration?.visibleModules ?? []);
};

/**
 * Hook para capability específica
 */
export const useCapability = (capabilityId: CapabilityId) => {
  const hasCapability = useCapabilityStore(state => state.hasCapability);
  return hasCapability(capabilityId);
};

/**
 * Hook para module access
 */
export const useModuleAccess = (moduleId: string) => {
  const isVisible = useCapabilityStore(state => state.isModuleVisible);
  const getFeatures = useCapabilityStore(state => state.getModuleFeatures);

  return {
    hasAccess: isVisible(moduleId),
    features: getFeatures(moduleId)
  };
};

// ============================================
// BUSINESS MODEL DETECTION (Simplified)
// ============================================

function detectBusinessModel(capabilities: CapabilityId[]): string | null {
  if (capabilities.length === 0) return null;

  // Simple detection logic
  if (capabilities.includes('sells_products_for_onsite_consumption')) return 'restaurant';
  if (capabilities.includes('has_online_store')) return 'ecommerce';
  if (capabilities.includes('sells_services_by_appointment')) return 'services';
  if (capabilities.includes('is_b2b_focused')) return 'b2b';
  if (capabilities.includes('manages_events')) return 'events';

  return 'custom';
}