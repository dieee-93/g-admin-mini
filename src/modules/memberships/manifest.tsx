/**
 * MEMBERSHIPS MODULE MANIFEST
 *
 * Membership and subscription management for customers.
 * Handles member tiers, benefits, and recurring access.
 *
 * @version 1.0.0
 */

import React from 'react';
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
      registry.addAction(
        'dashboard.widgets',
        () => ({
          id: 'memberships-summary',
          title: 'Memberships',
          type: 'memberships',
          priority: 6,
          data: {
            activeMembers: 0,
            newThisMonth: 0,
            renewalsDue: 0,
          },
        }),
        'memberships',
        6
      );

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
      logger.debug('App', 'Checking membership access', { memberId, benefitId });
      return { hasAccess: false };
    },
    renewMembership: async (memberId: string) => {
      logger.debug('App', 'Renewing membership', { memberId });
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
