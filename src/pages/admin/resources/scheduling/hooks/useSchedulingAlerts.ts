// useSchedulingAlerts.ts - Hook Inteligente para Sistema de Alertas
// Integra SchedulingIntelligenceEngine con UI Components

import { useState, useEffect, useCallback, useMemo } from 'react';

// ✅ INTELLIGENT SYSTEM
import {
  SchedulingAlertsAdapter,
  createSchedulingAlertsAdapter
} from '../services/SchedulingAlertsAdapter';
import type { SchedulingData } from '../services/SchedulingIntelligenceEngine';

// ✅ SHARED TYPES
import type { Alert } from '@/shared/types/alerts';

// ✅ ARCHITECTURAL SYSTEMS
import EventBus from '@/lib/events';
import { useErrorHandler } from '@/lib/error-handling';

// ✅ v3.0: No longer using legacy store - alerts are self-contained

// ✅ HOOK CONFIGURATION
interface UseSchedulingAlertsOptions {
  context: 'scheduling' | 'dashboard' | 'realtime';
  autoRefresh?: boolean;
  refreshInterval?: number; // en milliseconds
  enablePredictive?: boolean;
  maxAlerts?: number;
}

interface UseSchedulingAlertsResult {
  // 📊 ESTADO
  alerts: Alert[];
  loading: boolean;
  error: string | null;

  // 📈 MÉTRICAS
  criticalCount: number;
  warningCount: number;
  totalCount: number;

  // 🎯 ACCIONES
  refreshAlerts: () => Promise<void>;
  handleAlertAction: (alertId: string, actionId: string, context?: any) => Promise<void>;
  dismissAlert: (alertId: string) => void;

  // 🔄 CONTROL
  togglePredictive: () => void;
  setMaxAlerts: (max: number) => void;

  // 🧠 ANÁLISIS INTELIGENTE
  hasUrgentAlerts: boolean;
  topPriorityAlert: Alert | null;
  businessImpactSummary: string;
}

// ✅ MODULE CONFIGURATION - ESTABILIZADO FUERA DEL HOOK
const SCHEDULING_ALERTS_CONFIG = {
  capabilities: ['schedule_management', 'view_labor_costs'],
  events: {
    emits: [
      'scheduling.alerts_generated',
      'scheduling.alert_action_triggered',
      'scheduling.critical_alert_overtime_detected'
    ],
    listens: [
      'staff.availability_updated',
      'sales.volume_forecast'
    ]
  }
} as const;

