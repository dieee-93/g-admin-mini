import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Alert,
  CardWrapper
} from '@/shared/ui';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import type { SalesAnalytics } from '../../../../../types';

interface BusinessAlertsProps {
  analytics: SalesAnalytics;
}

export const BusinessAlerts: React.FC<BusinessAlertsProps> = ({ analytics }) => {
  if (!analytics?.alerts_and_insights?.length) {
    return null;
  }

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack gap="2">
          <LightBulbIcon className="w-5 h-5 text-yellow-500" />
          <Text fontWeight="bold">Business Insights & Alerts</Text>
        </HStack>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <VStack gap="3" align="stretch">
          {(analytics?.alerts_and_insights || []).map((alert, index) => (
            <Alert
              key={index}
              status={
                alert.type === 'critical' ? 'error' :
                alert.type === 'warning' ? 'warning' :
                'info'
              }
            >
              <Alert.Indicator />
              <VStack align="start" flex="1" gap="1">
                <Alert.Title>{alert.message}</Alert.Title>
                {alert.suggested_action && (
                  <Alert.Description>
                    Recommendation: {alert.suggested_action}
                  </Alert.Description>
                )}
              </VStack>
              <Badge
                size="sm"
                colorPalette={
                  alert.impact === 'high' ? 'red' :
                  alert.impact === 'medium' ? 'yellow' :
                  'blue'
                }
              >
                {alert.impact} impact
              </Badge>
            </Alert>
          ))}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
