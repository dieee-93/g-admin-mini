// ============================================================================
// PROCUREMENT RECOMMENDATIONS HOOK
// ============================================================================
// Hook para gestión inteligente de recomendaciones de compra

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSmartInventoryAlerts } from './useSmartInventoryAlerts';
import { useAlerts } from '@/shared/alerts/hooks/useAlerts';
import { ProcurementRecommendationsEngine } from '@/business-logic/inventory/procurementRecommendationsEngine';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import type { 
  ProcurementAnalysisResult,
  ProcurementRecommendation,
  ProcurementEngineConfig
} from '@/business-logic/inventory/procurementRecommendationsEngine';
import type { CreateAlertInput } from '@/shared/alerts/types';

interface UseProcurementRecommendationsOptions {
  // Configuración del engine
  config?: Partial<ProcurementEngineConfig>;
  
  // Auto-refresh settings
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
  
  // Integración con alertas
  generateBudgetAlerts?: boolean;
  generateSupplierAlerts?: boolean;
  
  // Filtros
  minConfidence?: number;
  maxRecommendations?: number;
}

interface ProcurementRecommendationsReturn {
  // Estados
  loading: boolean;
  generating: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Datos principales
  analysisResult: ProcurementAnalysisResult | null;
  recommendations: ProcurementRecommendation[];
  
  // Categorizadas
  urgentRecommendations: ProcurementRecommendation[];
  plannedRecommendations: ProcurementRecommendation[];
  opportunityRecommendations: ProcurementRecommendation[];
  
  // Métricas consolidadas
  totalInvestment: number;
  totalSavings: number;
  averageConfidence: number;
  highPriorityCount: number;
  
  // Acciones
  refresh: () => Promise<void>;
  generateRecommendations: () => Promise<void>;
  executeRecommendation: (recommendationId: string, actionType: string) => Promise<void>;
  dismissRecommendation: (recommendationId: string) => Promise<void>;
  
  // Filtros
  getRecommendationsByClass: (abcClass: 'A' | 'B' | 'C') => ProcurementRecommendation[];
  getRecommendationsByType: (type: string) => ProcurementRecommendation[];
  getRecommendationsByPriority: (minPriority: number) => ProcurementRecommendation[];
  
  // Analytics
  analytics: {
    recommendationsByClass: Record<'A' | 'B' | 'C', number>;
    recommendationsByType: Record<string, number>;
    investmentByClass: Record<'A' | 'B' | 'C', number>;
    savingsByClass: Record<'A' | 'B' | 'C', number>;
    
    // Tendencias (simuladas por ahora)
    trends: {
      weeklyInvestmentTrend: number; // % change
      monthlySavingsTrend: number;   // % change
      recommendationVolumeChange: number; // % change
    };
    
    // Top items
    topRecommendationsByValue: ProcurementRecommendation[];
    topRecommendationsBySavings: ProcurementRecommendation[];
    mostUrgentRecommendations: ProcurementRecommendation[];
  };
  
  // UI helpers
  ui: {
    statusColor: 'green' | 'yellow' | 'orange' | 'red';
    statusText: string;
    shouldShowBadge: boolean;
    badgeCount: number;
    progressPercentage: number; // % de recomendaciones procesadas/ejecutadas
  };
}

/**
 * Hook principal para recomendaciones de compra inteligentes
 */
