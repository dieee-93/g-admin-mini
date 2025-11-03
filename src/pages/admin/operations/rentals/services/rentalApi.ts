/**
 * Rentals API Service
 *
 * Handles all database operations for rental items and reservations
 * Uses Supabase client with RLS policies
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type {
  RentalItem,
  RentalReservation,
  RentalMetrics,
  AvailabilityCheck,
  CreateRentalItemInput,
  CreateReservationInput,
  UpdateReservationInput,
} from '../types';

// ============================================
// RENTAL ITEMS (Catalog)
// ============================================

/**
 * Get all active rental items
 */
export async function getRentalItems(): Promise<RentalItem[]> {
  try {
    const { data, error } = await supabase
      .from('rental_items')
      .select('*')
      .eq('is_active', true)
      .order('item_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Rentals', 'Error fetching rental items', error);
    throw error;
  }
}

/**
 * Get rental items by type
 */
export async function getRentalItemsByType(
  itemType: 'equipment' | 'space' | 'vehicle' | 'tools'
): Promise<RentalItem[]> {
  try {
    const { data, error } = await supabase
      .from('rental_items')
      .select('*')
      .eq('is_active', true)
      .eq('item_type', itemType)
      .order('item_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Rentals', 'Error fetching rental items by type', error);
    throw error;
  }
}

/**
 * Get single rental item by ID
 */
export async function getRentalItem(id: string): Promise<RentalItem | null> {
  try {
    const { data, error } = await supabase
      .from('rental_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Rentals', 'Error fetching rental item', error);
    throw error;
  }
}

/**
 * Create new rental item
 */
