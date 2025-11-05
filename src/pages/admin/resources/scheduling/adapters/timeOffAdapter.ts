/**
 * TIME-OFF ADAPTER
 *
 * Convierte datos de time-off requests (permisos/ausencias) al formato UnifiedScheduleEvent.
 *
 * @version 1.0.0
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#time-off
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, TimeOffMetadata } from '../types/calendar';

/**
 * TimeOffRequest type
 *
 * Representa una solicitud de permiso o ausencia.
 * Compatible con tabla time_off_requests en Supabase.
 */
export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  requestType: 'vacation' | 'sick' | 'personal' | 'emergency';
  reason?: string;
  startDate: string;
  endDate: string;
  startTime?: string; // Opcional (si no es todo el día)
  endTime?: string;   // Opcional (si no es todo el día)
  allDay: boolean;
  approved: boolean;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerComments?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Adapter para Time-Off Requests
 *
 * Convierte solicitudes de permisos/ausencias a UnifiedScheduleEvent
 */
export class TimeOffAdapter extends SchedulingAdapter<TimeOffRequest> {
  /**
   * Convierte un TimeOffRequest a UnifiedScheduleEvent
   *
   * @param request - Datos del time-off request
   * @returns Evento unificado
   */
  adapt(request: TimeOffRequest): UnifiedScheduleEvent {
    // Determinar fechas de inicio/fin
    let start: Date;
    let end: Date;

    if (request.allDay) {
      // Todo el día - usar medianoche
      start = new Date(request.startDate);
      start.setHours(0, 0, 0, 0);

      end = new Date(request.endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Horas específicas
      start = this.combineDateTime(
        request.startDate,
        request.startTime || '00:00'
      );
      end = this.combineDateTime(
        request.endDate,
        request.endTime || '23:59'
      );
    }

    // Validar fechas
    this.validateDates(start, end);

    // Obtener colores
    const colors = this.getColors('time_off');

    // Construir metadata específica
    const metadata: TimeOffMetadata = {
      type: 'time_off',
      requestType: request.requestType,
      reason: request.reason,
      approved: request.approved,
      requestedAt: new Date(request.requestedAt),
      reviewedBy: request.reviewedBy,
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined,
      reviewerComments: request.reviewerComments
    };

    // Generar título descriptivo
    const title = this.generateTimeOffTitle(request);

    // Construir evento unificado
    const event: UnifiedScheduleEvent = {
      id: request.id,
      type: 'time_off',

      // Información básica
      title,
      description: request.reason,

      // Temporal
      start,
      end,
      allDay: request.allDay,

      // Relaciones
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      departmentId: undefined,
      departmentName: undefined,
      locationId: undefined,

      // Estado
      status: this.normalizeTimeOffStatus(request),
      priority: this.calculateTimeOffPriority(request),

      // Metadata
      metadata,

      // UI
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: this.getTimeOffIcon(request.requestType),

      // Audit
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt),
      createdBy: request.employeeId
    };

    return event;
  }

  /**
   * Genera título legible según tipo de permiso
   *
   * @param request - Time-off request
   * @returns Título formateado
   */
  private generateTimeOffTitle(request: TimeOffRequest): string {
    const typeLabels = {
      vacation: 'Vacaciones',
      sick: 'Enfermedad',
      personal: 'Permiso Personal',
      emergency: 'Emergencia'
    };

    const typeLabel = typeLabels[request.requestType] || request.requestType;
    const status = request.approved ? '✓' : '?';

    return `${status} ${request.employeeName} - ${typeLabel}`;
  }

  /**
   * Normaliza status de time-off al EventStatus
   *
   * @param request - Time-off request
   * @returns EventStatus
   */
  private normalizeTimeOffStatus(request: TimeOffRequest): UnifiedScheduleEvent['status'] {
    if (!request.approved) {
      return 'scheduled'; // Pendiente de aprobación
    }

    // Si está aprobado, usar status base
    return this.normalizeStatus(request.status);
  }

  /**
   * Calcula prioridad según tipo de permiso
   *
   * @param request - Time-off request
   * @returns Prioridad (1=baja, 2=media, 3=alta)
   */
  private calculateTimeOffPriority(request: TimeOffRequest): 1 | 2 | 3 {
    // Alta prioridad para emergencias
    if (request.requestType === 'emergency') {
      return 3;
    }

    // Alta prioridad para sick leave
    if (request.requestType === 'sick') {
      return 3;
    }

    // Media prioridad para personal
    if (request.requestType === 'personal') {
      return 2;
    }

    // Baja prioridad para vacaciones (planificadas)
    return 1;
  }

  /**
   * Obtiene icono según tipo de permiso
   *
   * @param requestType - Tipo de permiso
   * @returns Nombre del icono (Heroicons)
   */
  private getTimeOffIcon(requestType: TimeOffRequest['requestType']): string {
    const icons = {
      vacation: 'CalendarDaysIcon',
      sick: 'HeartIcon',
      personal: 'UserIcon',
      emergency: 'ExclamationTriangleIcon'
    };

    return icons[requestType] || 'CalendarIcon';
  }

  /**
   * Convierte requests filtradas por tipo
   *
   * @param requests - Array de time-off requests
   * @param requestType - Tipo de permiso
   * @returns Array de eventos unificados
   */
  adaptByType(
    requests: TimeOffRequest[],
    requestType: TimeOffRequest['requestType']
  ): UnifiedScheduleEvent[] {
    const filtered = requests.filter(r => r.requestType === requestType);
    return this.adaptMany(filtered);
  }

  /**
   * Convierte requests pendientes de aprobación
   *
   * @param requests - Array de time-off requests
   * @returns Array de eventos unificados
   */
  adaptPendingApproval(requests: TimeOffRequest[]): UnifiedScheduleEvent[] {
    const pending = requests.filter(r => !r.approved && r.status !== 'cancelled');
    return this.adaptMany(pending);
  }
}

// Singleton instance
export const timeOffAdapter = new TimeOffAdapter();
