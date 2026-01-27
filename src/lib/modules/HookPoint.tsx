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
 *   gap="4"
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
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/store/appStore';
import { hasPermission, ROLE_PERMISSIONS } from '@/config/PermissionsRegistry';
import type { HookPointProps } from './types';
import type { UserRole, ModuleName, PermissionAction } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';

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

  // Get current user for permission checking
  const { user } = useAuth();

  // ✅ FIX: Force re-render when modules are initialized
  const modulesInitialized = useAppStore(state => state.modulesInitialized);

  // ✅ FIX: Use state to force re-render after module registration
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Get registry instance
  const registry = React.useMemo(() => ModuleRegistry.getInstance(), []);

  // ✅ FIX: Re-render when modules finish initializing
  React.useEffect(() => {
    if (modulesInitialized) {
      // Force refresh after a small delay to ensure all setup() functions completed
      const timer = setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modulesInitialized]);

  // Execute hooks with permission filtering
  // ✅ FIX: Add refreshKey to dependencies
  const results = React.useMemo(() => {
    const startTime = performance.now();

    // Get all hooks for this point
    const allHooks = registry['hooks'].get(name) || [];

    if (debug) {
      logger.debug('ModuleEventBus', `[HookPoint] Getting hooks for: ${name}`, {
        totalHooks: allHooks.length,
        modulesInitialized,
        hooksByPriority: allHooks.map(h => ({ module: h.context.moduleId, priority: h.context.priority }))
      });
    }

    // Filter by permissions
    const permittedHooks = allHooks.filter(hook => {
      const permission = hook.context.requiredPermission;

      // No permission required → allow
      if (!permission) return true;

      // No user → deny
      if (!user || !user.role) return false;

      // Check permission
      const allowed = hasPermission(
        user.role as UserRole,
        permission.module as ModuleName,
        permission.action as PermissionAction
      );

      // DEBUG: Always log permission checks for suppliers.form-content
      if (name === 'suppliers.form-content') {
        console.log('🔒 HookPoint Permission Check:', {
          hookName: name,
          moduleId: hook.context.moduleId,
          userRole: user.role,
          requiredModule: permission.module,
          requiredAction: permission.action,
          allowed,
          allPermissionsForModule: ROLE_PERMISSIONS[user.role as UserRole]?.[permission.module as ModuleName]
        });
      }

      if (!allowed && debug) {
        logger.debug('ModuleEventBus', `Hook filtered (no permission): ${name}`, {
          moduleId: hook.context.moduleId,
          requiredPermission: permission,
          userRole: user.role
        });
      }

      return allowed;
    });

    // Execute permitted hooks
    const hookResults = permittedHooks.map(hook => hook.handler(data));

    const duration = performance.now() - startTime;

    if (debug) {
      logger.debug('ModuleEventBus', `Executed hook: ${name}`, {
        totalHooks: allHooks.length,
        permittedHooks: permittedHooks.length,
        filteredOut: allHooks.length - permittedHooks.length,
        duration: `${duration.toFixed(2)}ms`,
        data,
      });
    }

    return hookResults;
  }, [registry, name, data, user, debug, refreshKey]); // ✅ FIX: Added refreshKey

  // Handle empty results
  if (results.length === 0) {
    if (debug) {
      logger.debug('ModuleEventBus', `No hooks registered for: ${name}`);
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
