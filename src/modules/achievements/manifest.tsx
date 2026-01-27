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
import { ModuleRegistry } from '@/lib/modules';
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
 * Se activa SIEMPRE (CORE module).
 */
export const achievementsManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'achievements',
  name: 'Achievements & Requirements System',
  version: '1.0.0',

  permissionModule: 'gamification', // ✅ Uses 'gamification' permission

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
  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  /**
   * Sin features requeridas - siempre activo
   *//**
   * Sin features opcionales
   */

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
      'achievements.register_requirement', // Registrar requirements (DEPRECATED)
      'achievements.validate_commercial_operation', // Validar operación
      'achievements.get_progress', // Obtener progreso
      'achievements.get_requirements_registry', // ← NUEVO: Hook para registro dinámico
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
   * ⚠️ REFACTORED v2.0:
   * - Requirements ahora son estáticos (en requirements/)
   * - NO hay registry en store (los requirements están en archivos)
   * - Progress se computa on-demand (progressCalculator service)
   * - Store solo maneja UI state
   *
   * ✅ PERFORMANCE FIX: Deferred initialization pattern
   * - Critical hooks registered immediately (< 50ms)
   * - Heavy imports/EventBus deferred with setTimeout
   * - Target: Reduce 749ms → < 100ms blocking time
   *
   * CRITICAL: Este setup configura los hooks que BLOQUEAN operaciones
   */
  setup: async (registry) => {
    logger.info('App', '🏆 Setting up Achievements module (v2.0) - Fast path');

    // ============================================
    // PHASE 1: CRITICAL PATH (Synchronous - < 50ms)
    // ============================================
    // Register essential hooks immediately to prevent blocking operations

    // HOOK 1: Register Requirement (DEPRECATED - lightweight stub)
    registry.addAction(
      'achievements.register_requirement',
      () => {
        logger.warn(
          'App', 
          '⚠️ achievements.register_requirement is deprecated. Requirements are now static in requirements/'
        );
        return { success: true };
      },
      'achievements',
      10
    );

    // HOOK 2: Validate Commercial Operation (CRITICAL - must be available immediately)
    // Use lazy evaluation - defer heavy imports until first use
    let requirementsModule: any = null;
    
    registry.addAction(
      'achievements.validate_commercial_operation',
      (data?: ValidateOperationHandler): ValidationResult => {
        if (!data) {
          return { allowed: false, reason: 'Invalid data' };
        }

        const { capability, action, context } = data;

        logger.debug('App', `🔍 Validating operation: ${action} for ${capability}`);

        // Lazy load requirements on first use (not during setup)
        if (!requirementsModule) {
          logger.warn('App', '⚠️ Requirements not yet loaded - allowing operation');
          return { allowed: true }; // Fail-open during initialization
        }

        const { getRequirements } = requirementsModule;
        const capabilityRequirements = getRequirements(capability);

        const relevantRequirements = capabilityRequirements.filter(
          (req: Requirement) => req.blocksAction === action
        );

        if (relevantRequirements.length === 0) {
          logger.debug('App', `✅ No requirements for action: ${action}`);
          return { allowed: true };
        }

        const incomplete = relevantRequirements.filter(
          (req: Requirement) => !req.validator(context)
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
              missing: incomplete.map((r: Requirement) => r.id),
              progress: progressPercentage,
            }
          );

          return {
            allowed: false,
            reason: `Configuración incompleta (${progressPercentage}%)`,
            missingRequirements: incomplete,
            progressPercentage,
          };
        }

        logger.debug('App', `✅ All requirements met for action: ${action}`);
        return { allowed: true };
      },
      'achievements',
      10
    );

    logger.info('App', '✅ Achievements module critical hooks registered (fast path complete)');

    // ============================================
    // PHASE 2: DEFERRED INITIALIZATION (Async - non-blocking)
    // ============================================
    // Defer heavy imports and EventBus setup to not block startup
    
    setTimeout(async () => {
      logger.info('App', '⏱️ Starting deferred achievements initialization');
      const deferredStart = performance.now();

      try {
        // ============================================
        // IMPORT DEPENDENCIES (Refactored Architecture)
        // ============================================
        // IMPORT DEPENDENCIES (Deferred - non-blocking)
        // ============================================

        /**
         * REFACTORED: Requirements son estáticos, no se "registran"
         * La fuente de verdad está en requirements/index.ts
         */
        // ⚡ PERFORMANCE: Parallel imports (2 imports)
        const [
          { getRequirements: getRequirementsFn, ALL_MANDATORY_REQUIREMENTS },
          { computeProgress }
        ] = await Promise.all([
          import('./requirements'),
          import('./services/progressCalculator')
        ]);

        // ✅ Store requirements module for lazy validation
        requirementsModule = { getRequirements: getRequirementsFn, ALL_MANDATORY_REQUIREMENTS, computeProgress };

        const requirementsCount = ALL_MANDATORY_REQUIREMENTS?.length || 0;
        logger.info('App', `📋 Loaded ${requirementsCount} mandatory requirements (deferred)`);

        // ============================================
        // HOOK 3: Get Progress (Non-critical)
        // ============================================

        /**
         * Hook para obtener progreso de una capability.
         * 
         * REFACTORED v2.0:
         * - Usa computeProgress() desde services/progressCalculator.ts
         * - NO usa store
         */
        registry.addAction(
          'achievements.get_progress',
          (data?: GetProgressHandler): CapabilityProgress => {
            if (!data) {
              return {
                capability: 'pickup_orders',
                total: 0,
                completed: 0,
                percentage: 0,
                isOperational: false,
              };
            }

            const { capability, context } = data;
            const progress = computeProgress(capability, context);

            logger.debug('App', `📊 Progress for ${capability}: ${progress.percentage}%`, {
              completed: progress.completed,
              total: progress.total,
              isOperational: progress.isOperational,
            });

            return progress;
          },
          'achievements',
          10
        );

        // ============================================
        // HOOK 4: Get Requirements Registry (NEW - Dynamic)
    // ============================================

    /**
     * Hook para que módulos registren dinámicamente sus requirements.
     * 
     * Este es el hook CLAVE del nuevo sistema dinámico.
     * Cada módulo (sales, delivery, floor, etc.) registra sus requirements via este hook.
     * 
     * ARQUITECTURA:
     * - Cada módulo llama a este hook en su setup()
     * - Achievements module NO conoce de antemano qué requirements existen
     * - Component consume este hook para obtener requirements dinámicamente
     * - Deduplicación automática de shared requirements
     * 
     * @example
     * // Sales module registra sus requirements
     * registry.addAction(
     *   'achievements.get_requirements_registry',
     *   () => ({
     *     capability: 'pickup_orders',
     *     requirements: TAKEAWAY_MANDATORY,
     *     moduleId: 'sales'
     *   }),
     *   'sales'
     * );
     * 
     * // Component consume todos los requirements registrados
     * const allRegistrations = registry.doAction('achievements.get_requirements_registry');
     * const deduplicated = deduplicateRequirements(allRegistrations);
     * 
     * @version 3.0.0 - Dynamic Hook System
     */
    logger.info('App', '🎣 Achievements module ready to receive requirements from other modules');

    // NOTE: Este hook NO tiene handler en achievements module.
    // Los handlers son agregados por OTROS módulos cuando se registran.
    // Achievements module solo CONSUME los resultados de este hook.
    
    // ============================================
    // EVENTBUS INTEGRATION (Phase 2 - NEW)
    // ============================================

    /**
     * EventBus Integration para reactividad automática.
     * 
     * ARQUITECTURA:
     * - Escucha eventos de otros módulos (products, sales, staff, settings)
     * - Invalida TanStack Query cache cuando datos relevantes cambian
     * - Detecta cuando achievements se completan
     * - Emite notificaciones al usuario
     * 
     * EVENTOS ESCUCHADOS:
     * - products.created/updated/deleted → Invalida progress de capabilities
     * - sales.order_completed → Invalida progress + detecta logros acumulativos
     * - staff.member_added → Invalida progress de staff requirements
     * - settings.updated → Invalida todos los progress (config changes)
     * - payments.method_configured → Invalida progress de payment requirements
     * 
     * @version 2.0.0
     */

    logger.info('App', '🔌 Setting up EventBus integration for achievements...');

    // ⚡ PERFORMANCE: Parallel imports (3 imports)
    const [
      { eventBus, EventPriority },
      { notify },
      { PRODUCT_MILESTONES, SALES_MILESTONES }
    ] = await Promise.all([
      import('@/lib/events'),
      import('@/lib/notifications'),
      import('./types/events')
    ]);
    const getQueryClient = () => (window as any).__queryClient;

    eventBus.subscribe('products.created', async (event) => {
      const { product, totalCount, previousCount } = event.payload || {};

      logger.info('App', 'Product created - checking achievements', {
        productId: product?.id,
        productName: product?.name,
        totalCount,
        previousCount,
      });

      const queryClient = getQueryClient();
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['achievements'] });
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        logger.debug('App', 'Invalidated achievements cache');
      }

      if (!totalCount) return;

      const newMilestones = PRODUCT_MILESTONES.filter(
        m => (previousCount || 0) < m && totalCount >= m
      );

      for (const milestone of newMilestones) {
        const messages: Record<number, string> = {
          1: 'Has creado tu primer producto',
          5: 'Tu catálogo está creciendo',
          10: '¡Excelente progreso!',
          20: 'Tu variedad está aumentando',
          50: '¡Gran catálogo de productos!',
          100: '¡Centenario de productos!',
          500: '¡Eres un maestro del inventario!',
        };

        notify.success({
          title: `¡Logro desbloqueado! 🎉`,
          description: `${milestone} productos creados - ${messages[milestone]}`,
          duration: 5000,
        });

        logger.info('App', `Achievement unlocked: ${milestone} products`, {
          milestone,
          totalCount,
          previousCount,
        });
      }
    }, {
      moduleId: 'achievements',
      priority: EventPriority.NORMAL,
    });

    eventBus.subscribe('sales.order_completed', async (event) => {
      const { orderId, orderTotal, items, totalSales, previousTotalSales } = event.payload || {};

      logger.info('App', 'Sale completed - checking achievements', {
        orderId,
        orderTotal,
        itemCount: items?.length || 0,
        totalSales,
        previousTotalSales,
      });

      const queryClient = getQueryClient();
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['achievements'] });
        logger.debug('App', 'Invalidated achievements cache');
      }

      if (!totalSales) return;

      const newMilestones = SALES_MILESTONES.filter(
        m => (previousTotalSales || 0) < m && totalSales >= m
      );

      for (const milestone of newMilestones) {
        const messages: Record<number, string> = {
          1: 'Primera venta completada',
          10: 'Tu negocio está creciendo',
          50: 'Vas por buen camino',
          100: '¡Centenario de ventas!',
          500: '¡Eres una máquina de ventas!',
          1000: '¡Milestone épico alcanzado!',
        };

        notify.success({
          title: `¡${milestone} venta${milestone > 1 ? 's' : ''} completada${milestone > 1 ? 's' : ''}! 🎯`,
          description: messages[milestone],
          duration: 5000,
        });

        logger.info('App', `Achievement unlocked: ${milestone} sales`, {
          milestone,
          totalSales,
          previousTotalSales,
        });
      }
    }, {
      moduleId: 'achievements',
      priority: EventPriority.NORMAL,
    });

    eventBus.subscribe('staff.member_added', async (event) => {
      const { staffId, staffName, totalStaff, previousTotalStaff } = event.payload || {};

      logger.info('App', 'Staff member added - checking achievements', {
        staffId,
        staffName,
        totalStaff,
        previousTotalStaff,
      });

      const queryClient = getQueryClient();
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['achievements'] });
        await queryClient.invalidateQueries({ queryKey: ['staff'] });
        logger.debug('App', 'Invalidated achievements cache');
      }

      if (totalStaff === 1 && previousTotalStaff === 0) {
        notify.success({
          title: '¡Primer empleado agregado! 👥',
          description: 'Tu equipo está creciendo',
          duration: 5000,
        });

        logger.info('App', 'Achievement unlocked: First staff member');
      }
    }, {
      moduleId: 'achievements',
      priority: EventPriority.NORMAL,
    });

    eventBus.subscribe('settings.updated', async (event) => {
      const { setting } = event.payload || {};

      logger.info('App', 'Settings updated - invalidating progress', { setting });

      const queryClient = getQueryClient();
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['achievements'] });
        await queryClient.invalidateQueries({ queryKey: ['settings'] });
        logger.debug('App', 'Invalidated achievements cache');
      }
    }, {
      moduleId: 'achievements',
      priority: EventPriority.NORMAL,
    });

    eventBus.subscribe('payments.method_configured', async (event) => {
      const { method } = event.payload || {};

      logger.info('App', 'Payment method configured', { method });

      const queryClient = getQueryClient();
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['achievements'] });
        await queryClient.invalidateQueries({ queryKey: ['payments'] });
        logger.debug('App', 'Invalidated achievements cache');
      }

      notify.success({
        title: '¡Método de pago configurado! 💳',
        description: 'Ya puedes aceptar pagos',
        duration: 5000,
      });
    }, {
      moduleId: 'achievements',
      priority: EventPriority.NORMAL,
    });

    logger.info('App', '✅ EventBus integration complete - 5 listeners registered');

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
        // ============================================
        // HOOK 5: Dashboard Widget (Deferred - non-critical)
        // ============================================

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

        const deferredDuration = performance.now() - deferredStart;
        logger.info('App', `✅ Achievements deferred initialization complete in ${deferredDuration.toFixed(2)}ms`);
        logger.warn('App', '⚠️ Using placeholder AchievementsWidget (full version requires refactor)');
        
      } catch (error) {
        logger.error('App', '❌ Achievements deferred initialization failed', error);
      }
    }, 0); // Defer to next tick (non-blocking)
    
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
    category: 'core',
    description: 'Requirements and achievements tracking system',
    author: 'G-Admin Team',
    tags: ['achievements', 'requirements', 'gamification', 'validation'],
  },

  // ============================================
  // NAVIGATION (Optional - commented until needed)
  // ============================================

  // navigation: {
  //   title: 'Logros',
  //   icon: '🏆',
  //   path: '/admin/gamification/achievements',
  //   section: 'gamification',
  //   order: 10,
  // },
};

/**
 * Default export
 */
export default achievementsManifest;
