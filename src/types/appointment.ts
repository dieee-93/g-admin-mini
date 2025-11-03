/**
 * Appointment Types
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 1
 * Integration with Sales module (Sale with order_type: 'APPOINTMENT')
 */

import type { Sale } from '@/pages/admin/operations/sales/types';
import { OrderType } from '@/pages/admin/operations/sales/types';
import type { Employee } from '@/pages/admin/resources/staff/types';

// ============================================================================
// Appointment Slot Types
// ============================================================================

export type AppointmentSlotStatus = 'available' | 'booked' | 'blocked';

export interface AppointmentSlot {
  id: string;
  staff_id: string;
  date: string; // ISO date string YYYY-MM-DD
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  status: AppointmentSlotStatus;
  appointment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentSlotWithStaff extends AppointmentSlot {
  staff_name: string;
  staff_email?: string;
  staff_phone?: string;
}

// ============================================================================
// Service/Product Types (for appointments)
// ============================================================================

export type ProductType = 'ELABORATED' | 'SERVICE' | 'RETAIL' | 'EVENT' | 'DIGITAL' | 'TRAINING';
export type CancellationPolicy = 'flexible' | '24h_notice' | '48h_notice' | 'strict';

export interface ServiceProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  type: ProductType; // Product type discriminator

  // Appointment-specific fields (only for SERVICE type)
  duration_minutes: number;
  preparation_time?: number;
  requires_specific_professional: boolean;
  cancellation_policy: CancellationPolicy;
  available_for_online_booking: boolean;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Professional/Staff Types (for appointments)
// ============================================================================

export interface ProfessionalProfile extends Employee {
  accepts_appointments: boolean;
  services_provided: string[]; // Array of product IDs
  booking_buffer_minutes: number;
  allow_online_booking: boolean;
  max_appointments_per_day: number;
}

// ============================================================================
// Appointment Booking Types
// ============================================================================

export interface AppointmentBookingData {
  service_id: string;
  staff_id?: string; // Optional if service doesn't require specific professional
  scheduled_time: string; // ISO datetime string
  customer_id: string;
  notes?: string;
  location_id?: string;
}

export interface AppointmentBookingPayload {
  // Sale fields
  customer_id: string;
  order_type: 'APPOINTMENT';
  order_status: 'CONFIRMED' | 'PENDING';
  payment_status: 'PENDING';

  // Appointment-specific fields
  scheduled_time: string;
  assigned_staff_id?: string;
  service_id: string;
  notes?: string;
  location_id?: string;

  // Pricing (from service)
  subtotal: number;
  tax: number;
  total: number;
}

// ============================================================================
// Appointment (Sale with type APPOINTMENT)
// ============================================================================

export interface Appointment extends Omit<Sale, 'order_type'> {
  order_type: typeof OrderType.APPOINTMENT;
  scheduled_time: string;
  assigned_staff_id?: string;
  service_id: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  reminder_sent_24h?: string;
  reminder_sent_2h?: string;

  // Expanded relations
  staff?: Employee;
  service?: ServiceProduct;
}

// ============================================================================
// Availability Query Types
// ============================================================================

export interface AvailabilityQuery {
  service_id: string;
  date: string; // YYYY-MM-DD
  staff_id?: string;
  location_id?: string;
}

export interface AvailableSlotInfo {
  slot_id: string;
  staff_id: string;
  staff_name: string;
  staff_avatar_url?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

// ============================================================================
// Appointment History/List Types
// ============================================================================

export interface AppointmentListItem {
  id: string;
  appointment_number: string; // Human-readable ID
  service_name: string;
  service_image_url?: string;
  professional_name?: string;
  scheduled_time: string;
  duration_minutes: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED';
  total: number;
  created_at: string;
}

export interface AppointmentDetails extends Omit<Appointment, 'customer'> {
  service: ServiceProduct;
  staff?: ProfessionalProfile;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

// ============================================================================
// Appointment Actions Types
// ============================================================================

export interface CancelAppointmentPayload {
  appointment_id: string;
  reason: string;
  refund_amount?: number;
}

export interface RescheduleAppointmentPayload {
  appointment_id: string;
  new_scheduled_time: string;
  new_staff_id?: string;
  reason?: string;
}

// ============================================================================
// Appointment Statistics Types
// ============================================================================

export interface AppointmentStats {
  total_appointments: number;
  upcoming_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_count: number;
  cancellation_rate: number;
  average_booking_value: number;
}

// ============================================================================
// Booking Step Types (for multi-step booking flow)
// ============================================================================

export type BookingStep = 'service' | 'professional' | 'time' | 'confirm';

export interface BookingState {
  currentStep: BookingStep;
  selectedService?: ServiceProduct;
  selectedProfessional?: ProfessionalProfile;
  selectedSlot?: AvailableSlotInfo;
  selectedDate?: string;
  notes?: string;
}

// ============================================================================
// Reminder Types
// ============================================================================

export interface AppointmentReminder {
  appointment_id: string;
  customer_id: string;
  reminder_type: '24h' | '2h' | '1h';
  scheduled_for: string;
  sent_at?: string;
  delivery_method: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'failed';
}

// ============================================================================
// Validation & Error Types
// ============================================================================

export interface BookingValidationError {
  field: string;
  message: string;
  code: string;
}

export interface BookingError {
  type: 'SLOT_UNAVAILABLE' | 'STAFF_UNAVAILABLE' | 'SERVICE_UNAVAILABLE' | 'VALIDATION_ERROR' | 'PAYMENT_ERROR';
  message: string;
  details?: BookingValidationError[];
}

// ============================================================================
// Availability Rules Types (Week 3)
// ============================================================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 6=Saturday

export interface AvailabilityRule {
  id: string;
  location_id?: string;

