// User Permissions Section - Roles and access management
import React from "react";
import {
  Box,
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Switch,
} from "@chakra-ui/react";
import { 
  UserGroupIcon, 
  ShieldCheckIcon,
  PlusIcon,
  KeyIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

export function UserPermissionsSection() {
  const roles = [
    {
      name: "Administrador",
      users: 1,
      permissions: ["all"],
      color: "red",
      description: "Acceso completo al sistema"
    },
    {
      name: "Gerente",
      users: 2,
      permissions: ["operations", "inventory", "reports"],
      color: "blue", 
      description: "Gestión operativa y reportes"
    },
    {
      name: "Empleado",
      users: 5,
      permissions: ["operations", "basic_inventory"],
      color: "green",
      description: "Operaciones básicas"
    },
    {
      name: "Cajero",
      users: 3,
      permissions: ["sales", "customers"],
      color: "orange",
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

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Permisos de Usuario</Heading>
        <HStack gap={2}>
          <Button colorPalette="purple" size="sm">
            <Icon icon={PlusIcon} size="sm" />
            Nuevo Rol
          </Button>
          <Button colorPalette="blue" size="sm">
            <Icon icon={UserGroupIcon} size="sm" />
            Invitar Usuario
          </Button>
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Roles and Permissions */}
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon icon={ShieldCheckIcon} size="md" />
              <Heading size="sm">Roles del Sistema</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              {roles.map((role, index) => (
                <Card.Root key={index} size="sm" variant="outline">
                  <Card.Body>
                    <HStack justify="space-between" mb={2}>
                      <HStack gap={2}>
                        <Badge colorPalette={role.color} size="lg">
                          {role.name}
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          {role.users} usuario{role.users !== 1 ? "s" : ""}
                        </Text>
                      </HStack>
                      <Button size="xs" variant="ghost">
                        <Icon icon={KeyIcon} size="sm" />
                        Editar
                      </Button>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      {role.description}
                    </Text>
                    <HStack gap={1} wrap="wrap">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} size="sm" variant="outline">
                          {permission}
                        </Badge>
                      ))}
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Active Users */}
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon icon={UserGroupIcon} size="md" />
              <Heading size="sm">Usuarios Activos</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              {users.map((user, index) => (
                <Card.Root key={index} size="sm" variant="outline">
                  <Card.Body>
                    <HStack justify="space-between" mb={2}>
                      <HStack gap={3}>
                        <Box
                          w="8"
                          h="8"
                          borderRadius="full"
                          bg="blue.500"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontSize="sm"
                          fontWeight="bold"
                        >
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Box>
                        <VStack align="start" gap={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {user.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {user.email}
                          </Text>
                        </VStack>
                      </HStack>
                      <Switch.Root defaultChecked={user.status === "active"}>
                        <Switch.HiddenInput />
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Switch.Root>
                    </HStack>
                    <HStack justify="space-between">
                      <Badge 
                        colorPalette={
                          user.role === "Administrador" ? "red" :
                          user.role === "Gerente" ? "blue" : "green"
                        }
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {user.lastLogin}
                      </Text>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>
    </Box>
  );
}
