/**
 * ACHIEVEMENTS MODULE MANIFEST
 *
 * Sistema de Requirements & Achievements de 3 capas:
 * - MANDATORY: Requisitos obligatorios que bloquean operaciones
 * - SUGGESTED: Mejoras sugeridas (futuro)
 * - CUMULATIVE: Logros acumulativos de gamificación
 *
 * HOOK SYSTEM:
 * - Provee hooks para que otros módulos registren requirements
 * - Provee hooks para validar operaciones comerciales
 * - Provee hooks para obtener progreso de capabilities
 *
 * EXPORTS API:
 * - validateOperation(): Validar antes de operación comercial
 * - getProgress(): Obtener progreso de capability
 * - getRequirements(): Obtener todos los requirements
 * - isOperational(): Verificar si capability está operacional
 *
 * @version 1.0.0
 * @see docs/05-development/REQUIREMENTS_ACHIEVEMENTS_SYSTEM_DESIGN.md
 */

import React, { lazy } from 'react';
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { BusinessCapabilityId } from '@/config/types';
import type {
  Achievement,
  Requirement,
  ValidationContext,
  ValidationResult,
  CapabilityProgress,
  RegisterRequirementHandler,
  ValidateOperationHandler,
  GetProgressHandler,
  AchievementsAPI,
} from './types';

/**
 * Achievements Module Manifest
 *
 * Módulo base del sistema de validaciones y logros.
 * Se activa SIEMPRE (autoInstall: true).
 */
