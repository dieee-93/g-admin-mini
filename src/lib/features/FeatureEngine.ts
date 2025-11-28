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
  capabilities: BusinessCapabilityId[],
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
 * Obtiene features activas (no bloqueadas)
 */
export function getActiveFeatures(
  allFeatures: FeatureId[],
  blockedFeatures: FeatureId[]
): FeatureId[] {
  return allFeatures.filter(f => !blockedFeatures.includes(f));
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
  capabilities: BusinessCapabilityId[],
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
    capabilities: BusinessCapabilityId[],
    infrastructure: InfrastructureId[]
  ): {
    activeFeatures: FeatureId[];
  } {
    logger.info('FeatureEngine', '🚀 Activating features...');

    // 1. Validar user choices
    const choiceValidation = validateUserChoices(capabilities, infrastructure);
    if (!choiceValidation.valid) {
      logger.error('FeatureEngine', '❌ Invalid user choices:', choiceValidation.errors);
      throw new Error('Invalid user choices: ' + JSON.stringify(choiceValidation.errors));
    }

    // 2. Resolver features
    const resolution = resolveFeatures(capabilities, infrastructure);

    // 3. En el nuevo sistema simplificado, todas las features resueltas están activas.
    const activeFeatures = resolution.featuresToActivate;

    logger.info('FeatureEngine', '✅ Feature activation complete:', {
      totalFeatures: activeFeatures.length,
      activeFeatures: activeFeatures.length,
    });

    return {
      activeFeatures,
    };
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Shorthand para activar features
 */
export function activateFeatures(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
) {
  return FeatureActivationEngine.activateFeatures(
    capabilities,
    infrastructure
  );
}
