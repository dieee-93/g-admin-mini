import React from 'react';
import { VStack } from '@chakra-ui/react';
import { useSalesIntelligence } from './hooks';
import { DashboardHeader } from './components/DashboardHeader';
import { MetricCardsGrid } from './components/MetricCardsGrid';
import { RealTimeMetrics } from './components/RealTimeMetrics';
import { BusinessAlerts } from './components/BusinessAlerts';
import { MenuPerformance } from './components/MenuPerformance';
import { PeakHoursAnalysis } from './components/PeakHoursAnalysis';
import type { SalesAnalytics } from '../../../../types';

interface SalesIntelligenceDashboardProps {
  analytics: SalesAnalytics;
  onDateRangeChange: (dateFrom: string, dateTo: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  realTimeUpdates?: boolean;
}

export function SalesIntelligenceDashboard({
  analytics,
  onDateRangeChange,
  onRefresh,
  isLoading = false,
  realTimeUpdates = true
}: SalesIntelligenceDashboardProps) {
  const {
    selectedTimeRange,
    selectedMetricCategory,
    setSelectedMetricCategory,
    currentMetrics,
    formatMetricValue,
    getTrendInfo,
    handleTimeRangeChange,
  } = useSalesIntelligence(analytics, onDateRangeChange);

  return (
    <VStack gap="6" align="stretch">
      <DashboardHeader
        realTimeUpdates={realTimeUpdates}
        selectedTimeRange={selectedTimeRange}
        selectedMetricCategory={selectedMetricCategory}
        onTimeRangeChange={handleTimeRangeChange}
        onMetricCategoryChange={setSelectedMetricCategory}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
      <MetricCardsGrid
        metrics={currentMetrics}
        formatValue={formatMetricValue}
        getTrendInfo={getTrendInfo}
      />
      <RealTimeMetrics analytics={analytics} />
      <BusinessAlerts analytics={analytics} />
      <MenuPerformance analytics={analytics} />
      <PeakHoursAnalysis analytics={analytics} />
    </VStack>
  );
}
