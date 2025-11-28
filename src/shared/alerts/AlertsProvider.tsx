// src/shared/alerts/AlertsProvider.tsx
// 🎯 PROVIDER CENTRAL DEL SISTEMA DE ALERTAS
// Maneja el estado global de todas las alertas de la aplicación

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
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
import { EventBus } from '@/lib/events';
import { useDebouncedCallback } from '../hooks';

import { logger } from '@/lib/logging';
// Default configuration
const DEFAULT_CONFIG: AlertsConfiguration = {
  maxVisibleAlerts: 5,
  position: 'top-right',
  autoCollapse: false,
  collapseAfter: 10,
  toastDuration: {
    info: 3000,
    success: 3000,
    warning: 5000,
    error: 8000,
    critical: Infinity,
    high: 8000,      // Same as error
    medium: 5000,    // Same as warning
    low: 3000        // Same as info
  },
  toastStackMax: 3,
  notificationCenterMax: 50,
  soundEnabled: false,
  emailNotifications: false,
  pushNotifications: true,
  escalationEnabled: false,
  escalationThreshold: 30,
  escalationLevels: [],
  persistAcrossSeessions: true,
  maxStoredAlerts: 100
};

// 🛠️ PERFORMANCE: Split context into State and Actions to prevent unnecessary re-renders
// Components consuming only actions won't re-render when alerts/config change
const AlertsStateContext = createContext<{ alerts: Alert[]; stats: AlertStats; config: AlertsConfiguration } | null>(null);
const AlertsActionsContext = createContext<Omit<AlertsContextValue, 'alerts' | 'stats' | 'config'> | null>(null);

