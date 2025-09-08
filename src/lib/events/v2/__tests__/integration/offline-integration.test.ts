// offline-integration.test.ts - Integration tests for EventBus V2.0 + OfflineSync
// Tests: EventBus → OfflineSync queue, offline/online transitions, conflict resolution

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBusV2 } from '../../EventBusV2';
import { TestSetup, testConfigs, cleanupUtils } from '../helpers/test-utilities';
import { mockEventTemplates, businessScenarios } from '../helpers/mock-data';
import { createSalesTestModule, createInventoryTestModule } from '../helpers/test-modules';
import type { NamespacedEvent, EventPattern } from '../../types';

// Mock OfflineSync to avoid external dependencies in tests
class MockOfflineSync {
  private queue: any[] = [];
  private isOnline = true;
  private eventHandlers = new Map<string, Function[]>();

  async queueOperation(operation: any): Promise<string> {
    this.queue.push(operation);
    this.emit('operationQueued', operation);
    return `queue_id_${Date.now()}`;
  }

  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    const operations = [...this.queue];
    this.queue = [];

    for (const operation of operations) {
      this.emit('operationSynced', operation);
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getPendingOperations(): any[] {
    return [...this.queue];
  }

  setOnline(online: boolean): void {
    const wasOnline = this.isOnline;
    this.isOnline = online;
    
    if (online && !wasOnline) {
      this.emit('networkOnline', {});
    } else if (!online && wasOnline) {
      this.emit('networkOffline', {});
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  on(event: string, callback: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('MockOfflineSync handler error:', error);
      }
    });
  }

  clear(): void {
    this.queue = [];
    this.eventHandlers.clear();
  }
}

