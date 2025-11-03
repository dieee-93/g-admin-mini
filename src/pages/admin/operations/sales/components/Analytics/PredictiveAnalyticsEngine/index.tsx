import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Grid,
  Alert,
  Skeleton,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import {
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { usePredictiveAnalytics } from './hooks';
import { EngineHeader } from './components/EngineHeader';
import { RevenueForecast } from './components/RevenueForecast';
import { DemandForecasting } from './components/DemandForecasting';
import { CustomerIntelligence } from './components/CustomerIntelligence';
import { OperationalIntelligence } from './components/OperationalIntelligence';
import { MarketIntelligence } from './components/MarketIntelligence';
import { AIRecommendations } from './components/AIRecommendations';

export const PredictiveAnalyticsEngine: React.FC = () => {
  const {
    analytics,
    loading,
    error,
    selectedTimeframe,
    setSelectedTimeframe,
    loadPredictiveAnalytics,
  } = usePredictiveAnalytics();

  if (error) {
    return (
      <Alert status="error">
        <Alert.Indicator>
          <ExclamationTriangleIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Description>{error}</Alert.Description>
        <Button onClick={loadPredictiveAnalytics} variant="outline" size="sm" ml="4">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap="6">
        <EngineHeader
          analytics={analytics}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
          loading={loading}
          onRefresh={loadPredictiveAnalytics}
        />

        {loading && !analytics ? (
          <VStack gap="4">
            <Skeleton height="200px" />
            <Grid templateColumns="repeat(3, 1fr)" gap="4">
              <Skeleton height="150px" />
              <Skeleton height="150px" />
              <Skeleton height="150px" />
            </Grid>
          </VStack>
        ) : analytics ? (
          <VStack align="stretch" gap="6">
            <RevenueForecast analytics={analytics} />
            <DemandForecasting analytics={analytics} />
            <CustomerIntelligence analytics={analytics} />
            <OperationalIntelligence analytics={analytics} />
            <MarketIntelligence analytics={analytics} />
            <AIRecommendations />
          </VStack>
        ) : null}

        {/* Status */}
        <CardWrapper bg="bg.canvas">
          <CardWrapper.Body p="3">
            <HStack justify="center" gap="4">
              <HStack gap="2">
                <Box width="8px" height="8px" bg="indigo.500" borderRadius="50%" />
                <Text fontSize="sm" color="gray.600">
                  Predictive models last updated: {new Date().toLocaleString()}
                </Text>
              </HStack>
              <Badge colorPalette="indigo" size="sm">AI Engine Active</Badge>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      </VStack>
    </Box>
  );
};
