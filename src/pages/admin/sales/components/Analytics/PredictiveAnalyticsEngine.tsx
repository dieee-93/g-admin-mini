import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  CardWrapper ,
  Text,
  Badge,
  Button,
  Grid,
  Progress,
  Alert,
  SimpleGrid,
  Table,
  Select,
  CircularProgress,
  Skeleton
} from '@chakra-ui/react';
import {
  BoltIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface PredictiveMetrics {
  revenue_forecast: {
    next_7_days: number;
    next_30_days: number;
    next_quarter: number;
    confidence: number;
  };
  demand_forecasting: {
    top_items: Array<{
      item_name: string;
      predicted_demand: number;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  customer_insights: {
    churn_prediction: {
      at_risk_customers: number;
      churn_rate: number;
      prevention_opportunities: number;
    };
    lifetime_value: {
      average_clv: number;
      high_value_segments: number;
      growth_potential: number;
    };
  };
  operational_intelligence: {
    peak_times: Array<{
      day: string;
      hour: number;
      predicted_volume: number;
      recommended_staffing: number;
    }>;
    inventory_alerts: Array<{
      item: string;
      current_stock: number;
      predicted_demand: number;
      reorder_date: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
  };
  market_trends: {
    seasonal_patterns: {
      current_season: string;
      expected_change: number;
      recommendations: string[];
    };
    competitive_analysis: {
      market_position: string;
      price_optimization: number;
      competitive_advantages: string[];
    };
  };
}

export const PredictiveAnalyticsEngine: React.FC = () => {
  const [analytics, setAnalytics] = useState<PredictiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  const generatePredictiveAnalytics = (): PredictiveMetrics => {
    return {
      revenue_forecast: {
        next_7_days: 24750.50,
        next_30_days: 102480.25,
        next_quarter: 315600.75,
        confidence: 87.3
      },
      demand_forecasting: {
        top_items: [
          { item_name: 'Pasta Carbonara', predicted_demand: 156, confidence: 92, trend: 'up' },
          { item_name: 'Margherita Pizza', predicted_demand: 134, confidence: 89, trend: 'stable' },
          { item_name: 'Caesar Salad', predicted_demand: 98, confidence: 85, trend: 'up' },
          { item_name: 'Grilled Salmon', predicted_demand: 87, confidence: 78, trend: 'down' },
          { item_name: 'Tiramisu', predicted_demand: 76, confidence: 94, trend: 'up' }
        ]
      },
      customer_insights: {
        churn_prediction: {
          at_risk_customers: 23,
          churn_rate: 8.7,
          prevention_opportunities: 18
        },
        lifetime_value: {
          average_clv: 687.45,
          high_value_segments: 3,
          growth_potential: 23.5
        }
      },
      operational_intelligence: {
        peak_times: [
          { day: 'Friday', hour: 19, predicted_volume: 89, recommended_staffing: 8 },
          { day: 'Saturday', hour: 20, predicted_volume: 95, recommended_staffing: 9 },
          { day: 'Sunday', hour: 13, predicted_volume: 76, recommended_staffing: 6 }
        ],
        inventory_alerts: [
          { item: 'Premium Olive Oil', current_stock: 12, predicted_demand: 45, reorder_date: '2024-08-10', urgency: 'high' },
          { item: 'Fresh Basil', current_stock: 8, predicted_demand: 28, reorder_date: '2024-08-12', urgency: 'medium' },
          { item: 'Parmesan Cheese', current_stock: 25, predicted_demand: 67, reorder_date: '2024-08-15', urgency: 'low' }
        ]
      },
      market_trends: {
        seasonal_patterns: {
          current_season: 'Summer',
          expected_change: 15.8,
          recommendations: [
            'Increase cold beverage inventory',
            'Promote outdoor seating options',
            'Add seasonal fruit-based desserts'
          ]
        },
        competitive_analysis: {
          market_position: 'Strong',
          price_optimization: 12.5,
          competitive_advantages: [
            'Superior ingredient quality',
            'Faster service times',
            'Strong customer loyalty'
          ]
        }
      }
    };
  };

  const loadPredictiveAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const predictiveData = generatePredictiveAnalytics();
      setAnalytics(predictiveData);
    } catch (err) {
      console.error('Error loading predictive analytics:', err);
      setError('Failed to load predictive analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictiveAnalytics();
  }, [selectedTimeframe]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'green';
    if (confidence >= 80) return 'yellow';
    if (confidence >= 70) return 'orange';
    return 'red';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator>
          <ExclamationTriangleIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Description>{error}</Alert.Description>
        <Button onClick={loadPredictiveAnalytics} variant="outline" size="sm" ml={4}>
          Retry
        </Button>
      </Alert.Root>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <CardWrapper .Root bg="gradient-to-r from-indigo-600 to-purple-700" color="white">
          <CardWrapper .Body p={6}>
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <BoltIcon className="w-8 h-8" />
                  <VStack align="start" gap={0}>
                    <Text fontSize="2xl" fontWeight="bold">Predictive Analytics Engine</Text>
                    <Text opacity={0.9}>AI-powered forecasting and business intelligence</Text>
                  </VStack>
                </HStack>
                <HStack gap={2}>
                  <Select.Root value={selectedTimeframe} onValueChange={(e) => setSelectedTimeframe(e.value as any)}>
                    <Select.Trigger width="120px" bg="whiteAlpha.200">
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="week">Week</Select.Item>
                      <Select.Item value="month">Month</Select.Item>
                      <Select.Item value="quarter">Quarter</Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <Button 
                    variant="outline" 
                    color="white" 
                    borderColor="whiteAlpha.300"
                    onClick={loadPredictiveAnalytics}
                    loading={loading}
                    size="sm"
                  >
                    Refresh
                  </Button>
                </HStack>
              </HStack>

              {analytics && (
                <HStack justify="center" gap={8}>
                  <VStack gap={1}>
                    <Text fontSize="3xl" fontWeight="bold">
                      ${analytics.revenue_forecast[`next_${selectedTimeframe === 'week' ? '7_days' : selectedTimeframe === 'month' ? '30_days' : 'quarter'}`].toLocaleString()}
                    </Text>
                    <Text opacity={0.8}>Predicted Revenue</Text>
                  </VStack>
                  <VStack gap={1}>
                    <CircularProgress.Root value={analytics.revenue_forecast.confidence} size="60px">
                      <CircularProgress.Circle stroke="rgba(255,255,255,0.3)" />
                      <CircularProgress.Circle stroke="white" />
                      <CircularProgress.ValueText fontSize="sm" fontWeight="bold">
                        {analytics.revenue_forecast.confidence.toFixed(0)}%
                      </CircularProgress.ValueText>
                    </CircularProgress.Root>
                    <Text opacity={0.8}>Confidence</Text>
                  </VStack>
                </HStack>
              )}
            </VStack>
          </CardWrapper .Body>
        </CardWrapper .Root>

        {loading && !analytics ? (
          <VStack gap={4}>
            <Skeleton height="200px" />
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <Skeleton height="150px" />
              <Skeleton height="150px" />
              <Skeleton height="150px" />
            </Grid>
          </VStack>
        ) : analytics ? (
          <VStack align="stretch" gap={6}>
            {/* Revenue Forecasting */}
            <CardWrapper .Root>
              <CardWrapper .Header>
                <HStack gap={2}>
                  <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                  <Text fontSize="lg" fontWeight="semibold">Revenue Forecasting</Text>
                </HStack>
              </CardWrapper .Header>
              <CardWrapper .Body>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  <VStack align="center" gap={3} p={4}  borderRadius="md">
                    <Text fontSize="sm" color="gray.600">Next 7 Days</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      ${analytics.revenue_forecast.next_7_days.toLocaleString()}
                    </Text>
                    <Badge colorPalette="green">+12.5%</Badge>
                  </VStack>

                  <VStack align="center" gap={3} p={4} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.600">Next 30 Days</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      ${analytics.revenue_forecast.next_30_days.toLocaleString()}
                    </Text>
                    <Badge colorPalette="blue">+18.2%</Badge>
                  </VStack>

                  <VStack align="center" gap={3} p={4} bg="purple.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.600">Next Quarter</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                      ${analytics.revenue_forecast.next_quarter.toLocaleString()}
                    </Text>
                    <Badge colorPalette="purple">+25.7%</Badge>
                  </VStack>
                </SimpleGrid>
              </CardWrapper .Body>
            </CardWrapper .Root>

            {/* Demand Forecasting */}
            <CardWrapper .Root>
              <CardWrapper .Header>
                <HStack gap={2}>
                  <ChartBarIcon className="w-6 h-6 text-blue-500" />
                  <Text fontSize="lg" fontWeight="semibold">Demand Forecasting</Text>
                </HStack>
              </CardWrapper .Header>
              <CardWrapper .Body>
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Item</Table.ColumnHeader>
                      <Table.ColumnHeader>Predicted Demand</Table.ColumnHeader>
                      <Table.ColumnHeader>Confidence</Table.ColumnHeader>
                      <Table.ColumnHeader>Trend</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {analytics.demand_forecasting.top_items.map(item => (
                      <Table.Row key={item.item_name}>
                        <Table.Cell fontWeight="medium">{item.item_name}</Table.Cell>
                        <Table.Cell>{item.predicted_demand} units</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={getConfidenceColor(item.confidence)} size="sm">
                            {item.confidence}%
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{getTrendIcon(item.trend)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </CardWrapper .Body>
            </CardWrapper .Root>

            {/* Customer Intelligence */}
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
              <CardWrapper .Root>
                <CardWrapper .Header>
                  <Text fontSize="lg" fontWeight="semibold">Churn Prediction</Text>
                </CardWrapper .Header>
                <CardWrapper .Body>
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between">
                      <Text>At-Risk Customers</Text>
                      <Badge colorPalette="red" size="lg">
                        {analytics.customer_insights.churn_prediction.at_risk_customers}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Predicted Churn Rate</Text>
                      <Text fontWeight="bold" color="red.500">
                        {analytics.customer_insights.churn_prediction.churn_rate}%
                      </Text>
                    </HStack>

                    <Progress.Root value={analytics.customer_insights.churn_prediction.churn_rate} colorPalette="red" size="sm">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>

                    <Alert.Root status="warning" size="sm">
                      <Alert.Description>
                        <strong>{analytics.customer_insights.churn_prediction.prevention_opportunities}</strong> customers 
                        can be retained with targeted campaigns
                      </Alert.Description>
                    </Alert.Root>
                  </VStack>
                </CardWrapper .Body>
              </CardWrapper .Root>

              <CardWrapper .Root>
                <CardWrapper .Header>
                  <Text fontSize="lg" fontWeight="semibold">Customer Lifetime Value</Text>
                </CardWrapper .Header>
                <CardWrapper .Body>
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between">
                      <Text>Average CLV</Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.600">
                        ${analytics.customer_insights.lifetime_value.average_clv}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>High-Value Segments</Text>
                      <Badge colorPalette="green">
                        {analytics.customer_insights.lifetime_value.high_value_segments}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Growth Potential</Text>
                      <Text fontWeight="bold" color="blue.500">
                        +{analytics.customer_insights.lifetime_value.growth_potential}%
                      </Text>
                    </HStack>

                    <Alert.Root status="success" size="sm">
                      <Alert.Description>
                        CLV optimization could increase revenue by 23.5%
                      </Alert.Description>
                    </Alert.Root>
                  </VStack>
                </CardWrapper .Body>
              </CardWrapper .Root>
            </Grid>

            {/* Operational Intelligence */}
            <CardWrapper .Root>
              <CardWrapper .Header>
                <HStack gap={2}>
                  <ClockIcon className="w-6 h-6 text-orange-500" />
                  <Text fontSize="lg" fontWeight="semibold">Operational Intelligence</Text>
                </HStack>
              </CardWrapper .Header>
              <CardWrapper .Body>
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontWeight="medium" color="orange.600">Peak Times Prediction</Text>
                    {analytics.operational_intelligence.peak_times.map((peak, index) => (
                      <HStack key={index} justify="space-between" p={3} bg="orange.50" borderRadius="md">
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium" fontSize="sm">
                            {peak.day} at {peak.hour.toString().padStart(2, '0')}:00
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {peak.predicted_volume} orders predicted
                          </Text>
                        </VStack>
                        <Badge colorPalette="orange">
                          {peak.recommended_staffing} staff
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>

                  <VStack align="stretch" gap={4}>
                    <Text fontWeight="medium" color="red.600">Inventory Alerts</Text>
                    {analytics.operational_intelligence.inventory_alerts.map((alert, index) => (
                      <HStack key={index} justify="space-between" p={3} bg="red.50" borderRadius="md">
                        <VStack align="start" gap={0}>
                          <Text fontWeight="medium" fontSize="sm">{alert.item}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {alert.current_stock} left, {alert.predicted_demand} needed
                          </Text>
                        </VStack>
                        <Badge colorPalette={getUrgencyColor(alert.urgency)} size="sm">
                          {alert.urgency}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Grid>
              </CardWrapper .Body>
            </CardWrapper .Root>

            {/* Market Intelligence */}
            <CardWrapper .Root>
              <CardWrapper .Header>
                <HStack gap={2}>
                  <FireIcon className="w-6 h-6 text-purple-500" />
                  <Text fontSize="lg" fontWeight="semibold">Market Intelligence</Text>
                </HStack>
              </CardWrapper .Header>
              <CardWrapper .Body>
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                  <VStack align="stretch" gap={4}>
                    <Text fontWeight="medium" color="purple.600">Seasonal Patterns</Text>
                    <HStack justify="space-between">
                      <Text>Current Season</Text>
                      <Badge colorPalette="purple">{analytics.market_trends.seasonal_patterns.current_season}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Expected Change</Text>
                      <Text fontWeight="bold" color="purple.500">
                        +{analytics.market_trends.seasonal_patterns.expected_change}%
                      </Text>
                    </HStack>
                    <VStack align="stretch" gap={2}>
                      {analytics.market_trends.seasonal_patterns.recommendations.map((rec, index) => (
                        <Text key={index} fontSize="sm" color="purple.600">
                          • {rec}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>

                  <VStack align="stretch" gap={4}>
                    <Text fontWeight="medium" color="green.600">Competitive Analysis</Text>
                    <HStack justify="space-between">
                      <Text>Market Position</Text>
                      <Badge colorPalette="green">{analytics.market_trends.competitive_analysis.market_position}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Price Optimization</Text>
                      <Text fontWeight="bold" color="green.500">
                        +{analytics.market_trends.competitive_analysis.price_optimization}%
                      </Text>
                    </HStack>
                    <VStack align="stretch" gap={2}>
                      {analytics.market_trends.competitive_analysis.competitive_advantages.map((advantage, index) => (
                        <Text key={index} fontSize="sm" color="green.600">
                          • {advantage}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Grid>
              </CardWrapper .Body>
            </CardWrapper .Root>

            {/* AI Recommendations */}
            <CardWrapper .Root bg="gradient-to-r from-teal-500 to-cyan-600" color="white">
              <CardWrapper .Body p={6}>
                <VStack align="stretch" gap={4}>
                  <HStack gap={3}>
                    <LightBulbIcon className="w-8 h-8" />
                    <Text fontSize="xl" fontWeight="bold">AI-Powered Recommendations</Text>
                  </HStack>

                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    <VStack align="start" gap={3} p={4} bg="whiteAlpha.200" borderRadius="md">
                      <Text fontWeight="bold">🚀 Revenue Growth</Text>
                      <Text fontSize="sm">Implement dynamic pricing during peak hours</Text>
                      <Text fontSize="sm">Focus on high-margin items promotion</Text>
                      <Text fontSize="sm">Expand delivery options to capture 15% more market</Text>
                    </VStack>

                    <VStack align="start" gap={3} p={4} bg="whiteAlpha.200" borderRadius="md">
                      <Text fontWeight="bold">⚡ Operational Efficiency</Text>
                      <Text fontSize="sm">Optimize staff scheduling for peak times</Text>
                      <Text fontSize="sm">Implement predictive inventory management</Text>
                      <Text fontSize="sm">Reduce fulfillment time by 2 minutes</Text>
                    </VStack>

                    <VStack align="start" gap={3} p={4} bg="whiteAlpha.200" borderRadius="md">
                      <Text fontWeight="bold">👥 Customer Experience</Text>
                      <Text fontSize="sm">Launch targeted retention campaigns</Text>
                      <Text fontSize="sm">Personalize menu recommendations</Text>
                      <Text fontSize="sm">Implement loyalty program for high-value customers</Text>
                    </VStack>
                  </Grid>
                </VStack>
              </CardWrapper .Body>
            </CardWrapper .Root>
          </VStack>
        ) : null}

        {/* Status */}
        <CardWrapper .Root bg="bg.canvas">
          <CardWrapper .Body p={3}>
            <HStack justify="center" gap={4}>
              <HStack gap={2}>
                <Box width="8px" height="8px" bg="indigo.500" borderRadius="50%" />
                <Text fontSize="sm" color="gray.600">
                  Predictive models last updated: {new Date().toLocaleString()}
                </Text>
              </HStack>
              <Badge colorPalette="indigo" size="sm">AI Engine Active</Badge>
            </HStack>
          </CardWrapper .Body>
        </CardWrapper .Root>
      </VStack>
    </Box>
  );
};