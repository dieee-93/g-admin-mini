import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Grid,
  Alert,
  SimpleGrid,
  CardWrapper
} from '@/shared/ui';
import {
  ArrowTrendingUpIcon,
  LightBulbIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import type { AdvancedSalesAnalytics } from '../types';

interface PredictionsTabProps {
  analytics: AdvancedSalesAnalytics;
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ analytics }) => {
  return (
    <VStack align="stretch" gap="6">
      <CardWrapper bg="gradient-to-r from-purple-500 to-pink-500" color="white">
        <CardWrapper.Body p="6">
          <VStack align="center" gap="4">
            <BoltIcon className="w-12 h-12" />
            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
              Predictive Analytics & Forecasting
            </Text>
            <Text textAlign="center" opacity={0.9}>
              AI-powered insights for strategic business decisions
            </Text>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        <CardWrapper>
          <CardWrapper.Header>
            <HStack gap="2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
              <Text fontSize="lg" fontWeight="semibold" color="green.600">Revenue Forecast</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <HStack justify="space-between">
                <Text>Next Week Projected</Text>
                <Text fontSize="xl" fontWeight="bold" color="green.600">
                  ${analytics.predictions.next_week_revenue.toLocaleString()}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text>Customer Lifetime Value</Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  ${analytics.predictions.customer_lifetime_value.toFixed(2)}
                </Text>
              </HStack>

              <Alert status="info" size="sm">
                <Alert.Description>
                  Based on current trends, expect 15% growth in the next quarter
                </Alert.Description>
              </Alert>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper>
          <CardWrapper.Header>
            <HStack gap="2">
              <LightBulbIcon className="w-5 h-5 text-yellow-500" />
              <Text fontSize="lg" fontWeight="semibold" color="yellow.600">Smart Insights</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="4">
              <Alert status="warning" size="sm">
                <Alert.Description>
                  <strong>{analytics.predictions.inventory_alerts}</strong> items need restocking soon
                </Alert.Description>
              </Alert>

              <Alert status="success" size="sm">
                <Alert.Description>
                  {analytics.predictions.seasonal_trends}
                </Alert.Description>
              </Alert>

              <Alert status="info" size="sm">
                <Alert.Description>
                  Optimal pricing detected: Consider 5% increase on top items
                </Alert.Description>
              </Alert>
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      <CardWrapper>
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="semibold">Strategic Recommendations</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="6">
            <VStack align="stretch" gap="3">
              <Text fontWeight="medium" color="green.600">🚀 Revenue Optimization</Text>
              <Text fontSize="sm">• Focus on peak hours (7-9 PM) for premium pricing</Text>
              <Text fontSize="sm">• Bundle top-performing items for higher AOV</Text>
              <Text fontSize="sm">• Implement dynamic pricing during high demand</Text>
            </VStack>

            <VStack align="stretch" gap="3">
              <Text fontWeight="medium" color="blue.600">👥 Customer Experience</Text>
              <Text fontSize="sm">• Reduce fulfillment time to under 15 minutes</Text>
              <Text fontSize="sm">• Create loyalty program for returning customers</Text>
              <Text fontSize="sm">• Personalized recommendations for new customers</Text>
            </VStack>
          </Grid>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
};
