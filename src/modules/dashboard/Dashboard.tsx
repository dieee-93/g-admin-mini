// src/pages/Dashboard.tsx
// Dashboard como centro de comando funcional
// ✅ Elimina alertas duplicadas + navegación funcional

import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  Card,
  Button,
  Alert,
  Badge
} from '@chakra-ui/react';
import {
  CubeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useInventory } from '@/modules/materials/logic/useInventory';
import { useSales } from '@/modules/sales/logic/useSales';
import { useCustomers } from '@/modules/customers/logic/useCustomers';
import { useRecipes } from '@/tools/intelligence/logic/useRecipes';

export function Dashboard() {
  const { navigate, quickActions } = useNavigation();
  const { inventoryStats, alertSummary, alerts, loading } = useInventory();
  const { salesStats } = useSales();
  const { customersStats } = useCustomers();
  const { recipes } = useRecipes();

  return (
    <Box p="6">
      <VStack gap="6" align="stretch">
        {/* ✅ Header */}
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold">Dashboard</Text>
          <Text color="gray.600">
            Centro de comando de tu negocio
          </Text>
        </VStack>

        {/* ✅ ALERTAS UNIFICADAS - Solo aquí, no duplicadas */}
        {alertSummary.total > 0 && (
          <Alert.Root 
            status={alertSummary.critical > 0 ? "error" : "warning"}
            variant="surface"
          >
            <Alert.Indicator />
            <VStack align="start" gap="2" flex="1">
              <Alert.Title>
                {alertSummary.critical > 0 ? "Alertas Críticas" : "Alertas de Stock"}
              </Alert.Title>
              <Alert.Description>
                {alertSummary.critical > 0 && (
                  <Text color="red.600" fontWeight="semibold">
                    {alertSummary.critical} items con stock crítico
                  </Text>
                )}
                {alertSummary.warning > 0 && (
                  <Text color="orange.600">
                    {alertSummary.warning} items con stock bajo
                  </Text>
                )}
              </Alert.Description>
              <Button
                size="sm"
                variant="outline"
                colorPalette={alertSummary.critical > 0 ? "red" : "orange"}
                onClick={() => navigate('inventory')}
              >
                Ver Inventario
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </VStack>
          </Alert.Root>
        )}

        {/* ✅ MÉTRICAS PRINCIPALES - Con navegación funcional */}
        <Grid 
          templateColumns={{ 
            base: "1fr", 
            md: "repeat(2, 1fr)", 
            lg: "repeat(4, 1fr)" 
          }} 
          gap="6"
        >
          {/* Inventario */}
          <Card.Root 
            variant="elevated" 
            cursor="pointer"
            onClick={() => navigate('inventory')}
            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Card.Body>
              <VStack align="start" gap="3">
                <HStack justify="space-between" w="full">
                  <Box p="2" bg="green.100" borderRadius="md">
                    <CubeIcon className="w-6 h-6 text-green-600" />
                  </Box>
                  {alertSummary.total > 0 && (
                    <Badge colorPalette="red" variant="solid">
                      {alertSummary.total}
                    </Badge>
                  )}
                </HStack>
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold">
                    {inventoryStats.totalItems}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Items en inventario</Text>
                  <Text fontSize="xs" color="green.600">
                    Valor: ${inventoryStats.totalValue.toLocaleString()}
                  </Text>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Ventas con datos reales */}
          <Card.Root 
            variant="elevated" 
            cursor="pointer"
            onClick={() => navigate('sales')}
            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Card.Body>
              <VStack align="start" gap="3">
                <Box p="2" bg="teal.100" borderRadius="md">
                  <CurrencyDollarIcon className="w-6 h-6 text-teal-600" />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold">
                    ${salesStats?.monthlyRevenue?.toLocaleString() || '0'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Ventas del mes</Text>
                  <Text fontSize="xs" color="teal.600">
                    {salesStats?.monthlyTransactions || 0} transacciones
                  </Text>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Clientes con datos reales */}
          <Card.Root 
            variant="elevated" 
            cursor="pointer"
            onClick={() => navigate('customers')}
            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Card.Body>
              <VStack align="start" gap="3">
                <Box p="2" bg="pink.100" borderRadius="md">
                  <UsersIcon className="w-6 h-6 text-pink-600" />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold">
                    {customersStats?.totalCustomers || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Clientes activos</Text>
                  <Text fontSize="xs" color="pink.600">
                    {customersStats?.newThisMonth || 0} nuevos este mes
                  </Text>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Producción con datos reales */}
          <Card.Root 
            variant="elevated" 
            cursor="pointer"
            onClick={() => navigate('production')}
            _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Card.Body>
              <VStack align="start" gap="3">
                <Box p="2" bg="purple.100" borderRadius="md">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </Box>
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold">
                    {recipes?.length || 0}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Recetas disponibles</Text>
                  <Text fontSize="xs" color="purple.600">
                    {recipes?.filter(r => r.is_active).length || 0} activas
                  </Text>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* ✅ QUICK ACTIONS - Centralizadas */}
        <Card.Root>
          <Card.Header>
            <Text fontSize="lg" fontWeight="semibold">Acciones Rápidas</Text>
          </Card.Header>
          <Card.Body>
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                md: "repeat(3, 1fr)" 
              }} 
              gap="4"
            >
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="lg"
                    onClick={action.action}
                    colorPalette={action.color || 'gray'}
                    h="auto"
                    py="4"
                  >
                    <VStack gap="2">
                      <Icon className="w-6 h-6" />
                      <Text fontSize="sm">{action.label}</Text>
                    </VStack>
                  </Button>
                );
              })}
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* ✅ ALERTAS DETALLADAS - Solo si hay alertas críticas */}
        {alertSummary.critical > 0 && (
          <Card.Root>
            <Card.Header>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold" color="red.600">
                  Items con Stock Crítico
                </Text>
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorPalette="red"
                  onClick={() => navigate('inventory')}
                >
                  Ver todos
                </Button>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack gap="3" align="stretch">
                {alerts
                  .filter(alert => alert.urgency === 'critical')
                  .slice(0, 5)
                  .map((alert) => (
                    <HStack key={alert.id} justify="space-between" p="3" bg="red.50" borderRadius="md">
                      <VStack align="start" gap="1">
                        <Text fontWeight="semibold">{alert.item_name}</Text>
                        <Text fontSize="sm" color="gray.600">
                          Stock actual: {alert.current_stock} {alert.unit}
                        </Text>
                      </VStack>
                      <Badge colorPalette="red" variant="solid">
                        CRÍTICO
                      </Badge>
                    </HStack>
                  ))}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  );
}