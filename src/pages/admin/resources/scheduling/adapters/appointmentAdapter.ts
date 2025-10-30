/**
 * APPOINTMENT ADAPTER - TODO
 *
 * Convierte datos de appointments/citas al formato UnifiedScheduleEvent.
 *
 * @version 1.0.0 - PLACEHOLDER
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#appointments
 *
 * TODO: Implementar cuando el scheduling_appointments esté activo
 *
 * REQUIREMENTS:
 * - Crear tabla appointments en Supabase si no existe
 * - Integrar con customer module para datos del cliente
 * - Implementar reminder system
 * - Mapear service types desde capabilities
 *
 * EXAMPLE USAGE:
 * ```typescript
 * const appointments = await getAppointments(weekStart, weekEnd);
 * const events = appointmentAdapter.adaptMany(appointments);
 * ```
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, AppointmentMetadata } from '../types/calendar';

/**
 * Appointment type (placeholder)
 *
 * TODO: Definir schema completo en Supabase
 */
interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  estimatedCost?: number;
  reminderSent: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Adapter para Appointments
 *
 * TODO: Implementar completamente
 */
export class AppointmentAdapter extends SchedulingAdapter<Appointment> {
  adapt(appointment: Appointment): UnifiedScheduleEvent {
    // TODO: Implementar conversión completa

    const start = this.combineDateTime(appointment.date, appointment.startTime);
    const end = this.combineDateTime(appointment.date, appointment.endTime);
    this.validateDates(start, end);

    const colors = this.getColors('appointment');

    const metadata: AppointmentMetadata = {
      type: 'appointment',
      customerId: appointment.customerId,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail,
      serviceType: appointment.serviceType,
      reminderSent: appointment.reminderSent,
      notes: appointment.notes,
      estimatedCost: appointment.estimatedCost
    };

    return {
      id: appointment.id,
      type: 'appointment',
      title: `${appointment.customerName} - ${appointment.serviceType}`,
      description: appointment.notes,
      start,
      end,
      allDay: false,
      employeeId: undefined, // TODO: Asignar empleado que atiende
      employeeName: undefined,
      departmentId: undefined,
      departmentName: undefined,
      locationId: undefined,
      status: this.normalizeStatus(appointment.status),
      priority: 3, // Alta prioridad (cliente esperando)
      metadata,
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'CalendarIcon',
      createdAt: new Date(appointment.createdAt),
      updatedAt: new Date(appointment.updatedAt),
      createdBy: undefined
    };
  }
}

// Singleton instance (disabled until implemented)
// export const appointmentAdapter = new AppointmentAdapter();

// TEMPORARY: Export disabled message
export const appointmentAdapter = {
  adapt: () => {
    throw new Error('AppointmentAdapter not yet implemented. See appointmentAdapter.ts TODO comments.');
  },
  adaptMany: () => {
    throw new Error('AppointmentAdapter not yet implemented. See appointmentAdapter.ts TODO comments.');
  }
};
