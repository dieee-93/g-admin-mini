import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  Button,
  Badge,
  SimpleGrid,
  Progress,
  ProgressTrack,
  ProgressRange,
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
  UsersIcon,
  ArrowPathIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

// Import event system
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

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

interface PerformanceCorrelation {
  metric1: string;
  metric2: string;
  correlationStrength: number; // -1 to 1
  insight: string;
  businessImplication: string;
  confidence: number;
}

interface ExecutiveSummary {
  period: string;
  overallPerformance: 'excellent' | 'good' | 'fair' | 'poor';
  keyHighlights: string[];
  keyConcerns: string[];
  strategicRecommendations: string[];
  financialHealth: FinancialHealth;
  operationalEfficiency: OperationalHealth;
  marketPosition: MarketHealth;
}

interface FinancialHealth {
  score: number; // 0-100
  revenue: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  profitability: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  costs: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  cashFlow: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

interface OperationalHealth {
  score: number; // 0-100
  efficiency: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  quality: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  productivity: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  utilization: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

interface MarketHealth {
  score: number; // 0-100
  customerSatisfaction: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  marketShare: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  competitivePosition: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  brandStrength: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

interface ExecutiveDashboardConfig {
  refreshInterval: number; // minutes
  aiInsightsEnabled: boolean;
  alertThresholds: {
    revenue: number;
    profitability: number;
    customerSatisfaction: number;
    operationalEfficiency: number;
  };
  displayPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  kpiTargets: Record<string, number>;
}

// Mock data generators
const generateMockExecutiveKPIs = (): ExecutiveKPI[] => {
  const baseDate = new Date().toISOString();
  
  return [
    // Financial KPIs
    {
      id: 'revenue',
      name: 'Revenue',
      value: 125000,
      unit: '$',
      change: 15.2,
      changeType: 'increase',
      target: 130000,
      category: 'financial',
      trend: 'up',
      priority: 'critical',
      description: 'Total revenue for the current period',
      lastUpdated: baseDate
    },
    {
      id: 'profit_margin',
      name: 'Profit Margin',
      value: 18.5,
      unit: '%',
      change: 2.3,
      changeType: 'increase',
      target: 20,
      category: 'financial',
      trend: 'up',
      priority: 'critical',
      description: 'Net profit margin percentage',
      lastUpdated: baseDate
    },
    {
      id: 'costs',
      name: 'Operating Costs',
      value: 85000,
      unit: '$',
      change: -5.1,
      changeType: 'decrease',
      target: 80000,
      category: 'financial',
      trend: 'down',
      priority: 'high',
      description: 'Total operating expenses',
      lastUpdated: baseDate
    },
    
    // Operational KPIs
    {
      id: 'efficiency',
      name: 'Operational Efficiency',
      value: 87.3,
      unit: '%',
      change: 4.2,
      changeType: 'increase',
      target: 90,
      category: 'operational',
      trend: 'up',
      priority: 'high',
      description: 'Overall operational efficiency score',
      lastUpdated: baseDate
    },
    {
      id: 'avg_order_time',
      name: 'Average Order Time',
      value: 12.5,
      unit: 'min',
      change: -8.3,
      changeType: 'decrease',
      target: 10,
      category: 'operational',
      trend: 'down',
      priority: 'medium',
      description: 'Average time from order to delivery',
      lastUpdated: baseDate
    },
    {
      id: 'kitchen_utilization',
      name: 'Kitchen Utilization',
      value: 78.9,
      unit: '%',
      change: 3.1,
      changeType: 'increase',
      target: 85,
      category: 'operational',
      trend: 'up',
      priority: 'medium',
      description: 'Kitchen capacity utilization rate',
      lastUpdated: baseDate
    },
    
    // Customer KPIs
    {
      id: 'customer_satisfaction',
      name: 'Customer Satisfaction',
      value: 4.6,
      unit: '/5',
      change: 0.3,
      changeType: 'increase',
      target: 4.8,
      category: 'customer',
      trend: 'up',
      priority: 'critical',
      description: 'Average customer satisfaction rating',
      lastUpdated: baseDate
    },
    {
      id: 'customer_retention',
      name: 'Customer Retention',
      value: 68.4,
      unit: '%',
      change: 5.7,
      changeType: 'increase',
      target: 75,
      category: 'customer',
      trend: 'up',
      priority: 'high',
      description: 'Customer retention rate',
      lastUpdated: baseDate
    },
    {
      id: 'avg_order_value',
      name: 'Average Order Value',
      value: 24.50,
      unit: '$',
      change: 7.8,
      changeType: 'increase',
      target: 28,
      category: 'customer',
      trend: 'up',
      priority: 'medium',
      description: 'Average value per customer order',
      lastUpdated: baseDate
    },
    
    // Strategic KPIs
    {
      id: 'market_share',
      name: 'Local Market Share',
      value: 15.2,
      unit: '%',
      change: 1.8,
      changeType: 'increase',
      target: 20,
      category: 'strategic',
      trend: 'up',
      priority: 'high',
      description: 'Estimated local market share',
      lastUpdated: baseDate
    },
    {
      id: 'innovation_index',
      name: 'Innovation Index',
      value: 7.2,
      unit: '/10',
      change: 0.5,
      changeType: 'increase',
      target: 8,
      category: 'strategic',
      trend: 'up',
      priority: 'medium',
      description: 'Innovation and adaptation score',
      lastUpdated: baseDate
    },
    {
      id: 'sustainability_score',
      name: 'Sustainability Score',
      value: 73,
      unit: '/100',
      change: 8.2,
      changeType: 'increase',
      target: 80,
      category: 'strategic',
      trend: 'up',
      priority: 'medium',
      description: 'Environmental and social responsibility score',
      lastUpdated: baseDate
    }
  ];
};

const generateMockStrategicInsights = (): StrategicInsight[] => {
  return [
    {
      id: 'insight_1',
      title: 'Revenue Growth Acceleration Opportunity',
      type: 'opportunity',
      priority: 'critical',
      impact: 'very_high',
      confidence: 92,
      description: 'Analysis indicates strong potential for 25% revenue growth through menu optimization and strategic pricing adjustments. Customer data shows willingness to pay premium for quality.',
      metrics: [
        { name: 'Potential Revenue Increase', value: '25%', trend: 'positive' },
        { name: 'Customer Price Sensitivity', value: 'Low', trend: 'positive' },
        { name: 'Menu Optimization Score', value: '8.2/10', trend: 'positive' }
      ],
      actionItems: [
        {
          id: 'action_1',
          description: 'Implement dynamic pricing for high-demand items',
          owner: 'Revenue Manager',
          priority: 'high',
          estimatedImpact: '+15% revenue',
          estimatedEffort: '2 weeks',
          deadline: '2025-09-01',
          status: 'pending'
        },
        {
          id: 'action_2',
          description: 'Launch premium product line',
          owner: 'Product Manager',
          priority: 'medium',
          estimatedImpact: '+10% revenue',
          estimatedEffort: '4 weeks',
          status: 'pending'
        }
      ],
      timeline: '3-6 months',
      category: 'revenue',
      aiGenerated: true
    },
    {
      id: 'insight_2',
      title: 'Cost Optimization Through Supply Chain Intelligence',
      type: 'recommendation',
      priority: 'high',
      impact: 'high',
      confidence: 87,
      description: 'Supply chain analysis reveals 12% cost reduction opportunity through strategic supplier partnerships and inventory optimization.',
      metrics: [
        { name: 'Potential Cost Savings', value: '12%', trend: 'positive' },
        { name: 'Inventory Turnover', value: '6.2x', trend: 'positive' },
        { name: 'Supplier Efficiency', value: '78%', trend: 'neutral' }
      ],
      actionItems: [
        {
          id: 'action_3',
          description: 'Negotiate bulk purchasing agreements with top 3 suppliers',
          owner: 'Procurement Manager',
          priority: 'urgent',
          estimatedImpact: '-8% costs',
          estimatedEffort: '3 weeks',
          status: 'in_progress'
        },
        {
          id: 'action_4',
          description: 'Implement automated inventory reordering system',
          owner: 'Operations Manager',
          priority: 'high',
          estimatedImpact: '-4% costs',
          estimatedEffort: '6 weeks',
          status: 'pending'
        }
      ],
      timeline: '2-4 months',
      category: 'costs',
      aiGenerated: true
    },
    {
      id: 'insight_3',
      title: 'Customer Experience Enhancement Impact',
      type: 'trend',
      priority: 'high',
      impact: 'high',
      confidence: 84,
      description: 'Customer satisfaction trends show strong correlation with order accuracy and wait times. 10% improvement in these metrics could increase retention by 15%.',
      metrics: [
        { name: 'Satisfaction-Retention Correlation', value: '0.89', trend: 'positive' },
        { name: 'Order Accuracy', value: '94.2%', trend: 'positive' },
        { name: 'Average Wait Time', value: '12.5 min', change: '-8.3%', trend: 'positive' }
      ],
      actionItems: [
        {
          id: 'action_5',
          description: 'Deploy real-time order tracking system',
          owner: 'Technology Manager',
          priority: 'high',
          estimatedImpact: '+15% retention',
          estimatedEffort: '4 weeks',
          status: 'pending'
        }
      ],
      timeline: '1-3 months',
      category: 'customer',
      aiGenerated: true
    },
    {
      id: 'insight_4',
      title: 'Competitive Positioning Risk',
      type: 'risk',
      priority: 'medium',
      impact: 'medium',
      confidence: 76,
      description: 'Market analysis shows increased competitive pressure in premium segment. Need to strengthen differentiation to maintain market position.',
      metrics: [
        { name: 'Competitive Pressure Index', value: '7.2/10', trend: 'negative' },
        { name: 'Price Competitiveness', value: '92%', trend: 'neutral' },
        { name: 'Brand Differentiation', value: '6.8/10', trend: 'neutral' }
      ],
      actionItems: [
        {
          id: 'action_6',
          description: 'Develop unique value proposition strategy',
          owner: 'Marketing Manager',
          priority: 'medium',
          estimatedImpact: 'Brand strength +20%',
          estimatedEffort: '8 weeks',
          status: 'pending'
        }
      ],
      timeline: '6-12 months',
      category: 'market',
      aiGenerated: true
    }
  ];
};

const generateMockExecutiveSummary = (): ExecutiveSummary => {
  return {
    period: 'August 2025',
    overallPerformance: 'good',
    keyHighlights: [
      'Revenue increased 15.2% compared to previous period',
      'Customer satisfaction reached 4.6/5, highest in 6 months',
      'Operational efficiency improved by 4.2%',
      'Successfully reduced operating costs by 5.1%'
    ],
    keyConcerns: [
      'Average order time still above target (12.5 min vs 10 min target)',
      'Market share growth slowing down',
      'Kitchen utilization below optimal levels'
    ],
    strategicRecommendations: [
      'Accelerate digital transformation initiatives',
      'Invest in staff training for efficiency improvements',
      'Expand premium product offerings',
      'Strengthen supplier relationships for cost optimization'
    ],
    financialHealth: {
      score: 87,
      revenue: { value: 125000, change: 15.2, trend: 'up' },
      profitability: { value: 18.5, change: 2.3, trend: 'up' },
      costs: { value: 85000, change: -5.1, trend: 'down' },
      cashFlow: { value: 23000, change: 12.8, trend: 'up' }
    },
    operationalEfficiency: {
      score: 82,
      efficiency: { value: 87.3, change: 4.2, trend: 'up' },
      quality: { value: 94.2, change: 1.8, trend: 'up' },
      productivity: { value: 89.1, change: 3.5, trend: 'up' },
      utilization: { value: 78.9, change: 3.1, trend: 'up' }
    },
    marketPosition: {
      score: 78,
      customerSatisfaction: { value: 4.6, change: 6.5, trend: 'up' },
      marketShare: { value: 15.2, change: 1.8, trend: 'up' },
      competitivePosition: { value: 7.2, change: 0.5, trend: 'up' },
      brandStrength: { value: 73, change: 8.2, trend: 'up' }
    }
  };
};

// Collections
const PERIOD_COLLECTION = createListCollection({
  items: [
    { label: 'Última semana', value: 'weekly' },
    { label: 'Último mes', value: 'monthly' },
    { label: 'Último trimestre', value: 'quarterly' },
    { label: 'Año actual', value: 'yearly' }
  ]
});

const KPI_CATEGORY_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Financiero', value: 'financial' },
    { label: 'Operacional', value: 'operational' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Estratégico', value: 'strategic' }
  ]
});

// Component
export function ExecutiveDashboard() {
  // State
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'insights' | 'correlations' | 'actions'>('overview');
  const [config, setConfig] = useState<ExecutiveDashboardConfig>({
    refreshInterval: 30,
    aiInsightsEnabled: true,
    alertThresholds: {
      revenue: -5,
      profitability: -3,
      customerSatisfaction: -0.2,
      operationalEfficiency: -5
    },
    displayPeriod: 'monthly',
    kpiTargets: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data
  useEffect(() => {
    const loadExecutiveData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockKPIs = generateMockExecutiveKPIs();
        const mockInsights = generateMockStrategicInsights();
        const mockSummary = generateMockExecutiveSummary();
        
        setKpis(mockKPIs);
        setInsights(mockInsights);
        setSummary(mockSummary);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error loading executive dashboard data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadExecutiveData();
  }, [selectedPeriod]);

  // Auto refresh
  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, config.refreshInterval * 60000);
      
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval]);

