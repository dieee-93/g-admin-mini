/**
 * Production Equipment TanStack Query Hooks
 *
 * Following Assets Module pattern
 * Clean implementation for production equipment with costing
 *
 * @see src/modules/assets/hooks/useAssets.ts - Reference pattern
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';
import type {
  ProductionEquipment,
  CreateEquipmentInput,
  UpdateEquipmentInput,
  EquipmentMetrics,
  EquipmentCostBreakdown
} from '../types';

// ============================================
// QUERY KEYS FACTORY
// ============================================

export const equipmentKeys = {
  all: ['production-equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (filters?: EquipmentFilters) => [...equipmentKeys.lists(), filters] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
  metrics: () => [...equipmentKeys.all, 'metrics'] as const,
  breakdown: (id: string) => [...equipmentKeys.all, 'breakdown', id] as const,
};

export interface EquipmentFilters {
  search?: string;
  status?: 'all' | ProductionEquipment['status'];
  equipment_type?: string;
  location?: string;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all production equipment
 */
export function useEquipment(filters?: EquipmentFilters) {
  return useQuery({
    queryKey: equipmentKeys.list(filters),
    queryFn: async () => {
      logger.info('useEquipment', 'Fetching equipment', { filters });

      let query = supabase
        .from('production_equipment')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.equipment_type) {
        query = query.eq('equipment_type', filters.equipment_type);
      }

      if (filters?.location) {
        query = query.eq('location', filters.location);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('useEquipment', 'Failed to fetch equipment', error);
        throw error;
      }

      logger.info('useEquipment', 'Equipment fetched successfully', { count: data.length });
      return data as ProductionEquipment[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Fetch available equipment (for selectors)
 */
export function useAvailableEquipment() {
  return useQuery({
    queryKey: equipmentKeys.list({ status: 'available' }),
    queryFn: async () => {
      logger.info('useAvailableEquipment', 'Fetching available equipment');

      const { data, error } = await supabase
        .from('production_equipment')
        .select('*')
        .eq('status', 'available')
        .order('name', { ascending: true });

      if (error) {
        logger.error('useAvailableEquipment', 'Failed to fetch', error);
        throw error;
      }

      return data as ProductionEquipment[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch single equipment by ID
 */
export function useEquipmentById(id: string) {
  return useQuery({
    queryKey: equipmentKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('useEquipmentById', 'Failed to fetch equipment', { id, error });
        throw error;
      }

      return data as ProductionEquipment;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch equipment cost breakdown
 */
export function useEquipmentCostBreakdown(id: string) {
  return useQuery({
    queryKey: equipmentKeys.breakdown(id),
    queryFn: async () => {
      logger.info('useEquipmentCostBreakdown', 'Fetching cost breakdown', { id });

      const { data, error } = await supabase
        .rpc('get_equipment_cost_breakdown', { p_equipment_id: id })
        .single();

      if (error) {
        logger.error('useEquipmentCostBreakdown', 'Failed to fetch breakdown', error);
        throw error;
      }

      return data as EquipmentCostBreakdown;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes (cost breakdown doesn't change often)
  });
}

/**
 * Fetch equipment metrics
 */
export function useEquipmentMetrics() {
  return useQuery({
    queryKey: equipmentKeys.metrics(),
    queryFn: async () => {
      logger.info('useEquipmentMetrics', 'Fetching equipment metrics');

      const { data, error } = await supabase
        .rpc('get_equipment_metrics');

      if (error) {
        logger.error('useEquipmentMetrics', 'Failed to fetch metrics', error);
        throw error;
      }

      return data as EquipmentMetrics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create new equipment
 */
export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEquipmentInput) => {
      logger.info('useCreateEquipment', 'Creating equipment', { name: input.name });

      const { data: created, error } = await supabase
        .from('production_equipment')
        .insert([{
          name: input.name,
          code: input.code,
          description: input.description,
          equipment_type: input.equipment_type,

          // Financial
          purchase_price: input.purchase_price,
          purchase_date: input.purchase_date,
          useful_life_years: input.useful_life_years,
          salvage_value: input.salvage_value ?? 0,

          // Costing
          estimated_annual_hours: input.estimated_annual_hours ?? 2000,
          auto_calculate_rate: input.auto_calculate_rate ?? true,
          maintenance_cost_percentage: input.maintenance_cost_percentage ?? 5.00,
          energy_cost_per_hour: input.energy_cost_per_hour ?? 0,
          consumables_cost_per_hour: input.consumables_cost_per_hour ?? 0,
          insurance_cost_annual: input.insurance_cost_annual ?? 0,
          overhead_cost_per_hour: input.overhead_cost_per_hour ?? 0,

          // Operational
          location: input.location,
          assigned_to: input.assigned_to,

          // Maintenance
          maintenance_interval_days: input.maintenance_interval_days ?? 90,

          // Metadata
          notes: input.notes,
          tags: input.tags,
        }])
        .select()
        .single();

      if (error) {
        logger.error('useCreateEquipment', 'Creation failed', error);
        throw error;
      }

      return created as ProductionEquipment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.metrics() });
      notify.success(`Equipment ${data.name} created successfully`);
      logger.info('useCreateEquipment', 'Equipment created', { id: data.id, rate: data.hourly_cost_rate });
    },
    onError: (error: Error) => {
      notify.error('Failed to create equipment');
      logger.error('useCreateEquipment', 'Creation failed', error);
    },
  });
}

/**
 * Update equipment
 */
export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateEquipmentInput) => {
      logger.info('useUpdateEquipment', 'Updating equipment', { id });

      const { data: updated, error } = await supabase
        .from('production_equipment')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('useUpdateEquipment', 'Update failed', error);
        throw error;
      }

      return updated as ProductionEquipment;
    },
    onMutate: async ({ id, ...data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: equipmentKeys.detail(id) });
      const previousEquipment = queryClient.getQueryData<ProductionEquipment>(equipmentKeys.detail(id));

      if (previousEquipment) {
        queryClient.setQueryData<ProductionEquipment>(equipmentKeys.detail(id), {
          ...previousEquipment,
          ...data,
        });
      }

      return { previousEquipment };
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousEquipment) {
        queryClient.setQueryData(equipmentKeys.detail(id), context.previousEquipment);
      }
      notify.error('Failed to update equipment');
      logger.error('useUpdateEquipment', 'Update failed', error);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.metrics() });
    },
    onSuccess: (data) => {
      notify.success('Equipment updated successfully');
      logger.info('useUpdateEquipment', 'Equipment updated', { id: data.id, rate: data.hourly_cost_rate });
    },
  });
}

/**
 * Delete equipment (soft delete - set status to retired)
 */
export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.info('useDeleteEquipment', 'Retiring equipment', { id });

      const { error } = await supabase
        .from('production_equipment')
        .update({
          status: 'retired',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        logger.error('useDeleteEquipment', 'Deletion failed', error);
        throw error;
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.metrics() });
      queryClient.removeQueries({ queryKey: equipmentKeys.detail(id) });
      notify.success('Equipment retired successfully');
      logger.info('useDeleteEquipment', 'Equipment retired', { id });
    },
    onError: (error: Error) => {
      notify.error('Failed to retire equipment');
      logger.error('useDeleteEquipment', 'Deletion failed', error);
    },
  });
}

/**
 * Record equipment usage (increment hours)
 */
export function useRecordEquipmentUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ equipmentId, hours }: { equipmentId: string; hours: number }) => {
      logger.info('useRecordEquipmentUsage', 'Recording usage', { equipmentId, hours });

      const { error } = await supabase
        .rpc('increment_equipment_hours', {
          p_equipment_id: equipmentId,
          p_hours: hours
        });

      if (error) {
        logger.error('useRecordEquipmentUsage', 'Failed to record usage', error);
        throw error;
      }

      return { equipmentId, hours };
    },
    onSuccess: ({ equipmentId, hours }) => {
      queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(equipmentId) });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.metrics() });
      logger.info('useRecordEquipmentUsage', 'Usage recorded', { equipmentId, hours });
    },
    onError: (error: Error) => {
      notify.error('Failed to record equipment usage');
      logger.error('useRecordEquipmentUsage', 'Recording failed', error);
    },
  });
}
