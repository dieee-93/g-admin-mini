/**
 * Assets TanStack Query Hooks
 * 
 * Migration from Zustand store to TanStack Query
 * Following Cash Module pattern
 * 
 * @see src/modules/cash/hooks/useCashTransactions.ts - Reference implementation
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration plan
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';
import type { Asset } from '@/pages/admin/supply-chain/assets/types';

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const assetsKeys = {
  all: ['assets'] as const,
  lists: () => [...assetsKeys.all, 'list'] as const,
  list: (filters?: AssetFilters) => [...assetsKeys.lists(), filters] as const,
  details: () => [...assetsKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetsKeys.details(), id] as const,
  metrics: () => [...assetsKeys.all, 'metrics'] as const,
};

export interface AssetFilters {
  search?: string;
  status?: 'all' | Asset['status'];
  category?: string;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all assets
 */
export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: assetsKeys.list(filters),
    queryFn: async () => {
      logger.info('useAssets', 'Fetching assets', { filters });
      
      let query = supabase
        .from('assets')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,asset_code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('useAssets', 'Failed to fetch assets', error);
        throw error;
      }

      logger.info('useAssets', 'Assets fetched successfully', { count: data.length });
      return data as Asset[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Fetch single asset by ID
 */
export function useAssetById(id: string) {
  return useQuery({
    queryKey: assetsKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('useAssetById', 'Failed to fetch asset', { id, error });
        throw error;
      }

      return data as Asset;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch asset metrics
 */
export function useAssetMetrics() {
  return useQuery({
    queryKey: assetsKeys.metrics(),
    queryFn: async () => {
      logger.info('useAssetMetrics', 'Fetching asset metrics');
      
      const { data: assets, error } = await supabase
        .from('assets')
        .select('*');

      if (error) {
        logger.error('useAssetMetrics', 'Failed to fetch metrics', error);
        throw error;
      }

      const totalAssets = assets.length;
      const availableAssets = assets.filter(a => a.status === 'available').length;
      const inUseAssets = assets.filter(a => a.status === 'in_use').length;
      const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;
      const totalValue = assets.reduce((sum, a) => sum + (a.purchase_price || 0), 0);

      const metrics = {
        totalAssets,
        availableAssets,
        inUseAssets,
        maintenanceAssets,
        totalValue,
        utilizationRate: totalAssets > 0 ? (inUseAssets / totalAssets) * 100 : 0,
      };

      logger.info('useAssetMetrics', 'Metrics calculated', metrics);
      return metrics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new asset
 */
export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
      logger.info('useCreateAsset', 'Creating asset', { name: data.name });
      
      const { data: created, error } = await supabase
        .from('assets')
        .insert([data])
        .select()
        .single();

      if (error) {
        logger.error('useCreateAsset', 'Creation failed', error);
        throw error;
      }

      return created as Asset;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetsKeys.metrics() });
      notify.success(`Asset ${data.name} created successfully`);
      logger.info('useCreateAsset', 'Asset created', { id: data.id });
    },
    onError: (error: Error) => {
      notify.error('Failed to create asset');
      logger.error('useCreateAsset', 'Creation failed', error);
    },
  });
}

/**
 * Update asset
 */
export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Asset> }) => {
      logger.info('useUpdateAsset', 'Updating asset', { id });
      
      const { data: updated, error } = await supabase
        .from('assets')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('useUpdateAsset', 'Update failed', error);
        throw error;
      }

      return updated as Asset;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: assetsKeys.detail(id) });
      const previousAsset = queryClient.getQueryData<Asset>(assetsKeys.detail(id));

      if (previousAsset) {
        queryClient.setQueryData<Asset>(assetsKeys.detail(id), {
          ...previousAsset,
          ...data,
        });
      }

      return { previousAsset };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousAsset) {
        queryClient.setQueryData(assetsKeys.detail(id), context.previousAsset);
      }
      notify.error('Failed to update asset');
      logger.error('useUpdateAsset', 'Update failed', error);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetsKeys.metrics() });
    },
    onSuccess: (data) => {
      notify.success('Asset updated successfully');
      logger.info('useUpdateAsset', 'Asset updated', { id: data.id });
    },
  });
}

/**
 * Delete asset
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info('useDeleteAsset', 'Deleting asset', { id });
      
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('useDeleteAsset', 'Deletion failed', error);
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetsKeys.metrics() });
      queryClient.removeQueries({ queryKey: assetsKeys.detail(id) });
      notify.success('Asset deleted successfully');
      logger.info('useDeleteAsset', 'Asset deleted', { id });
    },
    onError: (error: Error) => {
      notify.error('Failed to delete asset');
      logger.error('useDeleteAsset', 'Deletion failed', error);
    },
  });
}
