import { SimpleGrid, VStack, HStack, Text, Progress, Badge } from '@chakra-ui/react';
import { CardWrapper, Icon } from '@/shared/ui';
import type { MaterialDemand } from '../types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface MaterialsGridProps {
  materials: MaterialDemand[];
  selectedMaterial: MaterialDemand | null;
  onSelectMaterial: (material: MaterialDemand) => void;
}

export function MaterialsGrid({ materials, selectedMaterial, onSelectMaterial }: MaterialsGridProps) {
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

  // Guard against undefined materials
  if (!materials || !Array.isArray(materials)) {
    return <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4} />;
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
      {materials
        .filter((material) => material != null)
        .map((material) => {
          const trend = getTrendDisplay(material.prediction?.trendDirection || 'stable');
          const TrendIcon = trend.icon;

          return (
          <CardWrapper
            key={material.materialId}
            variant="outline"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            onClick={() => onSelectMaterial(material)}
            bg={selectedMaterial?.materialId === material.materialId ? 'blue.50' : 'white'}
            borderColor={selectedMaterial?.materialId === material.materialId ? 'blue.300' : 'gray.200'}
          >
            <CardWrapper.Body p={4}>
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
                    <Icon icon={TrendIcon} size="sm" color={`var(--chakra-colors-${trend.color}-500)`} />
                    {material.alerts && material.alerts.length > 0 && (
                      <Badge colorPalette="red" size="xs">
                        {material.alerts.length}
                      </Badge>
                    )}
                  </HStack>
                </HStack>

                {/* Prediction Accuracy */}
                {material.prediction?.accuracy !== undefined && (
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
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </VStack>
                )}

                {/* Trend Info */}
                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.600">Tendencia:</Text>
                  <Badge colorPalette={trend.color} size="xs">
                    {trend.label}
                  </Badge>
                </HStack>

                {/* Next Prediction */}
                {material.prediction?.predictions && material.prediction.predictions.length > 0 && (
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
            </CardWrapper.Body>
          </CardWrapper>
        );
      })}
    </SimpleGrid>
  );
}
