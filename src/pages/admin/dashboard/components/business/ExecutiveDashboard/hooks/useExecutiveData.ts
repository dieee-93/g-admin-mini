import { useState, useEffect, useMemo, useCallback } from 'react';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import {
  ExecutiveKPI,
  StrategicInsight,
  ExecutiveSummary,
  ExecutiveDashboardConfig,
} from '../types';
import {
  generateMockExecutiveKPIs,
  generateMockStrategicInsights,
  generateMockExecutiveSummary,
} from '../data/ExecutiveDashboard.mock';

export const useExecutiveData = () => {
  // State
  const [kpis, setKpis] = useState<ExecutiveKPI[]>([]);
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'insights' | 'correlations' | 'actions'>('overview');
  const [config, setConfig] = useState<ExecutiveDashboardConfig>({
    refreshInterval: 30,
    aiInsightsEnabled: true,
    alertThresholds: {
      revenue: -5,
      profitability: -3,
      customerSatisfaction: -0.2,
      operationalEfficiency: -5
    },
    displayPeriod: 'monthly',
    kpiTargets: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data
  useEffect(() => {
    const loadExecutiveData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockKPIs = generateMockExecutiveKPIs();
        const mockInsights = generateMockStrategicInsights();
        const mockSummary = generateMockExecutiveSummary();

        setKpis(mockKPIs);
        setInsights(mockInsights);
        setSummary(mockSummary);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error loading executive dashboard data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadExecutiveData();
  }, [selectedPeriod]);

  // Auto refresh
  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, config.refreshInterval * 60000);

      return () => clearInterval(interval);
    }
  }, [config.refreshInterval]);

  // Filtered KPIs
  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return kpis;
    return kpis.filter(kpi => kpi.category === selectedCategory);
  }, [kpis, selectedCategory]);

  // Dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (kpis.length === 0) return null;

    const criticalKPIs = kpis.filter(kpi => kpi.priority === 'critical').length;
    const improvingKPIs = kpis.filter(kpi => kpi.changeType === 'increase').length;
    const decliningKPIs = kpis.filter(kpi => kpi.changeType === 'decrease').length;
    const targetsMet = kpis.filter(kpi => kpi.target && kpi.value >= kpi.target).length;
    const kpisWithTargets = kpis.filter(kpi => kpi.target).length;

    return {
      criticalKPIs,
      improvingKPIs,
      decliningKPIs,
      targetsMet,
      targetAchievementRate: kpisWithTargets > 0 ? (targetsMet / kpisWithTargets) * 100 : 0
    };
  }, [kpis]);

  // Refresh dashboard
  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update KPIs with small variations
      const updatedKPIs = kpis.map(kpi => ({
        ...kpi,
        value: kpi.value * (1 + (Math.random() - 0.5) * 0.02), // ±1% variation
        change: kpi.change + (Math.random() - 0.5) * 0.5,
        lastUpdated: new Date().toISOString()
      }));

      setKpis(updatedKPIs);

      // Emit refresh event
      await EventBus.emit(RestaurantEvents.DATA_SYNCED, {
        type: 'executive_dashboard_refreshed',
        kpisUpdated: updatedKPIs.length,
        insightsCount: insights.length,
        overallScore: summary?.financialHealth.score || 0,
        period: selectedPeriod
      }, 'ExecutiveDashboard');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error refreshing dashboard: ${errorMessage}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [kpis, insights.length, summary, selectedPeriod]);

  return {
    kpis,
    insights,
    summary,
    loading,
    activeTab,
    config,
    selectedPeriod,
    selectedCategory,
    isRefreshing,
    filteredKPIs,
    dashboardMetrics,
    setActiveTab,
    setSelectedPeriod,
    setSelectedCategory,
    refreshDashboard
  };
};
