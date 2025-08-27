// ABCAnalysisPage.tsx - Advanced ABC Analysis for Inventory Management
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
  Button,
  Table,
  Progress,
  ProgressTrack,
  ProgressRange
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CircleStackIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Import the existing ABC Analysis Engine
// import { ABCAnalysisEngine } from '../../../modules/materials/intelligence/ABCAnalysisEngine';

const ABCAnalysisPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analysisType, setAnalysisType] = useState('revenue');

  // Mock data for the overview cards
  const abcOverview = {
    A: { items: 25, revenue: 67800, percentage: 73.2 },
    B: { items: 48, revenue: 18400, percentage: 19.8 },
    C: { items: 127, revenue: 6500, percentage: 7.0 }
  };

  const categoryData = [
    {
      category: 'A',
      title: 'Clase A - Críticos',
      description: 'Alto valor, control riguroso',
      color: 'red',
      items: abcOverview.A.items,
      percentage: abcOverview.A.percentage,
      revenue: abcOverview.A.revenue,
      strategy: 'Control diario, stock de seguridad mínimo'
    },
    {
      category: 'B',
      title: 'Clase B - Importantes',
      description: 'Valor moderado, control normal',
      color: 'yellow',
      items: abcOverview.B.items,
      percentage: abcOverview.B.percentage,
      revenue: abcOverview.B.revenue,
      strategy: 'Control semanal, stock moderado'
    },
    {
      category: 'C',
      title: 'Clase C - Rutinarios',
      description: 'Bajo valor, control básico',
      color: 'green',
      items: abcOverview.C.items,
      percentage: abcOverview.C.percentage,
      revenue: abcOverview.C.revenue,
      strategy: 'Control mensual, stock alto permitido'
    }
  ];

  const metrics = [
    {
      title: 'Total Items',
      value: `${abcOverview.A.items + abcOverview.B.items + abcOverview.C.items}`,
      icon: CircleStackIcon,
      color: 'blue'
    },
    {
      title: 'Total Value',
      value: `$${(abcOverview.A.revenue + abcOverview.B.revenue + abcOverview.C.revenue).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      title: 'A-Items Impact',
      value: `${abcOverview.A.percentage.toFixed(1)}%`,
      icon: ArrowTrendingUpIcon,
      color: 'red'
    },
    {
      title: 'Analysis Date',
      value: 'Today',
      icon: CheckCircleIcon,
      color: 'purple'
    }
  ];

  return (
    <Box p="6">
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">ABC Analysis</Heading>
          <Text color="gray.600" fontSize="lg">
            Advanced inventory classification and optimization using Pareto principle
          </Text>
        </Box>

        {/* Quick Metrics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
          {metrics.map((metric, index) => (
            <Card.Root key={index}>
              <Card.Body>
                <HStack gap="3">
                  <Box p="2" bg={`${metric.color}.50`} borderRadius="md">
                    <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                  </Box>
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" color="gray.600">{metric.title}</Text>
                    <Text fontSize="lg" fontWeight="bold">{metric.value}</Text>
                  </VStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>

        {/* ABC Categories Overview */}
        <Box w="full">
          <Text fontSize="lg" fontWeight="semibold" mb="4">ABC Categories</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            {categoryData.map((category) => (
              <Card.Root key={category.category} variant="outline">
                <Card.Body>
                  <VStack align="start" gap="4">
                    <HStack justify="space-between" w="full">
                      <VStack align="start" gap="1">
                        <HStack gap="2">
                          <Badge 
                            colorPalette={category.color}
                            size="lg"
                            fontWeight="bold"
                          >
                            {category.category}
                          </Badge>
                          <Text fontWeight="semibold">{category.title.split(' - ')[1]}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          {category.description}
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Category Metrics */}
                    <SimpleGrid columns={2} gap="4" w="full">
                      <VStack align="start" gap="1">
                        <Text fontSize="xs" color="gray.500">Items</Text>
                        <Text fontSize="xl" fontWeight="bold" color={`${category.color}.600`}>
                          {category.items}
                        </Text>
                      </VStack>
                      <VStack align="start" gap="1">
                        <Text fontSize="xs" color="gray.500">Revenue %</Text>
                        <Text fontSize="xl" fontWeight="bold" color={`${category.color}.600`}>
                          {category.percentage.toFixed(1)}%
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    {/* Progress Bar */}
                    <Box w="full">
                      <Progress.Root 
                        value={category.percentage} 
                        size="sm" 
                        colorPalette={category.color}
                      >
                        <ProgressTrack>
                          <ProgressRange />
                        </ProgressTrack>
                      </Progress.Root>
                    </Box>

                    {/* Revenue */}
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">Revenue:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        ${category.revenue.toLocaleString()}
                      </Text>
                    </HStack>

                    {/* Strategy */}
                    <Box 
                      p="3" 
                      bg={`${category.color}.50`} 
                      borderRadius="md" 
                      w="full"
                      border="1px solid"
                      borderColor={`${category.color}.200`}
                    >
                      <Text fontSize="xs" color={`${category.color}.700`}>
                        <strong>Estrategia:</strong> {category.strategy}
                      </Text>
                    </Box>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Box>

        {/* Main Analysis Interface */}
        <Card.Root w="full">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="md">Detailed ABC Analysis</Heading>
              <HStack gap="2">
                <Button size="sm" variant="outline" leftIcon={<DocumentChartBarIcon className="w-4 h-4" />}>
                  Export Report
                </Button>
                <Button size="sm" variant="outline" leftIcon={<ArrowTrendingUpIcon className="w-4 h-4" />}>
                  Refresh Analysis
                </Button>
              </HStack>
            </HStack>
          </Card.Header>
          
          <Card.Body>
            <Tabs.Root value={analysisType} onValueChange={(details) => setAnalysisType(details.value)}>
              <Tabs.List>
                <Tabs.Trigger value="revenue">
                  <HStack gap="2">
                    <BanknotesIcon className="w-4 h-4" />
                    <Text>By Revenue</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="quantity">
                  <HStack gap="2">
                    <CircleStackIcon className="w-4 h-4" />
                    <Text>By Quantity</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="frequency">
                  <HStack gap="2">
                    <ChartBarIcon className="w-4 h-4" />
                    <Text>By Frequency</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="engine">
                  <HStack gap="2">
                    <DocumentChartBarIcon className="w-4 h-4" />
                    <Text>Analysis Engine</Text>
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="revenue" mt="4">
                <Box p="4">
                  <VStack gap="4">
                    <Text color="gray.600" textAlign="center">
                      ABC Analysis based on revenue contribution (80/20 Pareto principle)
                    </Text>
                    {/* Revenue-based analysis charts would go here */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" w="full">
                      <Card.Root variant="subtle">
                        <Card.Body>
                          <Text fontWeight="medium" mb="2">Revenue Distribution</Text>
                          <Text fontSize="sm" color="gray.600">
                            Class A items generate 73% of total revenue with only 12.5% of items
                          </Text>
                        </Card.Body>
                      </Card.Root>
                      <Card.Root variant="subtle">
                        <Card.Body>
                          <Text fontWeight="medium" mb="2">Optimization Opportunity</Text>
                          <Text fontSize="sm" color="gray.600">
                            Focus inventory control on 25 high-value items for maximum impact
                          </Text>
                        </Card.Body>
                      </Card.Root>
                    </SimpleGrid>
                  </VStack>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="quantity" mt="4">
                <Box p="4">
                  <VStack gap="4">
                    <Text color="gray.600" textAlign="center">
                      ABC Analysis based on consumption quantity and movement frequency
                    </Text>
                    <Card.Root variant="subtle">
                      <Card.Body>
                        <Text fontWeight="medium" mb="2">Quantity-Based Insights</Text>
                        <Text fontSize="sm" color="gray.600">
                          High-volume items may require different management strategy than high-value items
                        </Text>
                      </Card.Body>
                    </Card.Root>
                  </VStack>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="frequency" mt="4">
                <Box p="4">
                  <VStack gap="4">
                    <Text color="gray.600" textAlign="center">
                      ABC Analysis based on order frequency and transaction patterns
                    </Text>
                    <Card.Root variant="subtle">
                      <Card.Body>
                        <Text fontWeight="medium" mb="2">Frequency-Based Strategy</Text>
                        <Text fontSize="sm" color="gray.600">
                          Fast-moving items require frequent monitoring regardless of value
                        </Text>
                      </Card.Body>
                    </Card.Root>
                  </VStack>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="engine" mt="4">
                <Box p="6" textAlign="center">
                  <VStack gap="4">
                    <CircleStackIcon className="w-16 h-16 text-orange-500 mx-auto" />
                    <Heading size="md">ABC Analysis Engine</Heading>
                    <Text color="gray.600">
                      Advanced ABC classification engine coming soon...
                    </Text>
                  </VStack>
                </Box>
              </Tabs.Content>
            </Tabs.Root>
          </Card.Body>
        </Card.Root>

        {/* Strategic Recommendations */}
        <Card.Root w="full" variant="subtle">
          <Card.Body>
            <HStack justify="space-between">
              <VStack align="start" gap="1">
                <Text fontWeight="semibold">Strategic Recommendations</Text>
                <Text fontSize="sm" color="gray.600">
                  Optimization opportunities based on ABC analysis
                </Text>
              </VStack>
              <VStack align="end" gap="2">
                <Badge colorPalette="red" size="sm">
                  Focus on A-Items
                </Badge>
                <Badge colorPalette="yellow" size="sm">
                  Monitor B-Items
                </Badge>
                <Badge colorPalette="green" size="sm">
                  Automate C-Items
                </Badge>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default ABCAnalysisPage;