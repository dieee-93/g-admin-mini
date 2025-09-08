import { Box, VStack, HStack, Text, Tabs, Select, Skeleton, SimpleGrid } from '@chakra-ui/react';
import { usePredictiveAnalytics } from './hooks/usePredictiveAnalytics';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { MaterialsGrid } from './components/MaterialsGrid';
import { ForecastingTab } from './components/ForecastingTab';
import { SeasonalityTab } from './components/SeasonalityTab';
import { AlertsTab } from './components/AlertsTab';
import { RecommendationsTab } from './components/RecommendationsTab';
import { MATERIAL_FILTER_COLLECTION, FORECAST_HORIZON_COLLECTION } from './constants';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui';

export function PredictiveAnalytics() {
  const {
    materials,
    selectedMaterial,
    setSelectedMaterial,
    loading,
    activeTab,
    setActiveTab,
    config,
    setConfig,
    materialFilter,
    setMaterialFilter,
    isRunningAnalysis,
    runPredictiveAnalysis,
    filteredMaterials,
    analyticsOverview,
  } = usePredictiveAnalytics();

  if (loading) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="60px" />
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="120px" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <AnalyticsHeader
          runPredictiveAnalysis={runPredictiveAnalysis}
          isRunningAnalysis={isRunningAnalysis}
          analyticsOverview={analyticsOverview}
        />

        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="overview">
              <HStack gap={2}>
                <Icon icon={ChartBarIcon} size="sm" />
                <Text>Resumen</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="forecasting">
              <HStack gap={2}>
                <Icon icon={ArrowTrendingUpIcon} size="sm" />
                <Text>Predicciones</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="seasonality">
              <HStack gap={2}>
                <Icon icon={CalendarIcon} size="sm" />
                <Text>Estacionalidad</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="alerts">
              <HStack gap={2}>
                <Icon icon={ExclamationTriangleIcon} size="sm" />
                <Text>Alertas</Text>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="recommendations">
              <HStack gap={2}>
                <Icon icon={LightBulbIcon} size="sm" />
                <Text>Recomendaciones</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            <Tabs.Content value="overview">
              <VStack gap={6} align="stretch">
                <HStack gap={4} flexWrap="wrap">
                  <Select.Root
                    collection={MATERIAL_FILTER_COLLECTION}
                    value={[materialFilter]}
                    onValueChange={(details) => setMaterialFilter(details.value[0])}
                    width="250px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Filtrar materiales" />
                    </Select.Trigger>
                    <Select.Content>
                      {MATERIAL_FILTER_COLLECTION.items.map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  <Select.Root
                    collection={FORECAST_HORIZON_COLLECTION}
                    value={[config.forecastHorizon.toString()]}
                    onValueChange={(details) => setConfig({
                      ...config,
                      forecastHorizon: parseInt(details.value[0])
                    })}
                    width="150px"
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Horizonte" />
                    </Select.Trigger>
                    <Select.Content>
                      {FORECAST_HORIZON_COLLECTION.items.map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                <MaterialsGrid
                  materials={filteredMaterials}
                  selectedMaterial={selectedMaterial}
                  onSelectMaterial={setSelectedMaterial}
                />
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="forecasting">
              <ForecastingTab
                selectedMaterial={selectedMaterial}
                forecastHorizon={config.forecastHorizon}
              />
            </Tabs.Content>

            <Tabs.Content value="seasonality">
              <SeasonalityTab selectedMaterial={selectedMaterial} />
            </Tabs.Content>

            <Tabs.Content value="alerts">
              <AlertsTab materials={materials} />
            </Tabs.Content>

            <Tabs.Content value="recommendations">
              <RecommendationsTab materials={materials} />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}

export default PredictiveAnalytics;
