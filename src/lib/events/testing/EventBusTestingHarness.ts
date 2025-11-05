// EventBusTestingHarness.ts - Comprehensive Testing Utilities for EventBus
// Provides mocking, assertion helpers, and testing scenarios

import { EventBus } from '../EventBus';
import { logger } from '@/lib/logging';
import type {
  NamespacedEvent,
  EventPattern,
  ModuleDescriptor,
  EventHandler,
  ModuleId,
  EventBusConfig
} from '../types';

// Test event capture
interface CapturedEvent {
  event: NamespacedEvent;
  timestamp: Date;
  handlersCalled: string[];
  processingTimeMs: number;
  errors: string[];
}

// Test module mock
interface MockModule {
  descriptor: ModuleDescriptor;
  handlers: Map<string, EventHandler>;
  callHistory: Array<{
    handlerName: string;
    event: NamespacedEvent;
    timestamp: Date;
  }>;
}

// Test scenario configuration
interface TestScenario {
  name: string;
  description: string;
  setup: () => Promise<void>;
  execute: () => Promise<void>;
  verify: () => Promise<void>;
  cleanup: () => Promise<void>;
}

// Assertion helpers
interface EventAssertions {
  eventWasEmitted: (pattern: EventPattern) => boolean;
  eventWasEmittedWith: (pattern: EventPattern, expectedPayload: any) => boolean;
  handlerWasCalled: (moduleId: ModuleId, handlerName: string) => boolean;
  eventCount: (pattern?: EventPattern) => number;
  lastEvent: (pattern?: EventPattern) => CapturedEvent | null;
  eventsInOrder: (patterns: EventPattern[]) => boolean;
}

export class EventBusTestingHarness {
  private eventBus: EventBus;
  private originalConfig: EventBusConfig;
  private capturedEvents: CapturedEvent[] = [];
  private mockModules = new Map<ModuleId, MockModule>();
  private testScenarios = new Map<string, TestScenario>();
  private isRecording = false;
  private testStartTime = Date.now();

  constructor(eventBus?: EventBus, testConfig?: Partial<EventBusConfig>) {
    // Create isolated test instance or use provided one
    this.eventBus = eventBus || new EventBus({
      persistenceEnabled: false,       // Disable persistence for tests
      deduplicationEnabled: false,     // Disable deduplication for tests
      offlineSyncEnabled: false,       // Disable sync for tests
      testModeEnabled: true,           // Enable test mode
      metricsEnabled: false,           // Disable metrics collection
      ...testConfig
    });

    this.originalConfig = this.eventBus['config'];
    this.setupTestMode();
  }

  // Setup test mode and interceptors
  private setupTestMode(): void {
    this.eventBus.enableTestMode();
    
    // Intercept event emissions for capture
    const originalEmit = this.eventBus.emit.bind(this.eventBus);
    this.eventBus.emit = async (pattern, payload, options = {}) => {
      const startTime = Date.now();
      
      try {
        // Call original emit
        await originalEmit(pattern, payload, options);
        
        // Capture event if recording
        if (this.isRecording) {
          const processingTime = Date.now() - startTime;
          
          const capturedEvent: CapturedEvent = {
            event: {
              id: this.generateTestEventId(),
              pattern,
              payload,
              timestamp: new Date().toISOString(),
              source: 'test-harness',
              version: '1.0.0',
              metadata: {
                priority: options.priority || 'normal' as any,
                persistent: false,
                crossModule: true,
                deduplication: {} as any,
                tracing: {} as any
              }
            },
            timestamp: new Date(),
            handlersCalled: [],
            processingTimeMs: processingTime,
            errors: []
          };
          
          this.capturedEvents.push(capturedEvent);
        }
        
      } catch (error) {
        if (this.isRecording) {
          const lastCaptured = this.capturedEvents[this.capturedEvents.length - 1];
          if (lastCaptured) {
            lastCaptured.errors.push(error.message);
          }
        }
        throw error;
      }
    };
  }

  // Start event recording
  startRecording(): void {
    this.isRecording = true;
    this.capturedEvents = [];
    this.testStartTime = Date.now();
    logger.info('EventBus', '[TestHarness] Event recording started');
  }

