// Test modules - Mock modules for EventBus testing
// Provides realistic test modules that simulate G-Admin Mini business logic

import type { ModuleDescriptor, EventHandler, ModuleHealth, EventPattern } from '../../types';

// Mock customer data for testing
export const mockCustomers = [
  { id: 'CUST-001', name: 'Juan Pérez', email: 'juan@email.com', tier: 'VIP' },
  { id: 'CUST-002', name: 'María García', email: 'maria@email.com', tier: 'REGULAR' },
  { id: 'CUST-003', name: 'Carlos López', email: 'carlos@email.com', tier: 'VIP' },
];

// Mock inventory items for testing
export const mockInventoryItems = [
  { id: 'ITEM-001', name: 'Hamburguesa Clásica', currentStock: 25, minimumStock: 10, price: 15.99 },
  { id: 'ITEM-002', name: 'Papas Fritas', currentStock: 5, minimumStock: 20, price: 8.50 },
  { id: 'ITEM-003', name: 'Coca Cola', currentStock: 50, minimumStock: 15, price: 3.99 },
];

// Mock orders for testing
export const mockOrders = [
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    items: [{ id: 'ITEM-001', quantity: 2, unitPrice: 15.99 }],
    total: 31.98,
    status: 'pending'
  },
  {
    id: 'ORD-002', 
    customerId: 'CUST-002',
    items: [{ id: 'ITEM-002', quantity: 1, unitPrice: 8.50 }],
    total: 8.50,
    status: 'completed'
  },
];

// Mock staff data for testing
export const mockStaff = [
  { id: 'STAFF-001', name: 'Ana Rodríguez', department: 'kitchen', status: 'active' },
  { id: 'STAFF-002', name: 'Luis Torres', department: 'service', status: 'active' },
  { id: 'STAFF-003', name: 'Sofia Chen', department: 'management', status: 'active' },
];

// Sales module mock
export const createSalesTestModule = (): ModuleDescriptor => ({
  id: 'test-sales',
  name: 'Test Sales Module',
  version: '2.0.0-test',
  description: 'Mock sales module for testing',
  dependencies: ['test-inventory', 'test-customers'],
  eventSubscriptions: [
    {
      pattern: 'inventory.stock.low',
      handler: 'handleLowStock',
      priority: 'high'
    },
    {
      pattern: 'customers.profile.updated',
      handler: 'handleCustomerUpdate',
      priority: 'medium'
    }
  ],
  healthCheck: async () => ({
    status: 'active',
    message: 'Test sales module operational',
    metrics: {
      eventsProcessed: Math.floor(Math.random() * 100),
      eventsEmitted: Math.floor(Math.random() * 50),
      errorRate: Math.random() * 5,
      avgProcessingTimeMs: Math.random() * 100,
      queueSize: Math.floor(Math.random() * 10)
    },
    dependencies: {
      'test-inventory': true,
      'test-customers': true
    },
    lastCheck: new Date()
  }),
  onActivate: async () => {
    console.log('[TestSalesModule] Activating...');
  },
  onDeactivate: async () => {
    console.log('[TestSalesModule] Deactivating...');
  },
  config: {
    eventNamespace: 'sales',
    maxConcurrentEvents: 10,
    healthCheckIntervalMs: 5000,
    gracefulShutdownTimeoutMs: 3000
  }
});

// Inventory module mock
export const createInventoryTestModule = (): ModuleDescriptor => ({
  id: 'test-inventory',
  name: 'Test Inventory Module',
  version: '2.0.0-test',
  description: 'Mock inventory module for testing',
  dependencies: [],
  eventSubscriptions: [
    {
      pattern: 'sales.order.completed',
      handler: 'updateStock',
      priority: 'critical'
    },
    {
      pattern: 'inventory.restock.requested',
      handler: 'processRestock',
      priority: 'high'
    }
  ],
  healthCheck: async () => ({
    status: 'active',
    message: 'Test inventory module operational',
    metrics: {
      eventsProcessed: Math.floor(Math.random() * 200),
      eventsEmitted: Math.floor(Math.random() * 80),
      errorRate: Math.random() * 2,
      avgProcessingTimeMs: Math.random() * 50,
      queueSize: Math.floor(Math.random() * 5)
    },
    dependencies: {},
    lastCheck: new Date()
  }),
  onActivate: async () => {
    console.log('[TestInventoryModule] Activating...');
  },
  onDeactivate: async () => {
    console.log('[TestInventoryModule] Deactivating...');
  },
  config: {
    eventNamespace: 'inventory',
    maxConcurrentEvents: 20,
    healthCheckIntervalMs: 5000,
    gracefulShutdownTimeoutMs: 3000
  }
});

