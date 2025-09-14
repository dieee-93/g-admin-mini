import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import type { SalesAnalytics } from '../../../../../types';

interface MenuPerformanceProps {
  analytics: SalesAnalytics;
}

export const MenuPerformance: React.FC<MenuPerformanceProps> = ({ analytics }) => {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">Top Performing Menu Items</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap="4">
          {(analytics?.menu_item_performance || []).slice(0, 6).map((item, index) => (
            <CardWrapper key={index} p="3" variant="outline">
              <HStack justify="space-between" align="center">
                <VStack align="start" gap="1">
                  <Text fontWeight="medium">{item.item_name}</Text>
                  <HStack gap="2">
                    <Text fontSize="sm" color="gray.600">
                      {item.units_sold} sold
                    </Text>
                    <Badge
                      size="sm"
                      colorPalette={
                        item.trend === 'up' ? 'green' :
                        item.trend === 'down' ? 'red' :
                        'gray'
                      }
                    >
                      {item.popularity}
                    </Badge>
                  </HStack>
                </VStack>

                <VStack align="end" gap="1">
                  <Text fontWeight="bold" color="green.600">
                    ${item.revenue_contribution.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {item.profit_margin.toFixed(1)}% margin
                  </Text>
                </VStack>
              </HStack>
            </CardWrapper>
          ))}
        </Grid>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
