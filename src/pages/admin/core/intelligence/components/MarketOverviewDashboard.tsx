import { SimpleGrid, VStack, Text, HStack, Alert, Badge, CardWrapper, Icon } from '@/shared/ui';
import type { CompetitorData, MarketTrend, MarketInsight } from '../types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface MarketOverviewDashboardProps {
  competitors: CompetitorData[];
  trends: MarketTrend[];
  insights: MarketInsight[];
}

export function MarketOverviewDashboard({ competitors, trends, insights }: MarketOverviewDashboardProps) {
  return (
    <VStack gap="6" align="stretch">
      {/* Quick Market Insights */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <CardWrapper>
          <CardWrapper.Header>
            <Text fontWeight="bold">Top Competidores por Rating</Text>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack gap="3" align="stretch">
              {competitors
                .sort((a, b) => b.performance.customerRating - a.performance.customerRating)
                .slice(0, 5)
                .map((competitor, index) => (
                  <HStack key={competitor.id} justify="space-between">
                    <HStack gap="2">
                      <Text fontSize="lg">{index + 1}.</Text>
                      <VStack align="start" gap="0">
                        <Text fontWeight="medium">{competitor.name}</Text>
                        <Text fontSize="sm" color="gray.600">{competitor.category}</Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" gap="0">
                      <Text fontWeight="bold" color="yellow.600">
                        {competitor.performance.customerRating.toFixed(1)}⭐
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {competitor.performance.reviewCount} reviews
                      </Text>
                    </VStack>
                  </HStack>
                ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Header>
            <Text fontWeight="bold">Tendencias de Mercado Principales</Text>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack gap="3" align="stretch">
              {trends.slice(0, 5).map((trend) => (
                <HStack key={trend.id} justify="space-between">
                  <VStack align="start" gap="0">
                    <Text fontWeight="medium">{trend.category}</Text>
                    <Text fontSize="sm" color="gray.600">{trend.description}</Text>
                  </VStack>
                  <VStack align="end" gap="0">
                    <HStack gap="1">
                      {trend.trend === 'growing' ? (
                        <Icon icon={ArrowTrendingUpIcon} size="sm" color="var(--chakra-colors-green-500)" />
                      ) : trend.trend === 'declining' ? (
                        <Icon icon={ArrowTrendingDownIcon} size="sm" color="var(--chakra-colors-red-500)" />
                      ) : (
                        <Icon icon={ChartBarIcon} size="sm" color="var(--chakra-colors-gray-500)" />
                      )}
                      <Text fontSize="sm" fontWeight="bold"
                        color={trend.trend === 'growing' ? 'green.600' : trend.trend === 'declining' ? 'red.600' : 'gray.600'}>
                        {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                      </Text>
                    </HStack>
                    <Badge colorPalette={trend.impact === 'high' ? 'red' : trend.impact === 'medium' ? 'yellow' : 'gray'} size="xs">
                      {trend.impact}
                    </Badge>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Critical Insights Alert */}
      {insights.filter(i => i.urgency === 'immediate').length > 0 && (
        <Alert.Root status="warning" variant="subtle">
          <Icon icon={ExclamationTriangleIcon} size="md" />
          <Alert.Title>Insights Críticos Detectados</Alert.Title>
          <Alert.Description>
            Hay {insights.filter(i => i.urgency === 'immediate').length} insights que requieren atención inmediata.
            Revisa la pestaña de Insights para más detalles.
          </Alert.Description>
        </Alert.Root>
      )}
    </VStack>
  );
}
