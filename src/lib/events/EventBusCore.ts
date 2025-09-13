// EventBusCore.ts - Core EventBus class for factory instantiation
// Refactored to support multiple instances without singleton pattern

import { EventStoreIndexedDB } from './EventStore';
import { DeduplicationManager } from './DeduplicationManager';
import { ModuleRegistry } from './ModuleRegistry';
import { createTestEventHandlers } from './__tests__/helpers/test-modules';
import { EventBusLogger, SecurityLogger } from './utils/SecureLogger';
import SecureEventProcessor from './utils/SecureEventProcessor';
import PayloadValidator from './utils/PayloadValidator';
import WeakSubscriptionManager from './utils/WeakSubscriptionManager';
import PatternCache from './utils/PatternCache';
import SecureRandomGenerator from './utils/SecureRandomGenerator';
import type {
  IEventBus,
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
  DeduplicationMetadata,
  TracingMetadata
} from './types';

import { DEFAULT_CONFIG, EventPriority, EventBusError, EventBusErrorCode } from './types';

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
    averageLatency: 0,
    errorRate: 0,
    deduplicationRate: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    queueSize: 0
  };

  private eventHistory: number[] = [];
  private lastCalculation = Date.now();

  updateMetrics(event: NamespacedEvent, processingTime: number): void {
    this.metrics.totalEvents++;
    
    // Update events per second
    const now = Date.now();
    this.eventHistory.push(now);
    
    // Keep only events from last minute
    const oneMinuteAgo = now - 60000;
    this.eventHistory = this.eventHistory.filter(timestamp => timestamp > oneMinuteAgo);
    this.metrics.eventsPerSecond = this.eventHistory.length;
    
    // Update average latency
    this.metrics.averageLatency = (this.metrics.averageLatency + processingTime) / 2;
    
    this.lastCalculation = now;
  }

  updateCacheMetrics(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  updateDeduplicationRate(rate: number): void {
    this.metrics.deduplicationRate = rate;
  }

  updateActiveModules(count: number): void {
    this.metrics.activeModules = count;
  }

  updateActiveSubscriptions(count: number): void {
    this.metrics.activeSubscriptions = count;
  }

  updateQueueSize(size: number): void {
    this.metrics.queueSize = size;
  }

  getMetrics(): EventBusMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalEvents: 0,
      eventsPerSecond: 0,
      activeModules: 0,
      activeSubscriptions: 0,
      averageLatency: 0,
      errorRate: 0,
      deduplicationRate: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      queueSize: 0
    };
    this.eventHistory = [];
  }
}

/**
 * Core EventBus implementation - instantiable for factory pattern
 * No longer a singleton, designed for multiple isolated instances
 */
export class EventBus implements IEventBus {
  // Core components (instance-specific)
  private eventStore: EventStoreIndexedDB;
  private deduplicationManager: DeduplicationManager;
  private moduleRegistry: ModuleRegistry;
  private metricsCollector: MetricsCollector;
  private weakSubscriptionManager: WeakSubscriptionManager;
  private patternCache: PatternCache;
  private secureRandom: SecureRandomGenerator;
  
  // Configuration
  private config: EventBusConfig;
  private instanceId: string;
  
  // Event handling state
  private processingQueue = new Map<string, ProcessingContext>();
  private moduleHandlers = new Map<string, EventHandler>(); // Global handler registry
  private availableHandlers = new Map<string, EventHandler>(); // Available handlers for auto-registration
  
  // System state
  private _isInitialized = false;
  private isShuttingDown = false;
  private testMode = false;
  private mockHistory: NamespacedEvent[] = [];
  private initPromise: Promise<void> | null = null;
  
  // Performance monitoring
  private metricsTimer?: number;
  
