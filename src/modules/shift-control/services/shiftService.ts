/**
 * Shift Service
 * Business logic and database operations for operational shifts
 *
 * @module shift-control/services
 * @version 2.1
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging/Logger';
import eventBus from '@/lib/events/EventBus';
import { DecimalUtils } from '@/lib/decimal';
import type {
  OperationalShift,
  OpenShiftData,
  CloseShiftData,
  ShiftOpenedPayload,
  ShiftClosedPayload,
  CloseValidationResult,
  ValidationBlocker,
  ValidationWarning,
} from '../types';

const MODULE_ID = 'ShiftControl';

// ============================================
// CALCULATION UTILITIES
// ============================================

/**
 * Get total shift amount (sum of all payment methods)
 * Uses DecimalUtils for precision
 * @param shift - The operational shift
 * @returns Formatted currency string (e.g., "$11,000.31")
 */
export function calculateTotalShiftAmount(shift: OperationalShift | null): string {
  if (!shift) return DecimalUtils.formatCurrency(DecimalUtils.fromValue(0, 'financial'));

  // Use DecimalUtils for financial precision
  const cash = DecimalUtils.fromValue(shift.cash_total ?? 0, 'financial');
  const card = DecimalUtils.fromValue(shift.card_total ?? 0, 'financial');
  const transfer = DecimalUtils.fromValue(shift.transfer_total ?? 0, 'financial');
  const qr = DecimalUtils.fromValue(shift.qr_total ?? 0, 'financial');

  const total = DecimalUtils.add(
    DecimalUtils.add(cash, card, 'financial'),
    DecimalUtils.add(transfer, qr, 'financial'),
    'financial'
  );

  return DecimalUtils.formatCurrency(total);
}

/**
 * Get payment methods breakdown with formatted amounts and percentages
 * @param shift - The operational shift
 * @returns Array<{ method: string; amount: string; percentage: number }>
 */
export function calculatePaymentMethodsBreakdown(
  shift: OperationalShift | null
): Array<{ method: string; amount: string; percentage: number }> {
  if (!shift) {
    return [
      { method: 'cash', amount: DecimalUtils.formatCurrency(DecimalUtils.fromValue(0, 'financial')), percentage: 0 },
      { method: 'card', amount: DecimalUtils.formatCurrency(DecimalUtils.fromValue(0, 'financial')), percentage: 0 },
      { method: 'transfer', amount: DecimalUtils.formatCurrency(DecimalUtils.fromValue(0, 'financial')), percentage: 0 },
      { method: 'qr', amount: DecimalUtils.formatCurrency(DecimalUtils.fromValue(0, 'financial')), percentage: 0 },
    ];
  }

  const cash = DecimalUtils.fromValue(shift.cash_total ?? 0, 'financial');
  const card = DecimalUtils.fromValue(shift.card_total ?? 0, 'financial');
  const transfer = DecimalUtils.fromValue(shift.transfer_total ?? 0, 'financial');
  const qr = DecimalUtils.fromValue(shift.qr_total ?? 0, 'financial');

  const total = DecimalUtils.add(
    DecimalUtils.add(cash, card, 'financial'),
    DecimalUtils.add(transfer, qr, 'financial'),
    'financial'
  );
  const totalNum = DecimalUtils.toNumber(total);

  // Calculate percentages using DecimalUtils
  const calculatePercent = (amount: ReturnType<typeof DecimalUtils.fromValue>): number => {
    if (totalNum === 0) return 0;
    
    const percentage = DecimalUtils.divide(
      DecimalUtils.multiply(amount, DecimalUtils.fromValue(100, 'financial'), 'financial'),
      total,
      'financial'
    );
    
    return Math.round(DecimalUtils.toNumber(percentage));
  };

  return [
    { method: 'cash', amount: DecimalUtils.formatCurrency(cash), percentage: calculatePercent(cash) },
    { method: 'card', amount: DecimalUtils.formatCurrency(card), percentage: calculatePercent(card) },
    { method: 'transfer', amount: DecimalUtils.formatCurrency(transfer), percentage: calculatePercent(transfer) },
    { method: 'qr', amount: DecimalUtils.formatCurrency(qr), percentage: calculatePercent(qr) },
  ];
}

