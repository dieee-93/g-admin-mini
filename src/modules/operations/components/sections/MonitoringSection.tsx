// Monitoring Section for real-time metrics and alerts
import React from "react";
import {
  Box,
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Progress,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

export function MonitoringSection() {
  const metrics = [
    {
      title: "Tiempo Promedio de Preparación",
      value: "8.5 min",
      target: "< 10 min", 
      status: "good",
      trend: "↓ 2min vs ayer"
    },
    {
      title: "Órdenes Completadas Hoy",
      value: "47",
      target: "50 órdenes",
      status: "warning", 
      trend: "94% del objetivo"
    },
    {
      title: "Tiempo Promedio de Mesa",
      value: "45 min",
      target: "40-60 min",
      status: "good",
      trend: "Dentro del rango"
    },
    {
      title: "Satisfacción Cliente",
      value: "4.7/5",
      target: "> 4.5",
      status: "excellent",
      trend: "↑ 0.2 vs semana pasada"
    }
  ];

  const alerts = [
    {
      id: "1",
      type: "warning", 
      message: "Mesa 7 esperando más de 15min por su orden",
      time: "hace 2 min"
    },
    {
      id: "2",
      type: "info",
      message: "Inventario de harina se está agotando",
      time: "hace 5 min" 
    }
  ];

  return (
    <Box>
      <Heading size="md" mb={6}>Dashboard de Monitoreo</Heading>

      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
        {/* Metrics Grid */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          {metrics.map((metric) => (
            <Card.Root key={metric.title}>
              <Card.Body>
                <VStack align="flex-start" gap={3}>
                  <Text fontSize="sm" color="gray.600">
                    {metric.title}
                  </Text>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="2xl" fontWeight="bold">
                      {metric.value}
                    </Text>
                    <Badge 
                      colorPalette={
                        metric.status === "excellent" ? "green" :
                        metric.status === "good" ? "blue" :
                        metric.status === "warning" ? "yellow" : "red"
                      }
                    >
                      {metric.target}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {metric.trend}
                  </Text>
                  <Progress.Root 
                    value={
                      metric.status === "excellent" ? 100 :
                      metric.status === "good" ? 80 :
                      metric.status === "warning" ? 60 : 30
                    }
                    colorPalette={
                      metric.status === "excellent" ? "green" :
                      metric.status === "good" ? "blue" :
                      metric.status === "warning" ? "yellow" : "red"
                    }
                    size="sm"
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>

        {/* Alerts Panel */}
        <Card.Root>
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="sm">Alertas Activas</Heading>
              <Badge colorPalette="red">{alerts.length}</Badge>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={3} align="stretch">
              {alerts.map((alert) => (
                <Card.Root key={alert.id} size="sm" variant="outline">
                  <Card.Body>
                    <HStack gap={3}>
                      <Icon 
                        icon={alert.type === "warning" ? ExclamationTriangleIcon : ChartBarIcon}
                        size="sm"
                        className={`text-${alert.type === "warning" ? "yellow" : "blue"}-500`}
                      />
                      <VStack align="flex-start" gap={1} flex={1}>
                        <Text fontSize="sm">{alert.message}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {alert.time}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
              
              {alerts.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Icon icon={CheckCircleIcon} size="lg" className="text-green-500" />
                  <Text mt={2} color="gray.500">
                    No hay alertas activas
                  </Text>
                </Box>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>
    </Box>
  );
}
