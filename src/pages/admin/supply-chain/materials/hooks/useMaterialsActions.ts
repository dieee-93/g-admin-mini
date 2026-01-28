/**
 * useMaterialsActions Hook
 * 
 * ⚠️ COMPATIBILITY LAYER - Temporary adapter for legacy components
 * 
 * This hook provides a compatibility layer between OLD zustand patterns
 * and NEW TanStack Query mutations. This allows legacy components to work
 * while we migrate them to use TanStack Query directly.
 * 
 * TODO: Migrate all consumers to use TanStack Query hooks directly:
 * - useCreateMaterial() instead of addItem()
 * - useUpdateMaterial() instead of updateItem()
 * - useDeleteMaterial() instead of deleteItem()
 * 
 * @deprecated Use TanStack Query hooks from @/modules/materials/hooks instead
 */

import { useCallback } from 'react';
import { useCreateMaterial, useUpdateMaterial, useDeleteMaterial } from '@/modules/materials/hooks';
import type { ItemFormData, MaterialItem } from '@/modules/materials/types';

export function useMaterialsActions() {
  const createMaterialMutation = useCreateMaterial();
  const updateMaterialMutation = useUpdateMaterial();
  const deleteMaterialMutation = useDeleteMaterial();

  // Compatibility adapters to match old API
  const addItem = useCallback(
    async (data: ItemFormData) => {
      console.log('🔧 [useMaterialsActions] addItem called with:', data);
      try {
        const result = await createMaterialMutation.mutateAsync(data);
        console.log('✅ [useMaterialsActions] addItem success:', result);
        return result;
      } catch (error) {
        console.error('❌ [useMaterialsActions] addItem error:', error);
        throw error;
      }
    },
    [createMaterialMutation]
  );

  const updateItem = useCallback(
    async (id: string, data: Partial<MaterialItem>) => {
      console.log('🔧 [useMaterialsActions] updateItem called:', { id, data });
      try {
        const result = await updateMaterialMutation.mutateAsync({ id, data });
        console.log('✅ [useMaterialsActions] updateItem success:', result);
        return result;
      } catch (error) {
        console.error('❌ [useMaterialsActions] updateItem error:', error);
        throw error;
      }
    },
    [updateMaterialMutation]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      return deleteMaterialMutation.mutateAsync(id);
    },
    [deleteMaterialMutation]
  );

  // Stub functions (not implemented in TanStack Query yet)
  const setItems = useCallback(() => {
    console.warn('setItems is deprecated - TanStack Query manages cache automatically');
  }, []);

  const bulkUpdateStock = useCallback(() => {
    console.warn('bulkUpdateStock is deprecated - use useBulkAdjustStock() instead');
  }, []);

  const refreshStats = useCallback(() => {
    console.warn('refreshStats is deprecated - TanStack Query auto-refetches');
  }, []);

  const setLoading = useCallback(() => {
    console.warn('setLoading is deprecated - use mutation.isPending instead');
  }, []);

  const setError = useCallback(() => {
    console.warn('setError is deprecated - use mutation.error instead');
  }, []);

  return {
    addItem,
    updateItem,
    deleteItem,
    setItems,
    bulkUpdateStock,
    refreshStats,
    setLoading,
    setError,
  };
}
