import {
  ContentLayout,
  Section,
  Stack,
  HStack,
  Button,
  Icon,
  Text,
  Badge,
} from '@/shared/ui';
import {
  UserPlusIcon,
  UsersIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useUsersPage } from './hooks/useUsersPage';
import { UsersList } from './components/UsersList';
import { InviteUserModal } from './components/InviteUserModal';
import { EditUserRoleModal } from './components/EditUserRoleModal';

export default function UsersPage() {
  const navigate = useNavigate();
  const {
    users,
    isLoading,
    error,
    isInviteModalOpen,
    editingUser,
    openInviteModal,
    closeInviteModal,
    openEditModal,
    closeEditModal,
    updateRole,
    onUserInvited,
  } = useUsersPage();

  return (
    <ContentLayout spacing="normal">
      <Stack gap="4">

        {/* Header compacto — breadcrumb + título + acción en bloque único */}
        <HStack justify="space-between" align="center">
          <HStack gap="3" align="center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/core/settings')}
              px="2"
            >
              <Icon icon={ChevronLeftIcon} size="xs" />
              Configuración
            </Button>

            <Text color="fg.subtle">/</Text>

            <HStack gap="2" align="center">
              <Icon icon={UsersIcon} size="sm" color="blue.500" />
              <Text fontWeight="semibold" fontSize="lg">Gestión de Usuarios</Text>
              <Badge colorPalette="blue" variant="subtle" size="sm">
                {users.length} activos
              </Badge>
            </HStack>
          </HStack>

          <Button colorPalette="blue" size="sm" onClick={openInviteModal}>
            <Icon icon={UserPlusIcon} size="xs" />
            Invitar Usuario
          </Button>
        </HStack>

        {/* Lista de usuarios */}
        <Section
          variant="outline"
          title="Usuarios del Panel"
          description="Personas con credenciales de acceso al sistema"
        >
          <UsersList
            users={users}
            isLoading={isLoading}
            error={error}
            onEditUser={openEditModal}
          />
        </Section>

        {/* Leyenda de roles — compacta */}
        <HStack gap="6" px="1" flexWrap="wrap">
          <Text fontSize="xs" color="fg.subtle" fontWeight="semibold" flexShrink={0}>
            Roles:
          </Text>
          {[
            { label: 'Operador', desc: 'Ventas y caja' },
            { label: 'Supervisor', desc: 'Gestión operativa' },
            { label: 'Administrador', desc: 'Control completo' },
          ].map(({ label, desc }) => (
            <Text key={label} fontSize="xs" color="fg.subtle">
              <strong>{label}</strong> — {desc}
            </Text>
          ))}
          <Text fontSize="xs" color="fg.subtle">
            Para vincular con un empleado →{' '}
            <Button variant="link" size="xs" onClick={() => navigate('/admin/resources/team')}>
              Equipo
            </Button>
          </Text>
        </HStack>

      </Stack>

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={closeInviteModal}
        onSuccess={onUserInvited}
      />

      {editingUser && (
        <EditUserRoleModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={closeEditModal}
          onSave={updateRole}
        />
      )}
    </ContentLayout>
  );
}
