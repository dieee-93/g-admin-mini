// SecureEventProcessor.ts - Handler execution with timeout protection
// Prevents Event Handler Poisoning (EHP) attacks and DoS vulnerabilities

import type { NamespacedEvent, EventHandler } from '../types';
import { SecurityLogger } from './SecureLogger';

/**
 * System phase for phase-aware timeout calculation
 * INITIALIZATION: System startup, module loading (30+ modules, 100+ subscriptions)
 * RUNTIME: Normal operation after initialization complete
 */
enum SystemPhase {
  INITIALIZATION = 'INITIALIZATION',
  RUNTIME = 'RUNTIME'
}

interface TimeoutConfig {
  defaultTimeoutMs: number;
  maxTimeoutMs: number;
  warningThresholdMs: number;
  enableCircuitBreaker: boolean;
}

interface ExecutionResult<T = any> {
  success: boolean;
  result?: T;
  error?: Error;
  executionTimeMs: number;
  timedOut: boolean;
  circuitBreakerTriggered: boolean;
}

interface HandlerStats {
  totalExecutions: number;
  timeouts: number;
  errors: number;
  avgExecutionTimeMs: number;
  lastExecutionTime: Date;
  consecutiveFailures: number;
}

const DEFAULT_CONFIG: TimeoutConfig = {
  defaultTimeoutMs: 5000, // 5 seconds max per roadmap
  maxTimeoutMs: 10000,    // Absolute maximum
  warningThresholdMs: 1000, // Log warning if > 1s
  enableCircuitBreaker: true
};

export class SecureEventProcessor {
  private static config: TimeoutConfig = DEFAULT_CONFIG;
  private static handlerStats = new Map<string, HandlerStats>();
  private static circuitBreakerTripped = new Set<string>();
  private static circuitBreakerTimers = new Map<string, number>(); // Track reset timers
  private static systemPhase: SystemPhase = SystemPhase.INITIALIZATION;
  
  /**
   * Configure timeout and security settings
   */
  static configure(config: Partial<TimeoutConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
    SecurityLogger.anomaly('SecureEventProcessor configured', {
      defaultTimeoutMs: this.config.defaultTimeoutMs,
      circuitBreakerEnabled: this.config.enableCircuitBreaker
    });
  }

  /**
   * Calculate timeout based on system phase and event pattern
   * INITIALIZATION phase: No timeout for system events (legitimate 10+ second startup)
   * RUNTIME phase: 30s for module events, 5s for regular events
   */
  private static calculateTimeout(pattern: string): number {
    if (this.systemPhase === SystemPhase.INITIALIZATION) {
      // During initialization, system events can legitimately take 10+ seconds
      // 30 modules × 100+ subscriptions = cumulative execution > 10s
      if (pattern.includes('system.') || pattern.includes('module.')) {
        return Number.MAX_SAFE_INTEGER; // No timeout during initialization
      }
    }
    
    // RUNTIME phase: Normal timeouts
    if (pattern.includes('module_loaded') || pattern.includes('module.')) {
      return 30000; // 30 seconds for module events
    }
    
    return this.config.defaultTimeoutMs; // 5 seconds for regular events
  }

