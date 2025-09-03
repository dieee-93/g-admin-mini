// User Permissions Section - Roles and access management
import React from "react";
import { 
  UserGroupIcon, 
  ShieldCheckIcon,
  PlusIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon,
  LockClosedIcon,
  UserIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { 
  Stack, Typography, CardWrapper, Section, Button, Badge, Avatar, Switch, SimpleGrid, MetricCard, ActionButton, Alert
} from "@/shared/ui";
import { Icon, HeaderIcon } from "@/shared/ui/Icon";

export function UserPermissionsSection() {
  const roles = [
    {
      name: "Administrador",
      users: 1,
      permissions: ["all"],
      color: "error" as const,
      description: "Acceso completo al sistema"
    },
    {
      name: "Gerente",
      users: 2,
      permissions: ["operations", "inventory", "reports"],
      color: "info" as const, 
      description: "Gestión operativa y reportes"
    },
    {
      name: "Empleado",
      users: 5,
      permissions: ["operations", "basic_inventory"],
      color: "success" as const,
      description: "Operaciones básicas"
    },
    {
      name: "Cajero",
      users: 3,
      permissions: ["sales", "customers"],
      color: "warning" as const,
      description: "Ventas y atención al cliente"
    }
  ];

  const users = [
    {
      name: "María García",
      email: "maria@elbuenpan.com",
      role: "Administrador",
      status: "active",
      lastLogin: "Hace 2 horas"
    },
    {
      name: "Juan Pérez", 
      email: "juan@elbuenpan.com",
      role: "Gerente",
      status: "active",
      lastLogin: "Hace 1 día"
    },
    {
      name: "Ana López",
      email: "ana@elbuenpan.com", 
      role: "Empleado",
      status: "inactive",
      lastLogin: "Hace 1 semana"
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrador": return "error" as const;
      case "Gerente": return "info" as const;
      case "Empleado": return "success" as const;
      default: return "warning" as const;
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRoles = roles.length;
  const totalPermissions = [...new Set(roles.flatMap(r => r.permissions))].length;

  return (
    <Section variant="elevated" title="Permisos de Usuario">
      <Stack direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap="md" mb="xl">
        <div />
        <Button colorPalette="success" size="sm">
          <Icon icon={UserGroupIcon} size="sm" />
          Invitar Usuario
        </Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="xl">
        {/* Roles Configuration */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" justify="space-between" align="center">
              <CardWrapper.Title>Gestión de Roles</CardWrapper.Title>
              <Badge variant="solid" colorPalette="blue">
                <Icon icon={ShieldCheckIcon} size="xs" />
                {totalRoles} roles
              </Badge>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="lg">
              {/* Roles Stats */}
              <MetricCard
                title="Total de Permisos"
                value={`${totalPermissions}`}
                subtitle="módulos configurados"
                icon={LockClosedIcon}
                colorPalette="blue"
                badge={{
                  value: "Sistema",
                  colorPalette: "blue"
                }}
              />
              
              {/* Roles List */}
              <Stack direction="column" gap="sm">
                <Typography variant="subtitle" weight="semibold" color="text.muted">Roles Configurados</Typography>
                {roles.map((role, index) => (
                  <Stack 
                    key={index}
                    direction="row" 
                    justify="space-between" 
                    align="center"
                    p="sm"
                    bg={role.color === 'error' ? "red.50" : 
                        role.color === 'info' ? "blue.50" : 
                        role.color === 'success' ? "green.50" : "orange.50"}
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderColor={role.color === 'error' ? "red.400" : 
                               role.color === 'info' ? "blue.400" : 
                               role.color === 'success' ? "green.400" : "orange.400"}
                  >
                    <Stack direction="row" align="center" gap="sm">
                      <Icon 
                        icon={role.color === 'error' ? ShieldCheckIcon : 
                              role.color === 'info' ? CogIcon : 
                              role.color === 'success' ? UserIcon : KeyIcon} 
                        size="sm" 
                        color={role.color === 'error' ? "red.500" : 
                               role.color === 'info' ? "blue.500" : 
                               role.color === 'success' ? "green.500" : "orange.500"}
                      />
                      <Stack gap="xs">
                        <Stack direction="row" align="center" gap="sm">
                          <Typography variant="body" size="sm" fontWeight="medium">
                            {role.name}
                          </Typography>
                          <Badge 
                            variant="solid"
                            colorPalette={role.color}
                            size="sm"
                          >
                            {role.users} usuario{role.users !== 1 ? "s" : ""}
                          </Badge>
                        </Stack>
                        <Typography variant="body" size="xs" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" align="center" gap="sm">
                      <Typography 
                        variant="body" 
                        weight="bold"
                        color={role.color === 'error' ? "red.700" : 
                               role.color === 'info' ? "blue.700" : 
                               role.color === 'success' ? "green.700" : "orange.700"}
                      >
                        {role.permissions.length} permisos
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              
              {/* Quick Actions */}
              <Stack direction="row" gap="sm" mt="sm">
                <ActionButton size="sm" colorPalette="blue" variant="outline">
                  <Icon icon={PlusIcon} size="xs" />
                  Nuevo Rol
                </ActionButton>
                <ActionButton size="sm" colorPalette="gray" variant="ghost">
                  <Icon icon={KeyIcon} size="xs" />
                  Configurar Permisos
                </ActionButton>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Users Management */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" justify="space-between" align="center">
              <CardWrapper.Title>Usuarios del Sistema</CardWrapper.Title>
              <Badge variant="subtle" colorPalette="green">
                <Icon icon={CheckCircleIcon} size="xs" />
                {activeUsers}/{totalUsers} activos
              </Badge>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="lg">
              {/* Users Stats */}
              <SimpleGrid columns={2} gap="sm">
                <MetricCard
                  title="Usuarios Activos"
                  value={`${activeUsers}`}
                  subtitle="conectados"
                  icon={CheckCircleIcon}
                  colorPalette="green"
                  badge={{
                    value: `${Math.round((activeUsers/totalUsers)*100)}%`,
                    colorPalette: "green"
                  }}
                />
                <MetricCard
                  title="Total Usuarios"
                  value={`${totalUsers}`}
                  subtitle="registrados"
                  icon={UserGroupIcon}
                  colorPalette="blue"
                />
              </SimpleGrid>
              
              {/* Users List */}
              <Stack direction="column" gap="sm">
                <Typography variant="subtitle" weight="semibold" color="text.muted">Usuarios Registrados</Typography>
                {users.map((user, index) => (
                  <Stack 
                    key={index}
                    direction="row" 
                    justify="space-between" 
                    align="center"
                    p="sm"
                    bg={user.status === 'active' ? "green.50" : "gray.50"}
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderColor={user.status === 'active' ? "green.400" : "gray.300"}
                  >
                    <Stack direction="row" align="center" gap="sm">
                      <Icon 
                        icon={user.status === 'active' ? CheckCircleIcon : ExclamationTriangleIcon} 
                        size="sm" 
                        color={user.status === 'active' ? "green.500" : "gray.400"}
                      />
                      <Avatar 
                        name={user.name}
                        size="sm"
                      />
                      <Stack gap="xs">
                        <Stack direction="row" align="center" gap="sm">
                          <Typography variant="body" size="sm" fontWeight="medium">
                            {user.name}
                          </Typography>
                          <Badge 
                            variant="solid"
                            colorPalette={getRoleColor(user.role)}
                            size="sm"
                          >
                            {user.role}
                          </Badge>
                        </Stack>
                        <Typography variant="body" size="xs" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" align="center" gap="sm">
                      <Stack direction="column" align="end" gap="xs">
                        <Badge 
                          variant="solid" 
                          colorPalette={user.status === 'active' ? "green" : "gray"}
                          size="sm"
                        >
                          {user.status === 'active' ? "Activo" : "Inactivo"}
                        </Badge>
                        <Typography variant="body" size="xs" color="text.secondary">
                          {user.lastLogin}
                        </Typography>
                      </Stack>
                      <Switch 
                        checked={user.status === "active"}
                        colorPalette={user.status === "active" ? "green" : "gray"}
                      />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              
              {/* Quick Actions */}
              <Stack direction="row" gap="sm" mt="sm">
                <ActionButton size="sm" colorPalette="green" variant="outline">
                  <Icon icon={PlusIcon} size="xs" />
                  Nuevo Usuario
                </ActionButton>
                <ActionButton size="sm" colorPalette="gray" variant="ghost">
                  <Icon icon={ClockIcon} size="xs" />
                  Ver Actividad
                </ActionButton>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Security Status */}
      <CardWrapper>
        <CardWrapper.Header>
          <Stack direction="row" justify="space-between" align="center">
            <CardWrapper.Title>Estado de Seguridad</CardWrapper.Title>
            <Badge variant="subtle" colorPalette="orange">
              <Icon icon={ExclamationTriangleIcon} size="xs" />
              1 Recomendación
            </Badge>
          </Stack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Stack gap="lg">
            {/* Security Alert */}
            <Alert status="warning" variant="subtle">
              <Icon icon={ExclamationTriangleIcon} />
              <Stack gap="xs">
                <Typography variant="body" weight="semibold">Revisión recomendada</Typography>
                <Typography variant="body" size="sm">
                  Algunos usuarios no han iniciado sesión recientemente
                </Typography>
              </Stack>
            </Alert>
            
            {/* Security Metrics */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="md">
              <MetricCard
                title="Autenticación"
                value="✓"
                subtitle="Configurada"
                icon={CheckCircleIcon}
                colorPalette="green"
                badge={{
                  value: "OK",
                  colorPalette: "green"
                }}
              />
              
              <MetricCard
                title="Roles"
                value="✓"
                subtitle="Definidos"
                icon={ShieldCheckIcon}
                colorPalette="blue"
                badge={{
                  value: `${totalRoles}`,
                  colorPalette: "blue"
                }}
              />
              
              <MetricCard
                title="Usuarios"
                value="⚠"
                subtitle="Revisar inactivos"
                icon={ExclamationTriangleIcon}
                colorPalette="orange"
                badge={{
                  value: `${totalUsers - activeUsers}`,
                  colorPalette: "orange"
                }}
              />
              
              <MetricCard
                title="Permisos"
                value="✓"
                subtitle="Asignados"
                icon={LockClosedIcon}
                colorPalette="purple"
                badge={{
                  value: `${totalPermissions}`,
                  colorPalette: "purple"
                }}
              />
            </SimpleGrid>
            
            {/* Security Actions */}
            <Stack direction="row" gap="sm">
              <ActionButton size="sm" colorPalette="orange">
                <Icon icon={ClockIcon} size="xs" />
                Revisar Usuarios Inactivos
              </ActionButton>
              <ActionButton size="sm" colorPalette="blue" variant="outline">
                <Icon icon={ShieldCheckIcon} size="xs" />
                Auditar Permisos
              </ActionButton>
              <ActionButton size="sm" colorPalette="gray" variant="ghost">
                <Icon icon={ChartBarIcon} size="xs" />
                Reporte de Seguridad
              </ActionButton>
            </Stack>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    </Section>
  );
}