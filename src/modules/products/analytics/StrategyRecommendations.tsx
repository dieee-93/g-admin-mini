import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Progress,
  Separator,
  Box
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  MenuCategory,
  StrategyPriority,
  RiskLevel,
  type StrategyRecommendation
} from '../types/menuEngineering';
import {
  getCategoryIcon,
  getCategoryDisplayName,
  getCategoryColor
} from '../logic/menuEngineeringCalculations';

interface StrategyRecommendationsProps {
  recommendations: StrategyRecommendation[];
  onImplementStrategy?: (recommendation: StrategyRecommendation) => void;
  priorityFilter?: StrategyPriority[];
  categoryFilter?: MenuCategory[];
}

interface RecommendationCardProps {
  recommendation: StrategyRecommendation;
  onImplement: (recommendation: StrategyRecommendation) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onImplement
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = () => setIsOpen(!isOpen);

  const getPriorityColor = (priority: StrategyPriority): string => {
    switch (priority) {
      case StrategyPriority.IMMEDIATE: return 'red';
      case StrategyPriority.SHORT_TERM: return 'orange';
      case StrategyPriority.LONG_TERM: return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityLabel = (priority: StrategyPriority): string => {
    switch (priority) {
      case StrategyPriority.IMMEDIATE: return 'Inmediato';
      case StrategyPriority.SHORT_TERM: return 'Corto Plazo';
      case StrategyPriority.LONG_TERM: return 'Largo Plazo';
      default: return 'Sin Prioridad';
    }
  };

  const getRiskColor = (risk: RiskLevel): string => {
    switch (risk) {
      case RiskLevel.LOW: return 'green';
      case RiskLevel.MEDIUM: return 'yellow';
      case RiskLevel.HIGH: return 'red';
      default: return 'gray';
    }
  };

  const getRiskLabel = (risk: RiskLevel): string => {
    switch (risk) {
      case RiskLevel.LOW: return 'Bajo';
      case RiskLevel.MEDIUM: return 'Medio';
      case RiskLevel.HIGH: return 'Alto';
      default: return 'Sin Evaluar';
    }
  };

  const renderStrategyDetails = () => {
    const { starsStrategy, plowhorsesStrategy, puzzlesStrategy, dogsStrategy } = recommendation;
    
    if (starsStrategy) {
      return (
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Aumento de ingresos esperado:</Text>
            <Badge colorScheme="green">+{starsStrategy.expectedRevenueLift}%</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Costo de implementación:</Text>
            <Text fontSize="sm">${starsStrategy.implementationCost.toLocaleString()}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Tiempo estimado:</Text>
            <Text fontSize="sm">{starsStrategy.timeframe}</Text>
          </HStack>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Métricas de éxito:</Text>
            <VStack align="start" gap={1}>
              {starsStrategy.successMetrics.map((metric, index) => (
                <HStack key={index}>
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <Text fontSize="xs">{metric}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </VStack>
      );
    }

    if (plowhorsesStrategy) {
      return (
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Mejora de margen esperada:</Text>
            <Badge colorScheme="blue">+{plowhorsesStrategy.expectedMarginImprovement}%</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Riesgo para cliente:</Text>
            <Badge colorScheme={getRiskColor(plowhorsesStrategy.customerImpactRisk)}>
              {getRiskLabel(plowhorsesStrategy.customerImpactRisk)}
            </Badge>
          </HStack>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Plan de pruebas:</Text>
            <Text fontSize="xs" color="gray.600">{plowhorsesStrategy.testingPlan}</Text>
          </Box>
        </VStack>
      );
    }

    if (puzzlesStrategy) {
      return (
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Aumento de popularidad esperado:</Text>
            <Badge colorScheme="orange">+{puzzlesStrategy.expectedPopularityIncrease}%</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Presupuesto de marketing:</Text>
            <Text fontSize="sm">${puzzlesStrategy.marketingBudget.toLocaleString()}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Probabilidad de éxito:</Text>
            <HStack>
              <Progress 
                value={puzzlesStrategy.successProbability * 100} 
                size="sm" 
                w="100px" 
                colorScheme="orange"
              />
              <Text fontSize="xs">{(puzzlesStrategy.successProbability * 100).toFixed(0)}%</Text>
            </HStack>
          </HStack>
        </VStack>
      );
    }

    if (dogsStrategy) {
      return (
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Ahorro esperado:</Text>
            <Badge colorScheme="red">${dogsStrategy.expectedCostSavings.toLocaleString()}/mes</Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Riesgo de quejas:</Text>
            <Badge colorScheme={getRiskColor(dogsStrategy.customerComplaintRisk)}>
              {getRiskLabel(dogsStrategy.customerComplaintRisk)}
            </Badge>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="medium">Cronograma de eliminación:</Text>
            <Text fontSize="sm">{dogsStrategy.removalTimeline}</Text>
          </HStack>
        </VStack>
      );
    }

    return null;
  };

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="md" 
      borderLeftWidth="4px" 
      borderLeftColor={getCategoryColor(recommendation.category)}
      bg="white"
    >
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <HStack>
              <Text fontSize="lg">{getCategoryIcon(recommendation.category)}</Text>
              <Badge colorScheme={getPriorityColor(recommendation.priority)} variant="outline">
                {getPriorityLabel(recommendation.priority)}
              </Badge>
            </HStack>
            <Badge colorScheme={getRiskColor(recommendation.riskAssessment)}>
              {getRiskLabel(recommendation.riskAssessment)}
            </Badge>
          </HStack>
          
          <Text fontWeight="semibold" fontSize="md">
            {recommendation.action}
          </Text>
          
          <Text fontSize="sm" color="gray.600">
            {getCategoryDisplayName(recommendation.category)}
          </Text>
        </VStack>
        <VStack align="stretch" gap={3}>
          <Text fontSize="sm">
            {recommendation.description}
          </Text>

          <Box p={3} bg="blue.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="blue.400">
            <Text fontSize="xs" color="blue.700">{recommendation.expectedImpact}</Text>
          </Box>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            rightIcon={isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          >
            {isOpen ? 'Ocultar detalles' : 'Ver detalles'}
          </Button>

          {isOpen && (
            <VStack align="stretch" gap={4}>
              <Separator />
              
              {renderStrategyDetails()}
              
              <Separator />
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Plan de implementación:</Text>
                <Text fontSize="xs" color="gray.600">
                  {recommendation.implementationPlan}
                </Text>
              </Box>
              
              <HStack gap={2} pt={2}>
                <Button 
                  colorScheme="brand" 
                  size="sm"
                  onClick={() => onImplement(recommendation)}
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Implementar
                </Button>
                <Button variant="outline" size="sm">
                  Más tarde
                </Button>
              </HStack>
            </VStack>
          )}
        </VStack>
    </Box>
  );
};

const EmptyState: React.FC = () => (
  <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
    <VStack gap={4} py={8}>
      <LightBulbIcon className="w-12 h-12 text-gray-400" />
      <Text textAlign="center" color="gray.500">
        No hay recomendaciones disponibles
      </Text>
      <Text textAlign="center" fontSize="sm" color="gray.400">
        Las recomendaciones aparecerán una vez que tengas datos de ventas suficientes.
      </Text>
    </VStack>
  </Box>
);

export const StrategyRecommendations: React.FC<StrategyRecommendationsProps> = ({
  recommendations,
  onImplementStrategy,
  priorityFilter,
  categoryFilter
}) => {
  const [expandedAll, setExpandedAll] = useState(false);

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (priorityFilter && priorityFilter.length > 0 && !priorityFilter.includes(rec.priority)) {
      return false;
    }
    if (categoryFilter && categoryFilter.length > 0 && !categoryFilter.includes(rec.category)) {
      return false;
    }
    return true;
  });

  // Group by priority
  const groupedRecommendations = filteredRecommendations.reduce((groups, rec) => {
    const priority = rec.priority;
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(rec);
    return groups;
  }, {} as Record<StrategyPriority, StrategyRecommendation[]>);

  const handleImplementStrategy = (recommendation: StrategyRecommendation) => {
    onImplementStrategy?.(recommendation);
  };

  if (filteredRecommendations.length === 0) {
    return <EmptyState />;
  }

  return (
    <VStack align="stretch" gap={4}>
      <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
        <HStack justify="space-between">
          <HStack>
            <LightBulbIcon className="w-5 h-5 text-orange-500" />
            <Text fontWeight="semibold">Recomendaciones Estratégicas</Text>
          </HStack>
          <Badge colorScheme="orange" variant="outline">
            {filteredRecommendations.length}
          </Badge>
        </HStack>
      </Box>

      {/* Priority Groups */}
      {Object.entries(groupedRecommendations).map(([priority, recs]) => (
        <VStack key={priority} align="stretch" gap={3}>
          <HStack>
            <ClockIcon className="w-4 h-4" />
            <Text fontSize="sm" fontWeight="semibold" textTransform="capitalize">
              {priority === 'immediate' ? 'Inmediato' : 
               priority === 'short_term' ? 'Corto Plazo' : 'Largo Plazo'}
            </Text>
            <Badge size="sm" colorScheme="gray">
              {recs.length}
            </Badge>
          </HStack>
          
          <VStack align="stretch" gap={3}>
            {recs.map((rec, index) => (
              <RecommendationCard
                key={`${rec.productId}-${index}`}
                recommendation={rec}
                onImplement={handleImplementStrategy}
              />
            ))}
          </VStack>
          
          {Object.keys(groupedRecommendations).indexOf(priority) < Object.keys(groupedRecommendations).length - 1 && (
            <Separator />
          )}
        </VStack>
      ))}

      {/* Summary Alert */}
      <Box p={4} bg="blue.50" borderRadius="md" borderLeftWidth="4px" borderLeftColor="blue.400">
        <VStack align="start" gap={1} flex={1}>
          <Text fontSize="sm" fontWeight="medium" color="blue.800">
            Oportunidades de optimización identificadas
          </Text>
          <Text fontSize="xs" color="blue.600">
            Implementar estas recomendaciones puede incrementar la rentabilidad del menú en 10-15%.
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};