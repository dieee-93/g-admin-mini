/**
 * Appointment Reminder Service
 *
 * Automatically sends reminders for upcoming appointments:
 * - 24 hours before (email)
 * - 2 hours before (email + SMS if configured)
 *
 * PRODUCTION NOTES:
 * - This service should run on backend/edge function, not in browser
 * - Consider using Supabase Edge Functions with cron triggers
 * - Add SMS integration (Twilio, AWS SNS, etc.)
 * - Add push notifications for mobile apps
 * - Add retry logic and error handling
 * - Monitor delivery rates and failures
 */

import { addHours, differenceInHours, isBefore, isAfter } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { emailService } from './emailService';
import { eventBus } from '@/lib/events';
import type { Database } from '@/lib/supabase/database.types';
import { logger } from '@/lib/logging';

type Sale = Database['public']['Tables']['sales']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface AppointmentWithRelations extends Sale {
  customer: Customer;
  staff: Employee;
  service: Product;
}

interface ReminderRule {
  hours_before: number;
  channels: ('email' | 'sms' | 'push')[];
  column_name: 'reminder_sent_24h' | 'reminder_sent_2h';
}

class AppointmentReminderService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private reminderRules: ReminderRule[] = [
    {
      hours_before: 24,
      channels: ['email'],
      column_name: 'reminder_sent_24h',
    },
    {
      hours_before: 2,
      channels: ['email'], // Add 'sms' when SMS service is configured
      column_name: 'reminder_sent_2h',
    },
  ];

  constructor() {
    logger.info('appointmentReminders', 'Service initialized (not started)');
  }

  /**
   * Start the reminder service
   * Checks for pending reminders every hour
   *
   * ROBUSTNESS FIX: Prevents duplicate instances in React StrictMode
   * - Force stops any existing instance before starting
   * - Clears any orphaned intervals
   * - Uses lock to prevent race conditions
   */
  start() {
    // Force cleanup of any existing instance (fixes StrictMode double-mount)
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.debug('appointmentReminders', 'Cleared orphaned interval');
    }

    // Double-check running state
    if (this.isRunning) {
      logger.warn('appointmentReminders', 'Service already running - forcing stop first');
      this.stop();
    }

    // Set running flag BEFORE async operations (prevents race condition)
    this.isRunning = true;

    logger.info('appointmentReminders', 'Starting service...');

    // Run check immediately on start
    this.checkReminders();

    // Then run every hour
    this.intervalId = setInterval(() => {
      this.checkReminders();
    }, 60 * 60 * 1000); // 1 hour

    logger.info('appointmentReminders', 'Service started (checking every hour)');
  }

  /**
   * Stop the reminder service
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('appointmentReminders', 'Service not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    logger.debug('appointmentReminders', 'Service stopped');
  }

  /**
   * Check for appointments that need reminders
   */
  private async checkReminders() {
    logger.debug('appointmentReminders', 'Checking for pending reminders...');

    for (const rule of this.reminderRules) {
      await this.sendRemindersForRule(rule);
    }

    logger.info('appointmentReminders', 'Reminder check completed');
  }

  /**
   * Send reminders for a specific time rule
   */
  private async sendRemindersForRule(rule: ReminderRule) {
    const now = new Date();
    const targetTime = addHours(now, rule.hours_before);

    // Query window: target time ± 1 hour
    const windowStart = addHours(targetTime, -1);
    const windowEnd = addHours(targetTime, 1);

    try {
      // Get appointments that:
      // 1. Are scheduled within the target window
      // 2. Haven't been reminded yet for this rule
      // 3. Are confirmed (not cancelled)
      // 4. Are of type APPOINTMENT
      const { data: appointments, error } = await supabase
        .from('sales')
        .select(
          `
          *,
          customer:customer_id(id, name, email, phone),
          staff:assigned_staff_id(id, name, email, phone),
          service:service_id(id, name, duration_minutes, category)
        `
        )
        .eq('order_type', 'APPOINTMENT')
        .eq('order_status', 'CONFIRMED')
        .gte('scheduled_time', windowStart.toISOString())
        .lte('scheduled_time', windowEnd.toISOString())
        .is(rule.column_name, null);

      if (error) {
        logger.error('appointmentReminders', 'Query error:', error);
        return;
      }

      if (!appointments || appointments.length === 0) {
        logger.debug(
          'appointmentReminders',
          `No reminders for ${rule.hours_before}h rule`
        );
        return;
      }

      logger.info(
        'appointmentReminders',
        `Sending ${appointments.length} reminders (${rule.hours_before}h before)`
      );

      for (const appointment of appointments as unknown as AppointmentWithRelations[]) {
        await this.sendReminder(appointment, rule);
      }
    } catch (error) {
      logger.error('appointmentReminders', 'Error in sendRemindersForRule:', error);
    }
  }

  /**
   * Send reminder for a single appointment
   */
  private async sendReminder(
    appointment: AppointmentWithRelations,
    rule: ReminderRule
  ) {
    const { customer, staff, service } = appointment;

    if (!customer || !staff || !service) {
      console.error(
        `[AppointmentReminders] Missing relations for appointment ${appointment.id}`
      );
      return;
    }

    if (!appointment.scheduled_time) {
      console.error(
        `[AppointmentReminders] Missing scheduled_time for appointment ${appointment.id}`
      );
      return;
    }

    try {
      // Send Email
      if (rule.channels.includes('email') && customer.email) {
        await emailService.sendAppointmentReminder({
          to: customer.email,
          customerName: customer.name,
          serviceName: service.name,
          professionalName: staff.name,
          scheduledTime: appointment.scheduled_time,
          duration: service.duration_minutes || 60,
          cancellationLink: `${window.location.origin}/app/appointments/${appointment.id}/cancel`,
          rescheduleLink: `${window.location.origin}/app/appointments/${appointment.id}/reschedule`,
        });

        logger.info(
          'API',
          `Email sent to ${customer.email} for appointment ${appointment.id}`
        );
      }

      // TODO: Send SMS when SMS service is configured
      // if (rule.channels.includes('sms') && customer.phone) {
      //   await smsService.send({
      //     to: customer.phone,
      //     message: `Reminder: ${service.name} ${rule.hours_before === 24 ? 'tomorrow' : 'in 2 hours'} at ${format(
      //       new Date(appointment.scheduled_time),
      //       'HH:mm'
      //     )} with ${staff.name}.`,
      //   });
      // }

      // TODO: Send Push when push service is configured
      // if (rule.channels.includes('push') && customer.push_token) {
      //   await pushService.send({
      //     token: customer.push_token,
      //     title: 'Appointment Reminder',
      //     body: `${service.name} ${rule.hours_before === 24 ? 'tomorrow' : 'soon'}`,
      //   });
      // }

      // Mark reminder as sent
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          [rule.column_name]: new Date().toISOString(),
        })
        .eq('id', appointment.id);

      if (updateError) {
        logger.error(
          'API',
          `Failed to update ${rule.column_name}`,
          { error: updateError }
        );
      } else {
        logger.debug(
          'API',
          `Marked ${rule.column_name} for appointment ${appointment.id}`
        );
      }

      // Emit event
      eventBus.emit('appointment.reminder.sent', {
        appointmentId: appointment.id,
        customerId: customer.id,
        hoursBefore: rule.hours_before,
        channels: rule.channels,
        timestamp: new Date().toISOString(),
      });

      logger.info(
        'API',
        `Sent reminder for appointment ${appointment.id} (${rule.hours_before}h before)`
      );
    } catch (error) {
      logger.error(
        'API',
        `Failed to send reminder for ${appointment.id}`,
        { error }
      );

      // Emit error event
      eventBus.emit('appointment.reminder.failed', {
        appointmentId: appointment.id,
        customerId: customer.id,
        hoursBefore: rule.hours_before,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Manually trigger reminder for testing
   * Useful for testing reminder emails without waiting
   */
  async sendTestReminder(appointmentId: string) {
    logger.debug('appointmentReminders', `Sending test reminder for ${appointmentId}`);

    const { data: appointment, error } = await supabase
      .from('sales')
      .select(
        `
        *,
        customer:customer_id(id, name, email, phone),
        staff:assigned_staff_id(id, name, email, phone),
        service:service_id(id, name, duration_minutes, category)
      `
      )
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      logger.error('appointmentReminders', 'Appointment not found:', error);
      return;
    }

    await this.sendReminder(appointment as unknown as AppointmentWithRelations, {
      hours_before: 24,
      channels: ['email'],
      column_name: 'reminder_sent_24h',
    });
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      rules: this.reminderRules,
    };
  }
}

// Singleton instance
export const appointmentReminderService = new AppointmentReminderService();

// Export for testing
export { AppointmentReminderService };
