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
  NumberInput,
  Switch
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  LightBulbIcon,
  ArrowPathIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

// Import event system
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// Predictive Analytics Interfaces
interface MaterialDemand {
  materialId: string;
  materialName: string;
  currentStock: number;
  unit: string;
  historicalData: DemandDataPoint[];
  prediction: DemandPrediction;
  seasonality: SeasonalityPattern;
  alerts: PredictiveAlert[];
}

interface DemandDataPoint {
  date: string;
  actualDemand: number;
  stockLevel: number;
  events?: string[]; // Special events that affected demand
  temperature?: number;
  dayOfWeek: number;
  isHoliday?: boolean;
}

interface DemandPrediction {
  forecastPeriod: number; // days
  predictions: ForecastPoint[];
  accuracy: number; // 0-100%
  confidenceLevel: number; // 0-100%
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  seasonalityDetected: boolean;
  recommendedAction: PredictiveRecommendation;
}

interface ForecastPoint {
  date: string;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  factors: PredictionFactor[];
}

interface PredictionFactor {
  name: string;
  impact: number; // -100 to +100
  category: 'seasonal' | 'trend' | 'event' | 'weather' | 'day_of_week';
}

interface SeasonalityPattern {
  detected: boolean;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'event_driven';
  strength: number; // 0-100%
  peakPeriods: PeakPeriod[];
  adjustments: SeasonalAdjustment[];
}

interface PeakPeriod {
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number; // 1.5 = 50% increase
  category: 'seasonal' | 'holiday' | 'event' | 'weather';
}

interface SeasonalAdjustment {
  period: string;
  adjustment: number;
  reasoning: string;
}

interface PredictiveAlert {
  id: string;
  type: 'stockout_risk' | 'overstock_risk' | 'demand_spike' | 'trend_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  estimatedImpact: number;
  recommendedAction: string;
  daysUntilEvent: number;
}

interface PredictiveRecommendation {
  action: 'increase_order' | 'decrease_order' | 'maintain_current' | 'urgent_restock' | 'reduce_inventory';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedQuantity?: number;
  reasoning: string;
  estimatedSavings?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PredictiveAnalyticsConfig {
  forecastHorizon: number;
  confidenceThreshold: number;
  seasonalityDetection: boolean;
  weatherIntegration: boolean;
  eventCalendarSync: boolean;
  autoReorderTrigger: boolean;
  alertThresholds: {
    stockoutRisk: number;
    overstockRisk: number;
    demandSpike: number;
  };
}

// Mock data generators
const generateMockMaterialDemand = (): MaterialDemand[] => {
  const materials = [
    'Harina 000', 'Tomate triturado', 'Mozzarella', 'Aceite de oliva', 'Carne picada',
    'Pollo', 'Cebolla', 'Ají morrón', 'Lechuga', 'Queso rallado'
  ];

  return materials.map((name, index) => {
    const materialId = `material_${index + 1}`;
    const currentStock = Math.floor(Math.random() * 100) + 10;
    
    // Generate historical data (30 days)
    const historicalData: DemandDataPoint[] = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseDemand = 10 + Math.random() * 20;
      
      // Weekend boost for restaurant items
      let actualDemand = baseDemand;
      if (isWeekend) actualDemand *= 1.3;
      
      // Add some seasonality
      const seasonalEffect = Math.sin((i / 30) * Math.PI * 2) * 0.2 + 1;
      actualDemand *= seasonalEffect;
      
      // Add random events
      const events: string[] = [];
      if (Math.random() < 0.1) {
        events.push('Promoción especial');
        actualDemand *= 1.5;
      }
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        actualDemand: Math.round(actualDemand),
        stockLevel: Math.floor(Math.random() * 50) + 20,
        dayOfWeek,
        events: events.length > 0 ? events : undefined,
        temperature: 20 + Math.random() * 15,
        isHoliday: Math.random() < 0.05
      });
    }
    
