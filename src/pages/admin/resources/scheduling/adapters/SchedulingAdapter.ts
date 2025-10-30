/**
 * SCHEDULING ADAPTER - Base Class
 *
 * Clase base para adapters que convierten datos específicos
 * al formato UnifiedScheduleEvent.
 *
 * Patrón Adapter para normalizar diferentes fuentes de datos.
 *
 * @version 1.0.0
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md
 */

import type {
  UnifiedScheduleEvent,
  EventType,
  EventStatus,
  EventColorConfig,
  EVENT_COLORS
} from '../types/calendar';

/**
 * Clase base abstracta para adapters
 *
 * Cada tipo de evento (staff, production, etc.) debe extender esta clase
 * e implementar el método adapt().
 */
export abstract class SchedulingAdapter<TSource = any> {
  /**
   * Convierte datos de origen al formato UnifiedScheduleEvent
   *
   * @param source - Datos de origen en formato específico
   * @returns Evento en formato unificado
   */
  abstract adapt(source: TSource): UnifiedScheduleEvent;

  /**
   * Convierte múltiples eventos
   *
   * @param sources - Array de datos de origen
   * @returns Array de eventos unificados
   */
  adaptMany(sources: TSource[]): UnifiedScheduleEvent[] {
    return sources.map(source => this.adapt(source));
  }

  /**
   * Obtiene la configuración de colores para un tipo de evento
   *
   * @param type - Tipo de evento
   * @returns Configuración de colores
   */
  protected getColors(type: EventType): EventColorConfig {
    return EVENT_COLORS[type];
  }

  /**
   * Genera un título legible para el evento
   *
   * @param employeeName - Nombre del empleado
   * @param eventType - Tipo de evento
   * @param additionalInfo - Información adicional (ej: posición, receta)
   * @returns Título formateado
   */
  protected generateTitle(
    employeeName: string | undefined,
    eventType: string,
    additionalInfo?: string
  ): string {
    if (!employeeName) {
      return additionalInfo || eventType;
    }

    if (additionalInfo) {
      return `${employeeName} - ${additionalInfo}`;
    }

    return employeeName;
  }

  /**
   * Calcula duración en horas de un evento
   *
   * @param start - Fecha de inicio
   * @param end - Fecha de fin
   * @returns Duración en horas
   */
  protected calculateDurationHours(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  /**
   * Valida que las fechas sean válidas
   *
   * @param start - Fecha de inicio
   * @param end - Fecha de fin
   * @throws Error si las fechas son inválidas
   */
  protected validateDates(start: Date, end: Date): void {
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }

    if (!(end instanceof Date) || isNaN(end.getTime())) {
      throw new Error('Invalid end date');
    }

    if (end < start) {
      throw new Error('End date cannot be before start date');
    }
  }

  /**
   * Normaliza un status a los valores permitidos
   *
   * @param status - Status de origen
   * @returns Status normalizado
   */
  protected normalizeStatus(status: string): EventStatus {
    const normalized = status.toLowerCase().replace(/[_-]/g, '_');

    const validStatuses: EventStatus[] = [
      'scheduled',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show'
    ];

    if (validStatuses.includes(normalized as EventStatus)) {
      return normalized as EventStatus;
    }

    // Default to scheduled if unknown
    return 'scheduled';
  }

  /**
   * Convierte tiempo HH:MM a Date combinado con una fecha base
   *
   * @param date - Fecha base
   * @param time - Tiempo en formato HH:MM
   * @returns Date con fecha y hora combinadas
   */
  protected combineDateTime(date: string | Date, time: string): Date {
    const baseDate = typeof date === 'string' ? new Date(date) : date;
    const [hours, minutes] = time.split(':').map(Number);

    const combined = new Date(baseDate);
    combined.setHours(hours, minutes, 0, 0);

    return combined;
  }
}

/**
 * Utility functions para trabajar con eventos
 */
export class SchedulingUtils {
  /**
   * Filtra eventos por tipo
   *
   * @param events - Array de eventos
   * @param types - Tipos a incluir
   * @returns Eventos filtrados
   */
  static filterByType(
    events: UnifiedScheduleEvent[],
    types: EventType[]
  ): UnifiedScheduleEvent[] {
    if (types.length === 0) return events;
    return events.filter(event => types.includes(event.type));
  }

  /**
   * Filtra eventos por rango de fechas
   *
   * @param events - Array de eventos
   * @param start - Fecha de inicio del rango
   * @param end - Fecha de fin del rango
   * @returns Eventos dentro del rango
   */
  static filterByDateRange(
    events: UnifiedScheduleEvent[],
    start: Date,
    end: Date
  ): UnifiedScheduleEvent[] {
    return events.filter(event => {
      return event.start >= start && event.end <= end;
    });
  }

  /**
   * Filtra eventos por empleado
   *
   * @param events - Array de eventos
   * @param employeeIds - IDs de empleados a incluir
   * @returns Eventos filtrados
   */
  static filterByEmployee(
    events: UnifiedScheduleEvent[],
    employeeIds: string[]
  ): UnifiedScheduleEvent[] {
    if (employeeIds.length === 0) return events;
    return events.filter(event => event.employeeId && employeeIds.includes(event.employeeId));
  }

  /**
   * Agrupa eventos por fecha
   *
   * @param events - Array de eventos
   * @returns Mapa de fecha (YYYY-MM-DD) → eventos
   */
  static groupByDate(events: UnifiedScheduleEvent[]): Map<string, UnifiedScheduleEvent[]> {
    const grouped = new Map<string, UnifiedScheduleEvent[]>();

    events.forEach(event => {
      const dateKey = event.start.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }

  /**
   * Detecta overlaps entre eventos
   *
   * @param events - Array de eventos a verificar
   * @returns Array de grupos de eventos que se superponen
   */
  static detectOverlaps(events: UnifiedScheduleEvent[]): UnifiedScheduleEvent[][] {
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const overlaps: UnifiedScheduleEvent[][] = [];

    for (let i = 0; i < sorted.length; i++) {
      const group: UnifiedScheduleEvent[] = [sorted[i]];

      for (let j = i + 1; j < sorted.length; j++) {
        const current = sorted[i];
        const next = sorted[j];

        // Check if events overlap
        if (next.start < current.end) {
          group.push(next);
        } else {
          break; // No more overlaps for this event
        }
      }

      if (group.length > 1) {
        overlaps.push(group);
      }
    }

    return overlaps;
  }

  /**
   * Ordena eventos por fecha de inicio
   *
   * @param events - Array de eventos
   * @param ascending - Si true, orden ascendente (más antiguo primero)
   * @returns Eventos ordenados
   */
  static sortByStartTime(events: UnifiedScheduleEvent[], ascending = true): UnifiedScheduleEvent[] {
    return [...events].sort((a, b) => {
      const diff = a.start.getTime() - b.start.getTime();
      return ascending ? diff : -diff;
    });
  }

  /**
   * Calcula estadísticas de eventos
   *
   * @param events - Array de eventos
   * @returns Objeto con conteos por tipo y estado
   */
  static calculateStats(events: UnifiedScheduleEvent[]) {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    events.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
      byStatus[event.status] = (byStatus[event.status] || 0) + 1;
    });

    return {
      total: events.length,
      byType,
      byStatus
    };
  }
}
