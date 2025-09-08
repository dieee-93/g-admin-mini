// EventBusV2.ts - Enterprise Event Bus Implementation
// Complete event bus with module management, deduplication, offline-first support, and comprehensive monitoring

import { EventStoreIndexedDB } from './EventStore';
import { DeduplicationManager } from './DeduplicationManager';
import { ModuleRegistry } from './ModuleRegistry';
import type {
  IEventBusV2,
  NamespacedEvent,
  EventPattern,
  EventHandler,
  EventFilter,
  ModuleId,
  ModuleDescriptor,
  ModuleHealth,
  EventSubscription,
  EventBusConfig,
  EventBusMetrics,
  EmitOptions,
  SubscribeOptions,
  UnsubscribeFn,
  EventPriority,
  EventBusError,
  EventBusErrorCode,
  DEFAULT_CONFIG,
  DeduplicationMetadata,
  TracingMetadata
} from './types';

// Integration with existing OfflineSync
import offlineSync, { type SyncOperation } from '@/lib/offline/OfflineSync';

// Event routing and processing
interface ProcessingContext {
  event: NamespacedEvent;
  subscriptions: EventSubscription[];
  startTime: number;
  traceId: string;
}

// Metrics tracking
class MetricsCollector {
  private metrics = {
    totalEvents: 0,
    eventsPerSecond: 0,
    activeModules: 0,
    activeSubscriptions: 0,
    queueSize: 0,
    errorRate: 0,
    avgLatencyMs: 0,
    memoryUsageMB: 0,
    eventPatterns: new Map<EventPattern, any>(),
    modules: new Map<ModuleId, any>()
  };

  private eventHistory: { timestamp: number; pattern: EventPattern }[] = [];
  private errorHistory: { timestamp: number; error: string }[] = [];
  private startTime = Date.now();

  recordEvent(event: NamespacedEvent, latencyMs: number): void {
    this.metrics.totalEvents++;
    
    // Track event pattern metrics
    const pattern = event.pattern;
    const patternMetrics = this.metrics.eventPatterns.get(pattern) || {
      totalEvents: 0,
      avgLatencyMs: 0,
      errorRate: 0,
      subscriberCount: 0,
      lastEvent: null
    };
    
    patternMetrics.totalEvents++;
    patternMetrics.avgLatencyMs = (patternMetrics.avgLatencyMs + latencyMs) / 2;
    patternMetrics.lastEvent = new Date();
    
    this.metrics.eventPatterns.set(pattern, patternMetrics);
    
    // Update global average latency
    this.metrics.avgLatencyMs = (this.metrics.avgLatencyMs + latencyMs) / 2;
    
    // Track for events per second calculation
    this.eventHistory.push({ timestamp: Date.now(), pattern });
    
    // Keep only last 60 seconds of history
    const cutoff = Date.now() - 60000;
    this.eventHistory = this.eventHistory.filter(h => h.timestamp > cutoff);
    
    // Calculate events per second
    this.metrics.eventsPerSecond = this.eventHistory.length / 60;
  }

  recordError(error: string): void {
    this.errorHistory.push({ timestamp: Date.now(), error });
    
    // Keep only last 5 minutes of errors
    const cutoff = Date.now() - 300000;
    this.errorHistory = this.errorHistory.filter(h => h.timestamp > cutoff);
    
    // Calculate error rate (errors per minute)
    this.metrics.errorRate = this.errorHistory.length / 5;
  }

  updateModuleMetrics(moduleId: ModuleId, metrics: any): void {
    this.metrics.modules.set(moduleId, metrics);
  }

  setSystemMetrics(data: { activeModules: number; activeSubscriptions: number; queueSize: number; memoryUsageMB: number }): void {
    this.metrics.activeModules = data.activeModules;
    this.metrics.activeSubscriptions = data.activeSubscriptions;
    this.metrics.queueSize = data.queueSize;
    this.metrics.memoryUsageMB = data.memoryUsageMB;
  }

