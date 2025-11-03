/**
 * Mobile Inventory Service
 *
 * NEW functionality for Mobile module:
 * - Capacity constraints for vehicles/stands
 * - Real-time stock tracking for mobile operations
 * - Sync with Materials module
 *
 * Integrates with materialsStore from Materials module (reuse)
 */

import { supabase } from '@/lib/supabase/client';
import { eventBus } from '@/lib/events/EventBus';
import { logger } from '@/lib/logging';
import type { MobileInventoryConstraint, MobileInventoryUpdate, MobileInventoryChangeEvent } from '../types';

const MODULE_ID = 'mobile.inventory';

// ============================================
// Capacity Constraints
// ============================================

/**
 * Set capacity constraint for a vehicle/stand
 */
export async function setCapacityConstraint(
  vehicleId: string,
  materialId: string,
  maxQuantity: number,
  unit: string
): Promise<{ data: MobileInventoryConstraint | null; error: Error | null }> {
  try {
    logger.info(MODULE_ID, 'Setting capacity constraint', {
      vehicle_id: vehicleId,
      material_id: materialId,
      max_quantity: maxQuantity
    });

    // Check if constraint already exists
    const { data: existing } = await supabase
      .from('mobile_inventory_constraints')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('material_id', materialId)
      .single();

    let data;
    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from('mobile_inventory_constraints')
        .update({ max_quantity: maxQuantity, unit })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      data = updated;
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from('mobile_inventory_constraints')
        .insert({
          vehicle_id: vehicleId,
          material_id: materialId,
          max_quantity: maxQuantity,
          current_quantity: 0,
          unit
        })
        .select()
        .single();

      if (error) throw error;
      data = created;
    }

    eventBus.emit('mobile.inventory.constraint_updated', {
      vehicle_id: vehicleId,
      material_id: materialId,
      max_quantity: maxQuantity
    });

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to set capacity constraint');
    logger.error(MODULE_ID, 'Error setting capacity constraint', error);
    return { data: null, error };
  }
}

/**
 * Get all capacity constraints for a vehicle
 */
export async function getVehicleConstraints(vehicleId: string): Promise<{
  data: MobileInventoryConstraint[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('mobile_inventory_constraints')
      .select('*')
      .eq('vehicle_id', vehicleId);

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to get vehicle constraints');
    logger.error(MODULE_ID, 'Error getting vehicle constraints', error);
    return { data: [], error };
  }
}

/**
 * Check if adding quantity exceeds capacity
 */
