// SettingsHeader with configuration status and quick actions
import React from "react";
import { 
  Stack, Typography, CardWrapper, Grid, Button, Badge, Layout
} from "@/shared/ui";
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
    <Card variant="elevated" >
      <Card.Body>
        <Stack direction="row" justify="space-between" align="center" gap="md">
          <Typography variant="heading" level={2}>Configuraciones del Sistema</Typography>
          <Button colorPalette="brand" size="sm">
            <Icon icon={CheckCircleIcon} size="sm" />
            Validar Configuración
          </Button>
        </Stack>

        <Layout mt="xl">
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="md">
            {configStatus.map((status) => (
              <Card key={status.label} variant="outline" size="sm" >
                <Card.Body>
                  <Stack direction="row" justify="space-between" align="start" gap="sm">
                    <Stack direction="column" align="start" gap="xs">
                      <Typography variant="caption" color="secondary">
                        {status.label}
                      </Typography>
                      <Typography variant="title" size="lg" weight="bold">
                        {status.value}
                      </Typography>
                      <Badge 
                        variant="subtle" 
                        colorPalette={getSemanticColor(status.color)}
                        size="sm"
                      >
                        {status.change}
                      </Badge>
                    </Stack>
                    <Icon 
                      icon={status.icon} 
                      size="md" 
                      color={getSemanticIconColor(status.color)}
                    />
                  </Stack>
                </Card.Body>
              </CardWrapper>
            ))}
          </Grid>
        </Layout>
      </Card.Body>
    </CardWrapper>
  );
}

// Helper functions for semantic colors
function getSemanticColor(color: string): "gray" | "brand" | "success" | "warning" | "error" | "info" {
  switch (color) {
    case 'green': return 'success';
    case 'blue': return 'brand';
    case 'purple': return 'info';
    case 'orange': return 'warning';
    default: return 'gray';
  }
}

function getSemanticIconColor(color: string): string {
  switch (color) {
    case 'green': return 'success.500';
    case 'blue': return 'brand.500';
    case 'purple': return 'brand.500';
    case 'orange': return 'warning.500';
    default: return 'text.muted';
  }
}
