/**
 * GAMIFICATION MODULE MANIFEST
 *
 * Gamification system with achievements, quests, and rewards.
 * Tracks user progress and unlocks capabilities.
 *
 * @version 1.0.0
 */

import React, { lazy } from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { AchievementNotificationsInit } from './components/AchievementNotificationsInit';

export const gamificationManifest: ModuleManifest = {
  id: 'gamification',
  name: 'Achievements & Progress',
  version: '1.0.0',

  depends: [], // Listens to all modules via EventBus

  // ✅ CORE MODULE: No activatedBy needed (always loaded)

  // 🔒 PERMISSIONS: Operadores can view gamification
  minimumRole: 'OPERADOR' as const,

  hooks: {
    provide: [
      'gamification.achievement_unlocked', // Achievement notifications
      'dashboard.widgets',                 // Progress widgets
      'navigation.badges',                 // Achievement badges in nav
      'app.init',                          // Achievement notifications init
    ],
    consume: [
      // Gamification listens to 40+ EventBus patterns
      'sales.order_completed',
      'materials.stock_updated',
      'staff.shift_completed',
    ],
  },

  setup: async (registry) => {
    logger.info('App', '🏆 Setting up Gamification module');

    try {
      // ✅ Achievement Notifications - Initialize globally
      registry.addAction(
        'app.init',
        () => <AchievementNotificationsInit />,
        'gamification',
        100 // Highest priority - initialize first
      );

      // ✅ Dashboard Widget - Gamification progress
      const GamificationWidget = lazy(() => import('./components/GamificationWidget'));

      registry.addAction(
        'dashboard.widgets',
        () => (
          <React.Suspense fallback={<div>Cargando gamification...</div>}>
            <GamificationWidget />
          </React.Suspense>
        ),
        'gamification',
        60 // High priority widget
      );

      logger.info('App', '✅ Gamification module setup complete');
    } catch (error) {
      logger.error('App', '❌ Gamification module setup failed', error);
      throw error;
    }
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Gamification module');
  },

  exports: {
    getProgress: async (userId: string) => {
      logger.debug('App', 'Getting user progress', { userId });
      return { level: 1, achievements: [] };
    },
    unlockAchievement: async (achievementId: string, userId: string) => {
      logger.debug('App', 'Unlocking achievement', { achievementId, userId });
      return { success: true };
    },
  },

  metadata: {
    category: 'engagement',
    description: 'Achievement system with progress tracking',
    author: 'G-Admin Team',
    tags: ['gamification', 'achievements', 'progress', 'rewards'],
    navigation: {
      route: '/admin/gamification',
      icon: TrophyIcon,
      color: 'yellow',
      domain: 'advanced',
      isExpandable: false,
    },
  },
};

export default gamificationManifest;
