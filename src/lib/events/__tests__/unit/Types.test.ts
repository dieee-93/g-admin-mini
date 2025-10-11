// TypesV3.test.ts - Tests for modern TypeScript patterns
// Validates branded types, template literals, and compile-time safety

import { describe, it, expect } from 'vitest';
import {
  createEventId,
  createSubscriptionId,
  createTraceId,
  createSpanId,
  createModuleId,
  createInstanceId,
  isEventId,
  isSubscriptionId,
  isTraceId,
  isSpanId,
  isValidEventPattern,
  type EventId,
  type SubscriptionId,
  type TraceId,
  type SpanId,
  type ModuleId,
  type InstanceId,
  type EventPattern,
  type EventPayload,
  type ExtractModule,
  type ExtractEntity,
  type ExtractAction,
  type TypedEvent,
  type TypedEventHandler
} from '../../types';

describe('Modern TypeScript Types V3', () => {
  describe('Branded Type Constructors', () => {
    it('should create valid EventId', () => {
      const eventId = createEventId('evt_1234567890_abc123');
      expect(eventId).toBe('evt_1234567890_abc123');
      expect(isEventId(eventId)).toBe(true);
    });

    it('should reject invalid EventId format', () => {
      expect(() => createEventId('invalid_id')).toThrow('EventId must start with "evt_"');
      expect(() => createEventId('')).toThrow('EventId must start with "evt_"');
      expect(() => createEventId('event_123')).toThrow('EventId must start with "evt_"');
    });

    it('should create valid SubscriptionId', () => {
      const subId = createSubscriptionId('sub_1234567890_abc123');
      expect(subId).toBe('sub_1234567890_abc123');
      expect(isSubscriptionId(subId)).toBe(true);
    });

    it('should reject invalid SubscriptionId format', () => {
      expect(() => createSubscriptionId('invalid_id')).toThrow('SubscriptionId must start with "sub_"');
      expect(() => createSubscriptionId('subscription_123')).toThrow('SubscriptionId must start with "sub_"');
    });

    it('should create valid TraceId', () => {
      const traceId = createTraceId('trace_1234567890_abc123');
      expect(traceId).toBe('trace_1234567890_abc123');
      expect(isTraceId(traceId)).toBe(true);
    });

    it('should reject invalid TraceId format', () => {
      expect(() => createTraceId('invalid_id')).toThrow('TraceId must start with "trace_"');
      expect(() => createTraceId('tr_123')).toThrow('TraceId must start with "trace_"');
    });

    it('should create valid SpanId', () => {
      const spanId = createSpanId('span_abc123');
      expect(spanId).toBe('span_abc123');
      expect(isSpanId(spanId)).toBe(true);
    });

    it('should reject invalid SpanId format', () => {
      expect(() => createSpanId('invalid_id')).toThrow('SpanId must start with "span_"');
      expect(() => createSpanId('sp_123')).toThrow('SpanId must start with "span_"');
    });

    it('should create valid ModuleId', () => {
      const moduleId = createModuleId('sales-module');
      expect(moduleId).toBe('sales-module');
    });

    it('should reject invalid ModuleId format', () => {
      expect(() => createModuleId('Sales-Module')).toThrow('ModuleId must be lowercase alphanumeric with hyphens');
      expect(() => createModuleId('sales_module')).toThrow('ModuleId must be lowercase alphanumeric with hyphens');
      expect(() => createModuleId('sales.module')).toThrow('ModuleId must be lowercase alphanumeric with hyphens');
      expect(() => createModuleId('')).toThrow('ModuleId must be lowercase alphanumeric with hyphens');
    });

    it('should create valid InstanceId', () => {
      const instanceId = createInstanceId('sales-app-1');
      expect(instanceId).toBe('sales-app-1');
    });

    it('should reject invalid InstanceId format', () => {
      expect(() => createInstanceId('')).toThrow('InstanceId must be at least 3 characters');
      expect(() => createInstanceId('ab')).toThrow('InstanceId must be at least 3 characters');
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify EventId', () => {
      expect(isEventId('evt_123')).toBe(true);
      expect(isEventId('event_123')).toBe(false);
      expect(isEventId('123')).toBe(false);
      expect(isEventId(null)).toBe(false);
      expect(isEventId(undefined)).toBe(false);
      expect(isEventId(123)).toBe(false);
    });

    it('should correctly identify SubscriptionId', () => {
      expect(isSubscriptionId('sub_123')).toBe(true);
      expect(isSubscriptionId('subscription_123')).toBe(false);
      expect(isSubscriptionId('evt_123')).toBe(false);
      expect(isSubscriptionId(null)).toBe(false);
    });

    it('should correctly identify TraceId', () => {
      expect(isTraceId('trace_123')).toBe(true);
      expect(isTraceId('tr_123')).toBe(false);
      expect(isTraceId('evt_123')).toBe(false);
      expect(isTraceId(null)).toBe(false);
    });

    it('should correctly identify SpanId', () => {
      expect(isSpanId('span_123')).toBe(true);
      expect(isSpanId('sp_123')).toBe(false);
      expect(isSpanId('trace_123')).toBe(false);
      expect(isSpanId(null)).toBe(false);
    });
  });

  describe('Event Pattern Validation', () => {
    it('should validate correct event patterns', () => {
      // Valid module.entity.action patterns
      expect(isValidEventPattern('sales.order.created')).toBe(true);
      expect(isValidEventPattern('inventory.stock.updated')).toBe(true);
      expect(isValidEventPattern('customers.profile.deleted')).toBe(true);
      expect(isValidEventPattern('kitchen.order.started')).toBe(true);
      expect(isValidEventPattern('staff.employee.activated')).toBe(true);
      expect(isValidEventPattern('scheduling.task.completed')).toBe(true);
      expect(isValidEventPattern('fiscal.receipt.created')).toBe(true);
      expect(isValidEventPattern('operations.process.failed')).toBe(true);
      expect(isValidEventPattern('global.system.updated')).toBe(true);
    });

    it('should validate wildcard patterns', () => {
      // Valid wildcard patterns
      expect(isValidEventPattern('sales.order.*')).toBe(true);
      expect(isValidEventPattern('inventory.stock.*')).toBe(true);
      expect(isValidEventPattern('sales.*')).toBe(true);
      expect(isValidEventPattern('global.*')).toBe(true);
    });

    it('should reject invalid event patterns', () => {
      // Invalid module names
      expect(isValidEventPattern('invalid.order.created')).toBe(false);
      expect(isValidEventPattern('unknown.entity.action')).toBe(false);
      
      // Invalid format
      expect(isValidEventPattern('sales')).toBe(false);
      expect(isValidEventPattern('sales.order')).toBe(false);
      expect(isValidEventPattern('sales.order.created.extra')).toBe(false);
      expect(isValidEventPattern('')).toBe(false);
      
      // Invalid characters
      expect(isValidEventPattern('sales.Order.created')).toBe(false); // Capital letter
      expect(isValidEventPattern('sales.order.Created')).toBe(false); // Capital letter
      expect(isValidEventPattern('sales.order.invalid-action')).toBe(false); // Invalid action
      
      // Non-string values
      expect(isValidEventPattern(null)).toBe(false);
      expect(isValidEventPattern(undefined)).toBe(false);
      expect(isValidEventPattern(123)).toBe(false);
      expect(isValidEventPattern({})).toBe(false);
    });
  });

  describe('Template Literal Type Extraction', () => {
    it('should extract module names correctly', () => {
      // Type-level tests - these verify compilation
      type SalesModule = ExtractModule<'sales.order.created'>;
      type InventoryModule = ExtractModule<'inventory.stock.updated'>;
      type GlobalModule = ExtractModule<'global.system.started'>;
      
      // Runtime validation would require actual implementation
      // These are compile-time only validations
      const salesModule: SalesModule = 'sales' as const;
      const inventoryModule: InventoryModule = 'inventory' as const;
      const globalModule: GlobalModule = 'global' as const;
      
      expect(salesModule).toBe('sales');
      expect(inventoryModule).toBe('inventory');
      expect(globalModule).toBe('global');
    });

    it('should extract entity names correctly', () => {
      // Type-level tests
      type OrderEntity = ExtractEntity<'sales.order.created'>;
      type StockEntity = ExtractEntity<'inventory.stock.updated'>;
      type ProfileEntity = ExtractEntity<'customers.profile.deleted'>;
      
      const orderEntity: OrderEntity = 'order' as const;
      const stockEntity: StockEntity = 'stock' as const;
      const profileEntity: ProfileEntity = 'profile' as const;
      
      expect(orderEntity).toBe('order');
      expect(stockEntity).toBe('stock');
      expect(profileEntity).toBe('profile');
    });

    it('should extract action names correctly', () => {
      // Type-level tests
      type CreatedAction = ExtractAction<'sales.order.created'>;
      type UpdatedAction = ExtractAction<'inventory.stock.updated'>;
      type DeletedAction = ExtractAction<'customers.profile.deleted'>;
      type WildcardAction = ExtractAction<'sales.*'>;
      
      const createdAction: CreatedAction = 'created' as const;
      const updatedAction: UpdatedAction = 'updated' as const;
      const deletedAction: DeletedAction = 'deleted' as const;
      const wildcardAction: WildcardAction = '*' as const;
      
      expect(createdAction).toBe('created');
      expect(updatedAction).toBe('updated');
      expect(deletedAction).toBe('deleted');
      expect(wildcardAction).toBe('*');
    });
  });

  describe('Payload Type Safety', () => {
    it('should enforce correct payload types for sales events', () => {
      // Type-level validation - these should compile correctly
      const salesOrderEvent: TypedEvent<'sales.order.created'> = {
        id: createEventId('evt_123'),
        pattern: 'sales.order.created',
        payload: {
          orderId: 'ORD-123',
          customerId: 'CUST-456',
          items: [
            { itemId: 'ITEM-1', quantity: 2, price: 10.99 }
          ],
          total: 21.98,
          status: 'pending'
        },
        timestamp: new Date(),
        metadata: {
          instanceId: createInstanceId('test-instance'),
          source: 'test',
          version: '1.0.0',
          tracing: {
            traceId: createTraceId('trace_123'),
            spanId: createSpanId('span_123')
          }
        }
      };
      
      expect(salesOrderEvent.payload.orderId).toBe('ORD-123');
      expect(salesOrderEvent.payload.total).toBe(21.98);
      expect(salesOrderEvent.payload.items).toHaveLength(1);
    });

    it('should enforce correct payload types for inventory events', () => {
      const inventoryStockEvent: TypedEvent<'inventory.stock.updated'> = {
        id: createEventId('evt_456'),
        pattern: 'inventory.stock.updated',
        payload: {
          itemId: 'ITEM-123',
          previousStock: 50,
          newStock: 45,
          adjustment: -5,
          reason: 'sale',
          location: 'main-warehouse'
        },
        timestamp: new Date(),
        metadata: {
          instanceId: createInstanceId('test-instance'),
          source: 'inventory-service',
          version: '1.0.0',
          tracing: {
            traceId: createTraceId('trace_456'),
            spanId: createSpanId('span_456')
          }
        }
      };
      
      expect(inventoryStockEvent.payload.adjustment).toBe(-5);
      expect(inventoryStockEvent.payload.reason).toBe('sale');
    });

    it('should allow wildcard payload types', () => {
      const wildcardEvent: TypedEvent<'sales.*'> = {
        id: createEventId('evt_789'),
        pattern: 'sales.*',
        payload: {
          // Wildcard allows any payload structure
          customField: 'any value',
          anotherField: 123,
          nested: {
            data: true
          }
        },
        timestamp: new Date(),
        metadata: {
          instanceId: createInstanceId('test-instance'),
          source: 'wildcard-test',
          version: '1.0.0',
          tracing: {
            traceId: createTraceId('trace_789'),
            spanId: createSpanId('span_789')
          }
        }
      };
      
      expect(wildcardEvent.payload.customField).toBe('any value');
      expect(wildcardEvent.payload.nested.data).toBe(true);
    });
  });

  describe('Branded Types Isolation', () => {
    it('should prevent mixing different branded types', () => {
      const eventId = createEventId('evt_123');
      const subscriptionId = createSubscriptionId('sub_456');
      
      // These should be different types at compile time
      expect(eventId).not.toBe(subscriptionId);
      
      // Type guards should work correctly
      expect(isEventId(eventId)).toBe(true);
      expect(isEventId(subscriptionId)).toBe(false);
      expect(isSubscriptionId(subscriptionId)).toBe(true);
      expect(isSubscriptionId(eventId)).toBe(false);
    });

    it('should maintain type safety in function parameters', () => {
      // Helper function that only accepts EventId
      const processEvent = (id: EventId): string => {
        return `Processing event: ${id}`;
      };
      
      const validEventId = createEventId('evt_test');
      const result = processEvent(validEventId);
      
      expect(result).toBe('Processing event: evt_test');
      
      // This would cause a TypeScript compilation error:
      // const subscriptionId = createSubscriptionId('sub_test');
      // processEvent(subscriptionId); // ❌ Type error
    });
  });

  describe('Advanced Type Patterns', () => {
    it('should support complex event pattern matching', () => {
      // These patterns should all be valid at compile time
      const patterns: EventPattern[] = [
        'sales.order.created',
        'sales.payment.completed',
        'inventory.stock.updated',
        'customers.profile.created',
        'kitchen.order.started',
        'staff.shift.completed',
        'scheduling.task.created',
        'fiscal.receipt.created',
        'operations.process.started',
        'global.system.updated',
        'sales.*',
        'inventory.*',
        'global.*'
      ];
      
      patterns.forEach(pattern => {
        expect(isValidEventPattern(pattern)).toBe(true);
      });
    });

    it('should provide type-safe event handlers', () => {
      // Type-safe event handler for specific pattern
      const salesOrderHandler: TypedEventHandler<'sales.order.created'> = (_event) => {
        // TypeScript knows the exact payload structure
        expect(event.payload.orderId).toBeDefined();
        expect(event.payload.customerId).toBeDefined();
        expect(event.payload.items).toBeInstanceOf(Array);
        expect(typeof event.payload.total).toBe('number');
      };
      
      // This validates that the type system works correctly
      expect(typeof salesOrderHandler).toBe('function');
    });
  });
});