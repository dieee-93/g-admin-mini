/**
 * PRODUCTION ADAPTER
 *
 * Convierte datos de production blocks al formato UnifiedScheduleEvent.
 *
 * @version 2.0.0 - PRODUCTION READY
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#production-blocks
 *
 * IMPLEMENTED:
 * ✅ Full adapter logic with priority calculation
 * ✅ Capacity calculation based on assigned staff
 * ✅ Recipe-based title generation
 * ✅ Station and batch tracking
 * ✅ Helper methods for filtering (by recipe, by station)
 *
 * EXAMPLE USAGE:
 * ```typescript
 * const productionBlocks = await getProductionSchedule(weekStart, weekEnd);
 * const events = productionAdapter.adaptMany(productionBlocks);
 * ```
 */

import { SchedulingAdapter } from './SchedulingAdapter';
import type { UnifiedScheduleEvent, ProductionMetadata } from '../types/calendar';

/**
 * Production Block type
 *
 * Representa un bloque de producción programado (batch).
 * Compatible con tabla production_schedules en Supabase.
 */
export interface ProductionBlock {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedStaff: Array<{ id: string; name: string; role?: string }>;
  station?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * Adapter para Production Blocks
 *
 * Convierte bloques de producción programados a UnifiedScheduleEvent
 */
export class ProductionAdapter extends SchedulingAdapter<ProductionBlock> {
  /**
   * Convierte un ProductionBlock a UnifiedScheduleEvent
   *
   * @param block - Datos del production block
   * @returns Evento unificado
   */
  adapt(block: ProductionBlock): UnifiedScheduleEvent {
    // Combinar fecha + hora de inicio/fin
    const start = this.combineDateTime(block.date, block.startTime);
    const end = this.combineDateTime(block.date, block.endTime);
    this.validateDates(start, end);

    // Obtener colores
    const colors = this.getColors('production');

    // Calcular capacidad utilizada (basado en número de staff asignado)
    const capacityUsed = this.calculateCapacityUsed(block);

    // Construir metadata específica
    const metadata: ProductionMetadata = {
      type: 'production',
      recipeId: block.recipeId,
      recipeName: block.recipeName,
      quantity: block.quantity,
      unit: block.unit,
      assignedStaffIds: block.assignedStaff.map(s => s.id),
      assignedStaffNames: block.assignedStaff.map(s => s.name),
      capacityUsed,
      station: block.station
    };

    // Generar título descriptivo
    const title = this.generateProductionTitle(block);

    // Construir evento unificado
    const event: UnifiedScheduleEvent = {
      id: block.id,
      type: 'production',

      // Información básica
      title,
      description: block.notes,

      // Temporal
      start,
      end,
      allDay: false,

      // Relaciones - Production no tiene un empleado único, es un equipo
      employeeId: undefined,
      employeeName: this.formatStaffNames(block.assignedStaff),
      departmentId: 'production',
      departmentName: 'Producción',
      locationId: undefined,

      // Estado
      status: this.normalizeStatus(block.status),
      priority: this.calculateProductionPriority(block),

      // Metadata
      metadata,

      // UI
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'BeakerIcon', // Heroicons

      // Audit
      createdAt: new Date(block.createdAt),
      updatedAt: new Date(block.updatedAt),
      createdBy: block.createdBy
    };

    return event;
  }

  /**
   * Genera título descriptivo para el bloque de producción
   *
   * @param block - Production block
   * @returns Título formateado
   */
  private generateProductionTitle(block: ProductionBlock): string {
    const batch = block.batchNumber ? `#${block.batchNumber}` : '';
    const station = block.station ? `[${block.station}]` : '';

    return `${block.recipeName} ${batch} - ${block.quantity} ${block.unit} ${station}`.trim();
  }

  /**
   * Formatea nombres del staff asignado
   *
   * @param staff - Array de staff asignado
   * @returns String con nombres separados por coma
   */
  private formatStaffNames(staff: ProductionBlock['assignedStaff']): string {
    if (staff.length === 0) return 'Sin asignar';
    if (staff.length === 1) return staff[0].name;
    if (staff.length === 2) return `${staff[0].name} y ${staff[1].name}`;

    return `${staff[0].name} +${staff.length - 1}`;
  }

  /**
   * Calcula capacidad utilizada basado en staff asignado
   * Asume que cada persona representa ~25% de capacidad
   *
   * @param block - Production block
   * @returns Porcentaje de capacidad (0-100)
   */
  private calculateCapacityUsed(block: ProductionBlock): number {
    const staffCount = block.assignedStaff.length;

    // Cada persona = 25% de capacidad (máximo 4 personas = 100%)
    const capacity = Math.min(staffCount * 25, 100);

    return capacity;
  }

  /**
   * Calcula prioridad basada en urgencia y cantidad
   *
   * @param block - Production block
   * @returns Prioridad (1=baja, 2=media, 3=alta)
   */
  private calculateProductionPriority(block: ProductionBlock): 1 | 2 | 3 {
    // Si tiene prioridad explícita en data
    if (block.priority) {
      const priorityMap = {
        low: 1,
        medium: 2,
        high: 3,
        urgent: 3
      };
      return priorityMap[block.priority] as 1 | 2 | 3;
    }

    // Alta prioridad para cantidades grandes (producción urgente)
    if (block.quantity > 100) {
      return 3;
    }

    // Media prioridad para cantidades medianas
    if (block.quantity > 50) {
      return 2;
    }

    // Baja prioridad para cantidades pequeñas
    return 1;
  }

  /**
   * Convierte production blocks filtrados por receta
   *
   * @param blocks - Array de production blocks
   * @param recipeId - ID de la receta
   * @returns Array de eventos unificados
   */
  adaptByRecipe(blocks: ProductionBlock[], recipeId: string): UnifiedScheduleEvent[] {
    const filtered = blocks.filter(b => b.recipeId === recipeId);
    return this.adaptMany(filtered);
  }

  /**
   * Convierte production blocks filtrados por estación
   *
   * @param blocks - Array de production blocks
   * @param station - Nombre de la estación
   * @returns Array de eventos unificados
   */
  adaptByStation(blocks: ProductionBlock[], station: string): UnifiedScheduleEvent[] {
    const filtered = blocks.filter(b => b.station === station);
    return this.adaptMany(filtered);
  }

  /**
   * Convierte production blocks de alta prioridad
   *
   * @param blocks - Array de production blocks
   * @returns Array de eventos unificados de alta prioridad
   */
  adaptHighPriority(blocks: ProductionBlock[]): UnifiedScheduleEvent[] {
    const highPriority = blocks.filter(
      b => b.priority === 'high' || b.priority === 'urgent' || b.quantity > 100
    );
    return this.adaptMany(highPriority);
  }

  /**
   * Convierte production blocks sin staff asignado
   *
   * @param blocks - Array de production blocks
   * @returns Array de eventos sin asignar
   */
  adaptUnassigned(blocks: ProductionBlock[]): UnifiedScheduleEvent[] {
    const unassigned = blocks.filter(b => b.assignedStaff.length === 0);
    return this.adaptMany(unassigned);
  }
}

// Singleton instance
export const productionAdapter = new ProductionAdapter();