export function useSchedulingAlerts(
  schedulingStats: any,
  optionsParam?: Partial<UseSchedulingAlertsOptions>
): UseSchedulingAlertsResult {

  // ✅ ESTABILIZAR OPTIONS CON USEMEMO
  const options = useMemo((): UseSchedulingAlertsOptions => ({
    context: 'scheduling',
    autoRefresh: true, // ✅ RE-ENABLED AFTER FIXING useModuleIntegration
    refreshInterval: 30000, // 30 segundos
    enablePredictive: true,
    maxAlerts: 10,
    ...optionsParam
  }), [optionsParam]);

  // Debug logs removed to prevent console spam

  // ✅ ARCHITECTURAL INTEGRATION
  const { handleError } = useErrorHandler();

  // 📊 ESTADO LOCAL
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enablePredictive, setEnablePredictive] = useState(options.enablePredictive ?? true);
  const [maxAlerts, setMaxAlertsState] = useState(options.maxAlerts ?? 10);

  // 🧠 ADAPTER INTELIGENTE
  const alertsAdapter = useMemo(
    () => createSchedulingAlertsAdapter(),
    []
  );

  /**
   * Genera alertas inteligentes basadas en datos actuales
   * ✅ PURE FUNCTION - No emite eventos (siguiendo React best practices)
   */
  const generateIntelligentAlerts = useCallback(async () => {
    if (!schedulingStats) return;

    setLoading(true);
    setError(null);

    try {
      // 📊 PREPARAR DATOS PARA ANÁLISIS - SIMPLIFIED TO PREVENT REACTIVE DEPENDENCIES
      const schedulingData: SchedulingData = {
        schedulingStats,
        shifts: [], // SIMPLIFIED - removed reactive store dependencies
        timeOffRequests: [],
        employees: [],
        laborRates: {},
        salesForecast: [],
        historicalData: {
          laborCosts: [],
          coveragePercentages: [],
          overtimeHours: [],
          customerSatisfaction: []
        },
        budgetConstraints: {
          weeklyBudget: 10000,
          overtimeThreshold: 40,
          minCoveragePercentage: 85
        },
        settings: {
          enablePredictive,
          analysisDepth: options.context === 'dashboard' ? 'summary' : 'detailed',
          includeProjections: enablePredictive,
          maxAlerts
        }
      };

      // 🧠 GENERAR ALERTAS INTELIGENTES
      const intelligentAlerts = await alertsAdapter.generateUnifiedAlerts(schedulingData);

      // 🎯 FILTRAR Y LIMITAR ALERTAS
      const filteredAlerts = intelligentAlerts
        .slice(0, maxAlerts)
        .filter(alert => {
          // En contexto dashboard, solo alertas críticas y warnings
          if (options.context === 'dashboard') {
            return ['critical', 'warning'].includes(alert.type);
          }
          return true;
        });

      setAlerts(filteredAlerts);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando alertas';
      setError(errorMessage);
      handleError(err, 'useSchedulingAlerts.generateIntelligentAlerts');
    } finally {
      setLoading(false);
    }
  }, [
    schedulingStats,
    alertsAdapter,
    enablePredictive,
    maxAlerts,
    options.context,
    handleError
  ]); // REDUCED DEPENDENCIES - removed store dependencies

  /**
   * Maneja acciones de alerta con feedback inteligente
   */
  const handleAlertAction = useCallback(async (
    alertId: string,
    actionId: string,
    context?: any
  ) => {
    try {
      const result = await alertsAdapter.handleAlertAction(alertId, actionId, {
        ...context,
        uiContext: options.context,
        timestamp: new Date()
      });

      if (result.success) {
        // 🎯 ACTUALIZAR UI - Remover alerta resuelta si es apropiado
        if (['resolve', 'fix', 'complete'].some(action => actionId.includes(action))) {
          setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        }

        // 📡 EMIT SUCCESS EVENT
        EventBus.emit('scheduling.alert_action_success', {
          alertId,
          actionId,
          message: result.message
        });

        // 🔄 REFRESCAR ALERTAS PARA DETECTAR NUEVOS ESTADOS (comentado para evitar bucle)
        // setTimeout(generateIntelligentAlerts, 2000);
      }
    } catch (err) {
      handleError(err, 'useSchedulingAlerts.handleAlertAction');
    }
  }, [alertsAdapter, options.context]);

  /**
   * Descarta una alerta específica
   */
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));

    EventBus.emit('scheduling.alert_dismissed', {
      alertId,
      context: options.context,
      timestamp: new Date()
    });
  }, [options.context]);

  /**
   * Refresca alertas manualmente
   */
  const refreshAlerts = useCallback(async () => {
    await generateIntelligentAlerts();
  }, []);

  /**
   * Toggle análisis predictivo
   */
  const togglePredictive = useCallback(() => {
    setEnablePredictive(prev => {
      const newValue = !prev;
      EventBus.emit('scheduling.predictive_analysis_toggled', {
        enabled: newValue,
        context: options.context
      });
      return newValue;
    });
  }, [options.context]);

  // ✅ AUTO-REFRESH INTELIGENTE - DISABLED TO PREVENT INFINITE LOOP
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(() => {
      // Solo auto-refresh si no está cargando y no hay errores críticos
      if (!loading && (!error || !error.includes('critical'))) {
        // generateIntelligentAlerts(); // DISABLED - causing infinite loops
      }
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval, loading, error]);

  // ✅ INITIAL LOAD - CONDITIONAL TO PREVENT LOOPS
  useEffect(() => {
    if (schedulingStats) {
      generateIntelligentAlerts();
    }
  }, [schedulingStats?.total_shifts_this_week]); // Only trigger when actual data changes

  // ✅ EFFECT EVENTS - Non-reactive event emission (React 2024 best practice)
  // Separated from reactive effects to prevent infinite loops
  useEffect(() => {
    // 📡 EVENT EMISSION - Only when alerts actually change
    if (alerts.length > 0) {
      const timeoutId = setTimeout(() => {
        // Debounced emission to prevent rapid consecutive events
        EventBus.emit('scheduling.alerts_generated', {
          context: options.context,
          alertsCount: alerts.length,
          criticalCount: alerts.filter(a => a.type === 'critical').length,
          warningCount: alerts.filter(a => a.type === 'warning').length,
          timestamp: new Date(),
          sessionId: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        // 🚨 CRITICAL ALERTS - Separate emission for urgent cases
        const criticalAlerts = alerts.filter(a => a.type === 'critical');
        if (criticalAlerts.length > 0) {
          EventBus.emit('scheduling.critical_alerts_detected', {
            count: criticalAlerts.length,
            alerts: criticalAlerts.map(a => ({
              id: a.id,
              title: a.title,
              category: a.category,
              urgency: a.urgency
            })),
            context: options.context
          });
        }
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [alerts.length, options.context]); // Stable dependencies only

  // 📊 MÉTRICAS COMPUTADAS
  const metrics = useMemo(() => {
    const criticalCount = alerts.filter(a => a.type === 'critical').length;
    const warningCount = alerts.filter(a => a.type === 'warning').length;
    const totalCount = alerts.length;

    const hasUrgentAlerts = criticalCount > 0 ||
      alerts.some(a => a.urgency === 'high');

    const topPriorityAlert = alerts.length > 0 ? alerts[0] : null;

    // 💼 BUSINESS IMPACT SUMMARY
    let businessImpactSummary = 'Sin impactos críticos detectados';

    if (criticalCount > 0) {
      businessImpactSummary = `${criticalCount} problemas críticos requieren atención inmediata`;
    } else if (warningCount > 0) {
      businessImpactSummary = `${warningCount} situaciones requieren monitoreo`;
    } else if (totalCount > 0) {
      businessImpactSummary = `${totalCount} oportunidades de optimización identificadas`;
    }

    return {
      criticalCount,
      warningCount,
      totalCount,
      hasUrgentAlerts,
      topPriorityAlert,
      businessImpactSummary
    };
  }, [alerts]);

  return {
    // 📊 ESTADO
    alerts,
    loading,
    error,

    // 📈 MÉTRICAS
    ...metrics,

    // 🎯 ACCIONES
    refreshAlerts,
    handleAlertAction,
    dismissAlert,

    // 🔄 CONTROL
    togglePredictive,
    setMaxAlerts: setMaxAlertsState,

    // 🧠 ANÁLISIS
    hasUrgentAlerts: metrics.hasUrgentAlerts,
    topPriorityAlert: metrics.topPriorityAlert,
    businessImpactSummary: metrics.businessImpactSummary
  };
}

// ✅ EXPORT TYPES
export type { UseSchedulingAlertsOptions, UseSchedulingAlertsResult };