/**
 * MEMBERSHIP API SERVICE
 * Real database operations for membership management
 */

import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';
import type { AuthUser } from '@/contexts/AuthContext';
import type {
  Membership,
  MembershipTier,
  MemberBenefit,
  MembershipUsage,
  MembershipMetrics,
  CreateMembershipInput,
  UpdateMembershipInput,
  CheckInInput,
  UseBenefitInput,
} from '../types';

// ============================================
// PERMISSION HELPERS
// ============================================

function requireStaffRole(user?: AuthUser | null): void {
  if (!user) {
    throw new Error('Authentication required');
  }

  const allowedRoles = ['SUPERVISOR', 'ADMINISTRADOR', 'GERENTE', 'SUPERADMIN'];
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions - Staff role required');
  }
}

// ============================================
// MEMBERSHIP TIERS
// ============================================

export async function getMembershipTiers(): Promise<MembershipTier[]> {
  logger.info('MembershipAPI', 'Fetching membership tiers');

  const { data, error } = await supabase
    .from('membership_tiers')
    .select('*')
    .eq('is_active', true)
    .order('tier_level', { ascending: true });

  if (error) {
    logger.error('MembershipAPI', 'Error fetching tiers', error);
    throw error;
  }

  logger.info('MembershipAPI', `Fetched ${data?.length || 0} tiers`);
  return data || [];
}

export async function getTierById(id: string): Promise<MembershipTier> {
  logger.info('MembershipAPI', 'Fetching tier by ID', { id });

  const { data, error } = await supabase
    .from('membership_tiers')
    .select(`
      *,
      benefits:member_benefits(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error fetching tier', error);
    throw error;
  }

  return data;
}

// ============================================
// MEMBERSHIPS CRUD
// ============================================

export async function getMemberships(user?: AuthUser | null): Promise<Membership[]> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Fetching all memberships');

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('MembershipAPI', 'Error fetching memberships', error);
    throw error;
  }

  logger.info('MembershipAPI', `Fetched ${data?.length || 0} memberships`);
  return data || [];
}

export async function getActiveMemberships(user?: AuthUser | null): Promise<Membership[]> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Fetching active memberships');

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('MembershipAPI', 'Error fetching active memberships', error);
    throw error;
  }

  return data || [];
}

export async function getMembershipById(id: string, user?: AuthUser | null): Promise<Membership> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Fetching membership by ID', { id });

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      customer:customers(*),
      tier:membership_tiers(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error fetching membership', error);
    throw error;
  }

  return data;
}

export async function getMembershipByCustomerId(customerId: string): Promise<Membership | null> {
  logger.info('MembershipAPI', 'Fetching membership by customer ID', { customerId });

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      tier:membership_tiers(*)
    `)
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    logger.error('MembershipAPI', 'Error fetching membership by customer', error);
    throw error;
  }

  return data;
}

export async function createMembership(
  input: CreateMembershipInput,
  user: AuthUser
): Promise<Membership> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Creating membership', { input });

  // Check if customer already has an active membership
  const existing = await getMembershipByCustomerId(input.customer_id);
  if (existing) {
    throw new Error('Customer already has an active membership');
  }

  const { data, error } = await supabase
    .from('memberships')
    .insert({
      customer_id: input.customer_id,
      tier_id: input.tier_id,
      start_date: input.start_date || new Date().toISOString().split('T')[0],
      end_date: input.end_date,
      auto_renew: input.auto_renew ?? true,
      payment_frequency: input.payment_frequency || 'monthly',
      registration_fee: input.registration_fee || 0,
      notes: input.notes,
      status: 'active'
    })
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error creating membership', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Membership created', { id: data.id });
  return data;
}

export async function updateMembership(
  id: string,
  updates: UpdateMembershipInput,
  user: AuthUser
): Promise<Membership> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Updating membership', { id, updates });

  const { data, error } = await supabase
    .from('memberships')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error updating membership', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Membership updated', { id });
  return data;
}

export async function upgradeMembership(
  id: string,
  newTierId: string,
  user: AuthUser
): Promise<Membership> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Upgrading membership', { id, newTierId });

  const { data, error } = await supabase
    .from('memberships')
    .update({
      tier_id: newTierId,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error upgrading membership', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Membership upgraded', { id });
  return data;
}

