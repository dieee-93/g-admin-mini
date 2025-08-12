// BusinessAnalyticsPage.tsx - Cross-module analytics and insights
import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Card, 
  SimpleGrid, 
  Badge, 
  Tabs,
  Button
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  PresentationChartBarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

// Import existing analytics components that should be moved here
// import { CrossModuleAnalytics } from '../business/CrossModuleAnalytics';
// These will be moved from their current locations:
// import { RFMAnalyticsDashboard } from '../../../modules/customers/components/RFMAnalyticsDashboard/RFMAnalyticsDashboard';
// import { AdvancedSalesAnalyticsDashboard } from '../../../modules/sales/components/Analytics/AdvancedSalesAnalyticsDashboard';

const BusinessAnalyticsPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState('overview');

  const analyticsModules = [
    {
      id: 'sales',
      title: 'Sales Analytics',
      description: 'Revenue analysis, trends, and forecasting',
      icon: CurrencyDollarIcon,
      color: 'green',
      metrics: ['Revenue Growth', 'Sales Velocity', 'Conversion Rates', 'Seasonal Trends'],
      status: 'active'
    },
    {
      id: 'customers',
      title: 'Customer Analytics',
      description: 'RFM analysis and customer segmentation',
      icon: UsersIcon,
      color: 'blue',
      metrics: ['Customer Lifetime Value', 'RFM Scores', 'Segmentation', 'Churn Risk'],
      status: 'active'
    },
    {
      id: 'operations',
      title: 'Operations Analytics',
      description: 'Kitchen efficiency and order management',
      icon: PresentationChartBarIcon,
      color: 'purple',
      metrics: ['Order Cycle Time', 'Kitchen Efficiency', 'Staff Productivity', 'Resource Utilization'],
      status: 'development'
    },
    {
      id: 'inventory',
      title: 'Inventory Analytics',
      description: 'Stock optimization and ABC analysis',
      icon: BuildingStorefrontIcon,
      color: 'orange',
      metrics: ['Stock Turnover', 'ABC Classification', 'Waste Analysis', 'Cost Variance'],
      status: 'active'
    },
    {
      id: 'financial',
      title: 'Financial Analytics',
      description: 'Profitability and cost analysis',
      icon: ArrowTrendingUpIcon,
      color: 'teal',
      metrics: ['Profit Margins', 'Cost Centers', 'Budget Variance', 'ROI Analysis'],
      status: 'development'
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'ML-powered forecasting and insights',
      icon: ArrowTrendingUpIcon,
      color: 'cyan',
      metrics: ['Demand Forecasting', 'Trend Prediction', 'Risk Assessment', 'Optimization Opportunities'],
      status: 'development'
    }
  ];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '$47,832',
      change: '+12.5%',
      period: 'vs último mes',
      color: 'green'
    },
    {
      title: 'Active Customers',
      value: '1,247',
      change: '+8.3%',
      period: 'vs último mes',
      color: 'blue'
    },
    {
      title: 'Average Order',
      value: '$38.42',
      change: '-2.1%',
      period: 'vs último mes',
      color: 'orange'
    },
    {
      title: 'Profit Margin',
      value: '23.8%',
      change: '+1.2%',
      period: 'vs último mes',
      color: 'purple'
    }
  ];

  return (
    <Box p="6">
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">Business Analytics</Heading>
          <Text color="gray.600" fontSize="lg">
            Cross-module analytics and strategic insights for data-driven decisions
          </Text>
        </Box>

        {/* KPI Overview Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
          {kpiCards.map((kpi, index) => (
            <Card.Root key={index}>
              <Card.Body>
                <VStack align="start" gap="2">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    {kpi.title}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {kpi.value}
                  </Text>
                  <HStack>
                    <Text 
                      fontSize="sm" 
                      color={kpi.change.startsWith('+') ? 'green.600' : 'red.600'}
                      fontWeight="medium"
                    >
                      {kpi.change}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {kpi.period}
                    </Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        {/* Analytics Modules */}
        <Box w="full">
          <Text fontSize="lg" fontWeight="semibold" mb="4">Analytics Modules</Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
            {analyticsModules.map((module) => (
              <Card.Root 
                key={module.id}
                variant="outline"
                cursor="pointer"
                _hover={{ shadow: 'md', borderColor: `${module.color}.200` }}
                onClick={() => setActiveModule(module.id)}
              >
                <Card.Body>
                  <VStack align="start" gap="4">
                    <HStack justify="space-between" w="full">
                      <HStack gap="3">
                        <Box p="2" bg={`${module.color}.50`} borderRadius="md">
                          <module.icon className={`w-5 h-5 text-${module.color}-600`} />
                        </Box>
                        <Text fontWeight="semibold">{module.title}</Text>
                      </HStack>
                      <Badge 
                        colorPalette={module.status === 'active' ? 'green' : 'yellow'}
                        size="sm"
                      >
                        {module.status === 'active' ? 'Disponible' : 'En Desarrollo'}
                      </Badge>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600">
                      {module.description}
                    </Text>
                    
                    <VStack align="start" gap="1" w="full">
                      <Text fontSize="xs" fontWeight="medium" color="gray.500">
                        Métricas clave:
                      </Text>
                      {module.metrics.map((metric, index) => (
                        <Text key={index} fontSize="xs" color="gray.600">
                          • {metric}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Box>

        {/* Main Analytics Interface */}
        <Card.Root w="full">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="md">Analytics Dashboard</Heading>
              <HStack gap="2">
                <Button size="sm" variant="outline">
                  Export Data
                </Button>
                <Button size="sm" variant="outline">
                  Schedule Report
                </Button>
              </HStack>
            </HStack>
          </Card.Header>
          
          <Card.Body>
            <Tabs.Root value={activeModule} onValueChange={(details) => setActiveModule(details.value)}>
              <Tabs.List>
                <Tabs.Trigger value="overview">
                  <HStack gap="2">
                    <DocumentChartBarIcon className="w-4 h-4" />
                    <Text>Overview</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="sales">
                  <HStack gap="2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <Text>Sales</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="customers">
                  <HStack gap="2">
                    <UsersIcon className="w-4 h-4" />
                    <Text>Customers</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="cross-module">
                  <HStack gap="2">
                    <ChartBarIcon className="w-4 h-4" />
                    <Text>Cross-Module</Text>
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="overview" mt="4">
                <Box p="4">
                  <Text color="gray.600" textAlign="center">
                    Executive dashboard overview with key performance indicators across all modules.
                  </Text>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="sales" mt="4">
                <Box p="4">
                  <Text color="gray.600" textAlign="center">
                    Advanced sales analytics dashboard will be integrated here.
                  </Text>
                  {/* <AdvancedSalesAnalyticsDashboard /> */}
                </Box>
              </Tabs.Content>

              <Tabs.Content value="customers" mt="4">
                <Box p="4">
                  <Text color="gray.600" textAlign="center">
                    Customer analytics including RFM analysis will be integrated here.
                  </Text>
                  {/* <RFMAnalyticsDashboard /> */}
                </Box>
              </Tabs.Content>

              <Tabs.Content value="cross-module" mt="4">
                <Box p="6" textAlign="center">
                  <VStack gap="4">
                    <ChartBarIcon className="w-16 h-16 text-blue-500 mx-auto" />
                    <Heading size="md">Cross-Module Analytics</Heading>
                    <Text color="gray.600">
                      Cross-module analytics dashboard coming soon...
                    </Text>
                  </VStack>
                </Box>
              </Tabs.Content>
            </Tabs.Root>
          </Card.Body>
        </Card.Root>

        {/* Quick Actions */}
        <Card.Root w="full" variant="subtle">
          <Card.Body>
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontWeight="semibold">Quick Analytics Actions</Text>
                <Text fontSize="sm" color="gray.600">
                  Common analytics tasks and reports
                </Text>
              </VStack>
              <HStack gap="2">
                <Button size="sm" variant="outline">
                  <DocumentChartBarIcon className="w-4 h-4" style={{marginRight: '8px'}} />
                  Generate Executive Report
                </Button>
                <Button size="sm" variant="outline">
                  <ArrowTrendingUpIcon className="w-4 h-4" style={{marginRight: '8px'}} />
                  Performance Analysis
                </Button>
                <Button size="sm" variant="outline">
                  <ArrowTrendingUpIcon className="w-4 h-4" style={{marginRight: '8px'}} />
                  Predictive Insights
                </Button>
              </HStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default BusinessAnalyticsPage;