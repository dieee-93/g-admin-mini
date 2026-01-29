/**
 * USE MODULE BADGE SYNC HOOK
 * ============================================================================
 * Synchronizes alert counts with NavigationContext module badges
 *
 * This hook solves the architectural issue where:
 * - Sidebar badges were counting products instead of alerts
 * - No connection existed between AlertsProvider and NavigationContext
 * - Badges weren't updating when alerts changed
 *
 * Architecture Pattern (2025 Best Practice):
 * - Single source of truth: AlertsProvider
 * - Reactive sync: useEffect watches alert changes
 * - Performance optimized: Only updates changed badges
 * - Context separation: Alerts and Navigation remain decoupled
 *
 * @module hooks/useModuleBadgeSync
 */

import { useEffect, useRef, useMemo } from 'react';
import { useAlertsState } from '@/shared/alerts';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { logger } from '@/lib/logging';
import type { AlertContext } from '@/shared/alerts/types';

/**
 * Maps alert contexts to navigation module IDs
 * This mapping allows the sync system to know which module badge to update
 *
 * ✅ COMPLETE: Covers ALL active modules from ALL_MODULE_MANIFESTS
 */
const ALERT_CONTEXT_TO_MODULE_ID: Record<AlertContext, string> = {
  // Core
  dashboard: 'dashboard',
  global: 'dashboard', // Global alerts aggregate to dashboard
  settings: 'settings',
  debug: 'debug',

  // Supply Chain
  materials: 'materials',
  suppliers: 'suppliers',
  products: 'products',
  production: 'production',
  assets: 'assets',

  // Sales & Operations
  sales: 'sales',
  fulfillment: 'fulfillment',
  mobile: 'mobile',

  // Customer & Finance
  customers: 'customers',
  memberships: 'memberships',
  rentals: 'rentals',
  fiscal: 'fiscal',
  billing: 'billing',
  corporate: 'corporate',
  integrations: 'integrations',

  // Resources
  team: 'team',
  scheduling: 'scheduling',

  // Analytics
  reporting: 'reporting',
  intelligence: 'intelligence',
  executive: 'executive',

  // System
  gamification: 'gamification',
  achievements: 'achievements'
};

/**
 * Hook to synchronize alert counts with module badges
 *
 * This hook watches for changes in the alerts array and updates
 * the NavigationContext badges to reflect the current alert counts
 * per module (context).
 *
 * Features:
 * - Automatic sync on alert changes
 * - Performance optimized (only updates when counts change)
 * - Filters to active alerts only (excludes resolved/dismissed)
 * - Maps alert contexts to module IDs
 *
 * @example
 * ```typescript
 * // In App.tsx or top-level provider
 * function App() {
 *   useModuleBadgeSync(); // Auto-syncs badges
 *   return <Router>...</Router>;
 * }
 * ```
 */
export function useModuleBadgeSync() {
  const { alerts } = useAlertsState();
  const { updateModuleBadge } = useNavigationActions();

  // 🎯 PERFORMANCE: Track previous counts to avoid unnecessary updates
  const previousCountsRef = useRef<Record<string, number>>({});

  // 🎯 PERFORMANCE: Memoize badge calculations to avoid recalculating on every render
  // Only recalculates when alerts array changes
  const badgeCounts = useMemo(() => {
    // Step 1: Initialize counters for ALL AlertContext types
    const alertCountsByContext: Partial<Record<AlertContext, number>> = {};

    // Step 2: Count active alerts by context (only active + acknowledged)
    alerts.forEach(alert => {
      if (alert.status === 'active' || alert.status === 'acknowledged') {
        alertCountsByContext[alert.context] = (alertCountsByContext[alert.context] || 0) + 1;
      }
    });

    // Step 3: Convert context counts → module badge counts
    const counts: Record<string, number> = {};

    Object.entries(ALERT_CONTEXT_TO_MODULE_ID).forEach(([context, moduleId]) => {
      const count = alertCountsByContext[context as AlertContext] || 0;
      // Aggregate counts for modules that map to same moduleId
      counts[moduleId] = (counts[moduleId] || 0) + count;
    });

    return counts;
  }, [alerts]); // ✅ Only depends on alerts array

  // 🎯 PERFORMANCE: Effect only runs when badgeCounts change (via useMemo)
  useEffect(() => {
    // Update badges only if counts changed (performance optimization)
    Object.entries(badgeCounts).forEach(([moduleId, count]) => {
      const previousCount = previousCountsRef.current[moduleId];

      if (previousCount !== count) {
        logger.debug('Navigation', `Updating badge for ${moduleId}: ${previousCount ?? 0} → ${count}`);
        updateModuleBadge(moduleId, count);
        previousCountsRef.current[moduleId] = count;
      }
    });

    // Clean up badges for modules with 0 alerts
    Object.keys(previousCountsRef.current).forEach(moduleId => {
      if (badgeCounts[moduleId] === undefined || badgeCounts[moduleId] === 0) {
        if (previousCountsRef.current[moduleId] !== 0) {
          logger.debug('Navigation', `Clearing badge for ${moduleId}`);
          updateModuleBadge(moduleId, 0);
          previousCountsRef.current[moduleId] = 0;
        }
      }
    });

  }, [badgeCounts, updateModuleBadge]); // ✅ badgeCounts is memoized, updateModuleBadge should be stable from NavigationActions

  // Log sync initialization
  useEffect(() => {
    logger.info('Navigation', '🔄 Module badge sync initialized');

    return () => {
      logger.info('Navigation', '🔄 Module badge sync unmounted');
    };
  }, []);
}

/**
 * Export default for backward compatibility
 */
export default useModuleBadgeSync;