export async function checkCapacity(
  vehicleId: string,
  materialId: string,
  quantityToAdd: number
): Promise<{ canAdd: boolean; currentQuantity: number; maxQuantity: number; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('mobile_inventory_constraints')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('material_id', materialId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // No constraint = unlimited capacity
    if (!data) {
      return { canAdd: true, currentQuantity: 0, maxQuantity: Infinity, error: null };
    }

    const canAdd = data.current_quantity + quantityToAdd <= data.max_quantity;

    return {
      canAdd,
      currentQuantity: data.current_quantity,
      maxQuantity: data.max_quantity,
      error: null
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to check capacity');
    logger.error(MODULE_ID, 'Error checking capacity', error);
    return { canAdd: false, currentQuantity: 0, maxQuantity: 0, error };
  }
}

// ============================================
// Mobile Stock Tracking
// ============================================

/**
 * Update mobile inventory quantity
 */
export async function updateMobileInventory(
  update: MobileInventoryUpdate
): Promise<{ error: Error | null }> {
  try {
    const { vehicle_id, material_id, quantity_delta } = update;

    logger.info(MODULE_ID, 'Updating mobile inventory', {
      vehicle_id,
      material_id,
      quantity_delta
    });

    // Get current constraint
    const { data: constraint, error: fetchError } = await supabase
      .from('mobile_inventory_constraints')
      .select('*')
      .eq('vehicle_id', vehicle_id)
      .eq('material_id', material_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const oldQuantity = constraint?.current_quantity || 0;
    const newQuantity = Math.max(0, oldQuantity + quantity_delta);

    // Prevent exceeding capacity
    if (constraint && newQuantity > constraint.max_quantity) {
      throw new Error(`Capacity exceeded: ${newQuantity} > ${constraint.max_quantity}`);
    }

    // Update or create constraint
    if (constraint) {
      const { error: updateError } = await supabase
        .from('mobile_inventory_constraints')
        .update({ current_quantity: newQuantity })
        .eq('id', constraint.id);

      if (updateError) throw updateError;
    }

    // Emit inventory change event
    const changeEvent: MobileInventoryChangeEvent = {
      vehicle_id,
      material_id,
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      change_reason: quantity_delta > 0 ? 'restock' : 'sale'
    };

    eventBus.emit('mobile.inventory.changed', changeEvent);

    // Also emit to Materials module for sync
    eventBus.emit('materials.stock_updated', {
      material_id,
      location_id: vehicle_id, // Vehicle as location
      old_stock: oldQuantity,
      new_stock: newQuantity
    });

    logger.info(MODULE_ID, 'Mobile inventory updated successfully');
    return { error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to update mobile inventory');
    logger.error(MODULE_ID, 'Error updating mobile inventory', error);
    return { error };
  }
}

/**
 * Sync mobile inventory with Materials module stock
 *
 * This is called when:
 * - Starting a route (loading truck)
 * - Completing a route (unloading unsold items)
 * - Restocking during route
 */
export async function syncWithMaterials(
  vehicleId: string,
  warehouseLocationId: string,
  syncDirection: 'load' | 'unload'
): Promise<{ error: Error | null }> {
  try {
    logger.info(MODULE_ID, 'Syncing mobile inventory with materials', {
      vehicle_id: vehicleId,
      warehouse_location_id: warehouseLocationId,
      direction: syncDirection
    });

    // Get all constraints for vehicle
    const { data: constraints, error: constraintsError } = await getVehicleConstraints(vehicleId);
    if (constraintsError) throw constraintsError;

    // For each constraint, update Materials stock
    for (const constraint of constraints) {
      const quantityToTransfer = constraint.current_quantity;

      if (quantityToTransfer === 0) continue;

      // Emit event to Materials module to handle stock movement
      eventBus.emit('materials.stock_transfer', {
        material_id: constraint.material_id,
        from_location_id: syncDirection === 'load' ? warehouseLocationId : vehicleId,
        to_location_id: syncDirection === 'load' ? vehicleId : warehouseLocationId,
        quantity: quantityToTransfer,
        unit: constraint.unit,
        reason: syncDirection === 'load' ? 'mobile_load' : 'mobile_unload'
      });

      // If unloading, reset mobile inventory
      if (syncDirection === 'unload') {
        await updateMobileInventory({
          vehicle_id: vehicleId,
          material_id: constraint.material_id,
          quantity_delta: -quantityToTransfer
        });
      }
    }

    logger.info(MODULE_ID, 'Sync completed successfully');
    return { error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to sync with materials');
    logger.error(MODULE_ID, 'Error syncing with materials', error);
    return { error };
  }
}

/**
 * Get low stock alerts for a vehicle
 *
 * Returns materials that are below 20% capacity
 */
export async function getLowStockAlerts(vehicleId: string): Promise<{
  data: Array<{ material_id: string; current_quantity: number; max_quantity: number; percent_remaining: number }>;
  error: Error | null;
}> {
  try {
    const { data: constraints, error } = await getVehicleConstraints(vehicleId);
    if (error) throw error;

    const lowStock = constraints
      .filter((c) => c.max_quantity > 0)
      .map((c) => ({
        material_id: c.material_id,
        current_quantity: c.current_quantity,
        max_quantity: c.max_quantity,
        percent_remaining: (c.current_quantity / c.max_quantity) * 100
      }))
      .filter((item) => item.percent_remaining < 20)
      .sort((a, b) => a.percent_remaining - b.percent_remaining);

    return { data: lowStock, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to get low stock alerts');
    logger.error(MODULE_ID, 'Error getting low stock alerts', error);
    return { data: [], error };
  }
}

export const mobileInventoryService = {
  setCapacityConstraint,
  getVehicleConstraints,
  checkCapacity,
  updateMobileInventory,
  syncWithMaterials,
  getLowStockAlerts
};
