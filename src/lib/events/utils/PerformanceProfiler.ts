// PerformanceProfiler.ts - Advanced performance monitoring and profiling
// Provides granular metrics with latency percentiles and hot path analysis

import { SecurityLogger } from './SecureLogger';

/**
 * Performance metric data point
 */
interface MetricDataPoint {
  timestamp: number;
  value: number;
  context?: Record<string, unknown>;
}

/**
 * Latency percentile calculations
 */
interface LatencyMetrics {
  p50: number;  // Median
  p90: number;  // 90th percentile
  p95: number;  // 95th percentile
  p99: number;  // 99th percentile
  p999: number; // 99.9th percentile
  min: number;
  max: number;
  mean: number;
  count: number;
}

/**
 * Hot path analysis data
 */
interface HotPath {
  pattern: string;
  callCount: number;
  totalTime: number;
  averageTime: number;
  percentageOfTotal: number;
  lastAccessed: number;
}

/**
 * Performance profiler configuration
 */
interface ProfilerConfig {
  maxDataPoints: number;
  retentionMs: number;
  enableHotPathAnalysis: boolean;
  hotPathThreshold: number;
  enableDetailedMetrics: boolean;
  samplingRate: number;
}

/**
 * System resource metrics
 */
interface ResourceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage?: number;
  eventQueueSize: number;
  subscriptionCount: number;
  cacheHitRate: number;
}

/**
 * Comprehensive performance report
 */
interface PerformanceReport {
  timestamp: number;
  timeRange: {
    start: number;
    end: number;
    duration: number;
  };
  eventProcessing: LatencyMetrics;
  subscriptionMatching: LatencyMetrics;
  patternValidation: LatencyMetrics;
  hotPaths: HotPath[];
  resourceMetrics: ResourceMetrics;
  throughput: {
    eventsPerSecond: number;
    peakEventsPerSecond: number;
    totalEvents: number;
  };
  errorMetrics: {
    errorRate: number;
    timeoutRate: number;
    totalErrors: number;
  };
}

/**
 * Advanced performance profiler for EventBus operations
 */
export class PerformanceProfiler {
  private static instance: PerformanceProfiler | null = null;
  private config: ProfilerConfig;
  private enabled = true;
  
  // Metric storage
  private eventProcessingTimes: MetricDataPoint[] = [];
  private subscriptionMatchingTimes: MetricDataPoint[] = [];
  private patternValidationTimes: MetricDataPoint[] = [];
  private hotPaths = new Map<string, HotPath>();
  
  // Throughput tracking
  private eventCounts: MetricDataPoint[] = [];
  private errorCounts: MetricDataPoint[] = [];
  private timeoutCounts: MetricDataPoint[] = [];
  
  // Real-time metrics
  private lastCleanup = Date.now();
  private totalEvents = 0;
  private totalErrors = 0;
  private totalTimeouts = 0;
  
  constructor(config: Partial<ProfilerConfig> = {}) {
    this.config = {
      maxDataPoints: 10000,
      retentionMs: 3600000, // 1 hour
      enableHotPathAnalysis: true,
      hotPathThreshold: 10, // ms
      enableDetailedMetrics: true,
      samplingRate: 1.0, // 100% sampling
      ...config
    };

    SecurityLogger.anomaly('PerformanceProfiler initialized', {
      maxDataPoints: this.config.maxDataPoints,
      retentionMs: this.config.retentionMs,
      hotPathAnalysis: this.config.enableHotPathAnalysis
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<ProfilerConfig>): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler(config);
    }
    return PerformanceProfiler.instance;
  }

  /**
   * Record event processing time
   */
  recordEventProcessing(durationMs: number, pattern: string, context?: Record<string, unknown>): void {
    if (!this.enabled || !this.shouldSample()) return;

    const now = Date.now();
    this.eventProcessingTimes.push({
      timestamp: now,
      value: durationMs,
      context: { pattern, ...context }
    });

    this.totalEvents++;
    this.recordEventCount(now);
    
    // Hot path analysis
    if (this.config.enableHotPathAnalysis && durationMs >= this.config.hotPathThreshold) {
      this.updateHotPath(pattern, durationMs);
    }

    this.cleanupIfNeeded();
  }

