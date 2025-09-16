import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MaterialDemand, PredictiveAnalyticsConfig } from '../types';
import { generateMockPredictiveData } from '../../../data/mockData'; 
import { EventBus } from '@/lib/events';

export const usePredictiveAnalytics = () => {
  // State
  const [materials, setMaterials] = useState<MaterialDemand[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDemand | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasting' | 'seasonality' | 'alerts' | 'recommendations'>('overview');
  const [config, setConfig] = useState<PredictiveAnalyticsConfig>({
    forecastHorizon: 7,
    confidenceThreshold: 80,
    seasonalityDetection: true,
    weatherIntegration: false,
    eventCalendarSync: true,
    autoReorderTrigger: false,
    alertThresholds: {
      stockoutRisk: 70,
      overstockRisk: 80,
      demandSpike: 150
    }
  });
  const [materialFilter, setMaterialFilter] = useState('all');
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  // Load data
  useEffect(() => {
    const loadPredictiveData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockData = generateMockPredictiveData();
        const mockMaterials = mockData.inventoryOptimization.reorderRecommendations.map(item => ({
          id: `material_${item.item.toLowerCase()}`,
          materialName: item.item,
          currentStock: item.currentStock,
          prediction: {
            accuracy: 85,
            confidenceLevel: 80,
            trendDirection: 'stable' as const
          },
          alerts: item.urgency === 'high' ? [{ severity: 'critical' as const, message: 'Low stock' }] : [],
          seasonality: { detected: false }
        }));
        setMaterials(mockMaterials);
        setSelectedMaterial(mockMaterials[0]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error loading predictive analytics data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadPredictiveData();
  }, []);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    if (materialFilter === 'all') return materials;

    // This would be based on actual material categories
    const categoryMap: Record<string, string[]> = {
      'main': ['Harina 000', 'Tomate triturado', 'Mozzarella', 'Carne picada', 'Pollo'],
      'seasoning': ['Aceite de oliva', 'Ají morrón'],
      'packaging': []
    };

    const categoryItems = categoryMap[materialFilter] || [];
    return materials.filter(m => categoryItems.includes(m.materialName));
  }, [materials, materialFilter]);

  // Analytics summary
  const analyticsOverview = useMemo(() => {
    if (materials.length === 0) return null;

    const totalAlerts = materials.reduce((sum, m) => sum + m.alerts.length, 0);
    const criticalAlerts = materials.reduce((sum, m) =>
      sum + m.alerts.filter(a => a.severity === 'critical').length, 0);

    const averageAccuracy = materials.reduce((sum, m) => sum + m.prediction.accuracy, 0) / materials.length;

    const materialsWithTrends = {
      increasing: materials.filter(m => m.prediction.trendDirection === 'increasing').length,
      stable: materials.filter(m => m.prediction.trendDirection === 'stable').length,
      decreasing: materials.filter(m => m.prediction.trendDirection === 'decreasing').length
    };

    const seasonalMaterials = materials.filter(m => m.seasonality.detected).length;

    return {
      totalMaterials: materials.length,
      totalAlerts,
      criticalAlerts,
      averageAccuracy: Math.round(averageAccuracy),
      materialsWithTrends,
      seasonalMaterials,
      forecastReliability: averageAccuracy > 80 ? 'high' : averageAccuracy > 60 ? 'medium' : 'low'
    };
  }, [materials]);

  // Run predictive analysis
  const runPredictiveAnalysis = useCallback(async () => {
    setIsRunningAnalysis(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update predictions with new analysis
      const updatedMaterials = materials.map(material => ({
        ...material,
        prediction: {
          ...material.prediction,
          accuracy: Math.min(95, material.prediction.accuracy + Math.random() * 5),
          confidenceLevel: Math.min(95, material.prediction.confidenceLevel + Math.random() * 5)
        }
      }));

      setMaterials(updatedMaterials);

      // Emit analytics event
      await EventBus.emit('system.data_synced', {
        type: 'predictive_analysis_completed',
        materialsAnalyzed: materials.length,
        averageAccuracy: analyticsOverview?.averageAccuracy || 0,
        criticalAlerts: analyticsOverview?.criticalAlerts || 0,
        forecastHorizon: config.forecastHorizon,
        analysisMethod: 'advanced_ml_prediction'
      }, 'PredictiveAnalytics');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error running predictive analysis: ${errorMessage}`);
    } finally {
      setIsRunningAnalysis(false);
    }
  }, [materials, analyticsOverview, config.forecastHorizon]);

  return {
    materials,
    selectedMaterial,
    setSelectedMaterial,
    loading,
    activeTab,
    setActiveTab,
    config,
    setConfig,
    materialFilter,
    setMaterialFilter,
    isRunningAnalysis,
    runPredictiveAnalysis,
    filteredMaterials,
    analyticsOverview,
  };
};
