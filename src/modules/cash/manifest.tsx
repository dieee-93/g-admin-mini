/**
 * CASH MANAGEMENT MODULE MANIFEST
 *
 * Double-entry accounting and cash flow management for the business.
 * Handles chart of accounts, journal entries, cash sessions, and financial reporting.
 *
 * MODULE INTEGRATION:
 * - Consumes sales payments (creates journal entries)
 * - Consumes payroll payments (creates journal entries)
 * - Consumes material purchases (creates journal entries)
 * - Provides financial reports (balance sheet, P&L, cash flow)
 * - Provides money locations tracking
 *
 * @version 1.0.0
 * @see docs/cash/README.md
 */

import { logger } from '@/lib/logging/Logger';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { registerCashHandlers } from './handlers';

const MODULE_ID = 'CashModule' as const;

export const cashManifest: ModuleManifest = {
  id: MODULE_ID,
  name: 'Cash Management',
  version: '1.0.0',

  permissionModule: 'finance', // Finance-level access

  // Core accounting module - no dependencies
  depends: [],
  // Enhanced features

  // 🔒 PERMISSIONS: Accessible by accountants and above
  minimumRole: 'GERENTE' as const,

  // Hook points this module provides and consumes
  hooks: {
    provide: [
      // Financial Reports
      'finance.reports.balance_sheet', // Balance sheet report
      'finance.reports.profit_loss', // P&L statement
      'finance.reports.cash_flow', // Cash flow statement

      // Dashboard integration
      'dashboard.widgets', // Cash management widget

      // Chart of Accounts
      'finance.chart_of_accounts.tree', // COA tree component
      'finance.money_locations.list', // Money locations component

      // Journal events
      'cash.journal_entry.created', // When journal entry created
      'cash.session.opened', // When cash session opened
      'cash.session.closed', // When cash session closed
    ],
    consume: [
      // Sales events
      'sales.payment.completed', // Create journal entry for payment
      'sales.refund.completed', // Create journal entry for refund

      // Payroll events
      'payroll.payment.completed', // Create journal entry for payroll

      // Materials/Purchasing events
      'materials.purchase.completed', // Create journal entry for material purchase
      'suppliers.payment.completed', // Create journal entry for supplier payment

      // Operational shifts
      'shift.opened', // Track cash session with shift
      'shift.closed', // Close cash session with shift
    ],
  },

  // Setup function - register event handlers
  setup: async () => {
    logger.info(MODULE_ID, '🏦 Initializing Cash Management Module');

    try {
      // Register all event handlers for cross-module communication
      const unsubscribe = registerCashHandlers();

      logger.info(
        MODULE_ID,
        '✅ Cash Management Module initialized successfully'
      );

      // Note: teardown will be called separately
    } catch (error) {
      logger.error(
        MODULE_ID,
        '❌ Failed to initialize Cash Management Module',
        error
      );
      throw error;
    }
  },

  teardown: async () => {
    logger.info(MODULE_ID, '🧹 Tearing down Cash Management Module');
    
    try {
      // Cleanup will be handled by handlers unsubscribe
      logger.info(MODULE_ID, '✅ Cash Management Module cleaned up successfully');
    } catch (error) {
      logger.error(MODULE_ID, '❌ Failed to cleanup Cash Management Module', error);
    }
  },

  // Exported components and hooks
  exports: {
    /**
     * React Components for Cash Management
     */
    components: {
      /**
       * Chart of Accounts Tree Component
       * @example
       * ```tsx
       * const { ChartOfAccountsTree } = await cashModule.components.ChartOfAccountsTree();
       * ```
       */
      ChartOfAccountsTree: async () => {
        const module = await import('./components/ChartOfAccountsTree');
        return { default: module.ChartOfAccountsTree };
      },

      /**
       * Money Locations List Component
       * @example
       * ```tsx
       * const { MoneyLocationsList } = await cashModule.components.MoneyLocationsList();
       * ```
       */
      MoneyLocationsList: async () => {
        const module = await import('./components/MoneyLocationsList');
        return { default: module.MoneyLocationsList };
      },
    },

    /**
     * Services for Cash Management
     */
    services: {
      cashSession: () => import('./services/cashSessionService'),
      journal: () => import('./services/journalService'),
      chartOfAccounts: () => import('./services/chartOfAccountsService'),
      moneyLocations: () => import('./services/moneyLocationsService'),
      reports: () => import('./services/reportsService'),
    },
  },
};

// Default export
export default cashManifest;
