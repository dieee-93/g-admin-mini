// src/shared/alerts/AlertsProvider.tsx
// 🎯 PROVIDER CENTRAL DEL SISTEMA DE ALERTAS
// Maneja el estado global de todas las alertas de la aplicación

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo, useRef } from 'react';
import type { 
  Alert, 
  AlertsContextValue, 
  CreateAlertInput, 
  AlertFilters, 
  AlertStats,
  AlertsConfiguration,
  AlertStatus,
  AlertSeverity,
  AlertContext,
  AlertType, 
} from './types';
import { ALERT_EVENTS } from './types';
import { EventBus } from '@/lib/events/EventBus';
import { useDebouncedCallback } from '../hooks';

// Default configuration
const DEFAULT_CONFIG: AlertsConfiguration = {
  maxVisibleAlerts: 5,
  position: 'top-right',
  autoCollapse: false,
  collapseAfter: 10,
  soundEnabled: false,
  emailNotifications: false,
  pushNotifications: true,
  escalationEnabled: false,
  escalationThreshold: 30,
  escalationLevels: [],
  persistAcrossSeessions: true,
  maxStoredAlerts: 100
};

const AlertsContext = createContext<AlertsContextValue | null>(null);

interface AlertsProviderProps {
  children: ReactNode;
  initialConfig?: Partial<AlertsConfiguration>;
}

