/**
 * NOTIFICATIONS TANSTACK QUERY HOOKS
 * 
 * React Query hooks for notification_rules management
 * Server state only - UI state goes in Zustand store
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  NotificationRule, 
  NotificationCategory,
  CreateNotificationRuleInput,
  UpdateNotificationRuleInput
} from '@/pages/admin/core/settings/services/notificationsApi';
import * as notificationsApi from '@/pages/admin/core/settings/services/notificationsApi';
import { notify } from '@/shared/alerts';
import { logger } from '@/lib/logging';

// ============================================
// QUERY KEYS
// ============================================

export const notificationsKeys = {
  all: ['notifications'] as const,
  rules: () => [...notificationsKeys.all, 'rules'] as const,
  rulesByCategory: (category: NotificationCategory) => 
    [...notificationsKeys.rules(), 'category', category] as const,
  enabledRules: () => [...notificationsKeys.rules(), 'enabled'] as const,
  rule: (id: string) => [...notificationsKeys.rules(), id] as const,
  ruleByKey: (key: string) => [...notificationsKeys.rules(), 'key', key] as const,
};

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch all notification rules
 */
export function useNotificationRules() {
  return useQuery({
    queryKey: notificationsKeys.rules(),
    queryFn: notificationsApi.fetchNotificationRules,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch notification rules by category
 */
export function useNotificationRulesByCategory(category: NotificationCategory) {
  return useQuery({
    queryKey: notificationsKeys.rulesByCategory(category),
    queryFn: () => notificationsApi.fetchNotificationRulesByCategory(category),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch enabled notification rules only
 */
export function useEnabledNotificationRules() {
  return useQuery({
    queryKey: notificationsKeys.enabledRules(),
    queryFn: notificationsApi.fetchEnabledNotificationRules,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch single notification rule by ID
 */
export function useNotificationRule(id: string | undefined) {
  return useQuery({
    queryKey: id ? notificationsKeys.rule(id) : ['notifications', 'rules', 'null'],
    queryFn: () => {
      if (!id) throw new Error('No notification rule ID provided');
      return notificationsApi.fetchNotificationRuleById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch single notification rule by key
 */
export function useNotificationRuleByKey(ruleKey: string | undefined) {
  return useQuery({
    queryKey: ruleKey ? notificationsKeys.ruleByKey(ruleKey) : ['notifications', 'rules', 'key', 'null'],
    queryFn: () => {
      if (!ruleKey) throw new Error('No rule key provided');
      return notificationsApi.fetchNotificationRuleByKey(ruleKey);
    },
    enabled: !!ruleKey,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create notification rule
 */
export function useCreateNotificationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNotificationRuleInput) => 
      notificationsApi.createNotificationRule(input),
    
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: notificationsKeys.rules() });
      queryClient.invalidateQueries({ 
        queryKey: notificationsKeys.rulesByCategory(data.category) 
      });
      
      notify.success({
        title: 'Regla creada',
        description: `La regla de notificación "${data.name}" fue creada exitosamente.`,
      });
      
      logger.info('NotificationsHooks', 'Notification rule created', { id: data.id });
    },
    
    onError: (error) => {
      notify.error({
        title: 'Error al crear regla',
        description: 'No se pudo crear la regla de notificación. Intenta nuevamente.',
      });
      
      logger.error('NotificationsHooks', 'Failed to create notification rule', error);
    },
  });
}

/**
 * Update notification rule
 */
export function useUpdateNotificationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationRuleInput }) =>
      notificationsApi.updateNotificationRule(id, data),
    
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationsKeys.rule(id) });
      await queryClient.cancelQueries({ queryKey: notificationsKeys.rules() });

      // Snapshot previous value
      const previousRule = queryClient.getQueryData(notificationsKeys.rule(id));
      const previousRules = queryClient.getQueryData(notificationsKeys.rules());

      // Optimistically update
      queryClient.setQueryData<NotificationRule>(
        notificationsKeys.rule(id),
        (old) => old ? { ...old, ...data } : old
      );

      queryClient.setQueryData<NotificationRule[]>(
        notificationsKeys.rules(),
        (old) => old?.map(rule => 
          rule.id === id ? { ...rule, ...data } : rule
        )
      );

      return { previousRule, previousRules };
    },
    
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(notificationsKeys.rule(data.id), data);
      queryClient.invalidateQueries({ queryKey: notificationsKeys.rules() });
      queryClient.invalidateQueries({ 
        queryKey: notificationsKeys.rulesByCategory(data.category) 
      });
      
      notify.success({
        title: 'Regla actualizada',
        description: `La regla "${data.name}" fue actualizada exitosamente.`,
      });
      
      logger.info('NotificationsHooks', 'Notification rule updated', { id: data.id });
    },
    
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousRule) {
        queryClient.setQueryData(notificationsKeys.rule(variables.id), context.previousRule);
      }
      if (context?.previousRules) {
        queryClient.setQueryData(notificationsKeys.rules(), context.previousRules);
      }
      
      notify.error({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar la regla. Intenta nuevamente.',
      });
      
      logger.error('NotificationsHooks', 'Failed to update notification rule', error);
    },
  });
}

