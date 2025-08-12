// Restaurant Events - Event-Driven Architecture for G-Admin
// Based on architecture-plan.md event-driven patterns

// Core Events for Restaurant Operations
export enum RestaurantEvents {
  // Order Lifecycle
  ORDER_PLACED = 'order.placed',
  ORDER_CONFIRMED = 'order.confirmed', 
  ORDER_PREPARED = 'order.prepared',
  ORDER_SERVED = 'order.served',
  ORDER_PAID = 'order.paid',
  ORDER_CANCELLED = 'order.cancelled',
  
  // Payment Events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',
  
  // Inventory Events
  STOCK_LOW = 'inventory.stock_low',
  STOCK_OUT = 'inventory.stock_out',
  STOCK_RECEIVED = 'inventory.stock_received',
  STOCK_ADJUSTED = 'inventory.stock_adjusted',
  ITEM_EXPIRED = 'inventory.item_expired',
  
  // Supply Chain Intelligence Events
  ABC_ANALYSIS_COMPLETED = 'supply_chain.abc_analysis_completed',
  PROCUREMENT_ORDER_GENERATED = 'supply_chain.procurement_order_generated',
  SUPPLIER_PERFORMANCE_UPDATED = 'supply_chain.supplier_performance_updated',
  INVENTORY_OPTIMIZATION_COMPLETED = 'supply_chain.inventory_optimization_completed',
  DEMAND_FORECAST_UPDATED = 'supply_chain.demand_forecast_updated',
  REORDER_POINT_TRIGGERED = 'supply_chain.reorder_point_triggered',
  COST_VARIANCE_DETECTED = 'supply_chain.cost_variance_detected',
  SUPPLIER_QUALITY_ISSUE = 'supply_chain.supplier_quality_issue',
  DELIVERY_DELAY_DETECTED = 'supply_chain.delivery_delay_detected',
  
  // Smart Alerts Events
  ALERT_GENERATED = 'alerts.alert_generated',
  ALERT_ACKNOWLEDGED = 'alerts.alert_acknowledged',
  ALERT_RESOLVED = 'alerts.alert_resolved',
  ALERT_ESCALATED = 'alerts.alert_escalated',
  AUTOMATED_ACTION_EXECUTED = 'alerts.automated_action_executed',
  
  // Reporting Events
  REPORT_GENERATED = 'reporting.report_generated',
  REPORT_EXPORTED = 'reporting.report_exported',
  REPORT_SCHEDULED = 'reporting.report_scheduled',
  DASHBOARD_UPDATED = 'reporting.dashboard_updated',
  
  // Recipe Events
  RECIPE_USED = 'recipe.used',
  RECIPE_COST_CHANGED = 'recipe.cost_changed',
  INGREDIENT_SUBSTITUTED = 'recipe.ingredient_substituted',
  RECIPE_YIELD_UPDATED = 'recipe.yield_updated',
  
  // Staff Events
  SHIFT_STARTED = 'staff.shift_started',
  SHIFT_ENDED = 'staff.shift_ended',
  OVERTIME_DETECTED = 'staff.overtime_detected',
  EMPLOYEE_PERFORMANCE_UPDATED = 'staff.performance_updated',
  
  // Kitchen Events
  PREPARATION_STARTED = 'kitchen.preparation_started',
  ITEM_READY = 'kitchen.item_ready',
  KITCHEN_DELAYED = 'kitchen.delayed',
  QUALITY_ISSUE = 'kitchen.quality_issue',
  
  // Sales Events
  SALE_COMPLETED = 'sale.completed',
  CUSTOMER_SEATED = 'sale.customer_seated',
  TABLE_CLEANED = 'sale.table_cleaned',
  
  // Fiscal Events
  INVOICE_GENERATED = 'fiscal.invoice_generated',
  CAE_OBTAINED = 'fiscal.cae_obtained',
  CAE_REJECTED = 'fiscal.cae_rejected',
  TAX_PERIOD_CLOSED = 'fiscal.tax_period_closed',
  
  // System Events
  DATA_SYNCED = 'system.data_synced',
  BACKUP_COMPLETED = 'system.backup_completed',
  ERROR_OCCURRED = 'system.error_occurred',
  MAINTENANCE_STARTED = 'system.maintenance_started',

  // WebSocket Events
  WEBSOCKET_CONNECTED = 'websocket.connected',
  WEBSOCKET_DISCONNECTED = 'websocket.disconnected',
  WEBSOCKET_ERROR = 'websocket.error',
  WEBSOCKET_STATE_CHANGED = 'websocket.state_changed',

