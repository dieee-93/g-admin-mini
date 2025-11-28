// src/shared/alerts/hooks/useAlerts.ts
// 🎯 HOOK PRINCIPAL DEL SISTEMA DE ALERTAS
// API simplificada para usar las alertas desde cualquier componente

import { useMemo } from 'react';
import { useAlertsState, useAlertsActions } from '../AlertsProvider';
import type {
  AlertFilters,
  AlertContext,
  AlertSeverity,
  AlertType,
  AlertStatus,
  Alert,
  CreateAlertInput
} from '../types';

export interface UseAlertsOptions {
  context?: AlertContext | AlertContext[];
  severity?: AlertSeverity | AlertSeverity[];
  type?: AlertType | AlertType[];
  status?: AlertStatus | AlertStatus[];
  autoFilter?: boolean; // Si true, aplica los filtros automáticamente
}

export interface UseAlertsReturn {
  // Alertas filtradas según opciones
  alerts: Alert[];
  
  // Stats de las alertas filtradas
  count: number;
  criticalCount: number;
  activeCount: number;
  acknowledgedCount: number;
  
  // Estados
  loading: boolean;
  hasAlerts: boolean;
  hasCriticalAlerts: boolean;
  
  // Acciones principales
  actions: {
    create: (input: CreateAlertInput) => Promise<string>;
    acknowledge: (id: string, notes?: string) => Promise<void>;
    resolve: (id: string, notes?: string) => Promise<void>;
    dismiss: (id: string) => Promise<void>;
    update: (id: string, updates: Partial<Alert>) => Promise<void>;
    
    // Bulk operations
    bulkAcknowledge: (ids: string[]) => Promise<void>;
    bulkResolve: (ids: string[]) => Promise<void>;
    bulkDismiss: (ids: string[]) => Promise<void>;
    clearAll: (filters?: AlertFilters) => Promise<void>;
  };
  
  // Queries específicas
  queries: {
    getByContext: (context: AlertContext) => Alert[];
    getBySeverity: (severity: AlertSeverity) => Alert[];
    getFiltered: (filters: AlertFilters) => Alert[];
    getActive: () => Alert[];
    getCritical: () => Alert[];
  };
  
  // Helpers para UI
  ui: {
    badgeCount: number;
    badgeColor: 'red' | 'orange' | 'yellow' | 'blue' | 'gray';
    statusText: string;
    shouldShowBadge: boolean;
  };
}

/**
 * 🎯 HOOK PRINCIPAL - useAlerts
 * 
 * @param options - Opciones de filtrado y configuración
 * @returns API completa para trabajar con alertas
 */
