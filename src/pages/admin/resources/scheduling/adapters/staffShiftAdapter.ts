/**
 * STAFF SHIFT ADAPTER
 *
 * Convierte datos de shift_schedules (Supabase) al formato UnifiedScheduleEvent.
 *
 * @version 1.0.0
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#staff-shifts
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, StaffShiftMetadata } from '../types/calendar';
import type { Shift } from '@/store/schedulingStore';

/**
 * Adapter para Staff Shifts
 *
 * Convierte datos de la tabla shift_schedules a UnifiedScheduleEvent
 */
export class StaffShiftAdapter extends SchedulingAdapter<Shift> {
  /**
   * Convierte un Shift a UnifiedScheduleEvent
   *
   * @param shift - Datos del shift desde schedulingStore
   * @returns Evento unificado
   */
  adapt(shift: Shift): UnifiedScheduleEvent {
    // Combinar fecha + hora de inicio/fin
    const start = this.combineDateTime(shift.date, shift.start_time);
    const end = this.combineDateTime(shift.date, shift.end_time);

    // Validar fechas
    this.validateDates(start, end);

    // Obtener colores
    const colors = this.getColors('staff_shift');

    // Construir metadata específica
    const metadata: StaffShiftMetadata = {
      type: 'staff_shift',
      position: shift.position,
      hourlyRate: shift.hourly_rate,
      breakDuration: 30, // Default 30 min break
      notes: shift.notes,
      isMandatory: false,
      canBeCovered: true
    };

    // Construir evento unificado
    const event: UnifiedScheduleEvent = {
      id: shift.id,
      type: 'staff_shift',

      // Información básica
      title: this.generateTitle(shift.employee_name, 'Shift', shift.position),
      description: shift.notes,

      // Temporal
      start,
      end,
      allDay: false,

      // Relaciones
      employeeId: shift.employee_id,
      employeeName: shift.employee_name,
      departmentId: undefined, // TODO: Agregar departamento a Shift type
      departmentName: undefined,
      locationId: undefined,

      // Estado
      status: this.normalizeStatus(shift.status),
      priority: 2, // Media por defecto

      // Metadata
      metadata,

      // UI
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'UserIcon', // Heroicons

      // Audit
      createdAt: new Date(shift.created_at),
      updatedAt: new Date(shift.updated_at),
      createdBy: undefined
    };

    return event;
  }

  /**
   * Convierte múltiples shifts filtrados por semana
   *
   * @param shifts - Array de shifts
   * @param weekStart - Inicio de semana (lunes)
   * @param weekEnd - Fin de semana (domingo)
   * @returns Array de eventos unificados
   */
  adaptWeekShifts(shifts: Shift[], weekStart: Date, weekEnd: Date): UnifiedScheduleEvent[] {
    // Filtrar shifts de la semana
    const weekShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    });

    return this.adaptMany(weekShifts);
  }

  /**
   * Convierte shifts de un día específico
   *
   * @param shifts - Array de shifts
   * @param date - Fecha (YYYY-MM-DD)
   * @returns Array de eventos unificados
   */
  adaptDayShifts(shifts: Shift[], date: string): UnifiedScheduleEvent[] {
    const dayShifts = shifts.filter(shift => shift.date === date);
    return this.adaptMany(dayShifts);
  }
}

// Singleton instance
export const staffShiftAdapter = new StaffShiftAdapter();
