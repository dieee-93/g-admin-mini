import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Grid,
  Progress,
  CardWrapper
} from '@/shared/ui';
import type { MetricCard } from '../types';

interface MetricCardsGridProps {
  metrics: MetricCard[];
  formatValue: (value: number, format?: string) => string;
  getTrendInfo: (change?: number) => { icon: React.ElementType; color: string };
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  metrics,
  formatValue,
  getTrendInfo,
}) => {
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="4">
      {metrics.map((metric, index) => {
        const trendInfo = getTrendInfo(metric.change);
        const TrendIcon = trendInfo.icon;
        const MetricIcon = metric.icon;
        const progressValue = metric.target ? (Number(metric.value) / metric.target) * 100 : undefined;

        return (
          <CardWrapper key={index} p="4">
            <VStack gap="3" align="stretch">
              <HStack justify="space-between" align="center">
                <MetricIcon className={`w-5 h-5 text-${metric.color}-500`} />
                {TrendIcon && metric.change && (
                  <HStack gap="1">
                    <TrendIcon className={`w-4 h-4 text-${trendInfo.color}-500`} />
                    <Text fontSize="sm" color={`${trendInfo.color}.600`}>
                      {Math.abs(metric.change)}%
                    </Text>
                  </HStack>
                )}
              </HStack>

              <VStack align="start" gap="1">
                <Text fontSize="2xl" fontWeight="bold" color={`${metric.color}.600`}>
                  {formatValue(Number(metric.value), metric.format)}
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {metric.title}
                </Text>
              </VStack>

              {metric.target && progressValue && (
                <VStack gap="1" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.500">Target</Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatValue(metric.target, metric.format)}
                    </Text>
                  </HStack>
                  <Progress
                    value={Math.min(progressValue, 100)}
                    size="sm"
                    colorPalette={progressValue >= 100 ? 'green' : progressValue >= 80 ? 'yellow' : 'red'}
                  />
                </VStack>
              )}
            </VStack>
          </CardWrapper>
        );
      })}
    </Grid>
  );
};
