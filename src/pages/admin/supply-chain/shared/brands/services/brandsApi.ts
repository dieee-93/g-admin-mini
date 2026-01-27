import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { Brand, BrandFormData } from '../types/brandTypes';

/**
 * Fetch all active brands
 */
export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    logger.error('Materials', 'Failed to fetch brands', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new brand
 */
export async function createBrand(brandData: BrandFormData): Promise<Brand> {
  const payload = {
    name: brandData.name.toUpperCase().trim(),
    logo_url: brandData.logo_url || null,
    is_active: brandData.is_active,
  };

  const { data, error } = await supabase
    .from('brands')
    .insert(payload as any)
    .select()
    .single();

  if (error) {
    throw error; // Solo throw, sin log aquí
  }

  return data as Brand;
}

/**
 * Update an existing brand
 */
export async function updateBrand(id: string, brandData: BrandFormData): Promise<Brand> {
  const payload = {
    name: brandData.name.toUpperCase().trim(),
    logo_url: brandData.logo_url || null,
    is_active: brandData.is_active,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('brands')
    .update(payload as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('Materials', 'Failed to update brand', error);
    throw error;
  }

  logger.info('Materials', 'Brand updated successfully', { brandId: id });
  return data as Brand;
}

/**
 * Soft delete a brand (set is_active = false)
 */
export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase
    .from('brands')
    .update({ is_active: false, updated_at: new Date().toISOString() } as any)
    .eq('id', id);

  if (error) {
    logger.error('Materials', 'Failed to delete brand', error);
    throw error;
  }

  logger.info('Materials', 'Brand soft deleted', { brandId: id });
}
