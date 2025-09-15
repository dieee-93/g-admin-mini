
// ==========================================
// G-ADMIN CUSTOMER MODULE - COMPREHENSIVE TYPES
// Following Screaming Architecture Pattern
// RFM Analytics + Customer Intelligence + Marketing Automation
// ==========================================

// ===== CORE CUSTOMER TYPES =====

export interface Customer {
  // Basic Information (existing)
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile extends Customer {
  // Advanced CRM Features
  tags: CustomerTag[];
  notes: CustomerNote[];
  preferences: CustomerPreferences;
  special_occasions: SpecialOccasion[];
  
  // Engagement Tracking
  communication_preferences: CommunicationPreferences;
  
  // Analytics Data
  rfm_profile: CustomerRFMProfile;
  last_visit: Date;
  total_visits: number;
  total_spent: number;
  favorite_items: string[]; // Product IDs most ordered
  
  // Status & Flags
  is_vip: boolean;
  loyalty_tier: LoyaltyTier;
  blacklisted: boolean;
  churn_risk: ChurnRisk;
  
  // Compatibility fields for legacy components
  customer_id?: string; // alias for id
  segment?: CustomerSegment; // flattened segment from rfm_profile
  last_order_days_ago?: number;
}

// ===== RFM ANALYTICS SYSTEM =====

export interface CustomerRFMProfile {
  // JSONB RFM metrics structure (matching new schema)
  rfm_metrics: {
    recency_score: number;       // 1-5 (days since last visit)
    frequency_score: number;     // 1-5 (# visits in period)  
    monetary_score: number;      // 1-5 (total spending/average)
    segment: CustomerSegment;    // Calculated segment
  };
  
  // Compatibility field for legacy components
  segment?: CustomerSegment;
  
  // JSONB intelligence structure
  intelligence: {
    lifetime_value: number;      // CLV calculated
    avg_order_value: number;
    visit_frequency: number;     // visits per month
    churn_risk: ChurnRisk;
    preferred_time_slots: string[]; // lunch, dinner, weekend
    seasonal_patterns: string[];    // summer, holidays
    price_sensitivity: PriceSensitivity;
  };
  
  // JSONB status structure
  status: {
    is_vip: boolean;
    loyalty_tier: LoyaltyTier;
    blacklisted: boolean;
  };
  
  // JSONB raw data structure
  raw_data: {
    recency_days: number;
    frequency_count: number;
    monetary_total: number;
  };
  
  // Metadata timestamps
  calculated_at: Date;
  created_at: Date;
  updated_at: Date;
}

export enum CustomerSegment {
  CHAMPIONS = 'champions',           // 555, 554, 544 - Best customers
  LOYAL = 'loyal',                  // 543, 444, 435 - Regular buyers
  POTENTIAL_LOYALISTS = 'potential', // 512, 511 - Recent customers
  NEW_CUSTOMERS = 'new',            // 5XX with low frequency
  PROMISING = 'promising',          // 411, 412 - Good potential
  NEED_ATTENTION = 'attention',     // 512, 412 - Medium value
  ABOUT_TO_SLEEP = 'sleep',        // 331, 321 - Decreasing
  AT_RISK = 'at_risk',             // 244, 234 - Important but declining
  CANNOT_LOSE = 'cannot_lose',     // 155, 144 - High spenders, low freq
  HIBERNATING = 'hibernating',     // 244, 234 - Lost customers
  LOST = 'lost'                    // 155, 144, 111 - Gone
}

export enum ChurnRisk {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum PriceSensitivity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

// ===== CUSTOMER ORGANIZATION SYSTEM =====

export interface CustomerTag {
  id: number;  // Changed to BIGINT from new schema
  name: string;
  color: string;
  category: 'behavior' | 'preference' | 'demographic' | 'custom';
  description?: string;
  metadata?: Record<string, unknown>; // JSONB metadata field
  created_at: Date;
  updated_at: Date;
}

export interface CustomerNote {
  id: number;  // Changed to BIGINT from new schema
  customer_id: string;
  content: string;
  type: 'general' | 'service' | 'complaint' | 'compliment' | 'dietary';
  created_by: string;              // Staff member
  created_at: Date;
  updated_at: Date;                // Added from new schema
  is_important: boolean;
  is_private: boolean;             // Internal staff notes
  metadata?: Record<string, unknown>; // JSONB metadata field
}

export interface CustomerPreferences {
  // JSONB dietary profile structure (matching new schema)
  dietary_profile: {
    restrictions: string[];    // vegan, gluten-free, lactose-free
    allergies: string[];      // CRITICAL for food safety
    favorite_cuisines: string[];
    disliked_items: string[];
  };
  
  // JSONB preferences structure
  preferences: {
    seating?: string;         // booth, window, outdoor
    party_size: number;
    preferred_server?: string;
    service_pace?: 'quick' | 'standard' | 'leisurely';
    special_requests: string[]; // no ice, sauce on side
  };
  
  // JSONB communication structure
  communication: {
    preferred_contact_time?: string;  // morning, afternoon, evening
    contact_frequency?: 'weekly' | 'monthly' | 'rarely';
  };
  
  // Metadata timestamps
  created_at: Date;
  updated_at: Date;
}

export interface CommunicationPreferences {
  email_marketing: boolean;
  sms_marketing: boolean;
  birthday_offers: boolean;
  special_events: boolean;
  feedback_requests: boolean;
  loyalty_updates: boolean;
}

export interface SpecialOccasion {
  id: string;
  customer_id: string;
  type: 'birthday' | 'anniversary' | 'custom';
  date: Date;
  description?: string;
  send_reminders: boolean;
  reminder_days_before: number;
  last_celebrated?: Date;
}

// ===== ANALYTICS & INSIGHTS =====

export interface CustomerAnalytics {
  // Overview Metrics
  total_customers: number;
  new_customers_this_month: number;
  active_customers: number;        // Visited in last 90 days
  customer_retention_rate: number;
  
