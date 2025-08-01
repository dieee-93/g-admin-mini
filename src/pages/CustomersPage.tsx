// =====================================

// src/pages/CustomersPage.tsx
// ✅ NUEVO: Página de clientes integrada con NavigationContext

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

export function CustomersPage() {
  // ✅ Integración con NavigationContext
  const { setQuickActions } = useNavigation();

  // Local state
  const [activeTab, setActiveTab] = useState('customers');
  const [customerStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    avgOrderValue: 0,
    customerRetention: 0
  });

  // ✅ Configurar quick actions contextuales
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-customer',
        label: 'Nuevo Cliente',
        icon: UserIcon,
        action: () => setActiveTab('customers'),
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
                  ${customerStats.avgOrderValue}
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
            <Card.Root>
              <Card.Header>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">Lista de Clientes</Text>
                  <Button colorPalette="pink">
                    <PlusIcon className="w-4 h-4" />
                    Nuevo Cliente
                  </Button>
                </HStack>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <UsersIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Gestión de clientes en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás gestionar todos tus clientes, sus datos de contacto y preferencias.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* TAB: Pedidos */}
          <Tabs.Content value="orders">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">Historial de Pedidos</Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Historial de pedidos en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás ver el historial completo de pedidos por cliente.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* TAB: Segmentos */}
          <Tabs.Content value="segments">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">Segmentación de Clientes</Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <TagIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Segmentación en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás crear segmentos de clientes basados en comportamiento y preferencias.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* TAB: Análisis */}
          <Tabs.Content value="analytics">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">Análisis de Clientes</Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <ChartBarIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">Analytics en desarrollo</Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás ver métricas detalladas de comportamiento y valor de clientes.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}