import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Card,
  Text,
  Badge,
  Button,
  Grid,
  Progress,
  Alert,
  SimpleGrid,
  Table,
  Tabs,
  CircularProgress,
  Skeleton
} from '@chakra-ui/react';
import {
  TrophyIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface PerformanceInsight {
  category: 'revenue' | 'efficiency' | 'customer' | 'operational';
  type: 'success' | 'warning' | 'critical' | 'opportunity';
  title: string;
  description: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  action_required: boolean;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}

interface PerformanceMetrics {
  overall_score: number;
  category_scores: {
    revenue: number;
    efficiency: number;
    customer: number;
    operational: number;
  };
  insights: PerformanceInsight[];
  benchmarks: {
    industry_average: number;
    top_performers: number;
    your_position: 'leader' | 'strong' | 'average' | 'below_average';
  };
  recommendations: {
    immediate_actions: string[];
    strategic_initiatives: string[];
    long_term_goals: string[];
  };
}

export const SalesPerformanceInsights: React.FC = () => {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const generatePerformanceInsights = (): PerformanceMetrics => {
    return {
      overall_score: 87,
      category_scores: {
        revenue: 92,
        efficiency: 78,
        customer: 85,
        operational: 83
      },
      insights: [
        {
          category: 'revenue',
          type: 'success',
          title: 'Revenue Growth Acceleration',
          description: 'Monthly revenue increased by 18.7% above target',
          value: '18.7%',
          trend: 'up',
          action_required: false,
          recommendation: 'Maintain current pricing strategy and expand successful menu items',
          impact: 'high'
        },
        {
          category: 'efficiency',
          type: 'warning',
          title: 'Peak Hour Bottleneck',
          description: 'Order fulfillment time increases by 40% during 7-9 PM',
          value: '23 min',
          trend: 'up',
          action_required: true,
          recommendation: 'Add 2 kitchen staff during peak hours and pre-prepare popular items',
          impact: 'medium'
        },
        {
          category: 'customer',
          type: 'opportunity',
          title: 'Customer Retention Opportunity',
          description: '23% of customers have only made one purchase',
          value: '23%',
          trend: 'stable',
          action_required: true,
          recommendation: 'Implement welcome-back campaign with 15% discount for second visit',
          impact: 'high'
        },
        {
          category: 'operational',
          type: 'critical',
          title: 'Inventory Waste Alert',
          description: 'Food waste has increased to 12% of total inventory',
          value: '12%',
          trend: 'up',
          action_required: true,
          recommendation: 'Implement dynamic pricing for items nearing expiration and improve demand forecasting',
          impact: 'high'
        },
        {
          category: 'revenue',
          type: 'opportunity',
          title: 'Upselling Potential',
          description: 'Only 34% of orders include appetizers or desserts',
          value: '34%',
          trend: 'stable',
          action_required: false,
          recommendation: 'Train staff on suggestive selling techniques and create combo deals',
          impact: 'medium'
        },
        {
          category: 'customer',
          type: 'success',
          title: 'Customer Satisfaction Peak',
          description: 'Customer satisfaction score reached 4.8/5 stars',
          value: '4.8/5',
          trend: 'up',
          action_required: false,
          recommendation: 'Leverage positive reviews for marketing and maintain service quality',
          impact: 'medium'
        }
      ],
      benchmarks: {
        industry_average: 72,
        top_performers: 94,
        your_position: 'strong'
      },
      recommendations: {
        immediate_actions: [
          'Add kitchen staff during 7-9 PM peak hours',
          'Launch customer retention campaign for one-time buyers',
          'Implement dynamic pricing for expiring inventory',
          'Create staff training program for upselling'
        ],
        strategic_initiatives: [
          'Develop predictive inventory management system',
          'Implement customer loyalty program with personalized offers',
          'Optimize menu engineering based on profitability analysis',
          'Expand delivery options to capture additional market share'
        ],
        long_term_goals: [
          'Achieve 95+ overall performance score',
          'Reduce food waste to under 5%',
          'Increase customer retention rate to 85%',
          'Expand to 2 additional locations within 18 months'
        ]
      }
    };
  };

  const loadPerformanceInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const performanceData = generatePerformanceInsights();
      setPerformance(performanceData);
    } catch (err) {
      console.error('Error loading performance insights:', err);
      setError('Failed to load performance insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceInsights();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'green';
      case 'efficiency': return 'blue';
      case 'customer': return 'purple';
      case 'operational': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      case 'opportunity': return 'blue';
      default: return 'gray';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <FireIcon className="w-4 h-4 text-red-500" />;
      case 'medium': return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default: return <BoltIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? performance?.insights || []
    : performance?.insights.filter(insight => insight.category === selectedCategory) || [];

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator>
          <ExclamationTriangleIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Description>{error}</Alert.Description>
        <Button onClick={loadPerformanceInsights} variant="outline" size="sm" ml={4}>
          Retry
        </Button>
      </Alert.Root>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Card.Root bg="gradient-to-r from-green-600 to-teal-700" color="white">
          <Card.Body p={6}>
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <TrophyIcon className="w-8 h-8" />
                  <VStack align="start" gap={0}>
                    <Text fontSize="2xl" fontWeight="bold">Sales Performance Insights</Text>
                    <Text opacity={0.9}>Comprehensive business performance analysis and recommendations</Text>
                  </VStack>
                </HStack>
                <Button 
                  variant="outline" 
                  color="white" 
                  borderColor="whiteAlpha.300"
                  onClick={loadPerformanceInsights}
                  loading={loading}
                  size="sm"
                >
                  Refresh
                </Button>
              </HStack>

              {performance && (
                <HStack justify="center" gap={8}>
                  <VStack gap={1}>
                    <CircularProgress.Root value={performance.overall_score} size="80px">
                      <CircularProgress.Circle stroke="rgba(255,255,255,0.3)" />
                      <CircularProgress.Circle stroke="white" />
                      <CircularProgress.ValueText fontSize="lg" fontWeight="bold">
                        {performance.overall_score}
                      </CircularProgress.ValueText>
                    </CircularProgress.Root>
                    <Text opacity={0.8}>Overall Score</Text>
                  </VStack>
                  <VStack gap={1}>
                    <ShieldCheckIcon className="w-12 h-12" />
                    <Text fontSize="xl" fontWeight="bold" textTransform="capitalize">
                      {performance.benchmarks.your_position.replace('_', ' ')}
                    </Text>
                    <Text opacity={0.8}>Market Position</Text>
                  </VStack>
                </HStack>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        {loading && !performance ? (
          <VStack gap={4}>
            <Skeleton height="200px" />
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              <Skeleton height="120px" />
              <Skeleton height="120px" />
              <Skeleton height="120px" />
              <Skeleton height="120px" />
            </Grid>
          </VStack>
        ) : performance ? (
          <Tabs.Root defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">
                <ChartBarIcon className="w-4 h-4" />
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger value="insights">
                <LightBulbIcon className="w-4 h-4" />
                Insights
              </Tabs.Trigger>
              <Tabs.Trigger value="benchmarks">
                <TrophyIcon className="w-4 h-4" />
                Benchmarks
              </Tabs.Trigger>
              <Tabs.Trigger value="recommendations">
                <BoltIcon className="w-4 h-4" />
                Action Plan
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview">
              <VStack align="stretch" gap={6}>
                {/* Category Scores */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                  {Object.entries(performance.category_scores).map(([category, score]) => (
                    <Card.Root 
                      key={category}
                      borderTop="4px solid" 
                      borderTopColor={`${getCategoryColor(category)}.400`}
                    >
                      <Card.Body p={4} textAlign="center">
                        <VStack gap={3}>
                          <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                            {category}
                          </Text>
                          <CircularProgress.Root value={score} size="60px">
                            <CircularProgress.Circle stroke={`${getCategoryColor(category)}.400`} />
                            <CircularProgress.ValueText fontSize="sm" fontWeight="bold">
                              {score}
                            </CircularProgress.ValueText>
                          </CircularProgress.Root>
                          <Badge 
                            colorPalette={getCategoryColor(category)} 
                            size="sm"
                          >
                            {score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Average' : 'Needs Improvement'}
                          </Badge>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </SimpleGrid>

                {/* Critical Insights */}
                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Critical Insights</Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack align="stretch" gap={4}>
                      {performance.insights
                        .filter(insight => insight.type === 'critical' || insight.action_required)
                        .map((insight, index) => (
                          <Alert.Root key={index} status={insight.type === 'critical' ? 'error' : 'warning'}>
                            <Alert.Indicator>
                              {insight.type === 'critical' ? 
                                <ExclamationTriangleIcon className="w-5 h-5" /> :
                                <ClockIcon className="w-5 h-5" />
                              }
                            </Alert.Indicator>
                            <Alert.Description>
                              <VStack align="stretch" gap={2}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold">{insight.title}</Text>
                                  <Badge colorPalette={getTypeColor(insight.type)} size="sm">
                                    Action Required
                                  </Badge>
                                </HStack>
                                <Text fontSize="sm">{insight.description}</Text>
                                <Text fontSize="sm" fontStyle="italic" color="blue.600">
                                  Recommendation: {insight.recommendation}
                                </Text>
                              </VStack>
                            </Alert.Description>
                          </Alert.Root>
                        ))}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="insights">
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">Performance Insights</Text>
                  <HStack gap={2}>
                    {['all', 'revenue', 'efficiency', 'customer', 'operational'].map(category => (
                      <Button
                        key={category}
                        size="sm"
                        variant={selectedCategory === category ? 'solid' : 'outline'}
                        colorPalette={category === 'all' ? 'gray' : getCategoryColor(category)}
                        onClick={() => setSelectedCategory(category)}
                        textTransform="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </HStack>
                </HStack>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  {filteredInsights.map((insight, index) => (
                    <Card.Root key={index} variant="outline">
                      <Card.Body p={4}>
                        <VStack align="stretch" gap={3}>
                          <HStack justify="space-between">
                            <Badge colorPalette={getTypeColor(insight.type)} size="sm">
                              {insight.type}
                            </Badge>
                            <HStack gap={1}>
                              {getImpactIcon(insight.impact)}
                              {getTrendIcon(insight.trend)}
                            </HStack>
                          </HStack>
                          
                          <VStack align="stretch" gap={2}>
                            <Text fontWeight="bold" fontSize="md">{insight.title}</Text>
                            <Text fontSize="sm" color="gray.600">{insight.description}</Text>
                          </VStack>

                          <HStack justify="space-between">
                            <Text fontSize="lg" fontWeight="bold" color={`${getCategoryColor(insight.category)}.600`}>
                              {insight.value}
                            </Text>
                            <Badge 
                              colorPalette={getCategoryColor(insight.category)} 
                              size="sm" 
                              textTransform="capitalize"
                            >
                              {insight.category}
                            </Badge>
                          </HStack>

                          <Box p={3} bg="bg.canvas" borderRadius="md">
                            <Text fontSize="sm" fontWeight="medium" color="blue.600">
                              💡 {insight.recommendation}
                            </Text>
                          </Box>

                          {insight.action_required && (
                            <Badge colorPalette="red" size="sm" alignSelf="start">
                              Action Required
                            </Badge>
                          )}
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </Grid>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="benchmarks">
              <VStack align="stretch" gap={6}>
                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Industry Benchmarks</Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between">
                        <Text>Your Performance</Text>
                        <Badge colorPalette="green" size="lg">{performance.overall_score}</Badge>
                      </HStack>
                      <Progress.Root value={performance.overall_score} colorPalette="green" size="md">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>

                      <HStack justify="space-between">
                        <Text>Industry Average</Text>
                        <Text fontWeight="bold">{performance.benchmarks.industry_average}</Text>
                      </HStack>
                      <Progress.Root value={performance.benchmarks.industry_average} colorPalette="gray" size="sm">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>

                      <HStack justify="space-between">
                        <Text>Top Performers</Text>
                        <Text fontWeight="bold" color="purple.600">{performance.benchmarks.top_performers}</Text>
                      </HStack>
                      <Progress.Root value={performance.benchmarks.top_performers} colorPalette="purple" size="sm">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Competitive Position</Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack align="center" gap={4}>
                      <ShieldCheckIcon className="w-16 h-16 text-green-500" />
                      <Text fontSize="2xl" fontWeight="bold" color="green.600" textTransform="capitalize">
                        {performance.benchmarks.your_position.replace('_', ' ')} Performer
                      </Text>
                      <Text textAlign="center" color="gray.600">
                        You're performing above industry average and competing well with top performers
                      </Text>
                      <Badge colorPalette="green" size="lg">
                        +{performance.overall_score - performance.benchmarks.industry_average} points above average
                      </Badge>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="recommendations">
              <VStack align="stretch" gap={6}>
                <Card.Root bg="gradient-to-r from-blue-500 to-purple-600" color="white">
                  <Card.Body p={6}>
                    <VStack align="center" gap={4}>
                      <BoltIcon className="w-12 h-12" />
                      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                        Strategic Action Plan
                      </Text>
                      <Text textAlign="center" opacity={0.9}>
                        Prioritized recommendations to optimize your business performance
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                  <Card.Root borderTop="4px solid" borderTopColor="red.400">
                    <Card.Header>
                      <HStack gap={2}>
                        <FireIcon className="w-5 h-5 text-red-500" />
                        <Text fontWeight="semibold" color="red.600">Immediate Actions</Text>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <VStack align="stretch" gap={3}>
                        {performance.recommendations.immediate_actions.map((action, index) => (
                          <HStack key={index} gap={3} align="start">
                            <Badge colorPalette="red" size="sm">{index + 1}</Badge>
                            <Text fontSize="sm">{action}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root borderTop="4px solid" borderTopColor="blue.400">
                    <Card.Header>
                      <HStack gap={2}>
                        <ChartBarIcon className="w-5 h-5 text-blue-500" />
                        <Text fontWeight="semibold" color="blue.600">Strategic Initiatives</Text>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <VStack align="stretch" gap={3}>
                        {performance.recommendations.strategic_initiatives.map((initiative, index) => (
                          <HStack key={index} gap={3} align="start">
                            <Badge colorPalette="blue" size="sm">{index + 1}</Badge>
                            <Text fontSize="sm">{initiative}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root borderTop="4px solid" borderTopColor="green.400">
                    <Card.Header>
                      <HStack gap={2}>
                        <TrophyIcon className="w-5 h-5 text-green-500" />
                        <Text fontWeight="semibold" color="green.600">Long-term Goals</Text>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <VStack align="stretch" gap={3}>
                        {performance.recommendations.long_term_goals.map((goal, index) => (
                          <HStack key={index} gap={3} align="start">
                            <Badge colorPalette="green" size="sm">{index + 1}</Badge>
                            <Text fontSize="sm">{goal}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </Grid>

                <Alert.Root status="info">
                  <Alert.Indicator>
                    <LightBulbIcon className="w-5 h-5" />
                  </Alert.Indicator>
                  <Alert.Description>
                    <Text fontWeight="bold">Pro Tip:</Text> Focus on immediate actions first for quick wins, 
                    then implement strategic initiatives for sustainable growth.
                  </Alert.Description>
                </Alert.Root>
              </VStack>
            </Tabs.Content>
          </Tabs.Root>
        ) : null}

        {/* Status */}
        <Card.Root bg="bg.canvas">
          <Card.Body p={3}>
            <HStack justify="center" gap={4}>
              <HStack gap={2}>
                <Box width="8px" height="8px"  borderRadius="50%" />
                <Text fontSize="sm" color="gray.600">
                  Performance analysis last updated: {new Date().toLocaleString()}
                </Text>
              </HStack>
              <Badge colorPalette="green" size="sm">Analysis Engine Active</Badge>
            </HStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};