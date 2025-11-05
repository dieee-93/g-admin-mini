/**
 * BASE CALENDAR ADAPTER - G-ADMIN MINI v3.0
 *
 * BREAKING CHANGE: Complete rewrite of adapter pattern
 * NO legacy support - modern business-model-agnostic foundation
 *
 * @version 3.0.0
 * @breaking-change Replaces all legacy adapter patterns
 */

import type {
  ISODateString,
  ISOTimeString,
  TimeSlot,
  Booking,
  Resource,
  BookingType,
  BookingStatus,
  BusinessHours,
  ValidationResult,
  ConflictResult,
  AvailabilityResult,
  CalendarConfig
} from '../types/DateTimeTypes';

import type { QueryOptions, EngineResult } from '../engine/UnifiedCalendarEngine';

// ===============================
// ADAPTER INTERFACES
// ===============================

/**
 * Business-specific booking data for adapter processing
 */
export interface AdapterBookingData {
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
 * Adapter processing context
 */
export interface AdapterContext {
  readonly businessModel: string;
  readonly timezone: string;
  readonly userId: string;
  readonly capabilities: Set<string>;
  readonly configuration: CalendarConfig;
}

/**
 * Business rule validation context
 */
export interface BusinessRuleContext {
  readonly existingBookings: Booking[];
  readonly availableResources: Resource[];
  readonly businessHours: BusinessHours;
  readonly currentDateTime: Date;
}

// ===============================
// BASE CALENDAR ADAPTER
// ===============================

/**
 * Abstract base class for all calendar adapters
 * Defines the contract for business-model-specific implementations
 */
export abstract class BaseCalendarAdapter {
  protected readonly businessModel: string;
  protected readonly config: CalendarConfig;

  constructor(businessModel: string, config: CalendarConfig) {
    this.businessModel = businessModel;
    this.config = config;
  }

  // ===============================
  // ABSTRACT METHODS - MUST IMPLEMENT
  // ===============================

  /**
   * Validates booking creation according to business rules
   * MUST BE IMPLEMENTED: Each business model has specific rules
   */
  abstract validateBookingRules(
    bookingData: AdapterBookingData,
    context?: BusinessRuleContext
  ): Promise<ValidationResult>;

  /**
   * Validates booking updates according to business rules
   * MUST BE IMPLEMENTED: Update restrictions vary by business model
   */
  abstract validateBookingUpdate(
    existingBooking: Booking,
    updates: Partial<Booking>,
    context?: BusinessRuleContext
  ): Promise<ValidationResult>;

  /**
   * Validates booking cancellation according to business rules
   * MUST BE IMPLEMENTED: Cancellation policies vary by business model
   */
  abstract validateCancellation(
    booking: Booking,
    context?: BusinessRuleContext
  ): Promise<ValidationResult>;

  /**
   * Processes booking creation with business-specific logic
   * MUST BE IMPLEMENTED: Post-creation actions vary by business model
   */
  abstract processBookingCreation(
    booking: Booking,
    context?: AdapterContext
  ): Promise<EngineResult<Booking>>;

  /**
   * Processes booking updates with business-specific logic
   * MUST BE IMPLEMENTED: Update handling varies by business model
   */
  abstract processBookingUpdate(
    oldBooking: Booking,
    newBooking: Booking,
    context?: AdapterContext
  ): Promise<EngineResult<Booking>>;

  /**
   * Processes booking cancellation with business-specific logic
   * MUST BE IMPLEMENTED: Cancellation handling varies by business model
   */
  abstract processCancellation(
    booking: Booking,
    context?: AdapterContext
  ): Promise<EngineResult<Booking>>;

  /**
   * Gets business hours for a specific date
   * MUST BE IMPLEMENTED: Business hours vary by business model and date
   */
  abstract getBusinessHours(
    date: ISODateString,
    context?: AdapterContext
  ): Promise<BusinessHours | null>;

