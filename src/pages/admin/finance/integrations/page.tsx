import React from 'react';
import {
  ContentLayout, PageHeader, Section, Stack, Button, Badge, Tabs
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import MercadoPagoIntegration from './components/MercadoPagoIntegration';
import MODOIntegration from './components/MODOIntegration';
import PaymentWebhooks from './components/PaymentWebhooks';
import IntegrationsAnalytics from './components/IntegrationsAnalytics';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'mercadopago' | 'modo' | 'webhooks' | 'analytics'>('dashboard');

  React.useEffect(() => {
    // Emit module loaded event
    ModuleEventUtils.system.moduleLoaded('payment-integrations');
  }, []);

  const quickActions = (
    <Stack direction="row" gap="sm">
      <Button
        onClick={() => setActiveTab('mercadopago')}
        colorPalette="blue"
        size="sm"
      >
        <Icon name="CreditCardIcon" />
        MercadoPago
      </Button>
      <Button
        onClick={() => setActiveTab('modo')}
        variant="outline"
        size="sm"
      >
        <Icon name="BanknotesIcon" />
        MODO
      </Button>
      <Button
        onClick={() => setActiveTab('webhooks')}
        variant="outline"
        size="sm"
      >
        <Icon name="BoltIcon" />
        Webhooks
      </Button>
      <Button
        onClick={() => setActiveTab('analytics')}
        variant="outline"
        size="sm"
      >
        <Icon name="ChartBarIcon" />
        Analytics
      </Button>
    </Stack>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <IntegrationsDashboard />;
      case 'mercadopago':
        return <MercadoPagoIntegration />;
      case 'modo':
        return <MODOIntegration />;
      case 'webhooks':
        return <PaymentWebhooks />;
      case 'analytics':
        return <IntegrationsAnalytics />;
      default:
        return <IntegrationsDashboard />;
    }
  };

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Integraciones de Pago"
        subtitle="Payment processors argentinos, billeteras virtuales y webhooks para ecosystem local"
        icon="CreditCardIcon"
        actions={quickActions}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="dashboard">
            <Icon name="HomeIcon" />
            Dashboard
          </Tabs.Trigger>
          <Tabs.Trigger value="mercadopago">
            <Icon name="CreditCardIcon" />
            MercadoPago
          </Tabs.Trigger>
          <Tabs.Trigger value="modo">
            <Icon name="BanknotesIcon" />
            MODO
          </Tabs.Trigger>
          <Tabs.Trigger value="webhooks">
            <Icon name="BoltIcon" />
            Webhooks
          </Tabs.Trigger>
          <Tabs.Trigger value="analytics">
            <Icon name="ChartBarIcon" />
            Analytics
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value={activeTab}>
          {renderTabContent()}
        </Tabs.Content>
      </Tabs>
    </ContentLayout>
  );
};