export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
  // 🛠️ PERFORMANCE FIX: Use split contexts to prevent unnecessary re-renders
  // Components using this hook will only re-render when alerts/stats change, not when action functions change
  const { alerts: contextAlerts, stats: contextStats, config } = useAlertsState();
  const actionsContext = useAlertsActions();
  
  const {
    context: contextOpt,
    severity,
    type,
    status,
    autoFilter,
  } = options;
  
  // Construir filtros basado en opciones
  const filters = useMemo<AlertFilters>(() => {
    const result: AlertFilters = {};
    
    if (contextOpt) {
      result.context = contextOpt;
    }
    
    if (severity) {
      result.severity = severity;
    }
    
    if (type) {
      result.type = type;
    }
    
    if (status) {
      result.status = status;
    }
    
    return result;
  }, [contextOpt, severity, type, status]);
  
  // Alertas filtradas
  const alerts = useMemo(() => {
    if (autoFilter !== false && Object.keys(filters).length > 0) {
      return actionsContext.getFiltered(filters);
    }
    return contextAlerts;
  }, [contextAlerts, actionsContext.getFiltered, filters, autoFilter]);
  
  // Estadísticas calculadas
  const stats = useMemo(() => {
    const count = alerts.length;
    const criticalCount = alerts.filter(alert => alert.severity === 'critical').length;
    const activeCount = alerts.filter(alert => alert.status === 'active').length;
    const acknowledgedCount = alerts.filter(alert => alert.status === 'acknowledged').length;
    
    return {
      count,
      criticalCount,
      activeCount,
      acknowledgedCount,
      hasAlerts: count > 0,
      hasCriticalAlerts: criticalCount > 0
    };
  }, [alerts]);
  
  // UI helpers
  const ui = useMemo(() => {
    const badgeCount = stats.activeCount + stats.acknowledgedCount;
    
    let badgeColor: 'red' | 'orange' | 'yellow' | 'blue' | 'gray' = 'gray';
    let statusText = 'Sin alertas';
    
    if (stats.hasCriticalAlerts) {
      badgeColor = 'red';
      statusText = `${stats.criticalCount} críticas`;
    } else if (stats.activeCount > 0) {
      badgeColor = 'orange';
      statusText = `${stats.activeCount} activas`;
    } else if (stats.acknowledgedCount > 0) {
      badgeColor = 'yellow';
      statusText = `${stats.acknowledgedCount} reconocidas`;
    }
    
    return {
      badgeCount,
      badgeColor,
      statusText,
      shouldShowBadge: badgeCount > 0
    };
  }, [stats]);
  
  // Queries específicas - memoized with stable action references
  const queries = useMemo(() => ({
    getByContext: actionsContext.getByContext,
    getBySeverity: actionsContext.getBySeverity,
    getFiltered: actionsContext.getFiltered,
    getActive: () => contextAlerts.filter(alert => alert.status === 'active'),
    getCritical: () => contextAlerts.filter(alert => alert.severity === 'critical')
  }), [actionsContext, contextAlerts]);
  
  // ✅ PERFORMANCE FIX: Actions object is stable from AlertsActionsContext
  // Since actionsValue in provider has empty deps [], actionsContext never changes
  // Therefore, we don't need to memoize or list individual actions as deps
  const actions = actionsContext;

  return {
    alerts,
    count: stats.count,
    criticalCount: stats.criticalCount,
    activeCount: stats.activeCount,
    acknowledgedCount: stats.acknowledgedCount,
    loading: false, // No loading state in split context
    hasAlerts: stats.hasAlerts,
    hasCriticalAlerts: stats.hasCriticalAlerts,
    actions,
    queries,
    ui
  };
}

/**
 * 🎯 HOOK ESPECÍFICO - useStockAlerts
 * Wrapper especializado para alertas de stock
 */
export function useStockAlerts() {
  return useAlerts({
    context: 'materials',
    type: 'stock',
    autoFilter: true
  });
}

/**
 * 🎯 HOOK ESPECÍFICO - useSystemAlerts  
 * Wrapper especializado para alertas del sistema
 */
export function useSystemAlerts() {
  return useAlerts({
    type: 'system',
    autoFilter: true
  });
}

/**
 * 🎯 HOOK ESPECÍFICO - useCriticalAlerts
 * Solo alertas críticas de cualquier tipo
 */
export function useCriticalAlerts() {
  return useAlerts({
    severity: 'critical',
    status: ['active', 'acknowledged'],
    autoFilter: true
  });
}

/**
 * 🎯 HOOK ESPECÍFICO - useContextAlerts
 * Para obtener alertas de un contexto específico
 */
export function useContextAlerts(context: AlertContext) {
  return useAlerts({
    context,
    autoFilter: true
  });
}

/**
 * 🎯 HOOK PARA UI - useAlertsBadge
 * Datos específicos para mostrar badges de navegación
 */
export function useAlertsBadge(options: UseAlertsOptions = {}) {
  const { ui, count, criticalCount, activeCount } = useAlerts(options);
  
  return {
    count: ui.badgeCount,
    color: ui.badgeColor,
    text: ui.statusText,
    shouldShow: ui.shouldShowBadge,
    criticalCount,
    activeCount,
    hasCritical: criticalCount > 0
  };
}

/**
 * 🎯 HOOK PARA STATS - useAlertsStats
 * Estadísticas completas del sistema de alertas
 */
export function useAlertsStats(filters?: AlertFilters) {
  const actions = useAlertsActions();
  return actions.getStats(filters);
}