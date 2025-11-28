/**
 * ASSETS API SERVICE
 * Supabase API calls for asset management
 */

import { supabase } from '@/lib/supabase/client';
import type { Asset, CreateAssetDTO, UpdateAssetDTO, AssetFilters } from '../types';

export const assetsApi = {
  /**
   * Fetch all assets with optional filters
   */
  async getAll(filters?: AssetFilters): Promise<Asset[]> {
    let query = supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters?.category?.length) {
      query = query.in('category', filters.category);
    }
    if (filters?.condition?.length) {
      query = query.in('condition', filters.condition);
    }
    if (filters?.is_rentable !== undefined) {
      query = query.eq('is_rentable', filters.is_rentable);
    }
    if (filters?.currently_rented !== undefined) {
      query = query.eq('currently_rented', filters.currently_rented);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,asset_code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get single asset by ID
   */
  async getById(id: string): Promise<Asset | null> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new asset
   */
  async create(dto: CreateAssetDTO): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .insert([dto])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update existing asset
   */
  async update(dto: UpdateAssetDTO): Promise<Asset> {
    const { id, ...updates } = dto;

    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete asset
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Update asset status
   */
  async updateStatus(id: string, status: Asset['status']): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark asset as rented
   */
  async markAsRented(id: string, rentalId: string): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .update({
        currently_rented: true,
        current_rental_id: rentalId,
        status: 'rented',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark asset as returned from rental
   */
  async markAsReturned(id: string): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .update({
        currently_rented: false,
        current_rental_id: null,
        status: 'available',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get rentable assets
   */
  async getRentableAssets(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('is_rentable', true)
      .eq('currently_rented', false)
      .in('status', ['available', 'in_use']);

    if (error) throw error;
    return data || [];
  },
};
