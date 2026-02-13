import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export type SystemRole = 'OPERADOR' | 'SUPERVISOR' | 'ADMINISTRADOR' | 'SUPER_ADMIN';

export interface PanelUser {
  id: string;
  email: string;
  full_name: string;
  role: SystemRole;
  created_at: string;
  last_sign_in_at: string | null;
  team_member: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
    department: string;
  } | null;
}

async function fetchPanelUsers(): Promise<PanelUser[]> {
  // Nueva arquitectura: profiles JOIN users_roles
  // Se usa profiles como base para evitar SECURITY DEFINER
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at,
      last_login_at,
      users_roles!inner (
        role,
        is_active
      ),
      team_members (
        id,
        first_name,
        last_name,
        position,
        department
      )
    `)
    .eq('users_roles.is_active', true)
    .neq('users_roles.role', 'CLIENTE')
    .order('full_name');

  if (error) throw error;
  if (!data) return [];

  return data.map((r: any) => ({
    id: r.id,
    email: r.email || '',
    full_name: r.full_name || '',
    role: (Array.isArray(r.users_roles) ? r.users_roles[0]?.role : r.users_roles?.role) as SystemRole,
    created_at: r.created_at || '',
    last_sign_in_at: r.last_login_at || null,
    team_member: r.team_members ? {
      id: r.team_members.id,
      first_name: r.team_members.first_name || '',
      last_name: r.team_members.last_name || '',
      position: r.team_members.position || '',
      department: r.team_members.department || '',
    } : null,
  })) as PanelUser[];
}

async function updateUserRole(userId: string, role: SystemRole): Promise<void> {
  const { error } = await supabase
    .from('users_roles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_active', true);
  if (error) throw error;
}

export function useUsersPage() {
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PanelUser | null>(null);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['panel-users'],
    queryFn: fetchPanelUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: SystemRole }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-users'] });
    },
    onError: (err) => {
      logger.error('App', 'Failed to update user role', err);
    },
  });

  return {
    users,
    isLoading,
    error: error ? (error as Error).message : null,
    isInviteModalOpen,
    editingUser,
    openInviteModal: () => setIsInviteModalOpen(true),
    closeInviteModal: () => setIsInviteModalOpen(false),
    openEditModal: (user: PanelUser) => setEditingUser(user),
    closeEditModal: () => setEditingUser(null),
    updateRole: (userId: string, role: SystemRole) =>
      updateRoleMutation.mutateAsync({ userId, role }),
    isUpdatingRole: updateRoleMutation.isPending,
    onUserInvited: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-users'] });
      setIsInviteModalOpen(false);
    },
  };
}
