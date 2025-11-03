// src/components/charts/SalesAnalyticsChart.tsx
// Sales analytics and trends chart component

import React from 'react';
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { Icon, CardWrapper } from '@/shared/ui';
import { ChartBarIcon } from '@heroicons/react/24/outline';

interface SalesData {
  period: string;
  sales: number;
  orders: number;
  avgOrder: number;
}

interface SalesAnalyticsChartProps {
  data?: SalesData[];
  title?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  height?: number;
}

const mockData: SalesData[] = [
  { period: 'Mon', sales: 1200, orders: 15, avgOrder: 80 },
  { period: 'Tue', sales: 1450, orders: 18, avgOrder: 80.5 },
  { period: 'Wed', sales: 1100, orders: 12, avgOrder: 91.7 },
  { period: 'Thu', sales: 1650, orders: 21, avgOrder: 78.6 },
  { period: 'Fri', sales: 2100, orders: 28, avgOrder: 75 },
  { period: 'Sat', sales: 2400, orders: 32, avgOrder: 75 },
  { period: 'Sun', sales: 1800, orders: 24, avgOrder: 75 }
];

export default function SalesAnalyticsChart({ 
  data = mockData,
  title = "Sales Analytics",
  period = 'daily',
  height = 400 
}: SalesAnalyticsChartProps) {
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack justify="space-between">
          <HStack gap="2">
            <Icon icon={ChartBarIcon} size="lg" color="blue.600" />
            <Text fontSize="lg" fontWeight="semibold">
              {title}
            </Text>
          </HStack>
          <Badge colorPalette="blue" variant="subtle" textTransform="capitalize">
            {period}
          </Badge>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <VStack gap="4" align="stretch">
          {/* Summary Stats */}
          <HStack justify="space-around" p="4" bg="blue.50" borderRadius="md">
            <VStack gap="1">
              <Text fontSize="sm" color="gray.600">Total Sales</Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                ${totalSales.toLocaleString()}
              </Text>
            </VStack>
            <VStack gap="1">
              <Text fontSize="sm" color="gray.600">Total Orders</Text>
              <Text fontSize="xl" fontWeight="bold" color="green.600">
                {totalOrders}
              </Text>
            </VStack>
            <VStack gap="1">
              <Text fontSize="sm" color="gray.600">Avg Order</Text>
              <Text fontSize="xl" fontWeight="bold" color="purple.600">
                ${avgOrderValue.toFixed(2)}
              </Text>
            </VStack>
          </HStack>

          {/* Chart Placeholder */}
          <Box 
            height={height} 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            border="2px dashed"
            borderColor="border.default"
            borderRadius="md"
          >
            <VStack gap="2">
              <Icon icon={ChartBarIcon} size="3xl" color="gray.400" />
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Sales trend chart placeholder
              </Text>
              <Text fontSize="xs" color="gray.500">
                Chart library integration needed (Chart.js, Recharts, etc.)
              </Text>
            </VStack>
          </Box>

          {/* Data Table */}
          <Box fontSize="sm">
            <Text fontSize="sm" fontWeight="semibold" mb="2">Data Preview</Text>
            {data.slice(0, 3).map((item, index) => (
              <HStack key={index} justify="space-between" py="1">
                <Text>{item.period}</Text>
                <HStack gap="4">
                  <Text>${item.sales}</Text>
                  <Text color="green.600">{item.orders} orders</Text>
                  <Text color="purple.600">${item.avgOrder.toFixed(2)} avg</Text>
                </HStack>
              </HStack>
            ))}
          </Box>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export { SalesAnalyticsChart };
export type { SalesData };