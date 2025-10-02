import { useState, useEffect } from 'react';
import { generatePredictiveAnalytics } from '../data';
import type { PredictiveMetrics, Timeframe } from '../types';

import { logger } from '@/lib/logging';
export const usePredictiveAnalytics = () => {
  const [analytics, setAnalytics] = useState<PredictiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('week');

  const loadPredictiveAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const predictiveData = generatePredictiveAnalytics();
      setAnalytics(predictiveData);
    } catch (err) {
      logger.error('SalesStore', 'Error loading predictive analytics:', err);
      setError('Failed to load predictive analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictiveAnalytics();
  }, [selectedTimeframe]);

  return {
    analytics,
    loading,
    error,
    selectedTimeframe,
    setSelectedTimeframe,
    loadPredictiveAnalytics,
  };
};
