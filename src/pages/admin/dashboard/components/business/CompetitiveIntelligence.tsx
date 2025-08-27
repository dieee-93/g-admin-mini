// Competitive Intelligence - Market Analysis & Strategic Positioning
// Advanced market intelligence for competitive advantage and strategic positioning

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Table,
  Progress,
  Alert,
  Tabs,
  Select,
  createListCollection,
  IconButton,
  Spinner,
  Input,
  NumberInput
} from '@chakra-ui/react';
import {
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowPathIcon,
  MapIcon,
  UserGroupIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface CompetitorData {
  id: string;
  name: string;
  type: 'direct' | 'indirect' | 'substitute';
  category: string;
  location: {
    address: string;
    distance: number; // km
    zone: string;
  };
  
  // Business metrics
  businessMetrics: {
    estimatedRevenue: number;
    marketShare: number;
    customerBase: number;
    operatingHours: string;
    deliveryRadius: number;
    averageTicket: number;
  };
  
  // Menu analysis
  menuAnalysis: {
    totalItems: number;
    categories: string[];
    priceRange: {
      min: number;
      max: number;
      average: number;
    };
    uniqueItems: number;
    seasonalItems: number;
  };
  
  // Pricing intelligence
  pricingIntelligence: CompetitivePricing[];
  
  // Performance metrics
  performance: {
    customerRating: number;
    reviewCount: number;
    responseTime: number; // minutes
    deliveryTime: number; // minutes
    popularityTrend: 'up' | 'down' | 'stable';
    marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  };
  
  // Digital presence
  digitalPresence: {
    website: boolean;
    socialMedia: {
      instagram: number; // followers
      facebook: number;
      tiktok: number;
    };
    onlineOrdering: boolean;
    deliveryApps: string[];
    marketingBudget: number;
  };
  
  // Strengths and weaknesses
  analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  
  lastUpdated: string;
  dataQuality: number; // 0-100
}

export interface CompetitivePricing {
  categoryId: string;
  categoryName: string;
  ourPrice: number;
  competitorPrice: number;
  priceDifference: number;
  pricePosition: 'premium' | 'competitive' | 'discount';
  marketAverage: number;
  recommendedAction: 'increase' | 'decrease' | 'maintain' | 'monitor';
  confidence: number; // 0-100
}

export interface MarketTrend {
  id: string;
  category: string;
  trend: 'growing' | 'declining' | 'stable';
  growthRate: number; // percentage
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  description: string;
  impact: 'high' | 'medium' | 'low';
  opportunity: string;
  recommendedActions: string[];
  dataPoints: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  category?: string;
}

export interface PositioningAnalysis {
  currentPosition: {
    x: number; // price axis
    y: number; // quality/service axis
  };
  optimalPosition: {
    x: number;
    y: number;
  };
  positioningQuadrant: 'premium' | 'value' | 'economy' | 'luxury';
  competitiveGap: number;
  marketOpportunity: number;
  recommendations: PositioningRecommendation[];
}

export interface PositioningRecommendation {
  id: string;
  type: 'pricing' | 'quality' | 'service' | 'marketing' | 'differentiation';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: {
    difficulty: 'low' | 'medium' | 'high';
    timeline: string;
    resources: string[];
    cost: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MarketInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend' | 'competitive_move';
  urgency: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  title: string;
  description: string;
  impact: {
    revenue: number;
    marketShare: number;
    customerBase: number;
  };
  confidence: number;
  source: 'competitor_analysis' | 'market_research' | 'customer_feedback' | 'industry_report';
  actionRequired: boolean;
  relatedCompetitors: string[];
  timestamp: string;
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockCompetitors = (): CompetitorData[] => {
  const competitorNames = [
    'Restaurant Elite', 'Gourmet Corner', 'Bistro Premium', 'Cocina Moderna', 
    'Sabores Únicos', 'La Mesa Dorada', 'Fusión Gourmet', 'Casa del Buen Sabor'
  ];
  const types = ['direct', 'indirect', 'substitute'] as const;
  const zones = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'];
  
  return Array.from({ length: 8 }, (_, index) => {
    const revenue = Math.random() * 500000 + 100000;
    const totalItems = Math.floor(Math.random() * 80) + 20;
    
    return {
      id: `comp-${index + 1}`,
      name: competitorNames[index],
      type: types[Math.floor(Math.random() * types.length)],
      category: ['Casual Dining', 'Fine Dining', 'Fast Casual', 'Quick Service'][Math.floor(Math.random() * 4)],
      location: {
        address: `Dirección ${index + 1}, Ciudad`,
        distance: Math.random() * 5 + 0.5,
        zone: zones[Math.floor(Math.random() * zones.length)]
      },
      
      businessMetrics: {
        estimatedRevenue: revenue,
        marketShare: Math.random() * 0.15 + 0.05,
        customerBase: Math.floor(Math.random() * 5000) + 1000,
        operatingHours: '10:00 - 22:00',
        deliveryRadius: Math.floor(Math.random() * 8) + 3,
        averageTicket: Math.random() * 30 + 15
      },
      
      menuAnalysis: {
        totalItems,
        categories: ['Principales', 'Entradas', 'Postres', 'Bebidas'].filter(() => Math.random() > 0.3),
        priceRange: {
          min: Math.random() * 10 + 5,
          max: Math.random() * 40 + 30,
          average: Math.random() * 20 + 15
        },
        uniqueItems: Math.floor(totalItems * 0.2),
        seasonalItems: Math.floor(totalItems * 0.15)
      },
      
      pricingIntelligence: generateMockPricingData(),
      
      performance: {
        customerRating: Math.random() * 1.5 + 3.5,
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        responseTime: Math.floor(Math.random() * 30) + 15,
        deliveryTime: Math.floor(Math.random() * 20) + 25,
        popularityTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        marketPosition: ['leader', 'challenger', 'follower', 'niche'][Math.floor(Math.random() * 4)] as any
      },
      
      digitalPresence: {
        website: Math.random() > 0.3,
        socialMedia: {
          instagram: Math.floor(Math.random() * 50000) + 1000,
          facebook: Math.floor(Math.random() * 20000) + 500,
          tiktok: Math.floor(Math.random() * 30000)
        },
        onlineOrdering: Math.random() > 0.4,
        deliveryApps: ['Uber Eats', 'Rappi', 'PedidosYa'].filter(() => Math.random() > 0.4),
        marketingBudget: Math.random() * 10000 + 2000
      },
      
      analysis: {
        strengths: [
          'Excelente ubicación',
          'Menú diversificado',
          'Precios competitivos',
          'Buena reputación online'
        ].filter(() => Math.random() > 0.5),
        weaknesses: [
          'Limitada presencia digital',
          'Horarios restrictivos',
          'Poca innovación en menú',
          'Servicio lento'
        ].filter(() => Math.random() > 0.6),
        opportunities: [
          'Expansión de delivery',
          'Marketing digital',
          'Nuevas categorías de menú',
          'Alianzas estratégicas'
        ].filter(() => Math.random() > 0.5),
        threats: [
          'Nuevos competidores',
          'Aumento de costos',
          'Cambios en preferencias',
          'Regulaciones'
        ].filter(() => Math.random() > 0.7)
      },
      
      lastUpdated: new Date().toISOString(),
      dataQuality: Math.floor(Math.random() * 30) + 70
    };
  });
};

const generateMockPricingData = (): CompetitivePricing[] => {
  const categories = ['Principales', 'Entradas', 'Postres', 'Bebidas', 'Especiales'];
  
  return categories.map((category, index) => {
    const ourPrice = Math.random() * 25 + 10;
    const competitorPrice = ourPrice * (Math.random() * 0.4 + 0.8);
    const difference = ((ourPrice - competitorPrice) / competitorPrice) * 100;
    
    return {
      categoryId: `cat-${index + 1}`,
      categoryName: category,
      ourPrice,
      competitorPrice,
      priceDifference: difference,
      pricePosition: Math.abs(difference) < 5 ? 'competitive' : difference > 0 ? 'premium' : 'discount',
      marketAverage: (ourPrice + competitorPrice) / 2 + (Math.random() - 0.5) * 5,
      recommendedAction: Math.abs(difference) < 5 ? 'maintain' : 
                       Math.abs(difference) < 15 ? 'monitor' :
                       difference > 0 ? 'decrease' : 'increase',
      confidence: Math.floor(Math.random() * 30) + 70
    } as CompetitivePricing;
  });
};

const generateMockMarketTrends = (): MarketTrend[] => {
  const categories = ['Comida Saludable', 'Delivery', 'Experiencia Premium', 'Sostenibilidad', 'Tecnología'];
  const trends = ['growing', 'declining', 'stable'] as const;
  
  return categories.map((category, index) => {
    const trend = trends[Math.floor(Math.random() * trends.length)];
    const growthRate = trend === 'growing' ? Math.random() * 20 + 5 :
                     trend === 'declining' ? -(Math.random() * 15 + 2) :
                     (Math.random() - 0.5) * 4;
    
    return {
      id: `trend-${index + 1}`,
      category,
      trend,
      growthRate,
      timeframe: ['month', 'quarter', 'year'][Math.floor(Math.random() * 3)] as any,
      description: `Tendencia ${trend === 'growing' ? 'creciente' : trend === 'declining' ? 'decreciente' : 'estable'} en ${category.toLowerCase()}`,
      impact: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
      opportunity: `Oportunidad de ${trend === 'growing' ? 'crecimiento' : 'optimización'} en ${category.toLowerCase()}`,
      recommendedActions: [
        'Monitorear competencia',
        'Ajustar estrategia de precios',
        'Desarrollar nuevos productos',
        'Mejorar marketing digital'
      ].filter(() => Math.random() > 0.5),
      dataPoints: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        value: 100 + (Math.random() - 0.5) * 20 + (trend === 'growing' ? i * 2 : trend === 'declining' ? -i * 1.5 : 0)
      }))
    };
  });
};