/**
 * Calculate shift duration in minutes
 * @param shift - The operational shift
 * @returns Duration in minutes, or null if no shift or no start time
 */
export function calculateShiftDuration(shift: OperationalShift | null): number | null {
  if (!shift || !shift.opened_at) return null;

  const startTime = new Date(shift.opened_at).getTime();
  const endTime = shift.closed_at
    ? new Date(shift.closed_at).getTime()
    : Date.now();

  return Math.floor((endTime - startTime) / (1000 * 60)); // minutes
}

// ============================================
// QUERY OPERATIONS
// ============================================

/**
 * Get the currently active operational shift for a specific location
 * @param businessId - The business ID
 * @param locationId - Optional location ID (required for multi-location mode)
 */
export async function getActiveShift(
  businessId: string,
  locationId?: string
): Promise<OperationalShift | null> {
  logger.debug(MODULE_ID, 'Fetching active shift', { businessId, locationId });

  let query = supabase
    .from('operational_shifts')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'active');

  // Filter by location if provided (multi-location mode)
  if (locationId) {
    query = query.eq('location_id', locationId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    logger.error(MODULE_ID, 'Failed to fetch active shift', { error });
    throw error;
  }

  return data;
}

/**
 * Get all shifts with optional filters
 * @param businessId - The business ID
 * @param locationId - Optional location ID (filters by location if provided)
 * @param filters - Additional filters
 */
