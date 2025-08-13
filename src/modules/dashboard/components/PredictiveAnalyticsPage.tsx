// PredictiveAnalyticsPage.tsx - ML-powered forecasting and predictions
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
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

// Import existing predictive components
import { PredictiveAnalytics } from './ai/PredictiveAnalytics';

const PredictiveAnalyticsPage: React.FC = () => {
  const [activeModel, setActiveModel] = useState('demand');

  const mlModels = [
    {
      id: 'demand-forecasting',
      title: 'Demand Forecasting',
      description: 'Predict future demand for products and services',
      icon: ArrowTrendingUpIcon,
      accuracy: '87%',
      status: 'active',
      metrics: ['Daily Demand', 'Weekly Trends', 'Seasonal Patterns', 'Special Events Impact']
    },
    {
      id: 'sales-prediction',
      title: 'Sales Prediction',
      description: 'Forecast revenue and sales performance',
      icon: CurrencyDollarIcon,
      accuracy: '82%',
      status: 'active',
      metrics: ['Revenue Forecast', 'Product Performance', 'Channel Analysis', 'Customer Behavior']
    },
    {
      id: 'inventory-optimization',
      title: 'Inventory Optimization',
      description: 'Optimize stock levels and reduce waste',
      icon: ShoppingCartIcon,
      accuracy: '91%',
      status: 'active',
      metrics: ['Stock Levels', 'Reorder Points', 'Waste Prediction', 'Cost Optimization']
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Identify potential risks and opportunities',
      icon: ExclamationTriangleIcon,
      accuracy: '76%',
      status: 'development',
      metrics: ['Financial Risk', 'Operational Risk', 'Market Risk', 'Compliance Risk']
    },
    {
      id: 'customer-lifetime-value',
      title: 'Customer Lifetime Value',
      description: 'Predict customer value and retention',
      icon: LightBulbIcon,
      accuracy: '84%',
      status: 'development',
      metrics: ['CLV Prediction', 'Churn Risk', 'Segment Analysis', 'Retention Strategies']
    },
    {
      id: 'seasonal-forecasting',
      title: 'Seasonal Forecasting',
      description: 'Account for seasonal patterns and trends',
      icon: CalendarDaysIcon,
      accuracy: '89%',
      status: 'active',
      metrics: ['Seasonal Trends', 'Holiday Impact', 'Weather Correlation', 'Event Planning']
    }
  ];

  const forecastCards = [
    {
      title: 'Next Week Sales',
      value: '$52,847',
      confidence: '87%',
      trend: '+15.2%',
      color: 'green'
    },
    {
      title: 'Peak Hours Tomorrow',
      value: '12-2 PM',
      confidence: '91%',
      trend: '67% capacity',
      color: 'blue'
    },
    {
      title: 'Stock Alert',
      value: '3 items',
      confidence: '94%',
      trend: 'Low in 2 days',
      color: 'orange'
    },
    {
      title: 'Customer Churn Risk',
      value: '12 customers',
      confidence: '78%',
      trend: 'High risk',
      color: 'red'
    }
  ];

  return (
    <Box p="6">
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">Predictive Analytics</Heading>
          <Text color="gray.600" fontSize="lg">
            ML-powered forecasting and predictions for data-driven decisions
          </Text>
        </Box>

        {/* Forecast Overview Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
          {forecastCards.map((forecast, index) => (
            <Card.Root key={index}>
              <Card.Body>
                <VStack align="start" gap="2">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      {forecast.title}
                    </Text>
                    <Badge colorPalette="blue" size="sm">
                      {forecast.confidence}
                    </Badge>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    {forecast.value}
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={forecast.color === 'red' ? 'red.600' : 'green.600'}
                    fontWeight="medium"
                  >
                    {forecast.trend}
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        {/* ML Models */}
        <Box w="full">
          <Text fontSize="lg" fontWeight="semibold" mb="4">Machine Learning Models</Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
            {mlModels.map((model) => (
              <Card.Root 
                key={model.id}
                variant="outline"
                cursor="pointer"
                _hover={{ shadow: 'md', borderColor: 'purple.200' }}
              >
                <Card.Body>
                  <VStack align="start" gap="4">
                    <HStack justify="space-between" w="full">
                      <HStack gap="3">
                        <Box p="2" bg="purple.50" borderRadius="md">
                          <model.icon className="w-5 h-5 text-purple-600" />
                        </Box>
                        <Text fontWeight="semibold">{model.title}</Text>
                      </HStack>
                      <VStack gap="1">
                        <Badge 
                          colorPalette={model.status === 'active' ? 'green' : 'yellow'}
                          size="sm"
                        >
                          {model.status === 'active' ? 'Activo' : 'En Desarrollo'}
                        </Badge>
                        <Badge colorPalette="purple" size="sm">
                          {model.accuracy}
                        </Badge>
                      </VStack>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600">
                      {model.description}
                    </Text>
                    
                    <VStack align="start" gap="1" w="full">
                      <Text fontSize="xs" fontWeight="medium" color="gray.500">
                        Predicciones:
                      </Text>
                      {model.metrics.map((metric, index) => (
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
              <Heading size="md">Predictive Models Dashboard</Heading>
              <HStack gap="2">
                <Button size="sm" variant="outline">
                  <ChartBarIcon className="w-4 h-4" style={{marginRight: '8px'}} />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <CpuChipIcon className="w-4 h-4" style={{marginRight: '8px'}} />
                  Train Models
                </Button>
              </HStack>
            </HStack>
          </Card.Header>
          
          <Card.Body>
            <Tabs.Root value={activeModel} onValueChange={(details) => setActiveModel(details.value)}>
              <Tabs.List>
                <Tabs.Trigger value="demand">
                  <HStack gap="2">
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                    <Text>Demand</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="sales">
                  <HStack gap="2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <Text>Sales</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="inventory">
                  <HStack gap="2">
                    <ShoppingCartIcon className="w-4 h-4" />
                    <Text>Inventory</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="advanced">
                  <HStack gap="2">
                    <CpuChipIcon className="w-4 h-4" />
                    <Text>Advanced</Text>
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="demand" mt="4">
                <Box p="4">
                  <Text color="gray.600" textAlign="center" mb="4">
                    Demand forecasting model with 87% accuracy
                  </Text>
                  {/* Demand forecasting charts would go here */}
                </Box>
              </Tabs.Content>

              <Tabs.Content value="sales" mt="4">
                <Box p="4">
                  <Text color="gray.600" textAlign="center" mb="4">
                    Sales prediction model with 82% accuracy
                  </Text>
                  {/* Sales prediction charts would go here */}
                </Box>
              </Tabs.Content>

              <Tabs.Content value="inventory" mt="4">
                <Box p="4">
                  <Text color="gray.600" textAlign="center" mb="4">
                    Inventory optimization model with 91% accuracy
                  </Text>
                  {/* Inventory optimization charts would go here */}
                </Box>
              </Tabs.Content>

              <Tabs.Content value="advanced" mt="4">
                <PredictiveAnalytics />
              </Tabs.Content>
            </Tabs.Root>
          </Card.Body>
        </Card.Root>

        {/* Model Performance Summary */}
        <Card.Root w="full" variant="subtle">
          <Card.Body>
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontWeight="semibold">Model Performance</Text>
                <Text fontSize="sm" color="gray.600">
                  Average accuracy across all active models
                </Text>
              </VStack>
              <HStack gap="6">
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">86%</Text>
                  <Text fontSize="sm" color="gray.600">Overall Accuracy</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">6</Text>
                  <Text fontSize="sm" color="gray.600">Active Models</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">2.3s</Text>
                  <Text fontSize="sm" color="gray.600">Avg Response</Text>
                </VStack>
              </HStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default PredictiveAnalyticsPage;