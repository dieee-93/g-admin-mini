/**
 * UNIFIED CALENDAR HOOKS - G-ADMIN MINI v3.0
 *
 * Central export point for all calendar hooks
 * Provides organized access to calendar functionality
 *
 * @version 3.0.0
 */

// ===============================
// CORE HOOKS EXPORTS
// ===============================

// Engine management
export {
  useCalendarEngine,
  useCalendarEngineReady,
  useCalendarEngineStats
} from './useCalendarEngine';

// Adapter management
export {
  useCalendarAdapter,
  useAdapterCapabilities,
  useAdapterValidation,
  registerGlobalAdapter,
  getGlobalAdapterRegistry,
  clearGlobalAdapterRegistry
} from './useCalendarAdapter';

// Booking management
export {
  useBookingManagement,
  useSimpleBookingCreation,
  useBookingValidation
} from './useBookingManagement';

// Configuration management
export {
  useCalendarConfig,
  useBusinessHours,
  useBookingRules,
  useCalendarFeatures
} from './useCalendarConfig';

// ===============================
// TYPE EXPORTS
// ===============================

export type {
  BookingCreateRequest,
  BookingUpdateRequest,
  BookingValidationOptions
} from './useBookingManagement';

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Helper to initialize a complete calendar system
 */
export function createCalendarSystem(businessModel: string) {
  return {
    // Core hooks that should be used together
    useEngine: () => useCalendarEngine(),
    useAdapter: (config: any) => useCalendarAdapter(businessModel, config),
    useBookings: (config: any) => useBookingManagement(businessModel, config),
    useConfig: () => useCalendarConfig(businessModel),

    // Convenience combinations
    useComplete: (config: any) => ({
      engine: useCalendarEngine(),
      adapter: useCalendarAdapter(businessModel, config),
      bookings: useBookingManagement(businessModel, config),
      config: useCalendarConfig(businessModel)
    })
  };
}

/**
 * Default hook configuration for common business models
 */
export const CALENDAR_HOOK_CONFIGS = {
  staff_scheduling: {
    features: ['shift_management', 'time_off', 'coverage_tracking'],
    autoLoad: true,
    validateOnCreate: true
  },

  medical_appointments: {
    features: ['appointment_booking', 'patient_management'],
    autoLoad: true,
    validateOnCreate: true
  },

  fitness_classes: {
    features: ['class_booking', 'capacity_management'],
    autoLoad: true,
    validateOnCreate: false
  },

  equipment_rental: {
    features: ['rental_booking', 'inventory_tracking'],
    autoLoad: true,
    validateOnCreate: true
  }
} as const;