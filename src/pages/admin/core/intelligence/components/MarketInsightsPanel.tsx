import { VStack, Text, HStack, Badge, Box, SimpleGrid, Alert, CardWrapper, Icon } from '@/shared/ui';
import type { MarketInsight } from '../types';
import {
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface MarketInsightsPanelProps {
  insights: MarketInsight[];
}

export function MarketInsightsPanel({ insights }: MarketInsightsPanelProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'red';
      case 'short_term': return 'orange';
      case 'medium_term': return 'yellow';
      case 'long_term': return 'blue';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return CheckCircleIcon;
      case 'threat': return ExclamationTriangleIcon;
      case 'trend': return ArrowTrendingUpIcon;
      case 'competitive_move': return UserGroupIcon;
      default: return BellIcon;
    }
  };

  return (
    <VStack gap="4" align="stretch">
      {insights.map((insight) => {
        const TypeIcon = getTypeIcon(insight.type);
        return (
          <CardWrapper key={insight.id} variant="outline">
            <CardWrapper.Body p="4">
              <VStack gap="3" align="stretch">
                <HStack justify="space-between" align="start">
                  <HStack gap="3">
                    <Box p="2" bg={`${getUrgencyColor(insight.urgency)}.100`} borderRadius="md">
                      <Icon icon={TypeIcon} size="md" color={`var(--chakra-colors-${getUrgencyColor(insight.urgency)}-600)`} />
                    </Box>
                    <VStack align="start" gap="1">
                      <Text fontWeight="bold">{insight.title}</Text>
                      <Text fontSize="sm" color="gray.600">{insight.description}</Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" gap="1">
                    <Badge colorPalette={getUrgencyColor(insight.urgency)} size="sm">
                      {insight.urgency === 'immediate' ? 'Inmediato' :
                       insight.urgency === 'short_term' ? 'Corto Plazo' :
                       insight.urgency === 'medium_term' ? 'Mediano Plazo' : 'Largo Plazo'}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      Confianza: {insight.confidence}%
                    </Text>
                  </VStack>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">Impacto en Revenue:</Text>
                    <Text fontSize="lg" fontWeight="bold"
                      color={insight.impact.revenue > 0 ? 'green.600' : insight.impact.revenue < 0 ? 'red.600' : 'gray.600'}>
                      {insight.impact.revenue > 0 ? '+' : ''}${insight.impact.revenue.toLocaleString()}
                    </Text>
                  </VStack>

                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">Impacto Market Share:</Text>
                    <Text fontSize="lg" fontWeight="bold"
                      color={insight.impact.marketShare > 0 ? 'green.600' : insight.impact.marketShare < 0 ? 'red.600' : 'gray.600'}>
                      {insight.impact.marketShare > 0 ? '+' : ''}{insight.impact.marketShare}%
                    </Text>
                  </VStack>

                  <VStack align="start" gap="1">
                    <Text fontSize="sm" fontWeight="medium">Impacto Clientes:</Text>
                    <Text fontSize="lg" fontWeight="bold"
                      color={insight.impact.customerBase > 0 ? 'green.600' : insight.impact.customerBase < 0 ? 'red.600' : 'gray.600'}>
                      {insight.impact.customerBase > 0 ? '+' : ''}{insight.impact.customerBase}
                    </Text>
                  </VStack>
                </SimpleGrid>

                {insight.actionRequired && (
                  <Alert.Root status="info" variant="subtle" size="sm">
                    <Alert.Title>Acción Requerida</Alert.Title>
                    <Alert.Description>
                      Este insight requiere acción estratégica para capitalizar la oportunidad o mitigar el riesgo.
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        );
      })}
    </VStack>
  );
}
