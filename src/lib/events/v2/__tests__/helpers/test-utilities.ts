// Test utilities - Helper functions for EventBus V2.0 testing
// Provides common utilities, assertions, and setup functions

import { EventBusV2 } from '../../EventBusV2';
import { EventBusTestingHarness } from '../../testing/EventBusTestingHarness';
import type { 
  NamespacedEvent, 
  EventPattern, 
  ModuleDescriptor,
  EventBusConfig,
  EventBusMetrics
} from '../../types';

// Test configuration presets
export const testConfigs = {
  // Minimal config for unit tests
  unit: {
    persistenceEnabled: false,
    deduplicationEnabled: false,
    offlineSyncEnabled: false,
    testModeEnabled: true,
    metricsEnabled: false,
    healthCheckIntervalMs: 1000
  } as Partial<EventBusConfig>,

  // Config for integration tests
  integration: {
    persistenceEnabled: true,
    deduplicationEnabled: true,
    offlineSyncEnabled: false, // Disabled to avoid external dependencies
    testModeEnabled: true,
    metricsEnabled: true,
    healthCheckIntervalMs: 2000,
    maxStorageSize: 10 * 1024 * 1024, // 10MB for tests
    maxEventHistorySize: 1000
  } as Partial<EventBusConfig>,

  // Config for performance tests
  performance: {
    persistenceEnabled: true,
    deduplicationEnabled: true,
    offlineSyncEnabled: false,
    testModeEnabled: true,
    metricsEnabled: true,
    maxConcurrentEvents: 1000,
    healthCheckIntervalMs: 5000
  } as Partial<EventBusConfig>,

  // Config for stress tests
  stress: {
    persistenceEnabled: true,
    deduplicationEnabled: false, // Disable to allow duplicates in stress tests
    offlineSyncEnabled: false,
    testModeEnabled: true,
    metricsEnabled: true,
    maxConcurrentEvents: 10000,
    defaultEventTimeout: 60000, // Longer timeout for stress
    healthCheckIntervalMs: 10000
  } as Partial<EventBusConfig>
};

// Test setup utilities
export class TestSetup {
  private static instances = new Set<EventBusV2>();
  private static harnesses = new Set<EventBusTestingHarness>();

  // Create EventBus instance for testing
  static async createEventBus(config?: Partial<EventBusConfig>): Promise<EventBusV2> {
    const eventBus = new EventBusV2({
      ...testConfigs.unit,
      ...config
    });

    this.instances.add(eventBus);
    return eventBus;
  }

  // Create testing harness
  static createHarness(eventBus?: EventBusV2, config?: Partial<EventBusConfig>): EventBusTestingHarness {
    const harness = new EventBusTestingHarness(eventBus, config);
    this.harnesses.add(harness);
    return harness;
  }

  // Cleanup all test instances
  static async cleanup(): Promise<void> {
    // Cleanup harnesses first
    for (const harness of this.harnesses) {
      try {
        await harness.cleanup();
      } catch (error) {
        console.warn('[TestSetup] Error cleaning harness:', error);
      }
    }
    this.harnesses.clear();

    // Cleanup EventBus instances
    for (const eventBus of this.instances) {
      try {
        await eventBus.gracefulShutdown(5000);
      } catch (error) {
        console.warn('[TestSetup] Error shutting down EventBus:', error);
      }
    }
    this.instances.clear();
  }
}

// Custom assertions for EventBus testing
export class EventBusAssertions {
  private events: NamespacedEvent[] = [];
  private harness?: EventBusTestingHarness;

  constructor(harness?: EventBusTestingHarness) {
    this.harness = harness;
  }

  // Set events to assert against
  setEvents(events: NamespacedEvent[]): void {
    this.events = events;
  }

  // Assert that an event was emitted
  assertEventEmitted(pattern: EventPattern, message?: string): void {
    const found = this.events.some(event => event.pattern === pattern);
    if (!found) {
      throw new Error(message || `Expected event '${pattern}' to be emitted, but it wasn't`);
    }
  }

  // Assert that an event was not emitted
  assertEventNotEmitted(pattern: EventPattern, message?: string): void {
    const found = this.events.some(event => event.pattern === pattern);
    if (found) {
      throw new Error(message || `Expected event '${pattern}' to NOT be emitted, but it was`);
    }
  }

  // Assert event count
  assertEventCount(expectedCount: number, pattern?: EventPattern, message?: string): void {
    const events = pattern 
      ? this.events.filter(event => event.pattern === pattern)
      : this.events;
    
    if (events.length !== expectedCount) {
      const patternMsg = pattern ? ` for pattern '${pattern}'` : '';
      throw new Error(
        message || `Expected ${expectedCount} events${patternMsg}, but got ${events.length}`
      );
    }
  }

