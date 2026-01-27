// src/components/charts/KPIChart.tsx
// KPI metrics chart component

import React from 'react';
import { Box, Text, VStack, Grid, Badge } from '@chakra-ui/react';
import { CardWrapper } from '../ui';
interface KPIMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

interface KPIChartProps {
  metrics?: KPIMetric[];
  title?: string;
}

const defaultMetrics: KPIMetric[] = [
  { label: 'Total Sales', value: '$12,450', change: 12.5, trend: 'up', color: 'green' },
  { label: 'Orders', value: 145, change: -2.3, trend: 'down', color: 'red' },
  { label: 'Customers', value: 89, change: 5.7, trend: 'up', color: 'blue' },
  { label: 'Avg Order', value: '$85.86', change: 0, trend: 'stable', color: 'gray' }
];

export default function KPIChart({
  metrics = defaultMetrics,
  title = "Key Performance Indicators"
}: KPIChartProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="4">
          {metrics.map((metric, index) => (
            <Box
              key={index}
              p="4"
              bg="gray.50"
              borderRadius="md"
              textAlign="center"
            >
              <VStack gap="1">
                <Text fontSize="sm" color="gray.600">
                  {metric.label}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={`${metric.color}.600`}>
                  {metric.value}
                </Text>
                {metric.change !== undefined && (
                  <Badge
                    colorPalette={metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'gray'}
                    variant="subtle"
                    size="sm"
                  >
                    {getTrendIcon(metric.trend || 'stable')} {Math.abs(metric.change)}%
                  </Badge>
                )}
              </VStack>
            </Box>
          ))}
        </Grid>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export { KPIChart };
export type { KPIMetric };