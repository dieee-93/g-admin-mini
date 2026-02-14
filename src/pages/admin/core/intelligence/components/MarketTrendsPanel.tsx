import { VStack, Text, HStack, Badge, Box, CardWrapper, Icon } from '@/shared/ui';
import { MarketTrend } from '../types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface MarketTrendsPanelProps {
  trends: MarketTrend[];
}

export function MarketTrendsPanel({ trends }: MarketTrendsPanelProps) {
  return (
    <VStack gap="4" align="stretch">
      {trends.map((trend) => (
        <CardWrapper key={trend.id} variant="outline">
          <CardWrapper.Body p="4">
            <VStack gap="3" align="stretch">
              <HStack justify="space-between" align="start">
                <VStack align="start" gap="1">
                  <HStack gap="2">
                    {trend.trend === 'growing' ? (
                      <Icon icon={ArrowTrendingUpIcon} size="md" color="var(--chakra-colors-green-500)" />
                    ) : trend.trend === 'declining' ? (
                      <Icon icon={ArrowTrendingDownIcon} size="md" color="var(--chakra-colors-red-500)" />
                    ) : (
                      <Icon icon={ChartBarIcon} size="md" color="var(--chakra-colors-gray-500)" />
                    )}
                    <Text fontWeight="bold">{trend.category}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">{trend.description}</Text>
                </VStack>

                <VStack align="end" gap="1">
                  <Text fontSize="xl" fontWeight="bold"
                    color={trend.trend === 'growing' ? 'green.600' : trend.trend === 'declining' ? 'red.600' : 'gray.600'}>
                    {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                  </Text>
                  <Badge colorPalette={trend.impact === 'high' ? 'red' : trend.impact === 'medium' ? 'yellow' : 'gray'} size="sm">
                    Impacto {trend.impact}
                  </Badge>
                </VStack>
              </HStack>

              <Text fontSize="sm" color="blue.600">
                💡 {trend.opportunity}
              </Text>

              {trend.recommendedActions.length > 0 && (
                <VStack align="start" gap="2">
                  <Text fontSize="sm" fontWeight="medium">Acciones Recomendadas:</Text>
                  <VStack align="start" gap="1">
                    {trend.recommendedActions.slice(0, 3).map((action, index) => (
                      <HStack key={index} gap="2">
                        <Icon icon={CheckCircleIcon} size="sm" color="var(--chakra-colors-green-500)" style={{ flexShrink: "0" }} />
                        <Text fontSize="sm">{action}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              )}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      ))}
    </VStack>
  );
}
