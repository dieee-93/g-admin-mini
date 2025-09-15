// Monitoring Section for real-time metrics and alerts
import React from "react";
import {
  Stack,
  CardWrapper ,
  Grid,
  Typography,
  Badge
} from "@/shared/ui";
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

export default function Monitoring() {
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
    <Stack>
      <Typography variant="title" size="md" mb="lg">Dashboard de Monitoreo</Typography>

      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap="lg">
        {/* Metrics Grid */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="lg">
          {metrics.map((metric) => (
            <CardWrapper key={metric.title}>
              <Stack p="lg" align="start" gap="md">
                <Typography fontSize="sm" color="text.muted">
                  {metric.title}
                </Typography>
                <Stack direction="row" justify="space-between" w="full">
                  <Typography fontSize="2xl" weight="bold">
                    {metric.value}
                  </Typography>
                  <Badge 
                    colorPalette={
                      metric.status === "excellent" ? "success" :
                      metric.status === "good" ? "info" :
                      metric.status === "warning" ? "warning" : "error"
                    }
                  >
                    {metric.target}
                  </Badge>
                </Stack>
                <Typography fontSize="sm" color="text.muted">
                  {metric.trend}
                </Typography>
              </Stack>
            </CardWrapper>
          ))}
        </Grid>

        {/* Alerts Panel */}
        <CardWrapper>
          <Stack p="lg">
            <Stack direction="row" justify="space-between">
              <Typography variant="subtitle" size="sm">Alertas Activas</Typography>
              <Badge colorPalette="error">{alerts.length}</Badge>
            </Stack>
            <Stack gap="md" align="stretch">
              {alerts.map((alert) => (
                <CardWrapper key={alert.id}>
                  <Stack p="md" direction="row" gap="md">
                    <Icon 
                      icon={alert.type === "warning" ? ExclamationTriangleIcon : ChartBarIcon}
                      size="sm"
                      className={`text-${alert.type === "warning" ? "yellow" : "blue"}-500`}
                    />
                    <Stack direction="column" align="start" gap="xs" flex={1}>
                      <Typography fontSize="sm">{alert.message}</Typography>
                      <Typography fontSize="xs" color="text.muted">
                        {alert.time}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardWrapper>
              ))}
              
              {alerts.length === 0 && (
                <Stack textAlign="center" py="xl">
                  <Icon icon={CheckCircleIcon} size="lg" className="text-green-500" />
                  <Typography mt="sm" color="text.muted">
                    No hay alertas activas
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </CardWrapper>
      </Grid>
    </Stack>
  );
}
