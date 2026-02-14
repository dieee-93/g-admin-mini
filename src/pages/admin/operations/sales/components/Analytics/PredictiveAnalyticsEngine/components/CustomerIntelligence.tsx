import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  Progress,
  Alert,
  CardWrapper
} from '@/shared/ui';
import type { PredictiveMetrics } from '../types';

interface CustomerIntelligenceProps {
  analytics: PredictiveMetrics;
}

export const CustomerIntelligence: React.FC<CustomerIntelligenceProps> = ({ analytics }) => {
  return (
    <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="6">
      <CardWrapper>
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="semibold">Churn Prediction</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack align="stretch" gap="4">
            <HStack justify="space-between">
              <Text>At-Risk Customers</Text>
              <Badge colorPalette="red" size="lg">
                {analytics.customer_insights.churn_prediction.at_risk_customers}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <Text>Predicted Churn Rate</Text>
              <Text fontWeight="bold" color="red.500">
                {analytics.customer_insights.churn_prediction.churn_rate}%
              </Text>
            </HStack>

            <Progress value={analytics.customer_insights.churn_prediction.churn_rate} colorPalette="red" size="sm" />

            <Alert status="warning" size="sm">
              <Alert.Description>
                <strong>{analytics.customer_insights.churn_prediction.prevention_opportunities}</strong> customers
                can be retained with targeted campaigns
              </Alert.Description>
            </Alert>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      <CardWrapper>
        <CardWrapper.Header>
          <Text fontSize="lg" fontWeight="semibold">Customer Lifetime Value</Text>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack align="stretch" gap="4">
            <HStack justify="space-between">
              <Text>Average CLV</Text>
              <Text fontSize="xl" fontWeight="bold" color="green.600">
                ${analytics.customer_insights.lifetime_value.average_clv}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text>High-Value Segments</Text>
              <Badge colorPalette="green">
                {analytics.customer_insights.lifetime_value.high_value_segments}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <Text>Growth Potential</Text>
              <Text fontWeight="bold" color="blue.500">
                +{analytics.customer_insights.lifetime_value.growth_potential}%
              </Text>
            </HStack>

            <Alert status="success" size="sm">
              <Alert.Description>
                CLV optimization could increase revenue by 23.5%
              </Alert.Description>
            </Alert>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    </Grid>
  );
};
