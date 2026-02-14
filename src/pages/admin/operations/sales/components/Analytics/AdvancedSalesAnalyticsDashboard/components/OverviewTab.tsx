import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  Progress,
  SimpleGrid,
  CardWrapper,
  CircularProgress
} from '@/shared/ui';

import {
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import type { AdvancedSalesAnalytics } from '../types';

interface OverviewTabProps {
  analytics: AdvancedSalesAnalytics;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ analytics }) => {
    const getTrendColor = (value: number) => value > 0 ? 'green' : 'red';

  return (
    <VStack align="stretch" gap="6">
      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
        <CardWrapper borderTop="4px solid" borderTopColor="green.400">
          <CardWrapper.Body p="4">
            <VStack gap="3">
              <HStack justify="space-between" width="full">
                <CurrencyDollarIcon className="w-6 h-6 text-green-500" />
                <Badge colorPalette={getTrendColor(analytics.revenue.growth)}>
                  +{analytics.revenue.growth.toFixed(1)}%
                </Badge>
              </HStack>
              <VStack gap="1" width="full">
                <Text fontSize="sm" color="gray.600">Daily Revenue</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${analytics.revenue.daily.toLocaleString()}
                </Text>
              </VStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper borderTop="4px solid" borderTopColor="blue.400">
          <CardWrapper.Body p="4">
            <VStack gap="3">
              <HStack justify="space-between" width="full">
                <ClockIcon className="w-6 h-6 text-blue-500" />
                <Badge colorPalette="blue">
                  {analytics.orders.total} orders
                </Badge>
              </HStack>
              <VStack gap="1" width="full">
                <Text fontSize="sm" color="gray.600">Avg Order Value</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  ${analytics.orders.average_order_value.toFixed(2)}
                </Text>
              </VStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper borderTop="4px solid" borderTopColor="purple.400">
          <CardWrapper.Body p="4">
            <VStack gap="3">
              <HStack justify="space-between" width="full">
                <UsersIcon className="w-6 h-6 text-purple-500" />
                <CircularProgress value={analytics.customers.retention_rate} size="40px" color="purple.400">
                    <CircularProgressValueText fontSize="xs">
                        {analytics.customers.retention_rate.toFixed(0)}%
                    </CircularProgressValueText>
                </CircularProgress>
              </HStack>
              <VStack gap="1" width="full">
                <Text fontSize="sm" color="gray.600">Unique Customers</Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {analytics.customers.total_unique}
                </Text>
              </VStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper borderTop="4px solid" borderTopColor="orange.400">
          <CardWrapper.Body p="4">
            <VStack gap="3">
              <HStack justify="space-between" width="full">
                <TrophyIcon className="w-6 h-6 text-orange-500" />
                <Badge colorPalette="orange">
                  {analytics.performance.efficiency_score}/100
                </Badge>
              </HStack>
              <VStack gap="1" width="full">
                <Text fontSize="sm" color="gray.600">Profit Margin</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {analytics.performance.profit_margin.toFixed(1)}%
                </Text>
              </VStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Revenue Breakdown */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="6">
        <CardWrapper>
          <CardWrapper.Header>
            <Text fontSize="lg" fontWeight="semibold">Revenue Breakdown</Text>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <Text>Today</Text>
                <Text fontWeight="bold">${analytics.revenue.daily.toLocaleString()}</Text>
              </HStack>
              <Progress value={50} colorPalette="green" size="sm" />

              <HStack justify="space-between">
                <Text>This Week</Text>
                <Text fontWeight="bold">${analytics.revenue.weekly.toLocaleString()}</Text>
              </HStack>
              <Progress value={75} colorPalette="blue" size="sm" />

              <HStack justify="space-between">
                <Text>This Month</Text>
                <Text fontWeight="bold">${analytics.revenue.monthly.toLocaleString()}</Text>
              </HStack>
              <Progress value={90} colorPalette="purple" size="sm" />
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Header>
            <Text fontSize="lg" fontWeight="semibold">Key Metrics</Text>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <Text>Conversion Rate</Text>
                <Badge colorPalette="green">{analytics.orders.conversion_rate}%</Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Fulfillment Time</Text>
                <Badge colorPalette="blue">{analytics.orders.fulfillment_time} min</Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Returning Customers</Text>
                <Badge colorPalette="purple">{analytics.customers.returning_customers}</Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Efficiency Score</Text>
                <Badge colorPalette="orange">{analytics.performance.efficiency_score}/100</Badge>
              </HStack>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </Grid>
    </VStack>
  );
};
