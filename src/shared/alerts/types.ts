// src/shared/alerts/types.ts
// 🎯 SISTEMA UNIFICADO DE ALERTAS
// Tipos y interfaces centralizadas para todo el sistema de alertas

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed' | 'snoozed';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning' | 'error';

export type AlertType = 'stock' | 'system' | 'validation' | 'business' | 'security' | 'operational' | 'achievement';

/**
 * Intelligence level classification (3-layer system)
 * - simple: Layer 1 - User actions, system events (auto-expire)
 * - smart: Layer 2 - Business intelligence, context-aware (persistent)
 * - predictive: Layer 3 - ML predictions, anomaly detection (future)
 */
export type IntelligenceLevel = 'simple' | 'smart' | 'predictive';

// ✅ COMPLETE: All active modules from ALL_MODULE_MANIFESTS
export type AlertContext =
  // Core
  | 'dashboard'
  | 'global'
  | 'settings'
  | 'debug'

  // Supply Chain
  | 'materials'
  | 'suppliers'
  | 'products'
  | 'production'
  | 'assets'

  // Sales & Operations
  | 'sales'
  | 'fulfillment'
  | 'mobile'

  // Customer & Finance
  | 'customers'
  | 'memberships'
  | 'rentals'
  | 'fiscal'
  | 'billing'
  | 'corporate'
  | 'integrations'

  // Resources
  | 'staff'
  | 'scheduling'

  // Analytics
  | 'reporting'
  | 'intelligence'
  | 'executive'

  // System
  | 'gamification'
  | 'achievements';

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

  // Para alertas de logros/achievements
  achievementId?: string;
  achievementType?: 'capability' | 'mastery';
  achievementIcon?: string;
  achievementDomain?: string;
  experiencePoints?: number;

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
  
  // NEW: Intelligence classification (3-layer system)
  intelligence_level: IntelligenceLevel;

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
  
  // Notification Center timestamps
  readAt?: Date;           // Timestamp cuando usuario leyó la alerta
  snoozedUntil?: Date;     // Snooze hasta esta fecha
  archivedAt?: Date;       // Archivado del notification center

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
  
  // ML/Prediction fields (Layer 3 - future)
  confidence?: number; // 0.0 to 1.0
  predictedDate?: Date;
  modelVersion?: string;
}

// Para crear nuevas alertas
export interface CreateAlertInput {
  type: AlertType;
  severity: AlertSeverity;
  context: AlertContext;
  intelligence_level: IntelligenceLevel;
  title: string;
  description?: string;
  metadata?: AlertMetadata;
  persistent?: boolean;
  autoExpire?: number;
  actions?: Omit<AlertAction, 'id'>[];
  isRecurring?: boolean;
  recurrencePattern?: string;
  
  // ML/Prediction fields (Layer 3 - future)
  confidence?: number;
  predictedDate?: Date;
  modelVersion?: string;
}

// Filtros para queries
export interface AlertFilters {
  status?: AlertStatus | AlertStatus[];
  severity?: AlertSeverity | AlertSeverity[];
  type?: AlertType | AlertType[];
  context?: AlertContext | AlertContext[];
  intelligence_level?: IntelligenceLevel | IntelligenceLevel[]; // NEW: Filter by intelligence level
  createdAfter?: Date;
  createdBefore?: Date;
  search?: string;
}

// Estadísticas de alertas
export interface AlertStats {
  total: number;
  unread: number;  // Count de alertas no leídas (para notification center)
  byStatus: Record<AlertStatus, number>;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<AlertType, number>;
  byContext: Record<AlertContext, number>;
  averageResolutionTime: number; // en minutos
  escalatedCount: number;
  recurringCount: number;
}

// Toast duration configuration (ms)
export interface ToastDurationConfig {
  info: number;      // Default: 3000ms (3s)
  success: number;   // Default: 3000ms (3s)
  warning: number;   // Default: 5000ms (5s)
  error: number;     // Default: 8000ms (8s)
  critical: number;  // Default: Infinity (no auto-dismiss)
  high?: number;     // Optional: Defaults to error duration
  medium?: number;   // Optional: Defaults to warning duration
  low?: number;      // Optional: Defaults to info duration
}

// Configuración del sistema de alertas
export interface AlertsConfiguration {
  // Display settings
  maxVisibleAlerts: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoCollapse: boolean;
  collapseAfter: number; // segundos

  // Toast stack settings
  toastDuration?: ToastDurationConfig;
  toastStackMax?: number;           // Max toasts visibles simultáneamente (default: 3)
  notificationCenterMax?: number;    // Max alertas en historial (default: 50)

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
  isNotificationCenterOpen: boolean;  // Notification center drawer state
  
  // Actions
  create: (input: CreateAlertInput) => Promise<string>; // Returns alert ID
  bulkCreate: (inputs: CreateAlertInput[]) => Promise<string[]>; // 🚀 Bulk creation - returns alert IDs
  acknowledge: (id: string, notes?: string) => Promise<void>;
  resolve: (id: string, notes?: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  update: (id: string, updates: Partial<Alert>) => Promise<void>;
  
  // Notification Center actions
  markAsRead: (id: string) => Promise<void>;
  snooze: (id: string, duration: number) => Promise<void>; // duration in ms
  archive: (id: string) => Promise<void>;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  
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
  CREATED: 'alerts.alert.created',
  ACKNOWLEDGED: 'alerts.alert.acknowledged', 
  RESOLVED: 'alerts.alert.resolved',
  DISMISSED: 'alerts.alert.dismissed',
  UPDATED: 'alerts.alert.updated',
  EXPIRED: 'alerts.alert.expired',
  ESCALATED: 'alerts.alert.escalated'
} as const;

export type AlertEvent = typeof ALERT_EVENTS[keyof typeof ALERT_EVENTS];

// Utilidades de tipo
export type AlertsByStatus = Record<AlertStatus, Alert[]>;
export type AlertsBySeverity = Record<AlertSeverity, Alert[]>;
export type AlertsByContext = Record<AlertContext, Alert[]>;