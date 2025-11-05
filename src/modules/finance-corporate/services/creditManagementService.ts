/**
 * Credit Management Service
 *
 * Service layer for managing B2B credit limits, validation, and balance updates.
 * Integrates with corporate accounts and handles credit transactions.
 *
 * @module finance/services/creditManagementService
 */

import { supabase } from '@/lib/supabase/client';
import Decimal from 'decimal.js';
import { logger } from '@/lib/logging';
import type {
  CreditValidationResult,
  CreditTransaction,
  CreditTransactionType,
  ARAgingReport,
  ARAgingSummary,
} from '../types';
import { getCorporateAccountById } from './corporateAccountsService';

// ============================================
// CREDIT VALIDATION
// ============================================

/**
 * Validate if a customer has sufficient credit for a new order
 *
 * @param accountId - Corporate account ID
 * @param orderAmount - Order amount to validate (Decimal or string)
 * @returns Validation result with available credit info
 */
export const validateCreditLimit = async (
  accountId: string,
  orderAmount: string | Decimal
): Promise<CreditValidationResult> => {
  try {
    logger.debug('Finance', 'Validating credit limit', { accountId, orderAmount });

    const account = await getCorporateAccountById(accountId);

    if (!account) {
      return {
        isValid: false,
        availableCredit: new Decimal(0),
        currentBalance: new Decimal(0),
        creditLimit: new Decimal(0),
        requestedAmount: new Decimal(orderAmount),
        message: 'Corporate account not found',
      };
    }

    if (!account.is_active) {
      return {
        isValid: false,
        availableCredit: new Decimal(account.available_credit),
        currentBalance: new Decimal(account.current_balance),
        creditLimit: new Decimal(account.credit_limit),
        requestedAmount: new Decimal(orderAmount),
        message: 'Corporate account is inactive',
      };
    }

    const creditLimit = new Decimal(account.credit_limit);
    const currentBalance = new Decimal(account.current_balance);
    const requestedAmount = new Decimal(orderAmount);
    const availableCredit = new Decimal(account.available_credit);

    const newBalance = currentBalance.plus(requestedAmount);
    const isValid = newBalance.lessThanOrEqualTo(creditLimit);

    return {
      isValid,
      availableCredit,
      currentBalance,
      creditLimit,
      requestedAmount,
      message: isValid
        ? 'Credit validation passed'
        : `Insufficient credit. Available: $${availableCredit.toFixed(2)}, Required: $${requestedAmount.toFixed(2)}`,
    };
  } catch (error) {
    logger.error('Finance', 'Error validating credit limit', error);
    throw error;
  }
};

/**
 * Validate if customer can place order (checks credit + active status)
 *
 * @param customerId - Customer ID
 * @param orderAmount - Order amount
 * @returns Validation result
 */
export const validateCustomerCredit = async (
  customerId: string,
  orderAmount: string | Decimal
): Promise<CreditValidationResult> => {
  try {
    // Get corporate account by customer ID
    const { data, error } = await supabase
      .from('corporate_accounts')
      .select('id')
      .eq('customer_id', customerId)
      .single();

    if (error || !data) {
      return {
        isValid: false,
        availableCredit: new Decimal(0),
        currentBalance: new Decimal(0),
        creditLimit: new Decimal(0),
        requestedAmount: new Decimal(orderAmount),
        message: 'Customer does not have a corporate account',
      };
    }

    return validateCreditLimit(data.id, orderAmount);
  } catch (error) {
    logger.error('Finance', 'Error validating customer credit', error);
    throw error;
  }
};

// ============================================
// BALANCE MANAGEMENT
// ============================================

/**
 * Update account balance (increase for invoices, decrease for payments)
 *
 * @param accountId - Corporate account ID
 * @param amount - Amount to add/subtract (positive for invoices, negative for payments)
 * @param transactionType - Type of transaction
 * @param referenceId - Optional reference ID (invoice ID, payment ID, etc.)
 * @returns Updated account
 */
