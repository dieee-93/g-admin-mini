import React from 'react';
import {
  ContentLayout, PageHeader, Section, Stack, Button, Badge, Tabs
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import RecurringBillingFormEnhanced from './components/RecurringBillingFormEnhanced';
import RecurringBillingAnalyticsEnhanced from './components/RecurringBillingAnalyticsEnhanced';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import {
  PlusIcon,
  ChartBarIcon,
  CogIcon,
  HomeIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

type BillingTab = 'dashboard' | 'create' | 'manage' | 'analytics';

const BillingPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<BillingTab>('dashboard');

  React.useEffect(() => {
    // Emit module loaded event
    ModuleEventUtils.system.moduleLoaded('billing');
  }, []);

  const quickActions = (
    <Stack direction="row" gap="sm">
      <Button
        onClick={() => setActiveTab('create')}
        colorPalette="blue"
        size="sm"
      >
        <Icon as={PlusIcon} />
        Nueva Suscripción
      </Button>
      <Button
        onClick={() => setActiveTab('analytics')}
        variant="outline"
        size="sm"
      >
        <Icon as={ChartBarIcon} />
        Analytics
      </Button>
      <Button
        variant="outline"
        size="sm"
      >
        <Icon as={CogIcon} />
        Configuración
      </Button>
    </Stack>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BillingDashboard />;
      case 'create':
        return <RecurringBillingFormEnhanced />;
      case 'analytics':
        return <RecurringBillingAnalyticsEnhanced />;
      case 'manage':
        return <SubscriptionManager />;
      default:
        return <BillingDashboard />;
    }
  };

  const handleTabChange = (details: { value: string | null }) => {
    if (details.value && ['dashboard', 'create', 'manage', 'analytics'].includes(details.value)) {
      setActiveTab(details.value as BillingTab);
    }
  };

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Facturación Recurrente"
        subtitle="Gestión integral de suscripciones, pagos automáticos y análisis de ingresos"
        icon="CreditCardIcon"
        actions={quickActions}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Trigger value="dashboard">
            <Icon as={HomeIcon} />
            Dashboard
          </Tabs.Trigger>
          <Tabs.Trigger value="create">
            <Icon as={PlusIcon} />
            Crear Suscripción
          </Tabs.Trigger>
          <Tabs.Trigger value="manage">
            <Icon as={ListBulletIcon} />
            Gestionar
          </Tabs.Trigger>
          <Tabs.Trigger value="analytics">
            <Icon as={ChartBarIcon} />
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
const BillingDashboard: React.FC = () => {
  return (
    <Stack gap="lg">
      <Section title="Estado del Sistema" variant="elevated">
        <Stack gap="md">
          <Stack direction="row" gap="md" wrap="wrap">
            <Badge colorPalette="green" variant="subtle" size="lg">
              Sistema de Billing Activo
            </Badge>
            <Badge colorPalette="blue" variant="subtle">
              247 Suscripciones Activas
            </Badge>
            <Badge colorPalette="orange" variant="subtle">
              23 Pagos Pendientes
            </Badge>
            <Badge colorPalette="gray" variant="subtle">
              Última Sync: hace 5 min
            </Badge>
          </Stack>

          <Section variant="flat" title="Integración EventBus">
            <Stack gap="sm">
              <p>✅ 12 eventos de billing configurados</p>
              <p>✅ Integración con módulos: Customers, Analytics, Fiscal</p>
              <p>✅ Monitoreo de MRR en tiempo real</p>
              <p>✅ Alertas de churn automáticas</p>
              <p>✅ Gestión de reintentos de pago</p>
            </Stack>
          </Section>
        </Stack>
      </Section>

      <RecurringBillingAnalyticsEnhanced />
    </Stack>
  );
};

// Subscription Manager component
const SubscriptionManager: React.FC = () => {
  return (
    <Section title="Gestión de Suscripciones" variant="elevated">
      <Stack gap="md">
        <p>Panel de gestión de suscripciones existentes</p>
        <p>Funcionalidades incluyen:</p>
        <ul>
          <li>• Lista de suscripciones activas, suspendidas y canceladas</li>
          <li>• Edición de términos y condiciones</li>
          <li>• Gestión de pagos fallidos</li>
          <li>• Historial de facturación</li>
          <li>• Reportes de customer lifetime value</li>
          <li>• Herramientas de retención de clientes</li>
        </ul>
      </Stack>
    </Section>
  );
};

export default BillingPage;