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
import { Icon } from '@/shared/ui';
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

import {
  generateMockExecutiveKPIs,
  generateMockStrategicInsights,
  generateMockExecutiveSummary,
  PERIOD_COLLECTION,
  KPI_CATEGORY_COLLECTION,
} from './ExecutiveDashboard.mock.ts';


// Executive Dashboard Interfaces
export interface ExecutiveKPI {
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

export interface StrategicInsight {
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

export interface InsightMetric {
  name: string;
  value: string;
  change?: string;
  trend: 'positive' | 'negative' | 'neutral';
}

export interface ActionItem {
  id: string;
  description: string;
  owner: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedImpact: string;
  estimatedEffort: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface PerformanceCorrelation {
  metric1: string;
  metric2: string;
  correlationStrength: number; // -1 to 1
  insight: string;
  businessImplication: string;
  confidence: number;
}

export interface ExecutiveSummary {
  period: string;
  overallPerformance: 'excellent' | 'good' | 'fair' | 'poor';
  keyHighlights: string[];
  keyConcerns: string[];
  strategicRecommendations: string[];
  financialHealth: FinancialHealth;
  operationalEfficiency: OperationalHealth;
  marketPosition: MarketHealth;
}

export interface FinancialHealth {
  score: number; // 0-100
  revenue: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  profitability: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  costs: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  cashFlow: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

export interface OperationalHealth {
  score: number; // 0-100
  efficiency: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  quality: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  productivity: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  utilization: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

export interface MarketHealth {
  score: number; // 0-100
  customerSatisfaction: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  marketShare: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  competitivePosition: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  brandStrength: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
}

export interface ExecutiveDashboardConfig {
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
                <Icon icon={ArrowPathIcon} size="sm" />
              </Button>
              
              <IconButton size="sm" variant="outline">
                <Icon icon={CogIcon} size="sm" />
              </IconButton>
            </HStack>
          </HStack>

          {/* Performance Summary Banner */}
          {summary && (
            <CardWrapper .Root variant="outline" bg={`${getPerformanceColor(summary.overallPerformance)}.50`} w="full">
              <CardWrapper .Body p={4}>
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
              </CardWrapper .Body>
            </CardWrapper .Root>
          )}

