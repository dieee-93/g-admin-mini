/**
 * USE MODULE NAVIGATION HOOK
 *
 * Generates navigation structure from ModuleRegistry manifests
 * Replaces hardcoded NAVIGATION_MODULES array with dynamic generation
 *
 * FEATURES:
 * - Generates navigation from manifest metadata
 * - Applies capability filtering
 * - Applies role-based security
 * - Groups by business domains
 * - Single source of truth
 *
 * @version 2.0.0 - Navigation System Refactor
 */

import React, { useMemo } from 'react';
import { ModuleRegistry } from './ModuleRegistry';
import { useCapabilityStore } from '@/store/capabilityStore';
import { useShallow } from 'zustand/react/shallow';
import { useAuth } from '@/contexts/AuthContext';
import { MODULE_FEATURE_MAP } from '@/config/FeatureRegistry';
import { logger } from '@/lib/logging';
import type { ModuleName } from '@/contexts/AuthContext';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface NavigationSubModule {
  id: string;
  title: string;
  path: string;
  icon: any;
  description?: string;
}

export interface NavigationModule {
  id: string;
  title: string;
  icon: any;
  color: string;
  path: string;
  description?: string;
  badge?: number;
  isActive?: boolean;
  isExpandable?: boolean;
  isExpanded?: boolean;
  subModules?: NavigationSubModule[];
  domain?: 'core' | 'supply-chain' | 'operations' | 'finance' | 'resources' | 'advanced' | 'debug';
}

