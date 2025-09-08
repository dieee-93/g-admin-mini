// Mock data - Realistic test data for G-Admin Mini EventBus testing
// Provides comprehensive test data covering all business scenarios

import type { NamespacedEvent, EventPattern } from '../../types';

// Mock business entities
export const mockBusinessData = {
  // Orders
  orders: [
    {
      id: 'ORD-001',
      customerId: 'CUST-VIP-001',
      items: [
        { id: 'ITEM-001', name: 'Hamburguesa Premium', quantity: 2, unitPrice: 18.99, total: 37.98 },
        { id: 'ITEM-002', name: 'Papas Gourmet', quantity: 1, unitPrice: 12.50, total: 12.50 }
      ],
      subtotal: 50.48,
      tax: 10.60,
      total: 61.08,
      status: 'pending',
      timestamp: '2025-01-15T14:30:00Z',
      paymentMethod: 'card',
      notes: 'Sin cebolla en la hamburguesa'
    },
    {
      id: 'ORD-002',
      customerId: 'CUST-REG-002',
      items: [
        { id: 'ITEM-003', name: 'Pizza Margarita', quantity: 1, unitPrice: 24.99, total: 24.99 }
      ],
      subtotal: 24.99,
      tax: 5.25,
      total: 30.24,
      status: 'completed',
      timestamp: '2025-01-15T13:15:00Z',
      paymentMethod: 'cash'
    }
  ],

  // Customers
  customers: [
    {
      id: 'CUST-VIP-001',
      name: 'María Elena García',
      email: 'maria.garcia@email.com',
      phone: '+54-11-4567-8901',
      tier: 'VIP',
      totalOrders: 47,
      totalSpent: 2847.65,
      lastVisit: '2025-01-15T14:30:00Z',
      preferences: {
        allergens: ['nuts'],
        favoriteItems: ['ITEM-001', 'ITEM-005']
      }
    },
    {
      id: 'CUST-REG-002',
      name: 'Juan Carlos López',
      email: 'juan.lopez@email.com',
      phone: '+54-11-2345-6789',
      tier: 'REGULAR',
      totalOrders: 12,
      totalSpent: 456.78,
      lastVisit: '2025-01-15T13:15:00Z'
    }
  ],

  // Inventory items
  inventory: [
    {
      id: 'ITEM-001',
      name: 'Hamburguesa Premium',
      category: 'burgers',
      currentStock: 25,
      minimumStock: 10,
      maximumStock: 100,
      unitCost: 8.50,
      salePrice: 18.99,
      supplier: 'SUPP-001',
      lastUpdated: '2025-01-15T12:00:00Z',
      status: 'active'
    },
    {
      id: 'ITEM-002',
      name: 'Papas Gourmet',
      category: 'sides',
      currentStock: 5, // Low stock scenario
      minimumStock: 20,
      maximumStock: 80,
      unitCost: 4.25,
      salePrice: 12.50,
      supplier: 'SUPP-002',
      lastUpdated: '2025-01-15T11:30:00Z',
      status: 'active'
    },
    {
      id: 'ITEM-003',
      name: 'Pizza Margarita',
      category: 'pizza',
      currentStock: 15,
      minimumStock: 5,
      maximumStock: 50,
      unitCost: 11.75,
      salePrice: 24.99,
      supplier: 'SUPP-003',
      lastUpdated: '2025-01-15T10:00:00Z',
      status: 'active'
    }
  ],

  // Staff
  staff: [
    {
      id: 'STAFF-001',
      name: 'Ana Rodríguez',
      position: 'head_chef',
      department: 'kitchen',
      email: 'ana.rodriguez@gadmin.com',
      phone: '+54-11-1111-2222',
      status: 'active',
      shiftStart: '08:00',
      shiftEnd: '16:00',
      hourlyRate: 2500.00,
      lastClockIn: '2025-01-15T08:00:00Z'
    },
    {
      id: 'STAFF-002',
      name: 'Luis Torres',
      position: 'waiter',
      department: 'service',
      email: 'luis.torres@gadmin.com',
      phone: '+54-11-3333-4444',
      status: 'active',
      shiftStart: '12:00',
      shiftEnd: '20:00',
      hourlyRate: 1800.00,
      lastClockIn: '2025-01-15T12:00:00Z'
    }
  ],

  // Payments
  payments: [
    {
      id: 'PAY-001',
      orderId: 'ORD-001',
      method: 'credit_card',
      amount: 61.08,
      currency: 'ARS',
      status: 'completed',
      transactionId: 'TXN-ABC123',
      timestamp: '2025-01-15T14:35:00Z',
      gateway: 'mercadopago'
    },
    {
      id: 'PAY-002',
      orderId: 'ORD-002',
      method: 'cash',
      amount: 30.24,
      currency: 'ARS',
      status: 'completed',
      received: 35.00,
      change: 4.76,
      timestamp: '2025-01-15T13:20:00Z'
    }
  ],

  // Fiscal data
  fiscal: [
    {
      id: 'INV-001',
      type: 'FACTURA_B',
      orderId: 'ORD-001',
      client: {
        name: 'María Elena García',
        cuit: '27-12345678-9',
        condition: 'MONOTRIBUTO'
      },
      items: [
        { description: 'Hamburguesa Premium', quantity: 2, unitPrice: 18.99, taxRate: 21 },
        { description: 'Papas Gourmet', quantity: 1, unitPrice: 12.50, taxRate: 21 }
      ],
      amounts: {
        subtotal: 50.48,
        ivaAmount: 10.60,
        otherTaxes: 0,
        total: 61.08
      },
      afipStatus: 'approved',
      afipNumber: '0001-00000123',
      timestamp: '2025-01-15T14:36:00Z'
    }
  ]
};

