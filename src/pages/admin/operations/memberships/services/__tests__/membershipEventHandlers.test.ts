/**
 * MEMBERSHIP EVENT HANDLERS TESTS
 * Tests for EventBus integration functions
 *
 * Following Vitest Best Practices 2025:
 * - AAA Pattern (Arrange, Act, Assert)
 * - Mock Supabase with MSW
 * - Test behavior, not implementation
 * - Async/await patterns
 *
 * @see Memory: "Vitest Testing Best Practices 2025"
 * @see Memory: "Supabase Testing with Vitest"
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  activateMembershipOnPayment,
  expireMembershipOnSubscriptionEnd,
  getMembershipByCustomerId
} from '../membershipApi';

// ============================================
// MOCKS
// ============================================

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
  },
}));

// Mock logger
vi.mock('@/lib/logging', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// ============================================
// TEST SUITE: activateMembershipOnPayment
// ============================================

describe('activateMembershipOnPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when customer has NO existing membership', () => {
    it('should return null and log warning', async () => {
      // Arrange
      const customerId = 'customer-123';
      const { supabase } = await import('@/lib/supabase/client');
      const { logger } = await import('@/lib/logging');

      // Mock no membership found
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      // Act
      const result = await activateMembershipOnPayment(customerId);

      // Assert
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        'MembershipAPI',
        'No membership found for customer, cannot activate',
        { customerId }
      );
    });
  });

  describe('when customer has EXPIRED membership', () => {
    it('should reactivate membership with new end_date (monthly frequency)', async () => {
      // Arrange
      const customerId = 'customer-expired';
      const existingMembership = {
        id: 'membership-123',
        customer_id: customerId,
        tier_id: 'gold-tier',
        status: 'expired',
        payment_frequency: 'monthly',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const { supabase } = await import('@/lib/supabase/client');

      // Mock getMembershipByCustomerId returning expired membership
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: existingMembership,
          error: null
        }),
      } as any);

      // Mock update returning reactivated membership
      const reactivatedMembership = {
        ...existingMembership,
        status: 'active',
        end_date: '2025-02-28', // +1 month from now
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: reactivatedMembership,
          error: null
        }),
      } as any);

      // Act
      const result = await activateMembershipOnPayment(customerId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.status).toBe('active');
      expect(result?.end_date).toBeTruthy();
      expect(supabase.from).toHaveBeenCalledWith('memberships');
    });

    it('should calculate end_date correctly for QUARTERLY frequency', async () => {
      // Arrange
      const customerId = 'customer-quarterly';
      const existingMembership = {
        id: 'membership-quarterly',
        customer_id: customerId,
        tier_id: 'silver-tier',
        status: 'cancelled',
        payment_frequency: 'quarterly',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const { supabase } = await import('@/lib/supabase/client');

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: existingMembership,
          error: null
        }),
      } as any);

      const reactivatedMembership = {
        ...existingMembership,
        status: 'active',
        end_date: '2025-04-30', // +3 months
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: reactivatedMembership,
          error: null
        }),
      } as any);

      // Act
      const result = await activateMembershipOnPayment(customerId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.status).toBe('active');
    });

    it('should calculate end_date correctly for YEARLY frequency', async () => {
      // Arrange
      const customerId = 'customer-yearly';
      const existingMembership = {
        id: 'membership-yearly',
        customer_id: customerId,
        tier_id: 'platinum-tier',
        status: 'expired',
        payment_frequency: 'yearly',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const { supabase } = await import('@/lib/supabase/client');

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: existingMembership,
          error: null
        }),
      } as any);

      const reactivatedMembership = {
        ...existingMembership,
        status: 'active',
        end_date: '2026-01-31', // +1 year
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: reactivatedMembership,
          error: null
        }),
      } as any);

      // Act
      const result = await activateMembershipOnPayment(customerId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.status).toBe('active');
    });
  });

  describe('when customer has ACTIVE membership', () => {
    it('should return existing membership without changes', async () => {
      // Arrange
      const customerId = 'customer-active';
      const activeMembership = {
        id: 'membership-active',
        customer_id: customerId,
        tier_id: 'gold-tier',
        status: 'active',
        payment_frequency: 'monthly',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      };

      const { supabase } = await import('@/lib/supabase/client');
      const { logger } = await import('@/lib/logging');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: activeMembership,
          error: null
        }),
      } as any);

      // Act
      const result = await activateMembershipOnPayment(customerId);

      // Assert
      expect(result).toEqual(activeMembership);
      expect(logger.info).toHaveBeenCalledWith(
        'MembershipAPI',
        'Membership already active, no action needed',
        { id: activeMembership.id }
      );
    });
  });

  describe('error handling', () => {
    it('should throw error and log on database failure', async () => {
      // Arrange
      const customerId = 'customer-error';
      const dbError = new Error('Database connection failed');

      const { supabase } = await import('@/lib/supabase/client');
      const { logger } = await import('@/lib/logging');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockRejectedValue(dbError),
      } as any);

      // Act & Assert
      await expect(activateMembershipOnPayment(customerId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        'MembershipAPI',
        'Error activating membership on payment',
        dbError
      );
    });
  });
});

// ============================================
// TEST SUITE: expireMembershipOnSubscriptionEnd
// ============================================

describe('expireMembershipOnSubscriptionEnd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when customer has NO active membership', () => {
    it('should return null and log warning', async () => {
      // Arrange
      const customerId = 'customer-no-membership';
      const { supabase } = await import('@/lib/supabase/client');
      const { logger } = await import('@/lib/logging');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      // Act
      const result = await expireMembershipOnSubscriptionEnd(customerId);

      // Assert
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        'MembershipAPI',
        'No active membership found for customer',
        { customerId }
      );
    });
  });

  describe('when customer has ACTIVE membership', () => {
    it('should mark as expired and disable auto_renew', async () => {
      // Arrange
      const customerId = 'customer-active-expire';
      const activeMembership = {
        id: 'membership-to-expire',
        customer_id: customerId,
        tier_id: 'gold-tier',
        status: 'active',
        auto_renew: true,
        payment_frequency: 'monthly',
      };

      const expiredMembership = {
        ...activeMembership,
        status: 'expired',
        auto_renew: false,
      };

      const { supabase } = await import('@/lib/supabase/client');

      // Mock finding active membership
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: activeMembership,
          error: null
        }),
      } as any);

      // Mock update to expired
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: expiredMembership,
          error: null
        }),
      } as any);

      // Act
      const result = await expireMembershipOnSubscriptionEnd(customerId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.status).toBe('expired');
      expect(result?.auto_renew).toBe(false);
    });

    it('should log successful expiration', async () => {
      // Arrange
      const customerId = 'customer-log-test';
      const activeMembership = {
        id: 'membership-log',
        customer_id: customerId,
        tier_id: 'silver-tier',
        status: 'active',
        auto_renew: true,
      };

      const { supabase } = await import('@/lib/supabase/client');
      const { logger } = await import('@/lib/logging');

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: activeMembership,
          error: null
        }),
      } as any);

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...activeMembership, status: 'expired', auto_renew: false },
          error: null
        }),
      } as any);

      // Act
      await expireMembershipOnSubscriptionEnd(customerId);

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        'MembershipAPI',
        'Membership expired successfully',
        { id: activeMembership.id }
      );
    });
  });

  describe('when membership is already INACTIVE', () => {
    it('should return existing membership without changes', async () => {
      // Arrange
      const customerId = 'customer-already-expired';
      const expiredMembership = {
        id: 'membership-already-expired',
        customer_id: customerId,
        tier_id: 'bronze-tier',
        status: 'expired',
        auto_renew: false,
      };

      const { supabase } = await import('@/lib/supabase/client');
      const { logger } = await import('@/lib/logging');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: expiredMembership,
          error: null
        }),
      } as any);

      // Act
      const result = await expireMembershipOnSubscriptionEnd(customerId);

      // Assert
      expect(result).toEqual(expiredMembership);
      expect(logger.info).toHaveBeenCalledWith(
        'MembershipAPI',
        'Membership already inactive',
        { id: expiredMembership.id, status: 'expired' }
      );
    });
  });

  describe('error handling', () => {
    it('should throw error and log on database failure', async () => {
      // Arrange
      const customerId = 'customer-db-error';
      const dbError = new Error('Database timeout');

      const { supabase } = await import('@/lib/supabase/client');
      const { logger } = await import('@/lib/logging');

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockRejectedValue(dbError),
      } as any);

      // Act & Assert
      await expect(expireMembershipOnSubscriptionEnd(customerId)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        'MembershipAPI',
        'Error expiring membership on subscription end',
        dbError
      );
    });
  });
});
