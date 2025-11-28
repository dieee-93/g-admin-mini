/**
 * Finance Integration Service
 *
 * Integration layer between B2B Sales and Finance modules.
 * Handles credit validation, invoice creation, and payment tracking.
 *
 * @module sales/b2b/services/financeIntegration
 */

import { logger } from '@/lib/logging';
import Decimal from 'decimal.js';
import type {
  // TODO Phase 3: Implement B2BQuote type for quote-to-invoice flow
  // B2BQuote,
  B2BOrder,
} from '../types';

// ============================================
// CREDIT VALIDATION
// ============================================

/**
 * Validate credit before creating quote
 *
 * Checks if customer has sufficient credit limit for quote amount.
 * Integrates with Finance module's credit validation.
 */
export const validateCreditForQuote = async (
  customerId: string,
  quoteAmount: string | Decimal
): Promise<{
  isValid: boolean;
  message?: string;
  availableCredit?: string;
}> => {
  try {
    logger.debug('B2B', 'Validating credit for quote', { customerId, quoteAmount });

    // Import Finance module services dynamically
    const { validateCustomerCredit } = await import('@/modules/finance-corporate/services');

    const result = await validateCustomerCredit(customerId, quoteAmount);

    if (!result.isValid) {
      logger.warn('B2B', 'Credit validation failed for quote', {
        customerId,
        message: result.message,
      });
    }

    return {
      isValid: result.isValid,
      message: result.message,
      availableCredit: result.availableCredit.toFixed(2),
    };
  } catch (error) {
    logger.error('B2B', 'Error validating credit for quote', error);
    // If Finance module not available or customer has no corporate account,
    // allow quote creation (validation happens at order conversion)
    return {
      isValid: true,
      message: 'Credit validation skipped - no corporate account',
    };
  }
};

/**
 * Validate credit before converting quote to order
 *
 * Mandatory credit check before order creation.
 */
export const validateCreditForOrder = async (
  customerId: string,
  orderAmount: string | Decimal
): Promise<{
  isValid: boolean;
  message?: string;
}> => {
  try {
    logger.info('B2B', 'Validating credit for order', { customerId, orderAmount });

    const { validateCustomerCredit } = await import('@/modules/finance-corporate/services');

    const result = await validateCustomerCredit(customerId, orderAmount);

    if (!result.isValid) {
      logger.error('B2B', 'Credit validation failed for order', {
        customerId,
        message: result.message,
      });
    }

    return {
      isValid: result.isValid,
      message: result.message,
    };
  } catch (error) {
    logger.error('B2B', 'Error validating credit for order', error);
    throw new Error('Credit validation required for B2B orders');
  }
};

// ============================================
// INVOICE INTEGRATION
// ============================================

/**
 * Create invoice for B2B order
 *
 * Integrates with Finance module to record invoice and update account balance.
 */
export const createInvoiceForOrder = async (order: B2BOrder): Promise<void> => {
  try {
    logger.info('B2B', 'Creating invoice for order', { order_id: order.id });

    if (!order.corporate_account_id) {
      logger.warn('B2B', 'No corporate account - skipping invoice creation', {
        order_id: order.id,
      });
      return;
    }

    // Import Finance module services
    const { recordInvoice } = await import('@/modules/finance-corporate/services');

    // Record invoice in Finance module
    await recordInvoice(
      order.corporate_account_id,
      order.total_amount,
      order.id // Use order ID as invoice reference
    );

    logger.info('B2B', 'Invoice created successfully', { order_id: order.id });

    // Emit event for other modules
    const { eventBus } = await import('@/lib/events');
    eventBus.emit('finance.invoice_created', {
      accountId: order.corporate_account_id,
      orderId: order.id,
      amount: order.total_amount,
    });
  } catch (error) {
    logger.error('B2B', 'Error creating invoice for order', error);
    throw error;
  }
};

/**
 * Record payment for B2B order
 *
 * Updates Finance module when payment is received.
 */
export const recordOrderPayment = async (
  orderId: string,
  corporateAccountId: string,
  paymentAmount: string,
  paymentId: string
): Promise<void> => {
  try {
    logger.info('B2B', 'Recording payment for order', { orderId, paymentAmount });

    const { recordPayment } = await import('@/modules/finance-corporate/services');

    await recordPayment(corporateAccountId, paymentAmount, paymentId);

    logger.info('B2B', 'Payment recorded successfully', { orderId });

    // Emit events for cross-module integration
    const { eventBus } = await import('@/lib/events');

    // Emit to finance namespace (for Finance module)
    eventBus.emit('finance.payment_received', {
      accountId: corporateAccountId,
      orderId,
      amount: paymentAmount,
      paymentId,
    });

    // Also emit to sales namespace (for other modules listening to sales events)
    eventBus.emit('sales.payment_received', {
      orderId,
      customerId: corporateAccountId, // Using account as customer identifier
      amount: paymentAmount,
      paymentId,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('B2B', 'Error recording payment', error);
    throw error;
  }
};

// ============================================
// ACCOUNT QUERIES
// ============================================

/**
 * Get corporate account for customer
 *
 * Retrieves corporate account information from Finance module.
 */
export const getCorporateAccountForCustomer = async (customerId: string) => {
  try {
    logger.debug('B2B', 'Fetching corporate account for customer', { customerId });

    const { getCorporateAccountByCustomerId } = await import('@/modules/finance-corporate/services');

    const account = await getCorporateAccountByCustomerId(customerId);

    if (!account) {
      logger.debug('B2B', 'No corporate account found', { customerId });
      return null;
    }

    return {
      id: account.id,
      creditLimit: account.credit_limit,
      currentBalance: account.current_balance,
      availableCredit: account.available_credit,
      paymentTerms: account.payment_terms,
      isActive: account.is_active,
    };
  } catch (error) {
    logger.error('B2B', 'Error fetching corporate account', error);
    return null;
  }
};

/**
 * Calculate due date based on payment terms
 *
 * Uses Finance module's payment terms utilities.
 */
export const calculateOrderDueDate = async (
  orderDate: string,
  paymentTermsDays: number
): Promise<string> => {
  try {
    const { calculateDueDate } = await import('@/modules/finance-corporate/services');

    return calculateDueDate(orderDate, paymentTermsDays);
  } catch (error) {
    logger.error('B2B', 'Error calculating due date', error);
    // Fallback: calculate manually
    const dueDate = new Date(orderDate);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);
    return dueDate.toISOString();
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  validateCreditForQuote,
  validateCreditForOrder,
  createInvoiceForOrder,
  recordOrderPayment,
  getCorporateAccountForCustomer,
  calculateOrderDueDate,
};