  constructor(config: Partial<EventBusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.instanceId = config.instanceId || this.generateInstanceId();
    
    // Initialize components with instance-specific configuration
    this.eventStore = new EventStoreIndexedDB({
      ...this.config,
      // Add instance ID to storage keys for isolation
      storagePrefix: `${this.config.storagePrefix || 'eventbus'}_${this.instanceId}`
    });
    
    this.deduplicationManager = new DeduplicationManager({
      ...this.config,
      storagePrefix: `${this.config.storagePrefix || 'dedup'}_${this.instanceId}`
    });
    
    this.moduleRegistry = new ModuleRegistry({
      ...this.config,
      storagePrefix: `${this.config.storagePrefix || 'modules'}_${this.instanceId}`
    });
    
    this.metricsCollector = new MetricsCollector();
    this.weakSubscriptionManager = new WeakSubscriptionManager();
    
    // Create instance-specific pattern cache
    this.patternCache = new PatternCache({
      maxSize: 1000,
      ttlMs: 300000, // 5 minutes
      enableMetrics: true
    });
    
    // Create instance-specific secure random generator
    this.secureRandom = new SecureRandomGenerator();
    
    // Configure secure event processing
    SecureEventProcessor.configure({
      defaultTimeoutMs: this.config.handlerTimeoutMs || 5000,
      maxConcurrentHandlers: this.config.maxConcurrentHandlers || 10,
      enableCircuitBreaker: true
    });

    SecurityLogger.anomaly('EventBus instance created', {
      instanceId: this.instanceId,
      config: {
        persistenceEnabled: this.config.persistenceEnabled,
        deduplicationEnabled: this.config.deduplicationEnabled,
        metricsEnabled: this.config.metricsEnabled
      }
    });
  }

  /**
   * Get the unique instance ID
   */
  getInstanceId(): string {
    return this.instanceId;
  }

  /**
   * Initialize the event bus instance
   */
  async init(): Promise<void> {
    return this.initialize();
  }