  // Assert events were emitted in order
  assertEventsInOrder(patterns: EventPattern[], message?: string): void {
    const foundPatterns = this.events.map(event => event.pattern);
    
    let lastIndex = -1;
    for (const pattern of patterns) {
      const index = foundPatterns.indexOf(pattern, lastIndex + 1);
      if (index === -1) {
        throw new Error(
          message || `Expected events in order [${patterns.join(', ')}], but '${pattern}' was not found after previous events`
        );
      }
      lastIndex = index;
    }
  }

  // Assert event payload contains expected values
  assertEventPayload(pattern: EventPattern, expectedPayload: any, message?: string): void {
    const event = this.events.find(e => e.pattern === pattern);
    if (!event) {
      throw new Error(message || `Event '${pattern}' not found`);
    }

    const matches = this.deepEqual(event.payload, expectedPayload);
    if (!matches) {
      throw new Error(
        message || `Event '${pattern}' payload mismatch.\nExpected: ${JSON.stringify(expectedPayload)}\nActual: ${JSON.stringify(event.payload)}`
      );
    }
  }

  // Assert event metadata
  assertEventMetadata(pattern: EventPattern, expectedMetadata: any, message?: string): void {
    const event = this.events.find(e => e.pattern === pattern);
    if (!event) {
      throw new Error(message || `Event '${pattern}' not found`);
    }

    const matches = this.deepEqual(event.metadata, expectedMetadata);
    if (!matches) {
      throw new Error(
        message || `Event '${pattern}' metadata mismatch.\nExpected: ${JSON.stringify(expectedMetadata)}\nActual: ${JSON.stringify(event.metadata)}`
      );
    }
  }

  // Helper for deep equality check
  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      
      if (keys1.length !== keys2.length) return false;
      
      for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!this.deepEqual(obj1[key], obj2[key])) return false;
      }
      return true;
    }
    
    return false;
  }
}

// Performance measurement utilities
export class PerformanceMeasurement {
  private measurements: Map<string, number[]> = new Map();
  private timers: Map<string, number> = new Map();

  // Start timing an operation
  start(label: string): void {
    this.timers.set(label, performance.now());
  }

  // End timing and record measurement
  end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      throw new Error(`No timer found for label '${label}'`);
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    // Store measurement
    if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
    this.measurements.get(label)!.push(duration);

    return duration;
  }

  // Get statistics for a measurement
  getStats(label: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    median: number;
    p95: number;
    p99: number;
  } {
    const values = this.measurements.get(label);
    if (!values || values.length === 0) {
      throw new Error(`No measurements found for label '${label}'`);
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;

    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      avg: sorted.reduce((sum, val) => sum + val, 0) / count,
      median: sorted[Math.floor(count / 2)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    };
  }

  // Get all measurements
  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const result: Record<string, ReturnType<typeof this.getStats>> = {};
    for (const label of this.measurements.keys()) {
      result[label] = this.getStats(label);
    }
    return result;
  }

  // Clear all measurements
  clear(): void {
    this.measurements.clear();
    this.timers.clear();
  }
}

// Memory monitoring utilities
export class MemoryMonitor {
  private snapshots: { timestamp: number; usage: any }[] = [];

