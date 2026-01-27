/**
 * Notification Rules - TanStack Query Hooks
 * Server state management for notification rules
 * 
 * Pattern: Following Cash Module architecture
 * Reference: CASH_MODULE_TANSTACK_QUERY_MIGRATION.md
 * 
 * @module notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logging';
import { notify } from '@/lib/notifications';
import {
  fetchNotificationRules,
  fetchNotificationRulesByCategory,
  fetchEnabledNotificationRules,
  fetchNotificationRuleById,
  updateNotificationRule,
  toggleNotificationRuleEnabled,
  updateNotificationChannels,
  updateNotificationRecipients,
  updateNotificationRuleConditions,
  getNotificationRulesStats,
} from '@/pages/admin/core/settings/services/notificationRulesApi';
import type {
  NotificationRule,
  NotificationRuleUpdate,
  NotificationCategory,
} from '@/pages/admin/core/settings/services/notificationRulesApi';

// ============================================
// QUERY KEYS
// ============================================

export const notificationRulesKeys = {
  all: ['notification-rules'] as const,
  lists: () => [...notificationRulesKeys.all, 'list'] as const,
  list: (category?: NotificationCategory, enabledOnly?: boolean) =>
    [...notificationRulesKeys.lists(), { category, enabledOnly }] as const,
  details: () => [...notificationRulesKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationRulesKeys.details(), id] as const,
  stats: () => [...notificationRulesKeys.all, 'stats'] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook to fetch all notification rules
 */
export function useNotificationRules(category?: NotificationCategory, enabledOnly = false) {
  return useQuery({
    queryKey: notificationRulesKeys.list(category, enabledOnly),
    queryFn: async () => {
      if (enabledOnly) {
        return await fetchEnabledNotificationRules();
      }
      if (category) {
        return await fetchNotificationRulesByCategory(category);
      }
      return await fetchNotificationRules();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

/**
 * Hook to fetch enabled notification rules only
 */
export function useEnabledNotificationRules() {
  return useNotificationRules(undefined, true);
}

/**
 * Hook to fetch notification rules by category
 */
export function useNotificationRulesByCategory(category: NotificationCategory) {
  return useNotificationRules(category, false);
}

/**
 * Hook to fetch single notification rule by ID
 */
export function useNotificationRuleById(id: string) {
  return useQuery({
    queryKey: notificationRulesKeys.detail(id),
    queryFn: () => fetchNotificationRuleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch notification rules statistics
 */
export function useNotificationRulesStats() {
  return useQuery({
    queryKey: notificationRulesKeys.stats(),
    queryFn: () => getNotificationRulesStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook to update notification rule
 */
export function useUpdateNotificationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: NotificationRuleUpdate }) => {
      return await updateNotificationRule(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationRulesKeys.lists() });
      await queryClient.cancelQueries({ queryKey: notificationRulesKeys.detail(id) });

      // Snapshot previous values
      const previousList = queryClient.getQueryData<NotificationRule[]>(notificationRulesKeys.lists());
      const previousDetail = queryClient.getQueryData<NotificationRule>(notificationRulesKeys.detail(id));

      // Optimistically update lists
      if (previousList) {
        queryClient.setQueryData<NotificationRule[]>(
          notificationRulesKeys.lists(),
          (old) => old?.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)) ?? []
        );
      }

      // Optimistically update detail
      if (previousDetail) {
        queryClient.setQueryData<NotificationRule>(
          notificationRulesKeys.detail(id),
          (old) => (old ? { ...old, ...updates } : old)
        );
      }

      return { previousList, previousDetail };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousList) {
        queryClient.setQueryData(notificationRulesKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(notificationRulesKeys.detail(id), context.previousDetail);
      }

      logger.error('useUpdateNotificationRule', 'Failed to update notification rule', error);
      notify.error({
        title: 'Error al actualizar regla',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.stats() });

      notify.success({
        title: 'Regla actualizada',
        description: `"${data.name}" actualizada correctamente`,
      });
    },
  });
}

/**
 * Hook to toggle notification rule enabled state
 */
export function useToggleNotificationRuleEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return await toggleNotificationRuleEnabled(id, enabled);
    },
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: notificationRulesKeys.lists() });

      const previousList = queryClient.getQueryData<NotificationRule[]>(notificationRulesKeys.lists());

      if (previousList) {
        queryClient.setQueryData<NotificationRule[]>(
          notificationRulesKeys.lists(),
          (old) => old?.map((rule) => (rule.id === id ? { ...rule, is_enabled: enabled } : rule)) ?? []
        );
      }

      return { previousList };
    },
    onError: (error, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(notificationRulesKeys.lists(), context.previousList);
      }

      logger.error('useToggleNotificationRuleEnabled', 'Failed to toggle notification rule', error);
      notify.error({
        title: 'Error al cambiar estado',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
    onSuccess: (data, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.stats() });

      notify.success({
        title: enabled ? 'Regla activada' : 'Regla desactivada',
        description: `"${data.name}" ${enabled ? 'activada' : 'desactivada'} correctamente`,
      });
    },
  });
}

/**
 * Hook to update notification channels
 */
export function useUpdateNotificationChannels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      channels,
    }: {
      id: string;
      channels: {
        notify_email: boolean;
        notify_push: boolean;
        notify_sms: boolean;
        notify_in_app: boolean;
      };
    }) => {
      return await updateNotificationChannels(id, channels);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.detail(data.id) });

      notify.success({
        title: 'Canales actualizados',
        description: `Canales de notificación actualizados para "${data.name}"`,
      });
    },
    onError: (error) => {
      logger.error('useUpdateNotificationChannels', 'Failed to update notification channels', error);
      notify.error({
        title: 'Error al actualizar canales',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
  });
}

/**
 * Hook to update notification recipients
 */
export function useUpdateNotificationRecipients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      recipients,
    }: {
      id: string;
      recipients: {
        recipient_roles: string[];
        recipient_users: string[];
      };
    }) => {
      return await updateNotificationRecipients(id, recipients);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.detail(data.id) });

      notify.success({
        title: 'Destinatarios actualizados',
        description: `Destinatarios actualizados para "${data.name}"`,
      });
    },
    onError: (error) => {
      logger.error('useUpdateNotificationRecipients', 'Failed to update notification recipients', error);
      notify.error({
        title: 'Error al actualizar destinatarios',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
  });
}

/**
 * Hook to update notification rule conditions (advanced)
 */
export function useUpdateNotificationRuleConditions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, conditions }: { id: string; conditions: Record<string, any> }) => {
      return await updateNotificationRuleConditions(id, conditions);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationRulesKeys.detail(data.id) });

      notify.success({
        title: 'Condiciones actualizadas',
        description: `Condiciones actualizadas para "${data.name}"`,
      });
    },
    onError: (error) => {
      logger.error('useUpdateNotificationRuleConditions', 'Failed to update conditions', error);
      notify.error({
        title: 'Error al actualizar condiciones',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
  });
}
