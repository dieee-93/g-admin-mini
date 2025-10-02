/**
 * UNIFIED CALENDAR ENGINE - G-ADMIN MINI v3.0
 *
 * BREAKING CHANGE: Complete rewrite of calendar system
 * NO legacy support - modern business-model-agnostic engine
 *
 * @version 3.0.0
 * @breaking-change Replaces all legacy calendar/scheduling logic
 */

import {
  ISODateString,
  ISOTimeString,
  ISODateTimeString,
  DurationMinutes,
  TimezoneString,
  TimeSlot,
  Booking,
  Resource,
  BookingType,
  BookingStatus,
  ResourceType,
  ResourceStatus,
  CalendarConfig,
  BusinessHours,
  BookingRules,
  ValidationResult,
  ConflictResult,
  AvailabilityResult,
  CalendarEvent,
  CalendarEventType,
  Timestamp,
  DateRange
} from '../types/DateTimeTypes';

import {
  createISODate,
  createISOTime,
  createISODateTime,
  nowTimestamp,
  validateTimeSlot,
  findTimeSlotConflicts,
  checkTimeSlotOverlap,
  formatTimeSlotForUser,
  getUserTimezone
} from '../utils/dateTimeUtils';

import { BaseCalendarAdapter } from '../adapters/BaseCalendarAdapter';

import { logger } from '@/lib/logging';
// ===============================
// ENGINE CONFIGURATION
// ===============================

/**
 * Engine configuration options
 */
export interface CalendarEngineConfig {
  readonly businessModel: string;
  readonly timezone: TimezoneString;
  readonly enabledFeatures: Set<string>;
  readonly adapter: BaseCalendarAdapter;
  readonly eventBusEnabled: boolean;
}

/**
 * Query options for engine operations
 */
export interface QueryOptions {
  readonly dateRange?: DateRange;
  readonly resourceIds?: string[];
  readonly bookingTypes?: BookingType[];
  readonly statuses?: BookingStatus[];
  readonly includeConflicts?: boolean;
  readonly timezone?: TimezoneString;
}

/**
 * Engine operation result
 */
export interface EngineResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors: string[];
  readonly warnings: string[];
  readonly conflicts?: ConflictResult['conflicts'];
}

// ===============================
// UNIFIED CALENDAR ENGINE
// ===============================

/**
 * Core calendar engine that orchestrates all calendar operations
 * Business-model agnostic with adapter pattern for specialization
 */
export class UnifiedCalendarEngine {
  private readonly config: CalendarEngineConfig;
  private readonly bookings: Map<string, Booking> = new Map();
  private readonly resources: Map<string, Resource> = new Map();
  private readonly eventListeners: Map<CalendarEventType, Set<(event: CalendarEvent) => void>> = new Map();

  constructor(config: CalendarEngineConfig) {
    this.config = config;
    this.initializeEventListeners();
  }

  // ===============================
  // CORE BOOKING OPERATIONS
  // ===============================

  /**
   * Creates a new booking with full validation
   * REPLACES: All legacy booking creation logic
   */
  async createBooking(bookingData: {
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
  }): Promise<EngineResult<Booking>> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate time slot
    const timeSlotValidation = validateTimeSlot(bookingData.timeSlot);
    if (!timeSlotValidation.isValid) {
      errors.push(...timeSlotValidation.errors);
    }
    warnings.push(...timeSlotValidation.warnings);

    // Validate resources exist and are available
    const resourceValidation = await this.validateResourceAvailability(
      bookingData.resourceIds,
      bookingData.timeSlot
    );
    if (!resourceValidation.isAvailable) {
      errors.push(...resourceValidation.unavailableReasons);
    }

    // Check for conflicts
    const conflictResult = await this.checkBookingConflicts(
      bookingData.timeSlot,
      bookingData.resourceIds
    );
    if (conflictResult.hasConflicts) {
      errors.push(...conflictResult.conflicts.map(c => c.message));
    }

    // Apply business rules validation
    const businessRulesValidation = await this.config.adapter.validateBookingRules(bookingData);
    if (!businessRulesValidation.isValid) {
      errors.push(...businessRulesValidation.errors);
    }
    warnings.push(...businessRulesValidation.warnings);

    // Return early if validation fails
    if (errors.length > 0) {
      return {
        success: false,
        errors,
        warnings,
        conflicts: conflictResult.conflicts
      };
    }

    // Create booking
    const now = nowTimestamp(this.config.timezone);
    const booking: Booking = {
      id: crypto.randomUUID(),
      type: bookingData.type,
      status: 'pending' as BookingStatus,
      timeSlot: bookingData.timeSlot,
      resourceIds: bookingData.resourceIds,
      customerId: bookingData.customerId,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      businessModel: this.config.businessModel,
      serviceType: bookingData.serviceType,
      notes: bookingData.notes,
      cost: bookingData.cost,
      createdAt: now,
      updatedAt: now,
      createdBy: bookingData.createdBy
    };

