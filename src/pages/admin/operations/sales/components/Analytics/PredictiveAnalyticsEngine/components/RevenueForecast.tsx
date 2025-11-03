import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { PredictiveMetrics } from '../types';

interface RevenueForecastProps {
  analytics: PredictiveMetrics;
}

export const RevenueForecast: React.FC<RevenueForecastProps> = ({ analytics }) => {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack gap="2">
          <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
          <Text fontSize="lg" fontWeight="semibold">Revenue Forecasting</Text>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          <VStack align="center" gap="3" p="4"  borderRadius="md">
            <Text fontSize="sm" color="gray.600">Next 7 Days</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              ${analytics.revenue_forecast.next_7_days.toLocaleString()}
            </Text>
            <Badge colorPalette="green">+12.5%</Badge>
          </VStack>

          <VStack align="center" gap="3" p="4" bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">Next 30 Days</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              ${analytics.revenue_forecast.next_30_days.toLocaleString()}
            </Text>
            <Badge colorPalette="blue">+18.2%</Badge>
          </VStack>

          <VStack align="center" gap="3" p="4" bg="purple.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">Next Quarter</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              ${analytics.revenue_forecast.next_quarter.toLocaleString()}
            </Text>
            <Badge colorPalette="purple">+25.7%</Badge>
          </VStack>
        </SimpleGrid>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
