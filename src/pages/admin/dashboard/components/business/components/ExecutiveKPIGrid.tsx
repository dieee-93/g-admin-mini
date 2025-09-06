// ExecutiveKPIGrid.tsx - KPI display grid with performance indicators
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
  Progress
} from '@chakra-ui/react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface ExecutiveKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
  target?: number;
  category: 'financial' | 'operational' | 'customer' | 'strategic';
  trend: 'up' | 'down' | 'stable';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  lastUpdated: string;
}

interface ExecutiveKPIGridProps {
  kpis: ExecutiveKPI[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const KPI_CATEGORY_COLLECTION = createListCollection({
  items: [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Financiero', value: 'financial' },
    { label: 'Operacional', value: 'operational' },
    { label: 'Cliente', value: 'customer' },
    { label: 'Estratégico', value: 'strategic' }
  ]
});

export function ExecutiveKPIGrid({
  kpis,
  selectedCategory,
  onCategoryChange
}: ExecutiveKPIGridProps) {
  // Filtered KPIs
  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return kpis;
    return kpis.filter(kpi => kpi.category === selectedCategory);
  }, [kpis, selectedCategory]);

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

  return (
    <VStack gap={4} align="stretch">
      {/* Filters */}
      <HStack gap={4} flexWrap="wrap">
        <Select.Root
          collection={KPI_CATEGORY_COLLECTION}
          value={[selectedCategory]}
          onValueChange={(details) => onCategoryChange(details.value[0])}
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
                      <Progress 
                        value={Math.min(progressValue, 100)} 
                        colorPalette={progressValue >= 100 ? 'green' : progressValue >= 80 ? 'yellow' : 'red'}
                        size="sm"
                      />
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
  );
}

export default ExecutiveKPIGrid;