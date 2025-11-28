// EventBus Enterprise - Enterprise Type Definitions
// Advanced type system with module-scoped events, deduplication, and offline-first support

// =============================================================================
// CORE EVENT TYPES
// =============================================================================

export type ModuleId = string;
export type EventNamespace = string;
export type EventAction = string;
export type EventPattern = `${EventNamespace}.${EventAction}` | `global.${EventAction}`;

// Base event structure with namespace support
export interface NamespacedEvent<TPayload = any> {
  id: string;                        // Unique event ID
  pattern: EventPattern;             // e.g., 'sales.order.completed' or 'global.payment.processed'
  payload: TPayload;                 // Event data
  timestamp: string;                 // ISO timestamp
  source: ModuleId;                  // Source module ID
  version: string;                   // Event schema version
  correlationId?: string;            // For tracing related events
  userId?: string;                   // User context
  metadata: EventMetadata;           // Extended metadata
}

// Event metadata for enterprise features
export interface EventMetadata {
  priority: EventPriority;
  persistent: boolean;               // Should survive app restart
  crossModule: boolean;              // Allow cross-module handlers
  retryPolicy?: RetryPolicy;         // Retry configuration
  deduplication: DeduplicationMetadata;
  tracing: TracingMetadata;
}

// Deduplication system
export interface DeduplicationMetadata {
  contentHash: string;               // SHA-256 of normalized payload
  operationId: string;               // Unique operation identifier
  clientId: string;                  // Client instance ID
  semanticKey: string;               // Semantic deduplication key
  attempts: number;                  // Retry attempt counter
  windowMs: number;                  // Deduplication window
}

// Tracing and observability
export interface TracingMetadata {
  traceId: string;                   // Distributed tracing ID
  spanId: string;                    // Current span ID
  parentSpanId?: string;             // Parent span for nested events
  baggage?: Record<string, string>;  // Tracing baggage
}

// Event priorities for processing order
export enum EventPriority {
  CRITICAL = 0,    // System-critical events (e.g., payment failures)
  HIGH = 1,        // Important business events (e.g., order completion)
  NORMAL = 2,      // Regular events (e.g., stock updates)
  LOW = 3,         // Background events (e.g., analytics)
  BACKGROUND = 4   // Non-urgent events (e.g., cleanup tasks)
}

// Retry policies for failed events
export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  retryableErrors: string[];         // Error codes that should trigger retry
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

export type EventHandler<TPayload = any> = (
  event: NamespacedEvent<TPayload>
) => Promise<void> | void;

export interface EventSubscription<TPayload = any> {
  id: string;
  pattern: EventPattern;
  handler: EventHandler<TPayload>;
  moduleId: ModuleId;
  priority: EventPriority;
  persistent: boolean;               // Survive module deactivation
  filter?: EventFilter<TPayload>;    // Optional event filtering
  created: Date;
  lastTriggered?: Date;
}

export type EventFilter<TPayload = any> = (
  event: NamespacedEvent<TPayload>
) => boolean;

export type UnsubscribeFn = () => void;

// =============================================================================
// MODULE SYSTEM
// =============================================================================

export interface ModuleDescriptor {
  id: ModuleId;
  name: string;
  version: string;
  description?: string;
  dependencies: ModuleId[];          // Required modules
  optionalDependencies?: ModuleId[]; // Optional modules
  eventSubscriptions: EventSubscriptionConfig[];
  healthCheck: () => Promise<ModuleHealth>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  config?: ModuleConfiguration;
}

export interface EventSubscriptionConfig {
  pattern: EventPattern;
  handler: string;                   // Handler method name
  priority?: EventPriority;
  persistent?: boolean;
  filter?: string;                   // Filter function name
}

export interface ModuleConfiguration {
  eventNamespace: EventNamespace;    // Module's event namespace
  maxConcurrentEvents: number;       // Concurrent event processing limit
  healthCheckIntervalMs: number;     // Health check frequency
  gracefulShutdownTimeoutMs: number; // Max time for graceful shutdown
}