const AlertsContext = createContext<AlertsContextValue | null>(null);
AlertsContext.displayName = 'AlertsContext';
AlertsStateContext.displayName = 'AlertsStateContext';
AlertsActionsContext.displayName = 'AlertsActionsContext';

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
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

  // 🎯 PERFORMANCE: Stable generateId function with no dependencies
  const generateId = useCallback(() => {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []); // ✅ Empty deps - stable reference

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
          EventBus.emit(ALERT_EVENTS.EXPIRED, { alertId: alert.id });
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
      logger.error('App', 'Error loading persisted alerts:', error);
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
      logger.error('App', 'Error persisting alerts:', error);
    }
  };

  // 🎯 PERFORMANCE: Create logic with stable dependencies using alertsRef
  const createLogic = useCallback(async (input: CreateAlertInput): Promise<string> => {
    const now = new Date();
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
        });

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
    });

    return alertId;
  }, []); // ✅ Empty deps - all state updates use functional form

  // 🎯 PERFORMANCE: Use createLogic directly as create (it's already stable with empty deps)
  // No need for additional useCallback wrapper
  const create = createLogic;

  // 🚀 PERFORMANCE: Bulk create alerts - adds multiple alerts in a single state update
  const bulkCreate = useCallback(async (inputs: CreateAlertInput[]) => {
    if (inputs.length === 0) return [];

    const now = new Date();
    const newAlerts: Alert[] = [];
    const alertIds: string[] = [];

    // Prepare all alerts first (no state updates yet)
    for (const input of inputs) {
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      alertIds.push(alertId);

      // Check for recurring alerts
      if (input.recurring?.enabled) {
        const existingRecurring = alertsRef.current.find(
          alert => 
            alert.isRecurring && 
            alert.recurringId === input.recurring?.id &&
            alert.status !== 'resolved'
        );

        if (existingRecurring) {
          logger.debug('Alerts', `Skipping recurring alert: ${input.title}`, existingRecurring);
          continue;
        }
      }

      const newAlert: Alert = {
        id: alertId,
        title: input.title,
        description: input.description,
        severity: input.severity,
        type: input.type,
        status: 'active',
        context: input.context || 'global',
        metadata: input.metadata,
        actions: input.actions?.map(action => ({
          ...action,
          id: crypto.randomUUID()
        })) || [],
        isRecurring: input.recurring?.enabled ?? false,
        recurringId: input.recurring?.id,
        recurringConfig: input.recurring,
        createdAt: now,
        updatedAt: now,
        expiresAt: input.expiresAt,
        priority: input.priority,
        tags: input.tags || [],
        relatedEntities: input.relatedEntities || [],
        escalationLevel: 0,
        notificationSent: false
      };

      newAlerts.push(newAlert);
    }

    // 🎯 SINGLE state update for all alerts
    setAlerts(prev => [...newAlerts, ...prev]);

    // Emit events for all created alerts (can be done async)
    Promise.all(
      alertIds.map((id, index) => 
        EventBus.emit(ALERT_EVENTS.CREATED, {
          alertId: id,
          type: inputs[index].type,
          severity: inputs[index].severity,
          context: inputs[index].context
        })
      )
    ).catch(error => {
      logger.error('Alerts', 'Error emitting bulk create events', error);
    });

    logger.info('Alerts', `Bulk created ${newAlerts.length} alerts in single update`);
    return alertIds;
  }, []); // 🎯 Empty deps - stable reference

  // 🎯 PERFORMANCE: Mark alert as read
  const markAsRead = useCallback(async (id: string) => {
    const now = new Date();

    setAlerts(prev => prev.map(alert =>
      alert.id === id && !alert.readAt
        ? { ...alert, readAt: now, updatedAt: now }
        : alert
    ));

    await EventBus.emit(ALERT_EVENTS.UPDATED, { alertId: id, action: 'read' });
    logger.debug('Alerts', `Alert marked as read: ${id}`);
  }, []); // 🎯 Empty deps - stable reference

  // 🎯 PERFORMANCE: Snooze alert
  const snooze = useCallback(async (id: string, duration: number) => {
    const snoozedUntil = new Date(Date.now() + duration);
    const now = new Date();

    setAlerts(prev => prev.map(alert =>
      alert.id === id
        ? { 
            ...alert, 
            status: 'snoozed' as AlertStatus, 
            snoozedUntil,
            updatedAt: now
          }
        : alert
    ));

    await EventBus.emit(ALERT_EVENTS.UPDATED, { alertId: id, action: 'snoozed', snoozedUntil });
    logger.info('Alerts', `Alert snoozed until ${snoozedUntil.toISOString()}: ${id}`);

    // Reactivar después de duration
    setTimeout(() => {
      setAlerts(prev => prev.map(alert =>
        alert.id === id && alert.status === 'snoozed'
          ? { 
              ...alert, 
              status: 'active' as AlertStatus, 
              snoozedUntil: undefined,
              updatedAt: new Date()
            }
          : alert
      ));
      logger.info('Alerts', `Alert reactivated after snooze: ${id}`);
    }, duration);
  }, []); // 🎯 Empty deps - stable reference

  // 🎯 PERFORMANCE: Archive alert
  const archive = useCallback(async (id: string) => {
    const now = new Date();

    setAlerts(prev => prev.map(alert =>
      alert.id === id
        ? { ...alert, archivedAt: now, updatedAt: now }
        : alert
    ));

    await EventBus.emit(ALERT_EVENTS.UPDATED, { alertId: id, action: 'archived' });
    logger.debug('Alerts', `Alert archived: ${id}`);
  }, []); // 🎯 Empty deps - stable reference

  // 🎯 PERFORMANCE: Open notification center
  const openNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(true);
    logger.debug('Alerts', 'Notification center opened');
  }, []);

  // 🎯 PERFORMANCE: Close notification center
  const closeNotificationCenter = useCallback(() => {
    setIsNotificationCenterOpen(false);
    logger.debug('Alerts', 'Notification center closed');
  }, []);

  // 🎯 PERFORMANCE: All action callbacks with empty deps - use functional setState
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

    await EventBus.emit(ALERT_EVENTS.ACKNOWLEDGED, { alertId: id, notes });
  }, []); // ✅ Empty deps - stable reference

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

    await EventBus.emit(ALERT_EVENTS.RESOLVED, { alertId: id, notes });
  }, []); // ✅ Empty deps - stable reference

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

    await EventBus.emit(ALERT_EVENTS.DISMISSED, { alertId: id });
  }, []); // ✅ Empty deps - stable reference

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

    await EventBus.emit(ALERT_EVENTS.UPDATED, { alertId: id, updates });
  }, []); // ✅ Empty deps - stable reference

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
    
    // ✅ COMPLETE: Initialize counters for ALL AlertContext types
    const byContext = {
      // Core
      dashboard: 0,
      global: 0,
      settings: 0,
      debug: 0,

      // Supply Chain
      materials: 0,
      suppliers: 0,
      products: 0,
      production: 0,
      assets: 0,

      // Sales & Operations
      sales: 0,
      fulfillment: 0,
      mobile: 0,

      // Customer & Finance
      customers: 0,
      memberships: 0,
      rentals: 0,
      fiscal: 0,
      billing: 0,
      corporate: 0,
      integrations: 0,

      // Resources
      staff: 0,
      scheduling: 0,

      // Analytics
      reporting: 0,
      intelligence: 0,
      executive: 0,

      // System
      gamification: 0,
      achievements: 0
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
  // 🛠️ PERFORMANCE FIX: Use functional update to avoid dependency on config
  const updateConfig = useCallback(async (newConfig: Partial<AlertsConfiguration>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    // Persist config - use setTimeout to avoid closure over config
    setTimeout(() => {
      try {
        const currentConfig = JSON.parse(localStorage.getItem('g-mini-alerts-config') || '{}');
        localStorage.setItem('g-mini-alerts-config', JSON.stringify({ ...currentConfig, ...newConfig }));
      } catch (error) {
        logger.error('App', 'Error persisting alerts config:', error);
      }
    }, 0);
  }, []); // 🎯 Empty deps - stable reference

  // 🎯 PERFORMANCE FIX: Calculate stats based on alerts data directly
  // React.dev best practice: "Calculate during render" with actual dependencies
  // NOT based on function reference which changes every render
  const stats = useMemo(() => {
    const filtered = alerts.filter((alert) => !alert.resolvedAt);
    const unread = alerts.filter((a) => !a.readAt && a.status !== 'dismissed' && !a.archivedAt).length;

    return {
      total: filtered.length,
      unread,
      byStatus: {
        active: filtered.filter((a) => !a.acknowledgedAt && !a.resolvedAt).length,
        acknowledged: filtered.filter((a) => a.acknowledgedAt && !a.resolvedAt).length,
        resolved: alerts.filter((a) => a.resolvedAt).length,
        dismissed: alerts.filter((a) => a.status === 'dismissed').length,
        snoozed: alerts.filter((a) => a.status === 'snoozed').length
      },
      bySeverity: {
        info: filtered.filter((a) => a.severity === 'info').length,
        low: filtered.filter((a) => a.severity === 'low').length,
        medium: filtered.filter((a) => a.severity === 'medium').length,
        high: filtered.filter((a) => a.severity === 'high').length,
        critical: filtered.filter((a) => a.severity === 'critical').length
      },
      byType: {
        stock: filtered.filter((a) => a.type === 'stock').length,
        system: filtered.filter((a) => a.type === 'system').length,
        validation: filtered.filter((a) => a.type === 'validation').length,
        business: filtered.filter((a) => a.type === 'business').length,
        security: filtered.filter((a) => a.type === 'security').length,
        operational: filtered.filter((a) => a.type === 'operational').length,
        achievement: filtered.filter((a) => a.type === 'achievement').length
      },
      byContext: {
        // Core
        dashboard: filtered.filter((a) => a.context === 'dashboard').length,
        global: filtered.filter((a) => a.context === 'global').length,
        settings: filtered.filter((a) => a.context === 'settings').length,
        debug: filtered.filter((a) => a.context === 'debug').length,

        // Supply Chain
        materials: filtered.filter((a) => a.context === 'materials').length,
        suppliers: filtered.filter((a) => a.context === 'suppliers').length,
        products: filtered.filter((a) => a.context === 'products').length,
        production: filtered.filter((a) => a.context === 'production').length,
        assets: filtered.filter((a) => a.context === 'assets').length,

        // Sales & Operations
        sales: filtered.filter((a) => a.context === 'sales').length,
        fulfillment: filtered.filter((a) => a.context === 'fulfillment').length,
        mobile: filtered.filter((a) => a.context === 'mobile').length,

        // Customer & Finance
        customers: filtered.filter((a) => a.context === 'customers').length,
        memberships: filtered.filter((a) => a.context === 'memberships').length,
        rentals: filtered.filter((a) => a.context === 'rentals').length,
        fiscal: filtered.filter((a) => a.context === 'fiscal').length,
        billing: filtered.filter((a) => a.context === 'billing').length,
        corporate: filtered.filter((a) => a.context === 'corporate').length,
        integrations: filtered.filter((a) => a.context === 'integrations').length,

        // Resources
        staff: filtered.filter((a) => a.context === 'staff').length,
        scheduling: filtered.filter((a) => a.context === 'scheduling').length,

        // Analytics
        reporting: filtered.filter((a) => a.context === 'reporting').length,
        intelligence: filtered.filter((a) => a.context === 'intelligence').length,
        executive: filtered.filter((a) => a.context === 'executive').length,

        // System
        gamification: filtered.filter((a) => a.context === 'gamification').length,
        achievements: filtered.filter((a) => a.context === 'achievements').length
      },
      averageResolutionTime: 0,
      escalatedCount: 0,
      recurringCount: filtered.filter((a) => a.isRecurring).length
    };
  }, [alerts]); // ✅ Only depends on alerts array

  // 🛠️ PERFORMANCE: Split context values with individual memoization
  // React.dev pattern: Memoize each value individually, then memoize the object
  // This prevents unnecessary re-renders when object reference changes but values don't
  
  // 🎯 CRITICAL: Memoize alerts array reference stability
  // Only create new reference when actual alerts change (deep comparison would be expensive)
  const memoizedAlerts = useMemo(() => alerts, [alerts]);
  
  // 🎯 CRITICAL: Memoize config object stability
  const memoizedConfig = useMemo(() => config, [config]);
  
  // 🎯 CRITICAL: Memoize isOpen boolean
  const memoizedIsOpen = useMemo(() => isNotificationCenterOpen, [isNotificationCenterOpen]);
  
  // State value - NOW only changes when memoized values actually change
  // React.dev: "components calling useContext won't need to re-render unless currentUser has changed"
  const stateValue = useMemo(() => ({
    alerts: memoizedAlerts,
    stats, // Already memoized with useMemo above
    config: memoizedConfig,
    isNotificationCenterOpen: memoizedIsOpen
  }), [memoizedAlerts, stats, memoizedConfig, memoizedIsOpen]);

  // Actions value - STABLE, never changes (all callbacks have empty deps)
  const actionsValue = useMemo(() => ({
    create,
    bulkCreate, // 🚀 NEW: Bulk creation for performance
    acknowledge,
    resolve,
    dismiss,
    update,
    markAsRead,      // 🆕 NEW
    snooze,          // 🆕 NEW
    archive,         // 🆕 NEW
    openNotificationCenter,   // 🆕 NEW
    closeNotificationCenter,  // 🆕 NEW
    getByContext,
    getBySeverity,
    getFiltered,
    getStats,
    updateConfig,
    bulkAcknowledge,
    bulkResolve,
    bulkDismiss,
    clearAll
  }), []); // 🎯 CRITICAL: Empty deps - all actions are stable with useCallback(fn, [])

  // Combined value for backward compatibility
  const contextValue: AlertsContextValue = useMemo(() => ({
    ...stateValue,
    ...actionsValue
  }), [stateValue, actionsValue]);

  return (
    <AlertsStateContext.Provider value={stateValue}>
      <AlertsActionsContext.Provider value={actionsValue}>
        <AlertsContext.Provider value={contextValue}>
          {children}
        </AlertsContext.Provider>
      </AlertsActionsContext.Provider>
    </AlertsStateContext.Provider>
  );
}

// Hook to use the alerts context (full context - backward compatibility)
export function useAlertsContext(): AlertsContextValue {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlertsContext must be used within an AlertsProvider');
  }
  return context;
}

// 🛠️ PERFORMANCE: Separate hooks for state and actions
// Use these for better performance - components only re-render when needed

/**
 * Hook to access alert state (alerts, stats, config, loading)
 * Components using this will re-render when alerts/config/loading change
 */
export function useAlertsState() {
  const context = useContext(AlertsStateContext);
  if (!context) {
    throw new Error('useAlertsState must be used within an AlertsProvider');
  }
  return context;
}

/**
 * Hook to access alert actions (create, acknowledge, resolve, etc.)
 * Components using this will NOT re-render when alerts change (stable references)
 */
export function useAlertsActions() {
  const context = useContext(AlertsActionsContext);
  if (!context) {
    throw new Error('useAlertsActions must be used within an AlertsProvider');
  }
  return context;
}