export function AlertsProvider({ children, initialConfig }: AlertsProviderProps) {
  // State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [config, setConfig] = useState<AlertsConfiguration>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });
  const [loading, setLoading] = useState(false);
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  // Generate unique IDs
  const generateId = useCallback(() => {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Load alerts from localStorage on mount
  useEffect(() => {
    if (config.persistAcrossSeessions) {
      loadPersistedAlerts();
    }
  }, [config.persistAcrossSeessions]);

  // Persist alerts to localStorage when they change
  useEffect(() => {
    if (config.persistAcrossSeessions && alerts.length > 0) {
      persistAlerts();
    }
  }, [alerts, config.persistAcrossSeessions]);

  // Auto-expire alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setAlerts(prev => prev.filter(alert => {
        if (!alert.autoExpire) return true;
        const expirationTime = new Date(alert.createdAt.getTime() + alert.autoExpire * 60 * 1000);
        if (now > expirationTime) {
          // Emit expired event
          EventBus.emit(ALERT_EVENTS.EXPIRED, { alertId: alert.id }, 'AlertsProvider');
          return false;
        }
        return true;
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadPersistedAlerts = async () => {
    try {
      const stored = localStorage.getItem('g-mini-alerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        const deserializedAlerts = parsed.map((alert: unknown) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          updatedAt: new Date(alert.updatedAt),
          acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined,
          lastOccurrence: alert.lastOccurrence ? new Date(alert.lastOccurrence) : undefined
        }));
        
        // Only load active and acknowledged alerts
        const activeAlerts = deserializedAlerts.filter((alert: Alert) => 
          alert.status === 'active' || alert.status === 'acknowledged'
        );
        
        setAlerts(activeAlerts);
      }
    } catch (error) {
      console.error('Error loading persisted alerts:', error);
    }
  };

  const persistAlerts = async () => {
    try {
      // Only persist active and acknowledged alerts, limit to maxStoredAlerts
      const alertsToPersist = alerts
        .filter(alert => alert.persistent && (alert.status === 'active' || alert.status === 'acknowledged'))
        .slice(0, config.maxStoredAlerts);
        
      localStorage.setItem('g-mini-alerts', JSON.stringify(alertsToPersist));
    } catch (error) {
      console.error('Error persisting alerts:', error);
    }
  };

  // Create new alert
  const createLogic = useCallback(async (input: CreateAlertInput): Promise<string> => {
    const now = new Date();
    const alertId = generateId();

    const newAlert: Alert = {
      id: alertId,
      ...input,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      persistent: input.persistent ?? true,
      occurrenceCount: 1,
      lastOccurrence: now,
      // Process actions to add IDs
      actions: input.actions?.map(action => ({
        ...action,
        id: generateId()
      }))
    };

    // Check for recurring alerts
    if (input.isRecurring) {
      const existingRecurring = alertsRef.current.find(alert => 
        alert.type === input.type &&
        alert.context === input.context &&
        alert.title === input.title &&
        alert.isRecurring
      );

      if (existingRecurring) {
        // Update existing recurring alert
        setAlerts(prev => prev.map(alert => 
          alert.id === existingRecurring.id
            ? {
                ...alert,
                occurrenceCount: (alert.occurrenceCount || 0) + 1,
                lastOccurrence: now,
                updatedAt: now,
                status: 'active' // Reactivate if it was acknowledged
              }
            : alert
        ));

        await EventBus.emit(ALERT_EVENTS.UPDATED, { 
          alertId: existingRecurring.id, 
          recurring: true 
        }, 'AlertsProvider');

        return existingRecurring.id;
      }
    }

    // Add new alert
    setAlerts(prev => [newAlert, ...prev]);

    // Emit created event
    await EventBus.emit(ALERT_EVENTS.CREATED, { 
      alertId,
      type: input.type,
      severity: input.severity,
      context: input.context 
    }, 'AlertsProvider');

    return alertId;
  }, [generateId]);

  const create = useDebouncedCallback(createLogic, 300);

  // Acknowledge alert
  const acknowledge = useCallback(async (id: string, notes?: string) => {
    const now = new Date();
    
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? {
            ...alert,
            status: 'acknowledged' as AlertStatus,
            acknowledgedAt: now,
            acknowledgedBy: 'Current User', // TODO: Get from auth context
            resolutionNotes: notes,
            updatedAt: now
          }
        : alert
    ));

    await EventBus.emit(ALERT_EVENTS.ACKNOWLEDGED, { alertId: id, notes }, 'AlertsProvider');
  }, []);

  // Resolve alert
  const resolve = useCallback(async (id: string, notes?: string) => {
    const now = new Date();
    
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? {
            ...alert,
            status: 'resolved' as AlertStatus,
            resolvedAt: now,
            resolvedBy: 'Current User', // TODO: Get from auth context
            resolutionNotes: notes,
            updatedAt: now
          }
        : alert
    ));

    await EventBus.emit(ALERT_EVENTS.RESOLVED, { alertId: id, notes }, 'AlertsProvider');
  }, []);

  // Dismiss alert
  const dismiss = useCallback(async (id: string) => {
    const now = new Date();
    
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? {
            ...alert,
            status: 'dismissed' as AlertStatus,
            updatedAt: now
          }
        : alert
    ));

    await EventBus.emit(ALERT_EVENTS.DISMISSED, { alertId: id }, 'AlertsProvider');
  }, []);

  // Update alert
  const update = useCallback(async (id: string, updates: Partial<Alert>) => {
    const now = new Date();
    
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? {
            ...alert,
            ...updates,
            updatedAt: now
          }
        : alert
    ));

    await EventBus.emit(ALERT_EVENTS.UPDATED, { alertId: id, updates }, 'AlertsProvider');
  }, []);

  // Query helpers
  const getByContext = useCallback((context: AlertContext) => {
    return alertsRef.current.filter(alert => alert.context === context);
  }, []);

  const getBySeverity = useCallback((severity: AlertSeverity) => {
    return alertsRef.current.filter(alert => alert.severity === severity);
  }, []);

  const getFiltered = useCallback((filters: AlertFilters) => {
    return alertsRef.current.filter(alert => {
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (!statuses.includes(alert.status)) return false;
      }
      
      if (filters.severity) {
        const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
        if (!severities.includes(alert.severity)) return false;
      }
      
      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        if (!types.includes(alert.type)) return false;
      }
      
      if (filters.context) {
        const contexts = Array.isArray(filters.context) ? filters.context : [filters.context];
        if (!contexts.includes(alert.context)) return false;
      }
      
      if (filters.createdAfter && alert.createdAt < filters.createdAfter) return false;
      if (filters.createdBefore && alert.createdAt > filters.createdBefore) return false;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = alert.title.toLowerCase().includes(searchLower);
        const matchesDescription = alert.description?.toLowerCase().includes(searchLower) ?? false;
        const matchesMetadata = alert.metadata?.itemName?.toLowerCase().includes(searchLower) ?? false;
        
        if (!matchesTitle && !matchesDescription && !matchesMetadata) return false;
      }
      
      return true;
    });
  }, []);

  // Calculate stats
  const getStats = useCallback((filters?: AlertFilters): AlertStats => {
    const filteredAlerts = filters ? getFiltered(filters) : alertsRef.current;
    
    const byStatus = {
      active: 0,
      acknowledged: 0,
      resolved: 0,
      dismissed: 0
    } as Record<AlertStatus, number>;
    
    const bySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    } as Record<AlertSeverity, number>;
    
    const byType = {
      stock: 0,
      system: 0,
      validation: 0,
      business: 0,
      security: 0,
      operational: 0
    } as Record<AlertType, number>;
    
    const byContext = {
      materials: 0,
      sales: 0,
      operations: 0,
      dashboard: 0,
      global: 0,
      customers: 0,
      staff: 0,
      fiscal: 0
    } as Record<AlertContext, number>;

    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let escalatedCount = 0;
    let recurringCount = 0;

    filteredAlerts.forEach(alert => {
      byStatus[alert.status]++;
      bySeverity[alert.severity]++;
      byType[alert.type]++;
      byContext[alert.context]++;
      
      if (alert.escalationLevel && alert.escalationLevel > 0) {
        escalatedCount++;
      }
      
      if (alert.isRecurring) {
        recurringCount++;
      }
      
      if (alert.resolvedAt && alert.createdAt) {
        const resolutionTime = alert.resolvedAt.getTime() - alert.createdAt.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    return {
      total: filteredAlerts.length,
      byStatus,
      bySeverity,
      byType,
      byContext,
      averageResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount / (1000 * 60) : 0, // in minutes
      escalatedCount,
      recurringCount
    };
  }, [getFiltered]);

  // Bulk operations
  const bulkAcknowledge = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => acknowledge(id)));
  }, [acknowledge]);

  const bulkResolve = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => resolve(id)));
  }, [resolve]);

  const bulkDismiss = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => dismiss(id)));
  }, [dismiss]);

  const clearAll = useCallback(async (filters?: AlertFilters) => {
    const alertsToRemove = filters ? getFiltered(filters) : alertsRef.current.filter(a => a.status !== 'active');
    await bulkDismiss(alertsToRemove.map(a => a.id));
  }, [getFiltered, bulkDismiss]);

  // Update configuration
  const updateConfig = useCallback(async (newConfig: Partial<AlertsConfiguration>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    // Persist config
    try {
      localStorage.setItem('g-mini-alerts-config', JSON.stringify({ ...config, ...newConfig }));
    } catch (error) {
      console.error('Error persisting alerts config:', error);
    }
  }, [config]);

  // Memoize stats calculation
  const stats = useMemo(() => getStats(), [getStats]);

  const contextValue: AlertsContextValue = useMemo(() => ({
    alerts,
    stats,
    config,
    loading,
    create,
    acknowledge,
    resolve,
    dismiss,
    update,
    getByContext,
    getBySeverity,
    getFiltered,
    getStats,
    updateConfig,
    bulkAcknowledge,
    bulkResolve,
    bulkDismiss,
    clearAll
  }), [
    alerts, stats, config, loading, create, acknowledge, resolve, dismiss,
    update, getByContext, getBySeverity, getFiltered, getStats,
    updateConfig, bulkAcknowledge, bulkResolve, bulkDismiss, clearAll
  ]);

  return (
    <AlertsContext.Provider value={contextValue}>
      {children}
    </AlertsContext.Provider>
  );
}

// Hook to use the alerts context
export function useAlertsContext(): AlertsContextValue {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlertsContext must be used within an AlertsProvider');
  }
  return context;
}