          {/* Quick Stats */}
          {dashboardMetrics && (
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
              <CardWrapper .Root variant="subtle" bg="blue.50">
                <CardWrapper .Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {kpis.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600">KPIs Monitoreados</Text>
                </CardWrapper .Body>
              </CardWrapper .Root>

              <CardWrapper .Root variant="subtle" >
                <CardWrapper .Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {dashboardMetrics.improvingKPIs}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Mejorando</Text>
                </CardWrapper .Body>
              </CardWrapper .Root>

              <CardWrapper .Root variant="subtle" bg="red.50">
                <CardWrapper .Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="red.600">
                    {dashboardMetrics.criticalKPIs}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Críticos</Text>
                </CardWrapper .Body>
              </CardWrapper .Root>

              <CardWrapper .Root variant="subtle" bg="purple.50">
                <CardWrapper .Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {Math.round(dashboardMetrics.targetAchievementRate)}%
                  </Text>
                  <Text fontSize="sm" color="gray.600">Objetivos Alcanzados</Text>
                </CardWrapper .Body>
              </CardWrapper .Root>
            </SimpleGrid>
          )}
        </VStack>

        {/* Main Content Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="overview">
              <HStack gap={2}>
                <Icon icon={ChartBarIcon} size="sm" />
                <Text>Resumen</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="kpis">
              <HStack gap={2}>
                <Icon icon={DocumentChartBarIcon} size="sm" />
                <Text>KPIs</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="insights">
              <HStack gap={2}>
                <Icon icon={LightBulbIcon} size="sm" />
                <Text>Insights Estratégicos</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="correlations">
              <HStack gap={2}>
                <Icon icon={ArrowTrendingUpIcon} size="sm" />
                <Text>Correlaciones</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="actions">
              <HStack gap={2}>
                <Icon icon={CheckCircleIcon} size="sm" />
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
                    <CardWrapper .Root variant="outline">
                      <CardWrapper .Header>
                        <Text fontSize="lg" fontWeight="bold">🌟 Logros Destacados</Text>
                      </CardWrapper .Header>
                      <CardWrapper .Body>
                        <VStack gap={2} align="stretch">
                          {summary.keyHighlights.map((highlight, index) => (
                            <HStack key={index} gap={3}>
                              <Icon icon={CheckCircleIcon} size="sm" color="green.500" />
                              <Text fontSize="sm">{highlight}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </CardWrapper .Body>
                    </CardWrapper .Root>

                    {/* Key Concerns */}
                    {summary.keyConcerns.length > 0 && (
                      <CardWrapper .Root variant="outline">
                        <CardWrapper .Header>
                          <Text fontSize="lg" fontWeight="bold">⚠️ Áreas de Atención</Text>
                        </CardWrapper .Header>
                        <CardWrapper .Body>
                          <VStack gap={2} align="stretch">
                            {summary.keyConcerns.map((concern, index) => (
                              <HStack key={index} gap={3}>
                                <Icon icon={ExclamationTriangleIcon} size="sm" color="yellow.500" />
                                <Text fontSize="sm">{concern}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </CardWrapper .Body>
                      </CardWrapper .Root>
                    )}

                    {/* Strategic Recommendations */}
                    <CardWrapper .Root variant="outline">
                      <CardWrapper .Header>
                        <Text fontSize="lg" fontWeight="bold">🎯 Recomendaciones Estratégicas</Text>
                      </CardWrapper .Header>
                      <CardWrapper .Body>
                        <VStack gap={2} align="stretch">
                          {summary.strategicRecommendations.map((recommendation, index) => (
                            <HStack key={index} gap={3}>
                              <Icon icon={ArrowUpIcon} size="sm" color="blue.500" />
                              <Text fontSize="sm">{recommendation}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </CardWrapper .Body>
                    </CardWrapper .Root>

                    {/* Health Scores Grid */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                      {/* Financial Health */}
                      <CardWrapper .Root variant="outline">
                        <CardWrapper .Header pb={2}>
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold">💰 Salud Financiera</Text>
                            <Badge colorPalette={summary.financialHealth.score > 80 ? 'green' : summary.financialHealth.score > 60 ? 'yellow' : 'red'}>
                              {summary.financialHealth.score}/100
                            </Badge>
                          </HStack>
                        </CardWrapper .Header>
                        <CardWrapper .Body pt={0}>
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
                                    <Icon icon={TrendIcon} size="xs" color={`${trend.color}.500`} />
                                    <Text fontSize="xs" color={`${trend.color}.600`}>
                                      {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                    </Text>
                                  </HStack>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </CardWrapper .Body>
                      </CardWrapper .Root>

                      {/* Operational Health */}
                      <CardWrapper .Root variant="outline">
                        <CardWrapper .Header pb={2}>
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold">⚙️ Eficiencia Operacional</Text>
                            <Badge colorPalette={summary.operationalEfficiency.score > 80 ? 'green' : summary.operationalEfficiency.score > 60 ? 'yellow' : 'red'}>
                              {summary.operationalEfficiency.score}/100
                            </Badge>
                          </HStack>
                        </CardWrapper .Header>
                        <CardWrapper .Body pt={0}>
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
                                    <Icon icon={TrendIcon} size="xs" color={`${trend.color}.500`} />
                                    <Text fontSize="xs" color={`${trend.color}.600`}>
                                      {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                    </Text>
                                  </HStack>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </CardWrapper .Body>
                      </CardWrapper .Root>

                      {/* Market Health */}
                      <CardWrapper .Root variant="outline">
                        <CardWrapper .Header pb={2}>
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold">🏪 Posición de Mercado</Text>
                            <Badge colorPalette={summary.marketPosition.score > 80 ? 'green' : summary.marketPosition.score > 60 ? 'yellow' : 'red'}>
                              {summary.marketPosition.score}/100
                            </Badge>
                          </HStack>
                        </CardWrapper .Header>
                        <CardWrapper .Body pt={0}>
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
                                    <Icon icon={TrendIcon} size="xs" color={`${trend.color}.500`} />
                                    <Text fontSize="xs" color={`${trend.color}.600`}>
                                      {item.data.change > 0 ? '+' : ''}{item.data.change.toFixed(1)}%
                                    </Text>
                                  </HStack>
                                </HStack>
                              );
                            })}
                          </VStack>
                        </CardWrapper .Body>
                      </CardWrapper .Root>
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
                      <CardWrapper .Root 
                        key={kpi.id}
                        variant="outline"
                        bg={kpi.priority === 'critical' ? 'red.25' : 'white'}
                        borderColor={kpi.priority === 'critical' ? 'red.200' : 'gray.200'}
                      >
                        <CardWrapper .Body p={4}>
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
                              <Icon icon={TrendIcon} size="sm" color={`${trend.color}.500`} />
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
                        </CardWrapper .Body>
                      </CardWrapper .Root>
                    );
                  })}
                </SimpleGrid>
              </VStack>
            </Tabs.Content>

            {/* Strategic Insights Tab */}
            <Tabs.Content value="insights">
              <VStack gap={4} align="stretch">
                {insights.map((insight) => (
                  <CardWrapper .Root key={insight.id} variant="outline">
                    <CardWrapper .Header>
                      <HStack justify="space-between">
                        <HStack gap={3}>
                          <Box p={2} bg={`${getPriorityColor(insight.priority)}.100`} borderRadius="md">
                            {insight.type === 'opportunity' && <Icon icon={ArrowTrendingUpIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
                            {insight.type === 'risk' && <Icon icon={ExclamationTriangleIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
                            {insight.type === 'recommendation' && <Icon icon={LightBulbIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
                            {insight.type === 'trend' && <Icon icon={ChartBarIcon} size="lg" color={`${getPriorityColor(insight.priority)}.600`} />}
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
                    </CardWrapper .Header>
                    
                    <CardWrapper .Body>
                      <VStack gap={4} align="stretch">
                        <Text fontSize="sm" color="gray.700" lineHeight={1.5}>
                          {insight.description}
                        </Text>

                        {/* Metrics */}
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                          {insight.metrics.map((metric, index) => (
                            <CardWrapper .Root key={index} variant="subtle" size="sm">
                              <CardWrapper .Body p={3} textAlign="center">
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
                              </CardWrapper .Body>
                            </CardWrapper .Root>
                          ))}
                        </SimpleGrid>

                        {/* Action Items */}
                        {insight.actionItems.length > 0 && (
                          <VStack gap={2} align="stretch">
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                              Plan de Acción:
                            </Text>
                            {insight.actionItems.map((action) => (
                              <CardWrapper .Root key={action.id} variant="outline" size="sm">
                                <CardWrapper .Body p={3}>
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
                                </CardWrapper .Body>
                              </CardWrapper .Root>
                            ))}
                          </VStack>
                        )}

                        {/* Timeline */}
                        <HStack justify="space-between" bg="bg.canvas" p={3} borderRadius="md">
                          <Text fontSize="sm" color="gray.600">
                            <Icon icon={CalendarIcon} size="sm" style={{ display: 'inline', marginRight: '4px' }} />
                            Timeline esperado: {insight.timeline}
                          </Text>
                          <Button size="sm" variant="outline" colorPalette="blue">
                            Ver Detalles
                          </Button>
                        </HStack>
                      </VStack>
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                ))}
              </VStack>
            </Tabs.Content>

            {/* Correlations Tab */}
            <Tabs.Content value="correlations">
              <CardWrapper .Root variant="subtle">
                <CardWrapper .Body p={8} textAlign="center">
                  <Icon icon={ChartBarIcon} size="3xl" color="gray.400" />
                  <Text fontSize="lg" fontWeight="medium" mb={2}>
                    Análisis de Correlaciones
                  </Text>
                  <Text color="gray.600">
                    Matriz de correlaciones entre KPIs y análisis predictivo de impacto cruzado.
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    * Funcionalidad avanzada disponible en versión completa
                  </Text>
                </CardWrapper .Body>
              </CardWrapper .Root>
            </Tabs.Content>

            {/* Action Plans Tab */}
            <Tabs.Content value="actions">
              <VStack gap={4} align="stretch">
                {insights.flatMap(insight => insight.actionItems).map((action) => (
                  <CardWrapper .Root key={action.id} variant="outline">
                    <CardWrapper .Body p={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={2} flex="1">
                          <Text fontSize="md" fontWeight="bold">
                            {action.description}
                          </Text>
                          
                          <HStack gap={6} fontSize="sm" color="gray.600">
                            <HStack gap={1}>
                              <Icon icon={UsersIcon} size="sm" />
                              <Text>{action.owner}</Text>
                            </HStack>
                            <HStack gap={1}>
                              <Icon icon={CurrencyDollarIcon} size="sm" />
                              <Text>{action.estimatedImpact}</Text>
                            </HStack>
                            <HStack gap={1}>
                              <Icon icon={ClockIcon} size="sm" />
                              <Text>{action.estimatedEffort}</Text>
                            </HStack>
                            {action.deadline && (
                              <HStack gap={1}>
                                <Icon icon={CalendarIcon} size="sm" />
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
                    </CardWrapper .Body>
                  </CardWrapper .Root>
                ))}
              </VStack>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}