/**
 * useAdjustStock Hook
 * 
 * TanStack Query mutation for stock adjustments.
 * Reuses existing inventoryApi.updateStock() service.
 * 
 * Features:
 * - Stock increase/decrease with validation
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation
 * - Success/error notifications
 * - EventBus emissions (handled by service)
 * 
 * @module materials/hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/lib/notifications';
import { inventoryApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

export interface StockAdjustmentInput {
  materialId: string;
  newStock: number;
  oldStock?: number; // Optional - for optimistic updates
  reason?: string;
}

interface StockAdjustmentContext {
  previous?: MaterialItem;
}

/**
 * Adjust stock for a material
 * 
 * @example
 * ```typescript
 * function StockAdjustmentForm({ material }: { material: MaterialItem }) {
 *   const adjustStock = useAdjustStock();
 *   
 *   const handleAdjust = async (newStock: number) => {
 *     await adjustStock.mutateAsync({
 *       materialId: material.id,
 *       newStock,
 *       oldStock: material.stock,
 *       reason: 'Manual adjustment'
 *     });
 *   };
 *   
 *   return <StockInput onSubmit={handleAdjust} />;
 * }
 * ```
 * 
 * @returns TanStack Query mutation result
 */
export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation<MaterialItem, Error, StockAdjustmentInput, StockAdjustmentContext>({
    mutationFn: async ({ materialId, newStock, oldStock }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // ✅ REUSE existing inventoryApi.updateStock()
      // This already handles:
      // - Permissions check via requirePermission()
      // - EventBus emission (materials.stock_updated)
      // - Logging
      // - Cache invalidation
      return inventoryApi.updateStock(materialId, newStock, user, oldStock);
    },
    onMutate: async ({ materialId, newStock }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: materialsKeys.detail(materialId) });
      
      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<MaterialItem>(
        materialsKeys.detail(materialId)
      );
      
      // Optimistically update stock
      if (previous) {
        queryClient.setQueryData<MaterialItem>(
          materialsKeys.detail(materialId),
          { ...previous, stock: newStock }
        );
      }
      
      return { previous };
    },
    onError: (error, { materialId }, context) => {
      // Rollback optimistic update
      if (context?.previous) {
        queryClient.setQueryData(materialsKeys.detail(materialId), context.previous);
      }
      
      notify.error({
        title: 'Error al ajustar stock',
        description: error.message,
      });
    },
    onSuccess: (data, { newStock, oldStock }) => {
      const delta = oldStock !== undefined ? newStock - oldStock : newStock;
      const action = delta > 0 ? 'agregado' : delta < 0 ? 'reducido' : 'ajustado';
      
      notify.success({
        title: 'Stock ajustado',
        description: `Stock ${action}: ${data.name} (${newStock} ${data.unit || 'unidades'})`,
      });
    },
    onSettled: (data, error, { materialId }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: materialsKeys.detail(materialId) });
      queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
    },
  });
}