  // Stop event recording
  stopRecording(): CapturedEvent[] {
    this.isRecording = false;
    logger.info('EventBus', `[TestHarness] Event recording stopped. Captured ${this.capturedEvents.length} events`);
    return [...this.capturedEvents];
  }

  // Create mock module
  createMockModule(
    moduleId: ModuleId,
    eventHandlers: Record<EventPattern, (event: NamespacedEvent) => void | Promise<void>>
  ): MockModule {
    const handlers = new Map<string, EventHandler>();
    const callHistory: any[] = [];
    
    // Convert event handlers to tracked handlers
    for (const [pattern, handler] of Object.entries(eventHandlers)) {
      const trackedHandler: EventHandler = async (event) => {
        const handlerName = `handle_${pattern.replace('.', '_')}`;

        // Record call
        callHistory.push({
          handlerName,
          event,
          timestamp: new Date()
        });

        // Track in captured events if recording
        if (this.isRecording) {
          const lastCaptured = this.capturedEvents[this.capturedEvents.length - 1];
          if (lastCaptured && lastCaptured.event.pattern === event.pattern) {
            lastCaptured.handlersCalled.push(`${moduleId}.${handlerName}`);
          }
        }

        try {
          await handler(event);
        } catch (error) {
          if (this.isRecording) {
            const lastCaptured = this.capturedEvents[this.capturedEvents.length - 1];
            if (lastCaptured) {
              lastCaptured.errors.push(`${moduleId}.${handlerName}: ${error.message}`);
            }
          }
          throw error;
        }
      };
      
      handlers.set(pattern, trackedHandler);
    }
    
    // Create module descriptor
    const descriptor: ModuleDescriptor = {
      id: moduleId,
      name: `Mock Module ${moduleId}`,
      version: '1.0.0-test',
      dependencies: [],
      eventSubscriptions: Object.keys(eventHandlers).map(pattern => ({
        pattern: pattern as EventPattern,
        handler: `handle_${pattern.replace('.', '_')}`
      })),
      healthCheck: async () => ({
        status: 'active' as const,
        metrics: {
          eventsProcessed: callHistory.length,
          eventsEmitted: 0,
          errorRate: 0,
          avgProcessingTimeMs: 0,
          queueSize: 0
        },
        dependencies: {},
        lastCheck: new Date()
      })
    };
    
    const mockModule: MockModule = {
      descriptor,
      handlers,
      callHistory
    };
    
    this.mockModules.set(moduleId, mockModule);
    return mockModule;
  }

  // Register mock module with event bus
  async registerMockModule(moduleId: ModuleId): Promise<void> {
    const mockModule = this.mockModules.get(moduleId);
    if (!mockModule) {
      throw new Error(`Mock module '${moduleId}' not found`);
    }
    
    // Register module
    await this.eventBus.registerModule(mockModule.descriptor);
    
    // Subscribe handlers
    for (const [pattern, handler] of mockModule.handlers) {
      this.eventBus.on(pattern as EventPattern, handler, {
        moduleId,
        persistent: false
      });
    }
    
    logger.info('EventBus', `[TestHarness] Mock module '${moduleId}' registered`);
  }

  // Create assertion helpers
  createAssertions(): EventAssertions {
    return {
      eventWasEmitted: (pattern: EventPattern): boolean => {
        return this.capturedEvents.some(captured => captured.event.pattern === pattern);
      },
      
      eventWasEmittedWith: (pattern: EventPattern, expectedPayload: any): boolean => {
        return this.capturedEvents.some(captured => 
          captured.event.pattern === pattern &&
          JSON.stringify(captured.event.payload) === JSON.stringify(expectedPayload)
        );
      },
      
      handlerWasCalled: (moduleId: ModuleId, handlerName: string): boolean => {
        const module = this.mockModules.get(moduleId);
        if (!module) return false;
        
        return module.callHistory.some(call => call.handlerName === handlerName);
      },
      
      eventCount: (pattern?: EventPattern): number => {
        if (!pattern) return this.capturedEvents.length;
        
        return this.capturedEvents.filter(captured => 
          captured.event.pattern === pattern
        ).length;
      },
      
      lastEvent: (pattern?: EventPattern): CapturedEvent | null => {
        const events = pattern 
          ? this.capturedEvents.filter(captured => captured.event.pattern === pattern)
          : this.capturedEvents;
          
        return events.length > 0 ? events[events.length - 1] : null;
      },
      
      eventsInOrder: (patterns: EventPattern[]): boolean => {
        const patternEvents = this.capturedEvents.map(captured => captured.event.pattern);
        let patternIndex = 0;
        
        for (const eventPattern of patternEvents) {
          if (eventPattern === patterns[patternIndex]) {
            patternIndex++;
            if (patternIndex === patterns.length) {
              return true;
            }
          }
        }
        
        return false;
      }
    };
  }

