/**
 * CALENDAR SLOT DEFINITIONS - G-ADMIN MINI v3.0
 *
 * Defines all available slots in the calendar system
 * Provides type-safe slot names and registration helpers
 *
 * @version 3.0.0
 */

// ===============================
// CORE SLOT DEFINITIONS
// ===============================

/**
 * Universal calendar slots available to all business models
 */
export const CALENDAR_SLOTS = {
  // Main calendar structure
  CALENDAR_HEADER: 'calendar-header',
  CALENDAR_MAIN: 'calendar-main',
  CALENDAR_SIDEBAR: 'calendar-sidebar',
  CALENDAR_FOOTER: 'calendar-footer',

  // Header components
  HEADER_NAVIGATION: 'header-navigation',
  HEADER_ACTIONS: 'header-actions',
  HEADER_SEARCH: 'header-search',
  HEADER_FILTERS: 'header-filters',
  HEADER_VIEW_SELECTOR: 'header-view-selector',

  // Main grid components
  GRID_CELL: 'grid-cell',
  GRID_TIME_LABELS: 'grid-time-labels',
  GRID_DATE_LABELS: 'grid-date-labels',
  GRID_BOOKING_ITEM: 'grid-booking-item',
  GRID_EMPTY_SLOT: 'grid-empty-slot',

  // Sidebar components
  SIDEBAR_FILTERS: 'sidebar-filters',
  SIDEBAR_LEGEND: 'sidebar-legend',
  SIDEBAR_QUICK_ACTIONS: 'sidebar-quick-actions',
  SIDEBAR_STATS: 'sidebar-stats',
  SIDEBAR_ALERTS: 'sidebar-alerts',

  // Booking components
  BOOKING_FORM: 'booking-form',
  BOOKING_DETAILS: 'booking-details',
  BOOKING_ACTIONS: 'booking-actions',
  BOOKING_STATUS: 'booking-status',
  BOOKING_VALIDATION: 'booking-validation',

  // Modal and overlay components
  BOOKING_MODAL: 'booking-modal',
  CONFIRMATION_MODAL: 'confirmation-modal',
  ERROR_MODAL: 'error-modal',
  LOADING_OVERLAY: 'loading-overlay',

  // Notification components
  NOTIFICATIONS: 'notifications',
  ALERTS: 'alerts',
  SUCCESS_MESSAGES: 'success-messages',
  ERROR_MESSAGES: 'error-messages'
} as const;

/**
 * Business model specific slot patterns
 */
export const BUSINESS_MODEL_SLOTS = {
  // Staff scheduling specific
  STAFF_SCHEDULING: {
    SHIFT_ACTIONS: 'staff-scheduling-shift-actions',
    COVERAGE_PLANNER: 'staff-scheduling-coverage-planner',
    TIME_OFF_MANAGER: 'staff-scheduling-time-off-manager',
    LABOR_COST_TRACKER: 'staff-scheduling-labor-cost-tracker',
    SCHEDULE_OPTIMIZER: 'staff-scheduling-schedule-optimizer',
    OVERTIME_ALERTS: 'staff-scheduling-overtime-alerts',
    COMPLIANCE_CHECKER: 'staff-scheduling-compliance-checker'
  },

  // Medical appointments specific
  MEDICAL_APPOINTMENTS: {
    PATIENT_ACTIONS: 'medical-appointments-patient-actions',
    APPOINTMENT_TYPES: 'medical-appointments-appointment-types',
    PROVIDER_AVAILABILITY: 'medical-appointments-provider-availability',
    WAITING_ROOM: 'medical-appointments-waiting-room',
    REMINDER_SYSTEM: 'medical-appointments-reminder-system',
    INSURANCE_VERIFICATION: 'medical-appointments-insurance-verification',
    TELEMEDICINE_OPTIONS: 'medical-appointments-telemedicine-options'
  },

  // Fitness classes specific
  FITNESS_CLASSES: {
    CLASS_ACTIONS: 'fitness-classes-class-actions',
    CAPACITY_MANAGER: 'fitness-classes-capacity-manager',
    WAITLIST_MANAGER: 'fitness-classes-waitlist-manager',
    INSTRUCTOR_SCHEDULE: 'fitness-classes-instructor-schedule',
    EQUIPMENT_TRACKER: 'fitness-classes-equipment-tracker',
    MEMBERSHIP_VALIDATOR: 'fitness-classes-membership-validator',
    PROGRESS_TRACKER: 'fitness-classes-progress-tracker'
  },

  // Equipment rental specific
  EQUIPMENT_RENTAL: {
    RENTAL_ACTIONS: 'equipment-rental-rental-actions',
    INVENTORY_STATUS: 'equipment-rental-inventory-status',
    DAMAGE_REPORTS: 'equipment-rental-damage-reports',
    PRICING_CALCULATOR: 'equipment-rental-pricing-calculator',
    RETURN_TRACKER: 'equipment-rental-return-tracker',
    MAINTENANCE_SCHEDULER: 'equipment-rental-maintenance-scheduler',
    AVAILABILITY_CHECKER: 'equipment-rental-availability-checker'
  },

  // Event booking specific
  EVENT_BOOKING: {
    EVENT_ACTIONS: 'event-booking-event-actions',
    VENUE_MANAGER: 'event-booking-venue-manager',
    CATERING_OPTIONS: 'event-booking-catering-options',
    GUEST_MANAGER: 'event-booking-guest-manager',
    SETUP_PLANNER: 'event-booking-setup-planner',
    VENDOR_COORDINATOR: 'event-booking-vendor-coordinator',
    INVOICE_GENERATOR: 'event-booking-invoice-generator'
  },

  // Space rental specific
  SPACE_RENTAL: {
    SPACE_ACTIONS: 'space-rental-space-actions',
    LAYOUT_PLANNER: 'space-rental-layout-planner',
    AMENITIES_MANAGER: 'space-rental-amenities-manager',
    ACCESS_CONTROL: 'space-rental-access-control',
    CLEANING_SCHEDULER: 'space-rental-cleaning-scheduler',
    SECURITY_MONITORING: 'space-rental-security-monitoring',
    USAGE_ANALYTICS: 'space-rental-usage-analytics'
  }
} as const;