export async function cancelMembership(id: string, user: AuthUser): Promise<Membership> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Cancelling membership', { id });

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: 'cancelled',
      auto_renew: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error cancelling membership', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Membership cancelled', { id });
  return data;
}

export async function renewMembership(id: string, user: AuthUser): Promise<Membership> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Renewing membership', { id });

  // Get current membership to calculate new end date
  const membership = await getMembershipById(id, user);

  let newEndDate: string;
  const now = new Date();

  switch (membership.payment_frequency) {
    case 'monthly':
      newEndDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];
      break;
    case 'quarterly':
      newEndDate = new Date(now.setMonth(now.getMonth() + 3)).toISOString().split('T')[0];
      break;
    case 'yearly':
      newEndDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString().split('T')[0];
      break;
    default:
      newEndDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: 'active',
      end_date: newEndDate,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error renewing membership', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Membership renewed', { id, newEndDate });
  return data;
}

// ============================================
// MEMBER BENEFITS
// ============================================

export async function getBenefitsByTier(tierId: string): Promise<MemberBenefit[]> {
  logger.info('MembershipAPI', 'Fetching benefits by tier', { tierId });

  const { data, error } = await supabase
    .from('member_benefits')
    .select('*')
    .eq('tier_id', tierId)
    .eq('is_active', true);

  if (error) {
    logger.error('MembershipAPI', 'Error fetching benefits', error);
    throw error;
  }

  return data || [];
}

export async function checkBenefitAccess(
  membershipId: string,
  benefitId: string
): Promise<{ hasAccess: boolean; reason?: string; benefit?: MemberBenefit }> {
  logger.info('MembershipAPI', 'Checking benefit access', { membershipId, benefitId });

  // Get membership with tier
  const { data: membership, error: memberError } = await supabase
    .from('memberships')
    .select('tier_id, status')
    .eq('id', membershipId)
    .single();

  if (memberError) {
    logger.error('MembershipAPI', 'Error fetching membership for benefit check', memberError);
    return { hasAccess: false, reason: 'Membership not found' };
  }

  // Check if membership is active
  if (membership.status !== 'active') {
    return { hasAccess: false, reason: 'Membership not active' };
  }

  // Check if benefit belongs to this tier
  const { data: benefit, error: benefitError } = await supabase
    .from('member_benefits')
    .select('*')
    .eq('id', benefitId)
    .eq('tier_id', membership.tier_id)
    .eq('is_active', true)
    .maybeSingle();

  if (benefitError || !benefit) {
    return { hasAccess: false, reason: 'Benefit not available for this tier' };
  }

  return { hasAccess: true, benefit };
}

// ============================================
// MEMBERSHIP USAGE
// ============================================

export async function checkIn(input: CheckInInput, user: AuthUser): Promise<MembershipUsage> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Recording check-in', { input });

  const { data, error } = await supabase
    .from('membership_usage')
    .insert({
      membership_id: input.membership_id,
      usage_type: 'check_in',
      facility: input.facility,
      notes: input.notes,
      used_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error recording check-in', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Check-in recorded', { id: data.id });
  return data;
}

export async function checkOut(membershipId: string, user: AuthUser): Promise<MembershipUsage> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Recording check-out', { membershipId });

  const { data, error } = await supabase
    .from('membership_usage')
    .insert({
      membership_id: membershipId,
      usage_type: 'check_out',
      used_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error recording check-out', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Check-out recorded', { id: data.id });
  return data;
}

