// ================================================================
// LOCATIONS API SERVICE
// ================================================================
// Purpose: API service for locations CRUD operations
// ✅ OPTIMIZED: Request deduplication enabled (v1.1)
// ================================================================

import { supabase } from '@/lib/supabase/client';
import type { Location, LocationFormData, LocationMetrics } from '@/types/location';
import { logger } from '@/lib/logging';
import { deduplicator } from '@/lib/query/requestDeduplication'; // ✅ Deduplication

class LocationsAPI {
  /**
   * Get all active locations
   *
   * ✅ OPTIMIZED: Deduplicated to prevent multiple simultaneous queries
   * If 4 components call this at once, only 1 DB query is made.
   */
  async getAll(): Promise<Location[]> {
    return deduplicator.dedupe('locations:all', async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('status', 'active')
        .order('is_main', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        logger.error('locationsApi', 'Error fetching locations:', error);
        throw new Error(`Failed to fetch locations: ${error.message}`);
      }

      return data || [];
    });
  }

  /**
   * Get location by ID
   *
   * ✅ OPTIMIZED: Deduplicated per location ID
   */
  async getById(id: string): Promise<Location> {
    return deduplicator.dedupe(`locations:byId:${id}`, async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('locationsApi', 'Error fetching location:', error);
        throw new Error(`Failed to fetch location: ${error.message}`);
      }

      return data;
    });
  }

  /**
   * Get main location
   *
   * ✅ OPTIMIZED: Deduplicated (common call from multiple components)
   */
  async getMainLocation(): Promise<Location | null> {
    return deduplicator.dedupe('locations:main', async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_main', true)
        .single();

      if (error) {
        logger.error('locationsApi', 'Error fetching main location:', error);
        return null;
      }

      return data;
    });
  }

  /**
   * Create new location
   */
  async create(locationData: LocationFormData): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...locationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('locationsApi', 'Error creating location:', error);
      throw new Error(`Failed to create location: ${error.message}`);
    }

    return data;
  }

  /**
   * Update location
   */
  async update(id: string, locationData: Partial<LocationFormData>): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .update({
        ...locationData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('locationsApi', 'Error updating location:', error);
      throw new Error(`Failed to update location: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete location (soft delete by setting status to 'closed')
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .update({
        status: 'closed',
        closing_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('locationsApi', 'Error deleting location:', error);
      throw new Error(`Failed to delete location: ${error.message}`);
    }
  }

  /**
   * Hard delete location (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('locationsApi', 'Error hard deleting location:', error);
      throw new Error(`Failed to hard delete location: ${error.message}`);
    }
  }

  /**
   * Set a location as main (unsets other main locations)
   */
  async setMainLocation(id: string): Promise<void> {
    // The database trigger will handle unsetting other main locations
    const { error } = await supabase
      .from('locations')
      .update({ is_main: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error('locationsApi', 'Error setting main location:', error);
      throw new Error(`Failed to set main location: ${error.message}`);
    }
  }

  /**
   * Get metrics for a specific location
   */
  async getMetrics(locationId: string): Promise<LocationMetrics> {
    try {
      // Fetch sales revenue
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total')
        .eq('location_id', locationId)
        .eq('status', 'completed');

      if (salesError) throw salesError;

      const revenue = salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;

      // Fetch order count
      const orders = salesData?.length || 0;

      // Fetch staff count
      const { count: staffCount, error: staffError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('primary_location_id', locationId)
        .eq('status', 'active');

      if (staffError) throw staffError;

      // Fetch inventory value
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('stock_entries')
        .select('quantity, unit_cost')
        .eq('location_id', locationId);

      if (inventoryError) throw inventoryError;

      const inventory_value = inventoryData?.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.unit_cost || 0),
        0
      ) || 0;

      return {
        revenue,
        orders,
        staff_count: staffCount || 0,
        inventory_value,
      };
    } catch (error) {
      logger.error('locationsApi', 'Error fetching location metrics:', error);
      return {
        revenue: 0,
        orders: 0,
        staff_count: 0,
        inventory_value: 0,
      };
    }
  }

  /**
   * Check if a PDV (Punto de Venta) is already in use
   */
  async isPDVInUse(pdv: number, excludeLocationId?: string): Promise<boolean> {
    let query = supabase
      .from('locations')
      .select('id')
      .eq('punto_venta_afip', pdv);

    if (excludeLocationId) {
      query = query.neq('id', excludeLocationId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('locationsApi', 'Error checking PDV:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Check if a location code is already in use
   */
  async isCodeInUse(code: string, excludeLocationId?: string): Promise<boolean> {
    let query = supabase
      .from('locations')
      .select('id')
      .eq('code', code.toUpperCase());

    if (excludeLocationId) {
      query = query.neq('id', excludeLocationId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('locationsApi', 'Error checking code:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }
}

export const locationsApi = new LocationsAPI();