  /**
   * Mark system initialization as complete, switching to RUNTIME phase
   * Should be called by ModuleRegistry after all modules are loaded
   */
  static markInitializationComplete(): void {
    const previousPhase = this.systemPhase;
    this.systemPhase = SystemPhase.RUNTIME;
    
    SecurityLogger.anomaly('System initialization complete - switching to RUNTIME phase', {
      previousPhase,
      currentPhase: this.systemPhase,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Execute event handler with timeout protection and circuit breaker
   */
  static async executeHandler<TPayload>(
    handler: EventHandler<TPayload>,
    event: NamespacedEvent<TPayload>,
    handlerId: string,
    customTimeoutMs?: number
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const timeoutMs = Math.min(
      customTimeoutMs || this.config.defaultTimeoutMs,
      this.config.maxTimeoutMs
    );

    // Check circuit breaker
    if (this.isCircuitBreakerTripped(handlerId)) {
      SecurityLogger.threat('Handler execution blocked by circuit breaker', {
        handlerId,
        pattern: event.pattern,
        consecutiveFailures: this.getHandlerStats(handlerId).consecutiveFailures
      });
      
      return {
        success: false,
        executionTimeMs: 0,
        timedOut: false,
        circuitBreakerTriggered: true,
        error: new Error('Circuit breaker is open for this handler')
      };
    }

    // Calculate timeout based on system phase and event pattern
    const dynamicTimeout = this.calculateTimeout(event.pattern);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        SecurityLogger.threat('Handler execution timeout - possible DoS attack', {
          handlerId,
          pattern: event.pattern,
          timeoutMs: dynamicTimeout,
          eventId: event.id
        });
        reject(new Error(`Handler execution timed out after ${dynamicTimeout}ms`));
      }, dynamicTimeout);
    });

    // Create handler execution promise
    const handlerPromise = Promise.resolve().then(async () => {
      return await handler(event);
    });

    try {
      // Race between handler execution and timeout
      const result = await Promise.race([handlerPromise, timeoutPromise]);
      const executionTime = performance.now() - startTime;
      
      // Log performance warning if slow
      if (executionTime > this.config.warningThresholdMs) {
        SecurityLogger.anomaly('Slow handler execution detected', {
          handlerId,
          pattern: event.pattern,
          executionTimeMs: executionTime,
          threshold: this.config.warningThresholdMs
        });
      }

      // Update handler stats (success)
      this.updateHandlerStats(handlerId, executionTime, false, false);
      
      return {
        success: true,
        result,
        executionTimeMs: executionTime,
        timedOut: false,
        circuitBreakerTriggered: false
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      const timedOut = error instanceof Error && error.message.includes('timed out');
      
      // Update handler stats (failure)
      this.updateHandlerStats(handlerId, executionTime, true, timedOut);
      
      // Check if circuit breaker should trip
      if (this.shouldTripCircuitBreaker(handlerId)) {
        this.tripCircuitBreaker(handlerId);
      }

      return {
        success: false,
        error: error as Error,
        executionTimeMs: executionTime,
        timedOut,
        circuitBreakerTriggered: false
      };
    }
  }

  /**
   * Execute multiple handlers concurrently with timeout protection
   */
  static async executeHandlersConcurrent<TPayload>(
    handlers: Array<{ handler: EventHandler<TPayload>; id: string }>,
    event: NamespacedEvent<TPayload>,
    customTimeoutMs?: number
  ): Promise<ExecutionResult[]> {
    const executions = handlers.map(({ handler, id }) => 
      this.executeHandler(handler, event, id, customTimeoutMs)
    );

    return Promise.all(executions);
  }

  /**
   * Get handler execution statistics
   */
  static getHandlerStats(handlerId: string): HandlerStats {
    if (!this.handlerStats.has(handlerId)) {
      this.handlerStats.set(handlerId, {
        totalExecutions: 0,
        timeouts: 0,
        errors: 0,
        avgExecutionTimeMs: 0,
        lastExecutionTime: new Date(),
        consecutiveFailures: 0
      });
    }
    return this.handlerStats.get(handlerId)!;
  }

  /**
   * Reset circuit breaker for a specific handler
   */
  static resetCircuitBreaker(handlerId: string): void {
    this.circuitBreakerTripped.delete(handlerId);
    const stats = this.getHandlerStats(handlerId);
    stats.consecutiveFailures = 0;
    
    // Clear any pending reset timer
    const timerId = this.circuitBreakerTimers.get(handlerId);
    if (timerId) {
      clearTimeout(timerId);
      this.circuitBreakerTimers.delete(handlerId);
    }
    
    SecurityLogger.anomaly('Circuit breaker reset', { handlerId });
  }

