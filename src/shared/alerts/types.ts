// src/shared/alerts/types.ts
// 🎯 SISTEMA UNIFICADO DE ALERTAS
// Tipos y interfaces centralizadas para todo el sistema de alertas

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AlertType = 'stock' | 'system' | 'validation' | 'business' | 'security' | 'operational';

export type AlertContext = 'materials' | 'sales' | 'operations' | 'dashboard' | 'global' | 'customers' | 'staff' | 'fiscal';

// Acción que puede ejecutar el usuario en una alerta
export interface AlertAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  action: () => void | Promise<void>;
  autoResolve?: boolean; // Si ejecutar esta acción resuelve automáticamente la alerta
}

// Metadata adicional para diferentes tipos de alertas
export interface AlertMetadata {
  // Para alertas de stock
  itemId?: string;
  itemName?: string;
  currentStock?: number;
  minThreshold?: number;
  unit?: string;

  // Para alertas de sistema
  systemComponent?: string;
  errorCode?: string;
  
  // Para alertas de negocio
  affectedRevenue?: number;
  estimatedImpact?: string;
  timeToResolve?: number; // minutos estimados
  
  // Para alertas de validación
  fieldName?: string;
  validationRule?: string;

  // URLs relacionadas
  relatedUrl?: string;
  documentationUrl?: string;
}

// Alerta principal
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  context: AlertContext;

  // Contenido
  title: string;
  description?: string;
  metadata?: AlertMetadata;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;

  // Configuración
  persistent?: boolean; // Si debe persistir entre sesiones
  autoExpire?: number; // Minutos después de los cuales expira automáticamente
  escalationLevel?: number;

  // Acciones disponibles
  actions?: AlertAction[];

  // Recurrencia
  isRecurring?: boolean;
  recurrencePattern?: string;
  occurrenceCount?: number;
  lastOccurrence?: Date;
}

// Para crear nuevas alertas
export interface CreateAlertInput {
  type: AlertType;
  severity: AlertSeverity;
  context: AlertContext;
  title: string;
  description?: string;
  metadata?: AlertMetadata;
  persistent?: boolean;
  autoExpire?: number;
  actions?: Omit<AlertAction, 'id'>[];
  isRecurring?: boolean;
  recurrencePattern?: string;
}

// Filtros para queries
export interface AlertFilters {
  status?: AlertStatus | AlertStatus[];
  severity?: AlertSeverity | AlertSeverity[];
  type?: AlertType | AlertType[];
  context?: AlertContext | AlertContext[];
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

// Estadísticas de alertas
export interface AlertStats {
  total: number;
  byStatus: Record<AlertStatus, number>;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<AlertType, number>;
  byContext: Record<AlertContext, number>;
  averageResolutionTime: number; // en minutos
  escalatedCount: number;
  recurringCount: number;
}

// Configuración del sistema de alertas
export interface AlertsConfiguration {
  // Display settings
  maxVisibleAlerts: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoCollapse: boolean;
  collapseAfter: number; // segundos

  // Notification settings
  soundEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;

  // Escalation settings
  escalationEnabled: boolean;
  escalationThreshold: number; // minutos
  escalationLevels: EscalationLevel[];

  // Persistence
  persistAcrossSeessions: boolean;
  maxStoredAlerts: number;
}

export interface EscalationLevel {
  level: number;
  triggerAfter: number; // minutos
  recipients: string[];
  actions: string[];
}

// Para hooks y providers
export interface AlertsContextValue {
  alerts: Alert[];
  stats: AlertStats;
  config: AlertsConfiguration;
  loading: boolean;
  
  // Actions
  create: (input: CreateAlertInput) => Promise<string>; // Returns alert ID
  acknowledge: (id: string, notes?: string) => Promise<void>;
  resolve: (id: string, notes?: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  update: (id: string, updates: Partial<Alert>) => Promise<void>;
  
  // Queries
  getByContext: (context: AlertContext) => Alert[];
  getBySeverity: (severity: AlertSeverity) => Alert[];
  getFiltered: (filters: AlertFilters) => Alert[];
  getStats: (filters?: AlertFilters) => AlertStats;
  
  // Configuration
  updateConfig: (config: Partial<AlertsConfiguration>) => Promise<void>;
  
  // Bulk operations
  bulkAcknowledge: (ids: string[]) => Promise<void>;
  bulkResolve: (ids: string[]) => Promise<void>;
  bulkDismiss: (ids: string[]) => Promise<void>;
  clearAll: (filters?: AlertFilters) => Promise<void>;
}

// Event types para el sistema de eventos
export const ALERT_EVENTS = {
  CREATED: 'alert:created',
  ACKNOWLEDGED: 'alert:acknowledged', 
  RESOLVED: 'alert:resolved',
  DISMISSED: 'alert:dismissed',
  UPDATED: 'alert:updated',
  EXPIRED: 'alert:expired',
  ESCALATED: 'alert:escalated'
} as const;

export type AlertEvent = typeof ALERT_EVENTS[keyof typeof ALERT_EVENTS];

// Utilidades de tipo
export type AlertsByStatus = Record<AlertStatus, Alert[]>;
export type AlertsBySeverity = Record<AlertSeverity, Alert[]>;
export type AlertsByContext = Record<AlertContext, Alert[]>;