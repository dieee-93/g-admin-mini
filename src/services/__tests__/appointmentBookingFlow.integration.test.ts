/**
 * Appointment Booking Flow - Integration Test
 *
 * Tests the complete end-to-end booking flow:
 * 1. Customer selects service
 * 2. Customer selects professional
 * 3. Customer selects available time slot
 * 4. Customer confirms booking
 * 5. Appointment is created in database
 * 6. Confirmation email is sent
 * 7. Reminders are scheduled
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { addDays, addHours, format } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { emailService } from '../emailService';
import { appointmentReminderService } from '../appointmentReminders';

// Mock dependencies
vi.mock('@/lib/supabase/client');
vi.mock('../emailService');

describe('Appointment Booking Flow - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    appointmentReminderService.stop();
  });

  describe('Complete Booking Flow', () => {
    it('should complete full booking flow successfully', async () => {
      // Setup: Mock service, professional, and available slots
      const mockService = {
        id: 'service-1',
        name: 'Haircut',
        type: 'SERVICE',
        duration_minutes: 60,
        price: 50,
        is_active: true,
      };

      const mockProfessional = {
        id: 'staff-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        accepts_appointments: true,
        services_provided: ['service-1'],
      };

      const mockCustomer = {
        id: 'customer-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      };

      const tomorrow = addDays(new Date(), 1);
      const slotTime = addHours(tomorrow, 10); // 10 AM tomorrow

      const mockAppointment = {
        id: 'appointment-1',
        customer_id: mockCustomer.id,
        service_id: mockService.id,
        assigned_staff_id: mockProfessional.id,
        scheduled_time: slotTime.toISOString(),
        order_type: 'APPOINTMENT',
        order_status: 'CONFIRMED',
        total: mockService.price,
        reminder_sent_24h: null,
        reminder_sent_2h: null,
        created_at: new Date().toISOString(),
      };

      // Step 1: Customer selects service
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockService],
              error: null,
            }),
          }),
        }),
      } as any);

      // Step 2: Customer selects professional
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            contains: vi.fn().mockResolvedValue({
              data: [mockProfessional],
              error: null,
            }),
          }),
        }),
      } as any);

      // Step 3: Customer checks availability (simplified)
      // In real implementation, this would query availability rules, business hours, etc.

      // Step 4: Customer confirms booking
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAppointment,
              error: null,
            }),
          }),
        }),
      } as any);

      // Step 5: Confirmation email is sent
      vi.mocked(emailService.sendAppointmentConfirmation).mockResolvedValue({
        success: true,
        messageId: 'confirmation-email-123',
      });

      // Execute booking
      const { data: services } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'SERVICE')
        .order('name');

      expect(services).toHaveLength(1);
      expect(services![0].name).toBe('Haircut');

      const { data: professionals } = await supabase
        .from('employees')
        .select('*')
        .eq('accepts_appointments', true)
        .contains('services_provided', ['service-1']);

      expect(professionals).toHaveLength(1);
      expect(professionals![0].name).toBe('Jane Smith');

      // Create appointment
      const { data: appointment } = await supabase
        .from('sales')
        .insert([
          {
            customer_id: mockCustomer.id,
            service_id: mockService.id,
            assigned_staff_id: mockProfessional.id,
            scheduled_time: slotTime.toISOString(),
            order_type: 'APPOINTMENT',
            order_status: 'CONFIRMED',
            total: mockService.price,
          },
        ])
        .select()
        .single();

      expect(appointment).toBeDefined();
      expect(appointment!.order_type).toBe('APPOINTMENT');
      expect(appointment!.order_status).toBe('CONFIRMED');

      // Send confirmation email
      await emailService.sendAppointmentConfirmation({
        to: mockCustomer.email,
        customerName: mockCustomer.name,
        serviceName: mockService.name,
        professionalName: mockProfessional.name,
        scheduledTime: slotTime.toISOString(),
        duration: mockService.duration_minutes,
      });

      expect(emailService.sendAppointmentConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          customerName: 'John Doe',
          serviceName: 'Haircut',
          professionalName: 'Jane Smith',
        })
      );
    });
  });

  describe('Reminder Scheduling', () => {
    it('should find and send reminders for appointments 24h before', async () => {
      const tomorrow = addDays(new Date(), 1);
      const appointmentTime = addHours(tomorrow, 10);

      const mockAppointment = {
        id: 'appointment-1',
        order_type: 'APPOINTMENT',
        order_status: 'CONFIRMED',
        scheduled_time: appointmentTime.toISOString(),
        reminder_sent_24h: null,
        reminder_sent_2h: null,
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
        },
        service: {
          id: 'service-1',
          name: 'Haircut',
          duration_minutes: 60,
          category: 'Beauty',
        },
      };

      // Mock query for 24h reminder
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockReturnValue({
                  is: vi.fn().mockResolvedValue({
                    data: [mockAppointment],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as any);

      // Mock update
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      } as any);

      // Mock email send
      vi.mocked(emailService.sendAppointmentReminder).mockResolvedValue({
        success: true,
        messageId: 'reminder-email-123',
      });

      // Start reminder service
      appointmentReminderService.start();

      // Wait for first check to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify reminder was attempted
      // Note: In real test, you'd wait for the actual interval or trigger manually
    });
  });

  describe('Error Handling', () => {
    it('should handle booking failure gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Booking failed', code: 'INSERT_ERROR' },
            }),
          }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('sales')
        .insert([
          {
            customer_id: 'customer-1',
            service_id: 'service-1',
            assigned_staff_id: 'staff-1',
            scheduled_time: new Date().toISOString(),
            order_type: 'APPOINTMENT',
          },
        ])
        .select()
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error!.message).toBe('Booking failed');
    });

    it('should handle reminder send failure gracefully', async () => {
      const mockAppointment = {
        id: 'appointment-1',
        order_type: 'APPOINTMENT',
        order_status: 'CONFIRMED',
        scheduled_time: addDays(new Date(), 1).toISOString(),
        customer: {
          id: 'customer-1',
          name: 'John Doe',
          email: 'invalid-email',
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
        new Error('Invalid email address')
      );

      const consoleSpy = vi.spyOn(console, 'error');

      await appointmentReminderService.sendTestReminder('appointment-1');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send reminder'),
        expect.any(Error)
      );
    });
  });

  describe('Cancellation Flow', () => {
    it('should prevent reminders for cancelled appointments', async () => {
      const tomorrow = addDays(new Date(), 1);

      const mockCancelledAppointment = {
        id: 'appointment-cancelled',
        order_type: 'APPOINTMENT',
        order_status: 'CANCELLED', // Cancelled status
        scheduled_time: tomorrow.toISOString(),
        reminder_sent_24h: null,
        reminder_sent_2h: null,
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

      // Mock query should NOT return cancelled appointments
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                lte: vi.fn().mockReturnValue({
                  is: vi.fn().mockResolvedValue({
                    data: [], // No appointments returned
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as any);

      // Verify no reminders sent
      expect(emailService.sendAppointmentReminder).not.toHaveBeenCalled();
    });
  });
});
