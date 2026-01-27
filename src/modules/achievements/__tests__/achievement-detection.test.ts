/**
 * ACHIEVEMENT DETECTION TESTS
 * 
 * Tests para verificar que los achievements se detectan correctamente
 * cuando se emiten eventos del EventBus.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventBus from '@/lib/events/EventBus';
import type { 
  ProductCreatedEventPayload,
  SaleCompletedEventPayload,
  StaffMemberAddedEventPayload 
} from '../types/events';

const eventBus = EventBus;

vi.mock('@/lib/notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Achievement Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Product Achievements', () => {
    it('should detect first product achievement', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '1', name: 'Test Product' },
        totalCount: 1,
        previousCount: 0,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('¡Logro desbloqueado!'),
            description: expect.stringContaining('primer producto'),
          })
        );
      });
    });

    it('should detect 5 products milestone', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '5', name: 'Fifth Product' },
        totalCount: 5,
        previousCount: 4,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('5 productos creados'),
          })
        );
      });
    });

    it('should detect 10 products milestone', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '10', name: 'Tenth Product' },
        totalCount: 10,
        previousCount: 9,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('10 productos creados'),
          })
        );
      });
    });

    it('should NOT show notification when not a milestone', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '7', name: 'Seventh Product' },
        totalCount: 7,
        previousCount: 6,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notify.success).not.toHaveBeenCalled();
    });

    it('should detect multiple milestones if count jumps (bulk import)', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: 'bulk', name: 'Bulk Import' },
        totalCount: 12,
        previousCount: 3,
        timestamp: Date.now(),
        triggeredBy: 'import',
      };

      eventBus.emit('products.created', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledTimes(2);
        expect(notify.success).toHaveBeenNthCalledWith(1, expect.objectContaining({
          description: expect.stringContaining('5 productos'),
        }));
        expect(notify.success).toHaveBeenNthCalledWith(2, expect.objectContaining({
          description: expect.stringContaining('10 productos'),
        }));
      });
    });
  });

  describe('Sales Achievements', () => {
    it('should detect first sale achievement', async () => {
      const payload: SaleCompletedEventPayload = {
        orderId: 'sale-1',
        orderTotal: 100,
        items: [{ productId: '1', quantity: 1 }],
        totalSales: 1,
        previousTotalSales: 0,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('sales.order_completed', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('1 venta'),
            description: 'Primera venta completada',
          })
        );
      });
    });

    it('should detect 10 sales milestone', async () => {
      const payload: SaleCompletedEventPayload = {
        orderId: 'sale-10',
        orderTotal: 1000,
        items: [{ productId: '1', quantity: 2 }],
        totalSales: 10,
        previousTotalSales: 9,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('sales.order_completed', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('10 ventas'),
            description: 'Tu negocio está creciendo',
          })
        );
      });
    });

    it('should detect 100 sales milestone', async () => {
      const payload: SaleCompletedEventPayload = {
        orderId: 'sale-100',
        orderTotal: 5000,
        items: [{ productId: '1', quantity: 5 }],
        totalSales: 100,
        previousTotalSales: 99,
        timestamp: Date.now(),
        triggeredBy: 'api',
      };

      eventBus.emit('sales.order_completed', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('100 ventas'),
            description: '¡Centenario de ventas!',
          })
        );
      });
    });
  });

  describe('Staff Achievements', () => {
    it('should detect first staff member achievement', async () => {
      const payload: StaffMemberAddedEventPayload = {
        staffId: 'staff-1',
        staffName: 'John Doe',
        role: 'OPERADOR',
        totalStaff: 1,
        previousTotalStaff: 0,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('staff.member_added', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.stringContaining('Primer empleado'),
            description: 'Tu equipo está creciendo',
          })
        );
      });
    });

    it('should NOT show notification for second staff member', async () => {
      const payload: StaffMemberAddedEventPayload = {
        staffId: 'staff-2',
        staffName: 'Jane Doe',
        role: 'VENDEDOR',
        totalStaff: 2,
        previousTotalStaff: 1,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('staff.member_added', payload);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notify.success).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing payload gracefully', async () => {
      eventBus.emit('products.created', null as any);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notify.success).not.toHaveBeenCalled();
    });

    it('should handle undefined totalCount', async () => {
      const payload = {
        product: { id: '1', name: 'Test' },
        previousCount: 0,
        timestamp: Date.now(),
        triggeredBy: 'manual' as const,
      };

      eventBus.emit('products.created', payload as any);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notify.success).not.toHaveBeenCalled();
    });

    it('should handle negative counts gracefully', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '1', name: 'Test' },
        totalCount: -1,
        previousCount: 0,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notify.success).not.toHaveBeenCalled();
    });
  });

  describe('Milestone Detection Logic', () => {
    it('should only trigger once per milestone', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '5', name: 'Fifth Product' },
        totalCount: 5,
        previousCount: 5,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(notify.success).not.toHaveBeenCalled();
    });

    it('should detect milestone when exactly reached', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '10', name: 'Tenth Product' },
        totalCount: 10,
        previousCount: 9,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledTimes(1);
      });
    });

    it('should detect milestone when count exceeds it', async () => {
      const payload: ProductCreatedEventPayload = {
        product: { id: '11', name: 'Eleventh Product' },
        totalCount: 11,
        previousCount: 9,
        timestamp: Date.now(),
        triggeredBy: 'manual',
      };

      eventBus.emit('products.created', payload);

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledTimes(1);
        expect(notify.success).toHaveBeenCalledWith(
          expect.objectContaining({
            description: expect.stringContaining('10 productos'),
          })
        );
      });
    });
  });

  describe('Performance', () => {
    it('should handle rapid successive events', async () => {
      const events = Array.from({ length: 10 }, (_, i) => ({
        product: { id: `${i + 1}`, name: `Product ${i + 1}` },
        totalCount: i + 1,
        previousCount: i,
        timestamp: Date.now(),
        triggeredBy: 'api' as const,
      }));

      events.forEach(payload => {
        eventBus.emit('products.created', payload);
      });

      await vi.waitFor(() => {
        expect(notify.success).toHaveBeenCalledTimes(3);
      });
    });
  });
});
