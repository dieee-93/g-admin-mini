/**
 * USE STAFF ROLES HOOK
 * 
 * React Query hooks for staff roles CRUD operations
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import {
  getStaffRoles,
  getStaffRole,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole,
  getStaffRoleDepartments,
} from '@/modules/team/services/index';
import type { JobRole, StaffRoleFormData, StaffRoleFilters } from '@/modules/team/types/index';

// Query keys
export const staffRolesKeys = {
  all: ['staff-roles'] as const,
  lists: () => [...staffRolesKeys.all, 'list'] as const,
  list: (filters?: StaffRoleFilters) => [...staffRolesKeys.lists(), filters] as const,
  details: () => [...staffRolesKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffRolesKeys.details(), id] as const,
  departments: () => [...staffRolesKeys.all, 'departments'] as const,
};

/**
 * Hook to fetch all staff roles
 */
export function useStaffRoles(filters?: StaffRoleFilters) {
  return useQuery({
    queryKey: staffRolesKeys.list(filters),
    queryFn: () => getStaffRoles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single staff role
 */
export function useStaffRole(id: string | undefined) {
  return useQuery({
    queryKey: staffRolesKeys.detail(id || ''),
    queryFn: () => getStaffRole(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch unique departments
 */
export function useStaffRoleDepartments() {
  return useQuery({
    queryKey: staffRolesKeys.departments(),
    queryFn: getStaffRoleDepartments,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to create a staff role
 */
export function useCreateStaffRole() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  return useMutation({
    mutationFn: (data: StaffRoleFormData) => {
      if (!organization?.id) {
        throw new Error('No organization selected');
      }
      return createStaffRole(data, organization.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffRolesKeys.all });
    },
  });
}

/**
 * Hook to update a staff role
 */
export function useUpdateStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffRoleFormData> }) =>
      updateStaffRole(id, data),
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: staffRolesKeys.lists() });
      queryClient.setQueryData(staffRolesKeys.detail(updatedRole.id), updatedRole);
    },
  });
}

/**
 * Hook to delete a staff role
 */
export function useDeleteStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStaffRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffRolesKeys.all });
    },
  });
}

/**
 * Hook to toggle staff role active status
 */
export function useToggleStaffRoleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateStaffRole(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffRolesKeys.lists() });
    },
  });
}

/**
 * Combined hook for the StaffRoles page
 */
export function useStaffRolesPage() {
  const rolesQuery = useStaffRoles();
  const departmentsQuery = useStaffRoleDepartments();
  const createMutation = useCreateStaffRole();
  const updateMutation = useUpdateStaffRole();
  const deleteMutation = useDeleteStaffRole();
  const toggleActiveMutation = useToggleStaffRoleActive();

  const handleCreate = async (data: StaffRoleFormData): Promise<void> => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (id: string, data: Partial<StaffRoleFormData>): Promise<void> => {
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
