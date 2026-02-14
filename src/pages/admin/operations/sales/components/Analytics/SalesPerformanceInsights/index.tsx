import React from 'react';
import {
  Box,
  VStack,
  Button,
  Grid,
  Alert,
  Skeleton,
  Tabs,
} from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  ChartBarIcon,
  LightBulbIcon,
  TrophyIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceInsights } from './hooks';
import { PerformanceHeader } from './components/PerformanceHeader';
import { OverviewTab } from './components/OverviewTab';
import { InsightsTab } from './components/InsightsTab';
import { BenchmarksTab } from './components/BenchmarksTab';
import { RecommendationsTab } from './components/RecommendationsTab';

export const SalesPerformanceInsights: React.FC = () => {
  const {
    performance,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    loadPerformanceInsights,
    getCategoryColor,
    getTypeColor,
    getImpactIcon,
    getTrendIcon,
    filteredInsights,
  } = usePerformanceInsights();

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator>
          <ExclamationTriangleIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Description>{error}</Alert.Description>
        <Button onClick={loadPerformanceInsights} variant="outline" size="sm" ml="4">
          Retry
        </Button>
      </Alert.Root>
    );
  }

  return (
    <Box>
      <VStack align="stretch" gap="6">
        <PerformanceHeader
          performance={performance}
          loading={loading}
          onRefresh={loadPerformanceInsights}
        />

        {loading && !performance ? (
          <VStack gap="4">
            <Skeleton height="200px" />
            <Grid templateColumns="repeat(4, 1fr)" gap="4">
              <Skeleton height="120px" />
              <Skeleton height="120px" />
              <Skeleton height="120px" />
              <Skeleton height="120px" />
            </Grid>
          </VStack>
        ) : performance ? (
          <Tabs.Root defaultValue="overview">
            <Tabs.List>
              <Tabs.Trigger value="overview">
                <ChartBarIcon className="w-4 h-4" />
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger value="insights">
                <LightBulbIcon className="w-4 h-4" />
                Insights
              </Tabs.Trigger>
              <Tabs.Trigger value="benchmarks">
                <TrophyIcon className="w-4 h-4" />
                Benchmarks
              </Tabs.Trigger>
              <Tabs.Trigger value="recommendations">
                <BoltIcon className="w-4 h-4" />
                Action Plan
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview">
              <OverviewTab
                performance={performance}
                getCategoryColor={getCategoryColor}
                getTypeColor={getTypeColor}
              />
            </Tabs.Content>

            <Tabs.Content value="insights">
              <InsightsTab
                insights={filteredInsights}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                getCategoryColor={getCategoryColor}
                getTypeColor={getTypeColor}
                getImpactIcon={getImpactIcon}
                getTrendIcon={getTrendIcon}
              />
            </Tabs.Content>

            <Tabs.Content value="benchmarks">
              <BenchmarksTab performance={performance} />
            </Tabs.Content>

            <Tabs.Content value="recommendations">
              <RecommendationsTab performance={performance} />
            </Tabs.Content>
          </Tabs.Root>
        ) : null}
      </VStack>
    </Box>
  );
};
