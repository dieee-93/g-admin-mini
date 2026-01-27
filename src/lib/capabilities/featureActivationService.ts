/**
 * Feature Activation Service - SIMPLIFIED VERSION 2.0
 *
 * Servicio stateless para activación de features basado en capabilities.
 * Mapeo simple: user capabilities → active features (declarativo, no lógica compleja).
 *
 * ARCHITECTURE (validated with industry research):
 * - Salesforce: Edition → Features
 * - HubSpot: Hub → Features
 * - VS Code: Extension → Contribution Points
 * - Pattern: Simple flat map, no auto-injection, no CORE_FEATURES
 *
 * @see docs/plans/2026-01-19-capabilities-architecture-simplification.md
 * @see docs/plans/2026-01-19-architecture-validation-report.md
 * @version 2.0.0 - Simplified (968 → 30 lines)
 * @date 2026-01-19
 * @pattern Service Layer (https://martinfowler.com/eaaCatalog/serviceLayer.html)
 */

import type { BusinessCapabilityId, InfrastructureId } from '@/config/BusinessModelRegistry';
import { INFRASTRUCTURE_REGISTRY } from '@/config/BusinessModelRegistry';
import type { FeatureId } from '@/config/FeatureRegistry';
import { getFeaturesFromCapabilities } from '@/config/CapabilityFeaturesMapping';
import { getModulesForActiveFeatures } from '@/config/FeatureRegistry';
import { logger } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface FeatureActivationResult {
  activeFeatures: FeatureId[];
}

export interface ValidationError {
  field: string;
  message: string;
  redirectTo: string;
}

// ============================================
// FEATURE ACTIVATION (SIMPLIFIED)
// ============================================

/**
 * Activa features según capabilities seleccionadas
 *
 * SIMPLIFIED LOGIC:
 * - NO auto-injection de CORE_FEATURES (CORE modules no usan features system)
 * - Simple flat map: capabilities → features
 * - Deduplication automática (Set)
 *
 * @param capabilities - Capabilities del usuario
 * @param infrastructure - Infrastructure del usuario (DEPRECATED, no se usa en v2.0)
 * @returns Array de features activas (deduplicadas)
 *
 * @example
 * const { activeFeatures } = activateFeatures(
 *   ['physical_products', 'onsite_service'],
 *   []  // infrastructure deprecated
 * );
 * // Returns: ['inventory_stock_tracking', 'operations_table_management', ...]
 */
export function activateFeatures(
  capabilities: BusinessCapabilityId[],
  infrastructure: InfrastructureId[]
): FeatureActivationResult {
  try {
    logger.info('FeatureActivationService', '🚀 Activating features from capabilities', {
      capabilities: capabilities.length,
      infrastructure: infrastructure.length
    });

    // Get features from capabilities
    const capabilityFeatures = getFeaturesFromCapabilities(capabilities);

    // Get features from infrastructure
    const infrastructureFeatures = infrastructure.flatMap(
      infraId => INFRASTRUCTURE_REGISTRY[infraId]?.activatesFeatures || []
    );

    // Combine and deduplicate
    const activeFeatures = Array.from(new Set([...capabilityFeatures, ...infrastructureFeatures]));

    logger.info('FeatureActivationService', '✅ Features activated', {
      total: activeFeatures.length,
      fromCapabilities: capabilityFeatures.length,
      fromInfrastructure: infrastructureFeatures.length,
      capabilities: capabilities,
      infrastructure: infrastructure
    });

    return { activeFeatures };
  } catch (error) {
    logger.error('FeatureActivationService', '❌ Error activating features:', error);
    throw error;
  }
}

// ============================================
// FEATURE QUERIES
// ============================================

/**
 * Verifica si una feature está activa
 *
 * @param activeFeatures - Array de features activas
 * @param featureId - ID de la feature a verificar
 * @returns true si la feature está activa
 *
 * @example
 * const canUsePOS = hasFeature(activeFeatures, 'sales_pos_onsite');
 */