// ===============================
// SLOT CATEGORIES
// ===============================

/**
 * Slot categories for organization
 */
export const SLOT_CATEGORIES = {
  NAVIGATION: [
    CALENDAR_SLOTS.CALENDAR_HEADER,
    CALENDAR_SLOTS.HEADER_NAVIGATION,
    CALENDAR_SLOTS.HEADER_VIEW_SELECTOR
  ],

  DISPLAY: [
    CALENDAR_SLOTS.CALENDAR_MAIN,
    CALENDAR_SLOTS.GRID_CELL,
    CALENDAR_SLOTS.GRID_BOOKING_ITEM,
    CALENDAR_SLOTS.GRID_TIME_LABELS,
    CALENDAR_SLOTS.GRID_DATE_LABELS
  ],

  INTERACTION: [
    CALENDAR_SLOTS.BOOKING_FORM,
    CALENDAR_SLOTS.BOOKING_ACTIONS,
    CALENDAR_SLOTS.HEADER_ACTIONS,
    CALENDAR_SLOTS.SIDEBAR_QUICK_ACTIONS
  ],

  INFORMATION: [
    CALENDAR_SLOTS.CALENDAR_SIDEBAR,
    CALENDAR_SLOTS.SIDEBAR_LEGEND,
    CALENDAR_SLOTS.SIDEBAR_STATS,
    CALENDAR_SLOTS.BOOKING_DETAILS
  ],

  FEEDBACK: [
    CALENDAR_SLOTS.NOTIFICATIONS,
    CALENDAR_SLOTS.ALERTS,
    CALENDAR_SLOTS.SUCCESS_MESSAGES,
    CALENDAR_SLOTS.ERROR_MESSAGES
  ],

  MODALS: [
    CALENDAR_SLOTS.BOOKING_MODAL,
    CALENDAR_SLOTS.CONFIRMATION_MODAL,
    CALENDAR_SLOTS.ERROR_MODAL,
    CALENDAR_SLOTS.LOADING_OVERLAY
  ]
} as const;

// ===============================
// SLOT PRIORITY DEFINITIONS
// ===============================

/**
 * Default priorities for slot registration
 */
export const SLOT_PRIORITIES = {
  BUSINESS_MODEL_SPECIFIC: 100,
  FEATURE_SPECIFIC: 50,
  GENERIC: 10,
  FALLBACK: 1
} as const;

// ===============================
// TYPE DEFINITIONS
// ===============================

/**
 * Type for calendar slot names
 */
export type CalendarSlotName = typeof CALENDAR_SLOTS[keyof typeof CALENDAR_SLOTS];

/**
 * Type for business model slot names
 */
