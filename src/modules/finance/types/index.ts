/**
 * Finance Module Types
 *
 * Type definitions for B2B Finance module including corporate accounts,
 * credit management, and payment terms.
 *
 * @module finance/types
 */

import Decimal from 'decimal.js';

// ============================================
// CORPORATE ACCOUNTS
// ============================================

/**
 * Corporate Account - B2B customer account with credit terms
 */
export interface CorporateAccount {
  id: string;
  customer_id: string | null;
  credit_limit: string; // Decimal.js string representation
  current_balance: string; // Decimal.js string representation
  payment_terms: number; // Days (e.g., 30 for NET 30)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Corporate Account with computed fields
 */
export interface CorporateAccountWithComputed extends CorporateAccount {
  available_credit: string; // credit_limit - current_balance
  credit_utilization: number; // (current_balance / credit_limit) * 100
  customer_name?: string; // Joined from customers table
  customer_email?: string; // Joined from customers table
}

/**
 * Form data for creating/updating corporate accounts
 */
export interface CorporateAccountFormData {
  customer_id: string;
  credit_limit: string | number;
  payment_terms: number;
  is_active?: boolean;
}

// ============================================
// PAYMENT TERMS
// ============================================

/**
 * Standard payment term configurations
 */
export enum PaymentTerms {
  NET_7 = 7,
  NET_15 = 15,
  NET_30 = 30,
  NET_45 = 45,
  NET_60 = 60,
  NET_90 = 90,
  DUE_ON_RECEIPT = 0,
}

/**
 * Payment term metadata
 */
export interface PaymentTermConfig {
  value: PaymentTerms;
  label: string;
  description: string;
  isCommon: boolean; // Common terms shown first in UI
}

// ============================================
// CREDIT MANAGEMENT
// ============================================

/**
 * Credit validation result
 */
export interface CreditValidationResult {
  isValid: boolean;
  availableCredit: Decimal;
  currentBalance: Decimal;
  creditLimit: Decimal;
  requestedAmount: Decimal;
  message?: string;
}

/**
 * Credit transaction types
 */
export enum CreditTransactionType {
  INVOICE = 'invoice', // Increases balance
  PAYMENT = 'payment', // Decreases balance
  CREDIT_NOTE = 'credit_note', // Decreases balance
  ADJUSTMENT = 'adjustment', // Manual adjustment
}

/**
 * Credit transaction record
 */
export interface CreditTransaction {
  id: string;
  account_id: string;
  type: CreditTransactionType;
  amount: string; // Decimal.js string
  reference_id?: string; // Invoice ID, payment ID, etc.
  description?: string;
  created_at: string;
  created_by: string;
}

// ============================================
// AR AGING
// ============================================

/**
 * Accounts Receivable aging bucket
 */
export interface ARAgingBucket {
  range: string; // "0-30 days", "31-60 days", etc.
  amount: Decimal;
  invoiceCount: number;
}

/**
 * AR Aging report for a corporate account
 */
export interface ARAgingReport {
  account_id: string;
  customer_name: string;
  total_outstanding: Decimal;
  buckets: {
    current: ARAgingBucket; // 0-30 days
    days_31_60: ARAgingBucket;
    days_61_90: ARAgingBucket;
    over_90: ARAgingBucket;
  };
  oldest_invoice_date?: string;
  credit_limit: Decimal;
  available_credit: Decimal;
}

/**
 * AR Aging summary across all accounts
 */
export interface ARAgingSummary {
  total_outstanding: Decimal;
  total_current: Decimal;
  total_31_60: Decimal;
  total_61_90: Decimal;
  total_over_90: Decimal;
  account_count: number;
  overdue_accounts: number;
}

// ============================================
// INVOICING
// ============================================

/**
 * Invoice status for B2B orders
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

/**
 * B2B Invoice
 */
export interface B2BInvoice {
  id: string;
  account_id: string;
  order_id?: string; // Related sales order
  invoice_number: string;
  amount: string; // Decimal.js string
  tax_amount: string; // Decimal.js string
  total_amount: string; // Decimal.js string
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Credit utilization analytics
 */
export interface CreditUtilizationAnalytics {
  account_id: string;
  customer_name: string;
  credit_limit: Decimal;
  current_balance: Decimal;
  available_credit: Decimal;
  utilization_percentage: number;
  payment_history_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high';
  recommended_action?: string;
}

/**
 * Finance module analytics summary
 */
export interface FinanceAnalyticsSummary {
  total_accounts: number;
  active_accounts: number;
  total_credit_extended: Decimal;
  total_outstanding: Decimal;
  average_utilization: number;
  accounts_by_risk: {
    low: number;
    medium: number;
    high: number;
  };
  ar_aging: ARAgingSummary;
}

// ============================================
// UI TYPES
// ============================================

/**
 * Table filter options
 */
export interface CorporateAccountFilters {
  status?: 'active' | 'inactive' | 'all';
  credit_utilization?: 'low' | 'medium' | 'high' | 'all';
  payment_terms?: PaymentTerms | 'all';
  search?: string;
}

/**
 * Table sort options
 */
export interface CorporateAccountSort {
  field: 'customer_name' | 'credit_limit' | 'current_balance' | 'utilization' | 'created_at';
  direction: 'asc' | 'desc';
}

// ============================================
// EXPORTS
// ============================================

export type {
  CorporateAccount,
  CorporateAccountWithComputed,
  CorporateAccountFormData,
  PaymentTermConfig,
  CreditValidationResult,
  CreditTransaction,
  ARAgingBucket,
  ARAgingReport,
  ARAgingSummary,
  B2BInvoice,
  CreditUtilizationAnalytics,
  FinanceAnalyticsSummary,
  CorporateAccountFilters,
  CorporateAccountSort,
};

export {
  PaymentTerms,
  CreditTransactionType,
  InvoiceStatus,
};