export enum ModuleStatus {
  INACTIVE = 'inactive',
  ACTIVATING = 'activating', 
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  ERROR = 'error',
  DEGRADED = 'degraded'              // Partially functional
}

export interface ModuleHealth {
  status: ModuleStatus;
  message?: string;
  metrics: ModuleMetrics;
  dependencies: Record<ModuleId, boolean>;
  lastCheck: Date;
}

export interface ModuleMetrics {
  eventsProcessed: number;
  eventsEmitted: number;
  errorRate: number;
  avgProcessingTimeMs: number;
  queueSize: number;
  memoryUsageMB?: number;
}

// =============================================================================
// EVENT BUS INTERFACES
// =============================================================================

export interface IEventBusV2 {
  // Module Management
  registerModule(descriptor: ModuleDescriptor): Promise<void>;
  deactivateModule(moduleId: ModuleId): Promise<void>;
  reactivateModule(moduleId: ModuleId): Promise<void>;
  getModuleHealth(moduleId?: ModuleId): Promise<Record<ModuleId, ModuleHealth>>;
  
  // Event Operations
  emit<TPayload = any>(
    pattern: EventPattern,
    payload: TPayload,
    options?: EmitOptions
  ): Promise<void>;
  
  on<TPayload = any>(
    pattern: EventPattern,
    handler: EventHandler<TPayload>,
    options?: SubscribeOptions
  ): UnsubscribeFn;
  
  once<TPayload = any>(
    pattern: EventPattern,
    handler: EventHandler<TPayload>,
    options?: SubscribeOptions
  ): UnsubscribeFn;
  
  off(pattern: EventPattern, handler?: EventHandler): void;
  
  // Advanced Operations
  waitFor<TPayload = any>(
    pattern: EventPattern,
    timeout?: number,
    filter?: EventFilter<TPayload>
  ): Promise<NamespacedEvent<TPayload>>;
  
  replay(
    pattern: EventPattern,
    fromTimestamp?: string,
    toTimestamp?: string
  ): Promise<NamespacedEvent[]>;
  
  // System Operations
  gracefulShutdown(timeoutMs?: number): Promise<void>;
  getMetrics(): Promise<EventBusMetrics>;
  clearHistory(beforeTimestamp?: string): Promise<number>;
  
  // Testing & Development
  enableTestMode(): void;
  disableTestMode(): void;
  mockEvent<TPayload = any>(pattern: EventPattern, payload: TPayload): void;
  getMockHistory(): NamespacedEvent[];
  clearMockHistory(): void;
}

// Event emission options
export interface EmitOptions {
  priority?: EventPriority;
  persistent?: boolean;
  crossModule?: boolean;
  retryPolicy?: RetryPolicy;
  correlationId?: string;
  userId?: string;
  traceId?: string;
  deduplicationWindow?: number;      // Custom deduplication window
}

// Subscription options
export interface SubscribeOptions {
  moduleId?: ModuleId;
  priority?: EventPriority;
  persistent?: boolean;
  filter?: EventFilter;
  once?: boolean;
}

// =============================================================================
// SYSTEM METRICS & MONITORING
// =============================================================================

export interface EventBusMetrics {
  uptime: number;
  totalEvents: number;
  eventsPerSecond: number;
  activeModules: number;
  activeSubscriptions: number;
  queueSize: number;
  errorRate: number;
  avgLatencyMs: number;
  memoryUsageMB: number;
  modules: Record<ModuleId, ModuleMetrics>;
  eventPatterns: Record<EventPattern, PatternMetrics>;
}

export interface PatternMetrics {
  totalEvents: number;
  avgLatencyMs: number;
  errorRate: number;
  subscriberCount: number;
  lastEvent?: Date;
}

// =============================================================================
// PERSISTENCE & SYNC
// =============================================================================

export interface EventStore {
  append(event: NamespacedEvent): Promise<void>;
  getEvents(
    pattern?: EventPattern,
    fromTimestamp?: string,
    toTimestamp?: string,
    limit?: number
  ): Promise<NamespacedEvent[]>;
  
  cleanup(beforeTimestamp: string): Promise<number>;
  getSize(): Promise<number>;
  
