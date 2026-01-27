/**
 * Sales B2B Module Types
 *
 * Type definitions for B2B sales including quotes, contracts,
 * tiered pricing, and approval workflows.
 *
 * @module sales/b2b/types
 */

import { FinancialDecimal } from '@/lib/decimal';

// Type alias for FinancialDecimal instance
export type FinancialDecimalType = InstanceType<typeof FinancialDecimal>;

// ============================================
// QUOTES
// ============================================

/**
 * Quote status workflow
 */
export enum QuoteStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted', // Converted to order
}

/**
 * Quote line item
 */
export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string; // Base price
  tiered_price?: string; // Price after volume discount
  discount_percentage: number;
  line_total: string; // Decimal.js string
}

/**
 * B2B Quote
 */
export interface B2BQuote {
  id: string;
  quote_number: string;
  customer_id: string;
  corporate_account_id?: string; // FK to Finance module
  status: QuoteStatus;
  valid_until: string; // ISO date
  items: QuoteItem[];
  subtotal: string; // Decimal.js string
  discount_amount: string; // Decimal.js string
  tax_amount: string; // Decimal.js string
  total_amount: string; // Decimal.js string
  notes?: string;
  terms_and_conditions?: string;
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Quote form data
 */
export interface QuoteFormData {
  customer_id: string;
  valid_until: string;
  items: Omit<QuoteItem, 'id' | 'quote_id'>[];
  notes?: string;
  terms_and_conditions?: string;
}

// ============================================
// CONTRACTS
// ============================================

/**
 * Contract status
 */
export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

/**
 * Contract type
 */
export enum ContractType {
  FIXED_TERM = 'fixed_term', // Plazo fijo
  ONGOING = 'ongoing', // Indefinido
  VOLUME_BASED = 'volume_based', // Por volumen
  SUBSCRIPTION = 'subscription', // Suscripción
}

/**
 * B2B Contract
 */
export interface B2BContract {
  id: string;
  contract_number: string;
  customer_id: string;
  corporate_account_id?: string;
  type: ContractType;
  status: ContractStatus;
  start_date: string;
  end_date?: string;
  renewal_terms?: string;
  payment_terms: number; // NET days
  pricing_tier_id?: string; // FK to tiered pricing
  minimum_order_value?: string; // Minimum per order
  minimum_order_quantity?: number; // Minimum units per order
  terms_and_conditions: string;
  signed_by_customer?: string;
  signed_by_supplier?: string;
  signature_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Contract form data
 */
export interface ContractFormData {
  customer_id: string;
  type: ContractType;
  start_date: string;
  end_date?: string;
  payment_terms: number;
  pricing_tier_id?: string;
  minimum_order_value?: string;
  minimum_order_quantity?: number;
  terms_and_conditions: string;
}

// ============================================
// TIERED PRICING
// ============================================

/**
 * Pricing tier type
 */
export enum PricingTierType {
  VOLUME = 'volume', // Based on order quantity
  VALUE = 'value', // Based on order value
  ANNUAL = 'annual', // Based on annual volume
}

/**
 * Individual pricing tier
 */
export interface PricingTier {
  id: string;
  min_quantity?: number; // For VOLUME type
  max_quantity?: number; // For VOLUME type (null = unlimited)
  min_value?: string; // For VALUE type (Decimal.js)
  max_value?: string; // For VALUE type (Decimal.js)
  discount_percentage: number; // 0-100
  fixed_price?: string; // Override price (Decimal.js)
}

/**
 * Tiered pricing configuration
 */
export interface TieredPricing {
  id: string;
  name: string;
  description?: string;
  type: PricingTierType;
  is_active: boolean;
  tiers: PricingTier[];
  applicable_products?: string[]; // Product IDs (null = all products)
  applicable_customers?: string[]; // Customer IDs (null = all customers)
  created_at: string;
  updated_at: string;
}

/**
 * Tiered pricing form data
 */
export interface TieredPricingFormData {
  name: string;
  description?: string;
  type: PricingTierType;
  tiers: Omit<PricingTier, 'id'>[];
  applicable_products?: string[];
  applicable_customers?: string[];
}

/**
 * Calculated price result
 */
export interface CalculatedPrice {
  original_price: FinancialDecimalType;
  tier_applied?: PricingTier;
  discount_percentage: number;
  discount_amount: FinancialDecimalType;
  final_price: FinancialDecimalType;
}

// ============================================
// APPROVAL WORKFLOWS
// ============================================

/**
 * Approval status
 */
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

/**
 * Approval level configuration
 */
export enum ApprovalLevel {
  MANAGER = 1,
  DIRECTOR = 2,
  VP = 3,
  CEO = 4,
}

/**
 * Individual approval step
 */
export interface ApprovalStep {
  id: string;
  workflow_id: string;
  level: ApprovalLevel;
  approver_id?: string; // User ID
  status: ApprovalStatus;
  comments?: string;
  approved_at?: string;
}

/**
 * Approval workflow
 */
export interface ApprovalWorkflow {
  id: string;
  entity_type: 'quote' | 'contract' | 'order'; // What is being approved
  entity_id: string; // Quote ID, Contract ID, etc.
  current_level: ApprovalLevel;
  required_level: ApprovalLevel;
  status: ApprovalStatus;
  approvals: ApprovalStep[];
  created_at: string;
  updated_at: string;
}

/**
 * Approval rules configuration
 */
export interface ApprovalRule {
  id: string;
  entity_type: 'quote' | 'contract' | 'order';
  condition_type: 'amount' | 'discount' | 'credit_limit';
  threshold_value: string; // Decimal.js or percentage
  required_approval_level: ApprovalLevel;
  is_active: boolean;
}

// ============================================
// B2B ORDERS
// ============================================

/**
 * B2B Order line item
 */
export interface B2BOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  tiered_price_applied?: string;
  discount_percentage: number;
  line_total: string;
}

/**
 * B2B Order (extends regular sales order)
 */
export interface B2BOrder {
  id: string;
  order_number: string;
  quote_id?: string; // If converted from quote
  contract_id?: string; // If part of contract
  customer_id: string;
  corporate_account_id: string; // Required for B2B
  status: string;
  items: B2BOrderItem[];
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  payment_terms: number; // NET days
  due_date: string;
  notes?: string;
  purchase_order_number?: string; // Customer's PO number
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// ANALYTICS
// ============================================

/**
 * B2B sales analytics
 */
export interface B2BAnalytics {
  total_quotes: number;
  quotes_by_status: Record<QuoteStatus, number>;
  quote_conversion_rate: number; // Percentage
  active_contracts: number;
  contracts_by_type: Record<ContractType, number>;
  average_order_value: FinancialDecimalType;
  top_customers: {
    customer_id: string;
    customer_name: string;
    total_orders: number;
    total_value: FinancialDecimalType;
  }[];
  revenue_by_pricing_tier: {
    tier_name: string;
    revenue: FinancialDecimalType;
    order_count: number;
  }[];
}

/**
 * Contract performance metrics
 */
export interface ContractPerformance {
  contract_id: string;
  contract_number: string;
  customer_name: string;
  total_orders: number;
  total_revenue: FinancialDecimalType;
  average_order_value: FinancialDecimalType;
  compliance_rate: number; // % of orders meeting minimum values
  next_renewal_date?: string;
}

// ============================================
// UI TYPES
// ============================================

/**
 * Table filter options
 */
export interface B2BFilters {
  status?: QuoteStatus | ContractStatus | 'all';
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

/**
 * Table sort options
 */
export interface B2BSort {
  field: 'date' | 'amount' | 'customer' | 'status';
  direction: 'asc' | 'desc';
}
