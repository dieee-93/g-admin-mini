import React from 'react';
import {
  HStack,
  Text,
  Badge,
  Table,
  CardWrapper
} from '@/shared/ui';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { PredictiveMetrics } from '../types';

interface DemandForecastingProps {
  analytics: PredictiveMetrics;
}

export const DemandForecasting: React.FC<DemandForecastingProps> = ({ analytics }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'green';
    if (confidence >= 80) return 'yellow';
    if (confidence >= 70) return 'orange';
    return 'red';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack gap="2">
          <ChartBarIcon className="w-6 h-6 text-blue-500" />
          <Text fontSize="lg" fontWeight="semibold">Demand Forecasting</Text>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Item</Table.ColumnHeader>
              <Table.ColumnHeader>Predicted Demand</Table.ColumnHeader>
              <Table.ColumnHeader>Confidence</Table.ColumnHeader>
              <Table.ColumnHeader>Trend</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {analytics.demand_forecasting.top_items.map(item => (
              <Table.Row key={item.item_name}>
                <Table.Cell fontWeight="medium">{item.item_name}</Table.Cell>
                <Table.Cell>{item.predicted_demand} units</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getConfidenceColor(item.confidence)} size="sm">
                    {item.confidence}%
                  </Badge>
                </Table.Cell>
                <Table.Cell>{getTrendIcon(item.trend)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
