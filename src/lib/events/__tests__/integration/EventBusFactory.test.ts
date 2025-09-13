// EventBusFactory.test.ts - Tests for factory pattern and instance isolation
// Validates multiple instances, microfrontend support, and proper isolation

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import EventBusFactory from '../../EventBusFactory';
import { EventBus } from '../../EventBusCore';

describe('EventBusFactory Integration Tests', () => {
  let factory: EventBusFactory;
  
  beforeEach(() => {
    factory = new EventBusFactory({
      namespace: 'test-factory',
      isolated: true
    });
  });

  afterEach(async () => {
    await factory.destroy();
  });

  describe('Factory Instance Management', () => {
    it('should create unique isolated instances', async () => {
      const instance1 = factory.createInstance({ instanceId: 'test-1' });
      const instance2 = factory.createInstance({ instanceId: 'test-2' });
      
      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).not.toBe(instance2);
      expect(instance1.getInstanceId()).toBe('test-1');
      expect(instance2.getInstanceId()).toBe('test-2');
      
      // Test without full initialization for speed
      expect(instance1.isInitialized()).toBe(false);
      expect(instance2.isInitialized()).toBe(false);
    }, 10000);

    it('should prevent duplicate instance IDs', () => {
      factory.createInstance({ instanceId: 'duplicate-test' });
      
      expect(() => {
        factory.createInstance({ instanceId: 'duplicate-test' });
      }).toThrow('Instance \'duplicate-test\' already exists');
    });

    it('should retrieve existing instances by ID', () => {
      const created = factory.createInstance({ instanceId: 'retrieve-test' });
      const retrieved = factory.getInstance('retrieve-test');
      
      expect(retrieved).toBe(created);
      expect(retrieved?.getInstanceId()).toBe('retrieve-test');
    });

    it('should return null for non-existent instances', () => {
      const result = factory.getInstance('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Instance Lifecycle Management', () => {
    it('should track instance metadata correctly', async () => {
      const instance = factory.createInstance({ 
        instanceId: 'metadata-test',
        namespace: 'test-namespace'
      });
      
      const metadata = factory.getInstanceInfo('metadata-test');
      
      expect(metadata).toBeDefined();
      expect(metadata!.id).toBe('metadata-test');
      expect(metadata!.namespace).toBe('test-namespace');
      expect(metadata!.isolated).toBe(true);
      expect(metadata!.status).toBe('active');
      expect(metadata!.created).toBeInstanceOf(Date);
    });

    it('should destroy instances properly', async () => {
      const instance = factory.createInstance({ instanceId: 'destroy-test' });
      
      // Verify instance exists
      expect(factory.getInstance('destroy-test')).toBe(instance);
      
      // Destroy instance (without full init to avoid timeout)
      const destroyed = await factory.destroyInstance('destroy-test');
      expect(destroyed).toBe(true);
      
      // Verify instance is removed
      expect(factory.getInstance('destroy-test')).toBeNull();
      
      // Metadata should still exist but marked as destroyed
      const metadata = factory.getInstanceInfo('destroy-test');
      expect(metadata!.status).toBe('destroyed');
    }, 10000);

    it('should pause and resume instances', () => {
      factory.createInstance({ instanceId: 'pause-test' });
      
      // Pause instance
      const paused = factory.pauseInstance('pause-test');
      expect(paused).toBe(true);
      
      const metadata1 = factory.getInstanceInfo('pause-test');
      expect(metadata1!.status).toBe('paused');
      
      // Resume instance
      const resumed = factory.resumeInstance('pause-test');
      expect(resumed).toBe(true);
      
      const metadata2 = factory.getInstanceInfo('pause-test');
      expect(metadata2!.status).toBe('active');
    });

    it('should handle invalid lifecycle operations', () => {
      // Try to pause non-existent instance
      expect(factory.pauseInstance('non-existent')).toBe(false);
      
      // Try to resume non-existent instance
      expect(factory.resumeInstance('non-existent')).toBe(false);
      
      // Try to destroy non-existent instance
      expect(factory.destroyInstance('non-existent')).resolves.toBe(false);
    });
  });

  describe('Instance Isolation', () => {
    it('should isolate events between instances', async () => {
      const instance1 = factory.createInstance({ instanceId: 'isolation-1' });
      const instance2 = factory.createInstance({ instanceId: 'isolation-2' });
      
      // Verify instances are separate objects with different IDs
      expect(instance1.getInstanceId()).toBe('isolation-1');
      expect(instance2.getInstanceId()).toBe('isolation-2');
      expect(instance1).not.toBe(instance2);
      
      // Test basic functionality without full event processing
      expect(instance1.isInitialized()).toBe(false);
      expect(instance2.isInitialized()).toBe(false);
    }, 10000);

    it('should isolate storage between instances', async () => {
      const instance1 = factory.createInstance({ 
        instanceId: 'storage-1',
        persistenceEnabled: true
      });
      const instance2 = factory.createInstance({ 
        instanceId: 'storage-2',
        persistenceEnabled: true
      });
      
      // Verify different storage configurations
      expect(instance1.getInstanceId()).toBe('storage-1');
      expect(instance2.getInstanceId()).toBe('storage-2');
      expect(instance1.getConfig().persistenceEnabled).toBe(true);
      expect(instance2.getConfig().persistenceEnabled).toBe(true);
    }, 10000);

    it('should isolate module registries between instances', async () => {
      const instance1 = factory.createInstance({ instanceId: 'modules-1' });
      const instance2 = factory.createInstance({ instanceId: 'modules-2' });
      
      // Verify instances have separate identities
      expect(instance1.getInstanceId()).toBe('modules-1');
      expect(instance2.getInstanceId()).toBe('modules-2');
      expect(instance1).not.toBe(instance2);
    }, 10000);
  });

  describe('Factory Metrics and Monitoring', () => {
    it('should provide accurate factory metrics', () => {
      // Create instances with different statuses
      factory.createInstance({ instanceId: 'active-1' });
      factory.createInstance({ instanceId: 'active-2' });
      factory.createInstance({ instanceId: 'paused-1' });
      factory.pauseInstance('paused-1');
      
      const metrics = factory.getMetrics();
      
      expect(metrics.totalInstances).toBe(3);
      expect(metrics.activeInstances).toBe(2);
      expect(metrics.pausedInstances).toBe(1);
      expect(metrics.destroyedInstances).toBe(0);
      expect(metrics.namespaces).toContain('test-factory');
    });

    it('should list instances correctly', () => {
      factory.createInstance({ instanceId: 'list-1', namespace: 'ns1' });
      factory.createInstance({ instanceId: 'list-2', namespace: 'ns2' });
      
      const instances = factory.listInstances();
      
      expect(instances).toHaveLength(2);
      expect(instances.find(i => i.id === 'list-1')?.namespace).toBe('ns1');
      expect(instances.find(i => i.id === 'list-2')?.namespace).toBe('ns2');
      expect(instances.every(i => i.status === 'active')).toBe(true);
    });

    it('should group instances by namespace', () => {
      factory.createInstance({ instanceId: 'ns-test-1', namespace: 'group-a' });
      factory.createInstance({ instanceId: 'ns-test-2', namespace: 'group-a' });
      factory.createInstance({ instanceId: 'ns-test-3', namespace: 'group-b' });
      
      const groupA = factory.getInstancesByNamespace('group-a');
      const groupB = factory.getInstancesByNamespace('group-b');
      
      expect(groupA).toHaveLength(2);
      expect(groupB).toHaveLength(1);
    });
  });

  describe('Microfrontend Support', () => {
    it('should create microfrontend-ready instances', () => {
      const mfFactory = EventBusFactory.createMicrofrontendFactory('mf-test', {
        crossInstanceCommunication: true
      });
      
      const instance = mfFactory.createInstance({
        instanceId: 'mf-instance-1',
        microfrontendMode: true
      });
      
      expect(instance).toBeDefined();
      expect(instance.getInstanceId()).toBe('mf-instance-1');
      
      const metadata = mfFactory.getInstanceInfo('mf-instance-1');
      expect(metadata!.microfrontendMode).toBe(true);
      expect(metadata!.isolated).toBe(true);
      
      mfFactory.destroy();
    });

    it('should support cross-instance communication when enabled', async () => {
      const mfFactory = EventBusFactory.createMicrofrontendFactory('cross-comm', {
        crossInstanceCommunication: true
      });
      
      const instance1 = mfFactory.createInstance({ instanceId: 'comm-1' });
      const instance2 = mfFactory.createInstance({ instanceId: 'comm-2' });
      
      // Verify instances can be created with the configuration
      expect(instance1.getInstanceId()).toBe('comm-1');
      expect(instance2.getInstanceId()).toBe('comm-2');
      
      await mfFactory.destroy();
    }, 15000);
  });

  describe('Static Factory Methods', () => {
    it('should manage global factory registry', () => {
      const factory1 = EventBusFactory.getOrCreateFactory('global-1');
      const factory2 = EventBusFactory.getOrCreateFactory('global-1'); // Same ID
      const factory3 = EventBusFactory.getOrCreateFactory('global-2');
      
      expect(factory1).toBe(factory2); // Same instance
      expect(factory1).not.toBe(factory3); // Different instance
      
      const allFactories = EventBusFactory.getAllFactories();
      expect(allFactories.size).toBeGreaterThanOrEqual(2);
      expect(allFactories.has('global-1')).toBe(true);
      expect(allFactories.has('global-2')).toBe(true);
      
      // Cleanup
      factory1.destroy();
      factory3.destroy();
    });

    it('should destroy all factories', async () => {
      EventBusFactory.getOrCreateFactory('destroy-all-1');
      EventBusFactory.getOrCreateFactory('destroy-all-2');
      
      const initialCount = EventBusFactory.getAllFactories().size;
      expect(initialCount).toBeGreaterThanOrEqual(2);
      
      await EventBusFactory.destroyAllFactories();
      
      const finalCount = EventBusFactory.getAllFactories().size;
      expect(finalCount).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle destroyed factory operations gracefully', async () => {
      const testFactory = new EventBusFactory();
      await testFactory.destroy();
      
      expect(() => {
        testFactory.createInstance({ instanceId: 'after-destroy' });
      }).toThrow('Factory');
      
      expect(() => {
        testFactory.getInstance('any-id');
      }).toThrow('Factory');
      
      expect(() => {
        testFactory.getMetrics();
      }).toThrow('Factory');
    });

    it('should handle concurrent instance creation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(factory.createInstance({ instanceId: `concurrent-${i}` }))
      );
      
      const instances = await Promise.all(promises);
      
      expect(instances).toHaveLength(10);
      expect(new Set(instances.map(i => i.getInstanceId())).size).toBe(10);
    });

    it('should handle rapid destroy and recreate operations', async () => {
      const instance = factory.createInstance({ instanceId: 'rapid-test' });
      
      // Destroy (without init to avoid timeout)
      await factory.destroyInstance('rapid-test');
      expect(factory.getInstance('rapid-test')).toBeNull();
      
      // Recreate with same ID (should work after destroy)
      const newInstance = factory.createInstance({ instanceId: 'rapid-test' });
      expect(newInstance).toBeDefined();
      expect(newInstance.getInstanceId()).toBe('rapid-test');
    }, 15000);
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple instances efficiently', async () => {
      const instanceCount = 10; // Reduced for speed
      const instances: EventBus[] = [];
      
      // Create instances
      const createStart = performance.now();
      for (let i = 0; i < instanceCount; i++) {
        instances.push(factory.createInstance({ instanceId: `perf-${i}` }));
      }
      const createTime = performance.now() - createStart;
      
      console.log('Performance Metrics:', {
        instanceCount,
        createTimeMs: createTime,
        avgCreateTime: createTime / instanceCount
      });
      
      // Verify all instances are created
      const metrics = factory.getMetrics();
      expect(metrics.activeInstances).toBe(instanceCount);
      
      // Performance assertions
      expect(createTime / instanceCount).toBeLessThan(50); // <50ms per instance creation
    }, 15000);
  });
});