  getMetrics(): EventBusMetrics {
    return {
      uptime: Date.now() - this.startTime,
      totalEvents: this.metrics.totalEvents,
      eventsPerSecond: this.metrics.eventsPerSecond,
      activeModules: this.metrics.activeModules,
      activeSubscriptions: this.metrics.activeSubscriptions,
      queueSize: this.metrics.queueSize,
      errorRate: this.metrics.errorRate,
      avgLatencyMs: this.metrics.avgLatencyMs,
      memoryUsageMB: this.metrics.memoryUsageMB,
      modules: Object.fromEntries(this.metrics.modules),
      eventPatterns: Object.fromEntries(this.metrics.eventPatterns)
    };
  }
}

export class EventBusV2 implements IEventBusV2 {
  // Core components
  private eventStore: EventStoreIndexedDB;
  private deduplicationManager: DeduplicationManager;
  private moduleRegistry: ModuleRegistry;
  private metricsCollector: MetricsCollector;
  
  // Configuration
  private config: EventBusConfig;
  
  // Event handling state
  private subscriptions = new Map<EventPattern, EventSubscription[]>();
  private globalSubscriptions = new Map<string, EventSubscription[]>(); // For wildcards
  private processingQueue = new Map<string, ProcessingContext>();
  
  // System state
  private isInitialized = false;
  private isShuttingDown = false;
  private testMode = false;
  private mockHistory: NamespacedEvent[] = [];
  
  // Performance monitoring
  private metricsTimer?: number;
  
  constructor(config: Partial<EventBusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize components
    this.eventStore = new EventStoreIndexedDB(this.config);
    this.deduplicationManager = new DeduplicationManager(this.config);
    this.moduleRegistry = new ModuleRegistry(this.config);
    this.metricsCollector = new MetricsCollector();
    
    this.initialize();
  }

  // Initialize the event bus
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('[EventBusV2] Initializing enterprise event bus...');
      
      // Initialize persistence layer
      if (this.config.persistenceEnabled) {
        await this.eventStore.init();
      }
      
      // Setup metrics collection
      if (this.config.metricsEnabled) {
        this.startMetricsCollection();
      }
      
      // Setup module registry event listeners
      this.setupModuleRegistryListeners();
      
      this.isInitialized = true;
      
      console.log('[EventBusV2] Enterprise event bus initialized successfully');
      
