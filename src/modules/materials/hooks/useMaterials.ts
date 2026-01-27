/**
 * useMaterials Hook
 * 
 * TanStack Query hook for fetching materials list with filters.
 * Reuses existing materialsApi.fetchItems() service.
 * 
 * Features:
 * - Automatic caching (2 min stale time)
 * - Client-side filtering from Zustand store
 * - Automatic refetch on window focus
 * - Optimistic updates via mutations
 * 
 * @module materials/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { materialsApi } from '@/modules/materials/services';
import { useMaterialsStore } from '@/modules/materials/store';
import { materialsKeys } from './queryKeys';
import type { MaterialItem } from '@/modules/materials/types';

/**
 * Fetch materials list with filters from Zustand store
 * 
 * @example
 * ```typescript
 * function MaterialsList() {
 *   const { data: materials, isLoading, error } = useMaterials();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Alert status="error">{error.message}</Alert>;
 *   
 *   return materials.map(m => <MaterialCard key={m.id} material={m} />);
 * }
 * ```
 * 
 * @returns TanStack Query result with materials array
 */
export function useMaterials() {
  // Get filters from Zustand store (UI state)
  const filters = useMaterialsStore((state) => state.filters);
  
  return useQuery<MaterialItem[], Error>({
    queryKey: materialsKeys.list(filters),
    queryFn: async () => {
      // ✅ REUSE existing materialsApi.fetchItems()
      // This already handles: normalization, error logging, permissions (via RLS)
      const allItems = await materialsApi.fetchItems();
      
      // Apply client-side filters
      let filtered = allItems;
      
      // Search term filter
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Category filter
      if (filters.category) {
        filtered = filtered.filter(item => item.category === filters.category);
      }
      
      // Type filter
      if (filters.type) {
        filtered = filtered.filter(item => item.type === filters.type);
      }
      
      // Supplier filter
      if (filters.supplier) {
        filtered = filtered.filter(item => item.supplier_id === filters.supplier);
      }
      
      // Low stock filter (legacy boolean)
      if (filters.lowStockOnly) {
        filtered = filtered.filter(item => item.stock <= (item.min_stock || 0));
      }

      // Stock Status filter (new enum)
      if (filters.stockStatus && filters.stockStatus !== 'all') {
        filtered = filtered.filter(item => {
          const minStock = item.min_stock || 0;
          const stock = item.stock || 0;
          
          switch (filters.stockStatus) {
            case 'out':
              return stock <= 0;
            case 'critical':
              return stock > 0 && stock <= minStock * 0.5;
            case 'low':
              return stock > minStock * 0.5 && stock <= minStock;
            case 'ok':
              return stock > minStock;
            default:
              return true;
          }
        });
      }
      
      // Active only filter
      if (filters.activeOnly) {
        // Assuming materials have is_active field (or default to true)
        filtered = filtered.filter(item => item.is_active !== false);
      }
      
      // Apply sorting
      const sortBy = filters.sortBy;
      const sortOrder = filters.sortOrder;
      
      filtered = filtered.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        
        switch (sortBy) {
          case 'name':
            aVal = a.name || '';
            bVal = b.name || '';
            break;
          case 'stock':
            aVal = a.stock || 0;
            bVal = b.stock || 0;
            break;
          case 'value':
            aVal = (a.stock || 0) * (a.unit_cost || 0);
            bVal = (b.stock || 0) * (b.unit_cost || 0);
            break;
          case 'category':
            aVal = a.category || '';
            bVal = b.category || '';
            break;
          case 'supplier':
            aVal = a.supplier_id || '';
            bVal = b.supplier_id || '';
            break;
          default:
            aVal = a.name || '';
            bVal = b.name || '';
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
      
      return filtered;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - data considered fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cache garbage collection
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: 'always', // Always refetch when component mounts
  });
}
