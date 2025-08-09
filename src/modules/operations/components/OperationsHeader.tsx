// OperationsHeader with KPIs and quick actions
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
  ClockIcon, 
  UsersIcon, 
  FireIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

export function OperationsHeader() {
  const kpis = [
    {
      label: "Órdenes Activas",
      value: "12",
      change: "+3",
      color: "orange",
      icon: ClockIcon
    },
    {
      label: "Mesas Ocupadas", 
      value: "8/15",
      change: "53%",
      color: "blue",
      icon: UsersIcon
    },
    {
      label: "Cocina Status",
      value: "Normal",
      change: "2 min avg",
      color: "green", 
      icon: FireIcon
    },
    {
      label: "Alertas",
      value: "2",
      change: "Atención",
      color: "red",
      icon: ExclamationTriangleIcon
    }
  ];

  return (
    <Card.Root>
      <Card.Body>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">Centro de Operaciones</Heading>
          <Button colorPalette="purple" size="sm">
            <Icon icon={ChartBarIcon} size="sm" />
            Dashboard Completo
          </Button>
        </Flex>

        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
          {kpis.map((kpi) => (
            <Card.Root key={kpi.label} size="sm">
              <Card.Body>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontSize="sm" color="gray.600">
                      {kpi.label}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold">
                      {kpi.value}
                    </Text>
                    <Badge colorPalette={kpi.color} size="sm">
                      {kpi.change}
                    </Badge>
                  </VStack>
                  <Icon 
                    icon={kpi.icon} 
                    size="md" 
                    className={`text-${kpi.color}-500`}
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
