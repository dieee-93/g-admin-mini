/**
 * CAPABILITY ENGINE - Core del sistema unificado
 *
 * RESPONSABILIDAD: Transformar capabilities activas en configuración del sistema
 * ELIMINA: businessCapabilitySystem.ts, useCapabilities complex logic
 * SIMPLIFICA: Una función, una responsabilidad
 */

import type {
  CapabilityId,
  SystemConfiguration,
  BusinessCapability,
  ModuleEffect,
  ValidationRule,
  UIEffect
} from '../types/UnifiedCapabilities';
import { CAPABILITY_DEFINITIONS, getUniversalCapabilities } from '../config/CapabilityDefinitions';

// ============================================
// CAPABILITY RESOLUTION ENGINE
// ============================================

export class CapabilityEngine {
  /**
   * Resolve capabilities activas en configuración del sistema
   * CORE FUNCTION - toda la lógica está aquí
   */
  static resolve(activeCapabilities: CapabilityId[]): SystemConfiguration {
    // 1. Auto-resolver capabilities universales si hay alguna activity/infrastructure
    const resolvedCapabilities = this.autoResolveCapabilities(activeCapabilities);

    // 2. Validar dependencies y conflicts
    const validatedCapabilities = this.validateCapabilities(resolvedCapabilities);

    // 3. Generar configuración
    const configuration = this.generateConfiguration(validatedCapabilities);

    return {
      activeCapabilities: validatedCapabilities,
      ...configuration,
      autoResolvedCapabilities: resolvedCapabilities.filter(
        cap => !activeCapabilities.includes(cap)
      ),
      conflicts: this.detectConflicts(validatedCapabilities)
    };
  }

  /**
   * Auto-resolver capabilities universales
   * LÓGICA: Si tienes al menos 1 capability de negocio, activas las universales
   */
  private static autoResolveCapabilities(activeCapabilities: CapabilityId[]): CapabilityId[] {
    const hasBusinessCapabilities = activeCapabilities.some(capId => {
      const cap = CAPABILITY_DEFINITIONS[capId];
      return cap && (cap.category === 'activity' || cap.category === 'infrastructure');
    });

    if (!hasBusinessCapabilities) {
      // Sin capabilities de negocio, solo devolver las activas
      return activeCapabilities;
    }

    // Con capabilities de negocio, agregar universales
    const universalIds = getUniversalCapabilities().map(cap => cap.id);
    const allCapabilities = [...new Set([...activeCapabilities, ...universalIds])];

    return allCapabilities;
  }

  /**
   * Validar dependencies y conflicts
   * LÓGICA: Agregar dependencies, remover conflicts
   */
  private static validateCapabilities(capabilities: CapabilityId[]): CapabilityId[] {
    let validated = [...capabilities];

    // 1. Resolver dependencies (agregar capabilities requeridas)
    for (const capId of capabilities) {
      const cap = CAPABILITY_DEFINITIONS[capId];
      if (cap?.requires) {
        validated = [...new Set([...validated, ...cap.requires])];
      }
    }

    // 2. Resolver conflicts (remover capabilities conflictivas)
    validated = this.resolveConflicts(validated);

    return validated;
  }

  /**
   * Resolver conflicts usando "first wins" strategy
   */
  private static resolveConflicts(capabilities: CapabilityId[]): CapabilityId[] {
    const resolved: CapabilityId[] = [];
    const conflictMap = new Set<CapabilityId>();

    for (const capId of capabilities) {
      const cap = CAPABILITY_DEFINITIONS[capId];

      // Si esta capability está en conflictos detectados, skip
      if (conflictMap.has(capId)) continue;

      // Agregar capability
      resolved.push(capId);

      // Marcar conflicts para exclusión futura
      if (cap?.conflicts) {
        cap.conflicts.forEach(conflictId => conflictMap.add(conflictId));
      }
    }

    return resolved;
  }

  /**
   * Generar configuración del sistema
   */
  private static generateConfiguration(capabilities: CapabilityId[]) {
    const modules = new Map<string, ModuleEffect>();
    const validations: ValidationRule[] = [];
    const tutorials: string[] = [];
    const achievements: string[] = [];
    const uiEffects: UIEffect[] = [];

    // Acumular effects de todas las capabilities
    for (const capId of capabilities) {
      const cap = CAPABILITY_DEFINITIONS[capId];
      if (!cap) continue;

      // Acumular module effects
      for (const moduleEffect of cap.effects.modules) {
        const existing = modules.get(moduleEffect.moduleId);
        if (existing) {
          // Merge features (enabled/required wins over disabled)
          const mergedFeatures = { ...existing.features };
          for (const [feature, state] of Object.entries(moduleEffect.features)) {
            if (state === 'required' ||
                (state === 'enabled' && mergedFeatures[feature] !== 'required')) {
              mergedFeatures[feature] = state;
            }
          }
          modules.set(moduleEffect.moduleId, {
            ...existing,
            visible: existing.visible || moduleEffect.visible,
            features: mergedFeatures
          });
        } else {
          modules.set(moduleEffect.moduleId, moduleEffect);
        }
      }

      // Acumular other effects
      validations.push(...cap.effects.validations);
      tutorials.push(...cap.effects.tutorials);
      achievements.push(...cap.effects.achievements);
      uiEffects.push(...cap.effects.ui);
    }

    return {
      visibleModules: Array.from(modules.values())
        .filter(m => m.visible)
        .map(m => m.moduleId),
      moduleFeatures: this.buildModuleFeatures(modules),
      requiredValidations: validations,
      availableTutorials: [...new Set(tutorials)],
      activeAchievements: [...new Set(achievements)],
      uiEffects: uiEffects
    };
  }

  /**
   * Build module features map
   */
  private static buildModuleFeatures(modules: Map<string, ModuleEffect>) {
    const result: Record<string, Record<string, any>> = {};
    for (const [moduleId, moduleEffect] of modules) {
      result[moduleId] = moduleEffect.features;
    }
    return result;
  }

  /**
   * Detectar conflicts for debugging
   */
  private static detectConflicts(capabilities: CapabilityId[]): string[] {
    const conflicts: string[] = [];

    for (const capId of capabilities) {
      const cap = CAPABILITY_DEFINITIONS[capId];
      if (cap?.conflicts) {
        for (const conflictId of cap.conflicts) {
          if (capabilities.includes(conflictId)) {
            conflicts.push(`${capId} conflicts with ${conflictId}`);
          }
        }
      }
    }

    return conflicts;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check si una capability específica está activa
   */
  static hasCapability(
    configuration: SystemConfiguration | null,
    capabilityId: CapabilityId
  ): boolean {
    return configuration?.activeCapabilities.includes(capabilityId) ?? false;
  }

  /**
   * Check si un módulo es visible
   */
  static isModuleVisible(
    configuration: SystemConfiguration | null,
    moduleId: string
  ): boolean {
    return configuration?.visibleModules.includes(moduleId) ?? false;
  }

  /**
   * Get features de un módulo específico
   */
  static getModuleFeatures(
    configuration: SystemConfiguration | null,
    moduleId: string
  ) {
    return configuration?.moduleFeatures[moduleId] ?? {};
  }

  /**
   * Check si una UI feature está activa
   */
  static isUIFeatureActive(
    configuration: SystemConfiguration | null,
    target: string
  ): boolean {
    if (!configuration) return false;

    return configuration.uiEffects.some(
      effect => effect.target === target && effect.action === 'show'
    );
  }
}