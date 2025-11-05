/**
 * Feature Engine - Sistema de Resolución de Features
 *
 * Motor central que:
 * 1. Resuelve qué features activar según user choices
 * 2. Verifica blocking validations
 * 3. Genera milestones pendientes
 * 4. Desbloquea features cuando se completan requirements
 *
 * Basado en patrones de Feature Flags y Progressive Disclosure (2024)
 *
 * @version 2.0.0 - Atomic Capabilities
 * @see docs/ATOMIC_CAPABILITIES_DESIGN.md
 */

import type {
  BusinessCapabilityId,
  InfrastructureId,
  UserChoiceId,
  FeatureId
} from '@/config/types';

import {
  getActivatedFeatures,
  getBlockingRequirements as getBusinessBlockingReqs,
  checkInfrastructureConflicts
} from '@/config/BusinessModelRegistry';

import { getFeature } from '@/config/FeatureRegistry';

import { logger } from '@/lib/logging';

// Compatibility alias
type BusinessActivityId = BusinessCapabilityId;

// ============================================
// TYPES
// ============================================

export interface FeatureResolutionResult {
  /** Features que deben activarse */
  featuresToActivate: FeatureId[];
  /** Core features (siempre activas) */
  coreFeatures: FeatureId[];
  /** Conditional features (según user choices) */
  conditionalFeatures: FeatureId[];
  /** Features bloqueadas por validaciones */
  blockedFeatures: FeatureId[];
  /** Milestones que deben completarse */
  pendingMilestones: string[];
  /** Blocking validations que deben satisfacerse */
  blockingValidations: string[];
}

export interface ValidationCheckResult {
  /** Si todas las validaciones pasaron */
  valid: boolean;
  /** Features que están bloqueadas */
  blockedFeatures: FeatureId[];
  /** Validaciones que fallaron */
  failedValidations: string[];
  /** Mensajes de error */
  errorMessages: Array<{ field: string; message: string; redirectTo: string }>;
}

export interface MilestoneCompletionResult {
  /** Feature desbloqueada (si alguna) */
  unlockedFeature?: FeatureId;
  /** Si se completó el último milestone de una feature */
  featureFullyUnlocked: boolean;
  /** Milestones restantes para esa feature */
  remainingMilestones: string[];
}

// ============================================
// FEATURE RESOLUTION ENGINE
// ============================================

/**
 * Resuelve todas las features que deben activarse según user choices
 *
 * @param capabilities - Capabilities seleccionadas por el usuario
 * @param infrastructure - Infrastructure seleccionada por el usuario
 * @returns Resultado con features a activar, bloqueadas, y milestones pendientes
 */
export function resolveFeatures(
  capabilities: BusinessActivityId[],
  infrastructure: InfrastructureId[]
): FeatureResolutionResult {
  logger.info('FeatureEngine', '🔍 Resolving features for user choices:', {
    capabilities,
    infrastructure
  });

  // 1. Obtener TODAS las features activadas por capabilities + infrastructure
  // En el nuevo sistema NO hay "core" vs "conditional" - todo es activado por choices
  const allFeatures = getActivatedFeatures(capabilities, infrastructure);

  // 2. Obtener blocking requirements de BusinessModelRegistry
  // En el sistema atómico v2.0, los blocking requirements están SOLO en BusinessModelRegistry
  // (capability/infrastructure level), NO en features individuales
  const blockingValidations = getBusinessBlockingReqs(capabilities, infrastructure);

  // 3. Foundational milestones no implementados actualmente
  // Planificados para sistema de gamificación futuro - por ahora array vacío
  const pendingMilestones: string[] = [];

  logger.info('FeatureEngine', '✅ Features resolved:', {
    total: allFeatures.length,
    validations: blockingValidations.length,
    milestones: pendingMilestones.length
  });

  return {
    featuresToActivate: allFeatures,
    coreFeatures: [], // Ya no hay distinción - legacy compatibility
    conditionalFeatures: allFeatures, // Todas las features son "conditional" ahora
    blockedFeatures: [], // Se calculan con checkValidations()
    pendingMilestones,
    blockingValidations
  };
}

/**
 * Verifica qué features están bloqueadas por validations
 * @deprecated - Use new Achievements system with blocksAction instead
 */
export function checkFeatureValidations(
  features: FeatureId[],
  userProfile: any,
  systemConfig: any
): ValidationCheckResult {
  // DEPRECATED: Old blocksFeatures system removed
  // Use new Achievements system with ModuleRegistry hooks
  logger.warn('FeatureEngine', '⚠️ checkFeatureValidations is deprecated - use Achievements system');

  return {
    valid: true,
    blockedFeatures: [],
    failedValidations: [],
    errorMessages: []
  };
}

/**
 * Obtiene features activas (no bloqueadas)
 */
export function getActiveFeatures(
  allFeatures: FeatureId[],
  blockedFeatures: FeatureId[]
): FeatureId[] {
  return allFeatures.filter(f => !blockedFeatures.includes(f));
}

/**
 * Procesa la completación de un milestone
 *
 * NOTA: Foundational milestones NO están implementados actualmente.
 * Esta función existe para compatibilidad de API pero siempre retorna
 * un resultado vacío. Planificado para sistema de gamificación futuro.
 *
 * @deprecated Sistema de milestones fundacionales no implementado
 */