const generateMockMarketInsights = (): MarketInsight[] => {
  const insights = [
    {
      type: 'opportunity' as const,
      title: 'Oportunidad en Mercado de Comida Saludable',
      description: 'Crecimiento del 25% en demanda de opciones saludables en la zona',
      impact: { revenue: 50000, marketShare: 5, customerBase: 200 }
    },
    {
      type: 'threat' as const,
      title: 'Nueva Cadena Entrando al Mercado',
      description: 'Competidor internacional planea abrir 3 locales en la zona',
      impact: { revenue: -30000, marketShare: -8, customerBase: -150 }
    },
    {
      type: 'trend' as const,
      title: 'Tendencia hacia Delivery Premium',
      description: 'Clientes dispuestos a pagar más por experiencia de delivery de calidad',
      impact: { revenue: 25000, marketShare: 3, customerBase: 100 }
    },
    {
      type: 'competitive_move' as const,
      title: 'Competidor Principal Reduce Precios',
      description: 'Restaurant Elite ha reducido precios 15% en categoría principales',
      impact: { revenue: -20000, marketShare: -5, customerBase: -80 }
    }
  ];
  
  return insights.map((insight, index) => ({
    id: `insight-${index + 1}`,
    ...insight,
    urgency: ['immediate', 'short_term', 'medium_term'][Math.floor(Math.random() * 3)] as any,
    confidence: Math.floor(Math.random() * 30) + 70,
    source: ['competitor_analysis', 'market_research', 'customer_feedback'][Math.floor(Math.random() * 3)] as any,
    actionRequired: Math.random() > 0.3,
    relatedCompetitors: ['comp-1', 'comp-2'].filter(() => Math.random() > 0.5),
    timestamp: new Date().toISOString()
  }));
};