  // Filtered KPIs
  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return kpis;
    return kpis.filter(kpi => kpi.category === selectedCategory);
  }, [kpis, selectedCategory]);

  // Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (kpis.length === 0) return null;
    
    const criticalKPIs = kpis.filter(kpi => kpi.priority === 'critical').length;
    const improvingKPIs = kpis.filter(kpi => kpi.changeType === 'increase').length;
    const decliningKPIs = kpis.filter(kpi => kpi.changeType === 'decrease').length;
    const targetsMet = kpis.filter(kpi => kpi.target && kpi.value >= kpi.target).length;
    const kpisWithTargets = kpis.filter(kpi => kpi.target).length;
    
    return {
      criticalKPIs,
      improvingKPIs,
      decliningKPIs,
      targetsMet,
      targetAchievementRate: kpisWithTargets > 0 ? (targetsMet / kpisWithTargets) * 100 : 0
    };
  }, [kpis]);

  // Refresh dashboard
  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update KPIs with small variations
      const updatedKPIs = kpis.map(kpi => ({
        ...kpi,
        value: kpi.value * (1 + (Math.random() - 0.5) * 0.02), // ±1% variation
        change: kpi.change + (Math.random() - 0.5) * 0.5,
        lastUpdated: new Date().toISOString()
      }));
      
      setKpis(updatedKPIs);
      
      // Emit refresh event
      await EventBus.emit(RestaurantEvents.DATA_SYNCED, {
        type: 'executive_dashboard_refreshed',
        kpisUpdated: updatedKPIs.length,
        insightsCount: insights.length,
        overallScore: summary?.financialHealth.score || 0,
        period: selectedPeriod
      }, 'ExecutiveDashboard');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error refreshing dashboard: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [kpis, insights.length, summary, selectedPeriod]);

  // Get trend icon and color
  const getTrendDisplay = (trend: string, changeType?: string) => {
    if (trend === 'up' || (changeType === 'increase')) {
      return { icon: ArrowTrendingUpIcon, color: 'green' };
    } else if (trend === 'down' || (changeType === 'decrease')) {
      return { icon: ArrowTrendingDownIcon, color: 'red' };
    }
    return { icon: ChartBarIcon, color: 'blue' };
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  // Get performance color
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      default: return 'red';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="80px" />
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="120px" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <VStack align="start" gap={3}>
          <HStack justify="space-between" w="full">
            <VStack align="start" gap={1}>
              <Text fontSize="3xl" fontWeight="bold">🏆 Executive Dashboard</Text>
              <Text color="gray.600">
                Strategic insights y KPIs ejecutivos para toma de decisiones de alto nivel
              </Text>
            </VStack>
            
            <HStack gap={2}>
              <Select.Root
                collection={PERIOD_COLLECTION}
                value={[selectedPeriod]}
                onValueChange={(details) => setSelectedPeriod(details.value[0])}
                width="150px"
                size="sm"
              >
                <Select.Trigger>
                  <Select.ValueText placeholder="Período" />
                </Select.Trigger>
                <Select.Content>
                  {PERIOD_COLLECTION.items.map(item => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={refreshDashboard}
                loading={isRefreshing}
                loadingText="Actualizando..."
              >
                <ArrowPathIcon className="w-4 h-4" />
              </Button>
              
              <IconButton size="sm" variant="outline">
                <CogIcon className="w-4 h-4" />
              </IconButton>
            </HStack>
          </HStack>

          {/* Performance Summary Banner */}
          {summary && (
            <Card.Root variant="outline" bg={`${getPerformanceColor(summary.overallPerformance)}.50`} w="full">
              <Card.Body p={4}>
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <HStack gap={2}>
                      <Text fontSize="lg" fontWeight="bold" color={`${getPerformanceColor(summary.overallPerformance)}.700`}>
                        Rendimiento General: {summary.overallPerformance === 'excellent' ? 'Excelente' :
                                           summary.overallPerformance === 'good' ? 'Bueno' :
                                           summary.overallPerformance === 'fair' ? 'Regular' : 'Deficiente'}
                      </Text>
                      <Badge colorPalette={getPerformanceColor(summary.overallPerformance)}>
                        {summary.period}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Salud Financiera: {summary.financialHealth.score}/100 • 
                      Eficiencia Operacional: {summary.operationalEfficiency.score}/100 • 
                      Posición de Mercado: {summary.marketPosition.score}/100
                    </Text>
                  </VStack>
                  
                  <SimpleGrid columns={3} gap={4} fontSize="xs">
                    <VStack>
                      <Text color="green.600" fontWeight="bold" fontSize="lg">
                        {summary.financialHealth.score}
                      </Text>
                      <Text color="gray.600">Financiero</Text>
                    </VStack>
                    <VStack>
                      <Text color="blue.600" fontWeight="bold" fontSize="lg">
                        {summary.operationalEfficiency.score}
                      </Text>
                      <Text color="gray.600">Operacional</Text>
                    </VStack>
                    <VStack>
                      <Text color="purple.600" fontWeight="bold" fontSize="lg">
                        {summary.marketPosition.score}
                      </Text>
                      <Text color="gray.600">Mercado</Text>
                    </VStack>
                  </SimpleGrid>
                </HStack>
              </Card.Body>
            </Card.Root>
          )}

          {/* Quick Stats */}
          {dashboardMetrics && (
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
              <Card.Root variant="subtle" bg="blue.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {kpis.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">KPIs Monitoreados</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="green.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {dashboardMetrics.improvingKPIs}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Mejorando</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="red.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="red.600">
                    {dashboardMetrics.criticalKPIs}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Críticos</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="purple.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {Math.round(dashboardMetrics.targetAchievementRate)}%
                  </Text>
                  <Text fontSize="sm" color="gray.600">Objetivos Alcanzados</Text>
                </Card.Body>
              </Card.Root>
            </SimpleGrid>
          )}
        </VStack>

        {/* Main Content Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="overview">
              <HStack gap={2}>
                <ChartBarIcon className="w-4 h-4" />
                <Text>Resumen</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="kpis">
              <HStack gap={2}>
                <DocumentChartBarIcon className="w-4 h-4" />
                <Text>KPIs</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="insights">
              <HStack gap={2}>
                <LightBulbIcon className="w-4 h-4" />
                <Text>Insights Estratégicos</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="correlations">
              <HStack gap={2}>
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <Text>Correlaciones</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="actions">
              <HStack gap={2}>
                <CheckCircleIcon className="w-4 h-4" />
                <Text>Plan de Acción</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            {/* Overview Tab */}
            <Tabs.Content value="overview">
              <VStack gap={6} align="stretch">
                {summary && (
                  <>
                    {/* Key Highlights */}
                    <Card.Root variant="outline">
                      <Card.Header>
                        <Text fontSize="lg" fontWeight="bold">🌟 Logros Destacados</Text>
                      </Card.Header>
                      <Card.Body>
                        <VStack gap={2} align="stretch">
                          {summary.keyHighlights.map((highlight, index) => (
                            <HStack key={index} gap={3}>
                              <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <Text fontSize="sm">{highlight}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    {/* Key Concerns */}
                    {summary.keyConcerns.length > 0 && (
                      <Card.Root variant="outline">
                        <Card.Header>
                          <Text fontSize="lg" fontWeight="bold">⚠️ Áreas de Atención</Text>
                        </Card.Header>
                        <Card.Body>
                          <VStack gap={2} align="stretch">
                            {summary.keyConcerns.map((concern, index) => (
                              <HStack key={index} gap={3}>
                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                <Text fontSize="sm">{concern}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    )}

                    {/* Strategic Recommendations */}
                    <Card.Root variant="outline">
                      <Card.Header>
                        <Text fontSize="lg" fontWeight="bold">🎯 Recomendaciones Estratégicas</Text>
                      </Card.Header>
                      <Card.Body>
                        <VStack gap={2} align="stretch">
                          {summary.strategicRecommendations.map((recommendation, index) => (
                            <HStack key={index} gap={3}>
                              <ArrowUpIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <Text fontSize="sm">{recommendation}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    {/* Health Scores Grid */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                      {/* Financial Health */}
                      <Card.Root variant="outline">
                        <Card.Header pb={2}>
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold">💰 Salud Financiera</Text>
                            <Badge colorPalette={summary.financialHealth.score > 80 ? 'green' : summary.financialHealth.score > 60 ? 'yellow' : 'red'}>
                              {summary.financialHealth.score}/100
                            </Badge>
                          </HStack>
                        </Card.Header>
                        <Card.Body pt={0}>
                          <VStack gap={2} align="stretch">
                            {[
                              { label: 'Ingresos', data: summary.financialHealth.revenue, prefix: '$', suffix: 'K' },
                              { label: 'Rentabilidad', data: summary.financialHealth.profitability, prefix: '', suffix: '%' },
                              { label: 'Costos', data: summary.financialHealth.costs, prefix: '$', suffix: 'K' },
                              { label: 'Flujo de Caja', data: summary.financialHealth.cashFlow, prefix: '$', suffix: 'K' }
                            ].map((item, index) => {
                              const trend = getTrendDisplay(item.data.trend);
                              const TrendIcon = trend.icon;
                              return (
                                <HStack key={index} justify="space-between" fontSize="sm">
                                  <Text color="gray.600">{item.label}:</Text>
                                  <HStack gap={1}>
                                    <Text fontWeight="medium">
                                      {item.prefix}{(item.data.value / (item.suffix === 'K' ? 1000 : 1)).toFixed(item.suffix === '%' ? 1 : 0)}{item.suffix}
                                    </Text>
                                    <TrendIcon className={`w-3 h-3 text-${trend.color}-500`} />
                                    <Text fontSize="xs" color={`${trend.color}.600`}>
                                      {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                    </Text>
                                  </HStack>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </Card.Body>
                      </Card.Root>

                      {/* Operational Health */}
                      <Card.Root variant="outline">
                        <Card.Header pb={2}>
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold">⚙️ Eficiencia Operacional</Text>
                            <Badge colorPalette={summary.operationalEfficiency.score > 80 ? 'green' : summary.operationalEfficiency.score > 60 ? 'yellow' : 'red'}>
                              {summary.operationalEfficiency.score}/100
                            </Badge>
                          </HStack>
                        </Card.Header>
                        <Card.Body pt={0}>
                          <VStack gap={2} align="stretch">
                            {[
                              { label: 'Eficiencia', data: summary.operationalEfficiency.efficiency },
                              { label: 'Calidad', data: summary.operationalEfficiency.quality },
                              { label: 'Productividad', data: summary.operationalEfficiency.productivity },
                              { label: 'Utilización', data: summary.operationalEfficiency.utilization }
                            ].map((item, index) => {
                              const trend = getTrendDisplay(item.data.trend);
                              const TrendIcon = trend.icon;
                              return (
                                <HStack key={index} justify="space-between" fontSize="sm">
                                  <Text color="gray.600">{item.label}:</Text>
                                  <HStack gap={1}>
                                    <Text fontWeight="medium">{item.data.value.toFixed(1)}%</Text>
                                    <TrendIcon className={`w-3 h-3 text-${trend.color}-500`} />
                                    <Text fontSize="xs" color={`${trend.color}.600`}>
                                      {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                    </Text>
                                  </HStack>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </Card.Body>
                      </Card.Root>

                      {/* Market Health */}
                      <Card.Root variant="outline">
                        <Card.Header pb={2}>
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold">🏪 Posición de Mercado</Text>
                            <Badge colorPalette={summary.marketPosition.score > 80 ? 'green' : summary.marketPosition.score > 60 ? 'yellow' : 'red'}>
                              {summary.marketPosition.score}/100
                            </Badge>
                          </HStack>
                        </Card.Header>
                        <Card.Body pt={0}>
                          <VStack gap={2} align="stretch">
                            {[
                              { label: 'Satisfacción Cliente', data: summary.marketPosition.customerSatisfaction, scale: 5 },
                              { label: 'Cuota de Mercado', data: summary.marketPosition.marketShare, scale: 100 },
                              { label: 'Posición Competitiva', data: summary.marketPosition.competitivePosition, scale: 10 },
                              { label: 'Fortaleza de Marca', data: summary.marketPosition.brandStrength, scale: 100 }
                            ].map((item, index) => {
                              const trend = getTrendDisplay(item.data.trend);
                              const TrendIcon = trend.icon;
                              return (
                                <HStack key={index} justify="space-between" fontSize="sm">
                                  <Text color="gray.600">{item.label}:</Text>
                                  <HStack gap={1}>
                                    <Text fontWeight="medium">
                                      {item.data.value.toFixed(1)}{item.scale === 5 ? '/5' : item.scale === 10 ? '/10' : '%'}
                                    </Text>
                                    <TrendIcon className={`w-3 h-3 text-${trend.color}-500`} />
                                    <Text fontSize="xs" color={`${trend.color}.600`}>
                                      {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                    </Text>
                                  </HStack>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    </SimpleGrid>
                  </>
                )}
              </VStack>
            </Tabs.Content>

            {/* KPIs Tab */}
            <Tabs.Content value="kpis">
              <VStack gap={4} align="stretch">
                {/* Filters */}
                <HStack gap={4} flexWrap="wrap">
                  <Select.Root
                    collection={KPI_CATEGORY_COLLECTION}
                    value={[selectedCategory]}
                    onValueChange={(details) => setSelectedCategory(details.value[0])}
                    width="200px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Categoría" />
                    </Select.Trigger>
                    <Select.Content>
                      {KPI_CATEGORY_COLLECTION.items.map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                {/* KPIs Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                  {filteredKPIs.map((kpi) => {
                    const trend = getTrendDisplay(kpi.trend, kpi.changeType);
                    const TrendIcon = trend.icon;
                    const progressValue = kpi.target ? (kpi.value / kpi.target) * 100 : 0;
                    
                    return (
                      <Card.Root 
                        key={kpi.id}
                        variant="outline"
                        bg={kpi.priority === 'critical' ? 'red.25' : 'white'}
                        borderColor={kpi.priority === 'critical' ? 'red.200' : 'gray.200'}
                      >
                        <Card.Body p={4}>
                          <VStack align="stretch" gap={3}>
                            {/* Header */}
                            <HStack justify="space-between">
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="bold">{kpi.name}</Text>
                                <Badge 
                                  colorPalette={getPriorityColor(kpi.priority)} 
                                  size="xs"
                                >
                                  {kpi.priority}
                                </Badge>
                              </VStack>
                              <TrendIcon className={`w-4 h-4 text-${trend.color}-500`} />
                            </HStack>

                            {/* Value */}
                            <HStack justify="space-between" align="end">
                              <VStack align="start" gap={0}>
                                <Text fontSize="2xl" fontWeight="bold" color={trend.color === 'green' ? 'green.600' : trend.color === 'red' ? 'red.600' : 'blue.600'}>
                                  {kpi.unit === '$' ? '$' : ''}{kpi.value.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Actualizado: {new Date(kpi.lastUpdated).toLocaleDateString()}
                                </Text>
                              </VStack>
                              
                              <VStack align="end" gap={0}>
                                <Text 
                                  fontSize="sm" 
                                  fontWeight="medium" 
                                  color={kpi.changeType === 'increase' ? 'green.600' : 'red.600'}
                                >
                                  {kpi.changeType === 'increase' ? '+' : ''}{kpi.change.toFixed(1)}%
                                </Text>
                                <Text fontSize="xs" color="gray.500">vs anterior</Text>
                              </VStack>
                            </HStack>

                            {/* Progress to Target */}
                            {kpi.target && (
                              <VStack align="stretch" gap={1}>
                                <HStack justify="space-between" fontSize="xs">
                                  <Text color="gray.600">Objetivo: {kpi.unit === '$' ? '$' : ''}{kpi.target.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}</Text>
                                  <Text color={progressValue >= 100 ? 'green.600' : progressValue >= 80 ? 'yellow.600' : 'red.600'}>
                                    {progressValue.toFixed(0)}%
                                  </Text>
                                </HStack>
                                <Progress.Root 
                                  value={Math.min(progressValue, 100)} 
                                  colorPalette={progressValue >= 100 ? 'green' : progressValue >= 80 ? 'yellow' : 'red'}
                                  size="sm"
                                >
                                  <ProgressTrack>
                                    <ProgressRange />
                                  </ProgressTrack>
                                </Progress.Root>
                              </VStack>
                            )}

                            {/* Description */}
                            <Text fontSize="xs" color="gray.600" lineHeight={1.3}>
                              {kpi.description}
                            </Text>
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    );
                  })}
                </SimpleGrid>
              </VStack>
            </Tabs.Content>

            {/* Strategic Insights Tab */}
            <Tabs.Content value="insights">
              <VStack gap={4} align="stretch">
                {insights.map((insight) => (
                  <Card.Root key={insight.id} variant="outline">
                    <Card.Header>
                      <HStack justify="space-between">
                        <HStack gap={3}>
                          <Box p={2} bg={`${getPriorityColor(insight.priority)}.100`} borderRadius="md">
                            {insight.type === 'opportunity' && <ArrowTrendingUpIcon className={`w-5 h-5 text-${getPriorityColor(insight.priority)}-600`} />}
                            {insight.type === 'risk' && <ExclamationTriangleIcon className={`w-5 h-5 text-${getPriorityColor(insight.priority)}-600`} />}
                            {insight.type === 'recommendation' && <LightBulbIcon className={`w-5 h-5 text-${getPriorityColor(insight.priority)}-600`} />}
                            {insight.type === 'trend' && <ChartBarIcon className={`w-5 h-5 text-${getPriorityColor(insight.priority)}-600`} />}
                          </Box>
                          <VStack align="start" gap={0}>
                            <Text fontSize="lg" fontWeight="bold">{insight.title}</Text>
                            <HStack gap={2}>
                              <Badge colorPalette={getPriorityColor(insight.priority)} size="sm">
                                {insight.priority}
                              </Badge>
                              <Badge colorPalette="blue" size="sm">
                                {insight.category}
                              </Badge>
                              {insight.aiGenerated && (
                                <Badge colorPalette="purple" size="sm">
                                  🤖 IA
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                        
                        <VStack align="end" gap={0}>
                          <Text fontSize="sm" fontWeight="bold" color="blue.600">
                            {insight.confidence}% confianza
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Impacto: {insight.impact}
                          </Text>
                        </VStack>
                      </HStack>
                    </Card.Header>
                    
                    <Card.Body>
                      <VStack gap={4} align="stretch">
                        <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                          {insight.description}
                        </Text>

                        {/* Metrics */}
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                          {insight.metrics.map((metric, index) => (
                            <Card.Root key={index} variant="subtle" size="sm">
                              <Card.Body p={3} textAlign="center">
                                <Text fontSize="xs" color="gray.600" mb={1}>
                                  {metric.name}
                                </Text>
                                <Text 
                                  fontSize="md" 
                                  fontWeight="bold" 
                                  color={metric.trend === 'positive' ? 'green.600' : metric.trend === 'negative' ? 'red.600' : 'blue.600'}
                                >
                                  {metric.value}
                                </Text>
                                {metric.change && (
                                  <Text 
                                    fontSize="xs" 
                                    color={metric.trend === 'positive' ? 'green.600' : metric.trend === 'negative' ? 'red.600' : 'gray.600'}
                                  >
                                    {metric.change}
                                  </Text>
                                )}
                              </Card.Body>
                            </Card.Root>
                          ))}
                        </SimpleGrid>

                        {/* Action Items */}
                        {insight.actionItems.length > 0 && (
                          <VStack gap={2} align="stretch">
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                              Plan de Acción:
                            </Text>
                            {insight.actionItems.map((action) => (
                              <Card.Root key={action.id} variant="outline" size="sm">
                                <Card.Body p={3}>
                                  <HStack justify="space-between" align="start">
                                    <VStack align="start" gap={1} flex="1">
                                      <Text fontSize="sm" fontWeight="medium">
                                        {action.description}
                                      </Text>
                                      <HStack gap={4} fontSize="xs" color="gray.600">
                                        <Text>👤 {action.owner}</Text>
                                        <Text>💰 {action.estimatedImpact}</Text>
                                        <Text>⏱️ {action.estimatedEffort}</Text>
                                        {action.deadline && <Text>📅 {action.deadline}</Text>}
                                      </HStack>
                                    </VStack>
                                    
                                    <VStack gap={1}>
                                      <Badge 
                                        colorPalette={getPriorityColor(action.priority)} 
                                        size="sm"
                                      >
                                        {action.priority}
                                      </Badge>
                                      <Badge 
                                        colorPalette={action.status === 'completed' ? 'green' : action.status === 'in_progress' ? 'blue' : 'gray'} 
                                        size="sm"
                                      >
                                        {action.status === 'completed' ? 'Completado' : 
                                         action.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                                      </Badge>
                                    </VStack>
                                  </HStack>
                                </Card.Body>
                              </Card.Root>
                            ))}
                          </VStack>
                        )}

                        {/* Timeline */}
                        <HStack justify="space-between" bg="gray.50" p={3} borderRadius="md">
                          <Text fontSize="sm" color="gray.600">
                            <CalendarIcon className="w-4 h-4 inline mr-1" />
                            Timeline esperado: {insight.timeline}
                          </Text>
                          <Button size="sm" variant="outline" colorPalette="blue">
                            Ver Detalles
                          </Button>
                        </HStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </Tabs.Content>

            {/* Correlations Tab */}
            <Tabs.Content value="correlations">
              <Card.Root variant="subtle">
                <Card.Body p={8} textAlign="center">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <Text fontSize="lg" fontWeight="medium" mb={2}>
                    Análisis de Correlaciones
                  </Text>
                  <Text color="gray.600">
                    Matriz de correlaciones entre KPIs y análisis predictivo de impacto cruzado.
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    * Funcionalidad avanzada disponible en versión completa
                  </Text>
                </Card.Body>
              </Card.Root>
            </Tabs.Content>

            {/* Action Plans Tab */}
            <Tabs.Content value="actions">
              <VStack gap={4} align="stretch">
                {insights.flatMap(insight => insight.actionItems).map((action) => (
                  <Card.Root key={action.id} variant="outline">
                    <Card.Body p={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={2} flex="1">
                          <Text fontSize="md" fontWeight="bold">
                            {action.description}
                          </Text>
                          
                          <HStack gap={6} fontSize="sm" color="gray.600">
                            <HStack gap={1}>
                              <UsersIcon className="w-4 h-4" />
                              <Text>{action.owner}</Text>
                            </HStack>
                            <HStack gap={1}>
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <Text>{action.estimatedImpact}</Text>
                            </HStack>
                            <HStack gap={1}>
                              <ClockIcon className="w-4 h-4" />
                              <Text>{action.estimatedEffort}</Text>
                            </HStack>
                            {action.deadline && (
                              <HStack gap={1}>
                                <CalendarIcon className="w-4 h-4" />
                                <Text>{action.deadline}</Text>
                              </HStack>
                            )}
                          </HStack>
                        </VStack>
                        
                        <VStack gap={2} align="end">
                          <Badge 
                            colorPalette={getPriorityColor(action.priority)}
                          >
                            {action.priority}
                          </Badge>
                          <Badge 
                            colorPalette={action.status === 'completed' ? 'green' : action.status === 'in_progress' ? 'blue' : 'gray'}
                          >
                            {action.status === 'completed' ? 'Completado' : 
                             action.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Actualizar Estado
                          </Button>
                        </VStack>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}