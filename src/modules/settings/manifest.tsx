/**
 * SETTINGS MODULE MANIFEST
 *
 * System-wide configuration and settings management.
 * Provides hooks for other modules to register their own settings pages.
 *
 * PATTERN:
 * - Provides settings sections hook
 * - Manages system configuration
 * - Handles integrations, diagnostics, enterprise features
 *
 * @version 1.0.0
 */

import type React from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { Cog6ToothIcon, BellAlertIcon, ListBulletIcon, ArchiveBoxIcon, UserGroupIcon, CubeIcon } from '@heroicons/react/24/outline';
import { SettingCard } from '@/shared/components';

/**
 * Settings Module Manifest
 *
 * Provides system configuration functionality:
 * - General settings
 * - Integration management
 * - Diagnostics tools
 * - Enterprise features
 * - Module-specific settings
 */
export const settingsManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'settings',
  name: 'Settings',
  version: '1.0.0',

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * No dependencies - foundation module
   */
  depends: [],

  // ✅ CORE MODULE: No activatedBy needed (always loaded)

  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  /**
   * 🔒 PERMISSIONS: Only ADMINISTRADOR can modify system settings
   */
  minimumRole: 'ADMINISTRADOR' as const,

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks this module PROVIDES
     */
    provide: [
      'settings.sections',        // Main settings sections
      'settings.tabs',            // Settings page tabs
      'settings.integrations',    // Integration configuration cards
      'settings.diagnostics',     // Diagnostic tools
    ],

    /**
     * Hooks this module CONSUMES
     */
    consume: [
      // Settings is mostly a provider - other modules register their settings here
    ],
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup function - register hook handlers
   */
  setup: async (registry) => {
    logger.info('App', '⚙️ Setting up Settings module');

    try {
      // Register Notification Settings specialized card
      registry.addAction(
        'settings.specialized.cards',
        () => (
          <SettingCard
            title="Configuración de Notificaciones"
            description="Gestiona alertas de inventario, personal, clientes, finanzas y sistema"
            icon={BellAlertIcon}
            href="/admin/settings/notifications"
            status="configured"
          />
        ),
        'settings',
        70, // Priority
        {
          requiredPermission: {
            module: 'settings',
            action: 'update',
          },
        }
      );
      logger.info('App', '✅ Settings: Notification Settings card registered');

      // Register System Enums Settings card
      registry.addAction(
        'settings.specialized.cards',
        () => (
          <SettingCard
            title="Gestión de Valores Configurables"
            description="Administra departamentos, tipos de productos, categorías y más"
            icon={ListBulletIcon}
            href="/admin/settings/enums"
            status="configured"
          />
        ),
        'settings',
        60, // Priority
        {
          requiredPermission: {
            module: 'settings',
            action: 'update',
          },
        }
      );
      logger.info('App', '✅ Settings: System Enums Settings card registered');

      // Settings provides hooks for other modules to inject their configuration panels
      // Each module can register its own settings section

      logger.info('App', '✅ Settings module setup complete', {
        hooksProvided: 4,
        cardsRegistered: 2,
      });
    } catch (error) {
      logger.error('App', '❌ Settings module setup failed', error);
      throw error;
    }
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  teardown: async () => {
    logger.info('App', '🧹 Tearing down Settings module');
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
     * Get a setting value
     */
    getSetting: async (key: string) => {
      logger.debug('App', 'Getting setting', { key });
      return { value: null as unknown };
    },

    /**
     * Set a setting value
     */
    setSetting: async (key: string, value: unknown) => {
      logger.debug('App', 'Setting value', { key, value });
      return { success: true };
    },

    /**
     * Register a settings section
     */
    registerSection: async (sectionConfig: SettingsSectionConfig) => {
      logger.debug('App', 'Registering settings section', { sectionConfig });
      return { success: true };
    },
  },

  // ============================================
  // METADATA
  // ============================================

  metadata: {
    category: 'core',
    description: 'System-wide configuration and settings management',
    author: 'G-Admin Team',
    tags: ['settings', 'configuration', 'system', 'integrations'],
    navigation: {
      route: '/admin/settings',
      icon: Cog6ToothIcon,
      color: 'gray',
      domain: 'core',
      isExpandable: true, // Has sub-pages: diagnostics, integrations, reporting, enterprise
    },
  },
};

/**
 * Default export
 */
export default settingsManifest;

/**
 * Settings section configuration
 */
export interface SettingsSectionConfig {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType;
  component: React.ComponentType;
}

/**
 * Settings module public API types
 */
export interface SettingsAPI {
  getSetting: (key: string) => Promise<{ value: unknown }>;
  setSetting: (key: string, value: unknown) => Promise<{ success: boolean }>;
  registerSection: (sectionConfig: SettingsSectionConfig) => Promise<{ success: boolean }>;
}
