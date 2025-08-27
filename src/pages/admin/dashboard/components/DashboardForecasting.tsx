// DashboardForecasting.tsx - Predictive Analytics with ML (migrated from tools)
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
  Button,
  Progress
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

const DashboardForecasting: React.FC = () => {
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
      id: 'customer-churn',
      title: 'Customer Churn Prediction',
      description: 'Identify customers at risk of churning',
      icon: ExclamationTriangleIcon,
      accuracy: '78%',
      status: 'training',
      metrics: ['Churn Risk Score', 'Retention Probability', 'Customer Lifetime Value', 'Engagement Patterns']
    },
    {
      id: 'seasonal-analysis',
      title: 'Seasonal Analysis',
      description: 'Analyze seasonal trends and patterns',
      icon: CalendarDaysIcon,
      accuracy: '89%',
      status: 'active',
      metrics: ['Seasonal Trends', 'Holiday Impact', 'Weather Correlations', 'Event Predictions']
    },
    {
      id: 'price-optimization',
      title: 'Price Optimization',
      description: 'Optimize pricing strategies with ML',
      icon: LightBulbIcon,
      accuracy: '84%',
      status: 'development',
      metrics: ['Optimal Pricing', 'Demand Elasticity', 'Competition Analysis', 'Profit Maximization']
    }
  ];

  const predictions = [
    {
      title: 'Tomorrow\'s Revenue',
      predicted: '$3,240',
      confidence: 89,
      trend: 'up',
      change: '+14%'
    },
    {
      title: 'Next Week Orders',
      predicted: '342',
      confidence: 82,
      trend: 'up',
      change: '+8%'
    },
    {
      title: 'Low Stock Alert',
      predicted: '12 items',
      confidence: 94,
      trend: 'down',
      change: 'Within 3 days'
    },
    {
      title: 'Peak Hour',
      predicted: '7:30 PM',
      confidence: 91,
      trend: 'stable',
      change: 'Consistent'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'training': return 'blue';
      case 'development': return 'yellow';
      default: return 'gray';
    }
  };

  const getAccuracyColor = (accuracy: string) => {
    const num = parseInt(accuracy);
    if (num >= 90) return 'green';
    if (num >= 80) return 'blue';
    if (num >= 70) return 'yellow';
    return 'orange';
  };

  return (
    <Box>
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">Forecasting Engine</Heading>
          <Text color="gray.600">
            ML-powered predictions and business forecasting
          </Text>
        </Box>

        {/* Quick Predictions */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4" w="full">
          {predictions.map((prediction) => (
            <Card.Root key={prediction.title}>
              <Card.Body>
                <VStack align="start" gap="3">
                  <Text fontSize="sm" color="gray.600">{prediction.title}</Text>
                  <Text fontSize="2xl" fontWeight="bold">{prediction.predicted}</Text>
                  <HStack justify="space-between" w="full">
                    <Badge colorPalette="blue" variant="subtle" size="sm">
                      {prediction.confidence}% confidence
                    </Badge>
                    <Text fontSize="xs" color="gray.500">{prediction.change}</Text>
                  </HStack>
                  <Progress.Root value={prediction.confidence} size="sm" w="full">
                    <Progress.Track>
                      <Progress.Range bg="blue.500" />
                    </Progress.Track>
                  </Progress.Root>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        {/* ML Models */}
        <Card.Root w="full">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="lg">Machine Learning Models</Heading>
              <Badge colorPalette="purple" variant="subtle">AI-Powered</Badge>
            </HStack>
          </Card.Header>
          <Card.Body>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6">
              {mlModels.map((model) => {
                const Icon = model.icon;
                return (
                  <Card.Root 
                    key={model.id} 
                    variant="outline"
                    cursor="pointer"
                    _hover={{ 
                      borderColor: 'purple.300',
                      transform: 'translateY(-2px)',
                      shadow: 'md'
                    }}
                    transition="all 0.2s"
                    onClick={() => setActiveModel(model.id)}
                  >
                    <Card.Body>
                      <VStack align="start" gap="4">
                        <HStack justify="space-between" w="full">
                          <Icon className="w-8 h-8 text-purple-500" />
                          <VStack align="end" gap="1">
                            <Badge 
                              colorPalette={getStatusColor(model.status)}
                              variant="subtle"
                              size="sm"
                            >
                              {model.status}
                            </Badge>
                            <Badge 
                              colorPalette={getAccuracyColor(model.accuracy)}
                              variant="solid"
                              size="sm"
                            >
                              {model.accuracy}
                            </Badge>
                          </VStack>
                        </HStack>
                        
                        <VStack align="start" gap="2" w="full">
                          <Text fontSize="lg" fontWeight="semibold">{model.title}</Text>
                          <Text fontSize="sm" color="gray.600">{model.description}</Text>
                        </VStack>

                        <Box w="full">
                          <Text fontSize="xs" fontWeight="medium" mb="2" color="gray.700">
                            Predictions:
                          </Text>
                          <VStack align="start" gap="1">
                            {model.metrics.slice(0, 3).map((metric, index) => (
                              <Text key={index} fontSize="xs" color="gray.600">
                                • {metric}
                              </Text>
                            ))}
                            {model.metrics.length > 3 && (
                              <Text fontSize="xs" color="gray.500">
                                +{model.metrics.length - 3} more...
                              </Text>
                            )}
                          </VStack>
                        </Box>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          colorPalette="purple"
                          w="full"
                          disabled={model.status !== 'active'}
                        >
                          {model.status === 'active' ? 'View Predictions' : 
                           model.status === 'training' ? 'Training...' : 'Coming Soon'}
                        </Button>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                );
              })}
            </SimpleGrid>
          </Card.Body>
        </Card.Root>

        {/* Model Performance */}
        <Card.Root w="full">
          <Card.Header>
            <HStack gap="2">
              <CpuChipIcon className="w-5 h-5 text-blue-500" />
              <Text fontSize="lg" fontWeight="semibold">Model Performance Overview</Text>
            </HStack>
          </Card.Header>
          <Card.Body>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
              <VStack align="start" gap="4">
                <Text fontSize="md" fontWeight="medium">Accuracy Trends</Text>
                {mlModels.filter(m => m.status === 'active').map((model) => (
                  <HStack key={model.id} justify="space-between" w="full">
                    <Text fontSize="sm">{model.title}</Text>
                    <HStack gap="2">
                      <Progress.Root value={parseInt(model.accuracy)} size="sm" width="100px">
                        <Progress.Track>
                          <Progress.Range bg={`${getAccuracyColor(model.accuracy)}.500`} />
                        </Progress.Track>
                      </Progress.Root>
                      <Text fontSize="sm" fontWeight="medium">{model.accuracy}</Text>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
              
              <VStack align="start" gap="4">
                <Text fontSize="md" fontWeight="medium">Model Statistics</Text>
                <VStack align="start" gap="3" w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Total Models</Text>
                    <Text fontSize="sm" fontWeight="medium">6</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Active Models</Text>
                    <Text fontSize="sm" fontWeight="medium">4</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Average Accuracy</Text>
                    <Text fontSize="sm" fontWeight="medium">85.2%</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Predictions/Day</Text>
                    <Text fontSize="sm" fontWeight="medium">1,247</Text>
                  </HStack>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">Last Updated</Text>
                    <Text fontSize="sm" fontWeight="medium">2 hours ago</Text>
                  </HStack>
                </VStack>
              </VStack>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default DashboardForecasting;