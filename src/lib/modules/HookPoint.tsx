/**
 * HOOKPOINT COMPONENT
 *
 * React component for executing module hooks and rendering results.
 * Inspired by WordPress hook system for extensibility.
 *
 * FEATURES:
 * - Execute registered hooks at specific points
 * - Pass data to hook handlers
 * - Render all results with proper layout
 * - Debug mode for development
 * - Fallback content when no hooks exist
 *
 * USAGE:
 * ```tsx
 * // In a module manifest setup:
 * registry.addAction('dashboard.widgets', () => <MyWidget />);
 *
 * // In a component:
 * <HookPoint
 *   name="dashboard.widgets"
 *   data={{ userId: user.id }}
 *   fallback={<Text>No widgets available</Text>}
 *   direction="column"
 *   gap={4}
 *   debug={false}
 * />
 * ```
 *
 * @version 1.0.0
 * @see docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md
 */

import React from 'react';
import { ModuleRegistry } from './ModuleRegistry';
import { Stack } from '@/shared/ui';
import type { HookPointProps } from './types';

// ============================================
// HOOKPOINT COMPONENT
// ============================================

/**
 * HookPoint - Execute and render module hooks
 *
 * @param props - HookPoint configuration
 * @returns Rendered hook results or fallback
 */
export const HookPoint = <T = any,>(props: HookPointProps<T>): React.ReactElement | null => {
  const {
    name,
    data,
    fallback = null,
    direction = 'column',
    gap = 4,
    className,
    debug = false,
  } = props;

  // Get registry instance
  const registry = React.useMemo(() => ModuleRegistry.getInstance(), []);

  // Execute hooks
  const results = React.useMemo(() => {
    const startTime = performance.now();
    const hookResults = registry.doAction(name, data);
    const duration = performance.now() - startTime;

    if (debug) {
      console.log(`[HookPoint] Executed hook: ${name}`, {
        resultsCount: hookResults.length,
        duration: `${duration.toFixed(2)}ms`,
        data,
      });
    }

    return hookResults;
  }, [registry, name, data, debug]);

  // Handle empty results
  if (results.length === 0) {
    if (debug) {
      console.log(`[HookPoint] No hooks registered for: ${name}`);
    }
    return fallback as React.ReactElement | null;
  }

  // Filter out null/undefined results
  const validResults = results.filter((result) => result != null);

  if (validResults.length === 0) {
    return fallback as React.ReactElement | null;
  }

  // Render results in a Stack
  return (
    <Stack direction={direction} gap={gap} className={className}>
      {validResults.map((result, index) => (
        <React.Fragment key={`${name}-${index}`}>{result}</React.Fragment>
      ))}
    </Stack>
  );
};

// ============================================
// DISPLAY NAME (for debugging)
// ============================================

HookPoint.displayName = 'HookPoint';

// ============================================
// DEFAULT EXPORT
// ============================================

export default HookPoint;
