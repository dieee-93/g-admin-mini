import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { PredictiveMetrics } from '../types';

interface OperationalIntelligenceProps {
  analytics: PredictiveMetrics;
}

export const OperationalIntelligence: React.FC<OperationalIntelligenceProps> = ({ analytics }) => {
    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
          case 'high': return 'red';
          case 'medium': return 'yellow';
          case 'low': return 'green';
          default: return 'gray';
        }
      };

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack gap="2">
          <ClockIcon className="w-6 h-6 text-orange-500" />
          <Text fontSize="lg" fontWeight="semibold">Operational Intelligence</Text>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="6">
          <VStack align="stretch" gap="4">
            <Text fontWeight="medium" color="orange.600">Peak Times Prediction</Text>
            {analytics.operational_intelligence.peak_times.map((peak, index) => (
              <HStack key={index} justify="space-between" p="3" bg="orange.50" borderRadius="md">
                <VStack align="start" gap="0">
                  <Text fontWeight="medium" fontSize="sm">
                    {peak.day} at {peak.hour.toString().padStart(2, '0')}:00
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {peak.predicted_volume} orders predicted
                  </Text>
                </VStack>
                <Badge colorPalette="orange">
                  {peak.recommended_staffing} staff
                </Badge>
              </HStack>
            ))}
          </VStack>

          <VStack align="stretch" gap="4">
            <Text fontWeight="medium" color="red.600">Inventory Alerts</Text>
            {analytics.operational_intelligence.inventory_alerts.map((alert, index) => (
              <HStack key={index} justify="space-between" p="3" bg="red.50" borderRadius="md">
                <VStack align="start" gap="0">
                  <Text fontWeight="medium" fontSize="sm">{alert.item}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {alert.current_stock} left, {alert.predicted_demand} needed
                  </Text>
                </VStack>
                <Badge colorPalette={getUrgencyColor(alert.urgency)} size="sm">
                  {alert.urgency}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Grid>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
