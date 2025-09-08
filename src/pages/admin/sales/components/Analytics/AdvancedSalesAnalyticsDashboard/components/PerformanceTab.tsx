import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import type { AdvancedSalesAnalytics } from '../types';

interface PerformanceTabProps {
  analytics: AdvancedSalesAnalytics;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ analytics }) => {
  return (
    <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
      {/* Top Selling Items */}
      <CardWrapper>
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="semibold">Top Selling Items</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack align="stretch" gap={3}>
            {analytics.performance.top_selling_items.map((item, index) => (
              <HStack key={item.name} justify="space-between" p={3} bg="bg.canvas" borderRadius="md">
                <HStack gap={3}>
                  <Badge colorPalette="blue" size="sm">#{index + 1}</Badge>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium" fontSize="sm">{item.name}</Text>
                    <Text fontSize="xs" color="gray.500">{item.quantity} sold</Text>
                  </VStack>
                </HStack>
                <Text fontWeight="bold" color="green.600">
                  ${item.revenue.toLocaleString()}
                </Text>
              </HStack>
            ))}
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Peak Hours */}
      <CardWrapper>
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="semibold">Peak Hours</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack align="stretch" gap={3}>
            {analytics.performance.peak_hours.map((hour, index) => (
              <HStack key={hour.hour} justify="space-between" p={3} bg="bg.canvas" borderRadius="md">
                <HStack gap={3}>
                  <Badge colorPalette="orange" size="sm">#{index + 1}</Badge>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium" fontSize="sm">
                      {hour.hour.toString().padStart(2, '0')}:00 - {(hour.hour + 1).toString().padStart(2, '0')}:00
                    </Text>
                    <Text fontSize="xs" color="gray.500">{hour.orders} orders</Text>
                  </VStack>
                </HStack>
                <Text fontWeight="bold" color="orange.600">
                  ${hour.revenue.toLocaleString()}
                </Text>
              </HStack>
            ))}
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    </Grid>
  );
};
