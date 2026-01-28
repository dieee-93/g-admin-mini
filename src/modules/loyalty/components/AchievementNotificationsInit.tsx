/**
 * Achievement Notifications Initializer
 *
 * Component that initializes achievement notifications system.
 * Replaces the deprecated AchievementSystemProvider.
 *
 * @version 1.0.0
 */

import useAchievementNotifications from '@/lib/achievements/useAchievementNotifications';

/**
 * Component that initializes achievement notifications
 * Replaces the deprecated AchievementSystemProvider
 */
export function AchievementNotificationsInit() {
  useAchievementNotifications();
  return null;
}

export default AchievementNotificationsInit;
