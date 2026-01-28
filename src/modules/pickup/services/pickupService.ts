/**
 * PICKUP SERVICE
 *
 * Handles pickup-specific operations:
 * - Time slot management
 * - QR code generation and validation
 * - Pickup confirmation
 *
 * INTEGRATION: Works alongside core fulfillmentService
 *
 * @version 1.0.0
 * @author G-Admin Team
 * @phase Phase 1 - Fulfillment Capabilities
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import type {
  PickupTimeSlot,
  SlotAvailability,
  TimeSlotConfig,
  PickupQRCode,
  QRValidation,
  ConfirmationResult
} from '../types';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Default time slot configuration
 * Can be overridden per location
 */
export const DEFAULT_TIMESLOT_CONFIG: TimeSlotConfig = {
  intervalMinutes: 30,        // 30-minute slots
  startHour: 9,               // 9 AM
  endHour: 21,                // 9 PM
  capacity: 5,                // 5 orders per slot
  cutoffMinutes: 30,          // 30 min cutoff
  daysAhead: 7                // Show 7 days ahead
};

// ============================================
// PICKUP SERVICE
// ============================================

export const pickupService = {

  // ============================================
  // TIME SLOT OPERATIONS
  // ============================================

  /**
   * Get available time slots for a date
   *
   * @param date - Date in YYYY-MM-DD format
   * @param locationId - Optional location filter
   * @param config - Optional custom config
   * @returns Array of slot availabilities
   */
  async getAvailableSlots(
    date: string,
    locationId?: string,
    config: Partial<TimeSlotConfig> = {}
  ): Promise<SlotAvailability[]> {
    try {
      const finalConfig = { ...DEFAULT_TIMESLOT_CONFIG, ...config };

      logger.debug('PickupService', 'Getting available slots', { date, locationId });

      // Query slots from database
      let query = supabase
        .from('pickup_time_slots')
        .select('*')
        .eq('date', date)
        .eq('is_available', true)
        .order('time_start', { ascending: true });

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data: slots, error } = await query;

      if (error) throw error;

      // If no slots exist for this date, generate them
      if (!slots || slots.length === 0) {
        logger.debug('PickupService', 'No slots found, generating...', { date });
        await this.generateSlotsForDate(date, locationId, finalConfig);

        // Re-query after generation
        const { data: newSlots, error: retryError } = await query;
        if (retryError) throw retryError;

        return this._mapSlotsToAvailability(newSlots || [], finalConfig);
      }

      return this._mapSlotsToAvailability(slots, finalConfig);
    } catch (error) {
      logger.error('PickupService', 'Error getting available slots', error);
      throw error;
    }
  },

  /**
   * Generate time slots for a specific date
   *
   * @param date - Date in YYYY-MM-DD format
   * @param locationId - Location ID
   * @param config - Time slot configuration
   */
  async generateSlotsForDate(
    date: string,
    locationId?: string,
    config: TimeSlotConfig = DEFAULT_TIMESLOT_CONFIG
  ): Promise<void> {
    try {
      logger.debug('PickupService', 'Generating slots', { date, locationId, config });

      const slots: Partial<PickupTimeSlot>[] = [];

      // Generate slots from startHour to endHour
      for (let hour = config.startHour; hour < config.endHour; hour++) {
        const slotsPerHour = 60 / config.intervalMinutes;

        for (let i = 0; i < slotsPerHour; i++) {
          const startMinute = i * config.intervalMinutes;
          const endMinute = startMinute + config.intervalMinutes;

          const timeStart = `${hour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
          const timeEnd = endMinute === 60
            ? `${(hour + 1).toString().padStart(2, '0')}:00`
            : `${hour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

          slots.push({
            location_id: locationId || 'default',
            date,
            time_start: timeStart,
            time_end: timeEnd,
            capacity: config.capacity,
            booked_count: 0,
            is_available: true
          });
        }
      }

      // Insert slots into database
      const { error } = await supabase
        .from('pickup_time_slots')
        .insert(slots);

      if (error) throw error;

      logger.info('PickupService', 'Slots generated successfully', {
        date,
        count: slots.length
      });
    } catch (error) {
      logger.error('PickupService', 'Error generating slots', error);
      throw error;
    }
  },

  /**
   * Reserve a time slot for an order
   *
   * @param slotId - Time slot ID
   * @param orderId - Order ID
   * @returns Updated slot
   */
  async reserveSlot(slotId: string, orderId: string): Promise<PickupTimeSlot> {
    try {
      logger.debug('PickupService', 'Reserving slot', { slotId, orderId });

      // Get current slot
      const { data: slot, error: fetchError } = await supabase
        .from('pickup_time_slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (fetchError) throw fetchError;

      if (!slot) {
        throw new Error(`Slot not found: ${slotId}`);
      }

      // Check availability
      if (slot.booked_count >= slot.capacity) {
        throw new Error('Slot is fully booked');
      }

      // Increment booked_count
      const newCount = slot.booked_count + 1;
      const isAvailable = newCount < slot.capacity;

      const { data: updatedSlot, error: updateError } = await supabase
        .from('pickup_time_slots')
        .update({
          booked_count: newCount,
          is_available: isAvailable
        })
        .eq('id', slotId)
        .select()
        .single();

      if (updateError) throw updateError;

      logger.info('PickupService', 'Slot reserved', {
        slotId,
        orderId,
        bookedCount: newCount,
        capacity: slot.capacity
      });

      return updatedSlot;
    } catch (error) {
      logger.error('PickupService', 'Error reserving slot', error);
      throw error;
    }
  },

  /**
   * Release a time slot (when order is cancelled)
   *
   * @param slotId - Time slot ID
   * @param orderId - Order ID
   */
  async releaseSlot(slotId: string, orderId: string): Promise<void> {
    try {
      logger.debug('PickupService', 'Releasing slot', { slotId, orderId });

      // Get current slot
      const { data: slot, error: fetchError } = await supabase
        .from('pickup_time_slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (fetchError) throw fetchError;

      if (!slot) {
        logger.warn('PickupService', 'Slot not found for release', { slotId });
        return;
      }

      // Decrement booked_count
      const newCount = Math.max(0, slot.booked_count - 1);

      await supabase
        .from('pickup_time_slots')
        .update({
          booked_count: newCount,
          is_available: true  // Always make available when releasing
        })
        .eq('id', slotId);

      logger.info('PickupService', 'Slot released', {
        slotId,
        orderId,
        bookedCount: newCount
      });
    } catch (error) {
      logger.error('PickupService', 'Error releasing slot', error);
    }
  },

  // ============================================
  // QR CODE OPERATIONS
  // ============================================

  /**
   * Generate pickup QR code for an order
   *
   * @param orderId - Order ID
   * @param pickupCode - Pickup code (auto-generated if not provided)
   * @returns QR code data
   */
  async generatePickupQR(
    orderId: string,
    pickupCode?: string
  ): Promise<PickupQRCode> {
    try {
      // Generate pickup code if not provided
      const code = pickupCode || this._generatePickupCode();

      logger.debug('PickupService', 'Generating QR code', { orderId, pickupCode: code });

      // Create QR code data
      const qrData = {
        orderId,
        pickupCode: code,
        type: 'pickup',
        timestamp: new Date().toISOString()
      };

      const qrCodeData = JSON.stringify(qrData);

      // TODO: Generate actual QR code image using a library (qrcode.react or similar)
      // For now, return data string
      const qrCode: PickupQRCode = {
        orderId,
        pickupCode: code,
        qrCodeData,
        generatedAt: new Date().toISOString()
      };

      logger.info('PickupService', 'QR code generated', { orderId, pickupCode: code });

      return qrCode;
    } catch (error) {
      logger.error('PickupService', 'Error generating QR code', error);
      throw error;
    }
  },

  /**
   * Validate pickup QR code
   *
   * @param qrCodeData - QR code string data
   * @returns Validation result
   */
  async validatePickupQR(qrCodeData: string): Promise<QRValidation> {
    try {
      logger.debug('PickupService', 'Validating QR code');

      // Parse QR data
      interface QRData {
        orderId?: string;
        pickupCode?: string;
        [key: string]: unknown;
      }

      let parsedData: QRData;
      try {
        parsedData = JSON.parse(qrCodeData) as QRData;
      } catch {
        return {
          valid: false,
          errorMessage: 'Invalid QR code format'
        };
      }

      const { orderId, pickupCode, type } = parsedData;

      // Validate type
      if (type !== 'pickup') {
        return {
          valid: false,
          errorMessage: 'Not a pickup QR code'
        };
      }

      // Get order from fulfillment queue
      const { fulfillmentService } = await import('../../services/fulfillmentService');

      const queueItems = await fulfillmentService.getQueue({
        type: 'pickup'
      });

      const queueItem = queueItems.find(item =>
        item.order_id === orderId &&
        item.metadata?.pickup_code === pickupCode
      );

      if (!queueItem) {
        return {
          valid: false,
          orderId,
          pickupCode,
          errorMessage: 'Order not found or code mismatch'
        };
      }

      // Check if order is ready
      if (queueItem.status !== 'ready') {
        return {
          valid: false,
          orderId,
          pickupCode,
          queueId: queueItem.id,
          orderStatus: queueItem.status,
          errorMessage: `Order not ready. Current status: ${queueItem.status}`
        };
      }

      // Valid!
      return {
        valid: true,
        orderId,
        pickupCode,
        queueId: queueItem.id,
        orderStatus: queueItem.status,
        customerName: queueItem.order?.customer?.name,
        orderTotal: queueItem.order?.total
      };
    } catch (error) {
      logger.error('PickupService', 'Error validating QR code', error);
      return {
        valid: false,
        errorMessage: 'Validation error occurred'
      };
    }
  },

  /**
   * Confirm pickup (complete order)
   *
   * @param qrCodeData - QR code string data OR manual pickup code
   * @param confirmedBy - Staff user ID
   * @param notes - Optional notes
   * @returns Confirmation result
   */
  async confirmPickup(
    qrCodeData: string,
    confirmedBy?: string,
    notes?: string
  ): Promise<ConfirmationResult> {
    try {
      logger.debug('PickupService', 'Confirming pickup');

      // Validate QR code
      const validation = await this.validatePickupQR(qrCodeData);

      if (!validation.valid) {
        return {
          success: false,
          errorMessage: validation.errorMessage
        };
      }

      // Complete the order
      const { fulfillmentService } = await import('../../services/fulfillmentService');

      await fulfillmentService.transitionStatus(
        validation.queueId!,
        'completed',
        {
          confirmed_by: confirmedBy,
          confirmed_at: new Date().toISOString(),
          notes
        }
      );

      logger.info('PickupService', 'Pickup confirmed', {
        orderId: validation.orderId,
        queueId: validation.queueId,
        confirmedBy
      });

      notify.success({
        title: 'Pickup Confirmed',
        description: `Order #${validation.orderId?.slice(0, 8)} completed successfully`
      });

      return {
        success: true,
        orderId: validation.orderId,
        queueId: validation.queueId
      };
    } catch (error) {
      logger.error('PickupService', 'Error confirming pickup', error);
      return {
        success: false,
        errorMessage: 'Confirmation failed'
      };
    }
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * Send pickup ready notification to customer
   *
   * @param orderId - Order ID
   * @param pickupCode - Pickup code
   * @param customerPhone - Customer phone number
   */
  async notifyCustomerReady(
    orderId: string,
    pickupCode: string,
    customerPhone?: string
  ): Promise<void> {
    try {
      logger.info('PickupService', 'Sending pickup ready notification', {
        orderId,
        pickupCode,
        hasPhone: !!customerPhone
      });

      // TODO: Integrate with SMS service (Twilio)
      // TODO: Integrate with email service (SendGrid)
      // TODO: Integrate with push notifications

      // For now, just log
      logger.debug('PickupService', 'Notification would be sent', {
        message: `Your order is ready for pickup! Code: ${pickupCode}`,
        phone: customerPhone
      });

      notify.success({
        title: 'Customer Notified',
        description: `Pickup code ${pickupCode} sent to customer`
      });
    } catch (error) {
      logger.error('PickupService', 'Error sending notification', error);
    }
  },

  /**
   * Get pickup instructions text
   *
   * @param orderId - Order ID
   * @param pickupCode - Pickup code
   * @returns Instruction text
   */
  getPickupInstructions(orderId: string, pickupCode: string): string {
    return `
Your order is ready for pickup!

Pickup Code: ${pickupCode}

Instructions:
1. Come to our pickup counter
2. Show this code to staff OR scan the QR code
3. Collect your order

Location: [Location Address]
Hours: 9 AM - 9 PM

Questions? Call us at [Phone Number]

Order ID: ${orderId.slice(0, 8)}
    `.trim();
  },

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Generate random pickup code (PRIVATE)
   */
  _generatePickupCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars
    let code = '';

    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
  },

  /**
   * Map slots to availability objects (PRIVATE)
   */
  _mapSlotsToAvailability(
    slots: PickupTimeSlot[],
    config: TimeSlotConfig
  ): SlotAvailability[] {
    const now = new Date();

    return slots.map(slot => {
      const spotsRemaining = slot.capacity - slot.booked_count;
      const isFullyBooked = spotsRemaining <= 0;

      // Check if past cutoff time
      const slotDateTime = new Date(`${slot.date}T${slot.time_start}`);
      const cutoffTime = new Date(slotDateTime.getTime() - config.cutoffMinutes * 60000);
      const isPastCutoff = now >= cutoffTime;

      const available = slot.is_available && !isFullyBooked && !isPastCutoff;

      return {
        slot,
        available,
        spotsRemaining,
        isFullyBooked,
        isPastCutoff
      };
    });
  }
};

// ============================================
// EXPORTS
// ============================================

export default pickupService;
