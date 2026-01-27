/**
 * Tests for Shift Service
 * Comprehensive tests for shift validation and close operations
 *
 * @module shift-control/services/__tests__
 * @coverage-target >90%
 *
 * Mocking strategy based on:
 * - https://stackoverflow.com/questions/79111978/having-difficulty-mocking-supabase-eq-eq-with-jest
 * - https://stackoverflow.com/questions/77411385/how-to-mock-supabase-api-select-requests-in-nodejs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  OperationalShift,
  CloseValidationResult,
} from '../../types';

// ============================================
// MOCKS SETUP
// ============================================

// Create mock functions for terminal methods
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();

// Mock Supabase Client with proper chaining support
vi.mock('@/lib/supabase/client', () => {
  const createMockQueryBuilder = () => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  });

  return {
    supabase: {
      from: vi.fn(() => createMockQueryBuilder()),
    },
  };
});

// Mock EventBus
vi.mock('@/lib/events/EventBus', () => ({
  default: {
    emit: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  },
}));

// Mock Logger
vi.mock('@/lib/logging/Logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocks
import { supabase } from '@/lib/supabase/client';
import eventBus from '@/lib/events/EventBus';
import { logger } from '@/lib/logging/Logger';
import {
  validateCloseShift,
  closeShift,
  forceCloseShift,
} from '../shiftService';

// ============================================
// TEST DATA FIXTURES
// ============================================

const mockActiveShift: OperationalShift = {
  id: 'shift-123',
  business_id: 'business-456',
  opened_by: 'user-1',
  opened_at: '2024-01-01T08:00:00Z',
  status: 'active',
  created_at: '2024-01-01T08:00:00Z',
  updated_at: '2024-01-01T08:00:00Z',
};

const mockClosedShift: OperationalShift = {
  ...mockActiveShift,
  status: 'closed',
  closed_by: 'user-1',
  closed_at: '2024-01-01T16:00:00Z',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Setup mock responses for a validation scenario
 */
function setupValidationMocks(config: {
  shift?: OperationalShift | null;
  cashSessions?: Array<any>;
  openTables?: Array<any>;
  activeDeliveries?: Array<any>;
  pendingOrders?: Array<any>;
  pendingReturns?: Array<any>;
  checkedInStaff?: Array<any>;
  materials?: Array<any>;
  cashSessionDetails?: any;
}) {
  // Setup the from() mock to return different data based on table name
  const fromMock = supabase.from as ReturnType<typeof vi.fn>;

  fromMock.mockImplementation((table: string) => {
    const builder: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      single: vi.fn(),
    };

    // Configure terminal methods based on table
    switch (table) {
      case 'operational_shifts':
        builder.maybeSingle.mockResolvedValue({
          data: config.shift ?? null,
          error: null
        });
        builder.single.mockResolvedValue({
          data: config.shift ?? null,
          error: null
        });
        break;

      case 'cash_sessions':
        // For listing cash sessions
        builder.eq.mockImplementation((field: string) => {
          if (field === 'status') {
            return Promise.resolve({
              data: config.cashSessions ?? [],
              error: null
            });
          }
          return builder;
        });

        // For getting session details
        builder.single.mockResolvedValue({
          data: config.cashSessionDetails ?? null,
          error: null,
        });
        break;

      case 'tables':
        builder.eq.mockResolvedValue({
          data: config.openTables ?? [],
          error: null
        });
        break;

      case 'fulfillment_queue':
        builder.in.mockResolvedValue({
          data: config.pendingOrders ?? config.activeDeliveries ?? [],
          error: null
        });
        break;

      case 'rental_reservations':
        builder.lte.mockResolvedValue({
          data: config.pendingReturns ?? [],
          error: null
        });
        break;

      case 'employees':
        builder.eq.mockResolvedValue({
          data: config.checkedInStaff ?? [],
          error: null
        });
        break;

      case 'materials':
        builder.not.mockResolvedValue({
          data: config.materials ?? [],
          error: null
        });
        break;
    }

    return builder;
  });
}

/**
 * Setup mock for close shift operation
 * This creates a simpler mock where validation always passes
 */
function setupCloseMocks(config: {
  shift: OperationalShift;
  closedShift: OperationalShift;
  validationPasses?: boolean;
}) {
  // Use the full validation mocks setup but with empty data
  setupValidationMocks({
    shift: config.shift,
    cashSessions: [],
    openTables: [],
    activeDeliveries: [],
    pendingOrders: [],
    pendingReturns: [],
    checkedInStaff: [],
    materials: [],
  });

  // Then override the operational_shifts queries for the close operation
  const fromMock = supabase.from as ReturnType<typeof vi.fn>;
  const originalImplementation = fromMock.getMockImplementation();

  fromMock.mockImplementation((table: string) => {
    if (table === 'operational_shifts') {
      const builder: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(),
        single: vi.fn(),
      };

      builder.maybeSingle.mockResolvedValue({
        data: config.shift,
        error: null
      });

      builder.single.mockResolvedValue({
        data: config.closedShift,
        error: null
      });

      return builder;
    }

    // For other tables, use the original mock from setupValidationMocks
    return originalImplementation?.(table);
  });
}

