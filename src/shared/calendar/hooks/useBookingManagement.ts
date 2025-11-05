/**
 * BOOKING MANAGEMENT HOOK - G-ADMIN MINI v3.0
 *
 * High-level hook for comprehensive booking CRUD operations
 * Combines engine and adapter functionality for seamless booking management
 *
 * @version 3.0.0
 */

import { useState, useCallback, useMemo } from 'react';
import { useCalendarEngine } from './useCalendarEngine';
import { useCalendarAdapter } from './useCalendarAdapter';
import type {
  ISODateString,
  ISOTimeString,
  DurationMinutes,
  TimeSlot,
  Booking,
  BookingType,
  BookingStatus,
  ValidationResult,
  ConflictResult,
  CalendarConfig
} from '../types/DateTimeTypes';
import type { QueryOptions, EngineResult } from '../engine/UnifiedCalendarEngine';

// ===============================
// BOOKING INTERFACES
// ===============================

/**
 * Booking creation request
 */
export interface BookingCreateRequest {
  readonly type: BookingType;
  readonly timeSlot: TimeSlot;
  readonly resourceIds: string[];
  readonly customerId?: string;
  readonly customerName?: string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;
  readonly serviceType?: string;
  readonly notes?: string;
  readonly cost?: number;
  readonly createdBy: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Booking update request
 */
export interface BookingUpdateRequest {
  readonly timeSlot?: TimeSlot;
  readonly status?: BookingStatus;
  readonly notes?: string;
  readonly cost?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Booking validation options
 */
export interface BookingValidationOptions {
  readonly checkConflicts?: boolean;
  readonly validateBusinessRules?: boolean;
  readonly validateResources?: boolean;
  readonly includeWarnings?: boolean;
}

/**
 * Booking management state
 */
interface BookingManagementState {
  loading: boolean;
  error: string | null;
  lastOperation: {
    type: 'create' | 'update' | 'cancel' | 'query' | null;
    timestamp: Date | null;
    success: boolean;
  };
}

/**
 * Booking management actions
 */
interface BookingManagementActions {
  // CRUD operations
  createBooking: (request: BookingCreateRequest, options?: BookingValidationOptions) => Promise<EngineResult<Booking>>;
  updateBooking: (bookingId: string, updates: BookingUpdateRequest, options?: BookingValidationOptions) => Promise<EngineResult<Booking>>;
  cancelBooking: (bookingId: string, reason?: string, cancelledBy?: string) => Promise<EngineResult<Booking>>;
  queryBookings: (options?: QueryOptions) => Promise<EngineResult<Booking[]>>;

  // Validation operations
  validateBookingCreation: (request: BookingCreateRequest, options?: BookingValidationOptions) => Promise<ValidationResult>;
  validateBookingUpdate: (bookingId: string, updates: BookingUpdateRequest, options?: BookingValidationOptions) => Promise<ValidationResult>;
  checkBookingConflicts: (timeSlot: TimeSlot, resourceIds: string[], excludeBookingIds?: string[]) => Promise<ConflictResult>;

  // Availability operations
  getAvailableSlots: (date: ISODateString, resourceIds: string[], duration: DurationMinutes) => Promise<EngineResult<TimeSlot[]>>;
  checkSlotAvailability: (timeSlot: TimeSlot, resourceIds: string[]) => Promise<boolean>;