  // Take memory snapshot
  takeSnapshot(label?: string): any {
    const usage = (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
    } : null;

    const snapshot = {
      timestamp: Date.now(),
      label,
      usage
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  // Check for memory leaks
  checkForLeaks(threshold: number = 10 * 1024 * 1024): { hasLeak: boolean; growth: number } {
    if (this.snapshots.length < 2) {
      return { hasLeak: false, growth: 0 };
    }

    const first = this.snapshots[0].usage;
    const last = this.snapshots[this.snapshots.length - 1].usage;

    if (!first || !last) {
      return { hasLeak: false, growth: 0 };
    }

    const growth = last.usedJSHeapSize - first.usedJSHeapSize;
    return {
      hasLeak: growth > threshold,
      growth
    };
  }

  // Get memory growth statistics
  getGrowthStats(): {
    totalGrowth: number;
    avgGrowthPerSnapshot: number;
    maxUsage: number;
    minUsage: number;
  } {
    if (this.snapshots.length === 0) {
      return { totalGrowth: 0, avgGrowthPerSnapshot: 0, maxUsage: 0, minUsage: 0 };
    }

    const usages = this.snapshots
      .map(s => s.usage?.usedJSHeapSize)
      .filter(u => u !== null && u !== undefined);

    if (usages.length === 0) {
      return { totalGrowth: 0, avgGrowthPerSnapshot: 0, maxUsage: 0, minUsage: 0 };
    }

    const totalGrowth = usages[usages.length - 1] - usages[0];
    const avgGrowthPerSnapshot = totalGrowth / usages.length;
    const maxUsage = Math.max(...usages);
    const minUsage = Math.min(...usages);

    return { totalGrowth, avgGrowthPerSnapshot, maxUsage, minUsage };
  }

  // Clear snapshots
  clear(): void {
    this.snapshots = [];
  }
}

// Event generation utilities
export class EventGenerator {
  private eventBus: EventBusV2;
  private sequenceCounter = 0;

  constructor(eventBus: EventBusV2) {
    this.eventBus = eventBus;
  }

  // Generate and emit a single test event
  async emitTestEvent(pattern: EventPattern, payload: any = {}): Promise<void> {
    await this.eventBus.emit(pattern, {
      ...payload,
      _testSequence: this.sequenceCounter++,
      _testTimestamp: new Date().toISOString()
    });
  }

  // Generate multiple events in sequence
  async emitSequence(events: { pattern: EventPattern; payload?: any }[], delayMs = 0): Promise<void> {
    for (const event of events) {
      await this.emitTestEvent(event.pattern, event.payload);
      if (delayMs > 0) {
        await this.delay(delayMs);
      }
    }
  }

  // Generate concurrent events
  async emitConcurrent(events: { pattern: EventPattern; payload?: any }[]): Promise<void> {
    const promises = events.map(event => this.emitTestEvent(event.pattern, event.payload));
    await Promise.all(promises);
  }

  // Generate high-frequency events for stress testing
  async emitHighFrequency(pattern: EventPattern, count: number, intervalMs: number): Promise<void> {
    return new Promise((resolve) => {
      let emitted = 0;
      
      const interval = setInterval(async () => {
        await this.emitTestEvent(pattern, { sequence: emitted });
        emitted++;
        
        if (emitted >= count) {
          clearInterval(interval);
          resolve();
        }
      }, intervalMs);
    });
  }

  // Utility for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test validation utilities
export class TestValidator {
  // Validate EventBus metrics
  static validateMetrics(metrics: EventBusMetrics, expectedRanges: Partial<{
    totalEvents: [number, number];
    eventsPerSecond: [number, number];
    avgLatencyMs: [number, number];
    errorRate: [number, number];
    activeModules: [number, number];
  }>): void {
    for (const [key, range] of Object.entries(expectedRanges)) {
      const value = metrics[key as keyof EventBusMetrics] as number;
      const [min, max] = range;
      
      if (value < min || value > max) {
        throw new Error(`Metric '${key}' value ${value} is outside expected range [${min}, ${max}]`);
      }
    }
  }

  // Validate module health
  static validateModuleHealth(health: any, expectedStatus: string): void {
    if (health.status !== expectedStatus) {
      throw new Error(`Expected module status '${expectedStatus}', but got '${health.status}'`);
    }
  }

  // Validate event structure
  static validateEventStructure(event: NamespacedEvent): void {
    if (!event.id) throw new Error('Event missing required field: id');
    if (!event.pattern) throw new Error('Event missing required field: pattern');
    if (!event.payload) throw new Error('Event missing required field: payload');
    if (!event.timestamp) throw new Error('Event missing required field: timestamp');
    if (!event.metadata) throw new Error('Event missing required field: metadata');
  }

  // Validate performance requirements
  static validatePerformance(stats: any, requirements: {
    maxAvgLatency?: number;
    minThroughput?: number;
    maxErrorRate?: number;
  }): void {
    if (requirements.maxAvgLatency && stats.avg > requirements.maxAvgLatency) {
      throw new Error(`Average latency ${stats.avg}ms exceeds maximum ${requirements.maxAvgLatency}ms`);
    }
    
    if (requirements.minThroughput && stats.throughput < requirements.minThroughput) {
      throw new Error(`Throughput ${stats.throughput} ops/sec is below minimum ${requirements.minThroughput} ops/sec`);
    }
    
    if (requirements.maxErrorRate && stats.errorRate > requirements.maxErrorRate) {
      throw new Error(`Error rate ${stats.errorRate}% exceeds maximum ${requirements.maxErrorRate}%`);
    }
  }
}

// Cleanup utilities
export const cleanupUtils = {
  // Global test cleanup
  async cleanupAllTests(): Promise<void> {
    await TestSetup.cleanup();
  },

  // Clear browser storage (for integration tests)
  async clearStorage(): Promise<void> {
    if (typeof indexedDB !== 'undefined') {
      // Clear IndexedDB
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
          }
        })
      );
    }

    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }
};

// Export commonly used test patterns
export const testPatterns = {
  unit: {
    timeout: 5000,
    retries: 0
  },
  integration: {
    timeout: 15000,
    retries: 1
  },
  performance: {
    timeout: 30000,
    retries: 0
  },
  stress: {
    timeout: 120000,
    retries: 0
  }
};