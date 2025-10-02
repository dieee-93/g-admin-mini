/**
 * Labor Cost Notifications Service
 * Manages notifications for overtime, budget alerts, and scheduling conflicts
 */

import { realTimeLaborCosts, type CostAlert } from './realTimeLaborCosts';
import { EventBus } from '@/lib/events';

import { logger } from '@/lib/logging';
interface NotificationConfig {
  overtimeWarningEnabled: boolean;
  budgetAlertEnabled: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  slackWebhook?: string;
}

interface LaborCostNotification {
  id: string;
  type: 'overtime' | 'budget' | 'understaffed' | 'cost_spike';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  employee_id?: string;
  employee_name?: string;
  department?: string;
  action_url?: string;
  timestamp: string;
  read: boolean;
  auto_dismiss: boolean;
}

class LaborCostNotificationService {
  private config: NotificationConfig = {
    overtimeWarningEnabled: true,
    budgetAlertEnabled: true,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false
  };

  private notifications: LaborCostNotification[] = [];
  private subscribers: Set<(notifications: LaborCostNotification[]) => void> = new Set();
  private alertUnsubscribe: (() => void) | null = null;
  private isInitialized = false;

  /**
   * Initialize the notification service
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Subscribe to real-time alerts
    this.alertUnsubscribe = realTimeLaborCosts.subscribeToAlerts((alerts) => {
      this.processAlerts(alerts);
    });

    // Request desktop notification permission
    if (this.config.desktopNotifications && 'Notification' in window) {
      Notification.requestPermission();
    }

    this.isInitialized = true;
    logger.info('StaffStore', '🔔 Labor cost notifications initialized');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.alertUnsubscribe) {
      this.alertUnsubscribe();
      this.alertUnsubscribe = null;
    }
    
    this.subscribers.clear();
    this.notifications = [];
    this.isInitialized = false;
  }

  /**
   * Process alerts from real-time service
   */
  private processAlerts(alerts: CostAlert[]): void {
    alerts.forEach(alert => {
      // Skip if notification type is disabled
      if (alert.type === 'overtime_approaching' && !this.config.overtimeWarningEnabled) {
        return;
      }
      if (alert.type === 'budget_exceeded' && !this.config.budgetAlertEnabled) {
        return;
      }

      // Check if we already have this notification
      const existing = this.notifications.find(n => n.id === alert.id);
      if (existing) return;

      // Create notification
      const notification = this.createNotificationFromAlert(alert);
      this.addNotification(notification);

      // Trigger different notification methods
      this.triggerNotification(notification);
    });

    // Remove resolved alerts
    this.notifications = this.notifications.filter(notification => 
      alerts.some(alert => alert.id === notification.id) || notification.auto_dismiss === false
    );

    this.notifySubscribers();
  }

  /**
   * Create notification from cost alert
   */
  private createNotificationFromAlert(alert: CostAlert): LaborCostNotification {
    let title: string;
    let actionUrl: string | undefined;

    switch (alert.type) {
      case 'overtime_approaching':
        title = alert.severity === 'critical' ? 'Overtime Alert' : 'Overtime Warning';
        actionUrl = `/admin/staff?tab=time-tracking&employee=${alert.employee_id}`;
        break;
      case 'budget_exceeded':
        title = 'Budget Alert';
        actionUrl = '/admin/scheduling?tab=costs';
        break;
      case 'understaffed':
        title = 'Understaffed Alert';
        actionUrl = '/admin/scheduling?tab=coverage';
        break;
      case 'overstaffed':
        title = 'Overstaffed Alert';
        actionUrl = '/admin/scheduling?tab=realtime';
        break;
      default:
        title = 'Labor Cost Alert';
        actionUrl = '/admin/scheduling?tab=realtime';
    }

    return {
      id: alert.id,
      type: this.mapAlertTypeToNotificationType(alert.type),
      severity: alert.severity,
      title,
      message: alert.message,
      employee_id: alert.employee_id,
      employee_name: alert.employee_name,
      department: alert.department,
      action_url: actionUrl,
      timestamp: alert.timestamp,
      read: false,
      auto_dismiss: true
    };
  }

  /**
   * Map alert type to notification type
   */
  private mapAlertTypeToNotificationType(alertType: string): LaborCostNotification['type'] {
    switch (alertType) {
      case 'overtime_approaching':
        return 'overtime';
      case 'budget_exceeded':
        return 'budget';
      case 'understaffed':
        return 'understaffed';
      default:
        return 'cost_spike';
    }
  }

