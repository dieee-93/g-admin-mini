// CorrelationsView.tsx - Focused correlations analysis component
import { useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  CardWrapper ,
  Badge,
  SimpleGrid,
  Select,
  createListCollection,
  NumberInput
} from '@chakra-ui/react';
import {
  ArrowsRightLeftIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

// Import shared types
interface ModuleMetric {
  moduleId: string;
  moduleName: string;
  metricId: string;
  metricName: string;
  value: number;
  unit: string;
  category: 'financial' | 'operational' | 'customer' | 'inventory' | 'staff';
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface CrossModuleCorrelation {
  id: string;
  metric1: ModuleMetric;
  metric2: ModuleMetric;
  correlationCoefficient: number;
  correlationStrength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';
  correlationType: 'positive' | 'negative';
  significance: number;
  businessInsight: string;
  actionableRecommendation?: string;
  impactScore: number;
}

interface CrossModuleAnalyticsConfig {
  correlationThreshold: number;
  significanceLevel: number;
}

interface CorrelationsViewProps {
  correlations: CrossModuleCorrelation[];
  config: CrossModuleAnalyticsConfig;
  selectedModule: string;
  onConfigChange: (config: CrossModuleAnalyticsConfig) => void;
  onModuleChange: (module: string) => void;
}

const MODULE_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los módulos', value: 'all' },
    { label: 'Ventas', value: 'sales' },
    { label: 'Operaciones', value: 'operations' },
    { label: 'Materiales', value: 'materials' },
    { label: 'Clientes', value: 'customers' },
    { label: 'Personal', value: 'staff' },
    { label: 'Planificación', value: 'scheduling' }
  ]
});

export function CorrelationsView({
  correlations,
  config,
  selectedModule,
  onConfigChange,
  onModuleChange
}: CorrelationsViewProps) {
  // Filtered correlations
  const filteredCorrelations = useMemo(() => {
    let filtered = correlations.filter(corr => 
      Math.abs(corr.correlationCoefficient) >= config.correlationThreshold &&
      corr.significance >= config.significanceLevel
    );
    
    if (selectedModule !== 'all') {
      filtered = filtered.filter(corr => 
        corr.metric1.moduleId === selectedModule || 
        corr.metric2.moduleId === selectedModule
      );
    }
    
    return filtered.sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient));
  }, [correlations, config.correlationThreshold, config.significanceLevel, selectedModule]);

  const getCorrelationColor = (strength: string) => {
    switch (strength) {
      case 'very_strong': return 'purple';
      case 'strong': return 'blue';
      case 'moderate': return 'green';
      case 'weak': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <VStack gap={4} align="stretch">
      {/* Filters */}
      <HStack gap={4} flexWrap="wrap">
        <Select.Root
          collection={MODULE_COLLECTION}
          value={[selectedModule]}
          onValueChange={(details) => onModuleChange(details.value[0])}
          width="200px"
        >
          <Select.Trigger>
            <Select.ValueText placeholder="Módulo" />
          </Select.Trigger>
          <Select.Content>
            {MODULE_COLLECTION.items.map(item => (
              <Select.Item key={item.value} item={item}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        
        <HStack gap={2} align="center">
          <Text fontSize="sm" color="gray.600">Correlación mínima:</Text>
          <NumberInput.Root
            value={config.correlationThreshold.toString()}
            onValueChange={(details) => onConfigChange({
              ...config, 
              correlationThreshold: parseFloat(details.value) || 0.5
            })}
            min={0}
            max={1}
            step={0.1}
            width="80px"
            size="sm"
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </HStack>
      </HStack>

      {/* Correlations Grid */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {filteredCorrelations.map((correlation) => (
          <CardWrapper .Root key={correlation.id} variant="outline">
            <CardWrapper .Body p={4}>
              <VStack gap={3} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                  <HStack gap={2}>
                    <Badge colorPalette="blue" size="sm">
                      {correlation.metric1.moduleName}
                    </Badge>
                    <ArrowsRightLeftIcon className="w-4 h-4 text-gray-400" />
                    <Badge colorPalette="purple" size="sm">
                      {correlation.metric2.moduleName}
                    </Badge>
                  </HStack>
                  <Badge colorPalette={getCorrelationColor(correlation.correlationStrength)}>
                    {correlation.correlationStrength}
                  </Badge>
                </HStack>

                {/* Metrics */}
                <VStack gap={2} align="stretch">
                  <Text fontSize="sm" fontWeight="medium">
                    {correlation.metric1.metricName} ↔ {correlation.metric2.metricName}
                  </Text>
                  
                  <HStack justify="space-between" bg="bg.canvas" p={2} borderRadius="sm" fontSize="sm">
                    <VStack align="start" gap={0}>
                      <Text color="gray.600">Coeficiente:</Text>
                      <Text fontWeight="bold" color={correlation.correlationType === 'positive' ? 'green.600' : 'red.600'}>
                        {correlation.correlationCoefficient.toFixed(3)}
                      </Text>
                    </VStack>
                    <VStack align="center" gap={0}>
                      <Text color="gray.600">Significancia:</Text>
                      <Text fontWeight="bold">{Math.round(correlation.significance)}%</Text>
                    </VStack>
                    <VStack align="end" gap={0}>
                      <Text color="gray.600">Impacto:</Text>
                      <Text fontWeight="bold" color="blue.600">{correlation.impactScore}/100</Text>
                    </VStack>
                  </HStack>
                </VStack>

                {/* Business Insight */}
                <VStack gap={2} align="stretch">
                  <Text fontSize="sm" color="gray.700">
                    {correlation.businessInsight}
                  </Text>
                  {correlation.actionableRecommendation && (
                    <CardWrapper .Root variant="subtle" size="sm">
                      <CardWrapper .Body p={2}>
                        <HStack gap={2}>
                          <LightBulbIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <Text fontSize="xs" color="blue.700">
                            {correlation.actionableRecommendation}
                          </Text>
                        </HStack>
                      </CardWrapper .Body>
                    </CardWrapper .Root>
                  )}
                </VStack>
              </VStack>
            </CardWrapper .Body>
          </CardWrapper .Root>
        ))}
      </SimpleGrid>
    </VStack>
  );
}

export default CorrelationsView;