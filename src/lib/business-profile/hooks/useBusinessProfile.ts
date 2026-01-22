/**
 * BUSINESS PROFILE HOOK - TanStack Query
 *
 * Layer 1 of capabilityStore migration:
 * - Server state management (profile from DB)
 * - TanStack Query handles caching, loading, error states
 * - Mutations for profile updates
 *
 * Migration from: capabilityStore.ts (profile state + DB sync)
 * Pattern: Server state → TanStack Query (project convention)
 *
 * Created: 2025-01-14
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loadProfileFromDB,
  saveProfileToDB,
  dismissWelcomeInDB,
} from '@/lib/business-profile/businessProfileService';
import type { UserProfile } from '../types';
import { logger } from '@/lib/logging';

// ============================================
// QUERY KEYS
// ============================================

export const businessProfileKeys = {
  all: ['business-profile'] as const,
  detail: () => [...businessProfileKeys.all, 'detail'] as const,
};

// ============================================
// MAIN HOOK - Query Profile
// ============================================

/**
 * Hook principal para acceder al perfil de negocio
 * 
 * Uses TanStack Query for:
 * - Automatic caching (staleTime: Infinity - profile changes rarely)
 * - Loading states
 * - Error handling
 * - Request deduplication (handled by TanStack Query)
 * 
 * @example
 * const { profile, isLoading, error } = useBusinessProfile();
 */
export function useBusinessProfile() {
  const query = useQuery({
    queryKey: businessProfileKeys.detail(),
    queryFn: loadProfileFromDB,
    staleTime: Infinity, // Profile changes very rarely, cache forever until invalidated
    gcTime: Infinity, // Keep in cache even when unmounted
    retry: 2, // Retry failed requests 2 times
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================
// MUTATIONS - Profile Updates
// ============================================

/**
 * Hook para actualizar el perfil completo
 * 
 * @example
 * const { updateProfile } = useUpdateProfile();
 * updateProfile({ businessName: 'New Name', email: 'new@email.com' });
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      // Get current profile from cache
      const currentProfile = queryClient.getQueryData<UserProfile>(
        businessProfileKeys.detail()
      );

      if (!currentProfile) {
        throw new Error('No profile found to update');
      }

      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...updates,
      };

      await saveProfileToDB(updatedProfile);

      logger.info('BusinessProfileHooks', '✅ Profile updated', {
        updates: Object.keys(updates),
      });

      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile
      queryClient.setQueryData(businessProfileKeys.detail(), updatedProfile);
    },
    onError: (error) => {
      logger.error('BusinessProfileHooks', '❌ Failed to update profile', error);
    },
  });

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook para inicializar el perfil (primera vez)
 * 
 * @example
 * const { initializeProfile } = useInitializeProfile();
 * initializeProfile({
 *   businessName: 'My Business',
 *   selectedCapabilities: ['physical_products'],
 *   selectedInfrastructure: ['single_location'],
 * });
 */
export function useInitializeProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const newProfile: UserProfile = {
        businessName: data.businessName ?? '',
        businessType: data.businessType ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        country: data.country ?? 'Argentina',
        currency: data.currency ?? 'ARS',
        selectedCapabilities: data.selectedCapabilities ?? [],
        selectedInfrastructure: data.selectedInfrastructure ?? ['single_location'],
        setupCompleted: data.setupCompleted ?? false,
        isFirstTimeInDashboard: data.isFirstTimeInDashboard ?? false,
        onboardingStep: data.onboardingStep ?? 0,
        completedMilestones: data.completedMilestones ?? [],
        businessId: data.businessId,
      };

      await saveProfileToDB(newProfile);

      logger.info('BusinessProfileHooks', '🚀 Profile initialized', {
        capabilities: newProfile.selectedCapabilities.length,
        infrastructure: newProfile.selectedInfrastructure.length,
      });

      return newProfile;
    },
    onSuccess: (newProfile) => {
      queryClient.setQueryData(businessProfileKeys.detail(), newProfile);
    },
    onError: (error) => {
      logger.error('BusinessProfileHooks', '❌ Failed to initialize profile', error);
    },
  });

  return {
    initializeProfile: mutation.mutate,
    initializeProfileAsync: mutation.mutateAsync,
    isInitializing: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook para completar el setup inicial
 * 
 * @example
 * const { completeSetup } = useCompleteSetup();
 * completeSetup();
 */
export function useCompleteSetup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const currentProfile = queryClient.getQueryData<UserProfile>(
        businessProfileKeys.detail()
      );

      if (!currentProfile) {
        throw new Error('No profile found to complete setup');
      }

      const updatedProfile: UserProfile = {
        ...currentProfile,
        setupCompleted: true,
        isFirstTimeInDashboard: true,
        onboardingStep: 1,
      };

      await saveProfileToDB(updatedProfile);

      logger.info('BusinessProfileHooks', '✅ Setup completed');

      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(businessProfileKeys.detail(), updatedProfile);
    },
    onError: (error) => {
      logger.error('BusinessProfileHooks', '❌ Failed to complete setup', error);
    },
  });

  return {
    completeSetup: mutation.mutate,
    completeSetupAsync: mutation.mutateAsync,
    isCompleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook para dismissar la pantalla de bienvenida
 * 
 * @example
 * const { dismissWelcome } = useDismissWelcome();
 * dismissWelcome();
 */
export function useDismissWelcome() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const currentProfile = queryClient.getQueryData<UserProfile>(
        businessProfileKeys.detail()
      );

      if (!currentProfile) {
        throw new Error('No profile found to dismiss welcome');
      }

      await dismissWelcomeInDB();

      const updatedProfile: UserProfile = {
        ...currentProfile,
        isFirstTimeInDashboard: false,
      };

      logger.info('BusinessProfileHooks', '👋 Welcome dismissed');

      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(businessProfileKeys.detail(), updatedProfile);
    },
    onError: (error) => {
      logger.error('BusinessProfileHooks', '❌ Failed to dismiss welcome', error);
    },
  });

  return {
    dismissWelcome: mutation.mutate,
    dismissWelcomeAsync: mutation.mutateAsync,
    isDismissing: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook para resetear el perfil (debugging/testing)
 * 
 * @example
 * const { resetProfile } = useResetProfile();
 * resetProfile();
 */
export function useResetProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      logger.warn('BusinessProfileHooks', '🗑️ Resetting profile');

      // Remove from cache
      queryClient.removeQueries({ queryKey: businessProfileKeys.all });

      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData(businessProfileKeys.detail(), null);
    },
  });

  return {
    resetProfile: mutation.mutate,
    resetProfileAsync: mutation.mutateAsync,
    isResetting: mutation.isPending,
  };
}

