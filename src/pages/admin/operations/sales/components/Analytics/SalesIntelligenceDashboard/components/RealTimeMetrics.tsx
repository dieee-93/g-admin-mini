import React from 'react';
import {
  HStack,
  Text,
  Badge,
  Grid,
  Stat,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import type { SalesAnalytics } from '../../../../../types';

interface RealTimeMetricsProps {
  analytics: SalesAnalytics;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ analytics }) => {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack justify="space-between" align="center">
          <Text fontWeight="bold">Real-time Performance</Text>
          <Badge colorPalette="blue" size="sm">Live Updates</Badge>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap="4">
          <Stat>
            <Stat.Label>Current Revenue</Stat.Label>
            <Stat.Value>
              ${(analytics?.current_day_metrics?.current_revenue || 0).toLocaleString()}
            </Stat.Value>
          </Stat>

          <Stat>
            <Stat.Label>Orders in Progress</Stat.Label>
            <Stat.Value>
              {analytics?.current_day_metrics?.orders_in_progress || 0}
            </Stat.Value>
          </Stat>

          <Stat>
            <Stat.Label>Tables Occupied</Stat.Label>
            <Stat.Value>
              {analytics?.current_day_metrics?.tables_occupied || 0}
            </Stat.Value>
          </Stat>

          <Stat>
            <Stat.Label>Avg Wait Time</Stat.Label>
            <Stat.Value>
              {Math.round(analytics?.current_day_metrics?.average_wait_time || 0)}m
            </Stat.Value>
          </Stat>

          <Stat>
            <Stat.Label>Kitchen Backlog</Stat.Label>
            <Stat.Value color={(analytics?.current_day_metrics?.kitchen_backlog || 0) > 10 ? 'red.500' : 'green.500'}>
              {analytics?.current_day_metrics?.kitchen_backlog || 0}
            </Stat.Value>
          </Stat>
        </Grid>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