/**
 * Toggle notification rule enabled status
 */
export function useToggleNotificationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      notificationsApi.toggleNotificationRule(id, enabled),
    
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.rule(id) });
      await queryClient.cancelQueries({ queryKey: notificationsKeys.rules() });

      const previousRule = queryClient.getQueryData(notificationsKeys.rule(id));
      const previousRules = queryClient.getQueryData(notificationsKeys.rules());

      // Optimistic update
      queryClient.setQueryData<NotificationRule>(
        notificationsKeys.rule(id),
        (old) => old ? { ...old, is_enabled: enabled } : old
      );

      queryClient.setQueryData<NotificationRule[]>(
        notificationsKeys.rules(),
        (old) => old?.map(rule => 
          rule.id === id ? { ...rule, is_enabled: enabled } : rule
        )
      );

      return { previousRule, previousRules };
    },
    
    onSuccess: (data) => {
      queryClient.setQueryData(notificationsKeys.rule(data.id), data);
      queryClient.invalidateQueries({ queryKey: notificationsKeys.rules() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.enabledRules() });
      
      notify.success({
        title: data.is_enabled ? 'Regla activada' : 'Regla desactivada',
        description: `La regla "${data.name}" fue ${data.is_enabled ? 'activada' : 'desactivada'}.`,
      });
      
      logger.info('NotificationsHooks', 'Notification rule toggled', { 
        id: data.id, 
        isEnabled: data.is_enabled 
      });
    },
    
    onError: (error, variables, context) => {
      if (context?.previousRule) {
        queryClient.setQueryData(notificationsKeys.rule(variables.id), context.previousRule);
      }
      if (context?.previousRules) {
        queryClient.setQueryData(notificationsKeys.rules(), context.previousRules);
      }
      
      notify.error({
        title: 'Error al cambiar estado',
        description: 'No se pudo cambiar el estado de la regla. Intenta nuevamente.',
      });
      
      logger.error('NotificationsHooks', 'Failed to toggle notification rule', error);
    },
  });
}

/**
 * Delete notification rule
 */
export function useDeleteNotificationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotificationRule(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.rules() });

      const previousRules = queryClient.getQueryData(notificationsKeys.rules());

      // Optimistic delete
      queryClient.setQueryData<NotificationRule[]>(
        notificationsKeys.rules(),
        (old) => old?.filter(rule => rule.id !== id)
      );

      return { previousRules };
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.rules() });
      
      notify.success({
        title: 'Regla eliminada',
        description: 'La regla de notificación fue eliminada exitosamente.',
      });
      
      logger.info('NotificationsHooks', 'Notification rule deleted');
    },
    
    onError: (error, id, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(notificationsKeys.rules(), context.previousRules);
      }
      
      notify.error({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la regla. Intenta nuevamente.',
      });
      
      logger.error('NotificationsHooks', 'Failed to delete notification rule', error);
    },
  });
}

/**
 * Bulk toggle notification rules by category
 */
export function useBulkToggleNotificationRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category, enabled }: { category: NotificationCategory; enabled: boolean }) =>
      notificationsApi.bulkToggleNotificationRules(category, enabled),
    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.rules() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.rulesByCategory(variables.category) });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.enabledRules() });
      
      notify.success({
        title: 'Reglas actualizadas',
        description: `${data.length} reglas de ${variables.category} fueron ${variables.enabled ? 'activadas' : 'desactivadas'}.`,
      });
      
      logger.info('NotificationsHooks', 'Notification rules bulk toggled', { 
        category: variables.category,
        count: data.length, 
        enabled: variables.enabled 
      });
    },
    
    onError: (error) => {
      notify.error({
        title: 'Error al actualizar reglas',
        description: 'No se pudieron actualizar las reglas. Intenta nuevamente.',
      });
      
      logger.error('NotificationsHooks', 'Failed to bulk toggle notification rules', error);
    },
  });
}
