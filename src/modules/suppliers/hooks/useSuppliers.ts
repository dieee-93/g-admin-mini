/**
 * Suppliers TanStack Query Hooks
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
import type { Supplier } from '@/pages/admin/supply-chain/suppliers/types/supplierTypes';

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const suppliersKeys = {
  all: ['suppliers'] as const,
  lists: () => [...suppliersKeys.all, 'list'] as const,
  list: (filters?: SupplierFilters) => [...suppliersKeys.lists(), filters] as const,
  details: () => [...suppliersKeys.all, 'detail'] as const,
  detail: (id: string) => [...suppliersKeys.details(), id] as const,
};

export interface SupplierFilters {
  status?: 'all' | 'active' | 'inactive';
  search?: string;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all suppliers
 */
export function useSuppliers(filters?: SupplierFilters) {
  return useQuery({
    queryKey: suppliersKeys.list(filters),
    queryFn: async () => {
      logger.info('useSuppliers', 'Fetching suppliers', { filters });
      
      let query = supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.status === 'active') {
        query = query.eq('is_active', true);
      } else if (filters?.status === 'inactive') {
        query = query.eq('is_active', false);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('useSuppliers', 'Failed to fetch suppliers', error);
        throw error;
      }

      logger.info('useSuppliers', 'Suppliers fetched successfully', { count: data.length });
      return data as Supplier[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Fetch single supplier by ID
 */
export function useSupplierById(id: string) {
  return useQuery({
    queryKey: suppliersKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('useSupplierById', 'Failed to fetch supplier', { id, error });
        throw error;
      }

      return data as Supplier;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get active suppliers only
 */
export function useActiveSuppliers() {
  return useSuppliers({ status: 'active' });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new supplier
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      logger.info('useCreateSupplier', 'Creating supplier', { name: data.name });
      
      const { data: newSupplier, error } = await supabase
        .from('suppliers')
        .insert([data])
        .select()
        .single();

      if (error) {
        logger.error('useCreateSupplier', 'Creation failed', error);
        throw error;
      }

      return newSupplier as Supplier;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() });
      notify.success(`Supplier ${data.name} created successfully`);
      logger.info('useCreateSupplier', 'Supplier created', { id: data.id });
    },
    onError: (error: Error) => {
      notify.error('Failed to create supplier');
      logger.error('useCreateSupplier', 'Creation failed', error);
    },
  });
}

/**
 * Update supplier
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
      logger.info('useUpdateSupplier', 'Updating supplier', { id });
      
      const { data: updated, error } = await supabase
        .from('suppliers')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('useUpdateSupplier', 'Update failed', error);
        throw error;
      }

      return updated as Supplier;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: suppliersKeys.detail(id) });
      const previousSupplier = queryClient.getQueryData<Supplier>(suppliersKeys.detail(id));

      if (previousSupplier) {
        queryClient.setQueryData<Supplier>(suppliersKeys.detail(id), {
          ...previousSupplier,
          ...data,
        });
      }

      return { previousSupplier };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousSupplier) {
        queryClient.setQueryData(suppliersKeys.detail(id), context.previousSupplier);
      }
      notify.error('Failed to update supplier');
      logger.error('useUpdateSupplier', 'Update failed', error);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: suppliersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() });
    },
    onSuccess: (data) => {
      notify.success('Supplier updated successfully');
      logger.info('useUpdateSupplier', 'Supplier updated', { id: data.id });
    },
  });
}

/**
 * Delete supplier
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info('useDeleteSupplier', 'Deleting supplier', { id });
      
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('useDeleteSupplier', 'Deletion failed', error);
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() });
      queryClient.removeQueries({ queryKey: suppliersKeys.detail(id) });
      notify.success('Supplier deleted successfully');
      logger.info('useDeleteSupplier', 'Supplier deleted', { id });
    },
    onError: (error: Error) => {
      notify.error('Failed to delete supplier');
      logger.error('useDeleteSupplier', 'Deletion failed', error);
    },
  });
}
