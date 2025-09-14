// OperationsHeader with KPIs and quick actions
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
    <CardWrapper>
      <Stack p="lg">
        <Stack direction="row" justify="space-between" align="center" mb="lg">
          <Typography variant="heading" size="lg">Centro de Operaciones</Typography>
          <Button colorPalette="brand" size="sm">
            <Icon icon={ChartBarIcon} size="sm" />
            Dashboard Completo
          </Button>
        </Stack>

        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="lg">
          {kpis.map((kpi) => (
            <CardWrapper key={kpi.label}>
              <Stack p="md">
                <Stack direction="row" justify="space-between">
                  <Stack direction="column" align="start" gap="xs">
                    <Typography fontSize="sm" color="text.muted">
                      {kpi.label}
                    </Typography>
                    <Typography fontSize="xl" weight="bold">
                      {kpi.value}
                    </Typography>
                    <Badge colorPalette={kpi.color === 'orange' ? 'warning' : kpi.color === 'blue' ? 'info' : kpi.color === 'green' ? 'success' : 'error'} size="sm">
                      {kpi.change}
                    </Badge>
                  </Stack>
                  <Icon 
                    icon={kpi.icon} 
                    size="md" 
                    className={`text-${kpi.color}-500`}
                  />
                </Stack>
              </Stack>
            </CardWrapper>
          ))}
        </Grid>
      </Stack>
    </CardWrapper>
  );
}