// Customers module mock
export const createCustomersTestModule = (): ModuleDescriptor => ({
  id: 'test-customers',
  name: 'Test Customers Module',
  version: '2.0.0-test',
  description: 'Mock customers module for testing',
  dependencies: [],
  eventSubscriptions: [
    {
      pattern: 'sales.order.created',
      handler: 'updateCustomerActivity',
      priority: 'medium'
    }
  ],
  healthCheck: async () => ({
    status: 'active',
    message: 'Test customers module operational',
    metrics: {
      eventsProcessed: Math.floor(Math.random() * 50),
      eventsEmitted: Math.floor(Math.random() * 30),
      errorRate: Math.random() * 1,
      avgProcessingTimeMs: Math.random() * 30,
      queueSize: Math.floor(Math.random() * 3)
    },
    dependencies: {},
    lastCheck: new Date()
  }),
  onActivate: async () => {
    console.log('[TestCustomersModule] Activating...');
  },
  onDeactivate: async () => {
    console.log('[TestCustomersModule] Deactivating...');
  },
  config: {
    eventNamespace: 'customers',
    maxConcurrentEvents: 15,
    healthCheckIntervalMs: 5000,
    gracefulShutdownTimeoutMs: 3000
  }
});

// Staff module mock
export const createStaffTestModule = (): ModuleDescriptor => ({
  id: 'test-staff',
  name: 'Test Staff Module',
  version: '2.0.0-test',
  description: 'Mock staff module for testing',
  dependencies: [],
  eventSubscriptions: [
    {
      pattern: 'staff.clock.in',
      handler: 'recordClockIn',
      priority: 'high'
    },
    {
      pattern: 'staff.clock.out',
      handler: 'recordClockOut',
      priority: 'high'
    }
  ],
  healthCheck: async () => ({
    status: 'active',
    message: 'Test staff module operational',
    metrics: {
      eventsProcessed: Math.floor(Math.random() * 30),
      eventsEmitted: Math.floor(Math.random() * 20),
      errorRate: Math.random() * 0.5,
      avgProcessingTimeMs: Math.random() * 25,
      queueSize: Math.floor(Math.random() * 2)
    },
    dependencies: {},
    lastCheck: new Date()
  }),
  onActivate: async () => {
    console.log('[TestStaffModule] Activating...');
  },
  onDeactivate: async () => {
    console.log('[TestStaffModule] Deactivating...');
  },
  config: {
    eventNamespace: 'staff',
    maxConcurrentEvents: 5,
    healthCheckIntervalMs: 5000,
    gracefulShutdownTimeoutMs: 3000
  }
});

// Kitchen module mock (failing module for error testing)
export const createFailingKitchenTestModule = (): ModuleDescriptor => ({
  id: 'test-kitchen-failing',
  name: 'Test Kitchen Module (Failing)',
  version: '2.0.0-test',
  description: 'Mock kitchen module that simulates failures',
  dependencies: ['test-inventory'],
  eventSubscriptions: [
    {
      pattern: 'orders.new',
      handler: 'processOrder',
      priority: 'critical'
    }
  ],
  healthCheck: async () => {
    // Simulate random failures
    const isHealthy = Math.random() > 0.3; // 70% chance of failure
    return {
      status: isHealthy ? 'active' : 'error',
      message: isHealthy ? 'Kitchen operational' : 'Kitchen equipment malfunction',
      metrics: {
        eventsProcessed: Math.floor(Math.random() * 100),
        eventsEmitted: Math.floor(Math.random() * 50),
        errorRate: isHealthy ? Math.random() * 2 : Math.random() * 20 + 10,
        avgProcessingTimeMs: isHealthy ? Math.random() * 100 : Math.random() * 1000 + 500,
        queueSize: Math.floor(Math.random() * (isHealthy ? 5 : 50))
      },
      dependencies: {
        'test-inventory': Math.random() > 0.2 // 80% chance of dependency being healthy
      },
      lastCheck: new Date()
    };
  },
  onActivate: async () => {
    console.log('[TestKitchenModule] Attempting activation...');
    // Simulate activation failure sometimes
    if (Math.random() > 0.7) {
      throw new Error('Kitchen equipment not responding');
    }
  },
  onDeactivate: async () => {
    console.log('[TestKitchenModule] Deactivating...');
  },
  config: {
    eventNamespace: 'kitchen',
    maxConcurrentEvents: 25,
    healthCheckIntervalMs: 3000,
    gracefulShutdownTimeoutMs: 5000
  }
});

