import { useState } from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, Button, Modal, Alert, Badge, Tabs
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
          <Card variant="elevated">
            <Card.Body>
              <Typography variant="heading" size="lg">Smart Procurement</Typography>
              <Typography color="muted">Automated reordering and purchase optimization system</Typography>
            </Card.Body>
          </CardWrapper>
        );
      case 'alerts':
        return (
          <Card variant="elevated">
            <Card.Body>
              <Typography variant="heading" size="lg">Alert Management</Typography>
              <Typography color="muted">Real-time notifications and monitoring dashboard</Typography>
            </Card.Body>
          </CardWrapper>
        );
      default:
        return (
          <Card variant="elevated">
            <Card.Body>
              <Typography variant="heading" size="lg">Smart Procurement</Typography>
              <Typography color="muted">Automated reordering and purchase optimization</Typography>
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
            Procurement Intelligence
          </Typography>
        </Stack>
        
        <Stack direction="row" gap="sm">
          <Button variant="outline" size="sm">
            <TruckIcon className="w-4 h-4 mr-2" />
            Órdenes Activas
          </Button>
          <Button variant="outline" size="sm">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Sincronizar
          </Button>
        </Stack>
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
            <Tabs.Panel value="procurement">
              {renderTabContent()}
            </Tabs.Panel>
            <Tabs.Panel value="alerts">
              {renderTabContent()}
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>

      </Stack>
    </Layout>
  );
}

export default ProcurementPage;