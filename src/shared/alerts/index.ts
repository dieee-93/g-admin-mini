// src/shared/alerts/index.ts
// 🎯 EXPORTACIONES CENTRALIZADAS DEL SISTEMA DE ALERTAS
// Punto único de entrada para todo el sistema de alertas

// Types
export type {
  Alert,
  AlertStatus,
  AlertSeverity,
  AlertType,
  AlertContext,
  AlertAction,
  AlertMetadata,
  CreateAlertInput,
  AlertFilters,
  AlertStats,
  AlertsConfiguration,
  AlertsContextValue,
  AlertsByStatus,
  AlertsBySeverity,
  AlertsByContext,
  EscalationLevel,
  AlertEvent
} from './types';

export { ALERT_EVENTS } from './types';

// Provider and Context
export { AlertsProvider, useAlertsContext } from './AlertsProvider';

// Main Hooks
export {
  useAlerts,
  useStockAlerts,
  useSystemAlerts,
  useCriticalAlerts,
  useContextAlerts,
  useAlertsBadge,
  useAlertsStats
} from './hooks/useAlerts';

export type {
  UseAlertsOptions,
  UseAlertsReturn
} from './hooks/useAlerts';

// Core Components
export { AlertDisplay } from './components/AlertDisplay';
export type { AlertDisplayProps } from './components/AlertDisplay';

export { 
  AlertBadge,
  NavAlertBadge,
  SidebarAlertBadge,
  StockAlertBadge,
  CriticalAlertBadge,
  AlertBadgeSkeleton
} from './components/AlertBadge';
export type { AlertBadgeProps } from './components/AlertBadge';

export { 
  GlobalAlertsDisplay,
  AutoGlobalAlertsDisplay
} from './components/GlobalAlertsDisplay';
export type { GlobalAlertsDisplayProps } from './components/GlobalAlertsDisplay';

// Utility functions and helpers
export const AlertUtils = {
  /**
   * Helper para crear alertas de stock rápidamente
   */
  createStockAlert: (itemName: string, currentStock: number, minThreshold: number, itemId?: string): CreateAlertInput => ({
    type: 'stock',
    severity: currentStock === 0 ? 'critical' : currentStock <= minThreshold * 0.5 ? 'high' : 'medium',
    context: 'materials',
    title: currentStock === 0 ? `Stock agotado: ${itemName}` : `Stock bajo: ${itemName}`,
    description: currentStock === 0 
      ? `El producto ${itemName} está completamente agotado`
      : `Solo quedan ${currentStock} unidades de ${itemName}`,
    metadata: {
      itemId,
      itemName,
      currentStock,
      minThreshold,
      unit: 'unidades'
    },
    actions: [
      {
        label: 'Agregar Stock',
        variant: 'primary',
        action: () => {
          // Will be handled by the component
          window.location.href = `/materials?action=add-stock&itemId=${itemId}`;
        },
        autoResolve: false
      },
      {
        label: 'Ver Detalles',
        variant: 'secondary',
        action: () => {
          window.location.href = `/materials/${itemId}`;
        }
      }
    ]
  }),

  /**
   * Helper para crear alertas de sistema
   */
  createSystemAlert: (title: string, description: string, severity: AlertSeverity = 'medium'): CreateAlertInput => ({
    type: 'system',
    severity,
    context: 'global',
    title,
    description,
    persistent: true
  }),

  /**
   * Helper para crear alertas de validación
   */
  createValidationAlert: (fieldName: string, message: string): CreateAlertInput => ({
    type: 'validation',
    severity: 'low',
    context: 'global',
    title: `Error en ${fieldName}`,
    description: message,
    metadata: {
      fieldName,
      validationRule: message
    },
    persistent: false,
    autoExpire: 10 // 10 minutes
  }),

  /**
   * Formatear tiempo relativo
   */
  formatRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  },

  /**
   * Determinar color basado en severidad
   */
  getSeverityColor: (severity: AlertSeverity): string => {
    const colorMap = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'blue',
      info: 'gray'
    };
    return colorMap[severity];
  },

  /**
   * Determinar texto en español para severidad
   */
  getSeverityText: (severity: AlertSeverity): string => {
    const textMap = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      info: 'Info'
    };
    return textMap[severity];
  },

  /**
   * Determinar texto en español para estado
   */
  getStatusText: (status: AlertStatus): string => {
    const textMap = {
      active: 'Activa',
      acknowledged: 'Reconocida',
      resolved: 'Resuelta',
      dismissed: 'Descartada'
    };
    return textMap[status];
  }
};

// Re-export for backwards compatibility (if needed during migration)
export { notify } from '@/lib/notifications'; // For toasts