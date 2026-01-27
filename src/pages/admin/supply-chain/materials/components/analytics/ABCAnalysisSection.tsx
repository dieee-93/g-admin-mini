// ABCAnalysisSection.tsx - Advanced ABC Analysis for Materials Inventory Management v2.0
// Integrado con business logic centralizada y decimal.js para máxima precisión

import React, { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';

// Design System v2.0 - ALWAYS use @/shared/ui wrappers
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  SimpleGrid, 
  Badge, 
  Button,
  Table,
  Progress,
  CardWrapper, 
  ContentLayout, 
  PageHeader, 
  Section 
} from '@/shared/ui';

// Business Logic Imports
import { ABCAnalysisEngine } from '../../services/abcAnalysisEngine';
import { useMaterials } from '@/modules/materials/hooks';
import type { 
  ABCCategory, 
  MaterialABC, 
  ABCAnalysisResult, 
  AnalysisType,
  ABCAnalysisConfig 
} from '../../types/abc-analysis';
import { DecimalUtils } from '@/lib/decimal';

import { logger } from '@/lib/logging';
const ABCAnalysisSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('revenue');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks para datos reales
  const { data: materialItems = [], isLoading: materialsLoading } = useMaterials();
  
  // Configuración del análisis
  const analysisConfig: Partial<ABCAnalysisConfig> = useMemo(() => ({
    primaryCriteria: analysisType,
    classAThreshold: 80,
    classBThreshold: 15,
    includeInactive: false,
    minValue: 100 // Solo incluir items con valor mínimo $100
  }), [analysisType]);

  // Ejecutar análisis ABC cuando cambien los datos o configuración
  const analysisResult: ABCAnalysisResult | null = useMemo(() => {
    if (!materialItems || materialItems.length === 0) return null;
    
    try {
      setIsLoading(true);
      const result = ABCAnalysisEngine.analyzeInventory(materialItems, analysisConfig);
      setIsLoading(false);
      return result;
    } catch (error) {
      logger.error('MaterialsStore', 'Error en análisis ABC:', error);
      setIsLoading(false);
      return null;
    }
  }, [materialItems, analysisConfig]);

  // Generar categorías para overview cards
  const categoryData: ABCCategory[] = useMemo(() => {
    if (!analysisResult) return [];
    return ABCAnalysisEngine.generateCategoryOverview(analysisResult);
  }, [analysisResult]);

  // Filtrar materiales por categoría seleccionada
  const filteredMaterials: MaterialABC[] = useMemo(() => {
    if (!analysisResult) return [];
    
    if (selectedCategory === 'all') {
      return [...analysisResult.classA, ...analysisResult.classB, ...analysisResult.classC];
    }
    
    switch (selectedCategory) {
      case 'A': return analysisResult.classA;
      case 'B': return analysisResult.classB;
      case 'C': return analysisResult.classC;
      default: return [];
    }
  }, [analysisResult, selectedCategory]);

  // Loading state
  if (materialsLoading || isLoading) {
    return (
      <ContentLayout spacing="normal">
        <VStack align="center" gap="4">
          <ChartBarSquareIcon className="w-12 h-12" />
          <Text>Analizando inventario con algoritmo ABC...</Text>
          <Progress size="sm" colorPalette="blue" />
        </VStack>
      </ContentLayout>
    );
  }

  // Error state
  if (!analysisResult) {
    return (
      <ContentLayout spacing="normal">
        <VStack align="center" gap="4">
          <ExclamationTriangleIcon className="w-12 h-12" />
          <Text>No se pudo realizar el análisis ABC</Text>
          <Text fontSize="sm" color="gray.500">
            Verifique que existan materiales con datos válidos (valor mínimo $100)
          </Text>
        </VStack>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <VStack align="start" gap="6" data-testid="abc-analysis-section">
        
        {/* Header con métricas generales */}
        <PageHeader
          title="ABC Analysis - Supply Chain Intelligence"
          subtitle={`${analysisResult.totalItemsAnalyzed} items analizados • Valor total: ${DecimalUtils.formatCurrency(analysisResult.totalValue)}`}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />
        <Box display="none" data-testid="total-inventory-value">{DecimalUtils.formatCurrency(analysisResult.totalValue)}</Box>

        {/* Selector de criterio de análisis */}
        <Section title="Configuración de Análisis">
          <HStack gap="4" wrap="wrap">
            <Text fontSize="sm" fontWeight="medium">Criterio de análisis:</Text>
            {(['revenue', 'quantity', 'frequency', 'cost'] as const).map((type) => (
              <Button
                key={type}
                size="sm"
                variant={analysisType === type ? 'solid' : 'outline'}
                colorPalette="blue"
                onClick={() => setAnalysisType(type)}
              >
                {getAnalysisTypeLabel(type)}
              </Button>
            ))}
          </HStack>
        </Section>

        {/* ABC Categories Overview Cards */}
        <Section title="Resumen por Categorías ABC" data-testid="abc-chart">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
            {categoryData.map((category) => (
              <CardWrapper key={category.category} variant="elevated" data-testid={`category-${category.category}`}>
                <VStack align="start" gap="4">
                  
                  {/* Header con badge y número */}
                  <HStack justify="space-between" w="full">
                    <Badge 
                      size="lg" 
                      colorPalette={category.color}
                      variant="solid"
                    >
                      Clase {category.category}
                    </Badge>
                    <Text fontSize="2xl" fontWeight="bold" data-testid="category-count">
                      {category.items}
                    </Text>
                  </HStack>
                  
                  {/* Título y descripción */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold">{category.title}</Text>
                    <Text fontSize="sm" color="gray.600">{category.description}</Text>
                  </Box>

                  {/* Métricas de valor */}
                  <VStack align="start" gap="2" w="full">
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm">Facturación Anual</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {DecimalUtils.formatCurrency(category.revenue)}
                      </Text>
                    </HStack>
                    
                    <Progress.Root value={category.percentage} size="sm" w="full">
                      <Progress.Track>
                        <Progress.Range bg={`${category.color}.500`} />
                      </Progress.Track>
                    </Progress.Root>
                    
                    <Text fontSize="xs" color="gray.500">
                      {DecimalUtils.formatPercentage(category.percentage)} del total
                    </Text>
                  </VStack>

                  {/* Estrategia recomendada */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb="1">Estrategia:</Text>
                    <Text fontSize="xs" color="gray.600">{category.strategy}</Text>
                  </Box>
                  
                </VStack>
              </CardWrapper>
            ))}
          </SimpleGrid>
        </Section>

        {/* Tabla detallada de materiales */}
        <Section title="Detalle por Material">
          
          {/* Filtros por categoría */}
          <HStack justify="space-between" mb="4">
            <Heading size="md">
              Materiales Clasificados ({filteredMaterials.length})
            </Heading>
            <HStack gap="2">
              <Button
                size="sm"
                variant={selectedCategory === 'all' ? 'solid' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                data-testid="clear-abc-filter"
              >
                Todos
              </Button>
              {(['A', 'B', 'C'] as const).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'solid' : 'outline'}
                  colorPalette={cat === 'A' ? 'red' : cat === 'B' ? 'yellow' : 'green'}
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`category-${cat}`}
                >
                  Clase {cat}
                </Button>
              ))}
            </HStack>
          </HStack>

          {/* Tabla de materiales */}
          <Box data-testid="materials-grid">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Material</Table.ColumnHeader>
                  <Table.ColumnHeader>Clase ABC</Table.ColumnHeader>
                  <Table.ColumnHeader>Stock Actual</Table.ColumnHeader>
                  <Table.ColumnHeader>Costo Unitario</Table.ColumnHeader>
                  <Table.ColumnHeader>Consumo Anual</Table.ColumnHeader>
                  <Table.ColumnHeader>Valor Anual</Table.ColumnHeader>
                  <Table.ColumnHeader>% Facturación</Table.ColumnHeader>
                  <Table.ColumnHeader>% Acumulado</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredMaterials.map((material) => (
                  <Table.Row key={material.id}>
                    <Table.Cell>
                      <VStack align="start" gap="1">
                        <Text fontWeight="medium">{material.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {material.category}
                        </Text>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        colorPalette={
                          material.abcClass === 'A' ? 'red' : 
                          material.abcClass === 'B' ? 'yellow' : 'green'
                        }
                        variant="subtle"
                      >
                        Clase {material.abcClass}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {DecimalUtils.formatQuantity(
                        material.currentStock, 
                        getDisplayUnit(material)
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {DecimalUtils.formatCurrency(material.unit_cost || 0)}
                    </Table.Cell>
                    <Table.Cell>
                      {DecimalUtils.formatQuantity(
                        material.annualConsumption, 
                        getDisplayUnit(material)
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {DecimalUtils.formatCurrency(material.annualValue)}
                    </Table.Cell>
                    <Table.Cell>
                      {material.revenuePercentage}%
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontWeight="medium">
                        {material.cumulativeRevenue}%
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>

        </Section>

        {/* Recomendaciones inteligentes */}
        {analysisResult.recommendations.length > 0 && (
          <Section title="Recomendaciones Estratégicas" variant="elevated">
            <VStack align="start" gap="4">
              {analysisResult.recommendations.slice(0, 3).map((rec) => (
                <Box key={rec.id} p="4" bg="blue.50" borderRadius="md" w="full">
                  <VStack align="start" gap="2">
                    <HStack justify="space-between" w="full">
                      <Badge 
                        colorPalette={rec.priority === 'high' ? 'red' : 'blue'}
                        variant="subtle"
                      >
                        {rec.priority === 'high' ? 'Alta Prioridad' : 'Media Prioridad'}
                      </Badge>
                      {rec.potentialSavings && (
                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                          Ahorro potencial: {DecimalUtils.formatCurrency(rec.potentialSavings)}
                        </Text>
                      )}
                    </HStack>
                    <Text fontWeight="semibold">{rec.title}</Text>
                    <Text fontSize="sm" color="gray.700">{rec.description}</Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Section>
        )}

        {/* Action Buttons */}
        <HStack gap="4">
          <Button colorPalette="blue" leftIcon={<DocumentChartBarIcon className="w-4 h-4" />}>
            Generar Reporte ABC
          </Button>
          <Button variant="outline" leftIcon={<ArrowTrendingUpIcon className="w-4 h-4" />}>
            Configurar Umbrales
          </Button>
          <Button variant="outline" leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
            Aplicar Estrategias
          </Button>
        </HStack>
        
      </VStack>
    </ContentLayout>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getAnalysisTypeLabel(type: AnalysisType): string {
  switch (type) {
    case 'revenue': return 'Por Facturación';
    case 'quantity': return 'Por Cantidad';
    case 'frequency': return 'Por Frecuencia';
    case 'cost': return 'Por Costo';
    default: return type;
  }
}

function getDisplayUnit(material: MaterialABC): string {
  // Función helper para obtener la unidad de display
  if ('unit' in material) {
    return material.unit as string;
  }
  return 'unidad';
}

export default ABCAnalysisSection;