export async function createRentalItem(
  input: CreateRentalItemInput
): Promise<RentalItem> {
  try {
    const { data, error } = await supabase
      .from('rental_items')
      .insert({
        ...input,
        is_active: true,
        condition: 'good',
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('Rentals', 'Rental item created', { id: data.id, name: input.item_name });
    return data;
  } catch (error) {
    logger.error('Rentals', 'Error creating rental item', error);
    throw error;
  }
}

/**
 * Update rental item
 */
export async function updateRentalItem(
  id: string,
  updates: Partial<CreateRentalItemInput>
): Promise<RentalItem> {
  try {
    const { data, error } = await supabase
      .from('rental_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Rentals', 'Rental item updated', { id });
    return data;
  } catch (error) {
    logger.error('Rentals', 'Error updating rental item', error);
    throw error;
  }
}

/**
 * Deactivate rental item (soft delete)
 */
export async function deactivateRentalItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('rental_items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    logger.info('Rentals', 'Rental item deactivated', { id });
  } catch (error) {
    logger.error('Rentals', 'Error deactivating rental item', error);
    throw error;
  }
}

// ============================================
// RESERVATIONS
// ============================================

/**
 * Get all reservations (with filters)
 */
export async function getReservations(filters?: {
  status?: string;
  customer_id?: string;
  item_id?: string;
}): Promise<RentalReservation[]> {
  try {
    let query = supabase
      .from('rental_reservations')
      .select(`
        *,
        item:rental_items(id, item_name, item_type),
        customer:customers(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters?.item_id) {
      query = query.eq('item_id', filters.item_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Rentals', 'Error fetching reservations', error);
    throw error;
  }
}

/**
 * Get single reservation
 */
export async function getReservation(id: string): Promise<RentalReservation | null> {
  try {
    const { data, error } = await supabase
      .from('rental_reservations')
      .select(`
        *,
        item:rental_items(*),
        customer:customers(id, name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Rentals', 'Error fetching reservation', error);
    throw error;
  }
}

/**
 * Check availability for a rental item
 */
export async function checkAvailability(
  itemId: string,
  startDatetime: string,
  endDatetime: string
): Promise<AvailabilityCheck> {
  try {
    const { data, error } = await supabase.rpc('check_rental_availability', {
      p_item_id: itemId,
      p_start_datetime: startDatetime,
      p_end_datetime: endDatetime,
    });

    if (error) throw error;
    return data as AvailabilityCheck;
  } catch (error) {
    logger.error('Rentals', 'Error checking availability', error);
    throw error;
  }
}

/**
 * Create new reservation
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<RentalReservation> {
  try {
    // First check availability
    const availability = await checkAvailability(
      input.item_id,
      input.start_datetime,
      input.end_datetime
    );

    if (!availability.available) {
      throw new Error(availability.reason || 'Item not available for selected period');
    }

    // Calculate total amount
    const totalAmount = input.rental_rate + (input.deposit_paid || 0);

    // Create reservation
    const { data, error } = await supabase
      .from('rental_reservations')
      .insert({
        item_id: input.item_id,
        customer_id: input.customer_id,
        start_datetime: input.start_datetime,
        end_datetime: input.end_datetime,
        rental_rate: input.rental_rate,
        rate_type: input.rate_type || 'daily',
        deposit_paid: input.deposit_paid || 0,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'unpaid',
        checkout_condition: 'good',
        notes: input.notes,
      })
      .select(`
        *,
        item:rental_items(*),
        customer:customers(id, name, email)
      `)
      .single();

    if (error) throw error;

    logger.info('Rentals', 'Reservation created', {
      id: data.id,
      item_id: input.item_id,
      customer_id: input.customer_id,
    });

    return data;
  } catch (error) {
    logger.error('Rentals', 'Error creating reservation', error);
    throw error;
  }
}

/**
 * Update reservation
 */
export async function updateReservation(
  id: string,
  updates: UpdateReservationInput
): Promise<RentalReservation> {
  try {
    const { data, error } = await supabase
      .from('rental_reservations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        item:rental_items(*),
        customer:customers(id, name, email)
      `)
      .single();

    if (error) throw error;

    logger.info('Rentals', 'Reservation updated', { id, updates });
    return data;
  } catch (error) {
    logger.error('Rentals', 'Error updating reservation', error);
    throw error;
  }
}

/**
 * Confirm reservation (mark as confirmed)
 */
export async function confirmReservation(id: string): Promise<RentalReservation> {
  return updateReservation(id, {
    status: 'confirmed',
    payment_status: 'paid',
  });
}

/**
 * Start rental (pickup)
 */
export async function startRental(
  id: string,
  checkoutCondition: 'excellent' | 'good' | 'fair' | 'damaged'
): Promise<RentalReservation> {
  try {
    // Get current reservation to validate
    const reservation = await getReservation(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Update with checkout condition
    const updated = await updateReservation(id, {
      status: 'active',
      actual_pickup_datetime: new Date().toISOString(),
      payment_status: 'paid',
    });

    logger.info('Rentals', 'Rental started (pickup)', {
      id,
      checkoutCondition,
      itemId: reservation.item_id,
    });

    return updated;
  } catch (error) {
    logger.error('Rentals', 'Error starting rental', error);
    throw error;
  }
}

/**
 * Complete rental (return)
 */
export async function completeRental(
  id: string,
  returnCondition: 'excellent' | 'good' | 'fair' | 'damaged',
  damageReport?: string,
  damageFees?: number
): Promise<RentalReservation> {
  return updateReservation(id, {
    status: 'completed',
    actual_return_datetime: new Date().toISOString(),
    return_condition: returnCondition,
    damage_report: damageReport,
    damage_fees: damageFees,
  });
}

/**
 * Cancel reservation
 */
export async function cancelReservation(id: string): Promise<RentalReservation> {
  return updateReservation(id, {
    status: 'cancelled',
  });
}

// ============================================
// METRICS & ANALYTICS
// ============================================

/**
 * Get rental system metrics
 */
export async function getRentalMetrics(): Promise<RentalMetrics> {
  try {
    const { data, error } = await supabase.rpc('get_rental_metrics');

    if (error) throw error;
    return data as RentalMetrics;
  } catch (error) {
    logger.error('Rentals', 'Error fetching rental metrics', error);
    throw error;
  }
}

/**
 * Get active rentals count
 */
export async function getActiveRentalsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('rental_reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) throw error;
    return count || 0;
  } catch (error) {
    logger.error('Rentals', 'Error fetching active rentals count', error);
    return 0;
  }
}

/**
 * Get upcoming reservations
 */
export async function getUpcomingReservations(limit = 10): Promise<RentalReservation[]> {
  try {
    const { data, error } = await supabase
      .from('rental_reservations')
      .select(`
        *,
        item:rental_items(id, item_name, item_type),
        customer:customers(id, name, email)
      `)
      .eq('status', 'confirmed')
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Rentals', 'Error fetching upcoming reservations', error);
    throw error;
  }
}
