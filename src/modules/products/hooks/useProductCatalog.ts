/**
 * PRODUCT CATALOG SETTINGS HOOKS
 * 
 * TanStack Query hooks for product_catalog_settings table
 * Provides queries and mutations with optimistic updates
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productCatalogApi from '@/pages/admin/supply-chain/products/services/productCatalogApi';
import type {
  ProductCatalogSettings,
  ProductCatalogSettingsUpdate,
} from '@/pages/admin/supply-chain/products/services/productCatalogApi';
import { notify } from '@/shared/alerts';
import { logger } from '@/lib/logging';

// ============================================
// QUERY KEYS
// ============================================

export const productCatalogKeys = {
  all: ['product-catalog'] as const,
  settings: () => [...productCatalogKeys.all, 'settings'] as const,
  setting: (id: string) => [...productCatalogKeys.all, 'settings', id] as const,
  system: () => [...productCatalogKeys.all, 'settings', 'system'] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all product catalog settings
 */
export function useProductCatalogSettings() {
  return useQuery({
    queryKey: productCatalogKeys.settings(),
    queryFn: productCatalogApi.fetchProductCatalogSettings,
    staleTime: Infinity, // Settings change rarely, only refetch on manual invalidation
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Fetch single product catalog setting by ID
 */
export function useProductCatalogSetting(id: string) {
  return useQuery({
    queryKey: productCatalogKeys.setting(id),
    queryFn: () => productCatalogApi.fetchProductCatalogSettingsById(id),
    enabled: !!id,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch system product catalog settings (default configuration)
 */
export function useSystemProductCatalogSettings() {
  return useQuery({
    queryKey: productCatalogKeys.system(),
    queryFn: productCatalogApi.fetchSystemProductCatalogSettings,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Update product catalog settings
 */
export function useUpdateProductCatalogSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProductCatalogSettingsUpdate }) =>
      productCatalogApi.updateProductCatalogSettings(id, updates),

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: productCatalogKeys.settings() });

      const previousSettings = queryClient.getQueryData<ProductCatalogSettings>(
        productCatalogKeys.setting(id)
      );

      if (previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          { ...previousSettings, ...updates }
        );
      }

      return { previousSettings };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.settings() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'Los ajustes del catálogo se actualizaron correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          context.previousSettings
        );
      }

      logger.error('ProductCatalogHooks', 'Failed to update product catalog settings', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudieron actualizar los ajustes del catálogo',
      });
    },
  });
}

/**
 * Toggle check stock
 */
export function useToggleCheckStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      productCatalogApi.toggleCheckStock(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: productCatalogKeys.setting(id) });

      const previousSettings = queryClient.getQueryData<ProductCatalogSettings>(
        productCatalogKeys.setting(id)
      );

      if (previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          { ...previousSettings, check_stock: enabled }
        );
      }

      return { previousSettings };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.settings() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'La verificación de stock se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          context.previousSettings
        );
      }

      logger.error('ProductCatalogHooks', 'Failed to toggle check stock', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar la verificación de stock',
      });
    },
  });
}

/**
 * Toggle allow backorders
 */
export function useToggleAllowBackorders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      productCatalogApi.toggleAllowBackorders(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: productCatalogKeys.setting(id) });

      const previousSettings = queryClient.getQueryData<ProductCatalogSettings>(
        productCatalogKeys.setting(id)
      );

      if (previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          { ...previousSettings, allow_backorders: enabled }
        );
      }

      return { previousSettings };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.settings() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'La política de pedidos en espera se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          context.previousSettings
        );
      }

      logger.error('ProductCatalogHooks', 'Failed to toggle allow backorders', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar la política de pedidos en espera',
      });
    },
  });
}

/**
 * Toggle auto-disable on zero stock
 */
export function useToggleAutoDisableOnZeroStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      productCatalogApi.toggleAutoDisableOnZeroStock(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: productCatalogKeys.setting(id) });

      const previousSettings = queryClient.getQueryData<ProductCatalogSettings>(
        productCatalogKeys.setting(id)
      );

      if (previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          { ...previousSettings, auto_disable_on_zero_stock: enabled }
        );
      }

      return { previousSettings };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCatalogKeys.settings() });
      notify.success({
        title: 'Configuración actualizada',
        description: 'La desactivación automática se actualizó correctamente',
      });
    },

    onError: (error, { id }, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<ProductCatalogSettings>(
          productCatalogKeys.setting(id),
          context.previousSettings
        );
      }

      logger.error('ProductCatalogHooks', 'Failed to toggle auto-disable on zero stock', error);
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar la desactivación automática',
      });
    },
  });
}
