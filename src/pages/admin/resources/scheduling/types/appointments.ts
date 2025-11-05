/**
 * Phase 4: Service Modes - Appointment Types
 * Types for appointment-based service businesses
 */

// =====================================================
// APPOINTMENT TYPES
// =====================================================

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export type BookingSource = 'staff' | 'online' | 'walk_in' | 'phone';

export interface Appointment {
  id: string;

  // Customer Information
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;

  // Service Details
  service_id: string;
  service_name: string;
  service_duration_minutes: number;

  // Provider Assignment
  provider_id?: string;
  provider_name: string;

  // Scheduling
  appointment_date: string; // ISO date format (YYYY-MM-DD)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  timezone: string;

  // Status
  status: AppointmentStatus;
  booking_source: BookingSource;

  // Notes
  notes?: string;
  cancellation_reason?: string;

  // Reminders
  reminder_sent_at?: string; // ISO timestamp
  confirmation_sent_at?: string; // ISO timestamp

  // Package Redemption
  package_id?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
}

export interface CreateAppointmentInput {
  customer_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  service_id: string;
  service_name: string;
  service_duration_minutes: number;
  provider_id?: string;
  provider_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  booking_source: BookingSource;
  notes?: string;
  package_id?: string;
}

export interface UpdateAppointmentInput {
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  provider_id?: string;
  provider_name?: string;
  status?: AppointmentStatus;
  notes?: string;
  cancellation_reason?: string;
}

// =====================================================
// PROVIDER AVAILABILITY TYPES
// =====================================================

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_available: boolean;
  break_times: TimeSlot[];
  valid_from?: string; // ISO date
  valid_until?: string; // ISO date
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityInput {
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available?: boolean;
  break_times?: TimeSlot[];
  valid_from?: string;
  valid_until?: string;
}

export interface UpdateAvailabilityInput {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
  break_times?: TimeSlot[];
  valid_from?: string;
  valid_until?: string;
}

// Available time slots for booking
export interface AvailableSlot {
  start_time: string;
  end_time: string;
  provider_id: string;
  provider_name: string;
  duration_minutes: number;
}

// =====================================================
// SERVICE PACKAGE TYPES
// =====================================================

export interface ServicePackage {
  id: string;
  package_name: string;
  description?: string;
  service_ids: string[]; // Array of product IDs
  total_sessions: number;
  package_price: number;
  per_session_price: number; // Calculated discount per session
  validity_days?: number; // Days until expiration (null = never expires)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePackageInput {
  package_name: string;
  description?: string;
  service_ids: string[];
  total_sessions: number;
  package_price: number;
  validity_days?: number;
  is_active?: boolean;
}

export interface UpdatePackageInput {
  package_name?: string;
  description?: string;
  service_ids?: string[];
  total_sessions?: number;
  package_price?: number;
  validity_days?: number;
  is_active?: boolean;
}

// =====================================================
// CUSTOMER PACKAGE TYPES
// =====================================================

export type PackagePaymentStatus = 'pending' | 'paid' | 'refunded';
export type PackageStatus = 'active' | 'expired' | 'completed' | 'cancelled';

export interface CustomerPackage {
  id: string;
  customer_id: string;
  package_id: string;
  purchased_at: string;
  purchased_by?: string;
  sessions_remaining: number;
  sessions_used: number;
  expires_at?: string;
  payment_status: PackagePaymentStatus;
  amount_paid: number;
  status: PackageStatus;
  created_at: string;
  updated_at: string;

  // Joined data (not in DB)
  package?: ServicePackage;
  customer_name?: string;
}

export interface PurchasePackageInput {
  customer_id: string;
  package_id: string;
  amount_paid: number;
  payment_status?: PackagePaymentStatus;
  expires_at?: string;
}

export interface RedeemPackageInput {
  customer_package_id: string;
  appointment_id: string;
}

// =====================================================
// WALK-IN QUEUE TYPES
// =====================================================

export type WalkInStatus = 'waiting' | 'notified' | 'seated' | 'cancelled';

export interface WalkInEntry {
  id: string;
  customer_name: string;
  customer_phone?: string;
  party_size: number;
  requested_service?: string;
  requested_provider_id?: string;
  queue_position: number;
  status: WalkInStatus;
  check_in_time: string;
  estimated_wait_minutes?: number;
  notified_at?: string;
  seated_at?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  provider_name?: string;
}

export interface AddToQueueInput {
  customer_name: string;
  customer_phone?: string;
  party_size?: number;
  requested_service?: string;
  requested_provider_id?: string;
  estimated_wait_minutes?: number;
}

export interface UpdateQueueEntryInput {
  queue_position?: number;
  status?: WalkInStatus;
  estimated_wait_minutes?: number;
}

// =====================================================
// REMINDER SETTINGS TYPES
// =====================================================

export type SMSProvider = 'twilio' | 'messagebird' | 'vonage' | 'manual';
export type EmailProvider = 'sendgrid' | 'mailgun' | 'resend' | 'smtp';

export interface ReminderSettings {
  id: string;
  business_profile_id: string;

  // SMS Configuration
  sms_enabled: boolean;
  sms_provider?: SMSProvider;
  sms_api_key_encrypted?: string;
  sms_from_number?: string;

  // Email Configuration
  email_enabled: boolean;
  email_provider?: EmailProvider;
  email_api_key_encrypted?: string;
  email_from_address?: string;

  // Reminder Timing (configurable)
  reminder_hours_before: number;
  confirmation_hours_before: number;

  // Message Templates (supports {{variables}})
  sms_reminder_template?: string;
  email_reminder_template?: string;
  sms_confirmation_template?: string;
  email_confirmation_template?: string;

  created_at: string;
  updated_at: string;
}

export interface UpdateReminderSettingsInput {
  sms_enabled?: boolean;
  sms_provider?: SMSProvider;
  sms_api_key_encrypted?: string;
  sms_from_number?: string;
  email_enabled?: boolean;
  email_provider?: EmailProvider;
  email_api_key_encrypted?: string;
  email_from_address?: string;
  reminder_hours_before?: number;
  confirmation_hours_before?: number;
  sms_reminder_template?: string;
  email_reminder_template?: string;
  sms_confirmation_template?: string;
  email_confirmation_template?: string;
}

// =====================================================
// HELPER TYPES
// =====================================================

// Appointment with related data
export interface AppointmentWithDetails extends Appointment {
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
  provider?: {
    id: string;
    name: string;
    email?: string;
  };
  package?: {
    id: string;
    package_name: string;
    sessions_remaining: number;
  };
}

// Calendar event for display
export interface AppointmentCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    appointment: Appointment;
    status: AppointmentStatus;
    customerName: string;
    serviceName: string;
    providerName: string;
  };
}

// Filter options for appointments
export interface AppointmentFilters {
  status?: AppointmentStatus[];
  provider_id?: string;
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  booking_source?: BookingSource[];
}

// Statistics for appointments
export interface AppointmentStats {
  total_appointments: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  completion_rate: number;
  no_show_rate: number;
}

// Provider schedule for a specific day
export interface ProviderDaySchedule {
  provider_id: string;
  provider_name: string;
  date: string;
  availability: ProviderAvailability[];
  appointments: Appointment[];
  available_slots: AvailableSlot[];
}
