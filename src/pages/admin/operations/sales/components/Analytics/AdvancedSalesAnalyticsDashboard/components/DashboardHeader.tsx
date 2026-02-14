import React from 'react';
import {
  HStack,
  VStack,
  Text,
  Select,
  Button,
  createListCollection,
  Portal,
  CardWrapper
} from '@/shared/ui';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import type { AdvancedSalesAnalytics, DateRange } from '../types';

interface DashboardHeaderProps {
  analytics: AdvancedSalesAnalytics | null;
  dateRange: DateRange;
  setDateRange: (value: DateRange) => void;
  loading: boolean;
  onRefresh: () => void;
}

const dateRangeCollection = createListCollection({
    items: [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'This Year', value: 'year' }
    ]
})

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  analytics,
  dateRange,
  setDateRange,
  loading,
  onRefresh,
}) => {
  const getTrendIcon = (value: number) => {
    return value > 0 ?
      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" /> :
      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
  };

  return (
    <CardWrapper bg="gradient-to-r from-blue-600 to-purple-700" color="white">
      <CardWrapper.Body p="6">
        <VStack align="stretch" gap="4">
          <HStack justify="space-between" align="center">
            <HStack gap="3">
              <ChartBarIcon className="w-8 h-8" />
              <VStack align="start" gap="0">
                <Text fontSize="2xl" fontWeight="bold">Advanced Sales Intelligence</Text>
                <Text opacity={0.9}>Real-time analytics with predictive insights</Text>
              </VStack>
            </HStack>
            <HStack gap="2">
              <Select.Root
                collection={dateRangeCollection}
                value={[dateRange]}
                onValueChange={(e) => setDateRange(e.value[0] as DateRange)}
                size="sm"
                width="120px"
              >
                <Select.Control>
                    <Select.Trigger bg="whiteAlpha.200">
                    <Select.ValueText />
                    </Select.Trigger>
                </Select.Control>
                <Portal>
                    <Select.Positioner>
                        <Select.Content>
                            {dateRangeCollection.items.map((item) => (
                                <Select.Item item={item} key={item.value}>
                                    {item.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Positioner>
                </Portal>
              </Select.Root>
              <Button
                variant="outline"
                color="white"
                borderColor="whiteAlpha.300"
                onClick={onRefresh}
                loading={loading}
                size="sm"
              >
                Refresh
              </Button>
            </HStack>
          </HStack>

          {analytics && (
            <HStack justify="center" gap="8">
              <VStack gap="1">
                <Text fontSize="3xl" fontWeight="bold">
                  ${analytics.revenue.total.toLocaleString()}
                </Text>
                <Text opacity={0.8}>Total Revenue</Text>
              </VStack>
              <VStack gap="1">
                <HStack gap="2">
                  <Text fontSize="2xl" fontWeight="bold">
                    +{analytics.revenue.growth.toFixed(1)}%
                  </Text>
                  {getTrendIcon(analytics.revenue.growth)}
                </HStack>
                <Text opacity={0.8}>Growth Rate</Text>
              </VStack>
            </HStack>
          )}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