  /**
   * Record subscription matching time
   */
  recordSubscriptionMatching(durationMs: number, patternCount: number, matchCount: number): void {
    if (!this.enabled || !this.shouldSample()) return;

    this.subscriptionMatchingTimes.push({
      timestamp: Date.now(),
      value: durationMs,
      context: { patternCount, matchCount }
    });

    this.cleanupIfNeeded();
  }

  /**
   * Record pattern validation time
   */
  recordPatternValidation(durationMs: number, pattern: string, cacheHit: boolean): void {
    if (!this.enabled || !this.shouldSample()) return;

    this.patternValidationTimes.push({
      timestamp: Date.now(),
      value: durationMs,
      context: { pattern, cacheHit }
    });

    this.cleanupIfNeeded();
  }

  /**
   * Record error occurrence
   */
  recordError(error: Error, pattern?: string, context?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const now = Date.now();
    this.errorCounts.push({
      timestamp: now,
      value: 1,
      context: { error: error.message, pattern, ...context }
    });

    this.totalErrors++;
    this.cleanupIfNeeded();
  }

  /**
   * Record timeout occurrence
   */
  recordTimeout(pattern: string, timeoutMs: number, context?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const now = Date.now();
    this.timeoutCounts.push({
      timestamp: now,
      value: timeoutMs,
      context: { pattern, timeoutMs, ...context }
    });

    this.totalTimeouts++;
    this.cleanupIfNeeded();
  }

