/**
 * USE TEAM ROLES HOOK
 * 
 * React Query hooks for team roles CRUD operations
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import {
  getTeamRoles,
  getTeamRole,
  createTeamRole,
  updateTeamRole,
  deleteTeamRole,
  getTeamRoleDepartments,
} from '@/modules/team/services/index';
import type { JobRole, JobRoleFormData, JobRoleFilters } from '@/modules/team/types/index';

// Query keys
export const teamRolesKeys = {
  all: ['team-roles'] as const,
  lists: () => [...teamRolesKeys.all, 'list'] as const,
  list: (filters?: JobRoleFilters) => [...teamRolesKeys.lists(), filters] as const,
  details: () => [...teamRolesKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamRolesKeys.details(), id] as const,
  departments: () => [...teamRolesKeys.all, 'departments'] as const,
};

/**
 * Hook to fetch all staff roles
 */
/**
 * Hook to fetch all team roles
 */
export function useTeamRoles(filters?: JobRoleFilters) {
  return useQuery({
    queryKey: teamRolesKeys.list(filters),
    queryFn: () => getTeamRoles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single staff role
 */
/**
 * Hook to fetch a single team role
 */
export function useTeamRole(id: string | undefined) {
  return useQuery({
    queryKey: teamRolesKeys.detail(id || ''),
    queryFn: () => getTeamRole(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch unique departments
 */
/**
 * Hook to fetch unique departments
 */
export function useTeamRoleDepartments() {
  return useQuery({
    queryKey: teamRolesKeys.departments(),
    queryFn: getTeamRoleDepartments,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a staff role
 */
/**
 * Hook to create a team role
 */
export function useCreateTeamRole() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (data: JobRoleFormData) => {
      if (!organization?.id) {
        throw new Error('No organization selected');
      }
      return createTeamRole(data, organization.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamRolesKeys.all });
    },
  });
}

/**
 * Hook to update a staff role
 */
/**
 * Hook to update a team role
 */
export function useUpdateTeamRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobRoleFormData> }) =>
      updateTeamRole(id, data),
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: teamRolesKeys.lists() });
      queryClient.setQueryData(teamRolesKeys.detail(updatedRole.id), updatedRole);
    },
  });
}

/**
 * Hook to delete a staff role
 */
/**
 * Hook to delete a team role
 */
export function useDeleteTeamRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeamRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamRolesKeys.all });
    },
  });
}

/**
 * Hook to toggle staff role active status
 */
/**
 * Hook to toggle team role active status
 */
export function useToggleTeamRoleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateTeamRole(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamRolesKeys.lists() });
    },
  });
}

/**
 * Combined hook for the TeamRoles page
 */
export function useTeamRolesPage() {
  const rolesQuery = useTeamRoles();
  const departmentsQuery = useTeamRoleDepartments();
  const createMutation = useCreateTeamRole();
  const updateMutation = useUpdateTeamRole();
  const deleteMutation = useDeleteTeamRole();
  const toggleActiveMutation = useToggleTeamRoleActive();

  const handleCreate = async (data: JobRoleFormData): Promise<void> => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (id: string, data: Partial<JobRoleFormData>): Promise<void> => {
    await updateMutation.mutateAsync({ id, data });
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  const handleToggleActive = async (role: JobRole): Promise<void> => {
    await toggleActiveMutation.mutateAsync({
      id: role.id,
      isActive: !role.is_active,
    });
  };

  return {
    // Data
    roles: rolesQuery.data || [],
    departments: departmentsQuery.data || [],

    // Loading states
    isLoading: rolesQuery.isLoading,
    isError: rolesQuery.isError,
    error: rolesQuery.error,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleActiveMutation.isPending ? toggleActiveMutation.variables?.id : null,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,

    // Refetch
    refetch: rolesQuery.refetch,
  };
}
