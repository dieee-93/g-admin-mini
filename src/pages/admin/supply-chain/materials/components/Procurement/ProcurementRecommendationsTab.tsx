// ============================================================================
// PROCUREMENT RECOMMENDATIONS TAB - Smart Purchase Recommendations
// ============================================================================
// Dashboard inteligente de recomendaciones de compra integrado con alertas

import React, { useState, useMemo, useCallback } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Badge,
  Progress,
  IconButton,
  Tabs
} from '@chakra-ui/react';
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  TruckIcon,
  PhoneIcon,
  EyeIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Design System v2.0
import { 
  ContentLayout, 
  Section, 
  CardWrapper, 
  MetricCard, 
  CardGrid, 
  PageHeader 
} from '@/shared/ui';

// Business Logic
import { ProcurementRecommendationsEngine } from '../../services/procurementRecommendationsEngine';
import { useSmartInventoryAlerts } from '@/hooks/useSmartInventoryAlerts';
import { useMaterials } from '@/hooks/useMaterials';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { 
  ProcurementAnalysisResult, 
  ProcurementRecommendation,
  ProcurementPriority 
} from '../../services/procurementRecommendationsEngine';

interface ProcurementRecommendationsTabProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ProcurementRecommendationsTab: React.FC<ProcurementRecommendationsTabProps> = ({
  autoRefresh = true,
  refreshInterval = 600000 // 10 minutos
}) => {
  
  // Estados locales
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ProcurementAnalysisResult | null>(null);
  const [selectedTab, setSelectedTab] = useState<'urgent' | 'planned' | 'opportunity'>('urgent');
  const [showExecuted, setShowExecuted] = useState(false);

  // Hooks
  const { items: materialItems, loading: materialsLoading } = useMaterials();
  const { 
    materials, 
    activeAlerts, 
    materialsLoading: alertsLoading 
  } = useSmartInventoryAlerts({ autoRefresh: false });

  // Generar análisis de recomendaciones
  const generateRecommendations = useCallback(async () => {
    if (!materials.length || isGenerating) return;
    
    try {
      setIsGenerating(true);
      
      const result = await ProcurementRecommendationsEngine.generateProcurementRecommendations(
        materials,
        activeAlerts,
        {
          minRecommendationValue: 500,
          maxRecommendations: 50,
          confidenceThreshold: 65
        }
      );
      
      setAnalysisResult(result);
      
      // Generar alertas de presupuesto si es necesario
      // TODO: Integrar con sistema de alertas para nuevas alertas
      
    } catch (error) {
      console.error('Error generating procurement recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [materials, activeAlerts, isGenerating]);

  // Auto-generate en mount y cuando cambien los materiales
  React.useEffect(() => {
    if (materials.length > 0 && !analysisResult && !isGenerating) {
      const timeout = setTimeout(generateRecommendations, 1000);
      return () => clearTimeout(timeout);
    }
  }, [materials.length, analysisResult, isGenerating, generateRecommendations]);

  // Auto-refresh
  React.useEffect(() => {
    if (!autoRefresh || !materials.length) return;
    
    const interval = setInterval(generateRecommendations, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, materials.length, refreshInterval, generateRecommendations]);

  // Filtrar recomendaciones según tab seleccionado
  const filteredRecommendations = useMemo(() => {
    if (!analysisResult) return [];
    
    switch (selectedTab) {
      case 'urgent':
        return analysisResult.urgentRecommendations;
      case 'planned':
        return analysisResult.plannedRecommendations;
      case 'opportunity':
        return analysisResult.opportunityRecommendations;
      default:
        return [];
    }
  }, [analysisResult, selectedTab]);

  // Loading state
  if (materialsLoading || alertsLoading) {
    return (
      <ContentLayout spacing="normal">
        <VStack align="center" gap="4">
          <ShoppingCartIcon className="w-12 h-12" />
          <Text>Generando recomendaciones de compra inteligentes...</Text>
          <Progress size="sm" colorPalette="blue" />
        </VStack>
      </ContentLayout>
    );
  }

  // Sin datos state
  if (!analysisResult && !isGenerating) {
    return (
      <ContentLayout spacing="normal">
        <VStack align="center" gap="4">
          <ShoppingCartIcon className="w-16 h-16 text-gray-400" />
          <Text fontSize="lg" fontWeight="semibold">
            Recomendaciones de Compra no disponibles
          </Text>
          <Text color="gray.600" textAlign="center">
            No se pudieron generar recomendaciones. Verifique que existan materiales con datos válidos.
          </Text>
          <Button 
            onClick={generateRecommendations}
            colorPalette="blue"
            loading={isGenerating}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Generar Recomendaciones
          </Button>
        </VStack>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <VStack align="start" gap="6">
        
        {/* Header con métricas generales */}
        <PageHeader
          title="Recomendaciones de Compra Inteligentes"
          subtitle={`${analysisResult?.totalItemsAnalyzed || 0} items analizados • Confianza promedio: ${Math.round(analysisResult?.averageConfidence || 0)}%`}
          icon={<ShoppingCartIcon className="w-6 h-6" />}
          actions={
            <Button
              onClick={generateRecommendations}
              loading={isGenerating}
              size="sm"
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Actualizar
            </Button>
          }
        />

        {/* Métricas overview */}
        {analysisResult && (
          <Section title="Resumen Financiero">
            <CardGrid columns={{ base: 2, md: 4 }} gap="4">
              
              <MetricCard
                title="Inversión Recomendada"
                value={DecimalUtils.formatCurrency(analysisResult.totalRecommendedInvestment)}
                icon={<CurrencyDollarIcon className="w-5 h-5" />}
                trend={analysisResult.totalRecommendedInvestment > 0 ? 'neutral' : 'positive'}
                colorScheme="blue"
              />
              
              <MetricCard
                title="Ahorro Estimado"
                value={DecimalUtils.formatCurrency(analysisResult.estimatedTotalSavings)}
                icon={<CheckCircleIcon className="w-5 h-5" />}
                trend={analysisResult.estimatedTotalSavings > 0 ? 'positive' : 'neutral'}
                colorScheme="green"
                subtitle="Por optimización de inventario"
              />
              
              <MetricCard
                title="Items Urgentes"
                value={analysisResult.urgentRecommendations.length}
                icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                trend={analysisResult.urgentRecommendations.length > 0 ? 'negative' : 'positive'}
                colorScheme={analysisResult.urgentRecommendations.length > 0 ? 'red' : 'green'}
              />
              
              <MetricCard
                title="Oportunidades"
                value={analysisResult.opportunityRecommendations.length}
                icon={<ChartBarIcon className="w-5 h-5" />}
                colorScheme="purple"
                subtitle="Optimizaciones adicionales"
              />
              
            </CardGrid>
          </Section>
        )}

        {/* Distribución por clase ABC */}
        {analysisResult && (
          <Section title="Distribución por Clase ABC" variant="subtle">
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
              {(['A', 'B', 'C'] as const).map((className) => {
                const classMetrics = analysisResult.metricsByClass[className];
                return (
                  <CardWrapper key={className} variant="elevated" p="4">
                    <VStack align="start" gap="3">
                      <HStack justify="space-between" w="full">
                        <Badge
                          colorPalette={
                            className === 'A' ? 'red' : 
                            className === 'B' ? 'yellow' : 'green'
                          }
                          variant="solid"
                          size="lg"
                        >
                          Clase {className}
                        </Badge>
                        <Text fontSize="xl" fontWeight="bold">
                          {classMetrics.itemCount}
                        </Text>
                      </HStack>
                      
                      <VStack align="start" gap="1" w="full">
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Inversión</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {DecimalUtils.formatCurrency(classMetrics.recommendedInvestment)}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Ahorro Est.</Text>
                          <Text fontSize="sm" fontWeight="medium" color="green.600">
                            {DecimalUtils.formatCurrency(classMetrics.estimatedSavings)}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between" w="full">
                          <Text fontSize="sm">Prioridad Prom.</Text>
                          <Badge
                            colorPalette={
                              classMetrics.averagePriority >= 4 ? 'red' :
                              classMetrics.averagePriority >= 3 ? 'orange' : 'blue'
                            }
                            variant="subtle"
                            size="sm"
                          >
                            {classMetrics.averagePriority.toFixed(1)}
                          </Badge>
                        </HStack>
                      </VStack>
                    </VStack>
                  </CardWrapper>
                );
              })}
            </SimpleGrid>
          </Section>
        )}

        {/* Tabs de recomendaciones */}
        <Section title="Recomendaciones Detalladas">
          
          {/* Tab selector */}
          <HStack gap="4" mb="6">
            <Button
              variant={selectedTab === 'urgent' ? 'solid' : 'outline'}
              colorPalette="red"
              size="sm"
              onClick={() => setSelectedTab('urgent')}
              leftIcon={<ExclamationTriangleIcon className="w-4 h-4" />}
            >
              Urgentes ({analysisResult?.urgentRecommendations.length || 0})
            </Button>
            <Button
              variant={selectedTab === 'planned' ? 'solid' : 'outline'}
              colorPalette="blue"
              size="sm"
              onClick={() => setSelectedTab('planned')}
              leftIcon={<ClockIcon className="w-4 h-4" />}
            >
              Planificadas ({analysisResult?.plannedRecommendations.length || 0})
            </Button>
            <Button
              variant={selectedTab === 'opportunity' ? 'solid' : 'outline'}
              colorPalette="purple"
              size="sm"
              onClick={() => setSelectedTab('opportunity')}
              leftIcon={<ChartBarIcon className="w-4 h-4" />}
            >
              Oportunidades ({analysisResult?.opportunityRecommendations.length || 0})
            </Button>
          </HStack>

          {/* Lista de recomendaciones */}
          {filteredRecommendations.length === 0 ? (
            <CardWrapper variant="elevated" p="8">
              <VStack align="center" gap="4">
                <CheckCircleIcon className="w-16 h-16 text-green-500" />
                <Text fontSize="lg" fontWeight="semibold">
                  No hay recomendaciones en esta categoría
                </Text>
                <Text color="gray.600" textAlign="center">
                  {selectedTab === 'urgent' && 'No se detectaron necesidades urgentes de restock'}
                  {selectedTab === 'planned' && 'No hay recomendaciones planificadas en este momento'}
                  {selectedTab === 'opportunity' && 'No se identificaron oportunidades de optimización'}
                </Text>
              </VStack>
            </CardWrapper>
          ) : (
            <VStack gap="4" align="stretch">
              {filteredRecommendations.map((recommendation) => (
                <ProcurementRecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </VStack>
          )}
          
        </Section>

      </VStack>
    </ContentLayout>
  );
};

// ============================================================================
// RECOMMENDATION CARD COMPONENT
// ============================================================================

interface ProcurementRecommendationCardProps {
  recommendation: ProcurementRecommendation;
}

const ProcurementRecommendationCard: React.FC<ProcurementRecommendationCardProps> = ({
  recommendation
}) => {
  
  const getPriorityColor = (priority: ProcurementPriority) => {
    if (priority >= 5) return 'red';
    if (priority >= 4) return 'orange';
    if (priority >= 3) return 'yellow';
    return 'blue';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'urgent_restock': return 'Restock Urgente';
      case 'planned_restock': return 'Restock Planificado';
      case 'just_in_time': return 'Just in Time';
      case 'bulk_purchase': return 'Compra en Lote';
      case 'seasonal_stock': return 'Stock Estacional';
      case 'price_optimization': return 'Oportunidad de Precio';
      default: return type;
    }
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'immediate': return 'Inmediato';
      case 'within_24h': return 'En 24h';
      case 'within_week': return 'Esta semana';
      case 'next_order': return 'Próximo pedido';
      case 'monitor': return 'Monitorear';
      default: return strategy;
    }
  };

  return (
    <CardWrapper variant="elevated" p="6">
      <VStack align="start" gap="4">
        
        {/* Header con badges */}
        <HStack justify="space-between" w="full" wrap="wrap">
          <HStack gap="3">
            <Badge
              colorPalette={
                recommendation.abcClass === 'A' ? 'red' : 
                recommendation.abcClass === 'B' ? 'yellow' : 'green'
              }
              variant="solid"
            >
              Clase {recommendation.abcClass}
            </Badge>
            
            <Badge
              colorPalette={getPriorityColor(recommendation.priority)}
              variant="subtle"
            >
              Prioridad {recommendation.priority}
            </Badge>
            
            <Badge variant="outline">
              {getTypeLabel(recommendation.type)}
            </Badge>
          </HStack>
          
          <HStack gap="2">
            <Text fontSize="sm" color="gray.600">
              Confianza: {recommendation.confidence}%
            </Text>
            <Badge colorPalette="blue" variant="subtle">
              {getStrategyLabel(recommendation.strategy)}
            </Badge>
          </HStack>
        </HStack>

        {/* Información principal */}
        <VStack align="start" gap="3" w="full">
          <Text fontSize="lg" fontWeight="semibold">
            {recommendation.itemName}
          </Text>
          
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="6" w="full">
            
            <VStack align="start" gap="1">
              <Text fontSize="sm" color="gray.600">Stock Actual</Text>
              <Text fontWeight="medium">
                {DecimalUtils.formatQuantity(recommendation.currentStock, recommendation.unit)}
              </Text>
            </VStack>
            
            <VStack align="start" gap="1">
              <Text fontSize="sm" color="gray.600">Cantidad Recomendada</Text>
              <Text fontWeight="medium" color="blue.600">
                {DecimalUtils.formatQuantity(recommendation.recommendedQuantity, recommendation.unit)}
              </Text>
            </VStack>
            
            <VStack align="start" gap="1">
              <Text fontSize="sm" color="gray.600">Valor Estimado</Text>
              <Text fontWeight="medium">
                {DecimalUtils.formatCurrency(recommendation.recommendedValue)}
              </Text>
            </VStack>
            
            <VStack align="start" gap="1">
              <Text fontSize="sm" color="gray.600">Ahorro Estimado</Text>
              <Text fontWeight="medium" color="green.600">
                {DecimalUtils.formatCurrency(recommendation.estimatedCostSavings)}
              </Text>
            </VStack>
            
          </SimpleGrid>
          
          {/* Riesgo de stock-out */}
          {recommendation.stockoutRisk > 20 && (
            <HStack gap="2">
              <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
              <Text fontSize="sm" color="orange.600">
                Riesgo de stock-out: {recommendation.stockoutRisk}%
              </Text>
            </HStack>
          )}
          
          {/* Reasoning */}
          <Text fontSize="sm" color="gray.700">
            {recommendation.reasoning}
          </Text>
        </VStack>

        {/* Acciones */}
        <HStack gap="2" wrap="wrap">
          {recommendation.actions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant={action.type === 'create_order' ? 'solid' : 'outline'}
              colorPalette={action.type === 'create_order' ? 'blue' : 'gray'}
              leftIcon={getActionIcon(action.type)}
              onClick={() => {
                // TODO: Implementar acciones reales
                console.log('Executing action:', action);
              }}
            >
              {action.label}
            </Button>
          ))}
        </HStack>
        
      </VStack>
    </CardWrapper>
  );
};

// Helper para iconos de acciones
function getActionIcon(actionType: string) {
  switch (actionType) {
    case 'create_order': return <ShoppingCartIcon className="w-4 h-4" />;
    case 'contact_supplier': return <PhoneIcon className="w-4 h-4" />;
    case 'request_quote': return <DocumentTextIcon className="w-4 h-4" />;
    case 'schedule_delivery': return <TruckIcon className="w-4 h-4" />;
    case 'view_details': return <EyeIcon className="w-4 h-4" />;
    default: return null;
  }
}

export default ProcurementRecommendationsTab;