  // Deduplication support
  findDuplicates(metadata: DeduplicationMetadata): Promise<NamespacedEvent[]>;
  markAsProcessed(eventId: string): Promise<void>;
}

// Sync integration with existing OfflineSync
export interface OfflineSyncIntegration {
  queueEventForSync(event: NamespacedEvent): Promise<void>;
  isOnline(): boolean;
  getQueueSize(): number;
  forceSync(): Promise<void>;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class EventBusError extends Error {
  constructor(
    message: string,
    public code: EventBusErrorCode,
    public context?: any
  ) {
    super(message);
    this.name = 'EventBusError';
  }
}

export enum EventBusErrorCode {
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  MODULE_ALREADY_EXISTS = 'MODULE_ALREADY_EXISTS',
  DEPENDENCY_MISSING = 'DEPENDENCY_MISSING',
  INVALID_EVENT_PATTERN = 'INVALID_EVENT_PATTERN',
  HANDLER_ERROR = 'HANDLER_ERROR',
  PERSISTENCE_ERROR = 'PERSISTENCE_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  DEDUPLICATION_ERROR = 'DEDUPLICATION_ERROR',
  GRACEFUL_SHUTDOWN_TIMEOUT = 'GRACEFUL_SHUTDOWN_TIMEOUT'
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface EventBusConfig {
  // Core configuration
  maxEventHistorySize: number;
  maxConcurrentEvents: number;
  defaultEventTimeout: number;
  
  // Persistence configuration
  persistenceEnabled: boolean;
  persistenceStoreName: string;
  maxStorageSize: number;
  
  // Deduplication configuration
  deduplicationEnabled: boolean;
  defaultDeduplicationWindow: number;
  cleanupIntervalMs: number;
  
  // Retry configuration
  defaultRetryPolicy: RetryPolicy;
  
  // Monitoring configuration
  metricsEnabled: boolean;
  enableMetricsCollection?: boolean;  // Control metrics interval emission
  healthCheckIntervalMs: number;
  
  // Testing configuration
  testModeEnabled: boolean;
  
  // Integration configuration
  offlineSyncEnabled: boolean;
}

export const DEFAULT_CONFIG: EventBusConfig = {
  maxEventHistorySize: 10000,
  maxConcurrentEvents: 100,
  defaultEventTimeout: 30000,
  
  persistenceEnabled: true,
  persistenceStoreName: 'g-admin-eventbus-v2',
  maxStorageSize: 50 * 1024 * 1024, // 50MB
  
  deduplicationEnabled: true,
  defaultDeduplicationWindow: 5 * 60 * 1000, // 5 minutes
  cleanupIntervalMs: 60 * 1000, // 1 minute
  
  defaultRetryPolicy: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 30000,
    retryableErrors: ['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT']
  },
  
  metricsEnabled: true,
  healthCheckIntervalMs: 30000,
  
  testModeEnabled: false,
  
