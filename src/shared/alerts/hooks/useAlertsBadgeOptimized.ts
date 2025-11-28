// src/shared/alerts/hooks/useAlertsBadgeOptimized.ts
// 🚀 PERFORMANCE OPTIMIZED: Badge hook that doesn't re-render on every alert change
// Uses derived state pattern from React.dev best practices

import { useMemo } from 'react';
import { useAlertsState } from '../AlertsProvider';
import type { AlertSeverity } from '../types';

/**
 * 🎯 PERFORMANCE HOOK - Ultra-optimized badge data
 * 
 * Based on React.dev patterns:
 * - Calculate during render (no Effects)
 * - Minimal state dependencies
 * - Memoized only the expensive parts
 * 
 * This hook is designed specifically for badges that need count/color
 * but shouldn't trigger re-renders for every alert change.
 */
export function useAlertsBadgeOptimized() {
  // Only consume the state we absolutely need
  const { stats } = useAlertsState();
  
  // 🚀 PERFORMANCE: Extract primitive values to avoid object reference issues
  // React.dev: "Minimize props changes - use individual values instead of objects"
  const unreadCount = stats.unread;
  const criticalCount = stats.bySeverity.critical;
  const highCount = stats.bySeverity.high;
  const mediumCount = stats.bySeverity.medium;
  
  // 🚀 PERFORMANCE: Calculate badge data directly from primitive values
  // React.dev: "Calculate during rendering instead of Effects"
  const badgeData = useMemo(() => {
    // Count: sum of unread alerts
    const count = unreadCount;
    
    // Determine color based on severity
    let color: 'red' | 'orange' | 'yellow' | 'blue' | 'gray' = 'gray';
    let statusText = 'Sin alertas';
    
    if (criticalCount > 0) {
      color = 'red';
      statusText = `${criticalCount} críticas`;
    } else if (highCount > 0) {
      color = 'orange';
      statusText = `${highCount} importantes`;
    } else if (mediumCount > 0) {
      color = 'yellow';
      statusText = `${mediumCount} moderadas`;
    } else if (count > 0) {
      color = 'blue';
      statusText = `${count} notificaciones`;
    }
    
    return {
      count,
      color,
      statusText,
      shouldShow: true, // Always show icon (icon-only variant)
      criticalCount,
      hasCritical: criticalCount > 0
    };
  }, [unreadCount, criticalCount, highCount, mediumCount]); // 🎯 ONLY primitive numbers
  
  return badgeData;
}
