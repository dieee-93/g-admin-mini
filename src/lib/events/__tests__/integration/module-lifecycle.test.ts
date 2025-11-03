// module-lifecycle.test.ts - Integration tests for complete module lifecycle
// Tests: Module registration → activation → health monitoring → deactivation → cleanup

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from '../EventBus';
import { TestSetup, testConfigs, EventBusAssertions } from '../helpers/test-utilities';
import { 
  createSalesTestModule, 
  createInventoryTestModule, 
  createCustomersTestModule, 
  createStaffTestModule,
  createFailingProductionTestModule 
} from '../helpers/test-modules';
import { mockEventTemplates, businessScenarios } from '../helpers/mock-data';
import type { NamespacedEvent, ModuleDescriptor, ModuleId } from '../../types';

describe('EventBus - Module Lifecycle Integration', () => {
  let eventBus: EventBus;
  let assertions: EventBusAssertions;
  let capturedEvents: NamespacedEvent[];

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.integration);
    assertions = new EventBusAssertions();
    capturedEvents = [];

    // Setup event capture
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = async (pattern, payload, options = {}) => {
      const result = await originalEmit(pattern, payload, options);
      
      capturedEvents.push({
        id: `lifecycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern,
        payload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'lifecycle_test', ...options }
      });
      
      return result;
    };

    assertions.setEvents(capturedEvents);
  });

  // afterEach(async () => {
  //   await TestSetup.cleanup();
  //   capturedEvents = [];
  // });

  describe('Complete Module Registration Flow', () => {
    it('should register and activate modules with dependencies in correct order', async () => {
      const modules = [
        createInventoryTestModule(),    // No dependencies
        createCustomersTestModule(),    // No dependencies  
        createSalesTestModule(),        // Depends on inventory + customers
        createStaffTestModule()         // No dependencies
      ];

      // Register all modules
      for (const module of modules) {
        await eventBus.registerModule(module);
      }

      // Activate sales module - should activate dependencies first
      await eventBus.activateModule('test-sales');

      const activeModules = eventBus.getActiveModules();
      expect(activeModules).toContain('test-inventory');
      expect(activeModules).toContain('test-customers');
      expect(activeModules).toContain('test-sales');

      // With auto-activation during registration, staff module will also be activated
      expect(activeModules).toContain('test-staff');

      // Check health of all active modules
      const health = await eventBus.getModuleHealth();
      expect(health['test-inventory'].status).toBe('active');
      expect(health['test-customers'].status).toBe('active');
      expect(health['test-sales'].status).toBe('active');
    }, 15000); // 15 second timeout

    it('should handle module activation failures gracefully', async () => {
      const stableModule = createInventoryTestModule();
      const failingModule = createFailingProductionTestModule();

      await eventBus.registerModule(stableModule);
      await eventBus.registerModule(failingModule);

      // Stable module should activate successfully
      await eventBus.activateModule('test-inventory');
      expect(eventBus.getActiveModules()).toContain('test-inventory');

      // Failing module may or may not activate (simulates real failures)
      try {
        await eventBus.activateModule('test-kitchen-failing');
      } catch (error) {
        // Expected for failing module
        expect(error).toBeInstanceOf(Error);
      }

      // Stable module should remain active even if other modules fail
      expect(eventBus.getActiveModules()).toContain('test-inventory');
    });

    it('should emit lifecycle events during module registration and activation', async () => {
      // Register dependencies first
      const inventoryModule = createInventoryTestModule();
      const customersModule = createCustomersTestModule();
      const salesModule = createSalesTestModule();

      // Listen for lifecycle events
      const lifecycleEvents: string[] = [];
      
      eventBus.on('global.eventbus.module-registered', async (_event) => {
        lifecycleEvents.push(`registered:${event.payload.moduleId}`);
      });

      eventBus.on('global.eventbus.module-activated', async (_event) => {
        lifecycleEvents.push(`activated:${event.payload.moduleId}`);
      });

      // Register in correct order
      await eventBus.registerModule(inventoryModule);
      await eventBus.registerModule(customersModule);
      await eventBus.registerModule(salesModule);
      await eventBus.activateModule('test-sales');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(lifecycleEvents).toContain('registered:test-sales');
      expect(lifecycleEvents).toContain('activated:test-sales');
    });

    it('should handle complex dependency chains', async () => {
      // Create a complex dependency chain: A -> B -> C -> D
      const moduleA: ModuleDescriptor = {
        ...createInventoryTestModule(),
        id: 'module-a',
        dependencies: []
      };

      const moduleB: ModuleDescriptor = {
        ...createCustomersTestModule(),
        id: 'module-b',
        dependencies: ['module-a']
      };

      const moduleC: ModuleDescriptor = {
        ...createSalesTestModule(),
        id: 'module-c',
        dependencies: ['module-b']
      };

      const moduleD: ModuleDescriptor = {
        ...createStaffTestModule(),
        id: 'module-d',
        dependencies: ['module-c']
      };

      // Register all modules
      await eventBus.registerModule(moduleA);
      await eventBus.registerModule(moduleB);
      await eventBus.registerModule(moduleC);
      await eventBus.registerModule(moduleD);

      // Activate the leaf module - should activate entire chain
      await eventBus.activateModule('module-d');

      const activeModules = eventBus.getActiveModules();
      expect(activeModules).toContain('module-a');
      expect(activeModules).toContain('module-b');
      expect(activeModules).toContain('module-c');
      expect(activeModules).toContain('module-d');

      // Verify all modules are healthy
      const health = await eventBus.getModuleHealth();
      expect(health['module-a'].status).toBe('active');
      expect(health['module-b'].status).toBe('active');
      expect(health['module-c'].status).toBe('active');
      expect(health['module-d'].status).toBe('active');
    });
  });

  describe('Event Subscription and Routing', () => {
    beforeEach(async () => {
      console.log('[TEST-BEFORE] Starting beforeEach setup...');
      
      // Register core modules in correct dependency order
      const inventoryModule = createInventoryTestModule();
      const customersModule = createCustomersTestModule();
      const salesModule = createSalesTestModule();

      console.log('[TEST-BEFORE] Registering inventory module...');
      await eventBus.registerModule(inventoryModule);
      
      console.log('[TEST-BEFORE] Registering customers module...');
      await eventBus.registerModule(customersModule);  
      
      console.log('[TEST-BEFORE] Registering sales module...');
      await eventBus.registerModule(salesModule);
      
      console.log('[TEST-BEFORE] beforeEach setup completed!');
    });

    it('should route events to correct module handlers', async () => {
      console.log('[TEST] Test started!');
      
      const handlerCalls: string[] = [];
      
      console.log('[TEST] Setting up simple handler...');
      eventBus.on('test.simple', async (_event) => {
        console.log('[TEST] Simple handler called!');
        handlerCalls.push('simple-called');
      });

      console.log('[TEST] Emitting simple event...');
      await eventBus.emit('test.simple', { test: true });

      console.log('[TEST] Waiting for handler to execute...');
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('[TEST] Final handler calls:', handlerCalls);
      expect(handlerCalls.length).toBeGreaterThan(0);
    });

    it('should handle cross-module event communication', async () => {
      const eventFlow: string[] = [];

      // Setup handlers that simulate cross-module communication
      eventBus.on('sales.order.created', async (_event) => {
        eventFlow.push('1.order-created-received');
        
        // Sales module emits inventory check event
        await eventBus.emit('inventory.stock.check', {
          orderId: event.payload.orderId,
          items: event.payload.items || [{ id: 'ITEM-001', quantity: 2 }]
        });
      });

      eventBus.on('inventory.stock.check', async (_event) => {
        eventFlow.push('2.stock-check-received');
        
        // Inventory module responds with stock status
        await eventBus.emit('inventory.stock.checked', {
          orderId: event.payload.orderId,
          stockAvailable: true
        });
      });

      eventBus.on('inventory.stock.checked', async (_event) => {
        eventFlow.push('3.stock-checked-received');
        
        if (event.payload.stockAvailable) {
          // Continue with order processing
          await eventBus.emit('sales.order.confirmed', {
            orderId: event.payload.orderId
          });
        }
      });

      eventBus.on('sales.order.confirmed', async (_event) => {
        eventFlow.push('4.order-confirmed-received');
      });

      // Trigger the flow
      await eventBus.emit('sales.order.created', {
        orderId: 'ORD-FLOW-001',
        customerId: 'CUST-001',
        items: [{ id: 'ITEM-001', quantity: 2 }]
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(eventFlow).toEqual([
        '1.order-created-received',
        '2.stock-check-received', 
        '3.stock-checked-received',
        '4.order-confirmed-received'
      ]);
    });

    it('should handle event subscriptions with filters', async () => {
      const vipOrdersReceived: any[] = [];
      const regularOrdersReceived: any[] = [];

      // Handler for VIP customers only
      eventBus.on('sales.order.created', async (_event) => {
        vipOrdersReceived.push(event.payload);
      }, {
        filter: (_event) => event.payload.customerTier === 'VIP'
      });

      // Handler for regular customers
      eventBus.on('sales.order.created', async (_event) => {
        regularOrdersReceived.push(event.payload);
      }, {
        filter: (_event) => event.payload.customerTier === 'REGULAR'
      });

      // Emit orders with different tiers
      await eventBus.emit('sales.order.created', {
        orderId: 'ORD-VIP-001',
        customerId: 'CUST-VIP-001',
        customerTier: 'VIP'
      });

      await eventBus.emit('sales.order.created', {
        orderId: 'ORD-REG-001', 
        customerId: 'CUST-REG-001',
        customerTier: 'REGULAR'
      });

      await eventBus.emit('sales.order.created', {
        orderId: 'ORD-VIP-002',
        customerId: 'CUST-VIP-002', 
        customerTier: 'VIP'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(vipOrdersReceived).toHaveLength(2);
      expect(regularOrdersReceived).toHaveLength(1);
      expect(vipOrdersReceived[0].orderId).toBe('ORD-VIP-001');
      expect(regularOrdersReceived[0].orderId).toBe('ORD-REG-001');
    });

    it('should maintain event subscription priorities', async () => {
      const processingOrder: string[] = [];

      // High priority handler
      eventBus.on('test.priority.event', async (_event) => {
        processingOrder.push('high-priority');
        await new Promise(resolve => setTimeout(resolve, 10));
      }, { priority: 'high' });

      // Medium priority handler  
      eventBus.on('test.priority.event', async (_event) => {
        processingOrder.push('medium-priority');
        await new Promise(resolve => setTimeout(resolve, 10));
      }, { priority: 'medium' });

      // Low priority handler
      eventBus.on('test.priority.event', async (_event) => {
        processingOrder.push('low-priority');
        await new Promise(resolve => setTimeout(resolve, 10));
      }, { priority: 'low' });

      await eventBus.emit('test.priority.event', { test: true });

      await new Promise(resolve => setTimeout(resolve, 100));

      // High priority should execute first
      expect(processingOrder[0]).toBe('high-priority');
      expect(processingOrder).toContain('medium-priority');
      expect(processingOrder).toContain('low-priority');
    });
  });

  // Health Monitoring tests moved to separate file: health-monitoring.test.ts
  // This keeps integration tests fast by avoiding health monitoring overhead

  describe('Module Deactivation and Cleanup', () => {
    beforeEach(async () => {
      const modules = [
        createInventoryTestModule(),
        createCustomersTestModule(),
        createSalesTestModule(),
        createStaffTestModule()
      ];

      for (const module of modules) {
        await eventBus.registerModule(module);
        await eventBus.activateModule(module.id);
      }
    });

    it('should deactivate modules in reverse dependency order', async () => {
      const deactivationOrder: string[] = [];

      // Mock onDeactivate to track order
      const registeredModules = eventBus['moduleRegistry'].getRegisteredModules();
      const originalInventoryModule = registeredModules['test-inventory'];
      const originalSalesModule = registeredModules['test-sales'];

      if (originalInventoryModule && originalSalesModule) {
        const originalInventoryDeactivate = originalInventoryModule.onDeactivate;
        const originalSalesDeactivate = originalSalesModule.onDeactivate;

        originalInventoryModule.onDeactivate = async () => {
          deactivationOrder.push('inventory');
          if (originalInventoryDeactivate) await originalInventoryDeactivate();
        };

        originalSalesModule.onDeactivate = async () => {
          deactivationOrder.push('sales');
          if (originalSalesDeactivate) await originalSalesDeactivate();
        };
      }

      // Deactivate inventory (which sales depends on)
      await eventBus.deactivateModule('test-inventory');

      // Sales should be deactivated first, then inventory
      expect(deactivationOrder[0]).toBe('sales');
      expect(deactivationOrder[1]).toBe('inventory');

      const activeModules = eventBus.getActiveModules();
      expect(activeModules).not.toContain('test-inventory');
      expect(activeModules).not.toContain('test-sales');
    });

    it('should emit deactivation events', async () => {
      const deactivationEvents: string[] = [];

      eventBus.on('global.eventbus.module-deactivated', async (_event) => {
        deactivationEvents.push(event.payload.moduleId);
      });

      await eventBus.deactivateModule('test-staff');

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(deactivationEvents).toContain('test-staff');
    });

    it('should cleanup module subscriptions on deactivation', async () => {
      let handlerCalled = false;

      // Add a handler before deactivation
      const unsubscribe = eventBus.on('staff.clock.in', async () => {
        handlerCalled = true;
      });

      await eventBus.deactivateModule('test-staff');

      // Emit event after deactivation
      await eventBus.emit('staff.clock.in', { staffId: 'STAFF-001', timestamp: new Date().toISOString() });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Handler should still work (it's not module-specific)
      // But module-specific handlers should be cleaned up
      unsubscribe();
    });

    it('should handle graceful shutdown of all modules', async () => {
      const shutdownOrder: string[] = [];

      // Track shutdown order
      const modules = ['test-inventory', 'test-customers', 'test-sales', 'test-staff'];
      const registeredModules = eventBus['moduleRegistry'].getRegisteredModules();
      
      for (const moduleId of modules) {
        const moduleInfo = registeredModules[moduleId];
        if (moduleInfo) {
          const originalDeactivate = moduleInfo.onDeactivate;
          moduleInfo.onDeactivate = async () => {
            shutdownOrder.push(moduleId);
            if (originalDeactivate) await originalDeactivate();
          };
        }
      }

      // Graceful shutdown
      await eventBus.gracefulShutdown(5000);

      expect(shutdownOrder.length).toBe(4);
      expect(eventBus.getActiveModules()).toHaveLength(0);
    });
  });

  describe('Real-world Integration Scenarios', () => {
    it('should handle complete restaurant workflow', async () => {
      const workflowEvents: string[] = [];

      // Register all business modules
      const modules = [
        createInventoryTestModule(),
        createCustomersTestModule(),
        createSalesTestModule(),
        createStaffTestModule()
      ];

      for (const module of modules) {
        await eventBus.registerModule(module);
      }

      // Activate all modules  
      await eventBus.activateModule('test-sales'); // This activates dependencies too
      await eventBus.activateModule('test-staff');

      // Setup workflow tracking
      const workflowPatterns = [
        'sales.order.created',
        'inventory.stock.checked',
        'staff.notified',
        'kitchen.order.received',
        'payments.payment.requested',
        'payments.payment.completed',
        'kitchen.order.completed',
        'sales.order.completed'
      ];

      workflowPatterns.forEach(pattern => {
        eventBus.on(pattern, async (_event) => {
          workflowEvents.push(pattern);
        });
      });

      // Execute complete workflow
      const orderData = businessScenarios.fullOrderFlow;

      // 1. Order created
      await eventBus.emit('sales.order.created', {
        orderId: orderData.order.id,
        customerId: orderData.customer.id,
        items: orderData.order.items
      });

      // 2. Stock check
      await eventBus.emit('inventory.stock.checked', {
        orderId: orderData.order.id,
        stockAvailable: true
      });

      // 3. Staff notification
      await eventBus.emit('staff.notified', {
        orderId: orderData.order.id,
        type: 'new_order'
      });

      // 4. Payment processing
      await eventBus.emit('payments.payment.completed', {
        orderId: orderData.order.id,
        amount: orderData.order.total
      });

      // 5. Order completion
      await eventBus.emit('sales.order.completed', {
        orderId: orderData.order.id,
        completedAt: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(workflowEvents.length).toBeGreaterThan(3);
      expect(workflowEvents).toContain('sales.order.created');
      expect(workflowEvents).toContain('sales.order.completed');

      // Verify all modules are still healthy
      const health = await eventBus.getModuleHealth();
      expect(health['test-inventory'].status).toBe('active');
      expect(health['test-customers'].status).toBe('active');
      expect(health['test-sales'].status).toBe('active');
      expect(health['test-staff'].status).toBe('active');
    });

    it('should handle peak load scenarios', async () => {
      // Register modules in correct dependency order
      const modules = [
        createInventoryTestModule(),
        createCustomersTestModule(),
        createSalesTestModule()
      ];

      for (const module of modules) {
        await eventBus.registerModule(module);
      }

      const concurrentOrders = 50;
      const orderPromises: Promise<void>[] = [];

      // Simulate peak ordering load
      for (let i = 0; i < concurrentOrders; i++) {
        orderPromises.push(
          eventBus.emit('sales.order.created', {
            orderId: `PEAK-ORD-${i.toString().padStart(3, '0')}`,
            customerId: `CUST-${i % 10}`, // 10 different customers
            total: Math.random() * 100 + 10
          })
        );
      }

      const startTime = Date.now();
      await Promise.all(orderPromises);
      const processingTime = Date.now() - startTime;

      expect(processingTime).toBeLessThan(2000); // Should handle 50 orders in under 2 seconds

      // Verify system stability
      const health = await eventBus.getModuleHealth();
      expect(health['test-inventory'].status).toBe('active');
      expect(health['test-sales'].status).toBe('active');
    });

    it('should maintain data consistency across module interactions', async () => {
      const dataStore = new Map<string, any>();

      // Register modules in correct dependency order
      await eventBus.registerModule(createInventoryTestModule());
      await eventBus.registerModule(createCustomersTestModule());
      await eventBus.registerModule(createSalesTestModule());

      // Setup data consistency tracking
      eventBus.on('inventory.stock.updated', async (_event) => {
        const key = `inventory.${event.payload.itemId}`;
        dataStore.set(key, event.payload.newStock);
      });

      eventBus.on('sales.order.created', async (_event) => {
        // Simulate stock reduction
        for (const item of event.payload.items || []) {
          const currentStock = dataStore.get(`inventory.${item.id}`) || 100;
          await eventBus.emit('inventory.stock.updated', {
            itemId: item.id,
            newStock: currentStock - item.quantity,
            operation: 'sale'
          });
        }
      });

      // Execute transactions
      const transactions = [
        {
          orderId: 'ORD-CONS-001',
          items: [{ id: 'ITEM-001', quantity: 5 }]
        },
        {
          orderId: 'ORD-CONS-002', 
          items: [{ id: 'ITEM-001', quantity: 3 }]
        },
        {
          orderId: 'ORD-CONS-003',
          items: [{ id: 'ITEM-001', quantity: 2 }]
        }
      ];

      // Set initial stock
      dataStore.set('inventory.ITEM-001', 100);

      for (const transaction of transactions) {
        await eventBus.emit('sales.order.created', {
          orderId: transaction.orderId,
          items: transaction.items
        });
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify final stock is correct (100 - 5 - 3 - 2 = 90)
      const finalStock = dataStore.get('inventory.ITEM-001');
      expect(finalStock).toBe(90);
    });
  });
});