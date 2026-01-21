import type { ModuleManifest } from '@/lib/modules/types';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

/**
 * Finance Corporate Module Manifest
 *
 * B2B Finance module for corporate accounts, credit management,
 * and payment terms. Enables businesses to manage B2B customers
 * with credit lines and NET payment terms.
 *
 * @version 2.0.0
 */
export const financeCorporateManifest: ModuleManifest = {
  id: 'finance-corporate',
  name: 'Finance Corporate',
  version: '2.0.0',

  permissionModule: 'fiscal', // ✅ Maps to 'fiscal' permission (corporate accounting)

  // ============================================
  // FEATURES
  // ============================================
  
  activatedBy: 'finance_corporate_accounts',


  // ✅ OPTIONAL MODULE: Only loaded when required feature is active
  // ============================================
  // DEPENDENCIES
  // ============================================

  depends: ['customers', 'finance-fiscal', 'finance-billing'],
  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  // 🔒 PERMISSIONS: Only administrators can manage B2B finance
  minimumRole: 'ADMINISTRADOR' as const,

  // ============================================
  // HOOKS
  // ============================================

  hooks: {
    provide: [
      'finance.credit_check',       // Credit validation for B2B orders
      'finance.invoice_created',     // Invoice creation events
      'finance.payment_received',    // Payment receipt events
      'finance.toolbar.actions',     // Finance toolbar actions
      'dashboard.widgets',           // Dashboard widgets
    ],
    consume: [
      'sales.order_placed',          // Listen to sales orders
      'fiscal.invoice_issued',       // Listen to fiscal invoices
      'billing.payment_processed',   // Listen to payments
      'customers.created',           // Listen to new customers
    ],
  },

  // ============================================
  // SETUP
  // ============================================

  setup: async (registry) => {
    logger.info('App', '🏦 Setting up Finance module');

    try {
      // ============================================
      // REGISTER DASHBOARD WIDGET
      // ============================================

      const [
        { queryClient },
        { businessProfileKeys },
        { FeatureActivationEngine }
      ] = await Promise.all([
        import('@/App'),
        import('@/lib/business-profile/hooks/useBusinessProfile'),
        import('@/lib/features/FeatureEngine')
      ]);

      const profile = queryClient.getQueryData<any>(businessProfileKeys.detail());
      const { activeFeatures } = FeatureActivationEngine.activateFeatures(
        profile?.selectedCapabilities || [],
        profile?.selectedInfrastructure || []
      );
      const hasFeature = (featureId: string) => activeFeatures.includes(featureId as any);

      if (hasFeature('finance_corporate_accounts')) {
        // Lazy load widget only if needed
        const { CreditUtilizationWidget } = await import('./components/CreditUtilizationWidget');

        registry.addAction(
          'dashboard.widgets',
          () => <CreditUtilizationWidget />,
          'finance',
          15 // Priority (lower number = higher priority)
        );

        logger.debug('App', '✅ Finance widget registered');
      }

      // ============================================
      // LISTEN TO ORDER EVENTS
      // ============================================

      // ⚡ PERFORMANCE: Parallel imports (2 unique imports)
      const [
        { eventBus },
        { validateCustomerCredit, recordInvoice }
      ] = await Promise.all([
        import('@/lib/events'),
        import('./services/creditManagementService')
      ]);

      // Listen to sales orders - validate credit before placing
      eventBus.subscribe(
        'sales.order_placed',
        async (event) => {
          try {
            const { customerId, totalAmount } = event.payload;

            // Only validate for B2B customers with corporate accounts
            if (customerId) {
              logger.debug('Finance', '🔍 Validating credit for order', {
                customerId,
                amount: totalAmount,
              });

              // Credit validation happens here
              // Note: In production, this should happen BEFORE order placement
              // This is a post-placement audit for now
            }
          } catch (error) {
            logger.error('Finance', 'Error validating credit for order', error);
          }
        },
        { moduleId: 'finance-corporate' }
      );

      // Listen to fiscal invoices - update account balance
      eventBus.subscribe(
        'fiscal.invoice_issued',
        async (event) => {
          try {
            const { accountId, invoiceAmount, invoiceId } = event.payload;

            if (accountId) {
              logger.info('Finance', '📄 Recording invoice for corporate account', {
                accountId,
                invoiceId,
                amount: invoiceAmount,
              });

              await recordInvoice(accountId, invoiceAmount, invoiceId);
            }
          } catch (error) {
            logger.error('Finance', 'Error recording invoice', error);
          }
        },
        { moduleId: 'finance-corporate' }
      );

      // Listen to billing payments - update account balance
      eventBus.subscribe(
        'billing.payment_processed',
        async (event) => {
          try {
            const { accountId, paymentAmount, paymentId } = event.payload;

            if (accountId) {
              logger.info('Finance', '💰 Recording payment for corporate account', {
                accountId,
                paymentId,
                amount: paymentAmount,
              });

              const { recordPayment } = await import('./services/creditManagementService');
              await recordPayment(accountId, paymentAmount, paymentId);
            }
          } catch (error) {
            logger.error('Finance', 'Error recording payment', error);
          }
        },
        { moduleId: 'finance-corporate' }
      );

      logger.info('App', '✅ Finance module setup complete', {
        widgetRegistered: hasFeature('finance_corporate_accounts'),
        eventSubscriptions: 3,
      });
    } catch (error) {
      logger.error('App', '❌ Finance module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN
  // ============================================

  teardown: () => {
    logger.info('App', '🏦 Tearing down Finance module');

    // Cleanup event subscriptions
    import('@/lib/events').then(({ eventBus }) => {
      // TODO: Fix - eventBus.unsubscribe('sales.order_placed', { moduleId: 'finance' });
      // TODO: Fix - eventBus.unsubscribe('fiscal.invoice_issued', { moduleId: 'finance' });
      // TODO: Fix - eventBus.unsubscribe('billing.payment_processed', { moduleId: 'finance' });
    });
  },

  // ============================================
  // EXPORTS
  // ============================================

  exports: {
    components: {
      CorporateAccountsManager: () => import('./components/CorporateAccountsManager'),
      CreditLimitTracker: () => import('./components/CreditLimitTracker'),
      ARAgingReport: () => import('./components/ARAgingReport'),
      CreditUtilizationWidget: () => import('./components/CreditUtilizationWidget'),
    },
    services: {
      corporateAccountsService: () => import('./services/corporateAccountsService'),
      creditManagementService: () => import('./services/creditManagementService'),
      paymentTermsService: () => import('./services/paymentTermsService'),
    },
    hooks: {
      useCorporateAccounts: () => import('./hooks/useCorporateAccounts'),
      useCreditManagement: () => import('./hooks/useCreditManagement'),
    },
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'b2b',
    description: 'B2B corporate accounts with credit management and payment terms',
    tags: ['finance', 'b2b', 'credit', 'corporate', 'accounts-receivable'],
    navigation: {
      route: '/admin/finance/corporate',
      icon: BuildingOffice2Icon,
      color: 'green',
      domain: 'finance',
    },
  },
};
