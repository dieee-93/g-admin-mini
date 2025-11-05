/**
 * APPOINTMENT ADAPTER
 *
 * Convierte datos de appointments/citas al formato UnifiedScheduleEvent.
 *
 * @version 2.0.0 - Phase 4 Implementation
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#appointments
 *
 * IMPLEMENTED:
 * ✅ Tabla appointments en Supabase
 * ✅ Integración con customer module
 * ✅ Reminder system configurado
 * ✅ Provider assignment
 *
 * EXAMPLE USAGE:
 * ```typescript
 * const appointments = await getAppointments(weekStart, weekEnd);
 * const events = appointmentAdapter.adaptMany(appointments);
 * ```
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, AppointmentMetadata } from '../types/calendar';
import type { Appointment } from '../types/appointments';

/**
 * Adapter para Appointments - Phase 4
 *
 * Convierte Appointment a UnifiedScheduleEvent para el calendario.
 */
export class AppointmentAdapter extends SchedulingAdapter<Appointment> {
  adapt(appointment: Appointment): UnifiedScheduleEvent {
    // Combinar date + time para crear Date objects
    const start = this.combineDateTime(appointment.appointment_date, appointment.start_time);
    const end = this.combineDateTime(appointment.appointment_date, appointment.end_time);
    this.validateDates(start, end);

    // Obtener colores para appointments (verde)
    const colors = this.getColors('appointment');

    // Construir metadata específica de appointment
    const metadata: AppointmentMetadata = {
      type: 'appointment',
      customerId: appointment.customer_id,
      customerName: appointment.customer_name,
      customerPhone: appointment.customer_phone,
      customerEmail: appointment.customer_email,
      serviceType: appointment.service_name,
      reminderSent: !!appointment.reminder_sent_at,
      notes: appointment.notes,
      estimatedCost: undefined // TODO: Get from service table if needed
    };

    return {
      id: appointment.id,
      type: 'appointment',
      title: `${appointment.customer_name} - ${appointment.service_name}`,
      description: appointment.notes,
      start,
      end,
      allDay: false,

      // Provider information (empleado que atiende)
      employeeId: appointment.provider_id,
      employeeName: appointment.provider_name,
      departmentId: undefined, // TODO: Get from provider if needed
      departmentName: undefined,
      locationId: undefined, // TODO: Multi-location support

      // Status
      status: this.normalizeStatus(appointment.status),
      priority: this.calculatePriority(appointment),

      // Metadata
      metadata,

      // UI colors
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'CalendarIcon',

      // Audit fields
      createdAt: new Date(appointment.created_at),
      updatedAt: new Date(appointment.updated_at),
      createdBy: appointment.created_by
    };
  }

  /**
   * Calcula prioridad del appointment
   * - Walk-ins: alta prioridad (3)
   * - Online bookings: media prioridad (2)
   * - Staff bookings: media-alta prioridad (2-3 según status)
   */
  private calculatePriority(appointment: Appointment): 1 | 2 | 3 {
    if (appointment.booking_source === 'walk_in') return 3;
    if (appointment.status === 'confirmed') return 3;
    if (appointment.status === 'in_progress') return 3;
    return 2;
  }
}

// Singleton instance
export const appointmentAdapter = new AppointmentAdapter();