// Payment module mock
export const createPaymentTestModule = (): ModuleDescriptor => ({
  id: 'test-payment',
  name: 'Test Payment Module',
  version: '2.0.0-test',
  description: 'Mock payment module for testing',
  
  eventSubscriptions: [
    {
      pattern: 'payment.cash.received',
      handler: 'test-payment.processCashPayment'
    },
    {
      pattern: 'payment.card.authorized',
      handler: 'test-payment.processCardPayment'
    },
    {
      pattern: 'payment.mobile.scanned',
      handler: 'test-payment.processMobilePayment'
    }
  ],

  emits: [
    'payment.processed',
    'payment.failed',
    'payment.refunded'
  ],

  dependencies: ['test-fiscal'],

  healthCheck: async (): Promise<ModuleHealth> => ({
    status: 'healthy',
    details: {
      connected: true,
      latency: Math.floor(Math.random() * 50),
      transactionsProcessed: Math.floor(Math.random() * 1000)
    }
  })
});

// Fiscal module mock
export const createFiscalTestModule = (): ModuleDescriptor => ({
  id: 'test-fiscal',
  name: 'Test Fiscal Module',
  version: '2.0.0-test',
  description: 'Mock fiscal module for testing',
  
  eventSubscriptions: [
    {
      pattern: 'payment.processed',
      handler: 'test-fiscal.generateReceipt'
    },
    {
      pattern: 'fiscal.receipt.required',
      handler: 'test-fiscal.processReceiptRequest'
    }
  ],

  emits: [
    'fiscal.receipt.generated',
    'fiscal.receipt.failed',
    'fiscal.tax.calculated'
  ],

  dependencies: [],

  healthCheck: async (): Promise<ModuleHealth> => ({
    status: 'healthy',
    details: {
      connected: true,
      receiptsGenerated: Math.floor(Math.random() * 500),
      taxCalculations: Math.floor(Math.random() * 300)
    }
  })
});

// Test module factory
export const createTestModules = () => ({
  sales: createSalesTestModule(),
  inventory: createInventoryTestModule(),
  customers: createCustomersTestModule(),
  staff: createStaffTestModule(),
  payment: createPaymentTestModule(),
  fiscal: createFiscalTestModule(),
  kitchenFailing: createFailingKitchenTestModule()
});

