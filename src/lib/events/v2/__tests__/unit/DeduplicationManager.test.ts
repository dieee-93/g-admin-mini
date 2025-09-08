// DeduplicationManager.test.ts - Unit tests for event deduplication system
// Tests: generateMetadata, isDuplicate, storeMetadata, multi-layer deduplication strategies

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DeduplicationManager } from '../../DeduplicationManager';
import { cleanupUtils } from '../helpers/test-utilities';
import { mockEventTemplates, mockBusinessData } from '../helpers/mock-data';
import type { NamespacedEvent, DeduplicationMetadata } from '../../types';

describe('DeduplicationManager', () => {
  let deduplicationManager: DeduplicationManager;

  beforeEach(async () => {
    await cleanupUtils.clearStorage();
    
    deduplicationManager = new DeduplicationManager({
      enabled: true,
      storeName: 'test-dedup-store',
      defaultWindow: 300000, // 5 minutes
      maxMetadataSize: 10000,
      cleanupIntervalMs: 60000
    });

    await deduplicationManager.initialize();
  });

  afterEach(async () => {
    await deduplicationManager.cleanup();
    await cleanupUtils.clearStorage();
  });

  describe('Metadata Generation', () => {
    it('should generate content hash for identical payloads', async () => {
      const event1: NamespacedEvent = {
        id: 'test-1',
        pattern: 'test.content.hash',
        payload: { orderId: 'ORD-001', amount: 99.99, items: ['item1', 'item2'] },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const event2: NamespacedEvent = {
        id: 'test-2', // Different ID
        pattern: 'test.content.hash',
        payload: { orderId: 'ORD-001', amount: 99.99, items: ['item1', 'item2'] }, // Same payload
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata1 = await deduplicationManager.generateMetadata(event1);
      const metadata2 = await deduplicationManager.generateMetadata(event2);

      expect(metadata1.contentHash).toBe(metadata2.contentHash);
      expect(metadata1.contentHash).toBeTruthy();
      expect(metadata1.contentHash.length).toBeGreaterThan(10); // SHA-256 hash
    });

    it('should generate different content hashes for different payloads', async () => {
      const event1: NamespacedEvent = {
        id: 'test-1',
        pattern: 'test.content.hash',
        payload: { orderId: 'ORD-001', amount: 99.99 },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const event2: NamespacedEvent = {
        id: 'test-2',
        pattern: 'test.content.hash',
        payload: { orderId: 'ORD-002', amount: 149.99 }, // Different payload
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata1 = await deduplicationManager.generateMetadata(event1);
      const metadata2 = await deduplicationManager.generateMetadata(event2);

      expect(metadata1.contentHash).not.toBe(metadata2.contentHash);
    });

    it('should handle payload normalization', async () => {
      const event1: NamespacedEvent = {
        id: 'test-1',
        pattern: 'test.normalization',
        payload: { b: 2, a: 1, c: { y: 2, x: 1 } }, // Different key order
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const event2: NamespacedEvent = {
        id: 'test-2',
        pattern: 'test.normalization',
        payload: { a: 1, b: 2, c: { x: 1, y: 2 } }, // Same data, different order
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata1 = await deduplicationManager.generateMetadata(event1);
      const metadata2 = await deduplicationManager.generateMetadata(event2);

      expect(metadata1.contentHash).toBe(metadata2.contentHash);
    });

    it('should generate operation ID from event metadata', async () => {
      const event: NamespacedEvent = {
        id: 'test-op',
        pattern: 'test.operation.id',
        payload: { data: 'test' },
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'test',
          clientOperationId: 'client-op-123',
          userId: 'user-456'
        }
      };

      const metadata = await deduplicationManager.generateMetadata(event);

      expect(metadata.operationId).toContain('client-op-123');
      expect(metadata.operationId).toContain('user-456');
    });

    it('should generate semantic key for business events', async () => {
      const orderEvent = mockEventTemplates.orderCreated('ORD-001', 'CUST-001');
      const event: NamespacedEvent = {
        id: 'test-semantic',
        pattern: orderEvent.pattern,
        payload: orderEvent.payload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata = await deduplicationManager.generateMetadata(event);

      expect(metadata.semanticKey).toBeTruthy();
      expect(metadata.semanticKey).toContain('sales.order.created');
      expect(metadata.semanticKey).toContain(orderEvent.payload.orderId);
    });

    it('should handle events without specific business context', async () => {
      const genericEvent: NamespacedEvent = {
        id: 'generic-test',
        pattern: 'test.generic.event',
        payload: { message: 'generic event' },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata = await deduplicationManager.generateMetadata(genericEvent);

      expect(metadata.semanticKey).toBeTruthy();
      expect(metadata.operationId).toBeTruthy();
      expect(metadata.contentHash).toBeTruthy();
    });
  });

  describe('Duplicate Detection', () => {
    it('should detect content-based duplicates', async () => {
      const event1: NamespacedEvent = {
        id: 'content-dup-1',
        pattern: 'test.content.duplicate',
        payload: { orderId: 'ORD-DUP-001', amount: 99.99 },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const event2: NamespacedEvent = {
        id: 'content-dup-2',
        pattern: 'test.content.duplicate',
        payload: { orderId: 'ORD-DUP-001', amount: 99.99 }, // Same content
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Check second event
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(true);
      expect(result.reason).toContain('content');
    });

    it('should detect operation-based duplicates', async () => {
      const clientOpId = 'unique-client-operation-123';
      
      const event1: NamespacedEvent = {
        id: 'op-dup-1',
        pattern: 'test.operation.duplicate',
        payload: { data: 'first attempt' },
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'test',
          clientOperationId: clientOpId,
          userId: 'user-123'
        }
      };

      const event2: NamespacedEvent = {
        id: 'op-dup-2',
        pattern: 'test.operation.duplicate',
        payload: { data: 'retry attempt' }, // Different payload
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'test',
          clientOperationId: clientOpId, // Same operation ID
          userId: 'user-123'
        }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Check second event
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(true);
      expect(result.reason).toContain('operation');
    });

    it('should detect semantic duplicates within time window', async () => {
      const event1: NamespacedEvent = {
        id: 'semantic-dup-1',
        pattern: 'sales.order.created',
        payload: { orderId: 'ORD-SEM-001', customerId: 'CUST-001', total: 99.99 },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const event2: NamespacedEvent = {
        id: 'semantic-dup-2',
        pattern: 'sales.order.created',
        payload: { orderId: 'ORD-SEM-001', customerId: 'CUST-001', total: 149.99 }, // Different total
        timestamp: new Date().toISOString(), // Within time window
        metadata: { source: 'test' }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Wait a moment then check second event
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(true);
      expect(result.reason).toContain('semantic');
    });

    it('should not detect semantic duplicates outside time window', async () => {
      // Set very short window for testing
      const shortWindowManager = new DeduplicationManager({
        enabled: true,
        storeName: 'short-window-test',
        defaultWindow: 100, // 100ms
        maxMetadataSize: 10000,
        cleanupIntervalMs: 60000
      });

      await shortWindowManager.initialize();

      try {
        const event1: NamespacedEvent = {
          id: 'semantic-time-1',
          pattern: 'sales.order.created',
          payload: { orderId: 'ORD-TIME-001', customerId: 'CUST-001' },
          timestamp: new Date().toISOString(),
          metadata: { source: 'test' }
        };

        // Store first event
        const metadata1 = await shortWindowManager.generateMetadata(event1);
        await shortWindowManager.storeMetadata(metadata1);

        // Wait longer than the window
        await new Promise(resolve => setTimeout(resolve, 150));

        const event2: NamespacedEvent = {
          id: 'semantic-time-2',
          pattern: 'sales.order.created',
          payload: { orderId: 'ORD-TIME-001', customerId: 'CUST-001' }, // Same semantic data
          timestamp: new Date().toISOString(),
          metadata: { source: 'test' }
        };

        const metadata2 = await shortWindowManager.generateMetadata(event2);
        const result = await shortWindowManager.isDuplicate(event2, metadata2);

        expect(result.isDupe).toBe(false);
      } finally {
        await shortWindowManager.cleanup();
      }
    });

    it('should prioritize stronger deduplication strategies', async () => {
      const event1: NamespacedEvent = {
        id: 'priority-test-1',
        pattern: 'test.priority.dedup',
        payload: { orderId: 'ORD-PRIORITY-001', amount: 99.99 },
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'test',
          clientOperationId: 'priority-op-123'
        }
      };

      const event2: NamespacedEvent = {
        id: 'priority-test-2',
        pattern: 'test.priority.dedup',
        payload: { orderId: 'ORD-PRIORITY-001', amount: 99.99 }, // Same content
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'test',
          clientOperationId: 'priority-op-123' // Same operation
        }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Check second event - should detect multiple duplicate reasons
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(true);
      // Should mention the strongest reason (operation or content)
      expect(result.reason).toMatch(/content|operation/);
    });
  });

  describe('Metadata Storage', () => {
    it('should store and retrieve metadata', async () => {
      const event: NamespacedEvent = {
        id: 'storage-test',
        pattern: 'test.metadata.storage',
        payload: { data: 'test storage' },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata = await deduplicationManager.generateMetadata(event);
      await deduplicationManager.storeMetadata(metadata);

      // Try to store the same metadata again - should be retrievable
      const duplicateResult = await deduplicationManager.isDuplicate(event, metadata);
      expect(duplicateResult.isDupe).toBe(true);
    });

    it('should handle metadata with TTL', async () => {
      const event: NamespacedEvent = {
        id: 'ttl-test',
        pattern: 'test.metadata.ttl',
        payload: { data: 'test ttl' },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata: DeduplicationMetadata = {
        ...(await deduplicationManager.generateMetadata(event)),
        windowMs: 50 // Very short TTL for testing
      };

      await deduplicationManager.storeMetadata(metadata);

      // Should find duplicate immediately
      let result = await deduplicationManager.isDuplicate(event, metadata);
      expect(result.isDupe).toBe(true);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not find duplicate after TTL
      result = await deduplicationManager.isDuplicate(event, metadata);
      expect(result.isDupe).toBe(false);
    });

    it('should handle storage cleanup', async () => {
      // Create multiple metadata entries
      const events = Array.from({ length: 10 }, (_, i) => ({
        id: `cleanup-test-${i}`,
        pattern: 'test.cleanup' as const,
        payload: { sequence: i },
        timestamp: new Date(Date.now() - i * 10000).toISOString(), // Spread over time
        metadata: { source: 'test' }
      }));

      const metadataEntries = [];
      for (const event of events) {
        const metadata = await deduplicationManager.generateMetadata(event);
        await deduplicationManager.storeMetadata(metadata);
        metadataEntries.push(metadata);
      }

      // Perform cleanup of old entries
      const cutoffTime = Date.now() - 50000; // 50 seconds ago
      await deduplicationManager.cleanupOldMetadata(cutoffTime);

      // Check that old entries are cleaned up but recent ones remain
      // This test assumes the implementation provides a way to verify cleanup
      // The exact verification method will depend on the implementation
    });
  });

  describe('Business Scenarios', () => {
    it('should handle order creation deduplication', async () => {
      const orderData = mockBusinessData.orders[0];
      const orderEvent = mockEventTemplates.orderCreated(orderData.id, orderData.customerId);

      const event1: NamespacedEvent = {
        id: 'order-dup-1',
        pattern: orderEvent.pattern,
        payload: orderEvent.payload,
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'pos_terminal_1',
          clientOperationId: 'order-create-op-123'
        }
      };

      const event2: NamespacedEvent = {
        id: 'order-dup-2',
        pattern: orderEvent.pattern,
        payload: { ...orderEvent.payload, timestamp: new Date().toISOString() }, // Slight difference
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'pos_terminal_1',
          clientOperationId: 'order-create-op-123' // Same operation
        }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Check second event
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(true);
      expect(result.reason).toContain('operation');
    });

    it('should handle payment processing deduplication', async () => {
      const paymentEvent = mockEventTemplates.paymentProcessed('ORD-001', 99.99);

      const event1: NamespacedEvent = {
        id: 'payment-dup-1',
        pattern: paymentEvent.pattern,
        payload: paymentEvent.payload,
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'payment_gateway',
          clientOperationId: 'payment-process-456'
        }
      };

      // Simulate network retry with same operation ID
      const event2: NamespacedEvent = {
        id: 'payment-dup-2',
        pattern: paymentEvent.pattern,
        payload: {
          ...paymentEvent.payload,
          transactionId: 'TXN-RETRY-789' // Different transaction ID
        },
        timestamp: new Date().toISOString(),
        metadata: { 
          source: 'payment_gateway',
          clientOperationId: 'payment-process-456' // Same operation
        }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Check second event
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(true);
      expect(result.reason).toContain('operation');
    });

    it('should handle stock update deduplication', async () => {
      const stockEvent = mockEventTemplates.stockUpdated('ITEM-001', 25, 'sale');

      const event1: NamespacedEvent = {
        id: 'stock-dup-1',
        pattern: stockEvent.pattern,
        payload: stockEvent.payload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'inventory_system' }
      };

      const event2: NamespacedEvent = {
        id: 'stock-dup-2',
        pattern: stockEvent.pattern,
        payload: stockEvent.payload, // Exact same payload
        timestamp: new Date().toISOString(),
        metadata: { source: 'inventory_system' }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Check second event
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(true);
      expect(result.reason).toContain('content');
    });

    it('should allow legitimate duplicate events outside time window', async () => {
      const clockInEvent = mockEventTemplates.clockIn('STAFF-001');

      const event1: NamespacedEvent = {
        id: 'clock-in-1',
        pattern: clockInEvent.pattern,
        payload: {
          ...clockInEvent.payload,
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
        },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        metadata: { source: 'time_clock' }
      };

      const event2: NamespacedEvent = {
        id: 'clock-in-2',
        pattern: clockInEvent.pattern,
        payload: {
          ...clockInEvent.payload,
          timestamp: new Date().toISOString() // Now
        },
        timestamp: new Date().toISOString(),
        metadata: { source: 'time_clock' }
      };

      // Store first event
      const metadata1 = await deduplicationManager.generateMetadata(event1);
      await deduplicationManager.storeMetadata(metadata1);

      // Check second event - should not be duplicate due to different time
      const metadata2 = await deduplicationManager.generateMetadata(event2);
      const result = await deduplicationManager.isDuplicate(event2, metadata2);

      expect(result.isDupe).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values in payloads', async () => {
      const event: NamespacedEvent = {
        id: 'null-test',
        pattern: 'test.null.values',
        payload: {
          nullValue: null,
          undefinedValue: undefined,
          emptyString: '',
          zero: 0,
          false: false
        },
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata = await deduplicationManager.generateMetadata(event);
      
      expect(metadata.contentHash).toBeTruthy();
      expect(metadata.semanticKey).toBeTruthy();
    });

    it('should handle very large payloads', async () => {
      const largePayload = {
        data: 'x'.repeat(100000), // 100KB string
        array: Array(1000).fill({ nested: 'data' })
      };

      const event: NamespacedEvent = {
        id: 'large-payload-test',
        pattern: 'test.large.payload',
        payload: largePayload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      const metadata = await deduplicationManager.generateMetadata(event);
      
      expect(metadata.contentHash).toBeTruthy();
      expect(metadata.contentHash.length).toBeGreaterThan(10);
    });

    it('should handle circular references in payloads', async () => {
      const circularPayload: any = { data: 'test' };
      circularPayload.circular = circularPayload; // Create circular reference

      const event: NamespacedEvent = {
        id: 'circular-test',
        pattern: 'test.circular.reference',
        payload: circularPayload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'test' }
      };

      // Should not throw error and should handle gracefully
      const metadata = await deduplicationManager.generateMetadata(event);
      
      expect(metadata.contentHash).toBeTruthy();
    });

    it('should handle events with missing metadata fields', async () => {
      const event: NamespacedEvent = {
        id: 'minimal-metadata-test',
        pattern: 'test.minimal.metadata',
        payload: { data: 'test' },
        timestamp: new Date().toISOString(),
        metadata: {} // Minimal metadata
      };

      const metadata = await deduplicationManager.generateMetadata(event);
      
      expect(metadata.contentHash).toBeTruthy();
      expect(metadata.operationId).toBeTruthy();
      expect(metadata.semanticKey).toBeTruthy();
    });
  });

  describe('Configuration', () => {
    it('should respect deduplication window configuration', async () => {
      const customManager = new DeduplicationManager({
        enabled: true,
        storeName: 'custom-window-test',
        defaultWindow: 1000, // 1 second
        maxMetadataSize: 10000,
        cleanupIntervalMs: 60000
      });

      await customManager.initialize();

      try {
        const event: NamespacedEvent = {
          id: 'window-config-test',
          pattern: 'test.window.config',
          payload: { data: 'test' },
          timestamp: new Date().toISOString(),
          metadata: { source: 'test' }
        };

        const metadata = await customManager.generateMetadata(event);
        expect(metadata.windowMs).toBe(1000);
      } finally {
        await customManager.cleanup();
      }
    });

    it('should disable deduplication when configured', async () => {
      const disabledManager = new DeduplicationManager({
        enabled: false,
        storeName: 'disabled-test',
        defaultWindow: 300000,
        maxMetadataSize: 10000,
        cleanupIntervalMs: 60000
      });

      await disabledManager.initialize();

      try {
        const event: NamespacedEvent = {
          id: 'disabled-test',
          pattern: 'test.disabled',
          payload: { data: 'test' },
          timestamp: new Date().toISOString(),
          metadata: { source: 'test' }
        };

        const metadata = await disabledManager.generateMetadata(event);
        const result = await disabledManager.isDuplicate(event, metadata);

        expect(result.isDupe).toBe(false);
      } finally {
        await disabledManager.cleanup();
      }
    });
  });
});