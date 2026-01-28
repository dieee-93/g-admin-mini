/**
 * ACCOUNTING MODULE MANIFEST
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
 * @version 3.0.0 - Renamed from cash-management
 * @see docs/cash/README.md
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { registerCashHandlers } from './handlers';

export const accountingManifest: ModuleManifest = {
  id: 'accounting',
  name: 'Accounting',
  version: '3.0.0',

  permissionModule: 'finance', // Finance-level access

  depends: [], // Core accounting module - no dependencies

  // 🔒 PERMISSIONS: Accessible by cashiers and above
  minimumRole: 'CAJERO' as const,

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
      'cash.discrepancy.detected',
      'cash.drop.recorded',

      // Shift control integration
      'shift-control.indicators',
    ],
    consume: [
      // Sales events
      'sales.payment.completed', // Create journal entry for payment
      'sales.refund.completed', // Create journal entry for refund
      'sales.order_cancelled',

      // Payroll events
      'payroll.payment.completed', // Create journal entry for payroll
      'staff.payroll.processed',

      // Materials/Purchasing events
      'materials.purchase.completed', // Create journal entry for material purchase
      'suppliers.payment.completed', // Create journal entry for supplier payment

      // Operational shifts
      'shift.opened', // Track cash session with shift
      'shift.closed', // Close cash session with shift
    ],
  },

  setup: async (registry) => {
    logger.info('App', '💰 Setting up Accounting module');

    try {
      // Register all event handlers for cross-module communication
      const unsubscribe = registerCashHandlers();

      // ============================================
      // SHIFT CONTROL INTEGRATION
      // ============================================

      // ⚡ PERFORMANCE: Single import - no need for Promise.all()
      const { CashSessionIndicator } = await import('./widgets/CashSessionIndicator');

      // Inject cash session indicator into ShiftControl
      registry.addAction(
        'shift-control.indicators',
        ({ cashSession }) => <CashSessionIndicator cashSession={cashSession} key="cash-indicator" />,
        'accounting',
        90  // High priority
      );

      logger.info('App', '✅ Accounting module setup complete');
    } catch (error) {
      logger.error('App', '❌ Accounting module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Accounting module');
  },

  exports: {
    /**
     * React Components for Accounting
     */
    components: {
      /**
       * Chart of Accounts Tree Component
       */
      ChartOfAccountsTree: async () => {
        const module = await import('./components/ChartOfAccountsTree');
        return { default: module.ChartOfAccountsTree };
      },

      /**
       * Money Locations List Component
       */
      MoneyLocationsList: async () => {
        const module = await import('./components/MoneyLocationsList');
        return { default: module.MoneyLocationsList };
      },
    },

    /**
     * React Hooks for Accounting
     */
    hooks: {
      useCashSession: () => import('./hooks/useCashSession'),
      useCashSessions: () => import('./hooks/useCashSessions'),
      useChartOfAccounts: () => import('./hooks/useChartOfAccounts'),
      useMoneyLocations: () => import('./hooks/useMoneyLocations'),
    },

    /**
     * Services for Accounting
     */
    services: {
      cashSession: () => import('./services/cashSessionService'),
      journal: () => import('./services/journalService'),
      chartOfAccounts: () => import('./services/chartOfAccountsService'),
      moneyLocations: () => import('./services/moneyLocationsService'),
      reports: () => import('./services/reportsService'),
      tax: () => import('./services/taxCalculationService'),
    },
  },

  metadata: {
    category: 'finance',
    description: 'Cash flow tracking with double-entry accounting and advanced reports',
    author: 'G-Admin Team',
    tags: ['cash', 'accounting', 'finance', 'sessions', 'reports', 'double-entry'],
    navigation: {
      route: '/admin/finance/cash',
      icon: BanknotesIcon,
      color: 'green',
      domain: 'finance',
      isExpandable: false,
    },
  },
};

export default cashManagementManifest;
