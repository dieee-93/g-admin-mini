// CrossModuleSection.tsx - Cross-module analytics integration (migrated from tools)
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Progress,
  Alert
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PuzzlePieceIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { Icon, CardWrapper } from '@/shared/ui/';

// Cross-Module Analytics Interfaces
interface ModuleMetric {
  moduleId: string;
  moduleName: string;
  metricId: string;
  metricName: string;
  value: number;
  unit: string;
  category: 'financial' | 'operational' | 'customer' | 'inventory' | 'staff';
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
}

interface CrossModuleCorrelation {
  id: string;
  metric1: ModuleMetric;
  metric2: ModuleMetric;
  correlationCoefficient: number; // -1 to 1
  correlationStrength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';
  correlationType: 'positive' | 'negative';
  significance: number; // 0-100% (statistical significance)
  businessInsight: string;
  actionableRecommendation?: string;
  impactScore: number; // 0-100
}

const CrossModuleSection: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Mock cross-module correlations
  const correlations: CrossModuleCorrelation[] = [
    {
      id: 'sales_inventory_correlation',
      metric1: {
        moduleId: 'sales',
        moduleName: 'Sales',
        metricId: 'daily_revenue',
        metricName: 'Daily Revenue',
        value: 2847,
        unit: '$',
        category: 'financial',
        timestamp: '2025-01-13T10:30:00Z',
        trend: 'up',
        change: 12.3
      },
      metric2: {
        moduleId: 'inventory',
        moduleName: 'Materials',
        metricId: 'stock_availability',
        metricName: 'Stock Availability',
        value: 87.2,
        unit: '%',
        category: 'inventory',
        timestamp: '2025-01-13T10:30:00Z',
        trend: 'stable',
        change: 2.1
      },
      correlationCoefficient: 0.82,
      correlationStrength: 'very_strong',
      correlationType: 'positive',
      significance: 94,
      businessInsight: 'Strong positive correlation between stock availability and daily revenue. Higher stock levels directly correlate with increased sales capacity.',
      actionableRecommendation: 'Maintain optimal stock levels for high-demand items to maximize revenue potential.',
      impactScore: 89
    },
    {
      id: 'customer_staff_correlation',
      metric1: {
        moduleId: 'customers',
        moduleName: 'Customers',
        metricId: 'satisfaction_score',
        metricName: 'Customer Satisfaction',
        value: 4.6,
        unit: '/5',
        category: 'customer',
        timestamp: '2025-01-13T10:30:00Z',
        trend: 'up',
        change: 5.2
      },
      metric2: {
        moduleId: 'staff',
        moduleName: 'Staff',
        metricId: 'efficiency_score',
        metricName: 'Staff Efficiency',
        value: 91.5,
        unit: '%',
        category: 'staff',
        timestamp: '2025-01-13T10:30:00Z',
        trend: 'up',
        change: 3.8
      },
      correlationCoefficient: 0.76,
      correlationStrength: 'strong',
      correlationType: 'positive',
      significance: 87,
      businessInsight: 'Customer satisfaction strongly correlates with staff efficiency. Well-performing teams deliver better customer experiences.',
      actionableRecommendation: 'Invest in staff training and performance management to improve customer satisfaction.',
      impactScore: 78
    }
  ];

  // Module health overview
  const moduleHealth = [
    { module: 'Sales', health: 92, status: 'excellent', trend: 'up' },
    { module: 'Materials', health: 78, status: 'good', trend: 'stable' },
    { module: 'Customers', health: 85, status: 'good', trend: 'up' },
    { module: 'Staff', health: 89, status: 'excellent', trend: 'up' },
    { module: 'Operations', health: 73, status: 'fair', trend: 'down' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'green';
      case 'strong': return 'blue';
      case 'moderate': return 'yellow';
      case 'weak': return 'orange';
      case 'very_weak': return 'red';
      default: return 'gray';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'green';
    if (health >= 80) return 'blue';
    if (health >= 70) return 'yellow';
    if (health >= 60) return 'orange';
    return 'red';
  };

  if (loading) {
    return (
      <CardWrapper>
        <CardWrapper.Body>
          <Text>Loading cross-module analytics...</Text>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Cross-Module Health Overview */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack gap="2">
            <Icon icon={PuzzlePieceIcon} size="md" color="var(--chakra-colors-blue-500)" />
            <Text fontSize="lg" fontWeight="semibold">Module Health Overview</Text>
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} gap="4">
            {moduleHealth.map((module) => {
              const TrendIcon = module.trend === 'up' ? ArrowTrendingUpIcon : 
                               module.trend === 'down' ? ArrowTrendingDownIcon : null;
              
              return (
                <CardWrapper key={module.module} variant="outline">
                  <CardWrapper.Body>
                    <VStack align="center" gap="3">
                      <Text fontSize="sm" fontWeight="medium">{module.module}</Text>
                      <VStack gap="1">
                        <Text fontSize="2xl" fontWeight="bold" color={`${getHealthColor(module.health)}.500`}>
                          {module.health}
                        </Text>
                        <Text fontSize="xs" color="gray.500">Health Score</Text>
                      </VStack>
                      <HStack gap="2">
                        <Badge colorPalette={getHealthColor(module.health)} variant="subtle" size="sm">
                          {module.status}
                        </Badge>
                        {TrendIcon && (
                          <Icon icon={TrendIcon} size="xs" color={module.trend === 'up' ? 'var(--chakra-colors-green-500)' : 'var(--chakra-colors-red-500)'} />
                        )}
                      </HStack>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>
              );
            })}
          </SimpleGrid>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Cross-Module Correlations */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack justify="space-between">
            <HStack gap="2">
              <Icon icon={ArrowsRightLeftIcon} size="md" color="var(--chakra-colors-purple-500)" />
              <Text fontSize="lg" fontWeight="semibold">Cross-Module Correlations</Text>
            </HStack>
            <Badge colorPalette="purple" variant="subtle">AI-Powered Insights</Badge>
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack gap="4">
            {correlations.map((correlation) => (
              <CardWrapper key={correlation.id} variant="outline" w="full">
                <CardWrapper.Body>
                  <VStack align="start" gap="4">
                    {/* Correlation Header */}
                    <HStack justify="space-between" w="full">
                      <HStack gap="4">
                        <VStack align="center" gap="1">
                          <Text fontSize="sm" fontWeight="medium">{correlation.metric1.moduleName}</Text>
                          <Text fontSize="xs" color="gray.600">{correlation.metric1.metricName}</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {correlation.metric1.value.toLocaleString()}{correlation.metric1.unit}
                          </Text>
                        </VStack>
                        
                        <Icon icon={ArrowsRightLeftIcon} size="lg" color="var(--chakra-colors-gray-400)" />
                        
                        <VStack align="center" gap="1">
                          <Text fontSize="sm" fontWeight="medium">{correlation.metric2.moduleName}</Text>
                          <Text fontSize="xs" color="gray.600">{correlation.metric2.metricName}</Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {correlation.metric2.value.toLocaleString()}{correlation.metric2.unit}
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <VStack align="end" gap="1">
                        <Badge 
                          colorPalette={getStrengthColor(correlation.correlationStrength)} 
                          variant="solid"
                        >
                          {correlation.correlationStrength.replace('_', ' ')}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {(correlation.correlationCoefficient * 100).toFixed(0)}% correlation
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {correlation.significance}% significance
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Business Insight */}
                    <Alert.Root status="info" variant="subtle">
                      <Icon icon={LightBulbIcon} size="sm" />
                      <Alert.Title>Business Insight</Alert.Title>
                      <Alert.Description>
                        {correlation.businessInsight}
                      </Alert.Description>
                    </Alert.Root>

                    {/* Recommendation */}
                    {correlation.actionableRecommendation && (
                      <Box 
                        p="3" 
                         
                        borderRadius="md" 
                        borderLeft="4px solid" 
                        borderLeftColor="green.500"
                        w="full"
                      >
                        <HStack gap="2">
                          <Icon icon={CheckCircleIcon} size="sm" color="var(--chakra-colors-green-600)" />
                          <Text fontSize="sm" color="green.800" fontWeight="medium">
                            Recommendation
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="green.700" mt="1">
                          {correlation.actionableRecommendation}
                        </Text>
                      </Box>
                    )}

                    {/* Impact Score */}
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">Business Impact Potential</Text>
                      <HStack gap="2">
                        <Progress.Root value={correlation.impactScore} size="sm" width="100px">
                          <Progress.Track>
                            <Progress.Range bg="purple.500" />
                          </Progress.Track>
                        </Progress.Root>
                        <Text fontSize="sm" fontWeight="medium">{correlation.impactScore}/100</Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            ))}
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Action Items */}
      <CardWrapper>
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="semibold">Recommended Actions</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack gap="3">
            <HStack justify="space-between" w="full" p="3" bg="blue.50" borderRadius="md">
              <VStack align="start" gap="1">
                <Text fontSize="sm" fontWeight="medium">Optimize Stock Management</Text>
                <Text fontSize="xs" color="gray.600">Based on Sales-Inventory correlation</Text>
              </VStack>
              <Button size="sm" colorPalette="blue">Implement</Button>
            </HStack>
            
            <HStack justify="space-between" w="full" p="3"  borderRadius="md">
              <VStack align="start" gap="1">
                <Text fontSize="sm" fontWeight="medium">Staff Training Program</Text>
                <Text fontSize="xs" color="gray.600">Based on Customer-Staff correlation</Text>
              </VStack>
              <Button size="sm" colorPalette="green">Plan</Button>
            </HStack>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
};

export default CrossModuleSection;