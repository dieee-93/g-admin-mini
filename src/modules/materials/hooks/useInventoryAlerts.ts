/**
 * INVENTORY ALERTS - TANSTACK QUERY HOOKS
 * 
 * React Query hooks for inventory_alert_settings management
 * Handles business configuration for thresholds and auto-reorder logic
 * 
 * ARCHITECTURE NOTE:
 * This hook manages BUSINESS LOGIC only (thresholds, EOQ, ABC).
 * For notification/alert delivery (recipients, channels), use useNotifications hook
 * 
 * @version 2.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  InventoryAlertSettings,
  UpdateInventoryAlertSettingsInput,
} from '@/pages/admin/supply-chain/materials/services/inventoryAlertsApi';
import * as inventoryAlertsApi from '@/pages/admin/supply-chain/materials/services/inventoryAlertsApi';
import { notify } from '@/shared/alerts';
import { logger } from '@/lib/logging';

// ============================================
// QUERY KEYS
// ============================================

export const inventoryAlertsKeys = {
  all: ['inventory-alerts'] as const,
  settings: () => [...inventoryAlertsKeys.all, 'settings'] as const,
  setting: (id: string) => [...inventoryAlertsKeys.settings(), id] as const,
  system: () => [...inventoryAlertsKeys.settings(), 'system'] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all inventory alert settings
 */
export function useInventoryAlertSettings() {
  return useQuery({
    queryKey: inventoryAlertsKeys.settings(),
    queryFn: inventoryAlertsApi.fetchInventoryAlertSettings,
    staleTime: Infinity, // Settings change rarely, only refetch on manual invalidation
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
}

/**
 * Fetch single inventory alert settings by ID
 */
export function useInventoryAlertSetting(id: string | undefined) {
  return useQuery({
    queryKey: id ? inventoryAlertsKeys.setting(id) : ['inventory-alerts', 'null'],
    queryFn: () => {
      if (!id) throw new Error('No alert settings ID provided');
      return inventoryAlertsApi.fetchInventoryAlertSettingsById(id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Fetch system default inventory alert settings
 */
export function useSystemInventoryAlertSettings() {
  return useQuery({
    queryKey: inventoryAlertsKeys.system(),
    queryFn: inventoryAlertsApi.fetchSystemInventoryAlertSettings,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Update inventory alert settings
 */
export function useUpdateInventoryAlertSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateInventoryAlertSettingsInput }) =>
      inventoryAlertsApi.updateInventoryAlertSettings(id, updates),

    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: inventoryAlertsKeys.settings() });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<InventoryAlertSettings>(
        inventoryAlertsKeys.setting(id)
      );

      // Optimistically update
      if (previousSettings) {
        queryClient.setQueryData<InventoryAlertSettings>(
          inventoryAlertsKeys.setting(id),
          { ...previousSettings, ...updates }
        );
      }

      return { previousSettings };
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: inventoryAlertsKeys.settings() });

      notify.success({
        title: 'Configuración actualizada',
        description: 'Las alertas de inventario se actualizaron exitosamente.',
      });

      logger.info('InventoryAlertsHooks', 'Settings updated successfully');
    },

    onError: (error: Error, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousSettings) {
        queryClient.setQueryData(
          inventoryAlertsKeys.setting(id),
          context.previousSettings
        );
      }

      notify.error({
        title: 'Error al actualizar',
        description: error.message || 'No se pudo actualizar la configuración de alertas.',
      });

      logger.error('InventoryAlertsHooks', 'Failed to update settings', error);
    },
  });
}

/**
 * Toggle auto-reorder enabled/disabled
 */
export function useToggleAutoReorder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      inventoryAlertsApi.toggleAutoReorder(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: inventoryAlertsKeys.settings() });

      const previousSettings = queryClient.getQueryData<InventoryAlertSettings>(
        inventoryAlertsKeys.setting(id)
      );

      // Optimistically toggle
      if (previousSettings) {
        queryClient.setQueryData<InventoryAlertSettings>(
          inventoryAlertsKeys.setting(id),
          { ...previousSettings, auto_reorder_enabled: enabled }
        );
      }

      return { previousSettings };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryAlertsKeys.settings() });

      notify.success({
        title: data.auto_reorder_enabled ? 'Auto-reorden activado' : 'Auto-reorden desactivado',
        description: data.auto_reorder_enabled
          ? 'El sistema reordenará automáticamente cuando se alcancen los umbrales.'
          : 'El auto-reorden ha sido desactivado.',
      });

      logger.info('InventoryAlertsHooks', `Auto-reorder toggled: ${data.auto_reorder_enabled}`);
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(
          inventoryAlertsKeys.setting(id),
          context.previousSettings
        );
      }

      notify.error({
        title: 'Error al cambiar auto-reorden',
        description: error.message || 'No se pudo cambiar el estado del auto-reorden.',
      });

      logger.error('InventoryAlertsHooks', 'Failed to toggle auto-reorder', error);
    },
  });
}

/**
 * Toggle ABC analysis enabled/disabled
 */
export function useToggleABCAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      inventoryAlertsApi.toggleABCAnalysis(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: inventoryAlertsKeys.settings() });

      const previousSettings = queryClient.getQueryData<InventoryAlertSettings>(
        inventoryAlertsKeys.setting(id)
      );

      // Optimistically toggle
      if (previousSettings) {
        queryClient.setQueryData<InventoryAlertSettings>(
          inventoryAlertsKeys.setting(id),
          { ...previousSettings, abc_analysis_enabled: enabled }
        );
      }

      return { previousSettings };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryAlertsKeys.settings() });

      notify.success({
        title: data.abc_analysis_enabled ? 'Análisis ABC activado' : 'Análisis ABC desactivado',
        description: data.abc_analysis_enabled
          ? 'La clasificación ABC está activa para todos los productos.'
          : 'El análisis ABC ha sido desactivado.',
      });

      logger.info('InventoryAlertsHooks', `ABC analysis toggled: ${data.abc_analysis_enabled}`);
    },

    onError: (error: Error, { id }, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(
          inventoryAlertsKeys.setting(id),
          context.previousSettings
        );
      }

      notify.error({
        title: 'Error al cambiar análisis ABC',
        description: error.message || 'No se pudo cambiar el estado del análisis ABC.',
      });

      logger.error('InventoryAlertsHooks', 'Failed to toggle ABC analysis', error);
    },
  });
}
