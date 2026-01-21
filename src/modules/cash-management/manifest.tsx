/**
 * CASH MANAGEMENT MODULE MANIFEST
 *
 * Cash flow tracking, session management, and accounting integration.
 * Implements double-entry accounting for cash operations.
 *
 * @version 1.0.0 - Fase 5 Complete (Advanced Reports)
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export const cashManagementManifest: ModuleManifest = {
  id: 'cash-management',
  name: 'Cash Management',
  version: '1.0.0',

  permissionModule: 'fiscal', // ✅ Uses 'fiscal' permission (cash flow & accounting)

  depends: [], // Independent module

  // 🔒 PERMISSIONS: Accessible by cashiers and above
  minimumRole: 'CAJERO' as const,

  hooks: {
    provide: [
      'cash.session.opened',
      'cash.session.closed',
      'cash.journal_entry.created',
      'cash.discrepancy.detected',
      'cash.drop.recorded',
      'dashboard.widgets',
      'shift-control.indicators',
    ],
    consume: [
      'sales.payment.completed',
      'sales.order_cancelled',
      'staff.payroll.processed',
    ],
  },

  setup: async (registry) => {
    logger.info('App', '💰 Setting up Cash Management module');

    try {
      // Register cash session event handlers
      registry.addAction(
        'sales.payment.completed',
        async (data: any) => {
          logger.debug('CashModule', 'Payment completed, updating session', data);
          // In production: update cash_sales in active session
        },
        'cash-management',
        10
      );

      // ❌ DISABLED: Invalid format - returns object instead of JSX
      // TODO: Create CashBalanceWidget component and fix this
      // Correct pattern: () => <CashBalanceWidget />
      // registry.addAction(
      //   'dashboard.widgets',
      //   () => ({
      //     id: 'cash-balance-widget',
      //     title: 'Cash Balance',
      //     component: 'CashBalanceWidget',
      //     priority: 20,
      //   }),
      //   'cash-management',
      //   20
      // );

      // ============================================
      // SHIFT CONTROL INTEGRATION
      // ============================================

      // ⚡ PERFORMANCE: Single import - no need for Promise.all()
      const { CashSessionIndicator } = await import('./widgets/CashSessionIndicator');

      // Inject cash session indicator into ShiftControl
      registry.addAction(
        'shift-control.indicators',
        ({ cashSession }) => <CashSessionIndicator cashSession={cashSession} key="cash-indicator" />,
        'cash-management',
        90  // High priority
      );

      logger.info('App', '✅ Cash Management module setup complete');
    } catch (error) {
      logger.error('App', '❌ Cash Management module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Cash Management module');
  },

  exports: {
    /**
     * React Hooks for Cash Session management
     *
     * @example
     * ```tsx
     * import { ModuleRegistry } from '@/lib/modules';
     *
     * async function MyComponent() {
     *   const registry = ModuleRegistry.getInstance();
     *   const cashModule = registry.getExports('cash-management');
     *
     *   // Dynamic import of the hook
     *   const { useCashSession } = await cashModule.hooks.useCashSession();
     *
     *   const {
     *     activeCashSession,
     *     openCashSession,
     *     closeCashSession,
     *     isOpening,
     *     loading
     *   } = useCashSession();
     *
     *   // Use the hook...
     * }
     * ```
     */
    hooks: {
      /**
       * Hook for cash session management
       * Returns a dynamic import of the useCashSession hook
       *
       * Pattern: Dynamic Import (following finance-corporate pattern)
       * Benefits: Lazy loading, tree-shaking, better code splitting
       */
      useCashSession: () => import('./hooks/useCashSession'),
    },

    /**
     * Service functions for direct API calls (without hooks)
     * Used when you need to call cash session operations outside React components
     */
    services: {
      /**
       * Get the currently active cash session
       * @returns The first active session, or null if none exists
       */
      getActiveCashSession: async () => {
        const { getAllActiveSessions } = await import('@/modules/cash/services/cashSessionService');
        const sessions = await getAllActiveSessions();
        return sessions[0] || null;
      },

      /**
       * Open a new cash session
       * @param input - Session opening parameters
       * @param userId - ID of the user opening the session
       */
      openCashSession: async (input: any, userId: string) => {
        const { openCashSession } = await import('@/modules/cash/services/cashSessionService');
        return openCashSession(input, userId);
      },

      /**
       * Close an active cash session
       * @param sessionId - ID of the session to close
       * @param input - Session closing parameters
       * @param userId - ID of the user closing the session
       */
      closeCashSession: async (sessionId: string, input: any, userId: string) => {
        const { closeCashSession } = await import('@/modules/cash/services/cashSessionService');
        return closeCashSession(sessionId, input, userId);
      },

      /**
       * Create a journal entry
       * @param entry - Journal entry data
       */
      createJournalEntry: async (entry: any) => {
        logger.debug('CashModule', 'Creating journal entry', entry);
        return { entryId: 'mock-entry-id', created: true };
      },
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
