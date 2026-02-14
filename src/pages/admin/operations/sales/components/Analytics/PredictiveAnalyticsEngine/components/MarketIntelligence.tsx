import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  CardWrapper
} from '@/shared/ui';
import { FireIcon } from '@heroicons/react/24/outline';
import type { PredictiveMetrics } from '../types';

interface MarketIntelligenceProps {
  analytics: PredictiveMetrics;
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ analytics }) => {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack gap="2">
          <FireIcon className="w-6 h-6 text-purple-500" />
          <Text fontSize="lg" fontWeight="semibold">Market Intelligence</Text>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="6">
          <VStack align="stretch" gap="4">
            <Text fontWeight="medium" color="purple.600">Seasonal Patterns</Text>
            <HStack justify="space-between">
              <Text>Current Season</Text>
              <Badge colorPalette="purple">{analytics.market_trends.seasonal_patterns.current_season}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Expected Change</Text>
              <Text fontWeight="bold" color="purple.500">
                +{analytics.market_trends.seasonal_patterns.expected_change}%
              </Text>
            </HStack>
            <VStack align="stretch" gap="2">
              {analytics.market_trends.seasonal_patterns.recommendations.map((rec, index) => (
                <Text key={index} fontSize="sm" color="purple.600">
                  • {rec}
                </Text>
              ))}
            </VStack>
          </VStack>

          <VStack align="stretch" gap="4">
            <Text fontWeight="medium" color="green.600">Competitive Analysis</Text>
            <HStack justify="space-between">
              <Text>Market Position</Text>
              <Badge colorPalette="green">{analytics.market_trends.competitive_analysis.market_position}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Price Optimization</Text>
              <Text fontWeight="bold" color="green.500">
                +{analytics.market_trends.competitive_analysis.price_optimization}%
              </Text>
            </HStack>
            <VStack align="stretch" gap="2">
              {analytics.market_trends.competitive_analysis.competitive_advantages.map((advantage, index) => (
                <Text key={index} fontSize="sm" color="green.600">
                  • {advantage}
                </Text>
              ))}
            </VStack>
          </VStack>
        </Grid>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
