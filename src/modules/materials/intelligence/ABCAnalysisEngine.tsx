// ABC Analysis Engine - Supply Chain Intelligence
// Advanced inventory classification and optimization system

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
  Spinner
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentChartBarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface MaterialWithAnalysis {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  unitCost: number;
  
  // Usage analytics
  weeklyUsage: number;
  monthlyUsage: number;
  usageVariability: number;
  
  // Financial metrics
  annualRevenue: number;
  annualCost: number;
  revenueContribution: number;
  
  // ABC Classification
  abcClass: 'A' | 'B' | 'C';
  classificationScore: number;
  
  // Optimization metrics
  optimalStock: number;
  reorderPoint: number;
  maxStock: number;
  stockStatus: 'optimal' | 'low' | 'overstock' | 'critical';
  
  // Supplier data
  primarySupplierId?: string;
  supplierReliability: number;
  leadTime: number;
  
  // Timestamps
  lastAnalysis: string;
  lastOrdered?: string;
}

export interface ABCAnalysisConfig {
  classAThreshold: number; // % of total revenue for Class A (default 80%)
  classBThreshold: number; // % of total revenue for Class A+B (default 95%)
  analysisMethod: 'revenue' | 'usage' | 'hybrid';
  seasonalityFactor: boolean;
  minimumDataPoints: number;
}

export interface ABCAnalysisResults {
  classA: MaterialWithAnalysis[];
  classB: MaterialWithAnalysis[];
  classC: MaterialWithAnalysis[];
  totalItems: number;
  totalValue: number;
  recommendations: RecommendationItem[];
  lastAnalysis: string;
}

export interface RecommendationItem {
  id: string;
  materialId: string;
  materialName: string;
  type: 'reorder' | 'reduce' | 'optimize' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedImpact: string;
  estimatedSavings?: number;
  actionRequired: string;
  dueDate: string;
}

// ============================================================================
// MOCK DATA GENERATION (for development)
// ============================================================================

