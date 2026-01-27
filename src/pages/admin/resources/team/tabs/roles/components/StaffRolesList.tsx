/**
 * STAFF ROLES LIST
 * 
 * Displays staff roles in a card-based list with actions
 * 
 * @version 1.0.0
 */

import {
  Stack,
  HStack,
  CardWrapper,
  Text,
  Badge,
  Button,
  Switch,
  Icon,
  Box,
  EmptyState,
} from '@/shared/ui';
import {
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { JobRole } from '../../../types/jobRole';

interface StaffRolesListProps {
  roles: JobRole[];
  onEdit: (role: JobRole) => void;
  onDelete: (role: JobRole) => void;
  onToggleActive: (role: JobRole) => void;
  isToggling?: string | null;
}

// Department colors mapping
const DEPARTMENT_COLORS: Record<string, string> = {
  Cocina: 'orange',
  Servicio: 'blue',
  Administracion: 'purple',
  Gerencia: 'red',
  Delivery: 'green',
  Barberia: 'cyan',
  Estilismo: 'pink',
  Consultoria: 'teal',
};

function getDepartmentColor(department?: string | null): string {
  if (!department) return 'gray';
  return DEPARTMENT_COLORS[department] || 'gray';
}

export function StaffRolesList({
  roles,
  onEdit,
  onDelete,
  onToggleActive,
  isToggling,
}: StaffRolesListProps) {
  if (roles.length === 0) {
    return (
      <EmptyState
        icon={UserGroupIcon}
        title="Sin Roles de Trabajo"
        description="Crea roles de trabajo para asignar costos de mano de obra a tus productos"
      />
    );
  }

  // Group roles by department
  const groupedRoles = roles.reduce(
    (acc, role) => {
      const dept = role.department || 'Sin Departamento';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(role);
      return acc;
    },
    {} as Record<string, JobRole[]>
  );

  const departments = Object.keys(groupedRoles).sort((a, b) => {
    if (a === 'Sin Departamento') return 1;
    if (b === 'Sin Departamento') return -1;
    return a.localeCompare(b);
  });

  return (
    <Stack gap={6}>
      {departments.map((department) => (
        <Box key={department}>
          {/* Department Header */}
          <HStack gap={2} mb={3}>
            <Badge colorPalette={getDepartmentColor(department)} size="lg">
              {department}
            </Badge>
            <Text color="gray.500" fontSize="sm">
              {groupedRoles[department].length} roles
            </Text>
          </HStack>

          {/* Roles in department */}
          <Stack gap={2}>
            {groupedRoles[department].map((role) => (
              <CardWrapper key={role.id} variant="outline">
                <CardWrapper.Body p="4">
                  <HStack justify="space-between" align="start" gap={4}>
                    {/* Left: Role Info */}
                    <Stack gap={1} flex={1}>
                      <HStack gap={2}>
                        <Text fontWeight="semibold" fontSize="md">
                          {role.name}
                        </Text>
                        {!role.is_active && (
                          <Badge colorPalette="gray" size="sm">
                            Inactivo
                          </Badge>
                        )}
                      </HStack>
                      
                      {role.description && (
                        <Text color="gray.600" fontSize="sm" lineClamp={1}>
                          {role.description}
                        </Text>
                      )}
                    </Stack>

                    {/* Center: Costing Info */}
                    <Stack gap={0} align="end" minWidth="180px">
                      {role.default_hourly_rate != null && role.default_hourly_rate > 0 ? (
                        <>
                          <HStack gap={1}>
                            <Icon as={CurrencyDollarIcon} boxSize={4} color="green.500" />
                            <Text fontWeight="semibold" color="green.600">
                              ${role.loaded_hourly_cost?.toFixed(2)}/hr
                            </Text>
                          </HStack>
                          <Text color="gray.500" fontSize="xs">
                            ${role.default_hourly_rate.toFixed(2)} x {role.loaded_factor.toFixed(2)}
                          </Text>
                        </>
                      ) : (
                        <Text color="gray.400" fontSize="sm" fontStyle="italic">
                          Sin tarifa definida
                        </Text>
                      )}
                    </Stack>

                    {/* Right: Actions */}
                    <HStack gap={2}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(role)}
                        aria-label="Editar rol"
                      >
                        <Icon as={PencilIcon} boxSize={4} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        colorPalette="red"
                        onClick={() => onDelete(role)}
                        aria-label="Eliminar rol"
                      >
                        <Icon as={TrashIcon} boxSize={4} />
                      </Button>

                      <Switch
                        checked={role.is_active}
                        onCheckedChange={() => onToggleActive(role)}
                        disabled={isToggling === role.id}
                        size="sm"
                      />
                    </HStack>
                  </HStack>
                </CardWrapper.Body>
              </CardWrapper>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
