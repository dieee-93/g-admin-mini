// EventBus.ts - Enterprise Event Bus Implementation
// Complete event bus with module management, deduplication, offline-first support, and comprehensive monitoring

import { logger } from '@/lib/logging';
import { EventStoreIndexedDB } from './EventStore';
import { DeduplicationManager } from './DeduplicationManager';
import { ModuleRegistry } from './ModuleRegistry';
import { createTestEventHandlers } from './__tests__/helpers/test-modules';
import SecureLogger, { EventBusLogger } from './utils/SecureLogger';
// Note: SecurityLogger removed - security logging moved to infrastructure level
import WeakSubscriptionManager from './utils/WeakSubscriptionManager';
import PatternCache from './utils/PatternCache';
// Removed: SecureEventProcessor, PayloadValidator, SecureRandomGenerator, EncryptedEventStore, RateLimiter, ContentSecurityPolicy
// Reason: Security should be handled at infrastructure level (Vercel/Supabase), not client-side
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

class EventBus implements IEventBus {
  // Core components
  private eventStore: EventStoreIndexedDB;
  private deduplicationManager: DeduplicationManager;
  private moduleRegistry: ModuleRegistry;
  private metricsCollector: MetricsCollector;
  private weakSubscriptionManager: WeakSubscriptionManager;
  private patternCache: PatternCache;
  
  // Configuration
  private config: EventBusConfig;
  
  // Simple handler timeout (reliability, not security)
  private handlerTimeoutMs: number;
  
  // Event handling state
  private processingQueue = new Map<string, ProcessingContext>();
  private moduleHandlers = new Map<string, EventHandler>(); // Global handler registry
  private availableHandlers = new Map<string, EventHandler>(); // Available handlers for auto-registration
  
  // System state
  private isInitialized = false;
  private isShuttingDown = false;
  private testMode = false;
  private mockHistory: NamespacedEvent[] = [];
  private initPromise: Promise<void> | null = null;
  
  // Performance monitoring
  private metricsTimer?: number;
  
  constructor(config: Partial<EventBusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize components
    this.eventStore = new EventStoreIndexedDB(this.config);
    this.deduplicationManager = new DeduplicationManager(this.config);
    this.moduleRegistry = new ModuleRegistry();
    this.moduleRegistry.setEventBus(this as any);
    this.metricsCollector = new MetricsCollector();
    this.weakSubscriptionManager = new WeakSubscriptionManager();
    this.patternCache = PatternCache.getInstance({
      maxSize: 1000,
      ttlMs: 300000, // 5 minutes
      enableMetrics: true
    });
    
    // REFACTORED: Removed client-side security theater
    // Security is properly handled at infrastructure level:
    // - Vercel: DDoS mitigation, Edge firewall, rate limiting
    // - Supabase: RLS, server-side rate limits, CAPTCHA
    // Client-side security measures were:
    // 1. Bypassable (attacker controls client code)
    // 2. Performance overhead
    // 3. False sense of security
    
    // Simple timeout for event handlers (reliability, not security)
    this.handlerTimeoutMs = this.config.handlerTimeoutMs || 5000;
    
    this.initialize();
  }