  /**
   * Calculate latency percentiles from data points
   */
  calculateLatencyMetrics(dataPoints: MetricDataPoint[]): LatencyMetrics {
    if (dataPoints.length === 0) {
      return {
        p50: 0, p90: 0, p95: 0, p99: 0, p999: 0,
        min: 0, max: 0, mean: 0, count: 0
      };
    }

    const values = dataPoints.map(dp => dp.value).sort((a, b) => a - b);
    const count = values.length;

    return {
      p50: this.percentile(values, 0.5),
      p90: this.percentile(values, 0.9),
      p95: this.percentile(values, 0.95),
      p99: this.percentile(values, 0.99),
      p999: this.percentile(values, 0.999),
      min: values[0],
      max: values[count - 1],
      mean: values.reduce((a, b) => a + b, 0) / count,
      count
    };
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(timeRangeMs?: number): PerformanceReport {
    const now = Date.now();
    const startTime = timeRangeMs ? now - timeRangeMs : this.getOldestTimestamp();
    
    // Filter data points by time range
    const eventProcessingData = this.filterByTimeRange(this.eventProcessingTimes, startTime, now);
    const subscriptionMatchingData = this.filterByTimeRange(this.subscriptionMatchingTimes, startTime, now);
    const patternValidationData = this.filterByTimeRange(this.patternValidationTimes, startTime, now);
    const eventCountData = this.filterByTimeRange(this.eventCounts, startTime, now);
    const errorCountData = this.filterByTimeRange(this.errorCounts, startTime, now);
    const timeoutCountData = this.filterByTimeRange(this.timeoutCounts, startTime, now);

    // Calculate throughput
    const duration = (now - startTime) / 1000; // seconds
    const totalEventsInRange = eventCountData.length;
    const eventsPerSecond = duration > 0 ? totalEventsInRange / duration : 0;
    
    // Calculate peak events per second (1-minute windows)
    const peakEventsPerSecond = this.calculatePeakThroughput(eventCountData);

    return {
      timestamp: now,
      timeRange: {
        start: startTime,
        end: now,
        duration: now - startTime
      },
      eventProcessing: this.calculateLatencyMetrics(eventProcessingData),
      subscriptionMatching: this.calculateLatencyMetrics(subscriptionMatchingData),
      patternValidation: this.calculateLatencyMetrics(patternValidationData),
      hotPaths: this.getTopHotPaths(10),
      resourceMetrics: this.getCurrentResourceMetrics(),
      throughput: {
        eventsPerSecond: Math.round(eventsPerSecond * 100) / 100,
        peakEventsPerSecond: Math.round(peakEventsPerSecond * 100) / 100,
        totalEvents: totalEventsInRange
      },
      errorMetrics: {
        errorRate: totalEventsInRange > 0 ? (errorCountData.length / totalEventsInRange) * 100 : 0,
        timeoutRate: totalEventsInRange > 0 ? (timeoutCountData.length / totalEventsInRange) * 100 : 0,
        totalErrors: errorCountData.length
      }
    };
  }

  /**
   * Get real-time metrics summary
   */
  getRealTimeMetrics(): {
    currentThroughput: number;
    averageLatency: number;
    errorRate: number;
    hotPathCount: number;
    memoryUsage: number;
  } {
    const recentEvents = this.filterByTimeRange(this.eventProcessingTimes, Date.now() - 60000, Date.now());
    const recentErrors = this.filterByTimeRange(this.errorCounts, Date.now() - 60000, Date.now());
    
    const throughput = recentEvents.length / 60; // events per second in last minute
    const averageLatency = recentEvents.length > 0 
      ? recentEvents.reduce((sum, dp) => sum + dp.value, 0) / recentEvents.length 
      : 0;
    const errorRate = recentEvents.length > 0 ? (recentErrors.length / recentEvents.length) * 100 : 0;

    return {
      currentThroughput: Math.round(throughput * 100) / 100,
      averageLatency: Math.round(averageLatency * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      hotPathCount: this.hotPaths.size,
      memoryUsage: this.getMemoryUsagePercentage()
    };
  }

  /**
   * Enable/disable profiler
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    SecurityLogger.anomaly('PerformanceProfiler toggled', { enabled });
  }

  /**
   * Clear all metrics data
   */
  clearMetrics(): void {
    this.eventProcessingTimes = [];
    this.subscriptionMatchingTimes = [];
    this.patternValidationTimes = [];
    this.eventCounts = [];
    this.errorCounts = [];
    this.timeoutCounts = [];
    this.hotPaths.clear();
    this.totalEvents = 0;
    this.totalErrors = 0;
    this.totalTimeouts = 0;

    SecurityLogger.anomaly('PerformanceProfiler metrics cleared');
  }

  /**
   * Export metrics data for analysis
   */
  exportMetrics(): {
    eventProcessing: MetricDataPoint[];
    subscriptionMatching: MetricDataPoint[];
    patternValidation: MetricDataPoint[];
    hotPaths: HotPath[];
    summary: PerformanceReport;
  } {
    return {
      eventProcessing: [...this.eventProcessingTimes],
      subscriptionMatching: [...this.subscriptionMatchingTimes],
      patternValidation: [...this.patternValidationTimes],
      hotPaths: this.getTopHotPaths(50),
      summary: this.getPerformanceReport()
    };
  }

  // === PRIVATE METHODS ===

  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = percentile * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedArray[lower];
    }
    
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  private updateHotPath(pattern: string, durationMs: number): void {
    const existing = this.hotPaths.get(pattern);
    
    if (existing) {
      existing.callCount++;
      existing.totalTime += durationMs;
      existing.averageTime = existing.totalTime / existing.callCount;
      existing.lastAccessed = Date.now();
    } else {
      this.hotPaths.set(pattern, {
        pattern,
        callCount: 1,
        totalTime: durationMs,
        averageTime: durationMs,
        percentageOfTotal: 0, // Will be calculated in getTopHotPaths
        lastAccessed: Date.now()
      });
    }
  }

  private getTopHotPaths(limit: number): HotPath[] {
    const hotPaths = Array.from(this.hotPaths.values());
    const totalTime = hotPaths.reduce((sum, hp) => sum + hp.totalTime, 0);
    
    // Calculate percentages
    hotPaths.forEach(hp => {
      hp.percentageOfTotal = totalTime > 0 ? (hp.totalTime / totalTime) * 100 : 0;
    });
    
    // Sort by total time and return top N
    return hotPaths
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, limit);
  }

