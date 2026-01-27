/**
 * useShiftValidation Hook
 *
 * Validates if a shift can be closed by checking blockers
 * Coordinates with other modules through EventBus
 *
 * @module shift-control/hooks
 * @version 2.1
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logging/Logger';
import { validateCloseShift } from '../services/shiftService';
import type {
  CloseValidationResult,
  OperationalShift,
} from '../types';

const MODULE_ID = 'ShiftControl';

export interface UseShiftValidationReturn {
  // State
  validationResult: CloseValidationResult | null;
  isValidating: boolean;

  // Actions
  validateClose: (shift: OperationalShift, userId: string) => Promise<CloseValidationResult>;
  canCloseShift: () => boolean;
  hasBlockers: () => boolean;
  hasWarnings: () => boolean;
}

/**
 * Hook for shift close validation
 * Now delegates to service layer for validation logic
 */
export function useShiftValidation(): UseShiftValidationReturn {
  const [validationResult, setValidationResult] = useState<CloseValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate if shift can be closed
   * Calls service layer validation for consistent logic
   */
  const validateClose = useCallback(
    async (shift: OperationalShift, _userId: string): Promise<CloseValidationResult> => {
      setIsValidating(true);

      try {
        logger.debug(MODULE_ID, 'Validating shift close (via service)', {
          shiftId: shift.id,
        });

        // Delegate to service layer for validation
        const result = await validateCloseShift(shift.id);

        setValidationResult(result);

        return result;
      } catch (error) {
        logger.error(MODULE_ID, 'Validation error', { error });
        throw error;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  /**
   * Check if shift can be closed (based on last validation)
   */
  const canCloseShift = useCallback((): boolean => {
    return validationResult?.canClose ?? false;
  }, [validationResult]);

  /**
   * Check if there are blockers
   */
  const hasBlockers = useCallback((): boolean => {
    return (validationResult?.blockers.length ?? 0) > 0;
  }, [validationResult]);

  /**
   * Check if there are warnings
   */
  const hasWarnings = useCallback((): boolean => {
    return (validationResult?.warnings.length ?? 0) > 0;
  }, [validationResult]);

  return {
    validationResult,
    isValidating,
    validateClose,
    canCloseShift,
    hasBlockers,
    hasWarnings,
  };
}
