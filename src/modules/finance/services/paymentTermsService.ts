/**
 * Payment Terms Service
 *
 * Service layer for managing payment terms configurations.
 * Provides utilities for calculating due dates and formatting payment terms.
 *
 * @module finance/services/paymentTermsService
 */

import { logger } from '@/lib/logging';
import { PaymentTerms, type PaymentTermConfig } from '../types';

// ============================================
// PAYMENT TERM CONFIGURATIONS
// ============================================

/**
 * Available payment term options with metadata
 */
export const PAYMENT_TERM_OPTIONS: PaymentTermConfig[] = [
  {
    value: PaymentTerms.DUE_ON_RECEIPT,
    label: 'Due on Receipt',
    description: 'Payment due immediately upon invoice receipt',
    isCommon: false,
  },
  {
    value: PaymentTerms.NET_7,
    label: 'NET 7',
    description: 'Payment due within 7 days',
    isCommon: false,
  },
  {
    value: PaymentTerms.NET_15,
    label: 'NET 15',
    description: 'Payment due within 15 days',
    isCommon: false,
  },
  {
    value: PaymentTerms.NET_30,
    label: 'NET 30',
    description: 'Payment due within 30 days (most common)',
    isCommon: true,
  },
  {
    value: PaymentTerms.NET_45,
    label: 'NET 45',
    description: 'Payment due within 45 days',
    isCommon: false,
  },
  {
    value: PaymentTerms.NET_60,
    label: 'NET 60',
    description: 'Payment due within 60 days',
    isCommon: true,
  },
  {
    value: PaymentTerms.NET_90,
    label: 'NET 90',
    description: 'Payment due within 90 days',
    isCommon: true,
  },
];

/**
 * Get common payment terms only (for UI dropdowns)
 */
export const getCommonPaymentTerms = (): PaymentTermConfig[] => {
  return PAYMENT_TERM_OPTIONS.filter((term) => term.isCommon);
};

/**
 * Get all payment terms
 */
export const getAllPaymentTerms = (): PaymentTermConfig[] => {
  return PAYMENT_TERM_OPTIONS;
};

/**
 * Get payment term config by value
 */
export const getPaymentTermConfig = (value: PaymentTerms): PaymentTermConfig | undefined => {
  return PAYMENT_TERM_OPTIONS.find((term) => term.value === value);
};

// ============================================
// DATE CALCULATIONS
// ============================================

/**
 * Calculate due date based on invoice date and payment terms
 *
 * @param invoiceDate - Invoice issue date (ISO string or Date)
 * @param paymentTermsDays - Payment terms in days
 * @returns Due date as ISO string
 */
export const calculateDueDate = (
  invoiceDate: string | Date,
  paymentTermsDays: number
): string => {
  try {
    const issueDate = typeof invoiceDate === 'string' ? new Date(invoiceDate) : invoiceDate;

    // Add payment terms days to issue date
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);

    return dueDate.toISOString();
  } catch (error) {
    logger.error('Finance', 'Error calculating due date', error);
    throw new Error('Failed to calculate due date');
  }
};

/**
 * Calculate days overdue for an invoice
 *
 * @param dueDate - Invoice due date (ISO string or Date)
 * @param referenceDate - Optional reference date (defaults to today)
 * @returns Number of days overdue (negative if not yet due)
 */
export const calculateDaysOverdue = (
  dueDate: string | Date,
  referenceDate?: string | Date
): number => {
  try {
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const reference = referenceDate
      ? typeof referenceDate === 'string'
        ? new Date(referenceDate)
        : referenceDate
      : new Date();

    // Calculate difference in days
    const diffTime = reference.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    logger.error('Finance', 'Error calculating days overdue', error);
    throw new Error('Failed to calculate days overdue');
  }
};

/**
 * Check if an invoice is overdue
 *
 * @param dueDate - Invoice due date
 * @returns True if overdue
 */
export const isInvoiceOverdue = (dueDate: string | Date): boolean => {
  return calculateDaysOverdue(dueDate) > 0;
};

/**
 * Get aging bucket for an invoice based on days overdue
 *
 * @param daysOverdue - Number of days overdue
 * @returns Aging bucket name
 */
export const getAgingBucket = (
  daysOverdue: number
): 'current' | '31-60' | '61-90' | '90+' => {
  if (daysOverdue <= 30) return 'current';
  if (daysOverdue <= 60) return '31-60';
  if (daysOverdue <= 90) return '61-90';
  return '90+';
};

// ============================================
// FORMATTING
// ============================================

/**
 * Format payment terms for display
 *
 * @param paymentTermsDays - Payment terms in days
 * @returns Formatted string (e.g., "NET 30", "Due on Receipt")
 */
export const formatPaymentTerms = (paymentTermsDays: number): string => {
  const config = PAYMENT_TERM_OPTIONS.find((term) => term.value === paymentTermsDays);
  if (config) {
    return config.label;
  }

  // Fallback for custom terms
  if (paymentTermsDays === 0) return 'Due on Receipt';
  return `NET ${paymentTermsDays}`;
};

/**
 * Format days overdue for display
 *
 * @param daysOverdue - Number of days overdue
 * @returns Formatted string (e.g., "15 days overdue", "Due in 5 days")
 */
export const formatDaysOverdue = (daysOverdue: number): string => {
  if (daysOverdue > 0) {
    return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
  } else if (daysOverdue < 0) {
    const daysUntilDue = Math.abs(daysOverdue);
    return `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
  } else {
    return 'Due today';
  }
};

/**
 * Format date for display
 *
 * @param date - Date to format (ISO string or Date)
 * @param locale - Locale for formatting (default: 'es-AR')
 * @returns Formatted date string
 */
export const formatInvoiceDate = (date: string | Date, locale = 'es-AR'): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    logger.error('Finance', 'Error formatting date', error);
    return 'Invalid date';
  }
};

// ============================================
// VALIDATION
// ============================================

/**
 * Validate payment terms value
 *
 * @param paymentTermsDays - Payment terms to validate
 * @returns True if valid
 */
export const isValidPaymentTerm = (paymentTermsDays: number): boolean => {
  return (
    Number.isInteger(paymentTermsDays) &&
    paymentTermsDays >= 0 &&
    paymentTermsDays <= 365 // Max 1 year
  );
};

/**
 * Suggest payment terms based on credit limit
 *
 * @param creditLimit - Credit limit amount
 * @returns Recommended payment terms
 */
export const suggestPaymentTerms = (creditLimit: number): PaymentTerms => {
  // Higher credit limits get longer terms
  if (creditLimit >= 100000) return PaymentTerms.NET_90;
  if (creditLimit >= 50000) return PaymentTerms.NET_60;
  if (creditLimit >= 10000) return PaymentTerms.NET_30;
  return PaymentTerms.NET_15;
};

// ============================================
// EXPORTS
// ============================================

export default {
  PAYMENT_TERM_OPTIONS,
  getCommonPaymentTerms,
  getAllPaymentTerms,
  getPaymentTermConfig,
  calculateDueDate,
  calculateDaysOverdue,
  isInvoiceOverdue,
  getAgingBucket,
  formatPaymentTerms,
  formatDaysOverdue,
  formatInvoiceDate,
  isValidPaymentTerm,
  suggestPaymentTerms,
};
