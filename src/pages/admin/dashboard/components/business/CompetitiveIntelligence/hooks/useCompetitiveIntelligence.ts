import { useState, useEffect, useMemo, useCallback } from 'react';
import { CompetitorData, MarketTrend, MarketInsight } from '../types';
import { generateMockCompetitiveData } from '../../../../data/mockData';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';

export const useCompetitiveIntelligence = () => {
  // State management
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'pricing' | 'trends' | 'insights'>('overview');

  // Filters
  const [competitorTypeFilter, setCompetitorTypeFilter] = useState('all');
  const [marketPositionFilter, setMarketPositionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load competitive intelligence data
  useEffect(() => {
    loadCompetitiveData();
  }, []);

  const loadCompetitiveData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockData = generateMockCompetitiveData();
      const mockCompetitors = mockData.competitors;
      const mockTrends = mockData.marketTrends;
      const mockInsights = [];

      setCompetitors(mockCompetitors);
      setMarketTrends(mockTrends);
      setMarketInsights(mockInsights);

    } catch (error) {
      console.error('Error loading competitive intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh competitive intelligence
  const refreshIntelligence = useCallback(async () => {
    await loadCompetitiveData();

    // Emit refresh event
    await EventBus.emit(
      RestaurantEvents.DATA_SYNCED,
      {
        type: 'competitive_intelligence_updated',
        competitorsCount: competitors.length,
        trendsCount: marketTrends.length,
        insightsCount: marketInsights.length
      },
      'CompetitiveIntelligence'
    );
  }, [competitors.length, marketTrends.length, marketInsights.length]);

  // Filter competitors
  const filteredCompetitors = useMemo(() => {
    return competitors.filter(competitor => {
      const matchesType = competitorTypeFilter === 'all' || competitor.type === competitorTypeFilter;
      const matchesPosition = marketPositionFilter === 'all' || competitor.performance.marketPosition === marketPositionFilter;
      const matchesSearch = searchTerm === '' ||
        competitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        competitor.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesPosition && matchesSearch;
    });
  }, [competitors, competitorTypeFilter, marketPositionFilter, searchTerm]);

  // Calculate market overview metrics
  const marketOverview = useMemo(() => {
    if (competitors.length === 0) return null;

    const totalRevenue = competitors.reduce((sum, c) => sum + c.businessMetrics.estimatedRevenue, 0);
    const averageRating = competitors.reduce((sum, c) => sum + c.performance.customerRating, 0) / competitors.length;
    const directCompetitors = competitors.filter(c => c.type === 'direct').length;
    const growingTrends = marketTrends.filter(t => t.trend === 'growing').length;
    const criticalInsights = marketInsights.filter(i => i.urgency === 'immediate').length;

    return {
      totalMarketSize: totalRevenue,
      averageRating,
      directCompetitors,
      totalCompetitors: competitors.length,
      growingTrends,
      criticalInsights
    };
  }, [competitors, marketTrends, marketInsights]);

  return {
    competitors,
    marketTrends,
    marketInsights,
    isLoading,
    activeTab,
    setActiveTab,
    competitorTypeFilter,
    setCompetitorTypeFilter,
    marketPositionFilter,
    setMarketPositionFilter,
    searchTerm,
    setSearchTerm,
    refreshIntelligence,
    filteredCompetitors,
    marketOverview
  };
};
