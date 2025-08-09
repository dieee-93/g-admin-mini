// src/pages/CustomersPage.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Tabs,
  Badge,
  Grid
} from '@chakra-ui/react';
import {
  UsersIcon,
  PlusIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { CustomerForm } from '@/modules/customers/ui/CustomerForm';
import { CustomerList } from '@/modules/customers/ui/CustomerList';
import { CustomerOrdersHistory } from '@/modules/customers/ui/CustomerOrdersHistory';
import { CustomerAnalytics } from '@/modules/customers/ui/CustomerAnalytics';
import { CustomerSegments } from '@/modules/customers/ui/CustomerSegments';
import { useCustomers } from '@/modules/customers/logic/useCustomers';

export function CustomersPage() {
  const { setQuickActions } = useNavigation();
  const { customers, customersWithStats } = useCustomers();

  // Local state
  const [activeTab, setActiveTab] = useState('customers');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // Calculate stats from actual data
  const customerStats = {
    totalCustomers: customers.length,
    activeCustomers: customersWithStats.filter(c => c.stats && c.stats.purchase_count > 0).length,
    avgOrderValue: customersWithStats.reduce((sum, c) => sum + (c.stats?.average_purchase || 0), 0) / Math.max(customersWithStats.length, 1),
    customerRetention: customers.length > 0 ? Math.round((customersWithStats.filter(c => c.stats && c.stats.purchase_count > 1).length / customers.length) * 100) : 0
  };

  useEffect(() => {
    const quickActions = [
      {
        id: 'new-customer',
        label: 'Nuevo Cliente',
        icon: UserIcon,
        action: () => {
          setActiveTab('customers');
          setShowNewCustomerForm(true);
        },
        color: 'pink'
      },
      {
        id: 'customer-orders',
        label: 'Ver Pedidos',
        icon: ClipboardDocumentListIcon,
        action: () => setActiveTab('orders'),
        color: 'blue'
      },
      {
        id: 'customer-segments',
        label: 'Segmentos',
        icon: TagIcon,
        action: () => setActiveTab('segments'),
        color: 'purple'
      }
    ];

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions]);

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* Header con métricas */}
        <VStack align="start" gap="2">
          <HStack justify="space-between" w="full">
            <VStack align="start" gap="1">
              <Text fontSize="3xl" fontWeight="bold">Clientes</Text>
              <Text color="gray.600">
                Gestión de clientes y relaciones
              </Text>
            </VStack>

            {/* Estadísticas */}
            <Grid templateColumns="repeat(4, 1fr)" gap="6">
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="pink.500">
                  {customerStats.totalCustomers}
                </Text>
                <Text fontSize="xs" color="gray.500">Total Clientes</Text>
              </VStack>
              
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {customerStats.activeCustomers}
                </Text>
                <Text fontSize="xs" color="gray.500">Activos</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  ${Math.round(customerStats.avgOrderValue)}
                </Text>
                <Text fontSize="xs" color="gray.500">Ticket Promedio</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {customerStats.customerRetention}%
                </Text>
                <Text fontSize="xs" color="gray.500">Retención</Text>
              </VStack>
            </Grid>
          </HStack>
        </VStack>

        {/* Tabs */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
          variant="line"
        >
          <Tabs.List>
            <Tabs.Trigger value="customers">
              <UsersIcon className="w-4 h-4" />
              Lista de Clientes
              <Badge colorPalette="pink" variant="subtle">
                {customerStats.totalCustomers}
              </Badge>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="orders">
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Historial de Pedidos
            </Tabs.Trigger>
            
            <Tabs.Trigger value="segments">
              <TagIcon className="w-4 h-4" />
              Segmentos
            </Tabs.Trigger>

            <Tabs.Trigger value="analytics">
              <ChartBarIcon className="w-4 h-4" />
              Análisis
            </Tabs.Trigger>
          </Tabs.List>

          {/* TAB: Clientes */}
          <Tabs.Content value="customers">
            <VStack gap="6" align="stretch">
              {/* Formulario de nuevo cliente (condicional) */}
              {showNewCustomerForm && (
                <Card.Root>
                  <Card.Body>
                    <CustomerForm 
                      onSuccess={() => setShowNewCustomerForm(false)}
                      onCancel={() => setShowNewCustomerForm(false)}
                    />
                  </Card.Body>
                </Card.Root>
              )}

              {/* Lista de clientes */}
              <Card.Root>
                <Card.Header>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">Lista de Clientes</Text>
                    <Button 
                      colorPalette="pink"
                      onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                    >
                      <PlusIcon className="w-4 h-4" />
                      {showNewCustomerForm ? 'Cancelar' : 'Nuevo Cliente'}
                    </Button>
                  </HStack>
                </Card.Header>
                
                <Card.Body>
                  <CustomerList />
                </Card.Body>
              </Card.Root>
            </VStack>
          </Tabs.Content>

          {/* TAB: Pedidos */}
          <Tabs.Content value="orders">
            <CustomerOrdersHistory />
          </Tabs.Content>

          {/* TAB: Segmentos */}
          <Tabs.Content value="segments">
            <CustomerSegments />
          </Tabs.Content>

          {/* TAB: Análisis */}
          <Tabs.Content value="analytics">
            <CustomerAnalytics />
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}