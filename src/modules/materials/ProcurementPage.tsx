import { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Tabs, Badge } from '@chakra-ui/react';
import { 
  ShoppingCartIcon, 
  BellIcon, 
  TruckIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Shared components
import { ModuleHeader } from '@/shared/layout/ModuleHeader';

// Intelligence components
import { ProcurementIntelligence } from './intelligence/ProcurementIntelligence';
import { AlertingSystemReal } from './intelligence/AlertingSystemReal';

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
    navigation?.navigateTo('/materials');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'procurement':
        return <ProcurementIntelligence />;
      case 'alerts':
        return <AlertingSystemReal />;
      default:
        return <ProcurementIntelligence />;
    }
  };

  return (
    <>
      {/* Module Header */}
      <ModuleHeader 
        title="Procurement Intelligence"
        color="green"
        onBack={handleBackToMaterials}
        rightActions={
          <HStack gap={2}>
            <Button variant="outline" size="sm">
              <TruckIcon className="w-4 h-4" />
              Órdenes Activas
            </Button>
            <Button variant="outline" size="sm">
              <ArrowPathIcon className="w-4 h-4" />
              Sincronizar
            </Button>
          </HStack>
        }
      />

      {/* Main Content */}
      <Box px={6} pb={6}>
        <VStack gap={6} align="stretch">
          
          {/* Tab Navigation */}
          <Tabs.Root 
            value={activeTab} 
            onValueChange={(details) => setActiveTab(details.value)}
            variant="enclosed"
          >
            <Tabs.List>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <Tabs.Trigger key={tab.id} value={tab.id}>
                    <HStack gap={2}>
                      <Icon className="w-4 h-4" />
                      <VStack gap={0} align="flex-start">
                        <Text fontSize="sm" fontWeight="medium">
                          {tab.label}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {tab.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>

            <Tabs.Content value={activeTab}>
              <Box mt={6}>
                {renderTabContent()}
              </Box>
            </Tabs.Content>
          </Tabs.Root>

        </VStack>
      </Box>
    </>
  );
}

export default ProcurementPage;