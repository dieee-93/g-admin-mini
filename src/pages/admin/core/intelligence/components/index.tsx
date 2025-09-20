import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  SimpleGrid,
  Spinner,
  Select,
  Tabs,
} from '@chakra-ui/react';
import {
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { CardWrapper, Icon, InputField } from '@/shared/ui';
import { useCompetitiveIntelligence } from '../hooks/useCompetitiveIntelligence';
import { MarketOverviewDashboard } from './MarketOverviewDashboard';
import { CompetitorsTable } from './CompetitorsTable';
import { PricingAnalysisPanel } from './PricingAnalysisPanel';
import { MarketTrendsPanel } from './MarketTrendsPanel';
import { MarketInsightsPanel } from './MarketInsightsPanel';
import { competitorTypeOptions, marketPositionOptions } from '../constants';

export function CompetitiveIntelligence() {
  const {
    competitors,
    marketTrends,
    marketInsights,
    isLoading,
    activeTab,
    setActiveTab,
    competitorTypeFilter,
    setCompetitorTypeFilter,
    marketPositionFilter,
    setMarketPositionFilter,
    searchTerm,
    setSearchTerm,
    refreshIntelligence,
    filteredCompetitors,
    marketOverview,
  } = useCompetitiveIntelligence();

  if (isLoading) {
    return (
      <Box p="6" textAlign="center">
        <VStack gap="4">
          <Spinner size="xl" colorPalette="green" />
          <Text>Cargando Inteligencia Competitiva...</Text>
          <Text fontSize="sm" color="gray.600">Analizando mercado y competidores</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header with Controls */}
      <CardWrapper>
        <CardWrapper.Body>
          <VStack gap="4" align="stretch">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="1">
                <HStack gap="2">
                  <Icon icon={PresentationChartLineIcon} size="lg" color="var(--chakra-colors-green-600)" />
                  <Text fontSize="xl" fontWeight="bold">Inteligencia Competitiva</Text>
                  <Badge colorPalette="green" size="sm">Market Intelligence</Badge>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Análisis de mercado, competidores y posicionamiento estratégico
                </Text>
              </VStack>

              <HStack gap="2">
                <Button
                  colorPalette="green"
                  onClick={refreshIntelligence}
                  leftIcon={<Icon icon={ArrowPathIcon} size="sm" />}
                  size="sm"
                >
                  Actualizar Inteligencia
                </Button>
              </HStack>
            </HStack>

            {/* Market Overview Cards */}
            {marketOverview && (
              <SimpleGrid columns={{ base: 2, md: 6 }} gap="4">
                <CardWrapper variant="subtle" bg="blue.50">
                  <CardWrapper.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        ${(marketOverview.totalMarketSize / 1000000).toFixed(1)}M
                      </Text>
                      <Text fontSize="sm" color="gray.600">Tamaño Mercado</Text>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>

                <CardWrapper variant="subtle" bg="red.50">
                  <CardWrapper.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {marketOverview.directCompetitors}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Comp. Directos</Text>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>

                <CardWrapper variant="subtle" bg="yellow.50">
                  <CardWrapper.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                        {marketOverview.averageRating.toFixed(1)}⭐
                      </Text>
                      <Text fontSize="sm" color="gray.600">Rating Promedio</Text>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>

                <CardWrapper variant="subtle" bg="green.50">
                  <CardWrapper.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {marketOverview.growingTrends}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Tendencias ↗</Text>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>

                <CardWrapper variant="subtle" bg="purple.50">
                  <CardWrapper.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {marketOverview.criticalInsights}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Insights Críticos</Text>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>

                <CardWrapper variant="subtle" bg="orange.50">
                  <CardWrapper.Body p="4" textAlign="center">
                    <VStack gap="1">
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {marketOverview.totalCompetitors}
                      </Text>
                      <Text fontSize="sm" color="gray.600">Total Competidores</Text>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>
              </SimpleGrid>
            )}
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Main Content Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
        <Tabs.List>
          <Tabs.Trigger value="overview">
            <HStack gap={2}>
              <Icon icon={GlobeAltIcon} size="sm" />
              <Text>Overview</Text>
            </HStack>
          </Tabs.Trigger>

          <Tabs.Trigger value="competitors">
            <HStack gap={2}>
              <Icon icon={UserGroupIcon} size="sm" />
              <Text>Competidores</Text>
              <Badge colorPalette="blue" size="sm">{competitors.length}</Badge>
            </HStack>
          </Tabs.Trigger>

          <Tabs.Trigger value="pricing">
            <HStack gap={2}>
              <Icon icon={CurrencyDollarIcon} size="sm" />
              <Text>Análisis Precios</Text>
            </HStack>
          </Tabs.Trigger>

          <Tabs.Trigger value="trends">
            <HStack gap={2}>
              <Icon icon={ArrowTrendingUpIcon} size="sm" />
              <Text>Tendencias</Text>
              <Badge colorPalette="green" size="sm">{marketTrends.length}</Badge>
            </HStack>
          </Tabs.Trigger>

          <Tabs.Trigger value="insights">
            <HStack gap={2}>
              <Icon icon={BellIcon} size="sm" />
              <Text>Insights</Text>
              {marketInsights.filter(i => i.urgency === 'immediate').length > 0 && (
                <Badge colorPalette="red" size="sm">{marketInsights.filter(i => i.urgency === 'immediate').length}</Badge>
              )}
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Box mt="6">
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <MarketOverviewDashboard
              competitors={competitors}
              trends={marketTrends}
              insights={marketInsights}
            />
          </Tabs.Content>

          {/* Competitors Tab */}
          <Tabs.Content value="competitors">
            <VStack gap="4" align="stretch">
              {/* Filters */}
              <HStack gap="4" flexWrap="wrap">
                <Box flex="1" minW="250px">
                  <InputField
                    placeholder="Buscar competidores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Box>

                <Select.Root
                  collection={competitorTypeOptions}
                  value={[competitorTypeFilter]}
                  onValueChange={(details) => setCompetitorTypeFilter(details.value[0])}
                  width="200px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {competitorTypeOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>

                <Select.Root
                  collection={marketPositionOptions}
                  value={[marketPositionFilter]}
                  onValueChange={(details) => setMarketPositionFilter(details.value[0])}
                  width="180px"
                  size="sm"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    {marketPositionOptions.items.map(item => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </HStack>

              <CompetitorsTable competitors={filteredCompetitors} />
            </VStack>
          </Tabs.Content>

          {/* Pricing Tab */}
          <Tabs.Content value="pricing">
            <PricingAnalysisPanel competitors={competitors} />
          </Tabs.Content>

          {/* Trends Tab */}
          <Tabs.Content value="trends">
            <MarketTrendsPanel trends={marketTrends} />
          </Tabs.Content>

          {/* Insights Tab */}
          <Tabs.Content value="insights">
            <MarketInsightsPanel insights={marketInsights} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </VStack>
  );
}

export default CompetitiveIntelligence;
