/**
 * Store de Zustand para el manejo de Capacidades de Negocio (DNA Composition Model)
 * Centraliza el estado de composición de capacidades independientes
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import eventBus from '@/lib/events/EventBus';
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
import type { CapabilityActivationEvent } from '@/pages/admin/gamification/achievements/types';

// Nueva interfaz para el modelo de composición de ADN
export interface CapabilityStatus {
  status: 'latent' | 'activating' | 'active' | 'optimized';
  activatedAt?: Date;
  milestones?: string[];
}

export interface BusinessDNA {
  [key: string]: CapabilityStatus;
}

interface BusinessCapabilitiesState {
  // Estado principal - nuevo modelo de composición
  profile: BusinessProfile | null;
  businessDNA: BusinessDNA;
  selectedCapabilities: string[];
  isLoading: boolean;
  
  // Computed values para personalización
  enabledFeatures: string[];
  dashboardModules: string[];
  relevantTutorials: string[];
  
  // Actions - nuevo modelo compositivo
  initializeProfile: (basicData: Partial<BusinessProfile>) => void;
  addCapability: (capability: string) => void;
  removeCapability: (capability: string) => void;
  updateCapabilityStatus: (capability: string, status: CapabilityStatus['status']) => void;
  updateBasicInfo: (info: Partial<BusinessProfile>) => void;
  completeSetup: () => void;
  resetProfile: () => void;
  
  // Helpers para personalización de UI
  hasCapability: (capability: string) => boolean;
  getOperationalTier: () => OperationalTier;
  getCapabilityStatus: (capability: string) => CapabilityStatus['status'];
  getActiveCapabilities: () => string[];
  shouldShowModule: (moduleId: string) => boolean;
  shouldShowTutorial: (tutorialId: string) => boolean;
  
  // Sistema de logros
  handleCapabilityActivation: (capabilityId: string, timestamp: number, milestones: string[]) => void;
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
      businessDNA: {},
      selectedCapabilities: [],
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

      addCapability: (capability) => {
        set((state) => {
          if (state.selectedCapabilities.includes(capability)) {
            return state; // Ya está seleccionada
          }

          const newDNA = {
            ...state.businessDNA,
            [capability]: { status: 'latent' as const },
          };

          const newSelectedCapabilities = [...state.selectedCapabilities, capability];

          // Crear un objeto de capacidades para compatibilidad con funciones existentes
          const mockCapabilities = Object.keys(newDNA).reduce((acc, cap) => {
            acc[cap as keyof BusinessCapabilities] = true;
            return acc;
          }, {} as Partial<BusinessCapabilities>);

          const fullCapabilities = { ...defaultCapabilities, ...mockCapabilities };

          return {
            ...state,
            businessDNA: newDNA,
            selectedCapabilities: newSelectedCapabilities,
            enabledFeatures: getEnabledFeatures(fullCapabilities),
            dashboardModules: getDashboardModules(fullCapabilities),
            relevantTutorials: getRelevantTutorials(fullCapabilities),
          };
        });
      },

      removeCapability: (capability) => {
        set((state) => {
          const newDNA = { ...state.businessDNA };
          delete newDNA[capability];

          const newSelectedCapabilities = state.selectedCapabilities.filter(cap => cap !== capability);

          // Crear un objeto de capacidades para compatibilidad con funciones existentes
          const mockCapabilities = Object.keys(newDNA).reduce((acc, cap) => {
            acc[cap as keyof BusinessCapabilities] = true;
            return acc;
          }, {} as Partial<BusinessCapabilities>);

          const fullCapabilities = { ...defaultCapabilities, ...mockCapabilities };

          return {
            ...state,
            businessDNA: newDNA,
            selectedCapabilities: newSelectedCapabilities,
            enabledFeatures: getEnabledFeatures(fullCapabilities),
            dashboardModules: getDashboardModules(fullCapabilities),
            relevantTutorials: getRelevantTutorials(fullCapabilities),
          };
        });
      },

      updateCapabilityStatus: (capability, status) => {
        set((state) => {
          if (!state.businessDNA[capability]) {
            return state; // Capacidad no existe
          }

          const newDNA = {
            ...state.businessDNA,
            [capability]: {
              ...state.businessDNA[capability],
              status,
              ...(status === 'active' ? { activatedAt: new Date() } : {}),
            },
          };

          return {
            ...state,
            businessDNA: newDNA,
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

      resetProfile: () => {
        set({
          profile: null,
          businessDNA: {},
          selectedCapabilities: [],
          isLoading: false,
          enabledFeatures: [],
          dashboardModules: ['dashboard', 'materials', 'products'],
          relevantTutorials: ['basics'],
        });
      },

      // Helper functions para uso en componentes
      hasCapability: (capability) => {
        const state = get();
        return state.selectedCapabilities.includes(capability);
      },

      getOperationalTier: () => {
        const state = get();
        if (!state.profile) return 'basic' as OperationalTier;
        return calculateOperationalTier(state.profile.capabilities);
      },

      getCapabilityStatus: (capability) => {
        const state = get();
        return state.businessDNA[capability]?.status || 'latent';
      },

      getActiveCapabilities: () => {
        const state = get();
        return state.selectedCapabilities;
      },

      shouldShowModule: (moduleId) => {
        const state = get();
        return state.dashboardModules.includes(moduleId);
      },

      shouldShowTutorial: (tutorialId) => {
        const state = get();
        return state.relevantTutorials.includes(tutorialId);
      },

      // Método para manejar activación de capacidades desde el sistema de logros
      handleCapabilityActivation: (capabilityId: string, timestamp: number, milestones: string[]) => {
        set((state) => {
          // Solo actualizar si la capacidad existe en el DNA
          if (!state.businessDNA[capabilityId]) {
            console.warn('[BusinessCapabilitiesStore] Capacidad no encontrada en DNA:', capabilityId);
            return state;
          }

          const newDNA = {
            ...state.businessDNA,
            [capabilityId]: {
              ...state.businessDNA[capabilityId],
              status: 'active' as const,
              activatedAt: new Date(timestamp),
              milestones,
            },
          };

          // Recalcular características habilitadas
          const mockCapabilities = Object.keys(newDNA)
            .filter(cap => newDNA[cap].status === 'active')
            .reduce((acc, cap) => {
              acc[cap as keyof BusinessCapabilities] = true;
              return acc;
            }, {} as Partial<BusinessCapabilities>);

          const fullCapabilities = { ...defaultCapabilities, ...mockCapabilities };

          console.log('[BusinessCapabilitiesStore] DNA actualizado:', newDNA);

          return {
            ...state,
            businessDNA: newDNA,
            enabledFeatures: getEnabledFeatures(fullCapabilities),
            dashboardModules: getDashboardModules(fullCapabilities),
            relevantTutorials: getRelevantTutorials(fullCapabilities),
          };
        });
      },
    }),
    {
      name: 'business-capabilities-store',
      partialize: (state) => ({
        profile: state.profile,
        businessDNA: state.businessDNA,
        selectedCapabilities: state.selectedCapabilities,
      }),
    }
  )
);

// Hook personalizado para usar en componentes
export const useBusinessProfile = () => {
  const store = useBusinessCapabilities();
  return {
    profile: store.profile,
    businessDNA: store.businessDNA,
    selectedCapabilities: store.selectedCapabilities,
    isLoading: store.isLoading,
    hasCapability: store.hasCapability,
    getCapabilityStatus: store.getCapabilityStatus,
    getActiveCapabilities: store.getActiveCapabilities,
    shouldShowModule: store.shouldShowModule,
    shouldShowTutorial: store.shouldShowTutorial,
    enabledFeatures: store.enabledFeatures,
    dashboardModules: store.dashboardModules,
    addCapability: store.addCapability,
    removeCapability: store.removeCapability,
    updateCapabilityStatus: store.updateCapabilityStatus,
    handleCapabilityActivation: store.handleCapabilityActivation,
  };
};

/**
 * Inicializa la integración entre el sistema de logros y el store de capacidades
 * Debe ser llamado una vez al arrancar la aplicación
 */
export const initializeCapabilitiesIntegration = () => {
  const store = useBusinessCapabilities.getState();
  
  // Suscribirse a eventos de activación de capacidades
  eventBus.on('capability:activated' as any, (event: any) => {
    console.log('[BusinessCapabilitiesStore] Capacidad activada:', event);
    
    try {
      const { capabilityId, timestamp, data } = event;
      if (capabilityId && timestamp && data?.completedMilestones) {
        store.handleCapabilityActivation(capabilityId, timestamp, data.completedMilestones);
      }
    } catch (error) {
      console.error('[BusinessCapabilitiesStore] Error procesando activación de capacidad:', error);
    }
  });
  
  console.log('[BusinessCapabilitiesStore] Integración con sistema de logros inicializada');
};