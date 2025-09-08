import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  CardWrapper,
  CircularProgress,
  Alert,
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { PerformanceMetrics } from '../types';

interface OverviewTabProps {
  performance: PerformanceMetrics;
  getCategoryColor: (category: string) => string;
  getTypeColor: (type: string) => string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ performance, getCategoryColor, getTypeColor }) => {
  return (
    <VStack align="stretch" gap={6}>
      {/* Category Scores */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        {Object.entries(performance.category_scores).map(([category, score]) => (
          <CardWrapper .Root
            key={category}
            borderTop="4px solid"
            borderTopColor={`${getCategoryColor(category)}.400`}
          >
            <CardWrapper .Body p={4} textAlign="center">
              <VStack gap={3}>
                <Text fontSize="sm" color="gray.600" textTransform="capitalize">
                  {category}
                </Text>
                <CircularProgress.Root value={score} size="60px">
                  <CircularProgress.Circle stroke={`${getCategoryColor(category)}.400`} />
                  <CircularProgress.ValueText fontSize="sm" fontWeight="bold">
                    {score}
                  </CircularProgress.ValueText>
                </CircularProgress.Root>
                <Badge
                  colorPalette={getCategoryColor(category)}
                  size="sm"
                >
                  {score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Average' : 'Needs Improvement'}
                </Badge>
              </VStack>
            </CardWrapper .Body>
          </CardWrapper .Root>
        ))}
      </SimpleGrid>

      {/* Critical Insights */}
      <CardWrapper .Root>
        <CardWrapper .Header>
          <Text fontSize="lg" fontWeight="semibold">Critical Insights</Text>
        </CardWrapper .Header>
        <CardWrapper .Body>
          <VStack align="stretch" gap={4}>
            {performance.insights
              .filter(insight => insight.type === 'critical' || insight.action_required)
              .map((insight, index) => (
                <Alert.Root key={index} status={insight.type === 'critical' ? 'error' : 'warning'}>
                  <Alert.Indicator>
                    {insight.type === 'critical' ?
                      <ExclamationTriangleIcon className="w-5 h-5" /> :
                      <ClockIcon className="w-5 h-5" />
                    }
                  </Alert.Indicator>
                  <Alert.Description>
                    <VStack align="stretch" gap={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">{insight.title}</Text>
                        <Badge colorPalette={getTypeColor(insight.type)} size="sm">
                          Action Required
                        </Badge>
                      </HStack>
                      <Text fontSize="sm">{insight.description}</Text>
                      <Text fontSize="sm" fontStyle="italic" color="blue.600">
                        Recommendation: {insight.recommendation}
                      </Text>
                    </VStack>
                  </Alert.Description>
                </Alert.Root>
              ))}
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>
    </VStack>
  );
};
