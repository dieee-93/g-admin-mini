/**
 * Booking API Service
 * Handles appointment booking, availability checking, and slot management
 */

import { supabase } from '@/lib/supabase/client';
import type {
  AppointmentSlot,
  AppointmentSlotWithStaff,
  AppointmentBookingData,
  AvailabilityQuery,
  AvailableSlotInfo,
  ServiceProduct,
  Appointment,
  CancelAppointmentPayload,
  RescheduleAppointmentPayload,
} from '@/types/appointment';

class BookingAPI {
  /**
   * Get available services for booking
   */
  async getAvailableServices(): Promise<ServiceProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'SERVICE')
      .eq('available_for_online_booking', true)
      .eq('is_active', true)
      .not('duration_minutes', 'is', null)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get service details by ID
   */
  async getServiceById(serviceId: string): Promise<ServiceProduct | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get professionals who can perform a specific service
   */
  async getProfessionalsForService(serviceId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('accepts_appointments', true)
      .eq('allow_online_booking', true)
      .eq('employment_status', 'active')
      .contains('services_provided', [serviceId]);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all professionals who accept appointments
   */
  async getAllProfessionals() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('accepts_appointments', true)
      .eq('allow_online_booking', true)
      .eq('employment_status', 'active')
      .order('first_name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Check if a specific time slot is available
   */
  async checkSlotAvailability(
    staffId: string,
    scheduledTime: string
  ): Promise<AppointmentSlot | null> {
    const date = scheduledTime.split('T')[0];
    const time = scheduledTime.split('T')[1].substring(0, 5);

    const { data, error } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date)
      .eq('start_time', time)
      .eq('status', 'available')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Get available slots for a service on a specific date
   * UPDATED: Now respects availability rules, professional schedules, and exceptions
   */
  async getAvailableSlots(
    query: AvailabilityQuery
  ): Promise<AvailableSlotInfo[]> {
    const { service_id, date, staff_id, location_id } = query;

    // Get service to know duration
    const service = await this.getServiceById(service_id);
    if (!service) throw new Error('Service not found');

    // Get day of week (0=Sunday, 6=Saturday)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // 1. Check if there are availability exceptions for this date
    const { data: exceptions } = await supabase
      .from('availability_exceptions')
      .select('*')
      .eq('exception_date', date)
      .or(`location_id.eq.${location_id || 'null'},location_id.is.null`);

    // If there's an exception that closes the business, return empty
    const globalException = exceptions?.find((ex) => !ex.staff_id && ex.is_closed);
    if (globalException) {
      return []; // Business is closed on this date
    }

    // 2. Get availability rules for this day of week
    const { data: rules } = await supabase
      .from('availability_rules')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .or(`location_id.eq.${location_id || 'null'},location_id.is.null`);

    if (!rules || rules.length === 0) {
      return []; // No business hours configured for this day
    }

    const rule = rules[0]; // Use first matching rule

    // 3. Get all professionals who can provide this service
    const { data: professionals } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .contains('services_provided', [service_id]);

    if (!professionals || professionals.length === 0) {
      return []; // No professionals available for this service
    }

    // Filter by specific staff if requested
    const eligibleProfessionals = staff_id
      ? professionals.filter((p) => p.id === staff_id)
      : professionals;

    // 4. Get professional-specific availability schedules
    const professionalIds = eligibleProfessionals.map((p) => p.id);
    const { data: professionalSchedules } = await supabase
      .from('professional_availability')
      .select('*')
      .in('staff_id', professionalIds)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    // 5. Generate available slots for each professional
    const allSlots: AvailableSlotInfo[] = [];

    for (const professional of eligibleProfessionals) {
      // Check if professional has specific exception for this date
      const professionalException = exceptions?.find(
        (ex) => ex.staff_id === professional.id && ex.is_closed
      );
      if (professionalException) continue; // Professional not available on this date

      // Get professional's schedule for this day
      const professionalSchedule = professionalSchedules?.find(
        (ps) => ps.staff_id === professional.id
      );

      // Use professional schedule if exists, otherwise use business hours
      const startTime = professionalSchedule?.start_time || rule.start_time;
      const endTime = professionalSchedule?.end_time || rule.end_time;

      // Get buffer and slot duration (professional override or global)
      const bufferMinutes = professionalSchedule?.override_buffer_minutes ?? rule.buffer_minutes;
      const slotDuration = professionalSchedule?.override_slot_duration ?? rule.slot_duration_minutes;

      // Parse times
      const [startHour, startMin] = startTime.substring(0, 5).split(':').map(Number);
      const [endHour, endMin] = endTime.substring(0, 5).split(':').map(Number);

      // Generate time slots
      let currentTime = startHour * 60 + startMin; // minutes from midnight
      const endTimeMinutes = endHour * 60 + endMin;

      while (currentTime + service.duration_minutes <= endTimeMinutes) {
        // Skip break times if professional has breaks
        if (professionalSchedule?.break_start_time && professionalSchedule?.break_end_time) {
          const [breakStartHour, breakStartMin] = professionalSchedule.break_start_time.substring(0, 5).split(':').map(Number);
          const [breakEndHour, breakEndMin] = professionalSchedule.break_end_time.substring(0, 5).split(':').map(Number);
          const breakStart = breakStartHour * 60 + breakStartMin;
          const breakEnd = breakEndHour * 60 + breakEndMin;

          // Skip if slot overlaps with break
          if (currentTime >= breakStart && currentTime < breakEnd) {
            currentTime = breakEnd; // Jump to end of break
            continue;
          }
        }

        const slotStartHour = Math.floor(currentTime / 60);
        const slotStartMin = currentTime % 60;
        const slotEndTime = currentTime + service.duration_minutes;
        const slotEndHour = Math.floor(slotEndTime / 60);
        const slotEndMin = slotEndTime % 60;

        // Format times
        const formattedStartTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
        const formattedEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

        // Check if slot is already booked
        const { data: existingAppointment } = await supabase
          .from('sales')
          .select('id')
          .eq('order_type', 'APPOINTMENT')
          .eq('assigned_staff_id', professional.id)
          .eq('scheduled_time', `${date}T${formattedStartTime}:00`)
          .neq('order_status', 'CANCELLED')
          .maybeSingle();

        if (!existingAppointment) {
          // Slot is available
          allSlots.push({
            slot_id: `${professional.id}-${date}-${formattedStartTime}`, // Generate synthetic ID
            staff_id: professional.id,
            staff_name: professional.name || `${professional.first_name} ${professional.last_name}`,
            staff_avatar_url: professional.avatar_url,
            date,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration_minutes: service.duration_minutes,
          });
        }

        // Move to next slot (add service duration + buffer)
        currentTime += service.duration_minutes + bufferMinutes;
      }
    }

    return allSlots;
  }

  /**
   * Create an appointment
   */
  async createAppointment(
    bookingData: AppointmentBookingData
  ): Promise<Appointment> {
    // 1. Validate slot availability
    const slot = await this.checkSlotAvailability(
      bookingData.staff_id!,
      bookingData.scheduled_time
    );

    if (!slot || slot.status !== 'available') {
      throw new Error('Selected time slot is no longer available');
    }

    // 2. Get service details for pricing
    const service = await this.getServiceById(bookingData.service_id);
    if (!service) throw new Error('Service not found');

    // 3. Calculate totals (simplified - should use fiscal service in production)
    const subtotal = service.price;
    const tax = subtotal * 0.21; // 21% IVA Argentina
    const total = subtotal + tax;

    // 4. Create sale with appointment type
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        customer_id: bookingData.customer_id,
        location_id: bookingData.location_id,
        order_type: 'APPOINTMENT',
        scheduled_time: bookingData.scheduled_time,
        assigned_staff_id: bookingData.staff_id,
        service_id: bookingData.service_id,
        order_status: 'CONFIRMED',
        payment_status: 'PENDING',
        notes: bookingData.notes,
        subtotal,
        tax,
        total,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // 5. Create sale item
    await supabase.from('sale_items').insert({
      sale_id: sale.id,
      product_id: service.id,
      quantity: 1,
      unit_price: service.price,
      line_total: service.price,
    });

    // 6. Book the slot
    await supabase
      .from('appointment_slots')
      .update({
        status: 'booked',
        appointment_id: sale.id,
      })
      .eq('id', slot.id);

    return sale as Appointment;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(payload: CancelAppointmentPayload): Promise<void> {
    const { appointment_id, reason } = payload;

    // Update sale
    await supabase
      .from('sales')
      .update({
        order_status: 'CANCELLED',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', appointment_id);

    // Release slot
    await supabase
      .from('appointment_slots')
      .update({
        status: 'available',
        appointment_id: null,
      })
      .eq('appointment_id', appointment_id);
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    payload: RescheduleAppointmentPayload
  ): Promise<Appointment> {
    const { appointment_id, new_scheduled_time, new_staff_id } = payload;

    // Get current appointment
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('sales')
      .select('*, service_id, assigned_staff_id')
      .eq('id', appointment_id)
      .single();

    if (fetchError) throw fetchError;

    const staffId = new_staff_id || currentAppointment.assigned_staff_id;

    // Check new slot availability
    const newSlot = await this.checkSlotAvailability(staffId, new_scheduled_time);
    if (!newSlot) {
      throw new Error('New time slot is not available');
    }

    // Release old slot
    await supabase
      .from('appointment_slots')
      .update({
        status: 'available',
        appointment_id: null,
      })
      .eq('appointment_id', appointment_id);

    // Update appointment
    const { data: updatedSale, error: updateError } = await supabase
      .from('sales')
      .update({
        scheduled_time: new_scheduled_time,
        assigned_staff_id: staffId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointment_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Book new slot
    await supabase
      .from('appointment_slots')
      .update({
        status: 'booked',
        appointment_id: appointment_id,
      })
      .eq('id', newSlot.id);

    return updatedSale as Appointment;
  }

  /**
   * Get customer's appointments
   */
  async getCustomerAppointments(customerId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        service:products!service_id(*),
        staff:employees!assigned_staff_id(*)
      `)
      .eq('customer_id', customerId)
      .eq('order_type', 'APPOINTMENT')
      .order('scheduled_time', { ascending: false });

    if (error) throw error;
    return (data || []) as Appointment[];
  }

  /**
   * Get appointment details
   */
  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        service:products!service_id(*),
        staff:employees!assigned_staff_id(*)
      `)
      .eq('id', appointmentId)
      .eq('order_type', 'APPOINTMENT')
      .maybeSingle();

    if (error) throw error;
    return data as Appointment | null;
  }
}

export const bookingApi = new BookingAPI();
