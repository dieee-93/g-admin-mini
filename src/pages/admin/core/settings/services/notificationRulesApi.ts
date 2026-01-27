/**
 * Notification Rules API
 * Server state management for notification rules configuration
 * 
 * Database: notification_rules table
 * Reference: database/migrations/20251222_notification_rules.sql
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

export interface NotificationRuleUpdate {
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
    .order('severity', { ascending: false });

  if (error) {
    logger.error('NotificationRulesApi', 'Failed to fetch notification rules', error);
    throw error;
  }

  return data;
}

/**
 * Fetch notification rules by category
 */
export async function fetchNotificationRulesByCategory(category: NotificationCategory): Promise<NotificationRule[]> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('category', category)
    .order('severity', { ascending: false });

  if (error) {
    logger.error('NotificationRulesApi', `Failed to fetch ${category} notification rules`, error);
    throw error;
  }

  return data;
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
    .order('severity', { ascending: false });

  if (error) {
    logger.error('NotificationRulesApi', 'Failed to fetch enabled notification rules', error);
    throw error;
  }

  return data;
}

/**
 * Get single notification rule by ID
 */
export async function fetchNotificationRuleById(id: string): Promise<NotificationRule> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('NotificationRulesApi', `Failed to fetch notification rule ${id}`, error);
    throw error;
  }

  return data;
}

/**
 * Update notification rule
 */
export async function updateNotificationRule(
  id: string,
  updates: NotificationRuleUpdate
): Promise<NotificationRule> {
  const { data, error } = await supabase
    .from('notification_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('NotificationRulesApi', `Failed to update notification rule ${id}`, error);
    throw error;
  }

  logger.info('NotificationRulesApi', `Notification rule ${id} updated successfully`);
  return data;
}

/**
 * Toggle notification rule enabled state
 */
export async function toggleNotificationRuleEnabled(id: string, enabled: boolean): Promise<NotificationRule> {
  return updateNotificationRule(id, { is_enabled: enabled });
}

/**
 * Update notification channels for a rule
 */
export async function updateNotificationChannels(
  id: string,
  channels: {
    notify_email: boolean;
    notify_push: boolean;
    notify_sms: boolean;
    notify_in_app: boolean;
  }
): Promise<NotificationRule> {
  return updateNotificationRule(id, channels);
}

/**
 * Update notification recipients for a rule
 */
export async function updateNotificationRecipients(
  id: string,
  recipients: {
    recipient_roles: string[];
    recipient_users: string[];
  }
): Promise<NotificationRule> {
  return updateNotificationRule(id, recipients);
}

/**
 * Update rule conditions (advanced JSON config)
 */
export async function updateNotificationRuleConditions(
  id: string,
  conditions: Record<string, any>
): Promise<NotificationRule> {
  return updateNotificationRule(id, { conditions });
}

/**
 * Get notification rules statistics
 */
export async function getNotificationRulesStats(): Promise<{
  total: number;
  enabled: number;
  byCategory: Record<NotificationCategory, number>;
  bySeverity: Record<NotificationSeverity, number>;
}> {
  const { data, error } = await supabase
    .from('notification_rules')
    .select('category, severity, is_enabled');

  if (error) {
    logger.error('NotificationRulesApi', 'Failed to fetch notification rules stats', error);
    throw error;
  }

  const stats = {
    total: data.length,
    enabled: data.filter(r => r.is_enabled).length,
    byCategory: {} as Record<NotificationCategory, number>,
    bySeverity: {} as Record<NotificationSeverity, number>,
  };

  // Count by category
  data.forEach(rule => {
    stats.byCategory[rule.category] = (stats.byCategory[rule.category] || 0) + 1;
  });

  // Count by severity
  data.forEach(rule => {
    stats.bySeverity[rule.severity] = (stats.bySeverity[rule.severity] || 0) + 1;
  });

  return stats;
}
