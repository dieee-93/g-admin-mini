import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Grid,
  CardWrapper
} from '@/shared/ui';
import { LightBulbIcon } from '@heroicons/react/24/outline';

export const AIRecommendations: React.FC = () => {
  return (
    <CardWrapper bg="gradient-to-r from-teal-500 to-cyan-600" color="white">
      <CardWrapper.Body p="6">
        <VStack align="stretch" gap="4">
          <HStack gap="3">
            <LightBulbIcon className="w-8 h-8" />
            <Text fontSize="xl" fontWeight="bold">AI-Powered Recommendations</Text>
          </HStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
            <VStack align="start" gap="3" p="4" bg="whiteAlpha.200" borderRadius="md">
              <Text fontWeight="bold">🚀 Revenue Growth</Text>
              <Text fontSize="sm">Implement dynamic pricing during peak hours</Text>
              <Text fontSize="sm">Focus on high-margin items promotion</Text>
              <Text fontSize="sm">Expand delivery options to capture 15% more market</Text>
            </VStack>

            <VStack align="start" gap="3" p="4" bg="whiteAlpha.200" borderRadius="md">
              <Text fontWeight="bold">⚡ Operational Efficiency</Text>
              <Text fontSize="sm">Optimize staff scheduling for peak times</Text>
              <Text fontSize="sm">Implement predictive inventory management</Text>
              <Text fontSize="sm">Reduce fulfillment time by 2 minutes</Text>
            </VStack>

            <VStack align="start" gap="3" p="4" bg="whiteAlpha.200" borderRadius="md">
              <Text fontWeight="bold">👥 Customer Experience</Text>
              <Text fontSize="sm">Launch targeted retention campaigns</Text>
              <Text fontSize="sm">Personalize menu recommendations</Text>
              <Text fontSize="sm">Implement loyalty program for high-value customers</Text>
            </VStack>
          </Grid>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
