/**
 * Capability Telemetry for G-Admin v3.0
 * Tracks usage analytics and performance metrics for capabilities
 * Based on 2024 telemetry and analytics patterns
 */

import type { BusinessCapability } from '../types/BusinessCapabilities';

/**
 * Telemetry event types
 */
export type TelemetryEventType =
  | 'capability_check'
  | 'capability_access'
  | 'capability_denied'
  | 'cache_hit'
  | 'cache_miss'
  | 'lazy_load_start'
  | 'lazy_load_complete'
  | 'lazy_load_error'
  | 'performance_metric';

/**
 * Telemetry event data
 */
interface TelemetryEvent {
  type: TelemetryEventType;
  capability?: BusinessCapability;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Performance metrics
 */
interface PerformanceMetrics {
  capabilityCheckDuration: number;
  cacheHitRate: number;
  lazyLoadingTime: number;
  memoryUsage?: number;
  componentRenderTime?: number;
}

/**
 * Usage analytics
 */
interface UsageAnalytics {
  mostUsedCapabilities: Array<{ capability: BusinessCapability; count: number }>;
  leastUsedCapabilities: Array<{ capability: BusinessCapability; count: number }>;
  capabilityAccessPatterns: Record<string, number>;
  peakUsageTimes: number[];
  averageSessionDuration: number;
}

/**
 * Capability telemetry collector
 */
export class CapabilityTelemetry {
  private events: TelemetryEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private metricsBuffer: PerformanceMetrics[] = [];
  private maxEvents: number;
  private flushInterval: number;
  private enabled: boolean;

