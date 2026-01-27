/**
 * useMaterial Hook
 * 
 * TanStack Query hook for fetching single material by ID.
 * Reuses existing materialsApi.getItem() service.
 * 
 * Features:
 * - Automatic caching (5 min stale time)
 * - Longer cache retention than list (10 min)
 * - Conditional execution (only if id provided)
 * 
 * @module materials/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { materialsApi } from '@/modules/materials/services';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

/**
 * Fetch single material by ID
 * 
 * @example
 * ```typescript
 * function MaterialDetail({ id }: { id: string }) {
 *   const { data: material, isLoading, error } = useMaterial(id);
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Alert status="error">{error.message}</Alert>;
 *   if (!material) return <Alert status="info">Material not found</Alert>;
 *   
 *   return <MaterialCard material={material} />;
 * }
 * ```
 * 
 * @param id - Material UUID
 * @returns TanStack Query result with material object
 */
export function useMaterial(id: string) {
  return useQuery<MaterialItem, Error>({
    queryKey: materialsKeys.detail(id),
    queryFn: () => materialsApi.getItem(id), // ✅ REUSE existing service
    staleTime: 5 * 60 * 1000, // 5 minutes - details don't change as often
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    enabled: !!id, // Only run if id is provided
    refetchOnWindowFocus: false, // Don't refetch on focus (details are stable)
  });
}
