/**
 * NOTIFICATIONS API SERVICE
 * 
 * CRUD operations for notification_rules table
 * Handles: inventory, staff, customers, finance, system alerts
 * 
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export type NotificationCategory = 'inventory' | 'staff' | 'customers' | 'finance' | 'system';
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface NotificationRule {
  id: string;
  rule_key: string;
  category: NotificationCategory;
  name: string;
  description: string | null;
  is_enabled: boolean;
  severity: NotificationSeverity;
  notify_email: boolean;
  notify_push: boolean;
  notify_sms: boolean;
  notify_in_app: boolean;
  conditions: Record<string, any>;
  recipient_roles: string[];
  recipient_users: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateNotificationRuleInput {
  rule_key: string;
  category: NotificationCategory;
  name: string;
  description?: string;
  is_enabled?: boolean;
  severity?: NotificationSeverity;
  notify_email?: boolean;
  notify_push?: boolean;
  notify_sms?: boolean;
  notify_in_app?: boolean;
  conditions?: Record<string, any>;
  recipient_roles?: string[];
  recipient_users?: string[];
}

export interface UpdateNotificationRuleInput {
  name?: string;
  description?: string;
  is_enabled?: boolean;
  severity?: NotificationSeverity;
  notify_email?: boolean;
  notify_push?: boolean;
  notify_sms?: boolean;
  notify_in_app?: boolean;
  conditions?: Record<string, any>;
  recipient_roles?: string[];
  recipient_users?: string[];
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all notification rules
 */
export async function fetchNotificationRules(): Promise<NotificationRule[]> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    logger.error('NotificationsApi', 'Failed to fetch notification rules', error);
    throw error;
  }

  return data as NotificationRule[];
}

/**
 * Fetch notification rules by category
 */
export async function fetchNotificationRulesByCategory(
  category: NotificationCategory
): Promise<NotificationRule[]> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    logger.error('NotificationsApi', `Failed to fetch ${category} notification rules`, error);
    throw error;
  }

  return data as NotificationRule[];
}

/**
 * Fetch enabled notification rules only
 */
export async function fetchEnabledNotificationRules(): Promise<NotificationRule[]> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('is_enabled', true)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    logger.error('NotificationsApi', 'Failed to fetch enabled notification rules', error);
    throw error;
  }

  return data as NotificationRule[];
}

/**
 * Fetch single notification rule by ID
 */
export async function fetchNotificationRuleById(id: string): Promise<NotificationRule> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('NotificationsApi', 'Failed to fetch notification rule', { id, error });
    throw error;
  }

  return data as NotificationRule;
}

/**
 * Fetch single notification rule by key
 */
export async function fetchNotificationRuleByKey(ruleKey: string): Promise<NotificationRule> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('rule_key', ruleKey)
    .single();

  if (error) {
    logger.error('NotificationsApi', 'Failed to fetch notification rule by key', { ruleKey, error });
    throw error;
  }

  return data as NotificationRule;
}

/**
 * Create new notification rule
 */
export async function createNotificationRule(
  input: CreateNotificationRuleInput
): Promise<NotificationRule> {
  const { data, error } = await supabase
    .from('notification_rules')
    .insert(input)
    .select()
    .single();

  if (error) {
    logger.error('NotificationsApi', 'Failed to create notification rule', error);
    throw error;
  }

  logger.info('NotificationsApi', 'Notification rule created', { id: data.id, key: data.rule_key });
  return data as NotificationRule;
}

/**
 * Update notification rule
 */
export async function updateNotificationRule(
  id: string,
  updates: UpdateNotificationRuleInput
): Promise<NotificationRule> {
  const { data, error } = await supabase
    .from('notification_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('NotificationsApi', 'Failed to update notification rule', { id, error });
    throw error;
  }

  logger.info('NotificationsApi', 'Notification rule updated', { id: data.id });
  return data as NotificationRule;
}

/**
 * Toggle notification rule enabled status
 */
export async function toggleNotificationRule(id: string, isEnabled: boolean): Promise<NotificationRule> {
  const { data, error } = await supabase
    .from('notification_rules')
    .update({ is_enabled: isEnabled })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('NotificationsApi', 'Failed to toggle notification rule', { id, error });
    throw error;
  }

  logger.info('NotificationsApi', 'Notification rule toggled', { id, isEnabled });
  return data as NotificationRule;
}

/**
 * Delete notification rule
 */
export async function deleteNotificationRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('notification_rules')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('NotificationsApi', 'Failed to delete notification rule', { id, error });
    throw error;
  }

  logger.info('NotificationsApi', 'Notification rule deleted', { id });
}

/**
 * Bulk update notification rules by category (enable/disable multiple)
 */
export async function bulkToggleNotificationRules(
  category: NotificationCategory,
  isEnabled: boolean
): Promise<NotificationRule[]> {
  const { data, error } = await supabase
    .from('notification_rules')
    .update({ is_enabled: isEnabled })
    .eq('category', category)
    .select();

  if (error) {
    logger.error('NotificationsApi', 'Failed to bulk toggle notification rules', { category, error });
    throw error;
  }

  logger.info('NotificationsApi', 'Notification rules bulk toggled', { category, count: data.length, isEnabled });
  return data as NotificationRule[];
}
