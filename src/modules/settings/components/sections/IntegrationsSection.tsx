// Integrations Section - APIs, webhooks, external services
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
  Switch,
  Avatar,
} from "@chakra-ui/react";
import { 
  LinkIcon, 
  CloudIcon,
  PlusIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

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
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Integraciones</Heading>
        <Button colorPalette="blue" size="sm">
          <Icon icon={PlusIcon} size="sm" />
          Nueva Integración
        </Button>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <VStack gap={6} align="stretch">
          <Card.Root>
            <Card.Header>
              <HStack gap={2}>
                <Icon icon={CloudIcon} size="md" />
                <Heading size="sm">Integraciones Activas</Heading>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                {activeIntegrations.map((integration, index) => (
                  <Card.Root key={index} size="sm" variant="outline">
                    <Card.Body>
                      <HStack justify="space-between" mb={2}>
                        <HStack gap={3}>
                          <Badge colorPalette="blue">{integration.icon}</Badge>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">{integration.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {integration.description}
                            </Text>
                          </VStack>
                        </HStack>
                        <HStack gap={2}>
                          <Badge 
                            colorPalette={integration.status === "connected" ? "green" : "red"}
                          >
                            {integration.status === "connected" ? "Conectado" : "Error"}
                          </Badge>
                          <Switch.Root defaultChecked={integration.status === "connected"}>
                            <Switch.Track>
                              <Switch.Thumb />
                            </Switch.Track>
                          </Switch.Root>
                        </HStack>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          {integration.webhooks} webhooks - {integration.lastSync}
                        </Text>
                        <Button size="xs" variant="ghost">
                          <Icon icon={CogIcon} size="sm" />
                          Configurar
                        </Button>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <HStack gap={2}>
                <Icon icon={PlusIcon} size="md" />
                <Heading size="sm">Integraciones Disponibles</Heading>
              </HStack>
            </Card.Header>
            <Card.Body>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                {availableIntegrations.map((integration, index) => (
                  <Card.Root key={index} size="sm" variant="outline">
                    <Card.Body>
                      <VStack gap={2} align="center">
                        <Badge colorPalette="gray" size="lg">{integration.icon}</Badge>
                        <Text fontWeight="medium" fontSize="sm">
                          {integration.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          {integration.description}
                        </Text>
                        <Button size="xs" colorPalette="blue" variant="outline" width="full">
                          Conectar
                        </Button>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Grid>
            </Card.Body>
          </Card.Root>
        </VStack>

        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon icon={LinkIcon} size="md" />
              <Heading size="sm">Webhooks Configurados</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={3} align="stretch">
              {webhooks.map((webhook, index) => (
                <Card.Root key={index} size="sm" variant="outline">
                  <Card.Body>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        {webhook.name}
                      </Text>
                      {webhook.status === "active" ? (
                        <Icon icon={CheckCircleIcon} size="sm" className="text-green-500" />
                      ) : (
                        <Icon icon={XCircleIcon} size="sm" className="text-red-500" />
                      )}
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      {webhook.url}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Último trigger: {webhook.lastTrigger}
                    </Text>
                  </Card.Body>
                </Card.Root>
              ))}
              
              <Button size="sm" variant="outline" width="full" mt={2}>
                <Icon icon={PlusIcon} size="sm" />
                Nuevo Webhook
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>
    </Box>
  );
}