export function useProcurementRecommendations(
  options: UseProcurementRecommendationsOptions = {}
): ProcurementRecommendationsReturn {
  
  const {
    config = {},
    autoRefresh = true,
    refreshIntervalMs = 600000, // 10 minutos
    generateBudgetAlerts = true,
    generateSupplierAlerts = true,
    minConfidence = 65,
    maxRecommendations = 50
  } = options;

  // Estados locales
  const [analysisResult, setAnalysisResult] = useState<ProcurementAnalysisResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  // Hooks dependencies
  const {
    materials,
    activeAlerts,
    materialsLoading,
    alertsLoading
  } = useSmartInventoryAlerts({ autoRefresh: false });
  
  const { actions: alertActions } = useAlerts({
    context: 'materials',
    autoFilter: true
  });

  // Loading state
  const loading = materialsLoading || alertsLoading;

  // Configuración consolidada del engine
  const engineConfig = useMemo<Partial<ProcurementEngineConfig>>(() => ({
    minRecommendationValue: 500,
    maxRecommendations,
    confidenceThreshold: minConfidence,
    ...config
  }), [config, maxRecommendations, minConfidence]);

  // Función principal para generar recomendaciones
  const generateRecommendations = useCallback(async () => {
    if (!materials.length || generating) return;
    
    try {
      setGenerating(true);
      setError(null);
      
      const result = await ProcurementRecommendationsEngine.generateProcurementRecommendations(
        materials,
        activeAlerts,
        engineConfig
      );
      
      setAnalysisResult(result);
      setLastUpdated(new Date());
      
      // Generar alertas adicionales si está habilitado
      if (generateBudgetAlerts || generateSupplierAlerts) {
        await generateAdditionalAlerts(result);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando recomendaciones';
      setError(errorMessage);
      console.error('Error generating procurement recommendations:', err);
    } finally {
      setGenerating(false);
    }
  }, [materials, activeAlerts, engineConfig, generating, generateBudgetAlerts, generateSupplierAlerts]);

  // Función para generar alertas adicionales basadas en el análisis
  const generateAdditionalAlerts = useCallback(async (result: ProcurementAnalysisResult) => {
    try {
      const newAlerts: CreateAlertInput[] = [];
      
      // Convertir alertas del engine al formato del sistema unificado
      result.newAlertsToGenerate.forEach(alertData => {
        const alert: CreateAlertInput = {
          type: alertData.type === 'budget_required' ? 'business' : 'operational',
          severity: alertData.severity === 'critical' ? 'critical' : 
                   alertData.severity === 'high' ? 'high' : 'medium',
          context: 'materials',
          title: 'Recomendación de Compra',
          description: alertData.message,
          metadata: {
            ...alertData.metadata,
            source: 'procurement_engine',
            analysisId: result.generatedAt
          },
          persistent: alertData.severity === 'critical',
          autoExpire: alertData.severity === 'critical' ? 240 : 1440, // 4h o 24h
          actions: alertData.type === 'budget_required' ? [
            {
              label: 'Ver Presupuesto',
              variant: 'primary',
              action: async () => {
                console.log('Navigate to budget approval');
                // TODO: Implementar navegación
              }
            }
          ] : []
        };
        
        newAlerts.push(alert);
      });
      
      // Crear alertas en el sistema
      const createPromises = newAlerts.map(alert => 
        alertActions.create(alert).catch(error => {
          console.error('Error creating procurement alert:', error);
        })
      );
      
      await Promise.all(createPromises);
      
    } catch (error) {
      console.error('Error generating additional alerts:', error);
    }
  }, [alertActions]);

  // Función de refresh
  const refresh = useCallback(async () => {
    await generateRecommendations();
  }, [generateRecommendations]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !materials.length) return;
    
    const interval = setInterval(generateRecommendations, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [autoRefresh, materials.length, refreshIntervalMs, generateRecommendations]);

  // Generar recomendaciones inicialmente
  useEffect(() => {
    if (materials.length > 0 && !analysisResult && !generating && !loading) {
      const timeout = setTimeout(generateRecommendations, 1000);
      return () => clearTimeout(timeout);
    }
  }, [materials.length, analysisResult, generating, loading, generateRecommendations]);

  // Recomendaciones filtradas (sin las dismissed)
  const recommendations = useMemo(() => {
    if (!analysisResult) return [];
    
    const allRecs = [
      ...analysisResult.urgentRecommendations,
      ...analysisResult.plannedRecommendations,
      ...analysisResult.opportunityRecommendations
    ];
    
    return allRecs.filter(rec => !dismissedRecommendations.has(rec.id));
  }, [analysisResult, dismissedRecommendations]);

  // Categorizaciones
  const urgentRecommendations = useMemo(() => 
    recommendations.filter(rec => rec.priority >= 4),
    [recommendations]
  );

  const plannedRecommendations = useMemo(() => 
    recommendations.filter(rec => rec.priority === 3),
    [recommendations]
  );

  const opportunityRecommendations = useMemo(() => 
    recommendations.filter(rec => rec.priority <= 2),
    [recommendations]
  );

  // Métricas consolidadas
  const metrics = useMemo(() => {
    const totalInvestment = DecimalUtils.fromValue(
      recommendations.reduce((sum, rec) => sum + rec.recommendedValue, 0),
      'inventory'
    ).toNumber();
    
    const totalSavings = DecimalUtils.fromValue(
      recommendations.reduce((sum, rec) => sum + rec.estimatedCostSavings, 0),
      'inventory'
    ).toNumber();
    
    const averageConfidence = recommendations.length > 0 
      ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length 
      : 0;
    
    const highPriorityCount = recommendations.filter(rec => rec.priority >= 4).length;
    
    return {
      totalInvestment,
      totalSavings,
      averageConfidence,
      highPriorityCount
    };
  }, [recommendations]);

  // Funciones de filtrado
  const getRecommendationsByClass = useCallback((abcClass: 'A' | 'B' | 'C') => 
    recommendations.filter(rec => rec.abcClass === abcClass),
    [recommendations]
  );

  const getRecommendationsByType = useCallback((type: string) => 
    recommendations.filter(rec => rec.type === type),
    [recommendations]
  );

  const getRecommendationsByPriority = useCallback((minPriority: number) => 
    recommendations.filter(rec => rec.priority >= minPriority),
    [recommendations]
  );

  // Función para ejecutar recomendación
  const executeRecommendation = useCallback(async (recommendationId: string, actionType: string) => {
    const recommendation = recommendations.find(rec => rec.id === recommendationId);
    if (!recommendation) return;
    
    const action = recommendation.actions.find(action => action.type === actionType);
    if (!action) return;
    
    try {
      // Ejecutar la acción (por ahora solo log, TODO: implementar acciones reales)
      console.log('Executing procurement action:', {
        recommendationId,
        actionType,
        parameters: action.parameters
      });
      
      // Si es una acción que resuelve la recomendación, dismiss it
      if (action.autoExecute) {
        await dismissRecommendation(recommendationId);
      }
      
    } catch (error) {
      console.error('Error executing recommendation action:', error);
      setError(`Error ejecutando acción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [recommendations]);

  // Función para dismiss recomendación
  const dismissRecommendation = useCallback(async (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
  }, []);

  // Analytics calculados
  const analytics = useMemo(() => {
    const recommendationsByClass = recommendations.reduce(
      (acc, rec) => {
        acc[rec.abcClass] = (acc[rec.abcClass] || 0) + 1;
        return acc;
      },
      { A: 0, B: 0, C: 0 } as Record<'A' | 'B' | 'C', number>
    );
    
    const recommendationsByType = recommendations.reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const investmentByClass = recommendations.reduce(
      (acc, rec) => {
        acc[rec.abcClass] += rec.recommendedValue;
        return acc;
      },
      { A: 0, B: 0, C: 0 } as Record<'A' | 'B' | 'C', number>
    );
    
    const savingsByClass = recommendations.reduce(
      (acc, rec) => {
        acc[rec.abcClass] += rec.estimatedCostSavings;
        return acc;
      },
      { A: 0, B: 0, C: 0 } as Record<'A' | 'B' | 'C', number>
    );
    
    // Top recommendations
    const topRecommendationsByValue = [...recommendations]
      .sort((a, b) => b.recommendedValue - a.recommendedValue)
      .slice(0, 5);
      
    const topRecommendationsBySavings = [...recommendations]
      .sort((a, b) => b.estimatedCostSavings - a.estimatedCostSavings)
      .slice(0, 5);
      
    const mostUrgentRecommendations = [...recommendations]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
    
    return {
      recommendationsByClass,
      recommendationsByType,
      investmentByClass,
      savingsByClass,
      trends: {
        weeklyInvestmentTrend: 5.2, // Simulado
        monthlySavingsTrend: 12.8,  // Simulado
        recommendationVolumeChange: -8.5 // Simulado
      },
      topRecommendationsByValue,
      topRecommendationsBySavings,
      mostUrgentRecommendations
    };
  }, [recommendations]);

  // UI helpers
  const ui = useMemo(() => {
    const urgentCount = urgentRecommendations.length;
    
    let statusColor: 'green' | 'yellow' | 'orange' | 'red' = 'green';
    let statusText = 'Todo bajo control';
    
    if (urgentCount > 5) {
      statusColor = 'red';
      statusText = `${urgentCount} recomendaciones urgentes`;
    } else if (urgentCount > 0) {
      statusColor = 'orange';
      statusText = `${urgentCount} recomendaciones urgentes`;
    } else if (plannedRecommendations.length > 0) {
      statusColor = 'yellow';
      statusText = `${plannedRecommendations.length} recomendaciones planificadas`;
    }
    
    const badgeCount = urgentCount + plannedRecommendations.length;
    const progressPercentage = analysisResult ? 
      Math.round(((dismissedRecommendations.size / (dismissedRecommendations.size + recommendations.length)) * 100)) : 0;
    
    return {
      statusColor,
      statusText,
      shouldShowBadge: badgeCount > 0,
      badgeCount,
      progressPercentage
    };
  }, [urgentRecommendations, plannedRecommendations, recommendations, dismissedRecommendations, analysisResult]);

  return {
    // Estados
    loading,
    generating,
    error,
    lastUpdated,
    
    // Datos principales
    analysisResult,
    recommendations,
    
    // Categorizadas
    urgentRecommendations,
    plannedRecommendations,
    opportunityRecommendations,
    
    // Métricas
    ...metrics,
    
    // Acciones
    refresh,
    generateRecommendations,
    executeRecommendation,
    dismissRecommendation,
    
    // Filtros
    getRecommendationsByClass,
    getRecommendationsByType,
    getRecommendationsByPriority,
    
    // Analytics
    analytics,
    
    // UI
    ui
  };
}