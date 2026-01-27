/**
 * Materials Query Keys Factory
 * 
 * Hierarchical query keys for TanStack Query cache management.
 * Follows TanStack Query best practices for cache invalidation.
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 * @module materials/hooks
 */

import type { MaterialsFilters } from '@/modules/materials/store/materialsStore';

/**
 * Query keys factory for materials module
 * 
 * Hierarchy:
 * - ['materials'] - All materials queries
 * - ['materials', 'list'] - All list queries
 * - ['materials', 'list', filters] - Specific filtered list
 * - ['materials', 'detail'] - All detail queries
 * - ['materials', 'detail', id] - Specific item detail
 * - ['materials', 'abc-analysis'] - ABC analysis
 * - ['materials', 'stats'] - Statistics
 * 
 * Usage:
 * ```typescript
 * // Invalidate all materials queries
 * queryClient.invalidateQueries({ queryKey: materialsKeys.all });
 * 
 * // Invalidate all list queries
 * queryClient.invalidateQueries({ queryKey: materialsKeys.lists() });
 * 
 * // Invalidate specific filtered list
 * queryClient.invalidateQueries({ queryKey: materialsKeys.list(filters) });
 * 
 * // Invalidate specific item
 * queryClient.invalidateQueries({ queryKey: materialsKeys.detail(id) });
 * ```
 */
export const materialsKeys = {
  /**
   * Base key for all materials queries
   */
  all: ['materials'] as const,
  
  /**
   * All list queries (any filters)
   */
  lists: () => [...materialsKeys.all, 'list'] as const,
  
  /**
   * Specific list query with filters
   */
  list: (filters?: MaterialsFilters) => [...materialsKeys.lists(), filters] as const,
  
  /**
   * All detail queries (any id)
   */
  details: () => [...materialsKeys.all, 'detail'] as const,
  
  /**
   * Specific item detail query
   */
  detail: (id: string) => [...materialsKeys.details(), id] as const,
  
  /**
   * ABC analysis query
   */
  abc: () => [...materialsKeys.all, 'abc-analysis'] as const,
  
  /**
   * ABC analysis with specific config
   */
  abcAnalysis: (config?: unknown) => [...materialsKeys.abc(), config] as const,
  
  /**
   * Statistics query
   */
  stats: () => [...materialsKeys.all, 'stats'] as const,
};
