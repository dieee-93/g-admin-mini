import { VStack, HStack, Text, Button, SimpleGrid } from '@chakra-ui/react';
import { Icon, CardWrapper } from '@/shared/ui';
import { ArrowPathIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface AnalyticsHeaderProps {
  runPredictiveAnalysis: () => void;
  isRunningAnalysis: boolean;
  analyticsOverview: {
    totalMaterials: number;
    averageAccuracy: number;
    seasonalMaterials: number;
    criticalAlerts: number;
  } | null;
}

export function AnalyticsHeader({
  runPredictiveAnalysis,
  isRunningAnalysis,
  analyticsOverview,
}: AnalyticsHeaderProps) {
  return (
    <VStack align="start" gap={3}>
      <HStack justify="space-between" w="full">
        <VStack align="start" gap={1}>
          <Text fontSize="3xl" fontWeight="bold">🔮 Predictive Analytics</Text>
          <Text color="gray.600">
            Predicción inteligente de demanda con machine learning y análisis estacional
          </Text>
        </VStack>

        <HStack gap={2}>
          <Button
            colorPalette="blue"
            onClick={runPredictiveAnalysis}
            isLoading={isRunningAnalysis}
            loadingText="Analizando..."
            size="sm"
          >
            <Icon icon={ArrowPathIcon} size="sm" />
            Ejecutar Análisis
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/tools/intelligence/recipes', '_blank')}
            size="sm"
          >
            <Icon icon={BeakerIcon} size="sm" />
            Recipe Intelligence
          </Button>
        </HStack>
      </HStack>

      {/* Overview Stats */}
      {analyticsOverview && (
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} w="full">
          <CardWrapper variant="subtle" bg="blue.50">
            <CardWrapper.Body p={4} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {analyticsOverview.totalMaterials}
              </Text>
              <Text fontSize="sm" color="gray.600">Materiales Analizados</Text>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="subtle">
            <CardWrapper.Body p={4} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {analyticsOverview.averageAccuracy}%
              </Text>
              <Text fontSize="sm" color="gray.600">Precisión Promedio</Text>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="subtle" bg="purple.50">
            <CardWrapper.Body p={4} textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {analyticsOverview.seasonalMaterials}
              </Text>
              <Text fontSize="sm" color="gray.600">Con Estacionalidad</Text>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper variant="subtle" bg={analyticsOverview.criticalAlerts > 0 ? "red.50" : "gray.50"}>
            <CardWrapper.Body p={4} textAlign="center">
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={analyticsOverview.criticalAlerts > 0 ? "red.600" : "gray.600"}
              >
                {analyticsOverview.criticalAlerts}
              </Text>
              <Text fontSize="sm" color="gray.600">Alertas Críticas</Text>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>
      )}
    </VStack>
  );
}