    // Generate predictions (next 7 days)
    const predictions: ForecastPoint[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const basePrediction = 15 + Math.random() * 10;
      const confidence = 70 + Math.random() * 25;
      const variance = basePrediction * 0.2;
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedDemand: Math.round(basePrediction),
        lowerBound: Math.round(basePrediction - variance),
        upperBound: Math.round(basePrediction + variance),
        confidence: Math.round(confidence),
        factors: [
          {
            name: 'Tendencia histórica',
            impact: Math.floor(Math.random() * 40) - 20,
            category: 'trend'
          },
          {
            name: 'Estacionalidad',
            impact: Math.floor(Math.random() * 30) - 15,
            category: 'seasonal'
          },
          {
            name: 'Día de la semana',
            impact: Math.floor(Math.random() * 25) - 12,
            category: 'day_of_week'
          }
        ]
      });
    }
    
    const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
      Math.random() < 0.4 ? 'increasing' : Math.random() < 0.7 ? 'stable' : 'decreasing';
    
    // Generate alerts
    const alerts: PredictiveAlert[] = [];
    if (Math.random() < 0.3) {
      alerts.push({
        id: `alert_${materialId}`,
        type: Math.random() < 0.5 ? 'stockout_risk' : 'demand_spike',
        severity: Math.random() < 0.2 ? 'critical' : Math.random() < 0.5 ? 'high' : 'medium',
        message: `Riesgo de desabastecimiento en ${Math.floor(Math.random() * 5) + 1} días`,
        estimatedImpact: Math.floor(Math.random() * 1000) + 500,
        recommendedAction: 'Realizar pedido urgente al proveedor',
        daysUntilEvent: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return {
      materialId,
      materialName: name,
      currentStock,
      unit: index % 3 === 0 ? 'kg' : index % 3 === 1 ? 'L' : 'unidad',
      historicalData,
      prediction: {
        forecastPeriod: 7,
        predictions,
        accuracy: 75 + Math.random() * 20,
        confidenceLevel: 80 + Math.random() * 15,
        trendDirection,
        seasonalityDetected: Math.random() > 0.3,
        recommendedAction: {
          action: Math.random() < 0.3 ? 'increase_order' : Math.random() < 0.6 ? 'maintain_current' : 'decrease_order',
          priority: Math.random() < 0.2 ? 'urgent' : Math.random() < 0.5 ? 'high' : 'medium',
          suggestedQuantity: Math.floor(Math.random() * 50) + 10,
          reasoning: `Basado en análisis de tendencia ${trendDirection} y patrones estacionales`,
          estimatedSavings: Math.floor(Math.random() * 500) + 100,
          riskLevel: Math.random() < 0.3 ? 'high' : Math.random() < 0.7 ? 'medium' : 'low'
        }
      },
      seasonality: {
        detected: Math.random() > 0.3,
        type: Math.random() < 0.4 ? 'weekly' : Math.random() < 0.7 ? 'monthly' : 'daily',
        strength: Math.floor(Math.random() * 60) + 20,
        peakPeriods: [
          {
            name: 'Fin de semana',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            multiplier: 1.3 + Math.random() * 0.4,
            category: 'seasonal'
          }
        ],
        adjustments: [
          {
            period: 'Viernes-Domingo',
            adjustment: 25 + Math.random() * 15,
            reasoning: 'Mayor demanda en fines de semana'
          }
        ]
      },
      alerts
    };
  });
};

// Collections
const FORECAST_HORIZON_COLLECTION = createListCollection({
  items: [
    { label: '3 días', value: '3' },
    { label: '7 días', value: '7' },
    { label: '14 días', value: '14' },
    { label: '30 días', value: '30' }
  ]
});

const MATERIAL_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los materiales', value: 'all' },
    { label: 'Ingredientes principales', value: 'main' },
    { label: 'Condimentos', value: 'seasoning' },
    { label: 'Embalaje', value: 'packaging' }
  ]
});

