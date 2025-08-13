// DashboardOverview.tsx - Modern dashboard overview inspired by Shopify/Stripe
import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  SimpleGrid,
  Badge,
  Button,
  Alert,
  Progress
} from '@chakra-ui/react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMaterials } from '@/modules/materials/logic/useMaterials';
import { useSales } from '@/modules/sales/logic/useSales';
import { useCustomers } from '@/modules/customers/logic/useCustomers';

export function DashboardOverview() {
  const { navigate } = useNavigation();
  const { inventoryStats, alertSummary, alerts } = useMaterials();
  const { salesStats } = useSales();
  const { customersStats } = useCustomers();

  // Hero metrics for modern dashboard
  const heroMetrics = [
    {
      id: 'revenue-today',
      title: 'Revenue Today',
      value: '$2,847',
      change: '+12.3%',
      trend: 'up' as const,
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      id: 'orders-today',
      title: 'Orders Today',
      value: '47',
      change: '+5.2%',
      trend: 'up' as const,
      icon: ShoppingCartIcon,
      color: 'blue'
    },
    {
      id: 'low-stock',
      title: 'Low Stock Items',
      value: inventoryStats.lowStockItems.toString(),
      change: 'Needs attention',
      trend: alertSummary.hasCriticalAlerts ? 'down' : 'neutral' as const,
      icon: CubeIcon,
      color: alertSummary.hasCriticalAlerts ? 'red' : 'gray'
    },
    {
      id: 'active-customers',
      title: 'Active Customers',
      value: '234',
      change: '+8.1%',
      trend: 'up' as const,
      icon: UsersIcon,
      color: 'purple'
    }
  ];

  const quickActions = [
    {
      id: 'new-sale',
      title: 'New Sale',
      description: 'Process a new order',
      action: () => navigate('sales', '/'),
      color: 'green'
    },
    {
      id: 'add-inventory',
      title: 'Add Inventory',
      description: 'Update stock levels',
      action: () => navigate('materials', '/'),
      color: 'blue'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'See detailed insights',
      action: () => {},
      color: 'purple'
    }
  ];

  return (
    <VStack gap="6" align="stretch">
      {/* Critical Alerts */}
      {alertSummary.total > 0 && (
        <Alert.Root status="warning">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <Alert.Title>Stock Alerts</Alert.Title>
          <Alert.Description>
            {alertSummary.critical} critical, {alertSummary.warning} warning items need attention
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Hero Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="6">
        {heroMetrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? ArrowTrendingUpIcon : 
                           metric.trend === 'down' ? ArrowTrendingDownIcon : null;
          
          return (
            <Card.Root key={metric.id} p="6">
              <Card.Body>
                <VStack align="start" gap="4">
                  <HStack justify="space-between" w="full">
                    <Icon className={`w-8 h-8 text-${metric.color}-500`} />
                    {TrendIcon && (
                      <TrendIcon className={`w-4 h-4 text-${metric.trend === 'up' ? 'green' : 'red'}-500`} />
                    )}
                  </HStack>
                  
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" color="gray.600">{metric.title}</Text>
                    <Text fontSize="3xl" fontWeight="bold">{metric.value}</Text>
                    <Text 
                      fontSize="sm" 
                      color={metric.trend === 'up' ? 'green.600' : 
                            metric.trend === 'down' ? 'red.600' : 'gray.600'}
                    >
                      {metric.change}
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </SimpleGrid>

      {/* Two Column Layout */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        {/* Recent Activity */}
        <Card.Root>
          <Card.Header>
            <Text fontSize="lg" fontWeight="semibold">Recent Activity</Text>
          </Card.Header>
          <Card.Body>
            <VStack align="start" gap="4">
              <HStack justify="space-between" w="full">
                <VStack align="start" gap="1">
                  <Text fontSize="sm" fontWeight="medium">Last sale processed</Text>
                  <Text fontSize="xs" color="gray.600">2 minutes ago</Text>
                </VStack>
                <Badge colorPalette="green" variant="subtle">+$45.50</Badge>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <VStack align="start" gap="1">
                  <Text fontSize="sm" fontWeight="medium">Inventory updated</Text>
                  <Text fontSize="xs" color="gray.600">15 minutes ago</Text>
                </VStack>
                <Badge colorPalette="blue" variant="subtle">+12 items</Badge>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <VStack align="start" gap="1">
                  <Text fontSize="sm" fontWeight="medium">New customer registered</Text>
                  <Text fontSize="xs" color="gray.600">1 hour ago</Text>
                </VStack>
                <Badge colorPalette="purple" variant="subtle">Customer</Badge>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Quick Actions */}
        <Card.Root>
          <Card.Header>
            <Text fontSize="lg" fontWeight="semibold">Quick Actions</Text>
          </Card.Header>
          <Card.Body>
            <VStack gap="3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  colorPalette={action.color}
                  onClick={action.action}
                  w="full"
                  justifyContent="space-between"
                  rightIcon={<ArrowRightIcon className="w-4 h-4" />}
                >
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">{action.title}</Text>
                    <Text fontSize="xs" color="gray.600">{action.description}</Text>
                  </VStack>
                </Button>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Performance Summary */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">Today's Performance</Text>
            <Badge colorPalette="green" variant="subtle">On Track</Badge>
          </HStack>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
            <VStack align="start" gap="2">
              <Text fontSize="sm" color="gray.600">Sales Target</Text>
              <Text fontSize="xl" fontWeight="bold">85%</Text>
              <Progress.Root value={85} size="sm" w="full">
                <Progress.Track>
                  <Progress.Range bg="green.500" />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="xs" color="gray.500">$2,847 of $3,350 daily goal</Text>
            </VStack>
            
            <VStack align="start" gap="2">
              <Text fontSize="sm" color="gray.600">Order Volume</Text>
              <Text fontSize="xl" fontWeight="bold">94%</Text>
              <Progress.Root value={94} size="sm" w="full">
                <Progress.Track>
                  <Progress.Range bg="blue.500" />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="xs" color="gray.500">47 of 50 orders goal</Text>
            </VStack>
            
            <VStack align="start" gap="2">
              <Text fontSize="sm" color="gray.600">Customer Satisfaction</Text>
              <Text fontSize="xl" fontWeight="bold">98%</Text>
              <Progress.Root value={98} size="sm" w="full">
                <Progress.Track>
                  <Progress.Range bg="purple.500" />
                </Progress.Track>
              </Progress.Root>
              <Text fontSize="xs" color="gray.500">Based on recent feedback</Text>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}