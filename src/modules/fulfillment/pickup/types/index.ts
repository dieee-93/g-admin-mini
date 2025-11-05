/**
 * PICKUP MODULE TYPE DEFINITIONS
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

// ============================================
// TIME SLOT TYPES
// ============================================

/**
 * Time slot for pickup scheduling
 */
export interface PickupTimeSlot {
  id: string;
  location_id: string;
  date: string;              // YYYY-MM-DD format
  time_start: string;        // HH:MM format (24h)
  time_end: string;          // HH:MM format (24h)
  capacity: number;          // Max orders per slot
  booked_count: number;      // Current bookings
  is_available: boolean;     // Availability flag
  created_at: string;
  updated_at?: string;
}

/**
 * Time slot availability
 */
export interface SlotAvailability {
  slot: PickupTimeSlot;
  available: boolean;
  spotsRemaining: number;
  isFullyBooked: boolean;
  isPastCutoff: boolean;     // Too close to slot time
}

/**
 * Time slot configuration
 */
export interface TimeSlotConfig {
  intervalMinutes: 15 | 30 | 60;  // Slot duration
  startHour: number;                // Business start (e.g., 9)
  endHour: number;                  // Business end (e.g., 21)
  capacity: number;                 // Default capacity per slot
  cutoffMinutes: number;            // Booking cutoff before slot (e.g., 30)
  daysAhead: number;                // How many days ahead to show (e.g., 7)
}

/**
 * Time slot filters
 */
export interface TimeSlotFilters {
  location_id?: string;
  date?: string;              // YYYY-MM-DD
  date_from?: string;
  date_to?: string;
  is_available?: boolean;
  min_capacity?: number;
}

// ============================================
// QR CODE TYPES
// ============================================

/**
 * Pickup QR code data
 */
export interface PickupQRCode {
  orderId: string;
  pickupCode: string;         // Alphanumeric code (e.g., "ABC123")
  qrCodeData: string;         // QR code string (JSON)
  qrCodeImage?: string;       // Base64 image (optional)
  expiresAt?: string;         // Expiration time
  generatedAt: string;
}

/**
 * QR code validation result
 */
export interface QRValidation {
  valid: boolean;
  orderId?: string;
  pickupCode?: string;
  queueId?: string;
  errorMessage?: string;
  orderStatus?: string;
  customerName?: string;
  orderTotal?: string;
}

// ============================================
// PICKUP CONFIRMATION TYPES
// ============================================

/**
 * Pickup confirmation data
 */
export interface PickupConfirmation {
  queueId: string;
  orderId: string;
  pickupCode: string;
  confirmedBy?: string;       // Staff user ID
  confirmedAt: string;
  notes?: string;
}

/**
 * Pickup confirmation result
 */
export interface ConfirmationResult {
  success: boolean;
  queueId?: string;
  orderId?: string;
  errorMessage?: string;
  receiptUrl?: string;
}

// ============================================
// PICKUP ORDER METADATA
// ============================================

/**
 * Extended order metadata for pickup orders
 */
export interface PickupOrderMetadata {
  pickup_time_slot: string;   // ISO timestamp
  pickup_code: string;         // Alphanumeric code
  customer_phone?: string;     // For SMS notifications
  customer_email?: string;     // For email notifications
  special_instructions?: string;
  notification_sent?: boolean;
  notification_sent_at?: string;
}

// ============================================
// PICKUP STATISTICS
// ============================================

/**
 * Pickup statistics
 */
export interface PickupStats {
  total_orders: number;
  pending: number;
  ready: number;
  completed: number;
  cancelled: number;
  average_wait_time_minutes: number;
  on_time_percentage: number;
  popular_time_slots: Array<{
    time: string;
    count: number;
  }>;
}

// ============================================
// EXPORTS
// ============================================

export type {
  PickupTimeSlot,
  SlotAvailability,
  TimeSlotConfig,
  TimeSlotFilters,
  PickupQRCode,
  QRValidation,
  PickupConfirmation,
  ConfirmationResult,
  PickupOrderMetadata,
  PickupStats
};
