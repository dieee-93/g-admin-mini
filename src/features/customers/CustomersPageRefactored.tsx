// Refactored Customers Page with improved navigation
import { useState, useEffect } from 'react';
import { Box, VStack, Text, Tabs, Badge } from '@chakra-ui/react';
import { UsersIcon, ChartBarIcon, DocumentTextIcon, CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import existing components
import { CustomerForm } from './ui/CustomerForm';
import { CustomerList } from './ui/CustomerList';
import { CustomerAnalytics } from './ui/CustomerAnalytics';
import { CustomerOrdersHistory } from './ui/CustomerOrdersHistory';
import { CustomerNavigation } from './components/CustomerNavigation';

export default function CustomersPageRefactored() {
  const { setQuickActions } = useNavigation();
  const [activeSection, setActiveSection] = useState('management');
  const [activeSubSection, setActiveSubSection] = useState<string | undefined>();

  const handleSectionChange = (section: string, subSection?: string) => {
    setActiveSection(section);
    setActiveSubSection(subSection);
  };

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-customer',
        label: 'Nuevo Cliente',
        icon: PlusIcon,
        action: () => handleSectionChange('management'),
        color: 'pink'
      },
      {
        id: 'analytics',
        label: 'Ver Analytics',
        icon: ChartBarIcon,
        action: () => handleSectionChange('analytics', 'rfm'),
        color: 'blue'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  const renderContent = () => {
    switch (activeSection) {
      case 'management':
        return (
          <VStack gap={6} align="stretch">
            <CustomerForm />
            <CustomerList />
          </VStack>
        );
      case 'analytics':
        return <CustomerAnalytics />;
      case 'orders':
        return <CustomerOrdersHistory />;
      default:
        return (
          <VStack gap={6} align="stretch">
            <CustomerForm />
            <CustomerList />
          </VStack>
        );
    }
  };

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold">Clientes</Text>
          <Text color="gray.600">Gestión avanzada de clientes con análisis RFM</Text>
        </VStack>

        <CustomerNavigation
          currentSection={activeSection}
          currentSubSection={activeSubSection}
          onSectionChange={handleSectionChange}
        />

        <Tabs.Root 
          value={activeSection} 
          onValueChange={(e) => handleSectionChange(e.value)}
          variant="line"
        >
          <Tabs.List>
            <Tabs.Trigger value="management">
              <UsersIcon className="w-4 h-4" />
              Gestión
            </Tabs.Trigger>
            <Tabs.Trigger value="analytics">
              <ChartBarIcon className="w-4 h-4" />
              Analytics
              <Badge colorPalette="blue" variant="subtle">RFM</Badge>
            </Tabs.Trigger>
            <Tabs.Trigger value="orders">
              <DocumentTextIcon className="w-4 h-4" />
              Historial
            </Tabs.Trigger>
            <Tabs.Trigger value="loyalty">
              <CreditCardIcon className="w-4 h-4" />
              Lealtad
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value={activeSection}>
            {renderContent()}
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
