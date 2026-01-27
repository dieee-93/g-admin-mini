/**
 * STAFF POLICIES HOOKS
 * 
 * TanStack Query hooks for staff_policies table
 * Provides queries and mutations with optimistic updates
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as staffPoliciesApi from '@/modules/team/services';
import type {
  StaffPolicies,
  UpdateStaffPoliciesInput,
} from '@/modules/team/services';
import { notify } from '@/shared/alerts';
import { logger } from '@/lib/logging';

// ============================================
// QUERY KEYS
// ============================================

export const staffPoliciesKeys = {
  all: ['staff-policies'] as const,
  policies: () => [...staffPoliciesKeys.all, 'policies'] as const,
  policy: (id: string) => [...staffPoliciesKeys.all, 'policies', id] as const,
  system: () => [...staffPoliciesKeys.all, 'policies', 'system'] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all staff policies
 */
export function useStaffPolicies() {
  return useQuery({
    queryKey: staffPoliciesKeys.policies(),
    queryFn: staffPoliciesApi.fetchStaffPolicies,
    staleTime: Infinity, // Settings change rarely, only refetch on manual invalidation
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Fetch single staff policy by ID
 */
export function useStaffPolicy(id: string) {
  return useQuery({
    queryKey: staffPoliciesKeys.policy(id),
    queryFn: () => staffPoliciesApi.fetchStaffPoliciesById(id),
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch system staff policies (default configuration)
 */
export function useSystemStaffPolicies() {
  return useQuery({
    queryKey: staffPoliciesKeys.system(),
    queryFn: staffPoliciesApi.fetchSystemStaffPolicies,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Update staff policies
 */
export function useUpdateStaffPolicies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateStaffPoliciesInput }) =>
      staffPoliciesApi.updateStaffPolicies(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: staffPoliciesKeys.policies() });

      const previousPolicies = queryClient.getQueryData<StaffPolicies>(
        staffPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<StaffPolicies>(
          staffPoliciesKeys.policy(id),
          { ...previousPolicies, ...updates }
        );
      }

      return { previousPolicies };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffPoliciesKeys.policies() });

      notify.success({
        title: 'Políticas actualizadas',
        description: 'Las políticas de personal se actualizaron exitosamente.',
      });

      logger.info('StaffPoliciesHooks', 'Policies updated successfully');
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData(
          staffPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      notify.error({
        title: 'Error al actualizar',
        description: error.message || 'No se pudo actualizar las políticas de personal.',
      });

      logger.error('StaffPoliciesHooks', 'Failed to update policies', error);
    },
  });
}

/**
 * Toggle overtime enabled/disabled
 */
export function useToggleOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      staffPoliciesApi.toggleOvertime(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: staffPoliciesKeys.policies() });

      const previousPolicies = queryClient.getQueryData<StaffPolicies>(
        staffPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<StaffPolicies>(
          staffPoliciesKeys.policy(id),
          { ...previousPolicies, overtime_enabled: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffPoliciesKeys.policies() });

      notify.success({
        title: data.overtime_enabled ? 'Horas extras activadas' : 'Horas extras desactivadas',
        description: data.overtime_enabled
          ? 'El sistema calculará automáticamente las horas extras.'
          : 'El cálculo de horas extras ha sido desactivado.',
      });

      logger.info('StaffPoliciesHooks', `Overtime toggled: ${data.overtime_enabled}`);
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData(
          staffPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      notify.error({
        title: 'Error al cambiar horas extras',
        description: error.message || 'No se pudo cambiar el estado de horas extras.',
      });

      logger.error('StaffPoliciesHooks', 'Failed to toggle overtime', error);
    },
  });
}

/**
 * Toggle certification tracking enabled/disabled
 */
export function useToggleCertificationTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      staffPoliciesApi.toggleCertificationTracking(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: staffPoliciesKeys.policies() });

      const previousPolicies = queryClient.getQueryData<StaffPolicies>(
        staffPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<StaffPolicies>(
          staffPoliciesKeys.policy(id),
          { ...previousPolicies, certification_tracking_enabled: enabled }
        );
      }

      return { previousPolicies };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffPoliciesKeys.policies() });

      notify.success({
        title: data.certification_tracking_enabled
          ? 'Seguimiento de certificaciones activado'
          : 'Seguimiento de certificaciones desactivado',
        description: data.certification_tracking_enabled
          ? 'El sistema rastreará las certificaciones del personal.'
          : 'El seguimiento de certificaciones ha sido desactivado.',
      });

      logger.info('StaffPoliciesHooks', `Certification tracking toggled: ${data.certification_tracking_enabled}`);
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData(
          staffPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      notify.error({
        title: 'Error al cambiar seguimiento',
        description: error.message || 'No se pudo cambiar el estado del seguimiento de certificaciones.',
      });

      logger.error('StaffPoliciesHooks', 'Failed to toggle certification tracking', error);
    },
  });
}

/**
 * Toggle shift swap approval requirement
 */
export function useToggleShiftSwapApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, required }: { id: string; required: boolean }) =>
      staffPoliciesApi.toggleShiftSwapApproval(id, required),

    onMutate: async ({ id, required }) => {
      await queryClient.cancelQueries({ queryKey: staffPoliciesKeys.policies() });

      const previousPolicies = queryClient.getQueryData<StaffPolicies>(
        staffPoliciesKeys.policy(id)
      );

      if (previousPolicies) {
        queryClient.setQueryData<StaffPolicies>(
          staffPoliciesKeys.policy(id),
          { ...previousPolicies, shift_swap_approval_required: required }
        );
      }

      return { previousPolicies };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffPoliciesKeys.policies() });

      notify.success({
        title: data.shift_swap_approval_required
          ? 'Aprobación de cambios requerida'
          : 'Aprobación de cambios no requerida',
        description: data.shift_swap_approval_required
          ? 'Los cambios de turno ahora requieren aprobación gerencial.'
          : 'Los empleados pueden intercambiar turnos sin aprobación.',
      });

      logger.info('StaffPoliciesHooks', `Shift swap approval toggled: ${data.shift_swap_approval_required}`);
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData(
          staffPoliciesKeys.policy(id),
          context.previousPolicies
        );
      }

      notify.error({
        title: 'Error al cambiar política',
        description: error.message || 'No se pudo cambiar la política de aprobación de turnos.',
      });

      logger.error('StaffPoliciesHooks', 'Failed to toggle shift swap approval', error);
    },
  });
}