  // Initialize the event bus
  private async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this._isInitialized) return;
    
    // If initialization is in progress, return the existing promise
    if (this.initPromise) return this.initPromise;
    
    // Start initialization
    this.initPromise = this.doInitialize();
    return this.initPromise;
  }
  
  private async doInitialize(): Promise<void> {
    try {
      EventBusLogger.info(`Initializing EventBus instance ${this.instanceId}...`);
      
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
      
      // Enable test mode if configured
      if (this.config.testModeEnabled) {
        this.enableTestMode();
      }
      
      // IMPORTANT: Set initialized flag BEFORE emitting to prevent deadlock
      this._isInitialized = true;
      this.initPromise = null; // Clear promise on success
      
      EventBusLogger.info(`EventBus instance ${this.instanceId} initialized successfully`);
      
      // Emit initialization event
      await this.emit('global.eventbus.initialized', {
        instanceId: this.instanceId,
        version: '2.0.0',
        config: this.config,
        timestamp: new Date().toISOString()
      }, { persistent: false });
      
    } catch (error) {
      this.initPromise = null; // Clear promise on error
      
      SecurityLogger.threat('EventBus initialization failed', {
        instanceId: this.instanceId,
        error: error.message,
        stack: error.stack
      });
      
      throw new EventBusError(
        `Failed to initialize EventBus instance ${this.instanceId}: ${error.message}`,
        EventBusErrorCode.INITIALIZATION_FAILED,
        { originalError: error, instanceId: this.instanceId }
      );
    }
  }

  // Rest of the methods remain similar to the original EventBus
  // but with instance-specific behavior instead of singleton...

  async emit<T = any>(
    pattern: EventPattern,
    payload: T,
    options: EmitOptions = {}
  ): Promise<string> {
    await this.initialize();
    
    if (this.isShuttingDown) {
      throw new EventBusError(
        'Cannot emit events during shutdown',
        EventBusErrorCode.SHUTDOWN_IN_PROGRESS,
        { instanceId: this.instanceId }
      );
    }

    // Validate pattern
    this.validateEventPattern(pattern);

    // Create event with instance-specific ID
    const event: NamespacedEvent = {
      id: options.eventId || this.generateEventId(),
      pattern,
      payload: await PayloadValidator.validateAndSanitize(payload),
      timestamp: new Date(),
      priority: options.priority || EventPriority.NORMAL,
      metadata: {
        instanceId: this.instanceId,
        source: options.source || 'unknown',
        version: options.version || '1.0.0',
        deduplication: options.persistent ? {
          enabled: this.config.deduplicationEnabled,
          key: options.deduplicationKey,
          windowMs: options.deduplicationWindowMs || this.config.deduplicationWindowMs
        } : undefined,
        tracing: {
          traceId: options.traceId || this.generateTraceId(),
          spanId: this.generateSpanId(),
          parentSpanId: options.parentSpanId
        }
      }
    };

    // Process deduplication
    if (event.metadata.deduplication?.enabled) {
      const isDuplicate = await this.deduplicationManager.isDuplicate(event);
      if (isDuplicate) {
        EventBusLogger.debug(`Duplicate event filtered: ${event.id}`, { 
          pattern, 
          instanceId: this.instanceId 
        });
        return event.id;
      }
    }

    // Store event if persistence enabled
    if (options.persistent && this.config.persistenceEnabled) {
      await this.eventStore.store(event);
    }

    // Process event
    await this.processEvent(event);

    return event.id;
  }

  subscribe<T = any>(
    pattern: EventPattern,
    handler: EventHandler<T>,
    options: SubscribeOptions = {}
  ): UnsubscribeFn {
    this.ensureInitialized();
    
    // Validate pattern
    this.validateEventPattern(pattern);

    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      pattern,
      handler: handler as EventHandler,
      options,
      moduleId: options.moduleId || 'unknown',
      priority: options.priority || EventPriority.NORMAL,
      createdAt: new Date(),
      instanceId: this.instanceId
    };

    // Register with weak subscription manager
    this.weakSubscriptionManager.addSubscription(subscription, handler);

    SecurityLogger.anomaly('Event subscription created', {
      subscriptionId: subscription.id,
      pattern,
      moduleId: subscription.moduleId,
      instanceId: this.instanceId
    });

    // Return unsubscribe function
    return () => {
      this.weakSubscriptionManager.removeSubscription(subscription.id);
      SecurityLogger.anomaly('Event subscription removed', {
        subscriptionId: subscription.id,
        pattern,
        instanceId: this.instanceId
      });
    };
  }

  // Additional methods following the same pattern...
  // (Abbreviated for brevity - full implementation would include all original methods)

  async gracefulShutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    
    SecurityLogger.anomaly('EventBus graceful shutdown initiated', {
      instanceId: this.instanceId
    });

    try {
      // Stop metrics collection
      if (this.metricsTimer) {
        clearInterval(this.metricsTimer);
      }

      // Complete pending event processing
      const pendingEvents = Array.from(this.processingQueue.values());
      if (pendingEvents.length > 0) {
        EventBusLogger.info(`Waiting for ${pendingEvents.length} pending events to complete...`);
        // Wait up to 5 seconds for events to complete
        await Promise.race([
          new Promise(resolve => {
            const checkInterval = setInterval(() => {
              if (this.processingQueue.size === 0) {
                clearInterval(checkInterval);
                resolve(void 0);
              }
            }, 100);
          }),
          new Promise(resolve => setTimeout(resolve, 5000))
        ]);
      }

      // Shutdown components (check if method exists)
      if (this.moduleRegistry && typeof this.moduleRegistry.shutdown === 'function') {
        await this.moduleRegistry.shutdown();
      }
      
      // Cleanup weak subscriptions
      this.weakSubscriptionManager.cleanup();
      
      // Cleanup pattern cache
      this.patternCache.destroy();
      
      // Cleanup secure random generator
      this.secureRandom.destroy();

      SecurityLogger.anomaly('EventBus graceful shutdown completed', {
        instanceId: this.instanceId
      });
      
    } catch (error) {
      SecurityLogger.threat('Error during graceful shutdown', {
        instanceId: this.instanceId,
        error: error.message
      });
      throw error;
    }
  }

  getMetrics(): EventBusMetrics {
    this.ensureInitialized();
    
    const baseMetrics = this.metricsCollector.getMetrics();
    const cacheMetrics = this.patternCache.getMetrics();
    const deduplicationMetrics = this.deduplicationManager.getMetrics();
    
    return {
      ...baseMetrics,
      instanceId: this.instanceId,
      cacheHitRate: cacheMetrics.hitRate,
      cacheSize: this.patternCache.getInfo().size,
      deduplicationRate: deduplicationMetrics.deduplicationRate,
      activeSubscriptions: this.weakSubscriptionManager.getActiveCount(),
      queueSize: this.processingQueue.size
    };
  }

  // === PRIVATE METHODS ===

  private generateInstanceId(): string {
    return `eventbus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateEventPattern(pattern: EventPattern): void {
    // Use cached validation for performance
    const validation = this.patternCache.validatePattern(pattern);
    
    if (!validation.isValid) {
      throw new EventBusError(
        'Invalid event pattern format',
        EventBusErrorCode.INVALID_PATTERN,
        { pattern, validation: validation.result, instanceId: this.instanceId }
      );
    }
  }

  private async processEvent(event: NamespacedEvent): Promise<void> {
    const matchingSubscriptions = this.weakSubscriptionManager.getMatchingSubscriptions(event.pattern);
    
    if (matchingSubscriptions.length === 0) {
      EventBusLogger.debug(`No handlers for pattern: ${event.pattern}`, {
        instanceId: this.instanceId
      });
      return;
    }

    const context: ProcessingContext = {
      event,
      subscriptions: matchingSubscriptions,
      startTime: Date.now(),
      traceId: event.metadata?.tracing?.traceId || this.secureRandom.generateTraceId()
    };
    
    this.processingQueue.set(event.id, context);
    
    try {
      await SecureEventProcessor.processEvent(event, matchingSubscriptions);
      
      const processingTime = Date.now() - context.startTime;
      this.metricsCollector.updateMetrics(event, processingTime);
      
    } finally {
      this.processingQueue.delete(event.id);
    }
  }

  private ensureInitialized(): void {
    if (!this._isInitialized) {
      throw new EventBusError(
        `EventBus instance ${this.instanceId} not initialized. Call init() first.`,
        EventBusErrorCode.NOT_INITIALIZED,
        { instanceId: this.instanceId }
      );
    }
  }

  // ID generators - using cryptographically secure generation
  private generateEventId(): string {
    return this.secureRandom.generateEventId();
  }

  private generateSubscriptionId(): string {
    return this.secureRandom.generateSubscriptionId();
  }

  private generateTraceId(): string {
    return this.secureRandom.generateTraceId();
  }

  private generateSpanId(): string {
    return this.secureRandom.generateSpanId();
  }

  // Implementation of required methods
  private startMetricsCollection(): void {
    if (this.metricsTimer) return;
    
    this.metricsTimer = setInterval(() => {
      const cacheMetrics = this.patternCache.getMetrics();
      this.metricsCollector.updateCacheMetrics(cacheMetrics.hitRate);
      
      const deduplicationMetrics = this.deduplicationManager.getMetrics();
      this.metricsCollector.updateDeduplicationRate(deduplicationMetrics.deduplicationRate);
      
      this.metricsCollector.updateActiveSubscriptions(this.weakSubscriptionManager.getActiveCount());
      this.metricsCollector.updateQueueSize(this.processingQueue.size);
    }, 1000);
  }
  
  private setupModuleRegistryListeners(): void {
    // Setup basic module registry event handling
    // In a full implementation, this would register event listeners
    EventBusLogger.debug(`Module registry listeners setup for instance ${this.instanceId}`);
  }
  
  private enableTestMode(): void {
    this.testMode = true;
    EventBusLogger.debug(`Test mode enabled for instance ${this.instanceId}`);
  }

  // Required interface methods
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    return this.weakSubscriptionManager.removeSubscription(subscriptionId);
  }

  async unsubscribeAll(pattern?: EventPattern): Promise<number> {
    return this.weakSubscriptionManager.removeAllSubscriptions(pattern);
  }

  async getAllEvents(): Promise<NamespacedEvent[]> {
    if (!this.config.persistenceEnabled) return [];
    return this.eventStore.getAllEvents();
  }

  async getEventHistory(pattern?: EventPattern, limit?: number): Promise<NamespacedEvent[]> {
    if (!this.config.persistenceEnabled) return [];
    return this.eventStore.getEventHistory(pattern, limit);
  }

  async clearEventHistory(): Promise<void> {
    if (this.config.persistenceEnabled) {
      await this.eventStore.clear();
    }
    this.mockHistory = [];
  }

  isInitialized(): boolean {
    return this._isInitialized;
  }

  getConfig(): EventBusConfig {
    return { ...this.config };
  }
}

export default EventBus;