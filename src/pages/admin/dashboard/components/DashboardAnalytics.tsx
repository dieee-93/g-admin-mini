// DashboardAnalytics.tsx - Cross-module analytics and insights (migrated from tools)
import React, { useState } from 'react';
import { 
  Stack,
  Typography,
  CardWrapper ,
  Grid,
  Badge,
  Tabs,
  Button,
  Container,
  Icon
} from '@/shared/ui';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  PresentationChartBarIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import CrossModuleSection from './CrossModuleSection';

const DashboardAnalytics: React.FC = () => {
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
    <Box>
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">Business Analytics</Heading>
          <Text color="gray.600">
            Cross-module analytics and business intelligence insights
          </Text>
        </Box>

        {/* KPI Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4" w="full">
          {kpiCards.map((kpi) => (
            <CardWrapper .Root key={kpi.title}>
              <CardWrapper .Body>
                <VStack align="start" gap="2">
                  <Text fontSize="sm" color="gray.600">{kpi.title}</Text>
                  <Text fontSize="2xl" fontWeight="bold">{kpi.value}</Text>
                  <HStack gap="2">
                    <Badge 
                      colorPalette={kpi.change.startsWith('+') ? 'green' : 'red'} 
                      variant="subtle"
                      size="sm"
                    >
                      {kpi.change}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">{kpi.period}</Text>
                  </HStack>
                </VStack>
              </CardWrapper .Body>
            </CardWrapper .Root>
          ))}
        </SimpleGrid>

        {/* Analytics Modules */}
        <CardWrapper .Root w="full">
          <CardWrapper .Header>
            <HStack justify="space-between">
              <Heading size="lg">Analytics Modules</Heading>
              <Badge colorPalette="blue" variant="subtle">Cross-Module Insights</Badge>
            </HStack>
          </CardWrapper .Header>
          <CardWrapper .Body>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
              {analyticsModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <CardWrapper .Root 
                    key={module.id} 
                    variant="outline"
                    cursor="pointer"
                    _hover={{ 
                      borderColor: `${module.color}.300`,
                      transform: 'translateY(-2px)',
                      shadow: 'md'
                    }}
                    transition="all 0.2s"
                    onClick={() => setActiveModule(module.id)}
                  >
                    <CardWrapper .Body>
                      <VStack align="start" gap="4">
                        <HStack justify="space-between" w="full">
                          <Icon icon={IconComponent} size="2xl" color={`var(--chakra-colors-${module.color}-500)`} />
                          <Badge 
                            colorPalette={module.status === 'active' ? 'green' : 'yellow'}
                            variant="subtle"
                            size="sm"
                          >
                            {module.status}
                          </Badge>
                        </HStack>
                        
                        <VStack align="start" gap="2" w="full">
                          <Text fontSize="lg" fontWeight="semibold">{module.title}</Text>
                          <Text fontSize="sm" color="gray.600">{module.description}</Text>
                        </VStack>

                        <Box w="full">
                          <Text fontSize="xs" fontWeight="medium" mb="2" color="gray.700">
                            Key Metrics:
                          </Text>
                          <VStack align="start" gap="1">
                            {module.metrics.slice(0, 3).map((metric, index) => (
                              <Text key={index} fontSize="xs" color="gray.600">
                                • {metric}
                              </Text>
                            ))}
                            {module.metrics.length > 3 && (
                              <Text fontSize="xs" color="gray.500">
                                +{module.metrics.length - 3} more...
                              </Text>
                            )}
                          </VStack>
                        </Box>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          colorPalette={module.color}
                          w="full"
                          disabled={module.status !== 'active'}
                        >
                          {module.status === 'active' ? 'View Analytics' : 'Coming Soon'}
                        </Button>
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                );
              })}
            </SimpleGrid>
          </CardWrapper .Body>
        </CardWrapper .Root>

        {/* Cross-Module Analytics Section */}
        <CrossModuleSection />

        {/* Module Detail View */}
        {activeModule !== 'overview' && (
          <CardWrapper .Root w="full">
            <CardWrapper .Header>
              <HStack justify="space-between">
                <Heading size="lg">
                  {analyticsModules.find(m => m.id === activeModule)?.title} - Detailed View
                </Heading>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setActiveModule('overview')}
                >
                  Back to Overview
                </Button>
              </HStack>
            </CardWrapper .Header>
            <CardWrapper .Body>
              <Box p="8" textAlign="center">
                <VStack gap="4">
                  <Icon icon={DocumentChartBarIcon} size="3xl" color="var(--chakra-colors-gray-400)" style={{ width: "64px", height: "64px" }} />
                  <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                    {analyticsModules.find(m => m.id === activeModule)?.title} Dashboard
                  </Text>
                  <Text color="gray.500">
                    Advanced analytics dashboard integration coming soon...
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    This will integrate with existing {activeModule} module analytics
                  </Text>
                </VStack>
              </Box>
            </CardWrapper .Body>
          </CardWrapper .Root>
        )}
      </VStack>
    </Box>
  );
};

export default DashboardAnalytics;