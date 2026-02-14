import React from 'react';
import {
  VStack,
  Text,
  Grid,
  CardWrapper
} from '@/shared/ui';
import type { SalesAnalytics } from '../../../../types';

interface PeakHoursAnalysisProps {
  analytics: SalesAnalytics;
}

export const PeakHoursAnalysis: React.FC<PeakHoursAnalysisProps> = ({ analytics }) => {
  return (
    <CardWrapper>
      <CardWrapper.Header>
        <Text fontWeight="bold">Peak Hours Analysis</Text>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap="3">
          {(analytics?.peak_hours_analysis || []).map((hour, index) => (
            <CardWrapper key={index} p="3" variant="outline">
              <VStack gap="2" align="center">
                <Text fontWeight="bold" fontSize="lg">{hour.time_slot}</Text>
                <VStack gap="1" align="center">
                  <Text fontSize="sm" color="gray.600">Avg Covers</Text>
                  <Text fontWeight="medium">{hour.average_covers}</Text>
                </VStack>
                <VStack gap="1" align="center">
                  <Text fontSize="sm" color="gray.600">Revenue</Text>
                  <Text fontWeight="medium" color="green.600">
                    ${hour.revenue_contribution.toLocaleString()}
                  </Text>
                </VStack>
                <Text fontSize="xs" color="blue.600">
                  Staff: {hour.staffing_recommendation}
                </Text>
              </VStack>
            </CardWrapper>
          ))}
        </Grid>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