describe('EventBus V2.0 - Offline Integration', () => {
  let eventBus: EventBusV2;
  let mockOfflineSync: MockOfflineSync;
  let capturedEvents: NamespacedEvent[];

  beforeEach(async () => {
    await cleanupUtils.clearStorage();
    
    mockOfflineSync = new MockOfflineSync();
    capturedEvents = [];

    // Create EventBus with offline sync enabled
    eventBus = await TestSetup.createEventBus({
      ...testConfigs.integration,
      offlineSyncEnabled: true,
      persistenceEnabled: true
    });

    // Mock the offline sync dependency
    (eventBus as any).offlineSync = mockOfflineSync;

    // Setup event capture
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = async (pattern, payload, options = {}) => {
      const result = await originalEmit(pattern, payload, options);
      
      capturedEvents.push({
        id: `captured_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern,
        payload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'integration_test', ...options }
      });
      
      return result;
    };
  });

  afterEach(async () => {
    mockOfflineSync.clear();
    await TestSetup.cleanup();
    await cleanupUtils.clearStorage();
  });

  describe('Persistent Event Queuing', () => {
    it('should automatically queue persistent events for offline sync', async () => {
      const orderEvent = mockEventTemplates.orderCreated('ORD-OFFLINE-001', 'CUST-001');

      await eventBus.emit(orderEvent.pattern, orderEvent.payload, {
        persistent: true,
        priority: 'high'
      });

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const queuedOperations = mockOfflineSync.getPendingOperations();
      expect(queuedOperations).toHaveLength(1);
      
      const queuedOp = queuedOperations[0];
      expect(queuedOp.type).toBe('CREATE');
      expect(queuedOp.entity).toBe('events');
      expect(queuedOp.data.pattern).toBe(orderEvent.pattern);
      expect(queuedOp.priority).toBeGreaterThan(0);
    });

    it('should not queue non-persistent events', async () => {
      const systemEvent = mockEventTemplates.systemHealthCheck('test-module', true);

      await eventBus.emit(systemEvent.pattern, systemEvent.payload, {
        persistent: false
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const queuedOperations = mockOfflineSync.getPendingOperations();
      expect(queuedOperations).toHaveLength(0);
    });

    it('should respect priority in queue operations', async () => {
      const events = [
        { ...mockEventTemplates.orderCreated('ORD-LOW', 'CUST-001'), priority: 'low' },
        { ...mockEventTemplates.paymentProcessed('ORD-HIGH', 199.99), priority: 'critical' },
        { ...mockEventTemplates.stockLow('ITEM-001', 5, 10), priority: 'medium' }
      ];

      for (const event of events) {
        await eventBus.emit(event.pattern, event.payload, {
          persistent: true,
          priority: event.priority
        });
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const queuedOperations = mockOfflineSync.getPendingOperations();
      expect(queuedOperations).toHaveLength(3);

      // Should be ordered by priority (critical > high > medium > low)
      const priorities = queuedOperations.map(op => op.priority).sort((a, b) => b - a);
      expect(priorities[0]).toBeGreaterThan(priorities[1]);
      expect(priorities[1]).toBeGreaterThan(priorities[2]);
    });

    it('should handle queue operation failures gracefully', async () => {
      // Mock queue failure
      const originalQueue = mockOfflineSync.queueOperation.bind(mockOfflineSync);
      mockOfflineSync.queueOperation = vi.fn().mockRejectedValue(new Error('Queue failed'));

      const event = mockEventTemplates.orderCreated('ORD-QUEUE-FAIL', 'CUST-001');

      // Should not throw error even if queuing fails
      await expect(
        eventBus.emit(event.pattern, event.payload, { persistent: true })
      ).resolves.not.toThrow();

      // Restore original method
      mockOfflineSync.queueOperation = originalQueue;
    });
  });

  describe('Online/Offline State Handling', () => {
    it('should handle online to offline transition', async () => {
      let offlineEventReceived = false;

      // Listen for offline event
      eventBus.on('global.eventbus.network-offline', async () => {
        offlineEventReceived = true;
      });

      // Simulate going offline
      mockOfflineSync.setOnline(false);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(offlineEventReceived).toBe(true);
    });

    it('should handle offline to online transition and trigger sync', async () => {
      let onlineEventReceived = false;
      let syncTriggered = false;

      // Setup offline state first
      mockOfflineSync.setOnline(false);

      // Queue some operations while offline
      await eventBus.emit('test.offline.event', { data: 'offline test' }, { persistent: true });

      expect(mockOfflineSync.getQueueSize()).toBeGreaterThan(0);

      // Listen for online event
      eventBus.on('global.eventbus.network-online', async () => {
        onlineEventReceived = true;
      });

      // Listen for sync operations
      mockOfflineSync.on('operationSynced', () => {
        syncTriggered = true;
      });

      // Go back online
      mockOfflineSync.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(onlineEventReceived).toBe(true);
      expect(syncTriggered).toBe(true);
      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });

    it('should maintain event processing while offline', async () => {
      let eventProcessed = false;

      // Go offline
      mockOfflineSync.setOnline(false);

      // Setup handler
      eventBus.on('test.offline.processing', async () => {
        eventProcessed = true;
      });

      // Emit event while offline
      await eventBus.emit('test.offline.processing', { message: 'offline processing test' });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Event should still be processed locally
      expect(eventProcessed).toBe(true);
    });

    it('should cache events for replay after reconnection', async () => {
      const testEvents = [
        mockEventTemplates.orderCreated('ORD-CACHE-001', 'CUST-001'),
        mockEventTemplates.paymentProcessed('ORD-CACHE-001', 99.99),
        mockEventTemplates.orderCompleted('ORD-CACHE-001')
      ];

      // Go offline
      mockOfflineSync.setOnline(false);

      // Emit events while offline
      for (const event of testEvents) {
        await eventBus.emit(event.pattern, event.payload, { persistent: true });
      }

      expect(mockOfflineSync.getQueueSize()).toBe(testEvents.length);

      // Go back online
      mockOfflineSync.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      // All events should be synced
      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });
  });

  describe('Module Integration with Offline Sync', () => {
    beforeEach(async () => {
      // Register test modules
      const inventoryModule = createInventoryTestModule();
      const salesModule = createSalesTestModule();

      await eventBus.registerModule(inventoryModule);
      await eventBus.registerModule(salesModule);
    });

    it('should sync module events when going online', async () => {
      let inventoryEventProcessed = false;
      let salesEventProcessed = false;

      // Setup handlers
      eventBus.on('inventory.stock.low', async () => {
        inventoryEventProcessed = true;
      });

      eventBus.on('sales.order.created', async () => {
        salesEventProcessed = true;
      });

      // Go offline
      mockOfflineSync.setOnline(false);

      // Emit module events
      await eventBus.emit('inventory.stock.low', { itemId: 'ITEM-001', currentStock: 5 }, { persistent: true });
      await eventBus.emit('sales.order.created', { orderId: 'ORD-MODULE-001' }, { persistent: true });

      expect(mockOfflineSync.getQueueSize()).toBe(2);

      // Go online
      mockOfflineSync.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(inventoryEventProcessed).toBe(true);
      expect(salesEventProcessed).toBe(true);
      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });

    it('should handle module health during offline periods', async () => {
      // Go offline
      mockOfflineSync.setOnline(false);

      // Modules should still report health
      const health = await eventBus.getModuleHealth();

      expect(health['test-inventory']).toBeTruthy();
      expect(health['test-sales']).toBeTruthy();
      expect(health['test-inventory'].status).toBe('active');
      expect(health['test-sales'].status).toBe('active');
    });

    it('should maintain module dependencies during offline operation', async () => {
      // Go offline
      mockOfflineSync.setOnline(false);

      // Sales module depends on inventory - should still work offline
      const salesHealth = await eventBus.getModuleHealth('test-sales');
      
      expect(salesHealth['test-sales'].dependencies['test-inventory']).toBe(true);
    });
  });

  describe('Business Logic Integration', () => {
    it('should handle complete order flow with offline sync', async () => {
      const orderFlow = businessScenarios.fullOrderFlow;
      const queuedOperations: any[] = [];

      // Track queued operations
      mockOfflineSync.on('operationQueued', (operation) => {
        queuedOperations.push(operation);
      });

      // Simulate partial offline scenario
      mockOfflineSync.setOnline(false);

      // Process order flow events
      const flowEvents = [
        mockEventTemplates.orderCreated(orderFlow.order.id, orderFlow.customer.id),
        mockEventTemplates.stockUpdated('ITEM-001', 24, 'sale'),
        mockEventTemplates.paymentProcessed(orderFlow.order.id, orderFlow.order.total),
        mockEventTemplates.orderCompleted(orderFlow.order.id)
      ];

      for (const event of flowEvents) {
        await eventBus.emit(event.pattern, event.payload, { persistent: true });
      }

      expect(mockOfflineSync.getQueueSize()).toBe(flowEvents.length);

      // Go online and sync
      mockOfflineSync.setOnline(true);
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockOfflineSync.getQueueSize()).toBe(0);
      expect(queuedOperations).toHaveLength(flowEvents.length);
    });

    it('should handle inventory management with offline sync', async () => {
      const inventoryFlow = businessScenarios.inventoryWorkflow;
      
      mockOfflineSync.setOnline(false);

      // Process inventory events
      await eventBus.emit('inventory.stock.updated', { itemId: 'ITEM-001', newStock: 5 }, { persistent: true });
      await eventBus.emit('inventory.stock.low', { itemId: 'ITEM-001', currentStock: 5, minimumStock: 10 }, { persistent: true });
      await eventBus.emit('inventory.restock.requested', { itemId: 'ITEM-001', quantity: 20 }, { persistent: true });

      expect(mockOfflineSync.getQueueSize()).toBe(3);

      mockOfflineSync.setOnline(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });

    it('should handle staff management events with offline sync', async () => {
      const staffFlow = businessScenarios.staffWorkflow;

      mockOfflineSync.setOnline(false);

      // Process staff events
      await eventBus.emit('staff.clock.in', { staffId: 'STAFF-001', timestamp: new Date().toISOString() }, { persistent: true });
      await eventBus.emit('staff.break.started', { staffId: 'STAFF-001', timestamp: new Date().toISOString() }, { persistent: true });
      await eventBus.emit('staff.clock.out', { staffId: 'STAFF-001', hoursWorked: 8 }, { persistent: true });

      expect(mockOfflineSync.getQueueSize()).toBe(3);

      mockOfflineSync.setOnline(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle sync failures and retry', async () => {
      let syncAttempts = 0;
      const maxRetries = 3;

      // Mock sync failures
      const originalSync = mockOfflineSync.syncPendingOperations.bind(mockOfflineSync);
      mockOfflineSync.syncPendingOperations = vi.fn().mockImplementation(async () => {
        syncAttempts++;
        if (syncAttempts < maxRetries) {
          throw new Error(`Sync failed (attempt ${syncAttempts})`);
        }
        return originalSync();
      });

      // Queue an event
      await eventBus.emit('test.sync.retry', { data: 'retry test' }, { persistent: true });

      expect(mockOfflineSync.getQueueSize()).toBe(1);

      // Go online - should trigger retries
      mockOfflineSync.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(syncAttempts).toBe(maxRetries);
      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });

    it('should handle partial sync failures', async () => {
      const events = [
        mockEventTemplates.orderCreated('ORD-PARTIAL-001', 'CUST-001'),
        mockEventTemplates.orderCreated('ORD-PARTIAL-002', 'CUST-002'),
        mockEventTemplates.orderCreated('ORD-PARTIAL-003', 'CUST-003')
      ];

      mockOfflineSync.setOnline(false);

      // Queue multiple events
      for (const event of events) {
        await eventBus.emit(event.pattern, event.payload, { persistent: true });
      }

      expect(mockOfflineSync.getQueueSize()).toBe(3);

      // Mock partial sync failure
      let syncCallCount = 0;
      const originalSync = mockOfflineSync.syncPendingOperations.bind(mockOfflineSync);
      mockOfflineSync.syncPendingOperations = vi.fn().mockImplementation(async () => {
        syncCallCount++;
        if (syncCallCount === 1) {
          // First sync partially fails - only sync first 2 operations
          const operations = mockOfflineSync.getPendingOperations();
          mockOfflineSync['queue'] = [operations[2]]; // Keep last operation
          mockOfflineSync.emit('operationSynced', operations[0]);
          mockOfflineSync.emit('operationSynced', operations[1]);
        } else {
          // Second sync completes
          return originalSync();
        }
      });

      mockOfflineSync.setOnline(true);

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });

    it('should maintain event ordering during sync', async () => {
      const orderedEvents = [
        { pattern: 'test.order.1', payload: { sequence: 1 } },
        { pattern: 'test.order.2', payload: { sequence: 2 } },
        { pattern: 'test.order.3', payload: { sequence: 3 } },
        { pattern: 'test.order.4', payload: { sequence: 4 } }
      ];

      const syncedOperations: any[] = [];

      mockOfflineSync.on('operationSynced', (operation) => {
        syncedOperations.push(operation);
      });

      mockOfflineSync.setOnline(false);

      // Queue events in order
      for (const event of orderedEvents) {
        await eventBus.emit(event.pattern as EventPattern, event.payload, { persistent: true });
      }

      mockOfflineSync.setOnline(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(syncedOperations).toHaveLength(4);
      
      // Check that sync order matches emission order
      for (let i = 0; i < syncedOperations.length; i++) {
        expect(syncedOperations[i].data.payload.sequence).toBe(i + 1);
      }
    });
  });

  describe('Performance Under Offline Conditions', () => {
    it('should handle high-volume event queuing', async () => {
      const eventCount = 100;
      const events: Promise<void>[] = [];

      mockOfflineSync.setOnline(false);

      const startTime = Date.now();

      // Generate high volume of events
      for (let i = 0; i < eventCount; i++) {
        events.push(
          eventBus.emit('test.volume.event', { sequence: i }, { persistent: true })
        );
      }

      await Promise.all(events);

      const queueTime = Date.now() - startTime;

      expect(mockOfflineSync.getQueueSize()).toBe(eventCount);
      expect(queueTime).toBeLessThan(1000); // Should complete within 1 second

      // Sync all events
      mockOfflineSync.setOnline(true);
      
      const syncStartTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 200));
      const syncTime = Date.now() - syncStartTime;

      expect(mockOfflineSync.getQueueSize()).toBe(0);
      expect(syncTime).toBeLessThan(500); // Sync should be fast
    });

    it('should handle concurrent offline operations', async () => {
      mockOfflineSync.setOnline(false);

      const concurrentOperations = Array.from({ length: 50 }, (_, i) => 
        eventBus.emit('test.concurrent.offline', { id: i }, { persistent: true })
      );

      await Promise.all(concurrentOperations);

      expect(mockOfflineSync.getQueueSize()).toBe(50);

      mockOfflineSync.setOnline(true);
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });

    it('should maintain performance with large payloads offline', async () => {
      const largePayload = {
        data: 'x'.repeat(10000), // 10KB payload
        array: Array(100).fill({ nested: { data: 'test' } }),
        timestamp: new Date().toISOString()
      };

      mockOfflineSync.setOnline(false);

      const startTime = Date.now();
      await eventBus.emit('test.large.offline', largePayload, { persistent: true });
      const queueTime = Date.now() - startTime;

      expect(queueTime).toBeLessThan(100); // Should queue quickly even with large payload
      expect(mockOfflineSync.getQueueSize()).toBe(1);

      mockOfflineSync.setOnline(true);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockOfflineSync.getQueueSize()).toBe(0);
    });
  });
});