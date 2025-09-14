// Integrations Page - APIs, webhooks, external services
import React from "react";
import { 
  LinkIcon, 
  CloudIcon,
  PlusIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { 
  ContentLayout, PageHeader, Section, Button, Badge, Switch, Grid, Stack, Typography
} from "@/shared/ui";
import { Icon, HeaderIcon } from "@/shared/ui/Icon";

export default function IntegrationsPage() {
  const activeIntegrations = [
    {
      name: "Stripe",
      type: "Pagos",
      status: "connected",
      description: "Procesamiento de pagos online",
      webhooks: 3,
      lastSync: "Hace 5 min",
      icon: "Stripe"
    },
    {
      name: "WhatsApp Business",
      type: "Comunicación", 
      status: "connected",
      description: "Notificaciones automáticas",
      webhooks: 1,
      lastSync: "Hace 10 min",
      icon: "WhatsApp"
    },
    {
      name: "Google Analytics",
      type: "Analytics",
      status: "error",
      description: "Seguimiento de métricas web",
      webhooks: 0,
      lastSync: "Error conexión",
      icon: "Analytics"
    }
  ];

  const availableIntegrations = [
    {
      name: "PayPal",
      type: "Pagos",
      description: "Procesamiento alternativo de pagos",
      icon: "PayPal"
    },
    {
      name: "Mailchimp",
      type: "Marketing",
      description: "Email marketing y campañas",
      icon: "Email"
    }
  ];

  const webhooks = [
    {
      name: "Order Created",
      url: "https://api.elbuenpan.com/webhooks/orders",
      status: "active",
      lastTrigger: "Hace 2 min"
    },
    {
      name: "Payment Completed",
      url: "https://api.elbuenpan.com/webhooks/payments", 
      status: "active",
      lastTrigger: "Hace 5 min"
    }
  ];

  return (
    <ContentLayout>
      <PageHeader 
        title="Integraciones"
        subtitle="APIs, webhooks y servicios externos"
        icon={LinkIcon}
        actions={
          <Button size="sm">
            <Icon icon={PlusIcon} size="sm" />
            Nueva Integración
          </Button>
        }
      />
        <Stack direction="column" gap="xl">
          {/* Active Integrations */}
          <Section variant="elevated">
            <Stack direction="row" align="center" gap="sm" mb="lg">
              <HeaderIcon icon={CloudIcon} />
              <Typography variant="heading" level={4}>Integraciones Activas</Typography>
            </Stack>
            <Stack direction="column" gap="md">
              {activeIntegrations.map((integration, index) => (
                <Section key={index} variant="flat" p="md" borderRadius="md" border="1px solid" borderColor="border.default">
                  <Stack direction="column" gap="sm">
                        <Stack direction="row" justify="space-between" align="center">
                          <Stack direction="row" align="center" gap="sm">
                            <Badge colorPalette="info" variant="subtle">{integration.icon}</Badge>
                            <Stack direction="column" gap="xs">
                              <Typography variant="body" weight="medium">{integration.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {integration.description}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Stack direction="row" align="center" gap="sm">
                            <Badge 
                              colorPalette={integration.status === "connected" ? "success" : "error"}
                              variant="subtle"
                            >
                              {integration.status === "connected" ? "Conectado" : "Error"}
                            </Badge>
                            <Switch 
                              defaultChecked={integration.status === "connected"}
                              colorPalette={integration.status === "connected" ? "success" : "error"}
                              size="sm"
                            />
                          </Stack>
                        </Stack>
                        <Stack direction="row" justify="space-between" align="center">
                          <Typography variant="caption" color="text.secondary">
                            {integration.webhooks} webhooks - {integration.lastSync}
                          </Typography>
                          <Button size="sm" variant="ghost" >
                            <Icon icon={CogIcon} size="sm" />
                            Configurar
                          </Button>
                        </Stack>
                      </Stack>
                </Section>
              ))}
            </Stack>
          </Section>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="xl">
            {/* Available Integrations */}
            <Section variant="elevated">
              <Stack direction="row" align="center" gap="sm" mb="lg">
                <HeaderIcon icon={PlusIcon} color="warning.500" />
                <Typography variant="heading" level={4}>Integraciones Disponibles</Typography>
              </Stack>
                <Grid templateColumns="repeat(2, 1fr)" gap="md">
                  {availableIntegrations.map((integration, index) => (
                    <Section key={index} variant="flat" p="sm" borderRadius="md" border="1px solid" borderColor="border.default">
                      <Stack direction="column" align="center" gap="sm">
                        <Badge colorPalette="gray" variant="subtle">{integration.icon}</Badge>
                        <Typography variant="body" weight="medium" textAlign="center">
                          {integration.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                          {integration.description}
                        </Typography>
                        <Button size="sm" colorPalette="info" variant="outline">
                          Conectar
                        </Button>
                      </Stack>
                    </Section>
                  ))}
                </Grid>
            </Section>

            {/* Webhooks */}
            <Section variant="elevated">
              <Stack direction="row" align="center" gap="sm" mb="lg">
                <HeaderIcon icon={LinkIcon} />
                <Typography variant="heading" level={4}>Webhooks Configurados</Typography>
              </Stack>
                <Stack direction="column" gap="sm">
                  {webhooks.map((webhook, index) => (
                    <Section key={index} variant="flat" p="md" borderRadius="md" border="1px solid" borderColor="border.default">
                        <Stack direction="column" gap="sm">
                          <Stack direction="row" justify="space-between" align="center">
                            <Typography variant="body" weight="medium">
                              {webhook.name}
                            </Typography>
                            {webhook.status === "active" ? (
                              <Icon icon={CheckCircleIcon} size="sm"  />
                            ) : (
                              <Icon icon={XCircleIcon} size="sm" color="error.500" />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {webhook.url}
                          </Typography>
                          <Typography variant="caption" color="text.muted">
                            Último trigger: {webhook.lastTrigger}
                          </Typography>
                        </Stack>
                    </Section>
                  ))}

                  <Button size="sm" variant="outline">
                    <Icon icon={PlusIcon} size="sm" />
                    Nuevo Webhook
                  </Button>
                </Stack>
            </Section>
          </Grid>
        </Stack>
    </ContentLayout>
  );
}
