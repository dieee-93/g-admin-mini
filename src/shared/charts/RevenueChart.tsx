// src/components/charts/RevenueChart.tsx
// Revenue analytics chart component

import React from 'react';
import { Box, CardWrapper , Text, VStack } from '@chakra-ui/react';

interface RevenueChartProps {
  data?: number[];
  labels?: string[];
  title?: string;
  height?: number;
}

export default function RevenueChart({ 
  data = [], 
  labels = [],
  title = "Revenue Analytics",
  height = 300 
}: RevenueChartProps) {
  return (
    <CardWrapper .Root>
      <CardWrapper .Header>
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
      </CardWrapper .Header>
      <CardWrapper .Body>
        <Box height={height} display="flex" alignItems="center" justifyContent="center">
          <VStack gap={2}>
            <Text color="gray.500">📊</Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              Revenue chart placeholder
            </Text>
            <Text fontSize="xs" color="gray.500">
              Integration with charting library needed
            </Text>
          </VStack>
        </Box>
      </CardWrapper .Body>
    </CardWrapper .Root>
  );
}

export { RevenueChart };