import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Grid,
  Box
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import type { PerformanceInsight } from '../types';

interface InsightsTabProps {
  insights: PerformanceInsight[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  getCategoryColor: (category: string) => string;
  getTypeColor: (type: string) => string;
  getImpactIcon: (impact: string) => React.ElementType;
  getTrendIcon: (trend: string) => React.ElementType;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  insights,
  selectedCategory,
  onCategoryChange,
  getCategoryColor,
  getTypeColor,
  getImpactIcon,
  getTrendIcon,
}) => {
  return (
    <VStack align="stretch" gap="4">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="semibold">Performance Insights</Text>
        <HStack gap="2">
          {['all', 'revenue', 'efficiency', 'customer', 'operational'].map(category => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'solid' : 'outline'}
              colorPalette={category === 'all' ? 'gray' : getCategoryColor(category)}
              onClick={() => onCategoryChange(category)}
              textTransform="capitalize"
            >
              {category}
            </Button>
          ))}
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
        {insights.map((insight, index) => {
          const ImpactIcon = getImpactIcon(insight.impact);
          const TrendIcon = getTrendIcon(insight.trend);

          return (
            <CardWrapper key={index} variant="outline">
              <CardWrapper.Body p="4">
                <VStack align="stretch" gap="3">
                  <HStack justify="space-between">
                    <Badge colorPalette={getTypeColor(insight.type)} size="sm">
                      {insight.type}
                    </Badge>
                    <HStack gap="1">
                      <ImpactIcon className={`w-4 h-4 text-${getTypeColor(insight.type)}-500`} />
                      <TrendIcon className={`w-4 h-4`} />
                    </HStack>
                  </HStack>

                  <VStack align="stretch" gap="2">
                    <Text fontWeight="bold" fontSize="md">{insight.title}</Text>
                    <Text fontSize="sm" color="gray.600">{insight.description}</Text>
                  </VStack>

                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color={`${getCategoryColor(insight.category)}.600`}>
                      {insight.value}
                    </Text>
                    <Badge
                      colorPalette={getCategoryColor(insight.category)}
                      size="sm"
                      textTransform="capitalize"
                    >
                      {insight.category}
                    </Badge>
                  </HStack>

                  <Box p="3" bg="bg.canvas" borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium" color="blue.600">
                      💡 {insight.recommendation}
                    </Text>
                  </Box>

                  {insight.action_required && (
                    <Badge colorPalette="red" size="sm" alignSelf="start">
                      Action Required
                    </Badge>
                  )}
                </VStack>
              </CardWrapper.Body>
            </CardWrapper>
          )
        })}
      </Grid>
    </VStack>
  );
};
