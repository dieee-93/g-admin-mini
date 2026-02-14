import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Select,
  CardWrapper
} from '@/shared/ui';
import {
  ChartBarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { timeRangeCollection, categoryCollection } from '../constants';

interface DashboardHeaderProps {
  realTimeUpdates: boolean;
  selectedTimeRange: string;
  selectedMetricCategory: string;
  onTimeRangeChange: (range: string) => void;
  onMetricCategoryChange: (category: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  realTimeUpdates,
  selectedTimeRange,
  selectedMetricCategory,
  onTimeRangeChange,
  onMetricCategoryChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <CardWrapper p="4">
      <HStack justify="space-between" align="center" wrap="wrap" gap="4">
        <VStack align="start" gap="1">
          <HStack gap="2">
            <Text fontSize="xl" fontWeight="bold">Sales Intelligence</Text>
            {realTimeUpdates && (
              <Badge colorPalette="green" size="sm">Live</Badge>
            )}
          </HStack>
          <Text color="gray.600" fontSize="sm">
            Advanced analytics and business insights
          </Text>
        </VStack>

        <HStack gap="3" wrap="wrap">
          <Select.Root
            collection={timeRangeCollection}
            value={[selectedTimeRange]}
            onValueChange={(details) => onTimeRangeChange(details.value[0])}
            size="sm"
            width="150px"
          >
            <Select.Control>
                <Select.Trigger>
                <CalendarDaysIcon className="w-4 h-4" />
                <Select.ValueText placeholder="Time Range" />
                </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
                <Select.Content>
                {timeRangeCollection.items.map((range) => (
                    <Select.Item item={range} key={range.value}>
                    {range.label}
                    </Select.Item>
                ))}
                </Select.Content>
            </Select.Positioner>
          </Select.Root>

          <Select.Root
            collection={categoryCollection}
            value={[selectedMetricCategory]}
            onValueChange={(details) => onMetricCategoryChange(details.value[0])}
            size="sm"
            width="200px"
          >
            <Select.Control>
                <Select.Trigger>
                <ChartBarIcon className="w-4 h-4" />
                <Select.ValueText placeholder="Metrics" />
                </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
                <Select.Content>
                {categoryCollection.items.map((category) => (
                    <Select.Item item={category} key={category.value}>
                    {category.label}
                    </Select.Item>
                ))}
                </Select.Content>
            </Select.Positioner>
          </Select.Root>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isLoading}
            loadingText="Refreshing..."
          >
            Refresh Data
          </Button>
        </HStack>
      </HStack>
    </CardWrapper>
  );
};
