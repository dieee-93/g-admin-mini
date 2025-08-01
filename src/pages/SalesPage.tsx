// src/pages/SalesPage.tsx
// ✅ INTEGRADO: Módulo de ventas con NavigationContext

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
  CurrencyDollarIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

// ✅ INTEGRADO: Usar componentes existentes de features/sales
import { SalesWithStockView } from '@/features/sales/components/SaleWithStockView';

export function SalesPage() {
  // ✅ NUEVO: Integración con NavigationContext
  const { setQuickActions } = useNavigation();

  // Local state
  const [activeTab, setActiveTab] = useState('new-sale');
  const [salesStats] = useState({
    todaySales: 5,
    todayRevenue: 2450,
    pendingOrders: 3,
    totalCustomers: 28
  });

  // ✅ NUEVO: Configurar quick actions contextuales
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-sale',
        label: 'Nueva Venta',
        icon: PlusIcon,
        action: () => setActiveTab('new-sale'),
        color: 'green'
      },
      {
        id: 'view-sales',
        label: 'Ver Ventas',
        icon: ClipboardDocumentListIcon,
        action: () => setActiveTab('sales-list'),
        color: 'blue'
      },
      {
        id: 'customers',
        label: 'Clientes',
        icon: UsersIcon,
        action: () => setActiveTab('customers'),
        color: 'purple'
      }
    ];

    setQuickActions(quickActions);

    // Cleanup al desmontar
    return () => setQuickActions([]);
  }, [setQuickActions]);

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* ✅ Header con métricas */}
        <VStack align="start" gap="2">
          <HStack justify="space-between" w="full">
            <VStack align="start" gap="1">
              <Text fontSize="3xl" fontWeight="bold">Ventas</Text>
              <Text color="gray.600">
                Gestión de ventas y clientes
              </Text>
            </VStack>

            {/* ✅ Estadísticas rápidas */}
            <Grid templateColumns="repeat(4, 1fr)" gap="6">
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {salesStats.todaySales}
                </Text>
                <Text fontSize="xs" color="gray.500">Ventas Hoy</Text>
              </VStack>
              
              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  ${salesStats.todayRevenue}
                </Text>
                <Text fontSize="xs" color="gray.500">Ingresos Hoy</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {salesStats.pendingOrders}
                </Text>
                <Text fontSize="xs" color="gray.500">Pendientes</Text>
              </VStack>

              <VStack align="center" gap="0">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {salesStats.totalCustomers}
                </Text>
                <Text fontSize="xs" color="gray.500">Clientes</Text>
              </VStack>
            </Grid>
          </HStack>
        </VStack>

        {/* ✅ Tabs del contenido */}
        <Tabs.Root 
          value={activeTab} 
          onValueChange={(e) => setActiveTab(e.value)}
          variant="line"
        >
          <Tabs.List>
            <Tabs.Trigger value="new-sale">
              <PlusIcon className="w-4 h-4" />
              Nueva Venta
            </Tabs.Trigger>
            
            <Tabs.Trigger value="sales-list">
              <ClipboardDocumentListIcon className="w-4 h-4" />
              Historial de Ventas
            </Tabs.Trigger>
            
            <Tabs.Trigger value="customers">
              <UsersIcon className="w-4 h-4" />
              Clientes
              <Badge colorPalette="purple" variant="subtle">
                {salesStats.totalCustomers}
              </Badge>
            </Tabs.Trigger>

            <Tabs.Trigger value="reports">
              <ChartBarIcon className="w-4 h-4" />
              Reportes
            </Tabs.Trigger>
          </Tabs.List>

          {/* ✅ TAB: Nueva Venta */}
          <Tabs.Content value="new-sale">
            <VStack gap="4" align="stretch">
              {/* ✅ INTEGRADO: Usar componente mejorado de features/sales */}
              <SalesWithStockView />
            </VStack>
          </Tabs.Content>

          {/* ✅ TAB: Historial de Ventas */}
          <Tabs.Content value="sales-list">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">
                  Historial de Ventas
                </Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">
                      Historial en desarrollo
                    </Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás ver todas las ventas realizadas, filtrar por fecha y cliente.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* ✅ TAB: Clientes */}
          <Tabs.Content value="customers">
            <Card.Root>
              <Card.Header>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    Gestión de Clientes
                  </Text>
                  <Button colorPalette="purple">
                    <PlusIcon className="w-4 h-4" />
                    Nuevo Cliente
                  </Button>
                </HStack>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <UsersIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">
                      Gestión de clientes en desarrollo
                    </Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás gestionar todos tus clientes, ver su historial de compras y datos de contacto.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* ✅ TAB: Reportes */}
          <Tabs.Content value="reports">
            <Card.Root>
              <Card.Header>
                <Text fontSize="lg" fontWeight="bold">
                  Reportes de Ventas
                </Text>
              </Card.Header>
              
              <Card.Body>
                <VStack gap="4" py="8">
                  <ChartBarIcon className="w-12 h-12 text-gray-400" />
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="medium">
                      Reportes en desarrollo
                    </Text>
                    <Text color="gray.500" textAlign="center">
                      Aquí podrás ver gráficos de ventas, análisis de tendencias y reportes financieros.
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