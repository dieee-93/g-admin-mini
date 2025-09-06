// DashboardExecutive.tsx - Executive Dashboard with strategic KPIs (migrated from tools)
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  CardWrapper ,
  Button,
  Badge,
  SimpleGrid,
  Progress,
  Alert,
  Skeleton,
  Select,
  createListCollection,
  Tabs,
  Switch,
  IconButton
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentChartBarIcon,
  BellIcon,
  CogIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

// Executive Dashboard Interfaces
interface ExecutiveKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change
  changeType: 'increase' | 'decrease';
  target?: number;
  category: 'financial' | 'operational' | 'customer' | 'strategic';
  trend: 'up' | 'down' | 'stable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  lastUpdated: string;
}

interface StrategicInsight {
  id: string;
  title: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: 'very_high' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  description: string;
  metrics: InsightMetric[];
  actionItems: ActionItem[];
  timeline: string;
  category: 'revenue' | 'costs' | 'efficiency' | 'customer' | 'market' | 'operations';
  aiGenerated: boolean;
}

interface InsightMetric {
  name: string;
  value: string;
  change?: string;
  trend: 'positive' | 'negative' | 'neutral';
}

interface ActionItem {
  id: string;
  description: string;
  owner: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedImpact: string;
  estimatedEffort: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const DashboardExecutive: React.FC = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('current_month');
  const [activeTab, setActiveTab] = useState('kpis');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Mock data for Executive KPIs
  const executiveKPIs: ExecutiveKPI[] = [
    {
      id: 'monthly_revenue',
      name: 'Monthly Revenue',
      value: 47832,
      unit: '$',
      change: 12.5,
      changeType: 'increase',
      target: 50000,
      category: 'financial',
      trend: 'up',
      priority: 'critical',
      description: 'Total revenue for current month',
      lastUpdated: '2025-01-13T10:30:00Z'
    },
    {
      id: 'profit_margin',
      name: 'Profit Margin',
      value: 23.8,
      unit: '%',
      change: 1.2,
      changeType: 'increase',
      target: 25,
      category: 'financial',
      trend: 'up',
      priority: 'high',
      description: 'Overall profitability percentage',
      lastUpdated: '2025-01-13T10:30:00Z'
    },
    {
      id: 'customer_acquisition',
      name: 'Customer Acquisition',
      value: 156,
      unit: 'customers',
      change: 8.3,
      changeType: 'increase',
      target: 200,
      category: 'customer',
      trend: 'up',
      priority: 'high',
      description: 'New customers acquired this month',
      lastUpdated: '2025-01-13T10:30:00Z'
    },
    {
      id: 'operational_efficiency',
      name: 'Operational Efficiency',
      value: 87.2,
      unit: '%',
      change: -2.1,
      changeType: 'decrease',
      target: 90,
      category: 'operational',
      trend: 'down',
      priority: 'medium',
      description: 'Overall operational performance score',
      lastUpdated: '2025-01-13T10:30:00Z'
    }
  ];

  // Mock strategic insights
  const strategicInsights: StrategicInsight[] = [
    {
      id: 'revenue_opportunity',
      title: 'Peak Hour Revenue Optimization',
      type: 'opportunity',
      priority: 'high',
      impact: 'high',
      confidence: 87,
      description: 'Analysis shows 23% revenue increase potential during peak hours (7-9 PM) by optimizing menu offerings and staff allocation.',
      metrics: [
        { name: 'Potential Revenue Increase', value: '+$3,200/month', trend: 'positive' },
        { name: 'Peak Hour Capacity', value: '78%', change: '+12%', trend: 'positive' }
      ],
      actionItems: [
        {
          id: 'menu_optimization',
          description: 'Optimize peak hour menu with high-margin items',
          owner: 'Chef Manager',
          priority: 'high',
          estimatedImpact: '+15% revenue',
          estimatedEffort: '2 weeks',
          deadline: '2025-01-30',
          status: 'pending'
        }
      ],
      timeline: 'Next 30 days',
      category: 'revenue',
      aiGenerated: true
    },
    {
      id: 'cost_efficiency',
      title: 'Inventory Cost Reduction',
      type: 'recommendation',
      priority: 'medium',
      impact: 'medium',
      confidence: 92,
      description: 'ABC analysis reveals opportunities to reduce inventory costs by 12% through supplier negotiation and order optimization.',
      metrics: [
        { name: 'Cost Reduction Potential', value: '-$1,800/month', trend: 'positive' },
        { name: 'Inventory Turnover', value: '12.3x', change: '+0.8x', trend: 'positive' }
      ],
      actionItems: [
        {
          id: 'supplier_negotiation',
          description: 'Renegotiate contracts with top 3 suppliers',
          owner: 'Operations Manager',
          priority: 'medium',
          estimatedImpact: '-8% costs',
          estimatedEffort: '3 weeks',
          status: 'in_progress'
        }
      ],
      timeline: 'Next 60 days',
      category: 'costs',
      aiGenerated: true
    }
  ];

