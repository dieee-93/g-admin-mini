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
  Skeleton,
  SimpleGrid,
  Tabs,
  Table,
  Select,
  CircularProgress
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  FireIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { calculateCustomerRFM, getCustomerAnalyticsDashboard } from '../../data/advancedCustomerApi';
import type { CustomerRFMProfile, CustomerAnalytics } from '../../types';

export const RFMAnalyticsDashboard: React.FC = () => {
  const [rfmData, setRfmData] = useState<CustomerRFMProfile[]>([]);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rfmProfiles, dashboardData] = await Promise.all([
        calculateCustomerRFM(),
        getCustomerAnalyticsDashboard()
      ]);

      setRfmData(rfmProfiles);
      setAnalytics(dashboardData);
    } catch (err) {
      console.error('Error loading customer analytics:', err);
      setError('Failed to load customer analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const getSegmentColor = (segment: string) => {
    const colors: { [key: string]: string } = {
      'Champions': 'green',
      'Loyal Customers': 'blue', 
      'Potential Loyalists': 'purple',
      'New Customers': 'cyan',
      'Promising': 'teal',
      'Need Attention': 'yellow',
      'About to Sleep': 'orange',
      'At Risk': 'red',
      'Cannot Lose Them': 'pink',
      'Hibernating': 'gray',
      'Lost': 'blackAlpha'
    };
    return colors[segment] || 'gray';
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'green';
      case 'Medium': return 'yellow';
      case 'High': return 'red';
      default: return 'gray';
    }
  };

  const filteredRfmData = selectedSegment === 'all' 
    ? rfmData 
    : rfmData.filter(customer => customer.segment === selectedSegment);

  const segmentOptions = [...new Set(rfmData.map(customer => customer.segment))];

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Icon asChild>
          <ExclamationTriangleIcon className="w-5 h-5" />
        </Alert.Icon>
        <Alert.Description>{error}</Alert.Description>
        <Button onClick={loadAnalytics} variant="outline" size="sm" ml={4}>
          Retry
        </Button>
      </Alert.Root>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Card.Root>
          <Card.Body p={6}>
            <VStack align="stretch" gap={4}>
              <HStack align="center" gap={3}>
                <UsersIcon className="w-8 h-8 text-blue-500" />
                <VStack align="start" gap={0}>
                  <Text fontSize="2xl" fontWeight="bold">RFM Analytics Dashboard</Text>
                  <Text color="gray.600">Customer segmentation based on Recency, Frequency, and Monetary value</Text>
                </VStack>
              </HStack>

              {analytics && (
                <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">{analytics.total_customers}</Text>
                    <Text fontSize="sm" color="gray.600">Total Customers</Text>
                  </VStack>
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">${analytics.average_clv.toFixed(0)}</Text>
                    <Text fontSize="sm" color="gray.600">Average CLV</Text>
                  </VStack>
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">{analytics.customer_retention_rate.toFixed(1)}%</Text>
                    <Text fontSize="sm" color="gray.600">Retention Rate</Text>
                  </VStack>
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold">{analytics.churn_rate.toFixed(1)}%</Text>
                    <Text fontSize="sm" color="gray.600">Churn Rate</Text>
                  </VStack>
                </Grid>
              )}

              <Button 
                variant="outline" 
                onClick={loadAnalytics}
                loading={loading}
              >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh Analytics
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>

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
          <Tabs.Root defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">
                <ChartBarIcon className="w-4 h-4" />
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger value="segments">
                <UsersIcon className="w-4 h-4" />
                Segments
              </Tabs.Trigger>
              <Tabs.Trigger value="customers">
                <TrophyIcon className="w-4 h-4" />
                Customer List
              </Tabs.Trigger>
              <Tabs.Trigger value="insights">
                <FireIcon className="w-4 h-4" />
                Insights
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview">
              <VStack align="stretch" gap={6}>
                {/* KPI Cards */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
                  <Card.Root borderTop="4px solid" borderTopColor="blue.400">
                    <Card.Body p={4}>
                      <VStack gap={2}>
                        <HStack justify="space-between" width="full">
                          <Text fontSize="sm" color="gray.600">New This Month</Text>
                          <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500" />
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {analytics.new_customers_this_month}
                        </Text>
                        <Text fontSize="sm" color="gray.500">customers</Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root borderTop="4px solid" borderTopColor="green.400">
                    <Card.Body p={4}>
                      <VStack gap={2}>
                        <HStack justify="space-between" width="full">
                          <Text fontSize="sm" color="gray.600">Returning</Text>
                          <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                          {analytics.returning_customers}
                        </Text>
                        <Text fontSize="sm" color="gray.500">customers</Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root borderTop="4px solid" borderTopColor="purple.400">
                    <Card.Body p={4}>
                      <VStack gap={2}>
                        <HStack justify="space-between" width="full">
                          <Text fontSize="sm" color="gray.600">Retention</Text>
                          <CircularProgress.Root value={analytics.customer_retention_rate} size="40px">
                            <CircularProgress.Circle stroke="purple.400" />
                            <CircularProgress.ValueText fontSize="xs">
                              {analytics.customer_retention_rate.toFixed(0)}%
                            </CircularProgress.ValueText>
                          </CircularProgress.Root>
                        </HStack>
                        <Text fontSize="xl" fontWeight="bold" color="purple.500">
                          {analytics.customer_retention_rate.toFixed(1)}%
                        </Text>
                        <Text fontSize="sm" color="gray.500">retention rate</Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root borderTop="4px solid" borderTopColor="orange.400">
                    <Card.Body p={4}>
                      <VStack gap={2}>
                        <HStack justify="space-between" width="full">
                          <Text fontSize="sm" color="gray.600">Average CLV</Text>
                          <TrophyIcon className="w-4 h-4 text-orange-500" />
                        </HStack>
                        <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                          ${analytics.average_clv.toFixed(0)}
                        </Text>
                        <Text fontSize="sm" color="gray.500">per customer</Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </SimpleGrid>

                {/* Top Customers */}
                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Top Customers</Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack align="stretch" gap={3}>
                      {analytics.top_customers.map((customer, index) => (
                        <HStack key={customer.customer_id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                          <HStack gap={3}>
                            <Badge colorPalette="blue" size="sm">#{index + 1}</Badge>
                            <VStack align="start" gap={0}>
                              <Text fontWeight="medium">{customer.name}</Text>
                              <Text fontSize="sm" color="gray.500">{customer.segment}</Text>
                            </VStack>
                          </HStack>
                          <VStack align="end" gap={0}>
                            <Text fontWeight="bold">${customer.total_spent.toFixed(2)}</Text>
                            <Text fontSize="sm" color="gray.500">{customer.last_order_days_ago} days ago</Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="segments">
              <VStack align="stretch" gap={6}>
                {/* Segment Distribution */}
                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Customer Segments Distribution</Text>
                  </Card.Header>
                  <Card.Body>
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={4}>
                      {Object.entries(analytics.segment_distribution).map(([segment, count]) => (
                        <Card.Root key={segment} variant="outline" cursor="pointer" 
                          onClick={() => setSelectedSegment(segment)}
                          bg={selectedSegment === segment ? `${getSegmentColor(segment)}.50` : 'white'}
                        >
                          <Card.Body p={3} textAlign="center">
                            <VStack gap={2}>
                              <Text fontSize="2xl" fontWeight="bold">{count}</Text>
                              <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">
                                {segment.replace('_', ' ')}
                              </Text>
                              <Badge colorPalette={getSegmentColor(segment)} size="sm">
                                {((count / analytics.total_customers) * 100).toFixed(1)}%
                              </Badge>
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>

                {/* Revenue by Segment */}
                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Revenue by Segment</Text>
                  </Card.Header>
                  <Card.Body>
                    <VStack align="stretch" gap={3}>
                      {Object.entries(analytics.revenue_by_segment)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .map(([segment, revenue]) => (
                          <HStack key={segment} justify="space-between">
                            <HStack gap={3}>
                              <Badge colorPalette={getSegmentColor(segment)} size="sm">
                                {segment.replace('_', ' ')}
                              </Badge>
                              <Progress.Root 
                                value={(revenue as number / Math.max(...Object.values(analytics.revenue_by_segment))) * 100}
                                width="200px"
                                colorPalette={getSegmentColor(segment)}
                                size="sm"
                              >
                                <Progress.Track>
                                  <Progress.Range />
                                </Progress.Track>
                              </Progress.Root>
                            </HStack>
                            <Text fontWeight="bold">${(revenue as number).toLocaleString()}</Text>
                          </HStack>
                        ))}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="customers">
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">Customer RFM Profiles</Text>
                  <Select.Root value={selectedSegment} onValueChange={(e) => setSelectedSegment(e.value as string)}>
                    <Select.Trigger width="200px">
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="all">All Segments</Select.Item>
                      {segmentOptions.map(segment => (
                        <Select.Item key={segment} value={segment}>
                          {segment}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                <Card.Root>
                  <Card.Body p={0}>
                    <Table.Root size="sm">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Customer</Table.ColumnHeader>
                          <Table.ColumnHeader>RFM Score</Table.ColumnHeader>
                          <Table.ColumnHeader>Segment</Table.ColumnHeader>
                          <Table.ColumnHeader>Total Spent</Table.ColumnHeader>
                          <Table.ColumnHeader>Churn Risk</Table.ColumnHeader>
                          <Table.ColumnHeader>Action</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {filteredRfmData.slice(0, 10).map(customer => (
                          <Table.Row key={customer.customer_id}>
                            <Table.Cell>
                              <VStack align="start" gap={0}>
                                <Text fontWeight="medium" fontSize="sm">{customer.customer_name}</Text>
                                <Text fontSize="xs" color="gray.500">{customer.email}</Text>
                              </VStack>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette="blue" size="sm">{customer.rfm_score}</Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette={getSegmentColor(customer.segment)} size="sm">
                                {customer.segment}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell fontWeight="medium">
                              ${customer.total_spent.toFixed(2)}
                            </Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette={getChurnRiskColor(customer.churn_risk)} size="sm">
                                {customer.churn_risk}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontSize="sm" color="blue.600">
                                {customer.recommended_action}
                              </Text>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="insights">
              <VStack align="stretch" gap={6}>
                <Card.Root bg="gradient-to-r from-blue-500 to-purple-600" color="white">
                  <Card.Body p={6}>
                    <VStack align="center" gap={4}>
                      <FireIcon className="w-12 h-12" />
                      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                        Actionable Customer Insights
                      </Text>
                      <Text textAlign="center" opacity={0.9}>
                        Data-driven recommendations to improve customer relationships and revenue
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                  <Card.Root>
                    <Card.Header>
                      <HStack gap={2}>
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                        <Text fontSize="lg" fontWeight="semibold" color="red.600">High Priority Actions</Text>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <VStack align="stretch" gap={4}>
                        <Alert.Root status="error" size="sm">
                          <Alert.Description>
                            <strong>{analytics.segment_distribution.at_risk}</strong> customers at risk of churning
                          </Alert.Description>
                        </Alert.Root>
                        
                        <Alert.Root status="warning" size="sm">
                          <Alert.Description>
                            <strong>{analytics.segment_distribution.cannot_lose_them}</strong> high-value customers need attention
                          </Alert.Description>
                        </Alert.Root>
                        
                        <Alert.Root status="info" size="sm">
                          <Alert.Description>
                            <strong>{analytics.segment_distribution.hibernating}</strong> customers are hibernating - win them back
                          </Alert.Description>
                        </Alert.Root>
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root>
                    <Card.Header>
                      <HStack gap={2}>
                        <TrophyIcon className="w-5 h-5 text-green-500" />
                        <Text fontSize="lg" fontWeight="semibold" color="green.600">Growth Opportunities</Text>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <VStack align="stretch" gap={4}>
                        <Alert.Root status="success" size="sm">
                          <Alert.Description>
                            <strong>{analytics.segment_distribution.champions}</strong> champions can refer new customers
                          </Alert.Description>
                        </Alert.Root>
                        
                        <Alert.Root status="success" size="sm">
                          <Alert.Description>
                            <strong>{analytics.segment_distribution.potential_loyalists}</strong> potential loyalists ready to upgrade
                          </Alert.Description>
                        </Alert.Root>
                        
                        <Alert.Root status="info" size="sm">
                          <Alert.Description>
                            <strong>{analytics.segment_distribution.new_customers}</strong> new customers need onboarding
                          </Alert.Description>
                        </Alert.Root>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                </SimpleGrid>

                <Card.Root>
                  <Card.Header>
                    <Text fontSize="lg" fontWeight="semibold">Strategic Recommendations</Text>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                      <VStack align="stretch" gap={3}>
                        <Text fontWeight="medium" color="green.600">🚀 Revenue Growth</Text>
                        <Text fontSize="sm">• Focus on Champions and Loyal Customers for upselling</Text>
                        <Text fontSize="sm">• Develop Potential Loyalists with targeted offers</Text>
                        <Text fontSize="sm">• Create referral programs for top segments</Text>
                      </VStack>
                      
                      <VStack align="stretch" gap={3}>
                        <Text fontWeight="medium" color="red.600">🛡️ Churn Prevention</Text>
                        <Text fontSize="sm">• Immediate outreach to "At Risk" customers</Text>
                        <Text fontSize="sm">• Win-back campaigns for "Hibernating" segment</Text>
                        <Text fontSize="sm">• Special attention to "Cannot Lose Them"</Text>
                      </VStack>
                      
                      <VStack align="stretch" gap={3}>
                        <Text fontWeight="medium" color="blue.600">📈 Customer Development</Text>
                        <Text fontSize="sm">• Onboard "New Customers" properly</Text>
                        <Text fontSize="sm">• Move "Promising" to loyal segments</Text>
                        <Text fontSize="sm">• Re-engage "Need Attention" customers</Text>
                      </VStack>
                      
                      <VStack align="stretch" gap={3}>
                        <Text fontWeight="medium" color="purple.600">💡 Marketing Focus</Text>
                        <Text fontSize="sm">• Personalized campaigns by segment</Text>
                        <Text fontSize="sm">• Different messaging for each RFM group</Text>
                        <Text fontSize="sm">• Measure campaign success by segment movement</Text>
                      </VStack>
                    </Grid>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Tabs.Content>
          </Tabs.Root>
        ) : null}
      </VStack>
    </Box>
  );
};