      // Emit initialization event
      await this.emit('global.eventbus.initialized', {
        version: '2.0.0',
        config: this.config,
        timestamp: new Date().toISOString()
      }, { persistent: false });
      
    } catch (error) {
      console.error('[EventBusV2] Failed to initialize event bus:', error);
      throw new EventBusError(
        `Failed to initialize EventBus: ${error.message}`,
        EventBusErrorCode.PERSISTENCE_ERROR,
        { originalError: error }
      );
    }
  }

  // === MODULE MANAGEMENT ===

  async registerModule(descriptor: ModuleDescriptor): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    
    // Register with module registry
    await this.moduleRegistry.registerModule(descriptor);
    
    // Register module event subscriptions
    await this.registerModuleEventSubscriptions(descriptor);
    
    console.log(`[EventBusV2] Module '${descriptor.id}' registered with ${descriptor.eventSubscriptions.length} subscriptions`);
  }

  async deactivateModule(moduleId: ModuleId): Promise<void> {
    await this.moduleRegistry.deactivateModule(moduleId);
  }

  async reactivateModule(moduleId: ModuleId): Promise<void> {
    await this.moduleRegistry.reactivateModule(moduleId);
  }

  async getModuleHealth(moduleId?: ModuleId): Promise<Record<ModuleId, ModuleHealth>> {
    return await this.moduleRegistry.getModuleHealth(moduleId);
  }

  // === EVENT OPERATIONS ===

  async emit<TPayload = any>(
    pattern: EventPattern,
    payload: TPayload,
    options: EmitOptions = {}
  ): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (this.isShuttingDown) return;
    
    const startTime = Date.now();
    
    try {
      // Create event
      const event = await this.createEvent(pattern, payload, options);
      
      // Handle test mode
      if (this.testMode) {
        this.mockHistory.push(event);
        console.log(`[EventBusV2] Mock event: ${pattern}`, payload);
        return;
      }
      
      // Deduplication check
      if (this.config.deduplicationEnabled && options.deduplicationWindow !== 0) {
        const deduplicationResult = await this.checkDuplication(event);
        if (deduplicationResult.isDupe) {
          console.log(`[EventBusV2] Duplicate event detected (${deduplicationResult.reason}), skipping: ${pattern}`);
          return;
        }
        
        // Store deduplication metadata
        await this.deduplicationManager.storeMetadata(event.metadata.deduplication);
      }
      
      // Persist event if required
      if (options.persistent !== false && this.config.persistenceEnabled) {
        await this.eventStore.append(event);
      }
      
      // Route to modules and process
      await this.processEvent(event);
      
      // Queue for offline sync if enabled
      if (this.config.offlineSyncEnabled && options.persistent !== false) {
        await this.queueForOfflineSync(event);
      }
      
      // Record metrics
      const latency = Date.now() - startTime;
      this.metricsCollector.recordEvent(event, latency);
      
      console.log(`[EventBusV2] Event processed: ${pattern} (${latency}ms)`);
      
    } catch (error) {
      const latency = Date.now() - startTime;
      this.metricsCollector.recordError(error.message);
      
      console.error(`[EventBusV2] Error emitting event ${pattern}:`, error);
      
      // Emit error event (avoid infinite recursion)
      if (pattern !== 'global.eventbus.error') {
        await this.emit('global.eventbus.error', {
          originalPattern: pattern,
          error: error.message,
          latency
        }, { persistent: false });
      }
      
      throw error;
    }
  }

  on<TPayload = any>(
    pattern: EventPattern,
    handler: EventHandler<TPayload>,
    options: SubscribeOptions = {}
  ): UnsubscribeFn {
    if (!this.isInitialized) {
      // Defer subscription until initialized
      this.initialize().then(() => {
        this.on(pattern, handler, options);
      });
      return () => {}; // Return no-op unsubscribe for now
    }
    
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      pattern,
      handler,
      moduleId: options.moduleId || 'anonymous',
      priority: options.priority || EventPriority.NORMAL,
      persistent: options.persistent || false,
      filter: options.filter,
      created: new Date()
    };
    
    // Add to subscriptions map
    this.addSubscription(subscription);
    
    // Add to module registry if moduleId provided
    if (options.moduleId) {
      const unsubscribeFn = () => this.removeSubscription(subscription);
      this.moduleRegistry.addModuleSubscription(options.moduleId, subscription, unsubscribeFn);
      
      return unsubscribeFn;
    }
    
    console.log(`[EventBusV2] Subscription added: ${pattern} (${subscription.id})`);
    
    // Return unsubscribe function
    return () => this.removeSubscription(subscription);
  }

  once<TPayload = any>(
    pattern: EventPattern,
    handler: EventHandler<TPayload>,
    options: SubscribeOptions = {}
  ): UnsubscribeFn {
    const onceOptions = { ...options, once: true };
    
    const wrappedHandler: EventHandler<TPayload> = async (event) => {
      try {
        await handler(event);
      } finally {
        // Auto-unsubscribe after first call
        this.removeSubscription({ id: subscriptionId } as any);
      }
    };
    
    const subscriptionId = this.generateSubscriptionId();
    return this.on(pattern, wrappedHandler, onceOptions);
  }

  off(pattern: EventPattern, handler?: EventHandler): void {
    const subscriptions = this.subscriptions.get(pattern) || [];
    
    if (handler) {
      // Remove specific handler
      const index = subscriptions.findIndex(sub => sub.handler === handler);
      if (index > -1) {
        const subscription = subscriptions[index];
        this.removeSubscription(subscription);
      }
    } else {
      // Remove all handlers for pattern
      subscriptions.forEach(subscription => {
        this.removeSubscription(subscription);
      });
    }
  }

  // === ADVANCED OPERATIONS ===

  async waitFor<TPayload = any>(
    pattern: EventPattern,
    timeout: number = this.config.defaultEventTimeout,
    filter?: EventFilter<TPayload>
  ): Promise<NamespacedEvent<TPayload>> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;
      
      const unsubscribe = this.on(pattern, (event) => {
        if (!filter || filter(event)) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(event);
        }
      });

      timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new EventBusError(
          `Timeout waiting for event ${pattern}`,
          EventBusErrorCode.HANDLER_ERROR,
          { pattern, timeout }
        ));
      }, timeout);
    });
  }

  async replay(
    pattern: EventPattern,
    fromTimestamp?: string,
    toTimestamp?: string
  ): Promise<NamespacedEvent[]> {
    if (!this.config.persistenceEnabled) {
      throw new EventBusError(
        'Event replay requires persistence to be enabled',
        EventBusErrorCode.PERSISTENCE_ERROR
      );
    }
    
    return await this.eventStore.getEvents(pattern, fromTimestamp, toTimestamp);
  }

  // === SYSTEM OPERATIONS ===

  async gracefulShutdown(timeoutMs: number = 30000): Promise<void> {
    console.log('[EventBusV2] Starting graceful shutdown...');
    this.isShuttingDown = true;
    
    try {
      // Stop metrics collection
      if (this.metricsTimer) {
        clearInterval(this.metricsTimer);
      }
      
      // Shutdown module registry
      await this.moduleRegistry.gracefulShutdown(timeoutMs);
      
      // Wait for processing queue to empty
      const startTime = Date.now();
      while (this.processingQueue.size > 0 && (Date.now() - startTime) < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Cleanup components
      this.deduplicationManager.destroy();
      await this.eventStore.destroy();
      
      console.log('[EventBusV2] Graceful shutdown completed');
      
    } catch (error) {
      console.error('[EventBusV2] Error during graceful shutdown:', error);
      throw new EventBusError(
        `Graceful shutdown failed: ${error.message}`,
        EventBusErrorCode.GRACEFUL_SHUTDOWN_TIMEOUT,
        { originalError: error }
      );
    }
  }

  async getMetrics(): Promise<EventBusMetrics> {
    // Update system metrics
    const activeModules = this.moduleRegistry.getActiveModules().length;
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .reduce((sum, subs) => sum + subs.length, 0);
    const queueSize = this.processingQueue.size;
    
    // Estimate memory usage (rough)
    const memoryUsageMB = (JSON.stringify(this.subscriptions).length / 1024 / 1024);
    
    this.metricsCollector.setSystemMetrics({
      activeModules,
      activeSubscriptions,
      queueSize,
      memoryUsageMB
    });
    
    return this.metricsCollector.getMetrics();
  }

  async clearHistory(beforeTimestamp?: string): Promise<number> {
    if (!this.config.persistenceEnabled) return 0;
    
    const cutoff = beforeTimestamp || new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(); // 7 days ago
    return await this.eventStore.cleanup(cutoff);
  }

  // === TESTING & DEVELOPMENT ===

  enableTestMode(): void {
    this.testMode = true;
    this.mockHistory = [];
    console.log('[EventBusV2] Test mode enabled');
  }

  disableTestMode(): void {
    this.testMode = false;
    console.log('[EventBusV2] Test mode disabled');
  }

  mockEvent<TPayload = any>(pattern: EventPattern, payload: TPayload): void {
    if (!this.testMode) {
      throw new EventBusError('Mock events can only be used in test mode', EventBusErrorCode.HANDLER_ERROR);
    }
    
    this.emit(pattern, payload, { persistent: false });
  }

  getMockHistory(): NamespacedEvent[] {
    return [...this.mockHistory];
  }

  clearMockHistory(): void {
    this.mockHistory = [];
  }

  // === PRIVATE METHODS ===

  private async createEvent<TPayload>(
    pattern: EventPattern,
    payload: TPayload,
    options: EmitOptions
  ): Promise<NamespacedEvent<TPayload>> {
    // Generate deduplication metadata
    const deduplicationMetadata = await this.deduplicationManager.generateMetadata({
      pattern,
      payload,
      source: options.userId || 'system'
    } as any);
    
    // Generate tracing metadata
    const tracingMetadata: TracingMetadata = {
      traceId: options.traceId || this.generateTraceId(),
      spanId: this.generateSpanId(),
      baggage: {}
    };
    
    const event: NamespacedEvent<TPayload> = {
      id: this.generateEventId(),
      pattern,
      payload,
      timestamp: new Date().toISOString(),
      source: 'eventbus-v2',
      version: '1.0.0',
      correlationId: options.correlationId,
      userId: options.userId,
      metadata: {
        priority: options.priority || EventPriority.NORMAL,
        persistent: options.persistent !== false,
        crossModule: options.crossModule !== false,
        retryPolicy: options.retryPolicy || this.config.defaultRetryPolicy,
        deduplication: deduplicationMetadata,
        tracing: tracingMetadata
      }
    };
    
    return event;
  }

  private async checkDuplication(event: NamespacedEvent): Promise<{ isDupe: boolean; reason?: string }> {
    return await this.deduplicationManager.isDuplicate(event, event.metadata.deduplication);
  }

  private async processEvent(event: NamespacedEvent): Promise<void> {
    const context: ProcessingContext = {
      event,
      subscriptions: this.getMatchingSubscriptions(event.pattern),
      startTime: Date.now(),
      traceId: event.metadata.tracing.traceId
    };
    
    this.processingQueue.set(event.id, context);
    
    try {
      // Process subscriptions concurrently
      const promises = context.subscriptions.map(subscription => 
        this.executeHandler(event, subscription)
      );
      
      await Promise.all(promises);
      
      // Mark as processed in store
      if (this.config.persistenceEnabled) {
        await this.eventStore.markAsProcessed(event.id);
      }
      
    } finally {
      this.processingQueue.delete(event.id);
    }
  }

  private async executeHandler(event: NamespacedEvent, subscription: EventSubscription): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Apply filter if present
      if (subscription.filter && !subscription.filter(event)) {
        return;
      }
      
      // Update subscription metrics
      subscription.lastTriggered = new Date();
      
      // Execute handler
      await Promise.resolve(subscription.handler(event));
      
      // Update module metrics
      if (subscription.moduleId) {
        const processingTime = Date.now() - startTime;
        this.moduleRegistry.updateModuleMetrics(subscription.moduleId, {
          eventsProcessed: 1,
          avgProcessingTimeMs: processingTime
        } as any);
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error(`[EventBusV2] Handler error in ${subscription.id}:`, error);
      
      // Update module error metrics
      if (subscription.moduleId) {
        this.moduleRegistry.updateModuleMetrics(subscription.moduleId, {
          errorRate: 1
        } as any);
      }
      
      // Emit handler error event
      await this.emit('global.eventbus.handler-error', {
        subscriptionId: subscription.id,
        moduleId: subscription.moduleId,
        pattern: event.pattern,
        error: error.message,
        processingTime
      }, { persistent: false });
    }
  }

  private getMatchingSubscriptions(pattern: EventPattern): EventSubscription[] {
    const exactMatch = this.subscriptions.get(pattern) || [];
    
    // TODO: Add wildcard matching logic
    // For now, return exact matches only
    
    return [...exactMatch].sort((a, b) => a.priority - b.priority);
  }

  private async queueForOfflineSync(event: NamespacedEvent): Promise<void> {
    try {
      const syncOperation: Partial<SyncOperation> = {
        type: 'CREATE',
        entity: 'events',
        data: event,
        priority: this.getPriorityScore(event.metadata.priority)
      };
      
      await offlineSync.queueOperation(syncOperation);
      
    } catch (error) {
      console.error('[EventBusV2] Failed to queue event for offline sync:', error);
    }
  }

  private getPriorityScore(priority: EventPriority): number {
    switch (priority) {
      case EventPriority.CRITICAL: return 0;
      case EventPriority.HIGH: return 1;
      case EventPriority.NORMAL: return 2;
      case EventPriority.LOW: return 3;
      case EventPriority.BACKGROUND: return 4;
      default: return 2;
    }
  }

  private addSubscription(subscription: EventSubscription): void {
    if (!this.subscriptions.has(subscription.pattern)) {
      this.subscriptions.set(subscription.pattern, []);
    }
    
    this.subscriptions.get(subscription.pattern)!.push(subscription);
    
    // Sort by priority
    const subs = this.subscriptions.get(subscription.pattern)!;
    subs.sort((a, b) => a.priority - b.priority);
  }

  private removeSubscription(subscription: EventSubscription): void {
    const subscriptions = this.subscriptions.get(subscription.pattern);
    if (!subscriptions) return;
    
    const index = subscriptions.findIndex(sub => sub.id === subscription.id);
    if (index > -1) {
      subscriptions.splice(index, 1);
      
      // Remove module subscription
      if (subscription.moduleId) {
        this.moduleRegistry.removeModuleSubscription(subscription.moduleId, subscription.id);
      }
      
      console.log(`[EventBusV2] Subscription removed: ${subscription.pattern} (${subscription.id})`);
    }
  }

  private async registerModuleEventSubscriptions(descriptor: ModuleDescriptor): Promise<void> {
    for (const subscriptionConfig of descriptor.eventSubscriptions) {
      // Create handler from module (this would require module instance)
      const handler = this.createModuleHandler(descriptor.id, subscriptionConfig.handler);
      
      const options: SubscribeOptions = {
        moduleId: descriptor.id,
        priority: subscriptionConfig.priority,
        persistent: subscriptionConfig.persistent
      };
      
      this.on(subscriptionConfig.pattern, handler, options);
    }
  }

  private createModuleHandler(moduleId: ModuleId, handlerName: string): EventHandler {
    // This would resolve the handler from the actual module instance
    // For now, return a placeholder
    return async (event) => {
      console.log(`[EventBusV2] Module ${moduleId} handler ${handlerName} called for ${event.pattern}`);
    };
  }

  private setupModuleRegistryListeners(): void {
    this.moduleRegistry.on('moduleActivated', (data) => {
      console.log(`[EventBusV2] Module activated: ${data.moduleId}`);
    });
    
    this.moduleRegistry.on('moduleDeactivated', (data) => {
      console.log(`[EventBusV2] Module deactivated: ${data.moduleId}`);
    });
    
    this.moduleRegistry.on('moduleHealthChanged', (data) => {
      console.log(`[EventBusV2] Module health changed: ${data.moduleId} -> ${data.currentStatus}`);
    });
  }

  private startMetricsCollection(): void {
    this.metricsTimer = window.setInterval(async () => {
      const metrics = await this.getMetrics();
      
      // Emit metrics event for monitoring
      await this.emit('global.eventbus.metrics', metrics, { persistent: false });
      
    }, this.config.healthCheckIntervalMs);
  }

  // ID generators
  private generateEventId(): string {
    return `evt_${Date.now()}_${crypto.randomUUID?.() || Math.random().toString(36)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${crypto.randomUUID?.() || Math.random().toString(36)}`;
  }

  private generateSpanId(): string {
    return `span_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
const eventBusV2 = new EventBusV2();

export default eventBusV2;
export { EventBusV2 };