/**
 * useCreditManagement Hook
 *
 * React hook for credit validation and management operations.
 * Provides credit checks, balance updates, and AR aging reports.
 *
 * @module finance/hooks/useCreditManagement
 */

import { useState, useCallback } from 'react';
import Decimal from 'decimal.js';
import { logger } from '@/lib/logging';
import type {
  CreditValidationResult,
  CreditTransactionType,
  ARAgingReport,
  ARAgingSummary,
} from '../types';
import * as creditManagementService from '../services/creditManagementService';

export interface UseCreditManagementReturn {
  validating: boolean;
  validationError: string | null;
  validateCredit: (accountId: string, amount: string | Decimal) => Promise<CreditValidationResult>;
  validateCustomerCredit: (
    customerId: string,
    amount: string | Decimal
  ) => Promise<CreditValidationResult>;
  updateBalance: (
    accountId: string,
    amount: string | Decimal,
    transactionType: CreditTransactionType,
    referenceId?: string
  ) => Promise<void>;
  recordInvoice: (accountId: string, invoiceAmount: string | Decimal, invoiceId?: string) => Promise<void>;
  recordPayment: (accountId: string, paymentAmount: string | Decimal, paymentId?: string) => Promise<void>;
  recordCreditNote: (accountId: string, creditAmount: string | Decimal, creditNoteId?: string) => Promise<void>;
  getARAgingReport: (accountId: string) => Promise<ARAgingReport | null>;
  getARAgingSummary: () => Promise<ARAgingSummary>;
  getCreditUtilizationReport: () => Promise<any[]>;
}

/**
 * Hook for credit management operations
 *
 * @returns Credit management state and operations
 */
export const useCreditManagement = (): UseCreditManagementReturn => {
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Validate credit limit for an account
   */
  const validateCredit = useCallback(
    async (accountId: string, amount: string | Decimal): Promise<CreditValidationResult> => {
      setValidating(true);
      setValidationError(null);

      try {
        logger.debug('Finance', 'Validating credit', { accountId, amount });

        const result = await creditManagementService.validateCreditLimit(accountId, amount);

        if (!result.isValid) {
          setValidationError(result.message || 'Credit validation failed');
        }

        logger.debug('Finance', 'Credit validation result', result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to validate credit';
        logger.error('Finance', 'Error validating credit', err);
        setValidationError(errorMessage);
        throw err;
      } finally {
        setValidating(false);
      }
    },
    []
  );

  /**
   * Validate credit for a customer (by customer ID)
   */
  const validateCustomerCredit = useCallback(
    async (customerId: string, amount: string | Decimal): Promise<CreditValidationResult> => {
      setValidating(true);
      setValidationError(null);

      try {
        logger.debug('Finance', 'Validating customer credit', { customerId, amount });

        const result = await creditManagementService.validateCustomerCredit(customerId, amount);

        if (!result.isValid) {
          setValidationError(result.message || 'Credit validation failed');
        }

        logger.debug('Finance', 'Customer credit validation result', result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to validate customer credit';
        logger.error('Finance', 'Error validating customer credit', err);
        setValidationError(errorMessage);
        throw err;
      } finally {
        setValidating(false);
      }
    },
    []
  );

  /**
   * Update account balance
   */
  const updateBalance = useCallback(
    async (
      accountId: string,
      amount: string | Decimal,
      transactionType: CreditTransactionType,
      referenceId?: string
    ): Promise<void> => {
      setValidationError(null);

      try {
        logger.info('Finance', 'Updating account balance', {
          accountId,
          amount,
          transactionType,
          referenceId,
        });

        await creditManagementService.updateAccountBalance(
          accountId,
          amount,
          transactionType,
          referenceId
        );

        logger.info('Finance', 'Account balance updated successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update balance';
        logger.error('Finance', 'Error updating balance', err);
        setValidationError(errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Record an invoice (increases balance)
   */
  const recordInvoice = useCallback(
    async (accountId: string, invoiceAmount: string | Decimal, invoiceId?: string): Promise<void> => {
      return updateBalance(accountId, invoiceAmount, 'invoice', invoiceId);
    },
    [updateBalance]
  );

  /**
   * Record a payment (decreases balance)
   */
  const recordPayment = useCallback(
    async (accountId: string, paymentAmount: string | Decimal, paymentId?: string): Promise<void> => {
      return updateBalance(accountId, paymentAmount, 'payment', paymentId);
    },
    [updateBalance]
  );

  /**
   * Record a credit note (decreases balance)
   */
  const recordCreditNote = useCallback(
    async (accountId: string, creditAmount: string | Decimal, creditNoteId?: string): Promise<void> => {
      return updateBalance(accountId, creditAmount, 'credit_note', creditNoteId);
    },
    [updateBalance]
  );

  /**
   * Get AR Aging report for an account
   */
  const getARAgingReport = useCallback(async (accountId: string): Promise<ARAgingReport | null> => {
    setValidationError(null);

    try {
      logger.debug('Finance', 'Fetching AR aging report', { accountId });

      const report = await creditManagementService.getARAgingReport(accountId);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AR aging report';
      logger.error('Finance', 'Error fetching AR aging report', err);
      setValidationError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get AR Aging summary across all accounts
   */
  const getARAgingSummary = useCallback(async (): Promise<ARAgingSummary> => {
    setValidationError(null);

    try {
      logger.debug('Finance', 'Fetching AR aging summary');

      const summary = await creditManagementService.getARAgingSummary();
      return summary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AR aging summary';
      logger.error('Finance', 'Error fetching AR aging summary', err);
      setValidationError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Get credit utilization report for all accounts
   */
  const getCreditUtilizationReport = useCallback(async (): Promise<any[]> => {
    setValidationError(null);

    try {
      logger.debug('Finance', 'Fetching credit utilization report');

      const report = await creditManagementService.getCreditUtilizationReport();
      return report;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch credit utilization report';
      logger.error('Finance', 'Error fetching credit utilization report', err);
      setValidationError(errorMessage);
      throw err;
    }
  }, []);

  return {
    validating,
    validationError,
    validateCredit,
    validateCustomerCredit,
    updateBalance,
    recordInvoice,
    recordPayment,
    recordCreditNote,
    getARAgingReport,
    getARAgingSummary,
    getCreditUtilizationReport,
  };
};