export type BusinessModelSlotName =
  | typeof BUSINESS_MODEL_SLOTS.STAFF_SCHEDULING[keyof typeof BUSINESS_MODEL_SLOTS.STAFF_SCHEDULING]
  | typeof BUSINESS_MODEL_SLOTS.MEDICAL_APPOINTMENTS[keyof typeof BUSINESS_MODEL_SLOTS.MEDICAL_APPOINTMENTS]
  | typeof BUSINESS_MODEL_SLOTS.FITNESS_CLASSES[keyof typeof BUSINESS_MODEL_SLOTS.FITNESS_CLASSES]
  | typeof BUSINESS_MODEL_SLOTS.EQUIPMENT_RENTAL[keyof typeof BUSINESS_MODEL_SLOTS.EQUIPMENT_RENTAL]
  | typeof BUSINESS_MODEL_SLOTS.EVENT_BOOKING[keyof typeof BUSINESS_MODEL_SLOTS.EVENT_BOOKING]
  | typeof BUSINESS_MODEL_SLOTS.SPACE_RENTAL[keyof typeof BUSINESS_MODEL_SLOTS.SPACE_RENTAL];

/**
 * Type for all slot names
 */
export type AnySlotName = CalendarSlotName | BusinessModelSlotName;

/**
 * Slot category type
 */
export type SlotCategory = keyof typeof SLOT_CATEGORIES;

// ===============================
// SLOT UTILITIES
// ===============================

/**
 * Get slots for a specific category
 */
export function getSlotsForCategory(category: SlotCategory): string[] {
  return SLOT_CATEGORIES[category] || [];
}

/**
 * Get business model slots
 */
export function getBusinessModelSlots(businessModel: string): string[] {
  const normalizedModel = businessModel.toUpperCase().replace(/-/g, '_');
  const slots = BUSINESS_MODEL_SLOTS[normalizedModel as keyof typeof BUSINESS_MODEL_SLOTS];

  if (!slots) return [];

  return Object.values(slots);
}

/**
 * Check if slot name is valid
 */
export function isValidSlotName(slotName: string): boolean {
  // Check universal slots
  if (Object.values(CALENDAR_SLOTS).includes(slotName as CalendarSlotName)) {
    return true;
  }

  // Check business model slots
  for (const businessModelSlots of Object.values(BUSINESS_MODEL_SLOTS)) {
    if (Object.values(businessModelSlots).includes(slotName as any)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate slot name for business model
 */
export function generateBusinessSlotName(
  businessModel: string,
  slotName: string
): string {
  return `${businessModel.toLowerCase().replace(/_/g, '-')}-${slotName}`;
}

/**
 * Parse business slot name
 */
export function parseBusinessSlotName(fullSlotName: string): {
  businessModel: string | null;
  slotName: string;
} {
  const parts = fullSlotName.split('-');

  if (parts.length < 2) {
    return {
      businessModel: null,
      slotName: fullSlotName
    };
  }

  // Check if first part is a known business model
  const possibleBusinessModel = parts[0];
  const knownBusinessModels = [
    'staff',
    'medical',
    'fitness',
    'equipment',
    'event',
    'space'
  ];

  if (knownBusinessModels.includes(possibleBusinessModel)) {
    return {
      businessModel: possibleBusinessModel,
      slotName: parts.slice(1).join('-')
    };
  }

  return {
    businessModel: null,
    slotName: fullSlotName
  };
}

/**
 * Get all available slot names
 */
export function getAllSlotNames(): string[] {
  const allSlots: string[] = [];

  // Add universal slots
  allSlots.push(...Object.values(CALENDAR_SLOTS));

  // Add business model slots
  for (const businessModelSlots of Object.values(BUSINESS_MODEL_SLOTS)) {
    allSlots.push(...Object.values(businessModelSlots));
  }

  return allSlots;
}

/**
 * Get slot documentation
 */
export function getSlotDocumentation(slotName: string): {
  name: string;
  category: string;
  description: string;
  businessModel?: string;
} | null {
  // This would typically come from a documentation system
  // For now, provide basic info based on slot name

  const parsed = parseBusinessSlotName(slotName);
  const category = Object.entries(SLOT_CATEGORIES).find(([, slots]) =>
    slots.includes(slotName)
  )?.[0] || 'UNKNOWN';

  return {
    name: slotName,
    category,
    description: `Slot for ${slotName.replace(/-/g, ' ')} functionality`,
    businessModel: parsed.businessModel || undefined
  };
}

// ===============================
// EXPORTS
// ===============================

export default {
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
  getSlotDocumentation
};