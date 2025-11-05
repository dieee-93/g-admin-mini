/**
 * MEMBERSHIPS MODULE MANIFEST
 *
 * Membership and subscription management for customers.
 * Handles member tiers, benefits, and recurring access.
 *
 * @version 1.0.0
 */

import React, { lazy } from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export const membershipsManifest: ModuleManifest = {
  id: 'memberships',
  name: 'Memberships',
  version: '1.0.0',

  depends: ['customers', 'billing'], // Members are customers with billing
  autoInstall: true, // Auto-activate when dependencies active

  requiredFeatures: [] as FeatureId[],
  optionalFeatures: [
    'customer_loyalty_program',
    'finance_payment_terms',
  ] as FeatureId[],

  // 🔒 PERMISSIONS: Supervisors can manage memberships
  minimumRole: 'SUPERVISOR' as const,

  hooks: {
    provide: [
      'memberships.tier_benefits',   // Member benefits
      'customers.profile_sections',  // Membership info in customer profile
      'dashboard.widgets',           // Membership metrics
    ],
    consume: [
      'billing.payment_received',    // Activate memberships on payment
      'billing.subscription_ended',  // Deactivate expired memberships
    ],
  },

  setup: async (registry) => {
    logger.info('App', '👥 Setting up Memberships module');

    try {
      // Import EventBus for subscriptions
      const { eventBus } = await import('@/lib/events');

      // ✅ Dashboard Widget - Memberships status
      const MembershipsWidget = lazy(() => import('./components/MembershipsWidget'));

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Cargando memberships...</div>}>
            <MembershipsWidget />
          </React.Suspense>
        ),
        'memberships',
        30 // Medium priority widget
      );

      // ✅ EventBus Integration - Billing payments
      eventBus.subscribe('billing.payment_received', async (event) => {
        logger.info('Memberships', 'Payment received for membership', event.payload);

        try {
          const { customerId } = event.payload;

          if (!customerId) {
            logger.warn('Memberships', 'Payment received without customerId', event.payload);
            return;
          }

          const { activateMembershipOnPayment } = await import('@/pages/admin/operations/memberships/services');
          const result = await activateMembershipOnPayment(customerId);

          if (result) {
            logger.info('Memberships', 'Membership activated/renewed successfully', {
              membershipId: result.id,
              status: result.status
            });
          } else {
            logger.info('Memberships', 'No membership to activate (customer may need to enroll first)', { customerId });
          }
        } catch (error) {
          logger.error('Memberships', 'Error handling payment_received event', error);
        }
      }, { moduleId: 'memberships', priority: 100 });

      // ✅ EventBus Integration - Subscription ended
      eventBus.subscribe('billing.subscription_ended', async (event) => {
        logger.info('Memberships', 'Subscription ended', event.payload);

        try {
          const { customerId } = event.payload;

          if (!customerId) {
            logger.warn('Memberships', 'Subscription ended without customerId', event.payload);
            return;
          }

          const { expireMembershipOnSubscriptionEnd } = await import('@/pages/admin/operations/memberships/services');
          const result = await expireMembershipOnSubscriptionEnd(customerId);

          if (result) {
            logger.info('Memberships', 'Membership expired successfully', {
              membershipId: result.id,
              status: result.status
            });
          } else {
            logger.info('Memberships', 'No active membership found to expire', { customerId });
          }
        } catch (error) {
          logger.error('Memberships', 'Error handling subscription_ended event', error);
        }
      }, { moduleId: 'memberships', priority: 100 });

      logger.info('App', '✅ Memberships module setup complete');
    } catch (error) {
      logger.error('App', '❌ Memberships module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Memberships module');
  },

  exports: {
    checkAccess: async (memberId: string, benefitId: string) => {
      const { checkBenefitAccess } = await import('@/pages/admin/operations/memberships/services');
      return await checkBenefitAccess(memberId, benefitId);
    },
    renewMembership: async (memberId: string) => {
      const { renewMembership } = await import('@/pages/admin/operations/memberships/services');
      const { user } = await import('@/contexts/AuthContext').then(m => m.useAuth());
      await renewMembership(memberId, user!);
      return { success: true };
    },
  },

  metadata: {
    category: 'business',
    description: 'Membership and subscription management',
    author: 'G-Admin Team',
    tags: ['memberships', 'subscriptions', 'loyalty', 'tiers'],
    navigation: {
      route: '/admin/operations/memberships',
      icon: UserGroupIcon,
      color: 'purple',
      domain: 'operations',
      isExpandable: false,
    },
  },
};

export default membershipsManifest;