  // Business hours
  day_of_week: DayOfWeek;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  is_active: boolean;

  // Booking rules
  min_advance_hours: number;
  max_advance_days: number;
  buffer_minutes: number;
  slot_duration_minutes: number;

  // Cancellation policy
  cancellation_policy: CancellationPolicy;
  cancellation_fee_percentage: number;

  created_at: string;
  updated_at: string;
}

export interface AvailabilityRuleInput {
  location_id?: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  min_advance_hours?: number;
  max_advance_days?: number;
  buffer_minutes?: number;
  slot_duration_minutes?: number;
  cancellation_policy?: CancellationPolicy;
  cancellation_fee_percentage?: number;
}

// ============================================================================
// Professional Availability Types
// ============================================================================

export interface ProfessionalAvailability {
  id: string;
  staff_id: string;
  location_id?: string;

  // Schedule
  day_of_week: DayOfWeek;
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  is_active: boolean;

  // Break times
  break_start_time?: string;
  break_end_time?: string;

  // Override global rules
  override_buffer_minutes?: number;
  override_slot_duration?: number;

  created_at: string;
  updated_at: string;
}

export interface ProfessionalAvailabilityInput {
  staff_id: string;
  location_id?: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  break_start_time?: string;
  break_end_time?: string;
  override_buffer_minutes?: number;
  override_slot_duration?: number;
}

export interface ProfessionalAvailabilityWithStaff extends ProfessionalAvailability {
  staff_name: string;
  staff_email?: string;
  staff_avatar_url?: string;
}

// ============================================================================
// Availability Exceptions Types
// ============================================================================

export interface AvailabilityException {
  id: string;
  staff_id?: string; // NULL = applies to all staff
  location_id?: string;

  // Exception details
  exception_date: string; // YYYY-MM-DD
  is_closed: boolean;
  custom_start_time?: string;
  custom_end_time?: string;

  reason?: string;

  created_at: string;
  updated_at: string;
}

export interface AvailabilityExceptionInput {
  staff_id?: string;
  location_id?: string;
  exception_date: string;
  is_closed?: boolean;
  custom_start_time?: string;
  custom_end_time?: string;
  reason?: string;
}

export interface AvailabilityExceptionWithStaff extends AvailabilityException {
  staff_name?: string;
}

// ============================================================================
// Availability Configuration UI Types
// ============================================================================

export interface WeekdaySchedule {
  day: DayOfWeek;
  day_name: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
}

export interface BookingRulesConfig {
  min_advance_hours: number;
  max_advance_days: number;
  buffer_minutes: number;
  slot_duration_minutes: number;
  cancellation_policy: CancellationPolicy;
  cancellation_fee_percentage: number;
}

export interface ProfessionalScheduleDay {
  day_of_week: DayOfWeek;
  enabled: boolean;
  start_time: string;
  end_time: string;
  has_break: boolean;
  break_start_time?: string;
  break_end_time?: string;
  override_buffer?: number;
  override_slot_duration?: number;
}

// ============================================================================
// Availability Query & Response Types
// ============================================================================

export interface AvailabilityRulesQuery {
  location_id?: string;
  day_of_week?: DayOfWeek;
  is_active?: boolean;
}

export interface ProfessionalAvailabilityQuery {
  staff_id?: string;
  location_id?: string;
  day_of_week?: DayOfWeek;
  is_active?: boolean;
}

export interface AvailabilityExceptionsQuery {
  staff_id?: string;
  location_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface AvailabilityConfigSummary {
  total_business_days: number;
  total_professionals: number;
  total_exceptions: number;
  average_hours_per_day: number;
  most_available_day: string;
  least_available_day: string;
}
