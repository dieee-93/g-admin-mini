// IntegrationsPage.tsx - API Integrations and External Services
import React from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, SimpleGrid, Badge, Button, Icon
} from '@/shared/ui';
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
      color: 'success' as const,
      description: 'Stripe, PayPal, MercadoPago integration'
    },
    {
      name: 'Delivery Services',
      icon: TruckIcon,
      status: 'Configured',
      color: 'info' as const, 
      description: 'Rappi, PedidosYa, Uber Eats APIs'
    },
    {
      name: 'Notification Services',
      icon: BellIcon,
      status: 'Active',
      color: 'theme' as const,
      description: 'SMS, Email, Push notifications'
    },
    {
      name: 'Cloud Storage',
      icon: CloudIcon,
      status: 'Synced',
      color: 'warning' as const,
      description: 'AWS S3, Google Cloud Storage'
    },
    {
      name: 'Webhooks',
      icon: CommandLineIcon,
      status: 'Configured',
      color: 'info' as const,
      description: 'Real-time event notifications'
    },
    {
      name: 'External APIs',
      icon: GlobeAltIcon,
      status: 'Available',
      color: 'theme' as const,
      description: 'Third-party service integrations'
    }
  ];

  return (
    <Layout variant="page" p="xl">
      <Stack gap="xl">
        <Stack gap="sm">
          <Typography variant="heading" size="xl">API Integrations</Typography>
          <Typography variant="body" color="secondary">
            Manage third-party integrations and external services
          </Typography>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
          {integrations.map((integration, index) => (
            <CardWrapper key={index} variant="outline" >
              <CardWrapper>
                <Stack gap="md">
                  <Stack direction="row" justify="space-between" align="start">
                    <Stack direction="row" gap="sm" align="center">
                      <Layout p="sm" bg={`${integration.color}.50`} borderRadius="md">
                        <Icon 
                          icon={integration.icon} 
                          size="sm" 
                          color={`${integration.color}.600`} 
                        />
                      </Layout>
                      <Typography variant="body" fontWeight="semibold">
                        {integration.name}
                      </Typography>
                    </Stack>
                    <Badge colorPalette={integration.color} size="sm">
                      {integration.status}
                    </Badge>
                  </Stack>
                  
                  <Typography variant="body" size="sm" color="secondary">
                    {integration.description}
                  </Typography>
                  
                  <Button size="sm" variant="outline" colorPalette={integration.color}>
                    Configure
                  </Button>
                </Stack>
              </CardWrapper>
            </CardWrapper>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="xl">
          <CardWrapper variant="elevated" >
            <CardWrapper>
              <Typography variant="body" fontWeight="semibold">API Management</Typography>
            </CardWrapper>
            <CardWrapper>
              <Stack gap="sm">
                <Typography variant="body" size="sm">🔑 API Key Management</Typography>
                <Typography variant="body" size="sm">🔒 Authentication Setup</Typography>
                <Typography variant="body" size="sm">📊 Usage Monitoring</Typography>
                <Typography variant="body" size="sm">⚡ Rate Limit Configuration</Typography>
                <Typography variant="body" size="sm">🔄 Retry Logic Setup</Typography>
                <Typography variant="body" size="sm">📝 Request/Response Logging</Typography>
              </Stack>
            </CardWrapper>
          </CardWrapper>

          <CardWrapper variant="elevated" >
            <CardWrapper>
              <Typography variant="body" fontWeight="semibold">Webhook Management</Typography>
            </CardWrapper>
            <CardWrapper>
              <Stack gap="sm">
                <Typography variant="body" size="sm">🎯 Event Subscriptions</Typography>
                <Typography variant="body" size="sm">🔐 Signature Verification</Typography>
                <Typography variant="body" size="sm">🔄 Retry Mechanisms</Typography>
                <Typography variant="body" size="sm">📋 Event History</Typography>
                <Typography variant="body" size="sm">🚨 Failure Notifications</Typography>
                <Typography variant="body" size="sm">🧪 Testing Tools</Typography>
              </Stack>
            </CardWrapper>
          </CardWrapper>
        </SimpleGrid>

        <CardWrapper variant="elevated" >
          <CardWrapper>
            <Typography variant="heading" size="md">Integration Capabilities</Typography>
          </CardWrapper>
          <CardWrapper>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="xl">
              <Stack gap="sm">
                <Typography variant="body" fontWeight="medium">
                  ✅ Available Now
                </Typography>
                <Typography variant="body" size="sm">Payment Gateway APIs</Typography>
                <Typography variant="body" size="sm">Delivery Service Integration</Typography>
                <Typography variant="body" size="sm">SMS/Email Notifications</Typography>
                <Typography variant="body" size="sm">Cloud Storage Sync</Typography>
              </Stack>
              
              <Stack gap="sm">
                <Typography variant="body" fontWeight="medium">
                  🔧 In Development
                </Typography>
                <Typography variant="body" size="sm">Accounting Software APIs</Typography>
                <Typography variant="body" size="sm">POS System Integration</Typography>
                <Typography variant="body" size="sm">Loyalty Program APIs</Typography>
                <Typography variant="body" size="sm">Social Media Integration</Typography>
              </Stack>
              
              <Stack gap="sm">
                <Typography variant="body" fontWeight="medium">
                  🚀 Roadmap
                </Typography>
                <Typography variant="body" size="sm">AI Service Integration</Typography>
                <Typography variant="body" size="sm">IoT Device Connectivity</Typography>
                <Typography variant="body" size="sm">Blockchain Integration</Typography>
                <Typography variant="body" size="sm">ML Model APIs</Typography>
              </Stack>
            </SimpleGrid>
          </CardWrapper>
        </CardWrapper>
      </Stack>
    </Layout>
  );
};

export default IntegrationsPage;
export { IntegrationsPage };