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
 * @version 3.0.0 - Clean Navigation System (permissionModule-based)
 */

import React, { useMemo } from 'react';
import { ModuleRegistry } from './ModuleRegistry';
import { useFeatureFlags } from '@/lib/capabilities';
import { useAuth } from '@/contexts/AuthContext';
import { MODULE_FEATURE_MAP } from '@/config/FeatureRegistry';
import { logger } from '@/lib/logging';
import { useAppStore } from '@/store/appStore';
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
export function useModuleNavigation() {
  console.log('🚨 [useModuleNavigation] HOOK CALLED!');
  const { canAccessModule, isAuthenticated } = useAuth();

  // ✅ MIGRATED: Get active modules from feature flags
  const { activeModules } = useFeatureFlags();

  // ✅ React to modulesInitialized flag to re-compute when modules are ready
  const modulesInitialized = useAppStore(state => state.modulesInitialized);

  const modules = useMemo(() => {
    const startTime = performance.now();
    logger.debug('NavigationGeneration', `🔄 USEMEMO TRIGGERED`, {
      isAuthenticated,
      modulesInitialized,
      activeModulesCount: activeModules.length,
      timestamp: new Date().toISOString()
    });
    console.log('🔄 [NavigationGeneration] USEMEMO TRIGGERED:', { isAuthenticated, modulesInitialized, activeModulesCount: activeModules.length });

    if (!isAuthenticated) {
      logger.debug('NavigationGeneration', 'User not authenticated, returning empty modules');
      return [];
    }

    // Wait for modules to be initialized
    if (!modulesInitialized) {
      logger.debug('NavigationGeneration', 'Modules not yet initialized, returning empty array');
      return [];
    }

    // Get ModuleRegistry instance
    const registry = ModuleRegistry.getInstance();
    const registeredModules = registry.getAll();

    logger.info('NavigationGeneration', `🎯 PASSED ALL CHECKS!`, {
      isAuthenticated,
      modulesInitialized,
      registeredModulesCount: registeredModules.length,
      activeModulesCount: activeModules.length
    });
    console.log('🎯 [NavigationGeneration] PASSED ALL CHECKS!', {
      isAuthenticated,
      modulesInitialized,
      registeredModulesCount: registeredModules.length,
      activeModulesCount: activeModules.length,
      registeredModuleIds: registeredModules.map(m => m.manifest.id)
    });

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

        /**
         * ✨ NEW: Get ModuleName for permission check
         *
         * Uses manifest.permissionModule if defined, otherwise falls back to module ID.
         * Modules MUST either:
         * 1. Define permissionModule if ID != ModuleName
         * 2. Have an ID that matches a valid ModuleName
         */
        const moduleName = (manifest.permissionModule || manifest.id) as ModuleName;

        if (!moduleName) {
          logger.error('NavigationGeneration', `Module ${manifest.id} has no permissionModule and ID is not valid`);
          return false;
        }

        // 🔒 LAYER 1: Role-based security filter
        const hasRoleAccess = canAccessModule(moduleName);
        if (!hasRoleAccess) {
          logger.debug('NavigationGeneration', `User lacks role access to ${manifest.id} (permission: ${moduleName})`);
          return false;
        }

        // 🎯 LAYER 2: Capability-based filter
        // Check if module is in activeModules list (loaded by bootstrap)
        const isModuleActive = activeModules.includes(manifest.id);

        if (!isModuleActive) {
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

    console.log('🚨 [NavigationGeneration] RETURNING MODULES:', {
      count: accessibleModules.length,
      ids: accessibleModules.map(m => m.id),
      withNavigation: registeredModules.filter(m => m.manifest.metadata?.navigation).map(m => m.manifest.id),
      withoutNavigation: registeredModules.filter(m => !m.manifest.metadata?.navigation).map(m => m.manifest.id)
    });

    // Return new array - useMemo handles optimization
    return accessibleModules;
  }, [canAccessModule, isAuthenticated, activeModules, modulesInitialized]);

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
