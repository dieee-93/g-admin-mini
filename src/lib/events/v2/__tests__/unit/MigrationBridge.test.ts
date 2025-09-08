// MigrationBridge.test.ts - Unit tests for V1 to V2 migration functionality
// Tests: V1↔V2 event forwarding, module migration, compatibility layer

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MigrationBridge } from '../../MigrationBridge';
import { EventBusV2 } from '../../EventBusV2';
import { TestSetup, testConfigs } from '../helpers/test-utilities';
import { createSalesTestModule } from '../helpers/test-modules';
import type { EventPattern, NamespacedEvent } from '../../types';

// Mock EventBus V1 interface
class MockEventBusV1 {
  private handlers = new Map<string, Function[]>();
  
  emit(event: string, data: any, source?: string): void {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data, source);
      } catch (error) {
        console.error('Handler error:', error);
      }
    });
  }

  on(event: string, handler: Function): Function {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    
    return () => {
      const handlers = this.handlers.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  off(event: string, handler: Function): void {
    const handlers = this.handlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  // Utility for testing
  getHandlerCount(event: string): number {
    return (this.handlers.get(event) || []).length;
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Mock RestaurantEvents (V1 constants)
const MockRestaurantEvents = {
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_UPDATED: 'ORDER_UPDATED', 
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  SALE_COMPLETED: 'SALE_COMPLETED',
  STOCK_LOW: 'STOCK_LOW',
  STOCK_UPDATED: 'STOCK_UPDATED',
  STAFF_CLOCK_IN: 'STAFF_CLOCK_IN',
  STAFF_CLOCK_OUT: 'STAFF_CLOCK_OUT',
  KITCHEN_ORDER_RECEIVED: 'KITCHEN_ORDER_RECEIVED',
  KITCHEN_ORDER_COMPLETED: 'KITCHEN_ORDER_COMPLETED'
};

describe('MigrationBridge', () => {
  let eventBusV1: MockEventBusV1;
  let eventBusV2: EventBusV2;
  let migrationBridge: MigrationBridge;

  beforeEach(async () => {
    eventBusV1 = new MockEventBusV1();
    eventBusV2 = await TestSetup.createEventBus(testConfigs.unit);
    
    migrationBridge = new MigrationBridge(
      eventBusV1 as any,
      eventBusV2,
      {
        enableLogging: false,
        autoMigrateModules: false,
        bidirectionalSync: true
      }
    );

    await migrationBridge.initialize();
  });

  afterEach(async () => {
    await migrationBridge.cleanup();
    await TestSetup.cleanup();
  });

  describe('Event Mapping', () => {
    it('should map V1 events to V2 patterns', () => {
      const mapping = migrationBridge.getEventMappings();
      
      expect(mapping.get(MockRestaurantEvents.ORDER_PLACED)).toBe('sales.order.placed');
      expect(mapping.get(MockRestaurantEvents.STOCK_LOW)).toBe('inventory.stock.low');
      expect(mapping.get(MockRestaurantEvents.PAYMENT_COMPLETED)).toBe('payments.payment.completed');
      expect(mapping.get(MockRestaurantEvents.STAFF_CLOCK_IN)).toBe('staff.clock.in');
    });

    it('should provide reverse mapping from V2 to V1', () => {
      const reverseMapping = migrationBridge.getReverseEventMappings();
      
      expect(reverseMapping.get('sales.order.placed')).toBe(MockRestaurantEvents.ORDER_PLACED);
      expect(reverseMapping.get('inventory.stock.low')).toBe(MockRestaurantEvents.STOCK_LOW);
      expect(reverseMapping.get('payments.payment.completed')).toBe(MockRestaurantEvents.PAYMENT_COMPLETED);
    });

    it('should handle unmapped events gracefully', () => {
      const unmappedV1Event = 'UNMAPPED_V1_EVENT';
      const unmappedV2Pattern: EventPattern = 'unmapped.v2.pattern';

      // Should not throw errors for unmapped events
      expect(() => {
        migrationBridge.mapV1ToV2(unmappedV1Event);
      }).not.toThrow();

      expect(() => {
        migrationBridge.mapV2ToV1(unmappedV2Pattern);
      }).not.toThrow();
    });
  });

  describe('V1 to V2 Forwarding', () => {
    it('should forward V1 events to V2', async () => {
      let receivedV2Event: NamespacedEvent | null = null;

      // Subscribe to V2 event
      const unsubscribe = eventBusV2.on('sales.order.placed', async (event) => {
        receivedV2Event = event;
      });

      // Emit V1 event
      eventBusV1.emit(MockRestaurantEvents.ORDER_PLACED, {
        orderId: 'ORD-V1-001',
        customerId: 'CUST-001',
        total: 99.99
      }, 'pos_terminal');

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV2Event).toBeTruthy();
      expect(receivedV2Event?.pattern).toBe('sales.order.placed');
      expect(receivedV2Event?.payload.orderId).toBe('ORD-V1-001');
      expect(receivedV2Event?.metadata?.source).toContain('migration_bridge');

      unsubscribe();
    });

    it('should transform V1 payload format to V2', async () => {
      let receivedV2Event: NamespacedEvent | null = null;

      const unsubscribe = eventBusV2.on('inventory.stock.low', async (event) => {
        receivedV2Event = event;
      });

      // Emit V1 stock event with old format
      eventBusV1.emit(MockRestaurantEvents.STOCK_LOW, {
        item_id: 'ITEM-001', // V1 snake_case
        item_name: 'Hamburguesa',
        current_stock: 5,
        minimum_stock: 10
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV2Event).toBeTruthy();
      expect(receivedV2Event?.payload.itemId).toBe('ITEM-001'); // V2 camelCase
      expect(receivedV2Event?.payload.itemName).toBe('Hamburguesa');
      expect(receivedV2Event?.payload.currentStock).toBe(5);
      expect(receivedV2Event?.payload.minimumStock).toBe(10);

      unsubscribe();
    });

    it('should preserve V1 source information', async () => {
      let receivedV2Event: NamespacedEvent | null = null;

      const unsubscribe = eventBusV2.on('staff.clock.in', async (event) => {
        receivedV2Event = event;
      });

      eventBusV1.emit(MockRestaurantEvents.STAFF_CLOCK_IN, {
        staff_id: 'STAFF-001',
        timestamp: new Date().toISOString()
      }, 'time_clock_terminal');

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV2Event?.metadata?.originalSource).toBe('time_clock_terminal');
      expect(receivedV2Event?.metadata?.migrationLayer).toBe('v1_to_v2');

      unsubscribe();
    });

    it('should handle V1 events with missing data', async () => {
      let receivedV2Event: NamespacedEvent | null = null;

      const unsubscribe = eventBusV2.on('sales.order.placed', async (event) => {
        receivedV2Event = event;
      });

      // Emit incomplete V1 event
      eventBusV1.emit(MockRestaurantEvents.ORDER_PLACED, {
        orderId: 'ORD-INCOMPLETE'
        // Missing customerId, total, etc.
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV2Event).toBeTruthy();
      expect(receivedV2Event?.payload.orderId).toBe('ORD-INCOMPLETE');
      // Should handle missing fields gracefully

      unsubscribe();
    });
  });

  describe('V2 to V1 Forwarding', () => {
    it('should forward V2 events to V1', async () => {
      let receivedV1Data: any = null;
      let receivedV1Source: string | undefined;

      // Subscribe to V1 event
      const unsubscribe = eventBusV1.on(MockRestaurantEvents.ORDER_COMPLETED, (data: any, source?: string) => {
        receivedV1Data = data;
        receivedV1Source = source;
      });

      // Emit V2 event
      await eventBusV2.emit('sales.order.completed', {
        orderId: 'ORD-V2-001',
        completedAt: new Date().toISOString(),
        preparationTime: 25
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV1Data).toBeTruthy();
      expect(receivedV1Data.orderId).toBe('ORD-V2-001');
      expect(receivedV1Source).toContain('migration_bridge');

      unsubscribe();
    });

    it('should transform V2 payload format to V1', async () => {
      let receivedV1Data: any = null;

      const unsubscribe = eventBusV1.on(MockRestaurantEvents.STOCK_UPDATED, (data: any) => {
        receivedV1Data = data;
      });

      await eventBusV2.emit('inventory.stock.updated', {
        itemId: 'ITEM-002', // V2 camelCase
        itemName: 'Pizza',
        newStock: 15,
        previousStock: 10,
        operation: 'restock'
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV1Data).toBeTruthy();
      expect(receivedV1Data.item_id).toBe('ITEM-002'); // V1 snake_case
      expect(receivedV1Data.item_name).toBe('Pizza');
      expect(receivedV1Data.new_stock).toBe(15);

      unsubscribe();
    });

    it('should not forward unmapped V2 events', async () => {
      let receivedAnything = false;

      // Subscribe to all V1 events
      Object.values(MockRestaurantEvents).forEach(event => {
        eventBusV1.on(event, () => {
          receivedAnything = true;
        });
      });

      // Emit unmapped V2 event
      await eventBusV2.emit('unmapped.new.feature' as EventPattern, { data: 'test' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedAnything).toBe(false);
    });
  });

  describe('Module Migration', () => {
    it('should migrate simple module from V1 to V2', async () => {
      const v1Handlers = {
        [MockRestaurantEvents.ORDER_PLACED]: vi.fn(),
        [MockRestaurantEvents.PAYMENT_COMPLETED]: vi.fn()
      };

      // Setup V1 handlers
      Object.entries(v1Handlers).forEach(([event, handler]) => {
        eventBusV1.on(event, handler);
      });

      // Migrate to V2
      await migrationBridge.migrateModule('sales-basic', 'Sales Module', v1Handlers);

      // Check that V1 handlers are unregistered
      expect(eventBusV1.getHandlerCount(MockRestaurantEvents.ORDER_PLACED)).toBe(0);
      expect(eventBusV1.getHandlerCount(MockRestaurantEvents.PAYMENT_COMPLETED)).toBe(0);

      // Check that module is registered in V2
      const moduleHealth = await eventBusV2.getModuleHealth('sales-basic');
      expect(moduleHealth['sales-basic']).toBeTruthy();

      // Test that events are handled by new V2 module
      await eventBusV2.emit('sales.order.placed', { orderId: 'ORD-MIGRATED' });
      
      await new Promise(resolve => setTimeout(resolve, 50));

      // Original V1 handlers should not be called
      expect(v1Handlers[MockRestaurantEvents.ORDER_PLACED]).not.toHaveBeenCalled();
    });

    it('should handle migration with dependencies', async () => {
      const inventoryHandlers = {
        [MockRestaurantEvents.STOCK_LOW]: vi.fn()
      };

      const salesHandlers = {
        [MockRestaurantEvents.ORDER_PLACED]: vi.fn(),
        [MockRestaurantEvents.SALE_COMPLETED]: vi.fn()
      };

      // Migrate inventory module first (dependency)
      await migrationBridge.migrateModule('inventory', 'Inventory Module', inventoryHandlers);

      // Migrate sales module with dependency
      await migrationBridge.migrateModule(
        'sales-with-deps', 
        'Sales Module with Dependencies', 
        salesHandlers,
        ['inventory']
      );

      const salesHealth = await eventBusV2.getModuleHealth('sales-with-deps');
      expect(salesHealth['sales-with-deps']).toBeTruthy();

      const inventoryHealth = await eventBusV2.getModuleHealth('inventory');
      expect(inventoryHealth['inventory']).toBeTruthy();
    });

    it('should rollback migration on failure', async () => {
      const originalHandlers = {
        [MockRestaurantEvents.ORDER_PLACED]: vi.fn()
      };

      // Setup original V1 handler
      eventBusV1.on(MockRestaurantEvents.ORDER_PLACED, originalHandlers[MockRestaurantEvents.ORDER_PLACED]);

      // Create a handler that will cause migration to fail
      const failingHandlers = {
        [MockRestaurantEvents.ORDER_PLACED]: vi.fn().mockRejectedValue(new Error('Handler setup failed'))
      };

      // Attempt migration that should fail
      await expect(
        migrationBridge.migrateModule('failing-sales', 'Failing Sales Module', failingHandlers)
      ).rejects.toThrow();

      // V1 handlers should still be active after failed migration
      expect(eventBusV1.getHandlerCount(MockRestaurantEvents.ORDER_PLACED)).toBe(1);

      // V2 module should not be registered
      const moduleHealth = await eventBusV2.getModuleHealth('failing-sales');
      expect(moduleHealth['failing-sales']).toBeFalsy();
    });

    it('should track migration status', () => {
      const status = migrationBridge.getMigrationStatus();

      expect(status).toHaveProperty('migratedModules');
      expect(status).toHaveProperty('bridgeActive');
      expect(status).toHaveProperty('eventMappings');
      expect(status.bridgeActive).toBe(true);
    });
  });

  describe('Compatibility Layer', () => {
    it('should provide V1-compatible API', () => {
      const compatV1 = migrationBridge.getV1CompatibleAPI();

      expect(compatV1).toHaveProperty('emit');
      expect(compatV1).toHaveProperty('on');
      expect(compatV1).toHaveProperty('off');
      expect(typeof compatV1.emit).toBe('function');
      expect(typeof compatV1.on).toBe('function');
      expect(typeof compatV1.off).toBe('function');
    });

    it('should allow gradual migration', async () => {
      let v1HandlerCalled = false;
      let v2HandlerCalled = false;

      // Setup V1 handler
      eventBusV1.on(MockRestaurantEvents.ORDER_PLACED, () => {
        v1HandlerCalled = true;
      });

      // Setup V2 handler
      eventBusV2.on('sales.order.placed', async () => {
        v2HandlerCalled = true;
      });

      // Emit through V1 - both should be called due to bridge
      eventBusV1.emit(MockRestaurantEvents.ORDER_PLACED, { orderId: 'GRADUAL-001' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(v1HandlerCalled).toBe(true);
      expect(v2HandlerCalled).toBe(true);
    });

    it('should provide helper utilities for migration', () => {
      // Test shouldUseV2 helper
      expect(migrationBridge.shouldUseV2('non-migrated-module')).toBe(false);
      
      // Test getCompatibilityMode
      const mode = migrationBridge.getCompatibilityMode();
      expect(['bridged', 'v1_only', 'v2_only']).toContain(mode);
    });
  });

  describe('Error Handling', () => {
    it('should handle V1 to V2 forwarding errors gracefully', async () => {
      const errorSpy = vi.fn();
      
      // Subscribe to error events
      eventBusV2.on('global.eventbus.error', async (event) => {
        errorSpy(event.payload);
      });

      // Create a V2 handler that throws an error
      eventBusV2.on('sales.order.placed', async () => {
        throw new Error('V2 handler error');
      });

      // Emit V1 event that will be forwarded to failing V2 handler
      eventBusV1.emit(MockRestaurantEvents.ORDER_PLACED, { orderId: 'ERROR-001' });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(errorSpy).toHaveBeenCalled();
    });

    it('should handle V2 to V1 forwarding errors gracefully', async () => {
      // Setup V1 handler that throws
      eventBusV1.on(MockRestaurantEvents.ORDER_COMPLETED, () => {
        throw new Error('V1 handler error');
      });

      // Should not crash when V2 event is emitted
      await expect(
        eventBusV2.emit('sales.order.completed', { orderId: 'V1-ERROR-001' })
      ).resolves.not.toThrow();
    });

    it('should handle malformed event data', async () => {
      let receivedV2Event: NamespacedEvent | null = null;

      eventBusV2.on('sales.order.placed', async (event) => {
        receivedV2Event = event;
      });

      // Emit V1 event with malformed data
      eventBusV1.emit(MockRestaurantEvents.ORDER_PLACED, null);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV2Event).toBeTruthy();
      expect(receivedV2Event?.payload).toBeDefined();
    });
  });

  describe('Logging and Debugging', () => {
    it('should provide migration logs when enabled', async () => {
      const loggingBridge = new MigrationBridge(
        eventBusV1 as any,
        eventBusV2,
        { enableLogging: true, autoMigrateModules: false, bidirectionalSync: true }
      );

      await loggingBridge.initialize();

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      try {
        eventBusV1.emit(MockRestaurantEvents.ORDER_PLACED, { orderId: 'LOG-TEST' });
        
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringContaining('[MigrationBridge]')
        );
      } finally {
        logSpy.mockRestore();
        await loggingBridge.cleanup();
      }
    });

    it('should provide detailed migration statistics', () => {
      const stats = migrationBridge.getMigrationStatistics();

      expect(stats).toHaveProperty('v1ToV2EventCount');
      expect(stats).toHaveProperty('v2ToV1EventCount');
      expect(stats).toHaveProperty('migratedModuleCount');
      expect(stats).toHaveProperty('errorCount');
      expect(typeof stats.v1ToV2EventCount).toBe('number');
    });
  });

  describe('Cleanup and Teardown', () => {
    it('should cleanup bridge connections', async () => {
      // Setup some handlers
      eventBusV1.on(MockRestaurantEvents.ORDER_PLACED, vi.fn());
      
      const initialHandlerCount = eventBusV1.getHandlerCount(MockRestaurantEvents.ORDER_PLACED);
      expect(initialHandlerCount).toBeGreaterThan(0);

      await migrationBridge.cleanup();

      // Bridge handlers should be removed
      // Note: User handlers should remain
      const finalHandlerCount = eventBusV1.getHandlerCount(MockRestaurantEvents.ORDER_PLACED);
      expect(finalHandlerCount).toBeLessThan(initialHandlerCount);
    });

    it('should disable forwarding after cleanup', async () => {
      await migrationBridge.cleanup();

      let receivedV2Event = false;
      eventBusV2.on('sales.order.placed', async () => {
        receivedV2Event = true;
      });

      eventBusV1.emit(MockRestaurantEvents.ORDER_PLACED, { orderId: 'AFTER-CLEANUP' });
      
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedV2Event).toBe(false);
    });
  });
});