  /**
   * Checks resource availability for a time slot
   * MUST BE IMPLEMENTED: Availability rules vary by business model
   */
  abstract checkResourceAvailability(
    resource: Resource,
    timeSlot: TimeSlot,
    context?: AdapterContext
  ): Promise<boolean>;

  /**
   * Checks business-specific conflicts beyond basic time overlaps
   * MUST BE IMPLEMENTED: Business rules create different types of conflicts
   */
  abstract checkBusinessConflicts(
    timeSlot: TimeSlot,
    resourceIds: string[],
    context?: AdapterContext
  ): Promise<ConflictResult>;

  // ===============================
  // OPTIONAL METHODS - CAN OVERRIDE
  // ===============================

  /**
   * Validates resource according to business model
   * CAN OVERRIDE: Default implementation provides basic validation
   */
  async validateResource(
    resource: Resource,
    context?: AdapterContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validations
    if (!resource.id || resource.id.trim() === '') {
      errors.push('Resource ID is required');
    }

    if (!resource.name || resource.name.trim() === '') {
      errors.push('Resource name is required');
    }

    if (!resource.type) {
      errors.push('Resource type is required');
    }

    if (resource.businessModel !== this.businessModel) {
      errors.push(`Resource business model ${resource.businessModel} does not match adapter ${this.businessModel}`);
    }

    // Business model specific validation can be overridden
    const businessValidation = await this.validateBusinessSpecificResource(resource, context);
    errors.push(...businessValidation.errors);
    warnings.push(...businessValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Filters bookings according to business model
   * CAN OVERRIDE: Default implementation returns all bookings
   */
  async filterBookings(
    bookings: Booking[],
    options: QueryOptions,
    context?: AdapterContext
  ): Promise<EngineResult<Booking[]>> {
    // Default implementation - return all bookings
    // Business-specific adapters can override for custom filtering
    return {
      success: true,
      data: bookings,
      errors: [],
      warnings: []
    };
  }

  /**
   * Calculates booking cost according to business model
   * CAN OVERRIDE: Default implementation returns provided cost or 0
   */
  async calculateBookingCost(
    bookingData: AdapterBookingData,
    resources: Resource[],
    context?: AdapterContext
  ): Promise<number> {
    return bookingData.cost || 0;
  }

  /**
   * Gets suggested alternative time slots when booking fails
   * CAN OVERRIDE: Default implementation returns empty array
   */
  async getSuggestedAlternatives(
    originalTimeSlot: TimeSlot,
    resourceIds: string[],
    context?: AdapterContext
  ): Promise<TimeSlot[]> {
    return [];
  }

  /**
   * Handles recurring booking creation
   * CAN OVERRIDE: Default implementation throws error (not supported)
   */
  async createRecurringBooking(
    bookingData: AdapterBookingData & {
      recurrencePattern: {
        frequency: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endDate?: ISODateString;
        occurrences?: number;
      };
    },
    context?: AdapterContext
  ): Promise<EngineResult<Booking[]>> {
    return {
      success: false,
      errors: ['Recurring bookings not supported by this adapter'],
      warnings: []
    };
  }

  // ===============================
  // PROTECTED HELPER METHODS
  // ===============================

  /**
   * Business-specific resource validation
   * PROTECTED: Can be overridden by specific adapters
   */
  protected async validateBusinessSpecificResource(
    resource: Resource,
    context?: AdapterContext
  ): Promise<ValidationResult> {
    // Default implementation - no business-specific validation
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Applies business model constraints to time slot
   * PROTECTED: Helper for common time slot validations
   */
  protected validateTimeSlotConstraints(
    timeSlot: TimeSlot,
    rules: {
      minDuration?: number;
      maxDuration?: number;
      allowedDays?: number[];
      restrictedTimes?: { start: ISOTimeString; end: ISOTimeString }[];
    }
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Duration constraints
    if (rules.minDuration && timeSlot.duration < rules.minDuration) {
      errors.push(`Minimum duration is ${rules.minDuration} minutes`);
    }

    if (rules.maxDuration && timeSlot.duration > rules.maxDuration) {
      errors.push(`Maximum duration is ${rules.maxDuration} minutes`);
    }

    // Day constraints
    if (rules.allowedDays && rules.allowedDays.length > 0) {
      const dayOfWeek = new Date(timeSlot.date).getDay();
      if (!rules.allowedDays.includes(dayOfWeek)) {
        errors.push('Bookings not allowed on this day of the week');
      }
    }

    // Time restrictions
    if (rules.restrictedTimes && rules.restrictedTimes.length > 0) {
      for (const restriction of rules.restrictedTimes) {
        if (timeSlot.startTime >= restriction.start && timeSlot.startTime < restriction.end) {
          warnings.push(`Time slot starts during restricted period ${restriction.start}-${restriction.end}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Checks if booking is within advance booking limits
   * PROTECTED: Helper for advance booking validation
   */
  protected validateAdvanceBooking(
    timeSlot: TimeSlot,
    rules: {
      minAdvanceMinutes?: number;
      maxAdvanceMinutes?: number;
    }
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const now = new Date();
    const bookingTime = new Date(`${timeSlot.date}T${timeSlot.startTime}:00`);
    const advanceMinutes = (bookingTime.getTime() - now.getTime()) / (1000 * 60);

    if (rules.minAdvanceMinutes && advanceMinutes < rules.minAdvanceMinutes) {
      errors.push(`Booking must be made at least ${rules.minAdvanceMinutes} minutes in advance`);
    }

    if (rules.maxAdvanceMinutes && advanceMinutes > rules.maxAdvanceMinutes) {
      errors.push(`Booking cannot be made more than ${rules.maxAdvanceMinutes} minutes in advance`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates customer information requirements
   * PROTECTED: Helper for customer validation
   */
  protected validateCustomerInfo(
    bookingData: AdapterBookingData,
    requirements: {
      requiresName?: boolean;
      requiresEmail?: boolean;
      requiresPhone?: boolean;
      requiresCustomerId?: boolean;
    }
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (requirements.requiresName && !bookingData.customerName) {
      errors.push('Customer name is required');
    }

    if (requirements.requiresEmail && !bookingData.customerEmail) {
      errors.push('Customer email is required');
    }

    if (requirements.requiresPhone && !bookingData.customerPhone) {
      errors.push('Customer phone is required');
    }

    if (requirements.requiresCustomerId && !bookingData.customerId) {
      errors.push('Customer ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===============================
  // GETTER METHODS
  // ===============================

  /**
   * Gets the business model this adapter serves
   */
  getBusinessModel(): string {
    return this.businessModel;
  }

  /**
   * Gets the adapter configuration
   */
  getConfig(): CalendarConfig {
    return this.config;
  }

  /**
   * Gets supported booking types for this business model
   */
  getSupportedBookingTypes(): BookingType[] {
    // Default implementation - override in specific adapters
    return ['appointment', 'event', 'blocked'];
  }

  /**
   * Gets supported features for this business model
   */
  getSupportedFeatures(): string[] {
    // Default implementation - override in specific adapters
    return ['basic_booking', 'cancellation', 'resource_assignment'];
  }

  /**
   * Checks if a feature is supported
   */
  supportsFeature(feature: string): boolean {
    return this.getSupportedFeatures().includes(feature);
  }
}

// ===============================
// UTILITY TYPES
// ===============================

/**
 * Type for adapter constructor
 */
export type AdapterConstructor = new (
  businessModel: string,
  config: CalendarConfig
) => BaseCalendarAdapter;

/**
 * Adapter registry interface
 */
export interface AdapterRegistry {
  register(businessModel: string, adapter: AdapterConstructor): void;
  get(businessModel: string): AdapterConstructor | undefined;
  list(): string[];
}

// ===============================
// EXPORTS
// ===============================

export type {
  AdapterBookingData,
  AdapterContext,
  BusinessRuleContext
};