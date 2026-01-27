/**
 * useBulkOperations Hook
 * 
 * TanStack Query mutations for bulk operations on materials.
 * Reuses existing BulkOperationsService.
 * 
 * Features:
 * - Bulk delete with cascade handling
 * - Bulk stock adjustments
 * - Bulk activate/deactivate
 * - Progress tracking for large batches
 * - Detailed error reporting
 * 
 * @module materials/hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/lib/notifications';
import { BulkOperationsService } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { BulkOperationResult, BulkStockAdjustment } from '@/pages/admin/supply-chain/materials/services/bulkOperationsService';

/**
 * Bulk delete materials
 * 
 * @example
 * ```typescript
 * function MaterialsTable() {
 *   const bulkDelete = useBulkDeleteMaterials();
 *   const [selectedIds, setSelectedIds] = useState<string[]>([]);
 *   
 *   const handleBulkDelete = async () => {
 *     if (confirm(`¿Eliminar ${selectedIds.length} materiales?`)) {
 *       await bulkDelete.mutateAsync(selectedIds);
 *       setSelectedIds([]);
 *     }
 *   };
 *   
 *   return <Button onClick={handleBulkDelete}>Eliminar seleccionados</Button>;
 * }
 * ```
 */
export function useBulkDeleteMaterials() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<BulkOperationResult, Error, string[]>({
    mutationFn: async (itemIds) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing BulkOperationsService.deleteItems()
      return BulkOperationsService.deleteItems(itemIds, false);
    },
    onSuccess: (result) => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      // Remove deleted items from cache
      result.success.forEach(id => {
        queryClient.removeQueries({ queryKey: materialsKeys.detail(id) });
      });
      
      notify.success({
        title: 'Eliminación completada',
        description: `${result.totalSucceeded} materiales eliminados. ${result.totalFailed > 0 ? `${result.totalFailed} fallidos.` : ''}`,
      });
      
      // Show errors if any failed
      if (result.totalFailed > 0) {
        notify.warning({
          title: 'Algunos materiales no se pudieron eliminar',
          description: result.failed.map(f => f.error).join(', '),
        });
      }
    },
    onError: (error) => {
      notify.error({
        title: 'Error en eliminación masiva',
        description: error.message,
      });
    },
  });
}

/**
 * Bulk adjust stock for multiple materials
 * 
 * @example
 * ```typescript
 * function BulkStockAdjustForm() {
 *   const bulkAdjust = useBulkAdjustStock();
 *   
 *   const handleAdjust = async (adjustments: BulkStockAdjustment[]) => {
 *     await bulkAdjust.mutateAsync(adjustments);
 *   };
 *   
 *   return <BulkAdjustmentForm onSubmit={handleAdjust} />;
 * }
 * ```
 */
export function useBulkAdjustStock() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<BulkOperationResult, Error, BulkStockAdjustment[]>({
    mutationFn: async (adjustments) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing BulkOperationsService.adjustStock()
      return BulkOperationsService.adjustStock(adjustments);
    },
    onSuccess: (result) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      // Invalidate detail queries for affected items
      result.success.forEach(id => {
        queryClient.invalidateQueries({ queryKey: materialsKeys.detail(id) });
      });
      
      notify.success({
        title: 'Ajuste de stock completado',
        description: `${result.totalSucceeded} materiales ajustados. ${result.totalFailed > 0 ? `${result.totalFailed} fallidos.` : ''}`,
      });
      
      // Show errors if any failed
      if (result.totalFailed > 0) {
        notify.warning({
          title: 'Algunos ajustes fallaron',
          description: result.failed.map(f => `${f.id}: ${f.error}`).join(', '),
        });
      }
    },
    onError: (error) => {
      notify.error({
        title: 'Error en ajuste masivo',
        description: error.message,
      });
    },
  });
}

/**
 * Bulk toggle active status
 * 
 * @example
 * ```typescript
 * function MaterialsTable() {
 *   const bulkToggle = useBulkToggleActive();
 *   
 *   const handleActivate = async (ids: string[]) => {
 *     await bulkToggle.mutateAsync({ itemIds: ids, isActive: true });
 *   };
 *   
 *   return <Button onClick={handleActivate}>Activar seleccionados</Button>;
 * }
 * ```
 */
export function useBulkToggleActive() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<BulkOperationResult, Error, { itemIds: string[]; isActive: boolean }>({
    mutationFn: async ({ itemIds, isActive }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing BulkOperationsService.toggleActive()
      return BulkOperationsService.toggleActive(itemIds, isActive);
    },
    onSuccess: (result, { isActive }) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
      
      // Invalidate detail queries for affected items
      result.success.forEach(id => {
        queryClient.invalidateQueries({ queryKey: materialsKeys.detail(id) });
      });
      
      const action = isActive ? 'activados' : 'desactivados';
      notify.success({
        title: `Materiales ${action}`,
        description: `${result.totalSucceeded} materiales ${action}. ${result.totalFailed > 0 ? `${result.totalFailed} fallidos.` : ''}`,
      });
      
      // Show errors if any failed
      if (result.totalFailed > 0) {
        notify.warning({
          title: 'Algunas operaciones fallaron',
          description: result.failed.map(f => f.error).join(', '),
        });
      }
    },
    onError: (error) => {
      notify.error({
        title: 'Error en operación masiva',
        description: error.message,
      });
    },
  });
}
