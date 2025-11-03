import { logger } from '@/lib/logging';
/**
 * Email Service Stub
 *
 * PRODUCTION TODO:
 * - Integrate real email service (Resend, SendGrid, AWS SES, or Supabase Auth emails)
 * - Add email templates (HTML/text)
 * - Add retry logic for failed sends
 * - Add rate limiting
 * - Move to backend/edge function
 */

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  data?: Record<string, unknown>;
  html?: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  /**
   * Send an email
   * Currently logs to console - replace with real email service in production
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    logger.debug('emailService', 'Sending email:', {
      to: options.to,
      subject: options.subject,
      template: options.template,
      data: options.data,
    });

    try {
      // PRODUCTION: Replace with actual email service call
      // Example with Resend:
      // const { data, error } = await resend.emails.send({
      //   from: 'onboarding@resend.dev',
      //   to: options.to,
      //   subject: options.subject,
      //   html: options.html,
      // });

      // Simulate successful send
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    } catch (error) {
      logger.error('emailService', 'Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(params: {
    to: string;
    customerName: string;
    serviceName: string;
    professionalName: string;
    scheduledTime: string;
    duration: number;
    cancellationLink: string;
    rescheduleLink: string;
  }): Promise<EmailResult> {
    const { scheduledTime, duration, ...otherParams } = params;
    const appointmentDate = new Date(scheduledTime);

    const subject = `Reminder: ${params.serviceName} appointment ${appointmentDate.toLocaleDateString()}`;

    const html = `
      <h2>Appointment Reminder</h2>
      <p>Hi ${params.customerName},</p>
      <p>This is a reminder about your upcoming appointment:</p>
      <ul>
        <li><strong>Service:</strong> ${params.serviceName}</li>
        <li><strong>Professional:</strong> ${params.professionalName}</li>
        <li><strong>Date & Time:</strong> ${appointmentDate.toLocaleString()}</li>
        <li><strong>Duration:</strong> ${duration} minutes</li>
      </ul>
      <p>
        <a href="${params.cancellationLink}">Cancel Appointment</a> |
        <a href="${params.rescheduleLink}">Reschedule</a>
      </p>
      <p>We look forward to seeing you!</p>
    `;

    const text = `
Appointment Reminder

Hi ${params.customerName},

This is a reminder about your upcoming appointment:

Service: ${params.serviceName}
Professional: ${params.professionalName}
Date & Time: ${appointmentDate.toLocaleString()}
Duration: ${duration} minutes

Cancel: ${params.cancellationLink}
Reschedule: ${params.rescheduleLink}

We look forward to seeing you!
    `;

    return this.send({
      to: params.to,
      subject,
      template: 'appointment_reminder',
      data: { ...otherParams, scheduledTime, duration },
      html,
      text,
    });
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(params: {
    to: string;
    customerName: string;
    serviceName: string;
    professionalName: string;
    scheduledTime: string;
    duration: number;
  }): Promise<EmailResult> {
    const { scheduledTime, duration, ...otherParams } = params;
    const appointmentDate = new Date(scheduledTime);

    const subject = `Appointment Confirmed: ${params.serviceName} on ${appointmentDate.toLocaleDateString()}`;

    const html = `
      <h2>Appointment Confirmed!</h2>
      <p>Hi ${params.customerName},</p>
      <p>Your appointment has been confirmed:</p>
      <ul>
        <li><strong>Service:</strong> ${params.serviceName}</li>
        <li><strong>Professional:</strong> ${params.professionalName}</li>
        <li><strong>Date & Time:</strong> ${appointmentDate.toLocaleString()}</li>
        <li><strong>Duration:</strong> ${duration} minutes</li>
      </ul>
      <p>You'll receive a reminder 24 hours before your appointment.</p>
      <p>Thank you for choosing us!</p>
    `;

    return this.send({
      to: params.to,
      subject,
      template: 'appointment_confirmation',
      data: { ...otherParams, scheduledTime, duration },
      html,
    });
  }
}

export const emailService = new EmailService();