const generateMockMaterials = (): MaterialWithAnalysis[] => {
  const categories = ['Carnes', 'Vegetales', 'Lacteos', 'Panaderia', 'Especias', 'Bebidas'];
  const units = ['kg', 'lt', 'unidad', 'paquete'];
  
  return Array.from({ length: 50 }, (_, index) => {
    const baseRevenue = Math.random() * 100000 + 10000;
    const usage = Math.random() * 100 + 5;
    
    return {
      id: `mat-${index + 1}`,
      name: `Material ${index + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      currentStock: Math.floor(Math.random() * 200 + 10),
      unit: units[Math.floor(Math.random() * units.length)],
      unitCost: Math.random() * 50 + 5,
      
      weeklyUsage: usage,
      monthlyUsage: usage * 4,
      usageVariability: Math.random() * 0.4 + 0.1,
      
      annualRevenue: baseRevenue,
      annualCost: baseRevenue * (Math.random() * 0.4 + 0.3),
      revenueContribution: 0, // Will be calculated
      
      abcClass: 'C' as const, // Will be calculated
      classificationScore: 0,
      
      optimalStock: Math.floor(Math.random() * 150 + 50),
      reorderPoint: Math.floor(Math.random() * 50 + 20),
      maxStock: Math.floor(Math.random() * 300 + 200),
      stockStatus: 'optimal' as const, // Will be calculated
      
      primarySupplierId: `sup-${Math.floor(Math.random() * 10) + 1}`,
      supplierReliability: Math.random() * 0.3 + 0.7,
      leadTime: Math.floor(Math.random() * 14 + 1),
      
      lastAnalysis: new Date().toISOString(),
      lastOrdered: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };
  });
};

// ============================================================================
// ABC ANALYSIS ENGINE COMPONENT
// ============================================================================

const analysisMethodOptions = createListCollection({
  items: [
    { value: 'revenue', label: 'Por Ingresos (Pareto)' },
    { value: 'usage', label: 'Por Consumo' },
    { value: 'hybrid', label: 'Análisis Híbrido' }
  ]
});

export function ABCAnalysisEngine() {
  // State management
  const [materials, setMaterials] = useState<MaterialWithAnalysis[]>([]);
  const [analysisResults, setAnalysisResults] = useState<ABCAnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'classA' | 'classB' | 'classC' | 'recommendations'>('overview');
  
  // Configuration state
  const [config, setConfig] = useState<ABCAnalysisConfig>({
    classAThreshold: 80,
    classBThreshold: 95,
    analysisMethod: 'hybrid',
    seasonalityFactor: true,
    minimumDataPoints: 30
  });

  // Load materials data
  useEffect(() => {
    loadMaterialsData();
  }, []);

  const loadMaterialsData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockData = generateMockMaterials();
      setMaterials(mockData);
      
      // Run initial analysis
      await runABCAnalysis(mockData);
      
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ABC Analysis Algorithm
  const runABCAnalysis = useCallback(async (materialsData?: MaterialWithAnalysis[]) => {
    try {
      setIsAnalyzing(true);
      const dataToAnalyze = materialsData || materials;
      
      if (dataToAnalyze.length === 0) return;

      // Step 1: Calculate total value and contribution percentages
      const totalValue = dataToAnalyze.reduce((sum, item) => {
        return sum + (config.analysisMethod === 'usage' ? item.monthlyUsage * item.unitCost : item.annualRevenue);
      }, 0);

      // Step 2: Sort by value/revenue and calculate cumulative percentages
      const sortedMaterials = dataToAnalyze
        .map(item => ({
          ...item,
          analysisValue: config.analysisMethod === 'usage' 
            ? item.monthlyUsage * item.unitCost 
            : config.analysisMethod === 'hybrid'
            ? (item.annualRevenue * 0.7 + item.monthlyUsage * item.unitCost * 12 * 0.3)
            : item.annualRevenue,
          revenueContribution: config.analysisMethod === 'usage' 
            ? (item.monthlyUsage * item.unitCost / totalValue) * 100
            : (item.annualRevenue / totalValue) * 100
        }))
        .sort((a, b) => b.analysisValue - a.analysisValue);

      // Step 3: Classify into A, B, C classes
      let cumulativePercentage = 0;
      const classifiedMaterials = sortedMaterials.map(item => {
        cumulativePercentage += item.revenueContribution;
        
        let abcClass: 'A' | 'B' | 'C';
        if (cumulativePercentage <= config.classAThreshold) {
          abcClass = 'A';
        } else if (cumulativePercentage <= config.classBThreshold) {
          abcClass = 'B';
        } else {
          abcClass = 'C';
        }

        // Calculate stock status
        const stockRatio = item.currentStock / item.optimalStock;
        let stockStatus: MaterialWithAnalysis['stockStatus'];
        if (stockRatio < 0.2) stockStatus = 'critical';
        else if (stockRatio < 0.5) stockStatus = 'low';
        else if (stockRatio > 1.5) stockStatus = 'overstock';
        else stockStatus = 'optimal';

        return {
          ...item,
          abcClass,
          classificationScore: cumulativePercentage,
          stockStatus
        };
      });

      // Step 4: Generate recommendations
      const recommendations = generateRecommendations(classifiedMaterials);

      // Step 5: Organize results
      const results: ABCAnalysisResults = {
        classA: classifiedMaterials.filter(item => item.abcClass === 'A'),
        classB: classifiedMaterials.filter(item => item.abcClass === 'B'),
        classC: classifiedMaterials.filter(item => item.abcClass === 'C'),
        totalItems: classifiedMaterials.length,
        totalValue,
        recommendations,
        lastAnalysis: new Date().toISOString()
      };

      setAnalysisResults(results);
      setMaterials(classifiedMaterials);

      // Emit analysis completed event
      await EventBus.emit(
        RestaurantEvents.DATA_SYNCED,
        {
          type: 'abc_analysis_completed',
          results: {
            totalItems: results.totalItems,
            classACount: results.classA.length,
            classBCount: results.classB.length,
            classCCount: results.classC.length,
            recommendationsCount: results.recommendations.length
          }
        },
        'ABCAnalysisEngine'
      );

    } catch (error) {
      console.error('Error running ABC analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [materials, config]);

  // Generate recommendations based on analysis
  const generateRecommendations = (materials: MaterialWithAnalysis[]): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];
    
    materials.forEach(material => {
      // Reorder recommendations
      if (material.stockStatus === 'critical' || material.stockStatus === 'low') {
        recommendations.push({
          id: `rec-${material.id}-reorder`,
          materialId: material.id,
          materialName: material.name,
          type: material.stockStatus === 'critical' ? 'urgent' : 'reorder',
          priority: material.stockStatus === 'critical' ? 'critical' : material.abcClass === 'A' ? 'high' : 'medium',
          description: `Stock ${material.stockStatus === 'critical' ? 'crítico' : 'bajo'}: ${material.currentStock} ${material.unit}`,
          expectedImpact: `Evitar stockout y mantener operaciones`,
          estimatedSavings: material.abcClass === 'A' ? material.annualRevenue * 0.1 : undefined,
          actionRequired: `Ordenar ${material.optimalStock - material.currentStock} ${material.unit}`,
          dueDate: new Date(Date.now() + (material.stockStatus === 'critical' ? 1 : 3) * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Overstock recommendations
      if (material.stockStatus === 'overstock' && material.abcClass === 'C') {
        recommendations.push({
          id: `rec-${material.id}-reduce`,
          materialId: material.id,
          materialName: material.name,
          type: 'reduce',
          priority: 'low',
          description: `Sobrestock detectado: ${material.currentStock} ${material.unit}`,
          expectedImpact: `Reducir costos de almacenamiento`,
          estimatedSavings: (material.currentStock - material.optimalStock) * material.unitCost * 0.1,
          actionRequired: `Usar primero en producción o promocionar`,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // High variability optimization for Class A items
      if (material.abcClass === 'A' && material.usageVariability > 0.3) {
        recommendations.push({
          id: `rec-${material.id}-optimize`,
          materialId: material.id,
          materialName: material.name,
          type: 'optimize',
          priority: 'high',
          description: `Alta variabilidad en uso: ${(material.usageVariability * 100).toFixed(1)}%`,
          expectedImpact: `Optimizar nivel de inventario y reducir riesgo`,
          estimatedSavings: material.annualCost * 0.05,
          actionRequired: `Revisar patrones de demanda y ajustar puntos de reorden`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Calculate analysis summary metrics
  const analysisSummary = useMemo(() => {
    if (!analysisResults) return null;

    const classAValue = analysisResults.classA.reduce((sum, item) => sum + item.annualRevenue, 0);
    const classBValue = analysisResults.classB.reduce((sum, item) => sum + item.annualRevenue, 0);
    const classCValue = analysisResults.classC.reduce((sum, item) => sum + item.annualRevenue, 0);

    return {
      classAPercentage: (classAValue / analysisResults.totalValue) * 100,
      classBPercentage: (classBValue / analysisResults.totalValue) * 100,
      classCPercentage: (classCValue / analysisResults.totalValue) * 100,
      criticalRecommendations: analysisResults.recommendations.filter(r => r.priority === 'critical').length,
      potentialSavings: analysisResults.recommendations.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0)
    };
  }, [analysisResults]);

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="blue" />
          <Text>Cargando datos de inventario...</Text>
          <Text fontSize="sm" color="gray.600">Analizando patrones de consumo y optimizaciones</Text>
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
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                  <Text fontSize="xl" fontWeight="bold">ABC Analysis Engine</Text>
                  <Badge colorPalette="blue" size="sm">Supply Chain Intelligence</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Clasificación automática de inventario y optimización de cadena de suministro
                </Text>
              </VStack>

              <HStack gap="2">
                <Select.Root
                  collection={analysisMethodOptions}
                  value={[config.analysisMethod]}
                  onValueChange={(e) => setConfig(prev => ({ ...prev, analysisMethod: e.value[0] as any }))}
                  width="200px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {analysisMethodOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Button
                  colorPalette="blue"
                  onClick={() => runABCAnalysis()}
                  loading={isAnalyzing}
                  loadingText="Analizando..."
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Ejecutar Análisis
                </Button>
              </HStack>
            </HStack>

            {/* Analysis Summary Cards */}
            {analysisSummary && (
              <SimpleGrid columns={{ base: 2, md: 5 }} gap="4">
                <Card.Root variant="subtle" bg="red.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {analysisResults?.classA.length || 0}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Clase A</Text>
                      <Text fontSize="xs" color="red.600">
                        {analysisSummary.classAPercentage.toFixed(1)}% valor
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="yellow.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                        {analysisResults?.classB.length || 0}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Clase B</Text>
                      <Text fontSize="xs" color="yellow.600">
                        {analysisSummary.classBPercentage.toFixed(1)}% valor
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="green.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {analysisResults?.classC.length || 0}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Clase C</Text>
                      <Text fontSize="xs" color="green.600">
                        {analysisSummary.classCPercentage.toFixed(1)}% valor
                      </Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="purple.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {analysisSummary.criticalRecommendations}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Críticas</Text>
                      <Text fontSize="xs" color="purple.600">acciones</Text>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                <Card.Root variant="subtle" bg="blue.50">
                  <Card.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        ${(analysisSummary.potentialSavings / 1000).toFixed(0)}K
                      </Text>
                      <Text fontSize="sm" color="gray.600">Ahorro Pot.</Text>
                      <Text fontSize="xs" color="blue.600">anual</Text>
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
              <DocumentChartBarIcon className="w-4 h-4" />
              <Text>Overview</Text>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="classA">
            <HStack gap={2}>
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <Text>Clase A</Text>
              <Badge colorPalette="red" size="sm">{analysisResults?.classA.length || 0}</Badge>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="classB">
            <HStack gap={2}>
              <CircleStackIcon className="w-4 h-4" />
              <Text>Clase B</Text>
              <Badge colorPalette="yellow" size="sm">{analysisResults?.classB.length || 0}</Badge>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="classC">
            <HStack gap={2}>
              <ArrowTrendingDownIcon className="w-4 h-4" />
              <Text>Clase C</Text>
              <Badge colorPalette="green" size="sm">{analysisResults?.classC.length || 0}</Badge>
            </HStack>
          </Tabs.Trigger>
          
          <Tabs.Trigger value="recommendations">
            <HStack gap={2}>
              <ExclamationTriangleIcon className="w-4 h-4" />
              <Text>Recomendaciones</Text>
              {analysisSummary?.criticalRecommendations > 0 && (
                <Badge colorPalette="red" size="sm">{analysisSummary.criticalRecommendations}</Badge>
              )}
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <VStack gap="6" align="stretch">
              {!analysisResults ? (
                <Alert.Root status="info">
                  <Alert.Indicator />
                  <Alert.Title>Análisis requerido</Alert.Title>
                  <Alert.Description>
                    Ejecuta el análisis ABC para ver métricas de optimización y clasificación de inventario.
                  </Alert.Description>
                </Alert.Root>
              ) : (
                <>
                  {/* Value Distribution Chart */}
                  <Card.Root>
                    <Card.Header>
                      <Text fontWeight="bold">Distribución de Valor (Principio de Pareto)</Text>
                    </Card.Header>
                    <Card.Body>
                      <VStack gap="4" align="stretch">
                        <HStack gap="4">
                          <Box flex="1">
                            <Text fontSize="sm" color="red.600" mb="2">Clase A - Alto Impacto</Text>
                            <Progress.Root 
                              value={analysisSummary?.classAPercentage} 
                              colorPalette="red"
                              size="lg"
                            >
                              <ProgressTrack>
                                <ProgressRange />
                              </ProgressTrack>
                            </Progress.Root>
                            <Text fontSize="xs" color="gray.600" mt="1">
                              {analysisSummary?.classAPercentage.toFixed(1)}% del valor total
                            </Text>
                          </Box>
                          <Text fontSize="sm" fontWeight="bold" color="red.600">
                            {analysisResults.classA.length} items
                          </Text>
                        </HStack>

                        <HStack gap="4">
                          <Box flex="1">
                            <Text fontSize="sm" color="yellow.600" mb="2">Clase B - Impacto Medio</Text>
                            <Progress.Root 
                              value={analysisSummary?.classBPercentage} 
                              colorPalette="yellow"
                              size="lg"
                            >
                              <ProgressTrack>
                                <ProgressRange />
                              </ProgressTrack>
                            </Progress.Root>
                            <Text fontSize="xs" color="gray.600" mt="1">
                              {analysisSummary?.classBPercentage.toFixed(1)}% del valor total
                            </Text>
                          </Box>
                          <Text fontSize="sm" fontWeight="bold" color="yellow.600">
                            {analysisResults.classB.length} items
                          </Text>
                        </HStack>

                        <HStack gap="4">
                          <Box flex="1">
                            <Text fontSize="sm" color="green.600" mb="2">Clase C - Bajo Impacto</Text>
                            <Progress.Root 
                              value={analysisSummary?.classCPercentage} 
                              colorPalette="green"
                              size="lg"
                            >
                              <ProgressTrack>
                                <ProgressRange />
                              </ProgressTrack>
                            </Progress.Root>
                            <Text fontSize="xs" color="gray.600" mt="1">
                              {analysisSummary?.classCPercentage.toFixed(1)}% del valor total
                            </Text>
                          </Box>
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            {analysisResults.classC.length} items
                          </Text>
                        </HStack>
                      </VStack>
                    </Card.Body>
                  </Card.Root>

                  {/* Critical Issues Alert */}
                  {analysisSummary?.criticalRecommendations > 0 && (
                    <Alert.Root status="error" variant="subtle">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <Alert.Title>Atención: {analysisSummary.criticalRecommendations} situaciones críticas detectadas</Alert.Title>
                      <Alert.Description>
                        Hay items con stock crítico que requieren acción inmediata para evitar interrupciones operativas.
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </>
              )}
            </VStack>
          </Tabs.Content>

          {/* Class A Tab */}
          <Tabs.Content value="classA">
            <MaterialsClassTable 
              materials={analysisResults?.classA || []}
              className="A"
              emptyMessage="No hay materiales Clase A. Ejecuta el análisis para ver resultados."
            />
          </Tabs.Content>

          {/* Class B Tab */}
          <Tabs.Content value="classB">
            <MaterialsClassTable 
              materials={analysisResults?.classB || []}
              className="B"
              emptyMessage="No hay materiales Clase B. Ejecuta el análisis para ver resultados."
            />
          </Tabs.Content>

          {/* Class C Tab */}
          <Tabs.Content value="classC">
            <MaterialsClassTable 
              materials={analysisResults?.classC || []}
              className="C"
              emptyMessage="No hay materiales Clase C. Ejecuta el análisis para ver resultados."
            />
          </Tabs.Content>

          {/* Recommendations Tab */}
          <Tabs.Content value="recommendations">
            <RecommendationsTable 
              recommendations={analysisResults?.recommendations || []}
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

interface MaterialsClassTableProps {
  materials: MaterialWithAnalysis[];
  className: 'A' | 'B' | 'C';
  emptyMessage: string;
}

function MaterialsClassTable({ materials, className, emptyMessage }: MaterialsClassTableProps) {
  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'red';
      case 'low': return 'yellow';
      case 'overstock': return 'purple';
      default: return 'green';
    }
  };

  const getClassColor = (cls: string) => {
    switch (cls) {
      case 'A': return 'red';
      case 'B': return 'yellow';
      default: return 'green';
    }
  };

  if (materials.length === 0) {
    return (
      <Card.Root>
        <Card.Body p="8" textAlign="center">
          <VStack gap="2">
            <CircleStackIcon className="w-8 h-8 text-gray-400" />
            <Text color="gray.500">{emptyMessage}</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <HStack justify="space-between">
          <Text fontWeight="bold">
            Materiales Clase {className} - {materials.length} items
          </Text>
          <Badge colorPalette={getClassColor(className)} size="sm">
            {className === 'A' ? 'Alto Impacto' : className === 'B' ? 'Impacto Medio' : 'Bajo Impacto'}
          </Badge>
        </HStack>
      </Card.Header>
      <Card.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Material</Table.ColumnHeader>
              <Table.ColumnHeader>Stock Actual</Table.ColumnHeader>
              <Table.ColumnHeader>Estado</Table.ColumnHeader>
              <Table.ColumnHeader>Uso Mensual</Table.ColumnHeader>
              <Table.ColumnHeader>Contribución</Table.ColumnHeader>
              <Table.ColumnHeader>Costo Anual</Table.ColumnHeader>
              <Table.ColumnHeader>Acciones</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {materials.slice(0, 15).map((material) => (
              <Table.Row key={material.id}>
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{material.name}</Text>
                    <Text fontSize="xs" color="gray.600">{material.category}</Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="start" gap="1">
                    <Text fontWeight="medium">{material.currentStock} {material.unit}</Text>
                    <Text fontSize="xs" color="gray.600">
                      Óptimo: {material.optimalStock}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getStockStatusColor(material.stockStatus)} size="sm">
                    {material.stockStatus === 'optimal' ? 'Óptimo' :
                     material.stockStatus === 'low' ? 'Bajo' :
                     material.stockStatus === 'critical' ? 'Crítico' : 'Exceso'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text>{material.monthlyUsage.toFixed(1)} {material.unit}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium">{material.revenueContribution.toFixed(1)}%</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text>${material.annualCost.toLocaleString()}</Text>
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
        
        {materials.length > 15 && (
          <Text fontSize="sm" color="gray.600" mt="3" textAlign="center">
            Mostrando 15 de {materials.length} items. Use filtros para ver más.
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}

interface RecommendationsTableProps {
  recommendations: RecommendationItem[];
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
      case 'urgent': return ExclamationTriangleIcon;
      case 'reorder': return CircleStackIcon;
      case 'reduce': return ArrowTrendingDownIcon;
      case 'optimize': return ArrowTrendingUpIcon;
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
              <Table.ColumnHeader>Acción Requerida</Table.ColumnHeader>
              <Table.ColumnHeader>Ahorro Est.</Table.ColumnHeader>
              <Table.ColumnHeader>Fecha Límite</Table.ColumnHeader>
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
                    <Text fontSize="sm">{rec.actionRequired}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {rec.estimatedSavings ? (
                      <Text fontSize="sm" color="green.600" fontWeight="medium">
                        ${rec.estimatedSavings.toLocaleString()}
                      </Text>
                    ) : (
                      <Text fontSize="sm" color="gray.400">--</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text fontSize="sm">
                      {new Date(rec.dueDate).toLocaleDateString()}
                    </Text>
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

export default ABCAnalysisEngine;