  // Utility operations
  clearError: () => void;
  getLastOperation: () => BookingManagementState['lastOperation'];
}

// ===============================
// MAIN HOOK
// ===============================

/**
 * Comprehensive booking management hook
 * Provides high-level booking operations with validation and conflict detection
 */
export function useBookingManagement(
  businessModel: string,
  config: CalendarConfig
): BookingManagementState & BookingManagementActions {
  const [state, setState] = useState<BookingManagementState>({
    loading: false,
    error: null,
    lastOperation: {
      type: null,
      timestamp: null,
      success: false
    }
  });

  // Core hooks
  const engine = useCalendarEngine({
    businessModel,
    timezone: config.timezone,
    enabledFeatures: new Set(config.enabledFeatures),
    adapter: null as any, // Will be set by adapter hook
    eventBusEnabled: true
  });

  const adapter = useCalendarAdapter(businessModel, config);

  // Update operation state
  const updateOperationState = useCallback((
    type: BookingManagementState['lastOperation']['type'],
    success: boolean,
    error?: string
  ) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error: error || null,
      lastOperation: {
        type,
        timestamp: new Date(),
        success
      }
    }));
  }, []);

  // Create booking with comprehensive validation
  const createBooking = useCallback(async (
    request: BookingCreateRequest,
    options: BookingValidationOptions = {}
  ): Promise<EngineResult<Booking>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Pre-validation if requested
      if (options.validateBusinessRules || options.checkConflicts || options.validateResources) {
        const validationResult = await validateBookingCreation(request, options);
        if (!validationResult.isValid) {
          updateOperationState('create', false, validationResult.errors.join(', '));
          return {
            success: false,
            errors: validationResult.errors,
            warnings: validationResult.warnings
          };
        }
      }

      // Create booking using engine
      const result = await engine.createBooking(request);

      updateOperationState('create', result.success, result.errors.join(', ') || undefined);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      updateOperationState('create', false, errorMessage);
      return {
        success: false,
        errors: [errorMessage],
        warnings: []
      };
    }
  }, [engine, validateBookingCreation, updateOperationState]);

  // Update booking with validation
  const updateBooking = useCallback(async (
    bookingId: string,
    updates: BookingUpdateRequest,
    options: BookingValidationOptions = {}
  ): Promise<EngineResult<Booking>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Pre-validation if requested
      if (options.validateBusinessRules || options.checkConflicts) {
        const validationResult = await validateBookingUpdate(bookingId, updates, options);
        if (!validationResult.isValid) {
          updateOperationState('update', false, validationResult.errors.join(', '));
          return {
            success: false,
            errors: validationResult.errors,
            warnings: validationResult.warnings
          };
        }
      }

      // Update booking using engine
      const result = await engine.updateBooking(bookingId, updates);

      updateOperationState('update', result.success, result.errors.join(', ') || undefined);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';
      updateOperationState('update', false, errorMessage);
      return {
        success: false,
        errors: [errorMessage],
        warnings: []
      };
    }
  }, [engine, validateBookingUpdate, updateOperationState]);

  // Cancel booking
  const cancelBooking = useCallback(async (
    bookingId: string,
    reason?: string,
    cancelledBy?: string
  ): Promise<EngineResult<Booking>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await engine.cancelBooking(bookingId, reason, cancelledBy);

      updateOperationState('cancel', result.success, result.errors.join(', ') || undefined);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
      updateOperationState('cancel', false, errorMessage);
      return {
        success: false,
        errors: [errorMessage],
        warnings: []
      };
    }
  }, [engine, updateOperationState]);

  // Query bookings
  const queryBookings = useCallback(async (options?: QueryOptions): Promise<EngineResult<Booking[]>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await engine.queryBookings(options);

      updateOperationState('query', result.success, result.errors.join(', ') || undefined);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to query bookings';
      updateOperationState('query', false, errorMessage);
      return {
        success: false,
        data: [],
        errors: [errorMessage],
        warnings: []
      };
    }
  }, [engine, updateOperationState]);

  // Validate booking creation
  const validateBookingCreation = useCallback(async (
    request: BookingCreateRequest,
    options: BookingValidationOptions = {}
  ): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Business rules validation
      if (options.validateBusinessRules && adapter.currentAdapter) {
        const businessValidation = await adapter.validateBookingRules(request);
        errors.push(...businessValidation.errors);
        warnings.push(...businessValidation.warnings);
      }

      // Conflict detection
      if (options.checkConflicts) {
        const conflictResult = await checkBookingConflicts(
          request.timeSlot,
          request.resourceIds
        );
        if (conflictResult.hasConflicts) {
          errors.push(...conflictResult.conflicts.map(c => c.message));
        }
      }

      // Resource validation (if resources are available)
      if (options.validateResources) {
        // This would check if resources exist and are available
        // Implementation depends on resource management system
        for (const resourceId of request.resourceIds) {
          if (!resourceId || resourceId.trim() === '') {
            errors.push('Invalid resource ID provided');
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings
      };
    }
  }, [adapter, checkBookingConflicts]);

  // Validate booking update
  const validateBookingUpdate = useCallback(async (
    bookingId: string,
    updates: BookingUpdateRequest,
    options: BookingValidationOptions = {}
  ): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get existing booking for validation
      const existingBookingsResult = await queryBookings();
      if (!existingBookingsResult.success) {
        errors.push('Failed to retrieve existing booking for validation');
        return { isValid: false, errors, warnings };
      }

      const existingBooking = existingBookingsResult.data?.find(b => b.id === bookingId);
      if (!existingBooking) {
        errors.push(`Booking ${bookingId} not found`);
        return { isValid: false, errors, warnings };
      }

      // Business rules validation
      if (options.validateBusinessRules && adapter.currentAdapter) {
        const businessValidation = await adapter.validateBookingRules({
          ...existingBooking,
          ...updates
        });
        errors.push(...businessValidation.errors);
        warnings.push(...businessValidation.warnings);
      }

      // Conflict detection for time slot changes
      if (options.checkConflicts && updates.timeSlot) {
        const conflictResult = await checkBookingConflicts(
          updates.timeSlot,
          existingBooking.resourceIds,
          [bookingId] // Exclude current booking from conflict check
        );
        if (conflictResult.hasConflicts) {
          errors.push(...conflictResult.conflicts.map(c => c.message));
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Update validation failed'],
        warnings
      };
    }
  }, [adapter, queryBookings, checkBookingConflicts]);

  // Check booking conflicts
  const checkBookingConflicts = useCallback(async (
    timeSlot: TimeSlot,
    resourceIds: string[],
    excludeBookingIds: string[] = []
  ): Promise<ConflictResult> => {
    try {
      // Get existing bookings for the same date
      const existingBookingsResult = await engine.queryBookings({
        dateRange: {
          startDate: timeSlot.date,
          endDate: timeSlot.date
        },
        resourceIds
      });

      if (!existingBookingsResult.success) {
        return { hasConflicts: false, conflicts: [] };
      }

      const conflicts: ConflictResult['conflicts'] = [];

      // Check time overlaps
      for (const booking of existingBookingsResult.data || []) {
        if (excludeBookingIds.includes(booking.id)) continue;
        if (booking.status === 'cancelled' || booking.status === 'expired') continue;

        // Check if time slots overlap
        if (
          booking.timeSlot.startTime < timeSlot.endTime &&
          booking.timeSlot.endTime > timeSlot.startTime
        ) {
          conflicts.push({
            type: 'time',
            message: `Time conflict with booking ${booking.id}`,
            conflictingBooking: booking
          });
        }
      }

      // Check business-specific conflicts using adapter
      if (adapter.currentAdapter) {
        const businessConflicts = await adapter.checkBusinessConflicts(timeSlot, resourceIds);
        conflicts.push(...businessConflicts.conflicts);
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      return { hasConflicts: false, conflicts: [] };
    }
  }, [engine, adapter]);

  // Get available slots
  const getAvailableSlots = useCallback(async (
    date: ISODateString,
    resourceIds: string[],
    duration: DurationMinutes
  ): Promise<EngineResult<TimeSlot[]>> => {
    try {
      return await engine.getAvailableSlots(date, resourceIds, duration);
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Failed to get available slots'],
        warnings: []
      };
    }
  }, [engine]);

  // Check slot availability
  const checkSlotAvailability = useCallback(async (
    timeSlot: TimeSlot,
    resourceIds: string[]
  ): Promise<boolean> => {
    try {
      const conflictResult = await checkBookingConflicts(timeSlot, resourceIds);
      return !conflictResult.hasConflicts;
    } catch (error) {
      return false;
    }
  }, [checkBookingConflicts]);

  // Utility operations
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getLastOperation = useCallback(() => {
    return state.lastOperation;
  }, [state.lastOperation]);

  // Memoized return object
  return useMemo(() => ({
    // State
    ...state,

    // Actions
    createBooking,
    updateBooking,
    cancelBooking,
    queryBookings,
    validateBookingCreation,
    validateBookingUpdate,
    checkBookingConflicts,
    getAvailableSlots,
    checkSlotAvailability,
    clearError,
    getLastOperation
  }), [
    state,
    createBooking,
    updateBooking,
    cancelBooking,
    queryBookings,
    validateBookingCreation,
    validateBookingUpdate,
    checkBookingConflicts,
    getAvailableSlots,
    checkSlotAvailability,
    clearError,
    getLastOperation
  ]);
}

