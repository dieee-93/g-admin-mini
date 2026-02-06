/**
 * useCreateMaterial Hook
 * 
 * TanStack Query mutation for creating materials.
 * Reuses existing inventoryApi.createMaterial() service.
 * 
 * Features:
 * - Automatic cache invalidation
 * - Success/error notifications via useAlerts
 * - EventBus emissions (handled by service)
 * - Permissions check (handled by service)
 * 
 * @module materials/hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/lib/notifications';
import { inventoryApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { ItemFormData, MaterialItem } from '@/modules/materials/types';

/**
 * Create new material
 * 
 * @example
 * ```typescript
 * function AddMaterialForm() {
 *   const createMaterial = useCreateMaterial();
 *   
 *   const handleSubmit = async (data: ItemFormData) => {
 *     await createMaterial.mutateAsync(data);
 *     onClose();
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {/* form fields *\/}
 *       <Button type="submit" loading={createMaterial.isPending}>
 *         Crear Material
 *       </Button>
 *     </form>
 *   );
 * }
 * ```
 * 
 * @returns TanStack Query mutation result
 */
export function useCreateMaterial() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<MaterialItem, Error, ItemFormData>({
    mutationFn: async (data) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing inventoryApi.createMaterial()
      // This already handles:
      // - Permissions check via requirePermission()
      // - EventBus emission (materials.material_created)
      // - Logging
      // - Cache invalidation (via invalidateMaterialsListCache)
      return inventoryApi.createMaterial(data, user);
    },
    onSuccess: (data) => {
      // Invalidate list queries to refetch with new item
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      if (data.name) {
        notify.itemCreated(data.name);
      } else {
        notify.success({ title: 'Material creado' });
      }
    },
    onError: (error) => {
      notify.error({
        title: 'Error al crear material',
        description: error.message,
      });
    },
  });
}
