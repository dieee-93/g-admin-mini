/**
 * Store de Zustand para el manejo de Capacidades de Negocio
 * Centraliza el estado de personalización de toda la aplicación
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  BusinessCapabilities, 
  BusinessProfile, 
  OperationalTier 
} from '@/pages/setup/steps/business-setup/business-model/config/businessCapabilities';
import { 
  calculateOperationalTier, 
  getEnabledFeatures, 
  getDashboardModules,
  getRelevantTutorials 
} from '@/pages/setup/steps/business-setup/business-model/config/businessCapabilities';

interface BusinessCapabilitiesState {
  // Estado principal
  profile: BusinessProfile | null;
  isLoading: boolean;
  
  // Computed values para personalización
  enabledFeatures: string[];
  dashboardModules: string[];
  relevantTutorials: string[];
  
  // Actions
  initializeProfile: (basicData: Partial<BusinessProfile>) => void;
  setCapability: (capability: keyof BusinessCapabilities, value: boolean) => void;
  updateBasicInfo: (info: Partial<BusinessProfile>) => void;
  completeSetup: () => void;
  completeMilestone: (milestoneId: string) => void;
  resetProfile: () => void;
  
  // Helpers para personalización de UI
  hasCapability: (capability: keyof BusinessCapabilities) => boolean;
  shouldShowModule: (moduleId: string) => boolean;
  shouldShowTutorial: (tutorialId: string) => boolean;
  getOperationalTier: () => OperationalTier;
}

const defaultCapabilities: BusinessCapabilities = {
  sells_products: false,
  sells_services: false,
  manages_events: false,
  manages_recurrence: false,
  sells_products_for_onsite_consumption: false,
  sells_products_for_pickup: false,
  sells_products_with_delivery: false,
  sells_digital_products: false,
  sells_services_by_appointment: false,
  sells_services_by_class: false,
  sells_space_by_reservation: false,
  manages_offsite_catering: false,
  hosts_private_events: false,
  manages_rentals: false,
  manages_memberships: false,
  manages_subscriptions: false,
  has_online_store: false,
  is_b2b_focused: false,
};

export const useBusinessCapabilities = create<BusinessCapabilitiesState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      enabledFeatures: [],
      dashboardModules: ['dashboard', 'materials', 'products'],
      relevantTutorials: ['basics'],

      initializeProfile: (basicData) => {
        set((state) => {
          const newProfile: BusinessProfile = {
            businessName: '',
            businessType: '',
            email: '',
            phone: '',
            country: 'Argentina',
            currency: 'ARS',
            capabilities: defaultCapabilities,
            operationalTier: 'Sin Configurar',
            businessStructure: 'single_location',
            setupCompleted: false,
            onboardingStep: 0,
            customizations: {
              enabledModules: ['dashboard', 'materials', 'products'],
              tutorialsCompleted: [],
              milestonesCompleted: [],
            },
            ...basicData,
          };

          return {
            ...state,
            profile: newProfile,
            enabledFeatures: getEnabledFeatures(newProfile.capabilities),
            dashboardModules: getDashboardModules(newProfile.capabilities),
            relevantTutorials: getRelevantTutorials(newProfile.capabilities),
          };
        });
      },

      setCapability: (capability, value) => {
        set((state) => {
          if (!state.profile) return state;

          const updatedCapabilities = {
            ...state.profile.capabilities,
            [capability]: value,
          };

          const updatedProfile = {
            ...state.profile,
            capabilities: updatedCapabilities,
            operationalTier: calculateOperationalTier(updatedCapabilities, state.profile.businessStructure),
            customizations: {
              ...state.profile.customizations,
              enabledModules: getDashboardModules(updatedCapabilities),
            }
          };

          return {
            ...state,
            profile: updatedProfile,
            enabledFeatures: getEnabledFeatures(updatedCapabilities),
            dashboardModules: getDashboardModules(updatedCapabilities),
            relevantTutorials: getRelevantTutorials(updatedCapabilities),
          };
        });
      },

      updateBasicInfo: (info) => {
        set((state) => {
          if (!state.profile) return state;
          
          return {
            ...state,
            profile: {
              ...state.profile,
              ...info,
            },
          };
        });
      },

      completeSetup: () => {
        set((state) => {
          if (!state.profile) return state;
          
          return {
            ...state,
            profile: {
              ...state.profile,
              setupCompleted: true,
              onboardingStep: 1,
            },
          };
        });
      },

      completeMilestone: (milestoneId) => {
        set((state) => {
          if (!state.profile) return state;

          const completed = state.profile.customizations.milestonesCompleted || [];
          if (completed.includes(milestoneId)) {
            return state; // Milestone already completed, no change needed
          }

          const updatedCustomizations = {
            ...state.profile.customizations,
            milestonesCompleted: [...completed, milestoneId],
          };

          return {
            ...state,
            profile: {
              ...state.profile,
              customizations: updatedCustomizations,
            },
          };
        });
      },

      resetProfile: () => {
        set({
          profile: null,
          isLoading: false,
          enabledFeatures: [],
          dashboardModules: ['dashboard', 'materials', 'products'],
          relevantTutorials: ['basics'],
        });
      },

      // Helper functions para uso en componentes
      hasCapability: (capability) => {
        const state = get();
        return state.profile?.capabilities[capability] ?? false;
      },

      shouldShowModule: (moduleId) => {
        const state = get();
        return state.dashboardModules.includes(moduleId);
      },

      shouldShowTutorial: (tutorialId) => {
        const state = get();
        return state.relevantTutorials.includes(tutorialId);
      },

      getOperationalTier: () => {
        const state = get();
        return state.profile?.operationalTier ?? 'Sin Configurar';
      },
    }),
    {
      name: 'business-capabilities-store',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);

// Hook personalizado para usar en componentes
export const useBusinessProfile = () => {
  const store = useBusinessCapabilities();
  return {
    profile: store.profile,
    isLoading: store.isLoading,
    hasCapability: store.hasCapability,
    shouldShowModule: store.shouldShowModule,
    shouldShowTutorial: store.shouldShowTutorial,
    getOperationalTier: store.getOperationalTier,
    enabledFeatures: store.enabledFeatures,
    dashboardModules: store.dashboardModules,
  };
};