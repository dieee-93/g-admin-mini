// inventory-flow.test.ts - Business logic tests for inventory management workflows
// Tests: Stock tracking, reorder points, supplier management, waste tracking

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventBus } from '../../EventBus';
import { TestSetup, testConfigs, EventBusAssertions } from '../helpers/test-utilities';
import { mockBusinessData, mockEventTemplates } from '../helpers/mock-data';
import { createInventoryTestModule, createSalesTestModule, createCustomersTestModule, createTestEventHandlers } from '../helpers/test-modules';
import type { NamespacedEvent } from '../../types';

describe('EventBus - Inventory Management Business Logic', () => {
  let eventBus: EventBus;
  let assertions: EventBusAssertions;
  let capturedEvents: NamespacedEvent[];
  
  // Business state tracking
  const inventoryState = new Map<string, any>();
  const supplierState = new Map<string, any>();
  const reorderQueue: any[] = [];
  const wasteTracking: any[] = [];

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.integration);
    assertions = new EventBusAssertions();
    capturedEvents = [];

    // Setup event capture
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = async (pattern, payload, options = {}) => {
      const result = await originalEmit(pattern, payload, options);
      
      capturedEvents.push({
        id: `inventory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pattern,
        payload,
        timestamp: new Date().toISOString(),
        metadata: { source: 'inventory_business_test', ...options }
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
    await eventBus.registerModule(createInventoryTestModule());
    await eventBus.registerModule(createCustomersTestModule());
    await eventBus.registerModule(createSalesTestModule());

    // Initialize business state
    inventoryState.clear();
    supplierState.clear();
    reorderQueue.length = 0;
    wasteTracking.length = 0;

    // Setup initial inventory state
    mockBusinessData.inventory.forEach(item => {
      inventoryState.set(item.id, {
        ...item,
        reserved: 0,
        available: item.currentStock
      });
    });

    // Setup supplier state
    supplierState.set('SUPP-001', {
      id: 'SUPP-001',
      name: 'Premium Food Suppliers',
      reliability: 0.95,
      averageDeliveryTime: 24, // hours
      minimumOrder: 50,
      status: 'active'
    });

    // Setup global inventory update handler
    eventBus.on('inventory.stock.updated', async (_event) => {
      const item = inventoryState.get(event.payload.itemId);
      if (item) {
        item.currentStock = event.payload.newStock;
        item.available = item.currentStock - (item.reserved || 0);
      }
    });
  });

  afterEach(async () => {
    await TestSetup.cleanup();
    capturedEvents = [];
  });

  describe('Stock Level Management', () => {
    it('should trigger low stock alerts and automatic reordering', async () => {
      const lowStockEvents: string[] = [];
      let reorderTriggered = false;

      // Setup stock monitoring
      eventBus.on('inventory.stock.updated', async (_event) => {
        const item = inventoryState.get(event.payload.itemId);
        if (item) {
          item.currentStock = event.payload.newStock;
          item.available = item.currentStock - item.reserved;

          // Check for low stock
          if (item.currentStock <= item.minimumStock) {
            await eventBus.emit('inventory.stock.low', {
              itemId: item.id,
              itemName: item.name,
              currentStock: item.currentStock,
              minimumStock: item.minimumStock,
              reorderPoint: item.minimumStock * 2,
              urgency: item.currentStock < (item.minimumStock * 0.5) ? 'critical' : 'warning'
            });
          }
        }
      });

      eventBus.on('inventory.stock.low', async (_event) => {
        lowStockEvents.push(`low-stock-${event.payload.itemId}`);
        
        // Trigger automatic reorder if critically low
        if (event.payload.urgency === 'critical') {
          const item = inventoryState.get(event.payload.itemId);
          const reorderQuantity = (item.maximumStock - item.currentStock);
          
          await eventBus.emit('inventory.reorder.automatic', {
            itemId: event.payload.itemId,
            currentStock: event.payload.currentStock,
            reorderQuantity,
            supplier: item.supplier,
            urgency: 'high'
          });
        }
      });

      eventBus.on('inventory.reorder.automatic', async (_event) => {
        lowStockEvents.push('reorder-triggered');
        reorderTriggered = true;
        
        reorderQueue.push({
          itemId: event.payload.itemId,
          quantity: event.payload.reorderQuantity,
          supplier: event.payload.supplier,
          status: 'pending',
          createdAt: new Date().toISOString(),
          type: 'automatic'
        });

        await eventBus.emit('suppliers.order.placed', {
          orderId: `REORDER-${Date.now()}`,
          supplier: event.payload.supplier,
          items: [{
            itemId: event.payload.itemId,
            quantity: event.payload.reorderQuantity
          }],
          urgency: event.payload.urgency
        });
      });

      // Simulate stock depletion
      await eventBus.emit('inventory.stock.updated', {
        itemId: 'ITEM-002', // Papas Gourmet (low stock item from mock data)
        newStock: 3, // Below minimum of 20
        previousStock: 5,
        operation: 'sale',
        timestamp: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(lowStockEvents).toContain('low-stock-ITEM-002');
      expect(lowStockEvents).toContain('reorder-triggered');
      expect(reorderTriggered).toBe(true);
      expect(reorderQueue).toHaveLength(1);
      expect(reorderQueue[0].itemId).toBe('ITEM-002');

      assertions.assertEventEmitted('inventory.stock.low');
      assertions.assertEventEmitted('inventory.reorder.automatic');
      assertions.assertEventEmitted('suppliers.order.placed');
    });

    it('should handle stock reservations for pending orders', async () => {
      const reservationEvents: string[] = [];
      
      eventBus.on('inventory.stock.reservation.requested', async (_event) => {
        reservationEvents.push('reservation-requested');
        const { itemId, quantity, orderId } = event.payload;
        const item = inventoryState.get(itemId);
        
        if (item && item.available >= quantity) {
          // Reserve stock
          item.reserved += quantity;
          item.available -= quantity;
          
          await eventBus.emit('inventory.stock.reserved', {
            itemId,
            quantity,
            orderId,
            reservationId: `RES-${Date.now()}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
          });
        } else {
          await eventBus.emit('inventory.stock.reservation.failed', {
            itemId,
            quantity,
            orderId,
            available: item?.available || 0,
            reason: 'insufficient_stock'
          });
        }
      });

      eventBus.on('inventory.stock.reserved', async (_event) => {
        reservationEvents.push('stock-reserved');
      });

      eventBus.on('inventory.stock.reservation.failed', async (_event) => {
        reservationEvents.push('reservation-failed');
      });

      // Test successful reservation
      await eventBus.emit('inventory.stock.reservation.requested', {
        itemId: 'ITEM-001', // Hamburguesa Premium (good stock)
        quantity: 5,
        orderId: 'ORD-RESERVATION-001'
      });

      // Test failed reservation (insufficient stock)
      await eventBus.emit('inventory.stock.reservation.requested', {
        itemId: 'ITEM-002', // Papas Gourmet (low stock)
        quantity: 50, // More than available
        orderId: 'ORD-RESERVATION-002'
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(reservationEvents).toContain('reservation-requested');
      expect(reservationEvents).toContain('stock-reserved');
      expect(reservationEvents).toContain('reservation-failed');

      // Verify stock state changes
      const hamburger = inventoryState.get('ITEM-001');
      expect(hamburger.reserved).toBe(5);
      expect(hamburger.available).toBe(hamburger.currentStock - 5);
    });

    it('should handle stock reservation expiration', async () => {
      const expirationEvents: string[] = [];
      
      // Add handler for reservation requests
      eventBus.on('inventory.stock.reservation.requested', async (_event) => {
        const item = inventoryState.get(event.payload.itemId);
        if (item && item.available >= event.payload.quantity) {
          item.reserved += event.payload.quantity;
          item.available -= event.payload.quantity;
          
          await eventBus.emit('inventory.stock.reserved', {
            reservationId: `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            itemId: event.payload.itemId,
            quantity: event.payload.quantity,
            orderId: event.payload.orderId,
            timestamp: new Date().toISOString()
          });
        }
      });
      
      eventBus.on('inventory.stock.reserved', async (_event) => {
        // Simulate reservation expiration check
        setTimeout(async () => {
          await eventBus.emit('inventory.stock.reservation.expired', {
            reservationId: event.payload.reservationId,
            itemId: event.payload.itemId,
            quantity: event.payload.quantity,
            orderId: event.payload.orderId
          });
        }, 100); // Quick expiration for testing
      });

      eventBus.on('inventory.stock.reservation.expired', async (_event) => {
        expirationEvents.push('reservation-expired');
        
        // Release reserved stock
        const item = inventoryState.get(event.payload.itemId);
        if (item) {
          item.reserved -= event.payload.quantity;
          item.available += event.payload.quantity;
        }

        await eventBus.emit('inventory.stock.released', {
          itemId: event.payload.itemId,
          quantity: event.payload.quantity,
          reason: 'reservation_expired',
          orderId: event.payload.orderId
        });
      });

      eventBus.on('inventory.stock.released', async (_event) => {
        expirationEvents.push('stock-released');
      });

      // Create reservation that will expire
      await eventBus.emit('inventory.stock.reservation.requested', {
        itemId: 'ITEM-001',
        quantity: 3,
        orderId: 'ORD-EXPIRING'
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(expirationEvents).toContain('reservation-expired');
      expect(expirationEvents).toContain('stock-released');

      // Verify stock was released
      const item = inventoryState.get('ITEM-001');
      expect(item.reserved).toBe(0);
    });
  });

  describe('Supplier Management and Ordering', () => {
    it('should handle supplier order lifecycle', async () => {
      const supplierOrderEvents: string[] = [];
      const supplierOrders = new Map<string, any>();

      eventBus.on('suppliers.order.placed', async (_event) => {
        supplierOrderEvents.push('order-placed');
        const order = {
          ...event.payload,
          status: 'pending',
          placedAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        
        supplierOrders.set(event.payload.orderId, order);

        // Simulate supplier confirmation
        setTimeout(async () => {
          await eventBus.emit('suppliers.order.confirmed', {
            orderId: event.payload.orderId,
            confirmedAt: new Date().toISOString(),
            estimatedDelivery: order.estimatedDelivery,
            trackingNumber: `TRK-${Date.now()}`
          });
        }, 50);
      });

      eventBus.on('suppliers.order.confirmed', async (_event) => {
        supplierOrderEvents.push('order-confirmed');
        const order = supplierOrders.get(event.payload.orderId);
        if (order) {
          order.status = 'confirmed';
          order.trackingNumber = event.payload.trackingNumber;
        }

        // Simulate delivery
        setTimeout(async () => {
          await eventBus.emit('suppliers.delivery.arrived', {
            orderId: event.payload.orderId,
            deliveredAt: new Date().toISOString(),
            items: order.items
          });
        }, 100);
      });

      eventBus.on('suppliers.delivery.arrived', async (_event) => {
        supplierOrderEvents.push('delivery-arrived');
        
        // Process incoming inventory
        for (const item of event.payload.items) {
          const currentItem = inventoryState.get(item.itemId);
          if (currentItem) {
            const newStock = currentItem.currentStock + item.quantity;
            
            await eventBus.emit('inventory.stock.updated', {
              itemId: item.itemId,
              newStock,
              previousStock: currentItem.currentStock,
              operation: 'restock',
              source: 'supplier_delivery',
              deliveryId: event.payload.orderId
            });
          }
        }

        await eventBus.emit('suppliers.delivery.processed', {
          orderId: event.payload.orderId,
          processedAt: new Date().toISOString(),
          status: 'completed'
        });
      });

      eventBus.on('suppliers.delivery.processed', async (_event) => {
        supplierOrderEvents.push('delivery-processed');
      });

      // Execute supplier order workflow
      await eventBus.emit('suppliers.order.placed', {
        orderId: 'SUPP-ORD-001',
        supplier: 'SUPP-001',
        items: [
          { itemId: 'ITEM-001', quantity: 50 },
          { itemId: 'ITEM-002', quantity: 100 }
        ],
        totalAmount: 450.00,
        urgency: 'normal'
      });

      await new Promise(resolve => setTimeout(resolve, 400));

      expect(supplierOrderEvents).toEqual([
        'order-placed',
        'order-confirmed',
        'delivery-arrived',
        'delivery-processed'
      ]);

      // Verify inventory was updated
      const hamburger = inventoryState.get('ITEM-001');
      expect(hamburger.currentStock).toBe(mockBusinessData.inventory[0].currentStock + 50);
    });

    it('should handle supplier delivery discrepancies', async () => {
      const discrepancyEvents: string[] = [];
      const discrepancies: any[] = [];

      eventBus.on('suppliers.delivery.arrived', async (_event) => {
        const expectedItems = [
          { itemId: 'ITEM-001', quantity: 50 },
          { itemId: 'ITEM-002', quantity: 100 }
        ];
        
        const deliveredItems = event.payload.items;
        
        // Check for discrepancies
        for (const expected of expectedItems) {
          const delivered = deliveredItems.find(d => d.itemId === expected.itemId);
          
          if (!delivered) {
            discrepancies.push({
              type: 'missing_item',
              itemId: expected.itemId,
              expected: expected.quantity,
              delivered: 0
            });
          } else if (delivered.quantity !== expected.quantity) {
            discrepancies.push({
              type: 'quantity_mismatch',
              itemId: expected.itemId,
              expected: expected.quantity,
              delivered: delivered.quantity,
              difference: delivered.quantity - expected.quantity
            });
          }
        }

        if (discrepancies.length > 0) {
          await eventBus.emit('suppliers.delivery.discrepancy', {
            orderId: event.payload.orderId,
            discrepancies,
            deliveredAt: event.payload.deliveredAt
          });
        }
      });

      eventBus.on('suppliers.delivery.discrepancy', async (_event) => {
        discrepancyEvents.push('discrepancy-detected');
        
        await eventBus.emit('suppliers.discrepancy.reported', {
          orderId: event.payload.orderId,
          reportedAt: new Date().toISOString(),
          discrepancies: event.payload.discrepancies,
          status: 'pending_resolution'
        });
      });

      eventBus.on('suppliers.discrepancy.reported', async (_event) => {
        discrepancyEvents.push('discrepancy-reported');
      });

      // Simulate delivery with discrepancies
      await eventBus.emit('suppliers.delivery.arrived', {
        orderId: 'SUPP-ORD-DISCREPANCY',
        deliveredAt: new Date().toISOString(),
        items: [
          { itemId: 'ITEM-001', quantity: 45 }, // 5 less than expected
          // ITEM-002 missing entirely
        ]
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(discrepancyEvents).toContain('discrepancy-detected');
      expect(discrepancyEvents).toContain('discrepancy-reported');
      expect(discrepancies).toHaveLength(2);
      expect(discrepancies[0].type).toBe('quantity_mismatch');
      expect(discrepancies[1].type).toBe('missing_item');
    });
  });

  describe('Waste Tracking and Management', () => {
    it('should track and report inventory waste', async () => {
      const wasteEvents: string[] = [];

      eventBus.on('inventory.item.expired', async (_event) => {
        wasteEvents.push('item-expired');
        
        const wasteEntry = {
          itemId: event.payload.itemId,
          quantity: event.payload.quantity,
          reason: 'expiration',
          wasteDate: new Date().toISOString(),
          cost: event.payload.unitCost * event.payload.quantity
        };
        
        wasteTracking.push(wasteEntry);

        await eventBus.emit('inventory.waste.recorded', wasteEntry);
      });

      eventBus.on('inventory.item.damaged', async (_event) => {
        wasteEvents.push('item-damaged');
        
        const wasteEntry = {
          itemId: event.payload.itemId,
          quantity: event.payload.quantity,
          reason: event.payload.damageType,
          wasteDate: new Date().toISOString(),
          cost: event.payload.unitCost * event.payload.quantity
        };
        
        wasteTracking.push(wasteEntry);

        await eventBus.emit('inventory.waste.recorded', wasteEntry);
      });

      eventBus.on('inventory.waste.recorded', async (_event) => {
        wasteEvents.push('waste-recorded');
        
        // Update inventory
        const item = inventoryState.get(event.payload.itemId);
        if (item) {
          item.currentStock -= event.payload.quantity;
          item.available = Math.max(0, item.currentStock - item.reserved);
          
          await eventBus.emit('inventory.stock.updated', {
            itemId: event.payload.itemId,
            newStock: item.currentStock,
            previousStock: item.currentStock + event.payload.quantity,
            operation: 'waste',
            reason: event.payload.reason
          });
        }

        // Check if waste reporting threshold is reached
        const dailyWaste = wasteTracking.filter(w => {
          const wasteDate = new Date(w.wasteDate);
          const today = new Date();
          return wasteDate.toDateString() === today.toDateString();
        });

        const dailyWasteCost = dailyWaste.reduce((sum, w) => sum + w.cost, 0);
        
        if (dailyWasteCost > 100) { // $100 daily waste threshold
          await eventBus.emit('inventory.waste.threshold.exceeded', {
            date: new Date().toISOString(),
            totalWasteCost: dailyWasteCost,
            wasteItems: dailyWaste.length,
            threshold: 100
          });
        }
      });

      eventBus.on('inventory.waste.threshold.exceeded', async (_event) => {
        wasteEvents.push('waste-threshold-exceeded');
      });

      // Simulate various waste scenarios
      await eventBus.emit('inventory.item.expired', {
        itemId: 'ITEM-003',
        quantity: 5,
        unitCost: 24.99,
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        batchNumber: 'BATCH-001'
      });

      await eventBus.emit('inventory.item.damaged', {
        itemId: 'ITEM-001',
        quantity: 3,
        unitCost: 8.50,
        damageType: 'transportation_damage',
        damageDescription: 'Package damaged during delivery'
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(wasteEvents).toContain('item-expired');
      expect(wasteEvents).toContain('item-damaged');
      expect(wasteEvents).toContain('waste-recorded');
      expect(wasteEvents).toContain('waste-threshold-exceeded');

      expect(wasteTracking).toHaveLength(2);
      expect(wasteTracking[0].reason).toBe('expiration');
      expect(wasteTracking[1].reason).toBe('transportation_damage');

      const totalWasteCost = wasteTracking.reduce((sum, w) => sum + w.cost, 0);
      expect(totalWasteCost).toBeGreaterThan(100); // Should exceed threshold
    });

    it('should generate waste analytics and recommendations', async () => {
      const analyticsEvents: string[] = [];
      let wasteAnalytics: any = null;

      // Add multiple waste entries for analytics
      const wasteEntries = [
        { itemId: 'ITEM-001', quantity: 2, cost: 17.00, reason: 'expiration' },
        { itemId: 'ITEM-001', quantity: 3, cost: 25.50, reason: 'damage' },
        { itemId: 'ITEM-002', quantity: 5, cost: 62.50, reason: 'expiration' },
        { itemId: 'ITEM-003', quantity: 1, cost: 24.99, reason: 'expiration' }
      ];

      wasteEntries.forEach(entry => wasteTracking.push({
        ...entry,
        wasteDate: new Date().toISOString()
      }));

      eventBus.on('inventory.waste.analysis.requested', async (_event) => {
        analyticsEvents.push('analysis-requested');
        
        // Calculate waste analytics
        const itemWasteSummary = new Map<string, any>();
        
        wasteTracking.forEach(waste => {
          const summary = itemWasteSummary.get(waste.itemId) || {
            itemId: waste.itemId,
            totalQuantity: 0,
            totalCost: 0,
            reasons: new Map<string, number>()
          };
          
          summary.totalQuantity += waste.quantity;
          summary.totalCost += waste.cost;
          summary.reasons.set(waste.reason, (summary.reasons.get(waste.reason) || 0) + 1);
          
          itemWasteSummary.set(waste.itemId, summary);
        });

        wasteAnalytics = {
          period: 'daily',
          totalItems: wasteTracking.length,
          totalCost: wasteTracking.reduce((sum, w) => sum + w.cost, 0),
          itemSummaries: Array.from(itemWasteSummary.values()),
          recommendations: []
        };

        // Generate recommendations
        itemWasteSummary.forEach(summary => {
          if (summary.totalCost > 40) {
            wasteAnalytics.recommendations.push({
              type: 'high_waste_item',
              itemId: summary.itemId,
              message: `Consider reducing order quantities for ${summary.itemId}`,
              potentialSavings: summary.totalCost * 0.5
            });
          }
          
          if (summary.reasons.get('expiration') > 1) {
            wasteAnalytics.recommendations.push({
              type: 'expiration_pattern',
              itemId: summary.itemId,
              message: `Implement FIFO rotation for ${summary.itemId}`,
              priority: 'high'
            });
          }
        });

        await eventBus.emit('inventory.waste.analysis.completed', {
          analytics: wasteAnalytics,
          generatedAt: new Date().toISOString()
        });
      });

      eventBus.on('inventory.waste.analysis.completed', async (_event) => {
        analyticsEvents.push('analysis-completed');
      });

      // Request waste analysis
      await eventBus.emit('inventory.waste.analysis.requested', {
        period: 'daily',
        includeRecommendations: true
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(analyticsEvents).toContain('analysis-requested');
      expect(analyticsEvents).toContain('analysis-completed');
      expect(wasteAnalytics).toBeTruthy();
      expect(wasteAnalytics.totalItems).toBe(4);
      expect(wasteAnalytics.recommendations.length).toBeGreaterThan(0);
      
      const highWasteRecommendation = wasteAnalytics.recommendations.find(r => r.type === 'high_waste_item');
      expect(highWasteRecommendation).toBeTruthy();
    });
  });

  describe('Inventory Optimization', () => {
    it('should optimize stock levels based on sales patterns', async () => {
      const optimizationEvents: string[] = [];
      const salesPatterns = new Map<string, any>();

      // Track sales patterns
      eventBus.on('sales.item.sold', async (_event) => {
        const pattern = salesPatterns.get(event.payload.itemId) || {
          itemId: event.payload.itemId,
          totalSold: 0,
          salesCount: 0,
          averageQuantity: 0
        };
        
        pattern.totalSold += event.payload.quantity;
        pattern.salesCount += 1;
        pattern.averageQuantity = pattern.totalSold / pattern.salesCount;
        
        salesPatterns.set(event.payload.itemId, pattern);
      });

      eventBus.on('inventory.optimization.analysis.requested', async (_event) => {
        optimizationEvents.push('optimization-requested');
        
        const optimizationRecommendations: any[] = [];
        
        // Analyze each item
        inventoryState.forEach((item, itemId) => {
          const pattern = salesPatterns.get(itemId);
          
          if (pattern) {
            const dailyAverage = pattern.averageQuantity; // Simplified
            const recommendedMinimum = Math.ceil(dailyAverage * 7); // 1 week buffer
            const recommendedMaximum = Math.ceil(dailyAverage * 30); // 1 month max
            
            if (item.minimumStock < recommendedMinimum || item.maximumStock > recommendedMaximum * 1.5) {
              optimizationRecommendations.push({
                itemId,
                currentMinimum: item.minimumStock,
                currentMaximum: item.maximumStock,
                recommendedMinimum,
                recommendedMaximum,
                reasoning: `Based on average daily sales of ${dailyAverage.toFixed(1)}`,
                potentialSavings: (item.maximumStock - recommendedMaximum) * item.unitCost
              });
            }
          }
        });

        await eventBus.emit('inventory.optimization.recommendations.generated', {
          recommendations: optimizationRecommendations,
          analysisDate: new Date().toISOString(),
          basedOnSales: salesPatterns.size
        });
      });

      eventBus.on('inventory.optimization.recommendations.generated', async (_event) => {
        optimizationEvents.push('recommendations-generated');
      });

      // Simulate sales patterns
      const salesData = [
        { itemId: 'ITEM-001', quantity: 15 },
        { itemId: 'ITEM-001', quantity: 12 },
        { itemId: 'ITEM-001', quantity: 18 },
        { itemId: 'ITEM-002', quantity: 8 },
        { itemId: 'ITEM-002', quantity: 5 },
        { itemId: 'ITEM-003', quantity: 3 }
      ];

      for (const sale of salesData) {
        await eventBus.emit('sales.item.sold', sale);
      }

      await eventBus.emit('inventory.optimization.analysis.requested', {
        analysisType: 'stock_levels',
        period: 'last_30_days'
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(optimizationEvents).toContain('optimization-requested');
      expect(optimizationEvents).toContain('recommendations-generated');
      
      assertions.assertEventEmitted('inventory.optimization.recommendations.generated');
    });
  });
});