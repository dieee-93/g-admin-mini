import { useState } from 'react';
import { 
  ContentLayout, PageHeader, Section, Button, Tabs
} from '@/shared/ui';
import { 
  ShoppingCartIcon, 
  BellIcon, 
  TruckIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useNavigation } from '@/contexts/NavigationContext';

function ProcurementPage() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('procurement');

  const tabs = [
    {
      id: 'procurement',
      label: 'Smart Procurement',
      icon: ShoppingCartIcon,
      description: 'Automated reordering & purchase optimization'
    },
    {
      id: 'alerts', 
      label: 'Alert Management',
      icon: BellIcon,
      description: 'Real-time notifications & monitoring'
    }
  ];

  const handleBackToMaterials = () => {
    navigation?.navigateTo('/admin/materials');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'procurement':
        return (
          <Section variant="elevated" title="Smart Procurement" subtitle="Automated reordering and purchase optimization system">
            <div>Content coming soon...</div>
          </Section>
        );
      case 'alerts':
        return (
          <Section variant="elevated" title="Alert Management" subtitle="Real-time notifications and monitoring dashboard">
            <div>Content coming soon...</div>
          </Section>
        );
      default:
        return (
          <Section variant="elevated" title="Smart Procurement" subtitle="Automated reordering and purchase optimization">
            <div>Content coming soon...</div>
          </Section>
        );
    }
  };

  return (
    <ContentLayout>
      <PageHeader 
        title="Procurement Intelligence"
        subtitle="Smart procurement and alert management system"
        icon={ShoppingCartIcon}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMaterials}
            >
              ← Volver a Materiales
            </Button>
            <Button variant="outline" size="sm">
              <TruckIcon className="w-4 h-4" />
              Órdenes Activas
            </Button>
            <Button variant="outline" size="sm">
              <ArrowPathIcon className="w-4 h-4" />
              Sincronizar
            </Button>
          </div>
        }
      />

      <Section variant="default">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          variant="enclosed"
        >
          <Tabs.List>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Tabs.Tab key={tab.id} value={tab.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon className="w-4 h-4" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {tab.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--colors-text-muted)' }}>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>

          <Tabs.Panels>
            <Tabs.Panel value="procurement">
              {renderTabContent()}
            </Tabs.Panel>
            <Tabs.Panel value="alerts">
              {renderTabContent()}
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </Section>
    </ContentLayout>
  );
}

export default ProcurementPage;