export async function useBenefit(input: UseBenefitInput, user: AuthUser): Promise<MembershipUsage> {
  requireStaffRole(user);

  logger.info('MembershipAPI', 'Recording benefit usage', { input });

  // Verify access first
  const access = await checkBenefitAccess(input.membership_id, input.benefit_id);
  if (!access.hasAccess) {
    throw new Error(access.reason || 'Access denied');
  }

  const { data, error } = await supabase
    .from('membership_usage')
    .insert({
      membership_id: input.membership_id,
      benefit_id: input.benefit_id,
      usage_type: 'benefit_used',
      order_id: input.order_id,
      notes: input.notes,
      used_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    logger.error('MembershipAPI', 'Error recording benefit usage', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Benefit usage recorded', { id: data.id });
  return data;
}

export async function getMembershipUsage(membershipId: string): Promise<MembershipUsage[]> {
  logger.info('MembershipAPI', 'Fetching membership usage', { membershipId });

  const { data, error } = await supabase
    .from('membership_usage')
    .select('*')
    .eq('membership_id', membershipId)
    .order('used_at', { ascending: false })
    .limit(100);

  if (error) {
    logger.error('MembershipAPI', 'Error fetching membership usage', error);
    throw error;
  }

  return data || [];
}

// ============================================
// ANALYTICS
// ============================================

export async function getMembershipMetrics(): Promise<MembershipMetrics> {
  logger.info('MembershipAPI', 'Fetching membership metrics');

  const { data, error } = await supabase.rpc('get_membership_metrics');

  if (error) {
    logger.error('MembershipAPI', 'Error fetching metrics', error);
    throw error;
  }

  logger.info('MembershipAPI', 'Metrics fetched', data);
  return data;
}

export async function getExpiringMemberships(days: number = 30): Promise<Membership[]> {
  logger.info('MembershipAPI', 'Fetching expiring memberships', { days });

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      customer:customers(id, name, email, phone),
      tier:membership_tiers(*)
    `)
    .eq('status', 'active')
    .not('end_date', 'is', null)
    .lte('end_date', futureDate.toISOString().split('T')[0])
    .order('end_date', { ascending: true });

  if (error) {
    logger.error('MembershipAPI', 'Error fetching expiring memberships', error);
    throw error;
  }

  return data || [];
}

// ============================================
// EVENTBUS HANDLERS
// ============================================

/**
 * Activate or renew membership when payment is received
 * Called by billing.payment_received event
 */
export async function activateMembershipOnPayment(customerId: string): Promise<Membership | null> {
  logger.info('MembershipAPI', 'Activating membership on payment', { customerId });

  try {
    // Check if customer already has a membership
    const existing = await getMembershipByCustomerId(customerId);

    if (existing) {
      // If membership exists but is expired/cancelled, reactivate it
      if (existing.status === 'expired' || existing.status === 'cancelled') {
        logger.info('MembershipAPI', 'Reactivating existing membership', { id: existing.id });

        // Calculate new end date based on payment frequency
        const now = new Date();
        let newEndDate: string;

        switch (existing.payment_frequency) {
          case 'monthly':
            newEndDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];
            break;
          case 'quarterly':
            newEndDate = new Date(now.setMonth(now.getMonth() + 3)).toISOString().split('T')[0];
            break;
          case 'yearly':
            newEndDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString().split('T')[0];
            break;
          default:
            newEndDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];
        }

        const { data, error } = await supabase
          .from('memberships')
          .update({
            status: 'active',
            end_date: newEndDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        logger.info('MembershipAPI', 'Membership reactivated successfully', { id: existing.id });
        return data;
      } else {
        // If membership is already active, just log
        logger.info('MembershipAPI', 'Membership already active, no action needed', { id: existing.id });
        return existing;
      }
    } else {
      // No membership found - customer needs to enroll first
      logger.warn('MembershipAPI', 'No membership found for customer, cannot activate', { customerId });
      return null;
    }
  } catch (error) {
    logger.error('MembershipAPI', 'Error activating membership on payment', error);
    throw error;
  }
}

/**
 * Mark membership as expired when subscription ends
 * Called by billing.subscription_ended event
 */
export async function expireMembershipOnSubscriptionEnd(customerId: string): Promise<Membership | null> {
  logger.info('MembershipAPI', 'Expiring membership on subscription end', { customerId });

  try {
    // Find active membership for customer
    const existing = await getMembershipByCustomerId(customerId);

    if (!existing) {
      logger.warn('MembershipAPI', 'No active membership found for customer', { customerId });
      return null;
    }

    if (existing.status !== 'active') {
      logger.info('MembershipAPI', 'Membership already inactive', { id: existing.id, status: existing.status });
      return existing;
    }

    // Mark as expired and disable auto-renewal
    const { data, error } = await supabase
      .from('memberships')
      .update({
        status: 'expired',
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    logger.info('MembershipAPI', 'Membership expired successfully', { id: existing.id });
    return data;
  } catch (error) {
    logger.error('MembershipAPI', 'Error expiring membership on subscription end', error);
    throw error;
  }
}
