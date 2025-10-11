// order-lifecycle.test.ts - Business logic tests for complete order workflows
// Tests: Order creation → stock check → payment → kitchen → fulfillment

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../EventBus';
import { TestSetup, testConfigs, EventBusAssertions } from '../helpers/test-utilities';
import { mockBusinessData, businessScenarios, mockEventTemplates } from '../helpers/mock-data';
import { createSalesTestModule, createInventoryTestModule, createCustomersTestModule, createTestEventHandlers } from '../helpers/test-modules';
import type { NamespacedEvent } from '../../types';

describe('EventBus - Order Lifecycle Business Logic', () => {
  let eventBus: EventBus;
  let assertions: EventBusAssertions;
  let capturedEvents: NamespacedEvent[];
  
  // Business state tracking
  const orderStates = new Map<string, any>();
  const inventoryState = new Map<string, number>();
  const customerActivity = new Map<string, any[]>();

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.integration);
    assertions = new EventBusAssertions();
    capturedEvents = [];

    // Setup event capture
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = async (pattern, payload, options = {}) => {
      const result = await originalEmit(pattern, payload, options);
      
      capturedEvents.push({
        id: `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern,
        payload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'business_test', ...options }
      });
      
      return result;
    };

    assertions.setEvents(capturedEvents);

    // Register all test handlers
    const handlers = createTestEventHandlers();
    for (const [handlerName, handler] of handlers.entries()) {
      eventBus.registerHandler(handlerName, handler);
    }

    // Register business modules
    const modules = [
      createInventoryTestModule(),
      createCustomersTestModule(),
      createSalesTestModule()
    ];

    for (const module of modules) {
      await eventBus.registerModule(module);
    }

    // Initialize business state
    orderStates.clear();
    inventoryState.clear();
    customerActivity.clear();

    // Setup initial inventory
    mockBusinessData.inventory.forEach(item => {
      inventoryState.set(item.id, item.currentStock);
    });
  });

  afterEach(async () => {
    await TestSetup.cleanup();
    capturedEvents = [];
  });

  describe('Complete Order Processing Flow', () => {
    it('should process a successful order from creation to fulfillment', async () => {
      const orderData = mockBusinessData.orders[0];
      const customer = mockBusinessData.customers[0];
      const workflowEvents: string[] = [];
      
      // Track stock reservations per order
      const stockReservations = new Map<string, string[]>();

      // Setup business logic handlers
      
      // 1. Order Created → Stock Check
      eventBus.on('sales.order.created', async (_event) => {
        workflowEvents.push('order-created');
        const order = event.payload;
        
        orderStates.set(order.orderId, {
          ...order,
          status: 'created',
          createdAt: new Date().toISOString()
        });

        // Initialize stock reservations tracking
        stockReservations.set(order.orderId, []);

        // Check stock for each item
        for (const item of order.items || []) {
          await eventBus.emit('inventory.stock.check', {
            orderId: order.orderId,
            itemId: item.id,
            requiredQuantity: item.quantity
          });
        }
      });

      // 2. Stock Check → Stock Reserved
      eventBus.on('inventory.stock.check', async (_event) => {
        workflowEvents.push('stock-check');
        const { orderId, itemId, requiredQuantity } = event.payload;
        const currentStock = inventoryState.get(itemId) || 0;

        if (currentStock >= requiredQuantity) {
          // Reserve stock
          inventoryState.set(itemId, currentStock - requiredQuantity);
          
          await eventBus.emit('inventory.stock.reserved', {
            orderId,
            itemId,
            quantity: requiredQuantity,
            remainingStock: currentStock - requiredQuantity
          });
        } else {
          await eventBus.emit('inventory.stock.insufficient', {
            orderId,
            itemId,
            required: requiredQuantity,
            available: currentStock
          });
        }
      });

      // 3. Stock Reserved → Payment Request
      eventBus.on('inventory.stock.reserved', async (_event) => {
        workflowEvents.push('stock-reserved');
        const order = orderStates.get(event.payload.orderId);
        
        if (order) {
          
          // Track this reservation
          const reservations = stockReservations.get(order.orderId) || [];
          reservations.push(event.payload.itemId);
          stockReservations.set(order.orderId, reservations);


          // Check if all items are reserved
          if (reservations.length === (order.items?.length || 0)) {
            await eventBus.emit('payments.payment.requested', {
              orderId: order.orderId,
              customerId: order.customerId,
              amount: order.total,
              method: 'card'
            });
          }
        }
      });

      // 4. Payment Request → Payment Processing
      eventBus.on('payments.payment.requested', async (_event) => {
        workflowEvents.push('payment-requested');
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 50));
        
        await eventBus.emit('payments.payment.processed', {
          orderId: event.payload.orderId,
          amount: event.payload.amount,
          method: event.payload.method,
          transactionId: `TXN-${Date.now()}`,
          status: 'completed'
        });
      });

      // 5. Payment Processed → Kitchen Order
      eventBus.on('payments.payment.processed', async (_event) => {
        workflowEvents.push('payment-processed');
        
        await eventBus.emit('kitchen.order.received', {
          orderId: event.payload.orderId,
          priority: 'normal',
          estimatedTime: 20,
          items: orderStates.get(event.payload.orderId)?.items || []
        });
      });

      // 6. Kitchen Order → Order Completion
      eventBus.on('kitchen.order.received', async (_event) => {
        workflowEvents.push('kitchen-received');
        
        // Simulate kitchen preparation
        await new Promise(resolve => setTimeout(resolve, 30));
        
        await eventBus.emit('kitchen.order.completed', {
          orderId: event.payload.orderId,
          actualTime: 18,
          quality: 'good'
        });
      });

      // 7. Kitchen Completed → Order Fulfilled
      eventBus.on('kitchen.order.completed', async (_event) => {
        workflowEvents.push('kitchen-completed');
        
        const order = orderStates.get(event.payload.orderId);
        if (order) {
          order.status = 'fulfilled';
          order.fulfilledAt = new Date().toISOString();
          
          await eventBus.emit('sales.order.fulfilled', {
            orderId: event.payload.orderId,
            fulfilledAt: order.fulfilledAt,
            totalTime: 25
          });
        }
      });

      // 8. Order Fulfilled → Customer Notification
      eventBus.on('sales.order.fulfilled', async (_event) => {
        workflowEvents.push('order-fulfilled');
        
        const order = orderStates.get(event.payload.orderId);
        if (order) {
          // Track customer activity
          const activity = customerActivity.get(order.customerId) || [];
          activity.push({
            type: 'order_fulfilled',
            orderId: order.orderId,
            timestamp: new Date().toISOString()
          });
          customerActivity.set(order.customerId, activity);

          await eventBus.emit('customers.notification.sent', {
            customerId: order.customerId,
            orderId: order.orderId,
            type: 'order_ready',
            message: 'Your order is ready for pickup!'
          });
        }
      });

      // Final step - Customer Notification
      eventBus.on('customers.notification.sent', async (_event) => {
        workflowEvents.push('customer-notified');
      });

      // Execute the workflow
      await eventBus.emit('sales.order.created', {
        orderId: orderData.id,
        customerId: customer.id,
        items: orderData.items,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod
      });

      // Wait for complete workflow
      await new Promise(resolve => setTimeout(resolve, 1000));


      // Verify complete workflow execution
      const expectedFlow = [
        'order-created',
        'stock-check',
        'stock-reserved', 
        'payment-requested',
        'payment-processed',
        'kitchen-received',
        'kitchen-completed',
        'order-fulfilled',
        'customer-notified'
      ];

      expectedFlow.forEach(step => {
        expect(workflowEvents).toContain(step);
      });

      // Verify business state
      const finalOrder = orderStates.get(orderData.id);
      expect(finalOrder.status).toBe('fulfilled');
      expect(finalOrder.fulfilledAt).toBeTruthy();

      // Verify inventory was updated
      const burgerStock = inventoryState.get('ITEM-001');
      expect(burgerStock).toBeLessThan(mockBusinessData.inventory[0].currentStock);

      // Verify customer activity
      const customerActions = customerActivity.get(customer.id);
      expect(customerActions).toBeTruthy();
      expect(customerActions[0].type).toBe('order_fulfilled');

      console.log(`Complete order workflow executed: ${workflowEvents.join(' → ')}`);
    });

    it('should handle order cancellation workflow', async () => {
      const orderData = mockBusinessData.orders[0];
      const cancellationEvents: string[] = [];

      // Setup cancellation handlers
      eventBus.on('sales.order.created', async (_event) => {
        orderStates.set(event.payload.orderId, {
          ...event.payload,
          status: 'created'
        });
      });

      eventBus.on('sales.order.cancellation.requested', async (_event) => {
        cancellationEvents.push('cancellation-requested');
        const order = orderStates.get(event.payload.orderId);
        
        if (order && ['created', 'payment-pending'].includes(order.status)) {
          await eventBus.emit('inventory.stock.released', {
            orderId: event.payload.orderId,
            items: order.items || []
          });
        }
      });

      eventBus.on('inventory.stock.released', async (_event) => {
        cancellationEvents.push('stock-released');
        
        // Restore stock
        for (const item of event.payload.items) {
          const currentStock = inventoryState.get(item.id) || 0;
          inventoryState.set(item.id, currentStock + item.quantity);
        }

        await eventBus.emit('payments.refund.requested', {
          orderId: event.payload.orderId,
          reason: 'order_cancelled'
        });
      });

      eventBus.on('payments.refund.requested', async (_event) => {
        cancellationEvents.push('refund-requested');
        
        await eventBus.emit('sales.order.cancelled', {
          orderId: event.payload.orderId,
          cancelledAt: new Date().toISOString(),
          reason: event.payload.reason
        });
      });

      eventBus.on('sales.order.cancelled', async (_event) => {
        cancellationEvents.push('order-cancelled');
        const order = orderStates.get(event.payload.orderId);
        if (order) {
          order.status = 'cancelled';
          order.cancelledAt = event.payload.cancelledAt;
        }
      });

      // Execute cancellation workflow
      await eventBus.emit('sales.order.created', {
        orderId: orderData.id,
        customerId: orderData.customerId,
        items: orderData.items,
        total: orderData.total
      });
      await new Promise(resolve => setTimeout(resolve, 100));

      await eventBus.emit('sales.order.cancellation.requested', {
        orderId: orderData.id,
        requestedBy: 'customer',
        reason: 'changed_mind'
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify cancellation workflow
      expect(cancellationEvents).toEqual([
        'cancellation-requested',
        'stock-released',
        'refund-requested',
        'order-cancelled'
      ]);

      const cancelledOrder = orderStates.get(orderData.id);
      expect(cancelledOrder.status).toBe('cancelled');
      expect(cancelledOrder.cancelledAt).toBeTruthy();
    });

    it('should handle insufficient stock scenarios', async () => {
      const orderData = {
        orderId: 'ORD-INSUFFICIENT',
        customerId: 'CUST-001',
        items: [
          { id: 'ITEM-001', quantity: 1000 }, // More than available stock
          { id: 'ITEM-002', quantity: 2 }
        ],
        total: 50.00
      };

      const insufficientStockEvents: string[] = [];

      eventBus.on('sales.order.created', async (_event) => {
        for (const item of event.payload.items) {
          await eventBus.emit('inventory.stock.check', {
            orderId: event.payload.orderId,
            itemId: item.id,
            requiredQuantity: item.quantity
          });
        }
      });

      eventBus.on('inventory.stock.check', async (_event) => {
        const { orderId, itemId, requiredQuantity } = event.payload;
        const currentStock = inventoryState.get(itemId) || 0;

        if (currentStock < requiredQuantity) {
          insufficientStockEvents.push(`insufficient-${itemId}`);
          
          await eventBus.emit('inventory.stock.insufficient', {
            orderId,
            itemId,
            required: requiredQuantity,
            available: currentStock
          });
        }
      });

      eventBus.on('inventory.stock.insufficient', async (_event) => {
        insufficientStockEvents.push('stock-insufficient');
        
        await eventBus.emit('sales.order.stock.problem', {
          orderId: event.payload.orderId,
          issues: [{
            itemId: event.payload.itemId,
            required: event.payload.required,
            available: event.payload.available
          }]
        });
      });

      eventBus.on('sales.order.stock.problem', async (_event) => {
        insufficientStockEvents.push('order-stock-problem');
        
        await eventBus.emit('customers.notification.sent', {
          orderId: event.payload.orderId,
          type: 'stock_issue',
          message: 'Some items in your order are out of stock'
        });
      });

      // Execute insufficient stock scenario
      await eventBus.emit('sales.order.created', orderData);
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(insufficientStockEvents).toContain('insufficient-ITEM-001');
      expect(insufficientStockEvents).toContain('stock-insufficient');
      expect(insufficientStockEvents).toContain('order-stock-problem');
    });
  });

  describe('VIP Customer Workflows', () => {
    it('should prioritize VIP customer orders', async () => {
      const vipCustomer = mockBusinessData.customers[0]; // VIP tier
      const regularCustomer = mockBusinessData.customers[1]; // Regular tier
      
      const processingOrder: string[] = [];

      eventBus.on('sales.order.created', async (_event) => {
        const order = event.payload;
        const customer = mockBusinessData.customers.find(c => c.id === order.customerId);
        
        if (customer?.tier === 'VIP') {
          processingOrder.push(`vip-${order.orderId}`);
          
          await eventBus.emit('kitchen.order.received', {
            orderId: order.orderId,
            priority: 'high',
            customerTier: 'VIP',
            estimatedTime: 15 // Faster service for VIP
          });
        } else {
          processingOrder.push(`regular-${order.orderId}`);
          
          await eventBus.emit('kitchen.order.received', {
            orderId: order.orderId,
            priority: 'normal',
            customerTier: 'REGULAR',
            estimatedTime: 25
          });
        }
      });

      eventBus.on('kitchen.order.received', async (_event) => {
        processingOrder.push(`kitchen-${event.payload.priority}-${event.payload.orderId}`);
      });

      // Create orders for both customer types
      await eventBus.emit('sales.order.created', {
        orderId: 'ORD-REGULAR-001',
        customerId: regularCustomer.id,
        items: [{ id: 'ITEM-001', quantity: 1 }],
        total: 15.99
      });

      await eventBus.emit('sales.order.created', {
        orderId: 'ORD-VIP-001',
        customerId: vipCustomer.id,
        items: [{ id: 'ITEM-001', quantity: 1 }],
        total: 15.99
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      // VIP order should be processed with high priority
      expect(processingOrder).toContain('vip-ORD-VIP-001');
      expect(processingOrder).toContain('regular-ORD-REGULAR-001');
      expect(processingOrder).toContain('kitchen-high-ORD-VIP-001');
      expect(processingOrder).toContain('kitchen-normal-ORD-REGULAR-001');
    });

    it('should apply VIP discounts and benefits', async () => {
      const vipCustomer = mockBusinessData.customers[0];
      let discountApplied = false;
      let loyaltyPointsAwarded = 0;

      eventBus.on('sales.order.created', async (_event) => {
        const customer = mockBusinessData.customers.find(c => c.id === event.payload.customerId);
        
        if (customer?.tier === 'VIP') {
          // Apply VIP discount
          const discountAmount = event.payload.total * 0.1; // 10% VIP discount
          discountApplied = true;
          
          await eventBus.emit('sales.discount.applied', {
            orderId: event.payload.orderId,
            customerId: customer.id,
            discountType: 'VIP_DISCOUNT',
            amount: discountAmount,
            finalTotal: event.payload.total - discountAmount
          });
        }
      });

      eventBus.on('sales.discount.applied', async (_event) => {
        // Award loyalty points
        loyaltyPointsAwarded = Math.floor(event.payload.finalTotal * 2); // 2x points for VIP
        
        await eventBus.emit('customers.loyalty.points.awarded', {
          customerId: event.payload.customerId,
          orderId: event.payload.orderId,
          points: loyaltyPointsAwarded,
          multiplier: '2x_vip_bonus'
        });
      });

      // Create VIP order
      await eventBus.emit('sales.order.created', {
        orderId: 'ORD-VIP-BENEFITS',
        customerId: vipCustomer.id,
        items: [{ id: 'ITEM-001', quantity: 2 }],
        total: 31.98
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(discountApplied).toBe(true);
      expect(loyaltyPointsAwarded).toBeGreaterThan(0);
      
      assertions.assertEventEmitted('sales.discount.applied');
      assertions.assertEventEmitted('customers.loyalty.points.awarded');
    });
  });

  describe('Multi-item Order Complexity', () => {
    it('should handle complex orders with multiple items and special requirements', async () => {
      const complexOrder = {
        orderId: 'ORD-COMPLEX-001',
        customerId: 'CUST-001',
        items: [
          { id: 'ITEM-001', quantity: 2, specialInstructions: 'No onions' },
          { id: 'ITEM-002', quantity: 1, specialInstructions: 'Extra crispy' },
          { id: 'ITEM-003', quantity: 3, specialInstructions: 'Light ice' }
        ],
        total: 65.97,
        specialRequests: ['Allergen-free preparation', 'Priority service']
      };

      const complexityHandlers: string[] = [];
      const itemPreparationTasks: any[] = [];

      eventBus.on('sales.order.created', async (_event) => {
        complexityHandlers.push('order-received');
        
        // Process each item individually
        for (const item of event.payload.items) {
          await eventBus.emit('kitchen.item.preparation.scheduled', {
            orderId: event.payload.orderId,
            itemId: item.id,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
            estimatedTime: Math.floor(Math.random() * 10) + 5 // 5-15 minutes
          });
        }
      });

      eventBus.on('kitchen.item.preparation.scheduled', async (_event) => {
        complexityHandlers.push(`item-scheduled-${event.payload.itemId}`);
        
        itemPreparationTasks.push({
          orderId: event.payload.orderId,
          itemId: event.payload.itemId,
          instructions: event.payload.specialInstructions,
          status: 'scheduled'
        });

        // Simulate preparation
        setTimeout(async () => {
          await eventBus.emit('kitchen.item.preparation.completed', {
            orderId: event.payload.orderId,
            itemId: event.payload.itemId,
            actualTime: event.payload.estimatedTime
          });
        }, 50);
      });

      eventBus.on('kitchen.item.preparation.completed', async (_event) => {
        complexityHandlers.push(`item-completed-${event.payload.itemId}`);
        
        // Update task status
        const task = itemPreparationTasks.find(t => 
          t.orderId === event.payload.orderId && t.itemId === event.payload.itemId
        );
        if (task) task.status = 'completed';

        // Check if all items are completed
        const orderTasks = itemPreparationTasks.filter(t => t.orderId === event.payload.orderId);
        const completedTasks = orderTasks.filter(t => t.status === 'completed');

        if (completedTasks.length === orderTasks.length) {
          await eventBus.emit('kitchen.order.assembly.ready', {
            orderId: event.payload.orderId,
            totalItems: orderTasks.length,
            specialRequests: complexOrder.specialRequests
          });
        }
      });

      eventBus.on('kitchen.order.assembly.ready', async (_event) => {
        complexityHandlers.push('assembly-ready');
        
        await eventBus.emit('kitchen.order.completed', {
          orderId: event.payload.orderId,
          totalTime: 22,
          quality: 'excellent',
          specialRequirementsMet: true
        });
      });

      // Execute complex order workflow
      await eventBus.emit('sales.order.created', complexOrder);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Verify complex workflow handling
      expect(complexityHandlers).toContain('order-received');
      expect(complexityHandlers).toContain('item-scheduled-ITEM-001');
      expect(complexityHandlers).toContain('item-scheduled-ITEM-002');
      expect(complexityHandlers).toContain('item-scheduled-ITEM-003');
      expect(complexityHandlers).toContain('assembly-ready');

      // Verify all items were processed
      const completedItems = itemPreparationTasks.filter(t => t.status === 'completed');
      expect(completedItems).toHaveLength(3);

      // Verify special instructions were preserved
      const burgerTask = itemPreparationTasks.find(t => t.itemId === 'ITEM-001');
      expect(burgerTask?.instructions).toBe('No onions');
    });
  });

  describe('Error Recovery and Compensation', () => {
    it('should handle kitchen errors and provide compensation', async () => {
      const errorOrder = {
        orderId: 'ORD-ERROR-001',
        customerId: 'CUST-001',
        items: [{ id: 'ITEM-001', quantity: 1 }],
        total: 15.99
      };

      const errorRecoveryEvents: string[] = [];

      eventBus.on('sales.order.created', async (_event) => {
        await eventBus.emit('kitchen.order.received', {
          orderId: event.payload.orderId,
          items: event.payload.items
        });
      });

      eventBus.on('kitchen.order.received', async (_event) => {
        // Simulate kitchen error
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await eventBus.emit('kitchen.order.error', {
          orderId: event.payload.orderId,
          errorType: 'equipment_failure',
          message: 'Grill malfunction - cannot complete order',
          affectedItems: event.payload.items
        });
      });

      eventBus.on('kitchen.order.error', async (_event) => {
        errorRecoveryEvents.push('kitchen-error');
        
        // Initiate error recovery
        await eventBus.emit('operations.error.recovery.initiated', {
          orderId: event.payload.orderId,
          errorType: event.payload.errorType,
          recoveryPlan: 'compensation_and_refund'
        });
      });

      eventBus.on('operations.error.recovery.initiated', async (_event) => {
        errorRecoveryEvents.push('recovery-initiated');
        
        // Provide compensation
        await eventBus.emit('customers.compensation.offered', {
          orderId: event.payload.orderId,
          compensationType: 'full_refund_plus_credit',
          refundAmount: errorOrder.total,
          creditAmount: errorOrder.total * 0.5, // 50% credit for inconvenience
          message: 'We sincerely apologize for the inconvenience'
        });
      });

      eventBus.on('customers.compensation.offered', async (_event) => {
        errorRecoveryEvents.push('compensation-offered');
        
        await eventBus.emit('sales.order.compensated', {
          orderId: event.payload.orderId,
          compensationDetails: {
            refund: event.payload.refundAmount,
            credit: event.payload.creditAmount
          },
          status: 'resolved'
        });
      });

      // Execute error recovery workflow
      await eventBus.emit('sales.order.created', errorOrder);
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(errorRecoveryEvents).toEqual([
        'kitchen-error',
        'recovery-initiated', 
        'compensation-offered'
      ]);

      assertions.assertEventEmitted('kitchen.order.error');
      assertions.assertEventEmitted('customers.compensation.offered');
      assertions.assertEventEmitted('sales.order.compensated');
    });
  });
});