  // Initialize the event bus
  private async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized) return;
    
    // If initialization is in progress, return the existing promise
    if (this.initPromise) return this.initPromise;
    
    // Start initialization
    this.initPromise = this.doInitialize();
    return this.initPromise;
  }
  
  private async doInitialize(): Promise<void> {
    try {
      EventBusLogger.info('Initializing enterprise event bus...');
      
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
      this.isInitialized = true;
      this.initPromise = null; // Clear promise on success
      
      EventBusLogger.info('Enterprise event bus initialized successfully', { isInitialized: this.isInitialized });
      
      // Emit initialization event
      await this.emit('global.eventbus.initialized', {
        version: '2.0.0',
        config: this.config,
        timestamp: new Date().toISOString()
      }, { persistent: false });
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.initPromise = null; // Clear promise on error
      EventBusLogger.error('Failed to initialize event bus:', { error: err.message, stack: err.stack });
      throw new EventBusError(
        `Failed to initialize EventBus: ${err.message}`,
        EventBusErrorCode.PERSISTENCE_ERROR,
        { originalError: err }
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
    
    // Emit module registration event
    await this.emit('global.eventbus.module-registered', {
      moduleId: descriptor.id,
      subscriptions: descriptor.eventSubscriptions.length,
      timestamp: new Date().toISOString()
    }, { persistent: false });
    
    EventBusLogger.info(`Module registered`, { 
      moduleId: descriptor.id, 
      subscriptionCount: descriptor.eventSubscriptions.length,
      moduleName: descriptor.name 
    });
  }

  async activateModule(moduleId: ModuleId): Promise<void> {
    await this.moduleRegistry.activateModule(moduleId);
    
    // Emit module activation event
    await this.emit('global.eventbus.module-activated', {
      moduleId,
      timestamp: new Date().toISOString()
    }, { persistent: false });
  }

  async deactivateModule(moduleId: ModuleId): Promise<void> {
    await this.moduleRegistry.deactivateModule(moduleId);
    
    // Emit module deactivation event
    await this.emit('global.eventbus.module-deactivated', {
      moduleId,
      timestamp: new Date().toISOString()
    }, { persistent: false });
  }

  async reactivateModule(moduleId: ModuleId): Promise<void> {
    await this.moduleRegistry.reactivateModule(moduleId);
  }

  async getModuleHealth(moduleId?: ModuleId): Promise<Record<ModuleId, ModuleHealth>> {
    return await this.moduleRegistry.getModuleHealth(moduleId);
  }

  getActiveModules(): ModuleId[] {
    return this.moduleRegistry.getActiveModules();
  }

  // === EVENT OPERATIONS ===

  async emit<TPayload = any>(
    pattern: EventPattern,
    payload: TPayload,
    options: EmitOptions = {}
  ): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (this.isShuttingDown) return;
    
    // Validate event pattern
    this.validateEventPattern(pattern);
    
    // Note: Rate limiting moved to infrastructure level (Vercel Edge + Supabase server-side)
    // Client-side rate limiting removed as it's bypassable and creates false sense of security
    
    const startTime = Date.now();
    
    try {
      // Create event
      const event = await this.createEvent(pattern, payload, options);
      
      // Note: Payload encryption removed - sensitive data should be encrypted at rest in Supabase
      // Application-level encryption handled by Supabase's built-in encryption features
      event.metadata.encrypted = false; // No longer encrypting at app level
      
      // Handle test mode - still process events but track for testing
      if (this.testMode) {
        this.mockHistory.push(event);
        EventBusLogger.debug(`Test mode event: ${pattern}`, payload);
        // Continue processing - don't return early in test mode
      }
      
      // Deduplication check
      if (this.config.deduplicationEnabled && options.deduplicationWindow !== 0) {
        const deduplicationResult = await this.checkDuplication(event);
        if (deduplicationResult.isDupe) {
          EventBusLogger.debug(`Duplicate event detected`, { 
          pattern, 
          reason: deduplicationResult.reason,
          eventId: event.id 
        });
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
      
      EventBusLogger.debug(`Event processed: ${pattern} (${latency}ms)`);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const latency = Date.now() - startTime;
      this.metricsCollector.recordError(err.message);

      EventBusLogger.error(`Error emitting event ${pattern}:`, { error: err.message, stack: err.stack });

      // Emit error event (avoid infinite recursion)
      if (pattern !== 'global.eventbus.error') {
        await this.emit('global.eventbus.error', {
          originalPattern: pattern,
          error: err.message,
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
    EventBusLogger.debug(`Subscription request for pattern: ${pattern}`, { isInitialized: this.isInitialized });
    
    if (!this.isInitialized) {
      EventBusLogger.debug(`Deferring subscription until initialization complete`, { pattern });
      // Defer subscription until initialized
      let actualUnsubscribe: UnsubscribeFn | null = null;
      this.initialize().then(() => {
        EventBusLogger.debug(`Processing deferred subscription`, { pattern });
        actualUnsubscribe = this.on(pattern, handler, options);
      });
      return () => {
        EventBusLogger.debug(`Deferred unsubscribe called`, { pattern });
        if (actualUnsubscribe) actualUnsubscribe();
      };
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
    
    // Add to weak subscription manager for memory safety
    logger.debug('EventBus', `Adding subscription for pattern: ${pattern}`);
    this.weakSubscriptionManager.addSubscription(subscription);

    // Add to module registry if moduleId provided
    if (options.moduleId) {
      const unsubscribeFn = () => this.removeSubscription(subscription);
      this.moduleRegistry.addModuleSubscription(options.moduleId, subscription, unsubscribeFn);

      return unsubscribeFn;
    }

    logger.debug('EventBus', `Subscription added: ${pattern}`, {
      id: subscription.id,
      moduleId: subscription.moduleId
    });
    
    // Return unsubscribe function
    return () => this.removeSubscription(subscription);
  }

  /**
   * Alias for on() - for backward compatibility
   * Many modules use subscribe() instead of on()
   */
  subscribe<TPayload = any>(
    pattern: EventPattern,
    handler: EventHandler<TPayload>,
    options: SubscribeOptions = {}
  ): UnsubscribeFn {
    return this.on(pattern, handler, options);
  }

  once<TPayload = any>(
    pattern: EventPattern,
    handler: EventHandler<TPayload>,
    options: SubscribeOptions = {}
  ): UnsubscribeFn {
    let hasBeenCalled = false;
    let unsubscribeFn: UnsubscribeFn;
    
    const wrappedHandler: EventHandler<TPayload> = async (_event) => {
      if (hasBeenCalled) return;
      hasBeenCalled = true;
      
      try {
        // Execute handler directly with timeout protection
        const timeoutMs = options?.timeoutMs || 5000;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Handler timeout')), timeoutMs)
        );
        
        await Promise.race([
          handler(event),
          timeoutPromise
        ]);
      } finally {
        // Auto-unsubscribe after first call
        if (unsubscribeFn) {
          unsubscribeFn();
        }
      }
    };
    
    unsubscribeFn = this.on(pattern, wrappedHandler, options);
    return unsubscribeFn;
  }

  off(pattern: EventPattern, handler?: EventHandler): void {
    // Get all subscriptions for this pattern from weak subscription manager
    const subscriptionIds = this.weakSubscriptionManager.getSubscriptionsByPattern(pattern);
    
    if (handler) {
      // Remove specific handler
      for (const id of subscriptionIds) {
        const weakSubscription = this.weakSubscriptionManager.getSubscription(id);
        if (weakSubscription) {
          const currentHandler = this.weakSubscriptionManager.getHandler(id);
          if (currentHandler === handler) {
            const subscription: EventSubscription = {
              id: weakSubscription.id,
              pattern: weakSubscription.pattern,
              handler: currentHandler,
              moduleId: weakSubscription.moduleId,
              priority: weakSubscription.priority,
              persistent: weakSubscription.persistent,
              created: weakSubscription.created,
              lastTriggered: weakSubscription.lastTriggered,
              timeoutMs: weakSubscription.timeoutMs,
              filter: weakSubscription.filter
            };
            this.removeSubscription(subscription);
            break;
          }
        }
      }
    } else {
      // Remove all handlers for pattern
      for (const id of subscriptionIds) {
        const weakSubscription = this.weakSubscriptionManager.getSubscription(id);
        if (weakSubscription) {
          const currentHandler = this.weakSubscriptionManager.getHandler(id);
          if (currentHandler) {
            const subscription: EventSubscription = {
              id: weakSubscription.id,
              pattern: weakSubscription.pattern,
              handler: currentHandler,
              moduleId: weakSubscription.moduleId,
              priority: weakSubscription.priority,
              persistent: weakSubscription.persistent,
              created: weakSubscription.created,
              lastTriggered: weakSubscription.lastTriggered,
              timeoutMs: weakSubscription.timeoutMs,
              filter: weakSubscription.filter
            };
            this.removeSubscription(subscription);
          }
        }
      }
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
      
      const unsubscribe = this.on(pattern, (_event) => {
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
    logger.info('EventBus', 'Starting graceful shutdown');
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
      
      // Cleanup weak subscription manager
      this.weakSubscriptionManager.destroy();
      
      // Cleanup pattern cache
      this.patternCache.destroy();
      
      logger.info('EventBus', 'Graceful shutdown completed');
      
    } catch (error) {
      logger.error('EventBus', 'Error during graceful shutdown', error);
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
    const activeSubscriptions = this.weakSubscriptionManager.getAllActiveSubscriptions().length;
    const queueSize = this.processingQueue.size;
    
    // Estimate memory usage from weak subscription manager
    const weakSubscriptionStats = this.weakSubscriptionManager.getStats();
    const memoryUsageMB = (weakSubscriptionStats.activeSubscriptions * 0.001); // Rough estimate
    
    // Get pattern cache metrics
    const patternCacheMetrics = this.patternCache.getMetrics();
    
    this.metricsCollector.setSystemMetrics({
      activeModules,
      activeSubscriptions,
      queueSize,
      memoryUsageMB,
      patternCacheHitRate: patternCacheMetrics.hitRate,
      patternCacheSize: this.patternCache.getInfo().size
    });
    
    return this.metricsCollector.getMetrics();
  }

  /**
   * Get comprehensive security metrics
   */
  /**
   * Get the current configuration of the EventBus.
   * @returns {EventBusConfig} The current configuration object.
   */
  getConfig(): EventBusConfig {
    return this.config;
  }

  // Note: getSecurityMetrics() removed - security metrics now at infrastructure level
  // Use Vercel Analytics and Supabase Dashboard for DDoS/rate limiting monitoring

  // Note: CSP methods removed - Content-Security-Policy should be set as HTTP headers
  // Configure CSP in vercel.json or Next.js headers configuration
  // See: https://vercel.com/docs/concepts/edge-network/headers

  // Note: blockIP/unblockIP removed - IP blocking should be handled at infrastructure level
  // Use Vercel Firewall rules or Supabase Auth banned_users table for IP management

  async clearHistory(beforeTimestamp?: string): Promise<number> {
    if (!this.config.persistenceEnabled) return 0;
    
    const cutoff = beforeTimestamp || new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(); // 7 days ago
    return await this.eventStore.cleanup(cutoff);
  }

  // === TESTING & DEVELOPMENT ===

  enableTestMode(): void {
    this.testMode = true;
    this.mockHistory = [];
    this.loadTestHandlers();
    logger.debug('EventBus', 'Test mode enabled');
  }

  disableTestMode(): void {
    this.testMode = false;
    logger.debug('EventBus', 'Test mode disabled');
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

  private loadTestHandlers(): void {
    try {
      const testHandlers = createTestEventHandlers();
      this.availableHandlers.clear();

      for (const [handlerName, handler] of testHandlers.entries()) {
        this.availableHandlers.set(handlerName, handler);
        logger.debug('EventBus', `Test handler loaded: ${handlerName}`);
      }

      logger.debug('EventBus', `Loaded ${testHandlers.size} test handlers`);
    } catch (error) {
      logger.warn('EventBus', 'Failed to load test handlers', error);
    }
  }

  private autoRegisterModuleHandlers(moduleId: ModuleId): void {
    try {
      logger.debug('EventBus', `Auto-registering handlers for module: ${moduleId}`);

      // Get module descriptor
      const registeredModules = this.moduleRegistry.getRegisteredModules();
      const moduleDescriptor = registeredModules[moduleId];

      if (!moduleDescriptor) {
        logger.warn('EventBus', `Module descriptor not found: ${moduleId}`);
        return;
      }

      let registeredCount = 0;

      // Register each handler from the module's eventSubscriptions
      for (const subscription of moduleDescriptor.eventSubscriptions) {
        const fullHandlerName = `${moduleId}.${subscription.handler}`;
        const availableHandler = this.availableHandlers.get(fullHandlerName);

        if (availableHandler) {
          this.moduleHandlers.set(fullHandlerName, availableHandler);
          logger.debug('EventBus', `Handler registered: ${fullHandlerName}`, {
            pattern: subscription.pattern
          });
          registeredCount++;
        } else {
          logger.warn('EventBus', `Handler not found: ${fullHandlerName}`);
        }
      }

      logger.info('EventBus', `Auto-registered ${registeredCount}/${moduleDescriptor.eventSubscriptions.length} handlers`, {
        moduleId
      });
    } catch (error) {
      logger.error('EventBus', `Error auto-registering handlers for ${moduleId}`, error);
    }
  }

  // === PRIVATE METHODS ===

  private async createEvent<TPayload>(
    pattern: EventPattern,
    payload: TPayload,
    options: EmitOptions
  ): Promise<NamespacedEvent<TPayload>> {
    // Create temporary event for validation
    const tempEvent: NamespacedEvent<TPayload> = {
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
        crossModule: true,
        deduplication: null as any, // Will be set after validation
        tracing: null as any // Will be set after validation
      }
    };

    // Note: Client-side payload validation removed - proper validation done at API boundaries
    // Supabase RLS policies handle authorization, TypeScript provides type safety
    
    // Generate deduplication metadata
    const deduplicationMetadata = await this.deduplicationManager.generateMetadata({
      pattern,
      payload: payload, // Use original payload directly
      source: options.userId || 'system'
    } as any);
    
    // Generate tracing metadata
    const tracingMetadata: TracingMetadata = {
      traceId: options.traceId || this.generateTraceId(),
      spanId: this.generateSpanId(),
      baggage: {}
    };
    
    const event: NamespacedEvent<TPayload> = {
      id: tempEvent.id, // Reuse the same ID from validation
      pattern,
      payload: payload, // Use original payload directly
      timestamp: tempEvent.timestamp, // Reuse the same timestamp
      source: 'eventbus-v2',
      version: '1.0.0',
      correlationId: options.correlationId,
      userId: options.userId,
      metadata: {
        priority: options.priority || EventPriority.NORMAL,
        persistent: options.persistent !== false,
        crossModule: true,
        deduplication: deduplicationMetadata,
        tracing: tracingMetadata,
        retryPolicy: options.retryPolicy
      }
    };
    
    return event;
  }

  private async checkDuplication(event: NamespacedEvent): Promise<{ isDupe: boolean; reason?: string }> {
    return await this.deduplicationManager.isDuplicate(event, event.metadata.deduplication);
  }

  private async processEvent(event: NamespacedEvent): Promise<void> {
    const matchingSubscriptions = this.getMatchingSubscriptions(event.pattern);
    logger.debug('EventBus', `Processing event: ${event.pattern}`, {
      subscriptions: matchingSubscriptions.length
    });
    
    // Note: Event payload encryption removed - data encrypted at rest in Supabase
    const processableEvent = event;
    
    const context: ProcessingContext = {
      event: processableEvent,
      subscriptions: matchingSubscriptions,
      startTime: Date.now(),
      traceId: processableEvent.metadata?.tracing?.traceId || this.generateTraceId()
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
      
      // Execute handler with basic timeout protection
      const timeoutMs = subscription.timeoutMs || 5000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Handler execution timeout')), timeoutMs)
      );
      
      const executionStart = Date.now();
      await Promise.race([
        subscription.handler(event),
        timeoutPromise
      ]);
      const executionTimeMs = Date.now() - executionStart;
      
      // Update module metrics
      if (subscription.moduleId) {
        this.moduleRegistry.updateModuleMetrics(subscription.moduleId, {
          eventsProcessed: 1,
          avgProcessingTimeMs: executionTimeMs
        } as any);
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('EventBus', `Handler error in subscription ${subscription.id}`, { 
        subscriptionId: subscription.id,
        pattern: subscription.pattern,
        moduleId: subscription.moduleId,
        error: error.message 
      });
      
      // Update module error metrics
      if (subscription.moduleId) {
        this.moduleRegistry.updateModuleMetrics(subscription.moduleId, {
          errorRate: 1
        } as any);
      }
      
      // Create the error payload
      const errorPayload = {
        subscriptionId: subscription.id,
        moduleId: subscription.moduleId,
        pattern: event.pattern,
        error: error.message,
        processingTime,
        originalEvent: event
      };

      // Sanitize the entire payload before emitting
      const sanitizedPayload = SecureLogger.sanitizeObject(errorPayload);

      // Emit handler error event
      await this.emit('global.eventbus.handler-error', sanitizedPayload, { persistent: false });
    }
  }

  private getMatchingSubscriptions(pattern: EventPattern): EventSubscription[] {
    // Get subscriptions from weak subscription manager (includes wildcards)
    const weakSubscriptionIds = this.weakSubscriptionManager.getSubscriptionsByPattern(pattern);
    const activeSubscriptions: EventSubscription[] = [];
    
    for (const id of weakSubscriptionIds) {
      const subscription = this.weakSubscriptionManager.getSubscription(id);
      if (subscription) {
        // Convert weak subscription back to normal subscription format
        const eventSubscription: EventSubscription = {
          id: subscription.id,
          pattern: subscription.pattern,
          handler: this.weakSubscriptionManager.getHandler(id)!,
          moduleId: subscription.moduleId,
          priority: subscription.priority,
          persistent: subscription.persistent,
          created: subscription.created,
          lastTriggered: subscription.lastTriggered,
          timeoutMs: subscription.timeoutMs,
          filter: subscription.filter // Now properly preserved
        };
        activeSubscriptions.push(eventSubscription);
      }
    }
    
    return activeSubscriptions.sort((a, b) => a.priority - b.priority);
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
      logger.error('EventBus', 'Failed to queue event for offline sync', error);
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


  private removeSubscription(subscription: EventSubscription): void {
    // Remove from weak subscription manager
    this.weakSubscriptionManager.removeSubscription(subscription.id);
    
    // Remove module subscription
    if (subscription.moduleId) {
      this.moduleRegistry.removeModuleSubscription(subscription.moduleId, subscription.id);
    }
    
    logger.debug('EventBus', `Subscription removed: ${subscription.pattern}`, {
      id: subscription.id
    });
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
    // Look up handler in global registry with module prefix
    const fullHandlerName = `${moduleId}.${handlerName}`;
    const handler = this.moduleHandlers.get(fullHandlerName);
    
    if (handler) {
      return handler;
    }
    
    // Fallback: return a placeholder if handler not found
    logger.warn('EventBus', `Handler not found: ${handlerName}`, { moduleId });
    return async (event) => {
      logger.debug('EventBus', `Placeholder handler called: ${moduleId}.${handlerName}`, {
        pattern: event.pattern
      });
    };
  }

  // Method to register handlers (for testing)
  registerHandler(handlerName: string, handler: EventHandler): void {
    this.moduleHandlers.set(handlerName, handler);
    logger.debug('EventBus', `Handler registered: ${handlerName}`);
  }

  private setupModuleRegistryListeners(): void {
    this.moduleRegistry.on('moduleActivated', (_data) => {
      logger.info('EventBus', `Module activated: ${data.moduleId}`);
      this.autoRegisterModuleHandlers(data.moduleId);
    });

    this.moduleRegistry.on('moduleDeactivated', (_data) => {
      logger.info('EventBus', `Module deactivated: ${data.moduleId}`);
    });

    this.moduleRegistry.on('moduleHealthChanged', (_data) => {
      logger.debug('EventBus', `Module health changed: ${data.moduleId}`, {
        status: data.currentStatus
      });
    });
  }

  private startMetricsCollection(): void {
    this.metricsTimer = window.setInterval(async () => {
      const metrics = await this.getMetrics();
      
      // Emit metrics event for monitoring
      await this.emit('global.eventbus.metrics', metrics, { persistent: false });
      
    }, this.config.healthCheckIntervalMs);
  }

  // Event pattern validation
  private validateEventPattern(pattern: EventPattern): void {
    // Use cached validation for performance
    const validation = this.patternCache.validatePattern(pattern);
    
    if (!validation.isValid) {
      throw new EventBusError(
        'Invalid event pattern format',
        EventBusErrorCode.INVALID_PATTERN,
        { pattern, validation: validation.result }
      );
    }
  }

  // ID generators - using native crypto.randomUUID() for secure random IDs
  private generateEventId(): string {
    return crypto.randomUUID();
  }

  private generateSubscriptionId(): string {
    return crypto.randomUUID();
  }

  private generateTraceId(): string {
    return crypto.randomUUID();
  }

  private generateSpanId(): string {
    return crypto.randomUUID();
  }
}

// Export singleton instance
const eventBus = new EventBus();


export { EventBus };
export default eventBus;