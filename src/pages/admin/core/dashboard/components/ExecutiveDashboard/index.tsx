import {
  Box,
  VStack,
  Skeleton,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';

import { useExecutiveData } from './hooks/useExecutiveData';
import { DashboardHeader } from './components/DashboardHeader';
import { QuickStats } from './components/QuickStats';
import { DashboardTabs } from './components/DashboardTabs';

// Component
export function ExecutiveDashboard() {
  const {
    kpis,
    insights,
    summary,
    loading,
    activeTab,
    selectedPeriod,
    selectedCategory,
    isRefreshing,
    filteredKPIs,
    dashboardMetrics,
    setActiveTab,
    setSelectedPeriod,
    setSelectedCategory,
    refreshDashboard
  } = useExecutiveData();

  // Get trend icon and color
  const getTrendDisplay = (trend: string, changeType?: string) => {
    if (trend === 'up' || (changeType === 'increase')) {
      return { icon: ArrowTrendingUpIcon, color: 'green' };
    } else if (trend === 'down' || (changeType === 'decrease')) {
      return { icon: ArrowTrendingDownIcon, color: 'red' };
    }
    return { icon: ChartBarIcon, color: 'blue' };
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  // Get performance color
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      default: return 'red';
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack gap={6} align="stretch">
          <Skeleton height="80px" />
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="120px" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <DashboardHeader
          summary={summary}
          selectedPeriod={selectedPeriod}
          isRefreshing={isRefreshing}
          onPeriodChange={setSelectedPeriod}
          onRefresh={refreshDashboard}
          getPerformanceColor={getPerformanceColor}
        />

        <QuickStats kpis={kpis} dashboardMetrics={dashboardMetrics} />

        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          summary={summary}
          insights={insights}
          filteredKPIs={filteredKPIs}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          getTrendDisplay={getTrendDisplay}
          getPriorityColor={getPriorityColor}
        />
      </VStack>
    </Box>
  );
}
