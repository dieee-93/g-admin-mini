// Planning Section for production calendar and planning
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
} from "@chakra-ui/react";
import { 
  CalendarIcon, 
  PlusIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/components/ui/Icon";

export function PlanningSection() {
  const todayPlans = [
    {
      id: "1",
      item: "Pan de molde",
      quantity: 50,
      startTime: "06:00",
      estimatedDuration: 180,
      status: "in_progress",
      priority: "high"
    },
    {
      id: "2", 
      item: "Croissants",
      quantity: 30,
      startTime: "07:30",
      estimatedDuration: 120,
      status: "pending",
      priority: "medium"
    }
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Planificación de Producción</Heading>
        <Button colorPalette="purple" size="sm">
          <Icon icon={PlusIcon} size="sm" />
          Nueva Planificación
        </Button>
      </HStack>

      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
        {/* Calendar View */}
        <Card.Root>
          <Card.Header>
            <Heading size="sm">Calendario de Hoy</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              {todayPlans.map((plan) => (
                <Card.Root key={plan.id} size="sm" variant="outline">
                  <Card.Body>
                    <HStack justify="space-between">
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold">{plan.item}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {plan.quantity} unidades
                        </Text>
                        <HStack gap={2}>
                          <Icon icon={ClockIcon} size="sm" />
                          <Text fontSize="sm">
                            {plan.startTime} - {plan.estimatedDuration}min
                          </Text>
                        </HStack>
                      </VStack>
                      <VStack gap={2}>
                        <Badge 
                          colorPalette={plan.status === "in_progress" ? "blue" : "gray"}
                        >
                          {plan.status === "in_progress" ? "En Curso" : "Pendiente"}
                        </Badge>
                        <Badge 
                          colorPalette={plan.priority === "high" ? "red" : "yellow"}
                          size="sm"
                        >
                          {plan.priority === "high" ? "Alta" : "Media"}
                        </Badge>
                      </VStack>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Quick Stats */}
        <Card.Root>
          <Card.Header>
            <Heading size="sm">Resumen del Día</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  6
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Planificaciones Hoy
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  4h 30m
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Tiempo Total Estimado
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  85%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Cumplimiento Semanal
                </Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>
    </Box>
  );
}
