import { useState } from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, Button, Modal, Alert, Badge, Tabs
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
          <Card variant="elevated">
            <Card.Body>
              <Typography variant="heading" size="lg">Supply Chain Reporting</Typography>
              <Typography color="muted">Comprehensive analytics and KPIs for supply chain management</Typography>
            </Card.Body>
          </CardWrapper>
        );
      case 'optimization':
        return (
          <Card variant="elevated">
            <Card.Body>
              <Typography variant="heading" size="lg">Inventory Optimization</Typography>
              <Typography color="muted">AI-powered demand forecasting and optimization</Typography>
            </Card.Body>
          </CardWrapper>
        );
      case 'suppliers':
        return (
          <Card variant="elevated">
            <Card.Body>
              <Typography variant="heading" size="lg">Supplier Management</Typography>
              <Typography color="muted">Supplier scoring and performance tracking</Typography>
            </Card.Body>
          </CardWrapper>
        );
      default:
        return (
          <Card variant="elevated">
            <Card.Body>
              <Typography variant="heading" size="lg">Supply Chain Reporting</Typography>
              <Typography color="muted">Comprehensive analytics and KPIs</Typography>
            </Card.Body>
          </CardWrapper>
        );
    }
  };

  return (
    <Layout variant="panel">
      {/* Page Header */}
      <Stack direction="row" justify="space-between" align="center" p="lg">
        <Stack direction="row" align="center" gap="md">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMaterials}
          >
            ← Volver a Materiales
          </Button>
          <Typography variant="heading" size="xl">
            Supply Chain Intelligence
          </Typography>
        </Stack>
        
        <Button variant="outline" size="sm">
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Actualizar Datos
        </Button>
      </Stack>

      {/* Main Content */}
      <Stack direction="column" gap="lg" p="lg">
        
        {/* Tab Navigation */}
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
                  <Stack direction="row" align="center" gap="sm">
                    <Icon className="w-4 h-4" />
                    <Stack direction="column" align="start" gap="xs">
                      <Typography variant="body" size="sm" weight="medium">
                        {tab.label}
                      </Typography>
                      <Typography variant="body" size="xs" color="muted">
                        {tab.description}
                      </Typography>
                    </Stack>
                  </Stack>
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

      </Stack>
    </Layout>
  );
}

export default SupplyChainPage;