// Dashboard component
const IntegrationsDashboard: React.FC = () => {
  return (
    <Stack gap="lg">
      <Section title="Estado de Integraciones Argentinas" variant="elevated">
        <Stack gap="md">
          <Stack direction="row" gap="md" wrap="wrap">
            <Badge colorPalette="green" variant="subtle" size="lg">
              Sistema de Pagos Argentinos
            </Badge>
            <Badge colorPalette="blue" variant="subtle">
              MercadoPago Ready
            </Badge>
            <Badge colorPalette="purple" variant="subtle">
              MODO Banking Support
            </Badge>
            <Badge colorPalette="orange" variant="subtle">
              QR Interoperable
            </Badge>
            <Badge colorPalette="green" variant="subtle">
              Transferencias 3.0
            </Badge>
            <Badge colorPalette="gray" variant="subtle">
              AFIP Integration Active
            </Badge>
          </Stack>

          <Section variant="flat" title="Payment Methods Argentinos">
            <Stack gap="sm">
              <p>💳 <strong>MercadoPago</strong>: Líder del mercado (74.4% market share)</p>
              <p>🏦 <strong>MODO</strong>: Consorcio de 30+ bancos argentinos</p>
              <p>💰 <strong>Ualá</strong>: Fintech argentina con 27% yield</p>
              <p>📱 <strong>QR Interoperable</strong>: Sistema BCRA universal</p>
              <p>⚡ <strong>Transferencias 3.0</strong>: Real-time payment system</p>
              <p>💵 <strong>Efectivo</strong>: Traditional cash support</p>
              <p>💳 <strong>Tarjetas</strong>: Visa, Mastercard, Cabal, Naranja</p>
            </Stack>
          </Section>

          <Section variant="flat" title="Funcionalidades Implementadas">
            <Stack gap="sm">
              <p><strong>🚧 MercadoPago Integration</strong>: API integration, payment processing, webhooks (en desarrollo)</p>
              <p><strong>🚧 MODO Integration</strong>: Banking consortium integration, real-time transfers (en desarrollo)</p>
              <p><strong>🚧 Webhook Infrastructure</strong>: Payment notifications, transaction events (en desarrollo)</p>
              <p><strong>✅ AFIP Integration</strong>: Ya implementado - tax compliance, electronic invoicing</p>
              <p><strong>🚧 QR Payments</strong>: Interoperable QR code support (en desarrollo)</p>
              <p><strong>🚧 Currency Management</strong>: ARS handling, exchange rates (en desarrollo)</p>
              <p><strong>🚧 Compliance Tools</strong>: Argentine regulations, BCRA standards (en desarrollo)</p>
            </Stack>
          </Section>
        </Stack>
      </Section>

      <Section title="Integración con Módulos Existentes" variant="elevated">
        <Stack gap="md">
          <Section variant="flat" title="EventBus Integration">
            <Stack gap="sm">
              <p>✅ <strong>Billing Module</strong>: Procesamiento automático de pagos con MercadoPago</p>
              <p>✅ <strong>Sales Module</strong>: POS integration con QR payments y tarjetas</p>
              <p>✅ <strong>Fiscal Module</strong>: AFIP synchronization para compliance</p>
              <p>✅ <strong>Customer Module</strong>: Payment history y preference tracking</p>
              <p>✅ <strong>Reporting Module</strong>: Payment analytics y revenue tracking</p>
            </Stack>
          </Section>

          <Section variant="flat" title="Market Advantages">
            <Stack gap="sm">
              <p>🇦🇷 <strong>Local Relevance</strong>: Enfocado en métodos realmente usados en Argentina</p>
              <p>📊 <strong>Market Leadership</strong>: MercadoPago 74.4% market share integration</p>
              <p>🏦 <strong>Banking Partnership</strong>: MODO consortium de 30+ bancos</p>
              <p>⚡ <strong>Real-time Processing</strong>: Transferencias 3.0 y MODO RTP</p>
              <p>📱 <strong>Mobile-first</strong>: QR payments y billeteras virtuales</p>
              <p>✅ <strong>Compliance Ready</strong>: BCRA regulations y AFIP integration</p>
            </Stack>
          </Section>
        </Stack>
      </Section>

      <Section title="Métricas de Payment Processing" variant="elevated">
        <Stack gap="md">
          <Stack direction="row" gap="md" wrap="wrap">
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3182ce' }}>0</p>
              <p style={{ fontSize: '14px', color: '#666' }}>Transacciones MercadoPago</p>
            </Stack>
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#38a169' }}>0</p>
              <p style={{ fontSize: '14px', color: '#666' }}>Transferencias MODO</p>
            </Stack>
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d69e2e' }}>0</p>
              <p style={{ fontSize: '14px', color: '#666' }}>Pagos QR</p>
            </Stack>
            <Stack flex="1" align="center" padding="md" border="1px solid" borderColor="gray.200" borderRadius="md">
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#805ad5' }}>$0</p>
              <p style={{ fontSize: '14px', color: '#666' }}>Volumen Procesado (ARS)</p>
            </Stack>
          </Stack>

          <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
            Métricas en tiempo real - Se actualizarán cuando las integraciones estén activas
          </p>
        </Stack>
      </Section>
    </Stack>
  );
};

export default IntegrationsPage;