export function processMilestoneCompletion(
  milestoneId: string,
  allMilestonesCompleted: string[],
  pendingFeatures: FeatureId[]
): MilestoneCompletionResult {
  logger.info('FeatureEngine', '⚠️ Milestone system not implemented yet:', {
    milestoneId,
    note: 'Foundational milestones planned for future gamification system'
  });

  // Foundational milestones no implementados - retornar resultado vacío
  return {
    featureFullyUnlocked: false,
    remainingMilestones: []
  };
}

/**
 * Valida user choices antes de aplicarlas
 *
 * En el sistema atómico NO hay dependencies entre capabilities (son atómicas).
 * Solo validamos conflicts de infrastructure.
 *
 * @param capabilities - Capabilities seleccionadas
 * @param infrastructure - Infrastructure seleccionada
 */
export function validateUserChoices(
  capabilities: BusinessActivityId[],
  infrastructure: InfrastructureId[]
): {
  valid: boolean;
  errors: Array<{ type: 'dependency' | 'conflict'; message: string }>;
} {
  const errors: Array<{ type: 'dependency' | 'conflict'; message: string }> = [];

  // Las capabilities son atómicas - NO hay dependencies entre ellas
  // Se pueden combinar libremente (onsite + pickup + delivery + preparation, etc.)

  // Solo verificar conflictos de infrastructure
  infrastructure.forEach(infraId => {
    const conflictCheck = checkInfrastructureConflicts(infraId, infrastructure);

    if (!conflictCheck.valid) {
      errors.push({
        type: 'conflict',
        message: `"${infraId}" conflictúa con: ${conflictCheck.conflicts.join(', ')}`
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sistema completo de activación de features
 */
export class FeatureActivationEngine {
  /**
   * Activa features según user choices
   */
  public static activateFeatures(
    activities: BusinessActivityId[],
    infrastructure: InfrastructureId[],
    userProfile: any,
    systemConfig: any
  ): {
    activeFeatures: FeatureId[];
    blockedFeatures: FeatureId[];
    pendingMilestones: string[];
    validationErrors: Array<{ field: string; message: string; redirectTo: string }>;
  } {
    logger.info('FeatureEngine', '🚀 Activating features...');

    // 1. Validar user choices
    const choiceValidation = validateUserChoices(activities, infrastructure);
    if (!choiceValidation.valid) {
      logger.error('FeatureEngine', '❌ Invalid user choices:', choiceValidation.errors);
      throw new Error('Invalid user choices: ' + JSON.stringify(choiceValidation.errors));
    }

    // 2. Resolver features
    const resolution = resolveFeatures(activities, infrastructure);

    // 3. Verificar blocking validations
    const validation = checkFeatureValidations(
      resolution.featuresToActivate,
      userProfile,
      systemConfig
    );

    // 4. Features activas = todas - bloqueadas
    const activeFeatures = getActiveFeatures(
      resolution.featuresToActivate,
      validation.blockedFeatures
    );

    logger.info('FeatureEngine', '✅ Feature activation complete:', {
      totalFeatures: resolution.featuresToActivate.length,
      activeFeatures: activeFeatures.length,
      blockedFeatures: validation.blockedFeatures.length,
      pendingMilestones: resolution.pendingMilestones.length
    });

    return {
      activeFeatures,
      blockedFeatures: validation.blockedFeatures,
      pendingMilestones: resolution.pendingMilestones,
      validationErrors: validation.errorMessages
    };
  }

  /**
   * Desbloquea feature al completar validation
   * @deprecated - Use new Achievements system with ModuleRegistry hooks
   */
  public static unlockFeatureByValidation(
    validationId: string,
    currentlyBlocked: FeatureId[],
    userProfile: any,
    systemConfig: any
  ): {
    unlockedFeatures: FeatureId[];
    stillBlocked: FeatureId[];
  } {
    logger.warn('FeatureEngine', '⚠️ unlockFeatureByValidation is deprecated - use Achievements system');

    // DEPRECATED: Old blocksFeatures system removed
    return {
      unlockedFeatures: [],
      stillBlocked: []
    };
  }

  /**
   * Desbloquea feature al completar milestone
   */
  public static unlockFeatureByMilestone(
    milestoneId: string,
    completedMilestones: string[],
    currentlyPendingFeatures: FeatureId[]
  ): MilestoneCompletionResult {
    return processMilestoneCompletion(
      milestoneId,
      completedMilestones,
      currentlyPendingFeatures
    );
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Shorthand para activar features
 */
export function activateFeatures(
  activities: BusinessActivityId[],
  infrastructure: InfrastructureId[],
  userProfile: any,
  systemConfig: any
) {
  return FeatureActivationEngine.activateFeatures(
    activities,
    infrastructure,
    userProfile,
    systemConfig
  );
}

/**
 * Shorthand para desbloquear por validation
 */
export function unlockByValidation(
  validationId: string,
  blockedFeatures: FeatureId[],
  userProfile: any,
  systemConfig: any
) {
  return FeatureActivationEngine.unlockFeatureByValidation(
    validationId,
    blockedFeatures,
    userProfile,
    systemConfig
  );
}

/**
 * Shorthand para desbloquear por milestone
 */
export function unlockByMilestone(
  milestoneId: string,
  completedMilestones: string[],
  pendingFeatures: FeatureId[]
) {
  return FeatureActivationEngine.unlockFeatureByMilestone(
    milestoneId,
    completedMilestones,
    pendingFeatures
  );
}
