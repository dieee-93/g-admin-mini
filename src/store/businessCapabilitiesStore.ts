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
  // Estado principal - ÚNICA FUENTE DE VERDAD
  profile: BusinessProfile | null;
  isLoading: boolean;
  
  // Actions simplificados
  initializeProfile: (basicData: Partial<BusinessProfile>) => void;
  setCapability: (capability: keyof BusinessCapabilities, value: boolean) => void;
  updateBasicInfo: (info: Partial<BusinessProfile>) => void;
  completeSetup: () => void;
  resetProfile: () => void;

  // ✅ Solo helpers básicos - NO business logic
  hasCapability: (capability: keyof BusinessCapabilities) => boolean;
  
  // Sistema de logros
  handleCapabilityActivation: (capabilityId: string, timestamp: number, milestones: string[]) => void;
}

const defaultCapabilities: BusinessCapabilities = {
  sells_products: true,
  sells_services: true,
  manages_events: false,
  manages_recurrence: false,
  sells_products_for_onsite_consumption: true,
  sells_products_for_pickup: false,
  sells_products_with_delivery: false,
  sells_digital_products: false,
  sells_services_by_appointment: true,
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
              enabledModules: ['dashboard', 'materials', 'products', 'staff', 'scheduling'],
              tutorialsCompleted: [],
              milestonesCompleted: [],
            },
            ...basicData,
          };

          return {
            ...state,
            profile: newProfile,
          };
        });
      },

      setCapability: (capability, value) => {
        set((state) => {
          if (!state.profile) return state;

          return {
            ...state,
            profile: {
              ...state.profile,
              capabilities: {
                ...state.profile.capabilities,
                [capability]: value,
              },
            },
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
          isLoading: false,
        });
      },

      // ✅ Solo helper básico - NO business logic
      hasCapability: (capability) => {
        const state = get();
        return state.profile?.capabilities[capability] || false;
      },

      // Sistema de logros - integración simplificada
      handleCapabilityActivation: (capabilityId: string, timestamp: number, milestones: string[]) => {
        set((state) => {
          if (!state.profile) return state;

          // Activar la capacidad en el profile
          const capability = capabilityId as keyof BusinessCapabilities;
          if (state.profile.capabilities.hasOwnProperty(capability)) {
            return {
              ...state,
              profile: {
                ...state.profile,
                capabilities: {
                  ...state.profile.capabilities,
                  [capability]: true,
                },
                customizations: {
                  ...state.profile.customizations,
                  milestonesCompleted: [
                    ...state.profile.customizations.milestonesCompleted,
                    ...milestones
                  ],
                },
              },
            };
          }

          console.warn('[BusinessCapabilitiesStore] Capacidad no reconocida:', capabilityId);
          return state;
        });
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
    setCapability: store.setCapability,
    getOperationalTier: store.getOperationalTier,
    getEnabledFeatures: store.getEnabledFeatures,
    getDashboardModules: store.getDashboardModules,
    getRelevantTutorials: store.getRelevantTutorials,
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