    // Store booking
    this.bookings.set(booking.id, booking);

    // Update resource status
    await this.updateResourceStatus(bookingData.resourceIds, 'busy');

    // Apply adapter-specific processing
    const adapterResult = await this.config.adapter.processBookingCreation(booking);
    if (!adapterResult.success) {
      // Rollback
      this.bookings.delete(booking.id);
      await this.updateResourceStatus(bookingData.resourceIds, 'available');
      return adapterResult;
    }

    // Emit event
    await this.emitEvent('booking_created', {
      bookingId: booking.id,
      data: { booking }
    });

    return {
      success: true,
      data: booking,
      errors: [],
      warnings
    };
  }

  /**
   * Updates an existing booking
   * REPLACES: All legacy booking update logic
   */
  async updateBooking(
    bookingId: string,
    updates: Partial<Pick<Booking, 'timeSlot' | 'status' | 'notes' | 'cost'>>
  ): Promise<EngineResult<Booking>> {
    const existingBooking = this.bookings.get(bookingId);
    if (!existingBooking) {
      return {
        success: false,
        errors: [`Booking ${bookingId} not found`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate time slot changes
    if (updates.timeSlot) {
      const timeSlotValidation = validateTimeSlot(updates.timeSlot);
      if (!timeSlotValidation.isValid) {
        errors.push(...timeSlotValidation.errors);
      }
      warnings.push(...timeSlotValidation.warnings);

      // Check for new conflicts
      const conflictResult = await this.checkBookingConflicts(
        updates.timeSlot,
        existingBooking.resourceIds,
        [bookingId] // Exclude current booking
      );
      if (conflictResult.hasConflicts) {
        errors.push(...conflictResult.conflicts.map(c => c.message));
      }
    }

    // Apply business rules validation
    const businessRulesValidation = await this.config.adapter.validateBookingUpdate(
      existingBooking,
      updates
    );
    if (!businessRulesValidation.isValid) {
      errors.push(...businessRulesValidation.errors);
    }
    warnings.push(...businessRulesValidation.warnings);

    if (errors.length > 0) {
      return { success: false, errors, warnings };
    }

    // Create updated booking
    const updatedBooking: Booking = {
      ...existingBooking,
      ...updates,
      updatedAt: nowTimestamp(this.config.timezone)
    };

    // Store updated booking
    this.bookings.set(bookingId, updatedBooking);

    // Apply adapter-specific processing
    const adapterResult = await this.config.adapter.processBookingUpdate(
      existingBooking,
      updatedBooking
    );
    if (!adapterResult.success) {
      // Rollback
      this.bookings.set(bookingId, existingBooking);
      return adapterResult;
    }

    // Emit event
    await this.emitEvent('booking_updated', {
      bookingId,
      data: { oldBooking: existingBooking, newBooking: updatedBooking }
    });

    return {
      success: true,
      data: updatedBooking,
      errors: [],
      warnings
    };
  }

  /**
   * Cancels a booking
   * REPLACES: All legacy booking cancellation logic
   */
  async cancelBooking(
    bookingId: string,
    reason?: string,
    cancelledBy?: string
  ): Promise<EngineResult<Booking>> {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      return {
        success: false,
        errors: [`Booking ${bookingId} not found`],
        warnings: []
      };
    }

    // Check cancellation rules
    const cancellationValidation = await this.config.adapter.validateCancellation(booking);
    if (!cancellationValidation.isValid) {
      return {
        success: false,
        errors: cancellationValidation.errors,
        warnings: cancellationValidation.warnings
      };
    }

    // Update booking status
    const cancelledBooking: Booking = {
      ...booking,
      status: 'cancelled' as BookingStatus,
      notes: booking.notes ? `${booking.notes}\nCancelled: ${reason || 'No reason provided'}` : `Cancelled: ${reason || 'No reason provided'}`,
      updatedAt: nowTimestamp(this.config.timezone)
    };

    this.bookings.set(bookingId, cancelledBooking);

    // Release resources
    await this.updateResourceStatus(booking.resourceIds, 'available');

    // Apply adapter-specific processing
    const adapterResult = await this.config.adapter.processCancellation(cancelledBooking);
    if (!adapterResult.success) {
      // Rollback
      this.bookings.set(bookingId, booking);
      await this.updateResourceStatus(booking.resourceIds, 'busy');
      return adapterResult;
    }

    // Emit event
    await this.emitEvent('booking_cancelled', {
      bookingId,
      data: { booking: cancelledBooking, reason, cancelledBy }
    });

    return {
      success: true,
      data: cancelledBooking,
      errors: [],
      warnings: cancellationValidation.warnings
    };
  }

  // ===============================
  // RESOURCE MANAGEMENT
  // ===============================

  /**
   * Registers a resource in the engine
   * REPLACES: All legacy resource registration
   */
  async registerResource(resource: Resource): Promise<EngineResult<Resource>> {
    const validation = await this.config.adapter.validateResource(resource);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }

    this.resources.set(resource.id, resource);

    await this.emitEvent('resource_assigned', {
      resourceId: resource.id,
      data: { resource }
    });

    return {
      success: true,
      data: resource,
      errors: [],
      warnings: validation.warnings
    };
  }

  /**
   * Updates resource status
   * NEW: Centralized resource status management
   */
  private async updateResourceStatus(
    resourceIds: string[],
    status: ResourceStatus
  ): Promise<void> {
    for (const resourceId of resourceIds) {
      const resource = this.resources.get(resourceId);
      if (resource) {
        const updatedResource: Resource = {
          ...resource,
          status,
          updatedAt: nowTimestamp(this.config.timezone)
        };
        this.resources.set(resourceId, updatedResource);
      }
    }
  }

  /**
   * Validates resource availability for a time slot
   * NEW: Comprehensive availability checking
   */
  private async validateResourceAvailability(
    resourceIds: string[],
    timeSlot: TimeSlot
  ): Promise<AvailabilityResult> {
    const unavailableReasons: string[] = [];
    const availableSlots: TimeSlot[] = [];

    for (const resourceId of resourceIds) {
      const resource = this.resources.get(resourceId);
      if (!resource) {
        unavailableReasons.push(`Resource ${resourceId} not found`);
        continue;
      }

      if (resource.status !== 'available') {
        unavailableReasons.push(`Resource ${resourceId} is ${resource.status}`);
        continue;
      }

      // Check if resource is available during the time slot
      const isAvailable = await this.config.adapter.checkResourceAvailability(
        resource,
        timeSlot
      );
      if (!isAvailable) {
        unavailableReasons.push(`Resource ${resourceId} is not available during ${formatTimeSlotForUser(timeSlot)}`);
      }
    }

    return {
      isAvailable: unavailableReasons.length === 0,
      availableSlots,
      unavailableReasons,
      suggestedAlternatives: [] // Could be implemented later
    };
  }

  // ===============================
  // CONFLICT DETECTION
  // ===============================

  /**
   * Checks for booking conflicts
   * REPLACES: All legacy conflict detection
   */
  private async checkBookingConflicts(
    timeSlot: TimeSlot,
    resourceIds: string[],
    excludeBookingIds: string[] = []
  ): Promise<ConflictResult> {
    const conflicts: ConflictResult['conflicts'] = [];

    // Check against existing bookings
    for (const [bookingId, booking] of this.bookings) {
      if (excludeBookingIds.includes(bookingId)) continue;
      if (booking.status === 'cancelled' || booking.status === 'expired') continue;

      // Check if same date and overlapping resources
      if (booking.timeSlot.date === timeSlot.date) {
        const hasSharedResources = booking.resourceIds.some(id => resourceIds.includes(id));
        if (hasSharedResources && checkTimeSlotOverlap(timeSlot, booking.timeSlot)) {
          conflicts.push({
            type: 'time',
            message: `Time conflict with booking ${bookingId}`,
            conflictingBooking: booking
          });
        }
      }
    }

    // Check business-specific conflicts
    const businessConflicts = await this.config.adapter.checkBusinessConflicts(
      timeSlot,
      resourceIds
    );
    conflicts.push(...businessConflicts.conflicts);

    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  // ===============================
  // QUERY OPERATIONS
  // ===============================

  /**
   * Queries bookings with flexible filters
   * REPLACES: All legacy booking queries
   */
  async queryBookings(options: QueryOptions = {}): Promise<EngineResult<Booking[]>> {
    let bookings = Array.from(this.bookings.values());

    // Apply filters
    if (options.dateRange) {
      bookings = bookings.filter(booking =>
        booking.timeSlot.date >= options.dateRange!.startDate &&
        booking.timeSlot.date <= options.dateRange!.endDate
      );
    }

    if (options.resourceIds && options.resourceIds.length > 0) {
      bookings = bookings.filter(booking =>
        booking.resourceIds.some(id => options.resourceIds!.includes(id))
      );
    }

    if (options.bookingTypes && options.bookingTypes.length > 0) {
      bookings = bookings.filter(booking =>
        options.bookingTypes!.includes(booking.type)
      );
    }

    if (options.statuses && options.statuses.length > 0) {
      bookings = bookings.filter(booking =>
        options.statuses!.includes(booking.status)
      );
    }

    // Apply adapter-specific filtering
    const adapterResult = await this.config.adapter.filterBookings(bookings, options);
    if (!adapterResult.success) {
      return adapterResult;
    }

    return {
      success: true,
      data: adapterResult.data || bookings,
      errors: [],
      warnings: []
    };
  }

  /**
   * Gets available time slots for booking
   * NEW: Intelligent availability calculation
   */
  async getAvailableSlots(
    date: ISODateString,
    resourceIds: string[],
    duration: DurationMinutes
  ): Promise<EngineResult<TimeSlot[]>> {
    const availableSlots: TimeSlot[] = [];

    // Get business hours for the date
    const businessHours = await this.config.adapter.getBusinessHours(date);
    if (!businessHours) {
      return {
        success: false,
        errors: [`No business hours defined for ${date}`],
        warnings: []
      };
    }

    // Generate potential slots
    for (const window of businessHours.workingDays) {
      const slots = await this.generateTimeSlots(date, window.startTime, window.endTime, duration);
      for (const slot of slots) {
        const availability = await this.validateResourceAvailability(resourceIds, slot);
        const conflicts = await this.checkBookingConflicts(slot, resourceIds);

        if (availability.isAvailable && !conflicts.hasConflicts) {
          availableSlots.push(slot);
        }
      }
    }

    return {
      success: true,
      data: availableSlots,
      errors: [],
      warnings: []
    };
  }

  /**
   * Generates time slots for a given time range
   * NEW: Smart slot generation
   */
  private async generateTimeSlots(
    date: ISODateString,
    startTime: ISOTimeString,
    endTime: ISOTimeString,
    duration: DurationMinutes
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const increment = 30 as DurationMinutes; // 30-minute increments

    let currentTime = startTime;
    while (currentTime < endTime) {
      const slot: TimeSlot = {
        id: crypto.randomUUID(),
        date,
        startTime: currentTime,
        endTime: this.addMinutesToTime(currentTime, duration),
        duration,
        timezone: this.config.timezone
      };

      slots.push(slot);
      currentTime = this.addMinutesToTime(currentTime, increment);
    }

    return slots;
  }

  /**
   * Helper to add minutes to time
   * NEW: Time arithmetic utility
   */
  private addMinutesToTime(time: ISOTimeString, minutes: DurationMinutes): ISOTimeString {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}` as ISOTimeString;
  }

  // ===============================
  // EVENT SYSTEM
  // ===============================

  /**
   * Initializes event listeners
   * NEW: EventBus integration
   */
  private initializeEventListeners(): void {
    const eventTypes: CalendarEventType[] = [
      'booking_created', 'booking_updated', 'booking_cancelled', 'booking_confirmed',
      'booking_completed', 'resource_assigned', 'resource_released',
      'conflict_detected', 'availability_changed', 'schedule_optimized'
    ];

    for (const eventType of eventTypes) {
      this.eventListeners.set(eventType, new Set());
    }
  }

  /**
   * Emits calendar event
   * NEW: EventBus integration
   */
  private async emitEvent(
    type: CalendarEventType,
    payload: Omit<CalendarEvent, 'type' | 'timestamp' | 'businessModel' | 'userId'>
  ): Promise<void> {
    if (!this.config.eventBusEnabled) return;

    const event: CalendarEvent = {
      type,
      timestamp: nowTimestamp(this.config.timezone),
      businessModel: this.config.businessModel,
      userId: 'system', // Could be passed in context
      ...payload
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          logger.error('App', `Error in calendar event listener for ${type}:`, error);
        }
      }
    }
  }

  /**
   * Subscribes to calendar events
   * NEW: Event subscription system
   */
  addEventListener(
    type: CalendarEventType,
    listener: (event: CalendarEvent) => void
  ): () => void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
    return () => {};
  }

  // ===============================
  // ENGINE STATUS AND UTILITIES
  // ===============================

  /**
   * Gets engine status and statistics
   * NEW: Engine monitoring
   */
  getEngineStatus() {
    return {
      businessModel: this.config.businessModel,
      timezone: this.config.timezone,
      totalBookings: this.bookings.size,
      totalResources: this.resources.size,
      enabledFeatures: Array.from(this.config.enabledFeatures),
      adapterType: this.config.adapter.constructor.name
    };
  }

  /**
   * Clears all engine data
   * NEW: Engine reset functionality
   */
  clearAll(): void {
    this.bookings.clear();
    this.resources.clear();
  }
}

// ===============================
// EXPORTS
// ===============================

export type {
  CalendarEngineConfig,
  QueryOptions,
  EngineResult
};