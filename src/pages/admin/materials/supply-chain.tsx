import { useState } from 'react';
import { 
  ContentLayout, PageHeader, Section, Button, Tabs
} from '@/shared/ui';
import { 
  TruckIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ArrowPathIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useNavigation } from '@/contexts/NavigationContext';

function SupplyChainPage() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('reporting');

  const tabs = [
    {
      id: 'reporting',
      label: 'Supply Chain Reporting',
      icon: ChartBarIcon,
      description: 'Comprehensive analytics and KPIs'
    },
    {
      id: 'optimization', 
      label: 'Inventory Optimization',
      icon: CubeIcon,
      description: 'AI-powered demand forecasting'
    },
    {
      id: 'suppliers',
      label: 'Supplier Management', 
      icon: UserGroupIcon,
      description: 'Supplier scoring and performance'
    }
  ];

  const handleBackToMaterials = () => {
    navigation?.navigateTo('/admin/materials');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reporting':
        return (
          <Section variant="elevated" title="Supply Chain Reporting" subtitle="Comprehensive analytics and KPIs for supply chain management">
            <div>Content coming soon...</div>
          </Section>
        );
      case 'optimization':
        return (
          <Section variant="elevated" title="Inventory Optimization" subtitle="AI-powered demand forecasting and optimization">
            <div>Content coming soon...</div>
          </Section>
        );
      case 'suppliers':
        return (
          <Section variant="elevated" title="Supplier Management" subtitle="Supplier scoring and performance tracking">
            <div>Content coming soon...</div>
          </Section>
        );
      default:
        return (
          <Section variant="elevated" title="Supply Chain Reporting" subtitle="Comprehensive analytics and KPIs">
            <div>Content coming soon...</div>
          </Section>
        );
    }
  };

  return (
    <ContentLayout>
      <PageHeader 
        title="Supply Chain Intelligence"
        subtitle="Advanced supply chain management and optimization"
        icon={TruckIcon}
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
              <ArrowPathIcon className="w-4 h-4" />
              Actualizar Datos
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
            <Tabs.Panel value="reporting">
              {renderTabContent()}
            </Tabs.Panel>
            <Tabs.Panel value="optimization">
              {renderTabContent()}
            </Tabs.Panel>
            <Tabs.Panel value="suppliers">
              {renderTabContent()}
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </Section>
    </ContentLayout>
  );
}

export default SupplyChainPage;