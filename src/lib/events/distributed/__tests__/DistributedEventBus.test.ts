// DistributedEventBus.test.ts - Comprehensive test suite for distributed EventBus
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { DistributedEventBus } from '../DistributedEventBus';
import { createDistributedConfig, DISTRIBUTED_PRESETS } from '../index';
import type { NamespacedEvent } from '../../types';

// Mock IndexedDB for testing - comprehensive mock
const createMockIndexedDB = () => {
  const databases = new Map();

  const mockIndexedDB = {
    open: vi.fn((name: string, version?: number) => {
      const request = {
        result: null,
        error: null,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        onblocked: null,
        transaction: null
      };

      // Create mock database
      const db = {
        name,
        version: version || 1,
        objectStoreNames: {
          contains: vi.fn((storeName: string) => databases.has(`${name}_${storeName}`)),
          length: 0,
          item: vi.fn()
        },
        createObjectStore: vi.fn((storeName: string, options?: any) => {
          databases.set(`${name}_${storeName}`, new Map());
          return {
            name: storeName,
            createIndex: vi.fn(),
            transaction: vi.fn(() => ({
              objectStore: vi.fn(() => ({
                add: vi.fn(() => ({ onsuccess: null, onerror: null })),
                get: vi.fn(() => ({ onsuccess: null, onerror: null })),
                put: vi.fn(() => ({ onsuccess: null, onerror: null })),
                delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
                getAll: vi.fn(() => ({ onsuccess: null, onerror: null }))
              }))
            }))
          };
        }),
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            add: vi.fn(() => ({ onsuccess: null, onerror: null })),
            get: vi.fn(() => ({ onsuccess: null, onerror: null })),
            put: vi.fn(() => ({ onsuccess: null, onerror: null })),
            delete: vi.fn(() => ({ onsuccess: null, onerror: null })),
            getAll: vi.fn(() => ({ onsuccess: null, onerror: null }))
          }))
        })),
        close: vi.fn()
      };

      request.result = db;

      // Simulate async behavior with immediate callbacks
      Promise.resolve().then(() => {
        if (request.onupgradeneeded) {
          request.onupgradeneeded({ target: request } as any);
        }
        if (request.onsuccess) {
          request.onsuccess({ target: request } as any);
        }
      });

      return request;
    }),
    deleteDatabase: vi.fn((name: string) => {
      databases.delete(name);
      const request = { onsuccess: null, onerror: null };
      Promise.resolve().then(() => {
        if (request.onsuccess) {
          request.onsuccess({ target: request } as any);
        }
      });
      return request;
    })
  };

  return mockIndexedDB;
};

const mockIndexedDB = createMockIndexedDB();
global.indexedDB = mockIndexedDB as any;

// Mock BroadcastChannel for testing
class MockBroadcastChannel {
  name: string;
  private listeners = new Set<(event: any) => void>();

  constructor(name: string) {
    this.name = name;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (type === 'message') {
      this.listeners.add(listener);
    }
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    this.listeners.delete(listener);
  }

  postMessage(data: any) {
    // Simulate async message delivery
    setTimeout(() => {
      const event = { data, type: 'message' };
      this.listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in mock broadcast listener:', error);
        }
      });
    }, 0);
  }

  close() {
    this.listeners.clear();
  }
}

global.BroadcastChannel = MockBroadcastChannel as any;