// Component
export function PredictiveAnalytics() {
  // State
  const [materials, setMaterials] = useState<MaterialDemand[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDemand | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasting' | 'seasonality' | 'alerts' | 'recommendations'>('overview');
  const [config, setConfig] = useState<PredictiveAnalyticsConfig>({
    forecastHorizon: 7,
    confidenceThreshold: 80,
    seasonalityDetection: true,
    weatherIntegration: false,
    eventCalendarSync: true,
    autoReorderTrigger: false,
    alertThresholds: {
      stockoutRisk: 70,
      overstockRisk: 80,
      demandSpike: 150
    }
  });
  const [materialFilter, setMaterialFilter] = useState('all');
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  // Load data
  useEffect(() => {
    const loadPredictiveData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockData = generateMockMaterialDemand();
        setMaterials(mockData);
        setSelectedMaterial(mockData[0]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error loading predictive analytics data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadPredictiveData();
  }, []);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    if (materialFilter === 'all') return materials;
    
    // This would be based on actual material categories
    const categoryMap: Record<string, string[]> = {
      'main': ['Harina 000', 'Tomate triturado', 'Mozzarella', 'Carne picada', 'Pollo'],
      'seasoning': ['Aceite de oliva', 'Ají morrón'],
      'packaging': []
    };
    
    const categoryItems = categoryMap[materialFilter] || [];
    return materials.filter(m => categoryItems.includes(m.materialName));
  }, [materials, materialFilter]);

  // Analytics summary
  const analyticsOverview = useMemo(() => {
    if (materials.length === 0) return null;

    const totalAlerts = materials.reduce((sum, m) => sum + m.alerts.length, 0);
    const criticalAlerts = materials.reduce((sum, m) => 
      sum + m.alerts.filter(a => a.severity === 'critical').length, 0);
    
    const averageAccuracy = materials.reduce((sum, m) => sum + m.prediction.accuracy, 0) / materials.length;
    
    const materialsWithTrends = {
      increasing: materials.filter(m => m.prediction.trendDirection === 'increasing').length,
      stable: materials.filter(m => m.prediction.trendDirection === 'stable').length,
      decreasing: materials.filter(m => m.prediction.trendDirection === 'decreasing').length
    };

    const seasonalMaterials = materials.filter(m => m.seasonality.detected).length;
    
    return {
      totalMaterials: materials.length,
      totalAlerts,
      criticalAlerts,
      averageAccuracy: Math.round(averageAccuracy),
      materialsWithTrends,
      seasonalMaterials,
      forecastReliability: averageAccuracy > 80 ? 'high' : averageAccuracy > 60 ? 'medium' : 'low'
    };
  }, [materials]);

  // Run predictive analysis
  const runPredictiveAnalysis = useCallback(async () => {
    setIsRunningAnalysis(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update predictions with new analysis
      const updatedMaterials = materials.map(material => ({
        ...material,
        prediction: {
          ...material.prediction,
          accuracy: Math.min(95, material.prediction.accuracy + Math.random() * 5),
          confidenceLevel: Math.min(95, material.prediction.confidenceLevel + Math.random() * 5)
        }
      }));
      
      setMaterials(updatedMaterials);
      
      // Emit analytics event
      await EventBus.emit(RestaurantEvents.DATA_SYNCED, {
        type: 'predictive_analysis_completed',
        materialsAnalyzed: materials.length,
        averageAccuracy: analyticsOverview?.averageAccuracy || 0,
        criticalAlerts: analyticsOverview?.criticalAlerts || 0,
        forecastHorizon: config.forecastHorizon,
        analysisMethod: 'advanced_ml_prediction'
      }, 'PredictiveAnalytics');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error running predictive analysis: ${errorMessage}`);
    } finally {
      setIsRunningAnalysis(false);
    }
  }, [materials, analyticsOverview, config.forecastHorizon]);

  // Get trend icon and color
  const getTrendDisplay = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return { icon: ArrowTrendingUpIcon, color: 'green', label: 'Creciente' };
      case 'decreasing':
        return { icon: ArrowTrendingDownIcon, color: 'red', label: 'Decreciente' };
      default:
        return { icon: ChartBarIcon, color: 'blue', label: 'Estable' };
    }
  };

  // Get alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="60px" />
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {Array.from({ length: 4 }).map((_, i) => (
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
              <Text fontSize="3xl" fontWeight="bold">🔮 Predictive Analytics</Text>
              <Text color="gray.600">
                Predicción inteligente de demanda con machine learning y análisis estacional
              </Text>
            </VStack>
            
            <HStack gap={2}>
              <Button 
                colorPalette="blue"
                onClick={runPredictiveAnalysis}
                loading={isRunningAnalysis}
                loadingText="Analizando..."
                size="sm"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Ejecutar Análisis
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('/tools/intelligence/recipes', '_blank')}
                size="sm"
              >
                <BeakerIcon className="w-4 h-4" />
                Recipe Intelligence
              </Button>
            </HStack>
          </HStack>

          {/* Overview Stats */}
          {analyticsOverview && (
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
              <Card.Root variant="subtle" bg="blue.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {analyticsOverview.totalMaterials}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Materiales Analizados</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="green.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {analyticsOverview.averageAccuracy}%
                  </Text>
                  <Text fontSize="sm" color="gray.600">Precisión Promedio</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg="purple.50">
                <Card.Body p={4} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {analyticsOverview.seasonalMaterials}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Con Estacionalidad</Text>
                </Card.Body>
              </Card.Root>

              <Card.Root variant="subtle" bg={analyticsOverview.criticalAlerts > 0 ? "red.50" : "gray.50"}>
                <Card.Body p={4} textAlign="center">
                  <Text 
                    fontSize="2xl" 
                    fontWeight="bold" 
                    color={analyticsOverview.criticalAlerts > 0 ? "red.600" : "gray.600"}
                  >
                    {analyticsOverview.criticalAlerts}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Alertas Críticas</Text>
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
            
            <Tabs.Trigger value="forecasting">
              <HStack gap={2}>
                <ArrowTrendingUpIcon className="w-4 h-4" />
                <Text>Predicciones</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="seasonality">
              <HStack gap={2}>
                <CalendarIcon className="w-4 h-4" />
                <Text>Estacionalidad</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="alerts">
              <HStack gap={2}>
                <ExclamationTriangleIcon className="w-4 h-4" />
                <Text>Alertas</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="recommendations">
              <HStack gap={2}>
                <LightBulbIcon className="w-4 h-4" />
                <Text>Recomendaciones</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            {/* Overview Tab */}
            <Tabs.Content value="overview">
              <VStack gap={6} align="stretch">
                {/* Filters */}
                <HStack gap={4} flexWrap="wrap">
                  <Select.Root
                    collection={MATERIAL_FILTER_COLLECTION}
                    value={[materialFilter]}
                    onValueChange={(details) => setMaterialFilter(details.value[0])}
                    width="250px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Filtrar materiales" />
                    </Select.Trigger>
                    <Select.Content>
                      {MATERIAL_FILTER_COLLECTION.items.map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  
                  <Select.Root
                    collection={FORECAST_HORIZON_COLLECTION}
                    value={[config.forecastHorizon.toString()]}
                    onValueChange={(details) => setConfig({
                      ...config, 
                      forecastHorizon: parseInt(details.value[0])
                    })}
                    width="150px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Horizonte" />
                    </Select.Trigger>
                    <Select.Content>
                      {FORECAST_HORIZON_COLLECTION.items.map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                {/* Materials Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                  {filteredMaterials.map((material) => {
                    const trend = getTrendDisplay(material.prediction.trendDirection);
                    const TrendIcon = trend.icon;
                    
                    return (
                      <Card.Root 
                        key={material.materialId}
                        variant="outline"
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                        onClick={() => setSelectedMaterial(material)}
                        bg={selectedMaterial?.materialId === material.materialId ? 'blue.50' : 'white'}
                        borderColor={selectedMaterial?.materialId === material.materialId ? 'blue.300' : 'gray.200'}
                      >
                        <Card.Body p={4}>
                          <VStack align="stretch" gap={3}>
                            {/* Header */}
                            <HStack justify="space-between">
                              <VStack align="start" gap={0}>
                                <Text fontWeight="bold" fontSize="sm">
                                  {material.materialName}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Stock: {material.currentStock} {material.unit}
                                </Text>
                              </VStack>
                              <HStack gap={1}>
                                <TrendIcon className={`w-4 h-4 text-${trend.color}-500`} />
                                {material.alerts.length > 0 && (
                                  <Badge colorPalette="red" size="xs">
                                    {material.alerts.length}
                                  </Badge>
                                )}
                              </HStack>
                            </HStack>

                            {/* Prediction Accuracy */}
                            <VStack align="stretch" gap={1}>
                              <HStack justify="space-between">
                                <Text fontSize="xs" color="gray.600">Precisión:</Text>
                                <Text fontSize="xs" fontWeight="medium">
                                  {Math.round(material.prediction.accuracy)}%
                                </Text>
                              </HStack>
                              <Progress.Root 
                                value={material.prediction.accuracy} 
                                colorPalette={
                                  material.prediction.accuracy > 80 ? 'green' : 
                                  material.prediction.accuracy > 60 ? 'yellow' : 'red'
                                }
                                size="sm"
                              >
                                <ProgressTrack>
                                  <ProgressRange />
                                </ProgressTrack>
                              </Progress.Root>
                            </VStack>

                            {/* Trend Info */}
                            <HStack justify="space-between">
                              <Text fontSize="xs" color="gray.600">Tendencia:</Text>
                              <Badge colorPalette={trend.color} size="xs">
                                {trend.label}
                              </Badge>
                            </HStack>

                            {/* Next Prediction */}
                            {material.prediction.predictions.length > 0 && (
                              <VStack align="stretch" gap={1}>
                                <Text fontSize="xs" color="gray.600">Próxima demanda:</Text>
                                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                  {material.prediction.predictions[0].predictedDemand} {material.unit}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Confianza: {material.prediction.predictions[0].confidence}%
                                </Text>
                              </VStack>
                            )}
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    );
                  })}
                </SimpleGrid>
              </VStack>
            </Tabs.Content>

            {/* Forecasting Tab */}
            <Tabs.Content value="forecasting">
              <VStack gap={6} align="stretch">
                {selectedMaterial && (
                  <>
                    <Card.Root variant="outline">
                      <Card.Header>
                        <Text fontSize="lg" fontWeight="bold">
                          Predicción de Demanda - {selectedMaterial.materialName}
                        </Text>
                      </Card.Header>
                      <Card.Body>
                        <VStack gap={4} align="stretch">
                          {/* Forecast Summary */}
                          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                            <VStack>
                              <Text fontSize="sm" color="gray.600">Precisión</Text>
                              <Text fontSize="xl" fontWeight="bold" color="green.600">
                                {Math.round(selectedMaterial.prediction.accuracy)}%
                              </Text>
                            </VStack>
                            <VStack>
                              <Text fontSize="sm" color="gray.600">Confianza</Text>
                              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                                {Math.round(selectedMaterial.prediction.confidenceLevel)}%
                              </Text>
                            </VStack>
                            <VStack>
                              <Text fontSize="sm" color="gray.600">Tendencia</Text>
                              <Badge colorPalette={getTrendDisplay(selectedMaterial.prediction.trendDirection).color}>
                                {getTrendDisplay(selectedMaterial.prediction.trendDirection).label}
                              </Badge>
                            </VStack>
                            <VStack>
                              <Text fontSize="sm" color="gray.600">Estacionalidad</Text>
                              <Badge colorPalette={selectedMaterial.prediction.seasonalityDetected ? 'green' : 'gray'}>
                                {selectedMaterial.prediction.seasonalityDetected ? 'Detectada' : 'No detectada'}
                              </Badge>
                            </VStack>
                          </SimpleGrid>

                          {/* Forecast Chart (Mock) */}
                          <Card.Root variant="subtle">
                            <Card.Body p={6} textAlign="center">
                              <Text fontSize="4xl" mb={4}>📈</Text>
                              <Text fontWeight="medium" mb={2}>Gráfico de Predicciones</Text>
                              <Text fontSize="sm" color="gray.600">
                                Visualización de demanda histórica vs predicciones para los próximos {config.forecastHorizon} días
                              </Text>
                              <Text fontSize="xs" color="gray.500" mt={2}>
                                * Gráfico interactivo disponible en versión completa
                              </Text>
                            </Card.Body>
                          </Card.Root>

                          {/* Forecast Table */}
                          <Box>
                            <Text fontSize="md" fontWeight="semibold" mb={3}>
                              Predicciones Detalladas
                            </Text>
                            <VStack gap={2} align="stretch">
                              {selectedMaterial.prediction.predictions.map((prediction, index) => (
                                <Card.Root key={index} variant="outline" size="sm">
                                  <Card.Body p={3}>
                                    <HStack justify="space-between">
                                      <VStack align="start" gap={0}>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {new Date(prediction.date).toLocaleDateString('es-ES')}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          Día {index + 1}
                                        </Text>
                                      </VStack>
                                      
                                      <VStack align="end" gap={0}>
                                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                          {prediction.predictedDemand} {selectedMaterial.unit}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {prediction.lowerBound}-{prediction.upperBound} ({prediction.confidence}%)
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  </Card.Body>
                                </Card.Root>
                              ))}
                            </VStack>
                          </Box>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </>
                )}
              </VStack>
            </Tabs.Content>

            {/* Seasonality Tab */}
            <Tabs.Content value="seasonality">
              <VStack gap={6} align="stretch">
                {selectedMaterial && (
                  <Card.Root variant="outline">
                    <Card.Header>
                      <Text fontSize="lg" fontWeight="bold">
                        Análisis de Estacionalidad - {selectedMaterial.materialName}
                      </Text>
                    </Card.Header>
                    <Card.Body>
                      <VStack gap={4} align="stretch">
                        {selectedMaterial.seasonality.detected ? (
                          <>
                            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                              <VStack>
                                <Text fontSize="sm" color="gray.600">Tipo</Text>
                                <Badge colorPalette="purple">
                                  {selectedMaterial.seasonality.type === 'weekly' ? 'Semanal' : 
                                   selectedMaterial.seasonality.type === 'monthly' ? 'Mensual' : 'Diaria'}
                                </Badge>
                              </VStack>
                              <VStack>
                                <Text fontSize="sm" color="gray.600">Fuerza</Text>
                                <Text fontSize="xl" fontWeight="bold" color="purple.600">
                                  {selectedMaterial.seasonality.strength}%
                                </Text>
                              </VStack>
                              <VStack>
                                <Text fontSize="sm" color="gray.600">Períodos Pico</Text>
                                <Text fontSize="xl" fontWeight="bold" color="orange.600">
                                  {selectedMaterial.seasonality.peakPeriods.length}
                                </Text>
                              </VStack>
                            </SimpleGrid>

                            <Box>
                              <Text fontSize="md" fontWeight="semibold" mb={3}>
                                Períodos de Demanda Alta
                              </Text>
                              <VStack gap={2} align="stretch">
                                {selectedMaterial.seasonality.peakPeriods.map((period, index) => (
                                  <Card.Root key={index} variant="subtle">
                                    <Card.Body p={3}>
                                      <HStack justify="space-between">
                                        <VStack align="start" gap={0}>
                                          <Text fontSize="sm" fontWeight="medium">
                                            {period.name}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                                          </Text>
                                        </VStack>
                                        <VStack align="end" gap={0}>
                                          <Text fontSize="sm" fontWeight="bold" color="orange.600">
                                            +{Math.round((period.multiplier - 1) * 100)}%
                                          </Text>
                                          <Badge colorPalette="orange" size="xs">
                                            {period.category}
                                          </Badge>
                                        </VStack>
                                      </HStack>
                                    </Card.Body>
                                  </Card.Root>
                                ))}
                              </VStack>
                            </Box>

                            <Box>
                              <Text fontSize="md" fontWeight="semibold" mb={3}>
                                Ajustes Estacionales
                              </Text>
                              <VStack gap={2} align="stretch">
                                {selectedMaterial.seasonality.adjustments.map((adjustment, index) => (
                                  <Card.Root key={index} variant="outline" size="sm">
                                    <Card.Body p={3}>
                                      <HStack justify="space-between">
                                        <VStack align="start" gap={0}>
                                          <Text fontSize="sm" fontWeight="medium">
                                            {adjustment.period}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            {adjustment.reasoning}
                                          </Text>
                                        </VStack>
                                        <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                          +{adjustment.adjustment}%
                                        </Text>
                                      </HStack>
                                    </Card.Body>
                                  </Card.Root>
                                ))}
                              </VStack>
                            </Box>
                          </>
                        ) : (
                          <Card.Root variant="subtle">
                            <Card.Body p={8} textAlign="center">
                              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <Text fontSize="lg" fontWeight="medium" mb={2}>
                                No se detectó estacionalidad
                              </Text>
                              <Text color="gray.600">
                                Los patrones de demanda para este material son relativamente constantes a lo largo del tiempo.
                              </Text>
                            </Card.Body>
                          </Card.Root>
                        )}
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                )}
              </VStack>
            </Tabs.Content>

            {/* Alerts Tab */}
            <Tabs.Content value="alerts">
              <VStack gap={4} align="stretch">
                {materials.filter(m => m.alerts.length > 0).length > 0 ? (
                  materials.filter(m => m.alerts.length > 0).map((material) => (
                    <Card.Root key={material.materialId} variant="outline">
                      <Card.Header>
                        <HStack justify="space-between">
                          <Text fontSize="md" fontWeight="bold">
                            {material.materialName}
                          </Text>
                          <Badge colorPalette="blue">
                            {material.alerts.length} alerta{material.alerts.length !== 1 ? 's' : ''}
                          </Badge>
                        </HStack>
                      </Card.Header>
                      <Card.Body>
                        <VStack gap={3} align="stretch">
                          {material.alerts.map((alert) => (
                            <Alert.Root 
                              key={alert.id} 
                              status={alert.severity === 'critical' ? 'error' : 'warning'}
                              variant="subtle"
                            >
                              <Alert.Indicator>
                                {alert.severity === 'critical' ? 
                                  <ExclamationTriangleIcon className="w-5 h-5" /> : 
                                  <ClockIcon className="w-5 h-5" />
                                }
                              </Alert.Indicator>
                              <VStack align="start" gap={1} flex="1">
                                <Alert.Title>
                                  {alert.message}
                                </Alert.Title>
                                <Alert.Description>
                                  {alert.recommendedAction}
                                </Alert.Description>
                                <HStack gap={4} fontSize="xs" color="gray.600">
                                  <Text>Impacto estimado: ${alert.estimatedImpact}</Text>
                                  <Text>En {alert.daysUntilEvent} día{alert.daysUntilEvent !== 1 ? 's' : ''}</Text>
                                  <Badge colorPalette={getAlertColor(alert.severity)} size="xs">
                                    {alert.severity}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </Alert.Root>
                          ))}
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))
                ) : (
                  <Card.Root variant="subtle">
                    <Card.Body p={8} textAlign="center">
                      <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <Text fontSize="lg" fontWeight="medium" mb={2} color="green.600">
                        No hay alertas activas
                      </Text>
                      <Text color="gray.600">
                        Todos los materiales están dentro de los parámetros normales de predicción.
                      </Text>
                    </Card.Body>
                  </Card.Root>
                )}
              </VStack>
            </Tabs.Content>

            {/* Recommendations Tab */}
            <Tabs.Content value="recommendations">
              <VStack gap={4} align="stretch">
                {materials.map((material) => (
                  <Card.Root key={material.materialId} variant="outline">
                    <Card.Header>
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="bold">
                          {material.materialName}
                        </Text>
                        <Badge 
                          colorPalette={
                            material.prediction.recommendedAction.priority === 'urgent' ? 'red' :
                            material.prediction.recommendedAction.priority === 'high' ? 'orange' :
                            material.prediction.recommendedAction.priority === 'medium' ? 'yellow' : 'blue'
                          }
                        >
                          {material.prediction.recommendedAction.priority}
                        </Badge>
                      </HStack>
                    </Card.Header>
                    <Card.Body>
                      <VStack gap={3} align="stretch">
                        <HStack gap={4}>
                          <BoltIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <VStack align="start" gap={1} flex="1">
                            <Text fontSize="sm" fontWeight="medium">
                              Acción Recomendada
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {material.prediction.recommendedAction.action === 'increase_order' ? 'Incrementar pedido' :
                               material.prediction.recommendedAction.action === 'decrease_order' ? 'Reducir pedido' :
                               material.prediction.recommendedAction.action === 'urgent_restock' ? 'Restock urgente' :
                               material.prediction.recommendedAction.action === 'reduce_inventory' ? 'Reducir inventario' :
                               'Mantener nivel actual'}
                            </Text>
                          </VStack>
                        </HStack>

                        <Text fontSize="sm" color="gray.700">
                          {material.prediction.recommendedAction.reasoning}
                        </Text>

                        {material.prediction.recommendedAction.suggestedQuantity && (
                          <HStack justify="space-between" bg="blue.50" p={3} borderRadius="md">
                            <Text fontSize="sm" fontWeight="medium">
                              Cantidad Sugerida:
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="blue.600">
                              {material.prediction.recommendedAction.suggestedQuantity} {material.unit}
                            </Text>
                          </HStack>
                        )}

                        {material.prediction.recommendedAction.estimatedSavings && (
                          <HStack justify="space-between" bg="green.50" p={3} borderRadius="md">
                            <Text fontSize="sm" fontWeight="medium">
                              Ahorro Estimado:
                            </Text>
                            <Text fontSize="sm" fontWeight="bold" color="green.600">
                              ${material.prediction.recommendedAction.estimatedSavings}
                            </Text>
                          </HStack>
                        )}

                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            Riesgo: {material.prediction.recommendedAction.riskLevel}
                          </Text>
                          <Button size="sm" variant="outline" colorPalette="blue">
                            Aplicar Recomendación
                          </Button>
                        </HStack>
                      </VStack>
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