// ============================================
// TEST SUITE: validateCloseShift()
// ============================================

describe('validateCloseShift()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases - No Blockers', () => {
    it('should return canClose: true when NO blockers exist', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      const result = await validateCloseShift('shift-123');

      expect(result.canClose).toBe(true);
      expect(result.blockers).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should emit shift.close_validation.requested event', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      await validateCloseShift('shift-123');

      expect(eventBus.emit).toHaveBeenCalledWith(
        'shift.close_validation.requested',
        expect.objectContaining({
          shift: mockActiveShift,
        }),
        'ShiftControl'
      );
    });

    it('should log validation passed when no blockers', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      await validateCloseShift('shift-123');

      expect(logger.info).toHaveBeenCalledWith(
        'ShiftControl',
        'Shift close validation passed',
        expect.objectContaining({
          shiftId: 'shift-123',
        })
      );
    });
  });

  describe('Blocker Detection - Cash Session', () => {
    it('should detect cash session as blocker when status is OPEN', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [{ id: 'cash-1', money_location_id: 'loc-1' }],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      const result = await validateCloseShift('shift-123');

      expect(result.canClose).toBe(false);
      expect(result.blockers).toHaveLength(1);
      expect(result.blockers[0]).toMatchObject({
        type: 'cash_session',
        message: 'Hay una sesión de caja abierta',
        affectedFeature: 'sales_pos',
      });
    });

    it('should NOT block when no cash sessions are open', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      const result = await validateCloseShift('shift-123');

      expect(result.canClose).toBe(true);
      const cashBlockers = result.blockers.filter(b => b.type === 'cash_session');
      expect(cashBlockers).toHaveLength(0);
    });
  });

  describe('Blocker Detection - Open Tables', () => {
    it('should detect open tables as blocker', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [
          { id: 'table-1', number: 5 },
          { id: 'table-2', number: 10 },
        ],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      const result = await validateCloseShift('shift-123');

      expect(result.canClose).toBe(false);
      expect(result.blockers).toHaveLength(1);
      expect(result.blockers[0]).toMatchObject({
        type: 'open_tables',
        message: 'Hay 2 mesa(s) abierta(s)',
        count: 2,
        affectedFeature: 'sales_pos',
      });
    });

    it('should include count in blocker when tables are open', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [{ id: 'table-1', number: 3 }],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      const result = await validateCloseShift('shift-123');

      const tableBlocker = result.blockers.find(b => b.type === 'open_tables');
      expect(tableBlocker?.count).toBe(1);
    });
  });

  describe('Blocker Detection - Pending Returns', () => {
    it('should detect overdue rental returns as blocker', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [
          {
            id: 'rental-1',
            item_id: 'item-1',
            customer_id: 'customer-1',
            end_datetime: '2024-01-01T06:00:00Z',
          },
        ],
        checkedInStaff: [],
        materials: [],
      });

      const result = await validateCloseShift('shift-123');

      expect(result.canClose).toBe(false);
      const returnsBlocker = result.blockers.find(b => b.type === 'pending_returns');
      expect(returnsBlocker).toMatchObject({
        type: 'pending_returns',
        message: '1 devolución(es) de activos vencida(s)',
        count: 1,
        affectedFeature: 'asset_rental',
      });
    });
  });

  describe('Warning Detection - Unchecked Staff', () => {
    it('should detect staff without checkout as warning', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [
          {
            id: 'emp-1',
            first_name: 'John',
            last_name: 'Doe',
            checked_in_at: '2024-01-01T08:00:00Z',
          },
          {
            id: 'emp-2',
            first_name: 'Jane',
            last_name: 'Smith',
            checked_in_at: '2024-01-01T09:00:00Z',
          },
        ],
        materials: [],
      });

      const result = await validateCloseShift('shift-123');

      expect(result.canClose).toBe(true); // Warnings don't block
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toMatchObject({
        type: 'unchecked_staff',
        message: '2 empleado(s) no han hecho checkout',
        severity: 'medium',
      });
    });
  });

  describe('Warning Detection - Low Stock Materials', () => {
    it('should detect materials with stock below min_stock as warning', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [
          { id: 'mat-1', name: 'Flour', stock: 5, min_stock: 10 },
          { id: 'mat-2', name: 'Sugar', stock: 2, min_stock: 15 },
          { id: 'mat-3', name: 'Salt', stock: 20, min_stock: 10 }, // Not low
        ],
      });

      const result = await validateCloseShift('shift-123');

      expect(result.canClose).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toMatchObject({
        type: 'inventory_count',
        message: '2 material(es) con stock bajo',
        severity: 'high',
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error if shift does not exist', async () => {
      setupValidationMocks({
        shift: null,
      });

      await expect(validateCloseShift('non-existent-shift')).rejects.toThrow(
        'Turno no encontrado'
      );
    });

    it('should throw error if shift is not active', async () => {
      setupValidationMocks({
        shift: mockClosedShift,
      });

      await expect(validateCloseShift('shift-123')).rejects.toThrow(
        'El turno no está activo'
      );
    });
  });
});

