import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../../index';
import { createPaymentTestModule, createFiscalTestModule, createInventoryTestModule } from '../helpers/test-modules';
import { mockBusinessData } from '../helpers/mock-data';
import { TestSetup, testConfigs, EventBusAssertions, PerformanceMeasurement } from '../helpers/test-utilities';
import { createTestEventHandlers } from '../helpers/test-modules';

describe('EventBus - Payment Processing Business Logic', () => {
  let eventBus: EventBus;
  let performance: PerformanceMeasurement;

  // Helper function to setup payment modules
  async function setupPaymentModules() {
    const fiscalModule = createFiscalTestModule();
    const paymentModule = createPaymentTestModule();
    
    // Register fiscal module first (dependency of payment module)
    await eventBus.registerModule(fiscalModule);
    await eventBus.registerModule(paymentModule);
    
    return { fiscalModule, paymentModule };
  }

  beforeEach(async () => {
    eventBus = await TestSetup.createEventBus(testConfigs.unit);
    performance = new PerformanceMeasurement();
    
    // Register all test handlers
    const handlers = createTestEventHandlers();
    for (const [handlerName, handler] of handlers.entries()) {
      eventBus.registerHandler(handlerName, handler);
    }
    
    vi.clearAllMocks();
  });

  describe('Standard Payment Processing', () => {
    it('should handle complete cash payment workflow', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = mockBusinessData.orders[0];
      const paymentAmount = order.total;

      // 1. Payment initiation
      await eventBus.emit('payment.initiated', {
        orderId: order.id,
        paymentId: 'pay_001',
        method: 'cash',
        amount: paymentAmount,
        currency: 'USD',
        initiatedBy: 'staff_001',
        initiatedAt: new Date().toISOString()
      });

      // 2. Cash received
      await eventBus.emit('payment.cash.received', {
        paymentId: 'pay_001',
        amountReceived: paymentAmount + 5.00, // Customer gave extra
        expectedAmount: paymentAmount,
        receivedBy: 'staff_001'
      });

      // 3. Change calculation
      await eventBus.emit('payment.change.calculated', {
        paymentId: 'pay_001',
        changeAmount: 5.00,
        calculatedBy: 'system'
      });

      // 4. Payment completion
      await eventBus.emit('payment.completed', {
        paymentId: 'pay_001',
        orderId: order.id,
        method: 'cash',
        amount: paymentAmount,
        changeGiven: 5.00,
        completedAt: new Date().toISOString(),
        processedBy: 'staff_001'
      });

      // 5. Fiscal receipt generation
      await eventBus.emit('fiscal.receipt.generated', {
        receiptId: 'receipt_001',
        orderId: order.id,
        paymentId: 'pay_001',
        receiptNumber: 'R-2024-001234',
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        paymentMethod: 'cash',
        generatedAt: new Date().toISOString()
      });

      // 6. Cash register update
      await eventBus.emit('payment.cash_register.updated', {
        registerId: 'reg_001',
        operation: 'sale',
        amount: paymentAmount,
        newBalance: 450.00,
        updatedBy: 'staff_001',
        reference: 'pay_001'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const paymentEvents = workflowEvents.filter(e => e.pattern.startsWith('payment.'));
      const fiscalEvents = workflowEvents.filter(e => e.pattern.startsWith('fiscal.'));

      expect(paymentEvents).toHaveLength(5);
      expect(fiscalEvents).toHaveLength(1);

      const completedPayment = workflowEvents.find(e => e.pattern === 'payment.completed');
      expect(completedPayment?.payload.method).toBe('cash');
      expect(completedPayment?.payload.changeGiven).toBe(5.00);
    });

    it('should handle credit card payment with authorization', async () => {
      performance.start('credit-card-payment');

      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = mockBusinessData.orders[1];
      const paymentAmount = order.total;

      // 1. Payment initiation
      await eventBus.emit('payment.initiated', {
        orderId: order.id,
        paymentId: 'pay_002',
        method: 'credit_card',
        amount: paymentAmount,
        currency: 'USD',
        initiatedBy: 'staff_001',
        initiatedAt: new Date().toISOString()
      });

      // 2. Card information capture
      await eventBus.emit('payment.card.info_captured', {
        paymentId: 'pay_002',
        cardType: 'visa',
        lastFour: '1234',
        expiryMonth: '12',
        expiryYear: '2025',
        capturedAt: new Date().toISOString()
      });

      // 3. Authorization request
      await eventBus.emit('payment.card.authorization_requested', {
        paymentId: 'pay_002',
        amount: paymentAmount,
        merchantId: 'merchant_123',
        terminalId: 'terminal_001',
        requestedAt: new Date().toISOString()
      });

      // 4. Authorization response
      await eventBus.emit('payment.card.authorized', {
        paymentId: 'pay_002',
        authorizationCode: 'AUTH123456',
        approvalCode: '001234',
        transactionId: 'txn_789012',
        authorizedAt: new Date().toISOString(),
        processor: 'stripe'
      });

      // 5. Capture/Settlement
      await eventBus.emit('payment.card.captured', {
        paymentId: 'pay_002',
        captureAmount: paymentAmount,
        settlementId: 'settle_456',
        capturedAt: new Date().toISOString()
      });

      // 6. Payment completion
      await eventBus.emit('payment.completed', {
        paymentId: 'pay_002',
        orderId: order.id,
        method: 'credit_card',
        amount: paymentAmount,
        authorizationCode: 'AUTH123456',
        completedAt: new Date().toISOString(),
        processedBy: 'staff_001'
      });

      performance.end('credit-card-payment');

      await new Promise(resolve => setTimeout(resolve, 100));

      const cardEvents = workflowEvents.filter(e => e.pattern.includes('card'));
      expect(cardEvents).toHaveLength(4);

      const authorizedEvent = workflowEvents.find(e => e.pattern === 'payment.card.authorized');
      expect(authorizedEvent?.payload.authorizationCode).toBe('AUTH123456');

      const stats = performance.getStats('credit-card-payment');
      expect(stats.avg).toBeLessThan(500); // Should be fast
    });

    it('should handle mobile payment (contactless) workflow', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = mockBusinessData.orders[1]; // Use second order instead of non-existent third
      const paymentAmount = order.total;

      // 1. NFC payment initiation
      await eventBus.emit('payment.initiated', {
        orderId: order.id,
        paymentId: 'pay_003',
        method: 'nfc',
        amount: paymentAmount,
        currency: 'USD',
        initiatedBy: 'staff_002',
        initiatedAt: new Date().toISOString()
      });

      // 2. NFC device detection
      await eventBus.emit('payment.nfc.device_detected', {
        paymentId: 'pay_003',
        deviceType: 'smartphone',
        paymentApp: 'apple_pay',
        deviceId: 'device_abc123'
      });

      // 3. Biometric authentication (on customer device)
      await eventBus.emit('payment.nfc.authenticated', {
        paymentId: 'pay_003',
        authMethod: 'touch_id',
        authenticatedAt: new Date().toISOString()
      });

      // 4. Transaction processing
      await eventBus.emit('payment.nfc.processed', {
        paymentId: 'pay_003',
        transactionId: 'nfc_txn_456',
        approvalCode: 'NFC001',
        processedAt: new Date().toISOString()
      });

      // 5. Payment completion
      await eventBus.emit('payment.completed', {
        paymentId: 'pay_003',
        orderId: order.id,
        method: 'nfc',
        amount: paymentAmount,
        transactionId: 'nfc_txn_456',
        completedAt: new Date().toISOString(),
        processedBy: 'staff_002'
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const nfcEvents = workflowEvents.filter(e => e.pattern.includes('nfc'));
      expect(nfcEvents).toHaveLength(3);

      const processedEvent = workflowEvents.find(e => e.pattern === 'payment.nfc.processed');
      expect(processedEvent?.payload.approvalCode).toBe('NFC001');
    });
  });

  describe('Split Payment Processing', () => {
    it('should handle multiple payment methods for single order', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = mockBusinessData.orders[0];
      const totalAmount = order.total; // $67.50
      const cashAmount = 30.00;
      const cardAmount = 37.50;

      // 1. Split payment initiation
      await eventBus.emit('payment.split.initiated', {
        orderId: order.id,
        totalAmount,
        splitPayments: [
          { method: 'cash', amount: cashAmount, paymentId: 'pay_004a' },
          { method: 'credit_card', amount: cardAmount, paymentId: 'pay_004b' }
        ],
        initiatedBy: 'staff_001'
      });

      // 2. Process cash portion
      await eventBus.emit('payment.initiated', {
        orderId: order.id,
        paymentId: 'pay_004a',
        method: 'cash',
        amount: cashAmount,
        partialPayment: true,
        sequence: 1
      });

      await eventBus.emit('payment.cash.received', {
        paymentId: 'pay_004a',
        amountReceived: cashAmount,
        expectedAmount: cashAmount
      });

      await eventBus.emit('payment.completed', {
        paymentId: 'pay_004a',
        orderId: order.id,
        method: 'cash',
        amount: cashAmount,
        partialPayment: true,
        sequence: 1
      });

      // 3. Process card portion
      await eventBus.emit('payment.initiated', {
        orderId: order.id,
        paymentId: 'pay_004b',
        method: 'credit_card',
        amount: cardAmount,
        partialPayment: true,
        sequence: 2
      });

      await eventBus.emit('payment.card.authorized', {
        paymentId: 'pay_004b',
        authorizationCode: 'AUTH789',
        amount: cardAmount
      });

      await eventBus.emit('payment.completed', {
        paymentId: 'pay_004b',
        orderId: order.id,
        method: 'credit_card',
        amount: cardAmount,
        partialPayment: true,
        sequence: 2
      });

      // 4. Split payment completion
      await eventBus.emit('payment.split.completed', {
        orderId: order.id,
        totalAmount,
        payments: [
          { paymentId: 'pay_004a', method: 'cash', amount: cashAmount },
          { paymentId: 'pay_004b', method: 'credit_card', amount: cardAmount }
        ],
        completedAt: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const splitEvents = workflowEvents.filter(e => e.pattern.includes('split'));
      const completedPayments = workflowEvents.filter(e => e.pattern === 'payment.completed');

      expect(splitEvents).toHaveLength(2);
      expect(completedPayments).toHaveLength(2);

      const splitCompleted = workflowEvents.find(e => e.pattern === 'payment.split.completed');
      expect(splitCompleted?.payload.payments).toHaveLength(2);
      expect(splitCompleted?.payload.totalAmount).toBe(totalAmount);
    });

    it('should handle group payment splitting', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = { ...mockBusinessData.orders[0], total: 120.00 };
      const splitAmount = 40.00; // 3-way split

      // 1. Group split initiation
      await eventBus.emit('payment.group_split.initiated', {
        orderId: order.id,
        totalAmount: order.total,
        splitCount: 3,
        amountPerPerson: splitAmount,
        initiatedBy: 'staff_001'
      });

      // 2. Process each person's payment
      for (let i = 1; i <= 3; i++) {
        await eventBus.emit('payment.initiated', {
          orderId: order.id,
          paymentId: `pay_group_00${i}`,
          method: 'credit_card',
          amount: splitAmount,
          groupPayment: true,
          personNumber: i
        });

        await eventBus.emit('payment.card.authorized', {
          paymentId: `pay_group_00${i}`,
          authorizationCode: `AUTH${i}23`,
          amount: splitAmount
        });

        await eventBus.emit('payment.completed', {
          paymentId: `pay_group_00${i}`,
          orderId: order.id,
          method: 'credit_card',
          amount: splitAmount,
          groupPayment: true,
          personNumber: i
        });
      }

      // 3. Group payment completion
      await eventBus.emit('payment.group_split.completed', {
        orderId: order.id,
        totalAmount: order.total,
        splitCount: 3,
        amountPerPerson: splitAmount,
        completedAt: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const groupEvents = workflowEvents.filter(e => e.pattern.includes('group_split'));
      const completedPayments = workflowEvents.filter(e => e.pattern === 'payment.completed');

      expect(groupEvents).toHaveLength(2);
      expect(completedPayments).toHaveLength(3);
    });
  });

  describe('Payment Error Handling', () => {
    it('should handle card payment failures and retries', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = mockBusinessData.orders[0];
      const paymentAmount = order.total;

      // 1. Initial payment attempt
      await eventBus.emit('payment.initiated', {
        orderId: order.id,
        paymentId: 'pay_005',
        method: 'credit_card',
        amount: paymentAmount,
        attemptNumber: 1
      });

      // 2. Authorization failure
      await eventBus.emit('payment.card.declined', {
        paymentId: 'pay_005',
        declineReason: 'insufficient_funds',
        declineCode: '51',
        declinedAt: new Date().toISOString()
      });

      // 3. Retry with different card
      await eventBus.emit('payment.retry.initiated', {
        originalPaymentId: 'pay_005',
        newPaymentId: 'pay_005_retry',
        orderId: order.id,
        method: 'credit_card',
        amount: paymentAmount,
        attemptNumber: 2
      });

      // 4. Successful authorization on retry
      await eventBus.emit('payment.card.authorized', {
        paymentId: 'pay_005_retry',
        authorizationCode: 'AUTH999',
        approvalCode: '009999',
        authorizedAt: new Date().toISOString()
      });

      // 5. Successful completion
      await eventBus.emit('payment.completed', {
        paymentId: 'pay_005_retry',
        orderId: order.id,
        method: 'credit_card',
        amount: paymentAmount,
        originalPaymentId: 'pay_005',
        completedAt: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const declinedEvents = workflowEvents.filter(e => e.pattern === 'payment.card.declined');
      const retryEvents = workflowEvents.filter(e => e.pattern.includes('retry'));

      expect(declinedEvents).toHaveLength(1);
      expect(retryEvents).toHaveLength(1);

      const declinedEvent = workflowEvents.find(e => e.pattern === 'payment.card.declined');
      expect(declinedEvent?.payload.declineReason).toBe('insufficient_funds');
    });

    it('should handle network timeouts and offline payment queuing', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = mockBusinessData.orders[0];
      const paymentAmount = order.total;

      // 1. Payment initiation
      await eventBus.emit('payment.initiated', {
        orderId: order.id,
        paymentId: 'pay_006',
        method: 'credit_card',
        amount: paymentAmount
      });

      // 2. Network timeout
      await eventBus.emit('payment.timeout', {
        paymentId: 'pay_006',
        timeoutReason: 'network_unavailable',
        timeoutAt: new Date().toISOString(),
        attemptDuration: 30000 // 30 seconds
      });

      // 3. Queue for offline processing
      await eventBus.emit('payment.queued_offline', {
        paymentId: 'pay_006',
        queuedAt: new Date().toISOString(),
        estimatedProcessingTime: '5 minutes'
      });

      // 4. Network restored, processing resumed
      await eventBus.emit('payment.processing_resumed', {
        paymentId: 'pay_006',
        resumedAt: new Date().toISOString(),
        queuePosition: 1
      });

      // 5. Successful authorization after network restoration
      await eventBus.emit('payment.card.authorized', {
        paymentId: 'pay_006',
        authorizationCode: 'AUTH888',
        processedOffline: true,
        authorizedAt: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const timeoutEvents = workflowEvents.filter(e => e.pattern === 'payment.timeout');
      const queuedEvents = workflowEvents.filter(e => e.pattern === 'payment.queued_offline');

      expect(timeoutEvents).toHaveLength(1);
      expect(queuedEvents).toHaveLength(1);
    });
  });

  describe('Refund Processing', () => {
    it('should handle full refund workflow', async () => {
      performance.start('refund-processing');

      await setupPaymentModules();
      const inventoryModule = createInventoryTestModule();
      await eventBus.registerModule(inventoryModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const originalOrder = mockBusinessData.orders[0];
      const originalPayment = 'pay_original_001';

      // 1. Refund initiation
      await eventBus.emit('refund.initiated', {
        refundId: 'refund_001',
        originalOrderId: originalOrder.id,
        originalPaymentId: originalPayment,
        refundAmount: originalOrder.total,
        refundType: 'full',
        reason: 'customer_dissatisfaction',
        initiatedBy: 'staff_001',
        initiatedAt: new Date().toISOString()
      });

      // 2. Manager approval (for refunds over $50)
      await eventBus.emit('refund.approved', {
        refundId: 'refund_001',
        approvedBy: 'manager_001',
        approvalReason: 'Valid customer complaint - food quality issue',
        approvedAt: new Date().toISOString()
      });

      // 3. Inventory restoration
      for (const item of originalOrder.items) {
        await eventBus.emit('inventory.returned', {
          itemId: item.id,
          quantity: item.quantity,
          reason: 'refund_return',
          referenceId: 'refund_001'
        });
      }

      // 4. Payment processing
      await eventBus.emit('refund.payment.initiated', {
        refundId: 'refund_001',
        paymentMethod: 'credit_card', // Same as original
        amount: originalOrder.total,
        targetAccount: 'original_card'
      });

      // 5. Refund authorization
      await eventBus.emit('refund.payment.authorized', {
        refundId: 'refund_001',
        authorizationCode: 'REF123456',
        authorizedAt: new Date().toISOString(),
        processor: 'stripe'
      });

      // 6. Refund completion
      await eventBus.emit('refund.completed', {
        refundId: 'refund_001',
        originalOrderId: originalOrder.id,
        refundAmount: originalOrder.total,
        completedAt: new Date().toISOString(),
        processedBy: 'staff_001'
      });

      // 7. Fiscal documentation
      await eventBus.emit('fiscal.credit_note.generated', {
        creditNoteId: 'cn_001',
        originalReceiptId: 'receipt_original_001',
        refundId: 'refund_001',
        amount: originalOrder.total,
        generatedAt: new Date().toISOString()
      });

      performance.end('refund-processing');

      await new Promise(resolve => setTimeout(resolve, 100));

      const refundEvents = workflowEvents.filter(e => e.pattern.startsWith('refund.'));
      const inventoryEvents = workflowEvents.filter(e => e.pattern === 'inventory.returned');
      const fiscalEvents = workflowEvents.filter(e => e.pattern.startsWith('fiscal.'));

      expect(refundEvents).toHaveLength(5);
      expect(inventoryEvents).toHaveLength(originalOrder.items.length);
      expect(fiscalEvents).toHaveLength(1);

      const completedRefund = workflowEvents.find(e => e.pattern === 'refund.completed');
      expect(completedRefund?.payload.refundAmount).toBe(originalOrder.total);

      const stats = performance.getStats('refund-processing');
      expect(stats.avg).toBeLessThan(200);
    });

    it('should handle partial refund for specific items', async () => {
      await setupPaymentModules();
      const inventoryModule = createInventoryTestModule();
      await eventBus.registerModule(inventoryModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const originalOrder = mockBusinessData.orders[0];
      const refundItem = originalOrder.items[0]; // Refund first item only
      const refundAmount = refundItem.price * refundItem.quantity;

      // 1. Partial refund initiation
      await eventBus.emit('refund.initiated', {
        refundId: 'refund_002',
        originalOrderId: originalOrder.id,
        refundAmount,
        refundType: 'partial',
        refundItems: [refundItem],
        reason: 'wrong_item_delivered',
        initiatedBy: 'staff_002'
      });

      // 2. Item-specific inventory return
      await eventBus.emit('inventory.returned', {
        itemId: refundItem.id,
        quantity: refundItem.quantity,
        reason: 'partial_refund',
        referenceId: 'refund_002'
      });

      // 3. Partial refund processing
      await eventBus.emit('refund.payment.initiated', {
        refundId: 'refund_002',
        paymentMethod: 'credit_card',
        amount: refundAmount,
        targetAccount: 'original_card'
      });

      // 4. Completion
      await eventBus.emit('refund.completed', {
        refundId: 'refund_002',
        originalOrderId: originalOrder.id,
        refundAmount,
        refundType: 'partial',
        completedAt: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const refundEvents = workflowEvents.filter(e => e.pattern.startsWith('refund.'));
      expect(refundEvents).toHaveLength(3);

      const completedRefund = workflowEvents.find(e => e.pattern === 'refund.completed');
      expect(completedRefund?.payload.refundType).toBe('partial');
      expect(completedRefund?.payload.refundAmount).toBe(refundAmount);
    });
  });

  describe('Tip and Gratuity Processing', () => {
    it('should handle tip distribution workflow', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const order = mockBusinessData.orders[0];
      const tipAmount = 15.00;
      const serviceStaff = ['staff_001', 'staff_003']; // Server and kitchen

      // 1. Tip addition to payment
      await eventBus.emit('payment.tip.added', {
        orderId: order.id,
        paymentId: 'pay_tip_001',
        tipAmount,
        tipMethod: 'percentage', // 22% tip
        percentage: 22.2,
        addedBy: 'customer'
      });

      // 2. Tip distribution rules application
      await eventBus.emit('payment.tip.distribution.calculated', {
        orderId: order.id,
        totalTipAmount: tipAmount,
        distributionRules: {
          server: 70, // 70%
          kitchen: 20, // 20%
          house: 10   // 10%
        },
        distributions: [
          { staffId: 'staff_001', role: 'server', amount: 10.50 },
          { staffId: 'staff_003', role: 'kitchen', amount: 3.00 },
          { beneficiary: 'house', amount: 1.50 }
        ]
      });

      // 3. Individual tip allocations
      await eventBus.emit('payment.tip.allocated', {
        staffId: 'staff_001',
        orderId: order.id,
        amount: 10.50,
        tipType: 'service',
        allocatedAt: new Date().toISOString()
      });

      await eventBus.emit('payment.tip.allocated', {
        staffId: 'staff_003',
        orderId: order.id,
        amount: 3.00,
        tipType: 'kitchen',
        allocatedAt: new Date().toISOString()
      });

      // 4. Daily tip summary
      await eventBus.emit('payment.tip.daily_summary', {
        date: new Date().toISOString().split('T')[0],
        staffTips: {
          'staff_001': { amount: 85.50, orderCount: 12 },
          'staff_003': { amount: 45.00, orderCount: 15 }
        },
        totalTipsDistributed: 130.50,
        houseAmount: 18.50
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const tipEvents = workflowEvents.filter(e => e.pattern.includes('tip'));
      expect(tipEvents).toHaveLength(5);

      const distributionEvent = workflowEvents.find(e => e.pattern === 'payment.tip.distribution.calculated');
      expect(distributionEvent?.payload.distributions).toHaveLength(3);
    });

    it('should handle automatic gratuity for large groups', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const largeGroupOrder = { ...mockBusinessData.orders[0], partySize: 8 };
      const autoGratuityRate = 0.18; // 18%
      const autoGratuityAmount = largeGroupOrder.total * autoGratuityRate;

      // 1. Auto-gratuity calculation
      await eventBus.emit('payment.auto_gratuity.calculated', {
        orderId: largeGroupOrder.id,
        partySize: largeGroupOrder.partySize,
        gratuityRate: autoGratuityRate,
        gratuityAmount: autoGratuityAmount,
        reason: 'party_size_8_or_more',
        calculatedAt: new Date().toISOString()
      });

      // 2. Customer notification
      await eventBus.emit('payment.auto_gratuity.disclosed', {
        orderId: largeGroupOrder.id,
        disclosureMethod: 'receipt_note',
        disclosedAt: new Date().toISOString()
      });

      // 3. Payment with auto-gratuity
      await eventBus.emit('payment.completed', {
        paymentId: 'pay_auto_tip_001',
        orderId: largeGroupOrder.id,
        method: 'credit_card',
        amount: largeGroupOrder.total,
        autoGratuity: autoGratuityAmount,
        totalAmount: largeGroupOrder.total + autoGratuityAmount
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const gratuityEvents = workflowEvents.filter(e => e.pattern.includes('auto_gratuity'));
      expect(gratuityEvents).toHaveLength(2);

      const calculatedGratuity = workflowEvents.find(e => e.pattern === 'payment.auto_gratuity.calculated');
      expect(calculatedGratuity?.payload.gratuityRate).toBe(0.18);
    });
  });

  describe('Integration and Reporting', () => {
    it('should generate daily payment reconciliation report', async () => {
      await setupPaymentModules();

      const workflowEvents: any[] = [];
      eventBus.on('*', (_event) => workflowEvents.push(event));

      const reportDate = new Date().toISOString().split('T')[0];

      // Daily reconciliation
      await eventBus.emit('payment.reconciliation.daily', {
        date: reportDate,
        summary: {
          totalTransactions: 245,
          totalAmount: 12450.75,
          paymentMethods: {
            cash: { count: 85, amount: 2890.25 },
            credit_card: { count: 135, amount: 8560.50 },
            nfc: { count: 25, amount: 1000.00 }
          },
          refunds: {
            count: 3,
            amount: 125.50
          },
          tips: {
            totalAmount: 1890.45,
            averagePercentage: 18.2
          }
        },
        discrepancies: [],
        reconciliationStatus: 'balanced'
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const reconciliationEvents = workflowEvents.filter(e => e.pattern.includes('reconciliation'));
      expect(reconciliationEvents).toHaveLength(1);

      const dailyReconciliation = workflowEvents.find(e => e.pattern === 'payment.reconciliation.daily');
      expect(dailyReconciliation?.payload.summary.totalTransactions).toBe(245);
      expect(dailyReconciliation?.payload.reconciliationStatus).toBe('balanced');
    });
  });
});