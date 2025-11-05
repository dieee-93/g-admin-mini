/**
 * MEMBERSHIP TYPES
 * Type definitions for membership system
 */

export interface MembershipTier {
  id: string;
  tier_name: string;
  tier_level: number;
  monthly_price: number;
  yearly_price: number | null;
  discount_percentage: number;
  description: string | null;
  features: string[];
  max_guests: number;
  personal_trainer_sessions: number;
  nutrition_consultations: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  benefits?: MemberBenefit[];
  member_count?: number;
}

export interface Membership {
  id: string;
  customer_id: string;
  tier_id: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  payment_frequency: 'monthly' | 'quarterly' | 'yearly';
  registration_fee: number;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  tier?: MembershipTier;
  usage_count?: number;
  last_check_in?: string | null;
}

export interface MemberBenefit {
  id: string;
  tier_id: string;
  benefit_type: 'discount' | 'free_item' | 'priority_service' | 'early_access' | 'facility_access';
  benefit_value: Record<string, unknown>;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  tier?: MembershipTier;
}

export interface MembershipUsage {
  id: string;
  membership_id: string;
  benefit_id: string | null;
  usage_type: 'check_in' | 'check_out' | 'benefit_used' | 'guest_access';
  used_at: string;
  order_id: string | null;
  facility: string | null;
  notes: string | null;

  // Relations
  membership?: Membership;
  benefit?: MemberBenefit;
}

export interface MembershipMetrics {
  total_members: number;
  active_members: number;
  expired_members: number;
  suspended_members: number;
  cancelled_members: number;
  new_this_month: number; // New members created this month
  members_by_tier: {
    tier_name: string;
    tier_level: number;
    count: number;
    revenue: number;
  }[];
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  expiring_soon: number;
  check_ins_today: number;
  avg_monthly_visits: number;
}

export interface CreateMembershipInput {
  customer_id: string;
  tier_id: string;
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;
  payment_frequency?: 'monthly' | 'quarterly' | 'yearly';
  registration_fee?: number;
  notes?: string;
}

export interface UpdateMembershipInput {
  tier_id?: string;
  status?: 'active' | 'expired' | 'cancelled' | 'suspended';
  end_date?: string;
  auto_renew?: boolean;
  payment_frequency?: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
}

export interface CheckInInput {
  membership_id: string;
  facility?: string;
  notes?: string;
}

export interface UseBenefitInput {
  membership_id: string;
  benefit_id: string;
  order_id?: string;
  notes?: string;
}
