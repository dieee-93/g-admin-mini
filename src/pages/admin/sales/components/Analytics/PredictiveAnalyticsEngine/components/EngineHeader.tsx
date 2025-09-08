import React from 'react';
import {
  HStack,
  VStack,
  Text,
  Select,
  Button,
  createListCollection,
  Portal,
} from '@chakra-ui/react';
import { CardWrapper, CircularProgress } from '@/shared/ui';
import { BoltIcon } from '@heroicons/react/24/outline';
import type { PredictiveMetrics, Timeframe } from '../types';

interface EngineHeaderProps {
  analytics: PredictiveMetrics | null;
  selectedTimeframe: Timeframe;
  setSelectedTimeframe: (value: Timeframe) => void;
  loading: boolean;
  onRefresh: () => void;
}

const timeFrameCollection = createListCollection({
    items: [
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
        { label: 'Quarter', value: 'quarter' }
    ]
})

export const EngineHeader: React.FC<EngineHeaderProps> = ({
  analytics,
  selectedTimeframe,
  setSelectedTimeframe,
  loading,
  onRefresh,
}) => {
  return (
    <CardWrapper bg="gradient-to-r from-indigo-600 to-purple-700" color="white">
      <CardWrapper.Body p={6}>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <BoltIcon className="w-8 h-8" />
              <VStack align="start" gap={0}>
                <Text fontSize="2xl" fontWeight="bold">Predictive Analytics Engine</Text>
                <Text opacity={0.9}>AI-powered forecasting and business intelligence</Text>
              </VStack>
            </HStack>
            <HStack gap={2}>
              <Select.Root
                collection={timeFrameCollection}
                value={[selectedTimeframe]}
                onValueChange={(e) => setSelectedTimeframe(e.value[0] as Timeframe)}
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
                            {timeFrameCollection.items.map((item) => (
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
            <HStack justify="center" gap={8}>
              <VStack gap={1}>
                <Text fontSize="3xl" fontWeight="bold">
                  ${analytics.revenue_forecast[`next_${selectedTimeframe === 'week' ? '7_days' : selectedTimeframe === 'month' ? '30_days' : 'quarter'}`].toLocaleString()}
                </Text>
                <Text opacity={0.8}>Predicted Revenue</Text>
              </VStack>
              <VStack gap={1}>
                <CircularProgress value={analytics.revenue_forecast.confidence} size="60px" color="white" trackColor="rgba(255,255,255,0.3)" showValueText>
                </CircularProgress>
                <Text opacity={0.8}>Confidence</Text>
              </VStack>
            </HStack>
          )}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
