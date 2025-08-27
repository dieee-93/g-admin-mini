// Integrations Section - APIs, webhooks, external services
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
  Stack, Typography, CardWrapper, Button, Badge, Switch, Grid
} from "@/shared/ui";
import { Icon, HeaderIcon } from "@/shared/ui/Icon";

export function IntegrationsSection() {
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
    <CardWrapper variant="elevated" >
      <CardWrapper>
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap="sm">
            <HeaderIcon icon={LinkIcon}  />
            <Typography variant="heading" level={3}>Integraciones</Typography>
          </Stack>
          <Button  size="sm">
            <Icon icon={PlusIcon} size="sm" />
            Nueva Integración
          </Button>
        </Stack>
      </CardWrapper>
      <CardWrapper>
        <Stack direction="column" gap="xl">
          {/* Active Integrations */}
          <CardWrapper variant="outline" >
            <CardWrapper>
              <Stack direction="row" align="center" gap="sm">
                <HeaderIcon icon={CloudIcon} />
                <Typography variant="heading" level={4}>Integraciones Activas</Typography>
              </Stack>
            </CardWrapper>
            <CardWrapper>
              <Stack direction="column" gap="md">
                {activeIntegrations.map((integration, index) => (
                  <CardWrapper key={index} variant="subtle" >
                    <CardWrapper>
                      <Stack direction="column" gap="sm">
                        <Stack direction="row" justify="space-between" align="center">
                          <Stack direction="row" align="center" gap="sm">
                            <Badge colorPalette="info" variant="subtle">{integration.icon}</Badge>
                            <Stack direction="column" gap="xs">
                              <Typography variant="body" weight="medium">{integration.name}</Typography>
                              <Typography variant="caption" color="secondary">
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
                          <Typography variant="caption" color="secondary">
                            {integration.webhooks} webhooks - {integration.lastSync}
                          </Typography>
                          <Button size="sm" variant="ghost" >
                            <Icon icon={CogIcon} size="sm" />
                            Configurar
                          </Button>
                        </Stack>
                      </Stack>
                    </CardWrapper>
                  </CardWrapper>
                ))}
              </Stack>
            </CardWrapper>
          </CardWrapper>

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="xl">
            {/* Available Integrations */}
            <CardWrapper variant="outline" >
              <CardWrapper>
                <Stack direction="row" align="center" gap="sm">
                  <HeaderIcon icon={PlusIcon} color="warning.500" />
                  <Typography variant="heading" level={4}>Integraciones Disponibles</Typography>
                </Stack>
              </CardWrapper>
              <CardWrapper>
                <Grid templateColumns="repeat(2, 1fr)" gap="md">
                  {availableIntegrations.map((integration, index) => (
                    <CardWrapper key={index} variant="subtle" >
                      <CardWrapper>
                        <Stack direction="column" align="center" gap="sm">
                          <Badge colorPalette="gray" variant="subtle">{integration.icon}</Badge>
                          <Typography variant="body" weight="medium" textAlign="center">
                            {integration.name}
                          </Typography>
                          <Typography variant="caption" color="secondary" textAlign="center">
                            {integration.description}
                          </Typography>
                          <Button size="sm" colorPalette="info" variant="outline">
                            Conectar
                          </Button>
                        </Stack>
                      </CardWrapper>
                    </CardWrapper>
                  ))}
                </Grid>
              </CardWrapper>
            </CardWrapper>

            {/* Webhooks */}
            <CardWrapper variant="outline" >
              <CardWrapper>
                <Stack direction="row" align="center" gap="sm">
                  <HeaderIcon icon={LinkIcon}  />
                  <Typography variant="heading" level={4}>Webhooks Configurados</Typography>
                </Stack>
              </CardWrapper>
              <CardWrapper>
                <Stack direction="column" gap="sm">
                  {webhooks.map((webhook, index) => (
                    <CardWrapper key={index} variant="subtle" >
                      <CardWrapper>
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
                          <Typography variant="caption" color="secondary">
                            {webhook.url}
                          </Typography>
                          <Typography variant="caption" color="muted">
                            Último trigger: {webhook.lastTrigger}
                          </Typography>
                        </Stack>
                      </CardWrapper>
                    </CardWrapper>
                  ))}

                  <Button size="sm" variant="outline" >
                    <Icon icon={PlusIcon} size="sm" />
                    Nuevo Webhook
                  </Button>
                </Stack>
              </CardWrapper>
            </CardWrapper>
          </Grid>
        </Stack>
      </CardWrapper>
    </CardWrapper>
  );
}