  // Wait for specific event with timeout
  async waitForEvent(
    pattern: EventPattern,
    timeout: number = 5000,
    filter?: (event: NamespacedEvent) => boolean
  ): Promise<NamespacedEvent> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${pattern}`));
      }, timeout);
      
      const unsubscribe = this.eventBus.on(pattern, (_event) => {
        if (!filter || filter(event)) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(event);
        }
      });
    });
  }

  // Simulate event sequence
  async simulateEventSequence(
    events: Array<{ pattern: EventPattern; payload: any; delayMs?: number }>
  ): Promise<void> {
    for (const eventDef of events) {
      if (eventDef.delayMs) {
        await new Promise(resolve => setTimeout(resolve, eventDef.delayMs));
      }
      
      await this.eventBus.emit(eventDef.pattern, eventDef.payload);
    }
  }

  // Test common scenarios
  createCommonScenarios(): void {
    // Scenario: Order lifecycle
    this.addTestScenario('order-lifecycle', {
      name: 'Order Lifecycle',
      description: 'Tests complete order processing from placement to completion',
      setup: async () => {
        // Create mock modules for order processing
        this.createMockModule('sales', {
          'sales.order.placed': async () => { /* handle order placement */ },
          'sales.payment.completed': async () => { /* handle payment */ }
        });
        
        this.createMockModule('kitchen', {
          'production.preparation.started': async () => { /* start cooking */ },
          'production.item.ready': async () => { /* item ready */ }
        });
        
        await this.registerMockModule('sales');
        await this.registerMockModule('kitchen');
      },
      
      execute: async () => {
        await this.simulateEventSequence([
          { pattern: 'sales.order.placed', payload: { orderId: 'test-123' } },
          { pattern: 'production.preparation.started', payload: { orderId: 'test-123' }, delayMs: 100 },
          { pattern: 'production.item.ready', payload: { orderId: 'test-123' }, delayMs: 200 },
          { pattern: 'sales.payment.completed', payload: { orderId: 'test-123' }, delayMs: 300 }
        ]);
      },
      
      verify: async () => {
        const assert = this.createAssertions();
        
        if (!assert.eventsInOrder(['sales.order.placed', 'production.preparation.started', 'production.item.ready', 'sales.payment.completed'])) {
          throw new Error('Events not emitted in correct order');
        }
        
        if (assert.eventCount() !== 4) {
          throw new Error(`Expected 4 events, got ${assert.eventCount()}`);
        }
      },
      
      cleanup: async () => {
        await this.cleanup();
      }
    });

    // Scenario: Error handling
    this.addTestScenario('error-handling', {
      name: 'Error Handling',
      description: 'Tests error handling in event processing',
      setup: async () => {
        this.createMockModule('error-module', {
          'test.error.event': async () => {
            throw new Error('Test error');
          }
        });
        
        await this.registerMockModule('error-module');
      },
      
      execute: async () => {
        await this.eventBus.emit('test.error.event', { test: true });
        // Wait for error event
        await this.waitForEvent('global.eventbus.handler-error', 1000);
      },
      
      verify: async () => {
        const assert = this.createAssertions();
        
        if (!assert.eventWasEmitted('global.eventbus.handler-error')) {
          throw new Error('Error event was not emitted');
        }
      },
      
      cleanup: async () => {
        await this.cleanup();
      }
    });
  }

  // Add custom test scenario
  addTestScenario(name: string, scenario: TestScenario): void {
    this.testScenarios.set(name, scenario);
  }

  // Run test scenario
  async runScenario(name: string): Promise<void> {
    const scenario = this.testScenarios.get(name);
    if (!scenario) {
      throw new Error(`Test scenario '${name}' not found`);
    }
    
    logger.info('EventBus', `[TestHarness] Running scenario: ${scenario.name}`);
    
    try {
      this.startRecording();
      await scenario.setup();
      await scenario.execute();
      await scenario.verify();
      logger.info('EventBus', `[TestHarness] Scenario '${name}' passed`);
    } catch (error) {
      logger.error('EventBus', `[TestHarness] Scenario '${name}' failed:`, error);
      throw error;
    } finally {
      this.stopRecording();
      await scenario.cleanup();
    }
  }

  // Run all scenarios
  async runAllScenarios(): Promise<{ passed: number; failed: number; results: Array<{ name: string; success: boolean; error?: string }> }> {
    const results: Array<{ name: string; success: boolean; error?: string }> = [];
    let passed = 0;
    let failed = 0;
    
    for (const [name, scenario] of this.testScenarios) {
      try {
        await this.runScenario(name);
        results.push({ name, success: true });
        passed++;
      } catch (error) {
        results.push({ name, success: false, error: error.message });
        failed++;
      }
    }
    
    return { passed, failed, results };
  }

  // Performance testing
  async performanceTest(
    eventCount: number,
    pattern: EventPattern,
    payload: any = {}
  ): Promise<{
    totalTimeMs: number;
    eventsPerSecond: number;
    avgLatencyMs: number;
    maxLatencyMs: number;
    minLatencyMs: number;
  }> {
    const startTime = Date.now();
    const latencies: number[] = [];
    
    this.startRecording();
    
    for (let i = 0; i < eventCount; i++) {
      const eventStart = Date.now();
      await this.eventBus.emit(pattern, { ...payload, index: i });
      const eventLatency = Date.now() - eventStart;
      latencies.push(eventLatency);
    }
    
    this.stopRecording();
    
    const totalTime = Date.now() - startTime;
    const eventsPerSecond = (eventCount / totalTime) * 1000;
    const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);
    
    return {
      totalTimeMs: totalTime,
      eventsPerSecond,
      avgLatencyMs: avgLatency,
      maxLatencyMs: maxLatency,
      minLatencyMs: minLatency
    };
  }

  // Get test results summary
  getTestSummary(): {
    capturedEvents: number;
    mockModules: number;
    testScenarios: number;
    testDuration: number;
  } {
    return {
      capturedEvents: this.capturedEvents.length,
      mockModules: this.mockModules.size,
      testScenarios: this.testScenarios.size,
      testDuration: Date.now() - this.testStartTime
    };
  }

  // Cleanup test resources
  async cleanup(): Promise<void> {
    this.stopRecording();
    this.capturedEvents = [];
    
    // Deactivate all mock modules
    for (const moduleId of this.mockModules.keys()) {
      try {
        await this.eventBus.deactivateModule(moduleId);
      } catch (error) {
        logger.error('EventBus', `[TestHarness] Error deactivating mock module '${moduleId}':`, error);
      }
    }
    
    this.mockModules.clear();
    this.eventBus.clearMockHistory();
    
    logger.info('EventBus', '[TestHarness] Cleanup completed');
  }

  // Generate test event ID using secure random
  private generateTestEventId(): string {
    try {
      // Use secure random for test IDs to maintain consistency
      const { default: SecureRandomGenerator } = require('../utils/SecureRandomGenerator');
      const secureRandom = SecureRandomGenerator.getInstance();
      return secureRandom.generateTestId();
    } catch (error) {
      // Fallback for test environments where crypto might not be available
      logger.warn('EventBus', 'SecureRandomGenerator not available in test environment, using timestamp-based ID');
      return `test_${Date.now()}_fallback`;
    }
  }

  // Destroy test harness
  async destroy(): Promise<void> {
    await this.cleanup();
    this.eventBus.disableTestMode();
  }
}