  // Real-time Update Events
  ORDER_UPDATED = 'order.updated',
  ORDER_STATUS_CHANGED = 'order.status_changed',
  INVENTORY_UPDATED = 'inventory.updated',
  EMPLOYEE_CLOCK_IN = 'employee.clock_in',
  EMPLOYEE_CLOCK_OUT = 'employee.clock_out',
  
  // Real-time Event Versions
  ORDER_CREATED_REALTIME = 'realtime.order_created',
  ORDER_UPDATED_REALTIME = 'realtime.order_updated', 
  ORDER_STATUS_CHANGED_REALTIME = 'realtime.order_status_changed',
  INVENTORY_UPDATED_REALTIME = 'realtime.inventory_updated',
  STAFF_TIME_UPDATED_REALTIME = 'realtime.staff_time_updated',
  KITCHEN_UPDATED_REALTIME = 'realtime.kitchen_updated',
  NOTIFICATION_RECEIVED_REALTIME = 'realtime.notification_received',
  SYNC_REQUESTED_REALTIME = 'realtime.sync_requested',
  
  // Sync Events
  SYNC_COMPLETED = 'sync.completed',
  SYNC_FAILED = 'sync.failed'
}

// Event Payload Interfaces
export interface OrderPlacedEvent {
  orderId: string;
  customerId?: string;
  tableId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  timestamp: string;
}

export interface PaymentCompletedEvent {
  paymentId: string;
  orderId?: string;
  saleId?: string;
  amount: number;
  paymentMethod: string;
  customerId?: string;
  timestamp: string;
  reference?: string;
}

export interface StockLowEvent {
  itemId: string;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  suggestedReorder: number;
  supplierId?: string;
  timestamp: string;
}

export interface RecipeUsedEvent {
  recipeId: string;
  recipeName: string;
  quantity: number;
  orderId?: string;
  expectedYield: number;
  actualYield?: number;
  ingredients: Array<{
    itemId: string;
    quantityUsed: number;
  }>;
  timestamp: string;
}

export interface SaleCompletedEvent {
  saleId: string;
  orderId?: string;
  customerId?: string;
  tableId?: string;
  totalAmount: number;
  subtotal: number;
  taxes: number;
  tips?: number;
  paymentMethods: Array<{
    method: string;
    amount: number;
  }>;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  timestamp: string;
}

export interface InvoiceGeneratedEvent {
  invoiceId: string;
  saleId?: string;
  customerId?: string;
  invoiceNumber: string;
  totalAmount: number;
  taxAmount: number;
  invoiceType: string;
  requiresCAE: boolean;
  timestamp: string;
}

export interface CAEObtainedEvent {
  invoiceId: string;
  cae: string;
  caeExpiration: string;
  afipResponse?: any;
  timestamp: string;
}

export interface ShiftEvent {
  employeeId: string;
  shiftId: string;
  shiftStart?: string;
  shiftEnd?: string;
  department: string;
  position: string;
  timestamp: string;
}

export interface KitchenEvent {
  orderId: string;
  itemId: string;
  stationId?: string;
  employeeId?: string;
  estimatedTime?: number;
  actualTime?: number;
  qualityNotes?: string;
  timestamp: string;
}

// Supply Chain Intelligence Event Payloads
export interface ABCAnalysisCompletedEvent {
  analysisId: string;
  totalItems: number;
  classACount: number;
  classBCount: number;
  classCCount: number;
  recommendationsCount: number;
  analysisMethod: 'revenue' | 'usage' | 'hybrid';
  timestamp: string;
}

export interface ProcurementOrderGeneratedEvent {
  orderId: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  itemCount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDelivery: string;
  optimizationScore: number;
  timestamp: string;
}

