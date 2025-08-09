// SettingsHeader with configuration status and quick actions
import React from "react";
import {
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Stat,
} from "@chakra-ui/react";
import { 
  BuildingOfficeIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  LinkIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

export function SettingsHeader() {
  const configStatus = [
    {
      label: "Perfil Empresarial",
      value: "Completo",
      change: "100%",
      color: "green",
      icon: BuildingOfficeIcon
    },
    {
      label: "Configuración Fiscal", 
      value: "Configurado",
      change: "IVA 21%",
      color: "blue",
      icon: CurrencyDollarIcon
    },
    {
      label: "Permisos",
      value: "3 Roles",
      change: "Activos",
      color: "purple", 
      icon: ShieldCheckIcon
    },
    {
      label: "Integraciones",
      value: "2 Activas",
      change: "APIs OK",
      color: "orange",
      icon: LinkIcon
    }
  ];

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">Configuraciones del Sistema</Heading>
          <Button colorPalette="blue" size="sm">
            <Icon icon={CheckCircleIcon} size="sm" />
            Validar Configuración
          </Button>
        </Flex>

        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
          {configStatus.map((status) => (
            <Card.Root key={status.label} size="sm">
              <Card.Body>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontSize="sm" color="gray.600">
                      {status.label}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {status.value}
                    </Text>
                    <Badge colorPalette={status.color} size="sm">
                      {status.change}
                    </Badge>
                  </VStack>
                  <Icon 
                    icon={status.icon} 
                    size="md" 
                    className={`text-${status.color}-500`}
                  />
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