export function hasFeature(
  activeFeatures: FeatureId[],
  featureId: FeatureId
): boolean {
  return activeFeatures.includes(featureId);
}

/**
 * Verifica si TODAS las features están activas
 *
 * @param activeFeatures - Array de features activas
 * @param featureIds - IDs de features a verificar
 * @returns true si todas las features están activas
 *
 * @example
 * const canUseAdvancedSales = hasAllFeatures(activeFeatures, [
 *   'sales_pos_onsite',
 *   'sales_payment_processing'
 * ]);
 */
export function hasAllFeatures(
  activeFeatures: FeatureId[],
  featureIds: FeatureId[]
): boolean {
  return featureIds.every(id => activeFeatures.includes(id));
}

/**
 * Verifica si ALGUNA feature está activa
 *
 * @param activeFeatures - Array de features activas
 * @param featureIds - IDs de features a verificar
 * @returns true si al menos una feature está activa
 */
export function hasAnyFeature(
  activeFeatures: FeatureId[],
  featureIds: FeatureId[]
): boolean {
  return featureIds.some(id => activeFeatures.includes(id));
}

/**
 * Verifica si una feature está bloqueada
 *
 * @param blockedFeatures - Array de features bloqueadas
 * @param featureId - ID de la feature a verificar
 * @returns true si la feature está bloqueada
 */
export function isFeatureBlocked(
  blockedFeatures: FeatureId[],
  featureId: FeatureId
): boolean {
  return blockedFeatures.includes(featureId);
}

// ============================================
// MODULE QUERIES
// ============================================

/**
 * Obtiene módulos activos según features activas
 *
 * @param activeFeatures - Array de features activas
 * @returns Array de module IDs activos
 *
 * @example
 * const modules = getActiveModules(activeFeatures);
 * // ['sales', 'inventory', 'customers']
 */
export function getActiveModules(activeFeatures: FeatureId[]): string[] {
  return getModulesForActiveFeatures(activeFeatures);
}

/**
 * Verifica si un módulo está activo
 *
 * @param activeFeatures - Array de features activas
 * @param moduleId - ID del módulo a verificar
 * @returns true si el módulo está activo
 *
 * @example
 * const hasSales = hasModule(activeFeatures, 'sales');
 */
export function hasModule(
  activeFeatures: FeatureId[],
  moduleId: string
): boolean {
  const activeModules = getActiveModules(activeFeatures);
  return activeModules.includes(moduleId);
}

// ============================================
// CAPABILITY OPERATIONS
// ============================================

/**
 * Agrega una capability al array existente
 *
 * @param currentCapabilities - Capabilities actuales
 * @param capabilityId - Capability a agregar
 * @returns Nuevo array de capabilities
 */
export function addCapability(
  currentCapabilities: BusinessCapabilityId[],
  capabilityId: BusinessCapabilityId
): BusinessCapabilityId[] {
  if (currentCapabilities.includes(capabilityId)) {
    logger.warn('FeatureActivationService', 'Capability already exists', { capabilityId });
    return currentCapabilities;
  }

  return [...currentCapabilities, capabilityId];
}

/**
 * Remueve una capability del array existente
 *
 * @param currentCapabilities - Capabilities actuales
 * @param capabilityId - Capability a remover
 * @returns Nuevo array de capabilities
 */
export function removeCapability(
  currentCapabilities: BusinessCapabilityId[],
  capabilityId: BusinessCapabilityId
): BusinessCapabilityId[] {
  return currentCapabilities.filter(id => id !== capabilityId);
}

/**
 * Alterna una capability (toggle)
 *
 * @param currentCapabilities - Capabilities actuales
 * @param capabilityId - Capability a alternar
 * @returns Nuevo array de capabilities
 */
export function toggleCapability(
  currentCapabilities: BusinessCapabilityId[],
  capabilityId: BusinessCapabilityId
): BusinessCapabilityId[] {
  const isActive = currentCapabilities.includes(capabilityId);

  if (isActive) {
    return removeCapability(currentCapabilities, capabilityId);
  } else {
    return addCapability(currentCapabilities, capabilityId);
  }
}