// Event handlers for test modules
export const createTestEventHandlers = () => {
  const handlers = new Map<string, EventHandler>();

  // Sales handlers
  handlers.set('test-sales.handleLowStock', async (_event) => {
    console.log(`[TestSales] Handling low stock for ${event.payload.itemName}`);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  handlers.set('test-sales.handleCustomerUpdate', async (_event) => {
    console.log(`[TestSales] Customer ${event.payload.customerId} updated`);
    await new Promise(resolve => setTimeout(resolve, 5));
  });

  // Inventory handlers
  handlers.set('test-inventory.updateStock', async (_event) => {
    console.log(`[TestInventory] Updating stock for order ${event.payload.orderId}`);
    await new Promise(resolve => setTimeout(resolve, 15));
    
    // Emit low stock event if needed
    if (Math.random() > 0.8) {
      // This would emit via the actual EventBus instance
      console.log('[TestInventory] Stock is low, emitting alert');
    }
  });

  handlers.set('test-inventory.processRestock', async (_event) => {
    console.log(`[TestInventory] Processing restock for ${event.payload.itemId}`);
    await new Promise(resolve => setTimeout(resolve, 20));
  });

  // Customer handlers
  handlers.set('test-customers.updateCustomerActivity', async (_event) => {
    console.log(`[TestCustomers] Updated activity for customer ${event.payload.customerId}`);
    await new Promise(resolve => setTimeout(resolve, 8));
  });

  // Staff handlers
  handlers.set('test-staff.recordClockIn', async (_event) => {
    console.log(`[TestStaff] ${event.payload.staffId} clocked in at ${event.payload.timestamp}`);
    await new Promise(resolve => setTimeout(resolve, 12));
  });

  handlers.set('test-staff.recordClockOut', async (_event) => {
    console.log(`[TestStaff] ${event.payload.staffId} clocked out at ${event.payload.timestamp}`);
    await new Promise(resolve => setTimeout(resolve, 12));
  });

  // Payment handlers
  handlers.set('test-payment.processCashPayment', async (_event) => {
    console.log(`[TestPayment] Processing cash payment of ${event.payload.amount}`);
    await new Promise(resolve => setTimeout(resolve, 25));
    
    // Simulate successful cash processing
    console.log(`[TestPayment] Cash payment processed successfully`);
  });

  handlers.set('test-payment.processCardPayment', async (_event) => {
    console.log(`[TestPayment] Processing card payment of ${event.payload.amount}`);
    await new Promise(resolve => setTimeout(resolve, 35));
    
    // Simulate card processing
    if (Math.random() > 0.1) { // 90% success rate
      console.log(`[TestPayment] Card payment authorized`);
    } else {
      throw new Error('Card declined');
    }
  });

  handlers.set('test-payment.processMobilePayment', async (_event) => {
    console.log(`[TestPayment] Processing mobile payment of ${event.payload.amount}`);
    await new Promise(resolve => setTimeout(resolve, 20));
    console.log(`[TestPayment] Mobile payment processed successfully`);
  });

  // Fiscal handlers
  handlers.set('test-fiscal.generateReceipt', async (_event) => {
    console.log(`[TestFiscal] Generating receipt for payment ${event.payload.paymentId}`);
    await new Promise(resolve => setTimeout(resolve, 30));
    
    const receiptId = `REC-${Date.now()}`;
    console.log(`[TestFiscal] Receipt ${receiptId} generated successfully`);
  });

  handlers.set('test-fiscal.processReceiptRequest', async (_event) => {
    console.log(`[TestFiscal] Processing receipt request for ${event.payload.transactionId}`);
    await new Promise(resolve => setTimeout(resolve, 15));
  });

  // Kitchen handlers (that may fail)
  handlers.set('test-kitchen-failing.processOrder', async (_event) => {
    console.log(`[TestKitchen] Processing order ${event.payload.orderId}`);
    
    // Simulate random failures
    if (Math.random() > 0.7) {
      throw new Error('Kitchen equipment malfunction');
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  // Scheduling handlers
  handlers.set('test-scheduling.recordShiftAssignment', async (_event) => {
    console.log(`[TestScheduling] Recording shift assignment for ${event.payload.staffId}`);
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  handlers.set('test-scheduling.processShiftSwap', async (_event) => {
    console.log(`[TestScheduling] Processing shift swap between ${event.payload.fromStaffId} and ${event.payload.toStaffId}`);
    await new Promise(resolve => setTimeout(resolve, 15));
  });

  return handlers;
};

// Scheduling module mock
export const createSchedulingTestModule = (): ModuleDescriptor => ({
  id: 'test-scheduling',
  name: 'Test Scheduling Module',
  version: '2.0.0-test',
  description: 'Mock scheduling module for testing',
  dependencies: ['test-staff'],
  eventSubscriptions: [
    {
      pattern: 'staff.shift.assigned',
      handler: 'recordShiftAssignment',
      priority: 'medium'
    },
    {
      pattern: 'staff.shift.swapped',
      handler: 'processShiftSwap',
      priority: 'medium'
    }
  ],
  healthCheck: async () => ({
    status: 'active',
    message: 'Test scheduling module operational',
    metrics: {
      eventsProcessed: Math.floor(Math.random() * 100),
      eventsEmitted: Math.floor(Math.random() * 50),
      errorRate: Math.random() * 5,
      avgProcessingTimeMs: Math.random() * 100,
      queueSize: Math.floor(Math.random() * 10)
    },
    dependencies: {
      'test-staff': true
    },
    lastCheck: new Date()
  }),
  onActivate: async () => {
    console.log('[TestSchedulingModule] Activating...');
  },
  onDeactivate: async () => {
    console.log('[TestSchedulingModule] Deactivating...');
  },
  config: {
    eventNamespace: 'scheduling',
    maxConcurrentEvents: 15,
    healthCheckIntervalMs: 5000,
    gracefulShutdownTimeoutMs: 3000
  }
});