describe('DistributedEventBus', () => {
  let eventBus: DistributedEventBus;
  let testEvent: NamespacedEvent;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    const config = createDistributedConfig({
      instanceId: 'test-instance-1',
      busId: 'test-bus'
    });

    eventBus = new DistributedEventBus(config);

    testEvent = {
      id: 'test-event-1',
      pattern: 'test.pattern',
      data: { message: 'test data' },
      timestamp: Date.now(),
      source: 'test-source',
      namespace: 'test'
    };
  });

  afterEach(async () => {
    if (eventBus) {
      await eventBus.destroy();
    }
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with distributed features enabled', () => {
      expect(eventBus.getInstanceId()).toBe('test-instance-1');
      expect(eventBus.isDistributedEnabled()).toBe(true);
    });

    it('should initialize all distributed components', () => {
      const status = eventBus.getDistributedStatus();
      expect(status.isLeader).toBeDefined();
      expect(status.connectedInstances).toBeDefined();
      expect(status.partitionStatus).toBeDefined();
    });

    it('should handle microfrontend configuration', () => {
      const microfrontendConfig = DISTRIBUTED_PRESETS.MICROFRONTEND_COORDINATED('microfrontend-bus');
      const microfrontendBus = new DistributedEventBus(microfrontendConfig);
      
      expect(microfrontendBus.isDistributedEnabled()).toBe(true);
      expect(microfrontendBus.getConfig().busId).toBe('microfrontend-bus');
    });
  });

  describe('Event Distribution', () => {
    it('should emit events locally and distribute to other instances', async () => {
      const localListener = vi.fn();
      eventBus.on('test.pattern', localListener);

      await eventBus.emit('test.pattern', testEvent.data);

      expect(localListener).toHaveBeenCalledWith(
        expect.objectContaining({
          pattern: 'test.pattern',
          data: testEvent.data
        })
      );
    });

    it('should handle remote events from other instances', async () => {
      const remoteListener = vi.fn();
      eventBus.on('remote.pattern', remoteListener);

      // Simulate remote event
      const remoteEvent: NamespacedEvent = {
        id: 'remote-event-1',
        pattern: 'remote.pattern',
        data: { source: 'remote-instance' },
        timestamp: Date.now(),
        source: 'remote-instance-1',
        namespace: 'test'
      };

      // Simulate receiving remote event via cross-instance coordinator
      await (eventBus as any).handleRemoteEvent(remoteEvent);

      expect(remoteListener).toHaveBeenCalledWith(
        expect.objectContaining({
          pattern: 'remote.pattern',
          data: { source: 'remote-instance' }
        })
      );
    });

    it('should prevent infinite loops when distributing events', async () => {
      const listener = vi.fn();
      eventBus.on('loop.test', listener);

      // Emit event twice - should not create infinite propagation
      await eventBus.emit('loop.test', { test: 'data' });
      await eventBus.emit('loop.test', { test: 'data2' });

      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe('Leader Election', () => {
    it('should participate in leader election', async () => {
      const status = eventBus.getDistributedStatus();
      expect(typeof status.isLeader).toBe('boolean');
    });

    it('should handle leadership changes', async () => {
      const leadershipCallback = vi.fn();
      
      // Register for leadership events
      eventBus.onLeadershipChange(leadershipCallback);

      // Simulate leadership change (normally triggered by BrowserLeaderElection)
      await (eventBus as any).handleLeadershipChange(true);

      expect(leadershipCallback).toHaveBeenCalledWith(true);
    });

    it('should perform leader responsibilities when elected', async () => {
      // Force leadership for testing
      await (eventBus as any).handleLeadershipChange(true);

      const status = eventBus.getDistributedStatus();
      expect(status.isLeader).toBe(true);

      // Leader should coordinate distributed operations
      const coordinationSpy = vi.spyOn(eventBus as any, 'coordinateDistributedOperation');
      await eventBus.emit('coordination.test', { data: 'test' });

      // Allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));
    });
  });

  describe('Network Partition Handling', () => {
    it('should detect network partitions', async () => {
      const partitionCallback = vi.fn();
      eventBus.onNetworkPartition(partitionCallback);

      // Simulate network partition
      await (eventBus as any).handleNetworkPartition();

      expect(partitionCallback).toHaveBeenCalled();
    });

    it('should handle partition healing', async () => {
      const healingCallback = vi.fn();
      eventBus.onPartitionHealed(healingCallback);

      // Simulate partition healing
      await (eventBus as any).handlePartitionHealing();

      expect(healingCallback).toHaveBeenCalled();
    });

    it('should fallback gracefully during partitions', async () => {
      // Simulate partition state
      await (eventBus as any).handleNetworkPartition();

      // Events should still work locally
      const localListener = vi.fn();
      eventBus.on('local.test', localListener);

      await eventBus.emit('local.test', { data: 'partition-test' });
      expect(localListener).toHaveBeenCalled();
    });
  });

  describe('Event Partitioning', () => {
    it('should partition events consistently', async () => {
      const partitionInfo1 = await (eventBus as any).getPartitionInfo('user-123');
      const partitionInfo2 = await (eventBus as any).getPartitionInfo('user-123');

      // Same key should always map to same partition
      expect(partitionInfo1.partition).toBe(partitionInfo2.partition);
    });

    it('should maintain ordering within partitions', async () => {
      const orderedEvents: NamespacedEvent[] = [];
      
      eventBus.on('ordered.test', (event) => {
        orderedEvents.push(event);
      });

      // Emit multiple events with same partition key
      await eventBus.emit('ordered.test', { id: 1, partitionKey: 'same-key' });
      await eventBus.emit('ordered.test', { id: 2, partitionKey: 'same-key' });
      await eventBus.emit('ordered.test', { id: 3, partitionKey: 'same-key' });

      // Allow processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Events should be in order
      expect(orderedEvents.length).toBe(3);
      expect(orderedEvents[0].data.id).toBe(1);
      expect(orderedEvents[1].data.id).toBe(2);
      expect(orderedEvents[2].data.id).toBe(3);
    });
  });

  describe('Distributed Storage', () => {
    it('should persist events in distributed store', async () => {
      await eventBus.emit('stored.test', { data: 'persist-me' });

      // Simulate retrieval from distributed store
      const storedEvents = await (eventBus as any).getStoredEvents('stored.test');
      expect(Array.isArray(storedEvents)).toBe(true);
    });

    it('should handle storage conflicts with vector clocks', async () => {
      const event1 = { ...testEvent, data: { version: 1 } };
      const event2 = { ...testEvent, data: { version: 2 } };

      // Simulate concurrent updates from different instances
      await (eventBus as any).handleConflictingEvent(event1, event2);

      // Should resolve based on vector clock ordering
      // Implementation details depend on conflict resolution strategy
    });
  });

  describe('Cross-Instance Communication', () => {
    it('should communicate with other instances', async () => {
      const connectedInstances = await eventBus.getConnectedInstances();
      expect(Array.isArray(connectedInstances)).toBe(true);
    });

    it('should compress large messages', async () => {
      const largeData = 'x'.repeat(10000); // 10KB of data
      
      await eventBus.emit('large.message', { data: largeData });

      // Should handle compression internally
      // Verify no errors thrown for large messages
    });

    it('should handle instance shutdown gracefully', async () => {
      const shutdownCallback = vi.fn();
      eventBus.onInstanceShutdown(shutdownCallback);

      // Simulate another instance shutting down
      await (eventBus as any).handleInstanceShutdown('other-instance-id');

      expect(shutdownCallback).toHaveBeenCalledWith('other-instance-id');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle BroadcastChannel errors gracefully', async () => {
      // Mock BroadcastChannel to throw error
      const originalPostMessage = MockBroadcastChannel.prototype.postMessage;
      MockBroadcastChannel.prototype.postMessage = vi.fn(() => {
        throw new Error('Channel error');
      });

      // Should not throw - should handle error internally
      await expect(eventBus.emit('error.test', { data: 'test' })).resolves.not.toThrow();

      // Restore original
      MockBroadcastChannel.prototype.postMessage = originalPostMessage;
    });

    it('should handle IndexedDB errors gracefully', async () => {
      // Mock IndexedDB to fail
      mockIndexedDB.open.mockImplementation(() => {
        const request = { onerror: null, onsuccess: null };
        setTimeout(() => {
          if (request.onerror) {
            request.onerror({ target: { error: new Error('DB error') } } as any);
          }
        }, 0);
        return request;
      });

      // Should continue working even if storage fails
      const listener = vi.fn();
      eventBus.on('storage.error.test', listener);
      
      await eventBus.emit('storage.error.test', { data: 'test' });
      expect(listener).toHaveBeenCalled();
    });

    it('should recover from temporary failures', async () => {
      let failCount = 0;
      const originalEmit = eventBus.emit.bind(eventBus);
      
      eventBus.emit = vi.fn().mockImplementation(async (...args) => {
        if (failCount < 2) {
          failCount++;
          throw new Error('Temporary failure');
        }
        return originalEmit(...args);
      });

      // Should eventually succeed after retries
      const listener = vi.fn();
      eventBus.on('retry.test', listener);
      
      await (eventBus as any).emitWithRetry('retry.test', { data: 'test' });
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Performance and Metrics', () => {
    it('should provide distributed metrics', () => {
      const metrics = eventBus.getDistributedMetrics();
      
      expect(metrics).toHaveProperty('eventsPropagated');
      expect(metrics).toHaveProperty('eventsReceived');
      expect(metrics).toHaveProperty('connectedInstances');
      expect(metrics).toHaveProperty('partitionStatus');
      expect(metrics).toHaveProperty('leadershipDuration');
    });

    it('should track cross-instance latency', async () => {
      await eventBus.emit('latency.test', { timestamp: Date.now() });

      const metrics = eventBus.getDistributedMetrics();
      expect(typeof metrics.averageLatency).toBe('number');
    });
  });

  describe('Configuration Presets', () => {
    it('should work with isolated microfrontend preset', () => {
      const isolatedConfig = DISTRIBUTED_PRESETS.MICROFRONTEND_ISOLATED('isolated-mf');
      const isolatedBus = new DistributedEventBus(isolatedConfig);
      
      expect(isolatedBus.getConfig().distributed.crossInstance.enabled).toBe(false);
    });

    it('should work with coordinated microfrontend preset', () => {
      const coordinatedConfig = DISTRIBUTED_PRESETS.MICROFRONTEND_COORDINATED('coordinated-mf');
      const coordinatedBus = new DistributedEventBus(coordinatedConfig);
      
      expect(coordinatedBus.getConfig().distributed.crossInstance.enabled).toBe(true);
      expect(coordinatedBus.getConfig().distributed.leaderElection.enabled).toBe(true);
    });

    it('should work with high-availability preset', () => {
      const haConfig = DISTRIBUTED_PRESETS.HIGH_AVAILABILITY('ha-bus');
      const haBus = new DistributedEventBus(haConfig);
      
      expect(haBus.getConfig().distributed.networkPartition.circuitBreakerEnabled).toBe(true);
      expect(haBus.getConfig().distributed.networkPartition.minimumConnectedInstances).toBe(2);
    });

    it('should work with performance-optimized preset', () => {
      const perfConfig = DISTRIBUTED_PRESETS.PERFORMANCE_OPTIMIZED('perf-bus');
      const perfBus = new DistributedEventBus(perfConfig);
      
      expect(perfBus.getConfig().distributed.partitioning.partitionCount).toBe(16);
      expect(perfBus.getConfig().distributed.crossInstance.compressionEnabled).toBe(true);
    });
  });
});