// Mock event templates for different scenarios
export const mockEventTemplates = {
  // Sales events
  orderCreated: (orderId: string, customerId: string) => ({
    pattern: 'sales.order.created' as EventPattern,
    payload: {
      orderId,
      customerId,
      items: mockBusinessData.orders[0].items,
      total: mockBusinessData.orders[0].total,
      timestamp: new Date().toISOString()
    }
  }),

  orderCompleted: (orderId: string) => ({
    pattern: 'sales.order.completed' as EventPattern,
    payload: {
      orderId,
      completedAt: new Date().toISOString(),
      preparationTime: Math.floor(Math.random() * 30) + 10 // 10-40 minutes
    }
  }),

  // Inventory events
  stockLow: (itemId: string, currentStock: number, minimumStock: number) => ({
    pattern: 'inventory.stock.low' as EventPattern,
    payload: {
      itemId,
      itemName: mockBusinessData.inventory.find(i => i.id === itemId)?.name || 'Unknown Item',
      currentStock,
      minimumStock,
      category: mockBusinessData.inventory.find(i => i.id === itemId)?.category || 'unknown',
      urgency: currentStock < minimumStock * 0.5 ? 'critical' : 'warning'
    }
  }),

  stockUpdated: (itemId: string, newStock: number, operation: 'sale' | 'restock' | 'adjustment') => ({
    pattern: 'inventory.stock.updated' as EventPattern,
    payload: {
      itemId,
      previousStock: newStock + (operation === 'sale' ? 1 : -1),
      newStock,
      operation,
      timestamp: new Date().toISOString()
    }
  }),

  // Staff events
  clockIn: (staffId: string) => ({
    pattern: 'staff.clock.in' as EventPattern,
    payload: {
      staffId,
      staffName: mockBusinessData.staff.find(s => s.id === staffId)?.name || 'Unknown Staff',
      timestamp: new Date().toISOString(),
      location: 'main_terminal'
    }
  }),

  clockOut: (staffId: string) => ({
    pattern: 'staff.clock.out' as EventPattern,
    payload: {
      staffId,
      staffName: mockBusinessData.staff.find(s => s.id === staffId)?.name || 'Unknown Staff',
      timestamp: new Date().toISOString(),
      hoursWorked: Math.floor(Math.random() * 8) + 1 // 1-9 hours
    }
  }),

  // Payment events
  paymentProcessed: (orderId: string, amount: number) => ({
    pattern: 'payments.payment.processed' as EventPattern,
    payload: {
      orderId,
      amount,
      currency: 'ARS',
      method: 'credit_card',
      status: 'completed',
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString()
    }
  }),

  paymentFailed: (orderId: string, amount: number, reason: string) => ({
    pattern: 'payments.payment.failed' as EventPattern,
    payload: {
      orderId,
      amount,
      reason,
      timestamp: new Date().toISOString(),
      retryable: true
    }
  }),

  // Customer events
  customerCreated: (customerId: string) => ({
    pattern: 'customers.customer.created' as EventPattern,
    payload: {
      customerId,
      customerData: mockBusinessData.customers.find(c => c.id === customerId) || mockBusinessData.customers[0],
      source: 'pos_system',
      timestamp: new Date().toISOString()
    }
  }),

  customerUpdated: (customerId: string, changes: Record<string, any>) => ({
    pattern: 'customers.customer.updated' as EventPattern,
    payload: {
      customerId,
      changes,
      timestamp: new Date().toISOString()
    }
  }),

  // Kitchen events
  kitchenOrderReceived: (orderId: string) => ({
    pattern: 'kitchen.order.received' as EventPattern,
    payload: {
      orderId,
      items: mockBusinessData.orders[0].items,
      priority: Math.random() > 0.5 ? 'normal' : 'urgent',
      estimatedTime: Math.floor(Math.random() * 25) + 15, // 15-40 minutes
      timestamp: new Date().toISOString()
    }
  }),

  kitchenOrderCompleted: (orderId: string) => ({
    pattern: 'kitchen.order.completed' as EventPattern,
    payload: {
      orderId,
      actualTime: Math.floor(Math.random() * 30) + 10,
      quality: Math.random() > 0.1 ? 'good' : 'needs_attention',
      timestamp: new Date().toISOString()
    }
  }),

  // System events
  systemError: (moduleId: string, error: string) => ({
    pattern: 'system.error' as EventPattern,
    payload: {
      moduleId,
      error,
      severity: Math.random() > 0.7 ? 'critical' : 'warning',
      timestamp: new Date().toISOString(),
      stackTrace: `Error in ${moduleId}: ${error}\n  at Module.handle (${moduleId}.ts:123)\n  at EventBus.emit (EventBus.ts:456)`
    }
  }),

  systemHealthCheck: (moduleId: string, healthy: boolean) => ({
    pattern: 'system.health.check' as EventPattern,
    payload: {
      moduleId,
      status: healthy ? 'healthy' : 'unhealthy',
      metrics: {
        cpu: Math.random() * 100,
        memory: Math.random() * 1024,
        responseTime: Math.random() * 1000
      },
      timestamp: new Date().toISOString()
    }
  })
};

