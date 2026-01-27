/**
 * STAFF ROLES SETTINGS PAGE
 * 
 * Manage job roles for labor costing
 * Route: /admin/settings/staff/roles
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import {
  ContentLayout,
  PageHeader,
  Section,
  Stack,
  Button,
  Badge,
  Box,
  Text,
  Alert,
  HStack,
  Spinner,
  Dialog,
  Icon,
} from '@/shared/ui';
import { PlusIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { StaffRolesList, StaffRoleFormModal } from './components';
import { useStaffRolesPage } from './hooks/useStaffRoles';
import type { StaffRole, StaffRoleFormData } from '../../types/staffRole';

export default function StaffRolesPage() {
  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<StaffRole | null>(null);

  // Data and actions
  const {
    roles,
    departments,
    isLoading,
    isError,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
  } = useStaffRolesPage();

  // Handlers
  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (role: StaffRole) => {
    setEditingRole(role);
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmitForm = async (data: StaffRoleFormData) => {
    if (editingRole) {
      await handleUpdate(editingRole.id, data);
    } else {
      await handleCreate(data);
    }
  };

  const handleOpenDelete = (role: StaffRole) => {
    setDeletingRole(role);
  };

  const handleConfirmDelete = async () => {
    if (deletingRole) {
      await handleDelete(deletingRole.id);
      setDeletingRole(null);
    }
  };

  const handleCancelDelete = () => {
    setDeletingRole(null);
  };

  // Stats
  const activeRoles = roles.filter((r) => r.is_active).length;
  const rolesWithRates = roles.filter((r) => r.default_hourly_rate != null && r.default_hourly_rate > 0).length;

  // Loading state
  if (isLoading) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader title="Roles de Trabajo" />
        <Box p="8" textAlign="center">
          <Spinner size="lg" />
          <Text mt="4">Cargando roles...</Text>
        </Box>
      </ContentLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader title="Roles de Trabajo" />
        <Alert status="error" title="Error al cargar roles">
          {error?.message || 'No se pudieron cargar los roles de trabajo'}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Roles de Trabajo"
        subtitle="Configura roles de trabajo para asignar costos de mano de obra a productos"
        action={
          <Button colorPalette="purple" onClick={handleOpenCreate}>
            <PlusIcon style={{ width: 20, height: 20 }} />
            Nuevo Rol
          </Button>
        }
      />

      <Stack gap="6">
        {/* Stats Summary */}
        <HStack gap="4">
          <Badge colorPalette="blue" size="lg">
            {roles.length} roles totales
          </Badge>
          <Badge colorPalette="green" size="lg">
            {activeRoles} activos
          </Badge>
          <Badge colorPalette="purple" size="lg">
            {rolesWithRates} con tarifa
          </Badge>
          <Badge colorPalette="orange" size="lg">
            {departments.length} departamentos
          </Badge>
        </HStack>

        {/* Info Alert */}
        <Alert status="info" title="Roles de Trabajo vs Roles del Sistema">
          <Text fontSize="sm">
            Los <strong>Roles de Trabajo</strong> (Cocinero, Mesero, etc.) se usan para calcular 
            costos de mano de obra en productos. Son diferentes a los <strong>Roles del Sistema</strong> 
            (Admin, Supervisor) que controlan permisos de acceso al panel.
          </Text>
        </Alert>

        {/* Empty State with Seed Option */}
        {roles.length === 0 && (
          <Section variant="elevated" title="Comienza creando roles">
            <Stack gap="4" align="center" py="8">
              <SparklesIcon style={{ width: 48, height: 48, color: 'var(--colors-purple-500)' }} />
              <Text textAlign="center" maxWidth="md">
                No tienes roles de trabajo configurados. Puedes crear roles manualmente 
                o usar plantillas predefinidas para tu tipo de negocio.
              </Text>
              <HStack gap="3">
                <Button variant="outline" onClick={handleOpenCreate}>
                  Crear Manualmente
                </Button>
              </HStack>
            </Stack>
          </Section>
        )}

        {/* Roles List */}
        {roles.length > 0 && (
          <Section variant="flat" title="Roles Configurados">
            <StaffRolesList
              roles={roles}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleActive={handleToggleActive}
              isToggling={isToggling}
            />
          </Section>
        )}
      </Stack>

      {/* Form Modal */}
      <StaffRoleFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        role={editingRole}
        isSubmitting={isCreating || isUpdating}
        departments={departments}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!deletingRole}
        onOpenChange={(details) => !details.open && handleCancelDelete()}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                <Stack direction="row" align="center" gap="2">
                  <Icon icon={ExclamationTriangleIcon} size="md" color="red.500" />
                  Eliminar Rol
                </Stack>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack direction="column" gap="3">
                <Text>
                  ¿Estas seguro que deseas eliminar el rol{' '}
                  <strong>{deletingRole?.name}</strong>?
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  Esta accion no se puede deshacer. Si el rol esta asignado a productos,
                  la eliminacion fallara.
                </Text>
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap="3" justify="end">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  colorPalette="red"
                  onClick={handleConfirmDelete}
                  loading={isDeleting}
                >
                  Eliminar
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </ContentLayout>
  );
}
