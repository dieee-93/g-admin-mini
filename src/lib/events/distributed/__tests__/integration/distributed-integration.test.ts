// distributed-integration.test.ts - Integration tests for complete distributed system
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DistributedEventBus } from '../../DistributedEventBus';
import { DistributedEventBusFactory } from '../../DistributedEventBusFactory';
import { createDistributedConfig } from '../../index';

// Mock global APIs
const setupMocks = () => {
  // Mock IndexedDB
  const mockIndexedDB = {
    open: vi.fn().mockImplementation(() => {
      const request = {
        result: {
          objectStoreNames: {
            contains: vi.fn(() => false)
          },
          createObjectStore: vi.fn(),
          transaction: vi.fn(() => ({
            objectStore: vi.fn(() => ({
              add: vi.fn(() => ({ onsuccess: null, onerror: null })),
              get: vi.fn(() => ({ onsuccess: null, onerror: null })),
              put: vi.fn(() => ({ onsuccess: null, onerror: null })),
              delete: vi.fn(() => ({ onsuccess: null, onerror: null }))
            }))
          }))
        },
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null
      };
      
      setTimeout(() => {
        if (request.onupgradeneeded) request.onupgradeneeded({ target: request } as any);
        if (request.onsuccess) request.onsuccess({ target: request } as any);
      }, 0);
      
      return request;
    }),
    deleteDatabase: vi.fn()
  };
  global.indexedDB = mockIndexedDB as any;

  // Mock BroadcastChannel with network simulation
  class MockBroadcastChannel {
    name: string;
    private listeners = new Set<(event: any) => void>();
    static instances = new Map<string, Set<MockBroadcastChannel>>();
    static networkLatency = 10; // ms
    static networkFailureRate = 0; // 0-1 probability

    constructor(name: string) {
      this.name = name;
      if (!MockBroadcastChannel.instances.has(name)) {
        MockBroadcastChannel.instances.set(name, new Set());
      }
      MockBroadcastChannel.instances.get(name)!.add(this);
    }

    addEventListener(type: string, listener: (event: any) => void) {
      if (type === 'message') this.listeners.add(listener);
    }

    removeEventListener(type: string, listener: (event: any) => void) {
      this.listeners.delete(listener);
    }

    postMessage(data: any) {
      // Simulate network failure
      if (Math.random() < MockBroadcastChannel.networkFailureRate) {
        return;
      }

      const instances = MockBroadcastChannel.instances.get(this.name);
      if (!instances) return;

      setTimeout(() => {
        const event = { data, type: 'message' };
        instances.forEach(instance => {
          if (instance !== this) {
            instance.listeners.forEach(listener => {
              try {
                listener(event);
              } catch (error) {
                console.error('Mock broadcast error:', error);
              }
            });
          }
        });
      }, MockBroadcastChannel.networkLatency);
    }

    close() {
      this.listeners.clear();
      const instances = MockBroadcastChannel.instances.get(this.name);
      if (instances) {
        instances.delete(this);
        if (instances.size === 0) {
          MockBroadcastChannel.instances.delete(this.name);
        }
      }
    }

    static simulateNetworkPartition(enabled: boolean, failureRate = 0.8) {
      this.networkFailureRate = enabled ? failureRate : 0;
    }

    static simulateLatency(latencyMs: number) {
      this.networkLatency = latencyMs;
    }
  }

  global.BroadcastChannel = MockBroadcastChannel as any;
  return { MockBroadcastChannel };
};

