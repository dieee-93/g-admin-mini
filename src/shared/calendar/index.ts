/**
 * UNIFIED CALENDAR SYSTEM - G-ADMIN MINI v3.0
 *
 * Main entry point for the unified calendar system
 * Provides complete access to calendar functionality
 *
 * @version 3.0.0
 */

// ===============================
// IMPORTS FOR DEFAULT EXPORT
// ===============================

import { UnifiedCalendarEngine } from './engine/UnifiedCalendarEngine';
import { BaseCalendarAdapter } from './adapters/BaseCalendarAdapter';
import { useCalendarEngine, useCalendarAdapter, useBookingManagement, useCalendarConfig } from './hooks';
import Slot from './slots/Slot';
import { SlotRegistry } from './slots/SlotRegistry';
import { CALENDAR_SLOTS, BUSINESS_MODEL_SLOTS } from './slots/CalendarSlotDefinitions';
import { createUnifiedCalendarSystem } from './factory/CalendarFactory';
import { CalendarPresets } from './presets/CalendarPresets';
import { CALENDAR_SYSTEM_VERSION, CALENDAR_SYSTEM_BUILD } from './config/CalendarConfig';

// ===============================
// CORE SYSTEM EXPORTS
// ===============================

// Engine and core logic
export { UnifiedCalendarEngine } from './engine/UnifiedCalendarEngine';
export type { CalendarEngineConfig, QueryOptions, EngineResult } from './engine/UnifiedCalendarEngine';

// Adapter system
export { BaseCalendarAdapter } from './adapters/BaseCalendarAdapter';
export type {
  AdapterBookingData,
  AdapterContext,
  BusinessRuleContext,
  AdapterConstructor,
  AdapterRegistry
} from './adapters/BaseCalendarAdapter';

// Type functions from dateTimeUtils
export {
  // Core types
  createISODate,
  createISOTime,
  createISODateTime,
  nowTimestamp,
  createTimezone,

  // Parsing and conversion
  parseISODate,
  parseISOTime,
  combineDateTime,
  extractDate,
  extractTime,

  // Duration calculations
  calculateDuration,
  addDuration,
  subtractDuration,
  formatDuration,

  // Validation
  validateTimeSlot,
  validateBusinessHours,

  // Conflict detection
  checkTimeSlotOverlap,
  findTimeSlotConflicts,

  // Formatting
  formatDateForUser,
  formatTimeForUser,
  formatDateTimeForUser,
  formatTimeSlotForUser,

} from './utils/dateTimeUtils';

// Type guards from DateTimeTypes
export {
  isISODateString,
  isISOTimeString,
  isISODateTimeString,
  isTimezoneString
} from './types/DateTimeTypes';

// Utility functions from dateTimeUtils
export {
  getUserTimezone,
  convertTimezone,
  isToday,
  getRelativeDateDescription
} from './utils/dateTimeUtils';

export type {
  // Basic types
  ISODateString,
  ISOTimeString,
  ISODateTimeString,
  DurationMinutes,
  TimezoneString,

  // Core calendar types
  TimeSlot,
  Timestamp,
  AvailabilityWindow,
  DateRange,

  // Booking system types
  BookingType,
  BookingStatus,
  Booking,

  // Resource management types
  ResourceType,
  ResourceStatus,
  Resource,

  // Configuration types
  BusinessHours,
  BookingRules,
  CalendarConfig,

  // Validation types
  ValidationResult,
  ConflictResult,
  AvailabilityResult,

  // Event types
  CalendarEventType,
  CalendarEvent
} from './types/DateTimeTypes';

// ===============================
// HOOKS SYSTEM
// ===============================

export {
  // Core hooks
  useCalendarEngine,
  useCalendarEngineReady,
  useCalendarEngineStats,

  // Adapter hooks
  useCalendarAdapter,
  useAdapterCapabilities,
  useAdapterValidation,

  // Booking management
  useBookingManagement,
  useSimpleBookingCreation,
  useBookingValidation,

  // Configuration
  useCalendarConfig,
  useBusinessHours,
  useBookingRules,
  useCalendarFeatures,

  // Registry functions
  registerGlobalAdapter,
  getGlobalAdapterRegistry,
  clearGlobalAdapterRegistry,

  // Convenience
  createCalendarSystem,
  CALENDAR_HOOK_CONFIGS
} from './hooks';

export type {
  BookingCreateRequest,
  BookingUpdateRequest,
  BookingValidationOptions
} from './hooks';

// ===============================
// COMPONENTS SYSTEM
// ===============================

// Note: Components must be imported directly from './components' to avoid circular dependencies
// Example: import { UnifiedCalendar } from '@/shared/calendar/components';

export type {
  UnifiedCalendarProps,
  CalendarGridProps,
  CalendarHeaderProps,
  CalendarSidebarProps,
  CalendarFilters
} from './components';

// ===============================
// SLOTS SYSTEM
// ===============================

