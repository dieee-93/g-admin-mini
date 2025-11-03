import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CompetitorData, MarketTrend, MarketInsight } from '../types';
import { generateMockCompetitiveData } from '../../dashboard/data/mockData';
import { EventBus } from '@/lib/events';

import { logger } from '@/lib/logging';
export const useCompetitiveIntelligence = () => {
  // State management
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'pricing' | 'trends' | 'insights'>('overview');

  // Filters
  const [competitorTypeFilter, setCompetitorTypeFilter] = useState('all');
  const [marketPositionFilter, setMarketPositionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadCompetitiveData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
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
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar inteligencia competitiva';
      setError(errorMessage);
      logger.error('App', 'Error loading competitive intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load competitive intelligence data
  useEffect(() => {
    loadCompetitiveData();
  }, [loadCompetitiveData]);

  // ⏱️ Timeout de 10 segundos
  useEffect(() => {
    if (!isLoading) return;

    const timeout = setTimeout(() => {
      if (isLoading) {
        setError('Servicio no disponible. Por favor, intenta de nuevo más tarde.');
        setIsLoading(false);
        logger.error('App', 'Intelligence page loading timeout after 10 seconds');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Refresh competitive intelligence
  const refreshIntelligence = useCallback(async () => {
    await loadCompetitiveData();

    // Emit refresh event
    await EventBus.emit(
      'system.data_synced',
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
    error,
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
    marketOverview,
    retry: loadCompetitiveData,
  };
};