export interface NavigationByDomain {
  core: NavigationModule[];
  'supply-chain': NavigationModule[];
  operations: NavigationModule[];
  finance: NavigationModule[];
  resources: NavigationModule[];
  advanced: NavigationModule[];
  debug: NavigationModule[];
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to generate navigation from ModuleRegistry
 *
 * Returns accessible modules filtered by:
 * 1. Role-based security (AuthContext)
 * 2. Capability-based features (CapabilityStore)
 * 3. Module registration status (ModuleRegistry)
 *
 * @returns Accessible navigation modules
 */
// Helper to compare arrays by content and preserve reference
function getUpdatedArrayIfChanged<T>(oldArray: T[], newArray: T[], compareFn?: (a: T, b: T) => boolean): T[] {
  if (oldArray.length !== newArray.length) {
    return newArray;
  }

  const isEqual = compareFn
    ? oldArray.every((val, idx) => compareFn(val, newArray[idx]))
    : oldArray.every((val, idx) => val === newArray[idx]);

  if (isEqual) {
    logger.debug('NavigationGeneration', '⚡ Array unchanged, preserving reference to prevent re-renders');
    return oldArray;
  }

  logger.debug('NavigationGeneration', '🔄 Array content changed, returning new reference');
  return newArray;
}

// Helper to deep compare NavigationModule objects
function compareNavigationModules(a: NavigationModule, b: NavigationModule): boolean {
  return a.id === b.id &&
    a.title === b.title &&
    a.path === b.path &&
    a.color === b.color &&
    a.domain === b.domain;
}

export function useModuleNavigation() {
  const { canAccessModule, isAuthenticated } = useAuth();
  // 🔧 FIX: Usar useShallow para prevenir re-renders por cambio de referencia del array
  const activeModules = useCapabilityStore(
    useShallow(state => state.features.activeModules)
  );

  // Store previous result to compare
  const prevModulesRef = React.useRef<NavigationModule[]>([]);

  const modules = useMemo(() => {
    const startTime = performance.now();

    if (!isAuthenticated) {
      logger.debug('NavigationGeneration', 'User not authenticated, returning empty modules');
      return [];
    }

    // Get ModuleRegistry instance
    const registry = ModuleRegistry.getInstance();
    const registeredModules = registry.getAll();

    logger.debug('NavigationGeneration', `Found ${registeredModules.length} registered modules`);

    // Filter and transform modules
    const accessibleModules = registeredModules
      .filter(moduleInstance => {
        const manifest = moduleInstance.manifest;

        // Only include modules with navigation metadata
        if (!manifest.metadata?.navigation) {
          logger.debug('NavigationGeneration', `Skipping ${manifest.id} - no navigation metadata`);
          return false;
        }

        // Map module ID to ModuleName for role checking
        // ============================================
        // CORE MODULES
        // ============================================
        const adminModuleNameMap: Record<string, ModuleName> = {
          // Core
          'dashboard': 'dashboard',
          'settings': 'settings',
          'customers': 'sales',
          'intelligence': 'reporting',

          // Operations
          'sales': 'sales',
          'production': 'operations',
          'production-kitchen': 'operations', // Legacy: renamed to production
          'fulfillment': 'operations',
          'fulfillment-onsite': 'operations',
          'fulfillment-pickup': 'operations',
          'fulfillment-delivery': 'operations',
          'delivery': 'operations',
          'memberships': 'operations',
          'rentals': 'operations',
          'assets': 'operations',

          // Supply Chain
          'materials': 'materials',
          'products': 'products',
          'products-analytics': 'products', // Submodule
          'suppliers': 'materials',
          'supplier-orders': 'materials',

          // Finance
          'fiscal': 'fiscal',
          'billing': 'billing',
          'finance': 'billing',
          'finance-integrations': 'billing',

          // Resources
          'staff': 'staff',
          'scheduling': 'scheduling',

          // Advanced
          'reporting': 'reporting',
          'gamification': 'gamification',
          'executive': 'executive',
          'mobile': 'operations',
          'debug': 'debug'
        };

        const moduleName = adminModuleNameMap[manifest.id];
        if (!moduleName) {
          logger.warn('NavigationGeneration', `Module ${manifest.id} not mapped to ModuleName, denying access`);
          return false;
        }

        // 🔒 LAYER 1: Role-based security filter
        const hasRoleAccess = canAccessModule(moduleName);
        if (!hasRoleAccess) {
          logger.debug('NavigationGeneration', `User lacks role access to ${manifest.id}`);
          return false;
        }

        // 🎯 LAYER 2: Capability-based filter
        const moduleConfig = MODULE_FEATURE_MAP[manifest.id];

        // Always-active modules (dashboard, settings, gamification, debug)
        if (moduleConfig?.alwaysActive) {
          logger.debug('NavigationGeneration', `${manifest.id} is always-active`);
          return true;
        }

        // ✨ NEW: Auto-install modules (always visible when role permits)
        if (manifest.autoInstall === true) {
          logger.debug('NavigationGeneration', `${manifest.id} has autoInstall=true`);
          return true;
        }

        // Check if module's required features are active
        if (moduleConfig?.requiredFeatures && moduleConfig.requiredFeatures.length > 0) {
          const hasAllRequired = moduleConfig.requiredFeatures.every(f =>
            manifest.requiredFeatures.includes(f)
          );
          if (!hasAllRequired) {
            logger.debug('NavigationGeneration', `${manifest.id} missing required features`);
            return false;
          }
        }

        // Check if module is in activeModules list
        const hasCapabilityAccess = activeModules.includes(manifest.id);
        if (!hasCapabilityAccess) {
          logger.debug('NavigationGeneration', `${manifest.id} not in activeModules`);
          return false;
        }

        return true;
      })
      .map(moduleInstance => {
        const manifest = moduleInstance.manifest;
        const nav = manifest.metadata!.navigation!;

        // Transform to NavigationModule format
        const navModule: NavigationModule = {
          id: manifest.id,
          title: manifest.name,
          icon: nav.icon,
          color: nav.color || 'gray',
          path: nav.route,
          description: manifest.metadata?.description,
          isExpandable: nav.isExpandable || false,
          isExpanded: false,
          subModules: nav.submodules || [],
          domain: nav.domain || 'core'
        };

        return navModule;
      })
      .sort((a, b) => {
        // Sort by domain first, then by title
        const domainOrder = ['core', 'supply-chain', 'operations', 'finance', 'resources', 'advanced', 'debug'];
        const aDomainIndex = domainOrder.indexOf(a.domain || 'core');
        const bDomainIndex = domainOrder.indexOf(b.domain || 'core');

        if (aDomainIndex !== bDomainIndex) {
          return aDomainIndex - bDomainIndex;
        }

        return a.title.localeCompare(b.title);
      });

    const endTime = performance.now();
    logger.performance('NavigationGeneration', 'Module navigation generation', endTime - startTime, 10);
    logger.info('NavigationGeneration', `Generated ${accessibleModules.length} accessible modules`);

    // ✅ FIX: Preserve array reference if content hasn't changed
    const finalModules = getUpdatedArrayIfChanged(
      prevModulesRef.current,
      accessibleModules,
      compareNavigationModules
    );

    // Update ref for next comparison
    prevModulesRef.current = finalModules;

    return finalModules;
  }, [canAccessModule, isAuthenticated, activeModules]);

  return modules;
}

/**
 * Hook to generate navigation grouped by business domain
 *
 * @returns Navigation modules grouped by domain
 */
export function useModuleNavigationByDomain(): NavigationByDomain {
  const modules = useModuleNavigation();

  return useMemo(() => {
    const grouped: NavigationByDomain = {
      core: [],
      'supply-chain': [],
      operations: [],
      finance: [],
      resources: [],
      advanced: [],
      debug: []
    };

    modules.forEach(module => {
      const domain = module.domain || 'core';
      if (grouped[domain]) {
        grouped[domain].push(module);
      }
    });

    return grouped;
  }, [modules]);
}
