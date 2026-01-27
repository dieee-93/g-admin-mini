/**
 * Products Module - TanStack Query Hooks
 * Server state management for products data
 * 
 * Pattern: Following Cash Module architecture
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthUser } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import * as productApi from '@/pages/admin/supply-chain/products/services/productApi';
import type { 
  ProductWithIntelligence,
  CreateProductData,
  UpdateProductData 
} from '@/pages/admin/supply-chain/products/types';

// ============================================
// QUERY KEYS
// ============================================

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters?: string) => [...productsKeys.lists(), { filters }] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  withRecipes: () => [...productsKeys.all, 'with-recipes'] as const,
  byType: (type: string) => [...productsKeys.all, 'by-type', type] as const,
  intelligence: () => [...productsKeys.all, 'intelligence'] as const,
  cost: (id: string) => [...productsKeys.all, 'cost', id] as const,
  availability: (id: string) => [...productsKeys.all, 'availability', id] as const,
} as const;

// ============================================
// QUERIES
// ============================================

/**
 * Fetch all products with intelligence features
 * (cost calculation, availability, components count)
 */
export function useProducts() {
  return useQuery({
    queryKey: productsKeys.intelligence(),
    queryFn: async () => {
      logger.debug('Products', 'Fetching products with intelligence');
      return await productApi.fetchProductsWithIntelligence();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: productsKeys.detail(productId || ''),
    queryFn: async () => {
      if (!productId) return null;
      const products = await productApi.fetchProductsWithIntelligence();
      return products.find(p => p.id === productId) || null;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch products with recipes (for cost analysis)
 */
export function useProductsWithRecipes() {
  return useQuery({
    queryKey: productsKeys.withRecipes(),
    queryFn: async () => {
      logger.debug('Products', 'Fetching products with recipes');
      const products = await productApi.fetchProductsWithIntelligence();
      return products.filter(p => p.components_count && p.components_count > 0);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch products by type
 */
export function useProductsByType(type: string | undefined) {
  return useQuery({
    queryKey: productsKeys.byType(type || 'all'),
    queryFn: async () => {
      if (!type) return [];
      const products = await productApi.fetchProductsWithIntelligence();
      return products.filter(p => p.type === type);
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get product cost (real-time calculation)
 */
export function useProductCost(productId: string | undefined) {
  return useQuery({
    queryKey: productsKeys.cost(productId || ''),
    queryFn: async () => {
      if (!productId) return 0;
      return await productApi.getProductCost(productId);
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes (costs can change frequently)
  });
}

/**
 * Get product availability (real-time calculation)
 */
export function useProductAvailability(productId: string | undefined) {
  return useQuery({
    queryKey: productsKeys.availability(productId || ''),
    queryFn: async () => {
      if (!productId) return 0;
      return await productApi.getProductAvailability(productId);
    },
    enabled: !!productId,
    staleTime: 1 * 60 * 1000, // 1 minute (availability changes frequently)
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      if (!user) throw new Error('User not authenticated');
      logger.info('Products', 'Creating product', { name: data.name });
      return await productApi.createProduct(data, user as AuthUser);
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      
      notify.success({
        title: 'Producto creado',
        description: `${newProduct.name} ha sido creado exitosamente`,
      });

      logger.info('Products', 'Product created successfully', { 
        productId: newProduct.id 
      });
    },
    onError: (error) => {
      notify.error({
        title: 'Error al crear producto',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });

      logger.error('Products', 'Failed to create product', error);
    },
  });
}

/**
 * Update an existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateProductData) => {
      if (!user) throw new Error('User not authenticated');
      logger.info('Products', 'Updating product', { productId: data.id });
      return await productApi.updateProduct(data, user as AuthUser);
    },
    onMutate: async (updatedProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productsKeys.all });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<ProductWithIntelligence[]>(
        productsKeys.intelligence()
      );

      // Optimistically update
      if (previousProducts) {
        queryClient.setQueryData<ProductWithIntelligence[]>(
          productsKeys.intelligence(),
          previousProducts.map(p => 
            p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
          )
        );
      }

      return { previousProducts };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          productsKeys.intelligence(),
          context.previousProducts
        );
      }

      notify.error({
        title: 'Error al actualizar producto',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });

      logger.error('Products', 'Failed to update product', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}

/**
 * Delete a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('User not authenticated');
      logger.info('Products', 'Deleting product', { productId });
      return await productApi.deleteProduct(productId, user as AuthUser);
    },
    onSuccess: (_data, productId) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });

      notify.success({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado exitosamente',
      });

      logger.info('Products', 'Product deleted successfully', { productId });
    },
    onError: (error) => {
      notify.error({
        title: 'Error al eliminar producto',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });

      logger.error('Products', 'Failed to delete product', error);
    },
  });
}

/**
 * Toggle product published status
 */
export function useToggleProductPublish() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, isPublished }: { 
      productId: string; 
      isPublished: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      return await productApi.updateProduct(
        { id: productId, is_published: isPublished },
        user as AuthUser
      );
    },
    onMutate: async ({ productId, isPublished }) => {
      await queryClient.cancelQueries({ queryKey: productsKeys.all });

      const previousProducts = queryClient.getQueryData<ProductWithIntelligence[]>(
        productsKeys.intelligence()
      );

      if (previousProducts) {
        queryClient.setQueryData<ProductWithIntelligence[]>(
          productsKeys.intelligence(),
          previousProducts.map(p => 
            p.id === productId ? { ...p, is_published: isPublished } : p
          )
        );
      }

      return { previousProducts };
    },
    onError: (error, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          productsKeys.intelligence(),
          context.previousProducts
        );
      }

      notify.error({
        title: 'Error al cambiar estado',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}
