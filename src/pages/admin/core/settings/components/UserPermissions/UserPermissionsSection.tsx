// User Permissions Section — migrated to dedicated Users page
import { useNavigate } from 'react-router-dom';
import {
  Stack,
  HStack,
  Button,
  Alert,
  Icon,
  Text,
  CardWrapper,
} from '@/shared/ui';
import { UsersIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export function UserPermissionsSection() {
  const navigate = useNavigate();

  return (
    <CardWrapper variant="outline" padding="lg">
      <Stack gap="4">
        <HStack gap="3">
          <Icon icon={UsersIcon} size="md" color="blue.500" />
          <Stack gap="0">
            <Text fontWeight="semibold">Gestión de Usuarios</Text>
            <Text fontSize="sm" color="fg.muted">
              Administración de accesos, roles y permisos del panel
            </Text>
          </Stack>
        </HStack>

        <Alert variant="subtle" status="info">
          <Alert.Indicator />
          <Alert.Description>
            La gestión de usuarios ahora tiene su propia página dedicada con funcionalidad completa.
          </Alert.Description>
        </Alert>

        <Button
          colorPalette="blue"
          variant="outline"
          onClick={() => navigate('/admin/core/settings/users')}
          alignSelf="start"
        >
          <Icon icon={ArrowTopRightOnSquareIcon} size="sm" />
          Ir a Gestión de Usuarios
        </Button>
      </Stack>
    </CardWrapper>
  );
}