  /**
   * Add notification to the list
   */
  private addNotification(notification: LaborCostNotification): void {
    this.notifications.push(notification);

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(-50);
    }

    // Emit event to EventBus
    EventBus.emit('staff.alert', {
      type: 'labor_cost_notification',
      notification
    });
  }

  /**
   * Trigger various notification methods
   */
  private triggerNotification(notification: LaborCostNotification): void {
    // Desktop notification
    if (this.config.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/labor-alert.png',
        badge: '/icons/badge.png',
        tag: notification.id,
        requireInteraction: notification.severity === 'critical'
      });

      desktopNotification.onclick = () => {
        if (notification.action_url) {
          window.focus();
          window.location.href = notification.action_url;
        }
        desktopNotification.close();
      };

      // Auto-dismiss after 10 seconds for non-critical alerts
      if (notification.severity !== 'critical') {
        setTimeout(() => {
          desktopNotification.close();
        }, 10000);
      }
    }

    // Sound notification
    if (this.config.soundEnabled) {
      this.playNotificationSound(notification.severity);
    }

    // Email notification (if configured)
    if (this.config.emailNotifications) {
      this.sendEmailNotification(notification);
    }

    // Slack webhook (if configured)
    if (this.config.slackWebhook) {
      this.sendSlackNotification(notification);
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(severity: string): void {
    const audio = new Audio();
    
    switch (severity) {
      case 'critical':
        audio.src = '/sounds/critical-alert.mp3';
        break;
      case 'warning':
        audio.src = '/sounds/warning-alert.mp3';
        break;
      default:
        audio.src = '/sounds/info-alert.mp3';
    }

    audio.volume = 0.7;
    audio.play().catch(console.warn); // Ignore errors if sound can't play
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: LaborCostNotification): Promise<void> {
    try {
      // This would integrate with your email service
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'labor_cost_alert',
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          employee_id: notification.employee_id,
          department: notification.department,
          action_url: notification.action_url
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
    } catch (error) {
      logger.error('StaffStore', 'Error sending email notification:', error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(notification: LaborCostNotification): Promise<void> {
    if (!this.config.slackWebhook) return;

    try {
      const color = notification.severity === 'critical' ? 'danger' : 
                   notification.severity === 'warning' ? 'warning' : 'good';

      const payload = {
        text: notification.title,
        attachments: [{
          color,
          title: notification.title,
          text: notification.message,
          fields: [
            ...(notification.employee_name ? [{
              title: 'Employee',
              value: notification.employee_name,
              short: true
            }] : []),
            ...(notification.department ? [{
              title: 'Department',
              value: notification.department,
              short: true
            }] : [])
          ],
          footer: 'G-Admin Labor Costs',
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      await fetch(this.config.slackWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      logger.error('StaffStore', 'Error sending Slack notification:', error);
    }
  }

  /**
   * Subscribe to notifications
   */
  subscribe(callback: (notifications: LaborCostNotification[]) => void): () => void {
    this.subscribers.add(callback);

    // Send current notifications immediately
    if (this.notifications.length > 0) {
      callback([...this.notifications]);
    }

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback([...this.notifications]);
      } catch (error) {
        logger.error('StaffStore', 'Error notifying notification subscriber:', error);
      }
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifySubscribers();
  }

  /**
   * Dismiss notification
   */
  dismissNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifySubscribers();
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications = [];
    this.notifySubscribers();
  }

  /**
   * Get current notifications
   */
  getNotifications(): LaborCostNotification[] {
    return [...this.notifications];
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('StaffStore', '🔧 Notification config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  /**
   * Create manual notification
   */
  createManualNotification(
    type: LaborCostNotification['type'],
    title: string,
    message: string,
    severity: LaborCostNotification['severity'] = 'info',
    actionUrl?: string
  ): void {
    const notification: LaborCostNotification = {
      id: `manual_${Date.now()}`,
      type,
      severity,
      title,
      message,
      action_url: actionUrl,
      timestamp: new Date().toISOString(),
      read: false,
      auto_dismiss: false
    };

    this.addNotification(notification);
    this.triggerNotification(notification);
    this.notifySubscribers();
  }
}

// Export singleton instance
export const laborCostNotifications = new LaborCostNotificationService();

// Export types
export type { LaborCostNotification, NotificationConfig };

export default laborCostNotifications;