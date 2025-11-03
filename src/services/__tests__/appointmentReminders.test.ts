/**
 * Appointment Reminder Service Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { addHours, addDays } from 'date-fns';
import { AppointmentReminderService } from '../appointmentReminders';
import { emailService } from '../emailService';
import { supabase } from '@/lib/supabase/client';
import { eventBus } from '@/lib/events';

// Mock dependencies
vi.mock('../emailService');
vi.mock('@/lib/supabase/client');
vi.mock('@/lib/events');

describe('AppointmentReminderService', () => {
  let service: AppointmentReminderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AppointmentReminderService();
  });

  afterEach(() => {
    if (service) {
      service.stop();
    }
  });

  describe('Service Lifecycle', () => {
    it('should initialize service without starting', () => {
      expect(service.getStatus().isRunning).toBe(false);
    });

    it('should start service and set running flag', () => {
      service.start();
      expect(service.getStatus().isRunning).toBe(true);
    });

    it('should stop service and clear running flag', () => {
      service.start();
      service.stop();
      expect(service.getStatus().isRunning).toBe(false);
    });

    it('should not start service twice', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      service.start();
      service.start();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AppointmentReminders] Service already running'
      );
    });

    it('should not stop service if not running', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      service.stop();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AppointmentReminders] Service not running'
      );
    });
  });

  describe('Reminder Rules', () => {
    it('should have 24h and 2h reminder rules', () => {
      const status = service.getStatus();
      expect(status.rules).toHaveLength(2);
      expect(status.rules[0].hours_before).toBe(24);
      expect(status.rules[1].hours_before).toBe(2);
    });

    it('should use correct channels for each rule', () => {
      const status = service.getStatus();
      expect(status.rules[0].channels).toContain('email');
      expect(status.rules[1].channels).toContain('email');
    });

    it('should use correct column names for tracking', () => {
      const status = service.getStatus();
      expect(status.rules[0].column_name).toBe('reminder_sent_24h');
      expect(status.rules[1].column_name).toBe('reminder_sent_2h');
    });
  });

  describe('sendTestReminder', () => {
    it('should send test reminder for valid appointment', async () => {
      const mockAppointment = {
        id: 'test-appointment-1',
        order_type: 'APPOINTMENT',
        order_status: 'CONFIRMED',
        scheduled_time: addDays(new Date(), 1).toISOString(),
        customer: {
          id: 'customer-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
        staff: {
          id: 'staff-1',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321',
        },
        service: {
          id: 'service-1',
          name: 'Haircut',
          duration_minutes: 60,
          category: 'Beauty',
        },
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAppointment,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      } as any);

      vi.mocked(emailService.sendAppointmentReminder).mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
      });

      await service.sendTestReminder('test-appointment-1');

      expect(emailService.sendAppointmentReminder).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          customerName: 'John Doe',
          serviceName: 'Haircut',
          professionalName: 'Jane Smith',
        })
      );
    });

    it('should handle missing appointment gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      } as any);

      const consoleSpy = vi.spyOn(console, 'error');

      await service.sendTestReminder('non-existent-appointment');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[AppointmentReminders] Appointment not found:',
        expect.any(Object)
      );
    });
  });

  describe('Event Emissions', () => {
    it('should emit success event when reminder is sent', async () => {
      const mockAppointment = {
        id: 'test-appointment-1',
        order_type: 'APPOINTMENT',
        order_status: 'CONFIRMED',
        scheduled_time: addDays(new Date(), 1).toISOString(),
        customer: {
          id: 'customer-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        staff: {
          id: 'staff-1',
          name: 'Jane Smith',
        },
        service: {
          id: 'service-1',
          name: 'Haircut',
          duration_minutes: 60,
        },
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAppointment,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      } as any);

      vi.mocked(emailService.sendAppointmentReminder).mockResolvedValue({
        success: true,
      });

      await service.sendTestReminder('test-appointment-1');

      expect(eventBus.emit).toHaveBeenCalledWith(
        'appointment.reminder.sent',
        expect.objectContaining({
          appointmentId: 'test-appointment-1',
          customerId: 'customer-1',
          hoursBefore: 24,
          channels: ['email'],
        })
      );
    });

    it('should emit failure event when reminder fails', async () => {
      const mockAppointment = {
        id: 'test-appointment-1',
        order_type: 'APPOINTMENT',
        order_status: 'CONFIRMED',
        scheduled_time: addDays(new Date(), 1).toISOString(),
        customer: {
          id: 'customer-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        staff: {
          id: 'staff-1',
          name: 'Jane Smith',
        },
        service: {
          id: 'service-1',
          name: 'Haircut',
          duration_minutes: 60,
        },
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAppointment,
              error: null,
            }),
          }),
        }),
      } as any);

      vi.mocked(emailService.sendAppointmentReminder).mockRejectedValue(
        new Error('Email service unavailable')
      );

      await service.sendTestReminder('test-appointment-1');

      expect(eventBus.emit).toHaveBeenCalledWith(
        'appointment.reminder.failed',
        expect.objectContaining({
          appointmentId: 'test-appointment-1',
          customerId: 'customer-1',
          error: 'Email service unavailable',
        })
      );
    });
  });
});
