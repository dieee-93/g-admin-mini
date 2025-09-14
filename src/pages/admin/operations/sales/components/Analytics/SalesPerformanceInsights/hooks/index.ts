import { useState, useEffect } from 'react';
import { generatePerformanceInsights } from '../data';
import type { PerformanceMetrics, PerformanceInsight } from '../types';
import {
    CheckCircleIcon,
    ClockIcon,
    FireIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
  } from '@heroicons/react/24/outline';

export const usePerformanceInsights = () => {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadPerformanceInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const performanceData = generatePerformanceInsights();
      setPerformance(performanceData);
    } catch (err) {
      console.error('Error loading performance insights:', err);
      setError('Failed to load performance insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceInsights();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'green';
      case 'efficiency': return 'blue';
      case 'customer': return 'purple';
      case 'operational': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'green';
      case 'warning': return 'yellow';
      case 'critical': return 'red';
      case 'opportunity': return 'blue';
      default: return 'gray';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return FireIcon;
      case 'medium': return ClockIcon;
      case 'low': return CheckCircleIcon;
      default: return BoltIcon;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowTrendingUpIcon;
      case 'down': return ArrowTrendingDownIcon;
      default: return ClockIcon;
    }
  };

  const filteredInsights = selectedCategory === 'all'
    ? performance?.insights || []
    : performance?.insights.filter(insight => insight.category === selectedCategory) || [];

  return {
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
  };
};
