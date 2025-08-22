// src/shared/alerts/hooks/useAlerts.ts
// 🎯 HOOK PRINCIPAL DEL SISTEMA DE ALERTAS
// API simplificada para usar las alertas desde cualquier componente

import { useMemo } from 'react';
import { useAlertsContext } from '../AlertsProvider';
import {
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
  const context = useAlertsContext();
  
  // Construir filtros basado en opciones
  const filters = useMemo<AlertFilters>(() => {
    const result: AlertFilters = {};
    
    if (options.context) {
      result.context = options.context;
    }
    
    if (options.severity) {
      result.severity = options.severity;
    }
    
    if (options.type) {
      result.type = options.type;
    }
    
    if (options.status) {
      result.status = options.status;
    }
    
    return result;
  }, [options]);
  
  // Alertas filtradas
  const alerts = useMemo(() => {
    if (options.autoFilter !== false && Object.keys(filters).length > 0) {
      return context.getFiltered(filters);
    }
    return context.alerts;
  }, [context.alerts, context.getFiltered, filters, options.autoFilter]);
  
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
  
  // Queries específicas
  const queries = useMemo(() => ({
    getByContext: context.getByContext,
    getBySeverity: context.getBySeverity,
    getFiltered: context.getFiltered,
    getActive: () => context.alerts.filter(alert => alert.status === 'active'),
    getCritical: () => context.alerts.filter(alert => alert.severity === 'critical')
  }), [context]);
  
  return {
    alerts,
    count: stats.count,
    criticalCount: stats.criticalCount,
    activeCount: stats.activeCount,
    acknowledgedCount: stats.acknowledgedCount,
    loading: context.loading,
    hasAlerts: stats.hasAlerts,
    hasCriticalAlerts: stats.hasCriticalAlerts,
    actions: {
      create: context.create,
      acknowledge: context.acknowledge,
      resolve: context.resolve,
      dismiss: context.dismiss,
      update: context.update,
      bulkAcknowledge: context.bulkAcknowledge,
      bulkResolve: context.bulkResolve,
      bulkDismiss: context.bulkDismiss,
      clearAll: context.clearAll
    },
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
  const context = useAlertsContext();
  return context.getStats(filters);
}