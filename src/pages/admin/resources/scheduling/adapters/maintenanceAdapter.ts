/**
 * MAINTENANCE ADAPTER
 *
 * Convierte datos de maintenance schedules (mantenimiento de equipos) al formato UnifiedScheduleEvent.
 *
 * @version 1.0.0
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#maintenance
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, MaintenanceMetadata } from '../types/calendar';

/**
 * MaintenanceSchedule type
 *
 * Representa un mantenimiento programado de equipo o área.
 * Compatible con tabla maintenance_schedules en Supabase.
 */
export interface MaintenanceSchedule {
  id: string;
  equipmentId?: string;
  equipmentName: string;
  maintenanceType: 'preventive' | 'corrective' | 'inspection';
  technicianId?: string;
  technicianName?: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedCost?: number;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Adapter para Maintenance Schedules
 *
 * Convierte datos de mantenimiento programado a UnifiedScheduleEvent
 */
export class MaintenanceAdapter extends SchedulingAdapter<MaintenanceSchedule> {
  /**
   * Convierte un MaintenanceSchedule a UnifiedScheduleEvent
   *
   * @param maintenance - Datos del maintenance schedule
   * @returns Evento unificado
   */
  adapt(maintenance: MaintenanceSchedule): UnifiedScheduleEvent {
    // Combinar fecha + hora de inicio/fin
    const start = this.combineDateTime(
      maintenance.scheduledDate,
      maintenance.scheduledStartTime
    );
    const end = this.combineDateTime(
      maintenance.scheduledDate,
      maintenance.scheduledEndTime
    );

    // Validar fechas
    this.validateDates(start, end);

    // Obtener colores
    const colors = this.getColors('maintenance');

    // Construir metadata específica
    const metadata: MaintenanceMetadata = {
      type: 'maintenance',
      equipmentName: maintenance.equipmentName,
      equipmentId: maintenance.equipmentId,
      maintenanceType: maintenance.maintenanceType,
      technicianId: maintenance.technicianId,
      technicianName: maintenance.technicianName,
      estimatedCost: maintenance.estimatedCost,
      notes: maintenance.notes
    };

    // Generar título descriptivo
    const title = this.generateMaintenanceTitle(maintenance);

    // Construir evento unificado
    const event: UnifiedScheduleEvent = {
      id: maintenance.id,
      type: 'maintenance',

      // Información básica
      title,
      description: maintenance.notes,

      // Temporal
      start,
      end,
      allDay: false,

      // Relaciones
      employeeId: maintenance.technicianId,
      employeeName: maintenance.technicianName,
      departmentId: 'maintenance',
      departmentName: 'Mantenimiento',
      locationId: undefined,

      // Estado
      status: this.normalizeStatus(maintenance.status),
      priority: this.calculateMaintenancePriority(maintenance),

      // Metadata
      metadata,

      // UI
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: this.getMaintenanceIcon(maintenance.maintenanceType),

      // Audit
      createdAt: new Date(maintenance.createdAt),
      updatedAt: new Date(maintenance.updatedAt),
      createdBy: undefined
    };

    return event;
  }

  /**
   * Genera título legible según tipo de mantenimiento
   *
   * @param maintenance - Maintenance schedule
   * @returns Título formateado
   */
  private generateMaintenanceTitle(maintenance: MaintenanceSchedule): string {
    const typeLabels = {
      preventive: 'Mantenimiento Preventivo',
      corrective: 'Reparación',
      inspection: 'Inspección'
    };

    const typeLabel = typeLabels[maintenance.maintenanceType];
    const tech = maintenance.technicianName || 'Sin asignar';

    return `${typeLabel} - ${maintenance.equipmentName} (${tech})`;
  }

  /**
   * Calcula prioridad según tipo de mantenimiento
   *
   * @param maintenance - Maintenance schedule
   * @returns Prioridad (1=baja, 2=media, 3=alta)
   */
  private calculateMaintenancePriority(maintenance: MaintenanceSchedule): 1 | 2 | 3 {
    // Alta prioridad para mantenimiento correctivo (equipo roto)
    if (maintenance.maintenanceType === 'corrective') {
      return 3;
    }

    // Media prioridad para inspecciones
    if (maintenance.maintenanceType === 'inspection') {
      return 2;
    }

    // Baja prioridad para mantenimiento preventivo (planificado)
    return 1;
  }

  /**
   * Obtiene icono según tipo de mantenimiento
   *
   * @param maintenanceType - Tipo de mantenimiento
   * @returns Nombre del icono (Heroicons)
   */
  private getMaintenanceIcon(maintenanceType: MaintenanceSchedule['maintenanceType']): string {
    const icons = {
      preventive: 'WrenchScrewdriverIcon',
      corrective: 'ExclamationCircleIcon',
      inspection: 'MagnifyingGlassIcon'
    };

    return icons[maintenanceType] || 'WrenchIcon';
  }

  /**
   * Convierte schedules filtradas por equipo
   *
   * @param schedules - Array de maintenance schedules
   * @param equipmentId - ID del equipo
   * @returns Array de eventos unificados
   */
  adaptByEquipment(
    schedules: MaintenanceSchedule[],
    equipmentId: string
  ): UnifiedScheduleEvent[] {
    const filtered = schedules.filter(s => s.equipmentId === equipmentId);
    return this.adaptMany(filtered);
  }

  /**
   * Convierte schedules filtradas por tipo
   *
   * @param schedules - Array de maintenance schedules
   * @param maintenanceType - Tipo de mantenimiento
   * @returns Array de eventos unificados
   */
  adaptByType(
    schedules: MaintenanceSchedule[],
    maintenanceType: MaintenanceSchedule['maintenanceType']
  ): UnifiedScheduleEvent[] {
    const filtered = schedules.filter(s => s.maintenanceType === maintenanceType);
    return this.adaptMany(filtered);
  }

  /**
   * Convierte schedules urgentes (mantenimiento correctivo)
   *
   * @param schedules - Array de maintenance schedules
   * @returns Array de eventos unificados
   */
  adaptUrgent(schedules: MaintenanceSchedule[]): UnifiedScheduleEvent[] {
    const urgent = schedules.filter(s => s.maintenanceType === 'corrective');
    return this.adaptMany(urgent);
  }
}

// Singleton instance
export const maintenanceAdapter = new MaintenanceAdapter();