  constructor(config: {
    maxEvents?: number;
    flushInterval?: number;
    enabled?: boolean;
    userId?: string;
  } = {}) {
    this.sessionId = this.generateSessionId();
    this.userId = config.userId;
    this.maxEvents = config.maxEvents || 1000;
    this.flushInterval = config.flushInterval || 60000; // 1 minute
    this.enabled = config.enabled ?? (process.env.NODE_ENV === 'development');

    if (this.enabled && typeof window !== 'undefined') {
      // Auto-flush events periodically
      setInterval(() => this.flush(), this.flushInterval);

      // Flush on page unload
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Track a telemetry event
   */
  trackEvent(
    type: TelemetryEventType,
    capability?: BusinessCapability,
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled) return;

    const event: TelemetryEvent = {
      type,
      capability,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      metadata
    };

    this.events.push(event);

    // Auto-flush if buffer is full
    if (this.events.length >= this.maxEvents) {
      this.flush();
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Capability Telemetry:', event);
    }
  }

  /**
   * Track capability check performance
   */
  trackCapabilityCheck(
    capability: BusinessCapability,
    duration: number,
    cacheHit: boolean
  ): void {
    this.trackEvent(
      cacheHit ? 'cache_hit' : 'cache_miss',
      capability,
      { duration, cacheHit }
    );

    this.trackEvent('capability_check', capability, { duration });
  }

  /**
   * Track capability access
   */
  trackCapabilityAccess(capability: BusinessCapability, granted: boolean): void {
    this.trackEvent(
      granted ? 'capability_access' : 'capability_denied',
      capability,
      { granted }
    );
  }

  /**
   * Track lazy loading performance
   */
  trackLazyLoading(
    capability: BusinessCapability,
    phase: 'start' | 'complete' | 'error',
    duration?: number,
    error?: Error
  ): void {
    const eventType = phase === 'start' ? 'lazy_load_start' :
                    phase === 'complete' ? 'lazy_load_complete' : 'lazy_load_error';

    this.trackEvent(eventType, capability, {
      duration,
      error: error?.message
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.metricsBuffer.push(metrics);
    this.trackEvent('performance_metric', undefined, metrics);
  }

  /**
   * Get usage analytics
   */
  getUsageAnalytics(): UsageAnalytics {
    const capabilityUsage = new Map<BusinessCapability, number>();
    const accessPatterns: Record<string, number> = {};
    const sessionTimes: number[] = [];

    // Process events
    this.events.forEach(event => {
      if (event.capability) {
        const current = capabilityUsage.get(event.capability) || 0;
        capabilityUsage.set(event.capability, current + 1);
      }

      // Track access patterns by hour
      const hour = new Date(event.timestamp).getHours();
      accessPatterns[hour] = (accessPatterns[hour] || 0) + 1;
    });

    // Sort capabilities by usage
    const sortedByUsage = Array.from(capabilityUsage.entries())
      .map(([capability, count]) => ({ capability, count }))
      .sort((a, b) => b.count - a.count);

    return {
      mostUsedCapabilities: sortedByUsage.slice(0, 10),
      leastUsedCapabilities: sortedByUsage.slice(-10).reverse(),
      capabilityAccessPatterns: accessPatterns,
      peakUsageTimes: Object.entries(accessPatterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour)),
      averageSessionDuration: this.calculateAverageSessionDuration()
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageCheckDuration: number;
    cacheHitRate: number;
    averageLazyLoadTime: number;
    totalEvents: number;
  } {
    const checkEvents = this.events.filter(e => e.type === 'capability_check');
    const cacheHits = this.events.filter(e => e.type === 'cache_hit').length;
    const cacheMisses = this.events.filter(e => e.type === 'cache_miss').length;
    const lazyLoadEvents = this.events.filter(e => e.type === 'lazy_load_complete');

    const averageCheckDuration = checkEvents.length > 0
      ? checkEvents.reduce((sum, e) => sum + (e.metadata?.duration || 0), 0) / checkEvents.length
      : 0;

    const cacheHitRate = (cacheHits + cacheMisses) > 0
      ? cacheHits / (cacheHits + cacheMisses)
      : 0;

    const averageLazyLoadTime = lazyLoadEvents.length > 0
      ? lazyLoadEvents.reduce((sum, e) => sum + (e.metadata?.duration || 0), 0) / lazyLoadEvents.length
      : 0;

    return {
      averageCheckDuration,
      cacheHitRate,
      averageLazyLoadTime,
      totalEvents: this.events.length
    };
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const analytics = this.getUsageAnalytics();
    const performance = this.getPerformanceSummary();
    const recommendations: string[] = [];

    // Cache optimization
    if (performance.cacheHitRate < 0.7) {
      recommendations.push('Consider increasing cache TTL or warming frequency');
    }

    // Lazy loading optimization
    if (performance.averageLazyLoadTime > 1000) {
      recommendations.push('Optimize lazy loading chunks or implement preloading');
    }

    // Usage pattern optimization
    const topCapabilities = analytics.mostUsedCapabilities.slice(0, 3);
    if (topCapabilities.length > 0) {
      recommendations.push(
        `Consider preloading top capabilities: ${topCapabilities.map(c => c.capability).join(', ')}`
      );
    }

    // Performance optimization
    if (performance.averageCheckDuration > 10) {
      recommendations.push('Capability check performance can be improved with better caching');
    }

    return recommendations;
  }

  /**
   * Export telemetry data
   */
  exportData(): {
    events: TelemetryEvent[];
    analytics: UsageAnalytics;
    performance: ReturnType<CapabilityTelemetry['getPerformanceSummary']>;
    recommendations: string[];
    sessionInfo: {
      sessionId: string;
      userId?: string;
      duration: number;
      eventCount: number;
    };
  } {
    return {
      events: [...this.events],
      analytics: this.getUsageAnalytics(),
      performance: this.getPerformanceSummary(),
      recommendations: this.getOptimizationRecommendations(),
      sessionInfo: {
        sessionId: this.sessionId,
        userId: this.userId,
        duration: this.calculateSessionDuration(),
        eventCount: this.events.length
      }
    };
  }

  /**
   * Clear all telemetry data
   */
  clear(): void {
    this.events = [];
    this.metricsBuffer = [];
  }

  /**
   * Flush events (implement your own logic)
   */
  private flush(): void {
    if (this.events.length === 0) return;

    // In a real implementation, you would send events to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Flushing telemetry data:', {
        eventCount: this.events.length,
        sessionId: this.sessionId
      });
    }

    // Clear events after flushing
    this.events = [];
    this.metricsBuffer = [];
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSessionDuration(): number {
    if (this.events.length === 0) return 0;

    const firstEvent = Math.min(...this.events.map(e => e.timestamp));
    const lastEvent = Math.max(...this.events.map(e => e.timestamp));

    return lastEvent - firstEvent;
  }

  private calculateAverageSessionDuration(): number {
    // Simplified calculation - in real implementation, track multiple sessions
    return this.calculateSessionDuration();
  }
}

/**
 * Singleton telemetry instance
 */
let telemetryInstance: CapabilityTelemetry | null = null;

/**
 * Get or create telemetry instance
 */
export const getCapabilityTelemetry = (config?: {
  maxEvents?: number;
  flushInterval?: number;
  enabled?: boolean;
  userId?: string;
}): CapabilityTelemetry => {
  if (!telemetryInstance) {
    telemetryInstance = new CapabilityTelemetry(config);
  }
  return telemetryInstance;
};

/**
 * Reset telemetry instance (useful for testing)
 */
export const resetCapabilityTelemetry = (): void => {
  telemetryInstance = null;
};