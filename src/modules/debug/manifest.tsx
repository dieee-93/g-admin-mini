/**
 * DEBUG MODULE MANIFEST
 *
 * Development and diagnostic tools for system debugging.
 * Only available in development mode or for SUPER_ADMIN users.
 *
 * PATTERN:
 * - Provides debugging tools
 * - System introspection
 * - Performance monitoring
 * - State inspection
 *
 * @version 1.0.0
 */

import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { BugAntIcon } from '@heroicons/react/24/outline';

/**
 * Debug Module Manifest
 *
 * Provides debugging and diagnostic tools:
 * - Capabilities debugger
 * - Theme inspector
 * - Store state viewer
 * - API call monitor
 * - Performance profiler
 * - Navigation debugger
 * - Component inspector
 * - Slots/hooks debugger
 * - Bundle analyzer
 */
export const debugManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'debug',
  name: 'Debug Tools',
  version: '1.0.0',

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * No dependencies - standalone tools
   */
  depends: [],

  autoInstall: true, // Always available (visibility filtered by role in navigation)

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * No required features - available in dev mode
   */
  requiredFeatures: [] as FeatureId[],

  /**
   * Optional features that enhance functionality
   */
  optionalFeatures: ['debug'] as FeatureId[],

  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  /**
   * 🔒 PERMISSIONS: Only SUPER_ADMIN can access debug tools
   */
  minimumRole: 'SUPER_ADMIN' as const,

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES
     */
    provide: [
      'debug.tools',              // Debug tool panels
      'debug.metrics',            // Debug metrics
      'debug.actions',            // Debug action buttons
    ],

    /**
     * Hooks this module CONSUMES
     */
    consume: [
      // Debug inspects other modules but doesn't consume hooks
    ],
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - register hook handlers
   */
  setup: async () => {
    // Only setup in development mode
    if (process.env.NODE_ENV !== 'development') {
      logger.info('App', '⚠️ Debug module skipped (production mode)');
      return;
    }

    logger.info('App', '🐛 Setting up Debug module');

    try {
      // Debug tools are standalone pages, no hooks to register

      logger.info('App', '✅ Debug module setup complete', {
        environment: 'development',
        toolsAvailable: 9,
      });
    } catch (error) {
      logger.error('App', '❌ Debug module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Debug module');
    // Clean up resources
  },

  // ============================================
  // PUBLIC API EXPORTS
  // ============================================

  /**
   * Public API for other modules
   */
  exports: {
    /**
     * Log debug information
     */
    log: (category: string, message: string, data?: unknown) => {
      logger.debug(category, message, data);
      return { logged: true };
    },

    /**
     * Get system diagnostics
     */
    getDiagnostics: async () => {
      logger.debug('App', 'Getting system diagnostics');
      return {
        environment: process.env.NODE_ENV,
        modules: 0,
        features: 0,
        performance: {},
      };
    },

    /**
     * Take performance snapshot
     */
    takeSnapshot: async () => {
      logger.debug('App', 'Taking performance snapshot');
      return { snapshot: {} };
    },
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'development',
    description: 'Development and diagnostic tools (dev mode only)',
    author: 'G-Admin Team',
    tags: ['debug', 'development', 'diagnostics', 'performance'],
    navigation: {
      route: '/debug',
      icon: BugAntIcon,
      color: 'red',
      domain: 'core', // Or create a 'development' domain
      isExpandable: true, // Has 9 sub-routes
    },
  },
};

/**
 * Default export
 */
export default debugManifest;

/**
 * Debug module public API types
 */
export interface DebugAPI {
  log: (category: string, message: string, data?: unknown) => { logged: boolean };
  getDiagnostics: () => Promise<{
    environment: string;
    modules: number;
    features: number;
    performance: Record<string, unknown>;
  }>;
  takeSnapshot: () => Promise<{ snapshot: Record<string, unknown> }>;
}
