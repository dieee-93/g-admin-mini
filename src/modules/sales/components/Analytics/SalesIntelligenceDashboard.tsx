// src/features/sales/components/Analytics/SalesIntelligenceDashboard.tsx
// 🚀 SALES INTELLIGENCE - Advanced Analytics Dashboard
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Grid,
  Progress,
  Alert,
  Select,
  createListCollection,
  Stat
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import {
  SalesAnalytics,
  RealTimeMetrics,
  MenuItemStats,
  PeakHour,
  BusinessAlert
} from '../../types';

interface SalesIntelligenceDashboardProps {
  analytics: SalesAnalytics;
  onDateRangeChange: (dateFrom: string, dateTo: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  realTimeUpdates?: boolean;
}

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  target?: number;
  format?: 'currency' | 'percentage' | 'number' | 'time';
  icon?: any;
  color?: string;
}

export function SalesIntelligenceDashboard({
  analytics,
  onDateRangeChange,
  onRefresh,
  isLoading = false,
  realTimeUpdates = true
}: SalesIntelligenceDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('today');
  const [selectedMetricCategory, setSelectedMetricCategory] = useState<string>('financial');

  // Time range options
  const timeRangeCollection = createListCollection({
    items: [
      { value: 'today', label: 'Today' },
      { value: 'yesterday', label: 'Yesterday' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'quarter', label: 'This Quarter' },
      { value: 'custom', label: 'Custom Range' }
    ]
  });

  // Metric categories
  const categoryCollection = createListCollection({
    items: [
      { value: 'financial', label: 'Financial Performance' },
      { value: 'operational', label: 'Operational Excellence' },
      { value: 'customer', label: 'Customer Intelligence' },
      { value: 'menu', label: 'Menu Performance' }
    ]
  });

  // Format metric values
  const formatMetricValue = (value: number, format: string = 'number'): string => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        if (value < 60) return `${Math.round(value)}m`;
        const hours = Math.floor(value / 60);
        const minutes = Math.round(value % 60);
        return `${hours}h ${minutes}m`;
      default:
        return value.toLocaleString();
    }
  };

  // Get metric cards based on category
  const getMetricCards = (category: string): MetricCard[] => {
    switch (category) {
      case 'financial':
        return [
          {
            title: 'Daily Revenue',
            value: analytics?.daily_revenue || 0,
            format: 'currency',
            icon: CurrencyDollarIcon,
            color: 'green',
            change: 15.2 // This would come from your analytics
          },
          {
            title: 'Average Order Value',
            value: analytics?.average_order_value || 0,
            format: 'currency',
            icon: ChartBarIcon,
            color: 'blue',
            target: 45 // Target AOV
          },
          {
            title: 'Gross Profit Margin',
            value: analytics?.gross_profit_margin || 0,
            format: 'percentage',
            icon: ArrowTrendingUpIcon,
            color: 'purple',
            target: 70
          },
          {
            title: 'Food Cost %',
            value: analytics?.food_cost_percentage || 0,
            format: 'percentage',
            icon: ChartBarIcon,
            color: (analytics?.food_cost_percentage || 0) > 30 ? 'red' : 'green',
            target: 30
          }
        ];

      case 'operational':
        return [
          {
            title: 'Table Utilization',
            value: analytics?.table_utilization || 0,
            format: 'percentage',
            icon: UsersIcon,
            color: 'orange'
          },
          {
            title: 'Average Service Time',
            value: analytics?.average_service_time || 0,
            format: 'time',
            icon: ClockIcon,
            color: (analytics?.average_service_time || 0) > 45 ? 'red' : 'green',
            target: 30
          },
          {
            title: 'Table Turnover Rate',
            value: analytics?.table_turnover_rate || 0,
            format: 'number',
            icon: ArrowTrendingUpIcon,
            color: 'blue'
          },
          {
            title: 'Average Covers',
            value: analytics?.average_covers || 0,
            format: 'number',
            icon: UsersIcon,
            color: 'cyan'
          }
        ];

      case 'customer':
        return [
          {
            title: 'Customer Acquisition Cost',
            value: analytics?.customer_acquisition_cost || 0,
            format: 'currency',
            icon: UsersIcon,
            color: 'purple'
          },
          {
            title: 'Repeat Customer Rate',
            value: analytics?.repeat_customer_rate || 0,
            format: 'percentage',
            icon: ArrowTrendingUpIcon,
            color: 'green',
            target: 60
          },
          {
            title: 'Customer Lifetime Value',
            value: analytics?.customer_lifetime_value || 0,
            format: 'currency',
            icon: CurrencyDollarIcon,
            color: 'gold'
          },
          {
            title: 'Sales per Labor Hour',
            value: analytics?.sales_per_labor_hour || 0,
            format: 'currency',
            icon: ClockIcon,
            color: 'blue'
          }
        ];

      default:
        return [];
    }
  };

  // Current metric cards
  const currentMetrics = useMemo(() => 
    getMetricCards(selectedMetricCategory), 
    [selectedMetricCategory, analytics]
  );

  // Get trend icon and color
  const getTrendInfo = (change?: number) => {
    if (!change) return { icon: null, color: 'gray' };
    if (change > 0) return { icon: ArrowTrendingUpIcon, color: 'green' };
    if (change < 0) return { icon: ArrowTrendingDownIcon, color: 'red' };
    return { icon: null, color: 'gray' };
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    
    const now = new Date();
    let dateFrom: string, dateTo: string;

    switch (range) {
      case 'today':
        dateFrom = dateTo = now.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        dateFrom = dateTo = yesterday.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateFrom = weekStart.toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        break;
      case 'month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    onDateRangeChange(dateFrom, dateTo);
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Header & Controls */}
      <Card.Root p="4">
        <HStack justify="space-between" align="center" wrap="wrap" gap="4">
          <VStack align="start" gap="1">
            <HStack gap="2">
              <Text fontSize="xl" fontWeight="bold">Sales Intelligence</Text>
              {realTimeUpdates && (
                <Badge colorPalette="green" size="sm">Live</Badge>
              )}
            </HStack>
            <Text color="gray.600" fontSize="sm">
              Advanced analytics and business insights
            </Text>
          </VStack>

          <HStack gap="3" wrap="wrap">
            <Select.Root
              collection={timeRangeCollection}
              value={[selectedTimeRange]}
              onValueChange={(details) => handleTimeRangeChange(details.value[0])}
              size="sm"
              width="150px"
            >
              <Select.Trigger>
                <CalendarDaysIcon className="w-4 h-4" />
                <Select.ValueText placeholder="Time Range" />
              </Select.Trigger>
              <Select.Content>
                {timeRangeCollection.items.map((range) => (
                  <Select.Item key={range.value} item={range}>
                    {range.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Select.Root
              collection={categoryCollection}
              value={[selectedMetricCategory]}
              onValueChange={(details) => setSelectedMetricCategory(details.value[0])}
              size="sm"
              width="200px"
            >
              <Select.Trigger>
                <ChartBarIcon className="w-4 h-4" />
                <Select.ValueText placeholder="Metrics" />
              </Select.Trigger>
              <Select.Content>
                {categoryCollection.items.map((category) => (
                  <Select.Item key={category.value} item={category}>
                    {category.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              loading={isLoading}
              loadingText="Refreshing..."
            >
              Refresh Data
            </Button>
          </HStack>
        </HStack>
      </Card.Root>

      {/* Key Metrics Grid */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="4">
        {currentMetrics.map((metric, index) => {
          const trendInfo = getTrendInfo(metric.change);
          const TrendIcon = trendInfo.icon;
          const MetricIcon = metric.icon;
          const progressValue = metric.target ? (Number(metric.value) / metric.target) * 100 : undefined;
          
          return (
            <Card.Root key={index} p="4">
              <VStack gap="3" align="stretch">
                <HStack justify="space-between" align="center">
                  <MetricIcon className={`w-5 h-5 text-${metric.color}-500`} />
                  {TrendIcon && metric.change && (
                    <HStack gap="1">
                      <TrendIcon className={`w-4 h-4 text-${trendInfo.color}-500`} />
                      <Text fontSize="sm" color={`${trendInfo.color}.600`}>
                        {Math.abs(metric.change)}%
                      </Text>
                    </HStack>
                  )}
                </HStack>
                
                <VStack align="start" gap="1">
                  <Text fontSize="2xl" fontWeight="bold" color={`${metric.color}.600`}>
                    {formatMetricValue(Number(metric.value), metric.format)}
                  </Text>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    {metric.title}
                  </Text>
                </VStack>

                {metric.target && progressValue && (
                  <VStack gap="1" align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.500">Target</Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatMetricValue(metric.target, metric.format)}
                      </Text>
                    </HStack>
                    <Progress 
                      value={Math.min(progressValue, 100)} 
                      size="sm"
                      colorPalette={progressValue >= 100 ? 'green' : progressValue >= 80 ? 'yellow' : 'red'}
                    />
                  </VStack>
                )}
              </VStack>
            </Card.Root>
          );
        })}
      </Grid>

      {/* Real-time Metrics */}
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between" align="center">
            <Text fontWeight="bold">Real-time Performance</Text>
            <Badge colorPalette="blue" size="sm">Live Updates</Badge>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap="4">
            <Stat.Root>
              <Stat.Label>Current Revenue</Stat.Label>
              <Stat.ValueText>
                ${(analytics?.current_day_metrics?.current_revenue || 0).toLocaleString()}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Orders in Progress</Stat.Label>
              <Stat.ValueText>
                {analytics?.current_day_metrics?.orders_in_progress || 0}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Tables Occupied</Stat.Label>
              <Stat.ValueText>
                {analytics?.current_day_metrics?.tables_occupied || 0}
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Avg Wait Time</Stat.Label>
              <Stat.ValueText>
                {Math.round(analytics?.current_day_metrics?.average_wait_time || 0)}m
              </Stat.ValueText>
            </Stat.Root>
            
            <Stat.Root>
              <Stat.Label>Kitchen Backlog</Stat.Label>
              <Stat.ValueText color={(analytics?.current_day_metrics?.kitchen_backlog || 0) > 10 ? 'red.500' : 'green.500'}>
                {analytics?.current_day_metrics?.kitchen_backlog || 0}
              </Stat.ValueText>
            </Stat.Root>
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* Business Alerts & Insights */}
      {(analytics?.alerts_and_insights?.length || 0) > 0 && (
        <Card.Root>
          <Card.Header>
            <HStack gap="2">
              <LightBulbIcon className="w-5 h-5 text-yellow-500" />
              <Text fontWeight="bold">Business Insights & Alerts</Text>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap="3" align="stretch">
              {(analytics?.alerts_and_insights || []).map((alert, index) => (
                <Alert.Root
                  key={index}
                  status={
                    alert.type === 'critical' ? 'error' :
                    alert.type === 'warning' ? 'warning' :
                    'info'
                  }
                >
                  <Alert.Indicator />
                  <VStack align="start" flex="1" gap="1">
                    <Alert.Title>{alert.message}</Alert.Title>
                    {alert.suggested_action && (
                      <Alert.Description>
                        Recommendation: {alert.suggested_action}
                      </Alert.Description>
                    )}
                  </VStack>
                  <Badge 
                    size="sm"
                    colorPalette={
                      alert.impact === 'high' ? 'red' :
                      alert.impact === 'medium' ? 'yellow' :
                      'blue'
                    }
                  >
                    {alert.impact} impact
                  </Badge>
                </Alert.Root>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Menu Performance */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Top Performing Menu Items</Text>
        </Card.Header>
        <Card.Body>
          <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap="4">
            {(analytics?.menu_item_performance || []).slice(0, 6).map((item, index) => (
              <Card.Root key={index} p="3" variant="outline">
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{item.item_name}</Text>
                    <HStack gap="2">
                      <Text fontSize="sm" color="gray.600">
                        {item.units_sold} sold
                      </Text>
                      <Badge 
                        size="sm"
                        colorPalette={
                          item.trend === 'up' ? 'green' :
                          item.trend === 'down' ? 'red' :
                          'gray'
                        }
                      >
                        {item.popularity}
                      </Badge>
                    </HStack>
                  </VStack>
                  
                  <VStack align="end" gap="1">
                    <Text fontWeight="bold" color="green.600">
                      ${item.revenue_contribution.toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {item.profit_margin.toFixed(1)}% margin
                    </Text>
                  </VStack>
                </HStack>
              </Card.Root>
            ))}
          </Grid>
        </Card.Body>
      </Card.Root>

      {/* Peak Hours Analysis */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Peak Hours Analysis</Text>
        </Card.Header>
        <Card.Body>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="3">
            {(analytics?.peak_hours_analysis || []).map((hour, index) => (
              <Card.Root key={index} p="3" variant="outline">
                <VStack gap="2" align="center">
                  <Text fontWeight="bold" fontSize="lg">{hour.time_slot}</Text>
                  <VStack gap="1" align="center">
                    <Text fontSize="sm" color="gray.600">Avg Covers</Text>
                    <Text fontWeight="medium">{hour.average_covers}</Text>
                  </VStack>
                  <VStack gap="1" align="center">
                    <Text fontSize="sm" color="gray.600">Revenue</Text>
                    <Text fontWeight="medium" color="green.600">
                      ${hour.revenue_contribution.toLocaleString()}
                    </Text>
                  </VStack>
                  <Text fontSize="xs" color="blue.600">
                    Staff: {hour.staffing_recommendation}
                  </Text>
                </VStack>
              </Card.Root>
            ))}
          </Grid>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}