  offlineSyncEnabled: false
};

// =============================================================================
// BRANDED TYPES & UTILITIES - For type safety and validation
// =============================================================================

// Branded types for better type safety
export type EventId = string & { readonly _brand: 'EventId' };
export type SubscriptionId = string & { readonly _brand: 'SubscriptionId' };
export type TraceId = string & { readonly _brand: 'TraceId' };
export type SpanId = string & { readonly _brand: 'SpanId' };
export type ModuleId = string & { readonly _brand: 'ModuleId' };
export type InstanceId = string & { readonly _brand: 'InstanceId' };

// Utility functions to create and validate branded types
export const createEventId = (value: string): EventId => {
  if (!value.startsWith('evt_')) {
    throw new Error('EventId must start with "evt_"');
  }
  return value as EventId;
};

export const createSubscriptionId = (value: string): SubscriptionId => {
  if (!value.startsWith('sub_')) {
    throw new Error('SubscriptionId must start with "sub_"');
  }
  return value as SubscriptionId;
};

export const createTraceId = (value: string): TraceId => {
  if (!value.startsWith('trace_')) {
    throw new Error('TraceId must start with "trace_"');
  }
  return value as TraceId;
};

export const createSpanId = (value: string): SpanId => {
  if (!value.startsWith('span_')) {
    throw new Error('SpanId must start with "span_"');
  }
  return value as SpanId;
};

export const createModuleId = (value: string): ModuleId => {
  if (!value || !/^[a-z][a-z0-9-]*$/.test(value)) {
    throw new Error('ModuleId must be lowercase alphanumeric with hyphens');
  }
  return value as ModuleId;
};

export const createInstanceId = (value: string): InstanceId => {
  if (!value || value.length < 3) {
    throw new Error('InstanceId must be at least 3 characters');
  }
  return value as InstanceId;
};

// Type guard functions for validation
export const isEventId = (value: any): value is EventId => {
  return typeof value === 'string' && value.startsWith('evt_');
};

export const isSubscriptionId = (value: any): value is SubscriptionId => {
  return typeof value === 'string' && value.startsWith('sub_');
};

export const isTraceId = (value: any): value is TraceId => {
  return typeof value === 'string' && value.startsWith('trace_');
};

export const isSpanId = (value: any): value is SpanId => {
  return typeof value === 'string' && value.startsWith('span_');
};

export const isValidEventPattern = (pattern: any): pattern is EventPattern => {
  if (typeof pattern !== 'string') return false;
  
  // Define valid modules for the G-Admin system
  const validModules = ['sales', 'inventory', 'customers', 'kitchen', 'staff', 'scheduling', 'fiscal', 'operations', 'payment'];
  
  // Pattern validation with module name checking
  const parts = pattern.split('.');
  
  if (parts.length < 2) return false;
  
  const [module, entity, action] = parts;
  
  // Handle global patterns
  if (module === 'global') {
    if (parts.length === 2) {
      // global.action or global.*
      return /^[a-z][a-z0-9_]*$/.test(entity) || entity === '*';
    }
    if (parts.length === 3) {
      // global.entity.action (e.g., global.system.updated)
      return /^[a-z][a-z0-9_]*$/.test(entity) && /^[a-z][a-z0-9_]*$/.test(action);
    }
    return false;
  }
  
  // Check if module is valid
  if (!validModules.includes(module)) return false;
  
  // Handle module.* pattern
  if (parts.length === 2 && entity === '*') return true;
  
  // Handle module.action pattern (2 parts)
  if (parts.length === 2) {
    return /^[a-z][a-z0-9_]*$/.test(entity);
  }
  
  // Handle module.entity.* pattern
  if (parts.length === 3 && action === '*') {
    return /^[a-z][a-z0-9_]*$/.test(entity);
  }
  
  // Handle module.entity.action pattern
  if (parts.length === 3) {
    return /^[a-z][a-z0-9_]*$/.test(entity) && /^[a-z][a-z0-9_]*$/.test(action);
  }
  
  return false;
};

// =============================================================================
// ADVANCED TYPESCRIPT TYPES - Template literal utilities
// =============================================================================

// Generic event payload type
export type EventPayload = Record<string, any>;

// Template literal utilities for extracting parts from event patterns
export type ExtractModule<T extends EventPattern> = 
  T extends `${infer Module}.${string}.${string}` 
    ? Module 
    : T extends `global.${string}` 
      ? 'global' 
      : never;

export type ExtractEntity<T extends EventPattern> = 
  T extends `${string}.${infer Entity}.${string}` 
    ? Entity 
    : never;

export type ExtractAction<T extends EventPattern> = 
  T extends `${string}.${string}.${infer Action}` 
    ? Action 
    : T extends `global.${infer Action}` 
      ? Action 
      : never;

// Typed event with extracted module/entity/action information
export type TypedEvent<T extends EventPattern, P extends EventPayload = EventPayload> = 
  NamespacedEvent<P> & {
    pattern: T;
    module: ExtractModule<T>;
    entity: ExtractEntity<T>;
    action: ExtractAction<T>;
  };

// Typed event handler for specific patterns
export type TypedEventHandler<T extends EventPattern, P extends EventPayload = EventPayload> = 
  (event: TypedEvent<T, P>) => Promise<void> | void;