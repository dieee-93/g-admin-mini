import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ContentLayout, PageHeader, Tabs
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import {
  CreditCardIcon, Cog6ToothIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

import PaymentWebhooks from './components/PaymentWebhooks';
import IntegrationsAnalytics from './components/IntegrationsAnalytics';
import { PaymentMethodsTab } from './tabs/payment-methods';
import { PaymentGatewaysTab } from './tabs/gateways';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

const IntegrationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read tab from URL query params, default to 'payment-methods'
  const tabFromUrl = searchParams.get('tab') as 'payment-methods' | 'gateways' | 'monitoring' | null;
  const [activeTab, setActiveTab] = React.useState<'payment-methods' | 'gateways' | 'monitoring'>(
    tabFromUrl || 'payment-methods'
  );
  const [monitoringSubTab, setMonitoringSubTab] = React.useState<'webhooks' | 'analytics'>('webhooks');

  // Sync URL params with tab state
  React.useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (newTab: 'payment-methods' | 'gateways' | 'monitoring') => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  React.useEffect(() => {
    // Emit module loaded event
    ModuleEventUtils.system.moduleLoaded('payment-integrations');
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payment-methods':
        return <PaymentMethodsTab />;
      case 'gateways':
        return <PaymentGatewaysTab />;
      case 'monitoring':
        return <MonitoringTab subTab={monitoringSubTab} onSubTabChange={setMonitoringSubTab} />;
      default:
        return <PaymentMethodsTab />;
    }
  };

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Integraciones de Pago"
        subtitle="Configuración de métodos de pago, gateways y monitoreo de transacciones"
        icon={CreditCardIcon}
      />

      <Tabs.Root value={activeTab} onValueChange={(details) => handleTabChange(details.value as 'payment-methods' | 'gateways' | 'monitoring')}>
        <Tabs.List>
          <Tabs.Trigger value="payment-methods">
            <Icon as={CreditCardIcon} />
            Payment Methods
          </Tabs.Trigger>
          <Tabs.Trigger value="gateways">
            <Icon as={Cog6ToothIcon} />
            Gateways
          </Tabs.Trigger>
          <Tabs.Trigger value="monitoring">
            <Icon as={ChartBarIcon} />
            Monitoring
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value={activeTab}>
          {renderTabContent()}
        </Tabs.Content>
      </Tabs.Root>
    </ContentLayout>
  );
};

// Monitoring Tab with sub-tabs
const MonitoringTab: React.FC<{
  subTab: 'webhooks' | 'analytics';
  onSubTabChange: (tab: 'webhooks' | 'analytics') => void;
}> = ({ subTab, onSubTabChange }) => {
  return (
    <Tabs.Root value={subTab} onValueChange={(details) => onSubTabChange(details.value as 'webhooks' | 'analytics')}>
      <Tabs.List>
        <Tabs.Trigger value="webhooks">
          Webhooks & Events
        </Tabs.Trigger>
        <Tabs.Trigger value="analytics">
          Analytics & Metrics
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value={subTab}>
        {subTab === 'webhooks' ? <PaymentWebhooks /> : <IntegrationsAnalytics />}
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default IntegrationsPage;