  private filterByTimeRange(dataPoints: MetricDataPoint[], startTime: number, endTime: number): MetricDataPoint[] {
    return dataPoints.filter(dp => dp.timestamp >= startTime && dp.timestamp <= endTime);
  }

  private recordEventCount(timestamp: number): void {
    this.eventCounts.push({
      timestamp,
      value: 1
    });
  }

  private calculatePeakThroughput(eventCountData: MetricDataPoint[]): number {
    if (eventCountData.length === 0) return 0;
    
    const windowMs = 60000; // 1 minute
    let maxCount = 0;
    
    // Sliding window to find peak
    for (let i = 0; i < eventCountData.length; i++) {
      const windowStart = eventCountData[i].timestamp;
      const windowEnd = windowStart + windowMs;
      
      const countInWindow = eventCountData.filter(
        dp => dp.timestamp >= windowStart && dp.timestamp < windowEnd
      ).length;
      
      maxCount = Math.max(maxCount, countInWindow);
    }
    
    return maxCount / 60; // Convert to events per second
  }

  private getCurrentResourceMetrics(): ResourceMetrics {
    // Basic implementation - can be enhanced with actual system monitoring
    const memoryUsage = this.getMemoryUsage();
    
    return {
      memoryUsage: {
        used: memoryUsage.used,
        total: memoryUsage.total,
        percentage: memoryUsage.percentage
      },
      eventQueueSize: this.eventProcessingTimes.length,
      subscriptionCount: 0, // Would need to be passed from EventBus
      cacheHitRate: 0 // Would need to be passed from PatternCache
    };
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    if (typeof performance !== 'undefined' && performance.memory) {
      const mem = performance.memory;
      return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        percentage: (mem.usedJSHeapSize / mem.totalJSHeapSize) * 100
      };
    }
    
    // Fallback for environments without performance.memory
    return { used: 0, total: 0, percentage: 0 };
  }

  private getMemoryUsagePercentage(): number {
    return this.getMemoryUsage().percentage;
  }

  private getOldestTimestamp(): number {
    const timestamps = [
      ...this.eventProcessingTimes.map(dp => dp.timestamp),
      ...this.subscriptionMatchingTimes.map(dp => dp.timestamp),
      ...this.patternValidationTimes.map(dp => dp.timestamp)
    ];
    
    return timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
  }

  private cleanupIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCleanup < 60000) return; // Cleanup every minute
    
    this.lastCleanup = now;
    const cutoff = now - this.config.retentionMs;
    
    // Remove old data points
    this.eventProcessingTimes = this.eventProcessingTimes.filter(dp => dp.timestamp > cutoff);
    this.subscriptionMatchingTimes = this.subscriptionMatchingTimes.filter(dp => dp.timestamp > cutoff);
    this.patternValidationTimes = this.patternValidationTimes.filter(dp => dp.timestamp > cutoff);
    this.eventCounts = this.eventCounts.filter(dp => dp.timestamp > cutoff);
    this.errorCounts = this.errorCounts.filter(dp => dp.timestamp > cutoff);
    this.timeoutCounts = this.timeoutCounts.filter(dp => dp.timestamp > cutoff);
    
    // Limit data points if needed
    if (this.eventProcessingTimes.length > this.config.maxDataPoints) {
      this.eventProcessingTimes = this.eventProcessingTimes.slice(-this.config.maxDataPoints);
    }
    
    // Clean up old hot paths
    for (const [pattern, hotPath] of this.hotPaths.entries()) {
      if (now - hotPath.lastAccessed > this.config.retentionMs) {
        this.hotPaths.delete(pattern);
      }
    }
  }

  /**
   * Destroy profiler and cleanup resources
   */
  destroy(): void {
    this.clearMetrics();
    PerformanceProfiler.instance = null;
    SecurityLogger.anomaly('PerformanceProfiler destroyed');
  }
}

export default PerformanceProfiler;