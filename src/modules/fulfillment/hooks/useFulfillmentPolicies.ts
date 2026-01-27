/**
 * FULFILLMENT POLICIES HOOKS
 * 
 * TanStack Query hooks for fulfillment_policies table
 * Provides queries and mutations with optimistic updates
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as fulfillmentPoliciesApi from '@/pages/admin/operations/fulfillment/services/fulfillmentPoliciesApi';
import type {
  FulfillmentPolicies,
  FulfillmentPoliciesUpdate,
} from '@/pages/admin/operations/fulfillment/services/fulfillmentPoliciesApi';
import { notify } from '@/shared/alerts';
import { logger } from '@/lib/logging';

// ============================================
// QUERY KEYS
// ============================================

export const fulfillmentPoliciesKeys = {
  all: ['fulfillment-policies'] as const,
  policies: () => [...fulfillmentPoliciesKeys.all, 'policies'] as const,
  policy: (id: string) => [...fulfillmentPoliciesKeys.all, 'policies', id] as const,
  system: () => [...fulfillmentPoliciesKeys.all, 'policies', 'system'] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all fulfillment policies
 */
export function useFulfillmentPolicies() {
  return useQuery({
    queryKey: fulfillmentPoliciesKeys.policies(),
    queryFn: fulfillmentPoliciesApi.fetchFulfillmentPolicies,
    staleTime: Infinity, // Settings change rarely, only refetch on manual invalidation
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Fetch single fulfillment policy by ID
 */
export function useFulfillmentPolicy(id: string) {
  return useQuery({
    queryKey: fulfillmentPoliciesKeys.policy(id),
    queryFn: () => fulfillmentPoliciesApi.fetchFulfillmentPoliciesById(id),
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch system fulfillment policies (default configuration)
 */
export function useSystemFulfillmentPolicies() {
  return useQuery({
    queryKey: fulfillmentPoliciesKeys.system(),
    queryFn: fulfillmentPoliciesApi.fetchSystemFulfillmentPolicies,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Update fulfillment policies
 */
export function useUpdateFulfillmentPolicies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: FulfillmentPoliciesUpdate }) =>
      fulfillmentPoliciesApi.updateFulfillmentPolicies(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: fulfillmentPoliciesKeys.policies() });

      const previousPolicies = queryClient.getQueryData<FulfillmentPolicies>(
        fulfillmentPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          { ...previousPolicies, ...updates }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fulfillmentPoliciesKeys.policies() });
      notify.success({
        title: 'Políticas actualizadas',
        description: 'Las políticas de fulfillment se actualizaron correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      logger.error('FulfillmentPoliciesHooks', 'Failed to update fulfillment policies', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudieron actualizar las políticas de fulfillment',
      });
    },
  });
}

/**
 * Toggle delivery enabled
 */
export function useToggleDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      fulfillmentPoliciesApi.toggleDelivery(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: fulfillmentPoliciesKeys.policy(id) });

      const previousPolicies = queryClient.getQueryData<FulfillmentPolicies>(
        fulfillmentPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          { ...previousPolicies, delivery_enabled: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fulfillmentPoliciesKeys.policies() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'El estado de delivery se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      logger.error('FulfillmentPoliciesHooks', 'Failed to toggle delivery', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el estado de delivery',
      });
    },
  });
}

/**
 * Toggle pickup enabled
 */
export function useTogglePickup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      fulfillmentPoliciesApi.togglePickup(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: fulfillmentPoliciesKeys.policy(id) });

      const previousPolicies = queryClient.getQueryData<FulfillmentPolicies>(
        fulfillmentPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          { ...previousPolicies, pickup_enabled: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fulfillmentPoliciesKeys.policies() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'El estado de pickup se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      logger.error('FulfillmentPoliciesHooks', 'Failed to toggle pickup', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el estado de pickup',
      });
    },
  });
}

/**
 * Toggle auto-assign drivers
 */
export function useToggleAutoAssignDrivers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      fulfillmentPoliciesApi.toggleAutoAssignDrivers(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: fulfillmentPoliciesKeys.policy(id) });

      const previousPolicies = queryClient.getQueryData<FulfillmentPolicies>(
        fulfillmentPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          { ...previousPolicies, auto_assign_drivers: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fulfillmentPoliciesKeys.policies() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'La asignación automática de conductores se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      logger.error('FulfillmentPoliciesHooks', 'Failed to toggle auto-assign drivers', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar la asignación automática',
      });
    },
  });
}

/**
 * Toggle tips enabled
 */
export function useToggleTips() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      fulfillmentPoliciesApi.toggleTips(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: fulfillmentPoliciesKeys.policy(id) });

      const previousPolicies = queryClient.getQueryData<FulfillmentPolicies>(
        fulfillmentPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          { ...previousPolicies, tips_enabled: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fulfillmentPoliciesKeys.policies() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'El estado de propinas se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      logger.error('FulfillmentPoliciesHooks', 'Failed to toggle tips', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el estado de propinas',
      });
    },
  });
}

/**
 * Toggle service charge
 */
export function useToggleServiceCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      fulfillmentPoliciesApi.toggleServiceCharge(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: fulfillmentPoliciesKeys.policy(id) });

      const previousPolicies = queryClient.getQueryData<FulfillmentPolicies>(
        fulfillmentPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          { ...previousPolicies, service_charge_enabled: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fulfillmentPoliciesKeys.policies() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'El cargo por servicio se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      logger.error('FulfillmentPoliciesHooks', 'Failed to toggle service charge', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el cargo por servicio',
      });
    },
  });
}

/**
 * Toggle order tracking
 */
export function useToggleOrderTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      fulfillmentPoliciesApi.toggleOrderTracking(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: fulfillmentPoliciesKeys.policy(id) });

      const previousPolicies = queryClient.getQueryData<FulfillmentPolicies>(
        fulfillmentPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          { ...previousPolicies, order_tracking_enabled: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fulfillmentPoliciesKeys.policies() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'El seguimiento de pedidos se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData<FulfillmentPolicies>(
          fulfillmentPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      logger.error('FulfillmentPoliciesHooks', 'Failed to toggle order tracking', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el seguimiento de pedidos',
      });
    },
  });
}
