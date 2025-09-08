import { VStack, HStack, Text, SimpleGrid, Badge, Box } from '@chakra-ui/react';
import { CardWrapper, Icon } from '@/shared/ui';
import { MaterialDemand } from '../types';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface SeasonalityTabProps {
  selectedMaterial: MaterialDemand | null;
}

export function SeasonalityTab({ selectedMaterial }: SeasonalityTabProps) {
  if (!selectedMaterial) {
    return (
      <CardWrapper variant="outline">
        <CardWrapper.Body p={8} textAlign="center">
          <Text>Seleccione un material para ver el análisis de estacionalidad.</Text>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <CardWrapper variant="outline">
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="bold">
            Análisis de Estacionalidad - {selectedMaterial.materialName}
          </Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
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
                      <CardWrapper key={index} variant="subtle">
                        <CardWrapper.Body p={3}>
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
                        </CardWrapper.Body>
                      </CardWrapper>
                    ))}
                  </VStack>
                </Box>

                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={3}>
                    Ajustes Estacionales
                  </Text>
                  <VStack gap={2} align="stretch">
                    {selectedMaterial.seasonality.adjustments.map((adjustment, index) => (
                      <CardWrapper key={index} variant="outline" size="sm">
                        <CardWrapper.Body p={3}>
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
                        </CardWrapper.Body>
                      </CardWrapper>
                    ))}
                  </VStack>
                </Box>
              </>
            ) : (
              <CardWrapper variant="subtle">
                <CardWrapper.Body p={8} textAlign="center">
                  <Icon icon={CalendarIcon} size="3xl" color="var(--chakra-colors-gray-400)" style={{ margin: "0 auto 16px auto" }} />
                  <Text fontSize="lg" fontWeight="medium" mb={2}>
                    No se detectó estacionalidad
                  </Text>
                  <Text color="gray.600">
                    Los patrones de demanda para este material son relativamente constantes a lo largo del tiempo.
                  </Text>
                </CardWrapper.Body>
              </CardWrapper>
            )}
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}