export interface SupplierPerformanceUpdatedEvent {
  supplierId: string;
  supplierName: string;
  overallScore: number;
  previousScore: number;
  metrics: {
    deliveryReliability: number;
    qualityConsistency: number;
    priceCompetitiveness: number;
    responsiveness: number;
    sustainability: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface InventoryOptimizationCompletedEvent {
  optimizationId: string;
  totalItems: number;
  forecastAccuracy: number;
  potentialSavings: number;
  recommendationsCount: number;
  criticalItems: number;
  averageServiceLevel: number;
  timestamp: string;
}

export interface DemandForecastUpdatedEvent {
  forecastId: string;
  materialId: string;
  materialName: string;
  currentDemand: number;
  predictedDemand: number;
  confidenceLevel: number;
  forecastHorizon: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  timestamp: string;
}

export interface ReorderPointTriggeredEvent {
  materialId: string;
  materialName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedOrderQuantity: number;
  supplierId?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedStockoutDate?: string;
  timestamp: string;
}

export interface CostVarianceDetectedEvent {
  materialId: string;
  materialName: string;
  previousCost: number;
  currentCost: number;
  variancePercentage: number;
  thresholdBreached: number;
  supplierId?: string;
  impact: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface SupplierQualityIssueEvent {
  supplierId: string;
  supplierName: string;
  materialId?: string;
  materialName?: string;
  issueType: 'quality' | 'delivery' | 'documentation' | 'communication';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  batchNumber?: string;
  affectedQuantity?: number;
  timestamp: string;
}

export interface DeliveryDelayDetectedEvent {
  deliveryId: string;
  supplierId: string;
  supplierName: string;
  orderId: string;
  expectedDelivery: string;
  actualDelivery?: string;
  delayHours: number;
  affectedItems: Array<{
    materialId: string;
    materialName: string;
    quantity: number;
  }>;
  operationalImpact: 'none' | 'minor' | 'moderate' | 'severe';
  timestamp: string;
}

// Smart Alerts Event Payloads
export interface AlertGeneratedEvent {
  alertId: string;
  alertType: 'stockout' | 'low_stock' | 'overstock' | 'quality' | 'supplier' | 'cost' | 'delivery' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  materialId?: string;
  supplierId?: string;
  estimatedImpact: number;
  autoActionsTriggered: string[];
  timestamp: string;
}

export interface AlertAcknowledgedEvent {
  alertId: string;
  acknowledgedBy: string;
  acknowledgedAt: string;
  notes?: string;
  timestamp: string;
}

export interface AlertResolvedEvent {
  alertId: string;
  resolvedBy: string;
  resolvedAt: string;
  resolutionMethod: 'manual' | 'automated' | 'escalated';
  resolutionNotes?: string;
  resolutionTime: number; // minutes
  timestamp: string;
}

export interface AlertEscalatedEvent {
  alertId: string;
  escalatedFrom: string;
  escalatedTo: string;
  escalationLevel: number;
  escalationReason: string;
  timestamp: string;
}

export interface AutomatedActionExecutedEvent {
  actionId: string;
  alertId?: string;
  actionType: 'auto_reorder' | 'notify_supplier' | 'adjust_forecast' | 'block_usage' | 'escalate_alert';
  status: 'completed' | 'failed' | 'partial';
  executionTime: number; // milliseconds
  result?: string;
  errorMessage?: string;
  timestamp: string;
}

// Reporting Event Payloads
export interface ReportGeneratedEvent {
  reportId: string;
  reportName: string;
  reportType: 'inventory' | 'procurement' | 'suppliers' | 'costs' | 'performance' | 'alerts' | 'forecasting';
  generatedBy: string;
  dataPoints: number;
  generationTime: number; // milliseconds
  format: 'pdf' | 'excel' | 'csv' | 'json';
  timestamp: string;
}

export interface ReportExportedEvent {
  reportId: string;
  exportFormat: 'pdf' | 'excel' | 'csv' | 'json';
  exportedBy: string;
  fileSize?: number; // bytes
  downloadUrl?: string;
  timestamp: string;
}

export interface ReportScheduledEvent {
  scheduleId: string;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  nextExecution: string;
  createdBy: string;
  timestamp: string;
}

export interface DashboardUpdatedEvent {
  dashboardId: string;
  metricsUpdated: string[];
  dataPointsRefreshed: number;
  updateTrigger: 'scheduled' | 'manual' | 'event_driven';
  updateDuration: number; // milliseconds
  timestamp: string;
}

// Base Event Interface
export interface BaseEvent<T = any> {
  type: RestaurantEvents;
  payload: T;
  timestamp: string;
  source: string;
  correlationId?: string;
  userId?: string;
}

// Event Handler Types
export type EventHandler<T = any> = (event: BaseEvent<T>) => Promise<void> | void;

export type EventHandlerMap = {
  [K in RestaurantEvents]: EventHandler[];
};

// Event Subscription Interface
export interface EventSubscription {
  eventType: RestaurantEvents;
  handler: EventHandler;
  once?: boolean;
  priority?: number;
}

// Event Filter Function Type
export type EventFilter<T = any> = (event: BaseEvent<T>) => boolean;