export const achievementsManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'achievements',
  name: 'Achievements & Requirements System',
  version: '1.0.0',

  // ============================================
  // DEPENDENCIES
  // ============================================

  /**
   * Módulo base sin dependencias
   * Se registra PRIMERO en bootstrap
   */
  depends: [],

  /**
   * Auto-install: TRUE
   * Este módulo se activa automáticamente en todos los casos
   */
  autoInstall: true,

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Sin features requeridas - siempre activo
   */
  requiredFeatures: [],

  /**
   * Sin features opcionales
   */
  optionalFeatures: [],

  // ============================================
  // PERMISSIONS & ROLES
  // ============================================

  /**
   * 🔒 PERMISSIONS: Operadores can view achievements
   */
  minimumRole: 'OPERADOR' as const,

  // ============================================
  // HOOK POINTS
  // ============================================

  hooks: {
    /**
     * Hooks PROVISTOS por este módulo
     * Otros módulos llaman a estos hooks
     */
    provide: [
      'achievements.register_requirement', // Registrar requirements
      'achievements.validate_commercial_operation', // Validar operación
      'achievements.get_progress', // Obtener progreso
      'dashboard.widgets', // Widget dashboard
    ],

    /**
     * Hooks CONSUMIDOS de otros módulos
     * Este módulo escucha estos hooks
     */
    consume: [
      'sales.capability_requirements', // Requirements de Sales
      'fulfillment.onsite.capability_requirements', // Requirements de Floor
      'ecommerce.capability_requirements', // Requirements de E-commerce
      'delivery.capability_requirements', // Requirements de Delivery
    ],
  },

  // ============================================
  // SETUP FUNCTION
  // ============================================

  /**
   * Setup: Inicializar sistema de achievements
   *
   * CRITICAL: Este setup DEBE completarse ANTES que otros módulos
   * se registren, para que puedan registrar sus requirements.
   */
  setup: async (registry) => {
    logger.info('App', '🏆 Setting up Achievements module');

    // ============================================
    // STORAGE
    // ============================================

    /**
     * Storage Map para requirements registrados
     * Map<capability, Requirement[]>
     */
    const requirementsMap = new Map<BusinessCapabilityId, Requirement[]>();

    // ============================================
    // HOOK 1: Register Requirement
    // ============================================

    /**
     * Hook para que módulos registren sus requirements
     *
     * @example
     * registry.doAction('achievements.register_requirement', {
     *   capability: 'pickup_counter',
     *   requirements: TAKEAWAY_MANDATORY
     * });
     */
    registry.addAction(
      'achievements.register_requirement',
      (data: RegisterRequirementHandler) => {
        const { capability, requirements } = data;

        // Inicializar array si no existe
        if (!requirementsMap.has(capability)) {
          requirementsMap.set(capability, []);
        }

        // Agregar requirements
        const existing = requirementsMap.get(capability)!;
        existing.push(...requirements);

        logger.debug('App', `✅ Registered ${requirements.length} requirements for ${capability}`, {
          capability,
          count: requirements.length,
          total: existing.length,
        });

        return { success: true };
      },
      'achievements',
      10
    );

    // ============================================
    // HOOK 2: Validate Commercial Operation
    // ============================================

    /**
     * Hook para validar una operación comercial
     *
     * @example
     * const result = registry.doAction('achievements.validate_commercial_operation', {
     *   capability: 'pickup_counter',
     *   action: 'takeaway:toggle_public',
     *   context: validationContext
     * });
     *
     * if (!result[0].allowed) {
     *   showSetupModal(result[0].missingRequirements);
     * }
     */
    registry.addAction(
      'achievements.validate_commercial_operation',
      (data: ValidateOperationHandler): ValidationResult => {
        const { capability, action, context } = data;

        logger.debug('App', `🔍 Validating operation: ${action} for ${capability}`);

        // Obtener requirements de esta capability
        const capabilityRequirements = requirementsMap.get(capability) || [];

        // Filtrar solo los que bloquean esta acción
        const relevantRequirements = capabilityRequirements.filter(
          (req) => req.blocksAction === action
        );

        if (relevantRequirements.length === 0) {
          logger.debug('App', `✅ No requirements for action: ${action}`);
          return { allowed: true };
        }

        // Ejecutar validators
        const incomplete = relevantRequirements.filter(
          (req) => !req.validator(context)
        );

        if (incomplete.length > 0) {
          const progressPercentage = Math.round(
            ((relevantRequirements.length - incomplete.length) /
              relevantRequirements.length) *
              100
          );

          logger.warn(
            'App',
            `❌ Operation blocked: ${action} - ${incomplete.length} requirements missing`,
            {
              missing: incomplete.map((r) => r.id),
              progress: progressPercentage,
            }
          );

          return {
            allowed: false,
            reason: `Debes completar ${incomplete.length} configuraciones antes de continuar`,
            missingRequirements: incomplete,
            progressPercentage,
          };
        }

        logger.info('App', `✅ Operation allowed: ${action} - All requirements met`);

        return {
          allowed: true,
          progressPercentage: 100,
        };
      },
      'achievements',
      10
    );

    // ============================================
    // HOOK 3: Get Progress
    // ============================================

    /**
     * Hook para obtener progreso de una capability
     *
     * @example
     * const progress = registry.doAction('achievements.get_progress', {
     *   capability: 'pickup_counter',
     *   context: validationContext
     * });
     *
     * console.log(`Progress: ${progress[0].percentage}%`);
     */
    registry.addAction(
      'achievements.get_progress',
      (data: GetProgressHandler): CapabilityProgress => {
        const { capability, context } = data;

        // Obtener requirements mandatory de esta capability
        const capabilityRequirements = requirementsMap.get(capability) || [];
        const mandatoryRequirements = capabilityRequirements.filter(
          (r) => r.tier === 'mandatory'
        );

        // Contar completados
        const completed = mandatoryRequirements.filter((req) =>
          req.validator(context)
        ).length;

        const total = mandatoryRequirements.length;
        const percentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        const missing = mandatoryRequirements.filter(
          (req) => !req.validator(context)
        );

        const progress: CapabilityProgress = {
          capability,
          total,
          completed,
          percentage,
          isOperational: percentage === 100,
          missing: missing.length > 0 ? missing : undefined,
        };

        logger.debug('App', `📊 Progress for ${capability}: ${percentage}%`, {
          completed,
          total,
          isOperational: progress.isOperational,
        });

        return progress;
      },
      'achievements',
      10
    );

    // ============================================
    // HOOK 4: Dashboard Widget
    // ============================================

    /**
     * ⚠️ TEMPORARY PLACEHOLDER (2025-01-26)
     *
     * ROOT CAUSE IDENTIFIED: useValidationContext creates 5 Zustand subscriptions
     * in the render phase, causing infinite re-render loop.
     *
     * ATTEMPTED FIXES (unsuccessful):
     * 1. integration.ts: Added 9 layers of protection (debounce, flags, diff checks)
     * 2. useValidationContext.ts: Applied Zustand best practices (atomic selectors, useMemo)
     * 3. AchievementsWidget.tsx: Added debounce + cleanup in useEffect
     *
     * REAL ISSUE: Calling useValidationContext in render creates subscriptions
     * to 5 stores (products, staff, operations, sales, app). Any update to ANY
     * of these stores triggers a re-render, which re-executes the hook, creating
     * new subscriptions → infinite loop.
     *
     * CORRECT SOLUTION (TODO):
     * - Refactor to use getState() instead of hooks
     * - Move validation context creation to module setup (one-time)
     * - Cache validation results in a separate store
     * - Only re-validate when user explicitly changes data
     *
     * CURRENT STATE: Using simplified placeholder widget
     */
    const AchievementsWidgetPlaceholder = lazy(() =>
      import('./components/AchievementsWidgetPlaceholder')
    );

    registry.addAction(
      'dashboard.widgets',
      () => {
        return (
          <React.Suspense fallback={<div>Cargando logros...</div>}>
            <AchievementsWidgetPlaceholder />
          </React.Suspense>
        );
      },
      'achievements',
      100 // Highest priority - setup guidance is critical
    );

    logger.warn('App', '⚠️ Using placeholder AchievementsWidget (full version requires refactor)');

    logger.info('App', '✅ Achievements module setup complete');
  },

  // ============================================
  // TEARDOWN FUNCTION
  // ============================================

  /**
   * Teardown: Limpiar recursos
   */
  teardown: async () => {
    logger.info('App', 'Achievements module teardown');
  },

  // ============================================
  // EXPORTS API (VS Code pattern)
  // ============================================

  /**
   * API pública del módulo
   * Otros módulos pueden acceder mediante:
   * const achievementsAPI = registry.getExports('achievements');
   */
  exports: {
    /**
     * Validar una operación comercial
     */
    validateOperation: async (
      capability: BusinessCapabilityId,
      action: string,
      context: ValidationContext
    ): Promise<ValidationResult> => {
      const registry = await import('@/lib/modules').then((m) =>
        m.ModuleRegistry.getInstance()
      );

      const results = registry.doAction('achievements.validate_commercial_operation', {
        capability,
        action,
        context,
      });

      return (
        results[0] || {
          allowed: false,
          reason: 'No validator found',
        }
      );
    },

    /**
     * Obtener progreso de una capability
     */
    getProgress: (
      capability: BusinessCapabilityId,
      context: ValidationContext
    ): CapabilityProgress => {
      const { ModuleRegistry } = require('@/lib/modules');
      const registry = ModuleRegistry.getInstance();

      const results = registry.doAction('achievements.get_progress', {
        capability,
        context,
      });

      return results[0];
    },

    /**
     * Obtener todos los requirements de una capability
     */
    getRequirements: (capability: BusinessCapabilityId): Achievement[] => {
      // TODO: Implementar cuando se necesite
      return [];
    },

    /**
     * Verificar si una capability está operacional (100% completo)
     */
    isOperational: (
      capability: BusinessCapabilityId,
      context: ValidationContext
    ): boolean => {
      const { ModuleRegistry } = require('@/lib/modules');
      const registry = ModuleRegistry.getInstance();

      const results = registry.doAction('achievements.get_progress', {
        capability,
        context,
      });

      return results[0]?.isOperational || false;
    },
  } as AchievementsAPI,

  // ============================================
  // MODULE METADATA
  // ============================================

  metadata: {
    category: 'system',
    description: 'Requirements and achievements tracking system',
    author: 'G-Admin Team',
    tags: ['achievements', 'requirements', 'gamification', 'validation'],
  },

  // ============================================
  // NAVIGATION
  // ============================================

  navigation: {
    title: 'Logros',
    icon: '🏆',
    path: '/admin/gamification/achievements',
    section: 'gamification',
    order: 10,
  },
};

/**
 * Default export
 */
export default achievementsManifest;
