/**
 * APPOINTMENT VALIDATION SCHEMA
 *
 * Zod schemas for appointment form validation.
 *
 * @version 1.0.0 - Phase 4
 */

import { z } from 'zod';

/**
 * Schema for creating/editing appointments
 */
export const appointmentFormSchema = z
  .object({
    // Customer Information
    customer_id: z.string().optional(),
    customer_name: z
      .string()
      .min(2, 'El nombre del cliente debe tener al menos 2 caracteres')
      .max(100, 'El nombre del cliente es demasiado largo'),
    customer_phone: z
      .string()
      .regex(/^[+]?[\d\s()-]+$/, 'Formato de teléfono inválido')
      .optional()
      .or(z.literal('')),
    customer_email: z
      .string()
      .email('Email inválido')
      .optional()
      .or(z.literal('')),

    // Service Details
    service_id: z.string().min(1, 'Debe seleccionar un servicio'),
    service_name: z.string().min(1, 'El nombre del servicio es requerido'),
    service_duration_minutes: z
      .number()
      .min(15, 'La duración mínima es 15 minutos')
      .max(480, 'La duración máxima es 8 horas'),

    // Provider Assignment
    provider_id: z.string().optional(),
    provider_name: z.string().min(1, 'Debe asignar un proveedor'),

    // Scheduling
    appointment_date: z.string().min(1, 'La fecha es requerida'),
    start_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'),
    end_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'),

    // Booking Source
    booking_source: z.enum(['staff', 'online', 'walk_in', 'phone']).default('staff'),

    // Notes
    notes: z.string().max(500, 'Las notas son demasiado largas').optional(),

    // Package Redemption
    package_id: z.string().optional()
  })
  .refine(
    (data) => {
      // Validate that end_time is after start_time
      if (data.start_time && data.end_time) {
        const [startHour, startMin] = data.start_time.split(':').map(Number);
        const [endHour, endMin] = data.end_time.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return endMinutes > startMinutes;
      }
      return true;
    },
    {
      message: 'La hora de fin debe ser posterior a la hora de inicio',
      path: ['end_time']
    }
  )
  .refine(
    (data) => {
      // Validate that appointment_date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const appointmentDate = new Date(data.appointment_date);
      return appointmentDate >= today;
    },
    {
      message: 'No se pueden crear citas en fechas pasadas',
      path: ['appointment_date']
    }
  );

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

/**
 * Default values for the form
 */
export const appointmentFormDefaults: Partial<AppointmentFormData> = {
  booking_source: 'staff',
  service_duration_minutes: 60,
  customer_name: '',
  provider_name: '',
  notes: ''
};

/**
 * Helper to calculate end_time from start_time + duration
 */
export function calculateEndTime(
  startTime: string,
  durationMinutes: number
): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;

  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
}

/**
 * Helper to calculate duration from start_time and end_time
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes - startMinutes;
}
