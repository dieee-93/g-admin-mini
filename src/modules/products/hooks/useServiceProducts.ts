/**
 * Service Products - TanStack Query Hooks
 * Hook layer for SERVICE type products following clean architecture
 * 
 * Pattern: Following useProducts.ts standards
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 */

import { useQuery } from '@tanstack/react-query';
import { logger } from '@/lib/logging';
import { productsKeys } from './useProducts';
import * as serviceApi from '../services/productServiceApi';

// ============================================
// QUERY KEYS
// ============================================

export const serviceProductsKeys = {
  all: [...productsKeys.all, 'services'] as const,
  list: (orgId?: string) => [...serviceProductsKeys.all, 'list', orgId] as const,
  count: (orgId?: string) => [...serviceProductsKeys.all, 'count', orgId] as const,
} as const;

// ============================================
// QUERIES
// ============================================

/**
 * Fetch all SERVICE type products for current organization
 * Uses standard products pattern but filtered to services
 * 
 * NOTE: organizationId is passed directly as parameter, not from user context
 */
export function useServiceProducts(organizationId?: string) {
  return useQuery({
    queryKey: serviceProductsKeys.list(organizationId),
    queryFn: async () => {
      if (!organizationId) {
        logger.warn('Products', 'No organization ID provided for service products query');
        return [];
      }
      
      logger.debug('Products', 'Fetching service products', { organizationId });
      return await serviceApi.fetchServiceProducts(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Count SERVICE type products for current organization
 * Useful for metrics/dashboard
 */
export function useServiceProductsCount(organizationId?: string) {
  return useQuery({
    queryKey: serviceProductsKeys.count(organizationId),
    queryFn: async () => {
      if (!organizationId) return 0;
      
      logger.debug('Products', 'Counting service products', { organizationId });
      return await serviceApi.countServiceProducts(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * NOTE: For creating/updating/deleting services, use the generic hooks:
 * - useCreateProduct() with { type: 'SERVICE' }
 * - useUpdateProduct()
 * - useDeleteProduct()
 * 
 * This keeps the architecture clean and avoids duplication
 */
