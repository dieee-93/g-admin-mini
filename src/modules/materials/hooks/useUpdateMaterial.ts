/**
 * useUpdateMaterial Hook
 * 
 * TanStack Query mutation for updating materials.
 * Reuses existing inventoryApi.updateItem() service.
 * 
 * Features:
 * - Optimistic updates
 * - Automatic rollback on error
 * - Cache invalidation on success
 * - Success/error notifications
 * 
 * @module materials/hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/lib/notifications';
import { inventoryApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

interface UpdateMaterialInput {
  id: string;
  data: Partial<MaterialItem>;
}

interface UpdateMaterialContext {
  previous?: MaterialItem;
}

/**
 * Update existing material
 * 
 * @example
 * ```typescript
 * function EditMaterialForm({ material }: { material: MaterialItem }) {
 *   const updateMaterial = useUpdateMaterial();
 *   
 *   const handleSubmit = async (data: Partial<MaterialItem>) => {
 *     await updateMaterial.mutateAsync({ id: material.id, data });
 *     onClose();
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>{/* fields *\/}</form>;
 * }
 * ```
 * 
 * @returns TanStack Query mutation result
 */
export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<MaterialItem, Error, UpdateMaterialInput, UpdateMaterialContext>({
    mutationFn: async ({ id, data }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing inventoryApi.updateItem()
      return inventoryApi.updateItem(id, data, user);
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches (so they don't overwrite optimistic update)
      await queryClient.cancelQueries({ queryKey: materialsKeys.detail(id) });
      
      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<MaterialItem>(
        materialsKeys.detail(id)
      );
      
      // Optimistically update detail query
      if (previous) {
        queryClient.setQueryData<MaterialItem>(
          materialsKeys.detail(id),
          { ...previous, ...data }
        );
      }
      
      // Return context for rollback
      return { previous };
    },
    onError: (error, { id }, context) => {
      // Rollback optimistic update on error
      if (context?.previous) {
        queryClient.setQueryData(materialsKeys.detail(id), context.previous);
      }
      
      notify.error({
        title: 'Error al actualizar material',
        description: error.message,
      });
    },
    onSuccess: (data) => {
      notify.success({
        title: 'Material actualizado',
        description: `${data.name} ha sido actualizado exitosamente`,
      });
    },
    onSettled: (data, error, { id }) => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: materialsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
    },
  });
}