export const updateAccountBalance = async (
  accountId: string,
  amount: string | Decimal,
  transactionType: CreditTransactionType,
  referenceId?: string
): Promise<void> => {
  try {
    logger.info('Finance', 'Updating account balance', {
      accountId,
      amount,
      transactionType,
      referenceId,
    });

    const account = await getCorporateAccountById(accountId);
    if (!account) {
      throw new Error('Corporate account not found');
    }

    const currentBalance = new Decimal(account.current_balance);
    const changeAmount = new Decimal(amount);

    // Calculate new balance based on transaction type
    let newBalance: Decimal;
    switch (transactionType) {
      case 'invoice':
        // Invoices increase balance
        newBalance = currentBalance.plus(changeAmount.abs());
        break;
      case 'payment':
      case 'credit_note':
        // Payments and credit notes decrease balance
        newBalance = currentBalance.minus(changeAmount.abs());
        break;
      case 'adjustment':
        // Adjustments can be positive or negative
        newBalance = currentBalance.plus(changeAmount);
        break;
      default:
        throw new Error(`Unknown transaction type: ${transactionType}`);
    }

    // Ensure balance doesn't go negative
    if (newBalance.isNegative()) {
      logger.warn('Finance', 'Balance would go negative, setting to 0', {
        accountId,
        currentBalance: currentBalance.toString(),
        changeAmount: changeAmount.toString(),
        newBalance: newBalance.toString(),
      });
      newBalance = new Decimal(0);
    }

    // Update balance in database
    const { error } = await supabase
      .from('corporate_accounts')
      .update({
        current_balance: newBalance.toFixed(2),
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId);

    if (error) {
      logger.error('Finance', 'Failed to update account balance', error);
      throw error;
    }

    logger.info('Finance', 'Account balance updated successfully', {
      accountId,
      oldBalance: currentBalance.toFixed(2),
      newBalance: newBalance.toFixed(2),
    });
  } catch (error) {
    logger.error('Finance', 'Error updating account balance', error);
    throw error;
  }
};

/**
 * Record an invoice and update account balance
 */
export const recordInvoice = async (
  accountId: string,
  invoiceAmount: string | Decimal,
  invoiceId?: string
): Promise<void> => {
  return updateAccountBalance(accountId, invoiceAmount, 'invoice', invoiceId);
};

/**
 * Record a payment and update account balance
 */
export const recordPayment = async (
  accountId: string,
  paymentAmount: string | Decimal,
  paymentId?: string
): Promise<void> => {
  return updateAccountBalance(accountId, paymentAmount, 'payment', paymentId);
};

/**
 * Record a credit note and update account balance
 */
export const recordCreditNote = async (
  accountId: string,
  creditAmount: string | Decimal,
  creditNoteId?: string
): Promise<void> => {
  return updateAccountBalance(accountId, creditAmount, 'credit_note', creditNoteId);
};

/**
 * Record a manual balance adjustment
 */
export const recordBalanceAdjustment = async (
  accountId: string,
  adjustmentAmount: string | Decimal,
  reason?: string
): Promise<void> => {
  return updateAccountBalance(accountId, adjustmentAmount, 'adjustment', reason);
};

// ============================================
// AR AGING REPORTS
// ============================================

/**
 * Generate AR Aging report for a specific account
 *
 * NOTE: This is a placeholder implementation. Real AR aging requires:
 * - Invoice table with issue_date and due_date
 * - Join with payments to calculate outstanding amounts
 * - Age calculation based on today's date vs due_date
 *
 * For now, returns basic structure with current balance.
 */
export const getARAgingReport = async (accountId: string): Promise<ARAgingReport | null> => {
  try {
    logger.debug('Finance', 'Generating AR aging report', { accountId });

    const account = await getCorporateAccountById(accountId);
    if (!account) {
      return null;
    }

    const totalOutstanding = new Decimal(account.current_balance);
    const creditLimit = new Decimal(account.credit_limit);
    const availableCredit = new Decimal(account.available_credit);

    // TODO: Implement real AR aging with invoice data
    // For now, put all balance in "current" bucket
    return {
      account_id: accountId,
      customer_name: account.customer_name || 'Unknown',
      total_outstanding: totalOutstanding,
      buckets: {
        current: {
          range: '0-30 days',
          amount: totalOutstanding, // Placeholder
          invoiceCount: 0, // TODO: Count invoices
        },
        days_31_60: {
          range: '31-60 days',
          amount: new Decimal(0),
          invoiceCount: 0,
        },
        days_61_90: {
          range: '61-90 days',
          amount: new Decimal(0),
          invoiceCount: 0,
        },
        over_90: {
          range: '90+ days',
          amount: new Decimal(0),
          invoiceCount: 0,
        },
      },
      credit_limit: creditLimit,
      available_credit: availableCredit,
    };
  } catch (error) {
    logger.error('Finance', 'Error generating AR aging report', error);
    throw error;
  }
};

/**
 * Generate AR Aging summary across all accounts
 */
export const getARAgingSummary = async (): Promise<ARAgingSummary> => {
  try {
    logger.debug('Finance', 'Generating AR aging summary');

    const { data, error } = await supabase.from('corporate_accounts').select('current_balance');

    if (error) {
      logger.error('Finance', 'Failed to fetch accounts for AR aging', error);
      throw error;
    }

    const accounts = data || [];
    let totalOutstanding = new Decimal(0);

    accounts.forEach((account) => {
      totalOutstanding = totalOutstanding.plus(new Decimal(account.current_balance || 0));
    });

    // TODO: Implement real AR aging with invoice data
    return {
      total_outstanding: totalOutstanding,
      total_current: totalOutstanding, // Placeholder
      total_31_60: new Decimal(0),
      total_61_90: new Decimal(0),
      total_over_90: new Decimal(0),
      account_count: accounts.length,
      overdue_accounts: 0, // TODO: Count overdue
    };
  } catch (error) {
    logger.error('Finance', 'Error generating AR aging summary', error);
    throw error;
  }
};

// ============================================
// ANALYTICS
// ============================================

/**
 * Get credit utilization for all accounts
 */
export const getCreditUtilizationReport = async () => {
  try {
    logger.debug('Finance', 'Generating credit utilization report');

    const { data, error } = await supabase
      .from('corporate_accounts')
      .select(
        `
        id,
        credit_limit,
        current_balance,
        is_active,
        customer:customers (name, email)
      `
      )
      .eq('is_active', true);

    if (error) {
      logger.error('Finance', 'Failed to fetch accounts for utilization report', error);
      throw error;
    }

    const accounts = (data || []).map((account) => {
      const creditLimit = new Decimal(account.credit_limit || 0);
      const currentBalance = new Decimal(account.current_balance || 0);
      const availableCredit = creditLimit.minus(currentBalance);
      const utilization = creditLimit.isZero()
        ? 0
        : currentBalance.dividedBy(creditLimit).times(100).toNumber();

      // Simple risk assessment based on utilization
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (utilization > 90) riskLevel = 'high';
      else if (utilization > 75) riskLevel = 'medium';

      return {
        account_id: account.id,
        customer_name: account.customer?.name || 'Unknown',
        credit_limit: creditLimit,
        current_balance: currentBalance,
        available_credit: availableCredit,
        utilization_percentage: Math.round(utilization * 100) / 100,
        risk_level: riskLevel,
      };
    });

    return accounts;
  } catch (error) {
    logger.error('Finance', 'Error generating credit utilization report', error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  validateCreditLimit,
  validateCustomerCredit,
  updateAccountBalance,
  recordInvoice,
  recordPayment,
  recordCreditNote,
  recordBalanceAdjustment,
  getARAgingReport,
  getARAgingSummary,
  getCreditUtilizationReport,
};