/**
 * Hook para toggle de capabilities (agregar/remover)
 * 
 * @example
 * const { toggleCapability } = useToggleCapability();
 * toggleCapability('physical_products');
 */
export function useToggleCapability() {
  const queryClient = useQueryClient();
  const { updateProfileAsync } = useUpdateProfile();

  const mutation = useMutation({
    mutationFn: async (capabilityId: string) => {
      const currentProfile = queryClient.getQueryData<UserProfile>(
        businessProfileKeys.detail()
      );

      if (!currentProfile) {
        throw new Error('No profile found to toggle capability');
      }

      const currentCapabilities = currentProfile.selectedCapabilities || [];
      const isAdding = !currentCapabilities.includes(capabilityId as any);
      
      const newCapabilities = isAdding
        ? [...currentCapabilities, capabilityId as any]
        : currentCapabilities.filter(id => id !== capabilityId);

      await updateProfileAsync({
        selectedCapabilities: newCapabilities,
      });

      logger.info('BusinessProfileHooks', `${isAdding ? '➕' : '➖'} Capability toggled`, {
        capabilityId,
        isAdding,
      });

      return { capabilityId, isAdding };
    },
  });

  return {
    toggleCapability: mutation.mutate,
    toggleCapabilityAsync: mutation.mutateAsync,
    isToggling: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook para cambiar infrastructure
 * 
 * @example
 * const { setInfrastructure } = useSetInfrastructure();
 * setInfrastructure('multi_location');
 */
export function useSetInfrastructure() {
  const { updateProfileAsync } = useUpdateProfile();

  const mutation = useMutation({
    mutationFn: async (infraId: string) => {
      await updateProfileAsync({
        selectedInfrastructure: [infraId as any],
      });

      logger.info('BusinessProfileHooks', '🏢 Infrastructure updated', {
        infraId,
      });

      return infraId;
    },
  });

  return {
    setInfrastructure: mutation.mutate,
    setInfrastructureAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}
