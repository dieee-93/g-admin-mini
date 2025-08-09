// Refactored Customers Page with UNIFIED navigation pattern
import { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Tabs, Badge, Card } from '@chakra-ui/react';
import { 
  UsersIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  PlusIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// Import existing components
import { CustomerForm } from './ui/CustomerForm';
import { CustomerList } from './ui/CustomerList';
import { CustomerAnalytics } from './ui/CustomerAnalytics';
import { CustomerOrdersHistory } from './ui/CustomerOrdersHistory';

export default function CustomersPageRefactored() {
  const { setQuickActions } = useNavigation();
  const [activeSection, setActiveSection] = useState('management');

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-customer',
        label: 'Nuevo Cliente',
        icon: PlusIcon,
        action: () => setActiveSection('management'),
        color: 'pink'
      },
      {
        id: 'analytics',
        label: 'Ver Analytics',
        icon: ChartBarIcon,
        action: () => setActiveSection('analytics'),
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
      case 'loyalty':
        return (
          <Card.Root>
            <Card.Body p="8" textAlign="center">
              <CreditCardIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <Text fontSize="lg" fontWeight="semibold" mb="2">Programa de Lealtad</Text>
              <Text color="gray.600">Próximamente - Gestión de puntos y recompensas</Text>
            </Card.Body>
          </Card.Root>
        );
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
    <Box p="6" maxW="7xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* UNIFIED PATTERN: Header with icon, badges, KPIs */}
        <Card.Root>
          <Card.Body>
            <HStack gap="4">
              <Box p="2" bg="pink.100" borderRadius="md">
                <UserGroupIcon className="w-8 h-8 text-pink-600" />
              </Box>
              <VStack align="start" gap="1">
                <HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    Gestión de Clientes
                  </Text>
                  <Badge colorPalette="pink" variant="subtle">
                    RFM Analytics
                  </Badge>
                  <Badge colorPalette="blue" variant="subtle">
                    v2.0
                  </Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Gestión avanzada de clientes con análisis RFM y segmentación inteligente
                </Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* UNIFIED PATTERN: Tabs (max 4) */}
        <Tabs.Root 
          value={activeSection} 
          onValueChange={(e) => setActiveSection(e.value)}
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

          {/* UNIFIED PATTERN: Content area */}
          <Tabs.Content value={activeSection}>
            {renderContent()}
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
EOF < /dev/null