// ============================================
// TEST SUITE: closeShift()
// ============================================

describe('closeShift()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Enforcement (Default Behavior)', () => {
    it('should validate automatically before closing by default', async () => {
      setupCloseMocks({
        shift: mockActiveShift,
        closedShift: mockClosedShift,
        validationPasses: true,
      });

      await closeShift('shift-123', { closed_by: 'user-1' });

      expect(logger.debug).toHaveBeenCalledWith(
        'ShiftControl',
        'Validating shift before close'
      );
    });

    it('should throw error if validation fails with blockers', async () => {
      setupValidationMocks({
        shift: mockActiveShift,
        cashSessions: [{ id: 'cash-1', money_location_id: 'loc-1' }],
        openTables: [],
        activeDeliveries: [],
        pendingOrders: [],
        pendingReturns: [],
        checkedInStaff: [],
        materials: [],
      });

      await expect(
        closeShift('shift-123', { closed_by: 'user-1' })
      ).rejects.toThrow('No se puede cerrar el turno');
    });

    it('should close successfully if NO blockers exist', async () => {
      setupCloseMocks({
        shift: mockActiveShift,
        closedShift: mockClosedShift,
      });

      const result = await closeShift('shift-123', { closed_by: 'user-1' });

      expect(result.status).toBe('closed');
      expect(result.closed_by).toBe('user-1');
    });
  });

  describe('Skip Validation Option', () => {
    it('should skip validation when skipValidation option is true', async () => {
      setupCloseMocks({
        shift: mockActiveShift,
        closedShift: mockClosedShift,
      });

      await closeShift('shift-123', { closed_by: 'user-1' }, { skipValidation: true });

      expect(logger.warn).toHaveBeenCalledWith(
        'ShiftControl',
        'Skipping validation (force close)',
        { shiftId: 'shift-123' }
      );
    });
  });

  describe('Event Emission', () => {
    it('should emit shift.closed event with correct payload', async () => {
      setupCloseMocks({
        shift: mockActiveShift,
        closedShift: mockClosedShift,
      });

      await closeShift('shift-123', { closed_by: 'user-1', notes: 'Good shift' });

      expect(eventBus.emit).toHaveBeenCalledWith(
        'shift.closed',
        expect.objectContaining({
          shift: mockClosedShift,
          closed_by_user: expect.objectContaining({
            id: 'user-1',
          }),
          notes: 'Good shift',
        }),
        'ShiftControl'
      );
    });
  });

  describe('Error Cases', () => {
    it('should throw error if shift does not exist', async () => {
      setupValidationMocks({
        shift: null,
      });

      await expect(closeShift('non-existent', { closed_by: 'user-1' })).rejects.toThrow(
        'Turno no encontrado'
      );
    });

    it('should throw error if shift is already closed', async () => {
      setupValidationMocks({
        shift: mockClosedShift,
      });

      await expect(closeShift('shift-123', { closed_by: 'user-1' })).rejects.toThrow(
        'El turno ya está cerrado'
      );
    });
  });
});

// ============================================
// TEST SUITE: forceCloseShift()
// ============================================

describe('forceCloseShift()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should bypass validation completely', async () => {
    setupCloseMocks({
      shift: mockActiveShift,
      closedShift: mockClosedShift,
    });

    await forceCloseShift('shift-123', { closed_by: 'admin-1' });

    expect(logger.warn).toHaveBeenCalledWith(
      'ShiftControl',
      'Force closing shift (admin override)',
      expect.objectContaining({
        shiftId: 'shift-123',
        closedBy: 'admin-1',
      })
    );
  });

  it('should close shift even with blockers present', async () => {
    setupCloseMocks({
      shift: mockActiveShift,
      closedShift: mockClosedShift,
    });

    const result = await forceCloseShift('shift-123', { closed_by: 'admin-1' });

    expect(result.status).toBe('closed');
  });

  it('should log admin override warning', async () => {
    setupCloseMocks({
      shift: mockActiveShift,
      closedShift: mockClosedShift,
    });

    await forceCloseShift('shift-123', { closed_by: 'admin-1' });

    expect(logger.warn).toHaveBeenCalledWith(
      'ShiftControl',
      'Force closing shift (admin override)',
      expect.objectContaining({
        shiftId: 'shift-123',
        closedBy: 'admin-1',
      })
    );
  });
});
