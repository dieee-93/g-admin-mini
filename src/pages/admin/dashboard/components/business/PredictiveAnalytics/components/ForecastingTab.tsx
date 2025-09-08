import { VStack, HStack, Text, SimpleGrid, Badge, Box } from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import { MaterialDemand } from '../types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface ForecastingTabProps {
  selectedMaterial: MaterialDemand | null;
  forecastHorizon: number;
}

export function ForecastingTab({ selectedMaterial, forecastHorizon }: ForecastingTabProps) {
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

  if (!selectedMaterial) {
    return (
      <CardWrapper variant="outline">
        <CardWrapper.Body p={8} textAlign="center">
          <Text>Seleccione un material para ver las predicciones.</Text>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <CardWrapper variant="outline">
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="bold">
            Predicción de Demanda - {selectedMaterial.materialName}
          </Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
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
            <CardWrapper variant="subtle">
              <CardWrapper.Body p={6} textAlign="center">
                <Text fontSize="4xl" mb={4}>📈</Text>
                <Text fontWeight="medium" mb={2}>Gráfico de Predicciones</Text>
                <Text fontSize="sm" color="gray.600">
                  Visualización de demanda histórica vs predicciones para los próximos {forecastHorizon} días
                </Text>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  * Gráfico interactivo disponible en versión completa
                </Text>
              </CardWrapper.Body>
            </CardWrapper>

            {/* Forecast Table */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={3}>
                Predicciones Detalladas
              </Text>
              <VStack gap={2} align="stretch">
                {selectedMaterial.prediction.predictions.map((prediction, index) => (
                  <CardWrapper key={index} variant="outline" size="sm">
                    <CardWrapper.Body p={3}>
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
                    </CardWrapper.Body>
                  </CardWrapper>
                ))}
              </VStack>
            </Box>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}