  const timeFrameOptions = createListCollection({
    items: [
      { label: 'Current Month', value: 'current_month' },
      { label: 'Last 3 Months', value: 'last_3_months' },
      { label: 'Current Quarter', value: 'current_quarter' },
      { label: 'Year to Date', value: 'ytd' },
      { label: 'Last 12 Months', value: 'last_12_months' }
    ]
  });

  const loadExecutiveData = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  }, [selectedTimeFrame]);

  useEffect(() => {
    loadExecutiveData();
  }, [loadExecutiveData]);

  const getKPIsByCategory = (category: string) => {
    return executiveKPIs.filter(kpi => kpi.category === category);
  };

  const getKPIIcon = (category: string) => {
    switch (category) {
      case 'financial': return CurrencyDollarIcon;
      case 'operational': return CogIcon;
      case 'customer': return UsersIcon;
      case 'strategic': return ChartBarIcon;
      default: return ChartBarIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <VStack gap="6">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4" w="full">
          {[1, 2, 3, 4].map(i => (
            <CardWrapper .Root key={i}>
              <CardWrapper .Body>
                <Skeleton height="100px" />
              </CardWrapper .Body>
            </CardWrapper .Root>
          ))}
        </SimpleGrid>
      </VStack>
    );
  }

  return (
    <Box>
      <VStack align="start" gap="6">
        {/* Header with Controls */}
        <HStack justify="space-between" w="full">
          <VStack align="start" gap="1">
            <Text fontSize="2xl" fontWeight="bold">Executive Dashboard</Text>
            <Text color="gray.600">Strategic KPIs and business intelligence</Text>
          </VStack>
          
          <HStack gap="4">
            <Select.Root collection={timeFrameOptions} size="sm" width="200px">
              <Select.Trigger>
                <Select.ValueText placeholder="Select timeframe" />
              </Select.Trigger>
              <Select.Content>
                {timeFrameOptions.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            
            <HStack gap="2">
              <Switch.Root 
                checked={autoRefresh} 
                onCheckedChange={(e) => setAutoRefresh(e.checked)}
                size="sm"
              />
              <Text fontSize="sm">Auto-refresh</Text>
            </HStack>
          </HStack>
        </HStack>

        {/* Executive KPIs */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4" w="full">
          {executiveKPIs.map((kpi) => {
            const IconComponent = getKPIIcon(kpi.category);
            const TrendIconComponent = kpi.trend === 'up' ? ArrowTrendingUpIcon : 
                                      kpi.trend === 'down' ? ArrowTrendingDownIcon : null;
            
            return (
              <CardWrapper .Root key={kpi.id}>
                <CardWrapper .Body>
                  <VStack align="start" gap="3">
                    <HStack justify="space-between" w="full">
                      <IconComponent className="w-6 h-6 text-blue-500" />
                      <Badge 
                        colorPalette={getPriorityColor(kpi.priority)}
                        variant="subtle"
                        size="sm"
                      >
                        {kpi.priority}
                      </Badge>
                    </HStack>
                    
                    <VStack align="start" gap="1" w="full">
                      <Text fontSize="sm" color="gray.600">{kpi.name}</Text>
                      <HStack gap="2">
                        <Text fontSize="2xl" fontWeight="bold">
                          {kpi.unit === '$' ? '$' : ''}{kpi.value.toLocaleString()}
                          {kpi.unit !== '$' ? kpi.unit : ''}
                        </Text>
                        {TrendIconComponent && (
                          <TrendIconComponent className={`w-4 h-4 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                        )}
                      </HStack>
                      
                      <HStack justify="space-between" w="full">
                        <Badge 
                          colorPalette={kpi.changeType === 'increase' ? 'green' : 'red'}
                          variant="subtle"
                          size="sm"
                        >
                          {kpi.changeType === 'increase' ? '+' : ''}{kpi.change}%
                        </Badge>
                        {kpi.target && (
                          <Text fontSize="xs" color="gray.500">
                            Target: {kpi.unit === '$' ? '$' : ''}{kpi.target.toLocaleString()}
                          </Text>
                        )}
                      </HStack>
                      
                      {kpi.target && (
                        <Progress.Root 
                          value={(kpi.value / kpi.target) * 100} 
                          size="sm" 
                          w="full"
                        >
                          <Progress.Track>
                            <Progress.Range bg="blue.500" />
                          </Progress.Track>
                        </Progress.Root>
                      )}
                    </VStack>
                  </VStack>
                </CardWrapper .Body>
              </CardWrapper .Root>
            );
          })}
        </SimpleGrid>

        {/* Strategic Insights */}
        <CardWrapper .Root w="full">
          <CardWrapper .Header>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">Strategic Insights</Text>
              <Badge colorPalette="purple" variant="subtle">AI-Powered</Badge>
            </HStack>
          </CardWrapper .Header>
          <CardWrapper .Body>
            <VStack gap="6">
              {strategicInsights.map((insight) => (
                <CardWrapper .Root key={insight.id} variant="outline" w="full">
                  <CardWrapper .Body>
                    <VStack align="start" gap="4">
                      <HStack justify="space-between" w="full">
                        <VStack align="start" gap="1">
                          <Text fontSize="lg" fontWeight="semibold">{insight.title}</Text>
                          <HStack gap="2">
                            <Badge 
                              colorPalette={insight.type === 'opportunity' ? 'green' : 
                                           insight.type === 'risk' ? 'red' : 'blue'}
                              variant="subtle"
                            >
                              {insight.type}
                            </Badge>
                            <Badge colorPalette="gray" variant="outline" size="sm">
                              {insight.confidence}% confidence
                            </Badge>
                          </HStack>
                        </VStack>
                        <Badge 
                          colorPalette={getPriorityColor(insight.priority)}
                          variant="solid"
                        >
                          {insight.priority} priority
                        </Badge>
                      </HStack>
                      
                      <Text color="gray.700">{insight.description}</Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" w="full">
                        <VStack align="start" gap="2">
                          <Text fontSize="sm" fontWeight="medium">Key Metrics</Text>
                          {insight.metrics.map((metric, index) => (
                            <HStack key={index} justify="space-between" w="full">
                              <Text fontSize="sm" color="gray.600">{metric.name}</Text>
                              <HStack gap="1">
                                <Text fontSize="sm" fontWeight="medium">{metric.value}</Text>
                                {metric.change && (
                                  <Text 
                                    fontSize="xs" 
                                    color={metric.trend === 'positive' ? 'green.600' : 'red.600'}
                                  >
                                    ({metric.change})
                                  </Text>
                                )}
                              </HStack>
                            </HStack>
                          ))}
                        </VStack>
                        
                        <VStack align="start" gap="2">
                          <Text fontSize="sm" fontWeight="medium">Action Items</Text>
                          {insight.actionItems.slice(0, 2).map((action) => (
                            <Box key={action.id} w="full">
                              <HStack justify="space-between" mb="1">
                                <Text fontSize="sm">{action.description}</Text>
                                <Badge 
                                  colorPalette={action.status === 'completed' ? 'green' : 
                                               action.status === 'in_progress' ? 'blue' : 'gray'}
                                  variant="subtle"
                                  size="sm"
                                >
                                  {action.status.replace('_', ' ')}
                                </Badge>
                              </HStack>
                              <Text fontSize="xs" color="gray.500">
                                Owner: {action.owner} | Impact: {action.estimatedImpact}
                              </Text>
                            </Box>
                          ))}
                        </VStack>
                      </SimpleGrid>
                    </VStack>
                  </CardWrapper .Body>
                </CardWrapper .Root>
              ))}
            </VStack>
          </CardWrapper .Body>
        </CardWrapper .Root>
      </VStack>
    </Box>
  );
};

export default DashboardExecutive;