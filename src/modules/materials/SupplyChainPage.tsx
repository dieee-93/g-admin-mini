import { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Tabs, Badge } from '@chakra-ui/react';
import { 
  TruckIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ArrowPathIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

// Shared components
import { ModuleHeader } from '@/shared/layout/ModuleHeader';

// Intelligence components  
import { SupplyChainReportingReal } from './intelligence/SupplyChainReportingReal';
import { InventoryOptimization } from './intelligence/InventoryOptimization';
import { SupplierScoring } from './intelligence/SupplierScoring';

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
    navigation?.navigateTo('/materials');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reporting':
        return <SupplyChainReportingReal />;
      case 'optimization':
        return <InventoryOptimization />;
      case 'suppliers':
        return <SupplierScoring />;
      default:
        return <SupplyChainReportingReal />;
    }
  };

  return (
    <>
      {/* Module Header */}
      <ModuleHeader 
        title="Supply Chain Intelligence"
        color="purple"
        onBack={handleBackToMaterials}
        rightActions={
          <Button variant="outline" size="sm">
            <ArrowPathIcon className="w-4 h-4" />
            Actualizar Datos
          </Button>
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

export default SupplyChainPage;