// Inventory Optimization - Demand Forecasting Engine
// AI-powered inventory planning with predictive analytics

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
  ProgressTrack,
  ProgressRange,
  Alert,
  Tabs,
  Select,
  createListCollection,
  IconButton,
  Spinner,
  NumberInput
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarDaysIcon,
  BeakerIcon,
  LightBulbIcon,
  CloudIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface DemandForecastItem {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  currentStock: number;
  unit: string;
  
  // Historical data
  historicalUsage: DemandDataPoint[];
  seasonalPattern: SeasonalData;
  weekdayPattern: WeekdayUsage;
  
  // Forecast results
  forecastPeriod: 'week' | 'month' | 'quarter';
  predictedDemand: number;
  confidenceLevel: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalityStrength: number;
  
  // Optimization recommendations
  recommendedStock: number;
  reorderPoint: number;
  safetyStock: number;
  economicOrderQuantity: number;
  
  // Risk assessment
  stockoutRisk: 'low' | 'medium' | 'high';
  overstockRisk: 'low' | 'medium' | 'high';
  variabilityScore: number;
  
  // Business metrics
  averageCost: number;
  carryingCost: number;
  potentialSavings: number;
  serviceLevel: number;
}

export interface DemandDataPoint {
  date: string;
  quantity: number;
  day: string;
  month: number;
  isWeekend: boolean;
  isHoliday: boolean;
  weatherImpact?: number;
  specialEvents?: string[];
}

export interface SeasonalData {
  monthlyMultipliers: Record<number, number>;
  quarterlyTrends: Record<number, number>;
  yearOverYearGrowth: number;
  seasonalityIndex: number;
}

