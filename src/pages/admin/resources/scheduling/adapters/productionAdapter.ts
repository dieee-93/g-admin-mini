/**
 * PRODUCTION ADAPTER - TODO
 *
 * Convierte datos de production blocks al formato UnifiedScheduleEvent.
 *
 * @version 1.0.0 - PLACEHOLDER
 * @see ../docs/SCHEDULING_INTEGRATION_GUIDE.md#production-blocks
 *
 * TODO: Implementar cuando el módulo de Production esté completo
 *
 * REQUIREMENTS:
 * - Integrar con production module (src/modules/production)
 * - Obtener production_schedules desde Supabase
 * - Mapear recipeId, quantity, assignedStaff
 * - Calcular capacityUsed
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
 * Production Block type (placeholder)
 *
 * TODO: Importar desde production module cuando exista
 */
interface ProductionBlock {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  unit: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedStaff: Array<{ id: string; name: string }>;
  station?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Adapter para Production Blocks
 *
 * TODO: Implementar completamente
 */
export class ProductionAdapter extends SchedulingAdapter<ProductionBlock> {
  adapt(block: ProductionBlock): UnifiedScheduleEvent {
    // TODO: Implementar conversión completa
    // Similar a staffShiftAdapter pero con metadata de producción

    const start = this.combineDateTime(block.date, block.startTime);
    const end = this.combineDateTime(block.date, block.endTime);
    this.validateDates(start, end);

    const colors = this.getColors('production');

    const metadata: ProductionMetadata = {
      type: 'production',
      recipeId: block.recipeId,
      recipeName: block.recipeName,
      quantity: block.quantity,
      unit: block.unit,
      assignedStaffIds: block.assignedStaff.map(s => s.id),
      assignedStaffNames: block.assignedStaff.map(s => s.name),
      capacityUsed: 0, // TODO: Calcular basado en kitchen capacity
      station: block.station
    };

    return {
      id: block.id,
      type: 'production',
      title: `${block.recipeName} (${block.quantity} ${block.unit})`,
      description: undefined,
      start,
      end,
      allDay: false,
      employeeId: undefined, // Production no tiene un empleado único
      employeeName: undefined,
      departmentId: 'kitchen', // Siempre cocina
      departmentName: 'Kitchen',
      locationId: undefined,
      status: this.normalizeStatus(block.status),
      priority: 2,
      metadata,
      colorBg: colors.bg,
      colorBorder: colors.border,
      colorText: colors.text,
      colorDot: colors.dot,
      icon: 'BeakerIcon',
      createdAt: new Date(block.createdAt),
      updatedAt: new Date(block.updatedAt),
      createdBy: undefined
    };
  }
}

// Singleton instance (disabled until implemented)
// export const productionAdapter = new ProductionAdapter();

// TEMPORARY: Export disabled message
export const productionAdapter = {
  adapt: () => {
    throw new Error('ProductionAdapter not yet implemented. See productionAdapter.ts TODO comments.');
  },
  adaptMany: () => {
    throw new Error('ProductionAdapter not yet implemented. See productionAdapter.ts TODO comments.');
  }
};
