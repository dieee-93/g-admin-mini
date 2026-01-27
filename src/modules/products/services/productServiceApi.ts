/**
 * Product Service API - Service Layer
 * Specialized functions for SERVICE type products (appointments, consultations, etc.)
 * 
 * Architecture: TanStack Query compatible
 * Pattern: Following Cash Module standards
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

/**
 * Fetch all SERVICE type products for an organization
 * 
 * @param organizationId - Organization ID to filter by
 * @returns Array of service products
 */
export async function fetchServiceProducts(organizationId: string) {
  logger.debug('Products', 'Fetching service products', { organizationId });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('type', 'SERVICE')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Products', 'Error fetching service products', error);
    throw error;
  }

  return data || [];
}

/**
 * Count SERVICE type products for an organization
 * 
 * @param organizationId - Organization ID
 * @returns Number of service products
 */
export async function countServiceProducts(organizationId: string): Promise<number> {
  logger.debug('Products', 'Counting service products', { organizationId });

  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('type', 'SERVICE');

  if (error) {
    logger.error('Products', 'Error counting service products', error);
    throw error;
  }

  return count || 0;
}