// ===============================
// CONVENIENCE HOOKS
// ===============================

/**
 * Hook for simplified booking creation
 */
export function useSimpleBookingCreation(businessModel: string, config: CalendarConfig) {
  const bookingManagement = useBookingManagement(businessModel, config);

  const createSimpleBooking = useCallback(async (
    timeSlot: TimeSlot,
    resourceIds: string[],
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
    }
  ) => {
    return await bookingManagement.createBooking({
      type: 'appointment',
      timeSlot,
      resourceIds,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      customerPhone: customerInfo?.phone,
      createdBy: 'system' // Should come from auth context
    }, {
      checkConflicts: true,
      validateBusinessRules: true,
      validateResources: true
    });
  }, [bookingManagement]);

  return {
    createSimpleBooking,
    loading: bookingManagement.loading,
    error: bookingManagement.error
  };
}

/**
 * Hook for booking validation only
 */
export function useBookingValidation(businessModel: string, config: CalendarConfig) {
  const bookingManagement = useBookingManagement(businessModel, config);

  return {
    validateBookingCreation: bookingManagement.validateBookingCreation,
    validateBookingUpdate: bookingManagement.validateBookingUpdate,
    checkBookingConflicts: bookingManagement.checkBookingConflicts,
    checkSlotAvailability: bookingManagement.checkSlotAvailability
  };
}