// ============================================
// INFRASTRUCTURE OPERATIONS
// ============================================

/**
 * Agrega una infrastructure al array existente
 *
 * @param currentInfrastructure - Infrastructure actual
 * @param infraId - Infrastructure a agregar
 * @returns Nuevo array de infrastructure
 */
export function addInfrastructure(
  currentInfrastructure: InfrastructureId[],
  infraId: InfrastructureId
): InfrastructureId[] {
  if (currentInfrastructure.includes(infraId)) {
    logger.warn('FeatureActivationService', 'Infrastructure already exists', { infraId });
    return currentInfrastructure;
  }

  return [...currentInfrastructure, infraId];
}

/**
 * Remueve una infrastructure del array existente
 *
 * @param currentInfrastructure - Infrastructure actual
 * @param infraId - Infrastructure a remover
 * @returns Nuevo array de infrastructure
 */
export function removeInfrastructure(
  currentInfrastructure: InfrastructureId[],
  infraId: InfrastructureId
): InfrastructureId[] {
  return currentInfrastructure.filter(id => id !== infraId);
}

/**
 * Alterna una infrastructure (toggle)
 *
 * @param currentInfrastructure - Infrastructure actual
 * @param infraId - Infrastructure a alternar
 * @returns Nuevo array de infrastructure
 */
export function toggleInfrastructure(
  currentInfrastructure: InfrastructureId[],
  infraId: InfrastructureId
): InfrastructureId[] {
  const isActive = currentInfrastructure.includes(infraId);

  if (isActive) {
    return removeInfrastructure(currentInfrastructure, infraId);
  } else {
    return addInfrastructure(currentInfrastructure, infraId);
  }
}

// ============================================
// ARRAY HELPERS (Performance Optimization)
// ============================================

/**
 * Compara dos arrays y retorna el antiguo si el contenido es igual
 * (previene re-renders innecesarios)
 *
 * @param oldArray - Array antiguo
 * @param newArray - Array nuevo
 * @returns oldArray si contenido es igual, newArray si hay cambios
 *
 * @example
 * const optimized = getUpdatedArrayIfChanged(
 *   currentCapabilities,
 *   newCapabilities
 * );
 */
export function getUpdatedArrayIfChanged<T>(oldArray: T[], newArray: T[]): T[] {
  // Quick length check
  if (oldArray.length !== newArray.length) {
    return newArray;
  }

  // Deep equality check (works for primitive arrays)
  const isEqual = oldArray.every((val, idx) => val === newArray[idx]);

  if (isEqual) {
    logger.debug('FeatureActivationService', '⚡ Array unchanged, preserving reference');
    return oldArray; // PRESERVE OLD REFERENCE
  }

  logger.debug('FeatureActivationService', '🔄 Array content changed');
  return newArray;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Valida que el perfil tenga datos mínimos requeridos
 *
 * @param profile - Perfil a validar
 * @returns Errores de validación (vacío si es válido)
 */
export function validateProfile(profile: {
  businessName?: string;
  email?: string;
  selectedCapabilities?: BusinessCapabilityId[];
  selectedInfrastructure?: InfrastructureId[];
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!profile.businessName || profile.businessName.trim() === '') {
    errors.push({
      field: 'businessName',
      message: 'El nombre del negocio es requerido',
      redirectTo: '/setup/business-info'
    });
  }

  if (!profile.email || profile.email.trim() === '') {
    errors.push({
      field: 'email',
      message: 'El email es requerido',
      redirectTo: '/setup/business-info'
    });
  }

  if (!profile.selectedCapabilities || profile.selectedCapabilities.length === 0) {
    errors.push({
      field: 'capabilities',
      message: 'Debe seleccionar al menos una capability',
      redirectTo: '/setup/capabilities'
    });
  }

  if (!profile.selectedInfrastructure || profile.selectedInfrastructure.length === 0) {
    errors.push({
      field: 'infrastructure',
      message: 'Debe seleccionar al menos una infrastructure',
      redirectTo: '/setup/infrastructure'
    });
  }

  return errors;
}
