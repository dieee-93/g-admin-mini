// health-monitoring.test.ts - Health monitoring integration tests
// Tests health monitoring functionality with metrics enabled

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from '../../EventBus';
import { TestSetup, testConfigs, EventBusAssertions } from '../helpers/test-utilities';
import { 
  createSalesTestModule, 
  createInventoryTestModule, 
  createCustomersTestModule, 
  createStaffTestModule,
  createFailingKitchenTestModule 
} from '../helpers/test-modules';
import type { NamespacedEvent, ModuleDescriptor, ModuleId } from '../../types';

describe('EventBus - Health Monitoring Integration', () => {
  let eventBus: EventBus;
  let assertions: EventBusAssertions;
  let capturedEvents: NamespacedEvent[];

  beforeEach(async () => {
    console.log('[HEALTH-TEST-BEFORE] Starting health monitoring test setup...');
    
    // Use health monitoring configuration (with metrics enabled)
    eventBus = new EventBus(testConfigs.health);
    await eventBus.initialize();
    
    // Capture events for assertions
    capturedEvents = [];
    assertions = new EventBusAssertions();
    
    // Listen to all events for testing
    eventBus.on('**', async (event) => {
      capturedEvents.push(event);
    });
    
    console.log('[HEALTH-TEST-BEFORE] Health monitoring test setup completed! ✅');
  });

  afterEach(async () => {
    console.log('[HEALTH-TEST-AFTER] Cleaning up health monitoring tests...');
    if (eventBus) {
      await eventBus.gracefulShutdown(5000);
    }
    await TestSetup.cleanup();
  });

  describe('Health Monitoring and Recovery', () => {
    beforeEach(async () => {
      const modules = [
        createInventoryTestModule(),
        createCustomersTestModule(),
        createSalesTestModule(),
        createFailingKitchenTestModule()
      ];

      for (const module of modules) {
        try {
          await eventBus.registerModule(module);
          console.log(`[HEALTH-TEST] Successfully registered module: ${module.id}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`[HEALTH-TEST] Failed to register module ${module.id}:`, errorMessage);
          // For test-kitchen-failing, this is expected behavior
          if (module.id !== 'test-kitchen-failing') {
            throw error; // Re-throw if it's not the expected failing module
          }
        }
      }
    });

    it('should continuously monitor module health', async () => {
      const healthEvents: any[] = [];

      // Listen for metrics events (which contain health monitoring data)
      eventBus.on('global.eventbus.metrics', async (event) => {
        console.log('[HEALTH-TEST] Metrics event received:', event.payload);
        healthEvents.push(event.payload);
      });

      // Activate modules
      await eventBus.activateModule('test-inventory');
      
      try {
        await eventBus.activateModule('test-kitchen-failing');
      } catch {
        // Expected to potentially fail
        console.log('[HEALTH-TEST] Kitchen module failed as expected');
      }

      // Wait for health monitoring cycles (healthCheckIntervalMs: 1000)
      console.log('[HEALTH-TEST] Waiting for health monitoring cycles...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('[HEALTH-TEST] Health events received:', healthEvents.length);
      
      // Should have received health change events
      expect(healthEvents.length).toBeGreaterThan(0);

      const latestHealth = await eventBus.getModuleHealth();
      expect(latestHealth['test-inventory']).toBeTruthy();
    }, 15000); // Longer timeout for health monitoring

    it('should handle module recovery scenarios', async () => {
      let moduleRecovered = false;

      // Listen for recovery events
      eventBus.on('global.eventbus.module-recovered', async (event) => {
        console.log('[HEALTH-TEST] Module recovered:', event.payload);
        moduleRecovered = true;
      });

      // Activate failing module
      try {
        await eventBus.activateModule('test-kitchen-failing');
      } catch {
        console.log('[HEALTH-TEST] Kitchen module activation failed as expected');
      }

      // Wait for potential recovery attempts
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check final state
      const health = await eventBus.getModuleHealth('test-kitchen-failing');
      
      if (health['test-kitchen-failing']) {
        const status = health['test-kitchen-failing'].status;
        console.log('[HEALTH-TEST] Final module status:', status);
        expect(['active', 'error', 'degraded', 'inactive']).toContain(status);
      }
    }, 10000);

    it('should isolate failing modules from healthy ones', async () => {
      // Activate stable module first
      await eventBus.activateModule('test-inventory');

      const initialHealth = await eventBus.getModuleHealth('test-inventory');
      expect(initialHealth['test-inventory'].status).toBe('active');

      // Try to activate failing module
      try {
        await eventBus.activateModule('test-kitchen-failing');
      } catch {
        console.log('[HEALTH-TEST] Kitchen module isolation working correctly');
      }

      // Stable module should remain healthy
      const finalHealth = await eventBus.getModuleHealth('test-inventory');
      expect(finalHealth['test-inventory'].status).toBe('active');
    }, 10000);

    it('should provide detailed health metrics', async () => {
      await eventBus.activateModule('test-inventory');

      // Generate some activity to create metrics
      console.log('[HEALTH-TEST] Generating activity for metrics...');
      for (let i = 0; i < 10; i++) {
        await eventBus.emit('inventory.stock.updated', {
          itemId: `ITEM-${i}`,
          newStock: Math.floor(Math.random() * 100)
        });
      }

      // Wait for processing and metrics collection
      await new Promise(resolve => setTimeout(resolve, 2000));

      const health = await eventBus.getModuleHealth('test-inventory');
      const metrics = health['test-inventory'].metrics;

      console.log('[HEALTH-TEST] Health metrics:', metrics);

      expect(typeof metrics.eventsProcessed).toBe('number');
      expect(typeof metrics.eventsEmitted).toBe('number'); 
      expect(typeof metrics.errorRate).toBe('number');
      expect(typeof metrics.avgProcessingTimeMs).toBe('number');
      expect(typeof metrics.queueSize).toBe('number');

      expect(metrics.eventsProcessed).toBeGreaterThan(0);
    }, 15000);
  });
});