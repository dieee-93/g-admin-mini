// IntegrationsPage.tsx - API Integrations and External Services
import React from 'react';
import { Box, VStack, Text, Heading, Card, SimpleGrid, Badge, HStack, Button } from '@chakra-ui/react';
import { 
  CommandLineIcon,
  GlobeAltIcon,
  CreditCardIcon,
  TruckIcon,
  BellIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

const IntegrationsPage: React.FC = () => {
  const integrations = [
    {
      name: 'Payment Processors',
      icon: CreditCardIcon,
      status: 'Connected',
      color: 'green',
      description: 'Stripe, PayPal, MercadoPago integration'
    },
    {
      name: 'Delivery Services',
      icon: TruckIcon,
      status: 'Configured',
      color: 'blue', 
      description: 'Rappi, PedidosYa, Uber Eats APIs'
    },
    {
      name: 'Notification Services',
      icon: BellIcon,
      status: 'Active',
      color: 'purple',
      description: 'SMS, Email, Push notifications'
    },
    {
      name: 'Cloud Storage',
      icon: CloudIcon,
      status: 'Synced',
      color: 'orange',
      description: 'AWS S3, Google Cloud Storage'
    },
    {
      name: 'Webhooks',
      icon: CommandLineIcon,
      status: 'Configured',
      color: 'teal',
      description: 'Real-time event notifications'
    },
    {
      name: 'External APIs',
      icon: GlobeAltIcon,
      status: 'Available',
      color: 'cyan',
      description: 'Third-party service integrations'
    }
  ];

  return (
    <Box p="6">
      <VStack align="start" gap="6">
        <Box>
          <Heading size="xl" mb="2">API Integrations</Heading>
          <Text color="gray.600">
            Manage third-party integrations and external services
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4" w="full">
          {integrations.map((integration, index) => (
            <Card.Root key={index} variant="outline">
              <Card.Body>
                <VStack align="start" gap="4">
                  <HStack justify="space-between" w="full">
                    <HStack gap="3">
                      <Box p="2" bg={`${integration.color}.50`} borderRadius="md">
                        <integration.icon className={`w-5 h-5 text-${integration.color}-600`} />
                      </Box>
                      <Text fontWeight="semibold">{integration.name}</Text>
                    </HStack>
                    <Badge colorPalette={integration.color} size="sm">
                      {integration.status}
                    </Badge>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600">
                    {integration.description}
                  </Text>
                  
                  <Button size="sm" variant="outline" colorPalette={integration.color}>
                    Configure
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" w="full">
          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">API Management</Text>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm">🔑 API Key Management</Text>
                <Text fontSize="sm">🔒 Authentication Setup</Text>
                <Text fontSize="sm">📊 Usage Monitoring</Text>
                <Text fontSize="sm">⚡ Rate Limit Configuration</Text>
                <Text fontSize="sm">🔄 Retry Logic Setup</Text>
                <Text fontSize="sm">📝 Request/Response Logging</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">Webhook Management</Text>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm">🎯 Event Subscriptions</Text>
                <Text fontSize="sm">🔐 Signature Verification</Text>
                <Text fontSize="sm">🔄 Retry Mechanisms</Text>
                <Text fontSize="sm">📋 Event History</Text>
                <Text fontSize="sm">🚨 Failure Notifications</Text>
                <Text fontSize="sm">🧪 Testing Tools</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Card.Root w="full">
          <Card.Header>
            <Heading size="md">Integration Capabilities</Heading>
          </Card.Header>
          <Card.Body>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
              <VStack align="start" gap="3">
                <Text fontWeight="medium" color="green.600">✅ Available Now</Text>
                <Text fontSize="sm">Payment Gateway APIs</Text>
                <Text fontSize="sm">Delivery Service Integration</Text>
                <Text fontSize="sm">SMS/Email Notifications</Text>
                <Text fontSize="sm">Cloud Storage Sync</Text>
              </VStack>
              
              <VStack align="start" gap="3">
                <Text fontWeight="medium" color="blue.600">🔧 In Development</Text>
                <Text fontSize="sm">Accounting Software APIs</Text>
                <Text fontSize="sm">POS System Integration</Text>
                <Text fontSize="sm">Loyalty Program APIs</Text>
                <Text fontSize="sm">Social Media Integration</Text>
              </VStack>
              
              <VStack align="start" gap="3">
                <Text fontWeight="medium" color="purple.600">🚀 Roadmap</Text>
                <Text fontSize="sm">AI Service Integration</Text>
                <Text fontSize="sm">IoT Device Connectivity</Text>
                <Text fontSize="sm">Blockchain Integration</Text>
                <Text fontSize="sm">ML Model APIs</Text>
              </VStack>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default IntegrationsPage;
export { IntegrationsPage };