export async function getAllShifts(
  businessId: string,
  locationId?: string,
  filters?: {
    status?: 'active' | 'closed';
    startDate?: string;
    endDate?: string;
    openedBy?: string;
    limit?: number;
  }
): Promise<OperationalShift[]> {
  logger.debug(MODULE_ID, 'Fetching shifts with filters', { businessId, locationId, filters });

  let query = supabase
    .from('operational_shifts')
    .select('*')
    .eq('business_id', businessId)
    .order('opened_at', { ascending: false });

  // Filter by location if provided
  if (locationId) {
    query = query.eq('location_id', locationId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('opened_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('opened_at', filters.endDate);
  }

  if (filters?.openedBy) {
    query = query.eq('opened_by', filters.openedBy);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error(MODULE_ID, 'Failed to fetch shifts', { error });
    throw error;
  }

  return data || [];
}

/**
 * Get a specific shift by ID
 */
export async function getShiftById(
  shiftId: string
): Promise<OperationalShift | null> {
  logger.debug(MODULE_ID, 'Fetching shift by ID', { shiftId });

  const { data, error } = await supabase
    .from('operational_shifts')
    .select('*')
    .eq('id', shiftId)
    .maybeSingle();

  if (error) {
    logger.error(MODULE_ID, 'Failed to fetch shift', { error });
    throw error;
  }

  return data;
}

// ============================================
// VALIDATION OPERATIONS
// ============================================

/**
 * Validate if a shift can be closed
 * Checks blocking conditions from database state
 * @param shiftId - The shift ID to validate
 * @returns Validation result with blockers and warnings
 */
export async function validateCloseShift(
  shiftId: string
): Promise<CloseValidationResult> {
  logger.debug(MODULE_ID, 'Validating shift close', { shiftId });

  // Get current shift
  const shift = await getShiftById(shiftId);

  if (!shift) {
    throw new Error('Turno no encontrado');
  }

  if (shift.status !== 'active') {
    throw new Error('El turno no está activo');
  }

  const blockers: ValidationBlocker[] = [];
  const warnings: ValidationWarning[] = [];

  // ✅ MIGRATED: Get feature flags using queryClient (outside React)
  const { queryClient } = await import('@/App');
  const { businessProfileKeys } = await import('@/lib/business-profile/hooks/useBusinessProfile');
  const { FeatureActivationEngine } = await import('@/lib/features/FeatureEngine');
  
  const profile = queryClient.getQueryData<any>(businessProfileKeys.detail());
  const { activeFeatures } = FeatureActivationEngine.activateFeatures(
    profile?.selectedCapabilities || [],
    profile?.selectedInfrastructure || []
  );
  
  const hasFeature = (featureId: string) => activeFeatures.includes(featureId as any);

  try {
    // Emit validation requested event for hookpoint integrations
    await eventBus.emit(
      'shift.close_validation.requested',
      {
        shift,
      },
      MODULE_ID
    );

    // ============================================
    // CHECK BLOCKERS FROM DATABASE (DYNAMIC)
    // ============================================

    // 1. Cash Session Check
    // ✅ ONLY validate if payment processing features are active
    if (hasFeature('sales_payment_processing') || hasFeature('sales_pos_onsite')) {
      const { data: activeCashSessions, error: cashError } = await supabase
        .from('cash_sessions')
        .select('id, money_location_id')
        .eq('status', 'OPEN');

      if (cashError) {
        logger.error(MODULE_ID, 'Error checking cash sessions', { error: cashError });
      } else if (activeCashSessions && activeCashSessions.length > 0) {
        blockers.push({
          type: 'cash_session',
          message: 'Hay una sesión de caja abierta',
          affectedFeature: 'sales_payment_processing',
        });
      }
    }

    // 2. Open Tables Check
    // ✅ ONLY validate if table management feature is active
    if (hasFeature('operations_table_management')) {
      const { data: openTables, error: tablesError } = await supabase
        .from('tables')
        .select('id, number')
        .eq('status', 'occupied');

      if (tablesError) {
        logger.error(MODULE_ID, 'Error checking open tables', { error: tablesError });
      } else if (openTables && openTables.length > 0) {
        blockers.push({
          type: 'open_tables',
          message: `Hay ${openTables.length} mesa(s) abierta(s)`,
          count: openTables.length,
          affectedFeature: 'operations_table_management',
        });
      }
    }

    // 3. Active Deliveries Check
    // ✅ ONLY validate if delivery features are active
    if (hasFeature('sales_delivery_orders') || hasFeature('operations_delivery_zones')) {
      // Query fulfillment queue for active delivery orders
      const { data: activeDeliveries, error: deliveriesError } = await supabase
        .from('fulfillment_queue')
        .select('id, order_id')
        .eq('fulfillment_type', 'delivery')
        .in('status', ['pending', 'in_progress', 'ready']);

      if (deliveriesError) {
        logger.error(MODULE_ID, 'Error checking active deliveries', { error: deliveriesError });
      } else if (activeDeliveries && activeDeliveries.length > 0) {
        blockers.push({
          type: 'active_deliveries',
          message: `Hay ${activeDeliveries.length} entrega(s) activa(s)`,
          count: activeDeliveries.length,
          affectedFeature: 'sales_delivery_orders',
        });
      }
    }

    // 4. Pending Orders Check
    // ✅ ONLY validate if order management is active
    if (hasFeature('sales_order_management')) {
      // Query fulfillment queue for any pending/in-progress orders (all types)
      const { data: pendingOrders, error: ordersError } = await supabase
        .from('fulfillment_queue')
        .select('id, order_id, fulfillment_type')
        .in('status', ['pending', 'in_progress']);

      if (ordersError) {
        logger.error(MODULE_ID, 'Error checking pending orders', { error: ordersError });
      } else if (pendingOrders && pendingOrders.length > 0) {
        blockers.push({
          type: 'pending_orders',
          message: `Hay ${pendingOrders.length} orden(es) pendiente(s)`,
          count: pendingOrders.length,
          affectedFeature: 'sales_order_management',
        });
      }
    }

    // ============================================
    // CHECK WARNINGS (DYNAMIC)
    // ============================================

    // 1. Unchecked Staff Warning
    // ✅ ONLY check if staff management is active
    if (hasFeature('staff_employee_management') || hasFeature('staff_time_tracking')) {
      const { data: checkedInStaff, error: staffError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, checked_in_at')
        .eq('checked_in', true);

      if (staffError) {
        logger.error(MODULE_ID, 'Error checking staff checkout status', { error: staffError });
      } else if (checkedInStaff && checkedInStaff.length > 0) {
        warnings.push({
          type: 'unchecked_staff',
          message: `${checkedInStaff.length} empleado(s) no han hecho checkout`,
          severity: 'medium',
        });
        logger.warn(MODULE_ID, 'Staff still checked in', {
          count: checkedInStaff.length,
          staff: checkedInStaff.map(s => `${s.first_name} ${s.last_name}`),
        });
      }
    }

    // 2. Inventory Low Stock Warning
    // ✅ ONLY check if inventory tracking is active
    if (hasFeature('inventory_stock_tracking') || hasFeature('inventory_alert_system')) {
      // Get all materials with min_stock defined and filter client-side
      const { data: allMaterials, error: inventoryError } = await supabase
        .from('materials')
        .select('id, name, stock, min_stock')
        .not('min_stock', 'is', null);

      if (inventoryError) {
        logger.error(MODULE_ID, 'Error checking inventory levels', { error: inventoryError });
      } else if (allMaterials) {
        // Filter materials where stock < min_stock
        const lowStockMaterials = allMaterials.filter(m =>
          m.stock !== null &&
          m.min_stock !== null &&
          Number(m.stock) < Number(m.min_stock)
        );

        if (lowStockMaterials.length > 0) {
          warnings.push({
            type: 'inventory_count',
            message: `${lowStockMaterials.length} material(es) con stock bajo`,
            severity: 'high',
          });
          logger.warn(MODULE_ID, 'Low stock materials detected', {
            count: lowStockMaterials.length,
            materials: lowStockMaterials.slice(0, 5).map(m => ({
              name: m.name,
              stock: m.stock,
              min: m.min_stock
            })),
          });
        }
      }
    }

    // 3. Low Cash Warning
    // ✅ ONLY check if payment processing is active AND there are active cash sessions
    if (hasFeature('sales_payment_processing') || hasFeature('sales_pos_onsite')) {
      const { data: activeCashSessions, error: cashError } = await supabase
        .from('cash_sessions')
        .select('id, money_location_id')
        .eq('status', 'OPEN');

      if (!cashError && activeCashSessions && activeCashSessions.length > 0) {
        // Check each active cash session for low cash
        for (const session of activeCashSessions) {
          // Get full session details
          const { data: sessionDetails, error: sessionError } = await supabase
            .from('cash_sessions')
            .select('starting_cash, cash_sales, cash_refunds, cash_in, cash_out, cash_drops')
            .eq('id', session.id)
            .single();

          if (!sessionError && sessionDetails) {
            // Calculate expected cash in register
            const expectedCash = Number(sessionDetails.starting_cash || 0)
              + Number(sessionDetails.cash_sales || 0)
              + Number(sessionDetails.cash_in || 0)
              - Number(sessionDetails.cash_refunds || 0)
              - Number(sessionDetails.cash_out || 0)
              - Number(sessionDetails.cash_drops || 0);

            // Define minimum threshold (e.g., 50% of starting cash or minimum $100)
            const MIN_CASH_THRESHOLD = Math.max(
              Number(sessionDetails.starting_cash || 0) * 0.5,
              100
            );

            if (expectedCash < MIN_CASH_THRESHOLD) {
              warnings.push({
                type: 'low_cash',
                message: `Efectivo en caja bajo: $${expectedCash.toFixed(2)} (mínimo: $${MIN_CASH_THRESHOLD.toFixed(2)})`,
                severity: 'low',
              });
              logger.warn(MODULE_ID, 'Low cash in register detected', {
                sessionId: session.id,
                expectedCash,
                threshold: MIN_CASH_THRESHOLD,
              });
            }
          }
        }
      }
    }

    // 4. Pending Asset Returns (Rentals)
    // ✅ ONLY check if rental features are active
    if (hasFeature('rental_item_management') || hasFeature('rental_booking_calendar')) {
      const { data: pendingReturns, error: rentalsError } = await supabase
        .from('rental_reservations')
        .select('id, item_id, customer_id, end_datetime')
        .is('actual_return_datetime', null) // Not returned yet
        .lte('end_datetime', new Date().toISOString()); // Past due date

      if (rentalsError) {
        logger.error(MODULE_ID, 'Error checking pending returns', { error: rentalsError });
      } else if (pendingReturns && pendingReturns.length > 0) {
        blockers.push({
          type: 'pending_returns',
          message: `${pendingReturns.length} devolución(es) de activos vencida(s)`,
          count: pendingReturns.length,
          affectedFeature: 'rental_item_management',
        });
        logger.warn(MODULE_ID, 'Overdue rental returns detected', {
          count: pendingReturns.length,
          rentals: pendingReturns.map(r => r.id),
        });
      }
    }

    // ============================================
    // BUILD RESULT
    // ============================================

    const result: CloseValidationResult = {
      canClose: blockers.length === 0,
      blockers,
      warnings,
    };

    // Emit validation failed event if there are blockers
    if (!result.canClose) {
      await eventBus.emit(
        'shift.close_validation.failed',
        {
          shift,
          validation: result,
        },
        MODULE_ID
      );

      logger.warn(MODULE_ID, 'Shift close validation failed', {
        shiftId,
        blockers: blockers.length,
        warnings: warnings.length,
      });
    } else {
      logger.info(MODULE_ID, 'Shift close validation passed', {
        shiftId,
        warnings: warnings.length,
      });
    }

    return result;
  } catch (error) {
    logger.error(MODULE_ID, 'Validation error', { error });
    throw error;
  }
}

// ============================================
// MUTATION OPERATIONS
// ============================================

/**
 * Open a new operational shift
 * @param data - Shift data (opened_by, notes)
 * @param businessId - The business ID
 * @param locationId - The location ID (required for multi-location support)
 */
export async function openShift(
  data: OpenShiftData,
  businessId: string,
  locationId?: string
): Promise<OperationalShift> {
  logger.info(MODULE_ID, 'Opening operational shift', {
    businessId,
    locationId,
    openedBy: data.opened_by,
  });

  // Validate: No active shift exists for this location
  const existingShift = await getActiveShift(businessId, locationId);
  if (existingShift) {
    throw new Error('Ya existe un turno operacional abierto para esta ubicacion');
  }

  // Create the shift
  const { data: shift, error } = await supabase
    .from('operational_shifts')
    .insert({
      business_id: businessId,
      location_id: locationId,
      opened_by: data.opened_by,
      opened_at: new Date().toISOString(),
      open_notes: data.notes,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    logger.error(MODULE_ID, 'Failed to open shift', { error });
    throw error;
  }

  // Emit event
  const eventPayload: ShiftOpenedPayload = {
    shift,
    opened_by_user: {
      id: data.opened_by,
      name: 'User', // TODO: Get from auth context
      role: 'staff', // TODO: Get from auth context
    },
    notes: data.notes,
  };

  await eventBus.emit('shift.opened', eventPayload, MODULE_ID);

  logger.info(MODULE_ID, 'Shift opened successfully', {
    shiftId: shift.id,
  });

  return shift;
}

/**
 * Close an operational shift
 * @param shiftId - The shift ID to close
 * @param data - Close shift data
 * @param options - Optional parameters
 * @param options.skipValidation - Skip validation checks (for force close)
 */
export async function closeShift(
  shiftId: string,
  data: CloseShiftData,
  options?: {
    skipValidation?: boolean;
  }
): Promise<OperationalShift> {
  logger.info(MODULE_ID, 'Closing operational shift', {
    shiftId,
    closedBy: data.closed_by,
    skipValidation: options?.skipValidation || false,
  });

  // Get current shift
  const shift = await getShiftById(shiftId);

  if (!shift) {
    throw new Error('Turno no encontrado');
  }

  if (shift.status !== 'active') {
    throw new Error('El turno ya está cerrado');
  }

  // ============================================
  // VALIDATION ENFORCEMENT
  // ============================================

  if (!options?.skipValidation) {
    logger.debug(MODULE_ID, 'Validating shift before close');

    const validationResult = await validateCloseShift(shiftId);

    if (!validationResult.canClose) {
      const blockerMessages = validationResult.blockers
        .map((b) => b.message)
        .join(', ');

      logger.warn(MODULE_ID, 'Cannot close shift - validation failed', {
        shiftId,
        blockers: validationResult.blockers,
      });

      throw new Error(
        `No se puede cerrar el turno. Bloqueadores: ${blockerMessages}`
      );
    }

    logger.info(MODULE_ID, 'Validation passed, proceeding with close', {
      shiftId,
      warnings: validationResult.warnings.length,
    });
  } else {
    logger.warn(MODULE_ID, 'Skipping validation (force close)', { shiftId });
  }

  // Calculate duration
  const openedAt = new Date(shift.opened_at);
  const closedAt = new Date();
  const durationMinutes = Math.floor((closedAt.getTime() - openedAt.getTime()) / (1000 * 60));

  // Update shift
  const { data: closedShift, error } = await supabase
    .from('operational_shifts')
    .update({
      closed_by: data.closed_by,
      closed_at: closedAt.toISOString(),
      close_notes: data.notes,
      status: 'closed',
    })
    .eq('id', shiftId)
    .select()
    .single();

  if (error) {
    logger.error(MODULE_ID, 'Failed to close shift', { error });
    throw error;
  }

  // Emit event with summary
  const eventPayload: ShiftClosedPayload = {
    shift: closedShift,
    closed_by_user: {
      id: data.closed_by,
      name: 'User', // TODO: Get from auth context
      role: 'staff', // TODO: Get from auth context
    },
    summary: {
      total_sales: closedShift.total_sales || 0,
      labor_cost: closedShift.labor_cost || 0,
      duration_minutes: durationMinutes,
      staff_count: closedShift.active_staff_count || 0,
      transactions_count: 0, // TODO: Get from sales module
    },
    notes: data.notes,
  };

  await eventBus.emit('shift.closed', eventPayload, MODULE_ID);

  logger.info(MODULE_ID, 'Shift closed successfully', {
    shiftId: closedShift.id,
    duration: durationMinutes,
  });

  return closedShift;
}

/**
 * Update shift statistics (called by event handlers)
 */
export async function updateShiftStats(
  shiftId: string,
  updates: {
    total_sales?: number;
    labor_cost?: number;
    active_staff_count?: number;
  }
): Promise<void> {
  logger.debug(MODULE_ID, 'Updating shift stats', { shiftId, updates });

  const { error } = await supabase
    .from('operational_shifts')
    .update(updates)
    .eq('id', shiftId);

  if (error) {
    logger.error(MODULE_ID, 'Failed to update shift stats', { error });
    throw error;
  }

  logger.debug(MODULE_ID, 'Shift stats updated', { shiftId });
}

/**
 * Force close a shift (admin override)
 * Bypasses ALL validation checks - use with caution
 * @param shiftId - The shift ID to close
 * @param data - Close shift data
 */
export async function forceCloseShift(
  shiftId: string,
  data: CloseShiftData
): Promise<OperationalShift> {
  logger.warn(MODULE_ID, 'Force closing shift (admin override)', {
    shiftId,
    closedBy: data.closed_by,
  });

  // Bypass validation by passing skipValidation option
  return await closeShift(shiftId, data, { skipValidation: true });
}