  /**
   * Get security status and metrics
   */
  static getSecurityStatus(): {
    totalHandlers: number;
    activeCircuitBreakers: number;
    handlersWithTimeouts: number;
    avgExecutionTimeMs: number;
    config: TimeoutConfig;
  } {
    const stats = Array.from(this.handlerStats.values());
    const handlersWithTimeouts = stats.filter(s => s.timeouts > 0).length;
    const avgExecutionTime = stats.length > 0 
      ? stats.reduce((sum, s) => sum + s.avgExecutionTimeMs, 0) / stats.length
      : 0;

    return {
      totalHandlers: this.handlerStats.size,
      activeCircuitBreakers: this.circuitBreakerTripped.size,
      handlersWithTimeouts,
      avgExecutionTimeMs: avgExecutionTime,
      config: this.config
    };
  }

  /**
   * Clean up old handler stats (memory management)
   */
  static cleanupOldStats(olderThanMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = new Date(Date.now() - olderThanMs);
    let cleaned = 0;

    for (const [handlerId, stats] of this.handlerStats.entries()) {
      if (stats.lastExecutionTime <= cutoff) {
        this.handlerStats.delete(handlerId);
        this.circuitBreakerTripped.delete(handlerId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      SecurityLogger.anomaly('Handler stats cleanup completed', { 
        cleanedHandlers: cleaned 
      });
    }

    return cleaned;
  }

  /**
   * Cleanup all resources and prevent memory leaks
   */
  static destroy(): void {
    // Clear all circuit breaker reset timers
    for (const timerId of this.circuitBreakerTimers.values()) {
      clearTimeout(timerId);
    }
    this.circuitBreakerTimers.clear();
    
    // Clear handler stats
    this.handlerStats.clear();
    
    // Clear circuit breaker states
    this.circuitBreakerTripped.clear();
    
    SecurityLogger.anomaly('SecureEventProcessor destroyed - all resources cleaned up');
  }

  // === PRIVATE METHODS ===

  private static updateHandlerStats(
    handlerId: string,
    executionTimeMs: number,
    hadError: boolean,
    timedOut: boolean
  ): void {
    const stats = this.getHandlerStats(handlerId);
    
    stats.totalExecutions++;
    stats.lastExecutionTime = new Date();
    
    // Update average execution time
    stats.avgExecutionTimeMs = (
      (stats.avgExecutionTimeMs * (stats.totalExecutions - 1)) + executionTimeMs
    ) / stats.totalExecutions;
    
    if (timedOut) {
      stats.timeouts++;
    }
    
    if (hadError) {
      stats.errors++;
      stats.consecutiveFailures++;
    } else {
      stats.consecutiveFailures = 0; // Reset on success
    }
  }

  private static isCircuitBreakerTripped(handlerId: string): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    return this.circuitBreakerTripped.has(handlerId);
  }

  private static shouldTripCircuitBreaker(handlerId: string): boolean {
    if (!this.config.enableCircuitBreaker) return false;
    
    const stats = this.getHandlerStats(handlerId);
    
    // Trip circuit breaker after 3 consecutive failures
    // or if more than 50% of recent executions failed
    return stats.consecutiveFailures >= 3 || 
           (stats.totalExecutions >= 10 && (stats.errors / stats.totalExecutions) > 0.5);
  }

  private static tripCircuitBreaker(handlerId: string): void {
    this.circuitBreakerTripped.add(handlerId);
    const stats = this.getHandlerStats(handlerId);
    
    SecurityLogger.threat('Circuit breaker tripped - handler quarantined', {
      handlerId,
      consecutiveFailures: stats.consecutiveFailures,
      errorRate: stats.totalExecutions > 0 ? stats.errors / stats.totalExecutions : 0,
      totalExecutions: stats.totalExecutions
    });

    // Auto-reset after 30 seconds (tracked for cleanup)
    const resetTimerId = setTimeout(() => {
      this.resetCircuitBreaker(handlerId);
    }, 30000) as unknown as number;
    
    this.circuitBreakerTimers.set(handlerId, resetTimerId);
  }
}

export default SecureEventProcessor;