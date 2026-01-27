/**
 * useDeleteMaterial Hook
 * 
 * TanStack Query mutation for deleting materials.
 * Reuses existing inventoryApi.deleteItem() service.
 * 
 * Features:
 * - Automatic cache invalidation
 * - Success/error notifications
 * - Cascade delete (via service layer)
 * 
 * @module materials/hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/lib/notifications';
import { inventoryApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';

/**
 * Delete material by ID
 * 
 * @example
 * ```typescript
 * function DeleteMaterialButton({ id, name }: { id: string; name: string }) {
 *   const deleteMaterial = useDeleteMaterial();
 *   
 *   const handleDelete = async () => {
 *     if (confirm(`¿Eliminar ${name}?`)) {
 *       await deleteMaterial.mutateAsync(id);
 *     }
 *   };
 *   
 *   return (
 *     <Button
 *       onClick={handleDelete}
 *       loading={deleteMaterial.isPending}
 *       colorScheme="red"
 *     >
 *       Eliminar
 *     </Button>
 *   );
 * }
 * ```
 * 
 * @returns TanStack Query mutation result
 */
export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing inventoryApi.deleteItem()
      // This already handles cascade delete (stock_entries, etc.)
      await inventoryApi.deleteItem(id, user);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: materialsKeys.detail(id) });
      
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      notify.success({
        title: 'Material eliminado',
        description: 'El material ha sido eliminado exitosamente',
      });
    },
    onError: (error) => {
      notify.error({
        title: 'Error al eliminar material',
        description: error.message,
      });
    },
  });
}
