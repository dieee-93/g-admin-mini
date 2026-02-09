/**
 * STAFF SHIFT ADAPTER (v3.0)
 *
 * Convierte datos de StaffShift (v3.0 types) al formato UnifiedScheduleEvent.
 *
 * MIGRATED: Now uses v3.0 StaffShift type from schedulingTypes.ts
 *
 * @version 2.0.0 (v3.0 architecture)
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#staff-shifts
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, StaffShiftMetadata } from '../types/calendar';
import type { StaffShift } from '../types/schedulingTypes';

/**
 * Adapter para Staff Shifts (v3.0)
 *
 * Convierte datos de StaffShift (v3.0) a UnifiedScheduleEvent
 */
export class StaffShiftAdapter extends SchedulingAdapter<StaffShift> {
  /**
   * Convierte un StaffShift v3.0 a UnifiedScheduleEvent
   *
   * @param shift - Datos del shift desde useScheduling v3.0 hook
   * @returns Evento unificado
   */
  adapt(shift: StaffShift): UnifiedScheduleEvent {
    // v3.0: Use dateRange and timeSlot from unified types
    const start = new Date(shift.dateRange.start);
    const end = new Date(shift.dateRange.end);

    // Validar fechas
    this.validateDates(start, end);

    // Obtener colores
    const colors = this.getColors('staff_shift');

    // Construir metadata específica
    const metadata: StaffShiftMetadata = {
      type: 'staff_shift',
      position: shift.position,
      hourlyRate: undefined, // v3.0 doesn't have hourlyRate in StaffShift
      breakDuration: shift.breakDuration || 30, // Use v3.0 breakDuration or default
      notes: shift.notes,
      isMandatory: false,
      canBeCovered: true
    };

    // Construir evento unificado
    const event: UnifiedScheduleEvent = {
      id: shift.id,
      type: 'staff_shift',

      // Información básica
      title: this.generateTitle(shift.employeeName, 'Shift', shift.position),
      description: shift.notes,

      // Temporal
      start,
      end,
      allDay: false,

      // Relaciones (v3.0 uses employeeId instead of employee_id)
      employeeId: shift.employeeId,
      employeeName: shift.employeeName,
      departmentId: undefined, // TODO: Add department to StaffShift type
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

      // Audit (v3.0 uses timestamps)
      createdAt: new Date(shift.createdAt),
      updatedAt: new Date(shift.updatedAt),
      createdBy: shift.createdBy
    };

    return event;
  }

  /**
   * Convierte múltiples shifts filtrados por semana (v3.0)
   *
   * @param shifts - Array de StaffShift v3.0
   * @param weekStart - Inicio de semana (lunes)
   * @param weekEnd - Fin de semana (domingo)
   * @returns Array de eventos unificados
   */
  adaptWeekShifts(shifts: StaffShift[], weekStart: Date, weekEnd: Date): UnifiedScheduleEvent[] {
    // Filtrar shifts de la semana usando v3.0 dateRange
    const weekShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.dateRange.start);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    });

    return this.adaptMany(weekShifts);
  }

  /**
   * Convierte shifts de un día específico (v3.0)
   *
   * @param shifts - Array de StaffShift v3.0
   * @param date - Fecha (YYYY-MM-DD)
   * @returns Array de eventos unificados
   */
  adaptDayShifts(shifts: StaffShift[], date: string): UnifiedScheduleEvent[] {
    const dayShifts = shifts.filter(shift => {
      const shiftDate = shift.dateRange.start.split('T')[0]; // Extract YYYY-MM-DD from ISO string
      return shiftDate === date;
    });
    return this.adaptMany(dayShifts);
  }
}

// Singleton instance
export const staffShiftAdapter = new StaffShiftAdapter();