export {
  // Core slot components
  Slot,
  ConditionalSlot,
  AsyncSlot,
  SlotGroup,

  // Registry system
  SlotRegistry,
  registerSlot,
  registerBusinessSlot,
  getSlotComponent,
  getBusinessSlotComponent,
  hasSlot,
  unregisterSlot,
  clearAllSlots,
  getRegistryStats,
  registerSlotsFromModule,
  autoRegisterSlots,

  // Slot definitions
  CALENDAR_SLOTS,
  BUSINESS_MODEL_SLOTS,
  SLOT_CATEGORIES,
  SLOT_PRIORITIES,
  getSlotsForCategory,
  getBusinessModelSlots,
  isValidSlotName,
  generateBusinessSlotName,
  parseBusinessSlotName,
  getAllSlotNames,
  getSlotDocumentation,

  // Convenience functions
  initializeSlotSystem,
  registerBusinessModelSlots,
  createSlotProvider,
  useSlotSystem,
  useSlotRegistered,
  useSlotContext
} from './slots';

export type {
  SlotProps,
  SlotContext,
  SlotComponent,
  SlotRegistrationOptions,
  SlotRegistrationResult,
  SlotRegistryEvent,
  CalendarSlotName,
  BusinessModelSlotName,
  AnySlotName,
  SlotCategory
} from './slots';

// ===============================
// UNIFIED CALENDAR FACTORY
// ===============================

/**
 * Complete calendar system factory
 * Creates a fully configured calendar system for a business model
 */
export function createUnifiedCalendarSystem({
  businessModel,
  adapter,
  config,
  slots = {},
  autoRegisterSlots = true
}: {
  businessModel: string;
  adapter?: BaseCalendarAdapter;
  config?: Partial<CalendarConfig>;
  slots?: Record<string, any>;
  autoRegisterSlots?: boolean;
}) {
  // Register adapter if provided
  if (adapter) {
    registerGlobalAdapter(businessModel, adapter.constructor as any);
  }

  // Register slots if provided
  if (autoRegisterSlots && Object.keys(slots).length > 0) {
    registerBusinessModelSlots(businessModel, slots);
  }

  // Initialize slot system
  const slotSystem = initializeSlotSystem(businessModel);

  // Create hook system
  const hookSystem = createCalendarSystem(businessModel);

  return {
    businessModel,

    // Hook system
    hooks: hookSystem,

    // Slot system
    slots: slotSystem,

    // Configuration
    config: config || {},

    // Utilities
    registerSlot: slotSystem.register,
    hasSlot: slotSystem.hasSlot,
    getStats: () => ({
      slots: slotSystem.getStats(),
      registry: getRegistryStats()
    })
  };
}

// ===============================
// BUSINESS MODEL PRESETS
// ===============================

/**
 * Pre-configured calendar systems for common business models
 */
export const CalendarPresets = {
  /**
   * Staff scheduling calendar
   */
  StaffScheduling: (config?: Partial<CalendarConfig>) =>
    createUnifiedCalendarSystem({
      businessModel: 'staff_scheduling',
      config: {
        enabledFeatures: ['shift_management', 'time_off', 'coverage_tracking', 'labor_cost_tracking'],
        ...config
      }
    }),

  /**
   * Medical appointments calendar
   */
  MedicalAppointments: (config?: Partial<CalendarConfig>) =>
    createUnifiedCalendarSystem({
      businessModel: 'medical_appointments',
      config: {
        enabledFeatures: ['appointment_booking', 'patient_management', 'reminder_system'],
        ...config
      }
    }),

  /**
   * Fitness classes calendar
   */
  FitnessClasses: (config?: Partial<CalendarConfig>) =>
    createUnifiedCalendarSystem({
      businessModel: 'fitness_classes',
      config: {
        enabledFeatures: ['class_booking', 'capacity_management', 'waitlist'],
        ...config
      }
    }),

  /**
   * Equipment rental calendar
   */
  EquipmentRental: (config?: Partial<CalendarConfig>) =>
    createUnifiedCalendarSystem({
      businessModel: 'equipment_rental',
      config: {
        enabledFeatures: ['rental_booking', 'inventory_tracking', 'damage_reports'],
        ...config
      }
    })
};

// ===============================
// VERSION INFO
// ===============================

export const CALENDAR_SYSTEM_VERSION = '3.0.0';
export const CALENDAR_SYSTEM_BUILD = 'unified-architecture';

// ===============================
// DEFAULT EXPORT
// ===============================

export default {
  // Core system
  UnifiedCalendarEngine,
  BaseCalendarAdapter,

  // Hooks
  useCalendarEngine,
  useCalendarAdapter,
  useBookingManagement,
  useCalendarConfig,

  // Slots
  Slot,
  SlotRegistry,
  CALENDAR_SLOTS,
  BUSINESS_MODEL_SLOTS,

  // Factory
  createUnifiedCalendarSystem,
  CalendarPresets,

  // Version
  version: CALENDAR_SYSTEM_VERSION,
  build: CALENDAR_SYSTEM_BUILD
};