// Complex business scenarios data
export const businessScenarios = {
  // Complete order lifecycle
  fullOrderFlow: {
    customer: mockBusinessData.customers[0],
    order: mockBusinessData.orders[0],
    payment: mockBusinessData.payments[0],
    events: [
      'customers.customer.identified',
      'sales.order.created',
      'inventory.stock.checked',
      'kitchen.order.received',
      'payments.payment.requested',
      'payments.payment.processed',
      'kitchen.order.completed',
      'sales.order.completed',
      'inventory.stock.updated',
      'fiscal.invoice.generated'
    ]
  },

  // Staff management scenario
  staffWorkflow: {
    staff: mockBusinessData.staff,
    events: [
      'staff.clock.in',
      'staff.shift.started',
      'staff.break.started',
      'staff.break.ended',
      'staff.clock.out',
      'staff.overtime.calculated'
    ]
  },

  // Inventory management scenario
  inventoryWorkflow: {
    items: mockBusinessData.inventory,
    events: [
      'inventory.stock.updated',
      'inventory.stock.low',
      'inventory.restock.requested',
      'inventory.restock.approved',
      'inventory.restock.received',
      'inventory.stock.updated'
    ]
  },

  // Error and recovery scenario
  errorRecoveryFlow: {
    events: [
      'system.error',
      'system.health.degraded',
      'system.recovery.initiated',
      'system.recovery.completed',
      'system.health.restored'
    ]
  }
};

// High-volume test data generators
export const dataGenerators = {
  // Generate bulk orders for stress testing
  generateOrders: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      ...mockEventTemplates.orderCreated(`ORD-BULK-${i.toString().padStart(6, '0')}`, 'CUST-BULK'),
      id: `event_${i}`,
      timestamp: new Date(Date.now() + i * 1000).toISOString(),
      metadata: {
        source: 'bulk_generator',
        sequence: i,
        batch: Math.floor(i / 100)
      }
    }));
  },

  // Generate concurrent events for load testing
  generateConcurrentEvents: (patterns: EventPattern[], count: number) => {
    return Array.from({ length: count }, (_, i) => {
      const pattern = patterns[i % patterns.length];
      return {
        pattern,
        payload: { 
          id: `concurrent_${i}`, 
          data: `test_data_${i}`,
          timestamp: new Date().toISOString()
        },
        metadata: {
          source: 'concurrent_generator',
          sequence: i,
          pattern
        }
      };
    });
  },

  // Generate events with large payloads for performance testing
  generateLargePayloadEvents: (count: number, payloadSizeKB: number) => {
    const largeData = 'x'.repeat(payloadSizeKB * 1024);
    return Array.from({ length: count }, (_, i) => ({
      pattern: 'performance.large.payload' as EventPattern,
      payload: {
        id: `large_${i}`,
        largeData,
        metadata: {
          payloadSize: payloadSizeKB,
          sequence: i
        }
      }
    }));
  }
};

// Edge cases and error scenarios
export const edgeCaseData = {
  // Events with special characters and unicode
  unicodeEvents: [
    { pattern: 'test.unicode.latin' as EventPattern, payload: { name: 'José María', note: 'Café con leche' } },
    { pattern: 'test.unicode.emoji' as EventPattern, payload: { name: 'Pizza 🍕', rating: '⭐⭐⭐⭐⭐' } },
    { pattern: 'test.unicode.chinese' as EventPattern, payload: { name: '北京烤鸭', price: '¥168' } }
  ],

  // Events with very long strings
  longStringEvents: [
    {
      pattern: 'test.long.string' as EventPattern,
      payload: {
        description: 'x'.repeat(10000), // 10KB string
        notes: 'y'.repeat(5000) // 5KB string
      }
    }
  ],

  // Events with deeply nested objects
  deeplyNestedEvents: [
    {
      pattern: 'test.nested.deep' as EventPattern,
      payload: {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  data: 'deeply nested data',
                  array: [1, 2, 3, { nested: true }]
                }
              }
            }
          }
        }
      }
    }
  ],

  // Events with null and undefined values
  nullValueEvents: [
    {
      pattern: 'test.null.values' as EventPattern,
      payload: {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        emptyArray: [],
        emptyObject: {}
      }
    }
  ]
};