import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Alert,
  Skeleton,
  Tabs,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui';
import {
  ChartBarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useAdvancedSalesAnalytics } from './hooks';
import { DashboardHeader } from './components/DashboardHeader';
import { OverviewTab } from './components/OverviewTab';
import { PerformanceTab } from './components/PerformanceTab';
import { CustomersTab } from './components/CustomersTab';
import { PredictionsTab } from './components/PredictionsTab';

export const AdvancedSalesAnalyticsDashboard: React.FC = () => {
  const {
    analytics,
    loading,
    error,
    dateRange,
    setDateRange,
    refreshInterval,
    setRefreshInterval,
    loadAnalytics,
  } = useAdvancedSalesAnalytics();

  if (error && !analytics) {
    return (
      <Alert status="error">
        <Alert.Indicator>
          <ExclamationTriangleIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Description>{error}</Alert.Description>
        <Button onClick={loadAnalytics} variant="outline" size="sm" ml={4}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap={6}>
        <DashboardHeader
          analytics={analytics}
          dateRange={dateRange}
          setDateRange={setDateRange}
          loading={loading}
          onRefresh={loadAnalytics}
        />

        {loading && !analytics ? (
          <VStack gap={4}>
            <Skeleton height="200px" />
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              <Skeleton height="150px" />
              <Skeleton height="150px" />
              <Skeleton height="150px" />
              <Skeleton height="150px" />
            </Grid>
          </VStack>
        ) : analytics ? (
          <Tabs.Root defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">
                <ChartBarIcon className="w-4 h-4" />
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger value="performance">
                <TrophyIcon className="w-4 h-4" />
                Performance
              </Tabs.Trigger>
              <Tabs.Trigger value="customers">
                <UsersIcon className="w-4 h-4" />
                Customers
              </Tabs.Trigger>
              <Tabs.Trigger value="predictions">
                <BoltIcon className="w-4 h-4" />
                Predictions
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview">
              <OverviewTab analytics={analytics} />
            </Tabs.Content>

            <Tabs.Content value="performance">
              <PerformanceTab analytics={analytics} />
            </Tabs.Content>

            <Tabs.Content value="customers">
              <CustomersTab analytics={analytics} />
            </Tabs.Content>

            <Tabs.Content value="predictions">
              <PredictionsTab analytics={analytics} />
            </Tabs.Content>
          </Tabs.Root>
        ) : null}

        {/* Real-time Status */}
        <CardWrapper bg="bg.canvas">
          <CardWrapper.Body p={3}>
            <HStack justify="center" gap={4}>
              <HStack gap={2}>
                <Box width="8px" height="8px"  borderRadius="50%" />
                <Text fontSize="sm" color="gray.600">
                  Last updated: {new Date().toLocaleTimeString()}
                </Text>
              </HStack>
              <Button size="sm" variant="ghost" onClick={() => setRefreshInterval(refreshInterval ? null : 30)}>
                {refreshInterval ? 'Stop Auto-refresh' : 'Enable Auto-refresh'}
              </Button>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      </VStack>
    </Box>
  );
};
