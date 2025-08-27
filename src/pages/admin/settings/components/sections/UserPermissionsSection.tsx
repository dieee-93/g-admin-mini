// User Permissions Section - Roles and access management
import React from "react";
import { 
  UserGroupIcon, 
  ShieldCheckIcon,
  PlusIcon,
  KeyIcon
} from "@heroicons/react/24/outline";
import { 
  Stack, Typography, CardWrapper, Button, Badge, Avatar, Switch, Grid
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

  return (
    <CardWrapper variant="elevated" >
      <CardWrapper>
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap="sm">
            <HeaderIcon icon={UserGroupIcon}  />
            <Typography variant="heading" level={3}>Permisos de Usuario</Typography>
          </Stack>
          <Stack direction="row" gap="sm">
            <Button  size="sm">
              <Icon icon={PlusIcon} size="sm" />
              Nuevo Rol
            </Button>
            <Button colorPalette="info" size="sm">
              <Icon icon={UserGroupIcon} size="sm" />
              Invitar Usuario
            </Button>
          </Stack>
        </Stack>
      </CardWrapper>
      <CardWrapper>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="xl">
          {/* Roles and Permissions */}
          <CardWrapper variant="outline" >
            <CardWrapper>
              <Stack direction="row" align="center" gap="sm">
                <HeaderIcon icon={ShieldCheckIcon}  />
                <Typography variant="heading" level={4}>Roles del Sistema</Typography>
              </Stack>
            </CardWrapper>
            <CardWrapper>
              <Stack direction="column" gap="md">
                {roles.map((role, index) => (
                  <CardWrapper key={index} variant="subtle" >
                    <CardWrapper>
                      <Stack direction="column" gap="sm">
                        <Stack direction="row" justify="space-between" align="center">
                          <Stack direction="row" align="center" gap="sm">
                            <Badge colorPalette={role.color} variant="subtle">
                              {role.name}
                            </Badge>
                            <Typography variant="caption" color="secondary">
                              {role.users} usuario{role.users !== 1 ? "s" : ""}
                            </Typography>
                          </Stack>
                          <Button size="sm" variant="ghost" >
                            <Icon icon={KeyIcon} size="sm" />
                            Editar
                          </Button>
                        </Stack>
                        <Typography variant="body" color="secondary">
                          {role.description}
                        </Typography>
                        <Stack direction="row" gap="xs" wrap="wrap">
                          {role.permissions.map((permission) => (
                            <Badge key={permission} size="sm" variant="outline" colorPalette="gray">
                              {permission}
                            </Badge>
                          ))}
                        </Stack>
                      </Stack>
                    </CardWrapper>
                  </CardWrapper>
                ))}
              </Stack>
            </CardWrapper>
          </CardWrapper>

          {/* Active Users */}
          <CardWrapper variant="outline" >
            <CardWrapper >
              <Stack direction="row" align="center" gap="sm">
                <HeaderIcon icon={UserGroupIcon}  />
                <Typography variant="heading" level={4}>Usuarios Activos</Typography>
              </Stack>
            </CardWrapper>
            <CardWrapper>
              <Stack direction="column" gap="md">
                {users.map((user, index) => (
                  <CardWrapper key={index} variant="subtle" >
                    <CardWrapper>
                      <Stack direction="column" gap="sm">
                        <Stack direction="row" justify="space-between" align="center">
                          <Stack direction="row" align="center" gap="sm">
                            <Avatar 
                              name={user.name}
                              size="sm"
                            />
                            <Stack direction="column" gap="xs">
                              <Typography variant="body" weight="medium">
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="secondary">
                                {user.email}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Switch 
                            checked={user.status === "active"}
                            colorPalette={user.status === "active" ? "success" : "gray"}
                          />
                        </Stack>
                        <Stack direction="row" justify="space-between" align="center">
                          <Badge colorPalette={getRoleColor(user.role)} variant="subtle">
                            {user.role}
                          </Badge>
                          <Typography variant="caption" color="secondary">
                            {user.lastLogin}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardWrapper>
                  </CardWrapper>
                ))}
              </Stack>
            </CardWrapper>
          </CardWrapper>
        </Grid>
      </CardWrapper>
    </CardWrapper>
  );
}