export interface WeekdayUsage {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface ForecastConfig {
  forecastHorizon: number; // days
  confidenceInterval: number; // percentage
  includeSeasonality: boolean;
  includeWeekdayPattern: boolean;
  includeWeatherData: boolean;
  safetyStockDays: number;
  serviceLevel: number; // percentage
  carryingCostRate: number; // percentage
}

export interface OptimizationResults {
  totalItems: number;
  forecastAccuracy: number;
  totalPotentialSavings: number;
  inventoryTurnover: number;
  serviceLevel: number;
  stockoutRisk: number;
  recommendations: OptimizationRecommendation[];
  lastOptimization: string;
}

export interface OptimizationRecommendation {
  id: string;
  materialId: string;
  materialName: string;
  type: 'increase_stock' | 'reduce_stock' | 'adjust_reorder' | 'change_supplier' | 'seasonal_prep';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  currentValue: number;
  recommendedValue: number;
  expectedImpact: string;
  potentialSavings: number;
  implementationDate: string;
  confidence: number;
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const generateMockDemandData = (): DemandForecastItem[] => {
  const categories = ['Carnes', 'Vegetales', 'Lacteos', 'Panaderia', 'Especias', 'Bebidas'];
  
  return Array.from({ length: 35 }, (_, index) => {
    const baseUsage = Math.random() * 50 + 10;
    const variability = Math.random() * 0.4 + 0.1;
    const trend = Math.random() > 0.5 ? 'increasing' : Math.random() > 0.5 ? 'decreasing' : 'stable';
    const confidenceLevel = Math.random() * 0.3 + 0.7;
    
    // Generate historical usage data
    const historicalUsage: DemandDataPoint[] = Array.from({ length: 90 }, (_, dayIndex) => {
      const date = new Date();
      date.setDate(date.getDate() - (90 - dayIndex));
      const dayOfWeek = date.getDay();
      const month = date.getMonth();
      
      // Add seasonal and weekday patterns
      const seasonalMultiplier = 1 + Math.sin((month / 12) * 2 * Math.PI) * 0.3;
      const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.4 : 1.0;
      const randomVariation = 1 + (Math.random() - 0.5) * variability;
      
      return {
        date: date.toISOString().split('T')[0],
        quantity: baseUsage * seasonalMultiplier * weekdayMultiplier * randomVariation,
        day: date.toLocaleDateString('es-ES', { weekday: 'long' }),
        month: month,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday: Math.random() > 0.97,
        weatherImpact: Math.random() > 0.8 ? (Math.random() - 0.5) * 0.3 : undefined,
        specialEvents: Math.random() > 0.9 ? ['Evento especial'] : undefined
      };
    });
    
    const avgUsage = historicalUsage.reduce((sum, d) => sum + d.quantity, 0) / historicalUsage.length;
    const stockoutRisk = variability > 0.3 ? 'high' : variability > 0.2 ? 'medium' : 'low';
    const recommendedStock = avgUsage * 7 * (1 + variability); // 7 days with safety buffer
    
    return {
      id: `forecast-${index + 1}`,
      materialId: `mat-${index + 1}`,
      materialName: `Material ${index + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      currentStock: Math.floor(avgUsage * (3 + Math.random() * 7)),
      unit: ['kg', 'lt', 'unidad', 'paquete'][Math.floor(Math.random() * 4)],
      
      historicalUsage,
      seasonalPattern: {
        monthlyMultipliers: {
          0: 0.8, 1: 0.9, 2: 1.0, 3: 1.1, 4: 1.2, 5: 1.3,
          6: 1.4, 7: 1.3, 8: 1.1, 9: 1.0, 10: 0.9, 11: 1.2
        },
        quarterlyTrends: { 1: 0.95, 2: 1.15, 3: 1.10, 4: 1.05 },
        yearOverYearGrowth: (Math.random() - 0.5) * 0.2,
        seasonalityIndex: Math.random() * 0.4 + 0.1
      },
      weekdayPattern: {
        monday: 1.0,
        tuesday: 1.05,
        wednesday: 1.1,
        thursday: 1.15,
        friday: 1.3,
        saturday: 1.4,
        sunday: 1.2
      },
      
      forecastPeriod: 'week',
      predictedDemand: avgUsage * 7,
      confidenceLevel,
      trend,
      seasonalityStrength: Math.random() * 0.5 + 0.2,
      
      recommendedStock,
      reorderPoint: avgUsage * 3,
      safetyStock: avgUsage * 2,
      economicOrderQuantity: avgUsage * 14,
      
      stockoutRisk,
      overstockRisk: recommendedStock > avgUsage * 10 ? 'high' : 'low',
      variabilityScore: variability,
      
      averageCost: Math.random() * 30 + 5,
      carryingCost: Math.random() * 100 + 50,
      potentialSavings: Math.random() * 1000 + 200,
      serviceLevel: Math.random() * 0.1 + 0.9
    };
  });
};

// ============================================================================
// INVENTORY OPTIMIZATION COMPONENT
// ============================================================================

const forecastPeriodOptions = createListCollection({
  items: [
    { value: 'week', label: 'Semanal (7 días)' },
    { value: 'month', label: 'Mensual (30 días)' },
    { value: 'quarter', label: 'Trimestral (90 días)' }
  ]
});

export function InventoryOptimization() {
  // State management
  const [forecastData, setForecastData] = useState<DemandForecastItem[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResults | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forecast' | 'optimization' | 'recommendations' | 'insights'>('forecast');
  
  // Configuration state
  const [config, setConfig] = useState<ForecastConfig>({
    forecastHorizon: 30,
    confidenceInterval: 95,
    includeSeasonality: true,
    includeWeekdayPattern: true,
    includeWeatherData: false,
    safetyStockDays: 7,
    serviceLevel: 95,
    carryingCostRate: 15
  });

  // Load forecast data
  useEffect(() => {
    loadForecastData();
  }, []);

  const loadForecastData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockData = generateMockDemandData();
      setForecastData(mockData);
      
      // Run initial optimization
      await runOptimization(mockData);
      
    } catch (error) {
      console.error('Error loading forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demand Forecasting Algorithm
  const runOptimization = useCallback(async (data?: DemandForecastItem[]) => {
    try {
      setIsOptimizing(true);
      const dataToOptimize = data || forecastData;
      
      if (dataToOptimize.length === 0) return;

      // Simulate AI-powered optimization processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Calculate optimization metrics
      const totalSavings = dataToOptimize.reduce((sum, item) => sum + item.potentialSavings, 0);
      const avgServiceLevel = dataToOptimize.reduce((sum, item) => sum + item.serviceLevel, 0) / dataToOptimize.length;
      const highRiskItems = dataToOptimize.filter(item => item.stockoutRisk === 'high').length;
      
      // Generate optimization recommendations
      const recommendations = generateOptimizationRecommendations(dataToOptimize);

      const results: OptimizationResults = {
        totalItems: dataToOptimize.length,
        forecastAccuracy: Math.random() * 0.2 + 0.8, // 80-100%
        totalPotentialSavings: totalSavings,
        inventoryTurnover: Math.random() * 4 + 8, // 8-12x per year
        serviceLevel: avgServiceLevel,
        stockoutRisk: (highRiskItems / dataToOptimize.length) * 100,
        recommendations,
        lastOptimization: new Date().toISOString()
      };

      setOptimizationResults(results);

      // Emit optimization completed event
      await EventBus.emit(
        RestaurantEvents.DATA_SYNCED,
        {
          type: 'inventory_optimization_completed',
          results: {
            totalItems: results.totalItems,
            forecastAccuracy: results.forecastAccuracy,
            potentialSavings: results.totalPotentialSavings,
            recommendationsCount: results.recommendations.length
          }
        },
        'InventoryOptimization'
      );

    } catch (error) {
      console.error('Error running optimization:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [forecastData, config]);

  // Generate optimization recommendations
  const generateOptimizationRecommendations = (data: DemandForecastItem[]): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = [];
    
    data.forEach(item => {
      // Stock level recommendations
      if (item.stockoutRisk === 'high') {
        recommendations.push({
          id: `rec-${item.id}-increase-stock`,
          materialId: item.materialId,
          materialName: item.materialName,
          type: 'increase_stock',
          priority: 'critical',
          description: `Alto riesgo de stockout detectado (${(item.variabilityScore * 100).toFixed(1)}% variabilidad)`,
          currentValue: item.currentStock,
          recommendedValue: item.recommendedStock,
          expectedImpact: `Reducir riesgo de stockout del ${((1 - item.confidenceLevel) * 100).toFixed(0)}% al 5%`,
          potentialSavings: item.potentialSavings * 0.3,
          implementationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          confidence: item.confidenceLevel
        });
      }

      // Overstock recommendations
      if (item.overstockRisk === 'high') {
        recommendations.push({
          id: `rec-${item.id}-reduce-stock`,
          materialId: item.materialId,
          materialName: item.materialName,
          type: 'reduce_stock',
          priority: 'medium',
          description: `Sobrestock detectado: ${item.currentStock} vs recomendado ${item.recommendedStock}`,
          currentValue: item.currentStock,
          recommendedValue: item.recommendedStock,
          expectedImpact: `Reducir costos de almacenamiento en $${(item.carryingCost * 0.2).toFixed(0)}`,
          potentialSavings: item.carryingCost * 0.2,
          implementationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          confidence: 0.85
        });
      }

      // Seasonal preparation
      if (item.seasonalityStrength > 0.3 && item.trend === 'increasing') {
        recommendations.push({
          id: `rec-${item.id}-seasonal-prep`,
          materialId: item.materialId,
          materialName: item.materialName,
          type: 'seasonal_prep',
          priority: 'high',
          description: `Patrón estacional fuerte detectado (${(item.seasonalityStrength * 100).toFixed(1)}%)`,
          currentValue: item.currentStock,
          recommendedValue: item.recommendedStock * 1.2,
          expectedImpact: `Preparar para aumento estacional del ${(item.seasonalityStrength * 100).toFixed(0)}%`,
          potentialSavings: item.potentialSavings * 0.15,
          implementationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          confidence: 0.75
        });
      }

      // Reorder point optimization
      if (item.variabilityScore > 0.25) {
        recommendations.push({
          id: `rec-${item.id}-adjust-reorder`,
          materialId: item.materialId,
          materialName: item.materialName,
          type: 'adjust_reorder',
          priority: item.variabilityScore > 0.35 ? 'high' : 'medium',
          description: `Ajustar punto de reorden por alta variabilidad (${(item.variabilityScore * 100).toFixed(1)}%)`,
          currentValue: item.reorderPoint,
          recommendedValue: item.reorderPoint * (1 + item.variabilityScore),
          expectedImpact: `Optimizar inventario y reducir riesgo operativo`,
          potentialSavings: item.potentialSavings * 0.1,
          implementationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          confidence: 0.9
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (forecastData.length === 0) return null;

    const highRiskItems = forecastData.filter(item => item.stockoutRisk === 'high').length;
    const lowConfidenceItems = forecastData.filter(item => item.confidenceLevel < 0.8).length;
    const seasonalItems = forecastData.filter(item => item.seasonalityStrength > 0.3).length;
    const avgAccuracy = forecastData.reduce((sum, item) => sum + item.confidenceLevel, 0) / forecastData.length;

    return {
      highRiskItems,
      lowConfidenceItems,
      seasonalItems,
      avgAccuracy: avgAccuracy * 100,
      totalSavings: optimizationResults?.totalPotentialSavings || 0
    };
  }, [forecastData, optimizationResults]);

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="blue" />
          <Text>Cargando datos de demanda...</Text>
          <Text fontSize="sm" color="gray.600">Analizando patrones históricos y generando pronósticos</Text>
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
                  <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
                  <Text fontSize="xl" fontWeight="bold">Inventory Optimization</Text>
                  <Badge colorPalette="blue" size="sm">AI-Powered Forecasting</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Pronóstico de demanda con machine learning y optimización inteligente de inventario
                </Text>
              </VStack>

              <HStack gap="2">
                <Select.Root
                  collection={forecastPeriodOptions}
                  value={[config.forecastHorizon.toString()]}
                  onValueChange={(e) => setConfig(prev => ({ ...prev, forecastHorizon: parseInt(e.value[0]) }))}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {forecastPeriodOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Button
                  colorPalette="blue"
                  onClick={() => runOptimization()}
                  loadingText="Optimizando..."
                  loading={isOptimizing}
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Ejecutar Optimización
                </Button>
              </HStack>
            </HStack>

            {/* Summary Cards */}
            {summaryMetrics && (
              <SimpleGrid columns={{ base: 2, md: 5 }} gap="4">
                <Card.Root variant="subtle" bg="red.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {summaryMetrics.highRiskItems}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Alto Riesgo</Text>
                      <Text fontSize="xs" color="red.600">stockout</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="yellow.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                        {summaryMetrics.seasonalItems}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Estacionales</Text>
                      <Text fontSize="xs" color="yellow.600">patrones</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {summaryMetrics.avgAccuracy.toFixed(1)}%
                      </Text>
                      <Text fontSize="sm" color="gray.600">Precisión</Text>
                      <Text fontSize="xs" color="blue.600">promedio</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="purple.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {optimizationResults?.recommendations.filter(r => r.priority === 'critical').length || 0}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Críticas</Text>
                      <Text fontSize="xs" color="purple.600">acciones</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="green.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        ${(summaryMetrics.totalSavings / 1000).toFixed(0)}K
                      </Text>
                      <Text fontSize="sm" color="gray.600">Ahorro Pot.</Text>
                      <Text fontSize="xs" color="green.600">anual</Text>
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
          <Tabs.Trigger value="forecast">
            <HStack gap={2}>
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <Text>Pronósticos</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="optimization">
            <HStack gap={2}>
              <LightBulbIcon className="w-4 h-4" />
              <Text>Optimización</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="recommendations">
            <HStack gap={2}>
              <ExclamationTriangleIcon className="w-4 h-4" />
              <Text>Recomendaciones</Text>
              {optimizationResults?.recommendations.filter(r => r.priority === 'critical').length > 0 && (
                <Badge colorPalette="red" size="sm">
                  {optimizationResults.recommendations.filter(r => r.priority === 'critical').length}
                </Badge>
              )}
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="insights">
            <HStack gap={2}>
              <BeakerIcon className="w-4 h-4" />
              <Text>Insights</Text>
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Forecast Tab */}
          <Tabs.Content value="forecast">
            <ForecastTable forecasts={forecastData} />
          </Tabs.Content>

          {/* Optimization Tab */}
          <Tabs.Content value="optimization">
            <OptimizationDashboard 
              results={optimizationResults} 
              config={config}
              onConfigChange={setConfig}
            />
          </Tabs.Content>

          {/* Recommendations Tab */}
          <Tabs.Content value="recommendations">
            <RecommendationsTable 
              recommendations={optimizationResults?.recommendations || []}
            />
          </Tabs.Content>

          {/* Insights Tab */}
          <Tabs.Content value="insights">
            <InsightsDashboard 
              forecasts={forecastData}
              results={optimizationResults}
            />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ForecastTableProps {
  forecasts: DemandForecastItem[];
}

function ForecastTable({ forecasts }: ForecastTableProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return ArrowTrendingUpIcon;
      case 'decreasing': return ArrowTrendingDownIcon;
      default: return CheckCircleIcon;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'green';
      case 'decreasing': return 'red';
      default: return 'blue';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  if (forecasts.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <ArrowTrendingUpIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay datos de pronóstico disponibles</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="bold">
          Pronóstico de Demanda - {forecasts.length} items
        </Text>
      </Card.Header>
      <Card.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Material</Table.ColumnHeader>
              <Table.ColumnHeader>Demanda Predicha</Table.ColumnHeader>
              <Table.ColumnHeader>Tendencia</Table.ColumnHeader>
              <Table.ColumnHeader>Confianza</Table.ColumnHeader>
              <Table.ColumnHeader>Riesgo Stockout</Table.ColumnHeader>
              <Table.ColumnHeader>Stock Recomendado</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {forecasts.slice(0, 15).map((forecast) => {
              const TrendIcon = getTrendIcon(forecast.trend);
              return (
                <Table.Row key={forecast.id}>
                  <Table.Cell>
                    <VStack align="start" gap="1">
                      <Text fontWeight="medium">{forecast.materialName}</Text>
                      <Text fontSize="xs" color="gray.600">{forecast.category}</Text>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="start" gap="1">
                      <Text fontWeight="medium">{forecast.predictedDemand.toFixed(1)} {forecast.unit}</Text>
                      <Text fontSize="xs" color="gray.600">
                        Stock actual: {forecast.currentStock}
                      </Text>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap="2">
                      <TrendIcon className={`w-4 h-4 text-${getTrendColor(forecast.trend)}-500`} />
                      <Badge colorPalette={getTrendColor(forecast.trend)} size="sm">
                        {forecast.trend === 'increasing' ? 'Subiendo' :
                         forecast.trend === 'decreasing' ? 'Bajando' : 'Estable'}
                      </Badge>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="start" gap="1">
                      <Progress.Root
                        value={forecast.confidenceLevel * 100}
                        colorPalette={forecast.confidenceLevel > 0.8 ? 'green' : 'yellow'}
                        size="sm"
                        width="60px"
                      >
                        <ProgressTrack>
                          <ProgressRange />
                        </ProgressTrack>
                      </Progress.Root>
                      <Text fontSize="xs" color="gray.600">
                        {(forecast.confidenceLevel * 100).toFixed(1)}%
                      </Text>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={getRiskColor(forecast.stockoutRisk)} size="sm">
                      {forecast.stockoutRisk === 'high' ? 'Alto' :
                       forecast.stockoutRisk === 'medium' ? 'Medio' : 'Bajo'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontWeight="medium">{forecast.recommendedStock.toFixed(1)} {forecast.unit}</Text>
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
              );
            })}
          </Table.Body>
        </Table.Root>

        {forecasts.length > 15 && (
          <Text fontSize="sm" color="gray.600" mt="3" textAlign="center">
            Mostrando 15 de {forecasts.length} items. Use filtros para ver más.
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}

interface OptimizationDashboardProps {
  results: OptimizationResults | null;
  config: ForecastConfig;
  onConfigChange: (config: ForecastConfig) => void;
}

function OptimizationDashboard({ results, config, onConfigChange }: OptimizationDashboardProps) {
  if (!results) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <LightBulbIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay resultados de optimización disponibles</Text>
            <Text fontSize="sm" color="gray.400">Ejecuta la optimización para ver métricas</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Optimization Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
        <Card.Root variant="outline">
          <Card.Body p="4">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {(results.forecastAccuracy * 100).toFixed(1)}%
              </Text>
              <Text fontSize="sm" color="gray.600">Precisión del Pronóstico</Text>
              <Progress.Root
                value={results.forecastAccuracy * 100}
                colorPalette="blue"
                size="sm"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                ${(results.totalPotentialSavings / 1000).toFixed(0)}K
              </Text>
              <Text fontSize="sm" color="gray.600">Ahorro Potencial Anual</Text>
              <Text fontSize="xs" color="green.600">
                {((results.totalPotentialSavings / (results.totalItems * 1000)) * 100).toFixed(1)}% del inventario
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {results.inventoryTurnover.toFixed(1)}x
              </Text>
              <Text fontSize="sm" color="gray.600">Rotación de Inventario</Text>
              <Text fontSize="xs" color="purple.600">por año</Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root variant="outline">
          <Card.Body p="4">
            <VStack gap="2">
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {(results.serviceLevel * 100).toFixed(1)}%
              </Text>
              <Text fontSize="sm" color="gray.600">Nivel de Servicio</Text>
              <Progress.Root
                value={results.serviceLevel * 100}
                colorPalette="orange"
                size="sm"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Configuration Panel */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Configuración de Optimización</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">Nivel de Servicio (%)</Text>
              <NumberInput.Root
                value={config.serviceLevel.toString()}
                onValueChange={(details) => onConfigChange({
                  ...config,
                  serviceLevel: Number(details.value)
                })}
                min={80}
                max={99}
                step={1}
              >
                <NumberInput.ValueText />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>

            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">Días de Stock de Seguridad</Text>
              <NumberInput.Root
                value={config.safetyStockDays.toString()}
                onValueChange={(details) => onConfigChange({
                  ...config,
                  safetyStockDays: Number(details.value)
                })}
                min={1}
                max={30}
                step={1}
              >
                <NumberInput.ValueText />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>

            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">Tasa de Costo de Almacenamiento (%)</Text>
              <NumberInput.Root
                value={config.carryingCostRate.toString()}
                onValueChange={(details) => onConfigChange({
                  ...config,
                  carryingCostRate: Number(details.value)
                })}
                min={5}
                max={30}
                step={0.5}
              >
                <NumberInput.ValueText />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>

            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">Horizonte de Pronóstico (días)</Text>
              <NumberInput.Root
                value={config.forecastHorizon.toString()}
                onValueChange={(details) => onConfigChange({
                  ...config,
                  forecastHorizon: Number(details.value)
                })}
                min={7}
                max={365}
                step={7}
              >
                <NumberInput.ValueText />
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger />
                  <NumberInput.DecrementTrigger />
                </NumberInput.Control>
              </NumberInput.Root>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
}

interface RecommendationsTableProps {
  recommendations: OptimizationRecommendation[];
}

function RecommendationsTable({ recommendations }: RecommendationsTableProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'increase_stock': return ArrowTrendingUpIcon;
      case 'reduce_stock': return ArrowTrendingDownIcon;
      case 'adjust_reorder': return ArrowPathIcon;
      case 'seasonal_prep': return CalendarDaysIcon;
      default: return CheckCircleIcon;
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
            <Text color="green.600" fontWeight="medium">¡Excelente!</Text>
            <Text color="gray.500">No hay recomendaciones críticas en este momento.</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontWeight="bold">
          Recomendaciones de Optimización - {recommendations.length} acciones
        </Text>
      </Card.Header>
      <Card.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Prioridad</Table.ColumnHeader>
              <Table.ColumnHeader>Material</Table.ColumnHeader>
              <Table.ColumnHeader>Descripción</Table.ColumnHeader>
              <Table.ColumnHeader>Actual → Recomendado</Table.ColumnHeader>
              <Table.ColumnHeader>Impacto Estimado</Table.ColumnHeader>
              <Table.ColumnHeader>Confianza</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {recommendations.slice(0, 20).map((rec) => {
              const TypeIcon = getTypeIcon(rec.type);
              return (
                <Table.Row key={rec.id}>
                  <Table.Cell>
                    <HStack gap="2">
                      <TypeIcon className="w-4 h-4" />
                      <Badge colorPalette={getPriorityColor(rec.priority)} size="sm">
                        {rec.priority === 'critical' ? 'Crítica' :
                         rec.priority === 'high' ? 'Alta' :
                         rec.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontWeight="medium">{rec.materialName}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm">{rec.description}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="start" gap="1">
                      <Text fontSize="sm" fontWeight="medium">
                        {rec.currentValue.toFixed(1)} → {rec.recommendedValue.toFixed(1)}
                      </Text>
                      <Text fontSize="xs" color="green.600">
                        ${rec.potentialSavings.toFixed(0)} ahorro
                      </Text>
                    </VStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm">{rec.expectedImpact}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <VStack align="start" gap="1">
                      <Progress.Root
                        value={rec.confidence * 100}
                        colorPalette={rec.confidence > 0.8 ? 'green' : 'yellow'}
                        size="sm"
                        width="50px"
                      >
                        <ProgressTrack>
                          <ProgressRange />
                        </ProgressTrack>
                      </Progress.Root>
                      <Text fontSize="xs" color="gray.600">
                        {(rec.confidence * 100).toFixed(0)}%
                      </Text>
                    </VStack>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
}

interface InsightsDashboardProps {
  forecasts: DemandForecastItem[];
  results: OptimizationResults | null;
}

function InsightsDashboard({ forecasts, results }: InsightsDashboardProps) {
  const insights = useMemo(() => {
    if (forecasts.length === 0) return null;

    // Calculate insights
    const seasonalItems = forecasts.filter(item => item.seasonalityStrength > 0.3);
    const trendingUp = forecasts.filter(item => item.trend === 'increasing');
    const trendingDown = forecasts.filter(item => item.trend === 'decreasing');
    const highVariability = forecasts.filter(item => item.variabilityScore > 0.3);
    
    const topCategories = forecasts.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.predictedDemand;
      return acc;
    }, {} as Record<string, number>);

    return {
      seasonalItems: seasonalItems.length,
      trendingUp: trendingUp.length,
      trendingDown: trendingDown.length,
      highVariability: highVariability.length,
      topCategories: Object.entries(topCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }, [forecasts]);

  if (!insights) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <BeakerIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">No hay datos suficientes para generar insights</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
      {/* Trends Insights */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Análisis de Tendencias</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between">
              <HStack gap="2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                <Text>Productos en crecimiento</Text>
              </HStack>
              <Badge colorPalette="green" size="sm">{insights.trendingUp}</Badge>
            </HStack>

            <HStack justify="space-between">
              <HStack gap="2">
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                <Text>Productos en declive</Text>
              </HStack>
              <Badge colorPalette="red" size="sm">{insights.trendingDown}</Badge>
            </HStack>

            <HStack justify="space-between">
              <HStack gap="2">
                <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                <Text>Patrones estacionales</Text>
              </HStack>
              <Badge colorPalette="blue" size="sm">{insights.seasonalItems}</Badge>
            </HStack>

            <HStack justify="space-between">
              <HStack gap="2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                <Text>Alta variabilidad</Text>
              </HStack>
              <Badge colorPalette="yellow" size="sm">{insights.highVariability}</Badge>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Top Categories */}
      <Card.Root>
        <Card.Header>
          <Text fontWeight="bold">Categorías por Demanda</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="3" align="stretch">
            {insights.topCategories.map(([category, demand], index) => (
              <HStack key={category} justify="space-between">
                <HStack gap="2">
                  <Text fontSize="lg">{index + 1}.</Text>
                  <Text fontWeight="medium">{category}</Text>
                </HStack>
                <Text color="blue.600" fontWeight="bold">
                  {demand.toFixed(1)} unidades
                </Text>
              </HStack>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Performance Insights */}
      {results && (
        <Card.Root>
          <Card.Header>
            <Text fontWeight="bold">Insights de Performance</Text>
          </Card.Header>
          <Card.Body>
            <VStack gap="4" align="stretch">
              <Alert.Root status={results.forecastAccuracy > 0.85 ? "success" : "warning"} variant="subtle">
                <Alert.Title>
                  Precisión del Modelo: {(results.forecastAccuracy * 100).toFixed(1)}%
                </Alert.Title>
                <Alert.Description>
                  {results.forecastAccuracy > 0.85 
                    ? "Excelente precisión en las predicciones"
                    : "La precisión puede mejorarse con más datos históricos"}
                </Alert.Description>
              </Alert.Root>

              <Alert.Root status="info" variant="subtle">
                <Alert.Title>
                  Oportunidades de Ahorro: ${(results.totalPotentialSavings / 1000).toFixed(0)}K
                </Alert.Title>
                <Alert.Description>
                  Optimizando los niveles de inventario según las recomendaciones
                </Alert.Description>
              </Alert.Root>

              {results.stockoutRisk > 20 && (
                <Alert.Root status="warning" variant="subtle">
                  <Alert.Title>
                    Riesgo de Stockout: {results.stockoutRisk.toFixed(1)}%
                  </Alert.Title>
                  <Alert.Description>
                    Considere aumentar los niveles de stock de seguridad para items críticos
                  </Alert.Description>
                </Alert.Root>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </SimpleGrid>
  );
}

export default InventoryOptimization;