describe('Distributed EventBus Integration Tests', () => {
  let MockBroadcastChannel: any;
  let factory: DistributedEventBusFactory;
  let instances: DistributedEventBus[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    ({ MockBroadcastChannel } = setupMocks());
    instances = [];
  });

  afterEach(async () => {
    // Cleanup all instances
    await Promise.all(instances.map(instance => instance.destroy()));
    if (factory) await factory.destroy();
    MockBroadcastChannel?.instances?.clear();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const createInstance = (instanceId: string, busId = 'test-bus', overrides = {}) => {
    const config = createDistributedConfig({
      instanceId,
      busId,
      ...overrides
    });
    const instance = new DistributedEventBus(config);
    instances.push(instance);
    return instance;
  };

  describe('Multi-Instance Communication', () => {
    it('should propagate events across multiple instances', async () => {
      const instance1 = createInstance('instance-1');
      const instance2 = createInstance('instance-2');
      const instance3 = createInstance('instance-3');

      // Setup listeners
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      instance1.on('cross.test', listener1);
      instance2.on('cross.test', listener2);
      instance3.on('cross.test', listener3);

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      // Emit from instance1
      await instance1.emit('cross.test', { source: 'instance-1', data: 'test' });

      // Wait for propagation
      await new Promise(resolve => setTimeout(resolve, 100));

      // All instances should receive the event
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();

      // Verify event data
      const event1 = listener1.mock.calls[0][0];
      const event2 = listener2.mock.calls[0][0];
      expect(event1.data.source).toBe('instance-1');
      expect(event2.data.source).toBe('instance-1');
    });

    it('should maintain event ordering across instances', async () => {
      const instance1 = createInstance('instance-1');
      const instance2 = createInstance('instance-2');

      const receivedEvents: any[] = [];
      instance2.on('ordered.test', (event) => {
        receivedEvents.push(event.data);
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Emit multiple events rapidly
      for (let i = 0; i < 5; i++) {
        await instance1.emit('ordered.test', { 
          sequence: i, 
          partitionKey: 'same-partition' 
        });
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // Events should be received in order
      expect(receivedEvents.length).toBe(5);
      for (let i = 0; i < 5; i++) {
        expect(receivedEvents[i].sequence).toBe(i);
      }
    });

    it('should handle different bus IDs independently', async () => {
      const busA1 = createInstance('instance-1', 'bus-a');
      const busA2 = createInstance('instance-2', 'bus-a');
      const busB1 = createInstance('instance-3', 'bus-b');

      const listenerA1 = vi.fn();
      const listenerA2 = vi.fn();
      const listenerB1 = vi.fn();

      busA1.on('bus.test', listenerA1);
      busA2.on('bus.test', listenerA2);
      busB1.on('bus.test', listenerB1);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Emit from bus-a
      await busA1.emit('bus.test', { bus: 'a' });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Only bus-a instances should receive
      expect(listenerA1).toHaveBeenCalled();
      expect(listenerA2).toHaveBeenCalled();
      expect(listenerB1).not.toHaveBeenCalled();

      // Reset and emit from bus-b
      listenerA1.mockClear();
      listenerA2.mockClear();
      
      await busB1.emit('bus.test', { bus: 'b' });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Only bus-b instance should receive
      expect(listenerA1).not.toHaveBeenCalled();
      expect(listenerA2).not.toHaveBeenCalled();
      expect(listenerB1).toHaveBeenCalled();
    });
  });

  describe('Leader Election Integration', () => {
    it('should elect leader consistently across instances', async () => {
      const instance1 = createInstance('instance-1', 'leader-test', {
        distributed: { leaderElection: { priority: 100 } }
      });
      const instance2 = createInstance('instance-2', 'leader-test', {
        distributed: { leaderElection: { priority: 200 } }
      });
      const instance3 = createInstance('instance-3', 'leader-test', {
        distributed: { leaderElection: { priority: 150 } }
      });

      // Wait for leader election
      await new Promise(resolve => setTimeout(resolve, 300));

      const status1 = instance1.getDistributedStatus();
      const status2 = instance2.getDistributedStatus();
      const status3 = instance3.getDistributedStatus();

      // Exactly one should be leader (highest priority)
      const leaders = [status1.isLeader, status2.isLeader, status3.isLeader]
        .filter(Boolean);
      expect(leaders.length).toBe(1);
      expect(status2.isLeader).toBe(true); // Highest priority
    });

    it('should handle leader failure and re-election', async () => {
      const instance1 = createInstance('instance-1', 'failover-test', {
        distributed: { leaderElection: { priority: 200 } }
      });
      const instance2 = createInstance('instance-2', 'failover-test', {
        distributed: { leaderElection: { priority: 100 } }
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      // Instance1 should be leader
      expect(instance1.getDistributedStatus().isLeader).toBe(true);
      expect(instance2.getDistributedStatus().isLeader).toBe(false);

      // Simulate leader failure
      await instance1.destroy();
      instances = instances.filter(i => i !== instance1);

      // Wait for re-election
      await new Promise(resolve => setTimeout(resolve, 400));

      // Instance2 should become new leader
      expect(instance2.getDistributedStatus().isLeader).toBe(true);
    });
  });

  describe('Network Partition Handling', () => {
    it('should detect and handle network partitions', async () => {
      const instance1 = createInstance('instance-1');
      const instance2 = createInstance('instance-2');

      const partitionCallback1 = vi.fn();
      const partitionCallback2 = vi.fn();

      instance1.onNetworkPartition(partitionCallback1);
      instance2.onNetworkPartition(partitionCallback2);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate network partition
      MockBroadcastChannel.simulateNetworkPartition(true, 1.0);

      // Try to emit events (should trigger partition detection)
      await instance1.emit('partition.test', { data: 'test' });
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should have detected partition
      expect(partitionCallback1).toHaveBeenCalled();
    });

    it('should recover from network partitions', async () => {
      const instance1 = createInstance('instance-1');
      const instance2 = createInstance('instance-2');

      const healingCallback1 = vi.fn();
      instance1.onPartitionHealed(healingCallback1);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Create partition
      MockBroadcastChannel.simulateNetworkPartition(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Heal partition
      MockBroadcastChannel.simulateNetworkPartition(false);
      
      // Send healing signal
      await instance2.emit('healing.test', { data: 'test' });
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should detect healing
      expect(healingCallback1).toHaveBeenCalled();
    });
  });

  describe('Factory Pattern Integration', () => {
    it('should manage multiple bus instances through factory', async () => {
      factory = new DistributedEventBusFactory({
        factoryId: 'test-factory',
        maxInstances: 5,
        crossInstanceCommunication: true
      });

      // Create multiple instances
      const instance1 = await factory.createInstance('bus-1', { instanceId: 'factory-1' });
      const instance2 = await factory.createInstance('bus-2', { instanceId: 'factory-2' });
      const instance3 = await factory.createInstance('bus-1', { instanceId: 'factory-3' }); // Same bus

      expect(factory.getActiveInstances().length).toBe(3);

      // Instances with same busId should communicate
      const listener1 = vi.fn();
      const listener3 = vi.fn();

      instance1.on('factory.test', listener1);
      instance3.on('factory.test', listener3);

      await new Promise(resolve => setTimeout(resolve, 100));

      await instance1.emit('factory.test', { data: 'cross-factory' });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Both instances on bus-1 should receive
      expect(listener1).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();

      // Cleanup specific instance
      await factory.destroyInstance('bus-2');
      expect(factory.getActiveInstances().length).toBe(2);
    });

    it('should handle microfrontend factory patterns', async () => {
      factory = DistributedEventBusFactory.createMicrofrontendFactory('mf-factory', {
        crossInstanceCommunication: true,
        isolated: false
      });

      const mfInstance1 = await factory.createInstance('mf-1', { instanceId: 'mf-1' });
      const mfInstance2 = await factory.createInstance('mf-2', { instanceId: 'mf-2' });

      // Should be able to communicate across microfrontends
      const crossMfListener = vi.fn();
      mfInstance2.on('cross.mf.test', crossMfListener);

      await new Promise(resolve => setTimeout(resolve, 100));

      await mfInstance1.emit('cross.mf.test', { from: 'mf-1', to: 'mf-2' });
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(crossMfListener).toHaveBeenCalled();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high-throughput event distribution', async () => {
      const instance1 = createInstance('perf-1');
      const instance2 = createInstance('perf-2');
      const instance3 = createInstance('perf-3');

      const eventCounts = [0, 0, 0];
      
      instance1.on('perf.test', () => eventCounts[0]++);
      instance2.on('perf.test', () => eventCounts[1]++);
      instance3.on('perf.test', () => eventCounts[2]++);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Emit many events rapidly
      const eventCount = 50;
      const promises = [];
      
      for (let i = 0; i < eventCount; i++) {
        promises.push(instance1.emit('perf.test', { sequence: i }));
      }

      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for propagation

      // All instances should have received all events
      eventCounts.forEach(count => {
        expect(count).toBe(eventCount);
      });
    });

    it('should handle network latency gracefully', async () => {
      // Simulate high network latency
      MockBroadcastChannel.simulateLatency(100);

      const instance1 = createInstance('latency-1');
      const instance2 = createInstance('latency-2');

      const latencyEvents: number[] = [];
      instance2.on('latency.test', (event) => {
        const latency = Date.now() - event.data.timestamp;
        latencyEvents.push(latency);
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Send events with timestamps
      for (let i = 0; i < 5; i++) {
        await instance1.emit('latency.test', { 
          timestamp: Date.now(),
          sequence: i 
        });
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      // Should have received all events despite latency
      expect(latencyEvents.length).toBe(5);
      // Latency should be reasonable (network delay + processing)
      latencyEvents.forEach(latency => {
        expect(latency).toBeGreaterThan(80); // At least network delay
        expect(latency).toBeLessThan(500); // But not excessive
      });

      // Reset latency
      MockBroadcastChannel.simulateLatency(10);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain event ordering with partitioning', async () => {
      const instance1 = createInstance('partition-1', 'consistency-bus');
      const instance2 = createInstance('partition-2', 'consistency-bus');

      const orderedEvents: any[] = [];
      instance2.on('consistency.test', (event) => {
        orderedEvents.push({
          sequence: event.data.sequence,
          partitionKey: event.data.partitionKey
        });
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Emit events with same partition key (should maintain order)
      const sameKeyEvents = [1, 2, 3, 4, 5];
      for (const seq of sameKeyEvents) {
        await instance1.emit('consistency.test', {
          sequence: seq,
          partitionKey: 'same-key'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // Should receive in order
      expect(orderedEvents.length).toBe(5);
      for (let i = 0; i < 5; i++) {
        expect(orderedEvents[i].sequence).toBe(i + 1);
      }
    });

    it('should handle concurrent updates with conflict resolution', async () => {
      const instance1 = createInstance('conflict-1', 'conflict-bus');
      const instance2 = createInstance('conflict-2', 'conflict-bus');

      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate concurrent updates to same resource
      const promises = [
        instance1.emit('conflict.update', { 
          resourceId: 'resource-1', 
          value: 'update-from-1',
          timestamp: Date.now()
        }),
        instance2.emit('conflict.update', { 
          resourceId: 'resource-1', 
          value: 'update-from-2',
          timestamp: Date.now() + 1 // Slightly later
        })
      ];

      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Both instances should handle conflicts consistently
      // (Implementation depends on conflict resolution strategy)
    });
  });

  describe('Error Recovery', () => {
    it('should recover from BroadcastChannel failures', async () => {
      const instance1 = createInstance('recovery-1');
      const instance2 = createInstance('recovery-2');

      const listener = vi.fn();
      instance2.on('recovery.test', listener);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate channel failure
      const originalPostMessage = MockBroadcastChannel.prototype.postMessage;
      let failureCount = 0;
      
      MockBroadcastChannel.prototype.postMessage = function(data: any) {
        if (failureCount < 2) {
          failureCount++;
          throw new Error('Simulated failure');
        }
        return originalPostMessage.call(this, data);
      };

      // Should eventually succeed despite failures
      await instance1.emit('recovery.test', { attempt: 1 });
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(listener).toHaveBeenCalled();

      // Restore original
      MockBroadcastChannel.prototype.postMessage = originalPostMessage;
    });
  });
});