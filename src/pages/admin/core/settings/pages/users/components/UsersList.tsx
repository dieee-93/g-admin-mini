import {
  Stack,
  HStack,
  Badge,
  Button,
  Icon,
  Avatar,
  Text,
  Spinner,
  Alert,
  CardWrapper,
  Menu,
} from '@/shared/ui';
import {
  PencilIcon,
  UserCircleIcon,
  BriefcaseIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import type { PanelUser, SystemRole } from '../hooks/useUsersPage';

const ROLE_COLORS: Record<SystemRole, 'red' | 'orange' | 'blue' | 'gray'> = {
  SUPER_ADMIN: 'red',
  ADMINISTRADOR: 'orange',
  SUPERVISOR: 'blue',
  OPERADOR: 'gray',
};

const ROLE_LABELS: Record<SystemRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERADOR: 'Operador',
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Nunca';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}

interface UsersListProps {
  users: PanelUser[];
  isLoading: boolean;
  error: string | null;
  onEditUser: (user: PanelUser) => void;
}

export function UsersList({ users, isLoading, error, onEditUser }: UsersListProps) {
  if (isLoading) {
    return (
      <Stack align="center" py="8">
        <Spinner size="lg" />
        <Text color="fg.muted">Cargando usuarios...</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert status="error" title="Error al cargar usuarios">
        {error}
      </Alert>
    );
  }

  if (users.length === 0) {
    return (
      <Stack align="center" py="8" gap="3">
        <Icon icon={UserCircleIcon} size="xl" color="fg.muted" />
        <Text color="fg.muted">No hay usuarios con acceso al panel.</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="1">
      {users.map((user) => (
        <CardWrapper key={user.id} variant="outline" padding="sm">
          <HStack justify="space-between" align="center" gap="3">
            {/* Avatar + Info */}
            <HStack gap="2" flex="1" minW="0">
              <Avatar
                name={user.full_name || user.email}
                size="xs"
              />
              <Stack gap="0" flex="1" minW="0">
                <Text fontWeight="medium" fontSize="sm" truncate>
                  {user.full_name || user.email || '(sin nombre)'}
                </Text>
                {user.full_name && (
                  <Text fontSize="xs" color="fg.muted" truncate>
                    {user.email}
                  </Text>
                )}
              </Stack>
            </HStack>

            {/* Role Badge */}
            <Badge colorPalette={ROLE_COLORS[user.role]} variant="subtle">
              {ROLE_LABELS[user.role] || user.role}
            </Badge>

            {/* Employee Link */}
            {user.team_member ? (
              <HStack gap="1" flexShrink={0}>
                <Icon icon={BriefcaseIcon} size="xs" color="blue.500" />
                <Text fontSize="sm" color="blue.600">
                  {user.team_member.position}
                </Text>
              </HStack>
            ) : (
              <Text fontSize="sm" color="fg.subtle" flexShrink={0}>
                Solo admin
              </Text>
            )}

            {/* Last Login */}
            <HStack gap="1" flexShrink={0} display={{ base: 'none', md: 'flex' }}>
              <Icon icon={ClockIcon} size="xs" color="fg.muted" />
              <Text fontSize="sm" color="fg.muted">
                {formatRelativeTime(user.last_sign_in_at)}
              </Text>
            </HStack>

            {/* Actions Menu */}
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Acciones"
                >
                  <Icon icon={EllipsisVerticalIcon} size="xs" />
                </Button>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item
                  value="edit-role"
                  onClick={() => onEditUser(user)}
                >
                  <Icon icon={PencilIcon} size="xs" />
                  Cambiar rol
                </Menu.Item>
                {user.team_member && (
                  <>
                    <Menu.Separator />
                    <Menu.Item
                      value="view-employee"
                      onClick={() => {
                        window.location.href = `/admin/resources/team?memberId=${user.team_member?.id}`;
                      }}
                    >
                      <Icon icon={BriefcaseIcon} size="xs" />
                      Ver perfil de empleado
                    </Menu.Item>
                  </>
                )}
                {!user.team_member && (
                  <>
                    <Menu.Separator />
                    <Menu.Item
                      value="link-employee"
                      onClick={() => {
                        // TODO: Open link employee modal
                        console.log('Link to employee', user.id);
                      }}
                    >
                      <Icon icon={LinkIcon} size="xs" />
                      Vincular con empleado
                    </Menu.Item>
                  </>
                )}
              </Menu.Content>
            </Menu.Root>
          </HStack>
        </CardWrapper>
      ))}
    </Stack>
  );
}