// ============================================================================
// COMPETITIVE INTELLIGENCE COMPONENT
// ============================================================================

const competitorTypeOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todos los Competidores' },
    { value: 'direct', label: 'Competencia Directa' },
    { value: 'indirect', label: 'Competencia Indirecta' },
    { value: 'substitute', label: 'Productos Sustitutos' }
  ]
});

const marketPositionOptions = createListCollection({
  items: [
    { value: 'all', label: 'Todas las Posiciones' },
    { value: 'leader', label: 'Líder' },
    { value: 'challenger', label: 'Retador' },
    { value: 'follower', label: 'Seguidor' },
    { value: 'niche', label: 'Nicho' }
  ]
});

export function CompetitiveIntelligence() {
  // State management
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'pricing' | 'trends' | 'insights'>('overview');
  
  // Filters
  const [competitorTypeFilter, setCompetitorTypeFilter] = useState('all');
  const [marketPositionFilter, setMarketPositionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load competitive intelligence data
  useEffect(() => {
    loadCompetitiveData();
  }, []);

  const loadCompetitiveData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCompetitors = generateMockCompetitors();
      const mockTrends = generateMockMarketTrends();
      const mockInsights = generateMockMarketInsights();
      
      setCompetitors(mockCompetitors);
      setMarketTrends(mockTrends);
      setMarketInsights(mockInsights);
      
    } catch (error) {
      console.error('Error loading competitive intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh competitive intelligence
  const refreshIntelligence = useCallback(async () => {
    await loadCompetitiveData();
    
    // Emit refresh event
    await EventBus.emit(
      RestaurantEvents.DATA_SYNCED,
      {
        type: 'competitive_intelligence_updated',
        competitorsCount: competitors.length,
        trendsCount: marketTrends.length,
        insightsCount: marketInsights.length
      },
      'CompetitiveIntelligence'
    );
  }, [competitors.length, marketTrends.length, marketInsights.length]);

  // Filter competitors
  const filteredCompetitors = useMemo(() => {
    return competitors.filter(competitor => {
      const matchesType = competitorTypeFilter === 'all' || competitor.type === competitorTypeFilter;
      const matchesPosition = marketPositionFilter === 'all' || competitor.performance.marketPosition === marketPositionFilter;
      const matchesSearch = searchTerm === '' || 
        competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        competitor.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesPosition && matchesSearch;
    });
  }, [competitors, competitorTypeFilter, marketPositionFilter, searchTerm]);

  // Calculate market overview metrics
  const marketOverview = useMemo(() => {
    if (competitors.length === 0) return null;
    
    const totalRevenue = competitors.reduce((sum, c) => sum + c.businessMetrics.estimatedRevenue, 0);
    const averageRating = competitors.reduce((sum, c) => sum + c.performance.customerRating, 0) / competitors.length;
    const directCompetitors = competitors.filter(c => c.type === 'direct').length;
    const growingTrends = marketTrends.filter(t => t.trend === 'growing').length;
    const criticalInsights = marketInsights.filter(i => i.urgency === 'immediate').length;
    
    return {
      totalMarketSize: totalRevenue,
      averageRating,
      directCompetitors,
      totalCompetitors: competitors.length,
      growingTrends,
      criticalInsights
    };
  }, [competitors, marketTrends, marketInsights]);

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="green" />
          <Text>Cargando Inteligencia Competitiva...</Text>
          <Text fontSize="sm" color="gray.600">Analizando mercado y competidores</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header with Controls */}
      <Card.Root>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="1">
                <HStack gap="2">
                  <PresentationChartLineIcon className="w-6 h-6 text-green-600" />
                  <Text fontSize="xl" fontWeight="bold">Inteligencia Competitiva</Text>
                  <Badge colorPalette="green" size="sm">Market Intelligence</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Análisis de mercado, competidores y posicionamiento estratégico
                </Text>
              </VStack>

              <HStack gap="2">
                <Button
                  colorPalette="green"
                  onClick={refreshIntelligence}
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  size="sm"
                >
                  Actualizar Inteligencia
                </Button>
              </HStack>
            </HStack>

            {/* Market Overview Cards */}
            {marketOverview && (
              <SimpleGrid columns={{ base: 2, md: 6 }} gap="4">
                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        ${(marketOverview.totalMarketSize / 1000000).toFixed(1)}M
                      </Text>
                      <Text fontSize="sm" color="gray.600">Tamaño Mercado</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="red.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {marketOverview.directCompetitors}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Comp. Directos</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="yellow.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                        {marketOverview.averageRating.toFixed(1)}⭐
                      </Text>
                      <Text fontSize="sm" color="gray.600">Rating Promedio</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" >
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {marketOverview.growingTrends}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Tendencias ↗</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="purple.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {marketOverview.criticalInsights}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Insights Críticos</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="orange.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {marketOverview.totalCompetitors}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Total Competidores</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </SimpleGrid>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Main Content Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="overview">
            <HStack gap={2}>
              <GlobeAltIcon className="w-4 h-4" />
              <Text>Overview</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="competitors">
            <HStack gap={2}>
              <UserGroupIcon className="w-4 h-4" />
              <Text>Competidores</Text>
              <Badge colorPalette="blue" size="sm">{competitors.length}</Badge>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="pricing">
            <HStack gap={2}>
              <CurrencyDollarIcon className="w-4 h-4" />
              <Text>Análisis Precios</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="trends">
            <HStack gap={2}>
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <Text>Tendencias</Text>
              <Badge colorPalette="green" size="sm">{marketTrends.length}</Badge>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="insights">
            <HStack gap={2}>
              <BellIcon className="w-4 h-4" />
              <Text>Insights</Text>
              {marketInsights.filter(i => i.urgency === 'immediate').length > 0 && (
                <Badge colorPalette="red" size="sm">{marketInsights.filter(i => i.urgency === 'immediate').length}</Badge>
              )}
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <MarketOverviewDashboard 
              competitors={competitors}
              trends={marketTrends}
              insights={marketInsights}
            />
          </Tabs.Content>

          {/* Competitors Tab */}
          <Tabs.Content value="competitors">
            <VStack gap="4" align="stretch">
              {/* Filters */}
              <HStack gap="4" flexWrap="wrap">
                <Box flex="1" minW="250px">
                  <Input
                    placeholder="Buscar competidores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Box>
                
                <Select.Root
                  collection={competitorTypeOptions}
                  value={[competitorTypeFilter]}
                  onValueChange={(details) => setCompetitorTypeFilter(details.value[0])}
                  width="200px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {competitorTypeOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                
                <Select.Root
                  collection={marketPositionOptions}
                  value={[marketPositionFilter]}
                  onValueChange={(details) => setMarketPositionFilter(details.value[0])}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {marketPositionOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </HStack>
              
              <CompetitorsTable competitors={filteredCompetitors} />
            </VStack>
          </Tabs.Content>

          {/* Pricing Tab */}
          <Tabs.Content value="pricing">
            <PricingAnalysisPanel competitors={competitors} />
          </Tabs.Content>

          {/* Trends Tab */}
          <Tabs.Content value="trends">
            <MarketTrendsPanel trends={marketTrends} />
          </Tabs.Content>

          {/* Insights Tab */}
          <Tabs.Content value="insights">
            <MarketInsightsPanel insights={marketInsights} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface MarketOverviewDashboardProps {
  competitors: CompetitorData[];
  trends: MarketTrend[];
  insights: MarketInsight[];
}

function MarketOverviewDashboard({ competitors, trends, insights }: MarketOverviewDashboardProps) {
  return (
    <VStack gap="6" align="stretch">
      {/* Quick Market Insights */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Card.Root>
          <Card.Header>
            <Text fontWeight="bold">Top Competidores por Rating</Text>
          </Card.Header>
          <Card.Body>
            <VStack gap="3" align="stretch">
              {competitors
                .sort((a, b) => b.performance.customerRating - a.performance.customerRating)
                .slice(0, 5)
                .map((competitor, index) => (
                  <HStack key={competitor.id} justify="space-between">
                    <HStack gap="2">
                      <Text fontSize="lg">{index + 1}.</Text>
                      <VStack align="start" gap="0">
                        <Text fontWeight="medium">{competitor.name}</Text>
                        <Text fontSize="sm" color="gray.600">{competitor.category}</Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" gap="0">
                      <Text fontWeight="bold" color="yellow.600">
                        {competitor.performance.customerRating.toFixed(1)}⭐
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {competitor.performance.reviewCount} reviews
                      </Text>
                    </VStack>
                  </HStack>
                ))}
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Text fontWeight="bold">Tendencias de Mercado Principales</Text>
          </Card.Header>
          <Card.Body>
            <VStack gap="3" align="stretch">
              {trends.slice(0, 5).map((trend) => (
                <HStack key={trend.id} justify="space-between">
                  <VStack align="start" gap="0">
                    <Text fontWeight="medium">{trend.category}</Text>
                    <Text fontSize="sm" color="gray.600">{trend.description}</Text>
                  </VStack>
                  <VStack align="end" gap="0">
                    <HStack gap="1">
                      {trend.trend === 'growing' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      ) : trend.trend === 'declining' ? (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <ChartBarIcon className="w-4 h-4 text-gray-500" />
                      )}
                      <Text fontSize="sm" fontWeight="bold" 
                        color={trend.trend === 'growing' ? 'green.600' : trend.trend === 'declining' ? 'red.600' : 'gray.600'}>
                        {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                      </Text>
                    </HStack>
                    <Badge colorPalette={trend.impact === 'high' ? 'red' : trend.impact === 'medium' ? 'yellow' : 'gray'} size="xs">
                      {trend.impact}
                    </Badge>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Critical Insights Alert */}
      {insights.filter(i => i.urgency === 'immediate').length > 0 && (
        <Alert.Root status="warning" variant="subtle">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <Alert.Title>Insights Críticos Detectados</Alert.Title>
          <Alert.Description>
            Hay {insights.filter(i => i.urgency === 'immediate').length} insights que requieren atención inmediata. 
            Revisa la pestaña de Insights para más detalles.
          </Alert.Description>
        </Alert.Root>
      )}
    </VStack>
  );
}

interface CompetitorsTableProps {
  competitors: CompetitorData[];
}

function CompetitorsTable({ competitors }: CompetitorsTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'red';
      case 'indirect': return 'yellow';
      case 'substitute': return 'blue';
      default: return 'gray';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'leader': return 'green';
      case 'challenger': return 'blue';
      case 'follower': return 'yellow';
      case 'niche': return 'purple';
      default: return 'gray';
    }
  };

  if (competitors.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <UserGroupIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No se encontraron competidores</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="bold">
          Análisis de Competidores - {competitors.length} encontrados
        </Text>
      </Card.Header>
      <Card.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Competidor</Table.ColumnHeader>
              <Table.ColumnHeader>Tipo</Table.ColumnHeader>
              <Table.ColumnHeader>Posición</Table.ColumnHeader>
              <Table.ColumnHeader>Rating</Table.ColumnHeader>
              <Table.ColumnHeader>Ticket Promedio</Table.ColumnHeader>
              <Table.ColumnHeader>Distancia</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {competitors.slice(0, 10).map((competitor) => (
              <Table.Row key={competitor.id}>
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{competitor.name}</Text>
                    <Text fontSize="xs" color="gray.600">{competitor.category}</Text>
                    <Text fontSize="xs" color="gray.500">{competitor.location.zone}</Text>
                  </VStack>
                </Table.Cell>
                
                <Table.Cell>
                  <Badge colorPalette={getTypeColor(competitor.type)} size="sm">
                    {competitor.type === 'direct' ? 'Directo' :
                     competitor.type === 'indirect' ? 'Indirecto' : 'Sustituto'}
                  </Badge>
                </Table.Cell>
                
                <Table.Cell>
                  <Badge colorPalette={getPositionColor(competitor.performance.marketPosition)} size="sm">
                    {competitor.performance.marketPosition === 'leader' ? 'Líder' :
                     competitor.performance.marketPosition === 'challenger' ? 'Retador' :
                     competitor.performance.marketPosition === 'follower' ? 'Seguidor' : 'Nicho'}
                  </Badge>
                </Table.Cell>
                
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{competitor.performance.customerRating.toFixed(1)}⭐</Text>
                    <Text fontSize="xs" color="gray.600">
                      {competitor.performance.reviewCount} reviews
                    </Text>
                  </VStack>
                </Table.Cell>
                
                <Table.Cell>
                  <Text fontWeight="medium">
                    ${competitor.businessMetrics.averageTicket.toFixed(2)}
                  </Text>
                </Table.Cell>
                
                <Table.Cell>
                  <Text fontSize="sm">{competitor.location.distance.toFixed(1)} km</Text>
                </Table.Cell>
                
                <Table.Cell>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    aria-label="Ver detalles"
                  >
                    <EyeIcon className="w-3 h-3" />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        
        {competitors.length > 10 && (
          <Text fontSize="sm" color="gray.600" mt="3" textAlign="center">
            Mostrando 10 de {competitors.length} competidores. Use filtros para refinar la búsqueda.
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}

interface PricingAnalysisPanelProps {
  competitors: CompetitorData[];
}

function PricingAnalysisPanel({ competitors }: PricingAnalysisPanelProps) {
  // Aggregate pricing data across all competitors
  const aggregatedPricing = useMemo(() => {
    if (competitors.length === 0) return [];
    
    const categories = ['Principales', 'Entradas', 'Postres', 'Bebidas', 'Especiales'];
    
    return categories.map(category => {
      const competitorPrices = competitors.map(c => 
        c.pricingIntelligence.find(p => p.categoryName === category)
      ).filter(Boolean);
      
      const avgCompetitorPrice = competitorPrices.reduce((sum, p) => sum + (p?.competitorPrice || 0), 0) / competitorPrices.length;
      const ourPrice = competitorPrices[0]?.ourPrice || Math.random() * 25 + 10;
      const priceDifference = ((ourPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;
      
      return {
        categoryName: category,
        ourPrice,
        avgCompetitorPrice,
        priceDifference,
        pricePosition: Math.abs(priceDifference) < 5 ? 'competitive' : priceDifference > 0 ? 'premium' : 'discount',
        recommendedAction: Math.abs(priceDifference) < 5 ? 'maintain' : 
                          Math.abs(priceDifference) < 15 ? 'monitor' :
                          priceDifference > 0 ? 'decrease' : 'increase'
      };
    });
  }, [competitors]);

  return (
    <VStack gap="6" align="stretch">
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Análisis Comparativo de Precios</Text>
        </Card.Header>
        <Card.Body>
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Categoría</Table.ColumnHeader>
                <Table.ColumnHeader>Nuestro Precio</Table.ColumnHeader>
                <Table.ColumnHeader>Precio Competencia</Table.ColumnHeader>
                <Table.ColumnHeader>Diferencia</Table.ColumnHeader>
                <Table.ColumnHeader>Posición</Table.ColumnHeader>
                <Table.ColumnHeader>Recomendación</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {aggregatedPricing.map((pricing) => (
                <Table.Row key={pricing.categoryName}>
                  <Table.Cell>
                    <Text fontWeight="medium">{pricing.categoryName}</Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text fontWeight="medium">${pricing.ourPrice.toFixed(2)}</Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text>${pricing.avgCompetitorPrice.toFixed(2)}</Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Text color={pricing.priceDifference > 0 ? "red.600" : pricing.priceDifference < 0 ? "green.600" : "gray.600"}>
                      {pricing.priceDifference > 0 ? '+' : ''}{pricing.priceDifference.toFixed(1)}%
                    </Text>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Badge 
                      colorPalette={
                        pricing.pricePosition === 'premium' ? 'purple' :
                        pricing.pricePosition === 'competitive' ? 'green' : 'blue'
                      } 
                      size="sm"
                    >
                      {pricing.pricePosition === 'premium' ? 'Premium' :
                       pricing.pricePosition === 'competitive' ? 'Competitivo' : 'Descuento'}
                    </Badge>
                  </Table.Cell>
                  
                  <Table.Cell>
                    <Badge 
                      colorPalette={
                        pricing.recommendedAction === 'maintain' ? 'green' :
                        pricing.recommendedAction === 'monitor' ? 'yellow' : 'orange'
                      } 
                      size="sm"
                    >
                      {pricing.recommendedAction === 'maintain' ? 'Mantener' :
                       pricing.recommendedAction === 'monitor' ? 'Monitorear' :
                       pricing.recommendedAction === 'increase' ? 'Aumentar' : 'Reducir'}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

interface MarketTrendsPanelProps {
  trends: MarketTrend[];
}

function MarketTrendsPanel({ trends }: MarketTrendsPanelProps) {
  return (
    <VStack gap="4" align="stretch">
      {trends.map((trend) => (
        <Card.Root key={trend.id} variant="outline">
          <Card.Body p="4">
            <VStack gap="3" align="stretch">
              <HStack justify="space-between" align="start">
                <VStack align="start" gap="1">
                  <HStack gap="2">
                    {trend.trend === 'growing' ? (
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                    ) : trend.trend === 'declining' ? (
                      <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <ChartBarIcon className="w-5 h-5 text-gray-500" />
                    )}
                    <Text fontWeight="bold">{trend.category}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">{trend.description}</Text>
                </VStack>
                
                <VStack align="end" gap="1">
                  <Text fontSize="xl" fontWeight="bold" 
                    color={trend.trend === 'growing' ? 'green.600' : trend.trend === 'declining' ? 'red.600' : 'gray.600'}>
                    {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                  </Text>
                  <Badge colorPalette={trend.impact === 'high' ? 'red' : trend.impact === 'medium' ? 'yellow' : 'gray'} size="sm">
                    Impacto {trend.impact}
                  </Badge>
                </VStack>
              </HStack>

              <Text fontSize="sm" color="blue.600">
                💡 {trend.opportunity}
              </Text>

              {trend.recommendedActions.length > 0 && (
                <VStack align="start" gap="2">
                  <Text fontSize="sm" fontWeight="medium">Acciones Recomendadas:</Text>
                  <VStack align="start" gap="1">
                    {trend.recommendedActions.slice(0, 3).map((action, index) => (
                      <HStack key={index} gap="2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <Text fontSize="sm">{action}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
}

interface MarketInsightsPanelProps {
  insights: MarketInsight[];
}

function MarketInsightsPanel({ insights }: MarketInsightsPanelProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'red';
      case 'short_term': return 'orange';
      case 'medium_term': return 'yellow';
      case 'long_term': return 'blue';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return CheckCircleIcon;
      case 'threat': return ExclamationTriangleIcon;
      case 'trend': return ArrowTrendingUpIcon;
      case 'competitive_move': return UserGroupIcon;
      default: return BellIcon;
    }
  };

  return (
    <VStack gap="4" align="stretch">
      {insights.map((insight) => {
        const TypeIcon = getTypeIcon(insight.type);
        return (
          <Card.Root key={insight.id} variant="outline">
            <Card.Body p="4">
              <VStack gap="3" align="stretch">
                <HStack justify="space-between" align="start">
                  <HStack gap="3">
                    <Box p="2" bg={`${getUrgencyColor(insight.urgency)}.100`} borderRadius="md">
                      <TypeIcon className={`w-5 h-5 text-${getUrgencyColor(insight.urgency)}-600`} />
                    </Box>
                    <VStack align="start" gap="1">
                      <Text fontWeight="bold">{insight.title}</Text>
                      <Text fontSize="sm" color="gray.600">{insight.description}</Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" gap="1">
                    <Badge colorPalette={getUrgencyColor(insight.urgency)} size="sm">
                      {insight.urgency === 'immediate' ? 'Inmediato' :
                       insight.urgency === 'short_term' ? 'Corto Plazo' :
                       insight.urgency === 'medium_term' ? 'Mediano Plazo' : 'Largo Plazo'}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      Confianza: {insight.confidence}%
                    </Text>
                  </VStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">Impacto en Revenue:</Text>
                    <Text fontSize="lg" fontWeight="bold" 
                      color={insight.impact.revenue > 0 ? 'green.600' : insight.impact.revenue < 0 ? 'red.600' : 'gray.600'}>
                      {insight.impact.revenue > 0 ? '+' : ''}${insight.impact.revenue.toLocaleString()}
                    </Text>
                  </VStack>
                  
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">Impacto Market Share:</Text>
                    <Text fontSize="lg" fontWeight="bold" 
                      color={insight.impact.marketShare > 0 ? 'green.600' : insight.impact.marketShare < 0 ? 'red.600' : 'gray.600'}>
                      {insight.impact.marketShare > 0 ? '+' : ''}{insight.impact.marketShare}%
                    </Text>
                  </VStack>
                  
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">Impacto Clientes:</Text>
                    <Text fontSize="lg" fontWeight="bold" 
                      color={insight.impact.customerBase > 0 ? 'green.600' : insight.impact.customerBase < 0 ? 'red.600' : 'gray.600'}>
                      {insight.impact.customerBase > 0 ? '+' : ''}{insight.impact.customerBase}
                    </Text>
                  </VStack>
                </SimpleGrid>

                {insight.actionRequired && (
                  <Alert.Root status="info" variant="subtle" size="sm">
                    <Alert.Title>Acción Requerida</Alert.Title>
                    <Alert.Description>
                      Este insight requiere acción estratégica para capitalizar la oportunidad o mitigar el riesgo.
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        );
      })}
    </VStack>
  );
}

export default CompetitiveIntelligence;