/**
 * Tests for useShiftValidation Hook
 * Tests for React hook that validates shift close operations
 *
 * @module shift-control/hooks/__tests__
 * @coverage-target >90%
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useShiftValidation } from '../useShiftValidation';
import * as shiftService from '../../services/shiftService';
import type {
  OperationalShift,
  CloseValidationResult,
} from '../../types';

// ============================================
// MOCKS SETUP
// ============================================

// Mock the service layer
vi.mock('../../services/shiftService', () => ({
  validateCloseShift: vi.fn(),
}));

// Mock Logger
vi.mock('@/lib/logging/Logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

import { logger } from '@/lib/logging/Logger';

// ============================================
// TEST DATA FIXTURES
// ============================================

const mockShift: OperationalShift = {
  id: 'shift-123',
  business_id: 'business-456',
  opened_by: 'user-1',
  opened_at: '2024-01-01T08:00:00Z',
  status: 'active',
  created_at: '2024-01-01T08:00:00Z',
  updated_at: '2024-01-01T08:00:00Z',
};

const mockValidationResultSuccess: CloseValidationResult = {
  canClose: true,
  blockers: [],
  warnings: [],
};

const mockValidationResultWithBlockers: CloseValidationResult = {
  canClose: false,
  blockers: [
    {
      type: 'cash_session',
      message: 'Hay una sesión de caja abierta',
      affectedFeature: 'sales_pos',
    },
    {
      type: 'open_tables',
      message: 'Hay 2 mesa(s) abierta(s)',
      count: 2,
      affectedFeature: 'sales_pos',
    },
  ],
  warnings: [],
};

const mockValidationResultWithWarnings: CloseValidationResult = {
  canClose: true,
  blockers: [],
  warnings: [
    {
      type: 'unchecked_staff',
      message: '2 empleado(s) no han hecho checkout',
      severity: 'medium',
    },
    {
      type: 'inventory_count',
      message: '3 material(es) con stock bajo',
      severity: 'high',
    },
  ],
};

const mockValidationResultWithBoth: CloseValidationResult = {
  canClose: false,
  blockers: [
    {
      type: 'pending_orders',
      message: 'Hay 5 orden(es) pendiente(s)',
      count: 5,
      affectedFeature: 'sales_pos',
    },
  ],
  warnings: [
    {
      type: 'low_cash',
      message: 'Efectivo en caja bajo: $50.00 (mínimo: $250.00)',
      severity: 'low',
    },
  ],
};

// ============================================
// TEST SUITE: useShiftValidation Hook
// ============================================

describe('useShiftValidation()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with validationResult as null', () => {
      const { result } = renderHook(() => useShiftValidation());

      expect(result.current.validationResult).toBeNull();
    });

    it('should initialize with isValidating as false', () => {
      const { result } = renderHook(() => useShiftValidation());

      expect(result.current.isValidating).toBe(false);
    });

    it('should provide all expected methods', () => {
      const { result } = renderHook(() => useShiftValidation());

      expect(result.current.validateClose).toBeInstanceOf(Function);
      expect(result.current.canCloseShift).toBeInstanceOf(Function);
      expect(result.current.hasBlockers).toBeInstanceOf(Function);
      expect(result.current.hasWarnings).toBeInstanceOf(Function);
    });
  });

  describe('validateClose() Method', () => {
    it('should call shiftService.validateCloseShift with correct shiftId', async () => {
      const validateCloseShiftMock = vi
        .mocked(shiftService.validateCloseShift)
        .mockResolvedValue(mockValidationResultSuccess);

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      expect(validateCloseShiftMock).toHaveBeenCalledWith('shift-123');
      expect(validateCloseShiftMock).toHaveBeenCalledTimes(1);
    });

    it('should set isValidating to true during validation', async () => {
      let resolveValidation: (value: CloseValidationResult) => void;
      const validationPromise = new Promise<CloseValidationResult>((resolve) => {
        resolveValidation = resolve;
      });

      vi.mocked(shiftService.validateCloseShift).mockReturnValue(validationPromise);

      const { result } = renderHook(() => useShiftValidation());

      // Start validation
      const validatePromise = result.current.validateClose(mockShift, 'user-1');

      // Check that isValidating is true
      await waitFor(() => {
        expect(result.current.isValidating).toBe(true);
      });

      // Complete validation
      resolveValidation!(mockValidationResultSuccess);
      await validatePromise;

      // Check that isValidating is false after completion
      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });
    });

    it('should set isValidating to false after validation completes', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });
    });

    it('should update validationResult with service response', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.validationResult).toEqual(mockValidationResultSuccess);
      });
    });

    it('should return validation result from service', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithBlockers
      );

      const { result } = renderHook(() => useShiftValidation());

      const validationResult = await result.current.validateClose(mockShift, 'user-1');

      expect(validationResult).toEqual(mockValidationResultWithBlockers);
    });

    it('should log debug message when validating', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      expect(logger.debug).toHaveBeenCalledWith(
        'ShiftControl',
        'Validating shift close (via service)',
        expect.objectContaining({
          shiftId: 'shift-123',
        })
      );
    });

    it('should handle validation errors and rethrow', async () => {
      const validationError = new Error('Turno no encontrado');

      vi.mocked(shiftService.validateCloseShift).mockRejectedValue(validationError);

      const { result } = renderHook(() => useShiftValidation());

      await expect(result.current.validateClose(mockShift, 'user-1')).rejects.toThrow(
        'Turno no encontrado'
      );
    });

    it('should log errors when validation fails', async () => {
      const validationError = new Error('Turno no encontrado');

      vi.mocked(shiftService.validateCloseShift).mockRejectedValue(validationError);

      const { result } = renderHook(() => useShiftValidation());

      try {
        await result.current.validateClose(mockShift, 'user-1');
      } catch (error) {
        // Expected to throw
      }

      expect(logger.error).toHaveBeenCalledWith(
        'ShiftControl',
        'Validation error',
        expect.objectContaining({
          error: validationError,
        })
      );
    });

    it('should set isValidating to false even when error occurs', async () => {
      const validationError = new Error('Database error');

      vi.mocked(shiftService.validateCloseShift).mockRejectedValue(validationError);

      const { result } = renderHook(() => useShiftValidation());

      try {
        await result.current.validateClose(mockShift, 'user-1');
      } catch (error) {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.isValidating).toBe(false);
      });
    });
  });

  describe('canCloseShift() Method', () => {
    it('should return validationResult.canClose when validation exists', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.canCloseShift()).toBe(true);
      });
    });

    it('should return false when validationResult is null', () => {
      const { result } = renderHook(() => useShiftValidation());

      expect(result.current.canCloseShift()).toBe(false);
    });

    it('should return false when validation has blockers', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithBlockers
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.canCloseShift()).toBe(false);
      });
    });

    it('should return true when validation has only warnings', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithWarnings
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.canCloseShift()).toBe(true);
      });
    });
  });

  describe('hasBlockers() Method', () => {
    it('should return true when blockers exist', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithBlockers
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasBlockers()).toBe(true);
      });
    });

    it('should return false when no blockers exist', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasBlockers()).toBe(false);
      });
    });

    it('should return false when validationResult is null', () => {
      const { result } = renderHook(() => useShiftValidation());

      expect(result.current.hasBlockers()).toBe(false);
    });

    it('should return true when both blockers and warnings exist', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithBoth
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasBlockers()).toBe(true);
      });
    });
  });

  describe('hasWarnings() Method', () => {
    it('should return true when warnings exist', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithWarnings
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasWarnings()).toBe(true);
      });
    });

    it('should return false when no warnings exist', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasWarnings()).toBe(false);
      });
    });

    it('should return false when validationResult is null', () => {
      const { result } = renderHook(() => useShiftValidation());

      expect(result.current.hasWarnings()).toBe(false);
    });

    it('should return true when both blockers and warnings exist', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithBoth
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasWarnings()).toBe(true);
      });
    });
  });

  describe('Hook Behavior with Multiple Validations', () => {
    it('should update state correctly when validating multiple times', async () => {
      // First validation - success
      vi.mocked(shiftService.validateCloseShift).mockResolvedValueOnce(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.canCloseShift()).toBe(true);
        expect(result.current.hasBlockers()).toBe(false);
      });

      // Second validation - with blockers
      vi.mocked(shiftService.validateCloseShift).mockResolvedValueOnce(
        mockValidationResultWithBlockers
      );

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.canCloseShift()).toBe(false);
        expect(result.current.hasBlockers()).toBe(true);
      });
    });

    it('should handle rapid consecutive validations', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      // Trigger multiple validations rapidly
      const promise1 = result.current.validateClose(mockShift, 'user-1');
      const promise2 = result.current.validateClose(mockShift, 'user-1');
      const promise3 = result.current.validateClose(mockShift, 'user-1');

      await Promise.all([promise1, promise2, promise3]);

      // All should complete successfully
      expect(result.current.isValidating).toBe(false);
      expect(result.current.validationResult).toEqual(mockValidationResultSuccess);
    });
  });

  describe('Hook Cleanup', () => {
    it('should maintain state between renders', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result, rerender } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.validationResult).toEqual(mockValidationResultSuccess);
      });

      // Rerender the hook
      rerender();

      // State should persist
      expect(result.current.validationResult).toEqual(mockValidationResultSuccess);
    });

    it('should not cause memory leaks on unmount', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result, unmount } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should accept valid OperationalShift object', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultSuccess
      );

      const { result } = renderHook(() => useShiftValidation());

      // TypeScript should not complain about this
      await expect(
        result.current.validateClose(mockShift, 'user-1')
      ).resolves.toBeDefined();
    });

    it('should return properly typed CloseValidationResult', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(
        mockValidationResultWithBlockers
      );

      const { result } = renderHook(() => useShiftValidation());

      const validationResult = await result.current.validateClose(mockShift, 'user-1');

      // Should have all required properties
      expect(validationResult).toHaveProperty('canClose');
      expect(validationResult).toHaveProperty('blockers');
      expect(validationResult).toHaveProperty('warnings');
      expect(Array.isArray(validationResult.blockers)).toBe(true);
      expect(Array.isArray(validationResult.warnings)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle service returning empty arrays for blockers and warnings', async () => {
      vi.mocked(shiftService.validateCloseShift).mockResolvedValue({
        canClose: true,
        blockers: [],
        warnings: [],
      });

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasBlockers()).toBe(false);
        expect(result.current.hasWarnings()).toBe(false);
        expect(result.current.canCloseShift()).toBe(true);
      });
    });

    it('should handle validation with many blockers', async () => {
      const manyBlockers: CloseValidationResult = {
        canClose: false,
        blockers: [
          {
            type: 'cash_session',
            message: 'Blocker 1',
            affectedFeature: 'sales_pos',
          },
          {
            type: 'open_tables',
            message: 'Blocker 2',
            count: 10,
            affectedFeature: 'sales_pos',
          },
          {
            type: 'active_deliveries',
            message: 'Blocker 3',
            count: 5,
            affectedFeature: 'fulfillment_delivery',
          },
          {
            type: 'pending_orders',
            message: 'Blocker 4',
            count: 20,
            affectedFeature: 'sales_pos',
          },
          {
            type: 'pending_returns',
            message: 'Blocker 5',
            count: 3,
            affectedFeature: 'asset_rental',
          },
        ],
        warnings: [],
      };

      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(manyBlockers);

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasBlockers()).toBe(true);
        expect(result.current.validationResult?.blockers.length).toBe(5);
      });
    });

    it('should handle validation with many warnings', async () => {
      const manyWarnings: CloseValidationResult = {
        canClose: true,
        blockers: [],
        warnings: [
          {
            type: 'unchecked_staff',
            message: 'Warning 1',
            severity: 'medium',
          },
          {
            type: 'inventory_count',
            message: 'Warning 2',
            severity: 'high',
          },
          {
            type: 'low_cash',
            message: 'Warning 3',
            severity: 'low',
          },
        ],
      };

      vi.mocked(shiftService.validateCloseShift).mockResolvedValue(manyWarnings);

      const { result } = renderHook(() => useShiftValidation());

      await result.current.validateClose(mockShift, 'user-1');

      await waitFor(() => {
        expect(result.current.hasWarnings()).toBe(true);
        expect(result.current.validationResult?.warnings.length).toBe(3);
        expect(result.current.canCloseShift()).toBe(true); // Warnings don't block
      });
    });
  });
});
