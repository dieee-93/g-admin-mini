/**
 * Materials/Inventory Event Handlers for ShiftControl
 *
 * Handles inventory.* events and updates shift state
 * Uses createShiftAwareHandler HOF to ensure shift is active
 *
 * @module shift-control/handlers
 * @version 2.1
 */

import { logger } from '@/lib/logging/Logger';
import { useShiftStore } from '../store/shiftStore';
import { createShiftAwareHandler } from './utils';
import type { EventPayload } from '@/lib/events/EventBus';
import type { StockAlert } from '../types';

const MODULE_ID = 'ShiftControl';

// ============================================================================
// LOW STOCK ALERT
// ============================================================================

/**
 * Handle inventory.stock.low event
 * Adds/updates stock alert in the shift store
 */
export const handleStockLow = createShiftAwareHandler(
  'inventory.stock.low',
  async (event: EventPayload) => {
    const { material_id, material_name, current_quantity, min_quantity, severity } = event.data;

    const currentAlerts = useShiftStore.getState().stockAlerts;

    // Check if alert already exists for this material
    const existingIndex = currentAlerts.findIndex((a: StockAlert) => a.material_id === material_id);

    let newAlerts: StockAlert[];
    if (existingIndex >= 0) {
      // Update existing alert
      newAlerts = currentAlerts.map((alert: StockAlert, idx: number) =>
        idx === existingIndex
          ? { material_id, material_name, current_quantity, min_quantity, severity }
          : alert
      );
    } else {
      // Add new alert
      newAlerts = [
        ...currentAlerts,
        { material_id, material_name, current_quantity, min_quantity, severity },
      ];
    }

    useShiftStore.getState().setStockAlerts(newAlerts);

    // Also add to general alerts if severity is high
    if (severity === 'high') {
      useShiftStore.getState().addAlert({
        type: 'inventory',
        severity: 'error',
        message: `Stock crítico: ${material_name} (${current_quantity} restantes)`,
        moduleId: 'materials',
        actionable: true,
        actionLabel: 'Ver Inventario',
      });
    }

    logger.info(MODULE_ID, 'Stock alert added/updated', {
      materialId: material_id,
      materialName: material_name,
      severity,
      currentQuantity: current_quantity,
    });
  }
);

// ============================================================================
// STOCK RESTOCKED
// ============================================================================

/**
 * Handle inventory.stock.restocked event
 * Removes stock alert for the restocked material
 */
export const handleStockRestocked = createShiftAwareHandler(
  'inventory.stock.restocked',
  async (event: EventPayload) => {
    const { material_id } = event.data;

    const currentAlerts = useShiftStore.getState().stockAlerts;
    const newAlerts = currentAlerts.filter((alert: StockAlert) => alert.material_id !== material_id);

    useShiftStore.getState().setStockAlerts(newAlerts);

    logger.info(MODULE_ID, 'Stock alert removed (restocked)', {
      materialId: material_id,
    });
  }
);