  // RFM Distribution
  segment_distribution: {
    [K in CustomerSegment]: {
      count: number;
      percentage: number;
      avg_lifetime_value: number;
      revenue_contribution: number;
    }
  };
  
  // Business Intelligence
  top_customers: CustomerProfile[];
  at_risk_customers: CustomerProfile[];
  customer_acquisition_trends: MonthlyTrend[];
  
  // Actionable Insights
  churn_predictions: ChurnPrediction[];
  upsell_opportunities: UpsellOpportunity[];
  
  calculated_at: Date;
  
  // Legacy compatibility fields
  average_clv?: number;
  churn_rate?: number;
  returning_customers?: number;
  revenue_by_segment?: {
    [K in CustomerSegment]: number;
  };
}

export interface MonthlyTrend {
  month: string;
  new_customers: number;
  returning_customers: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface ChurnPrediction {
  customer_id: string;
  customer_name: string;
  churn_probability: number;
  days_since_last_visit: number;
  suggested_action: string;
  potential_lost_revenue: number;
}

export interface UpsellOpportunity {
  customer_id: string;
  customer_name: string;
  current_segment: CustomerSegment;
  recommended_products: string[];
  estimated_additional_revenue: number;
  confidence_score: number;
  based_on: 'purchase_history' | 'similar_customers' | 'seasonal_pattern';
}

// ===== CRUD & API INTERFACES =====

export interface CreateCustomerData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  tags?: number[];                 // Tag IDs to assign (now BIGINT)
  preferences?: Partial<CustomerPreferences>;
  communication_preferences?: Partial<CommunicationPreferences>;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string;
}

export interface CustomerStats {
  total_purchases: number;
  total_spent: number;
  last_purchase_date?: string;
  average_purchase: number;
  purchase_count: number;
  // Extended stats
  first_purchase_date?: string;
  days_as_customer: number;
  purchases_last_30_days: number;
  spending_last_30_days: number;
}

export interface CustomerWithStats extends Customer {
  stats?: CustomerStats;
}

export interface ExtendedCustomerProfile extends CustomerProfile {
  stats: CustomerStats;
  recent_orders: RecentOrder[];
}

export interface RecentOrder {
  id: string;
  total: number;
  items_count: number;
  created_at: Date;
  top_items: string[];             // Product names
}

// ===== SEARCH & FILTERING =====

export interface CustomerFilters {
  segment?: CustomerSegment[];
  tags?: string[];
  loyalty_tier?: LoyaltyTier[];
  churn_risk?: ChurnRisk[];
  has_email?: boolean;
  has_phone?: boolean;
  created_after?: Date;
  created_before?: Date;
  last_visit_after?: Date;
  last_visit_before?: Date;
  min_total_spent?: number;
  max_total_spent?: number;
  min_visits?: number;
  max_visits?: number;
}

export interface CustomerSearchResult {
  customers: CustomerProfile[];
  total_count: number;
  filters_applied: CustomerFilters;
  segment_counts: {
    [K in CustomerSegment]: number;
  };
}

// ===== LEGACY COMPATIBILITY & MIGRATION HELPERS =====
// Maintain backward compatibility with existing code

export type { Customer as BasicCustomer };
export type { CustomerStats as BasicCustomerStats };
export type { CustomerWithStats as BasicCustomerWithStats };

// Helper types for transitioning to new JSONB structure
export interface LegacyCustomerPreferences {
  dietary_restrictions: string[];
  allergies: string[];
  favorite_cuisines: string[];
  disliked_items: string[];
  preferred_seating: string;
  party_size_usual: number;
  preferred_server?: string;
  service_pace: 'quick' | 'standard' | 'leisurely';
  special_requests: string[];
  preferred_contact_time: string;
  contact_frequency: 'weekly' | 'monthly' | 'rarely';
}

// Utility type for accessing JSONB fields with proper typing
export type JSONBField<T> = T | null;

// Helper for migration from old to new structure
export function convertLegacyPreferences(legacy: LegacyCustomerPreferences): CustomerPreferences['dietary_profile'] & CustomerPreferences['preferences'] & CustomerPreferences['communication'] {
  return {
    dietary_profile: {
      restrictions: legacy.dietary_restrictions,
      allergies: legacy.allergies,
      favorite_cuisines: legacy.favorite_cuisines,
      disliked_items: legacy.disliked_items
    },
    preferences: {
      seating: legacy.preferred_seating,
      party_size: legacy.party_size_usual,
      preferred_server: legacy.preferred_server,
      service_pace: legacy.service_pace,
      special_requests: legacy.special_requests
    },
    communication: {
      preferred_contact_time: legacy.preferred_contact_time,
      contact_frequency: legacy.contact_frequency
    }
  };
}

// Supabase query helpers for JSONB fields
export interface SupabaseCustomerPreferencesQuery {
  dietary_profile: CustomerPreferences['dietary_profile'];
  preferences: CustomerPreferences['preferences'];
  communication: CustomerPreferences['communication'];
}

export interface SupabaseCustomerRFMQuery {
  rfm_metrics: CustomerRFMProfile['rfm_metrics'];
  intelligence: CustomerRFMProfile['intelligence'];
  status: CustomerRFMProfile['status'];
  raw_data: CustomerRFMProfile['raw_data'];
}
