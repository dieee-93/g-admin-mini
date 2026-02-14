import { useState } from 'react';
import {
  Stack,
  HStack,
  Button,
  Alert,
  Modal,
  Icon,
  SelectField,
  Text,
  Badge,
} from '@/shared/ui';
import {
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { PanelUser, SystemRole } from '../hooks/useUsersPage';

interface EditUserRoleModalProps {
  user: PanelUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role: SystemRole) => Promise<void>;
}

const ROLE_OPTIONS = [
  { label: 'Operador — acceso a operaciones básicas', value: 'OPERADOR' },
  { label: 'Supervisor — gestión operativa', value: 'SUPERVISOR' },
  { label: 'Administrador — control completo', value: 'ADMINISTRADOR' },
];

export function EditUserRoleModal({ user, isOpen, onClose, onSave }: EditUserRoleModalProps) {
  const [role, setRole] = useState<SystemRole>(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (role === user.role) { onClose(); return; }
    setError('');
    setIsLoading(true);
    try {
      await onSave(user.id, role);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar rol');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <Modal.Content>
        <Modal.Header>
          <HStack gap="2">
            <Icon icon={ShieldCheckIcon} size="sm" />
            Cambiar Rol
          </HStack>
          <Modal.CloseTrigger onClick={onClose}>
            <Icon icon={XMarkIcon} size="sm" />
          </Modal.CloseTrigger>
        </Modal.Header>

        <Modal.Body>
          <Stack gap="4">
            {error && (
              <Alert status="error">
                <Alert.Indicator />
                <Alert.Description>{error}</Alert.Description>
              </Alert>
            )}

            <Stack gap="1">
              <Text fontWeight="semibold">{user.full_name || user.email}</Text>
              <Text fontSize="sm" color="fg.muted">{user.email}</Text>
              {user.team_member && (
                <Badge variant="outline" colorPalette="blue" w="fit-content">
                  {user.team_member.position}
                </Badge>
              )}
            </Stack>

            <SelectField
              label="Nuevo Rol"
              value={[role]}
              onValueChange={({ value }) => setRole(value[0] as SystemRole)}
              options={ROLE_OPTIONS}
              disabled={isLoading}
              noPortal
            />
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <HStack gap="3" justify="end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSave}
              loading={isLoading}
              disabled={role === user.role}
            >
              Guardar
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
