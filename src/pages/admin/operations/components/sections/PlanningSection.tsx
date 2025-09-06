// Planning Section for production calendar and planning
import React from "react";
import {
  Stack,
  CardWrapper ,
  Grid,
  Typography,
  Badge,
  Button
} from "@/shared/ui";
import { 
  CalendarIcon, 
  PlusIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

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
    <Stack>
      <Stack direction="row" justify="space-between" mb="lg">
        <Typography variant="title" size="md">Planificación de Producción</Typography>
        <Button colorPalette="brand" size="sm">
          <Icon icon={PlusIcon} size="sm" />
          Nueva Planificación
        </Button>
      </Stack>

      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap="lg">
        {/* Calendar View */}
        <CardWrapper>
          <Stack p="lg">
            <Typography variant="subtitle" size="sm">Calendario de Hoy</Typography>
            <Stack gap="lg" align="stretch">
              {todayPlans.map((plan) => (
                <CardWrapper key={plan.id}>
                  <Stack p="md">
                    <Stack direction="row" justify="space-between">
                      <Stack direction="column" align="start" gap="xs">
                        <Typography weight="bold">{plan.item}</Typography>
                        <Typography fontSize="sm" color="text.muted">
                          {plan.quantity} unidades
                        </Typography>
                        <Stack direction="row" gap="sm">
                          <Icon icon={ClockIcon} size="sm" />
                          <Typography fontSize="sm">
                            {plan.startTime} - {plan.estimatedDuration}min
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="column" gap="sm">
                        <Badge 
                          colorPalette={plan.status === "in_progress" ? "info" : "gray"}
                        >
                          {plan.status === "in_progress" ? "En Curso" : "Pendiente"}
                        </Badge>
                        <Badge 
                          colorPalette={plan.priority === "high" ? "error" : "warning"}
                          size="sm"
                        >
                          {plan.priority === "high" ? "Alta" : "Media"}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardWrapper>
              ))}
            </Stack>
          </Stack>
        </CardWrapper>

        {/* Quick Stats */}
        <CardWrapper>
          <Stack p="lg">
            <Typography variant="subtitle" size="sm">Resumen del Día</Typography>
            <Stack gap="lg" align="stretch">
              <Stack textAlign="center">
                <Typography fontSize="2xl" weight="bold" color="text.primary">
                  6
                </Typography>
                <Typography fontSize="sm" color="text.muted">
                  Planificaciones Hoy
                </Typography>
              </Stack>
              <Stack textAlign="center">
                <Typography fontSize="2xl" weight="bold" >
                  4h 30m
                </Typography>
                <Typography fontSize="sm" color="text.muted">
                  Tiempo Total Estimado
                </Typography>
              </Stack>
              <Stack textAlign="center">
                <Typography fontSize="2xl" weight="bold" >
                  85%
                </Typography>
                <Typography fontSize="sm" color="text.muted">
                  Cumplimiento Semanal
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardWrapper>
      </Grid>
    </Stack>
  );
}
